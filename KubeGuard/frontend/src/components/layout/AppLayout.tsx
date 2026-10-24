"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastContainer } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { IncidentDrawer } from "@/components/dashboard/IncidentDrawer";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useDashboard();

  return (
    <div className="min-h-screen bg-[#030712] text-[#F1F5FF] flex flex-col font-sans antialiased selection:bg-[#7C3AED]/40 selection:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <ToastContainer />
      <ConfirmModal />
      <IncidentDrawer />
    </div>
  );
}

