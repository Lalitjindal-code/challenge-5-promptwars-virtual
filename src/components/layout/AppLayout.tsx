import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="pl-64 flex flex-col flex-1 min-h-screen w-full">
        <Header title={title} subtitle={subtitle} />
        <main className="w-full pt-20 bg-surface flex-1 px-space-xl py-space-lg">
          <div className="flex flex-col w-full gap-space-lg pb-space-xl">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
