import React from "react";
import { HealthStatus, IncidentSeverity } from "@/lib/types";

type BadgeType = HealthStatus | IncidentSeverity | "Ready" | "NotReady" | "Success" | "In Progress" | "Rolling Out" | "Rolled Back" | string;

export function StatusBadge({
  status,
  size = "md",
  showDot = true,
}: {
  status: BadgeType;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}) {
  const norm = status.toLowerCase();

  let colorClasses = "bg-slate-800/80 text-slate-300 border-slate-700/80";
  let dotColor = "bg-slate-400";

  if (norm === "healthy" || norm === "ready" || norm === "success" || norm === "resolved" || norm === "remediated") {
    colorClasses = "bg-emerald-950/40 text-emerald-400 border-emerald-800/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]";
    dotColor = "bg-emerald-400";
  } else if (norm === "degraded" || norm === "warning" || norm === "rolling out" || norm === "in progress" || norm === "in_progress") {
    colorClasses = "bg-amber-950/40 text-amber-400 border-amber-800/50 shadow-[0_0_10px_rgba(245,158,11,0.15)]";
    dotColor = "bg-amber-400";
  } else if (norm === "failed" || norm === "critical" || norm === "notready" || norm === "not ready") {
    colorClasses = "bg-rose-950/50 text-rose-400 border-rose-800/60 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
    dotColor = "bg-rose-400";
  } else if (norm === "pending" || norm === "info" || norm === "investigating") {
    colorClasses = "bg-sky-950/40 text-sky-400 border-sky-800/50 shadow-[0_0_10px_rgba(56,189,248,0.15)]";
    dotColor = "bg-sky-400";
  } else if (norm === "rolled back") {
    colorClasses = "bg-purple-950/40 text-purple-400 border-purple-800/50";
    dotColor = "bg-purple-400";
  }

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-xs px-3 py-1.5 font-semibold",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colorClasses} ${sizeClasses} select-none transition-colors`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${norm === "in progress" || norm === "investigating" ? "animate-pulse" : ""}`} />
      )}
      <span className="capitalize">{status}</span>
    </span>
  );
}

