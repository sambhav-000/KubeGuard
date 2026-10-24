import React from "react";
import { HealthStatus, IncidentSeverity } from "@/lib/types";

type BadgeType = HealthStatus | IncidentSeverity | "Ready" | "NotReady" | "Success" | "In Progress" | "Rolling Out" | "Rolled Back" | "Partial" | string;

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

  let colorClasses = "bg-[#0E1E38] text-slate-300 border-[#172A46]";
  let dotColor = "bg-slate-400";

  if (norm === "healthy" || norm === "ready" || norm === "success" || norm === "resolved" || norm === "remediated") {
    colorClasses = "bg-emerald-950/60 text-[#10F5A0] border-emerald-500/40 shadow-[0_0_10px_rgba(16,245,160,0.2)]";
    dotColor = "bg-[#10F5A0]";
  } else if (norm === "degraded" || norm === "warning" || norm === "partial" || norm === "rolling out" || norm === "in progress" || norm === "in_progress") {
    colorClasses = "bg-amber-950/60 text-[#FFB020] border-amber-500/40 shadow-[0_0_10px_rgba(255,176,32,0.2)]";
    dotColor = "bg-[#FFB020]";
  } else if (norm === "failed" || norm === "critical" || norm === "notready" || norm === "not ready") {
    colorClasses = "bg-rose-950/70 text-[#FF426D] border-[#FF426D]/50 shadow-[0_0_10px_rgba(255,66,109,0.25)]";
    dotColor = "bg-[#FF426D]";
  } else if (norm === "pending" || norm === "info" || norm === "investigating") {
    colorClasses = "bg-cyan-950/60 text-[#00D9FF] border-cyan-500/40 shadow-[0_0_10px_rgba(0,217,255,0.2)]";
    dotColor = "bg-[#00D9FF]";
  } else if (norm === "rolled back") {
    colorClasses = "bg-purple-950/60 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]";
    dotColor = "bg-purple-400";
  }

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-0.5",
    lg: "text-xs px-3 py-1.5 font-semibold",
  }[size];

  const displayLabel = norm === "success" ? "Success" : norm === "partial" ? "Partial" : status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colorClasses} ${sizeClasses} select-none transition-colors font-mono`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${norm === "in progress" || norm === "investigating" ? "animate-pulse" : ""}`} />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
