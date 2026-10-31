import {
  verifyFirebaseIdToken,
  checkRateLimit,
  checkDemoRateLimit,
  verifyDemoSessionToken,
  verifyEventOwnership,
  generateEventConceptWithGemini
} from "../../server/aiHandler.js";
import {
  configureCorsHeaders,
  isTrustedHostname,
  STATIC_TRUSTED_HOSTS,
  TRUSTED_PREVIEW_PATTERNS
} from "../../server/cors.js";
import type { ApiRequest, ApiResponse } from "../../server/types.js";
import type { ConceptItem } from "../../src/types/index.js";

// Re-export CORS helpers for backwards compatibility
export {
  configureCorsHeaders,
  isTrustedHostname,
  STATIC_TRUSTED_HOSTS,
  TRUSTED_PREVIEW_PATTERNS
};

interface GenerateRequestBody {
  eventId?: string;
  category?: string;
  userPrompt?: string;
  eventContext?: {
    name?: string;
    type?: string;
    date?: string;
    location?: string;
    budget?: number;
    guestCount?: number;
    description?: string;
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
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
    const rawAuth = req.headers["authorization"];
    const authHeader = typeof rawAuth === "string" ? rawAuth : Array.isArray(rawAuth) ? rawAuth[0] : "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      res.statusCode = 401;
      res.end(JSON.stringify({
        error: "UNAUTHORIZED",
        message: "Authentication required. Please sign in or use a valid demo session."
      }));
      return;
    }

    // 2. Read and parse payload safely
    let parsedBody: GenerateRequestBody | null = null;
    if (typeof req.body === "string") {
      try {
        parsedBody = JSON.parse(req.body) as GenerateRequestBody;
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "BAD_REQUEST", message: "Malformed JSON payload" }));
        return;
      }
    } else if (typeof req.body === "object" && req.body !== null) {
      parsedBody = req.body as GenerateRequestBody;
    }

    const { eventId, category, userPrompt, eventContext } = parsedBody || {};

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
      {
        eventId,
        category: category as ConceptItem["category"], // category validated downstream by generator
        userPrompt,
        eventContext: {
          name: eventContext.name || "Event",
          type: eventContext.type || "Celebration",
          date: eventContext.date || "2026-12-01",
          location: eventContext.location || "Venue",
          budget: Number(eventContext.budget) || 200000,
          guestCount: Number(eventContext.guestCount) || 100,
          description: eventContext.description
        }
      },
      apiKey
    );

    res.statusCode = 200;
    res.end(JSON.stringify(aiResponse));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred during AI generation.";
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: "GENERATION_FAILED",
      message
    }));
  }
}
