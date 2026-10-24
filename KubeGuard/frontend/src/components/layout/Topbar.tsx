"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/context/DashboardContext";
import {
  Search,
  Bell,
  RefreshCw,
  ChevronDown,
  Menu,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  User,
  LogOut,
  ExternalLink,
  Moon,
  LayoutDashboard,
} from "lucide-react";

function KubeHelmIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2L3.5 7V17L12 22L20.5 17V7L12 2Z"
        stroke="#00D9FF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.2" stroke="#00D9FF" strokeWidth="1.6" />
      <path d="M12 2V8.8" stroke="#00D9FF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 15.2V22" stroke="#00D9FF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 7L9.2 10.4" stroke="#00D9FF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.8 13.6L20.5 17" stroke="#00D9FF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 17L9.2 13.6" stroke="#00D9FF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.8 10.4L20.5 7" stroke="#00D9FF" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const {
    clusters,
    currentCluster,
    setCurrentClusterId,
    currentEnv,
    sidebarCollapsed,
    setMobileMenuOpen,
    searchQuery,
    setSearchQuery,
    isRefreshing,
    triggerRefresh,
    lastRefreshed,
    incidents,
    setSelectedIncident,
  } = useDashboard();

  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Generate dynamic breadcrumb
  const pathSegments = pathname ? pathname.split("/").filter(Boolean) : [];
  const pageTitle =
    pathSegments.length === 0
      ? "Overview"
      : pathSegments[0]
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");

  const activeIncidents = incidents.filter(
    (i) => i.severity === "critical" || i.severity === "warning"
  );

  return (
    <header
      className={`h-16 border-b border-[#15243E] bg-[#030712]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      }`}
    >
      {/* Left Area: Mobile Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          aria-label="Open mobile menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-200 transition font-medium flex items-center gap-1.5"
          >
            <LayoutDashboard size={14} className="text-[#00D9FF]" />
            <span className="text-[#F1F5FF] font-semibold">{pageTitle}</span>
          </Link>
          <span className="text-slate-600 font-mono">&gt;</span>
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <div className="relative hidden md:block w-72 lg:w-96 mx-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search anything... (pods, deployments, incidents, etc.)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#08152B] border border-[#172A46] rounded-xl pl-9 pr-12 py-1.5 text-xs text-[#F1F5FF] placeholder:text-slate-500 focus:outline-none focus:border-[#00D9FF]/60 focus:ring-1 focus:ring-[#00D9FF]/30 transition"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400 bg-[#0E1E38] border border-[#1C3154] px-1.5 py-0.5 rounded font-mono">
          <span>⌘K</span>
        </div>
      </div>

      {/* Right Area Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Cluster Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setClusterDropdownOpen(!clusterDropdownOpen);
              setNotificationDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            className="flex items-center gap-2 bg-[#08152B] hover:bg-[#0E1E38] border border-[#172A46] rounded-xl px-3 py-1.5 text-xs font-medium text-slate-200 transition"
          >
            <KubeHelmIcon className="w-4 h-4" />
            <span className="hidden sm:inline truncate max-w-[130px] font-mono">
              {currentCluster.name}
            </span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {clusterDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#08152B] border border-[#172A46] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider px-2 py-1">
                Kubernetes Clusters
              </div>
              <div className="space-y-1 mt-1">
                {clusters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCurrentClusterId(c.id);
                      setClusterDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                      c.id === currentCluster.id
                        ? "bg-[#7C3AED]/20 border border-[#7C3AED]/50 text-white"
                        : "hover:bg-slate-800/60 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {c.k8sVersion} • {c.region}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        c.environment === "PRODUCTION"
                          ? "bg-emerald-950/80 text-[#10F5A0]"
                          : "bg-sky-950/80 text-sky-300"
                      }`}
                    >
                      {c.environment.slice(0, 4)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Environment Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono tracking-wide border border-emerald-500/40 bg-emerald-950/60 text-[#10F5A0] shadow-[0_0_10px_rgba(16,245,160,0.2)] select-none">
          <span>Production</span>
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationDropdownOpen(!notificationDropdownOpen);
              setClusterDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            className="relative p-2 rounded-xl bg-[#08152B] hover:bg-[#0E1E38] border border-[#172A46] text-slate-300 hover:text-white transition"
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 bg-[#FF426D] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,66,109,0.7)] animate-pulse">
              3
            </span>
          </button>

          {notificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#08152B] border border-[#172A46] rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#15243E]">
                <div className="text-xs font-semibold text-white">
                  Cluster Notifications
                </div>
                <span className="text-[10px] text-[#FF426D] font-mono font-bold">
                  3 active alerts
                </span>
              </div>
              <div className="divide-y divide-[#15243E] max-h-64 overflow-y-auto mt-1">
                {activeIncidents.slice(0, 3).map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setNotificationDropdownOpen(false);
                    }}
                    className="py-2.5 px-1.5 hover:bg-slate-800/40 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#FF426D] uppercase">
                        {inc.severity}
                      </span>
                      <span className="text-slate-400">{inc.detectedAt}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                      {inc.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {inc.namespace}/{inc.workload}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/incidents"
                onClick={() => setNotificationDropdownOpen(false)}
                className="block text-center text-xs font-medium text-[#00D9FF] hover:underline pt-2 border-t border-[#15243E] mt-2"
              >
                View all incidents →
              </Link>
            </div>
          )}
        </div>

        {/* Refresh Control */}
        <button
          onClick={triggerRefresh}
          disabled={isRefreshing}
          title={`Last synced: ${lastRefreshed}`}
          className="p-2 rounded-xl bg-[#08152B] hover:bg-[#0E1E38] border border-[#172A46] text-slate-300 hover:text-white transition disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={`${isRefreshing ? "animate-spin text-[#00D9FF]" : ""}`}
          />
        </button>

        {/* Theme Toggle (Moon) */}
        <button
          className="p-2 rounded-xl bg-[#08152B] hover:bg-[#0E1E38] border border-[#172A46] text-slate-300 hover:text-white transition"
          title="Toggle Theme"
        >
          <Moon size={15} />
        </button>

        {/* Live Indicator & Datetime */}
        <div className="hidden xl:flex items-center gap-2 pl-1 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10F5A0] bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10F5A0] animate-pulse"></span>
            <span>Live</span>
          </div>
          <span className="text-slate-400 text-[11px]">Apr 25, 2025 14:32</span>
        </div>

        {/* User Avatar with Initials SG */}
        <div className="relative pl-1">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setClusterDropdownOpen(false);
              setNotificationDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#7C3AED] transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#2563EB] to-[#00D9FF] border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_12px_rgba(0,217,255,0.4)]">
              SG
            </div>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#08152B] border border-[#172A46] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#15243E]">
                <div className="text-xs font-semibold text-white">Sambhav Gupta</div>
                <div className="text-[10px] text-slate-400">
                  sambhav.gupta@kubeguard.io
                </div>
                <span className="inline-block mt-1 text-[9px] font-bold text-[#10F5A0] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40 font-mono">
                  DevOps Engineer
                </span>
              </div>
              <div className="py-1 space-y-0.5 text-xs text-slate-300">
                <Link
                  href="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/60 transition"
                >
                  <User size={14} className="text-slate-400" />
                  <span>Profile & Security</span>
                </Link>
                <Link
                  href="/audit"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/60 transition"
                >
                  <Layers size={14} className="text-slate-400" />
                  <span>Audit Trail</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
