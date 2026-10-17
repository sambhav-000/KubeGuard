"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Rocket, RotateCcw, ArrowRight, GitCommit, User } from "lucide-react";
import Link from "next/link";

export function RecentDeployments() {
  const { deployments, rollbackDeployment } = useDashboard();

  return (
    <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2b3f]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Rocket size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Recent Deployments & Rollouts
              </h2>
              <p className="text-xs text-slate-400">
                Latest revisions with one-click rollback guardrails
              </p>
            </div>
          </div>

          <Link
            href="/deployments"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition"
          >
            <span>History</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Deployments Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1c283f] text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">Application</th>
                <th className="py-2.5 px-3">Revision</th>
                <th className="py-2.5 px-3">Initiated By</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172238]">
              {deployments.slice(0, 4).map((dep) => (
                <tr
                  key={dep.id}
                  className="hover:bg-[#121c33]/60 transition group"
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200 group-hover:text-sky-300 transition">
                      {dep.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {dep.namespace} • {dep.deployedAt}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-mono text-xs text-slate-300 font-semibold">
                      {dep.version}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                      <GitCommit size={11} />
                      <span>{dep.commitHash}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[120px]">
                    {dep.author}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <StatusBadge status={dep.status} size="sm" />
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => rollbackDeployment(dep.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition"
                      title="Rollback to previous stable revision"
                    >
                      <RotateCcw size={12} />
                      <span>Rollback</span>
                    </button>
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

