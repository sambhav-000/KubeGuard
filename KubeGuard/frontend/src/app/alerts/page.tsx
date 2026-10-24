"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  BellRing,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Send,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function AlertRulesPage() {
  const { alertRules, toggleAlertRule, showToast } = useDashboard();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleMetric, setNewRuleMetric] = useState("CPU Utilization");
  const [newRuleThreshold, setNewRuleThreshold] = useState("85%");

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    showToast("Alert Rule Created", `Rule "${newRuleName}" is now active`, "success");
    setCreateModalOpen(false);
    setNewRuleName("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#15243E]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F1F5FF] tracking-tight flex items-center gap-3">
            <BellRing className="text-[#FFB020]" size={26} />
            <span>Alert Rules & Threshold Policies</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure threshold triggers for proactive incident detection & paging
          </p>
        </div>

        {/* Create Rule CTA */}
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/30 transition cursor-pointer"
        >
          <Plus size={15} />
          <span>Add Alert Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {alertRules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-[#08152B] border rounded-2xl p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
              rule.enabled
                ? "border-[#172A46] hover:border-slate-600"
                : "border-[#172A46]/40 opacity-50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  rule.severity === "critical"
                    ? "bg-rose-500/10 border border-rose-500/30 text-[#FF426D]"
                    : "bg-amber-500/10 border border-amber-500/30 text-[#FFB020]"
                }`}
              >
                <AlertTriangle size={20} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#F1F5FF] tracking-tight">
                    {rule.name}
                  </h3>
                  <StatusBadge status={rule.severity} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                  <span>Target: {rule.target}</span>
                  <span>•</span>
                  <span className="text-[#00D9FF] font-semibold">
                    {rule.metric} {rule.condition} {rule.threshold}
                  </span>
                  <span>for {rule.duration}</span>
                </div>

                {/* Delivery Channels */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Channels:
                  </span>
                  {rule.channels.map((ch) => (
                    <span
                      key={ch}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#050D1C] text-slate-300 border border-[#172A46]"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3 sm:self-center">
              <span className="text-xs font-mono text-slate-400">
                {rule.enabled ? "Active" : "Disabled"}
              </span>

              <button
                onClick={() => toggleAlertRule(rule.id)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  rule.enabled ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    rule.enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#08152B] border border-[#172A46] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-[#F1F5FF] tracking-tight">
              Create New Kubernetes Alert Rule
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Define metric expression and threshold condition
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ingress Latency Degradation"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00D9FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Metric
                  </label>
                  <select
                    value={newRuleMetric}
                    onChange={(e) => setNewRuleMetric(e.target.value)}
                    className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00D9FF] cursor-pointer"
                  >
                    <option>CPU Utilization</option>
                    <option>Memory Utilization</option>
                    <option>Pod Restarts</option>
                    <option>Error Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Threshold
                  </label>
                  <input
                    type="text"
                    value={newRuleThreshold}
                    onChange={(e) => setNewRuleThreshold(e.target.value)}
                    className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-[#050D1C] border border-[#172A46]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-semibold shadow-md shadow-blue-900/30"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
