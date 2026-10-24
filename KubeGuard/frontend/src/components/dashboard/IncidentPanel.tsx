"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { TriangleAlert, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export function IncidentPanel() {
  const { incidents, setSelectedIncident } = useDashboard();
  const [activeTab, setActiveTab] = useState<string>("all");

  const filtered = incidents.filter((inc) => {
    if (activeTab === "all") return true;
    if (activeTab === "critical") return inc.severity === "critical";
    if (activeTab === "warning") return inc.severity === "warning";
    if (activeTab === "info") return inc.severity === "info" || inc.severity === "resolved";
    return true;
  });

  return (
    <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#15243E]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-[#FF426D]">
              <TriangleAlert size={16} />
            </div>
            <h2 className="text-base font-bold text-[#F1F5FF] tracking-tight">
              Recent Incidents
            </h2>
          </div>

          <Link
            href="/incidents"
            className="text-xs text-[#00D9FF] hover:underline font-medium flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-3.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              activeTab === "all"
                ? "bg-[#7C3AED] text-white font-bold shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                : "bg-[#050D1C] border border-[#172A46] text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setActiveTab("critical")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
              activeTab === "critical"
                ? "bg-[#7C3AED] text-white font-bold shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                : "bg-[#050D1C] border border-[#172A46] text-slate-400 hover:text-white"
            }`}
          >
            <span>Critical</span>
            <span className="w-4 h-4 rounded-full bg-[#FF426D] text-white text-[9px] font-bold flex items-center justify-center">
              1
            </span>
          </button>

          <button
            onClick={() => setActiveTab("warning")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
              activeTab === "warning"
                ? "bg-[#7C3AED] text-white font-bold shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                : "bg-[#050D1C] border border-[#172A46] text-slate-400 hover:text-white"
            }`}
          >
            <span>Warning</span>
            <span className="w-4 h-4 rounded-full bg-[#FFB020] text-slate-900 text-[9px] font-bold flex items-center justify-center">
              2
            </span>
          </button>

          <button
            onClick={() => setActiveTab("info")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              activeTab === "info"
                ? "bg-[#7C3AED] text-white font-bold shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                : "bg-[#050D1C] border border-[#172A46] text-slate-400 hover:text-white"
            }`}
          >
            Info
          </button>
        </div>

        {/* Incidents List */}
        <div className="divide-y divide-[#15243E] mt-3">
          {filtered.slice(0, 5).map((item) => {
            const isCritical = item.severity === "critical";
            const isWarning = item.severity === "warning";
            const isResolved = item.status === "remediated" || item.severity === "resolved";

            return (
              <div
                key={item.id}
                onClick={() => setSelectedIncident(item)}
                className="py-3 flex items-center justify-between group cursor-pointer hover:bg-[#0E1E38]/60 -mx-2 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Badge */}
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-mono flex-shrink-0 ${
                      isCritical
                        ? "bg-[#FF426D]/20 text-[#FF426D] border border-[#FF426D]/40"
                        : isWarning
                        ? "bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/40"
                        : "bg-[#2563EB]/20 text-[#00D9FF] border border-[#00D9FF]/30"
                    }`}
                  >
                    {item.severity}
                  </span>

                  <div className="truncate">
                    <div className="text-xs font-bold text-[#F1F5FF] group-hover:text-[#00D9FF] transition truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      {item.namespace} / {item.workload} • {item.detectedAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {isResolved ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-[#10F5A0] border border-emerald-500/30">
                      Resolved
                    </span>
                  ) : isCritical ? (
                    <span className="text-[11px] font-mono text-[#FFB020] font-semibold">
                      Investigating
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-[#FFB020] font-semibold">
                      Open
                    </span>
                  )}

                  <ChevronRight
                    size={14}
                    className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
