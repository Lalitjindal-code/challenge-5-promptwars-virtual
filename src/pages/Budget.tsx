import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";
import type { ExpenseTransaction } from "../types";

export default function Budget() {
  const { events, activeEvent, expenses, addExpense, isDemo } = useEventContext();

  // States
  const [selectedEventFilter, setSelectedEventFilter] = useState("Active Event");
  const [eventMenuOpen, setEventMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"All Time" | "This Month" | "Last 30 Days">("All Time");

  // Drawer / Add Expense state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEvent, setFormEvent] = useState(
    activeEvent?.name || events[0]?.name || "Wedding Event"
  );
  const [formCategory, setFormCategory] = useState<ExpenseTransaction["category"]>("Venue");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("2026-10-24");
  const [formVendor, setFormVendor] = useState("");
  const [formStatus, setFormStatus] = useState<"Paid" | "Pending" | "Scheduled">("Paid");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Aggregated amounts scoped to active event / workspace
  const computedTotalBudget = activeEvent?.budget || (isDemo ? 4500000 : 0);
  const currentTotalSpent = expenses.reduce((acc, tx) => acc + (tx.amount || 0), 0);

  const spentRatio = computedTotalBudget > 0 ? Math.min(Math.round((currentTotalSpent / computedTotalBudget) * 100), 100) : 0;
  const remainingBudget = Math.max(0, computedTotalBudget - currentTotalSpent);

  // Filtered transactions
  const filteredTransactions = expenses.filter((tx) => {
    if (categoryFilter !== "all" && tx.category !== categoryFilter) return false;
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.name.toLowerCase().includes(q) ||
        (tx.event && tx.event.toLowerCase().includes(q)) ||
        (tx.vendor && tx.vendor.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount);
    if (!formName || isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast("Please enter a valid expense name and amount.");
      return;
    }

    await addExpense({
      name: formName,
      event: formEvent,
      category: formCategory,
      date: new Date(formDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      amount: parsedAmount,
      status: formStatus,
      vendor: formVendor || "Direct Payment",
      icon:
        formCategory === "Venue"
          ? "domain"
          : formCategory === "Catering"
          ? "dinner_dining"
          : formCategory === "Decoration"
          ? "local_florist"
          : formCategory === "Photography"
          ? "videocam"
          : "receipt_long"
    });

    setDrawerOpen(false);
    setFormName("");
    setFormAmount("");
    setFormVendor("");
    showToast(`Logged expense "₹${parsedAmount.toLocaleString("en-IN")}" for ${formName}!`);
  };

  return (
    <AppLayout title="Budget" subtitle="Keep every expense under control with real-time fiscal telemetry.">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce border border-secondary-fixed/30">
          <span className="material-symbols-outlined text-secondary-fixed text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full gap-space-lg pb-12">
        {/* 1. Sub-Header / Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/15">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-sm flex-wrap">
              <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-bold">
                Budget Overview
              </h1>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setEventMenuOpen(!eventMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors font-semibold"
                >
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>{selectedEventFilter}</span>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
                </button>

                {eventMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-xl z-30 py-2 border border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEventFilter("All Events (3 Active)");
                        setEventMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-body-md font-body-md-medium text-primary hover:bg-surface-container flex items-center justify-between font-semibold"
                    >
                      <span>All Events</span>
                      <span className="material-symbols-outlined text-[18px] text-secondary">check</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEventFilter("Aarav & Priya Wedding");
                        setEventMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-body-md text-on-surface hover:bg-surface-container flex items-center justify-between"
                    >
                      <span>Aarav &amp; Priya Wedding</span>
                      <span className="text-caption font-caption text-on-surface-variant">Nov 2026</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEventFilter("TechFest 2026");
                        setEventMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-body-md text-on-surface hover:bg-surface-container flex items-center justify-between"
                    >
                      <span>TechFest 2026</span>
                      <span className="text-caption font-caption text-on-surface-variant">Dec 2026</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEventFilter("Birthday Celebration");
                        setEventMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-body-md text-on-surface hover:bg-surface-container flex items-center justify-between"
                    >
                      <span>Birthday Celebration</span>
                      <span className="text-caption font-caption text-on-surface-variant">Oct 2026</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant text-xs">
              Keep every expense under control and make every rupee count with real-time fiscal telemetry.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              type="button"
              onClick={() => showToast("Exporting comprehensive fiscal report (PDF/CSV)...")}
              className="h-11 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-2 transition-all font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Report</span>
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="h-11 px-space-lg rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:translate-y-0.5 font-semibold"
            >
              <span className="material-symbols-outlined text-secondary-fixed text-[18px]">add</span>
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* 2. Budget Summary Cards (4 Cards Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group border border-outline-variant/15">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold">
                  Total Budget
                </span>
                <span className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 font-bold">
                  ₹{computedTotalBudget.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-md mt-space-sm border-t border-outline-variant/10">
              <span className="font-caption text-caption text-on-surface-variant">Across active events</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">tune</span> 100% Target
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group border border-outline-variant/15">
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold">
                  Total Spent
                </span>
                <span className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 font-bold">
                  ₹{currentTotalSpent.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-md mt-space-sm border-t border-outline-variant/10">
              <span className="font-caption text-caption text-on-surface-variant">{spentRatio}% of total budget</span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> Tracked
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group border border-outline-variant/15">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary-fixed-dim"></div>
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold">
                  Remaining Budget
                </span>
                <span className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 font-bold">
                  ₹{remainingBudget.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[22px]">savings</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-md mt-space-sm border-t border-outline-variant/10">
              <span className="font-caption text-caption text-on-surface-variant">Runway reserve</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px] text-secondary">verified</span> Unlocked
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group border border-outline-variant/15">
            <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary-container"></div>
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold">
                    Utilization
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                    On Track
                  </span>
                </div>
                <span className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1 font-bold">
                  {spentRatio}%
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary-container">
                <span className="material-symbols-outlined text-[22px]">speed</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-md mt-space-sm border-t border-outline-variant/10">
              <span className="font-caption text-caption text-error truncate max-w-[210px] flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">warning</span> Decor at 88% allocation
              </span>
            </div>
          </div>
        </div>

        {/* 3. Main Analytical Grid (Left 7 cols, Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* LEFT COLUMN (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* A. Spending Breakdown Donut Card */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Spending Breakdown</h2>
                  <p className="font-caption text-caption text-on-surface-variant text-xs">
                    Categorical distribution across active milestones
                  </p>
                </div>
                <div className="flex items-center p-1 bg-surface-container-low rounded-lg text-label-sm font-label-sm">
                  {(["All Time", "This Month", "Last 30 Days"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setTimeFilter(filter)}
                      className={`px-3 py-1 rounded transition-colors ${
                        timeFilter === filter
                          ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-around gap-space-lg py-2">
                {/* Donut SVG Chart */}
                <div className="relative w-56 h-56 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" fill="none" r="62" stroke="#f1f3ff" strokeWidth="18"></circle>
                    <circle
                      className="transition-all duration-700 hover:opacity-90"
                      cx="80"
                      cy="80"
                      fill="none"
                      r="62"
                      stroke="#17233B"
                      strokeDasharray="182.6 389.5"
                      strokeDashoffset="0"
                      strokeWidth="18"
                    ></circle>
                    <circle
                      className="transition-all duration-700 hover:opacity-90"
                      cx="80"
                      cy="80"
                      fill="none"
                      r="62"
                      stroke="#D6A85F"
                      strokeDasharray="102 389.5"
                      strokeDashoffset="-182.6"
                      strokeWidth="18"
                    ></circle>
                    <circle
                      className="transition-all duration-700 hover:opacity-90"
                      cx="80"
                      cy="80"
                      fill="none"
                      r="62"
                      stroke="#7357DB"
                      strokeDasharray="64.6 389.5"
                      strokeDashoffset="-284.6"
                      strokeWidth="18"
                    ></circle>
                    <circle
                      className="transition-all duration-700 hover:opacity-90"
                      cx="80"
                      cy="80"
                      fill="none"
                      r="62"
                      stroke="#3867B2"
                      strokeDasharray="40.3 389.5"
                      strokeDashoffset="-349.2"
                      strokeWidth="18"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-medium text-[10px]">
                      Total Spent
                    </span>
                    <span className="font-title-md text-title-md text-primary font-bold tracking-tight">
                      ₹{currentTotalSpent.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] font-semibold text-secondary mt-0.5">{spentRatio}% Committed</span>
                  </div>
                </div>

                {/* Donut Legend Grid */}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                      <span className="font-body-md text-body-md text-on-surface font-medium text-xs">
                        Venue &amp; Grounds
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-body-md-medium text-body-md-medium text-primary font-bold text-xs">₹68,000</span>
                      <span className="font-caption text-caption text-on-surface-variant block text-[10px]">46.9%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#D6A85F]"></span>
                      <span className="font-body-md text-body-md text-on-surface font-medium text-xs">
                        Catering &amp; Bar
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-body-md-medium text-body-md-medium text-primary font-bold text-xs">₹38,000</span>
                      <span className="font-caption text-caption text-on-surface-variant block text-[10px]">26.2%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#7357DB]"></span>
                      <span className="font-body-md text-body-md text-on-surface font-medium text-xs">
                        Decoration &amp; Floral
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-body-md-medium text-body-md-medium text-primary font-bold text-xs">₹24,000</span>
                      <span className="font-caption text-caption text-on-surface-variant block text-[10px]">16.6%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#3867B2]"></span>
                      <span className="font-body-md text-body-md text-on-surface font-medium text-xs">
                        Photography &amp; Media
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-body-md-medium text-body-md-medium text-primary font-bold text-xs">₹15,000</span>
                      <span className="font-caption text-caption text-on-surface-variant block text-[10px]">10.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* B. Category Budget Allocation Card */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                    Budget Allocation by Category
                  </h2>
                  <p className="font-caption text-caption text-on-surface-variant text-xs">
                    Allocated targets versus real-time expenditure
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Adjust target allocations in event settings")}
                  className="font-label-md text-label-md text-secondary hover:text-on-secondary-fixed-variant transition-colors flex items-center gap-1 font-semibold text-xs"
                >
                  <span>Adjust Allocations</span>
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                </button>
              </div>

              <div className="flex flex-col gap-space-md pt-2">
                {[
                  {
                    name: "Venue & Facilities",
                    budget: 95000,
                    spent: 68000,
                    pct: 71.6,
                    color: "bg-primary-container",
                    icon: "location_city"
                  },
                  {
                    name: "Catering & Feasts",
                    budget: 65000,
                    spent: 38000,
                    pct: 58.5,
                    color: "bg-secondary",
                    icon: "restaurant"
                  },
                  {
                    name: "Decoration & Styling",
                    budget: 48000,
                    spent: 24000,
                    pct: 50.0,
                    color: "bg-[#7357DB]",
                    icon: "palette"
                  },
                  {
                    name: "Photography & Media",
                    budget: 20000,
                    spent: 15000,
                    pct: 75.0,
                    color: "bg-[#3867B2]",
                    icon: "photo_camera"
                  },
                  {
                    name: "Other & Contingency Reserve",
                    budget: 12000,
                    spent: 0,
                    pct: 0,
                    color: "bg-outline-variant",
                    icon: "shield"
                  }
                ].map((cat) => (
                  <div
                    key={cat.name}
                    className="flex flex-col gap-2 p-3 rounded-lg hover:bg-surface-container-low transition-colors border border-outline-variant/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                        </div>
                        <div>
                          <span className="font-body-md-medium text-body-md-medium text-primary block leading-snug font-bold text-xs">
                            {cat.name}
                          </span>
                          <span className="font-caption text-caption text-on-surface-variant text-[11px]">
                            ₹{cat.budget.toLocaleString("en-IN")} budget • ₹
                            {Math.max(0, cat.budget - cat.spent).toLocaleString("en-IN")} remaining
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-body-md-medium text-body-md-medium text-primary font-bold text-xs">
                            ₹{cat.spent.toLocaleString("en-IN")}
                          </span>
                          <span className="font-caption text-caption text-on-surface-variant block text-[11px]">
                            {cat.pct}% used
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* C. Planora AI Budget Insights Card */}
            <div className="bg-gradient-to-br from-tertiary-fixed/30 via-surface-container-lowest to-surface-container-low p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/15">
              <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-container flex items-center justify-center text-secondary-fixed">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                  </div>
                  <div>
                    <span className="font-headline-sm text-headline-sm text-primary leading-tight block font-bold text-sm sm:text-base">
                      Planora AI Insights
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant text-[11px]">
                      Autonomous budget auditing
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-caption text-caption uppercase tracking-wider flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7357DB] animate-pulse"></span>
                  Real-Time
                </span>
              </div>

              {/* Insights Stack */}
              <div className="flex flex-col gap-3 py-2">
                {/* Insight 1 */}
                <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1.5 border border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[14px]">savings</span>
                    </span>
                    <span className="font-label-md text-label-md text-primary font-bold text-xs">Cost-Saving Synergy</span>
                    <span className="ml-auto font-caption text-caption text-secondary font-bold text-xs">Save ₹14,500</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-xs">
                    <strong>Venue &amp; Lighting Bundle:</strong> Bundling in-house lighting rather than external rental
                    can save approx <span className="text-primary font-semibold">₹14,500</span>.
                  </p>
                </div>

                {/* Insight 2 */}
                <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1.5 border border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-error-container flex items-center justify-center text-error">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    </span>
                    <span className="font-label-md text-label-md text-primary font-bold text-xs">Allocation Warning</span>
                    <span className="ml-auto font-caption text-caption text-error font-semibold text-xs">+18% vs Est.</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-xs">
                    <strong>Decoration Threshold Alert:</strong> Floral quotes are tracking 18% higher. Consider seasonal
                    greens to retain lush aesthetics within quota.
                  </p>
                </div>

                {/* Insight 3 */}
                <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1.5 border border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary-container">
                      <span className="material-symbols-outlined text-[14px]">event_repeat</span>
                    </span>
                    <span className="font-label-md text-label-md text-primary font-bold text-xs">Cash Flow Forecast</span>
                    <span className="ml-auto font-caption text-caption text-on-surface-variant text-[11px]">Next 14 Days</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-xs">
                    <strong>Upcoming Payout Milestone:</strong>{" "}
                    <span className="text-primary font-semibold">₹32,000</span> scheduled in vendor balance payments.
                  </p>
                </div>
              </div>

              <div className="pt-space-sm">
                <Link
                  to="/ai-ideas"
                  className="w-full py-2.5 px-4 rounded-lg bg-tertiary-container text-on-tertiary font-label-md text-label-md flex items-center justify-center gap-2 hover:opacity-95 transition-opacity font-semibold text-xs"
                >
                  <span>Explore AI Ideas Studio</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* D. Cash Flow & Payment Schedule Mini-Card */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-secondary">calendar_clock</span>
                  <h3 className="font-title-md text-title-md text-primary font-bold">Upcoming Milestones</h3>
                </div>
                <span className="font-caption text-caption text-on-surface-variant text-xs">Scheduled Payouts</span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-surface-container-lowest text-primary shadow-xs">
                      <span className="font-caption text-caption uppercase text-on-surface-variant leading-none text-[10px]">
                        Nov
                      </span>
                      <span className="font-body-md-medium text-body-md-medium font-bold leading-none mt-0.5">02</span>
                    </div>
                    <div>
                      <span className="font-body-md-medium text-body-md-medium text-primary block leading-tight font-semibold text-xs">
                        Catering Balance
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant text-[11px]">Royal Caterers</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-body-md-medium text-body-md-medium text-primary font-bold text-xs">₹15,000</span>
                    <span className="font-caption text-caption text-secondary block font-semibold text-[10px]">
                      Net 3 Days
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-surface-container-lowest text-primary shadow-xs">
                      <span className="font-caption text-caption uppercase text-on-surface-variant leading-none text-[10px]">
                        Nov
                      </span>
                      <span className="font-body-md-medium text-body-md-medium font-bold leading-none mt-0.5">10</span>
                    </div>
                    <div>
                      <span className="font-body-md-medium text-body-md-medium text-primary block leading-tight font-semibold text-xs">
                        Photography Milestone
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant text-[11px]">Candid Lenses</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-body-md-medium text-body-md-medium text-primary font-bold text-xs">₹7,500</span>
                    <span className="font-caption text-caption text-on-surface-variant block text-[10px]">Pending Proofs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-surface-container-lowest text-primary shadow-xs">
                      <span className="font-caption text-caption uppercase text-on-surface-variant leading-none text-[10px]">
                        Nov
                      </span>
                      <span className="font-body-md-medium text-body-md-medium font-bold leading-none mt-0.5">16</span>
                    </div>
                    <div>
                      <span className="font-body-md-medium text-body-md-medium text-primary block leading-tight font-semibold text-xs">
                        Sound Rigging Final
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant text-[11px]">Acoustic Aura</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-body-md-medium text-body-md-medium text-primary font-bold text-xs">₹9,500</span>
                    <span className="font-caption text-caption text-on-surface-variant block text-[10px]">On Setup</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Expense Transactions Ledger Section (Full Width Table) */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Recent Expenses</h2>
              <p className="font-caption text-caption text-on-surface-variant text-xs">
                All logged transactions across events
              </p>
            </div>
            <span className="font-label-md text-label-md text-secondary font-semibold text-xs">
              Showing {filteredTransactions.length} of {expenses.length} expenses
            </span>
          </div>

          {/* Controls Toolbar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-sm pt-space-xs">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container transition-colors text-xs"
                placeholder="Search expenses by vendor or note..."
                type="text"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none text-xs"
              >
                <option value="all">All Categories</option>
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="Decoration">Decoration</option>
                <option value="Photography">Photography</option>
                <option value="Logistics">Logistics</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-space-lg px-space-lg">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-caption text-caption uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 rounded-l-lg">Expense Item</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 text-body-md font-body-md">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3.5 px-4 font-body-md-medium text-primary">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[16px]">{tx.icon}</span>
                        </div>
                        <span className="font-semibold text-xs truncate max-w-[200px]">{tx.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface text-xs truncate max-w-[180px]">{tx.event}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-caption text-caption text-[11px] font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant text-xs">{tx.date}</td>
                    <td className="py-3.5 px-4 font-body-md-medium text-primary font-bold text-xs">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1 w-fit text-[11px] ${
                          tx.status === "Paid"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === "Paid" ? "bg-emerald-600" : "bg-amber-600"
                          }`}
                        ></span>{" "}
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Expense details for ${tx.name}`)}
                        className="w-8 h-8 rounded hover:bg-surface-container text-on-surface-variant flex items-center justify-center ml-auto"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Add Expense Slide-Over Modal / Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setDrawerOpen(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-surface-container-lowest z-50 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-outline-variant/20">
            {/* Drawer Header */}
            <div className="p-space-lg bg-surface-container-lowest sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant/15">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-secondary-fixed">
                  <span className="material-symbols-outlined text-[20px]">add_card</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Record New Expense</h3>
                  <span className="font-caption text-caption text-on-surface-variant text-xs">
                    Log an outlay against your event quotas
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddExpense} id="record-expense-form" className="p-space-lg flex flex-col gap-space-md">
              {/* Expense Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-primary font-semibold text-xs">
                  Expense Name <span className="text-error">*</span>
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-11 px-3.5 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  placeholder="e.g. Wedding Mandap Decor Advance"
                  required
                  type="text"
                />
              </div>

              {/* Event Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-primary font-semibold text-xs">
                  Select Event <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formEvent}
                    onChange={(e) => setFormEvent(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary appearance-none text-xs"
                  >
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.name}>
                        {evt.name} ({evt.date})
                      </option>
                    ))}
                    {events.length === 0 && (
                      <>
                        <option>Aarav &amp; Priya Wedding (Nov 2026)</option>
                        <option>TechFest 2026 (Dec 2026)</option>
                        <option>Birthday Celebration (Oct 2026)</option>
                      </>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary font-semibold text-xs">
                    Category <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ExpenseTransaction["category"])}
                      className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary appearance-none text-xs"
                    >
                      <option value="Venue">Venue &amp; Facilities</option>
                      <option value="Catering">Catering &amp; Bar</option>
                      <option value="Decoration">Decoration &amp; Floral</option>
                      <option value="Photography">Photography &amp; Media</option>
                      <option value="Logistics">Logistics &amp; AV</option>
                      <option value="Other">Other / Contingency</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary font-semibold text-xs">
                    Amount in INR <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-body-md-medium text-body-md-medium text-on-surface-variant font-bold">
                      ₹
                    </span>
                    <input
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full h-11 pl-8 pr-3.5 rounded-lg bg-surface-container-low text-body-md font-body-md text-primary font-semibold placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                      placeholder="25,000"
                      required
                      type="number"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Vendor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary font-semibold text-xs">
                    Expense Date <span className="text-error">*</span>
                  </label>
                  <input
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="h-11 px-3.5 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    type="date"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-primary font-semibold text-xs">Vendor</label>
                  <div className="relative">
                    <input
                      value={formVendor}
                      onChange={(e) => setFormVendor(e.target.value)}
                      className="w-full h-11 pl-3.5 pr-8 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                      placeholder="e.g. Royal Palace Decor"
                      type="text"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant text-[18px]">
                      storefront
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Status Segmented */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-primary font-semibold text-xs">Payment Status</label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-lg bg-surface-container-low">
                  {(["Paid", "Pending", "Scheduled"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormStatus(st)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded text-label-md font-label-md transition-colors text-xs ${
                        formStatus === st
                          ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          st === "Paid" ? "bg-emerald-600" : st === "Pending" ? "bg-amber-500" : "bg-[#7357DB]"
                        }`}
                      ></span>
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Receipt Upload Mock */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-primary font-semibold text-xs">
                  Upload Receipt Attachment
                </label>
                <div
                  onClick={() => showToast("Receipt file selector simulated")}
                  className="rounded-xl bg-surface-container-low/60 p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors border border-dashed border-outline-variant/40"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary mb-2">
                    <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                  </div>
                  <span className="font-body-md-medium text-body-md-medium text-primary text-xs font-semibold">
                    Click to upload receipt invoice
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant mt-0.5 text-[11px]">
                    PDF, PNG, JPG up to 10MB
                  </span>
                </div>
              </div>
            </form>

            {/* Drawer Footer */}
            <div className="p-space-lg bg-surface-container-lowest sticky bottom-0 z-10 flex items-center justify-end gap-space-sm border-t border-outline-variant/15">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-11 px-space-lg rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="record-expense-form"
                className="h-11 px-space-xl rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:translate-y-0.5 text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-secondary-fixed text-[18px]">check</span>
                <span>Save Expense</span>
              </button>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
