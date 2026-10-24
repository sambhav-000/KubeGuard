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
      object: "Pod/user-service-5f8d7c6d9",
      message: "Back-off restarting failed container in pod user-service",
      time: "2m ago",
    },
    {
      type: "Warning",
      reason: "OOMKilled",
      object: "Pod/payment-service-8d9f-q9pl",
      message: "Memory cgroup limit exceeded (1024Mi)",
      time: "15m ago",
    },
    {
      type: "Normal",
      reason: "Scheduled",
      object: "Pod/frontend-web-3d2f-k9pl",
      message: "Successfully assigned web/frontend to worker-node-1",
      time: "32m ago",
    },
    {
      type: "Normal",
      reason: "Pulling",
      object: "Pod/frontend-web-3d2f-k9pl",
      message: "Pulling image registry.internal/apps/frontend:v1.4.2",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#15243E]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F1F5FF] tracking-tight flex items-center gap-3">
            <Network className="text-[#00D9FF]" size={26} />
            <span>Cluster Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Nodes topology, capacity allocation, namespaces & cluster-level events for <span className="text-[#00D9FF] font-mono">{currentCluster.name}</span>
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#08152B] border border-[#172A46] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#00D9FF]/60 cursor-pointer"
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
        <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-5 hover:border-cyan-500/30 transition shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu size={14} className="text-[#00D9FF]" />
              <span>Cluster CPU Allocation</span>
            </span>
            <span className="font-mono text-[#00D9FF] font-bold">42.3%</span>
          </div>
          <div className="text-2xl font-extrabold text-[#F1F5FF] font-mono">
            5.08 <span className="text-slate-500 text-sm font-normal">/ 12.0 vCPU</span>
          </div>
          <div className="w-full bg-[#050D1C] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#00D9FF] h-full rounded-full shadow-[0_0_8px_#00D9FF]" style={{ width: "42.3%" }} />
          </div>
        </div>

        {/* Memory Allocation */}
        <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-5 hover:border-violet-500/30 transition shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <HardDrive size={14} className="text-[#A855F7]" />
              <span>Cluster Memory Allocation</span>
            </span>
            <span className="font-mono text-[#A855F7] font-bold">58.0%</span>
          </div>
          <div className="text-2xl font-extrabold text-[#F1F5FF] font-mono">
            13.92 <span className="text-slate-500 text-sm font-normal">/ 24.0 GiB</span>
          </div>
          <div className="w-full bg-[#050D1C] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#A855F7] h-full rounded-full shadow-[0_0_8px_#A855F7]" style={{ width: "58.0%" }} />
          </div>
        </div>

        {/* Pod Allocation */}
        <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-5 hover:border-emerald-500/30 transition shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Boxes size={14} className="text-[#10F5A0]" />
              <span>Pod Capacity Usage</span>
            </span>
            <span className="font-mono text-[#10F5A0] font-bold">87.5%</span>
          </div>
          <div className="text-2xl font-extrabold text-[#F1F5FF] font-mono">
            42 <span className="text-slate-500 text-sm font-normal">/ 48 Pods</span>
          </div>
          <div className="w-full bg-[#050D1C] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#10F5A0] h-full rounded-full shadow-[0_0_8px_#10F5A0]" style={{ width: "87.5%" }} />
          </div>
        </div>
      </div>

      {/* Nodes Cards Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 tracking-tight uppercase mb-3">
          Cluster Nodes ({filteredNodes.length})
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredNodes.map((node) => (
            <div
              key={node.name}
              className="bg-[#08152B] border border-[#172A46] hover:border-[#00D9FF]/40 rounded-2xl p-5 transition space-y-4 shadow-sm group"
            >
              {/* Node Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00D9FF]">
                    <Server size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F1F5FF] tracking-tight font-mono group-hover:text-[#00D9FF] transition">
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
              <div className="space-y-3 pt-2 border-t border-[#15243E]">
                {/* CPU */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">CPU Usage</span>
                    <span className="text-[#00D9FF] font-bold">
                      {node.cpuUsage}% ({node.cpuCores})
                    </span>
                  </div>
                  <div className="w-full bg-[#050D1C] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        node.cpuUsage > 75 ? "bg-[#FF426D]" : "bg-[#00D9FF]"
                      }`}
                      style={{ width: `${node.cpuUsage}%` }}
                    />
                  </div>
                </div>

                {/* Memory */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Memory Usage</span>
                    <span className="text-[#A855F7] font-bold">
                      {node.memUsage}% ({node.memGiB})
                    </span>
                  </div>
                  <div className="w-full bg-[#050D1C] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        node.memUsage > 75 ? "bg-[#FF426D]" : "bg-[#A855F7]"
                      }`}
                      style={{ width: `${node.memUsage}%` }}
                    />
                  </div>
                </div>

                {/* Pods */}
                <div className="flex justify-between text-[11px] font-mono pt-1 text-slate-400">
                  <span>Assigned Pods:</span>
                  <span className="text-[#F1F5FF] font-bold">
                    {node.podCount} / {node.podCapacity}
                  </span>
                </div>
              </div>

              {/* OS & Taints */}
              <div className="pt-3 border-t border-[#15243E] text-[10px] text-slate-400 font-mono space-y-1">
                <div>OS: {node.osImage}</div>
                {node.taints.length > 0 ? (
                  <div className="text-[#FFB020] truncate">
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
      <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#15243E] mb-4">
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-[#00D9FF]" />
            <h2 className="text-sm font-bold text-[#F1F5FF] tracking-tight">
              Cluster Events Stream
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Live watch events stream
          </span>
        </div>

        <div className="divide-y divide-[#15243E]">
          {clusterEvents.map((evt, idx) => (
            <div
              key={idx}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-[#0E1E38]/60 px-2 -mx-2 rounded-lg transition"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    evt.type === "Warning"
                      ? "bg-rose-950/60 text-[#FF426D] border border-rose-800/40"
                      : "bg-cyan-950/60 text-[#00D9FF] border border-cyan-800/40"
                  }`}
                >
                  {evt.reason}
                </span>
                <div>
                  <span className="font-mono text-[#F1F5FF] font-semibold">
                    {evt.object}:{" "}
                  </span>
                  <span className="text-slate-300">{evt.message}</span>
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
