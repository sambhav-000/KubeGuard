"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  History,
  Rocket,
  GitCommit,
  User,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function DeploymentHistoryPage() {
  const { deployments, rollbackDeployment } = useDashboard();
  const [search, setSearch] = useState("");

  const filtered = deployments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.version.toLowerCase().includes(search.toLowerCase()) ||
    d.commitHash.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c283f]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <History className="text-sky-400" size={26} />
            <span>Deployment History & Rollbacks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit release tags, rollout health, git commits & execute automated rollbacks
          </p>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search revision or commit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a101d] border border-[#1a2846] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
          />
        </div>
      </div>

      {/* Deployments Full Table */}
      <div className="bg-[#0f172a] border border-[#263244] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1c283f] text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              <th className="py-3 px-3">Application</th>
              <th className="py-3 px-3">Revision</th>
              <th className="py-3 px-3">Git Commit</th>
              <th className="py-3 px-3">Author</th>
              <th className="py-3 px-3">Deployed At</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#172238]">
            {filtered.map((dep) => (
              <tr key={dep.id} className="hover:bg-[#121c33]/60 transition group">
                <td className="py-3.5 px-3">
                  <div className="font-semibold text-white group-hover:text-sky-300 transition">
                    {dep.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Namespace: {dep.namespace}
                  </div>
                </td>

                <td className="py-3.5 px-3 font-mono font-semibold text-slate-200">
                  {dep.version}
                </td>

                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                    <GitCommit size={13} className="text-sky-400" />
                    <span>{dep.commitHash}</span>
                  </div>
                </td>

                <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                  {dep.author}
                </td>

                <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                  {dep.deployedAt}
                </td>

                <td className="py-3.5 px-3 text-center">
                  <StatusBadge status={dep.status} size="sm" />
                </td>

                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={() => rollbackDeployment(dep.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
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
  );
}

