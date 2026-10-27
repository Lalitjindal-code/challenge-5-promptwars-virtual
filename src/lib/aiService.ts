import { auth } from "./firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

const CATEGORY_IMAGE_MAP: Record<string, { image: string; alt: string }> = {
  "Themes & Concepts": {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9cDF5vUUXP_IBZSUhr7aPe2JI6CaZWKxuLezD9Xp9BxSvjXJ1YXCLUgpHPMmv-9cCNoUMSSVSWYViQNYg5i0d1v_aN0jFqAAYEZJLb0C4Cv2P_nNWoJyW_PLQGrpfqyWsfDmF_L_kwFlsH5l_AZODgE_bhi0uPXgLw_Se4D1hZPu6wSvNBnaUHbQN0fKffxxWrY5J1eoQCCCel9fHGawU0lehojgEYP-FDxteCnFgz1pyKcoiAdbgDg",
    alt: "Grand atmospheric event theme setting with bespoke floral accents and architectural staging"
  },
  "Decor & Ambience": {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxvPSrf5c_80oC0yfbzSOHd_dsK0zZQ1jNoBGjEqbFI2z-L-muEehazjl2QKnYu3WS1_kKajbtaP9UcVMYLuwVVXMCtKgJ1ByzY8eesO0X1buXSvbiCEYNOh0AYjR0z7w0oUGP_pZvFOe3JZBxVcXk3dK6EeRFcInmpCGHs2ZRUwg8AwsYUMC9BQf93siWj8FxqLXiDRa1sG6o6zdl1KT2ycbfFho4UW2NTmMhO45RVBBAbJ2YguIjdQ",
    alt: "Intimate and elegant ambient decor with handcrafted candles and linen textures"
  },
  "Food & Menus": {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDB7EooLrQhMy6CMTIDNv8fAekW9UH2XFm2P2kuY_Van_HbmXK4d-vMk2XLwOPM4Jhxe_Cc-tBTn_djSHbQ-6dv4IG8rfBvoMZtnvpxbdT1aJfcRADpIEw50La_8JrMwN9-ENcMBGCzEcD-j25l7LMVNrtEMSkKG0rkmx9qp7pfr5HUXEW1ClMyC18fR29jUiJbK7hvDvCnSDFl20gsfLP5K1P3hz1uN9KQ_TdwvoIEuxyxWIe6kFLn1w",
    alt: "Bespoke culinary experience station with artisanal appetizers and beverage pairings"
  },
  "Activities & Show": {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3NPKsZBnzdxz0TIPVopESyM0iEFaFKWYmCmNEoYEx8Pyf4RDKkjqLwEwwq9I5bl2oueVmK_LCtovN0F71YHmDGZE6kL9qYsnrvqGflGHGPTGfUepZVo_qgy7vs1wzql5aK2-sV2NWEEFD3jxRlur6fHKmPF1IcT7pKT9Bv4vjoSxWPGTlV16U95WLvsBCg8SZziTxkexAtFJY5ABQuSxD6zRmdyUxieF2GdnD-x2-FNqeBjpF89Z12w",
    alt: "Dynamic live performance and interactive guest entertainment experience"
  },
  "Budget Hacks": {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxvPSrf5c_80oC0yfbzSOHd_dsK0zZQ1jNoBGjEqbFI2z-L-muEehazjl2QKnYu3WS1_kKajbtaP9UcVMYLuwVVXMCtKgJ1ByzY8eesO0X1buXSvbiCEYNOh0AYjR0z7w0oUGP_pZvFOe3JZBxVcXk3dK6EeRFcInmpCGHs2ZRUwg8AwsYUMC9BQf93siWj8FxqLXiDRa1sG6o6zdl1KT2ycbfFho4UW2NTmMhO45RVBBAbJ2YguIjdQ",
    alt: "Smart high-impact budget design pairing ambient lighting with natural textures"
  }
};

/**
 * Direct Gemini Generation using client-side SDK for instant responses,
 * offline demo execution, or when server endpoint is unconfigured.
 */
async function generateClientSideGeminiConcept(
  apiKey: string,
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
  }
): Promise<AiGenerationResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"];

  const missingInfoQuestions: string[] = [];
  if (!eventContext.budget || eventContext.budget <= 0) {
    missingInfoQuestions.push("What is your target budget for this celebration?");
  }
  if (!eventContext.guestCount || eventContext.guestCount <= 0) {
    missingInfoQuestions.push("How many guests are you expecting to host?");
  }
  if (!eventContext.location || eventContext.location.trim() === "") {
    missingInfoQuestions.push("Where will this celebration take place (city or venue type)?");
  }

  const systemPrompt = `
You are the Lead Creative AI Event Director for Planora AI, an elite event planning studio.
Generate a structured, bespoke event planning concept tailored specifically to the user's provided event context.

Event Context:
- Event Name: ${eventContext.name || "Special Celebration"}
- Event Type: ${eventContext.type || "Celebration"}
- Date: ${eventContext.date || "Upcoming"}
- Location: ${eventContext.location || "Venue TBA"}
- Target Overall Budget: ₹${(eventContext.budget || 200000).toLocaleString()}
- Expected Guests: ${eventContext.guestCount || 100}
- Event Description / Vision: ${eventContext.description || "Sophisticated, memorable gathering"}
- Desired Concept Category: ${category}
- Specific User Guidance / Prompt: ${userPrompt || "Generate an innovative, cohesive luxury concept that maximizes value."}

STRICT PRIVACY RULES:
- Do NOT include any fictitious person's email, phone number, or personal private details.

OUTPUT SCHEMA REQUIREMENTS (JSON ONLY):
Return a JSON object conforming exactly to this structure:
{
  "title": "string (Catchy, evocative title, max 40 chars)",
  "code": "#AI-XXX (Unique 3 digit code, e.g. #AI-842)",
  "badge": "string (e.g. Featured Pick, Value Champion, Trendsetter)",
  "badgeType": "featured" | "value" | "standard",
  "allocation": number (estimated cost allocation in INR for this concept, reasonable within overall budget),
  "matchScore": number (between 85 and 98, representing feasibility and theme alignment),
  "description": "string (2-3 sentences explaining architectural vision, textures, styling, and atmosphere)",
  "tags": ["string", "string", "string", "string"],
  "palette": [
    { "name": "Color Name", "hex": "#RRGGBB" },
    { "name": "Color Name", "hex": "#RRGGBB" },
    { "name": "Color Name", "hex": "#RRGGBB" },
    { "name": "Color Name", "hex": "#RRGGBB" }
  ],
  "deliverables": [
    { "icon": "string (Material symbol name like candle, local_florist, chair, wb_twilight, table_restaurant)", "name": "Specific item or setup", "qty": "Quantity specification", "checked": false },
    { "icon": "string", "name": "Specific item or setup", "qty": "Quantity specification", "checked": false },
    { "icon": "string", "name": "Specific item or setup", "qty": "Quantity specification", "checked": false },
    { "icon": "string", "name": "Specific item or setup", "qty": "Quantity specification", "checked": false }
  ],
  "breakdown": [
    { "item": "Sub-category (e.g. Lighting & Staging)", "cost": number },
    { "item": "Sub-category (e.g. Florals & Backdrops)", "cost": number },
    { "item": "Sub-category (e.g. Rentals & Setup)", "cost": number }
  ],
  "timelineSuggestions": [
    "Suggested task 1 with timeline (e.g. Finalize floral mockups 6 weeks prior)",
    "Suggested task 2 with timeline",
    "Suggested task 3 with timeline"
  ],
  "vendorRecommendations": [
    "Recommended vendor category 1 and selection criteria",
    "Recommended vendor category 2 and selection criteria"
  ],
  "guestExperienceNotes": "string (1-2 sentences on how guests will interact with and experience this concept)"
}
`;

  let text = "";
  let lastError: any = null;

  for (const modelName of candidateModels) {
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
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
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

  if (!text) {
    throw lastError || new Error("Gemini AI returned an empty response.");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    }
    cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } else {
      throw new Error("Failed to parse structured JSON from Gemini AI.");
    }
  }

  const defaultImg = CATEGORY_IMAGE_MAP[category] || CATEGORY_IMAGE_MAP["Themes & Concepts"];

  const concept: ConceptItem = {
    id: `concept-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    code: typeof parsed.code === "string" && parsed.code.startsWith("#AI-")
      ? parsed.code
      : `#AI-${Math.floor(100 + Math.random() * 900)}`,
    title: typeof parsed.title === "string" && parsed.title.trim().length > 0
      ? parsed.title.slice(0, 50)
      : "Curated Event Synthesis",
    category,
    badge: parsed.badge || "Gemini Live",
    badgeType: (["featured", "value", "standard"].includes(parsed.badgeType)
      ? parsed.badgeType
      : "featured") as ConceptItem["badgeType"],
    allocation: typeof parsed.allocation === "number" && parsed.allocation > 0
      ? Math.round(parsed.allocation)
      : Math.round((eventContext.budget || 200000) * 0.25),
    matchScore: typeof parsed.matchScore === "number" && parsed.matchScore >= 70 && parsed.matchScore <= 100
      ? Math.round(parsed.matchScore)
      : 94,
    image: defaultImg.image,
    alt: defaultImg.alt,
    description: typeof parsed.description === "string" && parsed.description.trim().length > 0
      ? parsed.description
      : "Bespoke styling and sensory orchestration tailored to your event parameters.",
    tags: Array.isArray(parsed.tags) && parsed.tags.length > 0
      ? parsed.tags.slice(0, 5).map(String)
      : ["Tailored", "Harmonized", "Event Copilot"],
    palette: Array.isArray(parsed.palette) && parsed.palette.length > 0
      ? parsed.palette.map((p: any) => ({
          name: String(p.name || "Tone"),
          hex: typeof p.hex === "string" && p.hex.startsWith("#") ? p.hex : "#7c5816"
        }))
      : [
          { name: "Accent Gold", hex: "#efbf73" },
          { name: "Deep Navy", hex: "#17233b" },
          { name: "Ivory Mist", hex: "#f1f3ff" }
        ],
    deliverables: Array.isArray(parsed.deliverables) && parsed.deliverables.length > 0
      ? parsed.deliverables.map((d: any) => ({
          icon: String(d.icon || "local_florist"),
          name: String(d.name || "Decor Element"),
          qty: String(d.qty || "1 Setup"),
          checked: Boolean(d.checked)
        }))
      : [
          { icon: "candle", name: "Custom Ambience Lighting", qty: "1 Set", checked: false },
          { icon: "local_florist", name: "Bespoke Floral Installation", qty: "1 Focal Point", checked: false }
        ],
    breakdown: Array.isArray(parsed.breakdown) && parsed.breakdown.length > 0
      ? parsed.breakdown.map((b: any) => ({
          item: String(b.item || "Production & Setup"),
          cost: typeof b.cost === "number" ? Math.round(b.cost) : 10000
        }))
      : [
          { item: "Styling & Lighting", cost: 15000 },
          { item: "Florals & Staging", cost: 15000 }
        ],
    saved: false,
    timelineSuggestions: Array.isArray(parsed.timelineSuggestions)
      ? parsed.timelineSuggestions.map(String)
      : undefined,
    vendorRecommendations: Array.isArray(parsed.vendorRecommendations)
      ? parsed.vendorRecommendations.map(String)
      : undefined,
    guestExperienceNotes: typeof parsed.guestExperienceNotes === "string"
      ? parsed.guestExperienceNotes
      : undefined,
    createdAt: new Date().toISOString()
  };

  return {
    concept,
    missingInfoQuestions: missingInfoQuestions.length > 0 ? missingInfoQuestions : undefined
  };
}

/**
 * Client service to request genuine Gemini event planning generation
 * Communicates with server-side endpoint when authenticated, or calls direct Gemini
 * if in local studio / demo mode with API key configured.
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
  const clientApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Direct Live Gemini Generation for demo studio or when client key is available
  if (isDemoUser && clientApiKey) {
    try {
      return await generateClientSideGeminiConcept(clientApiKey, category, userPrompt, eventContext);
    } catch (err: any) {
      console.warn("Direct Gemini failed, using preview fallback:", err);
      // Fallback to demo baseline
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
  }

  // Pure demo user fallback if no Gemini key available
  if (isDemoUser) {
    const { DEMO_CONCEPTS } = await import("../data/demoConcepts");
    await new Promise((resolve) => setTimeout(resolve, 600));
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

  // For signed-in users, if client API key is directly configured, use direct generation with fallback
  if (clientApiKey && !import.meta.env.VITE_AI_FUNCTION_URL) {
    try {
      return await generateClientSideGeminiConcept(clientApiKey, category, userPrompt, eventContext);
    } catch (directErr: any) {
      console.warn("Direct client Gemini attempt failed, falling back to server endpoint:", directErr);
    }
  }

  if (!auth?.currentUser) {
    throw new AiServiceError(
      "You must be signed in with an active account to generate event concepts with Planora AI.",
      "UNAUTHORIZED",
      401
    );
  }

  const token = await auth.currentUser.getIdToken();
  const endpoint = import.meta.env.VITE_AI_FUNCTION_URL || "/api/ai/generate";

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
      // If server failed and client API key is present, fallback to direct client generation
      if (clientApiKey) {
        return await generateClientSideGeminiConcept(clientApiKey, category, userPrompt, eventContext);
      }
      const code = data?.error || `HTTP_${res.status}`;
      const message = data?.message || "An error occurred while generating your concept.";
      const retryAfter = res.headers.get("Retry-After") ? parseInt(res.headers.get("Retry-After")!, 10) : undefined;
      throw new AiServiceError(message, code, res.status, retryAfter);
    }

    return data as AiGenerationResponse;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (clientApiKey) {
      try {
        return await generateClientSideGeminiConcept(clientApiKey, category, userPrompt, eventContext);
      } catch {}
    }
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
 * Checks AI configuration status safely.
 */
export async function checkAiServiceStatus(): Promise<AiServiceStatus> {
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (clientKey) {
    return {
      configured: true,
      provider: "google-gemini",
      models: ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"],
    };
  }

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
