import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useEventContext } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import DashboardStatCard from "../components/dashboard/DashboardStatCard";
import DashboardEventCard from "../components/dashboard/DashboardEventCard";
import DashboardTaskItem from "../components/dashboard/DashboardTaskItem";

const DEMO_IMAGES = {
  wedding:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDgU0Aa_G3K8eK0bAX-E01RgGIOsl-R3DFB2CUAb7gVGXbkLxO40BQIWK1f36TdvDDLvE40F4pRn8NuF-LEY6aO5XcS9YK3_8aZHdpTAzFpWVzfavoi4gSX7hM2K6p6PslS1orSTxweoHndYaW22tXKVF5aIKn8m6mEMRgF8hDCGY03r24zCm9mx3LxT8ujc-YLcApz9L70h3FO97VlC_eII-zvxroPaeO2tqLvT5XOwuJSL2cdeYbI3Q",
  techfest:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB4jvtJ1OdbjuqdcfEvC6r7V_IgA0NGsdaoxOeWEt1lRBEnEKaIlVUkM2mhA9yd0pXy_NZcGYDV3P--F0pScErP_YuzAMGpfGOixoF7uVSaGiHmtEJvNs98pKSP9KCsTvbKD8P9Cf35wIORw6ka2vlJsIzxia3Cp5QR-VlgYnVvP9N_eHBUdsflypwcikFqqZpNkGKth3LIQFsNBCS7txGywsgPh-kAGs1ZcDnd4pGHfHTry4Ka-p9PdQ",
  birthday:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCe1fk2VCs69xMfnd9d9lJee3jtI1lzPbIP6ZL5t6YfEZ1SGOv4c6jdjPOeilmE0kmc3jMSunTuwJeNmtGyW7a9YxAXO2-ZWuWHsw5YsE1nzhHh-k9RxTLTvC46bD8U4Vxj4iGACmq_tLift6SRFHw4TjmX9JdLJSZMS63FdZwjMSV1dFwhCjyM2qmq89oiJZVolVyR4SiZb0iPMVZH4eHk-nC1HJ08sNAOpGnRVg1Fzxd0kWW7-M6MjA"
};

interface DemoTask {
  id: string;
  title: string;
  dueDate: string;
  eventName: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

const INITIAL_DEMO_TASKS: DemoTask[] = [
  {
    id: "dt-1",
    title: "Confirm wedding venue contract",
    dueDate: "Tomorrow, 24 Oct",
    eventName: "Aarav & Priya Wedding",
    priority: "High",
    completed: false
  },
  {
    id: "dt-2",
    title: "Finalize catering menu & tasting",
    dueDate: "28 Oct",
    eventName: "Birthday Celebration",
    priority: "Medium",
    completed: false
  },
  {
    id: "dt-3",
    title: "Send TechFest invitations & RSVP link",
    dueDate: "30 Oct",
    eventName: "TechFest 2026",
    priority: "High",
    completed: false
  },
  {
    id: "dt-4",
    title: "Book birthday photographer",
    dueDate: "2 Nov",
    eventName: "Birthday Celebration",
    priority: "Low",
    completed: false
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const { events, tasks, toggleTask, setActiveEventId, isDemo } = useEventContext();
  const [demoTasks, setDemoTasks] = useState<DemoTask[]>(INITIAL_DEMO_TASKS);

  // Check if current user is on a demo workspace or actual user
  const isTest = isDemo;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = isTest
    ? "Alex"
    : user?.displayName?.split(" ")[0] || (user?.email ? user.email.split("@")[0] : "Host");

  // Dynamic calculations for real users
  const totalBudget = events.reduce((acc, e) => acc + (e.budget || 0), 0);
  const totalSpent = events.reduce((acc, e) => acc + (e.spent || 0), 0);
  const spentPct = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const taskPct = totalTasksCount > 0 ? Math.min(Math.round((completedTasksCount / totalTasksCount) * 100), 100) : 0;

  const handleToggleDemoTask = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <AppLayout title="Dashboard" subtitle="Here's what's happening with your events.">
      <div className="flex flex-col w-full gap-space-lg pb-space-xl">
        {/* 1. Welcome Header Banner */}
        <section className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md relative overflow-hidden border border-outline-variant/15">
          <div className="flex flex-col gap-1 z-10">
            <div className="flex items-center gap-space-xs">
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                {greeting}, {firstName}
              </h1>
              <span className="inline-flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isTest || events.length > 0
                ? "Let’s make your next event unforgettable."
                : "Welcome to Planora AI Studio. Let’s create your first celebration."}
            </p>
          </div>

          {/* Milestone Highlight Badge */}
          <div className="flex items-center gap-space-xs self-start md:self-auto bg-surface-container-low px-space-md py-2 rounded-full shadow-sm z-10 border border-outline-variant/20">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              {isTest
                ? "3 Active Events on Track"
                : `${events.length} Active Event${events.length === 1 ? "" : "s"} on Track`}
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-md text-label-md text-secondary font-bold">
              {isTest ? "68% Tasks Completed" : `${taskPct}% Tasks Completed`}
            </span>
          </div>

          {/* Decorative Soft Backdrop Wash */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>
        </section>

        {/* 2. Overview Statistics (4 Compact KPI Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md w-full">
          {/* Stat 1: Total Events */}
          <DashboardStatCard
            label="Total Events"
            value={isTest ? 8 : events.length}
            subtext={isTest ? "5 archived, 3 active" : `0 archived, ${events.length} active`}
            icon="calendar_month"
            iconBg="bg-surface-container"
            iconColor="text-primary"
          />

          {/* Stat 2: Upcoming Events */}
          <DashboardStatCard
            label="Upcoming Events"
            value={isTest ? 3 : events.length}
            subtext={
              isTest
                ? "Next: Aarav & Priya Wedding"
                : events[0]
                ? `Next: ${events[0].name}`
                : "No upcoming events scheduled"
            }
            icon="upcoming"
            iconBg="bg-secondary-container/40"
            iconColor="text-secondary"
          />

          {/* Stat 3: Total Planned Budget */}
          <DashboardStatCard
            label="Planned Budget"
            value={isTest ? "₹2,40,000" : `₹${totalBudget.toLocaleString("en-IN")}`}
            subtext={
              isTest
                ? "₹1,45,000 spent"
                : `₹${totalSpent.toLocaleString("en-IN")} spent`
            }
            rightLabel={isTest ? "60.4%" : `${spentPct}%`}
            icon="account_balance_wallet"
            iconBg="bg-surface-container"
            iconColor="text-primary"
            progress={isTest ? 60.4 : spentPct}
            progressColor="bg-primary"
          />

          {/* Stat 4: Tasks Completed */}
          <DashboardStatCard
            label="Tasks Completed"
            value={isTest ? "68%" : `${taskPct}%`}
            subtext={
              isTest
                ? "28 of 41 tasks done"
                : `${completedTasksCount} of ${totalTasksCount} tasks done`
            }
            rightLabel={isTest ? "13 left" : `${Math.max(0, totalTasksCount - completedTasksCount)} left`}
            icon="task_alt"
            iconBg="bg-tertiary-fixed"
            iconColor="text-on-tertiary-fixed-variant"
            progress={isTest ? 68 : taskPct}
            progressColor="bg-secondary-fixed-dim"
          />
        </section>

        {/* 3. Main Dashboard Grid Layout (8 cols left / 4 cols right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg w-full items-start">
          {/* LEFT / PRIMARY COLUMN (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            {/* A. Upcoming Events Section */}
            <section className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <h2 className="font-headline-md text-headline-md text-primary tracking-tight font-bold">
                    Upcoming Events
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-caption text-caption font-semibold">
                    {isTest ? "3 Active" : `${events.length} Active`}
                  </span>
                </div>
                <Link
                  to="/events"
                  className="font-label-md text-label-md text-primary hover:text-secondary flex items-center gap-1 transition-colors font-medium"
                >
                  <span>View all</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>

              {/* Event Cards Container */}
              <div className="flex flex-col gap-space-md">
                {isTest ? (
                  <>
                    {/* Event Card 1: Aarav & Priya Wedding */}
                    <DashboardEventCard
                      id="demo-1"
                      name="Aarav & Priya Wedding"
                      type="Wedding"
                      date="15 December 2026"
                      location="Udaipur Heritage Palace, Rajasthan"
                      coverImage={DEMO_IMAGES.wedding}
                      budget={150000}
                      spent={120000}
                      tasksCompleted={18}
                      totalTasks={22}
                      onSelect={() => setActiveEventId("demo-1")}
                    />

                    {/* Event Card 2: TechFest 2026 */}
                    <DashboardEventCard
                      id="demo-2"
                      name="TechFest 2026"
                      type="Corporate"
                      date="5 November 2026"
                      location="Grand Convention Hall, Bengaluru"
                      coverImage={DEMO_IMAGES.techfest}
                      budget={60000}
                      spent={55000}
                      tasksCompleted={8}
                      totalTasks={12}
                      onSelect={() => setActiveEventId("demo-2")}
                    />

                    {/* Event Card 3: Birthday Celebration */}
                    <DashboardEventCard
                      id="demo-3"
                      name="Birthday Celebration"
                      type="Birthday"
                      date="28 October 2026"
                      location="The Glasshouse Terrace, Mumbai"
                      coverImage={DEMO_IMAGES.birthday}
                      budget={30000}
                      spent={25000}
                      tasksCompleted={4}
                      totalTasks={7}
                      onSelect={() => setActiveEventId("demo-3")}
                    />
                  </>
                ) : events.length > 0 ? (
                  events.map((evt) => (
                    <DashboardEventCard
                      key={evt.id}
                      id={evt.id}
                      name={evt.name}
                      type={evt.type}
                      date={evt.date}
                      location={evt.location}
                      coverImage={evt.coverImage}
                      budget={evt.budget}
                      spent={evt.spent}
                      tasksCompleted={evt.tasksCompleted}
                      totalTasks={evt.totalTasks || 10}
                      onSelect={() => setActiveEventId(evt.id)}
                    />
                  ))
                ) : (
                  /* Clean, modern empty state for real accounts without events */
                  <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center flex flex-col items-center justify-center border border-outline-variant/20 shadow-sm py-12">
                    <div className="w-14 h-14 rounded-2xl bg-secondary-fixed/50 text-secondary flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[32px]">celebration</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-1">
                      No upcoming events yet
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">
                      Plan your next wedding, milestone birthday, or party in minutes with automated AI timelines and
                      budget calculators.
                    </p>
                    <Link
                      to="/create-event"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-[0_2px_0_0_#020d24]"
                    >
                      <span className="material-symbols-outlined text-secondary-fixed text-[20px]">add</span>
                      <span>Create Your First Event</span>
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* B. Upcoming Tasks Section */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-space-sm">
                  <h2 className="font-headline-md text-headline-md text-primary tracking-tight font-bold">
                    Upcoming Tasks
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption font-semibold">
                    {isTest
                      ? "4 Pending This Week"
                      : `${Math.max(0, totalTasksCount - completedTasksCount)} Pending`}
                  </span>
                </div>
                <Link
                  to="/timeline"
                  className="font-label-md text-label-md text-primary hover:text-secondary flex items-center gap-1 transition-colors self-start sm:self-auto font-medium"
                >
                  <span>View all tasks</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>

              {/* Momentum Progress Strip */}
              <div className="w-full bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between gap-space-md border border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">bolt</span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    Weekly Action Momentum
                  </span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant font-medium">
                  {isTest || tasks.length > 0 ? "75% scheduled on-time" : "Ready to schedule"}
                </span>
              </div>

              {/* Task Items */}
              <div className="flex flex-col divide-y divide-surface-container/60">
                {isTest ? (
                  demoTasks.map((task) => (
                    <DashboardTaskItem
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      dueDate={task.dueDate}
                      eventName={task.eventName}
                      priority={task.priority}
                      completed={task.completed}
                      onToggle={handleToggleDemoTask}
                    />
                  ))
                ) : tasks.length > 0 ? (
                  tasks.slice(0, 5).map((t) => (
                    <DashboardTaskItem
                      key={t.id}
                      id={t.id}
                      title={t.title}
                      dueDate={t.dueDate}
                      eventName={events.find((e) => e.id === t.eventId)?.name || "Active Event"}
                      priority={t.priority === "Normal" ? "Medium" : t.priority}
                      completed={Boolean(t.completed)}
                      onToggle={toggleTask}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center text-on-surface-variant font-body-md text-sm">
                    <span className="material-symbols-outlined text-[28px] opacity-40 mb-1 block">checklist</span>
                    No pending tasks. Create an event to generate automated task milestones.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT / SECONDARY COLUMN (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* C. Planora AI Insights Card */}
            <section className="bg-gradient-to-b from-surface-container-lowest to-tertiary-fixed/20 rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden border border-outline-variant/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary-container text-[20px]">psychology</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                    Planora AI Insights
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-caption text-caption uppercase tracking-wider font-semibold">
                  Real-Time
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Insight 1: Budget-saving */}
                <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-3.5 rounded-lg flex flex-col gap-1.5 shadow-sm border border-outline-variant/10">
                  <div className="flex items-center gap-1.5 text-secondary font-semibold">
                    <span className="font-label-sm text-label-sm">Venue &amp; Decor Synergy</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface text-[13px] leading-relaxed">
                    Pairing venue in-house fairy lighting can save approx{" "}
                    <strong className="text-primary font-bold">₹14,500</strong> on external rental costs.
                  </p>
                </div>

                {/* Insight 2: High-priority action */}
                <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-3.5 rounded-lg flex flex-col gap-1.5 shadow-sm border border-outline-variant/10">
                  <div className="flex items-center gap-1.5 text-on-tertiary-container font-semibold">
                    <span className="font-label-sm text-label-sm">RSVP &amp; Capacity Optimization</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface text-[13px] leading-relaxed">
                    RSVPs typically surge 10 days before close. We recommend dispatching automated digital reminders.
                  </p>
                </div>
              </div>

              <Link
                to="/ai-ideas"
                className="w-full mt-1 py-2.5 px-4 rounded-lg bg-tertiary-container text-on-tertiary font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-tertiary transition-all shadow-sm active:translate-y-0.5 font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span>Explore AI Ideas Studio →</span>
              </Link>
            </section>

            {/* D. Budget Overview Card */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                  Budget Overview
                </h2>
                <Link
                  to="/budget"
                  className="font-label-md text-label-md text-primary hover:text-secondary flex items-center gap-0.5 transition-colors font-medium"
                >
                  <span>View Budget</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>

              {/* Big Numbers */}
              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2 border border-outline-variant/10">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Total Planned Budget
                </span>
                <div className="font-headline-lg text-headline-lg text-primary tracking-tight leading-none font-bold">
                  {isTest ? "₹2,40,000" : `₹${totalBudget.toLocaleString("en-IN")}`}
                </div>
                <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span>
                      Spent:{" "}
                      <strong className="text-primary font-bold">
                        {isTest ? "₹1,45,000" : `₹${totalSpent.toLocaleString("en-IN")}`}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span>
                    <span>
                      Remaining:{" "}
                      <strong className="text-secondary font-bold">
                        {isTest
                          ? "₹95,000"
                          : `₹${Math.max(0, totalBudget - totalSpent).toLocaleString("en-IN")}`}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Color-Coded Progress Meter */}
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex mt-1">
                  <div className="h-full bg-primary" style={{ width: `${isTest ? 60.4 : spentPct}%` }}></div>
                  <div
                    className="h-full bg-secondary-fixed-dim"
                    style={{ width: `${isTest ? 39.6 : 100 - spentPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Category Breakdown List */}
              <div className="flex flex-col gap-3 pt-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Allocation by Category
                </span>

                {/* Venue */}
                <div className="flex items-center justify-between font-body-md text-body-md text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary shrink-0"></div>
                    <span className="text-on-surface truncate font-medium">Venue</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-on-surface-variant font-caption text-caption">39.5%</span>
                    <span className="font-body-md-medium text-body-md-medium text-primary font-semibold">
                      {isTest ? "₹95,000" : `₹${Math.round(totalBudget * 0.395).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>

                {/* Catering */}
                <div className="flex items-center justify-between font-body-md text-body-md text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-sm bg-secondary shrink-0"></div>
                    <span className="text-on-surface truncate font-medium">Catering</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-on-surface-variant font-caption text-caption">27.1%</span>
                    <span className="font-body-md-medium text-body-md-medium text-primary font-semibold">
                      {isTest ? "₹65,000" : `₹${Math.round(totalBudget * 0.271).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>

                {/* Decoration */}
                <div className="flex items-center justify-between font-body-md text-body-md text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-sm bg-secondary-fixed-dim shrink-0"></div>
                    <span className="text-on-surface truncate font-medium">Decoration</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-on-surface-variant font-caption text-caption">20.0%</span>
                    <span className="font-body-md-medium text-body-md-medium text-primary font-semibold">
                      {isTest ? "₹48,000" : `₹${Math.round(totalBudget * 0.2).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>

                {/* Other & Contingency */}
                <div className="flex items-center justify-between font-body-md text-body-md text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-sm bg-outline-variant shrink-0"></div>
                    <span className="text-on-surface truncate font-medium">Other &amp; Contingency</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-on-surface-variant font-caption text-caption">13.4%</span>
                    <span className="font-body-md-medium text-body-md-medium text-primary font-semibold">
                      {isTest ? "₹32,000" : `₹${Math.round(totalBudget * 0.134).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* E. Recent Activity Feed */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
              <h2 className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                Recent Activity
              </h2>
              <div className="flex flex-col gap-space-md relative">
                {/* Activity Line Connector */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-surface-container"></div>

                {/* Item 1 */}
                <div className="flex items-start gap-space-sm relative z-10">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-caption text-caption shrink-0 shadow-sm font-bold">
                    PK
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-body-md text-body-md text-on-surface leading-snug text-xs sm:text-sm">
                      <strong>Priya K.</strong> confirmed Venue Contract with Villa Florists
                    </p>
                    <span className="font-caption text-caption text-on-surface-variant mt-0.5">25m ago</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-space-sm relative z-10">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-caption text-caption shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-body-md text-body-md text-on-surface leading-snug text-xs sm:text-sm">
                      Budget adjusted: Added ₹8,000 contingency reserve
                    </p>
                    <span className="font-caption text-caption text-on-surface-variant mt-0.5">2h ago</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-space-sm relative z-10">
                  <div className="w-8 h-8 rounded-full bg-surface-container text-primary flex items-center justify-center font-caption text-caption shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-body-md text-body-md text-on-surface leading-snug text-xs sm:text-sm">
                      5 new RSVPs confirmed for TechFest 2026
                    </p>
                    <span className="font-caption text-caption text-on-surface-variant mt-0.5">4h ago</span>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="flex items-start gap-space-sm relative z-10">
                  <div className="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center font-caption text-caption shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-body-md text-body-md text-on-surface leading-snug text-xs sm:text-sm">
                      AI Copilot generated 4 acoustic music playlist suggestions
                    </p>
                    <span className="font-caption text-caption text-on-surface-variant mt-0.5">Yesterday</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
