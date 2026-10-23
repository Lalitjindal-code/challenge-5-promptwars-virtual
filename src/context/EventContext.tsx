import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { useAuth } from "./AuthContext";

export interface EventItem {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  budget: number;
  spent: number;
  guestsCount: number;
  confirmedGuests: number;
  tasksCompleted: number;
  totalTasks: number;
  status: "Planning" | "On Track" | "Attention" | "Completed";
  coverImage?: string;
  description?: string;
}

export interface TaskItem {
  id: string;
  eventId: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  assignedTo?: string;
  priority: "High" | "Medium" | "Low";
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: string;
  allocated: number;
  spent: number;
  notes?: string;
}

export interface GuestItem {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  status: "Confirmed" | "Invited" | "Declined";
  table?: string;
  dietary?: string;
}

export interface VendorItem {
  id: string;
  eventId: string;
  name: string;
  service: string;
  cost: number;
  status: "Booked" | "In Review" | "Shortlisted";
  rating: number;
  contact: string;
}

interface EventContextType {
  events: EventItem[];
  activeEventId: string;
  activeEvent: EventItem | undefined;
  setActiveEventId: (id: string) => void;
  createEvent: (event: Omit<EventItem, "id" | "spent" | "confirmedGuests" | "tasksCompleted" | "totalTasks">) => EventItem;
  tasks: TaskItem[];
  toggleTask: (taskId: string) => void;
  addTask: (task: Omit<TaskItem, "id">) => void;
  budgetItems: BudgetItem[];
  guests: GuestItem[];
  addGuest: (guest: Omit<GuestItem, "id">) => void;
  vendors: VendorItem[];
  isDemo: boolean;
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    name: "Aarav & Priya Wedding",
    type: "Wedding",
    date: "Nov 15, 2025",
    location: "The Grand Palace, Udaipur",
    budget: 4500000,
    spent: 3100000,
    guestsCount: 350,
    confirmedGuests: 290,
    tasksCompleted: 24,
    totalTasks: 35,
    status: "On Track",
    description: "Royal destination wedding celebration with sangeet, mehendi, and traditional rituals."
  },
  {
    id: "evt-2",
    name: "TechNova Annual Gala 2025",
    type: "Corporate",
    date: "Dec 08, 2025",
    location: "JW Marriott, Bengaluru",
    budget: 1500000,
    spent: 850000,
    guestsCount: 220,
    confirmedGuests: 180,
    tasksCompleted: 14,
    totalTasks: 20,
    status: "Planning",
    description: "High-energy tech summit gala, keynote sessions, award night, and cocktail dinner."
  },
  {
    id: "evt-3",
    name: "Meera's 30th Birthday Bash",
    type: "Birthday",
    date: "Jan 22, 2026",
    location: "Soho Rooftop, Mumbai",
    budget: 350000,
    spent: 120000,
    guestsCount: 65,
    confirmedGuests: 52,
    tasksCompleted: 8,
    totalTasks: 12,
    status: "Attention",
    description: "Boho chic neon evening, live acoustic band, craft cocktails, and curated dinner."
  }
];

const INITIAL_TASKS: TaskItem[] = [
  { id: "t-1", eventId: "evt-1", title: "Finalize Royal Banquet contract", category: "Venue", dueDate: "Oct 28", completed: true, priority: "High" },
  { id: "t-2", eventId: "evt-1", title: "Sample catering degustation menu", category: "Catering", dueDate: "Nov 02", completed: true, priority: "High" },
  { id: "t-3", eventId: "evt-1", title: "Confirm floral mandap theme with designer", category: "Decor", dueDate: "Nov 05", completed: false, priority: "High" },
  { id: "t-4", eventId: "evt-1", title: "Send digital RSVP reminders to VIP guests", category: "Guests", dueDate: "Nov 07", completed: false, priority: "Medium" },
  { id: "t-5", eventId: "evt-1", title: "Book sangeet sound and light technician", category: "Entertainment", dueDate: "Nov 10", completed: false, priority: "Medium" }
];

const INITIAL_BUDGET: BudgetItem[] = [
  { id: "b-1", eventId: "evt-1", category: "Venue & Stay", allocated: 1800000, spent: 1500000, notes: "Heritage palace resort booking" },
  { id: "b-2", eventId: "evt-1", category: "Catering & Bar", allocated: 1200000, spent: 900000, notes: "Multi-cuisine live counters" },
  { id: "b-3", eventId: "evt-1", category: "Decor & Production", allocated: 700000, spent: 450000, notes: "Floral & ambient lighting" },
  { id: "b-4", eventId: "evt-1", category: "Photo & Cinematography", allocated: 450000, spent: 250000, notes: "Candid & drone team" },
  { id: "b-5", eventId: "evt-1", category: "Contingency / Buffer", allocated: 350000, spent: 0, notes: "Emergency reserve" }
];

const INITIAL_GUESTS: GuestItem[] = [
  { id: "g-1", eventId: "evt-1", name: "Rohan Malhotra", email: "rohan@gmail.com", phone: "+91 98765 43210", status: "Confirmed", table: "Table 1 (Family)", dietary: "Vegetarian" },
  { id: "g-2", eventId: "evt-1", name: "Ananya Sharma", email: "ananya@live.com", phone: "+91 98234 11223", status: "Confirmed", table: "Table 1 (Family)", dietary: "Jain" },
  { id: "g-3", eventId: "evt-1", name: "Vikram Sengupta", email: "vikram@tech.co", phone: "+91 91234 56789", status: "Invited", table: "Table 4 (Friends)", dietary: "Non-Veg" },
  { id: "g-4", eventId: "evt-1", name: "Dr. Sunita Kapoor", email: "drsunita@aiims.org", phone: "+91 99887 76655", status: "Confirmed", table: "Table 2 (VIP)", dietary: "Vegan" },
  { id: "g-5", eventId: "evt-1", name: "Kunal Bansal", email: "kbansal@fin.com", phone: "+91 97766 55443", status: "Declined", table: "-", dietary: "None" }
];

const INITIAL_VENDORS: VendorItem[] = [
  { id: "v-1", eventId: "evt-1", name: "The Grand Palace Udaipur", service: "Venue & Hospitality", cost: 1500000, status: "Booked", rating: 4.9, contact: "+91 294 242 1100" },
  { id: "v-2", eventId: "evt-1", name: "Spice Route Culinary Co.", service: "Gourmet Catering", cost: 900000, status: "Booked", rating: 4.8, contact: "+91 98200 44321" },
  { id: "v-3", eventId: "evt-1", name: "Bloom & Foliage Decor", service: "Decor & Floral Styling", cost: 450000, status: "In Review", rating: 4.7, contact: "+91 98111 22334" },
  { id: "v-4", eventId: "evt-1", name: "Weddings by Shutterbug", service: "Photography & Cinema", cost: 250000, status: "Booked", rating: 5.0, contact: "+91 99990 12345" },
  { id: "v-5", eventId: "evt-1", name: "Acoustic Mirage Band", service: "Live Music & DJ", cost: 180000, status: "Shortlisted", rating: 4.6, contact: "+91 98888 77766" }
];

const EventContext = createContext<EventContextType | undefined>(undefined);

export const isTestEmail = (email?: string | null): boolean => {
  if (!email) return true; // Unauthenticated / Demo preview behaves as test mode
  const lower = email.toLowerCase().trim();
  return (
    lower.includes("test") ||
    lower.includes("demo") ||
    lower.includes("sample") ||
    lower === "alex@planora.ai" ||
    lower.endsWith("@example.com")
  );
};

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const isTest = isTestEmail(user?.email);

  const [events, setEvents] = useState<EventItem[]>(() => {
    if (!user) return INITIAL_EVENTS;
    const userKey = `planora_events_${user.uid}`;
    const saved = localStorage.getItem(userKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return isTest ? INITIAL_EVENTS : [];
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    return events[0]?.id || "";
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    if (!user) return INITIAL_TASKS;
    const userKey = `planora_tasks_${user.uid}`;
    const saved = localStorage.getItem(userKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return isTest ? INITIAL_TASKS : [];
  });

  const [budgetItems] = useState<BudgetItem[]>(INITIAL_BUDGET);
  const [guests, setGuests] = useState<GuestItem[]>(INITIAL_GUESTS);
  const [vendors] = useState<VendorItem[]>(INITIAL_VENDORS);

  // Sync from Cloud Firestore if user is logged in
  useEffect(() => {
    const firestore = db;
    if (user && isFirebaseConfigured && firestore) {
      const loadCloudData = async () => {
        try {
          const eventsSnap = await getDocs(collection(firestore, "users", user.uid, "events"));
          if (!eventsSnap.empty) {
            const cloudEvents: EventItem[] = [];
            eventsSnap.forEach((docSnap) => cloudEvents.push(docSnap.data() as EventItem));
            setEvents(cloudEvents);
            setActiveEventId(cloudEvents[0]?.id || "");
          } else {
            // Only seed sample events if user is using a test/demo email
            if (isTest) {
              setEvents(INITIAL_EVENTS);
              setActiveEventId(INITIAL_EVENTS[0]?.id || "");
              INITIAL_EVENTS.forEach(async (evt) => {
                await setDoc(doc(firestore, "users", user.uid, "events", evt.id), evt);
              });
            } else {
              setEvents([]);
              setActiveEventId("");
            }
          }

          // Load tasks
          const tasksSnap = await getDocs(collection(firestore, "users", user.uid, "tasks"));
          if (!tasksSnap.empty) {
            const cloudTasks: TaskItem[] = [];
            tasksSnap.forEach((docSnap) => cloudTasks.push(docSnap.data() as TaskItem));
            setTasks(cloudTasks);
          } else if (isTest) {
            setTasks(INITIAL_TASKS);
          } else {
            setTasks([]);
          }
        } catch (err) {
          console.error("Firestore sync notice:", err);
        }
      };
      loadCloudData();
    } else if (!user) {
      setEvents(INITIAL_EVENTS);
      setTasks(INITIAL_TASKS);
      setActiveEventId(INITIAL_EVENTS[0]?.id || "");
    }
  }, [user, isTest]);

  // LocalStorage backups per user
  useEffect(() => {
    const key = user ? `planora_events_${user.uid}` : "planora_react_events";
    localStorage.setItem(key, JSON.stringify(events));
  }, [events, user]);

  useEffect(() => {
    const key = user ? `planora_tasks_${user.uid}` : "planora_react_tasks";
    localStorage.setItem(key, JSON.stringify(tasks));
  }, [tasks, user]);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const createEvent = (data: Omit<EventItem, "id" | "spent" | "confirmedGuests" | "tasksCompleted" | "totalTasks">): EventItem => {
    const newEvent: EventItem = {
      ...data,
      id: "evt-" + Date.now(),
      spent: 0,
      confirmedGuests: 0,
      tasksCompleted: 0,
      totalTasks: 10
    };
    setEvents((prev) => [newEvent, ...prev]);
    setActiveEventId(newEvent.id);

    // Save to Firestore if connected
    const firestore = db;
    if (user && isFirebaseConfigured && firestore) {
      setDoc(doc(firestore, "users", user.uid, "events", newEvent.id), newEvent).catch(console.error);
    }

    return newEvent;
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, completed: !t.completed };
          const firestore = db;
          if (user && isFirebaseConfigured && firestore) {
            updateDoc(doc(firestore, "users", user.uid, "tasks", taskId), { completed: updated.completed }).catch(() => {});
          }
          return updated;
        }
        return t;
      })
    );
  };

  const addTask = (task: Omit<TaskItem, "id">) => {
    const newTask: TaskItem = { ...task, id: "t-" + Date.now() };
    setTasks((prev) => [newTask, ...prev]);
    const firestore = db;
    if (user && isFirebaseConfigured && firestore) {
      setDoc(doc(firestore, "users", user.uid, "tasks", newTask.id), newTask).catch(console.error);
    }
  };

  const addGuest = (guest: Omit<GuestItem, "id">) => {
    const newGuest: GuestItem = { ...guest, id: "g-" + Date.now() };
    setGuests((prev) => [newGuest, ...prev]);
    const firestore = db;
    if (user && isFirebaseConfigured && firestore) {
      setDoc(doc(firestore, "users", user.uid, "guests", newGuest.id), newGuest).catch(console.error);
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEventId,
        activeEvent,
        setActiveEventId,
        createEvent,
        tasks,
        toggleTask,
        addTask,
        budgetItems,
        guests,
        addGuest,
        vendors,
        isDemo: isTest
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
