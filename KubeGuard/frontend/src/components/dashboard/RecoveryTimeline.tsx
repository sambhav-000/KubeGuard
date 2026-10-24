"use client";

import React from "react";
import { mockRecoveryTimeline } from "@/lib/mock-data";
import {
  FileText,
  TriangleAlert,
  Search,
  RotateCcw,
  CheckCircle2,
  Bell,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export function RecoveryTimeline() {
  const getEventIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return (
          <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 text-[#FF426D] flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(255,66,109,0.4)]">
            <TriangleAlert size={12} />
          </div>
        );
      case 1:
        return (
          <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 text-[#00D9FF] flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(0,217,255,0.4)]">
            <Search size={12} />
          </div>
        );
      case 2:
        return (
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[#00D9FF] flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(0,217,255,0.4)]">
            <RotateCcw size={12} />
          </div>
        );
      case 3:
        return (
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#10F5A0] flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(16,245,160,0.4)]">
            <CheckCircle2 size={12} />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 text-[#A855F7] flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.4)]">
            <Bell size={12} />
          </div>
        );
    }
  };

  return (
    <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#15243E]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00D9FF]">
              <FileText size={16} />
            </div>
            <h2 className="text-sm font-bold text-[#F1F5FF] tracking-tight">
              Self-Healing Activity
            </h2>
          </div>

          <Link
            href="/self-healing"
            className="text-xs text-[#00D9FF] hover:underline font-medium flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Vertical Connected Timeline */}
        <div className="relative mt-3 pl-3 space-y-3.5">
          {/* Vertical connecting line */}
          <div className="absolute left-[23px] top-3 bottom-3 w-0.5 bg-[#172A46]" />

          {mockRecoveryTimeline.slice(0, 5).map((evt, idx) => (
            <div key={evt.id} className="relative flex items-start gap-3 text-xs">
              {/* Event Icon */}
              {getEventIcon(idx)}

              {/* Event Content */}
              <div className="flex-1 min-w-0 -mt-0.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="font-bold text-[#F1F5FF] truncate">
                    {evt.title}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 flex-shrink-0">
                    {evt.timestamp}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                  {evt.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
