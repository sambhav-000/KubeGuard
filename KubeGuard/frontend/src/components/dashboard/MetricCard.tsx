"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  subDetail?: React.ReactNode;
  trendText: string;
  bottomText?: string;
  icon: LucideIcon;
  accent: "emerald" | "cyan" | "amber" | "violet";
  type: "ring-sparkline" | "cyan-bars" | "amber-line" | "violet-bars";
  progressPercent?: number;
}

export function MetricCard({
  title,
  value,
  subValue,
  subDetail,
  trendText,
  bottomText,
  icon: Icon,
  accent,
  type,
  progressPercent = 98,
}: MetricCardProps) {
  const accentStyles = {
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/50",
      glow: "hover:shadow-[0_0_25px_rgba(16,245,160,0.12)]",
      iconBg: "bg-emerald-500/10 border-emerald-500/30 text-[#10F5A0]",
      badge: "text-[#10F5A0]",
    },
    cyan: {
      border: "border-cyan-500/20 hover:border-cyan-500/50",
      glow: "hover:shadow-[0_0_25px_rgba(0,217,255,0.12)]",
      iconBg: "bg-cyan-500/10 border-cyan-500/30 text-[#00D9FF]",
      badge: "text-[#00D9FF]",
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/50",
      glow: "hover:shadow-[0_0_25px_rgba(255,176,32,0.12)]",
      iconBg: "bg-amber-500/10 border-amber-500/30 text-[#FFB020]",
      badge: "text-[#FFB020]",
    },
    violet: {
      border: "border-violet-500/20 hover:border-violet-500/50",
      glow: "hover:shadow-[0_0_25px_rgba(124,58,237,0.15)]",
      iconBg: "bg-violet-500/10 border-violet-500/30 text-[#A855F7]",
      badge: "text-[#A855F7]",
    },
  }[accent];

  return (
    <div
      className={`bg-[#08152B] border ${accentStyles.border} ${accentStyles.glow} transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${accentStyles.iconBg} border flex items-center justify-center transition-transform group-hover:scale-105 duration-200`}
            >
              <Icon size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400">
                {title}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F1F5FF] tracking-tight mt-0.5 flex items-baseline gap-1.5">
                {value}
                {subValue && (
                  <span className="text-slate-500 text-base font-normal">
                    {subValue}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Visual for Top: Circular Ring for Health or Blank */}
          {type === "ring-sparkline" && (
            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="#15243E"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="#10F5A0"
                  strokeWidth="3.5"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="filter drop-shadow-[0_0_4px_#10F5A0]"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Sub Details row */}
        {subDetail && (
          <div className="mt-2 text-xs font-mono font-medium">
            {subDetail}
          </div>
        )}
      </div>

      {/* Bottom Section: Trend info and Mini Chart */}
      <div className="mt-4 pt-3 border-t border-[#15243E]/60 flex items-end justify-between">
        <div>
          <div className="text-xs font-semibold text-[#10F5A0] flex items-center gap-1 font-mono">
            {trendText}
          </div>
          {bottomText && (
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              {bottomText}
            </div>
          )}
        </div>

        {/* Right Mini Visual */}
        <div className="flex-shrink-0">
          {type === "ring-sparkline" && (
            <svg viewBox="0 0 80 24" className="w-20 h-6 overflow-visible">
              <path
                d="M2 18 L15 14 L30 17 L45 9 L60 12 L78 4"
                fill="none"
                stroke="#10F5A0"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_6px_rgba(16,245,160,0.5)]"
              />
            </svg>
          )}

          {type === "cyan-bars" && (
            <div className="flex items-end gap-1.5 h-7">
              {[35, 45, 30, 60, 75, 90].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-cyan-600 to-[#00D9FF] rounded-t shadow-[0_0_6px_rgba(0,217,255,0.4)]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          )}

          {type === "amber-line" && (
            <svg viewBox="0 0 80 24" className="w-20 h-6 overflow-visible">
              <path
                d="M2 18 L20 16 L38 20 L55 8 L78 12"
                fill="none"
                stroke="#FFB020"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_6px_rgba(255,176,32,0.5)]"
              />
              <circle cx="2" cy="18" r="2" fill="#FFB020" />
              <circle cx="20" cy="16" r="2" fill="#FFB020" />
              <circle cx="38" cy="20" r="2" fill="#FFB020" />
              <circle cx="55" cy="8" r="2.5" fill="#FFB020" />
              <circle cx="78" cy="12" r="2" fill="#FFB020" />
            </svg>
          )}

          {type === "violet-bars" && (
            <div className="flex items-end gap-1.5 h-7">
              {[25, 40, 50, 70, 85, 100].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-violet-700 to-[#A855F7] rounded-t shadow-[0_0_6px_rgba(168,85,247,0.4)]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
