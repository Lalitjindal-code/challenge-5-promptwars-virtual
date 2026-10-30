import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

process.env.DEMO_SESSION_SECRET = process.env.DEMO_SESSION_SECRET || "test-demo-session-secret-key-phase6-2026";
import {
  AI_CANDIDATE_MODELS,
  CATEGORY_IMAGE_MAP,
  buildEventConceptPrompt,
  cleanAndParseJsonResponse,
  normalizeConceptItem,
  getMissingInfoQuestions
} from "../src/lib/aiShared";
import {
  createDemoSessionToken,
  verifyDemoSessionToken,
  checkDemoRateLimit,
  checkRateLimit,
  verifyFirebaseIdToken,
  verifyEventOwnership
} from "../server/aiHandler";

describe("Phase 6: Shared AI Logic & Parsing", () => {
  it("verifies candidate model list and category imagery configuration", () => {
    assert.ok(AI_CANDIDATE_MODELS.length >= 3);
    assert.ok(AI_CANDIDATE_MODELS.includes("gemini-2.5-flash-lite"));
    assert.ok(AI_CANDIDATE_MODELS.includes("gemini-2.5-flash"));

    const categories = [
      "Themes & Concepts",
      "Decor & Ambience",
      "Food & Menus",
      "Activities & Show",
      "Budget Hacks"
    ];
    for (const cat of categories) {
      assert.ok(CATEGORY_IMAGE_MAP[cat], `Category "${cat}" must have mapped imagery`);
      assert.ok(CATEGORY_IMAGE_MAP[cat].image.startsWith("https://"));
      assert.ok(CATEGORY_IMAGE_MAP[cat].alt.length > 10);
    }
  });

  it("builds comprehensive structured prompt with context and guidance", () => {
    const prompt = buildEventConceptPrompt({
      category: "Themes & Concepts",
      userPrompt: "Royal vintage palace setup",
      eventContext: {
        name: "Ananya & Kabir's Royal Sangeet",
        type: "Wedding",
        date: "2026-11-20",
        location: "Udaipur Palace",
        budget: 1500000,
        guestCount: 350,
        description: "Regal heritage evening"
      }
    });

    assert.ok(prompt.includes("Ananya & Kabir's Royal Sangeet"));
    assert.ok(prompt.includes("Udaipur Palace"));
    assert.ok(prompt.includes((1500000).toLocaleString()) || prompt.includes("15,00,000") || prompt.includes("1,500,000"));
    assert.ok(prompt.includes("Royal vintage palace setup"));
    assert.ok(prompt.includes("STRICT PRIVACY RULES"));
    assert.ok(prompt.includes("OUTPUT SCHEMA REQUIREMENTS"));
  });

  it("detects missing context parameters and produces targeted questions", () => {
    const questions1 = getMissingInfoQuestions({
      name: "Empty Event",
      type: "Celebration",
      date: "",
      location: "",
      budget: 0,
      guestCount: 0
    });
    assert.equal(questions1.length, 3);
    assert.ok(questions1.some((q) => q.toLowerCase().includes("budget")));
    assert.ok(questions1.some((q) => q.toLowerCase().includes("guests")));
    assert.ok(questions1.some((q) => q.toLowerCase().includes("place") || q.toLowerCase().includes("venue")));

    const questions2 = getMissingInfoQuestions({
      name: "Complete Event",
      type: "Birthday",
      date: "2026-12-05",
      location: "Bengaluru",
      budget: 100000,
      guestCount: 50
    });
    assert.equal(questions2.length, 0);
  });

  it("sanitizes and parses raw JSON with markdown fences and trailing commas", () => {
    const rawMarkdown = "```json\n{\n  \"title\": \"Bohemian Sunset\",\n  \"code\": \"#AI-512\",\n  \"allocation\": 75000,\n  \"matchScore\": 94,\n}\n```";
    const parsed = cleanAndParseJsonResponse(rawMarkdown);
    assert.equal(parsed.title, "Bohemian Sunset");
    assert.equal(parsed.code, "#AI-512");
    assert.equal(parsed.allocation, 75000);
    assert.equal(parsed.matchScore, 94);
  });

  it("safely normalizes malformed AI output into a complete ConceptItem", () => {
    const incompleteParsed = {
      title: "",
      code: "invalid",
      allocation: -500,
      matchScore: 120, // out of range
      deliverables: [],
      breakdown: []
    };

    const normalized = normalizeConceptItem(
      incompleteParsed,
      "Decor & Ambience",
      {
        name: "Test Gala",
        type: "Community event",
        date: "2026-11-10",
        location: "Delhi",
        budget: 400000,
        guestCount: 200
      }
    );

    assert.equal(normalized.category, "Decor & Ambience");
    assert.ok(normalized.code.startsWith("#AI-"));
    assert.equal(normalized.title, "Curated Event Synthesis");
    assert.equal(normalized.matchScore, 92); // clamped to default
    assert.equal(normalized.allocation, 100000); // 25% of 400k
    assert.ok(normalized.deliverables.length >= 2);
    assert.ok(normalized.breakdown.length >= 2);
    assert.equal(normalized.saved, false);
  });
});

describe("Phase 6: Cryptographic Demo Sessions & Rate Limiting", () => {
  it("creates a signed, short-lived demo session token with 15-minute expiration", () => {
    const session = createDemoSessionToken();
    assert.ok(session.token.startsWith("demo."));
    const parts = session.token.split(".");
    assert.equal(parts.length, 4);

    const now = Date.now();
    assert.ok(session.expiresAt > now + 14 * 60 * 1000);
    assert.ok(session.expiresAt <= now + 16 * 60 * 1000);

    const verification = verifyDemoSessionToken(session.token);
    assert.equal(verification.valid, true);
    assert.equal(verification.expiresAt, session.expiresAt);
  });

  it("rejects tampered demo session signatures", () => {
    const session = createDemoSessionToken();
    const parts = session.token.split(".");
    // Tamper with signature
    parts[3] = parts[3].split("").reverse().join("");
    const tamperedToken = parts.join(".");

    const res = verifyDemoSessionToken(tamperedToken);
    assert.equal(res.valid, false);
    assert.match(res.error || "", /signature/i);
  });

  it("rejects expired demo sessions", () => {
    const pastExp = Date.now() - 5000;
    const nonce = crypto.randomBytes(12).toString("hex");
    const payload = `demo.${pastExp}.${nonce}`;
    const secret =
      process.env.DEMO_SESSION_SECRET ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      "planora-ai-demo-secret-key-2026";
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const expiredToken = `${payload}.${sig}`;

    const res = verifyDemoSessionToken(expiredToken);
    assert.equal(res.valid, false);
    assert.match(res.error || "", /expired/i);
  });

  it("rejects malformed demo session tokens", () => {
    assert.equal(verifyDemoSessionToken("").valid, false);
    assert.equal(verifyDemoSessionToken("demo.invalid").valid, false);
    assert.equal(verifyDemoSessionToken("bearer fake-token").valid, false);
    assert.equal(verifyDemoSessionToken("demo.abc.def.ghi").valid, false);
  });

  it("enforces strict demo rate limiting (max 5 requests per 5 minutes)", () => {
    const testKey = `demo-session-test-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const check = checkDemoRateLimit(testKey);
      assert.equal(check.allowed, true, `Demo request ${i + 1} should be allowed`);
    }
    const sixth = checkDemoRateLimit(testKey);
    assert.equal(sixth.allowed, false, "6th demo request must be rate limited");
    assert.ok(sixth.retryAfterSeconds && sixth.retryAfterSeconds > 0);
  });
});

import generateHandler, { configureCorsHeaders } from "../api/ai/generate.ts";

function createMockHttp({
  method = "POST",
  headers = {},
  body = {}
}: {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  const req = {
    method,
    headers: { ...headers },
    body
  };

  let statusCode = 200;
  const responseHeaders: Record<string, string> = {};
  let rawBody = "";

  const res = {
    get statusCode() {
      return statusCode;
    },
    set statusCode(code: number) {
      statusCode = code;
    },
    setHeader(key: string, val: string) {
      responseHeaders[key.toLowerCase()] = val;
    },
    getHeader(key: string) {
      return responseHeaders[key.toLowerCase()];
    },
    end(chunk?: string) {
      if (chunk) rawBody += chunk;
    },
    json() {
      try {
        return JSON.parse(rawBody);
      } catch {
        return null;
      }
    },
    get rawBody() {
      return rawBody;
    }
  };

  return { req, res };
}

describe("Phase 6.1: Handler-Level Security & Boundary Invariants", () => {
  it("OPTIONS preflight returns HTTP 204 with intended CORS headers for allowed origins", async () => {
    const { req, res } = createMockHttp({
      method: "OPTIONS",
      headers: { origin: "http://localhost:5173" }
    });

    await generateHandler(req, res);

    assert.equal(res.statusCode, 204);
    assert.equal(res.getHeader("access-control-allow-origin"), "http://localhost:5173");
    assert.equal(res.getHeader("access-control-allow-methods"), "POST, OPTIONS");
    assert.ok(res.getHeader("access-control-allow-headers")?.includes("Authorization"));
    assert.equal(res.getHeader("vary"), "Origin");
  });

  it("OPTIONS preflight for rejected origin returns HTTP 204 WITHOUT granting Access-Control-Allow-Origin", async () => {
    const { req, res } = createMockHttp({
      method: "OPTIONS",
      headers: { origin: "https://unrelated-attacker.vercel.app" }
    });

    await generateHandler(req, res);

    assert.equal(res.statusCode, 204);
    assert.equal(
      res.getHeader("access-control-allow-origin"),
      undefined,
      "Rejected preflight must NOT return Access-Control-Allow-Origin"
    );
    assert.equal(res.getHeader("vary"), "Origin");
  });

  it("allows verified Planora production and preview domains", () => {
    // 1. Localhost allowed
    const local = createMockHttp({ headers: { origin: "http://localhost:5173" } });
    assert.equal(configureCorsHeaders(local.req, local.res), true);
    assert.equal(local.res.getHeader("access-control-allow-origin"), "http://localhost:5173");

    // 2. Canonical production domain allowed
    const prod = createMockHttp({ headers: { origin: "https://planora-ai.vercel.app" } });
    assert.equal(configureCorsHeaders(prod.req, prod.res), true);
    assert.equal(prod.res.getHeader("access-control-allow-origin"), "https://planora-ai.vercel.app");

    // 2b. Challenge 5 production domain allowed
    const challengeProd = createMockHttp({ headers: { origin: "https://challenge-5-promptwars-virtual.vercel.app" } });
    assert.equal(configureCorsHeaders(challengeProd.req, challengeProd.res), true);
    assert.equal(challengeProd.res.getHeader("access-control-allow-origin"), "https://challenge-5-promptwars-virtual.vercel.app");

    // 3. Project-specific preview branch allowed
    const preview = createMockHttp({ headers: { origin: "https://planora-ai-git-feature-security.vercel.app" } });
    assert.equal(configureCorsHeaders(preview.req, preview.res), true);
    assert.equal(preview.res.getHeader("access-control-allow-origin"), "https://planora-ai-git-feature-security.vercel.app");

    // 3b. Challenge 5 preview branch allowed
    const challengePreview = createMockHttp({ headers: { origin: "https://challenge-5-promptwars-virtual-git-main-lalit.vercel.app" } });
    assert.equal(configureCorsHeaders(challengePreview.req, challengePreview.res), true);
    assert.equal(challengePreview.res.getHeader("access-control-allow-origin"), "https://challenge-5-promptwars-virtual-git-main-lalit.vercel.app");
  });

  it("strictly rejects unrelated Vercel domains, null origins, and malicious sites without ACAO header", () => {
    // 1. Unrelated Vercel deployment rejected
    const unrelatedVercel = createMockHttp({ headers: { origin: "https://arbitrary-attacker.vercel.app" } });
    assert.equal(configureCorsHeaders(unrelatedVercel.req, unrelatedVercel.res), false);
    assert.equal(
      unrelatedVercel.res.getHeader("access-control-allow-origin"),
      undefined,
      "Unrelated Vercel domain must NOT receive ACAO header"
    );

    // 2. Origin: null rejected (never emit ACAO: null)
    const nullOrigin = createMockHttp({ headers: { origin: "null" } });
    assert.equal(configureCorsHeaders(nullOrigin.req, nullOrigin.res), false);
    assert.equal(
      nullOrigin.res.getHeader("access-control-allow-origin"),
      undefined,
      "Origin: null must NEVER receive ACAO header"
    );

    // 3. Untrusted third-party domain rejected
    const untrusted = createMockHttp({ headers: { origin: "https://malicious-adversary.com" } });
    assert.equal(configureCorsHeaders(untrusted.req, untrusted.res), false);
    assert.equal(
      untrusted.res.getHeader("access-control-allow-origin"),
      undefined,
      "Untrusted domain must NOT receive ACAO header"
    );
  });

  it("blocks forged Host and Origin combinations", () => {
    // Attacker crafts Host: evil.com and Origin: https://evil.com
    const forged = createMockHttp({
      headers: {
        host: "evil.com",
        origin: "https://evil.com"
      }
    });

    assert.equal(configureCorsHeaders(forged.req, forged.res), false);
    assert.equal(
      forged.res.getHeader("access-control-allow-origin"),
      undefined,
      "Manipulated Host + Origin must NOT bypass CORS"
    );
  });

  it("missing Origin preserves server-to-server but NEVER bypasses authentication", async () => {
    const { req, res } = createMockHttp({
      method: "POST",
      headers: {}, // No Origin header
      body: { eventId: "demo-1" }
    });

    await generateHandler(req, res);

    // Missing Origin receives ACAO: * for server-to-server, but STILL strictly requires auth
    assert.equal(res.getHeader("access-control-allow-origin"), "*");
    assert.equal(res.statusCode, 401, "Missing Origin must NEVER bypass token authentication");
    assert.equal(res.json()?.error, "UNAUTHORIZED");
  });

  it("rejects missing authorization header with HTTP 401 UNAUTHORIZED", async () => {
    const { req, res } = createMockHttp({
      method: "POST",
      headers: {},
      body: { eventId: "demo-1" }
    });

    await generateHandler(req, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.json().error, "UNAUTHORIZED");
  });

  it("rejects malformed JSON body with HTTP 400 BAD_REQUEST", async () => {
    const demoSession = createDemoSessionToken();
    const { req, res } = createMockHttp({
      method: "POST",
      headers: { authorization: `Bearer ${demoSession.token}` },
      body: "{\"eventId\": \"demo-1\", malformed"
    });

    await generateHandler(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error, "BAD_REQUEST");
  });

  it("rejects missing required fields with HTTP 400 MISSING_FIELDS", async () => {
    const demoSession = createDemoSessionToken();
    const { req, res } = createMockHttp({
      method: "POST",
      headers: { authorization: `Bearer ${demoSession.token}` },
      body: { eventId: "demo-1" } // Missing category and eventContext
    });

    await generateHandler(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error, "MISSING_FIELDS");
  });

  it("rejects user prompt exceeding 500 characters with HTTP 400 INPUT_TOO_LONG", async () => {
    const demoSession = createDemoSessionToken();
    const { req, res } = createMockHttp({
      method: "POST",
      headers: { authorization: `Bearer ${demoSession.token}` },
      body: {
        eventId: "demo-test-event",
        category: "Themes & Concepts",
        userPrompt: "a".repeat(501),
        eventContext: {
          name: "Test Celebration",
          type: "Wedding",
          date: "2026-11-20",
          location: "Jaipur",
          budget: 500000,
          guestCount: 150
        }
      }
    });

    await generateHandler(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error, "INPUT_TOO_LONG");
  });

  it("allows user prompt of exactly 500 characters without triggering INPUT_TOO_LONG", async () => {
    const demoSession = createDemoSessionToken();
    const { req, res } = createMockHttp({
      method: "POST",
      headers: { authorization: `Bearer ${demoSession.token}` },
      body: {
        eventId: "demo-test-500",
        category: "Themes & Concepts",
        userPrompt: "a".repeat(500),
        eventContext: {
          name: "Test Celebration",
          type: "Wedding",
          date: "2026-11-20",
          location: "Jaipur",
          budget: 500000,
          guestCount: 150
        }
      }
    });

    // We do not require live external API call to succeed in test mode if no GEMINI_API_KEY,
    // but the input length guard must pass and NOT return 400 INPUT_TOO_LONG
    await generateHandler(req, res);

    assert.notEqual(res.statusCode, 400, "500-character prompt must not be rejected as INPUT_TOO_LONG");
    assert.notEqual(res.json()?.error, "INPUT_TOO_LONG");
  });

  it("demo session strictly cannot generate for a non-demo event ID (HTTP 403 FORBIDDEN)", async () => {
    const demoSession = createDemoSessionToken();
    const { req, res } = createMockHttp({
      method: "POST",
      headers: { authorization: `Bearer ${demoSession.token}` },
      body: {
        eventId: "real-firestore-user-event-12345", // Non-demo event ID
        category: "Themes & Concepts",
        userPrompt: "Attempt cross-tenant access",
        eventContext: {
          name: "Infiltrate Real Event",
          type: "Wedding",
          date: "2026-11-20",
          location: "Jaipur",
          budget: 500000,
          guestCount: 150
        }
      }
    });

    await generateHandler(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.json().error, "FORBIDDEN");
    assert.match(res.json().message, /demo events/i);
  });

  it("fails closed with HTTP 500 CONFIG_MISSING when Firebase project configuration is omitted", async () => {
    const savedProjectId = process.env.VITE_FIREBASE_PROJECT_ID;
    try {
      // Simulate missing server configuration for project ID
      delete process.env.VITE_FIREBASE_PROJECT_ID;

      // When an authenticated user requests a real event, lack of projectId MUST fail closed
      const { req, res } = createMockHttp({
        method: "POST",
        headers: { authorization: "Bearer some-authenticated-token" },
        body: {
          eventId: "real-user-event-abc",
          category: "Themes & Concepts",
          eventContext: {
            name: "My Real Event",
            type: "Birthday",
            date: "2026-12-01",
            location: "Delhi",
            budget: 200000,
            guestCount: 80
          }
        }
      });

      await generateHandler(req, res);

      assert.equal(res.statusCode, 500, "Missing project ID must fail closed with HTTP 500");
      assert.equal(res.json().error, "CONFIG_MISSING");
      assert.match(res.json().message, /VITE_FIREBASE_PROJECT_ID/);
    } finally {
      if (savedProjectId !== undefined) {
        process.env.VITE_FIREBASE_PROJECT_ID = savedProjectId;
      }
    }
  });
});
