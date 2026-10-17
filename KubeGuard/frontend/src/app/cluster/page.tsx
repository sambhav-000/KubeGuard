"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { mockNodes } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Network,
  Server,
  Layers,
  Cpu,
  HardDrive,
  Boxes,
  ShieldAlert,
  Info,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

export default function ClusterExplorerPage() {
  const { currentCluster } = useDashboard();
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const filteredNodes = mockNodes.filter((node) => {
    if (selectedRole === "all") return true;
    return node.role === selectedRole;
  });

  const clusterEvents = [
    {
      type: "Warning",
      reason: "BackOff",
      object: "Pod/user-service-5f8d7c6d9-7xz2m",
      message: "Back-off restarting failed container in pod user-service",
      time: "2m ago",
    },
    {
      type: "Warning",
      reason: "OOMKilled",
      object: "Pod/payment-processor-8d9f-q9pl",
      message: "Memory cgroup limit exceeded (1024Mi)",
      time: "15m ago",
    },
    {
      type: "Normal",
      reason: "Scheduled",
      object: "Pod/frontend-web-3d2f-k9pl",
      message: "Successfully assigned production/frontend-web to kind-worker-1",
      time: "32m ago",
    },
    {
      type: "Normal",
      reason: "Pulling",
      object: "Pod/frontend-web-3d2f-k9pl",
      message: "Pulling image registry.internal/apps/frontend:v2.1.0",
      time: "31m ago",
    },
    {
      type: "Normal",
      reason: "Pulled",
      object: "Pod/frontend-web-3d2f-k9pl",
      message: "Successfully pulled image in 1.42s",
      time: "30m ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c283f]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Network className="text-sky-400" size={26} />
            <span>Cluster Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Nodes topology, capacity allocation, namespaces & cluster-level events
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#0c1426] border border-[#1a2846] rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60"
          >
            <option value="all">All Node Roles</option>
            <option value="control-plane">Control Plane</option>
            <option value="worker">Worker Nodes</option>
          </select>
        </div>
      </div>

      {/* Cluster Allocation Summary Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* CPU Allocation */}
        <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu size={14} className="text-cyan-400" />
              <span>Cluster CPU Allocation</span>
            </span>
            <span className="font-mono text-cyan-400">42.3%</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            5.08 <span className="text-slate-500 text-sm font-normal">/ 12.0 vCPU</span>
          </div>
          <div className="w-full bg-[#16233b] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: "42.3%" }} />
          </div>
        </div>

        {/* Memory Allocation */}
        <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <HardDrive size={14} className="text-purple-400" />
              <span>Cluster Memory Allocation</span>
            </span>
            <span className="font-mono text-purple-400">58.0%</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            13.92 <span className="text-slate-500 text-sm font-normal">/ 24.0 GiB</span>
          </div>
          <div className="w-full bg-[#16233b] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: "58.0%" }} />
          </div>
        </div>

        {/* Pod Allocation */}
        <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Boxes size={14} className="text-emerald-400" />
              <span>Pod Capacity Usage</span>
            </span>
            <span className="font-mono text-emerald-400">7.9%</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            26 <span className="text-slate-500 text-sm font-normal">/ 330 Pods max</span>
          </div>
          <div className="w-full bg-[#16233b] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "7.9%" }} />
          </div>
        </div>
      </div>

      {/* Nodes Cards Grid */}
      <div>
        <h2 className="text-sm font-bold text-white tracking-tight uppercase mb-3 text-slate-300">
          Cluster Nodes ({filteredNodes.length})
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredNodes.map((node) => (
            <div
              key={node.name}
              className="bg-[#0f172a] border border-[#263244] rounded-2xl p-5 hover:border-slate-700 transition space-y-4"
            >
              {/* Node Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Server size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight font-mono">
                      {node.name}
                    </h3>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Role: {node.role} • {node.kubeletVersion}
                    </div>
                  </div>
                </div>
                <StatusBadge status={node.status} size="sm" />
              </div>

              {/* Node Metrics */}
              <div className="space-y-3 pt-2 border-t border-[#1a2846]">
                {/* CPU */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">CPU Usage</span>
                    <span className="text-cyan-400 font-bold">
                      {node.cpuUsage}% ({node.cpuCores})
                    </span>
                  </div>
                  <div className="w-full bg-[#16233b] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        node.cpuUsage > 75 ? "bg-rose-500" : "bg-cyan-500"
                      }`}
                      style={{ width: `${node.cpuUsage}%` }}
                    />
                  </div>
                </div>

                {/* Memory */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Memory Usage</span>
                    <span className="text-purple-400 font-bold">
                      {node.memUsage}% ({node.memGiB})
                    </span>
                  </div>
                  <div className="w-full bg-[#16233b] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        node.memUsage > 75 ? "bg-rose-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${node.memUsage}%` }}
                    />
                  </div>
                </div>

                {/* Pods */}
                <div className="flex justify-between text-[11px] font-mono pt-1 text-slate-400">
                  <span>Assigned Pods:</span>
                  <span className="text-white font-bold">
                    {node.podCount} / {node.podCapacity}
                  </span>
                </div>
              </div>

              {/* OS & Taints */}
              <div className="pt-3 border-t border-[#1a2846] text-[10px] text-slate-400 font-mono space-y-1">
                <div>OS: {node.osImage}</div>
                {node.taints.length > 0 ? (
                  <div className="text-amber-400/90 truncate">
                    Taint: {node.taints.join(", ")}
                  </div>
                ) : (
                  <div className="text-slate-500">No taints configured</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cluster-Level Events Feed */}
      <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#1c283f] mb-4">
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-sky-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Cluster Events Stream
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Last 5 events (watch API active)
          </span>
        </div>

        <div className="divide-y divide-[#172238]">
          {clusterEvents.map((evt, idx) => (
            <div
              key={idx}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-[#121c33]/50 px-2 -mx-2 rounded-lg transition"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    evt.type === "Warning"
                      ? "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                      : "bg-sky-950/60 text-sky-300 border border-sky-800/40"
                  }`}
                >
                  {evt.reason}
                </span>
                <div>
                  <span className="font-mono text-slate-200 font-semibold">
                    {evt.object}:{" "}
                  </span>
                  <span className="text-slate-400">{evt.message}</span>
                </div>
              </div>

              <span className="text-[11px] text-slate-500 font-mono sm:text-right flex-shrink-0">
                {evt.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

