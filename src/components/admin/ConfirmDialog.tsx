"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const iconConfig = {
    danger: {
      Icon: Trash2,
      color: "text-[#DC2626] dark:text-rose-400",
      bg: "bg-[#FEE2E2] dark:bg-rose-950/60 border-[#FECDD3]/60 dark:border-rose-900/40",
    },
    warning: {
      Icon: AlertTriangle,
      color: "text-[#D97706] dark:text-amber-400",
      bg: "bg-[#FEF3C7] dark:bg-amber-950/60 border-[#FDE68A]/60 dark:border-amber-900/40",
    },
    info: {
      Icon: AlertCircle,
      color: "text-[#2563EB] dark:text-blue-400",
      bg: "bg-[#EEF2FF] dark:bg-blue-950/60 border-[#BFDBFE]/60 dark:border-blue-900/40",
    },
    success: {
      Icon: CheckCircle2,
      color: "text-[#16A34A] dark:text-emerald-400",
      bg: "bg-[#DCFCE7] dark:bg-emerald-950/60 border-[#BBF7D0]/60 dark:border-emerald-900/40",
    },
  }[variant];

  const Icon = iconConfig.Icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-5 pt-1">
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${iconConfig.bg} ${iconConfig.color}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug font-heading">{title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            isLoading={isLoading}
            className={
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                : variant === "success"
                ? "bg-[#10B981] hover:bg-emerald-600 text-white font-bold rounded-xl"
                : "bg-[#2F65F6] hover:bg-[#2563EB] text-white font-bold rounded-xl shadow-blue-500/25"
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

