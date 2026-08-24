"use client";

import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/utils/helpers";

export interface AdminTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  maxLength?: number;
  showCount?: boolean;
  containerClassName?: string;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      maxLength,
      showCount = false,
      required,
      disabled,
      className,
      containerClassName,
      value,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const isError = Boolean(errorMessage);
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className={cn("space-y-1.5 w-full font-montserrat", containerClassName)}>
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-heading">
              {label}
              {required && <span className="text-[#FF1028] ml-1">*</span>}
            </label>
          )}
          {showCount && maxLength && (
            <span className="text-[11px] text-slate-400 font-mono">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            ref={ref}
            required={required}
            disabled={disabled}
            value={value}
            rows={rows}
            maxLength={maxLength}
            className={cn(
              "w-full bg-white dark:bg-slate-950 border p-3.5 text-xs rounded-2xl transition-all duration-150 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed resize-y",
              isError
                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-200 dark:border-slate-800 focus:border-[#2F65F6] dark:focus:border-[#2F65F6] focus:ring-2 focus:ring-[#2F65F6]/15",
              className
            )}
            {...props}
          />
        </div>

        {errorMessage && (
          <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 animate-in fade-in duration-150">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}
        {!errorMessage && helperText && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AdminTextarea.displayName = "AdminTextarea";
