"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ChevronDown,
  Search,
  Check,
  FolderTree,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import { Category } from "@/types/database";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { cn } from "@/utils/helpers";

export interface AdminCategorySelectProps {
  label?: string;
  categories: Category[];
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  errorMessage?: string;
  placeholder?: string;
  className?: string;
}

export function AdminCategorySelect({
  label = "Department Category",
  categories = [],
  value,
  onChange,
  required,
  disabled,
  helperText,
  errorMessage,
  placeholder = "Select department category...",
  className,
}: AdminCategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === value);
  }, [categories, value]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.subcategories && c.subcategories.some((s) => s.toLowerCase().includes(q)))
    );
  }, [categories, searchQuery]);

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

  const handleSelect = (catId: string) => {
    onChange(catId);
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
        {selectedCategory ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Category Visual: Thumbnail image or Icon Badge */}
            <div
              className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center relative shadow-2xs"
              style={{ backgroundColor: selectedCategory.bg_color || "#EEF2FF" }}
            >
              {selectedCategory.thumbnail_url || selectedCategory.image_url ? (
                <Image
                  src={selectedCategory.thumbnail_url || selectedCategory.image_url || ""}
                  alt={selectedCategory.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <CategoryIcon
                  name={selectedCategory.icon || selectedCategory.iconName || "FolderTree"}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                  {selectedCategory.name}
                </span>
                {selectedCategory.product_count !== undefined && (
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                    {selectedCategory.product_count} items
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 truncate block">
                {selectedCategory.description || "General hardware catalogue"}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 py-1.5 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-slate-300" />
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
              placeholder="Search category by name or keyword..."
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

          {/* List of categories */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-0.5 custom-scrollbar">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No categories match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = cat.id === value;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelect(cat.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 p-2 rounded-xl cursor-pointer transition-all",
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800 text-blue-900 dark:text-blue-100"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center relative shadow-2xs"
                        style={{ backgroundColor: cat.bg_color || "#EEF2FF" }}
                      >
                        {cat.thumbnail_url || cat.image_url ? (
                          <Image
                            src={cat.thumbnail_url || cat.image_url || ""}
                            alt={cat.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <CategoryIcon
                            name={cat.icon || cat.iconName || "FolderTree"}
                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate block">
                            {cat.name}
                          </span>
                          {cat.product_count !== undefined && (
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              ({cat.product_count})
                            </span>
                          )}
                        </div>
                        {cat.subcategories && cat.subcategories.length > 0 ? (
                          <span className="text-[10px] text-slate-400 truncate block">
                            {cat.subcategories.slice(0, 2).join(", ")}
                            {cat.subcategories.length > 2 ? ` +${cat.subcategories.length - 2} more` : ""}
                          </span>
                        ) : cat.description ? (
                          <span className="text-[10px] text-slate-400 truncate block">
                            {cat.description}
                          </span>
                        ) : null}
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
