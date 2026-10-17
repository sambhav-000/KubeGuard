"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { WorkloadItem, HealthStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Plus,
  Minus,
  Boxes,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export function WorkloadTable() {
  const { workloads, restartWorkload, scaleWorkload } = useDashboard();
  const [search, setSearch] = useState("");
  const [namespaceFilter, setNamespaceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof WorkloadItem>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const namespaces = useMemo(() => {
    return Array.from(new Set(workloads.map((w) => w.namespace)));
  }, [workloads]);

  const filteredWorkloads = useMemo(() => {
    return workloads
      .filter((w) => {
        const matchesSearch =
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          w.namespace.toLowerCase().includes(search.toLowerCase());
        const matchesNamespace =
          namespaceFilter === "all" || w.namespace === namespaceFilter;
        const matchesStatus =
          statusFilter === "all" || w.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesNamespace && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === "string") {
          return sortAsc
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [workloads, search, namespaceFilter, statusFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredWorkloads.length / pageSize) || 1;
  const paginatedWorkloads = filteredWorkloads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: keyof WorkloadItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header with Title and Global Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1f2b3f]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Boxes size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Workload Health & Replicas
              </h2>
              <p className="text-xs text-slate-400">
                Deployments, StatefulSets & DaemonSets running in cluster
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter workloads..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#0a101d] border border-[#1a2846] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
              />
            </div>

            {/* Namespace Filter */}
            <select
              value={namespaceFilter}
              onChange={(e) => {
                setNamespaceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a101d] border border-[#1a2846] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 cursor-pointer"
            >
              <option value="all">All Namespaces</option>
              {namespaces.map((ns) => (
                <option key={ns} value={ns}>
                  {ns}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a101d] border border-[#1a2846] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="healthy">Healthy</option>
              <option value="degraded">Degraded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Workload Data Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1c283f] text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Workload Name</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("namespace")}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Namespace</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Replicas</th>
                <th
                  onClick={() => handleSort("cpuPercent")}
                  className="py-3 px-3 cursor-pointer hover:text-white text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>CPU</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("memPercent")}
                  className="py-3 px-3 cursor-pointer hover:text-white text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Memory</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3 px-3 cursor-pointer hover:text-white text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("restarts")}
                  className="py-3 px-3 cursor-pointer hover:text-white text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Restarts</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172238]">
              {paginatedWorkloads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No workloads matching the current filters.
                  </td>
                </tr>
              ) : (
                paginatedWorkloads.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#121c33]/60 transition group"
                  >
                    {/* Name + Kind */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <Boxes size={12} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200 group-hover:text-blue-300 transition">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {item.kind}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Namespace */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                      {item.namespace}
                    </td>

                    {/* Replicas (with scale buttons) */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                        <span
                          className={`font-bold ${
                            item.readyReplicas < item.desiredReplicas
                              ? "text-rose-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {item.readyReplicas}
                        </span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-300">
                          {item.desiredReplicas}
                        </span>

                        <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => scaleWorkload(item.id, -1)}
                            className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                            title="Scale Down"
                          >
                            <Minus size={10} />
                          </button>
                          <button
                            onClick={() => scaleWorkload(item.id, 1)}
                            className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                            title="Scale Up"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* CPU Utilization Bar */}
                    <td className="py-3 px-3">
                      <div className="w-24 mx-auto">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                          <span>{item.cpuUsage}</span>
                          <span>{item.cpuPercent}%</span>
                        </div>
                        <div className="w-full bg-[#16233b] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.cpuPercent > 80
                                ? "bg-rose-500"
                                : item.cpuPercent > 60
                                ? "bg-amber-500"
                                : "bg-cyan-500"
                            }`}
                            style={{ width: `${item.cpuPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Memory Utilization Bar */}
                    <td className="py-3 px-3">
                      <div className="w-24 mx-auto">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                          <span>{item.memUsage}</span>
                          <span>{item.memPercent}%</span>
                        </div>
                        <div className="w-full bg-[#16233b] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.memPercent > 85
                                ? "bg-rose-500"
                                : item.memPercent > 65
                                ? "bg-amber-500"
                                : "bg-purple-500"
                            }`}
                            style={{ width: `${item.memPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Restarts */}
                    <td className="py-3 px-3 text-center font-mono">
                      <span
                        className={`font-semibold ${
                          item.restarts > 5
                            ? "text-rose-400"
                            : item.restarts > 0
                            ? "text-amber-400"
                            : "text-slate-400"
                        }`}
                      >
                        {item.restarts}
                      </span>
                    </td>

                    {/* Restart Rollout Action */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => restartWorkload(item.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition"
                        title="Trigger rollout restart"
                      >
                        <RotateCcw size={12} />
                        <span>Restart</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1c283f] mt-4 text-xs text-slate-400">
        <div>
          Showing {paginatedWorkloads.length} of {filteredWorkloads.length}{" "}
          workloads
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-xs px-2 text-white">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

