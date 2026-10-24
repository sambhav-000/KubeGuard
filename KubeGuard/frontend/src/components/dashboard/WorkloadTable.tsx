"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

export function WorkloadTable() {
  const { workloads } = useDashboard();

  return (
    <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#15243E]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[#2563EB]">
              <Layers size={16} />
            </div>
            <h2 className="text-sm font-bold text-[#F1F5FF] tracking-tight">
              Workload Health
            </h2>
          </div>

          <Link
            href="/workloads"
            className="text-xs text-[#00D9FF] hover:underline font-medium flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#15243E] text-[10px] uppercase font-semibold text-slate-400 font-mono tracking-wider">
                <th className="py-2.5 px-2">Name</th>
                <th className="py-2.5 px-2">Namespace</th>
                <th className="py-2.5 px-2 text-center">Ready</th>
                <th className="py-2.5 px-2 text-center">CPU</th>
                <th className="py-2.5 px-2 text-center">Memory</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-2 text-right">Restarts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15243E]/70 font-mono">
              {workloads.slice(0, 5).map((w) => (
                <tr
                  key={w.id}
                  className="hover:bg-[#0E1E38]/50 transition group"
                >
                  <td className="py-2.5 px-2 font-semibold text-[#F1F5FF] group-hover:text-[#00D9FF] transition truncate max-w-[110px]">
                    {w.name}
                  </td>
                  <td className="py-2.5 px-2 text-slate-400 text-[11px]">
                    {w.namespace}
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-300 font-semibold">
                    <span className={w.readyReplicas < w.desiredReplicas ? "text-[#FFB020]" : "text-[#10F5A0]"}>
                      {w.readyReplicas}
                    </span>
                    /{w.desiredReplicas}
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-300">
                    {w.cpuUsage}
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-300">
                    {w.memUsage}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <StatusBadge status={w.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-400 font-semibold">
                    <span className={w.restarts > 0 ? "text-[#FFB020]" : ""}>
                      {w.restarts}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
