"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmModal() {
  const { confirmModal, closeConfirmModal } = useDashboard();

  if (!confirmModal || !confirmModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0f172a] border border-[#263244] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={closeConfirmModal}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 p-1"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              confirmModal.isDanger
                ? "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
            }`}
          >
            <AlertTriangle size={20} />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-white tracking-tight">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeConfirmModal}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700/80 transition"
              >
                {confirmModal.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  closeConfirmModal();
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white transition shadow-lg ${
                  confirmModal.isDanger
                    ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/40"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40"
                }`}
              >
                {confirmModal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

