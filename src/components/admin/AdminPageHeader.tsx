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
    red: "bg-[#FF1028]/10 text-[#FF1028] border-[#FF1028]/30",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    slate: "bg-slate-800 text-slate-300 border-slate-700",
  };

  return (
    <div className="space-y-3 pb-6 border-b border-slate-800/80">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Link href="/admin/dashboard" className="hover:text-slate-200 transition-colors">
            Admin
          </Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              {bc.href ? (
                <Link href={bc.href} className="hover:text-slate-200 transition-colors">
                  {bc.label}
                </Link>
              ) : (
                <span className="text-slate-200 font-semibold">{bc.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
              {title}
            </h1>
            {badge && (
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                  badgeVariants[badge.variant || "red"]
                )}
              >
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions.map((act, i) => {
              const Icon = act.icon;
              const buttonClasses = cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
                act.variant === "primary" || !act.variant
                  ? "bg-[#FF1028] hover:bg-[#E00B20] text-white shadow-red-950/40"
                  : act.variant === "secondary"
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  : act.variant === "danger"
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700"
              );

              if (act.href) {
                return (
                  <Link key={i} href={act.href} className={buttonClasses}>
                    {Icon && <Icon className="w-4 h-4" />}
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
                  {Icon && <Icon className="w-4 h-4" />}
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
