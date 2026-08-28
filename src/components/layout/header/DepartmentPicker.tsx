"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  ChevronDown,
  Check,
  Search,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Category } from "@/types/database";

interface PickerCategory extends Partial<Category> {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  iconName?: string;
  product_count?: number;
  subcategories?: string[];
}

interface DepartmentPickerProps {
  selectedCategory: string;
  onSelect: (slug: string) => void;
  rootCategories: PickerCategory[];
}

export function DepartmentPicker({
  selectedCategory,
  onSelect,
  rootCategories = [],
}: DepartmentPickerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setFilterQuery("");
    }
  }, [isOpen]);

  const currentSelectedCategory = useMemo(() => {
    return rootCategories.find((c) => c.slug === selectedCategory);
  }, [selectedCategory, rootCategories]);

  const filteredCategories = useMemo(() => {
    if (!filterQuery.trim()) return rootCategories;
    const q = filterQuery.toLowerCase().trim();
    return rootCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.subcategories &&
          c.subcategories.some((sub) => sub.toLowerCase().includes(q)))
    );
  }, [rootCategories, filterQuery]);

  const handleCategorySelect = (slug: string) => {
    onSelect(slug);
    setIsOpen(false);
  };

  const handleNavigateToCategory = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    setIsOpen(false);
    router.push(`/categories/${slug}`);
  };

  return (
    <div className="relative shrink-0 flex items-center" ref={containerRef}>
      {/* ── Department Selector Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full flex items-center gap-1.5 sm:gap-2 bg-slate-50/90 hover:bg-slate-100/90 border-r border-slate-200 px-3 sm:px-3.5 py-2.5 text-xs font-bold text-slate-800 shrink-0 cursor-pointer transition-colors select-none group"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Filter search by primary department"
      >
        <div className="w-5 h-5 rounded-md bg-white border border-slate-200/80 flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs group-hover:border-red-300 transition-colors">
          {currentSelectedCategory ? (
            <CategoryIcon
              icon={
                currentSelectedCategory.icon ||
                currentSelectedCategory.iconName
              }
              name={currentSelectedCategory.name}
              className="w-3.5 h-3.5 text-[#FF1028]"
            />
          ) : (
            <LayoutGrid className="w-3.5 h-3.5 text-[#FF1028]" />
          )}
        </div>

        <span className="max-w-[100px] sm:max-w-[135px] truncate font-black text-slate-800 group-hover:text-[#FF1028] transition-colors text-[11px] sm:text-xs">
          {currentSelectedCategory?.name || "All Departments"}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#FF1028]" : "group-hover:text-slate-600"
          }`}
        />
      </button>

      {/* ── Dynamic Departments Dropdown List ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="listbox"
            className="absolute left-0 top-[calc(100%+8px)] w-72 sm:w-80 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 p-2 font-sans text-slate-900 dark:text-slate-100"
          >
            {/* Header & Department Live Filter */}
            <div className="p-2 pb-2.5 border-b border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-[#00143D] dark:text-white uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-[#FF1028]" />
                  Main Departments
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {rootCategories.length} Total
                </span>
              </div>

              {/* Department search filter input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Filter departments..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#FF1028] focus:ring-1 focus:ring-[#FF1028]/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Department Options Feed */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40 p-1 space-y-0.5 custom-scrollbar">
              {/* Option: All Departments */}
              <div
                role="option"
                aria-selected={selectedCategory === "all"}
                onClick={() => handleCategorySelect("all")}
                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer group ${
                  selectedCategory === "all"
                    ? "bg-[#FF1028]/10 text-[#FF1028] font-black"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <LayoutGrid className="w-4 h-4 text-[#FF1028]" />
                  </div>
                  <div>
                    <span className="block truncate">All Departments</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Search across all catalogue
                    </span>
                  </div>
                </div>
                {selectedCategory === "all" && (
                  <Check className="w-4 h-4 text-[#FF1028] shrink-0" />
                )}
              </div>

              {/* Dynamic Category Items */}
              {filteredCategories.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No departments found matching &quot;{filterQuery}&quot;
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  const count = cat.product_count || (cat.subcategories ? `${cat.subcategories.length} subcategories` : null);

                  return (
                    <div
                      key={cat.id || cat.slug}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer group ${
                        isSelected
                          ? "bg-[#FF1028]/10 text-[#FF1028] font-black"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden group-hover:scale-105 transition-transform shadow-2xs">
                          <CategoryIcon
                            icon={cat.icon || cat.iconName}
                            name={cat.name}
                            className="w-4 h-4 text-[#FF1028]"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className={`block truncate ${isSelected ? "font-black text-[#FF1028]" : "font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#FF1028]"}`}>
                            {cat.name}
                          </span>
                          {count && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              {typeof count === "number" ? `${count} items` : count}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* Direct link button to category page */}
                        <button
                          type="button"
                          onClick={(e) => handleNavigateToCategory(e, cat.slug)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-[#FF1028] transition-colors"
                          title={`Browse ${cat.name}`}
                          aria-label={`Browse ${cat.name}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        {isSelected && (
                          <Check className="w-4 h-4 text-[#FF1028] shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer View All Categories Link */}
            <div className="p-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">
                Direct factory sourcing
              </span>
              <Link
                href="/categories"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-black text-[#FF1028] hover:underline flex items-center gap-1 font-heading uppercase tracking-wider cursor-pointer"
              >
                <span>All Categories &rarr;</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
