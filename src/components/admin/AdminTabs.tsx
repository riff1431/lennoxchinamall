"use client";

import React from "react";
import { cn } from "@/utils/helpers";
import { LucideIcon } from "lucide-react";

export interface AdminTabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number | string;
  badge?: string;
}

export interface AdminTabsProps {
  tabs: AdminTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "underline" | "segmented";
  className?: string;
}

export function AdminTabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className = "",
}: AdminTabsProps) {
  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 max-w-full overflow-x-auto no-scrollbar",
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer select-none",
                isActive
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
              )}
            >
              {Icon && <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-slate-900 dark:text-white" : "text-slate-400")} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                    isActive
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                      : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: Stripe / GitHub Minimal Underline Style
  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 max-w-full overflow-x-auto no-scrollbar",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer select-none -mb-px border-b-2",
              isActive
                ? "border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                )}
              />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-md",
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
