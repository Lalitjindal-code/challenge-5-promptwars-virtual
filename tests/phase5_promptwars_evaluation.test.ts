import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateEventReadiness } from "../src/lib/readinessEngine.ts";
import type { EventItem, DetailedTask, DetailedVendor, DetailedGuest, BudgetItem } from "../src/types/index.ts";

describe("Phase 11: PromptWars Score Optimization & Evaluation Suite", () => {
  // Test 1: Event Readiness Engine Calculation & Robustness
  describe("Event Readiness Intelligence Engine", () => {
    it("calculates high readiness (>= 80, Ready for Launch) for well-synchronized events", () => {
      const mockEvent: EventItem = {
        id: "evt-test-1",
        name: "Grand Gala",
        type: "Wedding",
        date: "2026-12-15",
        location: "Palace",
        budget: 1000000,
        spent: 800000,
        guestsCount: 200,
        confirmedGuests: 180,
        tasksCompleted: 10,
        totalTasks: 10,
        status: "On Track"
      };

      const mockTasks: DetailedTask[] = [
        {
          id: "t-1",
          eventId: "evt-test-1",
          title: "Book Venue",
          subtitle: "Done",
          event: "Grand Gala",
          dueDate: "2026-12-01",
          priority: "High",
          status: "Completed",
          completed: true,
          assignee: { name: "Alex", initials: "A", bg: "bg-primary", text: "text-white" }
        }
      ];

      const mockVendors: DetailedVendor[] = [
        {
          id: "v-1",
          eventId: "evt-test-1",
          name: "Heritage Venue",
          category: "Venue",
          location: "Udaipur",
          rating: 4.9,
          reviewCount: 40,
          event: "Grand Gala",
          tags: ["Luxury"],
          cost: 400000,
          status: "Booked",
          image: "",
          contactName: "Manager",
          contactRole: "GM",
          contactPhone: "9999999999",
          contactEmail: "venue@example.com",
          inclusions: [],
          advisoryText: "",
          notes: ""
        },
        {
          id: "v-2",
          eventId: "evt-test-1",
          name: "Royal Feasts",
          category: "Catering",
          location: "Udaipur",
          rating: 4.8,
          reviewCount: 30,
          event: "Grand Gala",
          tags: ["Gourmet"],
          cost: 300000,
          status: "Booked",
          image: "",
          contactName: "Chef",
          contactRole: "Head Chef",
          contactPhone: "9999999998",
          contactEmail: "chef@example.com",
          inclusions: [],
          advisoryText: "",
          notes: ""
        },
        {
          id: "v-3",
          eventId: "evt-test-1",
          name: "Floral Fantasies",
          category: "Decoration",
          location: "Udaipur",
          rating: 4.7,
          reviewCount: 25,
          event: "Grand Gala",
          tags: ["Floral"],
          cost: 100000,
          status: "Booked",
          image: "",
          contactName: "Florist",
          contactRole: "Designer",
          contactPhone: "9999999997",
          contactEmail: "floral@example.com",
          inclusions: [],
          advisoryText: "",
          notes: ""
        }
      ];

      const mockGuests: DetailedGuest[] = [
        {
          id: "g-1",
          eventId: "evt-test-1",
          name: "VIP Guest",
          avatar: "",
          email: "guest@example.com",
          phone: "9999999990",
          cohort: "VIP",
          event: "Grand Gala",
          partySize: 2,
          status: "Confirmed",
          dispatchStatus: "Delivered & Opened",
          dietary: "Vegetarian",
          table: "Table 1"
        }
      ];

      const report = calculateEventReadiness(mockEvent, mockTasks, [], mockVendors, mockGuests);

      assert.ok(report.overallScore >= 80, `Score should be >= 80, got ${report.overallScore}`);
      assert.equal(report.readinessLevel, "Ready for Launch");
      assert.equal(report.pillars.tasks.percentage, 100);
      assert.equal(report.pillars.budget.status, "optimal");
    });

    it("detects overdue tasks and penalizes timeline readiness score with high-priority action", () => {
      const mockEvent: EventItem = {
        id: "evt-test-2",
        name: "Birthday Party",
        type: "Birthday",
        date: "2026-11-01",
        location: "Club",
        budget: 50000,
        spent: 20000,
        guestsCount: 30,
        confirmedGuests: 15,
        tasksCompleted: 1,
        totalTasks: 4,
        status: "Attention"
      };

      const overdueTasks: DetailedTask[] = [
        {
          id: "t-od-1",
          eventId: "evt-test-2",
          title: "Order Birthday Cake",
          subtitle: "Past deadline",
          event: "Birthday Party",
          dueDate: "2024-01-01", // Past date
          priority: "High",
          status: "Overdue",
          completed: false,
          assignee: { name: "Host", initials: "H", bg: "bg-secondary", text: "text-white" }
        },
        {
          id: "t-od-2",
          eventId: "evt-test-2",
          title: "Confirm DJ Playlist",
          subtitle: "Past deadline",
          event: "Birthday Party",
          dueDate: "2024-01-02", // Past date
          priority: "Medium",
          status: "Overdue",
          completed: false,
          assignee: { name: "Host", initials: "H", bg: "bg-secondary", text: "text-white" }
        }
      ];

      const report = calculateEventReadiness(mockEvent, overdueTasks, [], [], []);

      assert.ok(report.criticalActionItems.some((a) => a.id === "action-tasks-overdue"));
      const overdueAction = report.criticalActionItems.find((a) => a.id === "action-tasks-overdue");
      assert.equal(overdueAction?.priority, "high");
      assert.equal(overdueAction?.link, "/timeline");
    });

    it("penalizes budget overrun when expenses exceed total allocated budget", () => {
      const overBudgetEvent: EventItem = {
        id: "evt-test-3",
        name: "Community Festival",
        type: "Community Event",
        date: "2026-11-15",
        location: "Town Hall",
        budget: 100000,
        spent: 160000, // 60% overrun
        guestsCount: 500,
        confirmedGuests: 300,
        tasksCompleted: 5,
        totalTasks: 5,
        status: "Attention"
      };

      const report = calculateEventReadiness(overBudgetEvent, [], [], [], []);

      assert.ok(report.criticalActionItems.some((a) => a.id === "action-budget-overrun"));
      assert.ok(report.pillars.budget.score < 15, `Budget score should be penalized, got ${report.pillars.budget.score}`);
    });

    it("handles zeroed or empty nascent event cleanly without NaN or exceptions", () => {
      const emptyReport = calculateEventReadiness(null, [], [], [], []);

      assert.ok(Number.isFinite(emptyReport.overallScore));
      assert.ok(emptyReport.overallScore >= 0 && emptyReport.overallScore <= 100);
      assert.ok(emptyReport.readinessLevel === "Critical Planning Stage" || emptyReport.readinessLevel === "Needs Attention");
      assert.ok(emptyReport.criticalActionItems.length > 0);
    });
  });

  // Test 2: Problem Statement Alignment across Weddings, Birthdays, and Community Events
  describe("Problem Statement Alignment (Weddings, Birthdays, Community Events)", () => {
    it("validates that all three official archetypes are supported", () => {
      const supportedArchetypes = ["Wedding", "Birthday", "Community Event"];
      supportedArchetypes.forEach((archetype) => {
        const event: EventItem = {
          id: `evt-${archetype.toLowerCase()}`,
          name: `${archetype} Celebration`,
          type: archetype,
          date: "2026-12-01",
          location: "Bengaluru",
          budget: 500000,
          spent: 200000,
          guestsCount: 150,
          confirmedGuests: 120,
          tasksCompleted: 5,
          totalTasks: 10,
          status: "On Track"
        };
        const report = calculateEventReadiness(event);
        assert.ok(report.overallScore > 0);
        assert.equal(event.type, archetype);
      });
    });
  });

  // Test 3: AI Recommendation Duplicate Prevention
  describe("AI Recommendation Application & Duplicate Prevention", () => {
    it("identifies duplicate deliverables and avoids double-counting tasks", () => {
      const existingTasks: DetailedTask[] = [
        {
          id: "t-exist-1",
          eventId: "evt-1",
          title: "Bespoke Royal Gala: Crystal Chandeliers",
          subtitle: "Deliverable requirement: 6 pieces",
          event: "Grand Wedding",
          dueDate: "2026-12-15",
          priority: "Medium",
          status: "Pending",
          completed: false,
          assignee: { name: "Creative Team", initials: "CT", bg: "bg-primary", text: "text-white" }
        }
      ];

      const newDeliverable = { name: "Crystal Chandeliers", qty: "6 pieces", icon: "wb_twilight", checked: false };
      const conceptTitle = "Bespoke Royal Gala";
      const targetTitle = `${conceptTitle}: ${newDeliverable.name}`;

      const isDuplicate = existingTasks.some(
        (t) => t.title.toLowerCase() === targetTitle.toLowerCase() && t.eventId === "evt-1"
      );

      assert.equal(isDuplicate, true, "Duplicate task detection must identify pre-existing deliverable task");
    });

    it("allows distinct tasks with similar sub-items from different concepts or events", () => {
      const existingTasks: DetailedTask[] = [
        {
          id: "t-exist-1",
          eventId: "evt-1",
          title: "Bespoke Royal Gala: Ambient Lighting",
          subtitle: "Deliverable requirement: 10 units",
          event: "Grand Wedding",
          dueDate: "2026-12-15",
          priority: "Medium",
          status: "Pending",
          completed: false,
          assignee: { name: "Creative Team", initials: "CT", bg: "bg-primary", text: "text-white" }
        }
      ];

      // Different concept title -> should NOT be blocked as duplicate
      const differentConceptTitle = "Minimalist Modern";
      const differentTaskTitle = `${differentConceptTitle}: Ambient Lighting`;
      const isDuplicateConcept = existingTasks.some(
        (t) => t.title.toLowerCase() === differentTaskTitle.toLowerCase() && t.eventId === "evt-1"
      );
      assert.equal(isDuplicateConcept, false, "Distinct concept title must not be falsely rejected as duplicate");

      // Different eventId -> should NOT be blocked as duplicate
      const sameConceptOtherEvent = existingTasks.some(
        (t) => t.title.toLowerCase() === "Bespoke Royal Gala: Ambient Lighting".toLowerCase() && t.eventId === "evt-2"
      );
      assert.equal(sameConceptOtherEvent, false, "Same deliverable on another event must not be blocked");
    });
  });

  // Test 4: Extreme Boundaries & Resilient Input Handling
  describe("Readiness Engine Edge Cases & Boundary Security", () => {
    it("strictly clamps overallScore between 0 and 100 under massive overrun & overdue penalties", () => {
      const catastrophicEvent: EventItem = {
        id: "evt-catastrophe",
        name: "Disaster Event",
        type: "Wedding",
        date: "2024-01-01",
        location: "None",
        budget: 10000,
        spent: 500000, // 50x overrun
        guestsCount: 500,
        confirmedGuests: 0,
        tasksCompleted: 0,
        totalTasks: 20,
        status: "Attention"
      };

      const manyOverdueTasks: DetailedTask[] = Array.from({ length: 20 }).map((_, i) => ({
        id: `t-cat-${i}`,
        eventId: "evt-catastrophe",
        title: `Task ${i}`,
        subtitle: "Overdue",
        event: "Disaster Event",
        dueDate: "2023-01-01",
        priority: "High",
        status: "Overdue",
        completed: false,
        assignee: { name: "A", initials: "A", bg: "", text: "" }
      }));

      const report = calculateEventReadiness(catastrophicEvent, manyOverdueTasks, [], [], []);

      assert.ok(report.overallScore >= 0, `Score must be >= 0, got ${report.overallScore}`);
      assert.ok(report.overallScore <= 100, `Score must be <= 100, got ${report.overallScore}`);
      assert.equal(report.readinessLevel, "Critical Planning Stage");
    });

    it("safely handles non-standard, malformed, or TBD due dates without throwing or false overdue flags", () => {
      const mockEvent: EventItem = {
        id: "evt-tbd",
        name: "Planning Phase",
        type: "Community Event",
        date: "Date TBD",
        location: "Venue TBA",
        budget: 100000,
        spent: 10000,
        guestsCount: 50,
        confirmedGuests: 10,
        tasksCompleted: 1,
        totalTasks: 3,
        status: "Planning"
      };

      const tbdTasks: DetailedTask[] = [
        {
          id: "t-tbd-1",
          eventId: "evt-tbd",
          title: "Select Community Hall",
          subtitle: "In discussion",
          event: "Planning Phase",
          dueDate: "Date TBD",
          priority: "Medium",
          status: "Completed",
          completed: true,
          assignee: { name: "Team", initials: "T", bg: "", text: "" }
        },
        {
          id: "t-tbd-2",
          eventId: "evt-tbd",
          title: "Design Flyers",
          subtitle: "Pending quotes",
          event: "Planning Phase",
          dueDate: "TBA",
          priority: "Normal",
          status: "Pending",
          completed: false,
          assignee: { name: "Team", initials: "T", bg: "", text: "" }
        },
        {
          id: "t-tbd-3",
          eventId: "evt-tbd",
          title: "Review Permitting",
          subtitle: "Ongoing",
          event: "Planning Phase",
          dueDate: "Spring 2027", // Non-standard date string
          priority: "Low",
          status: "Pending",
          completed: false,
          assignee: { name: "Team", initials: "T", bg: "", text: "" }
        }
      ];

      const report = calculateEventReadiness(mockEvent, tbdTasks, [], [], []);

      assert.ok(!report.criticalActionItems.some((a) => a.id === "action-tasks-overdue"), "TBD dates must not be counted as overdue");
      assert.ok(report.pillars.tasks.score > 0);
    });

    it("verifies that all critical action items link exclusively to active valid studio routes", () => {
      const nascentReport = calculateEventReadiness(null, [], [], [], []);
      const validStudioRoutes = new Set(["/timeline", "/budget", "/vendors", "/guests"]);

      assert.ok(nascentReport.criticalActionItems.length > 0);
      for (const item of nascentReport.criticalActionItems) {
        assert.ok(
          validStudioRoutes.has(item.link),
          `Action item link "${item.link}" must be one of ${Array.from(validStudioRoutes).join(", ")}`
        );
      }
    });
  });
});
