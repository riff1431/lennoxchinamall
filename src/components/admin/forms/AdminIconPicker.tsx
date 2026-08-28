"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  Upload,
  Sparkles,
  Check,
  X,
  Image as ImageIcon,
  FolderTree,
  Sliders,
} from "lucide-react";
import {
  CategoryIcon,
  CATEGORY_ICON_MAP,
  PRESET_CATEGORY_ICONS,
} from "@/components/ui/CategoryIcon";
import { cn } from "@/utils/helpers";

export interface AdminIconPickerProps {
  label?: string;
  helperText?: string;
  value: string;
  onChange: (iconValue: string) => void;
  required?: boolean;
}

export function AdminIconPicker({
  label = "Category Navigational Icon",
  helperText = "Displayed in the Header 'All Departments' dropdown, MegaMenu, and category badges.",
  value,
  onChange,
  required,
}: AdminIconPickerProps) {
  const [activeTab, setActiveTab] = useState<"preset" | "custom">(
    value && (value.startsWith("http") || value.startsWith("data:image/") || value.startsWith("/"))
      ? "custom"
      : "preset"
  );
  const [searchFilter, setSearchFilter] = useState("");
  const [customUrlInput, setCustomUrlInput] = useState(
    value && (value.startsWith("http") || value.startsWith("data:image/") || value.startsWith("/"))
      ? value
      : ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter preset icons
  const filteredPresets = useMemo(() => {
    if (!searchFilter.trim()) return PRESET_CATEGORY_ICONS;
    const q = searchFilter.toLowerCase().trim();
    return PRESET_CATEGORY_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [searchFilter]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Icon file must be smaller than 2MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        setCustomUrlInput(result);
        onChange(result);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to read file.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomUrlApply = () => {
    if (customUrlInput.trim()) {
      onChange(customUrlInput.trim());
    }
  };

  const isCustomIcon =
    value && (value.startsWith("http") || value.startsWith("data:image/") || value.startsWith("/"));

  return (
    <div className="space-y-3">
      {/* Label and Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>{label}</span>
            {required && <span className="text-[#FF1028] font-bold">*</span>}
          </label>
          {helperText && (
            <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
          )}
        </div>

        {/* Current Icon Mini Preview */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-2xs">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Selected:</span>
          <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            <CategoryIcon icon={value || "FolderTree"} className="w-4 h-4 text-[#FF1028]" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
            {isCustomIcon ? "Custom Upload" : value || "None"}
          </span>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("preset")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer",
            activeTab === "preset"
              ? "bg-white dark:bg-slate-800 text-[#FF1028] shadow-xs font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Preset Premium Icons ({PRESET_CATEGORY_ICONS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer",
            activeTab === "custom"
              ? "bg-white dark:bg-slate-800 text-[#FF1028] shadow-xs font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Custom Icon / SVG</span>
        </button>
      </div>

      {/* Tab Content: Presets */}
      {activeTab === "preset" && (
        <div className="space-y-2.5 bg-slate-50/70 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search icon (e.g. phone, drone, car, wrench, watch, shirt)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#FF1028] text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Icons Visual Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-52 overflow-y-auto p-1 scrollbar-thin">
            {filteredPresets.map((iconName) => {
              const isSelected = value === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => onChange(iconName)}
                  title={iconName}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer relative group",
                    isSelected
                      ? "bg-[#FF1028]/10 border-2 border-[#FF1028] text-[#FF1028] shadow-xs scale-105"
                      : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-400 hover:scale-105"
                  )}
                >
                  <CategoryIcon
                    icon={iconName}
                    className={cn(
                      "w-5 h-5 transition-transform group-hover:scale-110",
                      isSelected ? "text-[#FF1028]" : "text-slate-600 dark:text-slate-300"
                    )}
                  />
                  <span className="text-[9px] font-mono font-medium truncate w-full text-center mt-1 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white">
                    {iconName}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF1028] text-white rounded-full flex items-center justify-center text-[8px]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {filteredPresets.length === 0 && (
            <div className="text-center py-4 text-xs text-slate-400">
              No preset icons match &quot;{searchFilter}&quot;
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Custom Upload / URL */}
      {activeTab === "custom" && (
        <div className="space-y-4 bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* Dropzone / Upload button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#FF1028] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-white dark:bg-slate-800/80 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,.png,.webp,.jpg,.jpeg,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-[#FF1028] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isUploading ? "Processing icon..." : "Click to upload custom Category Icon"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              SVG, PNG, WebP with transparent background recommended (Max 2MB)
            </p>
          </div>

          {/* Or enter Direct URL */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              Or paste Icon Image URL / Data URI:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://example.com/icons/drone-icon.svg"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#FF1028] text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleCustomUrlApply}
                className="px-4 py-2 bg-[#00143D] hover:bg-[#002366] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Live Preview in Header context */}
          {isCustomIcon && (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 overflow-hidden">
                  <CategoryIcon icon={value} className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Custom Icon Preview
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    ✓ Ready for Storefront Header &amp; Dropdown
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCustomUrlInput("");
                  onChange("FolderTree");
                  setActiveTab("preset");
                }}
                className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
