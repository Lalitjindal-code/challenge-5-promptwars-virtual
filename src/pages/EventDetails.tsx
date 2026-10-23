import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";

export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { events, activeEventId, setActiveEventId, activeEvent, updateEvent, tasks, toggleTask, isDemo } = useEventContext();

  useEffect(() => {
    if (id && id !== activeEventId && events.some((e) => e.id === id)) {
      setActiveEventId(id);
    }
  }, [id, activeEventId, events, setActiveEventId]);

  const currentEvent = (id ? events.find((e) => e.id === id) : null) || activeEvent || events[0];

  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable Form State
  const [editTitle, setEditTitle] = useState(currentEvent?.name || "Aarav & Priya Wedding");
  const [editType, setEditType] = useState(currentEvent?.type || "Royal Indian Wedding");
  const [editGuestCount, setEditGuestCount] = useState(currentEvent?.guestsCount || 180);
  const [editDate, setEditDate] = useState(currentEvent?.date || "2026-12-15");
  const [editEndDate, setEditEndDate] = useState("2026-12-17");
  const [editLocation, setEditLocation] = useState(currentEvent?.location || "Lake Pichola Palace Terraces, Udaipur, Rajasthan");
  const [editBudget, setEditBudget] = useState(currentEvent?.budget || 150000);
  const [editNotes, setEditNotes] = useState(
    currentEvent?.description ||
      "A 3-day royal celebration celebrating heritage, sunset pheras on the palace terrace, and an intimate 180-guest dinner banquet under Udaipur starry skies."
  );

  // Update form state if currentEvent changes
  useEffect(() => {
    if (currentEvent) {
      setEditTitle(currentEvent.name);
      setEditType(currentEvent.type);
      setEditGuestCount(currentEvent.guestsCount || 180);
      setEditDate(currentEvent.date);
      setEditLocation(currentEvent.location);
      setEditBudget(currentEvent.budget);
      if (currentEvent.description) setEditNotes(currentEvent.description);
    }
  }, [currentEvent?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEvent) {
      updateEvent(currentEvent.id, {
        name: editTitle,
        type: editType,
        guestsCount: Number(editGuestCount),
        date: editDate,
        location: editLocation,
        budget: Number(editBudget),
        description: editNotes,
      });
    }
    setIsEditModalOpen(false);
    showToast("Event details successfully updated!");
  };

  // Resolved event values
  const eventName = currentEvent?.name || (isDemo ? "Aarav & Priya Wedding" : "My Event");
  const eventType = currentEvent?.type || "Grand Wedding";
  const eventBudget = currentEvent?.budget || (isDemo ? 150000 : 0);
  const eventSpent = currentEvent?.spent || 0;
  const eventGuests = currentEvent?.guestsCount || (isDemo ? 180 : 0);
  const eventLocation = currentEvent?.location || (isDemo ? "Lake Pichola Palace" : "Location TBD");
  const eventDate = currentEvent?.date || (isDemo ? "15 Dec 2026" : "Date TBD");
  const eventDescription =
    currentEvent?.description ||
    (isDemo
      ? "A 3-day royal celebration celebrating heritage, sunset pheras on the palace terrace, and an intimate 180-guest dinner banquet under Udaipur starry skies."
      : "No description recorded yet for this event.");

  const eventTasks = tasks.length > 0 ? tasks : [
    { id: "demo-t1", title: "Confirm Lake Palace security & jetty permit", dueDate: "23 Oct 2026", completed: false, priority: "High Priority", tag: "Due Tomorrow", assignee: "PK" },
    { id: "demo-t2", title: "Finalize Mewari royal dinner menu & dessert live stations", dueDate: "28 Oct 2026", completed: false, priority: "Medium", tag: "Scheduled", assignee: "AM" },
    { id: "demo-t3", title: "Approve Sunset Mandap sits, sitar riser & jasmine florals", dueDate: "02 Nov 2026", completed: false, priority: "Normal", tag: "Under Review", assignee: "BT" },
    { id: "demo-t4", title: "Confirm vintage car & luxury fleet for airport transfers", dueDate: "05 Nov 2026", completed: false, priority: "Medium", tag: "In Progress", assignee: "LL" },
  ];

  const completedTasks = eventTasks.filter((t) => t.completed).length;

  return (
    <AppLayout
      title={eventName}
      subtitle="Comprehensive event overview and operational hub."
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary shadow-2xl animate-fade-in text-body-md border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary-fixed text-[20px]">check_circle</span>
          <span className="font-body-md-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full pb-16">
        {/* 1. Top Contextual Header & Breadcrumb Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-body-md-medium text-body-md transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>My Events</span>
            </Link>
            <span className="text-outline-variant font-body-md">/</span>
            <span className="font-body-md-medium text-body-md text-on-surface">{eventName}</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-caption font-caption tracking-wider uppercase ml-1 font-semibold">
              {eventType}
            </span>
          </div>

          {/* Quick utility tools */}
          <div className="flex items-center gap-2 self-end md:self-auto relative">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast("Event share link copied to clipboard!");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container text-body-md-medium font-body-md-medium transition-colors shadow-sm border border-outline-variant/15"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => showToast("Exporting official Run-of-Show dossier (PDF)...")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container text-body-md-medium font-body-md-medium transition-colors shadow-sm border border-outline-variant/15"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Run-of-Show</span>
            </button>

            {/* Event actions dropdown */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/15"
                title="More options"
              >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest shadow-xl z-30 p-1.5 flex flex-col gap-1 border border-outline-variant/20 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      setIsEditModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md font-body-md hover:bg-surface-container text-on-surface text-left w-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    <span>Edit Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      showToast("Event duplicated as draft clone.");
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md font-body-md hover:bg-surface-container text-on-surface text-left w-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    <span>Duplicate Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      showToast("Exporting complete event executive dossier...");
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md font-body-md hover:bg-surface-container text-on-surface text-left w-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">description</span>
                    <span>Export Event Dossier</span>
                  </button>
                  <div className="h-[1px] bg-outline-variant/30 my-1"></div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      showToast("Event archived to storage.");
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md font-body-md hover:bg-surface-container text-on-surface text-left w-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">archive</span>
                    <span>Archive Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      showToast("Event marked for deletion.");
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md font-body-md hover:bg-error-container text-error text-left w-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    <span>Delete Event</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Hero Section with Backdrop and Key Meta */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-md mb-8 border border-outline-variant/15">
          <div
            className="relative w-full min-h-[380px] bg-cover bg-center flex flex-col justify-end p-6 md:p-10"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDepTf9KxZFpyfDHi9yxy31MxZZjnx-9IenHoiDoWiH5AEUBqRBCazaB9W3UehSAiDuVrzGrH82AYwqFk2jNQ3KoLNoeBJ-RiqFRf4MUPael-SjiA27qsi_JWFyUDN70djVppd7-rI9FWJV4bCRcjWIafBr5-nOcVC7BPJ7_A_NDAlvIjNXwA-4KLQysJ0BfWYxyHpwRpppjcOAMmfh1Q0CHsQ94AmZWUMX6iINt55iEdDYudZKICI_1w')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20"></div>

            {/* Live badge cluster */}
            <div className="relative z-10 flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption uppercase tracking-wider font-semibold shadow-sm">
                {eventType}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-caption text-caption uppercase tracking-wider font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                In Progress • Final Stage
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption tracking-wider uppercase font-semibold shadow-sm">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                AI Copilot Active
              </span>
            </div>

            {/* Main Headline & Description */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="font-headline-xl text-headline-xl text-on-primary tracking-tight font-bold mb-3 drop-shadow-sm">
                  {eventName}
                </h1>
                <p className="font-body-lg text-body-lg text-primary-fixed-dim/90 max-w-2xl leading-relaxed mb-6">
                  {eventDescription}
                </p>

                {/* Core metadata pill list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-container-lowest/15 backdrop-blur-md text-on-primary">
                    <span className="material-symbols-outlined text-secondary-fixed text-[20px]">calendar_today</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-caption text-caption uppercase tracking-wider text-primary-fixed-dim">Date</span>
                      <span className="font-body-md-medium text-body-md-medium truncate">{eventDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-container-lowest/15 backdrop-blur-md text-on-primary">
                    <span className="material-symbols-outlined text-secondary-fixed text-[20px]">location_on</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-caption text-caption uppercase tracking-wider text-primary-fixed-dim">Venue</span>
                      <span className="font-body-md-medium text-body-md-medium truncate">{eventLocation}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-container-lowest/15 backdrop-blur-md text-on-primary">
                    <span className="material-symbols-outlined text-secondary-fixed text-[20px]">groups</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-caption text-caption uppercase tracking-wider text-primary-fixed-dim">Guest Target</span>
                      <span className="font-body-md-medium text-body-md-medium truncate">{eventGuests} Guests (14 Tables)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-container-lowest/15 backdrop-blur-md text-on-primary">
                    <span className="material-symbols-outlined text-secondary-fixed text-[20px]">payments</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-caption text-caption uppercase tracking-wider text-primary-fixed-dim">Budget</span>
                      <span className="font-body-md-medium text-body-md-medium truncate">₹{eventBudget.toLocaleString()} Total</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Action Group */}
              <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <div className="px-3.5 py-2 rounded-xl bg-surface-container-lowest/20 backdrop-blur-md text-on-primary text-center">
                  <span className="font-caption text-caption uppercase tracking-wider block text-secondary-fixed">Countdown</span>
                  <span className="font-title-md text-title-md font-bold">⏳ 58 Days to Go</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="h-12 px-5 rounded-xl bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md flex items-center gap-2 hover:bg-secondary-fixed-dim active:translate-y-0.5 transition-all shadow-md font-semibold"
                >
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  <span>Edit Event</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Scoped Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("Overview")}
            className={`px-5 py-2.5 rounded-full font-body-md-medium text-body-md whitespace-nowrap flex items-center gap-2 transition-all shadow-sm ${
              activeTab === "Overview"
                ? "bg-primary text-on-primary"
                : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-primary border border-outline-variant/15"
            }`}
          >
            <span>Overview</span>
            {activeTab === "Overview" && <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>}
          </button>

          <button
            type="button"
            onClick={() => navigate("/timeline")}
            className="px-5 py-2.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-primary font-body-md-medium text-body-md transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm border border-outline-variant/15"
          >
            <span>Timeline &amp; Tasks</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-caption font-caption">
              {completedTasks || 18}/{eventTasks.length || 22}
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/budget")}
            className="px-5 py-2.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-primary font-body-md-medium text-body-md transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm border border-outline-variant/15"
          >
            <span>Budget</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-caption font-caption">
              ₹{(eventSpent / 100000).toFixed(1)}L / ₹{(eventBudget / 100000).toFixed(1)}L
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/vendors")}
            className="px-5 py-2.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-primary font-body-md-medium text-body-md transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm border border-outline-variant/15"
          >
            <span>Vendors</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-container text-caption font-caption">
              6 Booked
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/guests")}
            className="px-5 py-2.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-primary font-body-md-medium text-body-md transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm border border-outline-variant/15"
          >
            <span>Guests &amp; RSVPs</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-caption font-caption">
              124 Confirmed
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/ai-ideas")}
            className="px-5 py-2.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim font-body-md-medium text-body-md transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span>AI Ideas Studio</span>
            <span className="px-1.5 py-0.5 rounded-full bg-tertiary text-on-tertiary text-caption font-caption">
              3 Saved
            </span>
          </button>
        </div>

        {/* 4. Key Performance Overview Metric Cards (4 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Metric 1: Tasks */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/15">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">Checklist Progress</span>
                <span className="font-headline-md text-headline-md text-primary font-bold mt-1">
                  18 <span className="font-title-md text-title-md font-normal text-on-surface-variant">/ 22</span>
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">checklist</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-2.5">
                <div className="bg-primary h-full rounded-full" style={{ width: "81.8%" }}></div>
              </div>
              <div className="flex items-center justify-between text-caption font-caption">
                <span className="text-primary font-body-md-medium">81.8% Done</span>
                <span className="text-error font-body-md-medium">4 pending high priority</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Budget Spent */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/15">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">Budget Utilized</span>
                <span className="font-headline-md text-headline-md text-primary font-bold mt-1">
                  ₹{eventSpent.toLocaleString()}
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-2.5">
                <div className="bg-secondary-fixed-dim h-full rounded-full" style={{ width: "80%" }}></div>
              </div>
              <div className="flex items-center justify-between text-caption font-caption">
                <span className="text-on-surface-variant">80% of ₹1.5L</span>
                <span className="text-secondary font-body-md-medium">₹30,000 reserve</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Guests Confirmed */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/15">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">RSVP Responses</span>
                <span className="font-headline-md text-headline-md text-primary font-bold mt-1">
                  124 <span className="font-title-md text-title-md font-normal text-on-surface-variant">/ {eventGuests}</span>
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-2.5">
                <div className="bg-tertiary-fixed-dim h-full rounded-full" style={{ width: "68.9%" }}></div>
              </div>
              <div className="flex items-center justify-between text-caption font-caption">
                <span className="text-on-surface-variant">68.9% attending</span>
                <span className="text-primary font-body-md-medium">+12 this week</span>
              </div>
            </div>
          </div>

          {/* Metric 4: Vendors Booked */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/15">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">Vendors Secured</span>
                <span className="font-headline-md text-headline-md text-primary font-bold mt-1">6 Booked</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">storefront</span>
              </div>
            </div>
            <div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-2.5">
                <div className="bg-primary-container h-full rounded-full" style={{ width: "100%" }}></div>
              </div>
              <div className="flex items-center justify-between text-caption font-caption">
                <span className="text-on-surface-variant">100% contracts signed</span>
                <span className="text-on-surface-variant font-body-md-medium">2 pending tasting</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Main Two-Column Architectural Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN (7 Cols): Upcoming Tasks & Run-of-Show */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Card A: Upcoming Tasks */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 bg-surface-container-low/50 -mx-6 md:-mx-8 -mt-6 md:-mt-8 p-6 md:p-8 rounded-t-2xl border-b border-outline-variant/15">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">Upcoming Tasks</h2>
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption font-semibold">
                      4 Critical
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    High-velocity items requiring confirmation before next vendor review.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/timeline")}
                    className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container text-body-md-medium font-body-md-medium flex items-center gap-1.5 transition-colors shadow-sm border border-outline-variant/15"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Task</span>
                  </button>
                  <Link
                    to="/timeline"
                    className="px-3 py-1.5 rounded-lg text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>View All</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Task List Items */}
              <div className="flex flex-col gap-3.5">
                {eventTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low/40 hover:bg-surface-container-low transition-colors group border border-outline-variant/10"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          toggleTask(task.id);
                          showToast(`Task status toggled: "${task.title}"`);
                        }}
                        className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`font-body-md-medium text-body-md-medium transition-colors truncate ${
                            task.completed ? "line-through text-on-surface-variant" : "text-primary group-hover:text-secondary"
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded font-caption text-caption uppercase font-medium ${
                              (task as any).tag === "Due Tomorrow" ? "bg-error-container text-on-error-container" : "bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            {(task as any).tag || "Scheduled"}
                          </span>
                          <span className="text-caption font-caption text-on-surface-variant">• {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption">
                        {task.priority}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-caption text-caption flex items-center justify-center font-bold">
                        {(task as any).assignee || "AM"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card B: Run-of-Show / Day-of Schedule */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-outline-variant/15">
                <div className="flex flex-col">
                  <span className="font-caption text-caption uppercase tracking-wider text-secondary font-semibold">
                    Dec 15, 2026 • Main Event
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">Event Schedule (Run-of-Show)</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    showToast("Triggering call sheet print formatting...");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high text-body-md font-body-md-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Print Call Sheet</span>
                </button>
              </div>

              {/* Vertical Timeline */}
              <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
                {/* Node 1 */}
                <div className="relative flex items-start gap-4">
                  <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm border border-outline-variant/20">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary"></div>
                  </div>
                  <div className="flex-1 bg-surface-container-low/40 p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/10">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="font-title-md text-title-md font-semibold text-primary">
                        05:00 PM — Guest Arrival &amp; Royal Welcome
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                        Palace Jetty • Courtyard
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Speedboat drop-off at palace steps. Traditional Manganiyar musicians, rose petal welcome shower, and chilled saffron-infused thandai service.
                    </p>
                  </div>
                </div>

                {/* Node 2 */}
                <div className="relative flex items-start gap-4">
                  <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm border border-outline-variant/20">
                    <div className="w-3.5 h-3.5 rounded-full bg-secondary"></div>
                  </div>
                  <div className="flex-1 bg-surface-container-low/40 p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/10">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="font-title-md text-title-md font-semibold text-primary">
                        05:45 PM — High-Tea &amp; Sangeet Prelude
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">
                        Lake Veranda
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Boutique dessert cart, artisan chai counter, and acoustic sarangi melodies as golden hour sets over the Aravali hills.
                    </p>
                  </div>
                </div>

                {/* Node 3 */}
                <div className="relative flex items-start gap-4">
                  <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm border border-outline-variant/20">
                    <div className="w-3.5 h-3.5 rounded-full bg-tertiary"></div>
                  </div>
                  <div className="flex-1 bg-surface-container-low/40 p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/10">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="font-title-md text-title-md font-semibold text-primary">
                        06:45 PM — Sunset Pheras &amp; Holy Nuptials
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold">
                        Sunset Mandap Terrace
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Sacred Vedic chants by royal priests, synchronized floral fireworks across the lake, and exchange of varmalas.
                    </p>
                  </div>
                </div>

                {/* Node 4 */}
                <div className="relative flex items-start gap-4">
                  <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm border border-outline-variant/20">
                    <div className="w-3.5 h-3.5 rounded-full bg-outline-variant"></div>
                  </div>
                  <div className="flex-1 bg-surface-container-low/40 p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/10">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="font-title-md text-title-md font-semibold text-primary">
                        08:15 PM — Gala Dinner Banquet &amp; Musical Toast
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary font-caption text-caption font-semibold">
                        Grand Ballroom Terraces
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Multi-course Mewari royal feast, dessert pavilion, speeches by family elders, and evening jazz orchestra performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 Cols): Fiscal, Guests, Vendors & AI Copilot Insights */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Card C: Budget Snapshot */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">Fiscal Health</span>
                  <h3 className="font-title-md text-title-md font-semibold text-primary">Budget Snapshot</h3>
                </div>
                <Link to="/budget" className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-1">
                  <span>Open Manager</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low mb-6 border border-outline-variant/10">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-headline-md text-headline-md text-primary font-bold">
                    ₹{eventSpent.toLocaleString()}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant font-medium">
                    of ₹{eventBudget.toLocaleString()} Target
                  </span>
                </div>
                {/* Multi-segmented budget bar */}
                <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden flex mb-2">
                  <div className="bg-primary h-full" style={{ width: "36.7%" }} title="Venue: 36.7%"></div>
                  <div className="bg-secondary-fixed-dim h-full" style={{ width: "28.0%" }} title="Catering: 28.0%"></div>
                  <div className="bg-tertiary-fixed-dim h-full" style={{ width: "10.0%" }} title="Decoration: 10.0%"></div>
                  <div className="bg-outline h-full" style={{ width: "5.3%" }} title="Photography: 5.3%"></div>
                </div>
                <span className="font-caption text-caption text-emerald-700 font-medium">
                  ₹{(eventBudget - eventSpent).toLocaleString()} unallocated buffer remaining
                </span>
              </div>

              {/* Budget legend breakdown */}
              <div className="space-y-3 font-body-md text-body-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-on-surface">Venue &amp; Palace Royalties</span>
                  </div>
                  <span className="font-body-md-medium text-body-md-medium text-primary">
                    ₹55,000 <span className="text-caption text-on-surface-variant font-normal">(36.7%)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary-fixed-dim"></span>
                    <span className="text-on-surface">Catering &amp; Beverage Cellar</span>
                  </div>
                  <span className="font-body-md-medium text-body-md-medium text-primary">
                    ₹42,000 <span className="text-caption text-on-surface-variant font-normal">(28.0%)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></span>
                    <span className="text-on-surface">Floral, Mandap &amp; Lighting</span>
                  </div>
                  <span className="font-body-md-medium text-body-md-medium text-primary">
                    ₹15,000 <span className="text-caption text-on-surface-variant font-normal">(10.0%)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-outline"></span>
                    <span className="text-on-surface">Cinematography &amp; AV</span>
                  </div>
                  <span className="font-body-md-medium text-body-md-medium text-primary">
                    ₹8,000 <span className="text-caption text-on-surface-variant font-normal">(5.3%)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card D: Guests & RSVP Health */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">Guest Quorum</span>
                  <h3 className="font-title-md text-title-md font-semibold text-primary">RSVP Health</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-caption text-caption font-semibold">
                  {eventGuests} Sent
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                  <span className="font-title-md text-title-md font-bold text-emerald-700 block">124</span>
                  <span className="font-caption text-caption text-on-surface-variant">Confirmed</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                  <span className="font-title-md text-title-md font-bold text-amber-600 block">38</span>
                  <span className="font-caption text-caption text-on-surface-variant">Pending</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                  <span className="font-title-md text-title-md font-bold text-on-surface-variant block">18</span>
                  <span className="font-caption text-caption text-on-surface-variant">Declined</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-tertiary-fixed/30 flex items-center justify-between mb-4 border border-outline-variant/10">
                <div className="flex items-center gap-2.5 text-on-tertiary-fixed">
                  <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                  <span className="font-body-md-medium text-body-md-medium">8 automated WhatsApp reminders queued</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Dispatched 8 WhatsApp RSVP gentle nudge reminders!")}
                  className="text-caption font-caption uppercase font-semibold text-primary hover:underline"
                >
                  Trigger
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/guests")}
                className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-body-md-medium text-body-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Manage Guests &amp; Seating Chart</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Card E: Booked Vendors (6 Confirmed) */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-title-md text-title-md font-semibold text-primary">Contracted Vendors (6)</h3>
                <Link to="/vendors" className="font-label-md text-label-md text-secondary hover:underline">
                  Directory →
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">
                      <span className="material-symbols-outlined text-[20px]">castle</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md-medium text-body-md-medium text-primary">Royal Palace Events</span>
                      <span className="font-caption text-caption text-on-surface-variant">Venue • ★ 4.9 (120 reviews)</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-caption text-caption font-semibold">
                    Advance Paid
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-fixed/40 flex items-center justify-center text-secondary font-bold">
                      <span className="material-symbols-outlined text-[20px]">restaurant</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md-medium text-body-md-medium text-primary">FlavourCraft Heritage Catering</span>
                      <span className="font-caption text-caption text-on-surface-variant">Culinary • ★ 4.8 (85 reviews)</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                    Menu Locked
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold">
                      <span className="material-symbols-outlined text-[20px]">local_florist</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md-medium text-body-md-medium text-primary">Bloom Theory Decor</span>
                      <span className="font-caption text-caption text-on-surface-variant">Florals &amp; Mandap • ★ 4.7</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">
                    Mockup Ok
                  </span>
                </div>
              </div>
            </div>

            {/* Card F: Planora AI Event Insights */}
            <div className="p-6 md:p-8 rounded-2xl bg-tertiary-fixed/20 shadow-sm relative overflow-hidden border border-outline-variant/15">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  </span>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption uppercase tracking-wider text-on-tertiary-fixed-variant font-bold">
                      AI Copilot Advisory
                    </span>
                    <h3 className="font-title-md text-title-md font-semibold text-primary">Intelligent Suggestions</h3>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-caption font-caption font-semibold">
                  3 New
                </span>
              </div>

              <div className="space-y-3.5 mb-6">
                <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant/10">
                  <div className="flex items-center gap-2 text-secondary font-body-md-medium text-body-md mb-1">
                    <span className="material-symbols-outlined text-[18px]">savings</span>
                    <span>Bundle AV &amp; Palace Fairy Lights</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Combine Udaipur Soundworks AV package with the reception lighting rig for a bundled 12% discount. Projected saving:{" "}
                    <strong className="text-primary">₹7,500</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant/10">
                  <div className="flex items-center gap-2 text-primary font-body-md-medium text-body-md mb-1">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span>Lake Curfew Optimization</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Udaipur lakeside acoustic sound restrictions trigger at 10:00 PM. Shift the high-energy Sangeet segment 30 minutes earlier to prevent overtime levies.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant/10">
                  <div className="flex items-center gap-2 text-tertiary font-body-md-medium text-body-md mb-1">
                    <span className="material-symbols-outlined text-[18px]">brush</span>
                    <span>Heritage Decor Accent</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Place 24 handcrafted brass urli bowls with floating marigolds and camphor candles at the palace jetty arrival dock for heightened guest photography.
                  </p>
                </div>
              </div>

              <Link
                to="/ai-ideas"
                className="w-full py-2.5 rounded-xl bg-tertiary text-on-tertiary hover:bg-tertiary/90 font-label-md text-label-md flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                <span>Explore AI Ideas Studio</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 6. Slide-Over / Modal: 'Edit Event Details' */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-primary/40 backdrop-blur-sm transition-opacity flex justify-end animate-fade-in">
            <div className="w-screen max-w-xl bg-surface-container-lowest shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-outline-variant/20">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary text-secondary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">Edit Event Details</h3>
                    <p className="font-caption text-caption text-on-surface-variant">Update core logistics and metadata</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveEdit} className="p-6 md:p-8 flex flex-col gap-5 flex-1">
                <div>
                  <label className="block font-label-md text-label-md text-primary mb-1.5" htmlFor="event-title">
                    Event Title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all outline-none border border-outline-variant/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md text-primary mb-1.5" htmlFor="event-type">
                      Event Type
                    </label>
                    <select
                      id="event-type"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all outline-none border border-outline-variant/20"
                    >
                      <option>Royal Indian Wedding</option>
                      <option>Reception &amp; Sangeet</option>
                      <option>Destination Celebration</option>
                      <option>Anniversary Gala</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-primary mb-1.5" htmlFor="guest-count">
                      Expected Guests
                    </label>
                    <input
                      id="guest-count"
                      type="number"
                      value={editGuestCount}
                      onChange={(e) => setEditGuestCount(Number(e.target.value))}
                      className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all outline-none border border-outline-variant/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-label-md text-primary mb-1.5" htmlFor="start-date">
                      Start Date
                    </label>
                    <input
                      id="start-date"
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all outline-none border border-outline-variant/20"
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-primary mb-1.5" htmlFor="end-date">
                      End Date
                    </label>
                    <input
                      id="end-date"
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all outline-none border border-outline-variant/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-primary mb-1.5" htmlFor="event-location">
                    Venue / Location
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">location_on</span>
                    <input
                      id="event-location"
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all outline-none border border-outline-variant/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-primary mb-1.5" htmlFor="planned-budget">
                    Total Planned Budget (INR)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 font-body-md-medium text-body-md-medium text-on-surface-variant">₹</span>
                    <input
                      id="planned-budget"
                      type="number"
                      value={editBudget}
                      onChange={(e) => setEditBudget(Number(e.target.value))}
                      className="w-full h-11 pl-8 pr-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all outline-none border border-outline-variant/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-primary mb-1.5" htmlFor="event-desc">
                    Event Notes &amp; Concept
                  </label>
                  <textarea
                    id="event-desc"
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all outline-none leading-relaxed border border-outline-variant/20"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-primary mb-1.5">Cover Image Visual</label>
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-container-low border border-outline-variant/10">
                    <div
                      className="w-16 h-12 rounded-lg bg-cover bg-center shrink-0"
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCf_49Zpcn7ifyY6ziORzyTPrG2FigrJa_q_gaF1kjWFn2nV5j43IaOjaNNLmSIhrrxKNgEhOOqoUEk_MQhrf90zWR3YICn5SY1akaWGEsBqP8nOevq7WitlCUlOE4Fg05cNW8bY3K9IvLOga9P-2IVEu8iVyGiaOVSL0xSpn4thRPQ7JwdzxZFHLn1fYe_l-T2xIZiY-VNKCcqRENsOOD0EFn4A8sh-MZs3458JT4T3la_yPwJ6daqiw')",
                      }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <span className="font-body-md-medium text-body-md-medium text-primary block truncate">
                        pichola_sunset_terrace.jpg
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">Recommended 1920x600 high res</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast("Cover image selector opening...")}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary text-caption font-caption uppercase font-semibold hover:bg-surface-container shadow-sm border border-outline-variant/15"
                    >
                      Replace
                    </button>
                  </div>
                </div>

                {/* Modal Actions Footer */}
                <div className="pt-4 mt-2 border-t border-outline-variant/15 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-body-md-medium text-body-md transition-colors border border-outline-variant/15"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-md-medium text-body-md shadow-md transition-all active:translate-y-0.5"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
