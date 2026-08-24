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
      bg: "bg-emerald-950/60",
      text: "text-emerald-300",
      border: "border-emerald-800/80",
      dot: "bg-emerald-400",
    },
    red: {
      bg: "bg-red-950/60",
      text: "text-red-300",
      border: "border-red-800/80",
      dot: "bg-red-400",
    },
    amber: {
      bg: "bg-amber-950/60",
      text: "text-amber-300",
      border: "border-amber-800/80",
      dot: "bg-amber-400",
    },
    blue: {
      bg: "bg-blue-950/60",
      text: "text-blue-300",
      border: "border-blue-800/80",
      dot: "bg-blue-400",
    },
    purple: {
      bg: "bg-purple-950/60",
      text: "text-purple-300",
      border: "border-purple-800/80",
      dot: "bg-purple-400",
    },
    cyan: {
      bg: "bg-cyan-950/60",
      text: "text-cyan-300",
      border: "border-cyan-800/80",
      dot: "bg-cyan-400",
    },
    slate: {
      bg: "bg-slate-900",
      text: "text-slate-300",
      border: "border-slate-800",
      dot: "bg-slate-400",
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
        size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2.5 py-1",
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
