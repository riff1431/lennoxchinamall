"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ChevronDown,
  Search,
  Check,
  Award,
  X,
  Sparkles,
  Building2,
} from "lucide-react";
import { Brand } from "@/types/database";
import { cn } from "@/utils/helpers";

export interface AdminBrandSelectProps {
  label?: string;
  brands: Brand[];
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  errorMessage?: string;
  placeholder?: string;
  className?: string;
}

export function AdminBrandSelect({
  label = "Brand / Manufacturer",
  brands = [],
  value,
  onChange,
  required,
  disabled,
  helperText,
  errorMessage,
  placeholder = "Select brand or manufacturer...",
  className,
}: AdminBrandSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedBrand = useMemo(() => {
    return brands.find((b) => b.id === value);
  }, [brands, value]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;
    const q = searchQuery.toLowerCase();
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.slug && b.slug.toLowerCase().includes(q))
    );
  }, [brands, searchQuery]);

  // Click outside listener
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

  const handleOpen = () => {
    if (disabled) return;
    setSearchQuery("");
    setIsOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleSelect = (brandId: string) => {
    onChange(brandId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("space-y-1.5 w-full font-montserrat relative", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-heading">
            {label}
            {required && <span className="text-[#FF1028] ml-1">*</span>}
          </label>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        disabled={disabled}
        className={cn(
          "w-full bg-white dark:bg-slate-900 border text-left rounded-xl px-3 py-2 flex items-center justify-between gap-2.5 transition-all outline-none cursor-pointer group",
          isOpen
            ? "border-[#2F65F6] ring-2 ring-[#2F65F6]/15 shadow-sm"
            : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs",
          errorMessage && "border-red-500 ring-2 ring-red-500/15",
          disabled && "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800"
        )}
      >
        {selectedBrand ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Brand Logo or Stylized Emblem */}
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center relative p-1 shadow-2xs">
              {selectedBrand.logo_url ? (
                <Image
                  src={selectedBrand.logo_url}
                  alt={selectedBrand.name}
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full rounded bg-gradient-to-br from-[#00143D] to-blue-900 text-white flex items-center justify-center font-bold text-[10px] font-mono uppercase">
                  {selectedBrand.name.substring(0, 2)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                  {selectedBrand.name}
                </span>
                {selectedBrand.is_active && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                    OEM Verified
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 truncate block">
                {selectedBrand.description || "Direct OEM hardware factory"}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 py-1.5 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-300" />
            {placeholder}
          </span>
        )}

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
          <ChevronDown
            className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180 text-[#2F65F6]")}
          />
        </div>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 max-h-80 flex flex-col">
          {/* Search Header */}
          <div className="relative mb-2 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brand or manufacturer..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl pl-9 pr-8 py-2 outline-none focus:border-[#2F65F6] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List of brands */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-0.5 custom-scrollbar">
            {filteredBrands.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No brands match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredBrands.map((b) => {
                const isSelected = b.id === value;
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelect(b.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 p-2 rounded-xl cursor-pointer transition-all",
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800 text-blue-900 dark:text-blue-100"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center relative p-1 shadow-2xs">
                        {b.logo_url ? (
                          <Image
                            src={b.logo_url}
                            alt={b.name}
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full rounded bg-gradient-to-br from-[#00143D] to-blue-900 text-white flex items-center justify-center font-bold text-[11px] font-mono uppercase">
                            {b.name.substring(0, 2)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate block">
                            {b.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            /{b.slug}
                          </span>
                        </div>
                        {b.description && (
                          <span className="text-[10px] text-slate-400 truncate block">
                            {b.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {helperText && !errorMessage && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      {errorMessage && (
        <p className="text-[11px] text-red-500 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
