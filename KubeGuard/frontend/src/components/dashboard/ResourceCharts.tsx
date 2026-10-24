"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Cpu, HardDrive, Wifi, Activity, AlertTriangle, RefreshCw, Radio } from "lucide-react";

export function ResourceCharts() {
  const {
    timeRange,
    setTimeRange,
    metricsSummary,
    metricsRangeData,
    metricsLoading,
    metricsUnavailable,
    triggerRefresh,
    isRefreshing,
  } = useDashboard();

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [netHoverIdx, setNetHoverIdx] = useState<number | null>(null);

  const rawPoints = metricsRangeData?.points || [];
  const hasPoints = rawPoints.length > 0;

  // Chart dimensions
  const miniWidth = 320;
  const miniHeight = 110;

  // Ensure at least 2 points for smooth line rendering
  const effectivePoints =
    rawPoints.length === 1
      ? [rawPoints[0], rawPoints[0]]
      : rawPoints;

  // Latest snapshot metrics from live summary or range points
  const latestPoint = rawPoints.length > 0 ? rawPoints[rawPoints.length - 1] : null;

  const currentCpuPercent =
    metricsSummary?.cpu_usage_percent !== null && metricsSummary?.cpu_usage_percent !== undefined
      ? metricsSummary.cpu_usage_percent
      : latestPoint?.cpu ?? null;

  const currentCpuCores =
    metricsSummary?.cpu_usage_cores !== null && metricsSummary?.cpu_usage_cores !== undefined
      ? metricsSummary.cpu_usage_cores
      : latestPoint?.cpu_cores ?? null;

  const totalCpuCores = metricsSummary?.cpu_total_cores ?? 12;

  const currentMemPercent =
    metricsSummary?.memory_usage_percent !== null && metricsSummary?.memory_usage_percent !== undefined
      ? metricsSummary.memory_usage_percent
      : latestPoint?.memory ?? null;

  const currentMemBytes =
    metricsSummary?.memory_usage_bytes !== null && metricsSummary?.memory_usage_bytes !== undefined
      ? metricsSummary.memory_usage_bytes
      : latestPoint?.memory_bytes ?? null;

  const totalMemBytes = metricsSummary?.memory_total_bytes ?? 3960094720;

  const currentNetIn =
    metricsSummary?.network_in_mbps !== null && metricsSummary?.network_in_mbps !== undefined
      ? metricsSummary.network_in_mbps
      : latestPoint?.network_in ?? 0;

  const currentNetOut =
    metricsSummary?.network_out_mbps !== null && metricsSummary?.network_out_mbps !== undefined
      ? metricsSummary.network_out_mbps
      : latestPoint?.network_out ?? 0;

  // CPU Points (0..100)
  const cpuPoints = effectivePoints.map((d, i) => ({
    x: effectivePoints.length > 1 ? (i / (effectivePoints.length - 1)) * miniWidth : miniWidth / 2,
    y: miniHeight - (Math.min(100, Math.max(0, d.cpu)) / 100) * miniHeight,
    raw: d,
  }));
  const cpuPathD =
    cpuPoints.length > 0
      ? `M ${cpuPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`
      : "";
  const cpuAreaD = cpuPathD ? `${cpuPathD} L ${miniWidth},${miniHeight} L 0,${miniHeight} Z` : "";

  // Memory Points (0..100)
  const memPoints = effectivePoints.map((d, i) => ({
    x: effectivePoints.length > 1 ? (i / (effectivePoints.length - 1)) * miniWidth : miniWidth / 2,
    y: miniHeight - (Math.min(100, Math.max(0, d.memory)) / 100) * miniHeight,
    raw: d,
  }));
  const memPathD =
    memPoints.length > 0
      ? `M ${memPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`
      : "";
  const memAreaD = memPathD ? `${memPathD} L ${miniWidth},${miniHeight} L 0,${miniHeight} Z` : "";

  // Dynamic Network Traffic scaling
  const netWidth = 660;
  const netHeight = 90;
  const maxObservedNet = Math.max(
    0.05,
    ...effectivePoints.map((p) => Math.max(p.network_in, p.network_out))
  );
  // Scale ceiling: round up to nice number
  const maxNet = Math.max(0.1, Math.ceil(maxObservedNet * 1.5 * 10) / 10);

  const netInPoints = effectivePoints.map((d, i) => ({
    x: effectivePoints.length > 1 ? (i / (effectivePoints.length - 1)) * netWidth : netWidth / 2,
    y: netHeight - (Math.min(maxNet, Math.max(0, d.network_in)) / maxNet) * netHeight,
    raw: d,
  }));
  const netInPath =
    netInPoints.length > 0
      ? `M ${netInPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`
      : "";
  const netInArea = netInPath ? `${netInPath} L ${netWidth},${netHeight} L 0,${netHeight} Z` : "";

  const netOutPoints = effectivePoints.map((d, i) => ({
    x: effectivePoints.length > 1 ? (i / (effectivePoints.length - 1)) * netWidth : netWidth / 2,
    y: netHeight - (Math.min(maxNet, Math.max(0, d.network_out)) / maxNet) * netHeight,
    raw: d,
  }));
  const netOutPath =
    netOutPoints.length > 0
      ? `M ${netOutPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`
      : "";

  // X-axis time marks
  const timeLabels =
    effectivePoints.length >= 2
      ? [
          effectivePoints[0].time,
          effectivePoints[Math.floor(effectivePoints.length / 2)].time,
          effectivePoints[effectivePoints.length - 1].time,
        ]
      : ["Start", "Mid", "Now"];

  return (
    <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 shadow-sm space-y-6">
      {/* Top Header: Title + Telemetry Badge + Time Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#15243E] gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-[#F1F5FF] tracking-tight flex items-center gap-2">
            <span>Resource Utilization</span>
          </h2>

          {/* Prometheus Live Telemetry Status Pill */}
          {metricsUnavailable ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-[#FFB020] border border-amber-500/30">
              <AlertTriangle size={11} />
              <span>Prometheus Unavailable</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-[#10F5A0] border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10F5A0] animate-pulse" />
              <span>Prometheus cAdvisor • Live</span>
            </span>
          )}
        </div>

        {/* Time filters & manual sync */}
        <div className="flex items-center gap-2">
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

          <button
            onClick={triggerRefresh}
            disabled={isRefreshing}
            title="Refresh live metrics"
            className="p-1.5 rounded-xl bg-[#050D1C] border border-[#172A46] text-slate-400 hover:text-[#00D9FF] hover:border-[#00D9FF]/40 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#00D9FF]" : ""} />
          </button>
        </div>
      </div>

      {/* Prometheus Offline Notification Banner (if unreachable) */}
      {metricsUnavailable && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-[#FFB020] flex-shrink-0" />
            <span>
              Prometheus exporter is offline or unreachable on port 9090. Cluster telemetry is temporarily paused.
            </span>
          </div>
          <button
            onClick={triggerRefresh}
            className="text-[11px] underline hover:text-white transition font-semibold"
          >
            Retry Connection
          </button>
        </div>
      )}

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
                  {currentCpuPercent !== null ? `${currentCpuPercent.toFixed(1)}%` : " — "}
                </div>
                {currentCpuCores !== null && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentCpuCores < 0.001 ? "< 1m" : `${(currentCpuCores * 1000).toFixed(0)}m`} / {totalCpuCores} cores
                  </div>
                )}
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
              {hasPoints ? (
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
                  {cpuAreaD && <path d={cpuAreaD} fill="url(#cpuGradCyber)" />}
                  {cpuPathD && (
                    <path
                      d={cpuPathD}
                      fill="none"
                      stroke="#00D9FF"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="filter drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]"
                    />
                  )}

                  {/* Interactive hover points */}
                  {cpuPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoverIdx === idx ? 4.5 : 2}
                      fill={hoverIdx === idx ? "#F1F5FF" : "#00D9FF"}
                      stroke="#08152B"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoverIdx(idx)}
                      onMouseLeave={() => setHoverIdx(null)}
                    />
                  ))}
                </svg>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                  <span>No data points recorded yet</span>
                  <span className="text-[10px] text-slate-600 mt-0.5">Scraping live metrics...</span>
                </div>
              )}

              {/* Tooltip on Hover */}
              {hoverIdx !== null && cpuPoints[hoverIdx] && (
                <div
                  className="absolute bottom-full mb-2 bg-[#0A1A35] border border-[#00D9FF]/40 rounded-lg px-2.5 py-1 text-[11px] font-mono text-[#F1F5FF] shadow-lg pointer-events-none transform -translate-x-1/2 z-20 whitespace-nowrap"
                  style={{
                    left: `${(cpuPoints[hoverIdx].x / miniWidth) * 100}%`,
                  }}
                >
                  <div className="text-slate-400 text-[10px]">{cpuPoints[hoverIdx].raw.time}</div>
                  <div className="text-[#00D9FF] font-bold">
                    CPU: {cpuPoints[hoverIdx].raw.cpu.toFixed(2)}% ({cpuPoints[hoverIdx].raw.cpu_cores.toFixed(3)} cores)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* X Axis */}
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 pl-8">
            <span>{timeLabels[0]}</span>
            <span>{timeLabels[1]}</span>
            <span>{timeLabels[2]}</span>
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
                  {currentMemPercent !== null ? `${currentMemPercent.toFixed(1)}%` : " — "}
                </div>
                {currentMemBytes !== null && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    {(currentMemBytes / (1024 * 1024)).toFixed(0)} MiB / {(totalMemBytes / (1024 * 1024 * 1024)).toFixed(1)} GiB
                  </div>
                )}
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
              {hasPoints ? (
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
                  {memAreaD && <path d={memAreaD} fill="url(#memGradCyber)" />}
                  {memPathD && (
                    <path
                      d={memPathD}
                      fill="none"
                      stroke="#A855F7"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                    />
                  )}

                  {/* Interactive hover points */}
                  {memPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoverIdx === idx ? 4.5 : 2}
                      fill={hoverIdx === idx ? "#F1F5FF" : "#A855F7"}
                      stroke="#08152B"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoverIdx(idx)}
                      onMouseLeave={() => setHoverIdx(null)}
                    />
                  ))}
                </svg>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                  <span>No data points recorded yet</span>
                  <span className="text-[10px] text-slate-600 mt-0.5">Scraping live metrics...</span>
                </div>
              )}
            </div>
          </div>

          {/* X Axis */}
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 pl-8">
            <span>{timeLabels[0]}</span>
            <span>{timeLabels[1]}</span>
            <span>{timeLabels[2]}</span>
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
                  Inbound {currentNetIn.toFixed(4)} MB/s
                </span>
                <span className="text-[#A855F7] font-semibold">
                  Outbound {currentNetOut.toFixed(4)} MB/s
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
            <span>{maxNet.toFixed(2)} MB/s</span>
            <span>{(maxNet / 2).toFixed(2)} MB/s</span>
            <span>0</span>
          </div>

          <div className="relative flex-1 h-[90px]">
            {hasPoints ? (
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
                {netInArea && <path d={netInArea} fill="url(#netInCyber)" />}
                {netInPath && (
                  <path
                    d={netInPath}
                    fill="none"
                    stroke="#00D9FF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="filter drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]"
                  />
                )}

                {/* Outbound Path */}
                {netOutPath && (
                  <path
                    d={netOutPath}
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  />
                )}

                {/* Inbound Dots */}
                {netInPoints.map((p, idx) => (
                  <circle
                    key={`in-${idx}`}
                    cx={p.x}
                    cy={p.y}
                    r={netHoverIdx === idx ? 4.5 : 2}
                    fill={netHoverIdx === idx ? "#F1F5FF" : "#00D9FF"}
                    stroke="#08152B"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setNetHoverIdx(idx)}
                    onMouseLeave={() => setNetHoverIdx(null)}
                  />
                ))}
              </svg>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                <span>Collecting network bandwidth telemetry from Kubernetes pod interfaces...</span>
              </div>
            )}

            {/* Network Tooltip on Hover */}
            {netHoverIdx !== null && netInPoints[netHoverIdx] && (
              <div
                className="absolute bottom-full mb-2 bg-[#0A1A35] border border-[#00D9FF]/40 rounded-lg px-2.5 py-1 text-[11px] font-mono text-[#F1F5FF] shadow-lg pointer-events-none transform -translate-x-1/2 z-20 whitespace-nowrap"
                style={{
                  left: `${(netInPoints[netHoverIdx].x / netWidth) * 100}%`,
                }}
              >
                <div className="text-slate-400 text-[10px]">{netInPoints[netHoverIdx].raw.time}</div>
                <div className="text-[#00D9FF]">In: {netInPoints[netHoverIdx].raw.network_in.toFixed(4)} MB/s</div>
                <div className="text-[#A855F7]">Out: {netInPoints[netHoverIdx].raw.network_out.toFixed(4)} MB/s</div>
              </div>
            )}
          </div>
        </div>

        {/* X Axis */}
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 pl-14">
          <span>{timeLabels[0]}</span>
          <span>{timeLabels[1]}</span>
          <span>{timeLabels[2]}</span>
        </div>
      </div>
    </div>
  );
}
