import {
  verifyFirebaseIdToken,
  checkRateLimit,
  checkDemoRateLimit,
  verifyDemoSessionToken,
  verifyEventOwnership,
  generateEventConceptWithGemini
} from "../../server/aiHandler.js";

/**
 * Static trusted production hostnames for Planora AI.
 * Includes both the canonical project name and the GitHub-derived deployment name.
 */
const STATIC_TRUSTED_HOSTS = [
  "planora-ai.vercel.app",
  "challenge-5-promptwars-virtual.vercel.app"
];

/**
 * Trusted Vercel preview deployment patterns for Planora AI.
 * Matches project-specific preview branches (e.g. planora-ai-git-main-owner.vercel.app)
 * for both the canonical and GitHub-derived project names.
 */
const TRUSTED_PREVIEW_PATTERNS = [
  /^planora-ai(-[a-z0-9-]+)?\.vercel\.app$/i,
  /^challenge-5-promptwars-virtual(-[a-z0-9-]+)?\.vercel\.app$/i
];

function isTrustedHostname(hostname: string): boolean {
  if (!hostname || typeof hostname !== "string") return false;
  const normalized = hostname.toLowerCase().trim();

  // 1. Local development loopbacks
  if (normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1") {
    return true;
  }

  // 2. Canonical Planora production domains and verified project preview branches
  if (STATIC_TRUSTED_HOSTS.includes(normalized)) {
    return true;
  }
  if (TRUSTED_PREVIEW_PATTERNS.some(pattern => pattern.test(normalized))) {
    return true;
  }

  // 3. Vercel deployment URL if set in environment
  if (process.env.VERCEL_URL) {
    const vercelHost = process.env.VERCEL_URL.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
    if (normalized === vercelHost) {
      return true;
    }
  }

  // 4. Custom domain configured in environment
  if (process.env.ALLOWED_ORIGIN && process.env.ALLOWED_ORIGIN !== "*") {
    try {
      const allowedUrl = new URL(process.env.ALLOWED_ORIGIN);
      if (normalized === allowedUrl.hostname.toLowerCase()) {
        return true;
      }
    } catch {
      // ignore invalid URL in config
    }
  }

  return false;
}

/**
 * Configures dynamic, strictly validated CORS headers.
 * - Allows local loopback and verified Planora production/preview domains.
 * - Strictly rejects unrelated *.vercel.app deployments.
 * - Opaque/null and untrusted origins receive NO Access-Control-Allow-Origin header.
 * - Validates Host header against trusted domains to block Host-header manipulation.
 * - Missing Origin preserves server-to-server/same-origin with ACAO: * while
 *   enforcing complete server-side token authentication.
 */
export function configureCorsHeaders(req: any, res: any, allowedMethods = "POST, OPTIONS"): boolean {
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", allowedMethods);

  const origin = req.headers["origin"] as string | undefined;
  const host = req.headers["host"] as string | undefined;

  // 1. Missing Origin: Same-origin direct or server-to-server invocation
  if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return true;
  }

  // 2. Reject explicit string "null" or empty origins without emitting ACAO
  if (origin === "null" || origin.trim() === "") {
    return false;
  }

  try {
    const parsedOrigin = new URL(origin);

    // Protocol must be http (only for localhost loopback) or https
    const isLocal =
      parsedOrigin.hostname === "localhost" ||
      parsedOrigin.hostname === "127.0.0.1" ||
      parsedOrigin.hostname === "::1";

    if (parsedOrigin.protocol !== "https:" && (!isLocal || parsedOrigin.protocol !== "http:")) {
      return false;
    }

    // A) Explicit wildcard override in env
    if (process.env.ALLOWED_ORIGIN === "*") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      return true;
    }

    // B) Verify origin hostname is a trusted Planora or local hostname
    const originIsTrusted = isTrustedHostname(parsedOrigin.hostname);

    // C) Validated Host Match: Host header must also be in trusted set
    let hostIsTrustedAndMatches = false;
    if (host) {
      const hostWithoutPort = host.split(":")[0];
      if (isTrustedHostname(hostWithoutPort)) {
        hostIsTrustedAndMatches =
          origin === `https://${host}` || (isLocal && origin === `http://${host}`);
      }
    }

    // D) Explicit ALLOWED_ORIGIN match
    const isExplicitAllowed = Boolean(
      process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN
    );

    if (originIsTrusted || hostIsTrustedAndMatches || isExplicitAllowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      return true;
    }

    // Untrusted or unrelated Vercel domain: Omit Access-Control-Allow-Origin
    return false;
  } catch {
    // Malformed origin: Omit Access-Control-Allow-Origin
    return false;
  }
}

export default async function handler(req: any, res: any) {
  configureCorsHeaders(req, res, "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "METHOD_NOT_ALLOWED", message: "Only POST is allowed" }));
    return;
  }

  res.setHeader("Content-Type", "application/json");

  try {
    // 1. Verify Authorization Header Presence
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

    // 2. Read and parse payload
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "BAD_REQUEST", message: "Malformed JSON payload" }));
        return;
      }
    }
    const { eventId, category, userPrompt, eventContext } = body || {};

    // 3. Required Fields Validation
    if (!eventId || !category || !eventContext) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        error: "MISSING_FIELDS",
        message: "Missing required fields: eventId, category, and eventContext are required."
      }));
      return;
    }

    // 4. User Prompt Length Boundary Guard (max 500 characters)
    if (userPrompt && typeof userPrompt === "string" && userPrompt.length > 500) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        error: "INPUT_TOO_LONG",
        message: "User prompt exceeds maximum limit of 500 characters."
      }));
      return;
    }

    // 5. Authentication & Authorization based on session type
    if (token.startsWith("demo.")) {
      // 5a. Verify signed short-lived demo token
      const demoVerification = verifyDemoSessionToken(token);
      if (!demoVerification.valid) {
        res.statusCode = 401;
        res.end(JSON.stringify({
          error: "INVALID_DEMO_SESSION",
          message: demoVerification.error || "Demo session is invalid or expired."
        }));
        return;
      }

      // 5b. Demo events must be strictly scoped to demo workspace / demo events
      if (!eventId.startsWith("demo-")) {
        res.statusCode = 403;
        res.end(JSON.stringify({
          error: "FORBIDDEN",
          message: "Demo session can only generate concepts for demo events."
        }));
        return;
      }

      // 5c. Rate limit demo session strictly (max 5 requests per 5 min)
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
      // 5d. Authenticated Firebase User flow: fail-closed configuration check
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
      if (!eventId.startsWith("demo-") && !projectId) {
        res.statusCode = 500;
        res.end(JSON.stringify({
          error: "CONFIG_MISSING",
          message: "Firebase project configuration (VITE_FIREBASE_PROJECT_ID) is missing on the server. Cannot verify event ownership."
        }));
        return;
      }

      const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
      const verification = await verifyFirebaseIdToken(token, firebaseApiKey);
      if (!verification.valid || !verification.uid) {
        res.statusCode = 401;
        res.end(JSON.stringify({
          error: "INVALID_TOKEN",
          message: verification.error || "Invalid authentication token. Please sign in again."
        }));
        return;
      }

      const uid = verification.uid;

      // 5e. Rate limit authenticated user (max 5 requests per minute)
      const userRate = checkRateLimit(uid);
      if (!userRate.allowed) {
        res.statusCode = 429;
        res.setHeader("Retry-After", String(userRate.retryAfterSeconds || 60));
        res.end(JSON.stringify({
          error: "RATE_LIMITED",
          message: `Rate limit reached. Please wait ${userRate.retryAfterSeconds}s before generating another concept.`
        }));
        return;
      }

      // 5f. Verify Event Ownership in Firestore: Fail-closed verification
      if (!eventId.startsWith("demo-")) {
        const isOwner = await verifyEventOwnership(projectId!, uid, eventId, token);
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

    // 6. Server-Side Secret Key Check
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      res.statusCode = 503;
      res.end(JSON.stringify({
        error: "CONFIG_MISSING",
        message: "Gemini API key is not configured in server environment secrets."
      }));
      return;
    }

    // 7. Generation
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
      message: err.message || "An unexpected error occurred during AI generation."
    }));
  }
}
