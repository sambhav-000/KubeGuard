"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WorkloadItem, WorkloadKind } from "@/lib/types";
import {
  Boxes,
  Layers,
  RotateCcw,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Filter,
} from "lucide-react";

export default function WorkloadsPage() {
  const { workloads, restartWorkload, scaleWorkload } = useDashboard();
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [namespaceFilter, setNamespaceFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    return workloads.filter((w) => {
      const matchKind = kindFilter === "all" || w.kind === kindFilter;
      const matchNs = namespaceFilter === "all" || w.namespace === namespaceFilter;
      const matchSearch =
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.image.toLowerCase().includes(search.toLowerCase());
      return matchKind && matchNs && matchSearch;
    });
  }, [workloads, kindFilter, namespaceFilter, search]);

  const namespaces = Array.from(new Set(workloads.map((w) => w.namespace)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#15243E]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F1F5FF] tracking-tight flex items-center gap-3">
            <Boxes className="text-[#00D9FF]" size={26} />
            <span>Kubernetes Workloads</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage Deployments, StatefulSets & DaemonSets across all active namespaces
          </p>
        </div>

        {/* Kind Filter Pills */}
        <div className="flex items-center bg-[#050D1C] border border-[#172A46] rounded-xl p-0.5 text-xs font-medium">
          {["all", "Deployment", "StatefulSet", "DaemonSet"].map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`px-3 py-1.5 rounded-lg transition capitalize ${
                kindFilter === k
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {k === "all" ? "All Kinds" : `${k}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#08152B] border border-[#172A46] rounded-2xl p-4 shadow-sm">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workload or container image..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00D9FF]/60"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={namespaceFilter}
            onChange={(e) => setNamespaceFilter(e.target.value)}
            className="bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#00D9FF]/60 cursor-pointer"
          >
            <option value="all">All Namespaces</option>
            {namespaces.map((ns) => (
              <option key={ns} value={ns}>
                {ns}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Workloads Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((w) => (
          <div
            key={w.id}
            className="bg-[#08152B] border border-[#172A46] rounded-2xl p-5 hover:border-cyan-500/40 transition flex flex-col justify-between space-y-4 shadow-md group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#00D9FF] shadow-[0_0_10px_rgba(0,217,255,0.15)]">
                    <Boxes size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F1F5FF] tracking-tight group-hover:text-[#00D9FF] transition">
                      {w.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {w.kind} • {w.namespace}
                    </div>
                  </div>
                </div>

                <StatusBadge status={w.status} size="sm" />
              </div>

              {/* Image string */}
              <div className="mt-3.5 text-[11px] text-slate-300 font-mono bg-[#050D1C] p-2 rounded-xl border border-[#172A46] truncate">
                {w.image}
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#15243E] text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[11px]">CPU Usage</span>
                  <div className="text-[#00D9FF] font-bold mt-0.5">
                    {w.cpuUsage} ({w.cpuPercent}%)
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Memory Usage</span>
                  <div className="text-violet-400 font-bold mt-0.5">
                    {w.memUsage} ({w.memPercent}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Replicas & Restart Rollout */}
            <div className="pt-3 border-t border-[#15243E] flex items-center justify-between">
              {/* Replicas Control */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400 text-[11px]">Replicas:</span>
                <span
                  className={`font-bold ${
                    w.readyReplicas < w.desiredReplicas
                      ? "text-[#FF426D]"
                      : "text-[#10F5A0]"
                  }`}
                >
                  {w.readyReplicas} / {w.desiredReplicas}
                </span>

                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => scaleWorkload(w.id, -1)}
                    className="p-1 rounded-lg bg-[#050D1C] hover:bg-[#15243E] text-slate-300 border border-[#172A46] transition"
                    title="Scale Down"
                  >
                    <Minus size={11} />
                  </button>
                  <button
                    onClick={() => scaleWorkload(w.id, 1)}
                    className="p-1 rounded-lg bg-[#050D1C] hover:bg-[#15243E] text-slate-300 border border-[#172A46] transition"
                    title="Scale Up"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>

              {/* Restart Button */}
              <button
                onClick={() => restartWorkload(w.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-[#050D1C] hover:bg-[#15243E] border border-[#172A46] transition"
              >
                <RotateCcw size={13} />
                <span>Restart</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
