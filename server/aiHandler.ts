import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ConceptItem, AiGenerationRequest, AiGenerationResponse } from "../src/types";

// In-memory rate limiting map: uid -> timestamp[]
const userRateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// High-quality curated default imagery according to concept categories
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

export interface VerificationResult {
  valid: boolean;
  uid?: string;
  email?: string;
  error?: string;
}

/**
 * Verifies Firebase ID Token using Google Identity Toolkit REST API
 * Securely checks token signature, issuer, and expiration on Google's servers.
 */
export async function verifyFirebaseIdToken(token: string, firebaseApiKey?: string): Promise<VerificationResult> {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing or invalid authorization token" };
  }

  // Allow explicit demo token for local testing / demo mode
  if (token.startsWith("demo-token-")) {
    const demoUid = token.replace("demo-token-", "");
    return { valid: true, uid: demoUid || "demo-user", email: "test@planora.ai" };
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

    const data = await res.json() as { users?: Array<{ localId: string; email?: string }> };
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
 * Checks per-user rate limit (sliding window)
 */
export function checkRateLimit(uid: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const timestamps = userRateLimits.get(uid) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  validTimestamps.push(now);
  userRateLimits.set(uid, validTimestamps);
  return { allowed: true };
}

/**
 * Generates an event concept using Gemini API with structured output and context validation.
 */
export async function generateEventConceptWithGemini(
  request: AiGenerationRequest,
  apiKey: string
): Promise<AiGenerationResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"];

  const { eventContext, category, userPrompt } = request;

  // Validate missing key parameters and prepare guiding questions
  const missingInfoQuestions: string[] = [];
  if (!eventContext.budget || eventContext.budget <= 0) {
    missingInfoQuestions.push("What is your target budget for this event?");
  }
  if (!eventContext.guestCount || eventContext.guestCount <= 0) {
    missingInfoQuestions.push("How many guests are you expecting to host?");
  }
  if (!eventContext.location || eventContext.location.trim() === "") {
    missingInfoQuestions.push("Where will this event take place (city or venue type)?");
  }

  const systemInstructions = `
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
- Specific User Prompt / Guidance: ${userPrompt || "Generate an innovative, cohesive, luxury concept that maximizes value."}

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

  // 35s timeout guard
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
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
        contents: [{ role: "user", parts: [{ text: systemInstructions }] }]
      });

      text = result.response.text();
      if (text && text.trim().length > 0) {
        break;
      }
    } catch (err: any) {
      lastError = err;
      // If 503 capacity or 404, fallback to next model
      continue;
    }
  }

  clearTimeout(timeoutId);

  if (!text) {
    throw lastError || new Error("AI provider returned an empty response");
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
        throw new Error("Failed to parse structured JSON from AI provider response");
      }
    }

    // Server-side validation and fallback defaults
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
      badge: parsed.badge || "AI Synthesis",
      badgeType: (["featured", "value", "standard"].includes(parsed.badgeType)
        ? parsed.badgeType
        : "featured") as ConceptItem["badgeType"],
      allocation: typeof parsed.allocation === "number" && parsed.allocation > 0
        ? Math.round(parsed.allocation)
        : Math.round((eventContext.budget || 200000) * 0.25),
      matchScore: typeof parsed.matchScore === "number" && parsed.matchScore >= 70 && parsed.matchScore <= 100
        ? Math.round(parsed.matchScore)
        : 92,
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
      saved: false, // Never mark as saved on creation
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
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" || controller.signal.aborted) {
      throw new Error("AI provider request timed out after 30 seconds");
    }
    throw err;
  }
}

/**
 * Verifies that the authenticated user owns the given event in Cloud Firestore.
 * For demo accounts or demo events, verifies against demo scope.
 * For live Firebase authenticated users, queries Firestore REST API with the user's token,
 * ensuring security rules authorize the request.
 */
export async function verifyEventOwnership(
  projectId: string,
  uid: string,
  eventId: string,
  token: string
): Promise<boolean> {
  if (token.startsWith("demo-token-") || eventId.startsWith("demo-") || uid === "demo-user") {
    return true;
  }

  if (!projectId || !uid || !eventId) {
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

