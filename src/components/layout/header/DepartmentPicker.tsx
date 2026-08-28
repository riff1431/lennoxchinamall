"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { LayoutGrid, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Category } from "@/types/database";

interface PickerCategory extends Partial<Category> {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  iconName?: string;
}

interface DepartmentPickerProps {
  selectedCategory: string;
  onSelect: (slug: string) => void;
  rootCategories: PickerCategory[];
}

export function DepartmentPicker({ selectedCategory, onSelect, rootCategories }: DepartmentPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSelectedCategory = useMemo(() => {
    return rootCategories.find((c) => c.slug === selectedCategory);
  }, [selectedCategory, rootCategories]);

  return (
    <div className="hidden lg:block relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 shrink-0 cursor-pointer transition-colors select-none"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Filter search by department"
      >
        <div className="w-5 h-5 rounded-md bg-white border border-slate-200/80 flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs">
          {currentSelectedCategory ? (
            <CategoryIcon
              icon={currentSelectedCategory.icon || currentSelectedCategory.iconName}
              name={currentSelectedCategory.name}
              className="w-3.5 h-3.5 text-[#FF1028]"
            />
          ) : (
            <LayoutGrid className="w-3.5 h-3.5 text-[#FF1028]" />
          )}
        </div>
        <span className="max-w-[125px] truncate font-bold text-slate-800">
          {currentSelectedCategory?.name || "All Departments"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#FF1028]" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute left-0 top-[calc(100%+8px)] w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 p-1.5 max-h-80 overflow-y-auto font-sans custom-scrollbar"
          >
            <button
              type="button"
              role="option"
              aria-selected={selectedCategory === "all"}
              onClick={() => {
                onSelect("all");
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#FF1028]/10 text-[#FF1028] font-black"
                  : "text-slate-700 hover:bg-slate-50 font-bold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-3.5 h-3.5 text-[#FF1028]" />
                </div>
                <span>All Departments</span>
              </div>
              {selectedCategory === "all" && <Check className="w-3.5 h-3.5 text-[#FF1028]" />}
            </button>

            <div className="h-px bg-slate-100 my-1" />

            {rootCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(cat.slug);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#FF1028]/10 text-[#FF1028] font-black"
                      : "text-slate-700 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <CategoryIcon
                        icon={cat.icon || cat.iconName}
                        name={cat.name}
                        className="w-4 h-4 text-[#FF1028]"
                      />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#FF1028] shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
