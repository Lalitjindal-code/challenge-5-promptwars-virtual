import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  type UpdateData
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
import {
  DEMO_EVENTS,
  DEMO_TASKS,
  DEMO_GUESTS,
  DEMO_VENDORS,
  DEMO_EXPENSES,
  DEMO_BUDGET
} from "../data/demoData";

export {
  DEMO_EVENTS,
  DEMO_TASKS,
  DEMO_GUESTS,
  DEMO_VENDORS,
  DEMO_EXPENSES,
  DEMO_BUDGET
};

export type {
  EventItem,
  DetailedTask,
  DetailedGuest,
  DetailedVendor,
  ExpenseTransaction,
  BudgetItem,
  ConceptItem
};

import { parseFirestoreDoc } from "../lib/firestoreUtils";

export { parseFirestoreDoc };

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

// Sample Data strictly reserved for Explicit Demo Mode (imported from src/data/demoData.ts)

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
      snap.forEach((d) => list.push(parseFirestoreDoc<DetailedTask>(d.id, activeEventId, d.data())));
      setTasks(list);
    }, (err) => console.warn("Tasks listener note:", err));

    const unsubGuests = onSnapshot(guestsRef, (snap) => {
      const list: DetailedGuest[] = [];
      snap.forEach((d) => list.push(parseFirestoreDoc<DetailedGuest>(d.id, activeEventId, d.data())));
      setGuests(list);
    }, (err) => console.warn("Guests listener note:", err));

    const unsubVendors = onSnapshot(vendorsRef, (snap) => {
      const list: DetailedVendor[] = [];
      snap.forEach((d) => list.push(parseFirestoreDoc<DetailedVendor>(d.id, activeEventId, d.data())));
      setVendors(list);
    }, (err) => console.warn("Vendors listener note:", err));

    const unsubExpenses = onSnapshot(expensesRef, (snap) => {
      const list: ExpenseTransaction[] = [];
      snap.forEach((d) => list.push(parseFirestoreDoc<ExpenseTransaction>(d.id, activeEventId, d.data())));
      setExpenses(list);
    }, (err) => console.warn("Expenses listener note:", err));

    const unsubBudget = onSnapshot(budgetRef, (snap) => {
      const list: BudgetItem[] = [];
      snap.forEach((d) => list.push(parseFirestoreDoc<BudgetItem>(d.id, activeEventId, d.data())));
      setBudgetItems(list);
    }, (err) => console.warn("Budget listener note:", err));

    const unsubAiConcepts = onSnapshot(aiConceptsRef, (snap) => {
      const list: ConceptItem[] = [];
      snap.forEach((d) => list.push(parseFirestoreDoc<ConceptItem>(d.id, activeEventId, d.data())));
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
    await updateDoc(doc(db, "users", user.uid, "events", id), updates as UpdateData<EventItem>);
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
    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "tasks", taskId), updates as UpdateData<DetailedTask>);
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
    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "guests", guestId), updates as UpdateData<DetailedGuest>);
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
    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "vendors", vendorId), updates as UpdateData<DetailedVendor>);
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
    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "expenses", expenseId), updates as UpdateData<ExpenseTransaction>);
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
    await updateDoc(doc(db, "users", user.uid, "events", targetEventId, "budgetItems", budgetId), updates as UpdateData<BudgetItem>);
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
