import React from "react";
import { Link } from "react-router-dom";
import { calculateEventReadiness } from "../../lib/readinessEngine";
import type { EventItem, DetailedTask, DetailedVendor, DetailedGuest, BudgetItem } from "../../types";

interface EventReadinessCardProps {
  event: EventItem | null | undefined;
  tasks?: DetailedTask[];
  budgetItems?: BudgetItem[];
  vendors?: DetailedVendor[];
  guests?: DetailedGuest[];
  className?: string;
}

export const EventReadinessCard: React.FC<EventReadinessCardProps> = ({
  event,
  tasks = [],
  budgetItems = [],
  vendors = [],
  guests = [],
  className = ""
}) => {
  const report = calculateEventReadiness(event, tasks, budgetItems, vendors, guests);

  return (
    <div
      className={`w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-space-md ${className}`}
      aria-labelledby="readiness-card-title"
    >
      {/* Header & Overall Score Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary">verified</span>
            <h2 id="readiness-card-title" className="font-headline-sm text-headline-sm text-primary font-bold">
              Event Readiness Intelligence
            </h2>
          </div>
          <p className="font-caption text-caption text-on-surface-variant">
            Holistic readiness index computed across timeline, budget, vendor coverage, and guest RSVP quorum.
          </p>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex flex-col items-end">
            <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-medium">
              Readiness Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-primary tracking-tight">
                {report.overallScore}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">/100</span>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full font-label-md text-label-md font-bold flex items-center gap-1.5 ${report.badgeBg} ${report.badgeColor}`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>{report.readinessLevel}</span>
          </div>
        </div>
      </div>

      {/* Narrative Summary */}
      <p className="font-body-md text-body-md text-on-surface-variant">
        {report.summary}
      </p>

      {/* 4 Pillars Progress Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-xs">
        {/* Pillar 1: Timeline */}
        <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
              <span>Timeline (30%)</span>
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">
              {report.pillars.tasks.score}/{report.pillars.tasks.maxScore}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={report.pillars.tasks.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Timeline Readiness Progress"
            className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden my-1"
          >
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                report.pillars.tasks.status === "optimal"
                  ? "bg-secondary"
                  : report.pillars.tasks.status === "warning"
                  ? "bg-primary"
                  : "bg-error"
              }`}
              style={{ width: `${report.pillars.tasks.percentage}%` }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {report.pillars.tasks.headline}
            </span>
            <span className="font-caption text-caption text-on-surface-variant line-clamp-1">
              {report.pillars.tasks.detail}
            </span>
          </div>
        </div>

        {/* Pillar 2: Budget */}
        <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
              <span>Budget (25%)</span>
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">
              {report.pillars.budget.score}/{report.pillars.budget.maxScore}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={report.pillars.budget.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Budget Health Progress"
            className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden my-1"
          >
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                report.pillars.budget.status === "optimal"
                  ? "bg-secondary"
                  : report.pillars.budget.status === "warning"
                  ? "bg-primary"
                  : "bg-error"
              }`}
              style={{ width: `${report.pillars.budget.percentage}%` }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {report.pillars.budget.headline}
            </span>
            <span className="font-caption text-caption text-on-surface-variant line-clamp-1">
              {report.pillars.budget.detail}
            </span>
          </div>
        </div>

        {/* Pillar 3: Vendors */}
        <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">storefront</span>
              <span>Vendors (25%)</span>
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">
              {report.pillars.vendors.score}/{report.pillars.vendors.maxScore}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={report.pillars.vendors.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Vendor Coverage Progress"
            className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden my-1"
          >
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                report.pillars.vendors.status === "optimal"
                  ? "bg-secondary"
                  : report.pillars.vendors.status === "warning"
                  ? "bg-primary"
                  : "bg-error"
              }`}
              style={{ width: `${report.pillars.vendors.percentage}%` }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {report.pillars.vendors.headline}
            </span>
            <span className="font-caption text-caption text-on-surface-variant line-clamp-1">
              {report.pillars.vendors.detail}
            </span>
          </div>
        </div>

        {/* Pillar 4: Guests & RSVP */}
        <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">group</span>
              <span>RSVP Quorum (20%)</span>
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">
              {report.pillars.guests.score}/{report.pillars.guests.maxScore}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={report.pillars.guests.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Guest RSVP Progress"
            className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden my-1"
          >
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                report.pillars.guests.status === "optimal"
                  ? "bg-secondary"
                  : report.pillars.guests.status === "warning"
                  ? "bg-primary"
                  : "bg-error"
              }`}
              style={{ width: `${report.pillars.guests.percentage}%` }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {report.pillars.guests.headline}
            </span>
            <span className="font-caption text-caption text-on-surface-variant line-clamp-1">
              {report.pillars.guests.detail}
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Critical Items (If Any) */}
      {report.criticalActionItems.length > 0 && (
        <div className="mt-space-xs pt-space-md border-t border-surface-container flex flex-col gap-2">
          <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold">
            Recommended Actions to Increase Readiness ({report.criticalActionItems.length})
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
            {report.criticalActionItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-space-sm p-3 rounded-lg bg-surface-container-low border border-outline-variant/10 text-sm"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                      item.priority === "high" ? "text-error" : "text-tertiary"
                    }`}
                  >
                    {item.priority === "high" ? "error" : "info"}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-on-surface truncate">{item.title}</span>
                    <span className="text-xs text-on-surface-variant line-clamp-1">{item.description}</span>
                  </div>
                </div>
                <Link
                  to={item.link}
                  className="shrink-0 px-3 py-1 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-primary font-medium text-xs rounded-md transition-colors"
                >
                  {item.actionLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventReadinessCard;
