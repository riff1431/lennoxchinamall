"use client";

import React from "react";
import { cn } from "@/utils/helpers";

export type BadgeTone =
  | "emerald"
  | "red"
  | "rose"
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
      bg: "bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/20",
      dot: "bg-emerald-500",
    },
    red: {
      bg: "bg-rose-500/10",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/20",
      dot: "bg-rose-500",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/20",
      dot: "bg-rose-500",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/20",
      dot: "bg-amber-500",
    },
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-500/20",
      dot: "bg-blue-500",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-500/20",
      dot: "bg-purple-500",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-700 dark:text-cyan-300",
      border: "border-cyan-500/20",
      dot: "bg-cyan-500",
    },
    slate: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200/80 dark:border-slate-700",
      dot: "bg-slate-400",
    },
  };

  const style = toneClasses[inferredTone] || toneClasses.slate;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide rounded-md border font-mono shrink-0 select-none",
        style.bg,
        style.text,
        style.border,
        size === "sm" ? "text-[9px] px-1.5 py-0.2" : "text-[10px] px-2 py-0.5",
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
