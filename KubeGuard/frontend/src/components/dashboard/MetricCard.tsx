"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  badge?: string;
  badgeColor?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trendText?: string;
  trendDirection?: "up" | "down" | "neutral";
  sparklineData?: number[];
  sparklineColor?: string;
}

export function MetricCard({
  title,
  value,
  subValue,
  badge,
  badgeColor = "text-emerald-400 bg-emerald-950/40 border-emerald-800/40",
  icon: Icon,
  iconColor,
  iconBg,
  trendText,
  sparklineData,
  sparklineColor = "#38bdf8",
}: MetricCardProps) {
  // Render smooth SVG sparkline
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const width = 110;
    const height = 36;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData) || 1;
    const range = max - min || 1;

    const points = sparklineData.map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    });

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-28 h-9 overflow-visible"
        preserveAspectRatio="none"
      >
        <path
          d={`M ${points.join(" L ")}`}
          fill="none"
          stroke={sparklineColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
        />
      </svg>
    );
  };

  return (
    <div className="bg-[#0f172a] border border-[#263244] hover:border-slate-700/80 transition-all duration-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
      {/* Top Row: Icon + Title + Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${iconBg} border flex items-center justify-center ${iconColor} transition-transform group-hover:scale-105 duration-200`}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {title}
            </div>
            {badge && (
              <span
                className={`inline-block mt-0.5 text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border ${badgeColor}`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle & Bottom: Main Values + Sparkline */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
            {value}
            {subValue && (
              <span className="text-slate-500 text-sm font-normal">
                {subValue}
              </span>
            )}
          </div>
          {trendText && (
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
              {trendText}
            </div>
          )}
        </div>

        {/* Sparkline */}
        <div className="flex-shrink-0">{renderSparkline()}</div>
      </div>
    </div>
  );
}

