"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/utils/helpers";

export interface PageAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "danger" | "outline";
  disabled?: boolean;
}

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: "red" | "emerald" | "amber" | "blue" | "purple" | "slate";
  };
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: PageAction[];
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  children,
}: AdminPageHeaderProps) {
  const badgeVariants = {
    red: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700",
  };

  return (
    <div className="space-y-2.5 pb-5 border-b border-slate-200/80 dark:border-slate-800">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Link href="/admin/dashboard" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            Admin
          </Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {bc.href ? (
                <Link href={bc.href} className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  {bc.label}
                </Link>
              ) : (
                <span className="text-slate-700 dark:text-slate-200 font-semibold">{bc.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
              {title}
            </h1>
            {badge && (
              <span
                className={cn(
                  "text-[10px] font-mono font-semibold uppercase tracking-wide px-2 py-0.2 rounded-md",
                  badgeVariants[badge.variant || "blue"]
                )}
              >
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {actions.map((act, i) => {
              const Icon = act.icon;
              const buttonClasses = cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed",
                act.variant === "primary" || !act.variant
                  ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold"
                  : act.variant === "secondary"
                  ? "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800"
                  : act.variant === "danger"
                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  : "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800"
              );

              if (act.href) {
                return (
                  <Link key={i} href={act.href} className={buttonClasses}>
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{act.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={act.onClick}
                  disabled={act.disabled}
                  className={buttonClasses}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

