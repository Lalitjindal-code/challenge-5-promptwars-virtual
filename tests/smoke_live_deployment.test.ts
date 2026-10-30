import { describe, it } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = (process.env.DEPLOYMENT_URL || "https://challenge-5-promptwars-virtual.vercel.app").replace(/\/$/, "");

describe("Live Deployment Smoke Tests", { timeout: 15000 }, () => {
  it("GET / returns 200 OK and serves Planora landing page HTML", async () => {
    const res = await fetch(`${BASE_URL}/`, {
      headers: { "User-Agent": "Planora-Smoke-Test/1.0" }
    });
    assert.equal(res.status, 200, `Expected 200 OK from root landing page, got ${res.status}`);
    const text = await res.text();
    assert.ok(text.includes("<!doctype html>") || text.includes("<html"), "Must serve valid HTML");
    assert.ok(text.includes("Planora") || text.includes("vite"), "Must contain Planora app reference");
  });

  it("GET /api/ai/status returns HTTP 200 with ok status and strict security headers", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/status`, {
      headers: {
        "Origin": BASE_URL,
        "User-Agent": "Planora-Smoke-Test/1.0"
      }
    });

    // If serverless is deployed and working, it returns 200 OK
    assert.equal(res.status, 200, `Expected 200 OK from /api/ai/status, got ${res.status}`);
    const data = await res.json() as any;
    assert.equal(data.status, "ok");
    assert.equal(data.service, "planora-ai-gateway");
    assert.equal(res.headers.get("access-control-allow-origin"), BASE_URL);
    assert.equal(res.headers.get("vary"), "Origin");
  });

  it("OPTIONS /api/ai/generate responds with HTTP 204 preflight for authorized origin", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/generate`, {
      method: "OPTIONS",
      headers: {
        "Origin": BASE_URL,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization, content-type"
      }
    });

    assert.equal(res.status, 204, `Preflight should return 204 No Content, got ${res.status}`);
    assert.equal(res.headers.get("access-control-allow-origin"), BASE_URL);
    assert.equal(res.headers.get("vary"), "Origin");
    assert.ok(res.headers.get("access-control-allow-methods")?.includes("POST"));
  });

  it("OPTIONS /api/ai/generate strictly withholds ACAO for unauthorized origin", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/generate`, {
      method: "OPTIONS",
      headers: {
        "Origin": "https://malicious-third-party.com",
        "Access-Control-Request-Method": "POST"
      }
    });

    assert.equal(res.status, 204);
    assert.equal(
      res.headers.get("access-control-allow-origin"),
      null,
      "Unauthorized origin must NOT receive Access-Control-Allow-Origin header"
    );
  });

  it("POST /api/ai/demo-session issues signed demo token when secret is configured", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/demo-session`, {
      method: "POST",
      headers: {
        "Origin": BASE_URL,
        "Content-Type": "application/json"
      }
    });

    // In production with GEMINI_API_KEY / DEMO_SESSION_SECRET set, it returns 200 with token
    if (res.status === 200) {
      const body = await res.json() as any;
      assert.ok(body.token && typeof body.token === "string", "Must return token string");
      assert.ok(body.token.startsWith("demo."), "Demo token must start with demo.");
      assert.ok(typeof body.expiresAt === "number", "Must return expiration timestamp");
    } else {
      // If secret is not yet set in remote Vercel environment, it must fail closed with 500 SERVER_CONFIG_ERROR
      assert.equal(res.status, 500);
      const body = await res.json() as any;
      assert.match(body.message, /secret/i);
    }
  });
});
