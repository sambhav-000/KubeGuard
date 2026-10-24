"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Rocket, ArrowRight, Check, AlertTriangle } from "lucide-react";
import Link from "next/link";

export function RecentDeployments() {
  const { deployments } = useDashboard();

  return (
    <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#15243E]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[#A855F7]">
              <Rocket size={16} />
            </div>
            <h2 className="text-sm font-bold text-[#F1F5FF] tracking-tight">
              Recent Deployments
            </h2>
          </div>

          <Link
            href="/deployments"
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
                <th className="py-2.5 px-2">Application</th>
                <th className="py-2.5 px-2">Version</th>
                <th className="py-2.5 px-2">Namespace</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-2 text-right">Deployed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15243E]/70 font-mono">
              {deployments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500 font-mono text-xs">
                    No deployments found in cluster
                  </td>
                </tr>
              ) : (
                deployments.slice(0, 5).map((dep) => {
                  const isPartial = dep.status === "Rolling Out";
                  const isFailed = dep.status === "Failed";

                  return (
                    <tr
                      key={dep.id}
                      className="hover:bg-[#0E1E38]/50 transition group"
                    >
                      <td className="py-2.5 px-2 font-semibold text-[#F1F5FF] group-hover:text-[#00D9FF] transition truncate max-w-[110px]">
                        {dep.name}
                      </td>

                      <td className="py-2.5 px-2 text-slate-300">
                        {dep.version}
                      </td>

                      <td className="py-2.5 px-2 text-slate-400 text-[11px]">
                        {dep.namespace}
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        {isFailed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/60 text-[#FF426D] border border-rose-500/40">
                            <AlertTriangle size={10} />
                            <span>Failed</span>
                          </span>
                        ) : isPartial ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/60 text-[#FFB020] border border-amber-500/40">
                            <AlertTriangle size={10} />
                            <span>Partial</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-[#10F5A0] border border-emerald-500/40 shadow-[0_0_8px_rgba(16,245,160,0.2)]">
                            <Check size={10} strokeWidth={3} />
                            <span>Success</span>
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-2 text-right text-slate-400 text-[11px]">
                        {dep.deployedAt}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
