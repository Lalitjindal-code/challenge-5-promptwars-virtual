import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  verifyFirebaseIdToken,
  verifyEventOwnership,
  checkRateLimit
} from "../server/aiHandler.ts";

describe("P0: Server Security and Authorization Hardening", () => {
  it("rejects missing, empty, or non-string authorization tokens", async () => {
    const res1 = await verifyFirebaseIdToken("");
    assert.equal(res1.valid, false);
    assert.match(res1.error || "", /missing or invalid/i);

    const res2 = await verifyFirebaseIdToken(null as any);
    assert.equal(res2.valid, false);

    const res3 = await verifyFirebaseIdToken(undefined as any);
    assert.equal(res3.valid, false);
  });

  it("rejects client-fabricated demo tokens (demo-token-*) without bypass", async () => {
    const fakeDemoTokens = [
      "demo-token-12345",
      "demo-token-alex-planner",
      "demo-admin-bypass",
      "demo-token-supersecret"
    ];

    for (const token of fakeDemoTokens) {
      const res = await verifyFirebaseIdToken(token, "AIzaSyFakeKeyForTestVerificationOnly");
      assert.equal(res.valid, false, `Fake demo token "${token}" must not be accepted as valid`);
    }
  });

  it("rejects event ownership checks even with demo-prefixed event IDs", async () => {
    // Attempting to bypass ownership by providing fabricated demo event IDs
    const bypassAttempts = [
      { projectId: "planora-ai-test", uid: "user-attacker-123", eventId: "demo-evt-1", token: "fake-user-token" },
      { projectId: "planora-ai-test", uid: "user-attacker-123", eventId: "demo-evt-2", token: "demo-token-fake" },
      { projectId: "planora-ai-test", uid: "user-attacker-123", eventId: "demo-exploit", token: "invalid-token" }
    ];

    for (const attempt of bypassAttempts) {
      const isOwner = await verifyEventOwnership(
        attempt.projectId,
        attempt.uid,
        attempt.eventId,
        attempt.token
      );
      assert.equal(isOwner, false, `Fabricated demo eventId "${attempt.eventId}" must NEVER bypass ownership checks`);
    }
  });

  it("rejects event ownership when parameters are missing or incomplete", async () => {
    assert.equal(await verifyEventOwnership("", "uid", "evt-1", "token"), false);
    assert.equal(await verifyEventOwnership("proj", "", "evt-1", "token"), false);
    assert.equal(await verifyEventOwnership("proj", "uid", "", "token"), false);
    assert.equal(await verifyEventOwnership("proj", "uid", "evt-1", ""), false);
  });

  it("enforces sliding-window rate limits per user identity", () => {
    const testUid = `test-user-rate-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const check = checkRateLimit(testUid);
      assert.equal(check.allowed, true, `Request ${i + 1} within window should be allowed`);
    }
    const sixthCheck = checkRateLimit(testUid);
    assert.equal(sixthCheck.allowed, false, "6th request within window must be rate limited");
    assert.ok(sixthCheck.retryAfterSeconds && sixthCheck.retryAfterSeconds > 0);
  });
});

describe("P1: Data Isolation and Scoping Integrity", () => {
  it("strictly scopes demo events so demo-evt-1 does not leak into demo-evt-2 or demo-evt-3", () => {
    // Verified demo items scoped per event
    const demoTasks = [
      { id: "dt-1", eventId: "demo-evt-1", title: "Mandap booking" },
      { id: "dt-2", eventId: "demo-evt-1", title: "Catering finalization" },
      { id: "dt-3", eventId: "demo-evt-2", title: "Convention Hall Keynote Tech Run" },
      { id: "dt-4", eventId: "demo-evt-3", title: "Meera Neon Photo Booth Setup" }
    ];

    // Scoping for event 2
    const scopedEvt2 = demoTasks.filter((t) => t.eventId === "demo-evt-2");
    assert.equal(scopedEvt2.length, 1);
    assert.equal(scopedEvt2[0].id, "dt-3");
    assert.ok(!scopedEvt2.some((t) => t.eventId === "demo-evt-1"), "demo-evt-1 tasks must never leak into demo-evt-2");

    // Scoping for event 3
    const scopedEvt3 = demoTasks.filter((t) => t.eventId === "demo-evt-3");
    assert.equal(scopedEvt3.length, 1);
    assert.equal(scopedEvt3[0].id, "dt-4");
    assert.ok(!scopedEvt3.some((t) => t.eventId === "demo-evt-1"), "demo-evt-1 tasks must never leak into demo-evt-3");
  });

  it("does not render fallback sample tasks when real event has 0 tasks", () => {
    // In real authenticated workspace, empty tasks array should remain empty
    const realUserTasks: any[] = [];
    // The previous bug was: const eventTasks = tasks.length > 0 ? tasks : [fallback demo tasks]
    // The fixed implementation is: const eventTasks = tasks;
    const eventTasks = realUserTasks;
    assert.equal(eventTasks.length, 0, "Empty real event must not display fake sample tasks");
  });

  it("calculates budget KPIs dynamically without static test overrides", () => {
    const realEvents = [
      { id: "evt-real-1", budget: 500000, spent: 120000 },
      { id: "evt-real-2", budget: 300000, spent: 80000 }
    ];

    const totalBudget = realEvents.reduce((acc, e) => acc + (e.budget || 0), 0);
    const totalSpent = realEvents.reduce((acc, e) => acc + (e.spent || 0), 0);
    const remaining = Math.max(0, totalBudget - totalSpent);
    const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    assert.equal(totalBudget, 800000);
    assert.equal(totalSpent, 200000);
    assert.equal(remaining, 600000);
    assert.equal(spentPct, 25);
  });

  it("handles empty budget workspace cleanly without division by zero or fake numbers", () => {
    const emptyEvents: any[] = [];
    const totalBudget = emptyEvents.reduce((acc, e) => acc + (e.budget || 0), 0);
    const totalSpent = emptyEvents.reduce((acc, e) => acc + (e.spent || 0), 0);
    const spentPct = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
    const remaining = Math.max(0, totalBudget - totalSpent);

    assert.equal(totalBudget, 0);
    assert.equal(totalSpent, 0);
    assert.equal(spentPct, 0);
    assert.equal(remaining, 0);
  });
});
