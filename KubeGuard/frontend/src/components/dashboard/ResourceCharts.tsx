"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { mockMetricsData } from "@/lib/mock-data";
import { Cpu, HardDrive, Wifi, Activity } from "lucide-react";

export function ResourceCharts() {
  const { timeRange, setTimeRange } = useDashboard();
  const [cpuHoverIdx, setCpuHoverIdx] = useState<number | null>(null);
  const [netHoverIdx, setNetHoverIdx] = useState<number | null>(null);

  const rawData = mockMetricsData[timeRange] || mockMetricsData["6h"];

  // Chart dimensions
  const miniWidth = 320;
  const miniHeight = 110;

  // CPU Points (0..100)
  const cpuPoints = rawData.map((d, i) => ({
    x: (i / (rawData.length - 1)) * miniWidth,
    y: miniHeight - (d.cpu / 100) * miniHeight,
  }));
  const cpuPathD = `M ${cpuPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const cpuAreaD = `${cpuPathD} L ${miniWidth},${miniHeight} L 0,${miniHeight} Z`;

  // Memory Points (0..100)
  const memPoints = rawData.map((d, i) => ({
    x: (i / (rawData.length - 1)) * miniWidth,
    y: miniHeight - (d.memory / 100) * miniHeight,
  }));
  const memPathD = `M ${memPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const memAreaD = `${memPathD} L ${miniWidth},${miniHeight} L 0,${miniHeight} Z`;

  // Network Traffic Dimensions
  const netWidth = 660;
  const netHeight = 90;
  const maxNet = 20; // 20 MB/s

  const netInPoints = rawData.map((d, i) => ({
    x: (i / (rawData.length - 1)) * netWidth,
    y: netHeight - (d.networkIn / maxNet) * netHeight,
  }));
  const netInPath = `M ${netInPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const netInArea = `${netInPath} L ${netWidth},${netHeight} L 0,${netHeight} Z`;

  const netOutPoints = rawData.map((d, i) => ({
    x: (i / (rawData.length - 1)) * netWidth,
    y: netHeight - (d.networkOut / maxNet) * netHeight,
  }));
  const netOutPath = `M ${netOutPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  // Latest snapshot metrics
  const latest = rawData[rawData.length - 1] || {
    cpu: 42,
    memory: 58,
    networkIn: 12.4,
    networkOut: 8.7,
  };

  return (
    <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 shadow-sm space-y-6">
      {/* Top Header: Title + Time Range Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-[#15243E]">
        <h2 className="text-base font-bold text-[#F1F5FF] tracking-tight">
          Resource Utilization
        </h2>

        {/* Time filters */}
        <div className="flex items-center bg-[#050D1C] border border-[#172A46] rounded-xl p-1 text-xs font-mono">
          {(["1h", "6h", "24h", "7d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === r
                  ? "bg-[#2563EB] text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Two Side-by-Side Area Charts: CPU Usage & Memory Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage Card */}
        <div className="bg-[#050D1C] border border-[#172A46] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00D9FF]">
                <Cpu size={17} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">CPU Usage</div>
                <div className="text-2xl font-extrabold text-[#F1F5FF] tracking-tight font-mono">
                  {latest.cpu}%
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#FFB020] flex items-center gap-1.5 font-semibold">
              <span>Warning 70%</span>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="mt-3 flex">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between text-[10px] text-slate-500 font-mono pr-2 h-[110px] select-none">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            <div className="relative flex-1 h-[110px]">
              <svg
                viewBox={`0 0 ${miniWidth} ${miniHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="cpuGradCyber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={miniHeight * pct}
                    x2={miniWidth}
                    y2={miniHeight * pct}
                    stroke="#15243E"
                    strokeWidth="1"
                  />
                ))}

                {/* Warning 70% Dashed Line */}
                <line
                  x1="0"
                  y1={miniHeight * (1 - 0.7)}
                  x2={miniWidth}
                  y2={miniHeight * (1 - 0.7)}
                  stroke="#FFB020"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.85"
                />

                {/* CPU Area & Stroke */}
                <path d={cpuAreaD} fill="url(#cpuGradCyber)" />
                <path
                  d={cpuPathD}
                  fill="none"
                  stroke="#00D9FF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]"
                />
              </svg>
            </div>
          </div>

          {/* X Axis */}
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 pl-8">
            <span>08:00</span>
            <span>10:00</span>
            <span>12:00</span>
            <span>14:00</span>
          </div>
        </div>

        {/* Memory Usage Card */}
        <div className="bg-[#050D1C] border border-[#172A46] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-[#A855F7]">
                <HardDrive size={17} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Memory Usage</div>
                <div className="text-2xl font-extrabold text-[#F1F5FF] tracking-tight font-mono">
                  {latest.memory}%
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#FFB020] flex items-center gap-1.5 font-semibold">
              <span>Warning 80%</span>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="mt-3 flex">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between text-[10px] text-slate-500 font-mono pr-2 h-[110px] select-none">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            <div className="relative flex-1 h-[110px]">
              <svg
                viewBox={`0 0 ${miniWidth} ${miniHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="memGradCyber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={miniHeight * pct}
                    x2={miniWidth}
                    y2={miniHeight * pct}
                    stroke="#15243E"
                    strokeWidth="1"
                  />
                ))}

                {/* Warning 80% Dashed Line */}
                <line
                  x1="0"
                  y1={miniHeight * (1 - 0.8)}
                  x2={miniWidth}
                  y2={miniHeight * (1 - 0.8)}
                  stroke="#FFB020"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.85"
                />

                {/* Memory Area & Stroke */}
                <path d={memAreaD} fill="url(#memGradCyber)" />
                <path
                  d={memPathD}
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                />
              </svg>
            </div>
          </div>

          {/* X Axis */}
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 pl-8">
            <span>08:00</span>
            <span>10:00</span>
            <span>12:00</span>
            <span>14:00</span>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Section: Network Traffic */}
      <div className="bg-[#050D1C] border border-[#172A46] rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#15243E]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[#2563EB]">
              <Wifi size={17} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Network Traffic</div>
              <div className="flex items-center gap-3 text-xs font-mono mt-0.5">
                <span className="text-[#00D9FF] font-semibold">
                  Inbound 12.4 MB/s <span className="text-[#10F5A0]">↑ 8%</span>
                </span>
                <span className="text-[#A855F7] font-semibold">
                  Outbound 8.7 MB/s <span className="text-[#10F5A0]">↑ 3%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00D9FF]" />
              <span className="text-slate-400">Inbound</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
              <span className="text-slate-400">Outbound</span>
            </div>
          </div>
        </div>

        {/* Dual Line Chart */}
        <div className="mt-4 flex">
          {/* Y Axis */}
          <div className="flex flex-col justify-between text-[10px] text-slate-500 font-mono pr-2 h-[90px] select-none">
            <span>20 MB/s</span>
            <span>10 MB/s</span>
            <span>0</span>
          </div>

          <div className="relative flex-1 h-[90px]">
            <svg
              viewBox={`0 0 ${netWidth} ${netHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="netInCyber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.5, 1].map((pct, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1={netHeight * pct}
                  x2={netWidth}
                  y2={netHeight * pct}
                  stroke="#15243E"
                  strokeWidth="1"
                />
              ))}

              {/* Inbound Area & Path */}
              <path d={netInArea} fill="url(#netInCyber)" />
              <path
                d={netInPath}
                fill="none"
                stroke="#00D9FF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]"
              />

              {/* Outbound Path */}
              <path
                d={netOutPath}
                fill="none"
                stroke="#A855F7"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
              />
            </svg>
          </div>
        </div>

        {/* X Axis */}
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 pl-14">
          <span>08:00</span>
          <span>09:00</span>
          <span>10:00</span>
          <span>11:00</span>
          <span>12:00</span>
          <span>13:00</span>
          <span>14:00</span>
        </div>
      </div>
    </div>
  );
}
