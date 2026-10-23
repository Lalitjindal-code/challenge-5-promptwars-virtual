import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, Sparkles, X } from "lucide-react";

export type EventType = "Wedding" | "Birthday" | "Anniversary" | "Community event" | "Other";

export interface PlannedEvent {
  id: string;
  name: string;
  type: EventType;
  date: string;
  guests: number;
  budget: number;
  location: string;
  preferences: string;
  createdAt: string;
  budgetBreakdown: { venue: number; catering: number; decor: number; reserve: number };
  tasks: { id: string; title: string; done: boolean }[];
}

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (event: PlannedEvent) => void;
}

const STORAGE_KEY = "planora.events.v1";

function readEvents(): PlannedEvent[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as PlannedEvent[]) : [];
  } catch {
    return [];
  }
}

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export default function EventModal({ open, onClose, onCreated }: EventModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<EventType>("Wedding");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("100");
  const [budget, setBudget] = useState("100000");
  const [location, setLocation] = useState("");
  const [preferences, setPreferences] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState<PlannedEvent | null>(null);

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const guestCount = Number(guests);
    const totalBudget = Number(budget);

    if (trimmedName.length < 2) {
      setError("Please enter an event name with at least 2 characters.");
      return;
    }
    if (!date || date < minDate) {
      setError("Choose today or a future date for your event.");
      return;
    }
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 100000) {
      setError("Guest count must be a whole number between 1 and 100,000.");
      return;
    }
    if (!Number.isFinite(totalBudget) || totalBudget < 1000 || totalBudget > 1000000000) {
      setError("Budget must be between ₹1,000 and ₹1,00,00,00,000.");
      return;
    }

    const newEvent: PlannedEvent = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`,
      name: trimmedName,
      type,
      date,
      guests: guestCount,
      budget: totalBudget,
      location: location.trim(),
      preferences: preferences.trim(),
      createdAt: new Date().toISOString(),
      budgetBreakdown: {
        venue: Math.round(totalBudget * 0.35),
        catering: Math.round(totalBudget * 0.4),
        decor: Math.round(totalBudget * 0.15),
        reserve: totalBudget - Math.round(totalBudget * 0.35) - Math.round(totalBudget * 0.4) - Math.round(totalBudget * 0.15)
      },
      tasks: [
        { id: "venue", title: "Research and shortlist venues", done: false },
        { id: "budget", title: "Review budget and priorities", done: false },
        { id: "guest-list", title: "Prepare the guest list", done: false },
        { id: "vendors", title: "Compare vendors and quotes", done: false },
        { id: "timeline", title: "Create the event-day timeline", done: false }
      ]
    };

    try {
      const existing = readEvents();
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newEvent, ...existing]));
    } catch {
      setError("The event could not be saved in this browser. Check available storage and try again.");
      return;
    }

    setCreated(newEvent);
    onCreated(newEvent);
  }

  function closeAndReset() {
    setName("");
    setType("Wedding");
    setDate("");
    setGuests("100");
    setBudget("100000");
    setLocation("");
    setPreferences("");
    setError("");
    setCreated(null);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-planora-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeAndReset();
      }}
    >
      <section
        aria-labelledby="event-modal-title"
        aria-modal="true"
        role="dialog"
        className="max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-planora-border bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-planora-lavender px-2.5 py-1 text-xs font-semibold text-planora-violet">
              <Sparkles size={13} /> YOUR PERSONAL EVENT PLANNER
            </div>
            <h2 id="event-modal-title" className="font-heading text-2xl font-bold text-planora-ink">
              {created ? "Your event draft is ready" : "Plan your event"}
            </h2>
            <p className="mt-1 text-sm text-planora-muted">
              {created ? "Your draft has been saved in this browser." : "Start with the essentials. You can refine the plan later."}
            </p>
          </div>
          <button type="button" onClick={closeAndReset} aria-label="Close event planner" className="rounded-full p-2 text-planora-muted transition hover:bg-planora-background hover:text-planora-ink">
            <X size={21} />
          </button>
        </div>

        {created ? (
          <div className="p-5 sm:p-7">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-planora-success" size={22} />
                <div>
                  <h3 className="font-heading text-lg font-bold text-planora-ink">{created.name}</h3>
                  <p className="mt-1 text-sm text-planora-muted">{created.type} · {new Date(`${created.date}T12:00:00`).toLocaleDateString("en-IN", { dateStyle: "long" })} · {created.guests.toLocaleString("en-IN")} guests</p>
                  <p className="mt-2 text-xl font-bold text-planora-navy">{formatINR(created.budget)}</p>
                  {created.location && <p className="mt-1 text-sm text-planora-muted">Location: {created.location}</p>}
                </div>
              </div>
            </div>
            <h3 className="mt-6 font-heading text-lg font-bold text-planora-ink">Starter budget allocation</h3>
            <div className="mt-3 space-y-3">
              {([
                ["Venue", created.budgetBreakdown.venue],
                ["Catering", created.budgetBreakdown.catering],
                ["Decor", created.budgetBreakdown.decor],
                ["Reserve", created.budgetBreakdown.reserve]
              ] as const).map(([label, amount]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between gap-3 text-sm"><span className="text-planora-muted">{label}</span><strong className="text-planora-ink">{formatINR(amount)}</strong></div>
                  <div className="h-2 overflow-hidden rounded-full bg-planora-background"><div className="h-full rounded-full bg-planora-violet" style={{ width: `${(amount / created.budget) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <h3 className="mt-6 font-heading text-lg font-bold text-planora-ink">Your first 5 tasks</h3>
            <ul className="mt-2 space-y-2">
              {created.tasks.map((task) => <li key={task.id} className="flex items-center gap-2 text-sm text-planora-muted"><span className="h-2 w-2 rounded-full bg-planora-gold" />{task.title}</li>)}
            </ul>
            <p className="mt-5 rounded-xl bg-planora-lavender p-3 text-xs leading-relaxed text-planora-navy">
              This is a rules-based starter draft, not an AI-generated plan yet. Your event is saved locally on this device; it is not synced to an account or cloud.
            </p>
            <button type="button" onClick={closeAndReset} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-planora-navy px-5 py-3.5 font-semibold text-white transition hover:bg-planora-ink">
              Back to Planora <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
            {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><CircleAlert size={18} className="mt-0.5 shrink-0" />{error}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field-label sm:col-span-2">
                Event name <span className="text-planora-danger">*</span>
                <input autoFocus required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aditi's 25th Birthday" className="field-input" />
              </label>
              <label className="field-label">
                Event type
                <select value={type} onChange={(e) => setType(e.target.value as EventType)} className="field-input">
                  <option>Wedding</option><option>Birthday</option><option>Anniversary</option><option>Community event</option><option>Other</option>
                </select>
              </label>
              <label className="field-label">
                Event date <span className="text-planora-danger">*</span>
                <input type="date" required min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className="field-input" />
              </label>
              <label className="field-label">
                Guest count <span className="text-planora-danger">*</span>
                <input type="number" required min="1" max="100000" step="1" value={guests} onChange={(e) => setGuests(e.target.value)} className="field-input" />
              </label>
              <label className="field-label">
                Total budget (₹) <span className="text-planora-danger">*</span>
                <input type="number" required min="1000" max="1000000000" step="500" value={budget} onChange={(e) => setBudget(e.target.value)} className="field-input" />
              </label>
              <label className="field-label sm:col-span-2">
                Venue or city <span className="font-normal text-planora-muted">(optional)</span>
                <input maxLength={120} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bhopal, Madhya Pradesh" className="field-input" />
              </label>
              <label className="field-label sm:col-span-2">
                Style, needs, or preferences <span className="font-normal text-planora-muted">(optional)</span>
                <textarea maxLength={1000} rows={3} value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="e.g. outdoor, vegetarian menu, accessible venue, minimalist decor..." className="field-input resize-y" />
                <span className="text-right text-xs font-normal text-planora-muted">{preferences.length}/1000</span>
              </label>
            </div>
            <div className="rounded-xl bg-planora-background p-3 text-xs leading-relaxed text-planora-muted">
              Your inputs stay in this browser for this prototype. No account, server, or AI provider is connected yet.
            </div>
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-planora-navy px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-planora-ink focus:outline-none focus:ring-4 focus:ring-planora-violet/20">
              Create my event plan <ArrowRight size={17} />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
