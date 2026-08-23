"use client";

import React, { useState } from "react";
import { cn } from "@/utils/helpers";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  badge?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
  variant?: "underline" | "pills" | "enclosed";
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  className,
  variant = "underline",
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Navigation */}
      <div
        className={cn(
          "flex overflow-x-auto no-scrollbar",
          variant === "underline" && "border-b border-slate-200 gap-6",
          variant === "pills" && "gap-2 p-1 bg-slate-100 rounded-xl",
          variant === "enclosed" && "border-b border-slate-200"
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex items-center gap-2 py-3 px-4 text-sm font-semibold whitespace-nowrap transition-all cursor-pointer relative",
                variant === "underline" && (isActive
                  ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                  : "text-slate-500 hover:text-slate-800"),
                variant === "pills" && (isActive
                  ? "bg-white text-slate-900 shadow-xs rounded-lg"
                  : "text-slate-500 hover:text-slate-800"),
                variant === "enclosed" && (isActive
                  ? "border-t-2 border-t-blue-600 border-x border-slate-200 bg-white text-slate-900 -mb-px rounded-t-lg"
                  : "text-slate-500 hover:text-slate-800 border-b border-slate-200")
              )}
            >
              {tab.label}
              {tab.badge && <span>{tab.badge}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
