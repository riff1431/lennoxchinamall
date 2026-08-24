"use client";

import React from "react";
import { cn } from "@/utils/helpers";

export interface AdminFormSectionProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  badge?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminFormSection({
  title,
  description,
  icon: Icon,
  badge,
  children,
  actions,
  className,
}: AdminFormSectionProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5 font-montserrat",
        className
      )}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-[#FF1028]" />
              </div>
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              {title}
            </h3>
            {badge}
          </div>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Section Fields Body */}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
