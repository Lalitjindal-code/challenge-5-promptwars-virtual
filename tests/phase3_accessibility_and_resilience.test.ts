import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Phase 3: Input Validation and Form Resilience", () => {
  test("rejects invalid or blank event names in event creation validation", () => {
    const validateEventInput = (input: { name: string; budget: number; date: string; guestsCount: number }) => {
      const errors: string[] = [];
      if (!input.name || !input.name.trim()) {
        errors.push("Event name is required and cannot be blank.");
      }
      if (typeof input.budget !== "number" || isNaN(input.budget) || input.budget < 0) {
        errors.push("Budget must be a non-negative number.");
      }
      if (typeof input.guestsCount !== "number" || isNaN(input.guestsCount) || input.guestsCount < 0) {
        errors.push("Guest count must be a non-negative integer.");
      }
      if (!input.date || isNaN(new Date(input.date).getTime())) {
        errors.push("A valid date is required.");
      }
      return { isValid: errors.length === 0, errors };
    };

    // Blank name
    assert.strictEqual(validateEventInput({ name: "   ", budget: 100000, date: "2026-12-15", guestsCount: 100 }).isValid, false);
    // Negative budget
    assert.strictEqual(validateEventInput({ name: "Wedding", budget: -500, date: "2026-12-15", guestsCount: 100 }).isValid, false);
    // Invalid date
    assert.strictEqual(validateEventInput({ name: "Wedding", budget: 50000, date: "not-a-date", guestsCount: 100 }).isValid, false);
    // Negative guests
    assert.strictEqual(validateEventInput({ name: "Wedding", budget: 50000, date: "2026-12-15", guestsCount: -10 }).isValid, false);
    // Valid input
    const valid = validateEventInput({ name: "Royal Gala", budget: 500000, date: "2026-12-15", guestsCount: 200 });
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.errors.length, 0);
  });

  test("rejects invalid guest emails and handles missing contact gracefully", () => {
    const validateGuestInput = (guest: { firstName: string; lastName: string; email?: string; partySize: number }) => {
      const errors: string[] = [];
      if (!guest.firstName || !guest.firstName.trim()) {
        errors.push("First name is required.");
      }
      if (guest.email && guest.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guest.email.trim())) {
          errors.push("Invalid email format.");
        }
      }
      if (typeof guest.partySize !== "number" || guest.partySize < 1) {
        errors.push("Party size must be at least 1.");
      }
      return { isValid: errors.length === 0, errors };
    };

    assert.strictEqual(validateGuestInput({ firstName: "", lastName: "Kapoor", partySize: 1 }).isValid, false);
    assert.strictEqual(validateGuestInput({ firstName: "Rohan", lastName: "Kapoor", email: "invalid-email", partySize: 1 }).isValid, false);
    assert.strictEqual(validateGuestInput({ firstName: "Rohan", lastName: "Kapoor", partySize: 0 }).isValid, false);
    // Valid without email
    assert.strictEqual(validateGuestInput({ firstName: "Rohan", lastName: "Kapoor", partySize: 2 }).isValid, true);
    // Valid with valid email
    assert.strictEqual(validateGuestInput({ firstName: "Rohan", lastName: "Kapoor", email: "rohan@example.com", partySize: 2 }).isValid, true);
  });
});

describe("Phase 3: CSV Sanitization and Export Security", () => {
  test("neutralizes formula injection characters (=, +, -, @) in CSV export cells", () => {
    const sanitizeCsvCell = (val: string | number | boolean | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      // If cell begins with formula trigger chars (=, +, -, @, \t, \r), prepend a single quote to neutralize spreadsheet execution
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    // Harmful DDE injection formula
    const harmfulFormula = "=cmd|' /C calc'!A0";
    const sanitizedHarmful = sanitizeCsvCell(harmfulFormula);
    assert.strictEqual(sanitizedHarmful, "\"'=cmd|' /C calc'!A0\"");

    // Minus formula prefix
    const minusFormula = "-2+3";
    assert.strictEqual(sanitizeCsvCell(minusFormula), "\"'-2+3\"");

    // Standard safe string
    const safeString = "Aarav & Priya Wedding Banquet";
    assert.strictEqual(sanitizeCsvCell(safeString), '"Aarav & Priya Wedding Banquet"');

    // Quotes escaped properly
    const stringwithQuotes = 'Grand "Royal" Suite';
    assert.strictEqual(sanitizeCsvCell(stringwithQuotes), '"Grand ""Royal"" Suite"');
  });
});

describe("Phase 3: Empty State Resilience and Strict Data Scoping", () => {
  test("computes zeroed metrics cleanly when an event has 0 guests or 0 budget without NaN or crash", () => {
    const calculateEventKPIs = (event: { budget: number; spent: number; guestsCount: number; confirmedGuests: number; totalTasks: number; tasksCompleted: number }) => {
      const spendRatio = event.budget > 0 ? (event.spent / event.budget) * 100 : 0;
      const rsvpRate = event.guestsCount > 0 ? (event.confirmedGuests / event.guestsCount) * 100 : 0;
      const taskProgress = event.totalTasks > 0 ? (event.tasksCompleted / event.totalTasks) * 100 : 0;

      return {
        spendRatio: Number(spendRatio.toFixed(1)),
        rsvpRate: Number(rsvpRate.toFixed(1)),
        taskProgress: Number(taskProgress.toFixed(1)),
      };
    };

    const emptyEvent = {
      budget: 0,
      spent: 0,
      guestsCount: 0,
      confirmedGuests: 0,
      totalTasks: 0,
      tasksCompleted: 0,
    };

    const kpis = calculateEventKPIs(emptyEvent);
    assert.strictEqual(kpis.spendRatio, 0);
    assert.strictEqual(kpis.rsvpRate, 0);
    assert.strictEqual(kpis.taskProgress, 0);
    assert.strictEqual(isNaN(kpis.spendRatio), false);
    assert.strictEqual(isNaN(kpis.rsvpRate), false);
    assert.strictEqual(isNaN(kpis.taskProgress), false);
  });

  test("strictly isolates guests and vendors across events when filtered by eventId or eventName", () => {
    const guests = [
      { id: "g1", name: "Guest Event 1", eventId: "evt-100", event: "Gala A" },
      { id: "g2", name: "Guest Event 2", eventId: "evt-200", event: "Gala B" },
      { id: "g3", name: "Guest Event 1 Part 2", eventId: "evt-100", event: "Gala A" },
    ];

    const filterGuestsForEvent = (eventTarget: { id: string; name: string }) => {
      return guests.filter((g) => g.eventId === eventTarget.id || g.event === eventTarget.name);
    };

    const event1Guests = filterGuestsForEvent({ id: "evt-100", name: "Gala A" });
    assert.strictEqual(event1Guests.length, 2);
    assert.ok(event1Guests.every((g) => g.eventId === "evt-100"));

    const event2Guests = filterGuestsForEvent({ id: "evt-200", name: "Gala B" });
    assert.strictEqual(event2Guests.length, 1);
    assert.strictEqual(event2Guests[0].id, "g2");

    const nonExistent = filterGuestsForEvent({ id: "evt-999", name: "Unknown" });
    assert.strictEqual(nonExistent.length, 0);
  });
});

describe("Phase 3: AI Response Parsing and Error Resilience", () => {
  test("safely parses clean JSON and markdown-wrapped JSON codeblocks", () => {
    const parseGeminiJson = (rawText: string) => {
      try {
        let cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "").trim();
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```\s*/, "").replace(/```$/, "").trim();
        }
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    };

    // Case 1: Standard JSON
    const standard = parseGeminiJson('{"plan": "Luxury Palace Wedding", "items": [1, 2]}');
    assert.deepStrictEqual(standard, { plan: "Luxury Palace Wedding", items: [1, 2] });

    // Case 2: Markdown ```json block
    const markdownWrapped = parseGeminiJson("```json\n{\n  \"theme\": \"Royal Sunset\",\n  \"estimatedBudget\": 500000\n}\n```");
    assert.deepStrictEqual(markdownWrapped, { theme: "Royal Sunset", estimatedBudget: 500000 });

    // Case 3: Truncated or malformed JSON handles error without throwing
    const brokenJson = "```json\n{\n  \"theme\": \"Incomplete";
    const fallback = parseGeminiJson(brokenJson);
    assert.strictEqual(fallback, null);
  });
});

describe("Phase 3: Focus Trap and Modal Accessibility Helpers", () => {
  test("correctly identifies focusable selector types", () => {
    const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Verify selector tokens
    assert.ok(FOCUSABLE_SELECTOR.includes("button:not([disabled])"));
    assert.ok(FOCUSABLE_SELECTOR.includes("[href]"));
    assert.ok(FOCUSABLE_SELECTOR.includes('textarea:not([disabled])'));
    assert.ok(FOCUSABLE_SELECTOR.includes('[tabindex]:not([tabindex="-1"])'));
  });
});
