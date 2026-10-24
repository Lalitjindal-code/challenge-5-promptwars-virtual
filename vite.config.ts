import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import {
  verifyFirebaseIdToken,
  checkRateLimit,
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
            // 1. Auth check: verify Firebase ID token
            const authHeader = (req.headers["authorization"] as string) || "";
            const token = authHeader.replace(/^Bearer\s+/i, "").trim();

            if (!token) {
              res.statusCode = 401;
              res.end(JSON.stringify({
                error: "UNAUTHORIZED",
                message: "Authentication required. Please sign in to access AI features."
              }));
              return;
            }

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

            // 2. Parse request payload
            let parsedBody: any;
            try {
              parsedBody = JSON.parse(body);
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "BAD_REQUEST", message: "Malformed JSON payload in request" }));
              return;
            }

            const { eventId, category, userPrompt, eventContext } = parsedBody;

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

            // 4. Rate limit check (max 5 requests / min per uid)
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

            // 5. Authorization: Verify Event Ownership
            const projectId =
              envConfig.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
            if (projectId) {
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

            // 6. Server-side Gemini API key check
            const apiKey =
              envConfig.GEMINI_API_KEY ||
              process.env.GEMINI_API_KEY ||
              envConfig.GOOGLE_API_KEY ||
              process.env.GOOGLE_API_KEY;

            if (!apiKey) {
              res.statusCode = 503;
              res.end(JSON.stringify({
                error: "CONFIG_MISSING",
                message: "Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your server environment or configure the Firebase Cloud Function."
              }));
              return;
            }

            // 7. Generate with Gemini
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
            if (id.includes("node_modules/firebase")) {
              return "vendor-firebase";
            }
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react-router") ||
              id.includes("node_modules/react-router-dom")
            ) {
              return "vendor-react";
            }
          }
        }
      }
    }
  };
});
