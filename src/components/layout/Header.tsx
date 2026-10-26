import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useEventContext } from "../../context/EventContext";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onToggleMobileSidebar?: () => void;
}

export default function Header({
  title = "Dashboard",
  subtitle = "Here's what's happening with your events.",
  onToggleMobileSidebar,
}: HeaderProps) {
  const { events, activeEventId, setActiveEventId, activeEvent, tasks, vendors } = useEventContext();
  const { user, sendVerificationEmail } = useAuth();
  const [resendNotice, setResendNotice] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notifications state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsDismissed, setNotificationsDismissed] = useState(false);

  // Escape key dismisses popovers
  useEffect(() => {
    if (!isNotificationsOpen && !isSearchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isNotificationsOpen, isSearchOpen]);

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      setResendNotice(true);
      setTimeout(() => setResendNotice(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AM";

  // Filtered search results
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const matchedEvents = trimmedSearch
    ? events.filter((e) => e.name.toLowerCase().includes(trimmedSearch) || e.type.toLowerCase().includes(trimmedSearch) || e.location.toLowerCase().includes(trimmedSearch))
    : [];
  const matchedTasks = trimmedSearch
    ? tasks.filter((t) => t.title.toLowerCase().includes(trimmedSearch) || (t.subtitle || "").toLowerCase().includes(trimmedSearch))
    : [];
  const matchedVendors = trimmedSearch
    ? vendors.filter((v) => v.name.toLowerCase().includes(trimmedSearch) || v.category.toLowerCase().includes(trimmedSearch))
    : [];

  const totalMatches = matchedEvents.length + matchedTasks.length + matchedVendors.length;

  // Active notifications
  const overdueTasks = tasks.filter((t) => t.status === "Overdue");
  const upcomingTasks = tasks.filter((t) => t.status === "In Progress").slice(0, 3);
  const unreadCount = notificationsDismissed ? 0 : overdueTasks.length + Math.min(upcomingTasks.length, 2);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 bg-surface/90 backdrop-blur-xl z-40 border-b border-outline-variant/10 shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all duration-300">
      {/* Unverified Email Warning Strip */}
      {user && !user.isDemo && !user.emailVerified && (
        <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-amber-700">mark_email_unread</span>
            <span>Your email <strong>{user.email}</strong> is not verified yet. Please check your inbox.</span>
          </div>
          <button
            type="button"
            onClick={handleResendVerification}
            className="font-bold underline hover:text-amber-950 text-[11px] ml-2"
          >
            {resendNotice ? "Verification email sent!" : "Resend Link"}
          </button>
        </div>
      )}

      {/* Demo Workspace Warning Strip */}
      {user?.isDemo && (
        <div className="w-full bg-secondary-container/40 border-b border-secondary/30 px-4 py-1 flex items-center justify-between text-[11px] text-primary">
          <div className="flex items-center gap-1.5 font-semibold">
            <span className="material-symbols-outlined text-[14px] text-secondary">science</span>
            <span>Demo Workspace Preview: You are exploring sample data (Alex Morgan Studio).</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-surface-container text-on-surface">
            Sample Sandbox
          </span>
        </div>
      )}

      <div className="h-20 w-full px-4 sm:px-6 lg:px-space-xl flex items-center justify-between gap-space-md">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/15"
            aria-label="Open mobile navigation"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-heading font-bold text-lg sm:text-xl text-primary tracking-tight truncate">
                {title}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-caption font-semibold">
                Pro Planner
              </span>
            </div>
            <span className="text-caption sm:text-xs text-on-surface-variant truncate max-w-[200px] sm:max-w-md">
              {activeEvent ? `${subtitle} • ${activeEvent.name}` : subtitle}
            </span>
          </div>

          {/* Active Event Selector (Stitch shell element) */}
          {events.length > 0 && (
            <div className="relative hidden xl:flex items-center ml-4">
              <select
                aria-label="Active Event"
                value={activeEventId}
                onChange={(e) => setActiveEventId(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-label-sm font-label-md text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary-container shadow-sm cursor-pointer border border-outline-variant/15"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 text-on-surface-variant text-[18px] pointer-events-none">
                unfold_more
              </span>
            </div>
          )}
        </div>

        {/* Right Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-space-md">
          {/* Search bar with live popover */}
          <div className="relative items-center hidden md:flex">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              aria-label="Search events, tasks, and vendors"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              placeholder="Search events, tasks, vendors..."
              className="w-48 lg:w-64 h-10 pl-10 pr-8 rounded-lg bg-surface-container-lowest text-xs text-on-surface placeholder:text-on-surface-variant border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                aria-label="Clear search query"
                className="absolute right-2.5 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}

            {/* Search Dropdown Popover */}
            {isSearchOpen && trimmedSearch && (
              <div
                role="dialog"
                aria-label="Search results"
                className="absolute top-12 left-0 right-0 lg:w-80 bg-surface-container-lowest rounded-xl shadow-2xl p-2 border border-outline-variant/20 z-50 flex flex-col gap-2 max-h-96 overflow-y-auto animate-fade-in"
              >
                {totalMatches === 0 ? (
                  <div className="py-4 text-center text-xs text-on-surface-variant">
                    No results for "{searchQuery}"
                  </div>
                ) : (
                  <>
                    {matchedEvents.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-2">
                          Events ({matchedEvents.length})
                        </span>
                        {matchedEvents.map((evt) => (
                          <Link
                            key={evt.id}
                            to={`/events/${evt.id}`}
                            onClick={() => {
                              setActiveEventId(evt.id);
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container text-xs text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px] text-secondary">event</span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold truncate">{evt.name}</span>
                              <span className="text-[10px] text-on-surface-variant truncate">{evt.type} • {evt.location}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {matchedTasks.length > 0 && (
                      <div className="flex flex-col gap-1 border-t border-surface-container pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-2">
                          Tasks ({matchedTasks.length})
                        </span>
                        {matchedTasks.slice(0, 4).map((task) => (
                          <Link
                            key={task.id}
                            to="/timeline"
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container text-xs text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold truncate">{task.title}</span>
                              <span className="text-[10px] text-on-surface-variant truncate">{task.event} • {task.status}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {matchedVendors.length > 0 && (
                      <div className="flex flex-col gap-1 border-t border-surface-container pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-2">
                          Vendors ({matchedVendors.length})
                        </span>
                        {matchedVendors.slice(0, 4).map((vendor) => (
                          <Link
                            key={vendor.id}
                            to="/vendors"
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container text-xs text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px] text-secondary">store</span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold truncate">{vendor.name}</span>
                              <span className="text-[10px] text-on-surface-variant truncate">{vendor.category} • {vendor.location}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (isSearchOpen) setIsSearchOpen(false);
              }}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors border border-outline-variant/20 shadow-sm"
              title="Notifications"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              aria-expanded={isNotificationsOpen}
              aria-haspopup="dialog"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface-container-lowest animate-pulse"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div
                role="dialog"
                aria-label="Recent notifications"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-2xl p-4 border border-outline-variant/20 z-50 flex flex-col gap-3 animate-fade-in"
              >
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-label-md text-primary font-bold">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[10px] font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsDismissed(true)}
                    className="text-[11px] text-secondary hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                  {overdueTasks.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-error">Urgent Attention</span>
                      {overdueTasks.map((t) => (
                        <Link
                          key={t.id}
                          to="/timeline"
                          onClick={() => setIsNotificationsOpen(false)}
                          className="p-2.5 rounded-xl bg-error-container/20 border border-error/20 hover:bg-error-container/30 transition-colors flex items-start gap-2.5"
                        >
                          <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">warning</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-primary truncate">{t.title}</span>
                            <span className="text-[10px] text-error">Overdue • Due: {t.dueDate}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {upcomingTasks.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Upcoming Milestones</span>
                      {upcomingTasks.map((t) => (
                        <Link
                          key={t.id}
                          to="/timeline"
                          onClick={() => setIsNotificationsOpen(false)}
                          className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-start gap-2.5"
                        >
                          <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">schedule</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-primary truncate">{t.title}</span>
                            <span className="text-[10px] text-on-surface-variant">{t.event} • Due: {t.dueDate}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {overdueTasks.length === 0 && upcomingTasks.length === 0 && (
                    <div className="py-6 text-center text-xs text-on-surface-variant">
                      All caught up! No pending alerts.
                    </div>
                  )}
                </div>

                <Link
                  to="/timeline"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="w-full py-2 text-center text-xs font-semibold text-primary hover:bg-surface-container rounded-lg transition-colors border border-outline-variant/15"
                >
                  View All Timeline Milestones
                </Link>
              </div>
            )}
          </div>

          {/* Quick Create Event CTA */}
          <Link
            to="/create-event"
            className="h-9 sm:h-10 px-3 sm:px-space-md rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 sm:gap-2 hover:bg-primary-container active:translate-y-0.5 transition-all shadow-[0_2px_0_0_#020d24]"
          >
            <span className="material-symbols-outlined text-secondary-fixed text-[16px] sm:text-[18px]">add</span>
            <span className="hidden sm:inline">Create Event</span>
          </Link>

          {/* User Avatar */}
          <Link
            to="/settings"
            className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-secondary-fixed text-xs font-bold ring-1 ring-outline-variant/30 hover:opacity-90 transition-opacity"
            aria-label={`Settings & Profile for ${user?.displayName || user?.email || "Alex Morgan"}`}
            title="Settings & Profile"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
