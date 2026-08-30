"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FolderTree,
  Edit2,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Check,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Category } from "@/types/database";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CategoryAvatar } from "@/components/admin/categories/CategoryAvatar";
import { cn } from "@/utils/helpers";

interface CategoryCardGridProps {
  categories: Category[];
  allCategories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onDuplicate: (cat: Category) => void;
  onToggleStatus: (cat: Category) => void;
  onMovePriority: (cat: Category, direction: "up" | "down") => void;
  onAddSubcategory?: (parentCat: Category) => void;
}

export function CategoryCardGrid({
  categories,
  allCategories,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onMovePriority,
}: CategoryCardGridProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(`/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {categories.map((cat, idx) => {
        const bg = cat.bg_color || "#EBF4FB";
        const thumb = cat.thumbnail_url || cat.image_url;
        const parent = cat.parent_id
          ? allCategories.find((c) => c.id === cat.parent_id)
          : null;
        const subcats = cat.subcategories || [];

        return (
          <div
            key={cat.id}
            className={cn(
              "group relative flex flex-col justify-between rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md",
              cat.is_active
                ? "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                : "bg-slate-50/80 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 opacity-85"
            )}
          >
            {/* Top Cover Banner Preview / Accent Strip */}
            <div className="relative h-20 w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800/80">
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              ) : (
                <div
                  style={{ backgroundColor: bg }}
                  className="w-full h-full opacity-60 flex items-center justify-end pr-4"
                >
                  <FolderTree className="w-16 h-16 text-slate-300/40 dark:text-slate-700/40 -mr-2" />
                </div>
              )}

              {/* Order Priority Badge on Cover */}
              <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-tight shadow-xs">
                  #{cat.position || idx + 1}
                </span>
                {!cat.parent_id ? (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-mono font-black uppercase tracking-wider shadow-xs">
                    Root
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-lg bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-mono font-black uppercase tracking-wider shadow-xs truncate max-w-[100px]">
                    Sub
                  </span>
                )}
              </div>

              {/* Quick Storefront View Icon Button */}
              <a
                href={`/categories/${cat.slug}`}
                target="_blank"
                rel="noreferrer"
                className="absolute top-2.5 right-3 w-7 h-7 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-transform hover:scale-105 shadow-xs cursor-pointer"
                title="View on Storefront"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Main Content Area */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
              {/* Avatar & Title Row */}
              <div className="flex items-start gap-3.5 -mt-8 relative z-10">
                <CategoryAvatar
                  name={cat.name}
                  thumbnailUrl={cat.thumbnail_url}
                  imageUrl={cat.image_url}
                  icon={cat.icon}
                  iconName={cat.iconName}
                  bgColor={cat.bg_color}
                  size="lg"
                  className="border-2 border-white dark:border-[#111827] shadow-md group-hover:scale-105"
                />

                <div className="min-w-0 flex-1 pt-4">
                  <h3 className="font-heading font-black text-slate-900 dark:text-white text-sm leading-snug truncate">
                    {cat.name}
                  </h3>
                  {parent ? (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate">
                      <ChevronRight className="w-3 h-3 shrink-0 text-slate-400" />
                      <span className="truncate">Under {parent.name}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                      Primary Department
                    </span>
                  )}
                </div>
              </div>

              {/* Slug Pill & Quick Copy */}
              <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  /{cat.slug}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopySlug(cat.slug)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 cursor-pointer shrink-0 transition-colors"
                  title="Copy slug URL"
                >
                  {copiedSlug === cat.slug ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Subcategories Branch Pills */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>Subcategories</span>
                  </span>
                  <span>{subcats.length} tags</span>
                </div>
                {subcats.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                    {subcats.slice(0, 3).map((sub, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 truncate max-w-[130px]"
                      >
                        {sub}
                      </span>
                    ))}
                    {subcats.length > 3 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        +{subcats.length - 3} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    No branch tags defined
                  </span>
                )}
              </div>

              {/* Status Switch & Priority Reordering */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                {/* Instant Inline Toggle Switch */}
                <button
                  type="button"
                  onClick={() => onToggleStatus(cat)}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                    cat.is_active
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/40"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}
                  title={cat.is_active ? "Click to deactivate" : "Click to activate"}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      cat.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    )}
                  />
                  <span>{cat.is_active ? "Active" : "Draft"}</span>
                </button>

                {/* Priority Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMovePriority(cat, "up")}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="Move priority up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMovePriority(cat, "down")}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="Move priority down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onEdit(cat)}
                  className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2F65F6] hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  title="Edit Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(cat)}
                  className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  title="Duplicate Category"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Clone</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(cat)}
                  className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
