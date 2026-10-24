import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext, type EventItem } from "../context/EventContext";

export default function MyEvents() {
  const { events, setActiveEventId, isDemo } = useEventContext();
  const navigate = useNavigate();

  const isTest = isDemo;
  const displayEvents = events;

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("Date: Soonest First");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [archivedCount] = useState(0);

  // Drawer & Toast state
  const [inspectingEvent, setInspectingEvent] = useState<EventItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openDrawer = (evt: EventItem) => {
    setInspectingEvent(evt);
    setDrawerOpen(true);
    setActiveEventId(evt.id);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  // Filtered List
  const filteredEvents = displayEvents.filter((evt) => {
    if (activeTab === "Upcoming" && evt.status !== "On Track") return false;
    if (activeTab === "In Progress" && evt.status !== "Planning") return false;
    if (activeTab === "Completed" && evt.status !== "Completed") return false;
    if (selectedCategory !== "All" && evt.type !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        evt.name.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        evt.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppLayout title="My Events" subtitle="Explore, monitor and manage your comprehensive event portfolio.">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce border border-secondary-fixed/30">
          <span className="material-symbols-outlined text-secondary-fixed text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full relative">
        {/* Section 1: KPI Statistics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg mb-space-xl">
          {/* Stat 1: Total Events */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-outline-variant/15">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-surface-container-low group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-space-sm relative z-10">
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                Total Portfolio
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">event_seat</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">
                {displayEvents.length}
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">Active &amp; Historic</span>
            </div>
            <div className="mt-2 font-caption text-caption text-on-surface-variant relative z-10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              <span>Across portfolio categories</span>
            </div>
          </div>

          {/* Stat 2: Upcoming */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-outline-variant/15">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-secondary-fixed/30 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-space-sm relative z-10">
              <span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">
                Upcoming
              </span>
              <div className="w-8 h-8 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-on-secondary-fixed">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">
                {displayEvents.filter((e) => e.status === "On Track" || e.status === "Planning").length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                Scheduled
              </span>
            </div>
            <div className="mt-2 font-caption text-caption text-on-surface-variant relative z-10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-ping"></span>
              <span className="text-on-surface font-body-md-medium">
                {displayEvents[0]?.name ? `Next: ${displayEvents[0].name}` : "No events"}
              </span>
            </div>
          </div>

          {/* Stat 3: Completed */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-outline-variant/15">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-surface-container group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-space-sm relative z-10">
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                Completed
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">
                {displayEvents.filter((e) => e.status === "Completed").length}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Reconciled</span>
            </div>
            <div className="mt-2 font-caption text-caption text-on-surface-variant relative z-10 flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary text-[14px]">done_all</span>
              <span>100% vendor reconciliations</span>
            </div>
          </div>

          {/* Stat 4: Drafts */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-outline-variant/15">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-tertiary-fixed/30 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-space-sm relative z-10">
              <span className="font-caption text-caption text-tertiary uppercase tracking-wider font-semibold">
                Staged Drafts
              </span>
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">1</span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold">
                Approval Needed
              </span>
            </div>
            <div className="mt-2 font-caption text-caption text-on-surface-variant relative z-10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              <span>Ceiling budget pending</span>
            </div>
          </div>
        </div>

        {/* Section 2: Command & Filtering Toolbar */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md border border-outline-variant/15">
          {/* Filter Pills Group */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
            {[
              { id: "All", label: "All", count: isTest ? 8 : displayEvents.length },
              { id: "Upcoming", label: "Upcoming", count: isTest ? 3 : displayEvents.filter((e) => e.status === "On Track").length },
              { id: "In Progress", label: "In Progress", count: isTest ? 1 : displayEvents.filter((e) => e.status === "Planning").length },
              { id: "Completed", label: "Completed", count: isTest ? 4 : displayEvents.filter((e) => e.status === "Completed").length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-on-primary shadow-sm font-semibold"
                    : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                {tab.label} <span className="ml-1 opacity-80">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Right Controls: Search, Category, Sort, Mode */}
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-space-sm justify-between xl:justify-end">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                filter_list
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-xs"
                placeholder="Filter by city, title, tag..."
                type="text"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-low text-body-md font-body-md-medium text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm text-xs"
              >
                <option value="All">All Categories</option>
                <option value="Wedding">Weddings</option>
                <option value="Corporate">Corporate Summits</option>
                <option value="Birthday">Private Birthdays</option>
                <option value="Tech">Tech Conferences</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-low text-body-md font-body-md-medium text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm text-xs"
              >
                <option>Date: Soonest First</option>
                <option>Budget: High to Low</option>
                <option>Guest Volume</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
                swap_vert
              </span>
            </div>

            {/* Layout View Switch */}
            <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                  viewMode === "grid"
                    ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                title="Grid Layout"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("list");
                  showToast("Switched to consolidated table view");
                }}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                  viewMode === "list"
                    ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                title="List Table Layout"
              >
                <span className="material-symbols-outlined text-[18px]">view_agenda</span>
              </button>
            </div>

            {/* Archived link */}
            <button
              type="button"
              onClick={() => showToast(`Displaying ${archivedCount} archived past seasons`)}
              className="text-on-surface-variant hover:text-primary font-caption text-caption flex items-center gap-1 pl-2"
            >
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              <span className="hidden md:inline">Archived</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container font-caption text-caption font-semibold">
                {archivedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Section 3: Event Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg mb-space-xl">
          {filteredEvents.map((evt) => {
            const spentRatio = evt.budget > 0 ? Math.min(Math.round((evt.spent / evt.budget) * 100), 100) : 0;
            const taskVelocity =
              evt.totalTasks > 0 ? Math.min(Math.round((evt.tasksCompleted / evt.totalTasks) * 100), 100) : 0;

            return (
              <div
                key={evt.id}
                onClick={() => openDrawer(evt)}
                className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer border border-outline-variant/15"
              >
                {/* Image Visual */}
                <div className="relative h-52 w-full overflow-hidden bg-surface-container">
                  {evt.coverImage ? (
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={evt.coverImage}
                      alt={evt.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/40">
                      <span className="material-symbols-outlined text-[48px]">celebration</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-black/20"></div>

                  {/* Badges Floating */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption shadow-sm uppercase tracking-wider font-semibold">
                      {evt.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-caption text-caption shadow-sm flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse"></span>
                      {evt.status}
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast(`${evt.name} pinned to favorites!`);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/80 backdrop-blur text-primary flex items-center justify-center hover:bg-surface transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </button>

                  {/* Bottom Meta */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
                    <div className="flex items-center gap-1.5 font-caption text-caption">
                      <span className="material-symbols-outlined text-[16px] text-secondary-fixed">calendar_today</span>
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-caption text-caption opacity-90 truncate max-w-[50%]">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-space-lg flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors font-bold truncate">
                        {evt.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption uppercase shrink-0 font-semibold">
                        AI Active
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1 mb-4 text-xs">
                      {evt.description || "Custom planned celebration on Planora AI Studio."}
                    </p>

                    {/* Metrics Panel */}
                    <div className="bg-surface-container-low rounded-lg p-3 space-y-3 mb-4 border border-outline-variant/10">
                      <div>
                        <div className="flex items-center justify-between font-caption text-caption mb-1">
                          <span className="text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-secondary">payments</span>
                            Budget Allocated
                          </span>
                          <span className="font-body-md-medium text-body-md-medium text-primary font-semibold">
                            ₹{evt.spent.toLocaleString("en-IN")} / ₹{evt.budget.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
                          <div className="h-full bg-primary" style={{ width: `${spentRatio}%` }}></div>
                          <div className="h-full bg-secondary-fixed-dim" style={{ width: `15%` }}></div>
                        </div>
                        <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant mt-1 text-[11px]">
                          <span>{spentRatio}% spent</span>
                          <span className="text-secondary font-medium">
                            ₹{Math.max(0, evt.budget - evt.spent).toLocaleString("en-IN")} reserve left
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center justify-between font-caption text-caption mb-1">
                          <span className="text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-tertiary">task_alt</span>
                            Tasks Milestones
                          </span>
                          <span className="font-body-md-medium text-body-md-medium text-primary font-semibold">
                            {evt.tasksCompleted} of {evt.totalTasks} Done ({taskVelocity}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                          <div className="h-full bg-secondary" style={{ width: `${taskVelocity}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Guest Quorum */}
                    <div className="flex items-center justify-between text-on-surface-variant font-caption text-caption py-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
                        <span className="font-body-md-medium text-on-surface font-semibold">{evt.guestsCount} Guests</span>
                        <span className="text-secondary font-medium">({evt.confirmedGuests} RSVP Confirmed)</span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">timer</span>
                        <span>Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Strip */}
                  <div className="pt-space-md mt-space-md flex items-center justify-between border-t border-outline-variant/15">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDrawer(evt);
                      }}
                      className="h-9 px-space-md rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container flex items-center gap-2 transition-all active:translate-y-0.5 shadow-sm font-semibold"
                    >
                      <span>Inspect Event</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEventId(evt.id);
                          navigate("/budget");
                        }}
                        className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low flex items-center justify-center transition-colors"
                        title="Budget Breakdown"
                      >
                        <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEventId(evt.id);
                          navigate("/guests");
                        }}
                        className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low flex items-center justify-center transition-colors"
                        title="Guest Directory"
                      >
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast("Options: Export PDF, Duplicate, or Archive");
                        }}
                        className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low flex items-center justify-center transition-colors"
                        title="Options"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Interactive Call to Action Card: Plan a New Celebration */}
          <Link
            to="/create-event"
            className="bg-surface-container-low/70 rounded-xl p-space-xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden min-h-[460px] border border-dashed border-outline-variant/40"
          >
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-secondary-fixed/20 pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-tertiary-fixed/30 pointer-events-none"></div>

            <div className="w-16 h-16 rounded-full bg-surface-container-lowest text-tertiary flex items-center justify-center shadow-md mb-space-md group-hover:scale-110 group-hover:bg-primary group-hover:text-secondary-fixed transition-all duration-300">
              <span className="material-symbols-outlined text-[32px]">add_circle</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption uppercase tracking-wider mb-2 font-semibold">
              AI Copilot Powered
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2 font-bold">Plan a New Celebration</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mb-space-lg text-xs leading-relaxed">
              Generate custom run-of-show schedules, automated Indian currency budgets, and vendor shortlists in minutes.
            </p>
            <div className="h-11 px-space-xl rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container flex items-center gap-2 transition-all shadow-md active:translate-y-0.5 font-semibold">
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">auto_awesome</span>
              <span>+ Start Event Wizard</span>
            </div>
            <div className="mt-6 flex items-center gap-3 text-on-surface-variant font-caption text-caption">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span> Instant Budgets
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span> RSVP Portals
              </span>
            </div>
          </Link>

          {/* AI Insights & Health Overview Tile */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/15">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                  </div>
                  <div>
                    <span className="font-body-md-medium text-body-md-medium text-primary block leading-none font-bold">
                      Portfolio Intelligence
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant text-[11px]">
                      Live cross-event diagnostics
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-caption text-caption font-semibold">
                  Active
                </span>
              </div>

              <div className="space-y-3 mb-space-md">
                <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant text-xs">
                    Total Pipeline Outlay
                  </span>
                  <span className="font-title-md text-title-md text-primary font-bold">
                    ₹{displayEvents.reduce((acc, e) => acc + e.budget, 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant text-xs">
                    Combined Guest Quorum
                  </span>
                  <span className="font-title-md text-title-md text-secondary font-bold">
                    {displayEvents.reduce((acc, e) => acc + e.guestsCount, 0)} Guests
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-tertiary-fixed/20 border border-tertiary-fixed/30">
                <div className="flex items-start gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">
                    tips_and_updates
                  </span>
                  <p className="font-body-md text-body-md text-on-surface leading-snug text-xs">
                    Negotiation synergy: Udaipur decor vendor also has a Bengaluru team. Combining TechFest AV could save
                    12%.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-outline-variant/10 mt-3">
              <Link
                to="/ai-ideas"
                className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-1 font-semibold text-xs"
              >
                <span>View Synergy Report</span>
                <span className="material-symbols-outlined text-[16px]">trending_flat</span>
              </Link>
              <span className="font-caption text-caption text-on-surface-variant text-[11px]">Updated 2h ago</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: SLIDE-OVER INSPECTION DRAWER */}
        {drawerOpen && inspectingEvent && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 transition-opacity duration-300"
              onClick={closeDrawer}
            ></div>

            {/* Drawer Body */}
            <aside className="fixed top-0 right-0 h-full w-full max-w-xl bg-surface-container-lowest z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 overflow-hidden border-l border-outline-variant/20">
              {/* Header with Photo Banner */}
              <div className="relative">
                <div className="h-44 w-full overflow-hidden relative bg-surface-container">
                  {inspectingEvent.coverImage && (
                    <img
                      className="w-full h-full object-cover"
                      src={inspectingEvent.coverImage}
                      alt={inspectingEvent.name}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-lowest/80 text-primary hover:bg-surface-container-lowest flex items-center justify-center transition-colors shadow-md"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>

                  {/* Status Tag Overlay */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                      {inspectingEvent.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-caption text-caption font-semibold">
                      {inspectingEvent.status}
                    </span>
                  </div>

                  {/* Title in Banner */}
                  <div className="absolute bottom-4 left-6 right-6">
                    <h2 className="font-headline-md text-headline-md text-on-primary tracking-tight font-bold">
                      {inspectingEvent.name}
                    </h2>
                    <p className="font-body-md text-body-md text-surface-container-high opacity-90 flex items-center gap-2 mt-0.5 text-xs">
                      <span className="material-symbols-outlined text-[16px] text-secondary-fixed">place</span>
                      {inspectingEvent.location} • {inspectingEvent.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Drawer Content */}
              <div className="p-space-lg overflow-y-auto flex-1 space-y-space-lg">
                {/* Key Telemetry 3-Card Row */}
                <div className="grid grid-cols-3 gap-space-sm">
                  <div className="bg-surface-container-low rounded-lg p-3 text-center border border-outline-variant/10">
                    <span className="font-caption text-caption text-on-surface-variant block uppercase font-medium">
                      Spend Ratio
                    </span>
                    <span className="font-title-md text-title-md text-primary mt-1 block font-bold">
                      {inspectingEvent.budget > 0
                        ? `${Math.round((inspectingEvent.spent / inspectingEvent.budget) * 100)}%`
                        : "0%"}
                    </span>
                    <span className="font-caption text-caption text-secondary font-medium">
                      ₹{(inspectingEvent.spent / 100000).toFixed(2)}L / ₹{(inspectingEvent.budget / 100000).toFixed(2)}L
                    </span>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-3 text-center border border-outline-variant/10">
                    <span className="font-caption text-caption text-on-surface-variant block uppercase font-medium">
                      Tasks Done
                    </span>
                    <span className="font-title-md text-title-md text-primary mt-1 block font-bold">
                      {inspectingEvent.tasksCompleted} / {inspectingEvent.totalTasks}
                    </span>
                    <span className="font-caption text-caption text-secondary font-medium">
                      {inspectingEvent.totalTasks > 0
                        ? `${Math.round((inspectingEvent.tasksCompleted / inspectingEvent.totalTasks) * 100)}% Closed`
                        : "0%"}
                    </span>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-3 text-center border border-outline-variant/10">
                    <span className="font-caption text-caption text-on-surface-variant block uppercase font-medium">
                      RSVP Rate
                    </span>
                    <span className="font-title-md text-title-md text-primary mt-1 block font-bold">
                      {inspectingEvent.guestsCount > 0
                        ? `${Math.round((inspectingEvent.confirmedGuests / inspectingEvent.guestsCount) * 100)}%`
                        : "0%"}
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      {inspectingEvent.confirmedGuests} of {inspectingEvent.guestsCount}
                    </span>
                  </div>
                </div>

                {/* Workspace Navigation Shortcuts */}
                <div>
                  <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider block mb-2 font-semibold">
                    Workspace Sections
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveEventId(inspectingEvent.id);
                        navigate("/budget");
                      }}
                      className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-left transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-[18px]">
                          account_balance_wallet
                        </span>
                        <span className="font-body-md-medium text-body-md-medium text-on-surface font-semibold text-xs">
                          Budget
                        </span>
                      </div>
                      <span className="font-caption text-caption text-secondary font-semibold">
                        ₹{Math.max(0, inspectingEvent.budget - inspectingEvent.spent).toLocaleString("en-IN")} left
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveEventId(inspectingEvent.id);
                        navigate("/timeline");
                      }}
                      className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-left transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">checklist</span>
                        <span className="font-body-md-medium text-body-md-medium text-on-surface font-semibold text-xs">
                          Timeline
                        </span>
                      </div>
                      <span className="font-caption text-caption text-error font-semibold">Tasks</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveEventId(inspectingEvent.id);
                        navigate("/vendors");
                      }}
                      className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-left transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-[18px]">handshake</span>
                        <span className="font-body-md-medium text-body-md-medium text-on-surface font-semibold text-xs">
                          Vendors
                        </span>
                      </div>
                      <span className="font-caption text-caption text-on-surface-variant font-medium">Directory</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveEventId(inspectingEvent.id);
                        navigate("/guests");
                      }}
                      className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-left transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">group</span>
                        <span className="font-body-md-medium text-body-md-medium text-on-surface font-semibold text-xs">
                          Guests
                        </span>
                      </div>
                      <span className="font-caption text-caption text-secondary font-semibold">RSVP</span>
                    </button>
                  </div>
                </div>

                {/* Event Description */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15">
                  <h4 className="font-title-md text-sm font-semibold text-primary mb-1">Event Blueprint Description</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {inspectingEvent.description || "No custom notes recorded."}
                  </p>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-space-md border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveEventId(inspectingEvent.id);
                    navigate("/event-details");
                  }}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-container text-center shadow-sm"
                >
                  Open Full Event Studio →
                </button>
              </div>
            </aside>
          </>
        )}
      </div>
    </AppLayout>
  );
}
