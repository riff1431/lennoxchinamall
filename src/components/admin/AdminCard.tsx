import React from "react";
import { cn } from "@/utils/helpers";
import { LucideIcon } from "lucide-react";

export interface AdminCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function AdminCard({
  title,
  description,
  icon: Icon,
  badge,
  headerAction,
  footer,
  children,
  className = "",
  bodyClassName = "",
  padding = "md",
}: AdminCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3.5 sm:p-4",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-6",
  };

  const hasHeader = Boolean(title || description || headerAction || Icon);

  return (
    <div
      className={cn(
        "rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden",
        className
      )}
    >
      {hasHeader && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            {title && (
              <div className="flex items-center gap-2">
                {Icon && (
                  <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                )}
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
                {badge && <div className="shrink-0">{badge}</div>}
              </div>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div className={cn(paddingClasses[padding], bodyClassName)}>{children}</div>

      {footer && (
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          {footer}
        </div>
      )}
    </div>
  );
}
