import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import {
  verifyFirebaseIdToken,
  checkRateLimit,
  checkDemoRateLimit,
  createDemoSessionToken,
  verifyDemoSessionToken,
  verifyEventOwnership,
  generateEventConceptWithGemini
} from "./server/aiHandler";

function aiApiPlugin(envConfig: Record<string, string>): Plugin {
  return {
    name: "ai-api-middleware",
    configureServer(server) {
      // Safe configuration status endpoint (never exposes keys or partial secrets)
      server.middlewares.use("/api/ai/status", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        const apiKey =
          envConfig.GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY ||
          envConfig.GOOGLE_API_KEY ||
          process.env.GOOGLE_API_KEY;

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            configured: Boolean(apiKey),
            provider: "google-gemini",
            models: ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"]
          })
        );
      });

      // Secure demo session issuance endpoint
      server.middlewares.use("/api/ai/demo-session", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        const clientIp =
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          req.socket?.remoteAddress ||
          "local-client";

        const rateCheck = checkDemoRateLimit(`ip:${clientIp}`);
        if (!rateCheck.allowed) {
          res.statusCode = 429;
          res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds || 60));
          res.end(
            JSON.stringify({
              error: "RATE_LIMITED",
              message: "Too many demo session requests. Please wait a moment."
            })
          );
          return;
        }

        const session = createDemoSessionToken();
        res.statusCode = 200;
        res.end(JSON.stringify(session));
      });

      // Generation endpoint
      server.middlewares.use("/api/ai/generate", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "METHOD_NOT_ALLOWED", message: "Only POST is allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk: any) => {
          body += chunk;
        });

        req.on("end", async () => {
          res.setHeader("Content-Type", "application/json");
          try {
            // 1. Auth check: verify authorization token
            const authHeader = (req.headers["authorization"] as string) || "";
            const token = authHeader.replace(/^Bearer\s+/i, "").trim();

            if (!token) {
              res.statusCode = 401;
              res.end(JSON.stringify({
                error: "UNAUTHORIZED",
                message: "Authentication required. Please sign in or use a valid demo session."
              }));
              return;
            }

            // 2. Parse request payload
            let parsedBody: any;
            try {
              parsedBody = JSON.parse(body);
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "BAD_REQUEST", message: "Malformed JSON payload in request" }));
              return;
            }

            const { eventId, category, userPrompt, eventContext } = parsedBody || {};

            if (!eventId || !category || !eventContext) {
              res.statusCode = 400;
              res.end(JSON.stringify({
                error: "MISSING_FIELDS",
                message: "Missing required fields: eventId, category, and eventContext are required."
              }));
              return;
            }

            // 3. User input length protection (max 500 chars)
            if (userPrompt && typeof userPrompt === "string" && userPrompt.length > 500) {
              res.statusCode = 400;
              res.end(JSON.stringify({
                error: "INPUT_TOO_LONG",
                message: "User prompt exceeds maximum allowed limit of 500 characters."
              }));
              return;
            }

            // 4. Session validation and rate-limiting
            if (token.startsWith("demo.")) {
              const demoVerif = verifyDemoSessionToken(token);
              if (!demoVerif.valid) {
                res.statusCode = 401;
                res.end(JSON.stringify({
                  error: "INVALID_DEMO_SESSION",
                  message: demoVerif.error || "Demo session is invalid or expired."
                }));
                return;
              }

              if (!eventId.startsWith("demo-")) {
                res.statusCode = 403;
                res.end(JSON.stringify({
                  error: "FORBIDDEN",
                  message: "Demo session can only generate concepts for demo events."
                }));
                return;
              }

              const demoRate = checkDemoRateLimit(token);
              if (!demoRate.allowed) {
                res.statusCode = 429;
                res.setHeader("Retry-After", String(demoRate.retryAfterSeconds || 60));
                res.end(JSON.stringify({
                  error: "RATE_LIMITED",
                  message: `Demo rate limit reached. Please wait ${demoRate.retryAfterSeconds}s before generating another concept.`
                }));
                return;
              }
            } else {
              const verification = await verifyFirebaseIdToken(
                token,
                envConfig.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY
              );
              if (!verification.valid || !verification.uid) {
                res.statusCode = 401;
                res.end(JSON.stringify({
                  error: "INVALID_TOKEN",
                  message: verification.error || "Invalid authentication session. Please sign in again."
                }));
                return;
              }

              const rateLimit = checkRateLimit(verification.uid);
              if (!rateLimit.allowed) {
                res.statusCode = 429;
                res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds || 60));
                res.end(JSON.stringify({
                  error: "RATE_LIMITED",
                  message: `Rate limit reached. Please wait ${rateLimit.retryAfterSeconds}s before generating another concept.`
                }));
                return;
              }

              const projectId =
                envConfig.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
              if (!eventId.startsWith("demo-")) {
                if (!projectId) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({
                    error: "CONFIG_MISSING",
                    message: "Firebase project configuration (VITE_FIREBASE_PROJECT_ID) is missing on the server. Cannot verify event ownership."
                  }));
                  return;
                }

                const isOwner = await verifyEventOwnership(projectId, verification.uid, eventId, token);
                if (!isOwner) {
                  res.statusCode = 403;
                  res.end(JSON.stringify({
                    error: "FORBIDDEN",
                    message: "Unauthorized: Event does not belong to the authenticated user."
                  }));
                  return;
                }
              }
            }

            // 5. Server-side Gemini API key check
            const apiKey =
              envConfig.GEMINI_API_KEY ||
              process.env.GEMINI_API_KEY ||
              envConfig.GOOGLE_API_KEY ||
              process.env.GOOGLE_API_KEY;

            if (!apiKey) {
              res.statusCode = 503;
              res.end(JSON.stringify({
                error: "CONFIG_MISSING",
                message: "Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your server environment."
              }));
              return;
            }

            // 6. Generate with Gemini
            const aiResponse = await generateEventConceptWithGemini(
              { eventId, category, userPrompt, eventContext },
              apiKey
            );

            res.statusCode = 200;
            res.end(JSON.stringify(aiResponse));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({
              error: "GENERATION_FAILED",
              message: err.message || "Failed to generate concept with AI provider."
            }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), aiApiPlugin(env)],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase")) {
              if (id.includes("firestore") || id.includes("webchannel-wrapper")) {
                return "vendor-firestore";
              }
              if (id.includes("auth")) {
                return "vendor-firebase-auth";
              }
              return "vendor-firebase-core";
            }
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react-router") ||
              id.includes("node_modules/react-router-dom")
            ) {
              return "vendor-react";
            }
            if (id.includes("node_modules/gsap")) {
              return "vendor-gsap";
            }
            if (id.includes("node_modules/lenis")) {
              return "vendor-lenis";
            }
            if (id.includes("node_modules/framer-motion") || id.includes("node_modules/motion")) {
              return "vendor-motion";
            }
          }
        }
      }
    }
  };
});
