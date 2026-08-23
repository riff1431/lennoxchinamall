import React from "react";
import { cn } from "@/utils/helpers";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "deal"
    | "discount"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "outline"
    | "usdt";
  size?: "sm" | "md" | "lg";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 font-medium rounded",
    md: "text-xs px-2.5 py-0.5 font-semibold rounded-md",
    lg: "text-sm px-3 py-1 font-bold rounded-lg",
  };

  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border border-slate-200",
    deal: "bg-orange-500 text-white font-bold tracking-wide shadow-xs shadow-orange-500/30",
    discount: "bg-red-50 text-red-600 border border-red-200 font-bold",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    usdt: "bg-emerald-500 text-white font-bold",
    outline: "border border-slate-300 text-slate-700 bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center select-none whitespace-nowrap",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
