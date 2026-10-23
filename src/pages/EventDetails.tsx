import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";

export default function EventDetails() {
  const { activeEvent, tasks, toggleTask, budgetItems, guests, vendors } = useEventContext();
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "budget" | "guests" | "vendors">("overview");

  if (!activeEvent) {
    return (
      <AppLayout title="Event Not Found" subtitle="Select an event from My Events.">
        <div className="p-10 text-center">
          <p className="text-sm text-on-surface-variant">No active event selected.</p>
          <Link to="/events" className="mt-4 inline-block px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold">
            Back to Events
          </Link>
        </div>
      </AppLayout>
    );
  }

  const bPct = Math.round((activeEvent.spent / activeEvent.budget) * 100);
  const eventTasks = tasks.filter((t) => t.eventId === activeEvent.id);
  const completedCount = eventTasks.filter((t) => t.completed).length;
  const tPct = eventTasks.length > 0 ? Math.round((completedCount / eventTasks.length) * 100) : 0;

  return (
    <AppLayout title={activeEvent.name} subtitle="Comprehensive event overview and operational hub.">
      {/* 1. Hero Section with Opulent Backdrop */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-outline-variant/15">
        <div className="relative w-full min-h-[320px] bg-gradient-to-br from-primary via-primary-container to-surface-tint flex flex-col justify-end p-6 md:p-10 text-white">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-[1px]"></div>

          {/* Badges Cluster */}
          <div className="relative z-10 flex flex-wrap items-center gap-2.5 mb-3">
            <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase tracking-wider shadow-sm">
              {activeEvent.type}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 text-primary text-xs font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {activeEvent.status}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold tracking-wider uppercase shadow-sm">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              AI Studio Active
            </span>
          </div>

          {/* Main Headline & Description */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-2 drop-shadow-sm">
                {activeEvent.name}
              </h1>
              <p className="text-sm text-primary-fixed-dim/90 leading-relaxed mb-4">
                {activeEvent.description || "A luxury bespoke celebration orchestrated with precision and elegance."}
              </p>

              {/* Core metadata pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest/15 backdrop-blur-md">
                  <span className="material-symbols-outlined text-secondary-fixed text-[18px]">calendar_today</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase text-primary-fixed-dim">Date</span>
                    <span className="text-xs font-semibold truncate">{activeEvent.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest/15 backdrop-blur-md">
                  <span className="material-symbols-outlined text-secondary-fixed text-[18px]">location_on</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase text-primary-fixed-dim">Venue</span>
                    <span className="text-xs font-semibold truncate">{activeEvent.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest/15 backdrop-blur-md">
                  <span className="material-symbols-outlined text-secondary-fixed text-[18px]">groups</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase text-primary-fixed-dim">Guests</span>
                    <span className="text-xs font-semibold truncate">{activeEvent.guestsCount} Expected</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest/15 backdrop-blur-md">
                  <span className="material-symbols-outlined text-secondary-fixed text-[18px]">payments</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase text-primary-fixed-dim">Budget</span>
                    <span className="text-xs font-semibold truncate">₹{(activeEvent.budget / 100000).toFixed(1)}L Total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/create-event"
                className="h-10 px-4 rounded-xl bg-secondary-fixed text-on-secondary-fixed text-xs font-bold flex items-center gap-1.5 hover:bg-secondary-fixed-dim transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scoped Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "overview", label: "Overview", icon: "dashboard" },
          { key: "tasks", label: `Tasks (${eventTasks.length})`, icon: "checklist" },
          { key: "budget", label: "Budget Allocation", icon: "payments" },
          { key: "guests", label: "Guests & RSVPs", icon: "group" },
          { key: "vendors", label: "Booked Vendors", icon: "storefront" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === tab.key
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Tab Contents */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left Column: Metrics & Checklist */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/15 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Budget Spent
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold text-primary">₹{(activeEvent.spent / 1000).toLocaleString()}k</span>
                  <span className="text-xs text-secondary font-bold">{bPct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container mt-2 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(bPct, 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/15 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Task Milestones
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold text-secondary">{completedCount}</span>
                  <span className="text-xs text-on-surface-variant">of {eventTasks.length} Completed</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container mt-2 overflow-hidden">
                  <div className="h-full bg-secondary-fixed-dim" style={{ width: `${tPct}%` }}></div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/15 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  RSVPs Confirmed
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold text-primary">{activeEvent.confirmedGuests}</span>
                  <span className="text-xs text-on-surface-variant">of {activeEvent.guestsCount}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container mt-2 overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.round((activeEvent.confirmedGuests / activeEvent.guestsCount) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Tasks Summary */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-primary">Key Action Milestones</h3>
                <Link to="/timeline" className="text-xs font-bold text-primary hover:text-secondary flex items-center gap-1">
                  <span>Manage in Timeline</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>

              <div className="flex flex-col divide-y divide-surface-container/60">
                {eventTasks.map((t) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleTask(t.id)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                      />
                      <span className={`text-xs font-medium ${t.completed ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-error font-semibold">Due: {t.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Suggestions & Quick Links */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-container text-[20px]">psychology</span>
                <h3 className="font-heading font-bold text-sm text-primary">Event AI Assistant</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Based on your guest count of {activeEvent.guestsCount}, we recommend securing an audio/visual technician 14 days prior to ensure seamless acoustics across the terrace.
              </p>
              <Link
                to="/ai-ideas"
                className="w-full mt-2 py-2 px-3 rounded-lg bg-tertiary-container text-on-tertiary text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>Open AI Theme Studio</span>
              </Link>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-2.5">
              <h3 className="font-heading font-bold text-sm text-primary mb-1">Quick Modules</h3>
              <Link to="/budget" className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-xs font-medium text-on-surface transition-colors">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                  Budget Breakdown & Ledger
                </span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <Link to="/guests" className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-xs font-medium text-on-surface transition-colors">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">group</span>
                  Guest RSVPs & Table Seating
                </span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <Link to="/vendors" className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-between text-xs font-medium text-on-surface transition-colors">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">storefront</span>
                  Vendor Directory & Contracts
                </span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-primary">Checklist & Milestones</h3>
            <span className="text-xs text-on-surface-variant">{completedCount} of {eventTasks.length} Completed</span>
          </div>
          <div className="flex flex-col divide-y divide-surface-container/60">
            {eventTasks.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                  <span className={`text-sm font-medium ${t.completed ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-error font-medium">Due: {t.dueDate}</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                    {t.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "budget" && (
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-primary">Budget Categories</h3>
            <Link to="/budget" className="text-xs font-bold text-primary hover:text-secondary">Full Budget View →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {budgetItems.map((b) => (
              <div key={b.id} className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/15 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-on-surface">{b.category}</span>
                  <span className="text-xs font-bold text-primary">₹{b.allocated.toLocaleString()}</span>
                </div>
                <span className="text-[11px] text-on-surface-variant">{b.notes}</span>
                <div className="w-full h-1.5 rounded-full bg-surface-container mt-3 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.round((b.spent / b.allocated) * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "guests" && (
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-primary">Guest Registry</h3>
            <Link to="/guests" className="text-xs font-bold text-primary hover:text-secondary">Full Guest Management →</Link>
          </div>
          <div className="flex flex-col divide-y divide-surface-container/60">
            {guests.map((g) => (
              <div key={g.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-on-surface block">{g.name}</span>
                  <span className="text-[11px] text-on-surface-variant">{g.email} • {g.table}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-bold">
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "vendors" && (
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-primary">Booked & Shortlisted Vendors</h3>
            <Link to="/vendors" className="text-xs font-bold text-primary hover:text-secondary">Explore Vendors →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {vendors.map((v) => (
              <div key={v.id} className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/15 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-on-surface">{v.name}</h4>
                  <span className="text-[11px] text-on-surface-variant block">{v.service} • ₹{v.cost.toLocaleString()}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
