import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import { isFirebaseConfigured } from "../lib/firebase";
import { db } from "../lib/firestore";
import { useAuth } from "./AuthContext";
import type {
  EventItem,
  DetailedTask,
  DetailedGuest,
  DetailedVendor,
  ExpenseTransaction,
  BudgetItem,
  ConceptItem
} from "../types";
import { DEMO_CONCEPTS } from "../data/demoConcepts";

export type {
  EventItem,
  DetailedTask,
  DetailedGuest,
  DetailedVendor,
  ExpenseTransaction,
  BudgetItem,
  ConceptItem
};

interface EventContextType {
  events: EventItem[];
  activeEventId: string;
  activeEvent: EventItem | undefined;
  setActiveEventId: (id: string) => void;
  isLoading: boolean;
  isDemo: boolean;

  // Events CRUD
  createEvent: (event: Omit<EventItem, "id" | "spent" | "confirmedGuests" | "tasksCompleted" | "totalTasks">) => Promise<EventItem>;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Tasks
  tasks: DetailedTask[];
  addTask: (task: Omit<DetailedTask, "id" | "eventId" | "completed"> & { completed?: boolean }) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<DetailedTask>) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Guests
  guests: DetailedGuest[];
  addGuest: (guest: Omit<DetailedGuest, "id" | "eventId">) => Promise<void>;
  updateGuest: (guestId: string, updates: Partial<DetailedGuest>) => Promise<void>;
  deleteGuest: (guestId: string) => Promise<void>;

  // Vendors
  vendors: DetailedVendor[];
  addVendor: (vendor: Omit<DetailedVendor, "id" | "eventId">) => Promise<void>;
  updateVendor: (vendorId: string, updates: Partial<DetailedVendor>) => Promise<void>;
  deleteVendor: (vendorId: string) => Promise<void>;

  // Expenses & Budget
  expenses: ExpenseTransaction[];
  addExpense: (expense: Omit<ExpenseTransaction, "id" | "eventId">) => Promise<void>;
  updateExpense: (expenseId: string, updates: Partial<ExpenseTransaction>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;

  budgetItems: BudgetItem[];
  addBudgetItem: (item: Omit<BudgetItem, "id" | "eventId">) => Promise<void>;
  updateBudgetItem: (budgetId: string, updates: Partial<BudgetItem>) => Promise<void>;

  // Currency & Formatting
  currency: "INR" | "USD" | "EUR" | "GBP" | "AED";
  setCurrency: (cur: "INR" | "USD" | "EUR" | "GBP" | "AED") => void;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;

  // Saved AI Concepts
  savedAiConcepts: ConceptItem[];
  saveAiConcept: (concept: ConceptItem) => Promise<void>;
  removeAiConcept: (conceptId: string) => Promise<void>;
}

export const CURRENCY_CONFIG: Record<"INR" | "USD" | "EUR" | "GBP" | "AED", { symbol: string; locale: string; name: string }> = {
  INR: { symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
  USD: { symbol: "$", locale: "en-US", name: "US Dollar" },
  EUR: { symbol: "€", locale: "de-DE", name: "Euro" },
  GBP: { symbol: "£", locale: "en-GB", name: "British Pound" },
  AED: { symbol: "AED ", locale: "en-AE", name: "UAE Dirham" }
};

const EventContext = createContext<EventContextType | undefined>(undefined);

// Sample Data strictly reserved for Explicit Demo Mode (test@planora.ai / Demo Studio)
const DEMO_EVENTS: EventItem[] = [
  {
    id: "demo-evt-1",
    name: "Aarav & Priya Wedding",
    type: "Wedding",
    date: "15 Dec 2026",
    location: "The Grand Palace, Udaipur",
    budget: 4500000,
    spent: 3100000,
    guestsCount: 350,
    confirmedGuests: 290,
    tasksCompleted: 24,
    totalTasks: 35,
    status: "On Track",
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTQuJeIsnlwIWl57UH1okZNeamLOrEQLOQIY3B1mghlwMIqjBfx8ukFZYO0J6fvjAspPDYpJK7cBS1v7g66fQJ3GhUQ0YRaL9Yk_ZHBd1SC-qGyTdMBlNbdkC-w5wBc2xIAaSsBMxyB17SfZybnvYqd5WSLd2TlNgAK8NSBGRdZHUUUX3eOdUGwo-wfGIgOMHCL_-7hM69qKjbwU321OSaUSLFT_ZIwPe4fXu8MUeKsTCppIa3A8AjtA",
    description: "Royal destination wedding celebration with sangeet, mehendi, and traditional rituals."
  },
  {
    id: "demo-evt-2",
    name: "TechNova Community Gala 2026",
    type: "Community Event",
    date: "08 Dec 2026",
    location: "JW Marriott, Bengaluru",
    budget: 1500000,
    spent: 850000,
    guestsCount: 220,
    confirmedGuests: 180,
    tasksCompleted: 14,
    totalTasks: 20,
    status: "Planning",
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEbW2_bi2tIAq74DJ-AHa35uso9KWd_h6rAVdACkot8Gj3-qdhdq5FCF7ZmUVrDls71iLUrqPNAqmCqLn9WNGadIpjsR8cX66FsWbIemu9LFPV0x8eWI-QNxZTEZlaV0yA-97FOtxXmoHP6kwA5qC7nKlsA0aSLOipB4W-BBKXO_8OBdvdh2PgKpAStQxDfhbAuUtxzBzTh_ycOAcbrphlNKJfCIZ4YEX6Ed4jOieoimmDSeRLXJsk6A",
    description: "Annual community tech summit gala, open-source presentations, award night, and community networking dinner."
  },
  {
    id: "demo-evt-3",
    name: "Meera's 30th Birthday Bash",
    type: "Birthday",
    date: "22 Jan 2027",
    location: "Soho Rooftop, Mumbai",
    budget: 350000,
    spent: 120000,
    guestsCount: 65,
    confirmedGuests: 52,
    tasksCompleted: 8,
    totalTasks: 12,
    status: "Attention",
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqofFcKMCk0HPLfhHkXt6TFkyy9yEePQpKT_J5JGW6sII-tl_XrZfO5XU4nEGOKFBr3HMVjS042UKEGLlrM8_GwO2wvfOlOqdEhwFM6GBDxxaPIAbUKqoR35sU0GoqDG-b_NRDNBAcOMHUx2-zswbNc7TVA90s4GPQyy7W7Xi3B-9ow3wQiVMRV-hFNAjoj9Nf_pYVoCagBvPpc9qe8Eam8jVe1kA4KhsnigW7w2docyEmbIQNQAbcqw",
    description: "Boho chic neon evening, live acoustic band, craft cocktails, and curated dinner."
  }
];

const DEMO_TASKS: DetailedTask[] = [
  {
    id: "dt-1",
    eventId: "demo-evt-1",
    title: "Confirm wedding venue contract",
    subtitle: "Final clause review for Udaipur Palace load-in rules",
    event: "Aarav & Priya",
    dueDate: "Tomorrow, 24 Oct",
    dueLabel: "Tomorrow, 24 Oct",
    priority: "High",
    status: "In Progress",
    completed: false,
    assignee: { name: "Priya K.", initials: "PK", bg: "bg-secondary-fixed", text: "text-on-secondary-fixed" },
    category: "Legal & Contracts",
    description: "Review terms for Udaipur Heritage Palace including 2 AM curfew and noise ordinances.",
    subtasks: [
      { label: "Load-in timing and dock clearance", checked: true },
      { label: "Security deposit terms", checked: false }
    ]
  },
  {
    id: "dt-2",
    eventId: "demo-evt-1",
    title: "Finalize catering menu & tasting",
    subtitle: "Sample 6-course North Indian banquet menu",
    event: "Aarav & Priya",
    dueDate: "28 Oct 2026",
    priority: "Medium",
    status: "In Progress",
    completed: false,
    assignee: { name: "Alex M.", initials: "AM", bg: "bg-primary-container", text: "text-on-primary" },
    category: "Catering & Food",
    description: "Chef table tasting session with 4 dessert samplers.",
    subtasks: [
      { label: "Live chaat counter selection", checked: true },
      { label: "Custom mocktail menu review", checked: false }
    ]
  },
  {
    id: "dt-3",
    eventId: "demo-evt-1",
    title: "Confirm floral mandap theme with designer",
    subtitle: "Ivory and gold rajnigandha theme",
    event: "Aarav & Priya",
    dueDate: "05 Nov 2026",
    priority: "High",
    status: "Completed",
    completed: true,
    assignee: { name: "Priya K.", initials: "PK", bg: "bg-secondary-fixed", text: "text-on-secondary-fixed" },
    category: "Decor & Production"
  },
  {
    id: "dt-4",
    eventId: "demo-evt-2",
    title: "Finalize keynote AV & livestream stage",
    subtitle: "Coordinate multi-camera 4K switcher rig",
    event: "TechFest 2026",
    dueDate: "10 Nov 2026",
    priority: "High",
    status: "In Progress",
    completed: false,
    assignee: { name: "Rohan M.", initials: "RM", bg: "bg-primary-container", text: "text-on-primary" },
    category: "AV & Technology"
  },
  {
    id: "dt-5",
    eventId: "demo-evt-3",
    title: "Order custom neon installation & photo backdrop",
    subtitle: "Retro arcade neon aesthetic with floral base",
    event: "Meera's 30th",
    dueDate: "18 Nov 2026",
    priority: "Medium",
    status: "Completed",
    completed: true,
    assignee: { name: "Priya K.", initials: "PK", bg: "bg-secondary-fixed", text: "text-on-secondary-fixed" },
    category: "Decor & Styling"
  }
];

const DEMO_GUESTS: DetailedGuest[] = [
  {
    id: "dg-1",
    eventId: "demo-evt-1",
    name: "Priya Kapoor",
    avatar: "PK",
    isVip: true,
    email: "priya.k@example.com",
    phone: "+91 98201 44102",
    cohort: "VIP",
    event: "Aarav & Priya Wedding",
    partySize: 2,
    plusOne: "Sameer Kapoor (Spouse)",
    status: "Confirmed",
    dispatchStatus: "Delivered & Opened",
    dietary: "Pure Vegetarian (Jain Option)",
    table: "Table 04 — Royal Court",
    specialRequest: "Golf cart shuttle requested upon arrival."
  },
  {
    id: "dg-2",
    eventId: "demo-evt-1",
    name: "Arjun Mehta",
    avatar: "AM",
    email: "arjun.m@example.com",
    phone: "+91 97112 55890",
    cohort: "Friends",
    event: "Aarav & Priya Wedding",
    partySize: 1,
    status: "Awaiting Response",
    dispatchStatus: "Delivered",
    dietary: "Standard Catering",
    table: "Table 09 — Groom's Circle"
  },
  {
    id: "dg-3",
    eventId: "demo-evt-1",
    name: "Rohan Malhotra",
    avatar: "RM",
    email: "rohan@gmail.com",
    phone: "+91 98765 43210",
    cohort: "Family",
    event: "Aarav & Priya Wedding",
    partySize: 2,
    status: "Confirmed",
    dispatchStatus: "Delivered & Opened",
    dietary: "Vegetarian",
    table: "Table 01 — Family"
  },
  {
    id: "dg-4",
    eventId: "demo-evt-2",
    name: "Dr. Vikram Sen",
    avatar: "VS",
    isVip: true,
    email: "vikram.sen@techsummit.example",
    phone: "+91 98110 33445",
    cohort: "VIP",
    event: "TechFest Global Summit 2026",
    partySize: 1,
    status: "Confirmed",
    dispatchStatus: "Delivered & Opened",
    dietary: "Vegan",
    table: "Stage Panel A"
  },
  {
    id: "dg-5",
    eventId: "demo-evt-3",
    name: "Ananya Roy",
    avatar: "AR",
    email: "ananya.roy@example.com",
    phone: "+91 98450 11223",
    cohort: "Friends",
    event: "Meera's 30th Birthday Gala",
    partySize: 2,
    status: "Confirmed",
    dispatchStatus: "Delivered",
    dietary: "Standard Catering",
    table: "Lounge Booth 02"
  }
];

const DEMO_VENDORS: DetailedVendor[] = [
  {
    id: "dv-1",
    eventId: "demo-evt-1",
    name: "Royal Palace Events",
    category: "Venue",
    location: "Lake Pichola Road, Udaipur, Rajasthan",
    rating: 4.9,
    reviewCount: 42,
    event: "Aarav & Priya Wedding",
    tags: ["Heritage", "Lakeview", "450 Cap"],
    cost: 1500000,
    paidAmount: 900000,
    status: "Booked • Adv. Paid",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD84hI89HU0-gXS60ebF2HVREdmPyBHchcdjM1k9DXHGlfRBYTfzZjyk0kIRU2dr1Ulw_vsdmLuIe-jHgv6QGwjTrISspxdk63yiC4GMLR8VpELARydhrDU17JV7uOITyc5eZoyu62n2edC0dw_vIHoKYVWclq8NJIRaYgf2K457AhdGS1duppQBL-M1KIm2o5ATVMESQX_2-W7gtZf1kfMKLz3Yhc4H9yKo8g1YIvK9XvhqtDJV_Lb_g",
    contactName: "Rajesh Shekhawat",
    contactRole: "General Manager",
    contactPhone: "+91 98290 44210",
    contactEmail: "r.shekhawat@palace-events.example",
    inclusions: ["Grand Courtyard", "Indoor Darbar Hall", "Valet parking"],
    advisoryText: "Sound curfew enforced at 10:00 PM.",
    notes: "Security deposit clearance verified with accounts team."
  },
  {
    id: "dv-2",
    eventId: "demo-evt-1",
    name: "FlavourCraft Catering",
    category: "Catering",
    location: "Civil Lines, Udaipur",
    rating: 4.8,
    reviewCount: 38,
    event: "Aarav & Priya Wedding",
    tags: ["North Indian", "Rajasthani Thali", "Live Chaat"],
    cost: 900000,
    paidAmount: 450000,
    status: "Booked • Tasting Done",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjtMEkzs-csDkMQdyCr8uDOlLVPhxrSGA-6LQgZx09K1IuEMwG6VA7iYSE8wj6wpAYayw8CTKHxyOHZkJyJ8q3xUr_Vylxub5Nd-983RjRGl_sgIwkQU2S0DzgMXEhpxF5VEzQamt4ylrGGGS36GFxRI6SwXH2-4IBsWuTaYml0_gzVH8V1-RRKrRsXptJlPRSWP537WiEjofeIUIrq85ZoUswtW-tVQ-V5GlmiLka8csQigIQ8Ko-Jw",
    contactName: "Chef Sanjeev Mehra",
    contactRole: "Head of Culinary",
    contactPhone: "+91 98201 55678",
    contactEmail: "sanjeev@flavourcraft.example",
    inclusions: ["6-course royal banquet", "Live counters", "Mocktail bar"],
    advisoryText: "Schedule live chaat alongside cocktail hour.",
    notes: "Tasting approved by couple on Oct 18."
  },
  {
    id: "dv-3",
    eventId: "demo-evt-2",
    name: "Bengaluru AV Solutions",
    category: "Logistics & AV",
    location: "Koramangala, Bengaluru",
    rating: 4.9,
    reviewCount: 56,
    event: "TechFest Global Summit 2026",
    tags: ["LED Wall", "Livestream", "4K Switching"],
    cost: 400000,
    paidAmount: 250000,
    status: "Booked • Adv. Paid",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3NPKsZBnzdxz0TIPVopESyM0iEFaFKWYmCmNEoYEx8Pyf4RDKkjqLwEwwq9I5bl2oueVmK_LCtovN0F71YHmDGZE6kL9qYsnrvqGflGHGPTGfUepZVo_qgy7vs1wzql5aK2-sV2NWEEFD3jxRlur6fHKmPF1IcT7pKT9Bv4vjoSxWPGTlV16U95WLvsBCg8SZziTxkexAtFJY5ABQuSxD6zRmdyUxieF2GdnD-x2-FNqeBjpF89Z12w",
    contactName: "Manoj Nair",
    contactRole: "Technical Director",
    contactPhone: "+91 98450 67890",
    contactEmail: "manoj@bengaluru-av.example",
    inclusions: ["32x12ft P2.5 LED Display", "Line Array Audio Rig", "4K Robotic Cameras"],
    advisoryText: "Complete staging check at 7:00 AM on summit day.",
    notes: "Stage load-in scheduled for 09 Nov."
  },
  {
    id: "dv-4",
    eventId: "demo-evt-3",
    name: "Neon Lights & Flora Studio",
    category: "Decoration",
    location: "Indiranagar, Bengaluru",
    rating: 4.7,
    reviewCount: 29,
    event: "Meera's 30th Birthday Gala",
    tags: ["Custom Neon", "Photobooth", "Floral Base"],
    cost: 120000,
    paidAmount: 60000,
    status: "Shortlisted",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxvPSrf5c_80oC0yfbzSOHd_dsK0zZQ1jNoBGjEqbFI2z-L-muEehazjl2QKnYu3WS1_kKajbtaP9UcVMYLuwVVXMCtKgJ1ByzY8eesO0X1buXSvbiCEYNOh0AYjR0z7w0oUGP_pZvFOe3JZBxVcXk3dK6EeRFcInmpCGHs2ZRUwg8AwsYUMC9BQf93siWj8FxqLXiDRa1sG6o6zdl1KT2ycbfFho4UW2NTmMhO45RVBBAbJ2YguIjdQ",
    contactName: "Ayesha Khan",
    contactRole: "Creative Lead",
    contactPhone: "+91 98860 12345",
    contactEmail: "ayesha@neonflora.example",
    inclusions: ["Custom 'Meera @ 30' Neon sign", "Interactive photo booth", "Ambient floor lamps"],
    advisoryText: "Photo backdrop requires dedicated 15A power socket.",
    notes: "Color mockups approved."
  }
];

const DEMO_EXPENSES: ExpenseTransaction[] = [
  {
    id: "de-1",
    eventId: "demo-evt-1",
    name: "Palace Venue Advance",
    event: "Aarav & Priya Wedding",
    category: "Venue",
    date: "18 Oct 2026",
    amount: 900000,
    status: "Paid",
    vendor: "Royal Palace Events",
    icon: "domain"
  },
  {
    id: "de-2",
    eventId: "demo-evt-1",
    name: "Catering Tasting & Menu Deposit",
    event: "Aarav & Priya Wedding",
    category: "Catering",
    date: "14 Oct 2026",
    amount: 450000,
    status: "Paid",
    vendor: "FlavourCraft Catering",
    icon: "dinner_dining"
  },
  {
    id: "de-3",
    eventId: "demo-evt-1",
    name: "Floral Decoration Retainer",
    event: "Aarav & Priya Wedding",
    category: "Decoration",
    date: "12 Oct 2026",
    amount: 250000,
    status: "Pending",
    vendor: "Bloom & Foliage Decor",
    icon: "local_florist"
  },
  {
    id: "de-4",
    eventId: "demo-evt-2",
    name: "Convention Center Hall A Advance",
    event: "TechFest Global Summit 2026",
    category: "Venue",
    date: "20 Oct 2026",
    amount: 500000,
    status: "Paid",
    vendor: "Bengaluru Convention Centre",
    icon: "domain"
  },
  {
    id: "de-5",
    eventId: "demo-evt-3",
    name: "Rooftop Lounge Reservation Fee",
    event: "Meera's 30th Birthday Gala",
    category: "Venue",
    date: "22 Oct 2026",
    amount: 100000,
    status: "Paid",
    vendor: "Skyline Lounge Indiranagar",
    icon: "domain"
  }
];

const DEMO_BUDGET: BudgetItem[] = [
  { id: "db-1", eventId: "demo-evt-1", category: "Venue & Stay", allocated: 1800000, spent: 1500000, notes: "Heritage palace resort booking" },
  { id: "db-2", eventId: "demo-evt-1", category: "Catering & Bar", allocated: 1200000, spent: 900000, notes: "Multi-cuisine live counters" },
  { id: "db-3", eventId: "demo-evt-1", category: "Decor & Production", allocated: 700000, spent: 450000, notes: "Floral & ambient lighting" },
  { id: "db-4", eventId: "demo-evt-1", category: "Photo & Cinematography", allocated: 450000, spent: 250000, notes: "Candid & drone team" },
  { id: "db-5", eventId: "demo-evt-1", category: "Contingency / Buffer", allocated: 350000, spent: 0, notes: "Emergency reserve" },
  { id: "db-6", eventId: "demo-evt-2", category: "Stage, Rigging & AV", allocated: 600000, spent: 400000, notes: "Keynote presentation stage" },
  { id: "db-7", eventId: "demo-evt-2", category: "Delegate Catering & Lunch", allocated: 400000, spent: 300000, notes: "Lunch buffet & coffee stations" },
  { id: "db-8", eventId: "demo-evt-3", category: "Rooftop Booking & Cocktails", allocated: 200000, spent: 120000, notes: "Open bar and lounge seating" },
  { id: "db-9", eventId: "demo-evt-3", category: "Styling, DJ & Sound", allocated: 150000, spent: 60000, notes: "Neon aesthetic and sound engineer" }
];

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const isDemo = Boolean(user?.isDemo);

  // In-memory demo data stores to ensure true data isolation between demo events and sessions
  const [demoEvents, setDemoEvents] = useState<EventItem[]>(DEMO_EVENTS);
  const [demoTasks, setDemoTasks] = useState<DetailedTask[]>(DEMO_TASKS);
  const [demoGuests, setDemoGuests] = useState<DetailedGuest[]>(DEMO_GUESTS);
  const [demoVendors, setDemoVendors] = useState<DetailedVendor[]>(DEMO_VENDORS);
  const [demoExpenses, setDemoExpenses] = useState<ExpenseTransaction[]>(DEMO_EXPENSES);
  const [demoBudget, setDemoBudget] = useState<BudgetItem[]>(DEMO_BUDGET);
  const [demoAiConcepts, setDemoAiConcepts] = useState<ConceptItem[]>(DEMO_CONCEPTS.filter((c) => c.saved));

  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeEventId, setActiveEventId] = useState<string>("");
  const [tasks, setTasks] = useState<DetailedTask[]>([]);
  const [guests, setGuests] = useState<DetailedGuest[]>([]);
  const [vendors, setVendors] = useState<DetailedVendor[]>([]);
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [savedAiConcepts, setSavedAiConcepts] = useState<ConceptItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Global Workspace Currency State
  const [currency, setCurrencyState] = useState<"INR" | "USD" | "EUR" | "GBP" | "AED">(() => {
    try {
      const saved = localStorage.getItem("planora_currency");
      if (saved && ["INR", "USD", "EUR", "GBP", "AED"].includes(saved)) {
        return saved as "INR" | "USD" | "EUR" | "GBP" | "AED";
      }
      const settingsRaw = localStorage.getItem("planora_workspace_settings");
      if (settingsRaw) {
        const parsed = JSON.parse(settingsRaw);
        if (parsed.currency && ["INR", "USD", "EUR", "GBP", "AED"].includes(parsed.currency)) {
          return parsed.currency;
        }
      }
    } catch {}
    return "INR";
  });

  const setCurrency = (cur: "INR" | "USD" | "EUR" | "GBP" | "AED") => {
    setCurrencyState(cur);
    try {
      localStorage.setItem("planora_currency", cur);
      const existing = JSON.parse(localStorage.getItem("planora_workspace_settings") || "{}");
      localStorage.setItem("planora_workspace_settings", JSON.stringify({ ...existing, currency: cur }));
    } catch {}
  };

  const currencySymbol = CURRENCY_CONFIG[currency]?.symbol || "₹";

  const formatCurrency = (amount: number) => {
    const conf = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;
    return `${conf.symbol}${Math.round(amount || 0).toLocaleString(conf.locale)}`;
  };

  // 1. Sync User's Events on Login / Logout
  useEffect(() => {
    // A. User logged out: PURGE all memory state immediately and reset demo stores
    if (!user) {
      setEvents([]);
      setActiveEventId("");
      setTasks([]);
      setGuests([]);
      setVendors([]);
      setExpenses([]);
      setBudgetItems([]);
      setSavedAiConcepts([]);
      setDemoEvents(DEMO_EVENTS);
      setDemoTasks(DEMO_TASKS);
      setDemoGuests(DEMO_GUESTS);
      setDemoVendors(DEMO_VENDORS);
      setDemoExpenses(DEMO_EXPENSES);
      setDemoBudget(DEMO_BUDGET);
      setDemoAiConcepts(DEMO_CONCEPTS.filter((c) => c.saved));
      setIsLoading(false);
      return;
    }

    // B. Explicit Demo User Session: Load demo datasets
    if (isDemo) {
      setEvents(demoEvents);
      setActiveEventId((prev) => (prev && demoEvents.some((e) => e.id === prev) ? prev : demoEvents[0]?.id || ""));
      setIsLoading(false);
      return;
    }

    // C. Real Authenticated User: Load live data from Cloud Firestore
    if (isFirebaseConfigured && db) {
      setIsLoading(true);
      const eventsRef = collection(db, "users", user.uid, "events");

      const unsubscribe = onSnapshot(
        eventsRef,
        (snapshot) => {
          const loadedEvents: EventItem[] = [];
          snapshot.forEach((docSnap) => {
            loadedEvents.push({ id: docSnap.id, ...(docSnap.data() as Omit<EventItem, "id">) });
          });

          // Sort by creation or date
          setEvents(loadedEvents);
          setActiveEventId((prev) => {
            if (prev && loadedEvents.some((e) => e.id === prev)) return prev;
            return loadedEvents[0]?.id || "";
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Firestore events sync error:", error);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Unconfigured Firebase fallback for real user: start with empty workspace
      setEvents([]);
      setActiveEventId("");
      setIsLoading(false);
    }
  }, [user?.uid, isDemo]);

  // 2. Sync Subcollections for Active Event (Strictly isolated by activeEventId)
  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      // Filter demo data strictly by active event id - NO fallback/leakage of demo-evt-1 into other events!
      setTasks(demoTasks.filter((t) => t.eventId === activeEventId));
      setGuests(demoGuests.filter((g) => g.eventId === activeEventId));
      setVendors(demoVendors.filter((v) => v.eventId === activeEventId));
      setExpenses(demoExpenses.filter((e) => e.eventId === activeEventId));
      setBudgetItems(demoBudget.filter((b) => b.eventId === activeEventId));
      setSavedAiConcepts(demoAiConcepts.filter((c) => !c.eventId || c.eventId === activeEventId));
      return;
    }

    if (!activeEventId || !isFirebaseConfigured || !db) {
      setTasks([]);
      setGuests([]);
      setVendors([]);
      setExpenses([]);
      setBudgetItems([]);
      setSavedAiConcepts([]);
      return;
    }

    // Live real-time Firestore listeners scoped to /users/{uid}/events/{activeEventId}/{subcollection}
    const firestore = db;
    const tasksRef = collection(firestore, "users", user.uid, "events", activeEventId, "tasks");
    const guestsRef = collection(firestore, "users", user.uid, "events", activeEventId, "guests");
    const vendorsRef = collection(firestore, "users", user.uid, "events", activeEventId, "vendors");
    const expensesRef = collection(firestore, "users", user.uid, "events", activeEventId, "expenses");
    const budgetRef = collection(firestore, "users", user.uid, "events", activeEventId, "budgetItems");
    const aiConceptsRef = collection(firestore, "users", user.uid, "events", activeEventId, "aiConcepts");

    const unsubTasks = onSnapshot(tasksRef, (snap) => {
      const list: DetailedTask[] = [];
      snap.forEach((d) => list.push({ id: d.id, eventId: activeEventId, ...(d.data() as any) }));
      setTasks(list);
    }, (err) => console.warn("Tasks listener note:", err));

    const unsubGuests = onSnapshot(guestsRef, (snap) => {
      const list: DetailedGuest[] = [];
      snap.forEach((d) => list.push({ id: d.id, eventId: activeEventId, ...(d.data() as any) }));
      setGuests(list);
    }, (err) => console.warn("Guests listener note:", err));

    const unsubVendors = onSnapshot(vendorsRef, (snap) => {
      const list: DetailedVendor[] = [];
      snap.forEach((d) => list.push({ id: d.id, eventId: activeEventId, ...(d.data() as any) }));
      setVendors(list);
    }, (err) => console.warn("Vendors listener note:", err));

    const unsubExpenses = onSnapshot(expensesRef, (snap) => {
      const list: ExpenseTransaction[] = [];
      snap.forEach((d) => list.push({ id: d.id, eventId: activeEventId, ...(d.data() as any) }));
      setExpenses(list);
    }, (err) => console.warn("Expenses listener note:", err));

    const unsubBudget = onSnapshot(budgetRef, (snap) => {
      const list: BudgetItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, eventId: activeEventId, ...(d.data() as any) }));
      setBudgetItems(list);
    }, (err) => console.warn("Budget listener note:", err));

    const unsubAiConcepts = onSnapshot(aiConceptsRef, (snap) => {
      const list: ConceptItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, eventId: activeEventId, ...(d.data() as any) }));
      setSavedAiConcepts(list);
    }, (err) => console.warn("AI Concepts listener note:", err));

    return () => {
      unsubTasks();
      unsubGuests();
      unsubVendors();
      unsubExpenses();
      unsubBudget();
      unsubAiConcepts();
    };
  }, [user?.uid, activeEventId, isDemo, demoTasks, demoGuests, demoVendors, demoExpenses, demoBudget, demoAiConcepts]);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  // --- CRUD: EVENTS ---
  const createEvent = async (data: Omit<EventItem, "id" | "spent" | "confirmedGuests" | "tasksCompleted" | "totalTasks">): Promise<EventItem> => {
    const newId = "evt-" + Date.now();
    const newEvent: EventItem = {
      ...data,
      id: newId,
      spent: 0,
      confirmedGuests: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      createdAt: new Date().toISOString()
    };

    if (isDemo || !isFirebaseConfigured || !db || !user) {
      setDemoEvents((prev) => [newEvent, ...prev]);
      setEvents((prev) => [newEvent, ...prev]);
      setActiveEventId(newId);
      return newEvent;
    }

    await setDoc(doc(db, "users", user.uid, "events", newId), newEvent);
    setActiveEventId(newId);
    return newEvent;
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    if (isDemo || !isFirebaseConfigured || !db || !user) {
      setDemoEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
      return;
    }
    await updateDoc(doc(db, "users", user.uid, "events", id), updates as any);
  };

  const deleteEvent = async (id: string) => {
    if (isDemo || !isFirebaseConfigured || !db || !user) {
      setDemoEvents((prev) => prev.filter((e) => e.id !== id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
      if (activeEventId === id) setActiveEventId(events.find((e) => e.id !== id)?.id || "");
      return;
    }
    await deleteDoc(doc(db, "users", user.uid, "events", id));
  };

  // --- CRUD: TASKS ---
  const addTask = async (task: Omit<DetailedTask, "id" | "eventId" | "completed"> & { completed?: boolean }) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (!targetEventId) throw new Error("No active event selected to attach task.");

    const newId = "task-" + Date.now();
    const newTask: DetailedTask = {
      ...task,
      id: newId,
      eventId: targetEventId,
      completed: task.status === "Completed"
    };

    if (isDemo || !isFirebaseConfigured || !db || !user) {
      setDemoTasks((prev) => [newTask, ...prev]);
      setTasks((prev) => [newTask, ...prev]);
      return;
    }

    await setDoc(doc(db, "users", user.uid, "events", targetEventId, "tasks", newId), newTask);
  };

  const toggleTask = async (taskId: string) => {
    const targetEventId = activeEventId || events[0]?.id;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextCompleted = !task.completed;
    const nextStatus: DetailedTask["status"] = nextCompleted ? "Completed" : "In Progress";

    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted, status: nextStatus } : t))
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted, status: nextStatus } : t))
      );
      return;
    }

    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "tasks", taskId), {
      completed: nextCompleted,
      status: nextStatus
    });
  };

  const updateTask = async (taskId: string, updates: Partial<DetailedTask>) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
      return;
    }
    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "tasks", taskId), updates as any);
  };

  const deleteTask = async (taskId: string) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoTasks((prev) => prev.filter((t) => t.id !== taskId));
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      return;
    }
    await deleteDoc(doc(db, "users", user.uid, "events", targetEventId, "tasks", taskId));
  };

  // --- CRUD: GUESTS ---
  const addGuest = async (guest: Omit<DetailedGuest, "id" | "eventId">) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (!targetEventId) throw new Error("No active event selected to attach guest.");

    const newId = "g-" + Date.now();
    const newGuest: DetailedGuest = {
      ...guest,
      id: newId,
      eventId: targetEventId
    };

    if (isDemo || !isFirebaseConfigured || !db || !user) {
      setDemoGuests((prev) => [newGuest, ...prev]);
      setGuests((prev) => [newGuest, ...prev]);
      return;
    }

    await setDoc(doc(db, "users", user.uid, "events", targetEventId, "guests", newId), newGuest);
  };

  const updateGuest = async (guestId: string, updates: Partial<DetailedGuest>) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, ...updates } : g)));
      setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, ...updates } : g)));
      return;
    }
    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "guests", guestId), updates as any);
  };

  const deleteGuest = async (guestId: string) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoGuests((prev) => prev.filter((g) => g.id !== guestId));
      setGuests((prev) => prev.filter((g) => g.id !== guestId));
      return;
    }
    await deleteDoc(doc(db, "users", user.uid, "events", targetEventId, "guests", guestId));
  };

  // --- CRUD: VENDORS ---
  const addVendor = async (vendor: Omit<DetailedVendor, "id" | "eventId">) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (!targetEventId) throw new Error("No active event selected to attach vendor.");

    const newId = "v-" + Date.now();
    const newVendor: DetailedVendor = {
      ...vendor,
      id: newId,
      eventId: targetEventId
    };

    if (isDemo || !isFirebaseConfigured || !db || !user) {
      setDemoVendors((prev) => [newVendor, ...prev]);
      setVendors((prev) => [newVendor, ...prev]);
      return;
    }

    await setDoc(doc(db, "users", user.uid, "events", targetEventId, "vendors", newId), newVendor);
  };

  const updateVendor = async (vendorId: string, updates: Partial<DetailedVendor>) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, ...updates } : v)));
      setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, ...updates } : v)));
      return;
    }
    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "vendors", vendorId), updates as any);
  };

  const deleteVendor = async (vendorId: string) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoVendors((prev) => prev.filter((v) => v.id !== vendorId));
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
      return;
    }
    await deleteDoc(doc(db, "users", user.uid, "events", targetEventId, "vendors", vendorId));
  };

  // --- CRUD: EXPENSES & BUDGET ---
  const addExpense = async (expense: Omit<ExpenseTransaction, "id" | "eventId">) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (!targetEventId) throw new Error("No active event selected to attach expense.");

    const newId = "tx-" + Date.now();
    const newExpense: ExpenseTransaction = {
      ...expense,
      id: newId,
      eventId: targetEventId
    };

    if (isDemo || !isFirebaseConfigured || !db || !user) {
      setDemoExpenses((prev) => [newExpense, ...prev]);
      setExpenses((prev) => [newExpense, ...prev]);
      return;
    }

    await setDoc(doc(db, "users", user.uid, "events", targetEventId, "expenses", newId), newExpense);
  };

  const updateExpense = async (expenseId: string, updates: Partial<ExpenseTransaction>) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoExpenses((prev) => prev.map((e) => (e.id === expenseId ? { ...e, ...updates } : e)));
      setExpenses((prev) => prev.map((e) => (e.id === expenseId ? { ...e, ...updates } : e)));
      return;
    }
    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "expenses", expenseId), updates as any);
  };

  const deleteExpense = async (expenseId: string) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      return;
    }
    await deleteDoc(doc(db, "users", user.uid, "events", targetEventId, "expenses", expenseId));
  };

  const addBudgetItem = async (item: Omit<BudgetItem, "id" | "eventId">) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (!targetEventId) throw new Error("No active event selected to attach budget category.");

    const newId = "b-" + Date.now();
    const newItem: BudgetItem = {
      ...item,
      id: newId,
      eventId: targetEventId
    };

    if (isDemo || !isFirebaseConfigured || !db || !user) {
      setDemoBudget((prev) => [newItem, ...prev]);
      setBudgetItems((prev) => [newItem, ...prev]);
      return;
    }

    await setDoc(doc(db, "users", user.uid, "events", targetEventId, "budgetItems", newId), newItem);
  };

  const updateBudgetItem = async (budgetId: string, updates: Partial<BudgetItem>) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoBudget((prev) => prev.map((b) => (b.id === budgetId ? { ...b, ...updates } : b)));
      setBudgetItems((prev) => prev.map((b) => (b.id === budgetId ? { ...b, ...updates } : b)));
      return;
    }
    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "budgetItems", budgetId), updates as any);
  };

  // --- CRUD: AI CONCEPTS ---
  const saveAiConcept = async (concept: ConceptItem) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (!targetEventId) throw new Error("No active event selected to save concept.");

    const conceptToSave: ConceptItem = {
      ...concept,
      eventId: targetEventId,
      saved: true,
      savedAt: new Date().toISOString()
    };

    if (isDemo || !isFirebaseConfigured || !db || !user) {
      setDemoAiConcepts((prev) => [conceptToSave, ...prev.filter((c) => c.id !== concept.id)]);
      setSavedAiConcepts((prev) => [conceptToSave, ...prev.filter((c) => c.id !== concept.id)]);
      return;
    }

    await setDoc(doc(db, "users", user.uid, "events", targetEventId, "aiConcepts", concept.id), conceptToSave);
  };

  const removeAiConcept = async (conceptId: string) => {
    const targetEventId = activeEventId || events[0]?.id;
    if (isDemo || !isFirebaseConfigured || !db || !user || !targetEventId) {
      setDemoAiConcepts((prev) => prev.filter((c) => c.id !== conceptId));
      setSavedAiConcepts((prev) => prev.filter((c) => c.id !== conceptId));
      return;
    }
    await deleteDoc(doc(db, "users", user.uid, "events", targetEventId, "aiConcepts", conceptId));
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEventId,
        activeEvent,
        setActiveEventId,
        isLoading,
        isDemo,
        createEvent,
        updateEvent,
        deleteEvent,
        tasks,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        guests,
        addGuest,
        updateGuest,
        deleteGuest,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        budgetItems,
        addBudgetItem,
        updateBudgetItem,
        savedAiConcepts,
        saveAiConcept,
        removeAiConcept,
        currency,
        setCurrency,
        currencySymbol,
        formatCurrency
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
}
