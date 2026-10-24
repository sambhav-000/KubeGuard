"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { mockAuditLogs } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  User,
  Sparkles,
  Server,
  Calendar,
} from "lucide-react";

export default function AuditLogsPage() {
  const { showToast } = useDashboard();
  const [search, setSearch] = useState("");
  const [actorFilter, setActorFilter] = useState("all");

  const filtered = mockAuditLogs.filter((log) => {
    const matchActor = actorFilter === "all" || log.actorType === actorFilter;
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase());
    return matchActor && matchSearch;
  });

  const handleExport = () => {
    showToast("Audit Trail Exported", "Generated encrypted compliance audit log CSV", "success");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#15243E]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F1F5FF] tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-[#10F5A0]" size={26} />
            <span>Compliance & Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident logs of manual interventions and autonomous self-healing orchestrations
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#050D1C] hover:bg-[#15243E] border border-[#172A46] transition"
        >
          <Download size={14} />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#08152B] border border-[#172A46] rounded-2xl p-4 shadow-sm">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00D9FF]/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#00D9FF]/60 cursor-pointer"
          >
            <option value="all">All Actors</option>
            <option value="User">Human Engineers</option>
            <option value="KubeGuard Engine">KubeGuard Engine</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#15243E] text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3">Actor</th>
              <th className="py-3 px-3">Action</th>
              <th className="py-3 px-3">Resource Target</th>
              <th className="py-3 px-3">Outcome</th>
              <th className="py-3 px-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#15243E]/60">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-[#050D1C]/80 transition">
                <td className="py-3.5 px-3 font-mono text-slate-400">
                  {log.timestamp}
                </td>

                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    {log.actorType === "KubeGuard Engine" ? (
                      <Sparkles size={13} className="text-violet-400 flex-shrink-0" />
                    ) : (
                      <User size={13} className="text-[#00D9FF] flex-shrink-0" />
                    )}
                    <span className="font-semibold text-[#F1F5FF] truncate max-w-[150px]">
                      {log.actor}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-3 font-mono font-semibold text-[#00D9FF]">
                  {log.action}
                </td>

                <td className="py-3.5 px-3 font-mono text-slate-300">
                  {log.resource} ({log.namespace})
                </td>

                <td className="py-3.5 px-3">
                  <span
                    className={`inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                      log.outcome === "Success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-[#10F5A0]"
                        : "bg-rose-500/10 border-rose-500/30 text-[#FF426D]"
                    }`}
                  >
                    {log.outcome}
                  </span>
                </td>

                <td className="py-3.5 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
