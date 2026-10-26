import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logOut } = useAuth();

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onClose]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "My Events", path: "/events", icon: "celebration" },
    { name: "Create Event", path: "/create-event", icon: "add_circle" },
    { name: "Budget", path: "/budget", icon: "payments" },
    { name: "Timeline & Tasks", path: "/timeline", icon: "checklist" },
    { name: "Vendors", path: "/vendors", icon: "storefront" },
    { name: "AI Ideas Studio", path: "/ai-ideas", icon: "psychology", badge: "AI" },
    { name: "Guests & RSVPs", path: "/guests", icon: "group" },
    { name: "Settings", path: "/settings", icon: "settings" },
  ];

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Alex Morgan";
  const email = user?.email || "alex@planora.ai";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-primary/50 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        aria-label="Application Sidebar Navigation"
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between border-r border-outline-variant/20 shadow-xl lg:shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-20 px-space-lg flex items-center justify-between border-b border-outline-variant/10">
            <Link to="/" onClick={onClose} className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-secondary-fixed shadow-[0_2px_0_0_#020d24]">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg tracking-tight text-primary leading-none">
                  Planora<span className="text-secondary font-heading">AI</span>
                </span>
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mt-0.5">
                  Event Studio
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              aria-label="Close navigation sidebar"
              title="Close Navigation"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-space-md py-space-sm">
            <nav aria-label="Main menu" className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive =
                  currentPath === item.path ||
                  (item.path !== "/" && currentPath.startsWith(item.path + "/"));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-space-md py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary-container text-on-primary font-medium shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-space-md m-space-md rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
                <span className="text-secondary-fixed">{initials}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-on-surface truncate">{displayName}</span>
                <span className="text-[11px] text-on-surface-variant truncate">{email}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={logOut}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container transition-colors"
              aria-label="Sign out of workspace"
              title="Log Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
