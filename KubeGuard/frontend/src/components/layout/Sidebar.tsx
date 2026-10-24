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
      badge: activeIncidentsCount > 0 ? String(activeIncidentsCount) : "3",
      badgeColor: "bg-[#FF426D] text-white font-bold",
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#060D1F] border-r border-[#15243E] flex flex-col justify-between transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div
            className={`h-16 flex items-center border-b border-[#15243E] px-4 justify-between`}
          >
            <Link
              href="/"
              className={`flex items-center gap-3 overflow-hidden transition-all ${
                sidebarCollapsed ? "justify-center w-full" : ""
              }`}
            >
              {/* Brand Shield Logo with Cyan-Violet Glow */}
              <div className="relative flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D9FF] via-[#2563EB] to-[#7C3AED] p-0.5 shadow-[0_0_18px_rgba(0,217,255,0.45)] flex items-center justify-center">
                <div className="w-full h-full bg-[#060D1F] rounded-[10px] flex items-center justify-center relative">
                  <Shield className="w-5 h-5 text-[#00D9FF] absolute" strokeWidth={2.4} />
                  <span className="relative z-10 text-[9px] font-black text-white tracking-tighter">
                    KG
                  </span>
                </div>
              </div>

              {!sidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="text-base font-extrabold tracking-tight text-[#F1F5FF] flex items-center">
                    <span>Kube</span>
                    <span className="text-[#00D9FF]">Guard</span>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] tracking-tight font-medium truncate -mt-0.5">
                    Self-Healing Kubernetes Platform
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
          <nav className="p-3 space-y-1.5">
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
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] font-semibold border border-violet-400/30"
                      : "text-slate-400 hover:text-[#F1F5FF] hover:bg-[#0E1E38]/80"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 transition-transform ${
                      isActive ? "text-white" : "group-hover:text-[#00D9FF]"
                    }`}
                  />

                  {!sidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}

                  {!sidebarCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full min-w-5 text-center ${
                        item.badgeColor || "bg-[#FF426D] text-white"
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

        {/* Sidebar Footer with Atmospheric Glow Wave */}
        <div className="relative p-3 border-t border-[#15243E] space-y-2.5 overflow-hidden">
          {/* Cyberpunk atmospheric glowing wave in background */}
          <div className="absolute -bottom-6 -left-6 -right-6 h-32 pointer-events-none opacity-40">
            <svg viewBox="0 0 300 120" className="w-full h-full" fill="none">
              <path
                d="M-20 80 Q 60 20, 150 70 T 320 40"
                stroke="url(#sidebarWaveGrad)"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M-10 100 Q 70 40, 160 90 T 330 60"
                stroke="url(#sidebarWaveGrad2)"
                strokeWidth="1.5"
                fill="none"
              />
              <defs>
                <linearGradient id="sidebarWaveGrad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00D9FF" />
                  <stop offset="0.6" stopColor="#7C3AED" />
                  <stop offset="1" stopColor="#2563EB" />
                </linearGradient>
                <linearGradient id="sidebarWaveGrad2" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563EB" stopOpacity="0.3" />
                  <stop offset="0.7" stopColor="#00D9FF" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

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
            <div className="relative z-10 space-y-2">
              {/* Cluster Connected Card */}
              <div className="bg-[#08152B]/90 border border-[#172A46] rounded-xl p-3 hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-between group">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10F5A0] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10F5A0]"></span>
                    </span>
                    <span className="text-xs font-semibold text-[#10F5A0]">
                      Cluster Connected
                    </span>
                  </div>
                  <div className="text-xs font-mono font-medium text-slate-300 mt-1 truncate">
                    {currentCluster.name}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition"
                />
              </div>

              {/* Environment Selector Dropdown */}
              <div className="bg-[#08152B]/90 border border-[#172A46] rounded-xl p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
                    <Boxes size={11} className="text-[#00D9FF]" />
                    <span>Environment</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#050D1C] border border-[#172A46] px-2 py-0.5 rounded-lg text-xs font-mono text-[#10F5A0]">
                    <span>{currentEnv.charAt(0) + currentEnv.slice(1).toLowerCase()}</span>
                    <ChevronDown size={11} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* User Profile Card */}
              <div className="bg-[#08152B]/90 border border-[#172A46] rounded-xl p-2.5 flex items-center justify-between hover:border-violet-500/40 transition cursor-pointer group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] via-[#2563EB] to-[#00D9FF] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(124,58,237,0.5)] flex-shrink-0">
                    SG
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#F1F5FF] truncate">
                      Sambhav Gupta
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      DevOps Engineer
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
