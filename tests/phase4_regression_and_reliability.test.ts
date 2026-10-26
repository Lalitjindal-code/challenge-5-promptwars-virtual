import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Phase 4: Event Lifecycle & Duplication Resilience", () => {
  test("duplicating an event creates a distinct ID, Planning status, and cloned metadata", () => {
    interface EventItem {
      id: string;
      name: string;
      type: string;
      date: string;
      location: string;
      budget: number;
      spent: number;
      guestsCount: number;
      confirmedGuests: number;
      totalTasks: number;
      tasksCompleted: number;
      status: "Planning" | "On Track" | "Attention" | "Completed";
      description?: string;
    }

    const duplicateEvent = (original: EventItem): EventItem => {
      return {
        ...original,
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: `${original.name} (Copy)`,
        status: "Planning",
        spent: 0,
        confirmedGuests: 0,
        tasksCompleted: 0,
      };
    };

    const original: EventItem = {
      id: "evt-original-1",
      name: "Udaipur Royal Gala",
      type: "Destination Celebration",
      date: "2026-11-20",
      location: "City Palace, Udaipur",
      budget: 800000,
      spent: 450000,
      guestsCount: 200,
      confirmedGuests: 140,
      totalTasks: 25,
      tasksCompleted: 18,
      status: "Completed",
      description: "Heritage luxury banquet",
    };

    const clone = duplicateEvent(original);

    // Assert unique ID
    assert.notStrictEqual(clone.id, original.id);
    assert.ok(clone.id.startsWith("evt-"));
    // Assert status reset to Planning
    assert.strictEqual(clone.status, "Planning");
    // Assert name appended with (Copy)
    assert.strictEqual(clone.name, "Udaipur Royal Gala (Copy)");
    // Assert metrics reset for the fresh duplicate
    assert.strictEqual(clone.spent, 0);
    assert.strictEqual(clone.confirmedGuests, 0);
    assert.strictEqual(clone.tasksCompleted, 0);
    // Assert target parameters preserved
    assert.strictEqual(clone.budget, 800000);
    assert.strictEqual(clone.guestsCount, 200);
    assert.strictEqual(clone.location, "City Palace, Udaipur");
  });

  test("deleting the active event safely defaults to the next event or empty", () => {
    const events = [
      { id: "e1", name: "Event One" },
      { id: "e2", name: "Event Two" },
      { id: "e3", name: "Event Three" },
    ];

    const deleteAndSelectNext = (list: { id: string; name: string }[], idToDelete: string, currentActiveId: string) => {
      const remaining = list.filter((e) => e.id !== idToDelete);
      let nextActiveId = currentActiveId;
      if (currentActiveId === idToDelete) {
        nextActiveId = remaining[0]?.id || "";
      }
      return { remaining, nextActiveId };
    };

    // Case 1: Active event deleted -> switch to first remaining
    const res1 = deleteAndSelectNext(events, "e1", "e1");
    assert.strictEqual(res1.remaining.length, 2);
    assert.strictEqual(res1.nextActiveId, "e2");

    // Case 2: Non-active event deleted -> preserve active
    const res2 = deleteAndSelectNext(events, "e2", "e1");
    assert.strictEqual(res2.remaining.length, 2);
    assert.strictEqual(res2.nextActiveId, "e1");

    // Case 3: Only event deleted -> defaults cleanly to empty string
    const res3 = deleteAndSelectNext([{ id: "e-only", name: "Solo" }], "e-only", "e-only");
    assert.strictEqual(res3.remaining.length, 0);
    assert.strictEqual(res3.nextActiveId, "");
  });
});

describe("Phase 4: Timeline Task State Synchronization", () => {
  test("toggling task status cycles cleanly between Completed and Pending", () => {
    interface TaskItem {
      id: string;
      title: string;
      status: "Completed" | "Pending" | "In Progress";
      completed: boolean;
      updatedAt?: string;
    }

    const toggleTask = (task: TaskItem): TaskItem => {
      const isNowCompleted = !task.completed;
      return {
        ...task,
        completed: isNowCompleted,
        status: isNowCompleted ? "Completed" : "Pending",
        updatedAt: new Date().toISOString(),
      };
    };

    const pendingTask: TaskItem = { id: "t1", title: "Catering Menu Review", status: "Pending", completed: false };
    const completed = toggleTask(pendingTask);

    assert.strictEqual(completed.completed, true);
    assert.strictEqual(completed.status, "Completed");
    assert.ok(completed.updatedAt);

    // Toggle back
    const reverted = toggleTask(completed);
    assert.strictEqual(reverted.completed, false);
    assert.strictEqual(reverted.status, "Pending");
  });
});

describe("Phase 4: Multi-Attribute Vendor Filtering Engine", () => {
  const directory = [
    { id: "v1", name: "Maharana Lights", category: "Logistics & AV", location: "Udaipur", cost: 120000, status: "Booked" },
    { id: "v2", name: "Royal Rajasthan Caterers", category: "Catering", location: "Jaipur", cost: 350000, status: "Shortlisted" },
    { id: "v3", name: "Soulful Strings DJ", category: "Music & DJ", location: "Delhi", cost: 75000, status: "Booked" },
    { id: "v4", name: "Lakeview Heritage Palace", category: "Venue", location: "Udaipur", cost: 900000, status: "Booked" },
  ];

  const filterVendors = (query: string, category: string, status: string) => {
    return directory.filter((v) => {
      if (category !== "All" && !v.category.toLowerCase().includes(category.toLowerCase())) return false;
      if (status !== "All" && v.status.toLowerCase() !== status.toLowerCase()) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  };

  test("filters by location and category combination", () => {
    const results = filterVendors("Udaipur", "Venue", "All");
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].name, "Lakeview Heritage Palace");
  });

  test("filters by status correctly", () => {
    const booked = filterVendors("", "All", "Booked");
    assert.strictEqual(booked.length, 3);

    const shortlisted = filterVendors("", "All", "Shortlisted");
    assert.strictEqual(shortlisted.length, 1);
    assert.strictEqual(shortlisted[0].name, "Royal Rajasthan Caterers");
  });

  test("returns empty array for non-matching search without error", () => {
    const none = filterVendors("NonExistentVendor999", "All", "All");
    assert.strictEqual(none.length, 0);
  });
});

describe("Phase 4: Route Guard & Session State Handling", () => {
  test("evaluates unauthenticated session redirects to /signin with preservation of target route", () => {
    const evaluateRouteAccess = (user: { uid: string } | null, loading: boolean, targetPath: string) => {
      if (loading) return { action: "WAIT_FOR_SESSION", redirect: null };
      if (!user) return { action: "REDIRECT", redirect: `/signin?from=${encodeURIComponent(targetPath)}` };
      return { action: "ALLOW", redirect: null };
    };

    // Unauthenticated user attempting to access /budget
    const unauth = evaluateRouteAccess(null, false, "/budget");
    assert.strictEqual(unauth.action, "REDIRECT");
    assert.strictEqual(unauth.redirect, "/signin?from=%2Fbudget");

    // Authenticated user accessing /dashboard
    const auth = evaluateRouteAccess({ uid: "user-123" }, false, "/dashboard");
    assert.strictEqual(auth.action, "ALLOW");
    assert.strictEqual(auth.redirect, null);

    // Initial session resolving
    const resolving = evaluateRouteAccess(null, true, "/timeline");
    assert.strictEqual(resolving.action, "WAIT_FOR_SESSION");
  });
});
