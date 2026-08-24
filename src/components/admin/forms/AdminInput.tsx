"use client";

import React, { forwardRef } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/utils/helpers";

export interface AdminInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isSuccess?: boolean;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  containerClassName?: string;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      isSuccess,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onClear,
      size = "md",
      required,
      disabled,
      className,
      containerClassName,
      value,
      ...props
    },
    ref
  ) => {
    const isError = Boolean(errorMessage);

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs rounded-xl",
      md: "px-3.5 py-2.5 text-xs rounded-xl",
      lg: "px-4 py-3 text-sm rounded-2xl",
    };

    return (
      <div className={cn("space-y-1.5 w-full font-montserrat", containerClassName)}>
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-heading">
              {label}
              {required && <span className="text-[#FF1028] ml-1">*</span>}
            </label>
          </div>
        )}

        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            required={required}
            disabled={disabled}
            value={value}
            className={cn(
              "w-full bg-white dark:bg-slate-950 border transition-all duration-150 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed",
              sizeClasses[size],
              LeftIcon && "pl-9",
              (RightIcon || onClear || isError || isSuccess) && "pr-9",
              isError
                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : isSuccess
                ? "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                : "border-slate-200 dark:border-slate-800 focus:border-[#2F65F6] dark:focus:border-[#2F65F6] focus:ring-2 focus:ring-[#2F65F6]/15",
              className
            )}
            {...props}
          />

          {/* Right Status / Action Icons */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {onClear && value && !disabled && (
              <button
                type="button"
                onClick={onClear}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                tabIndex={-1}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {isError && (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 pointer-events-none" />
            )}
            {!isError && isSuccess && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 pointer-events-none" />
            )}
            {!isError && !isSuccess && RightIcon && (
              <RightIcon className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Validation & Helper Text */}
        {errorMessage && (
          <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 animate-in fade-in duration-150">
            {errorMessage}
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

AdminInput.displayName = "AdminInput";
