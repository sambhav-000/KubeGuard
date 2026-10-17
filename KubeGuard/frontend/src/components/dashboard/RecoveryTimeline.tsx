"use client";

import React from "react";
import { mockRecoveryTimeline } from "@/lib/mock-data";
import {
  Sparkles,
  Server,
  User,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export function RecoveryTimeline() {
  return (
    <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2b3f]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Self-Healing Activity Timeline
              </h2>
              <p className="text-xs text-slate-400">
                Orchestrated recoveries vs. native Kubernetes controller actions
              </p>
            </div>
          </div>

          <Link
            href="/self-healing"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition"
          >
            <span>Full History</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Timeline Entries */}
        <div className="relative mt-5 pl-6 border-l border-[#1f2b3f] space-y-6">
          {mockRecoveryTimeline.slice(0, 5).map((event) => {
            const isKubeGuard = event.actor === "KubeGuard Engine";
            return (
              <div key={event.id} className="relative group">
                {/* Node Bullet Icon */}
                <span
                  className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full border flex items-center justify-center ${
                    isKubeGuard
                      ? "bg-violet-950 border-violet-500 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                      : "bg-blue-950 border-blue-500 text-blue-300"
                  }`}
                >
                  {isKubeGuard ? (
                    <Sparkles size={11} />
                  ) : (
                    <Server size={11} />
                  )}
                </span>

                {/* Event Card Content */}
                <div className="bg-[#0a101d] border border-[#1a2846] rounded-xl p-3.5 hover:border-slate-700/80 transition">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {event.title}
                      </span>
                      {/* Actor Badge */}
                      <span
                        className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border tracking-wider uppercase ${
                          isKubeGuard
                            ? "bg-violet-950/60 border-violet-700/50 text-violet-300"
                            : "bg-sky-950/60 border-sky-700/50 text-sky-300"
                        }`}
                      >
                        {event.actor}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{event.timestamp}</span>
                      <span>•</span>
                      <span className="text-slate-500">{event.durationMs}ms</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {event.details}
                  </p>

                  <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-[#162235] text-[10px] font-mono text-slate-400">
                    <span className="text-slate-300">
                      Workload: {event.namespace}/{event.targetWorkload}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">
                      Action: {event.actionType}
                    </span>
                    <span className="ml-auto">
                      <span
                        className={`font-semibold ${
                          event.status === "Success"
                            ? "text-emerald-400"
                            : event.status === "In Progress"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {event.status}
                      </span>
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

