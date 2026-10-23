export interface EventItem {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  budget: number;
  spent: number;
  guestsCount: number;
  guestCount?: number;
  confirmedGuests: number;
  tasksCompleted: number;
  totalTasks: number;
  status: "Planning" | "On Track" | "Attention" | "Completed";
  coverImage?: string;
  description?: string;
  createdAt?: string;
}

export interface DetailedTask {
  id: string;
  eventId: string;
  title: string;
  subtitle: string;
  event: string;
  dueDate: string;
  dueLabel?: string;
  priority: "High" | "Medium" | "Normal" | "Low";
  status: "Completed" | "In Progress" | "Pending" | "Not Started" | "Overdue";
  completed: boolean;
  assignee: {
    name: string;
    initials: string;
    bg: string;
    text: string;
  };
  category?: string;
  description?: string;
  subtasks?: { label: string; checked: boolean }[];
  dependency?: string;
}

export interface DetailedGuest {
  id: string;
  eventId: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  cohort: "VIP" | "Family" | "Friends" | "College Team" | "Vendors";
  event: string;
  partySize: number;
  plusOne?: string;
  status: "Confirmed" | "Awaiting Response" | "Declined";
  dispatchStatus: "Delivered & Opened" | "Delivered" | "Opened" | "Pending";
  dietary: string;
  table: string;
  specialRequest?: string;
  isVip?: boolean;
}

export interface DetailedVendor {
  id: string;
  eventId: string;
  name: string;
  category: "Venue" | "Catering" | "Photography" | "Decoration" | "Music & DJ" | "Logistics & AV" | "Makeup & Styling" | "Other Services";
  location: string;
  rating: number;
  reviewCount: number;
  event: string;
  tags: string[];
  cost: number;
  paidAmount?: number;
  status: "Booked • Adv. Paid" | "Booked • Tasting Done" | "Shortlisted" | "Booked" | "Pending Contract";
  image: string;
  contactName: string;
  contactRole: string;
  contactPhone: string;
  contactEmail: string;
  inclusions: string[];
  advisoryText: string;
  notes: string;
}

export interface ExpenseTransaction {
  id: string;
  eventId: string;
  name: string;
  event: string;
  category: "Venue" | "Catering" | "Decoration" | "Photography" | "Logistics" | "Other";
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Scheduled";
  vendor?: string;
  icon: string;
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: string;
  allocated: number;
  spent: number;
  notes?: string;
}

export interface UserSettings {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  organization: string;
  region: string;
  timezone: string;
  currency: "INR" | "USD" | "EUR" | "GBP" | "AED";
  dateFormat: string;
  eventArchetype: string;
  quorumFormat: "cohorts" | "flat";
  budgetFramework: "standard" | "ai";
  vendorSynergyAi: boolean;
  channelEmail: boolean;
  channelWhatsapp: boolean;
  channelDesktop: boolean;
  alertDeadlines: boolean;
  alertVipRsvp: boolean;
  alertBudgetThreshold: boolean;
  alertVendorPayments: boolean;
  alertAiBriefs: boolean;
  alertProductUpdates: boolean;
  themeMode: "light" | "dark" | "system";
  density: "comfortable" | "compact";
  telemetryConsent: boolean;
}
