import { Link } from "react-router-dom";
import { useEventContext } from "../../context/EventContext";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "Dashboard", subtitle = "Here's what's happening with your events." }: HeaderProps) {
  const { activeEvent } = useEventContext();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-64 right-0 h-20 bg-surface/90 backdrop-blur-xl z-40 border-b border-outline-variant/10 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-20 w-full px-space-xl flex items-center justify-between gap-space-md">
        {/* Title & Badge */}
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <span className="font-heading font-bold text-xl text-primary tracking-tight">{title}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
              Pro Planner
            </span>
          </div>
          <span className="text-xs text-on-surface-variant">
            {activeEvent ? `${subtitle} • Active: ${activeEvent.name}` : subtitle}
          </span>
        </div>

        {/* Right Search & Actions */}
        <div className="flex items-center gap-space-md">
          {/* Search bar */}
          <div className="relative flex items-center hidden sm:flex">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search events, tasks, vendors..."
              className="w-72 h-10 pl-10 pr-4 rounded-lg bg-surface-container-lowest text-xs text-on-surface placeholder:text-on-surface-variant border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
            />
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="relative w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors border border-outline-variant/20"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-fixed-dim ring-2 ring-surface-container-lowest animate-pulse"></span>
          </button>

          {/* Quick Create Event CTA */}
          <Link
            to="/create-event"
            className="h-10 px-space-md rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center gap-2 hover:bg-primary-container active:translate-y-0.5 transition-all shadow-[0_2px_0_0_#020d24]"
          >
            <span className="material-symbols-outlined text-secondary-fixed text-[18px]">add</span>
            <span>Create Event</span>
          </Link>

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-secondary-fixed text-xs font-bold ring-1 ring-outline-variant/30">
            {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "AM"}
          </div>
        </div>
      </div>
    </header>
  );
}
