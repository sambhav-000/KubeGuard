"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ResourceCharts } from "@/components/dashboard/ResourceCharts";
import { WorkloadTable } from "@/components/dashboard/WorkloadTable";
import { IncidentPanel } from "@/components/dashboard/IncidentPanel";
import { RecoveryTimeline } from "@/components/dashboard/RecoveryTimeline";
import { RecentDeployments } from "@/components/dashboard/RecentDeployments";
import {
  ShieldCheck,
  Boxes,
  TriangleAlert,
  Sparkles,
  Server,
  Clock,
  RefreshCw,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function OverviewPage() {
  const { currentCluster, incidents, workloads, isRefreshing, triggerRefresh } =
    useDashboard();

  const criticalIncidentsCount = incidents.filter(
    (i) => i.severity === "critical"
  ).length;
  const activeIncidentsCount = incidents.filter(
    (i) => i.severity === "critical" || i.severity === "warning"
  ).length;
  const resolvedTodayCount = incidents.filter(
    (i) => i.severity === "resolved"
  ).length;

  return (
    <div className="space-y-6">
      {/* ==================== WELCOME & CLUSTER STATUS BANNER ==================== */}
      <div className="bg-gradient-to-r from-[#0d162a] via-[#101c38] to-[#0c1426] border border-[#263244] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Kubernetes at a glance</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
              <span>Cluster Overview:</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-white">
                {currentCluster.name}
              </span>
            </h1>

            <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Real-time failure detection, autonomous self-healing orchestration,
              and observability across all namespaces.
            </p>

            {/* Quick Metadata Pill Strip */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5 bg-[#090f1d] px-2.5 py-1 rounded-lg border border-[#1b2b48]">
                <Server size={13} className="text-sky-400" />
                <span>K8s {currentCluster.k8sVersion}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#090f1d] px-2.5 py-1 rounded-lg border border-[#1b2b48]">
                <Clock size={13} className="text-indigo-400" />
                <span>Uptime: {currentCluster.uptime} ({currentCluster.uptimePercent}%)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#090f1d] px-2.5 py-1 rounded-lg border border-[#1b2b48]">
                <RefreshCw size={13} className="text-emerald-400" />
                <span>Last sync: {currentCluster.lastSync}</span>
              </div>
            </div>
          </div>

          {/* Prominent Overall Status Badge & Health Indicator */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3">
            <div
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border font-bold text-sm tracking-wide shadow-lg ${
                currentCluster.status === "healthy"
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-emerald-950/30"
                  : currentCluster.status === "degraded"
                  ? "bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-amber-950/30"
                  : "bg-rose-950/60 border-rose-500/50 text-rose-300 shadow-rose-950/30"
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    currentCluster.status === "healthy"
                      ? "bg-emerald-400"
                      : currentCluster.status === "degraded"
                      ? "bg-amber-400"
                      : "bg-rose-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    currentCluster.status === "healthy"
                      ? "bg-emerald-500"
                      : currentCluster.status === "degraded"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
              </span>
              <span className="uppercase tracking-wider">
                {currentCluster.status} STATUS
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono text-left lg:text-right">
              Overall Health: <span className="text-white font-bold">{currentCluster.healthPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 4 METRIC CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Cluster Health */}
        <MetricCard
          title="Cluster Health"
          value={`${currentCluster.healthPercentage}%`}
          subValue="score"
          badge="Healthy Nodes"
          badgeColor="text-emerald-400 bg-emerald-950/50 border-emerald-800/40"
          icon={ShieldCheck}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/15 border-emerald-500/30"
          trendText={`${currentCluster.nodeCount.ready} of ${currentCluster.nodeCount.total} nodes online`}
          sparklineData={[85, 88, 90, 89, 92, 94, 92]}
          sparklineColor="#10b981"
        />

        {/* Card 2: Running Pods */}
        <MetricCard
          title="Running Pods"
          value={`${currentCluster.podCount.running}`}
          subValue={`/ ${currentCluster.podCount.total}`}
          badge={`${currentCluster.podCount.pending} Pending · ${currentCluster.podCount.failed} Failed`}
          badgeColor="text-amber-400 bg-amber-950/50 border-amber-800/40"
          icon={Boxes}
          iconColor="text-sky-400"
          iconBg="bg-sky-500/15 border-sky-500/30"
          trendText="92% desired capacity operational"
          sparklineData={[22, 24, 25, 23, 26, 25, 24]}
          sparklineColor="#38bdf8"
        />

        {/* Card 3: Incidents */}
        <MetricCard
          title="Active Incidents"
          value={`${activeIncidentsCount}`}
          subValue="open"
          badge={`${criticalIncidentsCount} Critical`}
          badgeColor="text-rose-400 bg-rose-950/50 border-rose-800/40"
          icon={TriangleAlert}
          iconColor="text-rose-400"
          iconBg="bg-rose-500/15 border-rose-500/30"
          trendText={`${resolvedTodayCount} resolved incidents today`}
          sparklineData={[4, 5, 3, 4, 6, 3, activeIncidentsCount]}
          sparklineColor="#f43f5e"
        />

        {/* Card 4: Recovery Actions */}
        <MetricCard
          title="Recovery Actions"
          value="18"
          subValue="today"
          badge="94.4% Success"
          badgeColor="text-violet-400 bg-violet-950/50 border-violet-800/40"
          icon={Sparkles}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/15 border-violet-500/30"
          trendText="17 autonomous recoveries verified"
          sparklineData={[8, 11, 14, 12, 16, 17, 18]}
          sparklineColor="#a855f7"
        />
      </div>

      {/* ==================== RESOURCE CHARTS ==================== */}
      <ResourceCharts />

      {/* ==================== WORKLOAD HEALTH TABLE ==================== */}
      <WorkloadTable />

      {/* ==================== INCIDENT CENTER + SELF-HEALING ACTIVITY ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <IncidentPanel />
        </div>
        <div className="lg:col-span-6">
          <RecoveryTimeline />
        </div>
      </div>

      {/* ==================== RECENT DEPLOYMENTS ==================== */}
      <RecentDeployments />
    </div>
  );
}