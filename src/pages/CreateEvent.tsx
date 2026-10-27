import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";

const THEMES = [
  {
    id: "royal",
    title: "Royal & Elegant",
    subtitle: "Warm marigolds, brass fixtures & gilded velvet",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2Ii5QIGus9VZfZ1JpaYlIj9AJlJFC9syp3L0Y3kMfR96E8ch0Poa1kUTBclCasmk2PCsFEW82OLSitxwClVFweFWHhrp0jiaummRHGQbsQuQKcYLC7Y96rA3gvqgLEsw9akHHQjsPPjGQJflUGH1v5M7xTMyUsaa1HgyhhNhfFeSJKOUt3TVMWAL6wdugUVZ1hquc8mRm6Vul8mgIktKmXlBR7WmwSbvaD3JMIaMPmz9b4g9LKFEl4Q"
  },
  {
    id: "minimal",
    title: "Minimal & Modern",
    subtitle: "Architectural lines, muted ivory & monoculture floristry",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbw_bACLNiy9sFcdMWOYgsVkEQxCLsPkrxComOBPzKxLPmbYWprYuMSxNjZkFCZRO1zmVGOjjjiwNQXeE1KhAivzk9iajYS2ltLV3Eu8JGaoaPRnsCbXUXF-oUafrZurnX6mZ9cSaDLvAoTIz7oa62WhJYpzOdpy8hKbmmqG80Ym5QYKgqE6gVL4tJdVCLS05fW0v5ggX0dWlSEA4KWGEgeB2DRqKRAweSeSFVaT6kIdLoQZKZkXp5HA"
  },
  {
    id: "floral",
    title: "Floral & Romantic",
    subtitle: "Overhanging jasmine, blush roses & crystal candelabras",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDwNkgDVkeFX_duoXORPvZY7JWX4HzsrY611mzDapF3Y8gxzOuCEVyVgoe9mzyyANp4ROFrxfZabyNrexRowj94VhDhwdzquvdPSWk7BXTyn25uqh7tuJtgTBCNCHOyEzY2KYPPn6VX3-9GY_aL-BITi6XtPG2etdIwRrRihz0mx0d_UZFUnk_CnO3RltIRA0fsuPzL3ubdUNa0LzlUtUSpmvNeQnT5SbZOjsH8NvZubGJR0HcnFy0-fg"
  },
  {
    id: "heritage",
    title: "Traditional Heritage",
    subtitle: "Saffron silks, terracotta lamps & classic raag mandaps",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiAyFQa0ochG7TzeZQhoNe5Um0b1uW2mFcpTB74KWcCcs0lhnJbdjqgdo-buPIcvMUJaDkjQbjannfCGAoYjIpnkN90KX_D1vDBunlR3eW9mS79wB8n5A62_G0KKwVc1wU4voYw_ssIaL4C3ZDJ0i_pYeQp3PZcmAjU5NDNbbXuJAN0o4u1uH4vuLbBGwRUIVHXxJPXM8S3P0FXKUYaLqNRWOIPII6W8Oz1xZcbZCFA8-yKkIgsQ52aQ"
  },
  {
    id: "bohemian",
    title: "Bohemian Chic",
    subtitle: "Sun-bleached pampas, rattan lounge suites & organic macramé",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgL_oso3TgAJAH_pn6JVVdyGGdEwTizoaCh20zUPezPvf0woFWjubU2i6V81eAGAa-XJ4QSzGel3OqYisIgF0nNbSnYEMsLoUbYKfJFYpypMkS9xbWfDKD9BwUIqIS3UVkPyKKmNw8ffObnoqeyvoED6FbAiKzQQhAk68tvv4v5PATAKhxpoajOZJXVdJE4K28YbjW--doucJ4BOQ0RRp1qqqpZyny-b1x0YBj740f756ySTsT4uwa0A"
  },
  {
    id: "gala",
    title: "Luxury Grand Gala",
    subtitle: "Midnight navy drape, starlight canopies & 7-course tasting",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABjKCJRTvUNOCTQtStRd1c4GutTSNKlYveRB1rEj54CFtEOLzw1PdK4HTPQkK_ypHBf3H6B8k2Su7MufqP1ntcylzHTwrJqJrXCu7TVAecI8ASwHZaaXjhV49XyKrSb7zdSBMBYL5ql7EdjseYF7fGGsGSdckHiI6RMMW74QLkJXB4UKk8Oyh9MJgg7hIxDdKaEKlKBEk9PLgzveZ1YNIoR7LqEgYocrqoQQAttCRW3KVTNtykiiq2yg"
  }
];

export default function CreateEvent() {
  const { createEvent, currency: workspaceCurrency } = useEventContext();
  const navigate = useNavigate();

  // Active step (Starts cleanly on Step 1)
  const [activeStep, setActiveStep] = useState(1);

  // Form Fields - Clean initial defaults for real event planning
  const [eventName, setEventName] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState("Wedding");
  const [eventDate, setEventDate] = useState("");
  const [venueLocation, setVenueLocation] = useState("");

  // Step 2 Fields
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP" | "AED">(workspaceCurrency || "INR");
  const currSymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "AED ";
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [adultGuests, setAdultGuests] = useState<number>(0);
  const [childGuests, setChildGuests] = useState<number>(0);
  const [accommodationBlock, setAccommodationBlock] = useState(false);
  const [transitAssistance, setTransitAssistance] = useState(false);

  // Step 3 Fields
  const [selectedTheme, setSelectedTheme] = useState("royal");

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalGuests = adultGuests + childGuests;

  // Budget calculations
  const venueAlloc = Math.round(budgetAmount * 0.35);
  const cateringAlloc = Math.round(budgetAmount * 0.28);
  const decorAlloc = Math.round(budgetAmount * 0.18);
  const photoAlloc = Math.round(budgetAmount * 0.10);
  const bufferAlloc = Math.round(budgetAmount * 0.09);

  // Switch step with scroll and validation
  const handleSwitchStep = (stepNumber: number) => {
    if (stepNumber > 1 && !eventName.trim()) {
      showToast("Please enter an event name before proceeding.");
      setActiveStep(1);
      return;
    }
    setActiveStep(stepNumber);
    const target = document.getElementById(`section-step-${stepNumber}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Launch event creation
  const handleLaunchEvent = async () => {
    if (!eventName.trim()) {
      showToast("Please enter an event name before provisioning.");
      handleSwitchStep(1);
      return;
    }
    const newEvt = await createEvent({
      name: eventName.trim(),
      type: selectedArchetype || "Celebration",
      date: eventDate.trim() || "Date TBD",
      location: venueLocation.trim() || "Location TBD",
      budget: budgetAmount || 0,
      guestsCount: totalGuests || 0,
      status: "Planning",
      description: `Bespoke ${selectedArchetype} celebration organized with Planora AI.`
    });
    setCreatedEventId(newEvt.id);
    setShowSuccessModal(true);
  };

  return (
    <AppLayout title="Create Event" subtitle="Design and configure your new event in minutes.">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary-container text-on-primary rounded-xl shadow-xl text-sm font-medium border border-outline-variant/20 animate-fade-in">
          <span className="material-symbols-outlined text-[20px] text-secondary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Utility Bar / Breadcrumb & Status Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-lg">
        <div className="flex items-center gap-space-sm">
          <Link
            to="/events"
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>My Events</span>
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
          <span className="font-label-md text-label-md text-primary font-semibold">Create a New Event</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="h-9 px-space-md rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-error hover:bg-error-container/40 font-label-md text-label-md transition-colors flex items-center gap-1.5 shadow-sm border border-outline-variant/10"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            <span>Discard</span>
          </button>
          <div className="h-5 w-[1px] bg-outline-variant/30 mx-1"></div>
          <button
            type="button"
            onClick={() => {
              if (!eventName.trim()) {
                showToast("Please enter an event name first.");
                handleSwitchStep(1);
                return;
              }
              setShowSuccessModal(true);
            }}
            className="h-9 px-space-md rounded-lg bg-secondary text-on-primary font-label-md text-label-md hover:opacity-90 active:translate-y-0.5 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Quick Preview</span>
          </button>
        </div>
      </div>

      {/* Wizard Title & Subtitle Section */}
      <div className="mb-space-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption tracking-wider uppercase font-semibold">
            Planora AI Studio Engine
          </span>
          <span className="text-on-surface-variant font-caption text-caption">• Step {activeStep} of 4 In Focus</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Create a New Event</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Tell us about your celebration. Our concierge AI will formulate budgets, floor plans, vendor cohorts, and guest timelines instantly.
        </p>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md mb-space-xl shadow-sm border border-outline-variant/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md relative">
          {/* Step 1 */}
          <button
            id="step-btn-1"
            type="button"
            onClick={() => handleSwitchStep(1)}
            className={`flex items-center gap-space-sm p-space-sm rounded-lg text-left transition-all ${
              activeStep === 1
                ? "bg-primary-container text-on-primary shadow-sm"
                : "hover:bg-surface-container-low group"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-label-md text-label-md transition-colors ${
                activeStep === 1
                  ? "bg-secondary-fixed text-on-secondary-fixed font-bold"
                  : "bg-surface-container-high text-primary group-hover:bg-primary group-hover:text-on-primary"
              }`}
            >
              {activeStep > 1 ? <span className="material-symbols-outlined text-[20px]">check</span> : "1"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">Step 01</span>
              <span className="font-body-md-medium text-body-md-medium text-on-surface truncate">Event Basics</span>
            </div>
          </button>

          {/* Step 2 (Active Default) */}
          <button
            id="step-btn-2"
            type="button"
            onClick={() => handleSwitchStep(2)}
            className={`flex items-center gap-space-sm p-space-sm rounded-lg text-left transition-all ${
              activeStep === 2
                ? "bg-primary-container text-on-primary shadow-sm"
                : "hover:bg-surface-container-low group"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-label-md text-label-md ${
                activeStep === 2
                  ? "bg-secondary-fixed text-on-secondary-fixed font-bold"
                  : "bg-surface-container-high text-primary"
              }`}
            >
              2
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`font-caption text-caption uppercase tracking-wider ${activeStep === 2 ? "text-secondary-fixed" : "text-on-surface-variant"}`}>
                Step 02 {activeStep === 2 ? "• Active" : ""}
              </span>
              <span className={`font-body-md-medium text-body-md-medium truncate ${activeStep === 2 ? "text-on-primary font-semibold" : "text-on-surface"}`}>
                Budget & Guests
              </span>
            </div>
          </button>

          {/* Step 3 */}
          <button
            id="step-btn-3"
            type="button"
            onClick={() => handleSwitchStep(3)}
            className={`flex items-center gap-space-sm p-space-sm rounded-lg text-left transition-all ${
              activeStep === 3
                ? "bg-primary-container text-on-primary shadow-sm"
                : "hover:bg-surface-container-low group"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-label-md text-label-md ${
                activeStep === 3
                  ? "bg-secondary-fixed text-on-secondary-fixed font-bold"
                  : "bg-surface-container-low text-on-surface-variant group-hover:bg-surface-container"
              }`}
            >
              3
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`font-caption text-caption uppercase tracking-wider ${activeStep === 3 ? "text-secondary-fixed" : "text-on-surface-variant"}`}>
                Step 03 {activeStep === 3 ? "• Active" : ""}
              </span>
              <span className={`font-body-md-medium text-body-md-medium truncate ${activeStep === 3 ? "text-on-primary font-semibold" : "text-on-surface"}`}>
                Style & Aesthetic
              </span>
            </div>
          </button>

          {/* Step 4 */}
          <button
            id="step-btn-4"
            type="button"
            onClick={() => handleSwitchStep(4)}
            className={`flex items-center gap-space-sm p-space-sm rounded-lg text-left transition-all ${
              activeStep === 4
                ? "bg-primary-container text-on-primary shadow-sm"
                : "hover:bg-surface-container-low group"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-label-md text-label-md ${
                activeStep === 4
                  ? "bg-secondary-fixed text-on-secondary-fixed font-bold"
                  : "bg-surface-container-low text-on-surface-variant group-hover:bg-surface-container"
              }`}
            >
              4
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`font-caption text-caption uppercase tracking-wider ${activeStep === 4 ? "text-secondary-fixed" : "text-on-surface-variant"}`}>
                Step 04 {activeStep === 4 ? "• Active" : ""}
              </span>
              <span className={`font-body-md-medium text-body-md-medium truncate ${activeStep === 4 ? "text-on-primary font-semibold" : "text-on-surface"}`}>
                Review & Provision
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start pb-16">
        {/* LEFT / CENTER COLUMN: Expansive Interactive Wizard (~68% width -> col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-space-xl">
          {/* STEP 1 CONTAINER: Event Basics */}
          <section
            id="section-step-1"
            className={`bg-surface-container-lowest rounded-xl p-space-xl shadow-sm transition-all border border-outline-variant/10 ${
              activeStep === 1 ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div>
                  <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">Step 1 Completed</span>
                  <h2 className="font-title-md text-title-md text-primary">Core Event Profile</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSwitchStep(1)}
                className="text-on-surface-variant hover:text-primary font-label-md text-label-md flex items-center gap-1 transition-colors"
              >
                <span>Edit Information</span>
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>

            {/* Editable summary / input cards */}
            <div className="pt-space-md grid grid-cols-1 md:grid-cols-3 gap-space-md text-left" id="step1-body">
              <div className="bg-surface-container-low p-space-md rounded-lg">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Event Name</span>
                {activeStep === 1 ? (
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Meera & Kabir Sangeet Gala"
                    className="w-full mt-1 px-2 py-1 bg-surface-container-lowest rounded text-sm font-medium text-primary border border-outline-variant/20 focus:outline-none"
                  />
                ) : (
                  <p className="font-body-md-medium text-body-md-medium text-primary mt-0.5 truncate">{eventName || "Untitled Celebration"}</p>
                )}
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption">
                  {selectedArchetype || "Celebration"}
                </span>
              </div>

              <div className="bg-surface-container-low p-space-md rounded-lg">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Dates & Duration</span>
                {activeStep === 1 ? (
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="e.g. 15 Dec 2026"
                    className="w-full mt-1 px-2 py-1 bg-surface-container-lowest rounded text-sm font-medium text-primary border border-outline-variant/20 focus:outline-none"
                  />
                ) : (
                  <p className="font-body-md-medium text-body-md-medium text-primary mt-0.5">{eventDate || "Date TBD"}</p>
                )}
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
                  {eventDate ? "Confirmed Dates" : "Dates Pending"}
                </span>
              </div>

              <div className="bg-surface-container-low p-space-md rounded-lg">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Destination & Venue</span>
                {activeStep === 1 ? (
                  <input
                    type="text"
                    value={venueLocation}
                    onChange={(e) => setVenueLocation(e.target.value)}
                    placeholder="e.g. The Grand Palace, Mumbai"
                    className="w-full mt-1 px-2 py-1 bg-surface-container-lowest rounded text-sm font-medium text-primary border border-outline-variant/20 focus:outline-none"
                  />
                ) : (
                  <p className="font-body-md-medium text-body-md-medium text-primary mt-0.5 truncate">{venueLocation || "Location TBD"}</p>
                )}
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
                  {venueLocation ? (venueLocation.includes(",") ? venueLocation.split(",")[1].trim() : venueLocation) : "Destination TBD"}
                </span>
              </div>
            </div>

            {/* Archetype Selection Snapshot */}
            <div className="mt-space-md pt-space-md border-t border-surface-container">
              <label className="block font-caption text-caption uppercase tracking-wider text-on-surface-variant mb-space-sm">
                Selected Archetype
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-space-xs">
                {[
                  { name: "Wedding", icon: "favorite" },
                  { name: "Birthday", icon: "cake" },
                  { name: "Community Event", icon: "groups" },
                  { name: "Corporate", icon: "business_center" },
                  { name: "Anniversary", icon: "celebration" },
                  { name: "Engagement", icon: "diamond" },
                  { name: "College", icon: "school" },
                  { name: "Other", icon: "more_horiz" }
                ].map((arch) => {
                  const isSelected = selectedArchetype === arch.name;
                  return (
                    <button
                      key={arch.name}
                      type="button"
                      onClick={() => setSelectedArchetype(arch.name)}
                      className={`p-space-xs rounded-lg text-center transition-all ${
                        isSelected
                          ? "bg-primary-container text-on-primary shadow-sm"
                          : "bg-surface-container-low text-on-surface-variant opacity-60 hover:opacity-100"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] block mb-0.5 ${
                          isSelected ? "text-secondary-fixed" : ""
                        }`}
                      >
                        {arch.icon}
                      </span>
                      <span className="font-caption text-caption block font-semibold truncate">{arch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeStep === 1 && (
              <div className="mt-space-md pt-space-md border-t border-surface-container flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSwitchStep(2)}
                  className="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 hover:bg-primary-container transition-all shadow-sm font-medium"
                >
                  <span>Continue to Step 2: Budget & Guests</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            )}
          </section>

          {/* STEP 2 CONTAINER: Budget & Guests (ACTIVE FOCUS) */}
          <section
            id="section-step-2"
            className={`bg-surface-container-lowest rounded-xl p-space-xl shadow-sm transition-all border border-outline-variant/10 ${
              activeStep === 2 ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span className="font-caption text-caption uppercase tracking-wider text-secondary font-bold">Step 02 of 04</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-primary mt-1">Budget Allocation & Guest Experience</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Configure your total capital ceiling and guest logistics parameters.
                </p>
              </div>

              {/* Currency Selector Toggle */}
              <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
                {(["INR", "USD", "EUR", "GBP", "AED"] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`px-3 py-1 rounded font-label-sm text-label-sm transition-all ${
                      currency === curr
                        ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {curr === "INR" ? "INR (₹)" : curr === "USD" ? "USD ($)" : curr === "EUR" ? "EUR (€)" : curr === "GBP" ? "GBP (£)" : "AED"}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Setting Block */}
            <div className="bg-surface-container-low rounded-xl p-space-lg mb-space-lg border border-outline-variant/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-md">
                <div>
                  <label className="font-label-md text-label-md text-primary block" htmlFor="budget-input">
                    Target Event Budget
                  </label>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Recommended benchmark for 3-day luxury palace ceremonies
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-md text-headline-md text-primary font-bold">{currSymbol}</span>
                  <input
                    id="budget-input"
                    type="text"
                    value={budgetAmount.toLocaleString()}
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/,/g, ""));
                      if (!isNaN(val)) setBudgetAmount(val);
                    }}
                    className="h-12 w-44 px-3 rounded-lg bg-surface-container-lowest font-headline-sm text-headline-sm text-primary font-bold focus:outline-none focus:bg-surface-container-lowest shadow-sm text-right"
                  />
                  <span className="font-body-md text-body-md text-on-surface-variant pl-1">{currency}</span>
                </div>
              </div>

              {/* Range slider */}
              <div className="mb-space-md">
                <input
                  type="range"
                  min="50000"
                  max="1000000"
                  step="10000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between font-caption text-caption text-on-surface-variant mt-1.5">
                  <span>{currSymbol}50,000 (Intimate)</span>
                  <span>{currSymbol}1,50,000 (Target)</span>
                  <span>{currSymbol}10,00,000+ (Grand Sovereign)</span>
                </div>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                <span className="font-caption text-caption text-on-surface-variant mr-1">Quick Select:</span>
                {[50000, 100000, 150000, 250000, 500000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBudgetAmount(preset)}
                    className={`px-3 py-1 rounded-full font-label-sm text-label-sm transition-all ${
                      budgetAmount === preset
                        ? "bg-primary text-on-primary font-semibold shadow-xs"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {currSymbol}{preset.toLocaleString()} {budgetAmount === preset ? "(Selected)" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Budget Breakdown Card */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl mb-space-lg shadow-sm border border-outline-variant/10">
              <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-md">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption uppercase font-semibold">
                    AI Benchmark Model
                  </span>
                  <h3 className="font-title-md text-title-md text-primary">Dynamic Allocation Forecast</h3>
                </div>
                <span className="font-caption text-caption text-on-surface-variant">Auto-balanced for Lake Pichola, Udaipur</span>
              </div>

              {/* Multi-segmented Progress Bar */}
              <div className="h-3.5 w-full bg-surface-container-high rounded-full overflow-hidden flex mb-space-md">
                <div className="bg-primary h-full transition-all duration-300" style={{ width: "35%" }} title="Venue (35%)"></div>
                <div className="bg-secondary h-full transition-all duration-300" style={{ width: "28%" }} title="Catering (28%)"></div>
                <div className="bg-tertiary-container h-full transition-all duration-300" style={{ width: "18%" }} title="Decor (18%)"></div>
                <div className="bg-inverse-primary h-full transition-all duration-300" style={{ width: "10%" }} title="Photo/Video (10%)"></div>
                <div className="bg-surface-dim h-full transition-all duration-300" style={{ width: "9%" }} title="Buffer (9%)"></div>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-sm pt-space-xs">
                <div className="p-space-sm rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <span className="font-caption text-caption text-on-surface font-semibold">Venue & Space</span>
                  </div>
                  <span className="font-body-md-medium text-body-md-medium text-primary block">{currSymbol}{venueAlloc.toLocaleString()}</span>
                  <span className="font-caption text-caption text-on-surface-variant">35% Allocation</span>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span className="font-caption text-caption text-on-surface font-semibold">Food & Catering</span>
                  </div>
                  <span className="font-body-md-medium text-body-md-medium text-primary block">{currSymbol}{cateringAlloc.toLocaleString()}</span>
                  <span className="font-caption text-caption text-on-surface-variant">28% Allocation</span>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
                    <span className="font-caption text-caption text-on-surface font-semibold">Decor & Lights</span>
                  </div>
                  <span className="font-body-md-medium text-body-md-medium text-primary block">{currSymbol}{decorAlloc.toLocaleString()}</span>
                  <span className="font-caption text-caption text-on-surface-variant">18% Allocation</span>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-inverse-primary"></span>
                    <span className="font-caption text-caption text-on-surface font-semibold">Photo & Cinema</span>
                  </div>
                  <span className="font-body-md-medium text-body-md-medium text-primary block">{currSymbol}{photoAlloc.toLocaleString()}</span>
                  <span className="font-caption text-caption text-on-surface-variant">10% Allocation</span>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-surface-dim"></span>
                    <span className="font-caption text-caption text-on-surface font-semibold">Safety Buffer</span>
                  </div>
                  <span className="font-body-md-medium text-body-md-medium text-primary block">{currSymbol}{bufferAlloc.toLocaleString()}</span>
                  <span className="font-caption text-caption text-on-surface-variant">9% Contingency</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-space-md pt-space-xs text-on-surface-variant font-caption text-caption">
                <span className="material-symbols-outlined text-[16px] text-tertiary">info</span>
                <span>AI-derived benchmark allocation synthesized from 420+ royal wedding profiles in Western India.</span>
              </div>
            </div>

            {/* Guest Headcount & Hospitality Section */}
            <div className="pt-space-sm">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h3 className="font-title-md text-title-md text-primary">Guest Logistics & Headcount</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Manage expected attendees, invitations, and hospitality transfers.
                  </p>
                </div>
                <div className="px-space-md py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md font-semibold">
                  Total Count: {totalGuests} Guests
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mb-space-lg">
                <div className="bg-surface-container-low p-space-md rounded-xl flex items-center justify-between border border-outline-variant/10">
                  <div>
                    <label className="font-body-md-medium text-body-md-medium text-primary block">Adult Guests</label>
                    <span className="font-caption text-caption text-on-surface-variant">Full dinner service & seating</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      onClick={() => setAdultGuests((c) => Math.max(1, c - 5))}
                      className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center font-bold shadow-xs"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-title-md text-title-md text-primary">{adultGuests}</span>
                    <button
                      type="button"
                      onClick={() => setAdultGuests((c) => c + 5)}
                      className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center font-bold shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-md rounded-xl flex items-center justify-between border border-outline-variant/10">
                  <div>
                    <label className="font-body-md-medium text-body-md-medium text-primary block">Children & Minors</label>
                    <span className="font-caption text-caption text-on-surface-variant">Kids menu & play lounge</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      onClick={() => setChildGuests((c) => Math.max(0, c - 5))}
                      className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center font-bold shadow-xs"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-title-md text-title-md text-primary">{childGuests}</span>
                    <button
                      type="button"
                      onClick={() => setChildGuests((c) => c + 5)}
                      className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center font-bold shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Hospitality & Concierge Toggles */}
              <div className="space-y-space-sm">
                <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/10">
                  <div className="flex items-center gap-space-md">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">hotel</span>
                    </div>
                    <div>
                      <span className="font-body-md-medium text-body-md-medium text-primary block">
                        Guest Accommodation Block Required
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        45 Heritage Rooms reserved at Fateh Garh & Trident Udaipur
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accommodationBlock}
                      onChange={(e) => setAccommodationBlock(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/10">
                  <div className="flex items-center gap-space-md">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">directions_boat</span>
                    </div>
                    <div>
                      <span className="font-body-md-medium text-body-md-medium text-primary block">
                        Airport & Jetty Transit Assistance
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        Synchronized luxury boat shuttles across Lake Pichola for guests
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transitAssistance}
                      onChange={(e) => setTransitAssistance(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {activeStep === 2 && (
              <div className="mt-space-md pt-space-md border-t border-surface-container flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSwitchStep(1)}
                  className="h-10 px-4 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back to Step 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchStep(3)}
                  className="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 hover:bg-primary-container transition-all shadow-sm font-semibold"
                >
                  <span>Continue to Step 3: Style & Theme</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            )}
          </section>

          {/* STEP 3 CONTAINER: Style & Aesthetics */}
          <section
            id="section-step-3"
            className={`bg-surface-container-lowest rounded-xl p-space-xl shadow-sm transition-all border border-outline-variant/10 ${
              activeStep === 3 ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-label-md text-label-md font-bold">
                  3
                </div>
                <div>
                  <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">Step 03</span>
                  <h2 className="font-title-md text-title-md text-primary">Style, Atmosphere & Culinary Preferences</h2>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold">
                Curated Palettes
              </span>
            </div>

            {/* Visual Theme Cards Grid */}
            <label className="block font-label-md text-label-md text-primary mb-space-sm">Select Core Event Aesthetic</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-space-md mb-space-lg">
              {THEMES.map((th) => {
                const isSelected = selectedTheme === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => setSelectedTheme(th.id)}
                    className={`relative rounded-xl overflow-hidden shadow-sm flex flex-col group cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-secondary bg-surface-container-lowest"
                        : "bg-surface-container-low hover:bg-surface-container-high"
                    }`}
                  >
                    <div
                      className="h-28 w-full bg-cover bg-center relative"
                      style={{ backgroundImage: `url('${th.image}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
                      {isSelected && (
                        <span className="absolute top-2 right-2 bg-secondary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <div className="p-space-sm flex-1 flex flex-col justify-between">
                      <div>
                        <span className="font-body-md-medium text-body-md-medium text-primary font-bold block">{th.title}</span>
                        <span className="font-caption text-caption text-on-surface-variant">{th.subtitle}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Color Palette Swatches */}
            <div className="bg-surface-container-low rounded-xl p-space-md mb-space-md border border-outline-variant/10">
              <label className="block font-label-md text-label-md text-primary mb-space-xs">Harmonized Palette Tokens</label>
              <div className="flex flex-wrap items-center gap-space-md">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-container shadow-xs"></div>
                  <span className="font-caption text-caption text-on-surface font-medium">Midnight Navy (#17233B)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary shadow-xs"></div>
                  <span className="font-caption text-caption text-on-surface font-medium">Gilded Amber (#7C5816)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary-fixed shadow-xs"></div>
                  <span className="font-caption text-caption text-on-surface font-medium">Champagne Silk (#FFDEAE)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-tertiary-container shadow-xs"></div>
                  <span className="font-caption text-caption text-on-surface font-medium">Royal Orchid (#260075)</span>
                </div>
              </div>
            </div>

            {/* Formality & Dietary Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/10">
                <label className="block font-label-md text-label-md text-primary mb-1">Dress Code & Formality</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">styler</span>
                  <span className="font-body-md-medium text-body-md-medium text-on-surface">Black-tie Royal & Heritage Traditional</span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant mt-1">
                  Bandhgalas, tuxedos, and regal silk sarees indicated in guest guide.
                </p>
              </div>

              <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/10">
                <label className="block font-label-md text-label-md text-primary mb-1">Dietary & Kitchen Requirements</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">restaurant_menu</span>
                  <span className="font-body-md-medium text-body-md-medium text-on-surface">
                    Pure Vegetarian & Dedicated Jain Kitchen
                  </span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant mt-1">
                  AI catering engine will filter venue vendors by certified Jain catering banquets.
                </p>
              </div>
            </div>

            {/* Personalize with AI Prompt Card */}
            <div className="mt-space-md p-space-md rounded-xl bg-tertiary-fixed/30 flex flex-col md:flex-row items-center justify-between gap-space-md shadow-xs border border-tertiary-fixed/40">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-caption text-caption font-bold text-on-tertiary-fixed uppercase tracking-wider">
                      AI Copilot Suggestion
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    Want tailored styling for lakeside Udaipur breezes? Let Planora generate fabric & lighting suggestions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast("AI suggested: Silk sheer canopies with floating diya pools")}
                className="whitespace-nowrap px-space-md py-2 rounded-lg bg-tertiary text-on-tertiary hover:opacity-90 font-label-md text-label-md flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">magic_button</span>
                <span>Suggest My Event Style</span>
              </button>
            </div>

            {activeStep === 3 && (
              <div className="mt-space-md pt-space-md border-t border-surface-container flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSwitchStep(2)}
                  className="h-10 px-4 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back to Step 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchStep(4)}
                  className="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 hover:bg-primary-container transition-all shadow-sm font-semibold"
                >
                  <span>Continue to Step 4: Review & Finalize</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            )}
          </section>

          {/* STEP 4 CONTAINER: Review & Finalize Card */}
          <section
            id="section-step-4"
            className={`bg-surface-container-lowest rounded-xl p-space-xl shadow-sm transition-all border border-outline-variant/10 ${
              activeStep === 4 ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-label-md text-label-md font-bold">
                  4
                </div>
                <div>
                  <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">Step 04</span>
                  <h2 className="font-title-md text-title-md text-primary">Review & Instant Provisioning</h2>
                </div>
              </div>
              <span className="font-caption text-caption text-secondary font-semibold">Ready for Creation</span>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-low mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-outline-variant/10">
              <div>
                <h4 className="font-title-md text-title-md text-primary">Ready to activate "{eventName}"?</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Clicking "Create Event" provisions smart RSVP links, 5 curated vendor RFPs, dynamic budget ledger, and timeline run of show.
                </p>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="font-caption text-caption text-on-surface-variant block uppercase">Total Provisioning Fee</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">Included in Pro Plan</span>
              </div>
            </div>

            {/* Wizard Navigation Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-sm">
              <button
                type="button"
                onClick={() => handleSwitchStep(1)}
                className="h-11 px-space-lg rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center gap-2 transition-all shadow-sm border border-outline-variant/10"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to Step 1</span>
              </button>

              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={handleLaunchEvent}
                  className="h-11 px-space-xl rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2 hover:bg-primary-container active:translate-y-0.5 transition-all shadow-md font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary-fixed">auto_awesome</span>
                  <span>Create Event & Launch Studio →</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Planning Snapshot & AI Copilot Preview (~32% width -> col-span-4) */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-space-lg">
          {/* Primary Snapshot Container */}
          <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-primary-container text-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">insights</span>
                </div>
                <h3 className="font-title-md text-title-md text-primary">Your Planning Snapshot</h3>
              </div>
              <span className="font-caption text-caption text-secondary font-bold uppercase tracking-wider">Live Dynamic</span>
            </div>

            {/* Days Countdown Pill */}
            <div className="bg-primary-container text-on-primary rounded-xl p-space-md mb-space-md flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/10 flex items-center justify-center text-secondary-fixed">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                <div>
                  <span className="font-caption text-caption text-on-primary-container uppercase tracking-wider block">Target Countdown</span>
                  <span className="font-body-md-medium text-body-md-medium text-on-primary font-semibold">{eventDate}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-headline-sm text-headline-sm font-bold text-secondary-fixed">58</span>
                <span className="font-caption text-caption text-on-primary-container block">Days to Go</span>
              </div>
            </div>

            {/* Venue Teaser Photo Preview */}
            <div
              className="rounded-xl overflow-hidden mb-space-md relative h-36 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAg4Xg55mmA-D24RZ0vD0YYCgI2n_-22Tjbtjy30y--__cba61PZKfqvUjRN18KsgyWGaxa1c4K-ve3oG4x_HVL0NIg6jz9ielBvt2vwesLLkUpN598ZY1hGPSk-SZp8sTy7iJHkO5AuMEkIXf3ZR9BQYxUDjbPcXiabEUPiJU45J-ylz4A0-JfiL9KQcTvcuuoA_2s3RVEQBxdYGQp2cKU1jhIKQKEqC-m6mkt8Kke_mhKQ1qZh8f5wA')"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-on-primary flex items-end justify-between">
                <div>
                  <span className="font-caption text-caption uppercase tracking-wider text-secondary-fixed block">
                    Selected Destination
                  </span>
                  <span className="font-body-md-medium text-body-md-medium font-bold block truncate">
                    {venueLocation.split(",")[0]}
                  </span>
                  <span className="font-caption text-caption opacity-80">{venueLocation}</span>
                </div>
                <span className="material-symbols-outlined text-secondary-fixed text-[18px]">verified</span>
              </div>
            </div>

            {/* Milestone Projection List */}
            <div className="space-y-space-sm mb-space-md">
              <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant block font-semibold">
                Automated Milestone Trajectory
              </span>

              <div className="flex items-start gap-space-sm">
                <div className="w-5 h-5 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-body-md-medium text-body-md-medium text-primary truncate">Curated Venue Finalization</span>
                    <span className="font-caption text-caption text-secondary font-medium">Completed</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant">Lake Pichola Terraces dates locked</p>
                </div>
              </div>

              <div className="flex items-start gap-space-sm">
                <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center mt-0.5 shrink-0">
                  <span className="font-caption text-caption font-bold">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-body-md-medium text-body-md-medium text-primary truncate">Budget Ledger & Deposit Escrow</span>
                    <span className="font-caption text-caption text-primary font-bold">{currSymbol}{budgetAmount.toLocaleString()}</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant">5 key category caps calculated</p>
                </div>
              </div>

              <div className="flex items-start gap-space-sm opacity-70">
                <div className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mt-0.5 shrink-0">
                  <span className="font-caption text-caption font-bold">3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-body-md text-body-md text-on-surface truncate">Digital RSVP & WhatsApp Dispatch</span>
                    <span className="font-caption text-caption text-on-surface-variant">Next Step</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant">{totalGuests} Guests pending dispatch</p>
                </div>
              </div>

              <div className="flex items-start gap-space-sm opacity-70">
                <div className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mt-0.5 shrink-0">
                  <span className="font-caption text-caption font-bold">4</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-body-md text-body-md text-on-surface truncate">Vendor Contracts & Production Roster</span>
                    <span className="font-caption text-caption text-on-surface-variant">Pending</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant">Photo, Sound & Florals matching</p>
                </div>
              </div>
            </div>

            {/* Live Budget Estimator Compact Bar */}
            <div className="bg-surface-container-low p-space-md rounded-xl mb-space-md border border-outline-variant/10">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-body-md-medium text-body-md-medium text-primary">Budget Utilization</span>
                <span className="font-body-md-medium text-body-md-medium text-primary">100% Allocated</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden flex">
                <div className="bg-primary h-full" style={{ width: "35%" }}></div>
                <div className="bg-secondary h-full" style={{ width: "28%" }}></div>
                <div className="bg-tertiary-container h-full" style={{ width: "18%" }}></div>
                <div className="bg-inverse-primary h-full" style={{ width: "10%" }}></div>
                <div className="bg-surface-dim h-full" style={{ width: "9%" }}></div>
              </div>
              <div className="flex justify-between items-center mt-1.5 font-caption text-caption text-on-surface-variant">
                <span>Committed: ₹{(budgetAmount - bufferAlloc).toLocaleString("en-IN")}</span>
                <span>Safety buffer: ₹{bufferAlloc.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Guest Quorum Status */}
            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">group</span>
                <span className="font-body-md text-body-md text-on-surface">Target Headcount</span>
              </div>
              <span className="font-body-md-medium text-body-md-medium text-primary font-bold">{totalGuests} RSVPs queued</span>
            </div>
          </div>

          {/* AI Copilot Tip Card (Bespoke Insight) */}
          <div className="bg-tertiary-container text-on-tertiary rounded-xl p-space-lg shadow-md relative overflow-hidden border border-outline-variant/10">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-on-tertiary-container/10 pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-space-xs">
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">tips_and_updates</span>
              <span className="font-caption text-caption text-secondary-fixed uppercase tracking-wider font-bold">
                Planora Concierge Tip
              </span>
            </div>
            <p className="font-body-md text-body-md text-inverse-on-surface leading-snug">
              "Sangeet sound curfews in Rajasthan lake venues strictly begin at 10:00 PM. We will auto-schedule your high-energy brass &
              DJ sets between 7:00 PM – 9:45 PM, transitioning smoothly to acoustic rooftop lounge ambient after 10 PM."
            </p>
            <div className="mt-space-md flex items-center justify-between pt-space-xs">
              <span className="font-caption text-caption text-on-primary-container">Synced with Udaipur Local Codes</span>
              <button
                type="button"
                onClick={() => showToast("Applied curfew window to event run-of-show")}
                className="text-secondary-fixed hover:underline font-label-sm text-label-sm font-semibold"
              >
                Apply to Schedule
              </button>
            </div>
          </div>

          {/* Quick Assistance / Event Coordinator Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between border border-outline-variant/10">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-label-md">
                RK
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-body-md-medium text-body-md-medium text-primary truncate">Rohan Kapoor</span>
                <span className="font-caption text-caption text-on-surface-variant truncate">Assigned Luxury Concierge</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast("Connecting with Rohan Kapoor via studio chat...")}
              className="h-8 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-medium transition-colors"
            >
              Ask Help
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING SUCCESS / CONFIRMATION MODAL PREVIEW */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-primary/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-xl shadow-xl transform transition-all relative border border-outline-variant/20">
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="w-14 h-14 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center mb-space-md mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[32px]">celebration</span>
            </div>

            <div className="text-center mb-space-lg">
              <span className="px-3 py-1 rounded-full bg-surface-container text-primary font-caption text-caption uppercase tracking-wider font-semibold">
                Event Provisioned Successfully
              </span>
              <h2 className="font-headline-md text-headline-md text-primary mt-2">{eventName} is Ready!</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Your celebration studio has been generated with AI-optimized budget segments, {totalGuests} guest RSVP channels, and Lake Pichola vendor shortlists.
              </p>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md mb-space-lg space-y-space-xs text-left border border-outline-variant/10">
              <div className="flex justify-between items-center text-body-md font-body-md">
                <span className="text-on-surface-variant">Event Name</span>
                <span className="font-body-md-medium text-primary font-semibold">{eventName}</span>
              </div>
              <div className="flex justify-between items-center text-body-md font-body-md">
                <span className="text-on-surface-variant">Dates & Location</span>
                <span className="font-body-md-medium text-primary">{eventDate} • {venueLocation.split(",")[0]}</span>
              </div>
              <div className="flex justify-between items-center text-body-md font-body-md">
                <span className="text-on-surface-variant">Total Target Budget</span>
                <span className="font-body-md-medium text-primary font-bold">{currSymbol}{budgetAmount.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between items-center text-body-md font-body-md">
                <span className="text-on-surface-variant">RSVP Capacity</span>
                <span className="font-body-md-medium text-primary">
                  {totalGuests} Guests ({accommodationBlock ? "45 Hotel Suites Reserved" : "Local Stays"})
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-space-sm">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/events");
                }}
                className="w-full sm:w-1/2 h-11 px-space-md rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors"
              >
                Return to My Events
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(createdEventId ? `/events/${createdEventId}` : "/events");
                }}
                className="w-full sm:w-1/2 h-11 px-space-md rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <span>Go to Event Details</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
