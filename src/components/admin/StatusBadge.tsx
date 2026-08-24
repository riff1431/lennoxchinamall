"use client";

import React from "react";
import { cn } from "@/utils/helpers";

export type BadgeTone =
  | "emerald"
  | "red"
  | "amber"
  | "blue"
  | "purple"
  | "slate"
  | "cyan";

interface StatusBadgeProps {
  status: string;
  tone?: BadgeTone;
  label?: string;
  className?: string;
  dot?: boolean;
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  tone,
  label,
  className,
  dot = true,
  size = "md",
}: StatusBadgeProps) {
  // Infer tone if not explicitly provided
  const inferredTone: BadgeTone = tone || getToneForStatus(status);
  const displayLabel = label || formatStatusLabel(status);

  const toneClasses: Record<BadgeTone, { bg: string; text: string; border: string; dot: string }> = {
    emerald: {
      bg: "bg-[#DCFCE7] dark:bg-emerald-950/60",
      text: "text-[#16A34A] dark:text-emerald-400",
      border: "border-[#BBF7D0]/60 dark:border-emerald-900/40",
      dot: "bg-[#16A34A] dark:bg-emerald-400",
    },
    red: {
      bg: "bg-[#FEE2E2] dark:bg-rose-950/60",
      text: "text-[#DC2626] dark:text-rose-400",
      border: "border-[#FECDD3]/60 dark:border-rose-900/40",
      dot: "bg-[#DC2626] dark:bg-rose-400",
    },
    amber: {
      bg: "bg-[#FEF3C7] dark:bg-amber-950/60",
      text: "text-[#D97706] dark:text-amber-400",
      border: "border-[#FDE68A]/60 dark:border-amber-900/40",
      dot: "bg-[#D97706] dark:bg-amber-400",
    },
    blue: {
      bg: "bg-[#EEF2FF] dark:bg-blue-950/60",
      text: "text-[#2563EB] dark:text-blue-400",
      border: "border-[#BFDBFE]/60 dark:border-blue-900/40",
      dot: "bg-[#2563EB] dark:bg-blue-400",
    },
    purple: {
      bg: "bg-[#F3E8FF] dark:bg-purple-950/60",
      text: "text-[#7E22CE] dark:text-purple-400",
      border: "border-[#E9D5FF]/60 dark:border-purple-900/40",
      dot: "bg-[#7E22CE] dark:bg-purple-400",
    },
    cyan: {
      bg: "bg-[#CFFAFE] dark:bg-cyan-950/60",
      text: "text-[#0891B2] dark:text-cyan-400",
      border: "border-[#A5F3FC]/60 dark:border-cyan-900/40",
      dot: "bg-[#0891B2] dark:bg-cyan-400",
    },
    slate: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
      dot: "bg-slate-500 dark:bg-slate-400",
    },
  };

  const style = toneClasses[inferredTone] || toneClasses.slate;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md border font-mono shrink-0 select-none",
        style.bg,
        style.text,
        style.border,
        size === "sm" ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-0.5",
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />}
      <span>{displayLabel}</span>
    </span>
  );
}

function getToneForStatus(status: string): BadgeTone {
  const s = status.toLowerCase().replace(/[\s-_]/g, "");

  if (
    [
      "paid",
      "delivered",
      "active",
      "published",
      "healthy",
      "approved",
      "resolved",
      "success",
      "completed",
      "processed",
      "live",
    ].includes(s)
  ) {
    return "emerald";
  }

  if (
    [
      "sourcing",
      "purchased",
      "processing",
      "shipped",
      "in_progress",
      "inprogress",
      "open",
      "pending",
      "initiated",
    ].includes(s)
  ) {
    return "blue";
  }

  if (
    [
      "pendingpayment",
      "warning",
      "reviewrequired",
      "draft",
      "scheduled",
      "lowstock",
      "medium",
      "degraded",
      "requested",
    ].includes(s)
  ) {
    return "amber";
  }

  if (
    [
      "cancelled",
      "failed",
      "rejected",
      "down",
      "urgent",
      "critical",
      "high",
      "inactive",
      "suspended",
      "archived",
      "expired",
    ].includes(s)
  ) {
    return "red";
  }

  if (["refunded", "partiallyrefunded", "returned", "closed"].includes(s)) {
    return "purple";
  }

  return "slate";
}

function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
