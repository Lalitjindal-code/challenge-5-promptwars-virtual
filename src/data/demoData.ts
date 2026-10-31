import type {
  EventItem,
  DetailedTask,
  DetailedGuest,
  DetailedVendor,
  ExpenseTransaction,
  BudgetItem
} from "../types";

/**
 * Static baseline fixtures strictly reserved for Explicit Demo Mode
 * (test@planora.ai / Demo Studio journey).
 * Kept in src/data/demoData.ts to separate static fixtures from state orchestration.
 */

export const DEMO_EVENTS: EventItem[] = [
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

export const DEMO_TASKS: DetailedTask[] = [
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

export const DEMO_GUESTS: DetailedGuest[] = [
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

export const DEMO_VENDORS: DetailedVendor[] = [
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

export const DEMO_EXPENSES: ExpenseTransaction[] = [
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

export const DEMO_BUDGET: BudgetItem[] = [
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
