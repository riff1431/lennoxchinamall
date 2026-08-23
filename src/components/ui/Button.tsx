"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/helpers";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "deal"
    | "usdt";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none rounded-lg active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2 gap-2 h-10",
      lg: "text-base px-6 py-3 gap-2.5 h-12 font-semibold",
      icon: "h-10 w-10 p-0",
    };

    const variantStyles = {
      primary:
        "bg-[#00143D] hover:bg-[#002366] text-white shadow-sm focus-visible:ring-[#00143D]",
      secondary:
        "bg-slate-800 hover:bg-slate-900 text-white shadow-sm focus-visible:ring-slate-700",
      deal:
        "bg-[#FF1028] hover:bg-[#E00B20] text-white font-black shadow-md shadow-red-500/20 focus-visible:ring-red-400",
      usdt:
        "bg-[#10B981] hover:bg-emerald-600 text-white font-bold shadow-sm focus-visible:ring-emerald-500",
      outline:
        "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold focus-visible:ring-slate-400",
      ghost:
        "hover:bg-slate-100 text-slate-700 focus-visible:ring-slate-400",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:ring-red-500",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
