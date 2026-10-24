"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ResourceCharts } from "@/components/dashboard/ResourceCharts";
import { WorkloadTable } from "@/components/dashboard/WorkloadTable";
import { IncidentPanel } from "@/components/dashboard/IncidentPanel";
import { RecoveryTimeline } from "@/components/dashboard/RecoveryTimeline";
import { RecentDeployments } from "@/components/dashboard/RecentDeployments";
import {
  ShieldCheck,
  Boxes,
  TriangleAlert,
  Zap,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

// Holographic 3D Kubernetes Cube & Platform Illustration
function KubernetesHologramVisual() {
  return (
    <div className="relative w-48 h-40 hidden md:flex items-center justify-center flex-shrink-0 animate-float select-none">
      <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible" fill="none">
        <defs>
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="violetGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="helmGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="cubeLeft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="cubeRight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>

        {/* Outer Glowing Concentric Rings Base */}
        <ellipse cx="100" cy="120" rx="80" ry="26" stroke="#7C3AED" strokeWidth="1.5" opacity="0.6" filter="url(#violetGlow)" />
        <ellipse cx="100" cy="120" rx="60" ry="20" stroke="#00D9FF" strokeWidth="2" opacity="0.8" filter="url(#cyanGlow)" />
        <ellipse cx="100" cy="120" rx="38" ry="12" stroke="#2563EB" strokeWidth="1.5" opacity="0.9" />

        {/* Isometric Platform Projection Grid Rays */}
        <line x1="20" y1="120" x2="60" y2="120" stroke="#00D9FF" strokeWidth="1" opacity="0.4" />
        <line x1="140" y1="120" x2="180" y2="120" stroke="#00D9FF" strokeWidth="1" opacity="0.4" />
        <line x1="100" y1="94" x2="100" y2="146" stroke="#7C3AED" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />

        {/* Stacked 3D Isometric Server Cubes */}
        {/* Layer 1 Base Cube */}
        <g transform="translate(100, 100)">
          {/* Top Face */}
          <polygon points="0,-18 36,0 0,18 -36,0" fill="url(#cubeTop)" stroke="#00D9FF" strokeWidth="1.2" />
          {/* Left Face */}
          <polygon points="-36,0 0,18 0,34 -36,16" fill="url(#cubeLeft)" stroke="#00D9FF" strokeWidth="1" />
          {/* Right Face */}
          <polygon points="0,18 36,0 36,16 0,34" fill="url(#cubeRight)" stroke="#7C3AED" strokeWidth="1" />
        </g>

        {/* Layer 2 Upper Cube */}
        <g transform="translate(100, 84)">
          {/* Top Face */}
          <polygon points="0,-16 28,0 0,16 -28,0" fill="#2563EB" stroke="#60A5FA" strokeWidth="1.2" />
          {/* Left Face */}
          <polygon points="-28,0 0,16 0,28 -28,12" fill="#1E293B" stroke="#00D9FF" strokeWidth="0.8" />
          {/* Right Face */}
          <polygon points="0,16 28,0 28,12 0,28" fill="#4338CA" stroke="#A855F7" strokeWidth="0.8" />
        </g>

        {/* Vertical Holographic Projection Ray */}
        <line x1="100" y1="84" x2="100" y2="38" stroke="#00D9FF" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.7" />

        {/* Floating Holographic Kubernetes Helm */}
        <g transform="translate(100, 36)" filter="url(#cyanGlow)">
          {/* Outer Wheel */}
          <circle cx="0" cy="0" r="18" stroke="url(#helmGrad)" strokeWidth="2.8" fill="#08152B" />
          {/* Inner Hub */}
          <circle cx="0" cy="0" r="5" stroke="#00D9FF" strokeWidth="2" fill="#00D9FF" />
          {/* 7 Spokes / Handles */}
          {[0, 51.4, 102.8, 154.2, 205.7, 257.1, 308.5].map((angle, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={22 * Math.cos((angle * Math.PI) / 180)}
              y2={22 * Math.sin((angle * Math.PI) / 180)}
              stroke="#00D9FF"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Sparkle Particles */}
        <circle cx="48" cy="50" r="1.5" fill="#00D9FF" opacity="0.8" />
        <circle cx="155" cy="65" r="1.5" fill="#A855F7" opacity="0.8" />
        <circle cx="140" cy="35" r="1" fill="#10F5A0" opacity="0.8" />
      </svg>
    </div>
  );
}

// Glowing Pulse Waveform on the Status Card
function HeartbeatWave() {
  return (
    <div className="w-20 h-8 flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 90 32" className="w-full h-full overflow-visible" fill="none">
        <path
          d="M0 16 L18 16 L24 8 L32 24 L40 4 L48 28 L56 12 L62 20 L70 16 L90 16"
          stroke="#00D9FF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="filter drop-shadow-[0_0_6px_rgba(0,217,255,0.7)]"
        />
      </svg>
    </div>
  );
}

export default function OverviewPage() {
  const { currentCluster } = useDashboard();

  return (
    <div className="space-y-6">
      {/* ==================== HERO SECTION ("Kubernetes at a glance") ==================== */}
      <div className="bg-[#08152B] border border-[#172A46] rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left Text */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#00D9FF] flex items-center gap-1.5 font-mono">
              <span>Good afternoon, Sambhav 👋</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F1F5FF] tracking-tight mt-1.5">
              Kubernetes at a glance
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
              Monitor your infrastructure. Detect incidents. Recover intelligently. Your cluster is <span className="text-[#10F5A0] font-semibold">healthy</span> and running smoothly.
            </p>
          </div>

          {/* Center: 3D Holographic Visual */}
          <KubernetesHologramVisual />

          {/* Right: Cluster Status Card */}
          <div className="w-full lg:w-auto bg-[#050D1C] border border-[#172A46] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-md lg:min-w-[320px]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#10F5A0] shadow-[0_0_12px_rgba(16,245,160,0.3)]">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F1F5FF] flex items-center gap-2">
                    <span>Cluster Healthy</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    All core services are running normally
                  </div>
                </div>
              </div>

              {/* Glowing Heartbeat Waveform */}
              <HeartbeatWave />
            </div>

            <div className="mt-4 pt-3 border-t border-[#15243E] space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#F1F5FF] font-semibold">
                  <span>kube-prod-cluster</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </div>
                <span className="text-slate-400">v1.31.0</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>Uptime • 12d 4h 32m</span>
                <span className="text-[#00D9FF]">Last Sync 2m ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 4 KPI CARDS ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Cluster Health */}
        <MetricCard
          title="Cluster Health"
          value="98%"
          trendText="↑ 2% vs last 24h"
          bottomText="3 / 3 nodes healthy"
          icon={ShieldCheck}
          accent="emerald"
          type="ring-sparkline"
          progressPercent={98}
        />

        {/* Card 2: Running Pods */}
        <MetricCard
          title="Running Pods"
          value="42 / 48"
          subDetail={
            <div className="text-slate-400 text-xs">
              <span>5 pending</span>{" "}
              <span className="text-[#FF426D] font-bold">| 1 failed</span>
            </div>
          }
          trendText="↑ 4% vs last 24h"
          icon={Boxes}
          accent="cyan"
          type="cyan-bars"
        />

        {/* Card 3: Incidents */}
        <MetricCard
          title="Incidents"
          value="3"
          subDetail={
            <div className="text-xs">
              <span className="text-[#FF426D] font-bold">1 critical</span>{" "}
              <span className="text-[#FFB020] font-bold">| 2 warning</span>
            </div>
          }
          trendText="↓ 50% vs last 24h"
          icon={TriangleAlert}
          accent="amber"
          type="amber-line"
        />

        {/* Card 4: Recovery Actions */}
        <MetricCard
          title="Recovery Actions"
          value="12"
          subDetail={
            <div className="text-xs">
              <span className="text-[#10F5A0] font-bold">10 successful</span>{" "}
              <span className="text-[#FF426D] font-bold">| 2 failed</span>
            </div>
          }
          trendText="↑ 33% vs last 24h"
          icon={Zap}
          accent="violet"
          type="violet-bars"
        />
      </div>

      {/* ==================== MIDDLE ROW: RESOURCE UTILIZATION + RECENT INCIDENTS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ResourceCharts />
        </div>
        <div className="lg:col-span-5">
          <IncidentPanel />
        </div>
      </div>

      {/* ==================== BOTTOM ROW: WORKLOAD HEALTH + SELF-HEALING + RECENT DEPLOYMENTS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WorkloadTable />
        <RecoveryTimeline />
        <RecentDeployments />
      </div>
    </div>
  );
}
