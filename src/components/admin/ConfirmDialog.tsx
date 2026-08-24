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
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/30",
    },
    warning: {
      Icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    info: {
      Icon: AlertCircle,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
    },
    success: {
      Icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
    },
  }[variant];

  const Icon = iconConfig.Icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-5 pt-2">
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${iconConfig.bg} ${iconConfig.color}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white leading-snug">{title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
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
                ? "bg-red-600 hover:bg-red-700 text-white font-bold"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700 text-white font-bold"
                : variant === "success"
                ? "bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold"
                : "bg-blue-600 hover:bg-blue-700 text-white font-bold"
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
