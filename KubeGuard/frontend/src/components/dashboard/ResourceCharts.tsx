"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { mockMetricsData } from "@/lib/mock-data";
import { Activity, Cpu, HardDrive, Wifi, Layers } from "lucide-react";

export function ResourceCharts() {
  const { timeRange, setTimeRange } = useDashboard();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"compute" | "network">("compute");

  const rawData = mockMetricsData[timeRange] || mockMetricsData["6h"];

  // Dimensions
  const width = 640;
  const height = 180;

  // Compute charts
  const pointsCpu = rawData.map((d, i) => ({
    x: (i / (rawData.length - 1)) * width,
    y: height - (d.cpu / 100) * height,
  }));

  const pointsMem = rawData.map((d, i) => ({
    x: (i / (rawData.length - 1)) * width,
    y: height - (d.memory / 100) * height,
  }));

  // Network charts (scale to max ~400 KB/s)
  const maxNet = 400;
  const pointsNetIn = rawData.map((d, i) => ({
    x: (i / (rawData.length - 1)) * width,
    y: height - (d.networkIn / maxNet) * height,
  }));

  const pointsNetOut = rawData.map((d, i) => ({
    x: (i / (rawData.length - 1)) * width,
    y: height - (d.networkOut / maxNet) * height,
  }));

  const pathCpu = `M ${pointsCpu.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const areaCpu = `${pathCpu} L ${width},${height} L 0,${height} Z`;

  const pathMem = `M ${pointsMem.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const areaMem = `${pathMem} L ${width},${height} L 0,${height} Z`;

  const pathNetIn = `M ${pointsNetIn.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const areaNetIn = `${pathNetIn} L ${width},${height} L 0,${height} Z`;

  const pathNetOut = `M ${pointsNetOut.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  // Threshold 80% line
  const thresholdY = height - 0.8 * height;

  const latest = rawData[rawData.length - 1];

  return (
    <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-6 shadow-sm">
      {/* Header with Title + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f2b3f]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Cluster Resource Utilization
            </h2>
            <p className="text-xs text-slate-400">
              Real-time resource trends & threshold monitoring
            </p>
          </div>
        </div>

        {/* View Switcher & Time Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tab: Compute vs Network */}
          <div className="flex bg-[#0a101d] border border-[#1a2846] rounded-xl p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab("compute")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                activeTab === "compute"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu size={13} />
              <span>CPU & Memory</span>
            </button>
            <button
              onClick={() => setActiveTab("network")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                activeTab === "network"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Wifi size={13} />
              <span>Network I/O</span>
            </button>
          </div>

          {/* Time Filter Pills */}
          <div className="flex bg-[#0a101d] border border-[#1a2846] rounded-xl p-0.5 text-xs font-medium">
            {(["1h", "6h", "24h", "7d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs transition ${
                  timeRange === r
                    ? "bg-[#1d4ed8] text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Current Values */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 text-xs">
        <div className="flex items-center gap-4">
          {activeTab === "compute" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                <span className="text-slate-400">CPU Usage:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {latest.cpu}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                <span className="text-slate-400">Memory:</span>
                <span className="font-mono font-bold text-purple-300">
                  {latest.memory}%
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                <span className="w-3 border-b border-rose-500/80 border-dashed" />
                <span>80% Warning Limit</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                <span className="text-slate-400">Inbound Traffic:</span>
                <span className="font-mono font-bold text-sky-300">
                  {latest.networkIn} KB/s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="text-slate-400">Outbound Traffic:</span>
                <span className="font-mono font-bold text-amber-300">
                  {latest.networkOut} KB/s
                </span>
              </div>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Hover along chart to inspect time slices
        </div>
      </div>

      {/* Main SVG Chart with Hover Overlay */}
      <div className="relative mt-4">
        <div className="flex">
          {/* Y Axis */}
          <div className="flex flex-col justify-between text-[10px] text-slate-500 font-mono pr-2.5 select-none h-[180px]">
            {activeTab === "compute" ? (
              <>
                <span>100%</span>
                <span>80%</span>
                <span>50%</span>
                <span>20%</span>
                <span>0%</span>
              </>
            ) : (
              <>
                <span>400k</span>
                <span>300k</span>
                <span>200k</span>
                <span>100k</span>
                <span>0k</span>
              </>
            )}
          </div>

          {/* Chart SVG */}
          <div
            className="relative flex-1 h-[180px]"
            onMouseLeave={() => setHoverIdx(null)}
          >
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="netInGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1={height * pct}
                  x2={width}
                  y2={height * pct}
                  stroke="#1c283f"
                  strokeWidth="1"
                />
              ))}

              {/* 80% Threshold reference line */}
              {activeTab === "compute" && (
                <line
                  x1="0"
                  y1={thresholdY}
                  x2={width}
                  y2={thresholdY}
                  stroke="#f43f5e"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
              )}

              {/* Render curves depending on activeTab */}
              {activeTab === "compute" ? (
                <>
                  <path d={areaCpu} fill="url(#cpuGrad)" />
                  <path
                    d={pathCpu}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path d={areaMem} fill="url(#memGrad)" />
                  <path
                    d={pathMem}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <path d={areaNetIn} fill="url(#netInGrad)" />
                  <path
                    d={pathNetIn}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={pathNetOut}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Hover Guides */}
              {hoverIdx !== null && (
                <>
                  <line
                    x1={pointsCpu[hoverIdx].x}
                    y1="0"
                    x2={pointsCpu[hoverIdx].x}
                    y2={height}
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.7"
                  />
                  {activeTab === "compute" ? (
                    <>
                      <circle
                        cx={pointsCpu[hoverIdx].x}
                        cy={pointsCpu[hoverIdx].y}
                        r="4"
                        fill="#06b6d4"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <circle
                        cx={pointsMem[hoverIdx].x}
                        cy={pointsMem[hoverIdx].y}
                        r="4"
                        fill="#a855f7"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </>
                  ) : (
                    <>
                      <circle
                        cx={pointsNetIn[hoverIdx].x}
                        cy={pointsNetIn[hoverIdx].y}
                        r="4"
                        fill="#38bdf8"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <circle
                        cx={pointsNetOut[hoverIdx].x}
                        cy={pointsNetOut[hoverIdx].y}
                        r="4"
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </>
              )}
            </svg>

            {/* Hover Column Triggers */}
            <div className="absolute inset-0 flex">
              {rawData.map((d, idx) => (
                <div
                  key={idx}
                  className="flex-1 cursor-crosshair"
                  onMouseEnter={() => setHoverIdx(idx)}
                />
              ))}
            </div>

            {/* Floating Tooltip */}
            {hoverIdx !== null && (
              <div
                className="absolute pointer-events-none -top-12 z-20 bg-[#0d162a]/95 border border-[#1e2f4f] rounded-xl px-3 py-1.5 shadow-2xl text-[11px] transform -translate-x-1/2 flex items-center gap-3 backdrop-blur-md"
                style={{
                  left: `${(hoverIdx / (rawData.length - 1)) * 100}%`,
                }}
              >
                <span className="font-semibold text-white">
                  {rawData[hoverIdx].timeLabel}
                </span>
                {activeTab === "compute" ? (
                  <>
                    <span className="text-cyan-400 font-mono">
                      CPU: {rawData[hoverIdx].cpu}%
                    </span>
                    <span className="text-purple-400 font-mono">
                      Mem: {rawData[hoverIdx].memory}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sky-400 font-mono">
                      In: {rawData[hoverIdx].networkIn} KB/s
                    </span>
                    <span className="text-amber-400 font-mono">
                      Out: {rawData[hoverIdx].networkOut} KB/s
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* X Axis Time Labels */}
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pl-7 pr-2">
          {rawData.map((d, idx) => (
            <span key={idx}>{d.timeLabel}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

