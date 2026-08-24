"use client";

import React, { forwardRef } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/utils/helpers";

export interface AdminSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface AdminSelectOptionGroup {
  label: string;
  options: AdminSelectOption[];
}

export interface AdminSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  options?: (AdminSelectOption | AdminSelectOptionGroup)[];
  helperText?: string;
  errorMessage?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  containerClassName?: string;
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  (
    {
      label,
      options = [],
      helperText,
      errorMessage,
      placeholder,
      size = "md",
      required,
      disabled,
      className,
      containerClassName,
      children,
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
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-heading">
            {label}
            {required && <span className="text-[#FF1028] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            required={required}
            disabled={disabled}
            className={cn(
              "w-full bg-white dark:bg-slate-950 border appearance-none pr-9 transition-all duration-150 outline-none text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed cursor-pointer",
              sizeClasses[size],
              isError
                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-200 dark:border-slate-800 focus:border-[#2F65F6] dark:focus:border-[#2F65F6] focus:ring-2 focus:ring-[#2F65F6]/15",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((item, idx) => {
              if ("options" in item) {
                return (
                  <optgroup key={idx} label={item.label}>
                    {item.options.map((opt) => (
                      <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                );
              }
              return (
                <option key={String(item.value)} value={item.value} disabled={item.disabled}>
                  {item.label}
                </option>
              );
            })}
            {children}
          </select>

          <div className="absolute right-3 pointer-events-none text-slate-400 flex items-center gap-1.5">
            {isError ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

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

AdminSelect.displayName = "AdminSelect";
