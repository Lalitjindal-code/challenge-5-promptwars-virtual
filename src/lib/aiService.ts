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

// In-memory cache for client-side demo session token
let cachedDemoSession: { token: string; expiresAt: number } | null = null;

async function getDemoSessionToken(): Promise<string> {
  const now = Date.now();
  if (cachedDemoSession && cachedDemoSession.expiresAt - now > 60000) {
    return cachedDemoSession.token;
  }

  const endpoint = "/api/ai/demo-session";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    throw new Error(`Failed to obtain demo session: HTTP ${res.status}`);
  }

  const data = (await res.json()) as { token: string; expiresAt: number };
  if (!data.token) {
    throw new Error("Invalid demo session response from server");
  }

  cachedDemoSession = data;
  return data.token;
}

/**
 * Client service to request genuine Gemini event planning generation.
 * All generation is securely routed through the server endpoint /api/ai/generate.
 * No Gemini API keys or credentials exist on the client.
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
  const endpoint = import.meta.env.VITE_AI_FUNCTION_URL || "/api/ai/generate";

  const sanitizedContext = {
    name: eventContext.name || "Special Event",
    type: eventContext.type || "Celebration",
    date: eventContext.date || "Upcoming",
    location: eventContext.location || "Venue TBA",
    budget: eventContext.budget || 0,
    guestCount: eventContext.guestCount || 0,
    description: eventContext.description || ""
  };

  const payload: AiGenerationRequest = {
    eventId,
    category,
    userPrompt: userPrompt?.trim() ? userPrompt.trim().slice(0, 500) : undefined,
    eventContext: sanitizedContext
  };

  // Demo user workflow: obtain signed demo session token and invoke serverless generator
  if (isDemoUser) {
    try {
      const demoToken = await getDemoSessionToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${demoToken}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = (await res.json()) as AiGenerationResponse;
        return data;
      }
    } catch (demoErr) {
      console.warn("Server demo generation fallback triggered:", demoErr);
    }

    // Graceful fallback to curated demo concepts if server is unreachable
    const { DEMO_CONCEPTS } = await import("../data/demoConcepts");
    const matching = DEMO_CONCEPTS.find((c) => c.category === category) || DEMO_CONCEPTS[0];
    return {
      concept: {
        ...matching,
        id: `demo-ai-${Date.now()}`,
        code: `#DEMO-${Math.floor(100 + Math.random() * 900)}`,
        title: userPrompt?.trim()
          ? `${matching.title} (${userPrompt.slice(0, 25)})`
          : `${matching.title} • ${eventContext.name || "Demo Studio"}`,
        badge: "Demo Studio Preview",
        badgeType: "featured",
        saved: false,
        createdAt: new Date().toISOString()
      }
    };
  }

  // Authenticated user workflow
  if (!auth?.currentUser) {
    throw new AiServiceError(
      "You must be signed in with an active account to generate event concepts with Planora AI.",
      "UNAUTHORIZED",
      401
    );
  }

  const token = await auth.currentUser.getIdToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
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
 * Checks AI configuration status securely via server endpoint.
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
      models: data.models
    };
  } catch {
    return { configured: false, provider: "offline" };
  }
}
