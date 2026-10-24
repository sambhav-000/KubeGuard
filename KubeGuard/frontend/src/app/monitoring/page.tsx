"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { ResourceCharts } from "@/components/dashboard/ResourceCharts";
import { mockMetricsData } from "@/lib/mock-data";
import {
  Activity,
  Download,
  Calendar,
  Layers,
  Cpu,
  HardDrive,
  Wifi,
  Sparkles,
} from "lucide-react";

export default function MonitoringPage() {
  const { timeRange, setTimeRange, showToast } = useDashboard();
  const [selectedMetric, setSelectedMetric] = useState<string>("all");

  const rawData = mockMetricsData[timeRange] || mockMetricsData["6h"];

  const handleExport = () => {
    showToast("Metrics Export Generated", `Exported ${rawData.length} data points to CSV`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#15243E]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F1F5FF] tracking-tight flex items-center gap-3">
            <Activity className="text-[#00D9FF]" size={26} />
            <span>Infrastructure & Workload Monitoring</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive metrics across compute, memory, network bandwidth and latency
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#050D1C] hover:bg-[#15243E] border border-[#172A46] transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Compute & Network Charts */}
      <ResourceCharts />

      {/* Application Performance & Ingress Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Rate & Error Rate */}
        <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#15243E] mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#F1F5FF] tracking-tight">
                HTTP Request & Ingress Error Rate
              </h3>
              <p className="text-xs text-slate-400">
                Incoming traffic vs 5xx errors per second
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-full">
              Spike at 12:15
            </span>
          </div>

          {/* Bar Chart Simulation */}
          <div className="space-y-3">
            {rawData.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{d.timeLabel}</span>
                  <span className="text-slate-300">
                    <span className="text-[#00D9FF]">{d.requestRate} req/s</span>
                    {d.errorRate > 5 && (
                      <span className="text-[#FF426D] ml-2 font-bold">
                        ({d.errorRate} errors)
                      </span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-[#050D1C] border border-[#172A46]/60 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#00D9FF] h-full rounded-l-full"
                    style={{ width: `${(d.requestRate / 350) * 85}%` }}
                  />
                  {d.errorRate > 0 && (
                    <div
                      className="bg-[#FF426D] h-full rounded-r-full"
                      style={{ width: `${(d.errorRate / 200) * 20}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latency (p95 & p99) */}
        <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#15243E] mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#F1F5FF] tracking-tight">
                  p95 Response Latency
                </h3>
                <p className="text-xs text-slate-400">
                  End-to-end API gateway and ingress latency in milliseconds
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-violet-400">
                SLA: &lt;150ms
              </span>
            </div>

            <div className="space-y-3">
              {rawData.map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>{d.timeLabel}</span>
                    <span
                      className={`font-bold ${
                        d.latencyP95 > 120 ? "text-[#FF426D]" : "text-violet-400"
                      }`}
                    >
                      {d.latencyP95}ms
                    </span>
                  </div>
                  <div className="w-full bg-[#050D1C] border border-[#172A46]/60 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        d.latencyP95 > 120 ? "bg-[#FF426D]" : "bg-[#7C3AED]"
                      }`}
                      style={{ width: `${(d.latencyP95 / 200) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
