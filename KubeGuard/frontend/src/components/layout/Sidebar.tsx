"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import {
  LayoutDashboard,
  Network,
  Boxes,
  TriangleAlert,
  Sparkles,
  Activity,
  BellRing,
  History,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  ChevronDown,
  Terminal,
} from "lucide-react";
import { Environment } from "@/lib/types";

export function Sidebar() {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    toggleSidebar,
    currentCluster,
    currentEnv,
    setCurrentEnv,
    mobileMenuOpen,
    setMobileMenuOpen,
    incidents,
  } = useDashboard();

  const activeIncidentsCount = incidents.filter(
    (i) => i.severity === "critical" || i.severity === "warning"
  ).length;

  const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/cluster", label: "Cluster Explorer", icon: Network },
    { href: "/workloads", label: "Workloads", icon: Boxes },
    {
      href: "/incidents",
      label: "Incidents",
      icon: TriangleAlert,
      badge: activeIncidentsCount > 0 ? String(activeIncidentsCount) : undefined,
      badgeColor: "bg-rose-500",
    },
    { href: "/self-healing", label: "Self-Healing Activity", icon: Sparkles },
    { href: "/monitoring", label: "Monitoring", icon: Activity },
    { href: "/alerts", label: "Alert Rules", icon: BellRing },
    { href: "/deployments", label: "Deployment History", icon: History },
    { href: "/audit", label: "Audit Logs", icon: ShieldCheck },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#080d19] border-r border-[#1a2638] flex flex-col justify-between transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div
            className={`h-16 flex items-center border-b border-[#162235] px-4 justify-between`}
          >
            <Link
              href="/"
              className={`flex items-center gap-3 overflow-hidden transition-all ${
                sidebarCollapsed ? "justify-center w-full" : ""
              }`}
            >
              {/* Brand Shield Logo */}
              <div className="relative flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-0.5 shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center">
                <div className="w-full h-full bg-[#080d19] rounded-[10px] flex items-center justify-center relative">
                  <Shield className="w-5 h-5 text-sky-400 absolute" strokeWidth={2.4} />
                  <span className="relative z-10 text-[9px] font-black text-white tracking-tighter">
                    KG
                  </span>
                </div>
              </div>

              {!sidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="text-base font-extrabold tracking-tight text-white flex items-center">
                    <span>Kube</span>
                    <span className="text-sky-400 bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                      Guard
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 tracking-tight font-medium truncate -mt-0.5">
                    Self-Healing K8s Platform
                  </span>
                </div>
              )}
            </Link>

            {/* Sidebar Collapse Toggle */}
            {!sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#101b33]/60"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                >
                  {/* Left active glowing indicator bar */}
                  {isActive && !sidebarCollapsed && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-full shadow-[0_0_8px_#ffffff]" />
                  )}

                  <Icon
                    size={18}
                    className={`flex-shrink-0 transition-transform ${
                      isActive ? "text-white" : "group-hover:text-sky-400"
                    }`}
                  />

                  {!sidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}

                  {!sidebarCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full min-w-4 text-center ${
                        item.badgeColor || "bg-blue-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Cluster Status, Env Selector, User Profile) */}
        <div className="p-3 border-t border-[#162235] space-y-2">
          {/* Expand button when collapsed */}
          {sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition"
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {!sidebarCollapsed && (
            <>
              {/* Cluster Status Box */}
              <div className="bg-[#0b1426] border border-[#1a2944] rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      Cluster Connected
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    14ms
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-200 mt-1 truncate">
                  {currentCluster.name}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                  <span>{currentCluster.k8sVersion}</span>
                  <span className="text-slate-400 font-mono">
                    uptime: {currentCluster.uptimePercent}%
                  </span>
                </div>
              </div>

              {/* Environment Selector */}
              <div className="bg-[#0b1426] border border-[#1a2944] rounded-xl p-2.5">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1 px-1">
                  Environment
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                  {(["DEVELOPMENT", "STAGING", "PRODUCTION"] as Environment[]).map(
                    (env) => (
                      <button
                        key={env}
                        onClick={() => setCurrentEnv(env)}
                        className={`py-1 rounded-md font-medium transition ${
                          currentEnv === env
                            ? env === "PRODUCTION"
                              ? "bg-rose-950/70 border border-rose-600/60 text-rose-300 font-bold"
                              : env === "STAGING"
                              ? "bg-amber-950/70 border border-amber-600/60 text-amber-300 font-bold"
                              : "bg-sky-950/70 border border-sky-600/60 text-sky-300 font-bold"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                        }`}
                      >
                        {env.slice(0, 3)}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* User Profile Card */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#101b33] transition cursor-pointer group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0">
                    JD
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      John Doe
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Lead DevOps Engineer
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                />
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

