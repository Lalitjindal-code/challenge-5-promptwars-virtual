import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AiGenerationRequest, AiGenerationResponse } from "../src/types";
import {
  AI_CANDIDATE_MODELS,
  getMissingInfoQuestions,
  buildEventConceptPrompt,
  cleanAndParseJsonResponse,
  normalizeConceptItem
} from "../src/lib/aiShared";

// In-memory sliding-window rate limiting maps: uid / sessionKey -> timestamp[]
const userRateLimits = new Map<string, number[]>();
const demoRateLimits = new Map<string, number[]>();

const USER_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const USER_MAX_REQUESTS = 5;

const DEMO_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DEMO_MAX_REQUESTS = 5;

// Secret used for HMAC demo session signing (falls back safely if not set)
function getDemoSecret(): string {
  return (
    process.env.DEMO_SESSION_SECRET ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "planora-ai-demo-secret-key-2026"
  );
}

export interface VerificationResult {
  valid: boolean;
  uid?: string;
  email?: string;
  error?: string;
}

export interface DemoSessionVerificationResult {
  valid: boolean;
  expiresAt?: number;
  error?: string;
}

/**
 * Creates a cryptographically signed, short-lived demo session token.
 * Valid for 15 minutes.
 */
export function createDemoSessionToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const nonce = crypto.randomBytes(12).toString("hex");
  const payload = `demo.${expiresAt}.${nonce}`;
  const signature = crypto
    .createHmac("sha256", getDemoSecret())
    .update(payload)
    .digest("hex");
  return {
    token: `${payload}.${signature}`,
    expiresAt
  };
}

/**
 * Verifies a signed demo session token.
 * Validates HMAC signature and verifies expiration time.
 */
export function verifyDemoSessionToken(token: string): DemoSessionVerificationResult {
  if (!token || typeof token !== "string" || !token.startsWith("demo.")) {
    return { valid: false, error: "Invalid demo session token format" };
  }

  const parts = token.split(".");
  if (parts.length !== 4) {
    return { valid: false, error: "Malformed demo token structure" };
  }

  const [prefix, expStr, nonce, receivedSig] = parts;
  if (prefix !== "demo") {
    return { valid: false, error: "Invalid demo prefix" };
  }

  const expiresAt = parseInt(expStr, 10);
  if (isNaN(expiresAt)) {
    return { valid: false, error: "Invalid expiration in demo token" };
  }

  if (Date.now() > expiresAt) {
    return { valid: false, error: "Demo session expired. Please refresh session." };
  }

  const payload = `demo.${expStr}.${nonce}`;
  const expectedSig = crypto
    .createHmac("sha256", getDemoSecret())
    .update(payload)
    .digest("hex");

  try {
    const receivedBuf = Buffer.from(receivedSig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (receivedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(receivedBuf, expectedBuf)) {
      return { valid: false, error: "Demo token signature verification failed" };
    }
  } catch {
    return { valid: false, error: "Invalid demo token signature format" };
  }

  return { valid: true, expiresAt };
}

/**
 * Verifies Firebase ID Token using Google Identity Toolkit REST API.
 * Securely checks token signature, issuer, and expiration on Google's servers.
 */
export async function verifyFirebaseIdToken(token: string, firebaseApiKey?: string): Promise<VerificationResult> {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing or invalid authorization token" };
  }

  const apiKey = firebaseApiKey || process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    return { valid: false, error: "Firebase API key not configured on server" };
  }

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        valid: false,
        error: (errData as any)?.error?.message || `Token validation failed (HTTP ${res.status})`
      };
    }

    const data = (await res.json()) as { users?: Array<{ localId: string; email?: string }> };
    const user = data.users?.[0];
    if (!user || !user.localId) {
      return { valid: false, error: "User not found for provided ID token" };
    }

    return { valid: true, uid: user.localId, email: user.email };
  } catch (err: any) {
    return { valid: false, error: err.message || "Network error verifying ID token" };
  }
}

/**
 * Checks per-user rate limit (sliding window for authenticated users)
 */
export function checkRateLimit(uid: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const timestamps = userRateLimits.get(uid) || [];
  const validTimestamps = timestamps.filter((t) => now - t < USER_RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= USER_MAX_REQUESTS) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + USER_RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  validTimestamps.push(now);
  userRateLimits.set(uid, validTimestamps);
  return { allowed: true };
}

/**
 * Checks demo session rate limit (sliding window for unauthenticated demo sessions)
 */
export function checkDemoRateLimit(sessionKey: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const timestamps = demoRateLimits.get(sessionKey) || [];
  const validTimestamps = timestamps.filter((t) => now - t < DEMO_RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= DEMO_MAX_REQUESTS) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + DEMO_RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  validTimestamps.push(now);
  demoRateLimits.set(sessionKey, validTimestamps);
  return { allowed: true };
}

/**
 * Verifies that the authenticated user owns the given event in Cloud Firestore.
 * For live Firebase authenticated users, queries Firestore REST API with the user's token.
 */
export async function verifyEventOwnership(
  projectId: string,
  uid: string,
  eventId: string,
  token: string
): Promise<boolean> {
  if (!projectId || !uid || !eventId || !token) {
    return false;
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}/events/${eventId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return res.status === 200;
  } catch {
    return false;
  }
}

/**
 * Generates an event concept using Gemini API with candidate model fallback
 * and structured output normalization from pure shared logic.
 */
export async function generateEventConceptWithGemini(
  request: AiGenerationRequest,
  apiKey: string
): Promise<AiGenerationResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const { eventContext, category, userPrompt } = request;

  const missingInfoQuestions = getMissingInfoQuestions(eventContext);
  const systemInstructions = buildEventConceptPrompt({ eventContext, category, userPrompt });

  // 35s timeout guard
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    let text = "";
    let lastError: any = null;

    for (const modelName of AI_CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            responseMimeType: "application/json"
          }
        });

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: systemInstructions }] }]
        });

        text = result.response.text();
        if (text && text.trim().length > 0) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }

    clearTimeout(timeoutId);

    if (!text) {
      throw lastError || new Error("AI provider returned an empty response");
    }

    const parsed = cleanAndParseJsonResponse(text);
    const concept = normalizeConceptItem(parsed, category, eventContext);

    return {
      concept,
      missingInfoQuestions: missingInfoQuestions.length > 0 ? missingInfoQuestions : undefined
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" || controller.signal?.aborted) {
      throw new Error("AI provider request timed out after 30 seconds");
    }
    throw err;
  }
}
