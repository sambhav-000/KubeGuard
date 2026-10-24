"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  Settings,
  Server,
  Bell,
  Sparkles,
  Shield,
  Save,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const { currentCluster, showToast } = useDashboard();
  const [apiEndpoint, setApiEndpoint] = useState("https://127.0.0.1:6443");
  const [slackWebhook, setSlackWebhook] = useState("https://hooks.slack.com/services/T00/B00/XXXX");
  const [pagerDutyKey, setPagerDutyKey] = useState("pd-live-sec-981240182");
  const [maxRollbacks, setMaxRollbacks] = useState("3");
  const [pollInterval, setPollInterval] = useState("10");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Settings Updated", "Configuration successfully saved to local store", "success");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#15243E]">
        <h1 className="text-2xl font-extrabold text-[#F1F5FF] tracking-tight flex items-center gap-3">
          <Settings className="text-[#00D9FF]" size={26} />
          <span>Platform Settings & Cluster Connections</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure Kubernetes API server connection, notification channels and autonomous policy guards
        </p>
      </div>

      {/* Security Banner */}
      <div className="bg-sky-950/20 border border-sky-800/40 rounded-2xl p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#00D9FF] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-sky-200">
          <span className="font-bold">Zero-Trust Credential Architecture: </span>
          KubeGuard communicates with the cluster via secure in-cluster RBAC ServiceAccounts or backend proxy endpoints. Sensitive kubeconfig certificates and tokens are never transferred to or exposed in the browser client.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Cluster Connection Section */}
        <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#15243E]">
            <Server size={16} className="text-[#00D9FF]" />
            <h2 className="text-sm font-bold text-[#F1F5FF] tracking-tight">
              Active Cluster Connection ({currentCluster.name})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Kubernetes API Endpoint
              </label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-[#00D9FF]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Metrics Polling Interval (seconds)
              </label>
              <input
                type="number"
                value={pollInterval}
                onChange={(e) => setPollInterval(e.target.value)}
                className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-[#00D9FF]"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#15243E]">
            <Bell size={16} className="text-[#FFB020]" />
            <h2 className="text-sm font-bold text-[#F1F5FF] tracking-tight">
              Notification Channel Targets
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Slack Webhook URL
              </label>
              <input
                type="text"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-[#00D9FF]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                PagerDuty Service Integration Key
              </label>
              <input
                type="password"
                value={pagerDutyKey}
                onChange={(e) => setPagerDutyKey(e.target.value)}
                className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-[#00D9FF]"
              />
            </div>
          </div>
        </div>

        {/* Self-Healing Policy Guardrails */}
        <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#15243E]">
            <Sparkles size={16} className="text-violet-400" />
            <h2 className="text-sm font-bold text-[#F1F5FF] tracking-tight">
              Autonomous Self-Healing Guardrails
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Maximum Consecutive Automated Rollbacks
              </label>
              <input
                type="number"
                value={maxRollbacks}
                onChange={(e) => setMaxRollbacks(e.target.value)}
                className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-[#00D9FF]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Prevents infinite flapping during systemic infrastructure faults.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Post-Remediation Health Verification Window
              </label>
              <select className="w-full bg-[#050D1C] border border-[#172A46] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00D9FF] cursor-pointer">
                <option>3 minutes (Quick canary check)</option>
                <option>5 minutes (Recommended default)</option>
                <option>10 minutes (Deep readiness soak)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/30 transition cursor-pointer"
          >
            <Save size={15} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
