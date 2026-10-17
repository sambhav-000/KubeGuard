"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useDashboard();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let border = "border-slate-700/80";
        let bg = "bg-[#0d1527]/95";
        let icon = <Info className="w-5 h-5 text-sky-400 flex-shrink-0" />;

        if (toast.type === "success") {
          border = "border-emerald-600/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
        } else if (toast.type === "warning") {
          border = "border-amber-600/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
        } else if (toast.type === "error") {
          border = "border-rose-600/50 shadow-[0_0_15px_rgba(244,63,94,0.25)]";
          icon = <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${border} ${bg} backdrop-blur-md shadow-2xl transition-all animate-in slide-in-from-bottom-2 duration-200`}
          >
            {icon}
            <div className="flex-1 min-w-0 pr-1">
              <div className="text-xs font-semibold text-white tracking-tight">
                {toast.title}
              </div>
              {toast.message && (
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 -mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

