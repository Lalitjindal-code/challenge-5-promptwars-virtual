import { useState, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex overflow-x-hidden">
      {/* Skip to Main Content Link for screen readers and keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:rounded-lg focus:shadow-2xl focus:font-semibold focus:text-xs"
      >
        Skip to main content
      </a>

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
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full pt-24 sm:pt-28 lg:pt-24 bg-surface flex-1 px-4 sm:px-6 lg:px-space-xl py-space-md lg:py-space-lg focus:outline-none"
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col w-full gap-space-lg pb-space-xl max-w-full overflow-x-hidden"
          >
            {children || <Outlet />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
