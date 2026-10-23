import { useState } from "react";
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
  const { events, activeEventId, setActiveEventId, activeEvent } = useEventContext();
  const { user, sendVerificationEmail } = useAuth();
  const [resendNotice, setResendNotice] = useState(false);

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
          {/* Search bar */}
          <div className="relative items-center hidden md:flex">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search events, tasks, vendors..."
              className="w-48 lg:w-64 h-10 pl-10 pr-4 rounded-lg bg-surface-container-lowest text-xs text-on-surface placeholder:text-on-surface-variant border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
            />
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors border border-outline-variant/20 shadow-sm"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-fixed-dim ring-2 ring-surface-container-lowest animate-pulse"></span>
          </button>

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
            title="Settings & Profile"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
