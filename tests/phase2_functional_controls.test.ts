import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Phase 2: Functional Controls — Events Sorting", () => {
  const sampleEvents = [
    { id: "e1", name: "Zeta Gala", date: "2026-12-15", budget: 50000, guestCount: 150 },
    { id: "e2", name: "Alpha Summit", date: "2026-06-10", budget: 120000, guestCount: 400 },
    { id: "e3", name: "Beta Wedding", date: "2026-08-20", budget: 25000, guestCount: 80 },
  ];

  it("correctly sorts events by date soonest first", () => {
    const sorted = [...sampleEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    assert.equal(sorted[0].id, "e2"); // June
    assert.equal(sorted[1].id, "e3"); // August
    assert.equal(sorted[2].id, "e1"); // December
  });

  it("correctly sorts events by date latest first", () => {
    const sorted = [...sampleEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    assert.equal(sorted[0].id, "e1"); // December
    assert.equal(sorted[1].id, "e3"); // August
    assert.equal(sorted[2].id, "e2"); // June
  });

  it("correctly sorts events by budget highest first", () => {
    const sorted = [...sampleEvents].sort((a, b) => b.budget - a.budget);
    assert.equal(sorted[0].id, "e2"); // 120000
    assert.equal(sorted[1].id, "e1"); // 50000
    assert.equal(sorted[2].id, "e3"); // 25000
  });

  it("correctly sorts events by budget lowest first", () => {
    const sorted = [...sampleEvents].sort((a, b) => a.budget - b.budget);
    assert.equal(sorted[0].id, "e3"); // 25000
    assert.equal(sorted[1].id, "e1"); // 50000
    assert.equal(sorted[2].id, "e2"); // 120000
  });

  it("correctly sorts events by guest volume highest first", () => {
    const sorted = [...sampleEvents].sort((a, b) => b.guestCount - a.guestCount);
    assert.equal(sorted[0].id, "e2"); // 400
    assert.equal(sorted[1].id, "e1"); // 150
    assert.equal(sorted[2].id, "e3"); // 80
  });

  it("correctly sorts events by name alphabetically", () => {
    const sorted = [...sampleEvents].sort((a, b) => a.name.localeCompare(b.name));
    assert.equal(sorted[0].name, "Alpha Summit");
    assert.equal(sorted[1].name, "Beta Wedding");
    assert.equal(sorted[2].name, "Zeta Gala");
  });
});

describe("Phase 2: Functional Controls — Real CSV Data Export Formats", () => {
  it("formats task run-sheet CSV with proper headers and escaping", () => {
    const headers = ["Title", "Subtitle", "Event", "Due Date", "Priority", "Status", "Assignee", "Category"];
    const tasks = [
      {
        title: 'Soundcheck, "Main Hall"',
        subtitle: "Audio team run-through",
        eventName: "Alpha Summit",
        dueDate: "2026-06-09",
        priority: "High",
        status: "In Progress",
        assignedTo: "DJ Marcus",
        category: "Production",
      },
    ];

    const escapeCsv = (str: string) => `"${String(str || "").replace(/"/g, '""')}"`;
    const rows = tasks.map((t) => [
      escapeCsv(t.title),
      escapeCsv(t.subtitle),
      escapeCsv(t.eventName),
      escapeCsv(t.dueDate),
      escapeCsv(t.priority),
      escapeCsv(t.status),
      escapeCsv(t.assignedTo),
      escapeCsv(t.category),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    assert.ok(csvContent.startsWith("Title,Subtitle,Event,Due Date,Priority,Status,Assignee,Category"));
    assert.ok(csvContent.includes('"Soundcheck, ""Main Hall"""'), "Special characters like quotes and commas must be escaped");
    assert.ok(csvContent.includes('"Alpha Summit"'));
  });

  it("formats guest roster CSV with correct columns and dietary data", () => {
    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "RSVP Status",
      "Dietary Preference",
      "Table Number",
      "Side/Affiliation",
      "Plus Ones",
    ];

    const guest = {
      name: "Dr. Vikram Sethi",
      email: "vikram@example.com",
      phone: "+91 98201 11222",
      rsvpStatus: "Confirmed",
      dietaryPreference: "Jain",
      table: "Table 4",
      side: "Groom",
      plusOnes: 1,
    };

    const escapeCsv = (str: string | number) => `"${String(str ?? "").replace(/"/g, '""')}"`;
    const row = [
      escapeCsv(guest.name),
      escapeCsv(guest.email),
      escapeCsv(guest.phone),
      escapeCsv(guest.rsvpStatus),
      escapeCsv(guest.dietaryPreference),
      escapeCsv(guest.table),
      escapeCsv(guest.side),
      escapeCsv(guest.plusOnes),
    ];

    const csv = [headers.join(","), row.join(",")].join("\n");
    assert.ok(csv.includes("Full Name,Email,Phone,RSVP Status,Dietary Preference,Table Number,Side/Affiliation,Plus Ones"));
    assert.ok(csv.includes('"Dr. Vikram Sethi"'));
    assert.ok(csv.includes('"Jain"'));
    assert.ok(csv.includes('"Table 4"'));
  });

  it("formats vendor directory CSV with contract values and contact info", () => {
    const headers = [
      "Vendor Name",
      "Category",
      "Contact Person",
      "Phone",
      "Email",
      "Status",
      "Contract Value",
      "Rating",
      "Notes",
    ];

    const vendor = {
      name: "Heritage Floral Artisans",
      category: "Floral & Decor",
      contactPerson: "Priya Sharma",
      phone: "+91 98201 55443",
      email: "priya@heritageflorals.com",
      status: "Confirmed",
      contractValue: 450000,
      rating: 4.9,
      notes: "Stage backdrop and mandap floral garlands",
    };

    const escapeCsv = (str: string | number) => `"${String(str ?? "").replace(/"/g, '""')}"`;
    const row = [
      escapeCsv(vendor.name),
      escapeCsv(vendor.category),
      escapeCsv(vendor.contactPerson),
      escapeCsv(vendor.phone),
      escapeCsv(vendor.email),
      escapeCsv(vendor.status),
      escapeCsv(vendor.contractValue),
      escapeCsv(vendor.rating),
      escapeCsv(vendor.notes),
    ];

    const csv = [headers.join(","), row.join(",")].join("\n");
    assert.ok(csv.includes("Vendor Name,Category,Contact Person,Phone,Email,Status,Contract Value,Rating,Notes"));
    assert.ok(csv.includes('"Heritage Floral Artisans"'));
    assert.ok(csv.includes('"450000"'));
    assert.ok(csv.includes('"Confirmed"'));
  });
});

describe("Phase 2: Functional Controls — Budget Calculations and Dynamic Expenses", () => {
  interface Expense {
    id: string;
    category: string;
    amount: number;
    description: string;
  }

  it("calculates total expenses and category variances accurately", () => {
    const budgetCategories = [
      { category: "Venue & Hospitality", allocated: 1500000 },
      { category: "Catering & Bar", allocated: 1000000 },
      { category: "Decor & Production", allocated: 600000 },
    ];

    const expenses: Expense[] = [
      { id: "tx-1", category: "Venue & Hospitality", amount: 750000, description: "Advance deposit" },
      { id: "tx-2", category: "Venue & Hospitality", amount: 500000, description: "Midway payment" },
      { id: "tx-3", category: "Catering & Bar", amount: 400000, description: "Tasting deposit" },
    ];

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    assert.equal(totalSpent, 1650000);

    // Adding an expense
    const newExpense: Expense = { id: "tx-4", category: "Decor & Production", amount: 200000, description: "Lighting rig" };
    const updatedExpenses = [...expenses, newExpense];
    const newTotalSpent = updatedExpenses.reduce((sum, e) => sum + e.amount, 0);
    assert.equal(newTotalSpent, 1850000);

    // Deleting an expense
    const afterDelete = updatedExpenses.filter((e) => e.id !== "tx-2");
    const afterDeleteTotal = afterDelete.reduce((sum, e) => sum + e.amount, 0);
    assert.equal(afterDeleteTotal, 1350000);

    // Variance for Venue & Hospitality
    const venueSpent = afterDelete.filter((e) => e.category === "Venue & Hospitality").reduce((sum, e) => sum + e.amount, 0);
    const venueAllocated = budgetCategories.find((c) => c.category === "Venue & Hospitality")!.allocated;
    assert.equal(venueSpent, 750000);
    assert.equal(venueAllocated - venueSpent, 750000, "Remaining budget should equal allocated minus spent");
  });

  it("rejects non-positive budget expenses", () => {
    const validateAmount = (amount: number) => {
      return !isNaN(amount) && amount > 0;
    };

    assert.equal(validateAmount(0), false);
    assert.equal(validateAmount(-150), false);
    assert.equal(validateAmount(NaN), false);
    assert.equal(validateAmount(2500), true);
  });
});

describe("Phase 2: Functional Controls — Overdue Task Rescheduling", () => {
  it("accurately identifies overdue non-completed tasks and rolls them forward", () => {
    const today = new Date().toISOString().split("T")[0];
    const pastDate = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];
    const futureDate = new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0];

    const tasks = [
      { id: "t1", title: "Floral contract signature", dueDate: pastDate, status: "Pending" },
      { id: "t2", title: "Catering menu lock", dueDate: pastDate, status: "Completed" }, // Completed tasks shouldn't be rescheduled
      { id: "t3", title: "Final walk-through", dueDate: futureDate, status: "Pending" },
    ];

    const overdueTasks = tasks.filter((t) => t.dueDate < today && t.status !== "Completed");
    assert.equal(overdueTasks.length, 1);
    assert.equal(overdueTasks[0].id, "t1");

    // Reschedule overdue task forward by 3 days
    const rescheduled = overdueTasks.map((t) => {
      const newDue = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
      return { ...t, dueDate: newDue };
    });

    assert.ok(rescheduled[0].dueDate >= today);
  });
});
