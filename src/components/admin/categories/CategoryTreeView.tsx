"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FolderTree,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Layers,
  ArrowUp,
  ArrowDown,
  Check,
  FolderOpen,
  Folder,
} from "lucide-react";
import { Category } from "@/types/database";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CategoryAvatar } from "@/components/admin/categories/CategoryAvatar";
import { cn } from "@/utils/helpers";

interface CategoryTreeViewProps {
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onDuplicate: (cat: Category) => void;
  onToggleStatus: (cat: Category) => void;
  onMovePriority: (cat: Category, direction: "up" | "down") => void;
  onCreateChild: (parentCat: Category) => void;
}

export function CategoryTreeView({
  categories,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onMovePriority,
  onCreateChild,
}: CategoryTreeViewProps) {
  // Map parent to children
  const rootCategories = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const childMap = new Map<string, Category[]>();
  categories.forEach((cat) => {
    if (cat.parent_id) {
      const existing = childMap.get(cat.parent_id) || [];
      existing.push(cat);
      childMap.set(cat.parent_id, existing);
    }
  });

  // Track expanded state for parents
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    () => new Set(rootCategories.map((c) => c.id))
  );

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedNodes(new Set(categories.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderCategoryNode = (cat: Category, level: number = 0) => {
    const bg = cat.bg_color || "#EBF4FB";
    const thumb = cat.thumbnail_url || cat.image_url;
    const children = childMap.get(cat.id) || [];
    const subcats = cat.subcategories || [];
    const hasChildren = children.length > 0 || subcats.length > 0;
    const isExpanded = expandedNodes.has(cat.id);

    return (
      <div key={cat.id} className="space-y-2">
        {/* Node Card Row */}
        <div
          className={cn(
            "group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-150",
            cat.is_active
              ? "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
              : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-85",
            level > 0 && "ml-4 sm:ml-8 border-l-4 border-l-[#2F65F6]"
          )}
        >
          {/* Left: Expand toggle, Avatar, Name & Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Expand / Collapse Button */}
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(cat.id)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label={isExpanded ? "Collapse node" : "Expand node"}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                )}
              </button>
            ) : (
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
            )}

            <CategoryAvatar
              name={cat.name}
              thumbnailUrl={cat.thumbnail_url}
              imageUrl={cat.image_url}
              icon={cat.icon}
              iconName={cat.iconName}
              bgColor={cat.bg_color}
              size="md"
              className="group-hover:scale-105"
            />

            {/* Title & Metadata */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-black text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                  {cat.name}
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{cat.position || 1}
                </span>
                {!cat.parent_id ? (
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2F65F6] border border-blue-200 dark:border-blue-900/40">
                    Root Dept
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40">
                    Child Node
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5 flex-wrap">
                <span>/{cat.slug}</span>
                {subcats.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-slate-500 font-sans font-medium">
                      {subcats.length} sub-branches
                    </span>
                  </>
                )}
                {children.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-[#2F65F6] font-sans font-bold">
                      {children.length} nested child depts
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Status Toggle, Priority & Actions */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
            {/* Status switch */}
            <button
              type="button"
              onClick={() => onToggleStatus(cat)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                cat.is_active
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/40"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  cat.is_active ? "bg-emerald-500" : "bg-slate-400"
                )}
              />
              <span>{cat.is_active ? "Active" : "Draft"}</span>
            </button>

            {/* Priority Reordering Buttons */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onMovePriority(cat, "up")}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Move up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onMovePriority(cat, "down")}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Move down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add Child Node Button */}
            {!cat.parent_id && (
              <button
                type="button"
                onClick={() => onCreateChild(cat)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-[#2F65F6] hover:text-white text-[#2F65F6] dark:text-blue-400 text-xs font-bold transition-all cursor-pointer"
                title="Add Child Sub-Department"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Add Child</span>
              </button>
            )}

            {/* Storefront Link */}
            <a
              href={`/categories/${cat.slug}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Storefront View"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Edit */}
            <button
              type="button"
              onClick={() => onEdit(cat)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2F65F6] hover:text-white text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Edit Category"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Clone */}
            <button
              type="button"
              onClick={() => onDuplicate(cat)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Duplicate Category"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDelete(cat)}
              className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-500 hover:text-white text-rose-600 transition-colors cursor-pointer"
              title="Delete Category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nested Subcategories & Child Categories (Expanded) */}
        {isExpanded && (
          <div className="pl-6 sm:pl-10 space-y-2 border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 my-1.5">
            {/* Direct Subcategory Branch Pills */}
            {subcats.length > 0 && (
              <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                  <Layers className="w-3 h-3" />
                  <span>Sub-Branches:</span>
                </span>
                {subcats.map((sub, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            )}

            {/* Nested Child Categories */}
            {children.map((child) => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Expand/Collapse All and Hierarchy summary */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-[#2F65F6]" />
          <span className="text-xs font-bold text-slate-900 dark:text-white font-heading">
            Taxonomy Tree ({rootCategories.length} Primary Departments, {categories.length} Total Nodes)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Expand All</span>
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Nested Tree List */}
      <div className="space-y-3">
        {rootCategories.map((root) => renderCategoryNode(root, 0))}
      </div>
    </div>
  );
}
