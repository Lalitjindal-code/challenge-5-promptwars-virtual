import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();

// In-memory rate limiting map for function instance
const rateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

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

export const generateEventIdeas = onRequest(
  { cors: true, maxInstances: 10, timeoutSeconds: 60 },
  async (req, res) => {
    // 1. CORS Preflight & Method check
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "Only POST requests are supported" });
      return;
    }

    try {
      // 2. Authentication: Verify Firebase ID Token
      const authHeader = req.headers.authorization || "";
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();

      if (!token) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication token is required" });
        return;
      }

      let decodedToken: admin.auth.DecodedIdToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (err: any) {
        res.status(401).json({ error: "INVALID_TOKEN", message: "Failed to verify ID token: " + err.message });
        return;
      }

      const uid = decodedToken.uid;

      // 3. Rate Limiting per UID
      const now = Date.now();
      const userTimestamps = (rateLimits.get(uid) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (userTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        const retryAfter = Math.ceil((userTimestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000);
        res.set("Retry-After", String(retryAfter));
        res.status(429).json({
          error: "RATE_LIMITED",
          message: `Too many generation requests. Please wait ${retryAfter}s before retrying.`
        });
        return;
      }
      userTimestamps.push(now);
      rateLimits.set(uid, userTimestamps);

      // 4. Validate Request Body
      const { eventId, category, userPrompt, eventContext } = req.body || {};
      if (!eventId || !category || !eventContext) {
        res.status(400).json({
          error: "MISSING_FIELDS",
          message: "Fields 'eventId', 'category', and 'eventContext' are required."
        });
        return;
      }

      if (userPrompt && typeof userPrompt === "string" && userPrompt.length > 500) {
        res.status(400).json({
          error: "INPUT_TOO_LONG",
          message: "User prompt exceeds maximum limit of 500 characters."
        });
        return;
      }

      // 5. Authorization: Verify Event Ownership in Firestore
      // Never trust user-supplied event ID without checking ownership
      const eventDoc = await admin.firestore()
        .collection("users")
        .doc(uid)
        .collection("events")
        .doc(eventId)
        .get();

      if (!eventDoc.exists) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "Unauthorized: Event does not belong to the authenticated user."
        });
        return;
      }

      // 6. Check Server-Side Gemini API Key
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        res.status(503).json({
          error: "CONFIG_MISSING",
          message: "Gemini API key is not configured in Firebase Functions environment. Set GEMINI_API_KEY secret."
        });
        return;
      }

      // 7. Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const candidateModels = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"];

      // Missing info questions
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

      const prompt = `
You are the Lead Creative AI Event Director for Planora AI.
Generate a structured, bespoke event planning concept tailored specifically to the user's provided event context.

Event Context:
- Event Name: ${eventContext.name || "Special Celebration"}
- Event Type: ${eventContext.type || "Celebration"}
- Date: ${eventContext.date || "Upcoming"}
- Location: ${eventContext.location || "Venue TBA"}
- Target Budget: ₹${(eventContext.budget || 200000).toLocaleString()}
- Expected Guests: ${eventContext.guestCount || 100}
- Event Description / Vision: ${eventContext.description || "Sophisticated, memorable gathering"}
- Desired Category: ${category}
- Specific User Prompt: ${userPrompt || "Generate an innovative, cohesive luxury concept."}

STRICT PRIVACY: Never include fictitious personal emails or phone numbers.

OUTPUT SCHEMA (JSON ONLY):
{
  "title": "string (Catchy, evocative title, max 40 chars)",
  "code": "#AI-XXX",
  "badge": "string (e.g. Featured Pick, Value Champion, Trendsetter)",
  "badgeType": "featured" | "value" | "standard",
  "allocation": number (estimated cost allocation in INR, within budget),
  "matchScore": number (85-98),
  "description": "string (2-3 sentences)",
  "tags": ["string", "string", "string", "string"],
  "palette": [{ "name": "string", "hex": "#RRGGBB" }],
  "deliverables": [{ "icon": "string", "name": "string", "qty": "string", "checked": false }],
  "breakdown": [{ "item": "string", "cost": number }],
  "timelineSuggestions": ["string", "string", "string"],
  "vendorRecommendations": ["string", "string"],
  "guestExperienceNotes": "string"
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
            contents: [{ role: "user", parts: [{ text: prompt }] }]
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
          throw new Error("Failed to parse JSON response from AI provider");
        }
      }

      const defaultImg = CATEGORY_IMAGE_MAP[category] || CATEGORY_IMAGE_MAP["Themes & Concepts"];

      const concept = {
        id: `concept-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code: typeof parsed.code === "string" ? parsed.code : `#AI-${Math.floor(100 + Math.random() * 900)}`,
        title: typeof parsed.title === "string" ? parsed.title.slice(0, 50) : "Curated Event Synthesis",
        category,
        badge: parsed.badge || "AI Synthesis",
        badgeType: parsed.badgeType || "featured",
        allocation: typeof parsed.allocation === "number" ? Math.round(parsed.allocation) : 35000,
        matchScore: typeof parsed.matchScore === "number" ? Math.round(parsed.matchScore) : 92,
        image: defaultImg.image,
        alt: defaultImg.alt,
        description: typeof parsed.description === "string" ? parsed.description : "Bespoke styling and sensory orchestration.",
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : ["Tailored", "Harmonized"],
        palette: Array.isArray(parsed.palette) ? parsed.palette : [{ name: "Accent Gold", hex: "#efbf73" }],
        deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
        breakdown: Array.isArray(parsed.breakdown) ? parsed.breakdown : [],
        saved: false,
        timelineSuggestions: parsed.timelineSuggestions,
        vendorRecommendations: parsed.vendorRecommendations,
        guestExperienceNotes: parsed.guestExperienceNotes,
        createdAt: new Date().toISOString()
      };

      res.status(200).json({
        concept,
        missingInfoQuestions: missingInfoQuestions.length > 0 ? missingInfoQuestions : undefined
      });
    } catch (err: any) {
      res.status(500).json({
        error: "GENERATION_FAILED",
        message: err.message || "An error occurred during AI generation."
      });
    }
  }
);
