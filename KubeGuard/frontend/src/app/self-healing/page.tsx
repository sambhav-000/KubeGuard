"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { mockRecoveryTimeline } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Sparkles,
  Server,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Zap,
  Sliders,
} from "lucide-react";

export default function SelfHealingPage() {
  const { showToast } = useDashboard();
  const [autoRemediationMode, setAutoRemediationMode] = useState<boolean>(true);

  const toggleMode = () => {
    const next = !autoRemediationMode;
    setAutoRemediationMode(next);
    showToast(
      next ? "Autonomous Healing Mode Enabled" : "Semi-Autonomous Mode (Approval Required)",
      next
        ? "KubeGuard will execute validated self-healing recipes automatically"
        : "Remediations will prompt for manual engineer confirmation before executing",
      next ? "success" : "warning"
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c283f]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="text-violet-400" size={26} />
            <span>Self-Healing Orchestration Activity</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous failure resolution history, retry tracking & Kubernetes reconciliation audit
          </p>
        </div>

        {/* Autonomous Mode Toggle */}
        <div className="flex items-center gap-3 bg-[#0c1426] border border-[#1a2846] rounded-2xl p-2 px-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">
              Autonomous Remediation
            </span>
            <span className="text-[10px] text-slate-400">
              {autoRemediationMode ? "Self-healing active" : "Approval required"}
            </span>
          </div>

          <button
            onClick={toggleMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              autoRemediationMode ? "bg-violet-600" : "bg-slate-700"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                autoRemediationMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Actions Today
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">18</div>
          <div className="text-xs text-slate-400 mt-1">Across 6 namespaces</div>
        </div>

        <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recovery Success Rate
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            94.4%
          </div>
          <div className="text-xs text-slate-400 mt-1">17 resolved / 1 in-flight</div>
        </div>

        <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Mean Time To Recovery
          </div>
          <div className="text-3xl font-extrabold text-sky-400 font-mono mt-1">
            2m 14s
          </div>
          <div className="text-xs text-slate-400 mt-1">-38s faster than SLA</div>
        </div>

        <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Orchestrator Status
          </div>
          <div className="text-3xl font-extrabold text-violet-400 mt-1 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-violet-400 animate-pulse" />
            <span>Active</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Listening to Informers</div>
        </div>
      </div>

      {/* Full Recovery Event Feed */}
      <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-white tracking-tight uppercase mb-4 text-slate-300">
          Execution Log & Decision Trace
        </h2>

        <div className="relative pl-6 border-l border-[#1f2b3f] space-y-6">
          {mockRecoveryTimeline.map((item) => {
            const isKG = item.actor === "KubeGuard Engine";
            return (
              <div key={item.id} className="relative group">
                <span
                  className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full border flex items-center justify-center ${
                    isKG
                      ? "bg-violet-950 border-violet-500 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                      : "bg-blue-950 border-blue-500 text-blue-300"
                  }`}
                >
                  {isKG ? <Sparkles size={11} /> : <Server size={11} />}
                </span>

                <div className="bg-[#0a101d] border border-[#1a2846] rounded-xl p-4 hover:border-slate-700 transition">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-white font-mono">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                          isKG
                            ? "bg-violet-950/60 border-violet-700/50 text-violet-300"
                            : "bg-sky-950/60 border-sky-700/50 text-sky-300"
                        }`}
                      >
                        {item.actor}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>{item.timestamp}</span>
                      <span>Execution: {item.durationMs}ms</span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {item.details}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-[#162235] text-[11px] font-mono text-slate-400">
                    <span className="text-slate-300">
                      Target: {item.namespace}/{item.targetWorkload}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">
                      Type: {item.actionType}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

