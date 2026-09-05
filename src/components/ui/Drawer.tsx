"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/helpers";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: "left" | "right";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  hideCloseButton?: boolean;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = "right",
  className,
  size = "md",
  headerClassName,
  contentClassName,
  footerClassName,
  hideCloseButton = false,
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed inset-y-0 flex max-w-full",
          position === "right" ? "right-0" : "left-0"
        )}
      >
        <div
          className={cn(
            "w-screen bg-white shadow-2xl flex flex-col justify-between animate-in duration-300",
            position === "right"
              ? "slide-in-from-right"
              : "slide-in-from-left",
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0",
              headerClassName
            )}
          >
            <div className="text-base font-bold text-slate-900 flex-1 min-w-0">{title}</div>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className={cn("flex-1 overflow-y-auto p-6", contentClassName)}>{children}</div>

          {/* Footer */}
          {footer && (
            <div
              className={cn(
                "border-t border-slate-100 px-6 py-4 bg-slate-50 shrink-0",
                footerClassName
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
