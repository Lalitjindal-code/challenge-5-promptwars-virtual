import type { EventItem, DetailedTask, DetailedVendor, DetailedGuest, BudgetItem } from "../types";

export interface ReadinessPillar {
  score: number;
  maxScore: number;
  percentage: number;
  status: "optimal" | "warning" | "alert";
  headline: string;
  detail: string;
}

export interface CriticalActionItem {
  id: string;
  title: string;
  description: string;
  category: "timeline" | "budget" | "vendor" | "guests";
  priority: "high" | "medium" | "low";
  link: string;
  actionLabel: string;
}

export interface EventReadinessReport {
  overallScore: number; // 0 to 100
  readinessLevel: "Ready for Launch" | "On Track" | "Needs Attention" | "Critical Planning Stage";
  badgeColor: string;
  badgeBg: string;
  summary: string;
  pillars: {
    tasks: ReadinessPillar;
    budget: ReadinessPillar;
    vendors: ReadinessPillar;
    guests: ReadinessPillar;
  };
  criticalActionItems: CriticalActionItem[];
}

/**
 * Computes an evidence-based Event Readiness Score (0-100) based on actual event data.
 * Pure function with zero side effects, suitable for deterministic testing.
 *
 * Weight Distribution:
 * - Tasks & Milestone Progress: 30%
 * - Budget Allocation & Health: 25%
 * - Vendor Sourcing & Coverage: 25%
 * - Guest List & RSVP Quorum: 20%
 */
export function calculateEventReadiness(
  event: EventItem | null | undefined,
  tasks: DetailedTask[] = [],
  budgetItems: BudgetItem[] = [],
  vendors: DetailedVendor[] = [],
  guests: DetailedGuest[] = []
): EventReadinessReport {
  const criticalActionItems: CriticalActionItem[] = [];

  // 1. Tasks Pillar (30 points max)
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed || t.status === "Completed").length;
  const overdueTasks = tasks.filter((t) => {
    if (t.completed || t.status === "Completed") return false;
    if (t.status === "Overdue") return true;
    if (!t.dueDate || t.dueDate === "TBA" || t.dueDate.includes("TBD")) return false;
    const parsed = new Date(t.dueDate);
    return !isNaN(parsed.getTime()) && parsed < new Date();
  }).length;

  let taskScore = 0;
  if (totalTasks === 0) {
    taskScore = 12; // Baseline for nascent event
    criticalActionItems.push({
      id: "action-tasks-empty",
      title: "No tasks created in Timeline",
      description: "Initialize your milestone checklist or generate tasks via AI Concepts.",
      category: "timeline",
      priority: "high",
      link: "/timeline",
      actionLabel: "Add Tasks"
    });
  } else {
    const rawProgress = (completedTasks / totalTasks) * 30;
    const overduePenalty = overdueTasks * 3;
    taskScore = Math.max(0, Math.min(30, Math.round(rawProgress - overduePenalty)));

    if (overdueTasks > 0) {
      criticalActionItems.push({
        id: "action-tasks-overdue",
        title: `${overdueTasks} Overdue Task${overdueTasks > 1 ? "s" : ""} in Timeline`,
        description: "Past-due tasks create schedule bottlenecks for dependent vendor milestones.",
        category: "timeline",
        priority: "high",
        link: "/timeline",
        actionLabel: "Reschedule or Complete"
      });
    }
  }

  const tasksPillar: ReadinessPillar = {
    score: taskScore,
    maxScore: 30,
    percentage: Math.round((taskScore / 30) * 100),
    status: taskScore >= 22 ? "optimal" : taskScore >= 14 ? "warning" : "alert",
    headline: `${completedTasks}/${totalTasks} Tasks Completed`,
    detail: overdueTasks > 0 ? `${overdueTasks} overdue task(s) require immediate attention.` : "Milestones are progressing smoothly."
  };

  // 2. Budget Pillar (25 points max)
  const totalBudget = event?.budget || budgetItems.reduce((acc, b) => acc + (b.allocated || 0), 0);
  const totalSpent = event?.spent || budgetItems.reduce((acc, b) => acc + (b.spent || 0), 0);

  let budgetScore = 0;
  if (totalBudget <= 0) {
    budgetScore = 10;
    criticalActionItems.push({
      id: "action-budget-unset",
      title: "Target Budget Not Configured",
      description: "Define an overall budget limit to prevent financial overspending.",
      category: "budget",
      priority: "high",
      link: "/budget",
      actionLabel: "Set Target Budget"
    });
  } else if (totalSpent > totalBudget) {
    const overrunRatio = (totalSpent - totalBudget) / totalBudget;
    budgetScore = Math.max(0, Math.round(20 - overrunRatio * 40));
    criticalActionItems.push({
      id: "action-budget-overrun",
      title: "Budget Overrun Detected",
      description: `Actual expenditures exceed target budget by ${Math.round(overrunRatio * 100)}%.`,
      category: "budget",
      priority: "high",
      link: "/budget",
      actionLabel: "Optimize Expenses"
    });
  } else {
    // Healthy budget: spent is within allocated limit
    const spentRatio = totalSpent / totalBudget;
    budgetScore = Math.round(20 + (1 - spentRatio) * 5);
  }

  const budgetPillar: ReadinessPillar = {
    score: budgetScore,
    maxScore: 25,
    percentage: Math.round((budgetScore / 25) * 100),
    status: budgetScore >= 20 ? "optimal" : budgetScore >= 12 ? "warning" : "alert",
    headline: totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% Budget Consumed` : "Budget Unset",
    detail: totalSpent > totalBudget ? "Expenses exceed defined allocation." : "Expenditures are strictly within allocated limits."
  };

  // 3. Vendor Coverage Pillar (25 points max)
  const bookedVendors = vendors.filter((v) => v.status?.toLowerCase().includes("booked")).length;
  const criticalCategories = ["Venue", "Catering", "Decoration"];
  const bookedCategories = new Set(
    vendors
      .filter((v) => v.status?.toLowerCase().includes("booked"))
      .map((v) => v.category)
  );

  const missingCategories = criticalCategories.filter((cat) => !bookedCategories.has(cat as any));

  let vendorScore = 0;
  if (vendors.length === 0) {
    vendorScore = 8;
    criticalActionItems.push({
      id: "action-vendors-empty",
      title: "No Vendors Shortlisted or Booked",
      description: "Start sourcing essential venue and catering partners.",
      category: "vendor",
      priority: "high",
      link: "/vendors",
      actionLabel: "Browse Vendors"
    });
  } else {
    const coverageRatio = bookedVendors / Math.max(3, vendors.length);
    const categoryBonus = (criticalCategories.length - missingCategories.length) * 3;
    vendorScore = Math.min(25, Math.round(coverageRatio * 16 + categoryBonus));

    if (missingCategories.length > 0) {
      criticalActionItems.push({
        id: "action-vendor-missing-category",
        title: `Missing Booked: ${missingCategories.join(", ")}`,
        description: `Key foundational categories (${missingCategories.join(", ")}) have no confirmed booking.`,
        category: "vendor",
        priority: "medium",
        link: "/vendors",
        actionLabel: "Review Vendors"
      });
    }
  }

  const vendorPillar: ReadinessPillar = {
    score: vendorScore,
    maxScore: 25,
    percentage: Math.round((vendorScore / 25) * 100),
    status: vendorScore >= 18 ? "optimal" : vendorScore >= 12 ? "warning" : "alert",
    headline: `${bookedVendors}/${vendors.length} Vendors Confirmed`,
    detail: missingCategories.length === 0 ? "All primary vendor categories secured." : `Awaiting confirmation for: ${missingCategories.join(", ")}.`
  };

  // 4. Guest & RSVP Pillar (20 points max)
  const targetGuests = event?.guestsCount || guests.length;
  const confirmedGuests = Math.max(
    guests.filter((g) => g.status === "Confirmed").length,
    event?.confirmedGuests || 0
  );

  let guestScore = 0;
  if (targetGuests === 0 && guests.length === 0) {
    guestScore = 10;
  } else {
    const totalRoster = Math.max(targetGuests, guests.length);
    const rsvpRatio = confirmedGuests / totalRoster;
    guestScore = Math.min(20, Math.round(rsvpRatio * 20));

    if (rsvpRatio < 0.4 && totalRoster > 0) {
      criticalActionItems.push({
        id: "action-guests-rsvp-low",
        title: "Guest RSVP Confirmation Rate Below 40%",
        description: `${confirmedGuests} of ${totalRoster} guests confirmed. Catering guarantees depend on final count.`,
        category: "guests",
        priority: "medium",
        link: "/guests",
        actionLabel: "Track RSVPs"
      });
    }
  }

  const guestsPillar: ReadinessPillar = {
    score: guestScore,
    maxScore: 20,
    percentage: Math.round((guestScore / 20) * 100),
    status: guestScore >= 15 ? "optimal" : guestScore >= 10 ? "warning" : "alert",
    headline: `${confirmedGuests} Guests Confirmed`,
    detail: targetGuests > 0 ? `${Math.round((confirmedGuests / Math.max(1, targetGuests)) * 100)}% of target attendance locked in.` : "Guest list awaiting intake."
  };

  // Total Score (0 - 100)
  const overallScore = Math.min(100, Math.max(0, taskScore + budgetScore + vendorScore + guestScore));

  let readinessLevel: EventReadinessReport["readinessLevel"] = "Critical Planning Stage";
  let badgeColor = "text-error";
  let badgeBg = "bg-error-container/40";
  let summary = "The event is in its nascent planning stage with multiple critical parameters unaddressed.";

  if (overallScore >= 80) {
    readinessLevel = "Ready for Launch";
    badgeColor = "text-secondary";
    badgeBg = "bg-secondary-fixed/30";
    summary = "Outstanding preparation! Timelines, financial allocations, vendor contracts, and guest quotas are well synchronized.";
  } else if (overallScore >= 60) {
    readinessLevel = "On Track";
    badgeColor = "text-primary";
    badgeBg = "bg-primary-container/30";
    summary = "Solid planning foundation established. Resolve the remaining open items below to achieve launch readiness.";
  } else if (overallScore >= 40) {
    readinessLevel = "Needs Attention";
    badgeColor = "text-tertiary";
    badgeBg = "bg-tertiary-fixed/30";
    summary = "Key planning dependencies remain unresolved. Review the high-priority action items to get back on schedule.";
  }

  return {
    overallScore,
    readinessLevel,
    badgeColor,
    badgeBg,
    summary,
    pillars: {
      tasks: tasksPillar,
      budget: budgetPillar,
      vendors: vendorPillar,
      guests: guestsPillar
    },
    criticalActionItems
  };
}
