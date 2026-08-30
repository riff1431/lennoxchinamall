"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Trash2,
  Layers,
  Tag,
  Eye,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Copy,
  Check,
  ArrowUp,
  ArrowDown,
  Edit2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Globe,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SlideOver } from "@/components/admin/SlideOver";
import {
  AdminInput,
  AdminSelect,
  AdminUploader,
  AdminTextarea,
  AdminFormSection,
  AdminIconPicker,
} from "@/components/admin/forms";
import { CategoryCardGrid } from "@/components/admin/categories/CategoryCardGrid";
import { CategoryTreeView } from "@/components/admin/categories/CategoryTreeView";
import { CategoryTagInput } from "@/components/admin/categories/CategoryTagInput";
import { CategoryAvatar } from "@/components/admin/categories/CategoryAvatar";
import { useAdminToast } from "@/hooks/useAdminToast";
import { slugify, cn } from "@/utils/helpers";
import { Category } from "@/types/database";
import { useCategoryStore } from "@/store/useCategoryStore";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

type ViewMode = "table" | "grid" | "tree";
type FilterPreset = "all" | "active" | "root" | "subcategories";

export default function AdminCategoriesPage() {
  const toast = useAdminToast();
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults,
  } = useCategoryStore();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [activeFilterPreset, setActiveFilterPreset] = useState<FilterPreset>("all");
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [slideOverTab, setSlideOverTab] = useState<"general" | "visuals" | "subcategories" | "seo">("general");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [autoSlugSync, setAutoSlugSync] = useState(true);
  const [copiedSlugId, setCopiedSlugId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState<string>("root");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("FolderTree");
  const [formPosition, setFormPosition] = useState(1);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formThumbnailImages, setFormThumbnailImages] = useState<string[]>([]);
  const [formBgColor, setFormBgColor] = useState("#EBF4FB");
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDesc, setFormSeoDesc] = useState("");
  const [formSubcategories, setFormSubcategories] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);

  // Handlers
  const handleOpenCreate = (parentId: string = "root") => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setAutoSlugSync(true);
    setFormParentId(parentId);
    setFormDescription("");
    setFormIcon("FolderTree");
    setFormPosition(categories.length + 1);
    setFormImages([]);
    setFormThumbnailImages([]);
    setFormBgColor("#EBF4FB");
    setFormSeoTitle("");
    setFormSeoDesc("");
    setFormSubcategories([]);
    setFormIsActive(true);
    setSlideOverTab("general");
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setAutoSlugSync(false);
    setFormParentId(cat.parent_id || "root");
    setFormDescription(cat.description || "");
    setFormIcon(cat.icon || cat.iconName || "FolderTree");
    setFormPosition(cat.position || 1);
    setFormImages(cat.image_url ? [cat.image_url] : []);
    setFormThumbnailImages(cat.thumbnail_url ? [cat.thumbnail_url] : cat.image_url ? [cat.image_url] : []);
    setFormBgColor(cat.bg_color || "#EBF4FB");
    setFormSeoTitle(cat.seo_title || "");
    setFormSeoDesc(cat.seo_description || "");
    setFormSubcategories(cat.subcategories || []);
    setFormIsActive(cat.is_active);
    setSlideOverTab("general");
    setIsSlideOverOpen(true);
  };

  const handleDuplicate = (cat: Category) => {
    const newSlug = `${cat.slug}-copy-${Date.now().toString().slice(-4)}`;
    const duplicateCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      name: `${cat.name} (Copy)`,
      slug: newSlug,
      position: categories.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addCategory(duplicateCat);
    toast.success(`Duplicated category "${cat.name}".`);
  };

  const handleToggleStatus = (cat: Category) => {
    const updatedStatus = !cat.is_active;
    updateCategory(cat.id, { is_active: updatedStatus });
    toast.success(
      `Category "${cat.name}" is now ${updatedStatus ? "Active" : "Draft / Hidden"}.`
    );
  };

  const handleMovePriority = (cat: Category, direction: "up" | "down") => {
    const currentPos = cat.position || 1;
    const targetPos = direction === "up" ? Math.max(1, currentPos - 1) : currentPos + 1;
    updateCategory(cat.id, { position: targetPos });
    toast.info(`Updated priority for "${cat.name}" to #${targetPos}`);
  };

  const handleCopySlug = (cat: Category) => {
    navigator.clipboard.writeText(`/${cat.slug}`);
    setCopiedSlugId(cat.id);
    toast.info(`Copied "/${cat.slug}" to clipboard`);
    setTimeout(() => setCopiedSlugId(null), 2000);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (autoSlugSync || !editingCategory) {
      setFormSlug(slugify(val));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.warning("Category name is required.");
      return;
    }

    const imageUrl = formImages[0] || null;
    const thumbnailUrl = formThumbnailImages[0] || imageUrl || null;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formName.trim(),
        slug: formSlug.trim() || slugify(formName),
        parent_id: formParentId === "root" ? null : formParentId,
        description: formDescription.trim() || null,
        icon: formIcon,
        iconName: formIcon,
        position: Number(formPosition) || 1,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        bg_color: formBgColor,
        seo_title: formSeoTitle.trim() || `${formName.trim()} - Lennox ChinaMall`,
        seo_description: formSeoDesc.trim() || formDescription.trim() || null,
        subcategories: formSubcategories,
        is_active: formIsActive,
      });
      toast.success(`Category "${formName}" updated successfully.`);
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        slug: formSlug.trim() || slugify(formName),
        parent_id: formParentId === "root" ? null : formParentId,
        description: formDescription.trim() || null,
        icon: formIcon,
        iconName: formIcon,
        position: Number(formPosition) || categories.length + 1,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        bg_color: formBgColor,
        seo_title: formSeoTitle.trim() || `${formName.trim()} - Lennox ChinaMall`,
        seo_description: formSeoDesc.trim() || formDescription.trim() || null,
        subcategories: formSubcategories,
        product_count: 0,
        is_active: formIsActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addCategory(newCat);
      toast.success(`Category "${formName}" created successfully.`);
    }

    setIsSlideOverOpen(false);
  };

  const handleDeleteCategory = (cat: Category) => {
    deleteCategory(cat.id);
    toast.success(`Category "${cat.name}" deleted.`);
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all categories to default Lennox ChinaMall taxonomy?")) {
      resetToDefaults();
      toast.success("Categories restored to defaults.");
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Name",
      "Slug",
      "Parent ID",
      "Position",
      "Status",
      "Subcategories Count",
      "Subcategories List",
      "Icon",
      "Background Color",
      "Created At",
    ];

    const rows = categories.map((cat) => [
      cat.id,
      `"${cat.name.replace(/"/g, '""')}"`,
      cat.slug,
      cat.parent_id || "ROOT",
      cat.position || 1,
      cat.is_active ? "ACTIVE" : "INACTIVE",
      cat.subcategories?.length || 0,
      `"${(cat.subcategories || []).join(", ").replace(/"/g, '""')}"`,
      cat.icon || cat.iconName || "FolderTree",
      cat.bg_color || "#EBF4FB",
      cat.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `lennox_categories_taxonomy_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Category taxonomy exported to CSV.");
  };

  // Filtered dataset based on quick KPI preset
  const displayedCategories = useMemo(() => {
    if (activeFilterPreset === "active") {
      return categories.filter((c) => c.is_active);
    }
    if (activeFilterPreset === "root") {
      return categories.filter((c) => !c.parent_id);
    }
    if (activeFilterPreset === "subcategories") {
      return categories.filter((c) => !!c.parent_id || (c.subcategories && c.subcategories.length > 0));
    }
    return categories;
  }, [categories, activeFilterPreset]);

  // Metrics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.is_active).length;
  const rootCategories = categories.filter((c) => !c.parent_id).length;
  const totalSubcategoriesCount = categories.reduce(
    (acc, curr) => acc + (curr.subcategories?.length || 0),
    0
  );

  // Table Columns
  const columns: Column<Category>[] = [
    {
      header: "Category & Storefront Avatar",
      accessorKey: "name",
      sortable: true,
      cell: (row) => {
        const bg = row.bg_color || "#EBF4FB";
        const thumb = row.thumbnail_url || row.image_url;

        return (
          <div className="flex items-center gap-3">
            <CategoryAvatar
              name={row.name}
              thumbnailUrl={row.thumbnail_url}
              imageUrl={row.image_url}
              icon={row.icon}
              iconName={row.iconName}
              bgColor={row.bg_color}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-xs font-heading">
                  {row.name}
                </span>
                {!row.parent_id ? (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2F65F6] border border-blue-200/60 dark:border-blue-900/40 font-mono">
                    Root
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40 font-mono">
                    Child
                  </span>
                )}
              </div>
              {row.subcategories && row.subcategories.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                  <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>
                    {row.subcategories.length} branches: {row.subcategories.slice(0, 2).join(", ")}
                    {row.subcategories.length > 2 && "..."}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Cover Banner",
      accessorKey: "image_url",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.image_url ? (
            <div className="w-14 h-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 shadow-2xs">
              <Image
                src={row.image_url}
                alt={row.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">No banner</span>
          )}
        </div>
      ),
    },
    {
      header: "Slug / Route",
      accessorKey: "slug",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
            /{row.slug}
          </span>
          <button
            type="button"
            onClick={() => handleCopySlug(row)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copy path"
          >
            {copiedSlugId === row.id ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ),
    },
    {
      header: "Parent Node",
      accessorKey: "parent_id",
      cell: (row) => {
        if (!row.parent_id) {
          return <span className="text-[11px] text-slate-400 italic">— (Top Department)</span>;
        }
        const parent = categories.find((c) => c.id === row.parent_id);
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <FolderTree className="w-3.5 h-3.5 text-[#2F65F6] shrink-0" />
            <span>{parent ? parent.name : row.parent_id}</span>
          </span>
        );
      },
    },
    {
      header: "Order Priority",
      accessorKey: "position",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">
            #{row.position || 1}
          </span>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleMovePriority(row, "up")}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Move Up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleMovePriority(row, "down")}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Move Down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      header: "Live Status",
      accessorKey: "is_active",
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(row)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border",
            row.is_active
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/40"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
          )}
          title={row.is_active ? "Click to deactivate" : "Click to activate"}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              row.is_active ? "bg-emerald-500" : "bg-slate-400"
            )}
          />
          <span>{row.is_active ? "Active" : "Draft"}</span>
        </button>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-24",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-[#2F65F6] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
            title="Edit Category"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <AdminActionMenu
            itemTitle={`category "${row.name}"`}
            onView={() => window.open(`/categories/${row.slug}`, "_blank")}
            onEdit={() => handleOpenEdit(row)}
            onDelete={() => handleDeleteCategory(row)}
            customActions={[
              {
                label: "Clone Category",
                icon: Copy,
                onClick: () => handleDuplicate(row),
              },
              {
                label: "Storefront View",
                icon: ExternalLink,
                onClick: () => window.open(`/categories/${row.slug}`, "_blank"),
              },
              {
                label: row.is_active ? "Deactivate" : "Activate",
                icon: CheckCircle2,
                onClick: () => handleToggleStatus(row),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: "is_active",
      label: "Status",
      options: [
        { value: "true", label: "Active Only" },
        { value: "false", label: "Hidden / Draft" },
      ],
    },
  ];

  const bulkActions: BulkAction<Category>[] = [
    {
      label: "Bulk Activate",
      icon: CheckCircle2,
      variant: "success",
      requiresConfirmation: true,
      confirmTitle: "Activate Selected Categories",
      confirmMessage: "Set all selected categories to Active on the storefront?",
      onClick: (selected) => {
        selected.forEach((s) => updateCategory(s.id, { is_active: true }));
        toast.success(`Activated ${selected.length} categories.`);
      },
    },
    {
      label: "Bulk Deactivate",
      icon: Eye,
      variant: "default",
      requiresConfirmation: true,
      confirmTitle: "Deactivate Selected Categories",
      confirmMessage: "Hide all selected categories from the storefront?",
      onClick: (selected) => {
        selected.forEach((s) => updateCategory(s.id, { is_active: false }));
        toast.success(`Set ${selected.length} categories to Draft.`);
      },
    },
    {
      label: "Bulk Delete",
      icon: Trash2,
      variant: "danger",
      requiresConfirmation: true,
      confirmTitle: "Bulk Delete Categories",
      confirmMessage: "Are you sure you want to delete the selected categories?",
      onClick: (selected) => {
        selected.forEach((s) => deleteCategory(s.id));
        toast.success(`Deleted ${selected.length} categories.`);
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 font-montserrat animate-in fade-in duration-200">
      {/* ── 1. Page Header (Clean & Streamlined) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
              Department Taxonomy & Hierarchy
            </h1>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2F65F6] border border-blue-200 dark:border-blue-900/40">
              {totalCategories} Nodes
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Manage storefront department categories, dynamic navigational icons (SVG / preset), parent trees, and banners.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Export categories to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Restore default taxonomy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreate("root")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#FF1028] hover:bg-[#E00B20] text-white transition-all shadow-xs cursor-pointer font-heading uppercase tracking-wide"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </div>
      </div>

      {/* ── 2. Top Metric KPI Summary Cards (Interactive Filter Cards) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Nodes */}
        <div
          onClick={() => setActiveFilterPreset("all")}
          className={cn(
            "p-4 rounded-2xl flex items-center justify-between shadow-2xs cursor-pointer transition-all duration-150 border",
            activeFilterPreset === "all"
              ? "bg-[#EEF4FF] dark:bg-[#172033] border-[#2F65F6] ring-2 ring-[#2F65F6]/20"
              : "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
          )}
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Total Categories
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {totalCategories}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        {/* Live & Active */}
        <div
          onClick={() => setActiveFilterPreset(activeFilterPreset === "active" ? "all" : "active")}
          className={cn(
            "p-4 rounded-2xl flex items-center justify-between shadow-2xs cursor-pointer transition-all duration-150 border",
            activeFilterPreset === "active"
              ? "bg-[#F0FDF4] dark:bg-[#162720] border-emerald-500 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
          )}
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Live &amp; Active
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {activeCategories}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        {/* Header Root Departments */}
        <div
          onClick={() => setActiveFilterPreset(activeFilterPreset === "root" ? "all" : "root")}
          className={cn(
            "p-4 rounded-2xl flex items-center justify-between shadow-2xs cursor-pointer transition-all duration-150 border",
            activeFilterPreset === "root"
              ? "bg-[#FFF8EE] dark:bg-[#2A2117] border-amber-500 ring-2 ring-amber-500/20"
              : "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
          )}
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Root Departments
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {rootCategories}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Subcategories Count */}
        <div
          onClick={() => setActiveFilterPreset(activeFilterPreset === "subcategories" ? "all" : "subcategories")}
          className={cn(
            "p-4 rounded-2xl flex items-center justify-between shadow-2xs cursor-pointer transition-all duration-150 border",
            activeFilterPreset === "subcategories"
              ? "bg-[#FAF5FF] dark:bg-[#23182E] border-purple-500 ring-2 ring-purple-500/20"
              : "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
          )}
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Sub-Branches &amp; Tags
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {totalSubcategoriesCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. View Mode Switcher Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs font-bold w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-heading",
              viewMode === "table"
                ? "bg-white dark:bg-slate-800 text-[#2F65F6] shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            )}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-heading",
              viewMode === "grid"
                ? "bg-white dark:bg-slate-800 text-[#2F65F6] shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Card Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("tree")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-heading",
              viewMode === "tree"
                ? "bg-white dark:bg-slate-800 text-[#2F65F6] shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            )}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Tree Hierarchy</span>
          </button>
        </div>

        {/* Right: Active Preset Indicator */}
        {activeFilterPreset !== "all" && (
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Filtering by:{" "}
              <strong className="text-slate-900 dark:text-white font-mono uppercase">
                {activeFilterPreset}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setActiveFilterPreset("all")}
              className="text-xs font-bold text-[#2F65F6] hover:underline cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* ── 4. Main Views ── */}
      {viewMode === "table" && (
        <AdminDataTable<Category>
          data={displayedCategories}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search categories by name, slug, or subcategories..."
          searchFields={["name", "slug"]}
          filters={filterOptions}
          bulkActions={bulkActions}
          defaultSortKey="position"
          defaultSortDirection="asc"
          onExportCsv={handleExportCsv}
          emptyTitle="No categories found"
          emptyDescription="Create your first department category to organize products."
          emptyAction={{
            label: "Add Category",
            onClick: () => handleOpenCreate("root"),
          }}
        />
      )}

      {viewMode === "grid" && (
        <CategoryCardGrid
          categories={displayedCategories}
          allCategories={categories}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteCategory}
          onDuplicate={handleDuplicate}
          onToggleStatus={handleToggleStatus}
          onMovePriority={handleMovePriority}
          onAddSubcategory={(cat) => handleOpenCreate(cat.id)}
        />
      )}

      {viewMode === "tree" && (
        <CategoryTreeView
          categories={displayedCategories}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteCategory}
          onDuplicate={handleDuplicate}
          onToggleStatus={handleToggleStatus}
          onMovePriority={handleMovePriority}
          onCreateChild={(parentCat) => handleOpenCreate(parentCat.id)}
        />
      )}

      {/* ── 5. Slide-Over Panel: Category Creator / Editor ── */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={editingCategory ? `Edit: ${editingCategory.name}` : "Create Category Node"}
        description="Configure taxonomy names, parent relationships, storefront navigational icons, pastel tint, and SEO."
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setIsSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs font-heading uppercase"
              >
                {editingCategory ? "Save Category Changes" : "Create Category Node"}
              </button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-6">
          {/* Drawer Navigation Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSlideOverTab("general")}
              className={cn(
                "flex-1 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer font-heading text-center",
                slideOverTab === "general"
                  ? "bg-white dark:bg-slate-800 text-[#2F65F6] shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              1. General Details
            </button>
            <button
              type="button"
              onClick={() => setSlideOverTab("visuals")}
              className={cn(
                "flex-1 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer font-heading text-center",
                slideOverTab === "visuals"
                  ? "bg-white dark:bg-slate-800 text-[#2F65F6] shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              2. Visuals &amp; Branding
            </button>
            <button
              type="button"
              onClick={() => setSlideOverTab("subcategories")}
              className={cn(
                "flex-1 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer font-heading text-center",
                slideOverTab === "subcategories"
                  ? "bg-white dark:bg-slate-800 text-[#2F65F6] shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              3. Subcategories ({formSubcategories.length})
            </button>
            <button
              type="button"
              onClick={() => setSlideOverTab("seo")}
              className={cn(
                "flex-1 py-1.5 px-2.5 rounded-lg transition-all cursor-pointer font-heading text-center",
                slideOverTab === "seo"
                  ? "bg-white dark:bg-slate-800 text-[#2F65F6] shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              4. SEO &amp; Meta
            </button>
          </div>

          {/* TAB 1: General Details */}
          {slideOverTab === "general" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <AdminFormSection title="Category Node Details">
                <AdminInput
                  label="Category Name"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Drones & Aerial Tech"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <AdminInput
                      label="URL Route Slug"
                      required
                      value={formSlug}
                      onChange={(e) => {
                        setFormSlug(e.target.value);
                        setAutoSlugSync(false);
                      }}
                      placeholder="drones-aerial-tech"
                    />
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={autoSlugSync}
                        onChange={(e) => {
                          setAutoSlugSync(e.target.checked);
                          if (e.target.checked) setFormSlug(slugify(formName));
                        }}
                        className="w-3.5 h-3.5 rounded text-[#2F65F6]"
                      />
                      <span className="text-[11px] text-slate-500">Auto-sync with name</span>
                    </label>
                  </div>

                  <AdminSelect
                    label="Parent Hierarchy Node"
                    value={formParentId}
                    onChange={(e) => setFormParentId(e.target.value)}
                    options={[
                      { value: "root", label: "Root Level (Primary Department)" },
                      ...categories
                        .filter((c) => !editingCategory || c.id !== editingCategory.id)
                        .map((c) => ({ value: c.id, label: `└─ ${c.name}` })),
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminInput
                    label="Sort Order Priority"
                    type="number"
                    min={1}
                    value={formPosition}
                    onChange={(e) => setFormPosition(Number(e.target.value))}
                    helperText="Determines position in Header 'All Departments' dropdown (1 = Top)."
                  />

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Storefront Visibility Status
                    </label>
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="w-4 h-4 rounded text-[#2F65F6] focus:ring-[#2F65F6] cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Category is Active &amp; Visible on Storefront
                      </span>
                    </label>
                  </div>
                </div>

                <AdminTextarea
                  label="Category Description"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Factory direct hardware, accessories and spare parts with expedited air cargo delivery."
                />
              </AdminFormSection>
            </div>
          )}

          {/* TAB 2: Visuals & Branding */}
          {slideOverTab === "visuals" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Homepage Category Circular Avatar & Pastel Tint */}
              <AdminFormSection title="Homepage Circular Avatar & Pastel Tint">
                <div className="space-y-4">
                  <AdminUploader
                    label="Category Circle Thumbnail Image"
                    values={formThumbnailImages}
                    onChange={setFormThumbnailImages}
                    maxFiles={1}
                    helperText="Product cutout or icon image displayed inside the homepage circular category avatar (e.g. 300x300 PNG/WebP)."
                  />

                  {/* Pastel Tint Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Circular Badge Background Pastel Tint
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { hex: "#EBF4FB", label: "Ice Blue" },
                        { hex: "#FDF0EB", label: "Peach" },
                        { hex: "#FBEBF4", label: "Soft Pink" },
                        { hex: "#EBFBF2", label: "Mint Green" },
                        { hex: "#EBF9FB", label: "Cyan" },
                        { hex: "#F4FBEB", label: "Lime" },
                        { hex: "#FBEBEB", label: "Soft Rose" },
                        { hex: "#EEF2FF", label: "Lavender" },
                        { hex: "#FEF3C7", label: "Amber" },
                        { hex: "#E0F2FE", label: "Sky Blue" },
                      ].map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setFormBgColor(color.hex)}
                          className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer shadow-2xs ${
                            formBgColor === color.hex
                              ? "border-[#FF1028] scale-110 shadow-xs"
                              : "border-slate-300 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.label}
                        />
                      ))}
                      <input
                        type="color"
                        value={formBgColor}
                        onChange={(e) => setFormBgColor(e.target.value)}
                        className="w-7 h-7 rounded-full border border-slate-300 cursor-pointer overflow-hidden p-0"
                        title="Custom color"
                      />
                      <span className="font-mono text-xs text-slate-500 font-bold ml-1">
                        {formBgColor}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Surface Live Mockup Preview */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Multi-Surface Live Mockup Preview
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      {/* Surface 1: Homepage Pill */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center shadow-2xs">
                        <span className="text-[9px] font-mono uppercase text-slate-400 mb-2">
                          Homepage Avatar
                        </span>
                        <CategoryAvatar
                          name={formName || "Preview"}
                          thumbnailUrl={formThumbnailImages[0]}
                          imageUrl={formImages[0]}
                          icon={formIcon}
                          bgColor={formBgColor}
                          size="xl"
                        />
                        <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px] font-heading">
                          {formName || "Category Name"}
                        </span>
                      </div>

                      {/* Surface 2: Header MegaMenu Row */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center shadow-2xs">
                        <span className="text-[9px] font-mono uppercase text-slate-400 mb-2">
                          Header MegaMenu Row
                        </span>
                        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <CategoryIcon icon={formIcon} name={formName} className="w-4 h-4 text-[#FF1028]" />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                              {formName || "Category Name"}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              /{formSlug || "slug"}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AdminFormSection>

              {/* Category Navigational Icon */}
              <AdminFormSection title="Category Navigational Icon">
                <AdminIconPicker
                  label="Category Navigational Icon"
                  helperText="Displayed next to category in Header 'All Departments' dropdown, MegaMenu, and search tags."
                  value={formIcon}
                  onChange={setFormIcon}
                  required
                />
              </AdminFormSection>

              {/* Category Landing Banner */}
              <AdminFormSection title="Category Landing Cover Banner">
                <AdminUploader
                  label="Category Cover Banner Image"
                  values={formImages}
                  onChange={setFormImages}
                  maxFiles={1}
                  helperText="High-resolution banner (1200x400) displayed on the Category landing page."
                />
              </AdminFormSection>
            </div>
          )}

          {/* TAB 3: Subcategories Tag Manager */}
          {slideOverTab === "subcategories" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <AdminFormSection title="Subcategories & Navigation Branches">
                <CategoryTagInput
                  tags={formSubcategories}
                  onChange={setFormSubcategories}
                  helperText="Creates searchable branch tags for storefront navigation pills, mega menu dropdowns, and filters."
                />
              </AdminFormSection>
            </div>
          )}

          {/* TAB 4: SEO & Search Engine Optimization */}
          {slideOverTab === "seo" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <AdminFormSection title="SEO & Search Visibility">
                <div className="space-y-1">
                  <AdminInput
                    label="SEO Title Tag"
                    placeholder="Buy Drones & Aerial Tech Online | Lennox ChinaMall"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 px-1">
                    <span>Recommended: 50-60 characters</span>
                    <span className="font-mono">{formSeoTitle.length}/60</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <AdminTextarea
                    label="SEO Meta Description"
                    rows={3}
                    placeholder="Explore high performance FPV drones directly from verified factory suppliers with express air cargo..."
                    value={formSeoDesc}
                    onChange={(e) => setFormSeoDesc(e.target.value)}
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 px-1">
                    <span>Recommended: 120-160 characters</span>
                    <span className="font-mono">{formSeoDesc.length}/160</span>
                  </div>
                </div>

                {/* Google SERP Card Preview */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Google Search Result Snippet Preview</span>
                  </span>
                  <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="text-[11px] text-slate-500 font-sans truncate">
                      https://lennoxchinamall.com › categories › {formSlug || "category-slug"}
                    </div>
                    <div className="text-sm font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate">
                      {formSeoTitle || `${formName || "Category Name"} - Lennox ChinaMall`}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {formSeoDesc || formDescription || "Direct China factory sourcing with expedited air shipping and USDT escrow."}
                    </div>
                  </div>
                </div>
              </AdminFormSection>
            </div>
          )}
        </form>
      </SlideOver>
    </div>
  );
}
