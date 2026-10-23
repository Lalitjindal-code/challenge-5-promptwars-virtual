import { useState, type FormEvent } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";

interface DetailedTask {
  id: string;
  title: string;
  subtitle: string;
  event: string;
  dueDate: string;
  dueLabel?: string;
  priority: "High" | "Medium" | "Normal" | "Low";
  status: "Completed" | "In Progress" | "Pending" | "Not Started" | "Overdue";
  assignee: { name: string; initials: string; bg: string; text: string };
  category?: string;
  description?: string;
  subtasks?: { label: string; checked: boolean }[];
  dependency?: string;
}

const DEMO_TASKS: DetailedTask[] = [
  {
    id: "T-104",
    title: "Confirm wedding venue contract",
    subtitle: "Final clause review for Udaipur Palace load-in rules",
    event: "Aarav & Priya",
    dueDate: "Tomorrow, 24 Oct",
    dueLabel: "Tomorrow, 24 Oct",
    priority: "High",
    status: "In Progress",
    assignee: { name: "Priya K.", initials: "PK", bg: "bg-secondary-fixed", text: "text-on-secondary-fixed" },
    category: "Legal & Contracts",
    description: "Review terms for Udaipur Heritage Palace including 2 AM curfew and noise ordinances.",
    dependency: "Requires: Legal terms review (Cleared by Legal Team)",
    subtasks: [
      { label: "Load-in timing and loading dock clearance", checked: true },
      { label: "Advance deposit wire transfer receipt attached", checked: true },
      { label: "Security deposit refund and cancellation terms", checked: false }
    ]
  },
  {
    id: "T-105",
    title: "Finalize catering menu & tasting",
    subtitle: "Sample 6-course North Indian banquet menu",
    event: "Birthday Gala",
    dueDate: "28 Oct 2026",
    priority: "Medium",
    status: "In Progress",
    assignee: { name: "Alex M.", initials: "AM", bg: "bg-primary-container", text: "text-on-primary" },
    category: "Catering & Food",
    description: "Chef table tasting session with 4 dessert samplers.",
    subtasks: [
      { label: "Live chaat counter selection", checked: true },
      { label: "Custom mocktail menu review", checked: false }
    ]
  },
  {
    id: "T-106",
    title: "Send TechFest invitations & RSVP link",
    subtitle: "Email blast to 450 tech leads and speaker roster",
    event: "TechFest 2026",
    dueDate: "30 Oct 2026",
    priority: "High",
    status: "Pending",
    assignee: { name: "Dev R.", initials: "DR", bg: "bg-tertiary-fixed-dim", text: "text-on-tertiary" },
    category: "Guest Relations",
    description: "Campaign dispatch via SendGrid with tracked RSVP token links.",
    subtasks: [
      { label: "Keynote VIP personalized invites", checked: true },
      { label: "Speaker bio confirmation", checked: false }
    ]
  },
  {
    id: "T-107",
    title: "Book birthday photographer",
    subtitle: "Review 3 shortlisted candidate portfolios",
    event: "Birthday Gala",
    dueDate: "2 Nov 2026",
    priority: "Normal",
    status: "Not Started",
    assignee: { name: "Alex M.", initials: "AM", bg: "bg-primary-container", text: "text-on-primary" },
    category: "AV & Production",
    description: "Candid portrait and drone reel coverage for the gala evening."
  },
  {
    id: "T-108",
    title: "Venue advance payment (₹45,000)",
    subtitle: "Wire transfer confirmation receipt logged",
    event: "Aarav & Priya",
    dueDate: "18 Oct 2026",
    priority: "High",
    status: "Completed",
    assignee: { name: "Alex M.", initials: "AM", bg: "bg-surface-container", text: "text-on-surface-variant" },
    category: "Legal & Contracts"
  },
  {
    id: "T-109",
    title: "Stage lighting & truss rigging specs",
    subtitle: "Verify power load capacity with venue electrician",
    event: "TechFest 2026",
    dueDate: "22 Oct 2026",
    priority: "High",
    status: "Overdue",
    assignee: { name: "Rohan S.", initials: "RS", bg: "bg-error-container", text: "text-error" },
    category: "AV & Production",
    description: "Main auditorium truss load capacity certification."
  }
];

export default function Timeline() {
  const { isDemo, events, activeEvent, addTask } = useEventContext();

  // Local Task state
  const [taskList, setTaskList] = useState<DetailedTask[]>(() => {
    return isDemo ? DEMO_TASKS : [];
  });

  // Filters & Views
  const [activeTab, setActiveTab] = useState<"All" | "My" | "Upcoming" | "Completed" | "Overdue">("All");
  const [activeView, setActiveView] = useState<"List" | "Board" | "Timeline">("List");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [sortBy, setSortBy] = useState<"asc" | "desc">("asc");

  // Selection
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTask, setDrawerTask] = useState<DetailedTask | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Drawer form inputs
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEvent, setFormEvent] = useState(activeEvent?.name || "Aarav & Priya");
  const [formDueDate, setFormDueDate] = useState("24 Oct 2026, 5:00 PM");
  const [formPriority, setFormPriority] = useState<"Low" | "Normal" | "Medium" | "High">("High");
  const [formStatus, setFormStatus] = useState<"Not Started" | "In Progress" | "Pending" | "Completed" | "Overdue">("In Progress");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle single task completed status in table
  const handleToggleCompleted = (taskId: string) => {
    setTaskList((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === "Completed";
          const newStatus = isDone ? "In Progress" : "Completed";
          showToast(`Marked "${t.title}" as ${newStatus}`);
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  // Toggle selection checkbox
  const toggleSelectTask = (id: string) => {
    setSelectedTasks((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((t) => t.id));
    }
  };

  // Open Drawer for existing task
  const openEditDrawer = (task: DetailedTask) => {
    setIsCreatingNew(false);
    setDrawerTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || task.subtitle);
    setFormEvent(task.event);
    setFormDueDate(task.dueDate);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setIsDrawerOpen(true);
  };

  // Open Drawer for creating new task
  const openCreateDrawer = () => {
    setIsCreatingNew(true);
    setDrawerTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormEvent(activeEvent?.name || events[0]?.name || "General Event");
    setFormDueDate("30 Oct 2026, 6:00 PM");
    setFormPriority("Medium");
    setFormStatus("In Progress");
    setIsDrawerOpen(true);
  };

  // Save changes from Drawer
  const handleSaveDrawer = (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("Please provide a task title");
      return;
    }

    if (isCreatingNew) {
      const newTask: DetailedTask = {
        id: `T-${Math.floor(100 + Math.random() * 900)}`,
        title: formTitle.trim(),
        subtitle: formDescription.trim() || "Planned milestone",
        event: formEvent,
        dueDate: formDueDate,
        priority: formPriority,
        status: formStatus,
        assignee: { name: "Alex M.", initials: "AM", bg: "bg-primary-container", text: "text-on-primary" },
        category: "General",
        description: formDescription.trim()
      };
      setTaskList((prev) => [newTask, ...prev]);
      addTask({
        eventId: activeEvent?.id || "evt-1",
        title: formTitle.trim(),
        category: "General",
        dueDate: formDueDate,
        completed: formStatus === "Completed",
        priority: formPriority === "Normal" ? "Low" : formPriority
      });
      showToast(`Task "${newTask.title}" added to timeline`);
    } else if (drawerTask) {
      setTaskList((prev) =>
        prev.map((t) =>
          t.id === drawerTask.id
            ? {
                ...t,
                title: formTitle.trim(),
                description: formDescription.trim(),
                event: formEvent,
                dueDate: formDueDate,
                priority: formPriority,
                status: formStatus
              }
            : t
        )
      );
      showToast(`Task updated successfully`);
    }
    setIsDrawerOpen(false);
  };

  // KPI Calculations
  const totalCount = taskList.length || (isDemo ? 41 : 0);
  const completedCount = taskList.filter((t) => t.status === "Completed").length || (isDemo ? 28 : 0);
  const inProgressCount = taskList.filter((t) => t.status === "In Progress").length || (isDemo ? 8 : 0);
  const overdueCount = taskList.filter((t) => t.status === "Overdue").length || (isDemo ? 3 : 0);
  const velocityPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : isDemo ? 68.2 : 0;

  // Filter tasks
  const filteredTasks = taskList.filter((task) => {
    // Tab filter
    if (activeTab === "My" && !task.assignee.name.includes("Alex")) return false;
    if (activeTab === "Upcoming" && task.status === "Completed") return false;
    if (activeTab === "Completed" && task.status !== "Completed") return false;
    if (activeTab === "Overdue" && task.status !== "Overdue") return false;

    // Search query
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.event.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (selectedCategory !== "All" && task.category !== selectedCategory) {
      return false;
    }

    // Priority filter
    if (selectedPriority !== "All" && task.priority !== selectedPriority) {
      return false;
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "asc") return a.title.localeCompare(b.title);
    return b.title.localeCompare(a.title);
  });

  return (
    <AppLayout title="Timeline & Tasks" subtitle="Stay on top of every deadline, from the first idea to event day.">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary-container text-on-primary rounded-xl shadow-xl text-sm font-medium border border-outline-variant/20 animate-fade-in">
          <span className="material-symbols-outlined text-[20px] text-secondary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action & View Controller Bar */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md border border-outline-variant/10">
        {/* Left Controls: Event Selector & View Switcher */}
        <div className="flex flex-wrap items-center gap-space-md">
          {/* Event Selector Pill */}
          <div className="relative">
            <button
              id="event-selector-btn"
              type="button"
              className="h-10 px-space-md rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2 font-label-md text-label-md"
            >
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-headline-sm text-body-md text-primary">
                {activeEvent ? activeEvent.name : isDemo ? "All Events (3 Active)" : "All Celebrations"}
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
            </button>
          </div>

          {/* Divider line */}
          <div className="h-6 w-px bg-surface-container"></div>

          {/* Segmented View Switcher */}
          <div className="inline-flex p-1 rounded-lg bg-surface-container-low">
            <button
              type="button"
              onClick={() => setActiveView("List")}
              className={`h-8 px-space-md rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-all ${
                activeView === "List"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView("Board");
                showToast("Switched to Kanban Board View");
              }}
              className={`h-8 px-space-md rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-all ${
                activeView === "Board"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_kanban</span>
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView("Timeline");
                showToast("Switched to Interactive Gantt Timeline");
              }}
              className={`h-8 px-space-md rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-all ${
                activeView === "Timeline"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>Timeline</span>
            </button>
          </div>
        </div>

        {/* Right Controls: Filter, Sort, Export, Add Task */}
        <div className="flex flex-wrap items-center gap-space-sm justify-end">
          <button
            type="button"
            onClick={() => {
              setSelectedPriority(selectedPriority === "All" ? "High" : "All");
              showToast(selectedPriority === "All" ? "Filtered: High Priority" : "Filters cleared");
            }}
            className="h-10 px-space-md rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all flex items-center gap-2 font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            <span>Filters</span>
            <span className="w-5 h-5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption flex items-center justify-center">
              {selectedPriority !== "All" ? "1" : "2"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSortBy(sortBy === "asc" ? "desc" : "asc");
              showToast(sortBy === "asc" ? "Sorted Due Date (Desc)" : "Sorted Due Date (Asc)");
            }}
            className="h-10 px-space-md rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all flex items-center gap-2 font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">swap_vert</span>
            <span>{sortBy === "asc" ? "Due Date (Asc)" : "Due Date (Desc)"}</span>
          </button>

          <button
            type="button"
            onClick={() => showToast("Run-of-Show PDF & Schedule exported successfully!")}
            className="h-10 px-space-md rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-2 font-label-md text-label-md shadow-sm border border-outline-variant/10"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">ios_share</span>
            <span>Export Run-of-Show</span>
          </button>

          <button
            type="button"
            onClick={openCreateDrawer}
            className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-2 hover:bg-primary active:translate-y-0.5 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-secondary-fixed text-[18px]">add</span>
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Overall Execution Momentum Header & 4 KPI Cards */}
      <div className="flex flex-col gap-space-md">
        {/* Header banner */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-outline-variant/10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-primary">Execution Momentum</span>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption">
                {velocityPct >= 50 ? "On Track" : "Building Momentum"}
              </span>
            </div>
            <span className="font-body-md text-body-md text-on-surface-variant">
              {velocityPct}% Complete across all registered celebrations ({completedCount} of {totalCount} milestones completed)
            </span>
          </div>

          {/* Dual-tone structural progress track */}
          <div className="w-full md:w-80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant">
              <span>Overall Velocity</span>
              <span className="font-label-md text-label-md text-primary">{velocityPct}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface-container flex overflow-hidden p-0.5">
              <div className="h-full bg-primary-container rounded-l-full transition-all duration-500" style={{ width: `${Math.min(velocityPct, 80)}%` }}></div>
              <div className="h-full bg-secondary rounded-r-full transition-all duration-500" style={{ width: `${Math.min(100 - velocityPct, 20)}%` }}></div>
            </div>
            <div className="flex items-center gap-3 text-caption font-caption text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span> Completed ({completedCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> In Progress ({inProgressCount})
              </span>
            </div>
          </div>
        </div>

        {/* 4 Scannable KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Total Tasks */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-start justify-between border border-outline-variant/10">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant">Total Tasks</span>
              <span className="font-headline-lg text-headline-lg text-primary mt-1">{totalCount}</span>
              <span className="font-caption text-caption text-on-surface-variant mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">flag</span> Across active milestones
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">checklist</span>
            </div>
          </div>

          {/* Card 2: Completed */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-start justify-between border border-outline-variant/10">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant">Completed</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-headline-lg text-primary">{completedCount}</span>
                <span className="font-caption text-caption text-secondary font-body-md-medium bg-secondary-fixed/30 px-1.5 py-0.5 rounded">
                  +4 this wk
                </span>
              </div>
              <span className="font-caption text-caption text-on-surface-variant mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">trending_up</span> {velocityPct}% velocity rate
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-start justify-between border border-outline-variant/10">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant">In Progress</span>
              <span className="font-headline-lg text-headline-lg text-secondary mt-1">{inProgressCount}</span>
              <span className="font-caption text-caption text-on-surface-variant mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">schedule</span> 4 due this week
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>

          {/* Card 4: Overdue */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-start justify-between border border-outline-variant/10">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant">Overdue</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-lg text-headline-lg text-error">{overdueCount}</span>
                <span className="font-caption text-caption text-error font-body-md-medium bg-error-container/60 px-1.5 py-0.5 rounded">
                  Urgent
                </span>
              </div>
              <span className="font-caption text-caption text-error mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span> Action required
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">error_outline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Tasks, Filters, Table (~68%) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {/* Filter Tabs Navigation */}
          <div className="flex items-center justify-between bg-surface-container-lowest rounded-xl p-1.5 shadow-sm overflow-x-auto border border-outline-variant/10">
            <div className="flex items-center gap-1 min-w-max">
              <button
                type="button"
                onClick={() => setActiveTab("All")}
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all ${
                  activeTab === "All"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("My")}
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all ${
                  activeTab === "My"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                My Tasks ({isDemo ? 14 : taskList.filter((t) => t.assignee.name.includes("Alex")).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("Upcoming")}
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                  activeTab === "Upcoming"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                Upcoming ({inProgressCount})
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("Completed")}
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all ${
                  activeTab === "Completed"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("Overdue")}
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1 ${
                  activeTab === "Overdue"
                    ? "bg-error text-on-error shadow-sm"
                    : "text-error hover:bg-error-container"
                }`}
              >
                <span>Overdue ({overdueCount})</span>
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2 pr-2 text-caption font-caption text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] animate-spin text-secondary">sync</span>
              <span>Live updated</span>
            </div>
          </div>

          {/* Curated Upcoming Deadlines Banner */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden border border-outline-variant/10">
            {/* Visual Accent Strip */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
            <div className="flex items-center justify-between pb-3 pl-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">notification_important</span>
                <span className="font-headline-sm text-title-md text-primary">High-Urgency Window (Next 7 Days)</span>
              </div>
              <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant">4 Tasks Critical</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-2">
              {/* Urgency Item 1 */}
              <div
                onClick={() => {
                  const t = taskList.find((x) => x.id === "T-104") || taskList[0];
                  if (t) openEditDrawer(t);
                }}
                className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between cursor-pointer border border-transparent hover:border-secondary/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-body-md-medium text-body-md-medium text-primary">Confirm wedding venue contract</span>
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-error font-caption text-caption">High</span>
                </div>
                <div className="flex items-center justify-between mt-3 text-caption font-caption text-on-surface-variant">
                  <span className="text-error font-body-md-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">alarm</span> Due Tomorrow, 24 Oct
                  </span>
                  <span className="text-primary font-body-md-medium">Priya K.</span>
                </div>
              </div>

              {/* Urgency Item 2 */}
              <div
                onClick={() => {
                  const t = taskList.find((x) => x.id === "T-105") || taskList[1];
                  if (t) openEditDrawer(t);
                }}
                className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between cursor-pointer border border-transparent hover:border-secondary/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-body-md-medium text-body-md-medium text-primary">Finalize catering menu & tasting</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption">Medium</span>
                </div>
                <div className="flex items-center justify-between mt-3 text-caption font-caption text-on-surface-variant">
                  <span className="text-secondary font-body-md-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span> Due 28 Oct
                  </span>
                  <span className="text-primary font-body-md-medium">Alex M.</span>
                </div>
              </div>

              {/* Urgency Item 3 */}
              <div
                onClick={() => {
                  const t = taskList.find((x) => x.id === "T-106") || taskList[2];
                  if (t) openEditDrawer(t);
                }}
                className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between cursor-pointer border border-transparent hover:border-secondary/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-body-md-medium text-body-md-medium text-primary">Send TechFest invitations & RSVP</span>
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-error font-caption text-caption">High</span>
                </div>
                <div className="flex items-center justify-between mt-3 text-caption font-caption text-on-surface-variant">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">event</span> Due 30 Oct
                  </span>
                  <span className="text-primary font-body-md-medium">Dev R.</span>
                </div>
              </div>

              {/* Urgency Item 4 */}
              <div
                onClick={() => {
                  const t = taskList.find((x) => x.id === "T-107") || taskList[3];
                  if (t) openEditDrawer(t);
                }}
                className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between cursor-pointer border border-transparent hover:border-secondary/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-body-md-medium text-body-md-medium text-primary">Book birthday photographer</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption">Normal</span>
                </div>
                <div className="flex items-center justify-between mt-3 text-caption font-caption text-on-surface-variant">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">event</span> Due 2 Nov
                  </span>
                  <span className="text-primary font-body-md-medium">Alex M.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Task Management Table Module */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/10">
            {/* Table Toolbar */}
            <div className="p-space-md bg-surface-container-lowest flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm border-b border-surface-container">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks by keyword..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="All">Category: All</option>
                  <option value="Legal & Contracts">Legal & Contracts</option>
                  <option value="Catering & Food">Catering & Food</option>
                  <option value="AV & Production">AV & Production</option>
                  <option value="Guest Relations">Guest Relations</option>
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="All">Priority: All</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Normal">Normal Priority</option>
                </select>
              </div>
            </div>

            {/* Table Responsive Container */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-caption font-caption text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedTasks.length > 0 && selectedTasks.length === filteredTasks.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded bg-surface-container-lowest text-primary-container focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 min-w-[220px]">Task & Subtask</th>
                    <th className="py-3 px-4 min-w-[140px]">Event</th>
                    <th className="py-3 px-4 min-w-[120px]">Due Date</th>
                    <th className="py-3 px-4 min-w-[90px]">Priority</th>
                    <th className="py-3 px-4 min-w-[110px]">Status</th>
                    <th className="py-3 px-4 min-w-[120px]">Assignee</th>
                    <th className="py-3 px-4 w-12 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-body-md font-body-md text-on-surface">
                  {sortedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40">checklist</span>
                          <span className="font-body-md-medium text-body-md">No tasks matching current filter</span>
                          <button
                            type="button"
                            onClick={openCreateDrawer}
                            className="mt-2 px-4 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-all"
                          >
                            + Create New Task
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedTasks.map((task) => {
                      const isSelected = selectedTasks.includes(task.id);
                      const isCompleted = task.status === "Completed";
                      const isOverdue = task.status === "Overdue";

                      return (
                        <tr
                          key={task.id}
                          onClick={() => openEditDrawer(task)}
                          className={`transition-colors group cursor-pointer ${
                            isOverdue
                              ? "bg-error-container/10 hover:bg-error-container/20"
                              : isCompleted
                              ? "bg-surface-container-lowest/70 hover:bg-surface-container-low/50"
                              : "hover:bg-surface-container-low/50"
                          }`}
                        >
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isCompleted || isSelected}
                              onChange={() => handleToggleCompleted(task.id)}
                              className={`w-4 h-4 rounded focus:ring-0 cursor-pointer ${
                                isOverdue ? "text-error" : "text-primary-container"
                              }`}
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span
                                className={`font-body-md-medium text-body-md-medium transition-colors ${
                                  isCompleted
                                    ? "line-through text-on-surface-variant"
                                    : isOverdue
                                    ? "text-error group-hover:underline"
                                    : "text-primary group-hover:text-secondary"
                                }`}
                              >
                                {task.title}
                              </span>
                              <span
                                className={`font-caption text-caption ${
                                  isOverdue ? "text-error" : "text-on-surface-variant"
                                }`}
                              >
                                {task.subtitle}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-caption text-caption whitespace-nowrap ${
                                task.event.includes("Aarav")
                                  ? "bg-primary-container text-on-primary"
                                  : task.event.includes("TechFest")
                                  ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                                  : "bg-secondary-fixed text-on-secondary-fixed"
                              }`}
                            >
                              {task.event}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-body-md-medium text-body-md-medium flex items-center gap-1 ${
                                isOverdue
                                  ? "text-error"
                                  : task.dueDate.includes("Tomorrow")
                                  ? "text-error"
                                  : isCompleted
                                  ? "text-on-surface-variant line-through"
                                  : "text-on-surface"
                              }`}
                            >
                              {task.dueDate.includes("Tomorrow") && (
                                <span className="material-symbols-outlined text-[14px]">alarm</span>
                              )}
                              {task.dueDate}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-caption text-caption ${
                                task.priority === "High"
                                  ? "bg-error-container text-error"
                                  : task.priority === "Medium"
                                  ? "bg-secondary-fixed text-on-secondary-fixed"
                                  : "bg-surface-container text-on-surface-variant"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-caption text-caption ${
                                task.status === "Completed"
                                  ? "bg-secondary-fixed/40 text-secondary"
                                  : task.status === "Overdue"
                                  ? "bg-error text-on-error"
                                  : task.status === "In Progress"
                                  ? "bg-secondary-fixed/50 text-on-secondary-fixed"
                                  : "bg-surface-container text-on-surface-variant"
                              }`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-full font-caption text-caption flex items-center justify-center font-bold ${task.assignee.bg} ${task.assignee.text}`}
                              >
                                {task.assignee.initials}
                              </div>
                              <span
                                className={`text-caption font-body-md-medium ${
                                  isCompleted ? "text-on-surface-variant" : "text-on-surface"
                                }`}
                              >
                                {task.assignee.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleSelectTask(task.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                              title="Actions"
                            >
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm text-caption font-caption text-on-surface-variant border-t border-surface-container">
              <span>Showing {sortedTasks.length} of {totalCount} tasks</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("All");
                    setSelectedCategory("All");
                    setSelectedPriority("All");
                    setSearchQuery("");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors shadow-sm"
                >
                  View all {totalCount} tasks
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Run-of-Show & AI Copilot (~32%) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Planora AI Schedule Copilot Insights Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden border border-outline-variant/10">
            {/* Purple Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary-fixed-dim"></div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <span className="font-headline-sm text-title-md text-primary">Schedule Copilot</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-caption text-caption">
                Live Insights
              </span>
            </div>

            <div className="flex flex-col gap-space-sm pt-2">
              {/* AI Insight 1: Bottleneck */}
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5 border border-error/15">
                <div className="flex items-center gap-1.5 text-error font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>Timeline Bottleneck Detected</span>
                </div>
                <p className="font-body-md text-caption text-on-surface leading-relaxed">
                  Sound rigging confirmation for <strong>TechFest</strong> is 2 days overdue. Vendor requires 72h advance notice to guarantee staging truss delivery.
                </p>
              </div>

              {/* AI Insight 2: Synergy */}
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5 border border-secondary/15">
                <div className="flex items-center gap-1.5 text-secondary font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Trip Optimization Synergy</span>
                </div>
                <p className="font-body-md text-caption text-on-surface leading-relaxed">
                  You can bundle the <strong>Birthday catering tasting</strong> with anniversary dessert sampling on Oct 28 in South Mumbai to eliminate a separate commute.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => showToast("AI suggested reschedule applied! 2 calendar conflicts resolved.")}
                className="w-full h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant hover:bg-tertiary-fixed-dim font-label-md text-label-md flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">magic_button</span>
                <span>Apply Suggested Reschedule</span>
              </button>
              <button
                type="button"
                onClick={() => showToast("AI Copilot is analyzing alternate staging slots...")}
                className="w-full h-9 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
                <span>Ask AI Copilot for Alternatives</span>
              </button>
            </div>
          </div>

          {/* Visual Milestone Timeline (Run-of-Show Milestones) */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
                <span className="font-headline-sm text-title-md text-primary">Visual Run-of-Show</span>
              </div>
              <span className="font-caption text-caption text-secondary font-body-md-medium bg-secondary-fixed/30 px-2 py-0.5 rounded">
                Days Until
              </span>
            </div>

            {/* Vertical Milestone Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
              {/* Milestone 1: Done */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[12px]">check</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-body-md-medium text-body-md text-primary">Venue & Blueprint Lock</span>
                  <span className="font-caption text-caption text-secondary font-body-md-medium">15 Oct</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant">Aarav & Priya Wedding • Finalized</span>
              </div>

              {/* Milestone 2: Overdue Warning */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[12px]">priority_high</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-body-md-medium text-body-md text-error">Sound & Rigging Approval</span>
                  <span className="font-caption text-caption text-error font-body-md-medium">22 Oct (Overdue)</span>
                </div>
                <span className="font-caption text-caption text-error">Dependency: Needs Electrician Signoff</span>
              </div>

              {/* Milestone 3: Active Pulsing Node */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-secondary-fixed flex items-center justify-center shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-body-md-medium text-body-md text-primary">Catering Tasting Run</span>
                  <span className="font-caption text-caption text-secondary font-body-md-medium">28 Oct (In 4d)</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant">Birthday Gala • North Indian Menu</span>
              </div>

              {/* Milestone 4: Scheduled Node */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-body-md-medium text-body-md text-on-surface">TechFest RSVP Deadline</span>
                  <span className="font-caption text-caption text-on-surface-variant">30 Oct (In 6d)</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant">450 Attendee Target</span>
              </div>

              {/* Milestone 5: Future Milestone */}
              <div className="relative flex flex-col gap-1">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-body-md-medium text-body-md text-on-surface-variant">Final Rehearsal & Load-in</span>
                  <span className="font-caption text-caption text-on-surface-variant">14 Dec</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant">Grand Ballroom Setup</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast("Expanding interactive full-screen Gantt view...")}
              className="mt-2 text-center text-label-md font-label-md text-secondary hover:underline flex items-center justify-center gap-1 py-1"
            >
              <span>Expand Full Interactive Gantt</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* SLIDE-OVER TASK DETAILS DRAWER */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-surface-container-lowest shadow-2xl flex flex-col h-full animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-space-sm">
                <span className="font-headline-sm text-headline-sm text-primary">
                  {isCreatingNew ? "Add New Task" : "Task Details"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-caption text-caption">
                  {drawerTask?.id || "New"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-caption text-caption">
                  {formEvent}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Body Form Content */}
            <form onSubmit={handleSaveDrawer} className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-space-md">
              {/* Field: Task Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                  Task Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Confirm wedding venue contract"
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-primary font-body-md-medium focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container focus:outline-none transition-all"
                />
              </div>

              {/* Field: Description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Add specifics, vendor deliverables, loading specifications..."
                  className="w-full p-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container focus:outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Two-column metadata grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {/* Event Association */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface">
                    Event Association <span className="text-error">*</span>
                  </label>
                  <select
                    value={formEvent}
                    onChange={(e) => setFormEvent(e.target.value)}
                    className="h-11 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none cursor-pointer"
                  >
                    {events.length > 0 ? (
                      events.map((evt) => (
                        <option key={evt.id} value={evt.name}>
                          {evt.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Aarav & Priya Wedding">Aarav & Priya Wedding</option>
                        <option value="TechFest 2026">TechFest 2026</option>
                        <option value="Birthday Celebration">Birthday Celebration</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface">
                    Due Date & Time <span className="text-error">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-error text-[18px]">calendar_clock</span>
                    <input
                      type="text"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-error font-body-md-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Priority Segmented Control */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Priority Level</label>
                <div className="grid grid-cols-4 gap-2 p-1 rounded-lg bg-surface-container-low">
                  {(["Low", "Normal", "Medium", "High"] as const).map((pri) => (
                    <button
                      key={pri}
                      type="button"
                      onClick={() => setFormPriority(pri)}
                      className={`py-2 text-center rounded-md font-label-md text-caption transition-all ${
                        formPriority === pri
                          ? pri === "High"
                            ? "bg-error-container text-error font-bold shadow-sm"
                            : "bg-primary-container text-on-primary font-bold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {pri}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(
                        e.target.value as "Not Started" | "In Progress" | "Pending" | "Completed" | "Overdue"
                      )
                    }
                    className="h-11 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none cursor-pointer"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                {/* Assignee */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface">Assignee</label>
                  <div className="h-11 px-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption flex items-center justify-center font-bold">
                        {drawerTask?.assignee.initials || "AM"}
                      </div>
                      <span className="text-body-md font-body-md text-on-surface">
                        {drawerTask?.assignee.name || "Alex Morgan"}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Dependencies Notice */}
              <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-2 text-body-md font-body-md text-on-surface border border-outline-variant/10">
                <span className="material-symbols-outlined text-secondary text-[20px]">link</span>
                <span>
                  Requires: <strong>{drawerTask?.dependency || "Contract load-in checklist"}</strong>
                </span>
              </div>

              {/* Mini Checklist Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface">Subtasks & Verification</label>
                  <span className="font-caption text-caption text-on-surface-variant">2 of 3 Checked</span>
                </div>
                <div className="flex flex-col gap-2 bg-surface-container-low p-space-sm rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer text-body-md font-body-md">
                    <input defaultChecked className="w-4 h-4 rounded text-primary-container focus:ring-0" type="checkbox" />
                    <span className="line-through text-on-surface-variant">Load-in timing and loading dock clearance</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-body-md font-body-md">
                    <input defaultChecked className="w-4 h-4 rounded text-primary-container focus:ring-0" type="checkbox" />
                    <span className="line-through text-on-surface-variant">Advance deposit wire transfer receipt attached</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-body-md font-body-md">
                    <input className="w-4 h-4 rounded text-primary-container focus:ring-0" type="checkbox" />
                    <span className="text-on-surface">Security deposit refund and cancellation terms</span>
                  </label>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-space-md border-t border-surface-container flex items-center justify-end gap-space-sm">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 px-space-md rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
