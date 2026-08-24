"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/helpers";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  size = "md",
  maxWidth,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-2xl",
    "2xl": "sm:max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-montserrat">
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        {/* Modal Panel (Bottom sheet on mobile, centered card on desktop) */}
        <div
          className={cn(
            "relative transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#111827] text-left shadow-2xl transition-all w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col border border-slate-200/80 dark:border-slate-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200",
            sizeClasses[size],
            maxWidth && `sm:${maxWidth}`,
            className
          )}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
              <div className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 font-heading">{title}</div>
              <button
                onClick={onClose}
                className="w-9 h-9 -mr-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain text-slate-700 dark:text-slate-300">{children}</div>

          {footer && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-end gap-3 shrink-0 pb-safe">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
