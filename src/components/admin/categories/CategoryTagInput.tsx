"use client";

import React, { useState, KeyboardEvent } from "react";
import { X, Plus, Sparkles, Tag } from "lucide-react";
import { cn } from "@/utils/helpers";

interface CategoryTagInputProps {
  label?: string;
  helperText?: string;
  tags: string[];
  onChange: (newTags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function CategoryTagInput({
  label = "Subcategories & Navigation Branches",
  helperText = "Creates searchable branch tags for storefront navigation pills, mega menu, and filters.",
  tags,
  onChange,
  suggestions = [
    "Accessories",
    "Bestsellers",
    "Smart Gadgets",
    "Factory Direct",
    "4K Video",
    "Wireless",
    "Fast Charging",
    "Premium Edition",
  ],
  placeholder = "Type subcategory name and press Enter...",
}: CategoryTagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (text: string) => {
    const trimmed = text.trim().replace(/^,|,$/g, "");
    if (!trimmed) return;

    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      {/* Label and Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#2F65F6]" />
            <span>{label}</span>
          </label>
          {helperText && (
            <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
          )}
        </div>

        {tags.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          >
            Clear all ({tags.length})
          </button>
        )}
      </div>

      {/* Tag Box & Input Field */}
      <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-[#2F65F6] transition-colors space-y-2">
        {/* Rendered Chips */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2F65F6] dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/40 text-xs font-bold shadow-2xs animate-in fade-in zoom-in-95 duration-100"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="w-3.5 h-3.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center text-[#2F65F6] dark:text-blue-300 transition-colors cursor-pointer"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}

          {/* Inline Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => inputValue.trim() && addTag(inputValue)}
            placeholder={tags.length === 0 ? placeholder : "Add more..."}
            className="flex-1 min-w-[140px] text-xs bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 py-1 px-1 font-medium"
          />
        </div>
      </div>

      {/* Suggested Quick Tags */}
      {suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Suggested:</span>
          </span>
          {suggestions
            .filter((s) => !tags.includes(s))
            .slice(0, 5)
            .map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => addTag(sug)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>{sug}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
