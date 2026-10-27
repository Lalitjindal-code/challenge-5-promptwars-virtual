import {
  verifyFirebaseIdToken,
  checkRateLimit,
  verifyEventOwnership,
  generateEventConceptWithGemini
} from "../../server/aiHandler";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

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
    const authHeader = (req.headers["authorization"] as string) || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      res.statusCode = 503;
      res.end(JSON.stringify({
        error: "CONFIG_MISSING",
        message: "Gemini API key is not configured in Vercel environment variables."
      }));
      return;
    }

    // Read and parse payload
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

    if (!eventId || !category || !eventContext) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        error: "MISSING_FIELDS",
        message: "Missing required fields: eventId, category, and eventContext are required."
      }));
      return;
    }

    // Determine identity for rate limiting & authorization
    let uid = "demo-workspace";
    if (token && !token.startsWith("demo-")) {
      const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
      const verification = await verifyFirebaseIdToken(token, firebaseApiKey);
      if (verification.valid && verification.uid) {
        uid = verification.uid;

        // Verify Event Ownership in Firestore if project ID configured
        const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
        if (projectId && !eventId.startsWith("demo-")) {
          const isOwner = await verifyEventOwnership(projectId, uid, eventId, token);
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
    }

    const rateLimit = checkRateLimit(uid);
    if (!rateLimit.allowed) {
      res.statusCode = 429;
      res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds || 60));
      res.end(JSON.stringify({
        error: "RATE_LIMITED",
        message: `Rate limit reached. Please wait ${rateLimit.retryAfterSeconds}s before generating another concept.`
      }));
      return;
    }

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
