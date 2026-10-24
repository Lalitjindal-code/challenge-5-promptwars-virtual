import { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex overflow-x-hidden">
      {/* Sidebar with mobile drawer support */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="pl-0 lg:pl-64 flex flex-col flex-1 min-h-screen w-full transition-all duration-300">
        <Header
          title={title}
          subtitle={subtitle}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <main className="w-full pt-24 sm:pt-28 lg:pt-24 bg-surface flex-1 px-4 sm:px-6 lg:px-space-xl py-space-md lg:py-space-lg">
          <div className="flex flex-col w-full gap-space-lg pb-space-xl max-w-full overflow-x-hidden">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
