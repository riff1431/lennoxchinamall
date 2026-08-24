"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X, AlertCircle } from "lucide-react";
import { cn } from "@/utils/helpers";

export interface DatePreset {
  label: string;
  getValue: () => { from: string; to: string };
}

export interface AdminDatePickerProps {
  label?: string;
  fromValue?: string;
  toValue?: string;
  isRange?: boolean;
  onChange: (range: { from: string; to: string }) => void;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

export function AdminDatePicker({
  label,
  fromValue = "",
  toValue = "",
  isRange = false,
  onChange,
  helperText,
  errorMessage,
  required,
  disabled,
  className,
  containerClassName,
}: AdminDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState(fromValue);
  const [tempTo, setTempTo] = useState(toValue);

  const containerRef = useRef<HTMLDivElement>(null);
  const isError = Boolean(errorMessage);

  const toggleOpen = () => {
    if (!isOpen) {
      setTempFrom(fromValue);
      setTempTo(toValue);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const presets: DatePreset[] = [
    {
      label: "Today",
      getValue: () => {
        const d = new Date().toISOString().split("T")[0];
        return { from: d, to: d };
      },
    },
    {
      label: "Last 7 Days",
      getValue: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 7);
        return {
          from: from.toISOString().split("T")[0],
          to: to.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "Last 30 Days",
      getValue: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 30);
        return {
          from: from.toISOString().split("T")[0],
          to: to.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "This Month",
      getValue: () => {
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          from: first.toISOString().split("T")[0],
          to: now.toISOString().split("T")[0],
        };
      },
    },
  ];

  const handleApply = () => {
    onChange({ from: tempFrom, to: tempTo });
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempFrom("");
    setTempTo("");
    onChange({ from: "", to: "" });
  };

  const displayText = fromValue
    ? isRange && toValue
      ? `${fromValue} → ${toValue}`
      : fromValue
    : "Select date...";

  return (
    <div
      className={cn("space-y-1.5 w-full font-montserrat relative", containerClassName)}
      ref={containerRef}
    >
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-heading">
          {label}
          {required && <span className="text-[#FF1028] ml-1">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className={cn(
          "w-full bg-white dark:bg-slate-950 border px-3.5 py-2.5 text-xs rounded-xl text-left flex items-center justify-between transition-all duration-150 outline-none cursor-pointer disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed",
          isError
            ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            : isOpen
            ? "border-[#2F65F6] ring-2 ring-[#2F65F6]/15"
            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
          className
        )}
      >
        <div className="flex items-center gap-2.5 truncate text-slate-700 dark:text-slate-200">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={cn("truncate font-mono", !fromValue && "text-slate-400")}>
            {displayText}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {fromValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          {isError ? (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          ) : (
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-150",
                isOpen && "rotate-180"
              )}
            />
          )}
        </div>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-40 mt-1.5 w-72 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Presets */}
          <div className="grid grid-cols-2 gap-1.5 mb-3.5">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  const val = p.getValue();
                  setTempFrom(val.from);
                  setTempTo(val.to);
                  onChange(val);
                  setIsOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-red-50 hover:text-[#FF1028] dark:hover:bg-red-950/30 transition-colors text-center cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {isRange ? "From Date" : "Select Date"}
              </label>
              <input
                type="date"
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-900 dark:text-white outline-none focus:border-[#2F65F6]"
              />
            </div>

            {isRange && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={tempTo}
                  min={tempFrom}
                  onChange={(e) => setTempTo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-900 dark:text-white outline-none focus:border-[#2F65F6]"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors cursor-pointer shadow-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

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
