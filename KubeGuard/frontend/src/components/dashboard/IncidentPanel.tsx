"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IncidentItem, IncidentSeverity } from "@/lib/types";
import {
  TriangleAlert,
  ChevronRight,
  Filter,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export function IncidentPanel() {
  const { incidents, setSelectedIncident } = useDashboard();
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = incidents.filter((inc) => {
    const matchesSev =
      severityFilter === "all" || inc.severity === severityFilter;
    const matchesStatus =
      statusFilter === "all" || inc.status === statusFilter;
    return matchesSev && matchesStatus;
  });

  return (
    <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1f2b3f]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <TriangleAlert size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Incident Center
                </h2>
                <span className="text-[10px] font-bold font-mono text-rose-400 bg-rose-950/50 border border-rose-800/40 px-2 py-0.5 rounded-full">
                  {incidents.filter((i) => i.severity === "critical").length} Critical
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cluster failure events & intelligent diagnostics
              </p>
            </div>
          </div>

          {/* Severity & Status Quick Filters */}
          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#0a101d] border border-[#1a2846] rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="resolved">Resolved</option>
            </select>

            <Link
              href="/incidents"
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition ml-2"
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Incidents List */}
        <div className="divide-y divide-[#172238] mt-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No incidents matching the active filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedIncident(item)}
                className="py-3.5 px-2 hover:bg-[#121c33]/70 -mx-2 rounded-xl cursor-pointer transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5">
                      <StatusBadge status={item.severity} size="sm" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-sky-300 transition flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono font-normal">
                          {item.id}
                        </span>
                      </div>

                      <div className="text-[11px] text-rose-300/80 font-mono mt-0.5 truncate">
                        {item.failureReason}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                        <span className="text-slate-300">
                          {item.namespace}/{item.workload}
                        </span>
                        <span>•</span>
                        <span>Action: {item.actionTaken}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.detectedAt}
                    </span>
                    <ChevronRight
                      size={15}
                      className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

