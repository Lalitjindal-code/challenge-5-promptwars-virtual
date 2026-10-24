import { auth } from "./firebase";
import type { ConceptItem, AiGenerationRequest, AiGenerationResponse } from "../types";

export class AiServiceError extends Error {
  code: string;
  statusCode?: number;
  retryAfterSeconds?: number;

  constructor(message: string, code: string, statusCode?: number, retryAfterSeconds?: number) {
    super(message);
    this.name = "AiServiceError";
    this.code = code;
    this.statusCode = statusCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Client service to request genuine Gemini event planning generation
 * Communicates with server-side endpoint, passing Firebase Auth ID Token.
 * Sensitive guest contact information is never transmitted.
 */
export async function generateEventIdea(
  eventId: string,
  category: ConceptItem["category"],
  userPrompt: string | undefined,
  eventContext: {
    name: string;
    type: string;
    date: string;
    location: string;
    budget: number;
    guestCount: number;
    description?: string;
  },
  isDemoUser = false
): Promise<AiGenerationResponse> {
  let token = "";

  if (auth?.currentUser) {
    token = await auth.currentUser.getIdToken();
  } else if (isDemoUser) {
    token = "demo-token-demo-user";
  }

  if (!token) {
    throw new AiServiceError(
      "You must be signed in to generate event concepts with Planora AI.",
      "UNAUTHORIZED",
      401
    );
  }

  // Determine endpoint URL: custom Cloud Function URL or local dev endpoint
  const endpoint = import.meta.env.VITE_AI_FUNCTION_URL || "/api/ai/generate";

  // Sanitize context: only high-level event parameters, no private contacts
  const sanitizedContext = {
    name: eventContext.name || "Special Event",
    type: eventContext.type || "Celebration",
    date: eventContext.date || "Upcoming",
    location: eventContext.location || "Venue TBA",
    budget: eventContext.budget || 0,
    guestCount: eventContext.guestCount || 0,
    description: eventContext.description || "",
  };

  const payload: AiGenerationRequest = {
    eventId,
    category,
    userPrompt: userPrompt?.trim() ? userPrompt.trim().slice(0, 500) : undefined,
    eventContext: sanitizedContext,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const code = data?.error || `HTTP_${res.status}`;
      const message = data?.message || "An error occurred while generating your concept.";
      const retryAfter = res.headers.get("Retry-After") ? parseInt(res.headers.get("Retry-After")!, 10) : undefined;
      throw new AiServiceError(message, code, res.status, retryAfter);
    }

    return data as AiGenerationResponse;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof AiServiceError) {
      throw err;
    }
    if (err.name === "AbortError") {
      throw new AiServiceError(
        "AI request timed out after 35 seconds. Please try again.",
        "TIMEOUT",
        408
      );
    }
    throw new AiServiceError(
      err.message || "Failed to reach AI generation service.",
      "NETWORK_ERROR"
    );
  }
}

export interface AiServiceStatus {
  configured: boolean;
  provider: string;
  models?: string[];
}

/**
 * Checks server-side AI configuration safely without exposing any secret or token.
 */
export async function checkAiServiceStatus(): Promise<AiServiceStatus> {
  const statusEndpoint = import.meta.env.VITE_AI_FUNCTION_URL
    ? `${import.meta.env.VITE_AI_FUNCTION_URL}/status`
    : "/api/ai/status";

  try {
    const res = await fetch(statusEndpoint);
    if (!res.ok) return { configured: false, provider: "unreachable" };
    const data = await res.json();
    return {
      configured: Boolean(data.configured),
      provider: data.provider || "google-gemini",
      models: data.models,
    };
  } catch {
    return { configured: false, provider: "offline" };
  }
}

