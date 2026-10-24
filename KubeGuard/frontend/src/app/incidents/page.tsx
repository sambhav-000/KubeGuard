"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  TriangleAlert,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Terminal,
  Activity,
} from "lucide-react";

export default function IncidentsPage() {
  const { incidents, setSelectedIncident, resolveIncident, triggerIncidentRemediation } =
    useDashboard();
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const filtered = incidents.filter((i) => {
    if (filterSeverity === "all") return true;
    return i.severity === filterSeverity;
  });

  const criticalCount = incidents.filter((i) => i.severity === "critical").length;
  const warningCount = incidents.filter((i) => i.severity === "warning").length;
  const resolvedCount = incidents.filter((i) => i.severity === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#15243E]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F1F5FF] tracking-tight flex items-center gap-3">
            <TriangleAlert className="text-[#FF426D]" size={26} />
            <span>Incident Management Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated failure detection, root-cause diagnosis & one-click remediation
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center bg-[#050D1C] border border-[#172A46] rounded-xl p-0.5 text-xs font-medium">
          {[
            { id: "all", label: `All (${incidents.length})` },
            { id: "critical", label: `Critical (${criticalCount})` },
            { id: "warning", label: `Warning (${warningCount})` },
            { id: "resolved", label: `Resolved (${resolvedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterSeverity(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterSeverity === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Cards List */}
      <div className="space-y-4">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            className="bg-[#08152B] border border-[#172A46] hover:border-slate-600/80 rounded-2xl p-6 shadow-md transition space-y-4"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    inc.severity === "critical"
                      ? "bg-rose-500/10 border border-rose-500/30 text-[#FF426D]"
                      : inc.severity === "warning"
                      ? "bg-amber-500/10 border border-amber-500/30 text-[#FFB020]"
                      : "bg-emerald-500/10 border border-emerald-500/30 text-[#10F5A0]"
                  }`}
                >
                  <ShieldAlert size={20} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 font-bold">
                      {inc.id}
                    </span>
                    <StatusBadge status={inc.severity} size="sm" />
                    <span className="text-xs text-slate-500 font-mono">
                      • {inc.detectedAt}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F1F5FF] tracking-tight mt-1">
                    {inc.title}
                  </h3>

                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Target: <span className="text-slate-200">{inc.namespace}/{inc.workload}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:self-start">
                <button
                  onClick={() => setSelectedIncident(inc)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#00D9FF] hover:text-cyan-300 bg-[#050D1C] hover:bg-[#15243E] border border-[#172A46] transition flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>View Diagnosis</span>
                </button>

                {inc.severity !== "resolved" ? (
                  <button
                    onClick={() => triggerIncidentRemediation(inc.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-900/30 transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    <span>Auto-Remediate</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-[#10F5A0] font-mono flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                    <CheckCircle2 size={13} />
                    <span>Remediated</span>
                  </span>
                )}
              </div>
            </div>

            {/* Failure Signal & Diagnosis details */}
            <div className="bg-[#050D1C] border border-[#172A46] rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-semibold flex-shrink-0">
                  Observed Failure:
                </span>
                <span className="text-rose-400 font-mono">
                  {inc.failureReason}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-semibold flex-shrink-0">
                  AI Root Cause:
                </span>
                <span className="text-slate-200 leading-relaxed">
                  {inc.diagnosis}
                </span>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-[#15243E]">
                <span className="text-slate-400 font-semibold flex-shrink-0">
                  Current Status:
                </span>
                <span className="text-[#10F5A0] font-mono">
                  {inc.actionTaken}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
