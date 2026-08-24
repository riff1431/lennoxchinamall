"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/utils/helpers";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastContextValue {
  showToast: (options: {
    type?: ToastType;
    title: string;
    description?: string;
    duration?: number;
    action?: ToastAction;
  }) => string;
  success: (title: string, description?: string, action?: ToastAction) => string;
  error: (title: string, description?: string, action?: ToastAction) => string;
  warning: (title: string, description?: string, action?: ToastAction) => string;
  info: (title: string, description?: string, action?: ToastAction) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useAdminToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAdminToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      type = "info",
      title,
      description,
      duration = 4000,
      action,
    }: {
      type?: ToastType;
      title: string;
      description?: string;
      duration?: number;
      action?: ToastAction;
    }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = {
        id,
        type,
        title,
        description,
        duration,
        action,
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Limit to 5 visible toasts

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, description?: string, action?: ToastAction) =>
      showToast({ type: "success", title, description, action }),
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string, action?: ToastAction) =>
      showToast({ type: "error", title, description, duration: 6000, action }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, description?: string, action?: ToastAction) =>
      showToast({ type: "warning", title, description, duration: 5000, action }),
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string, action?: ToastAction) =>
      showToast({ type: "info", title, description, action }),
    [showToast]
  );

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/90 dark:bg-[#062016]",
    error: "border-rose-200 dark:border-rose-900/40 bg-rose-50/90 dark:bg-[#200a0e]",
    warning: "border-amber-200 dark:border-amber-900/40 bg-amber-50/90 dark:bg-[#221706]",
    info: "border-blue-200 dark:border-blue-900/40 bg-blue-50/90 dark:bg-[#07192f]",
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        warning,
        info,
        dismissToast,
      }}
    >
      {children}

      {/* Floating Toast Viewport Container */}
      <div
        aria-live="assertive"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={cn(
              "pointer-events-auto w-full p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-5 fade-in flex items-start gap-3",
              borders[toast.type]
            )}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-heading leading-tight">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {toast.description}
                </p>
              )}
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    dismissToast(toast.id);
                  }}
                  className="mt-2 text-xs font-bold text-[#FF1028] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{toast.action.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
