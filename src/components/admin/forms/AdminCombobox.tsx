"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/utils/helpers";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ElementType;
}

export interface AdminComboboxProps {
  label?: string;
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  containerClassName?: string;
}

export function AdminCombobox({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  helperText,
  errorMessage,
  required,
  disabled,
  clearable = true,
  className,
  containerClassName,
}: AdminComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isError = Boolean(errorMessage);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

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

  const openCombobox = () => {
    setSearchQuery("");
    setHighlightedIndex(0);
    setIsOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeCombobox = () => {
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        openCombobox();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value);
        closeCombobox();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeCombobox();
    }
  };

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
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => (isOpen ? closeCombobox() : openCombobox())}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full bg-white dark:bg-slate-950 border px-3.5 py-2.5 text-xs rounded-xl text-left flex items-center justify-between transition-all duration-150 outline-none cursor-pointer disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed",
            isError
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              : isOpen
              ? "border-[#2F65F6] ring-2 ring-[#2F65F6]/15"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedOption?.icon && (
              <selectedOption.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            {selectedOption ? (
              <span className="text-slate-900 dark:text-slate-100 font-medium truncate">
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-slate-400 truncate">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {clearable && selectedOption && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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

        {/* Dropdown Overlay */}
        {isOpen && (
          <div className="absolute z-40 mt-1.5 w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white rounded-xl pl-8.5 pr-3 py-2 outline-none focus:border-[#2F65F6]"
              />
            </div>

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto space-y-0.5" role="listbox">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matches found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = idx === highlightedIndex;
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "w-full px-3 py-2 text-xs rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer",
                        isSelected
                          ? "bg-red-50/80 dark:bg-red-950/30 text-[#FF1028] font-bold"
                          : isHighlighted
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                          : "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {Icon && <Icon className="w-3.5 h-3.5 opacity-70 shrink-0" />}
                        <div>
                          <div className="truncate">{opt.label}</div>
                          {opt.sublabel && (
                            <div className="text-[10px] text-slate-400 font-normal truncate">
                              {opt.sublabel}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#FF1028] shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
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
