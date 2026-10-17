"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  X,
  TriangleAlert,
  Terminal,
  Sparkles,
  CheckCircle2,
  Cpu,
  Clock,
  Layers,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export function IncidentDrawer() {
  const {
    selectedIncident,
    setSelectedIncident,
    resolveIncident,
    triggerIncidentRemediation,
  } = useDashboard();

  if (!selectedIncident) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#090f1d] border-l border-[#1a2944] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-[#172540] flex items-start justify-between bg-[#0a1224]/80">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selectedIncident.severity === "critical"
                    ? "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                    : selectedIncident.severity === "warning"
                    ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                    : "bg-sky-500/15 border border-sky-500/30 text-sky-400"
                }`}
              >
                <ShieldAlert size={20} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 font-semibold">
                    {selectedIncident.id}
                  </span>
                  <StatusBadge status={selectedIncident.severity} size="sm" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight mt-1">
                  {selectedIncident.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                  <span>Workload: {selectedIncident.workload}</span>
                  <span>•</span>
                  <span>Namespace: {selectedIncident.namespace}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedIncident(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Failure Reason Alert Box */}
            <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                <TriangleAlert size={14} />
                <span>Observed Failure Signal</span>
              </div>
              <div className="text-xs text-rose-200 mt-1 font-mono leading-relaxed">
                {selectedIncident.failureReason}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2">
                <Clock size={12} />
                <span>Detected at: {selectedIncident.detectedAt}</span>
              </div>
            </div>

            {/* Root Cause & Diagnosis Section */}
            <div className="bg-[#0c152a] border border-[#1a2846] rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-2">
                <Sparkles size={14} className="text-amber-400" />
                <span>KubeGuard Intelligent Root Cause Diagnosis</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedIncident.diagnosis}
              </p>
              {selectedIncident.rootCause && (
                <div className="mt-3 pt-3 border-t border-[#172540] flex items-start gap-2 text-xs">
                  <span className="font-semibold text-slate-400 flex-shrink-0">
                    Primary Culprit:
                  </span>
                  <span className="text-amber-300 font-mono text-[11px]">
                    {selectedIncident.rootCause}
                  </span>
                </div>
              )}
            </div>

            {/* Container Log Stream Snippet */}
            {selectedIncident.logsSnippet && (
              <div className="bg-[#050914] border border-[#142038] rounded-xl p-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#142038] text-[11px] text-slate-400 font-sans">
                  <span className="flex items-center gap-1.5 font-mono text-slate-300">
                    <Terminal size={13} className="text-sky-400" />
                    <span>Container Log Dump (tail -n 4)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">Exit 137</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300 leading-snug overflow-x-auto">
                  {selectedIncident.logsSnippet.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap">
                      <span className="text-slate-500 mr-2 select-none">
                        [{idx + 1}]
                      </span>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Action */}
            {selectedIncident.recommendedAction && (
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>Recommended Self-Healing Action</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {selectedIncident.recommendedAction}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-5 border-t border-[#172540] bg-[#0a1224] flex items-center justify-between gap-3">
            <button
              onClick={() => resolveIncident(selectedIncident.id)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
            >
              Mark Resolved
            </button>

            {selectedIncident.severity !== "resolved" && (
              <button
                onClick={() => triggerIncidentRemediation(selectedIncident.id)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl shadow-lg shadow-blue-900/30 transition cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Execute Auto-Remediation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

