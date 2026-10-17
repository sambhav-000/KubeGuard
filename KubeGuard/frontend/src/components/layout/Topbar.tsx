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
} from "lucide-react";

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
      className={`h-16 border-b border-[#162235] bg-[#080d19]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 transition-all duration-300 ${
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
            <Shield size={14} className="text-sky-400" />
            <span className="hidden sm:inline">KubeGuard</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="font-semibold text-white tracking-tight">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Middle & Right Area */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workloads, pods, nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c1426] border border-[#1a2846] rounded-xl pl-9 pr-12 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400 bg-[#142036] border border-[#203354] px-1.5 py-0.5 rounded font-mono">
            <span>⌘K</span>
          </div>
        </div>

        {/* Cluster Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setClusterDropdownOpen(!clusterDropdownOpen);
              setNotificationDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            className="flex items-center gap-2 bg-[#0c1426] hover:bg-[#111d38] border border-[#1a2846] rounded-xl px-3 py-1.5 text-xs font-medium text-slate-200 transition"
          >
            <Server size={14} className="text-sky-400" />
            <span className="hidden sm:inline truncate max-w-[120px]">
              {currentCluster.name}
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {clusterDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0d162a] border border-[#1e2f4f] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider px-2 py-1">
                Connected Clusters
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
                        ? "bg-blue-600/20 border border-blue-500/40 text-blue-200"
                        : "hover:bg-slate-800/60 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {c.k8sVersion} • {c.region}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                        c.environment === "PRODUCTION"
                          ? "bg-rose-950/80 text-rose-300"
                          : c.environment === "STAGING"
                          ? "bg-amber-950/80 text-amber-300"
                          : "bg-sky-950/80 text-sky-300"
                      }`}
                    >
                      {c.environment.slice(0, 3)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Environment Badge */}
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider border select-none ${
            currentEnv === "PRODUCTION"
              ? "bg-rose-950/40 border-rose-800/60 text-rose-400"
              : currentEnv === "STAGING"
              ? "bg-amber-950/40 border-amber-800/60 text-amber-400"
              : "bg-sky-950/40 border-sky-800/60 text-sky-400"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              currentEnv === "PRODUCTION"
                ? "bg-rose-400"
                : currentEnv === "STAGING"
                ? "bg-amber-400"
                : "bg-sky-400"
            }`}
          />
          <span>{currentEnv}</span>
        </div>

        {/* Refresh Control */}
        <button
          onClick={triggerRefresh}
          disabled={isRefreshing}
          title={`Last synced: ${lastRefreshed}`}
          className="flex items-center gap-1.5 p-2 rounded-xl bg-[#0c1426] hover:bg-[#111d38] border border-[#1a2846] text-slate-300 hover:text-white transition disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={`${isRefreshing ? "animate-spin text-sky-400" : ""}`}
          />
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationDropdownOpen(!notificationDropdownOpen);
              setClusterDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            className="relative p-2 rounded-xl bg-[#0c1426] hover:bg-[#111d38] border border-[#1a2846] text-slate-300 hover:text-white transition"
          >
            <Bell size={16} />
            {activeIncidents.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {activeIncidents.length}
              </span>
            )}
          </button>

          {notificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d162a] border border-[#1e2f4f] rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c2a47]">
                <div className="text-xs font-semibold text-white">
                  Cluster Notifications
                </div>
                <span className="text-[10px] text-slate-400">
                  {activeIncidents.length} active
                </span>
              </div>
              <div className="divide-y divide-[#1c2a47] max-h-64 overflow-y-auto mt-1">
                {activeIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setNotificationDropdownOpen(false);
                    }}
                    className="py-2.5 px-1.5 hover:bg-slate-800/40 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-rose-400 uppercase">
                        {inc.severity}
                      </span>
                      <span className="text-slate-400">{inc.detectedAt}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                      {inc.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {inc.workload} ({inc.namespace})
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/incidents"
                onClick={() => setNotificationDropdownOpen(false)}
                className="block text-center text-xs font-medium text-sky-400 hover:text-sky-300 pt-2 border-t border-[#1c2a47] mt-2"
              >
                View all incidents →
              </Link>
            </div>
          )}
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setClusterDropdownOpen(false);
              setNotificationDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/50 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border border-blue-400/30 flex items-center justify-center text-xs font-bold text-white shadow-md">
              JD
            </div>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0d162a] border border-[#1e2f4f] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#1c2a47]">
                <div className="text-xs font-semibold text-white">John Doe</div>
                <div className="text-[10px] text-slate-400">
                  john.doe@kubeguard.io
                </div>
                <span className="inline-block mt-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  Cluster Admin
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
                  <span>Session Audit Trail</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
