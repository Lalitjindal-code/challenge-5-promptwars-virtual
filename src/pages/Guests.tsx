import { useState, type FormEvent } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";
import type { DetailedGuest } from "../types";

export default function Guests() {
  const { isDemo, activeEvent, guests, addGuest, updateGuest, deleteGuest } = useEventContext();
  const guestList = guests;

  // Filters & State
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cohortFilter, setCohortFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerGuest, setActiveDrawerGuest] = useState<DetailedGuest | null>(null);

  // Add Guest Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCohort, setNewCohort] = useState<"VIP" | "Family" | "Friends" | "College Team" | "Vendors">("Family");
  const [newPartySize, setNewPartySize] = useState<number>(2);
  const [newEventTarget, setNewEventTarget] = useState("Aarav & Priya Wedding");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculations
  const totalGuests = isDemo ? 180 : guestList.reduce((acc, g) => acc + g.partySize, 0);
  const confirmedCount = isDemo ? 124 : guestList.filter((g) => g.status === "Confirmed").reduce((acc, g) => acc + g.partySize, 0);
  const awaitingCount = isDemo ? 38 : guestList.filter((g) => g.status === "Awaiting Response").reduce((acc, g) => acc + g.partySize, 0);
  const declinedCount = isDemo ? 18 : guestList.filter((g) => g.status === "Declined").reduce((acc, g) => acc + g.partySize, 0);
  const respondedTotal = confirmedCount + declinedCount;
  const rsvpRate = totalGuests > 0 ? ((respondedTotal / totalGuests) * 100).toFixed(1) : "0";

  // Filtered List
  const filteredGuests = guestList.filter((g) => {
    if (statusFilter !== "all" && g.status !== statusFilter) return false;
    if (cohortFilter && g.cohort !== cohortFilter) return false;
    if (eventFilter && g.event !== eventFilter) return false;
    if (
      searchQuery &&
      !g.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !g.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !g.phone.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  // Checkbox Selection
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGuests(filteredGuests.map((g) => g.id));
    } else {
      setSelectedGuests([]);
    }
  };

  const toggleSelectGuest = (id: string) => {
    setSelectedGuests((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Open Drawer
  const openDrawer = (guest: DetailedGuest) => {
    setActiveDrawerGuest(guest);
    setIsDrawerOpen(true);
  };

  // Quick toggle status in Drawer
  const toggleDrawerRsvp = async () => {
    if (!activeDrawerGuest) return;
    const nextStatus: "Confirmed" | "Declined" | "Awaiting Response" =
      activeDrawerGuest.status === "Confirmed"
        ? "Awaiting Response"
        : activeDrawerGuest.status === "Awaiting Response"
        ? "Declined"
        : "Confirmed";

    const updated: DetailedGuest = { ...activeDrawerGuest, status: nextStatus };
    setActiveDrawerGuest(updated);
    await updateGuest(activeDrawerGuest.id, { status: nextStatus });
    showToast(`Updated RSVP status to: ${nextStatus}`);
  };

  // Save new guest
  const handleSaveNewGuest = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim()) {
      showToast("Please provide a guest name");
      return;
    }

    const fullName = `${newFirstName.trim()} ${newLastName.trim()}`.trim();
    const initials = (newFirstName[0] || "G") + (newLastName[0] || "");
    const guestData: Omit<DetailedGuest, "id" | "eventId"> = {
      name: fullName,
      avatar: initials.toUpperCase(),
      email: newEmail.trim() || `${newFirstName.toLowerCase()}@example.com`,
      phone: newPhone.trim() || "+91 98000 00000",
      cohort: newCohort,
      event: activeEvent?.name || newEventTarget,
      partySize: newPartySize,
      status: "Confirmed",
      dispatchStatus: "Delivered",
      dietary: "Vegetarian",
      table: "Table 01 — Main Hall",
      isVip: newCohort === "VIP"
    };

    await addGuest(guestData);

    setIsAddModalOpen(false);
    setNewFirstName("");
    setNewLastName("");
    setNewEmail("");
    setNewPhone("");
    showToast(`Guest ${fullName} added and invite dispatched!`);
  };

  // Remove guest
  const handleRemoveGuest = async (guestId: string) => {
    await deleteGuest(guestId);
    setIsDrawerOpen(false);
    showToast("Guest removed from celebration roster");
  };

  return (
    <AppLayout title="Guests & RSVPs" subtitle="Every guest, every invitation, all in one place.">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-xl shadow-xl animate-fade-in border border-outline-variant/20">
          <div className="w-7 h-7 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[18px]">check</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-primary font-semibold">Guest Directory Synced</span>
            <span className="font-caption text-caption text-secondary-fixed">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="ml-4 text-on-primary/60 hover:text-on-primary">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header Sub-Bar & High-Level RSVP Velocity Ribbon */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-lg border border-outline-variant/10">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg pb-space-lg border-b border-surface-container">
          <div className="flex flex-wrap items-center gap-space-md">
            <div className="relative min-w-[280px]">
              <label className="block font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-1">
                Target Event Portfolio
              </label>
              <div className="relative">
                <select
                  value={eventFilter}
                  onChange={(e) => {
                    setEventFilter(e.target.value);
                    showToast(e.target.value ? `Filtered: ${e.target.value}` : "All events selected");
                  }}
                  className="w-full h-11 pl-3 pr-10 rounded-lg bg-surface-container-low font-title-md text-title-md text-primary font-semibold appearance-none focus:outline-none cursor-pointer border-0"
                >
                  <option value="">Aarav & Priya Wedding (Selected)</option>
                  <option value="all">All Events (3 Active Portfolios)</option>
                  <option value="TechFest 2026">TechFest 2026 Executive Summit</option>
                  <option value="Birthday Celebration">Seraphina 30th Birthday Soirée</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-[20px]">
                  unfold_more
                </span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-surface-container hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden py-1">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-primary-container text-secondary-fixed text-center leading-8 font-label-sm text-label-sm font-semibold">
                  PK
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-surface-container-highest text-primary text-center leading-8 font-label-sm text-label-sm font-semibold">
                  AM
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-secondary-container text-on-secondary-container text-center leading-8 font-label-sm text-label-sm font-semibold">
                  RS
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-tertiary-fixed text-on-tertiary-fixed text-center leading-8 font-label-sm text-label-sm font-semibold">
                  +{Math.max(0, totalGuests - 3)}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">{totalGuests} Guests Registered</span>
                <span className="font-caption text-caption text-on-surface-variant">4 Cohorts • 14 VIP Tables Reserved</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              onClick={() => showToast("Exported guest roster to CSV / PDF")}
              className="h-11 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">ios_share</span>
              <span>Export (CSV/PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => showToast("Dispatched 38 WhatsApp & Email digital invites")}
              className="h-11 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">send_time_extension</span>
              <span>Batch Send Invites</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="h-11 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2 hover:bg-primary-container active:translate-y-0.5 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">person_add</span>
              <span>+ Add Guest</span>
            </button>
          </div>
        </div>

        {/* RSVP Progress Tracker Banner */}
        <div className="mt-space-md grid grid-cols-1 lg:grid-cols-12 gap-space-md items-center">
          <div className="lg:col-span-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">analytics</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">{respondedTotal}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">/ {totalGuests} Responded</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-bold">
                  {rsvpRate}% Rate
                </span>
              </div>
              <p className="font-caption text-caption text-on-surface-variant">
                Optimal velocity: {awaitingCount} RSVPs remaining to reach target quorum
              </p>
            </div>
          </div>
          <div className="lg:col-span-8 flex flex-col gap-2">
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(confirmedCount / (totalGuests || 1)) * 100}%` }}
                title={`Confirmed: ${confirmedCount}`}
              ></div>
              <div
                className="h-full bg-secondary-container transition-all duration-500"
                style={{ width: `${(awaitingCount / (totalGuests || 1)) * 100}%` }}
                title={`Awaiting: ${awaitingCount}`}
              ></div>
              <div
                className="h-full bg-error-container transition-all duration-500"
                style={{ width: `${(declinedCount / (totalGuests || 1)) * 100}%` }}
                title={`Declined: ${declinedCount}`}
              ></div>
            </div>
            <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> {confirmedCount} Confirmed (
                {totalGuests > 0 ? ((confirmedCount / totalGuests) * 100).toFixed(1) : 0}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary-container inline-block"></span> {awaitingCount} Awaiting Response (
                {totalGuests > 0 ? ((awaitingCount / totalGuests) * 100).toFixed(1) : 0}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-error inline-block"></span> {declinedCount} Declined (
                {totalGuests > 0 ? ((declinedCount / totalGuests) * 100).toFixed(1) : 0}%)
              </span>
              <span className="font-body-md-medium text-primary">Target: 85% by Friday</span>
            </div>
          </div>
        </div>
      </div>

      {/* Four Scannable KPI Summary Cards in 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
        {/* Card 1: Total Guests */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-outline-variant/10">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider block mb-1">Total Roster</span>
              <span className="font-headline-lg text-headline-lg text-primary font-bold">{totalGuests}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-on-surface-variant font-caption text-caption">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">event_seat</span> 14 VIP tables
            </span>
            <span className="font-body-md-medium text-primary">3 Active Events</span>
          </div>
        </div>

        {/* Card 2: Confirmed */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-outline-variant/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider block mb-1">Confirmed Attendees</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg text-primary font-bold">{confirmedCount}</span>
                <span className="font-caption text-caption font-semibold text-primary">
                  {totalGuests > 0 ? ((confirmedCount / totalGuests) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between font-caption text-caption">
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12 this week
            </span>
            <span className="text-on-surface-variant">108 Meals selected</span>
          </div>
        </div>

        {/* Card 3: Awaiting Response */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-outline-variant/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider block mb-1">Awaiting Response</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg text-secondary font-bold">{awaitingCount}</span>
                <span className="font-caption text-caption font-semibold text-on-surface-variant">
                  {totalGuests > 0 ? ((awaitingCount / totalGuests) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">hourglass_top</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between font-caption text-caption">
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">notification_important</span> 8 AI Follow-ups ready
            </span>
            <span className="text-on-surface-variant">14 Pending SMS</span>
          </div>
        </div>

        {/* Card 4: Declined */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-outline-variant/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-error"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider block mb-1">Declined Invites</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg text-error font-bold">{declinedCount}</span>
                <span className="font-caption text-caption font-semibold text-on-surface-variant">
                  {totalGuests > 0 ? ((declinedCount / totalGuests) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[22px]">cancel</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between font-caption text-caption">
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold flex items-center gap-1">
              4 Seats reallocatable
            </span>
            <span className="text-on-surface-variant">Waitlist: 9 guests</span>
          </div>
        </div>
      </div>

      {/* RSVP Overview & Digital Dispatch Telemetry (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-lg">
        {/* Left Card: Status Telemetry & Donut Chart */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
                <h2 className="font-title-md text-title-md text-primary font-semibold">RSVP Breakdown & Telemetry</h2>
              </div>
              <span className="font-caption text-caption text-on-surface-variant px-2.5 py-1 rounded bg-surface-container font-medium">
                Real-time sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-2">
              {/* Circular SVG Donut */}
              <div className="sm:col-span-5 flex justify-center relative">
                <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                  <circle className="text-surface-container" cx="60" cy="60" fill="none" r="48" stroke="currentColor" strokeWidth="14" />
                  <circle
                    className="text-primary"
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="currentColor"
                    strokeDasharray="207.8 301.6"
                    strokeDashoffset="0"
                    strokeWidth="14"
                  />
                  <circle
                    className="text-secondary"
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="currentColor"
                    strokeDasharray="63.6 301.6"
                    strokeDashoffset="-207.8"
                    strokeWidth="14"
                  />
                  <circle
                    className="text-error"
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="currentColor"
                    strokeDasharray="30.2 301.6"
                    strokeDashoffset="-271.4"
                    strokeWidth="14"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">{respondedTotal}</span>
                  <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Responses</span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="sm:col-span-7 flex flex-col gap-2.5 pl-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">Confirmed</span>
                  </div>
                  <div className="text-right">
                    <span className="font-body-md-medium text-body-md-medium text-primary font-bold">{confirmedCount}</span>
                    <span className="font-caption text-caption text-on-surface-variant ml-1">
                      ({totalGuests > 0 ? ((confirmedCount / totalGuests) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary"></span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">Awaiting Response</span>
                  </div>
                  <div className="text-right">
                    <span className="font-body-md-medium text-body-md-medium text-secondary font-bold">{awaitingCount}</span>
                    <span className="font-caption text-caption text-on-surface-variant ml-1">
                      ({totalGuests > 0 ? ((awaitingCount / totalGuests) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-error"></span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">Declined</span>
                  </div>
                  <div className="text-right">
                    <span className="font-body-md-medium text-body-md-medium text-error font-bold">{declinedCount}</span>
                    <span className="font-caption text-caption text-on-surface-variant ml-1">
                      ({totalGuests > 0 ? ((declinedCount / totalGuests) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Guest Group Cohort Breakdown */}
            <div className="mt-4 pt-3 border-t border-surface-container">
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider block mb-2 font-semibold">
                Cohort Allocation
              </span>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded bg-surface-container text-center">
                  <span className="block font-caption text-caption text-on-surface-variant">Family</span>
                  <span className="font-body-md-medium text-body-md-medium text-primary font-bold">48</span>
                </div>
                <div className="p-2 rounded bg-surface-container text-center">
                  <span className="block font-caption text-caption text-on-surface-variant">Friends</span>
                  <span className="font-body-md-medium text-body-md-medium text-primary font-bold">54</span>
                </div>
                <div className="p-2 rounded bg-surface-container text-center">
                  <span className="block font-caption text-caption text-on-surface-variant">VIPs</span>
                  <span className="font-body-md-medium text-body-md-medium text-primary font-bold">32</span>
                </div>
                <div className="p-2 rounded bg-surface-container text-center">
                  <span className="block font-caption text-caption text-on-surface-variant">Colleagues</span>
                  <span className="font-body-md-medium text-body-md-medium text-primary font-bold">46</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-surface-container font-caption text-caption text-on-surface-variant">
            <span className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[16px]">bolt</span> High response velocity (+18 in past 48h)
            </span>
            <a className="text-secondary font-bold hover:underline" href="#ledger">
              View Ledger
            </a>
          </div>
        </div>

        {/* Right Card: Invitation Dispatch & Digital RSVP Hub */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-container text-[20px]">mark_email_read</span>
                <h2 className="font-title-md text-title-md text-primary font-semibold">Invitation Dispatch & Digital RSVP Hub</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold">
                Smart Dispatcher Active
              </span>
            </div>

            {/* Metric Pills Chain */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-space-md">
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col border border-outline-variant/10">
                <span className="font-caption text-caption text-on-surface-variant">Dispatched</span>
                <span className="font-body-md-medium text-body-md-medium text-primary font-bold mt-0.5">172 / 180</span>
                <span className="font-caption text-caption text-secondary">95.5% sent</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col border border-outline-variant/10">
                <span className="font-caption text-caption text-on-surface-variant">Delivered</span>
                <span className="font-body-md-medium text-body-md-medium text-primary font-bold mt-0.5">168 / 172</span>
                <span className="font-caption text-caption text-primary">97.7% rate</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col border border-outline-variant/10">
                <span className="font-caption text-caption text-on-surface-variant">Opened</span>
                <span className="font-body-md-medium text-body-md-medium text-primary font-bold mt-0.5">154 / 168</span>
                <span className="font-caption text-caption text-primary">89.5% read</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col border border-outline-variant/10">
                <span className="font-caption text-caption text-on-surface-variant">Completed</span>
                <span className="font-body-md-medium text-body-md-medium text-primary font-bold mt-0.5">142 / 154</span>
                <span className="font-caption text-caption text-secondary">82.5% return</span>
              </div>
            </div>

            {/* Interactive Invitation Preview Snippet */}
            <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-secondary-fixed flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">drafts</span>
                  </div>
                  <div>
                    <span className="font-body-md-medium text-body-md-medium text-primary font-semibold block">
                      Aarav & Priya Wedding — Royal Digital Invitation
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      Template: Gold Foil Couture (Bilingual: English + Hindi)
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-caption text-caption">
                  Active Dispatch
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant/10">
                <p className="font-body-md-medium text-primary mb-1">Subject: An Invitation to Celebrate the Union of Aarav & Priya</p>
                <p className="font-caption text-caption text-on-surface-variant line-clamp-2">
                  "Dearest Guest, with the blessings of our elders, we cordially invite you and your family to join us for our wedding
                  celebrations at Udaipur City Palace..."
                </p>
                <div className="mt-2 flex items-center gap-2 text-secondary-container">
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  <span className="font-caption text-caption font-mono underline text-secondary">
                    rsvp.planora.ai/v2/aarav-priya/token-vip-access
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm pt-space-sm border-t border-surface-container">
            <button
              type="button"
              onClick={() => showToast("Opening gold foil digital invitation preview...")}
              className="h-10 px-4 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md flex items-center gap-1.5 hover:bg-surface-container transition-all shadow-sm border border-outline-variant/10"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>Preview Interactive Invitation</span>
            </button>
            <button
              type="button"
              onClick={() => showToast(`Sent follow-up reminders to ${awaitingCount} pending guests`)}
              className="h-10 px-4 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md flex items-center gap-1.5 hover:bg-secondary/90 active:translate-y-0.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">schedule_send</span>
              <span>Send Follow-up Reminders ({awaitingCount} Pending)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Management Directory & Data Ledger */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/10" id="ledger">
        {/* Toolbar & Filter Row */}
        <div className="p-space-lg flex flex-col gap-space-md border-b border-surface-container">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-surface-container-low rounded-lg" id="statusTabs">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                  statusFilter === "all"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                All Guests ({totalGuests})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Confirmed")}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                  statusFilter === "Confirmed"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Confirmed ({confirmedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Awaiting Response")}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                  statusFilter === "Awaiting Response"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Awaiting Response ({awaitingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Declined")}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                  statusFilter === "Declined"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Declined ({declinedCount})
              </button>
            </div>

            {/* View Switchers & Bulk Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedGuests.length === 0}
                onClick={() => showToast(`Sent reminder to ${selectedGuests.length} selected guests`)}
                className="h-10 px-3.5 rounded-lg bg-surface-container text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed font-label-md text-label-md flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
                <span>Send Reminder ({selectedGuests.length})</span>
              </button>
              <div className="flex items-center p-1 bg-surface-container-low rounded-lg">
                <button
                  type="button"
                  className="w-8 h-8 rounded bg-surface-container-lowest text-primary flex items-center justify-center shadow-xs"
                  title="Table View"
                >
                  <span className="material-symbols-outlined text-[18px]">table_rows</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Switched to mosaic card view")}
                  className="w-8 h-8 rounded text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                  title="Grid View"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Search & Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center">
            <div className="md:col-span-5 relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by guest name, email, or phone..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all border-0"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={cohortFilter}
                onChange={(e) => setCohortFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md-medium text-on-surface focus:outline-none cursor-pointer border-0"
              >
                <option value="">All Guest Groups (Cohorts)</option>
                <option value="VIP">VIP Guests</option>
                <option value="Family">Family Cohort</option>
                <option value="Friends">Friends</option>
                <option value="College Team">College Team</option>
                <option value="Vendors">Key Vendors & Partners</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md-medium text-on-surface focus:outline-none cursor-pointer border-0"
              >
                <option value="">All Associated Events</option>
                <option value="Aarav & Priya Wedding">Aarav & Priya Wedding</option>
                <option value="TechFest 2026">TechFest 2026</option>
                <option value="Birthday Celebration">Birthday Celebration</option>
              </select>
            </div>

            <div className="md:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCohortFilter("");
                  setEventFilter("");
                  setStatusFilter("all");
                }}
                className="w-10 h-10 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                title="Reset Filters"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse" id="guestTable">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-caption text-caption uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedGuests.length > 0 && selectedGuests.length === filteredGuests.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 font-semibold">Guest Name & Role</th>
                <th className="py-3 px-4 font-semibold">Contact Coordinates</th>
                <th className="py-3 px-4 font-semibold">Cohort</th>
                <th className="py-3 px-4 font-semibold">Associated Event</th>
                <th className="py-3 px-4 font-semibold text-center">Party Size</th>
                <th className="py-3 px-4 font-semibold">RSVP Status</th>
                <th className="py-3 px-4 font-semibold">Dispatch Track</th>
                <th className="py-3 px-4 font-semibold text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40">group_off</span>
                      <span className="font-body-md-medium text-body-md">No guests matching current query</span>
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-2 px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all"
                      >
                        + Add First Guest
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => {
                  const isChecked = selectedGuests.includes(guest.id);
                  return (
                    <tr
                      key={guest.id}
                      onClick={() => openDrawer(guest)}
                      className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectGuest(guest.id)}
                          className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-label-md text-label-md font-bold shadow-xs ${
                              guest.isVip
                                ? "bg-primary text-secondary-fixed"
                                : guest.cohort === "Family"
                                ? "bg-secondary-container text-on-secondary-container"
                                : "bg-surface-container-highest text-primary"
                            }`}
                          >
                            {guest.avatar}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-body-md-medium text-body-md-medium text-primary font-semibold group-hover:text-secondary transition-colors">
                                {guest.name}
                              </span>
                              {guest.isVip && (
                                <span className="px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-bold">
                                  VIP
                                </span>
                              )}
                            </div>
                            <span className="font-caption text-caption text-on-surface-variant">
                              {guest.plusOne || (guest.partySize > 1 ? `+${guest.partySize - 1} Guests` : "Solo Invitation")}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-caption text-caption">
                        <div className="flex flex-col">
                          <span className="text-on-surface">{guest.email}</span>
                          <span className="text-on-surface-variant">{guest.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-caption text-caption font-semibold ${
                            guest.cohort === "VIP"
                              ? "bg-secondary-fixed text-on-secondary-fixed"
                              : guest.cohort === "Family"
                              ? "bg-surface-container text-primary"
                              : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          {guest.cohort}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-on-surface-variant font-caption text-caption">{guest.event}</td>

                      <td className="py-3.5 px-4 text-center font-body-md-medium text-primary">
                        {guest.partySize} {guest.partySize === 1 ? "Guest" : "Guests"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-semibold ${
                            guest.status === "Confirmed"
                              ? "bg-surface-container text-primary"
                              : guest.status === "Awaiting Response"
                              ? "bg-secondary-fixed text-on-secondary-fixed"
                              : "bg-error-container text-on-error-container"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              guest.status === "Confirmed"
                                ? "bg-primary"
                                : guest.status === "Awaiting Response"
                                ? "bg-secondary"
                                : "bg-error"
                            }`}
                          ></span>
                          {guest.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-caption text-caption font-medium ${
                            guest.dispatchStatus.includes("Opened") ? "text-primary" : "text-on-surface-variant"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {guest.dispatchStatus.includes("Opened") ? "done_all" : "check"}
                          </span>
                          {guest.dispatchStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openDrawer(guest)}
                            className="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                            title="Inspect Guest Profile"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast(`Invitation re-sent to ${guest.name}`)}
                            className="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors"
                            title="Message / Re-send"
                          >
                            <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE-OVER GUEST DETAILS DRAWER */}
      {isDrawerOpen && activeDrawerGuest && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end animate-fade-in"
          onClick={() => setIsDrawerOpen(false)}
        >
          <aside
            className="w-full max-w-lg bg-surface-container-lowest shadow-2xl flex flex-col h-full animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-space-lg border-b border-surface-container bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-title-md text-title-md font-bold shadow-sm ${
                    activeDrawerGuest.isVip
                      ? "bg-primary text-secondary-fixed"
                      : "bg-surface-container-highest text-primary"
                  }`}
                >
                  {activeDrawerGuest.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-title-md text-title-md text-primary font-bold">{activeDrawerGuest.name}</h3>
                    {activeDrawerGuest.isVip && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-bold">
                        VIP Protocol
                      </span>
                    )}
                  </div>
                  <span className="font-caption text-caption text-on-surface-variant">{activeDrawerGuest.event}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-space-lg overflow-y-auto flex-1 flex flex-col gap-space-lg">
              {/* Quick Status Strip */}
              <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-on-primary ${
                      activeDrawerGuest.status === "Confirmed"
                        ? "bg-primary"
                        : activeDrawerGuest.status === "Awaiting Response"
                        ? "bg-secondary"
                        : "bg-error"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {activeDrawerGuest.status === "Confirmed"
                        ? "check"
                        : activeDrawerGuest.status === "Awaiting Response"
                        ? "hourglass_top"
                        : "close"}
                    </span>
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-primary font-bold block">
                      {activeDrawerGuest.status} ({activeDrawerGuest.partySize} {activeDrawerGuest.partySize === 1 ? "Attendee" : "Attendees"})
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      Attending: Sangeet Gala & Main Reception
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleDrawerRsvp}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-md text-label-md font-medium transition-colors shadow-xs"
                >
                  Update
                </button>
              </div>

              {/* Essential Contact Coordinates */}
              <div className="flex flex-col gap-2">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                  Guest Coordinates
                </span>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container flex flex-col gap-2">
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">mail</span> Email
                    </span>
                    <span className="text-primary font-medium">{activeDrawerGuest.email}</span>
                  </div>
                  <div className="h-[1px] bg-surface-container"></div>
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">call</span> Phone
                    </span>
                    <span className="text-primary font-medium">{activeDrawerGuest.phone}</span>
                  </div>
                  <div className="h-[1px] bg-surface-container"></div>
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">diversity_3</span> Plus One
                    </span>
                    <span className="text-primary font-medium">{activeDrawerGuest.plusOne || "None"}</span>
                  </div>
                </div>
              </div>

              {/* Dietary & Hospitality Specifications */}
              <div className="flex flex-col gap-2">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                  Hospitality & Seating Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col border border-outline-variant/10">
                    <span className="font-caption text-caption text-on-surface-variant">Dietary Preference</span>
                    <span className="font-body-md-medium text-body-md-medium text-primary font-bold mt-1">
                      {activeDrawerGuest.dietary}
                    </span>
                    <span className="font-caption text-caption text-secondary mt-0.5 font-medium">Jain Option Requested</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col border border-outline-variant/10">
                    <span className="font-caption text-caption text-on-surface-variant">Table Allocation</span>
                    <span className="font-body-md-medium text-body-md-medium text-primary font-bold mt-1">
                      {activeDrawerGuest.table}
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant mt-0.5">VIP Tier A Front Stage</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low mt-1 border border-outline-variant/10">
                  <span className="font-caption text-caption text-on-surface-variant block mb-1">
                    Accessibility / Special Requests
                  </span>
                  <p className="font-body-md text-body-md text-primary">
                    {activeDrawerGuest.specialRequest || "No special accessibility requests logged."}
                  </p>
                </div>
              </div>

              {/* Invitation Dispatch Activity Log */}
              <div className="flex flex-col gap-2">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                  Invitation Activity Log
                </span>
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-3 font-caption text-caption border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-body-md-medium text-primary font-semibold">RSVP Submission Completed</span>
                      <span className="text-on-surface-variant">16 Oct, 18:22</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-body-md-medium text-primary font-semibold">Digital Invitation Opened</span>
                      <span className="text-on-surface-variant">15 Oct, 09:14</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-body-md-medium text-primary font-semibold">Bespoke Foil Email Dispatched</span>
                      <span className="text-on-surface-variant">14 Oct, 11:30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-space-lg border-t border-surface-container bg-surface-container-low/50 flex flex-col gap-space-sm">
              <div className="grid grid-cols-2 gap-space-sm">
                <button
                  type="button"
                  onClick={() => showToast(`Invitation re-sent via WhatsApp & Email to ${activeDrawerGuest.name}`)}
                  className="h-11 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container shadow-sm transition-all border border-outline-variant/10"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Resend Invite</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Profile updated");
                    setIsDrawerOpen(false);
                  }}
                  className="h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary-container shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary-fixed">edit</span>
                  <span>Edit Details</span>
                </button>
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => showToast("VIP Concierge escort tagged")}
                  className="font-caption text-caption text-secondary font-semibold hover:underline"
                >
                  Assign VIP Concierge Escort
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveGuest(activeDrawerGuest.id)}
                  className="font-caption text-caption text-error font-semibold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  <span>Remove Guest</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ADD GUEST MODAL CONTAINER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSaveNewGuest}
            className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden flex flex-col border border-outline-variant/10"
          >
            <div className="p-space-lg border-b border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
                <h3 className="font-title-md text-title-md text-primary font-bold">Add New Guest to Roster</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md">
              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="block font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="e.g. Vikram"
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/20"
                  />
                </div>
                <div>
                  <label className="block font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="e.g. Singhania"
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                  Email Coordinates
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="vikram.s@example.com"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="block font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                    Cohort / Group
                  </label>
                  <select
                    value={newCohort}
                    onChange={(e) =>
                      setNewCohort(e.target.value as "VIP" | "Family" | "Friends" | "College Team" | "Vendors")
                    }
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md-medium text-on-surface border border-outline-variant/20"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Family">Family</option>
                    <option value="Friends">Friends</option>
                    <option value="College Team">College Team</option>
                    <option value="Vendors">Vendors</option>
                  </select>
                </div>
                <div>
                  <label className="block font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                    Party Size (Total)
                  </label>
                  <select
                    value={newPartySize}
                    onChange={(e) => setNewPartySize(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md-medium text-on-surface border border-outline-variant/20"
                  >
                    <option value="1">1 (Solo)</option>
                    <option value="2">2 (Plus-One)</option>
                    <option value="3">3 (Family)</option>
                    <option value="4">4 (Family Quad)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                  Associated Event
                </label>
                <select
                  value={newEventTarget}
                  onChange={(e) => setNewEventTarget(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md-medium text-on-surface border border-outline-variant/20"
                >
                  <option value="Aarav & Priya Wedding">Aarav & Priya Wedding</option>
                  <option value="TechFest 2026">TechFest 2026</option>
                  <option value="Birthday Celebration">Birthday Celebration</option>
                </select>
              </div>
            </div>

            <div className="p-space-lg border-t border-surface-container bg-surface-container-low/50 flex items-center justify-end gap-space-sm">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="h-10 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2 hover:bg-primary-container active:translate-y-0.5 transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">save</span>
                <span>Save & Send Invite</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
