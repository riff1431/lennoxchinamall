"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Smartphone,
  Plane,
  Wrench,
  Home,
  Car,
  Compass,
  Package,
  Layers,
  Tag,
  Zap,
  Cpu,
  Boxes,
  Sparkles,
  Search,
  ExternalLink,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate, slugify } from "@/utils/helpers";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { Category } from "@/types/database";

type CategoryItem = Category & {
  iconName?: string;
  subcategories?: string[];
  product_count?: number;
};

const ICON_MAP: Record<string, React.ElementType> = {
  Smartphone,
  Plane,
  Wrench,
  Home,
  Car,
  Compass,
  Package,
  Layers,
  Tag,
  Zap,
  Cpu,
  Boxes,
  FolderTree,
};

const AVAILABLE_ICONS = [
  "Smartphone",
  "Plane",
  "Wrench",
  "Home",
  "Car",
  "Compass",
  "Package",
  "Layers",
  "Tag",
  "Zap",
  "Cpu",
  "Boxes",
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(MOCK_CATEGORIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState<string>("root");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("FolderTree");
  const [formPosition, setFormPosition] = useState(1);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDesc, setFormSeoDesc] = useState("");
  const [formSubcategories, setFormSubcategories] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormParentId("root");
    setFormDescription("");
    setFormIcon("FolderTree");
    setFormPosition(categories.length + 1);
    setFormImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80");
    setFormSeoTitle("");
    setFormSeoDesc("");
    setFormSubcategories("");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormParentId(cat.parent_id || "root");
    setFormDescription(cat.description || "");
    setFormIcon(cat.iconName || cat.icon || "FolderTree");
    setFormPosition(cat.position || 1);
    setFormImageUrl(cat.image_url || "");
    setFormSeoTitle(cat.seo_title || "");
    setFormSeoDesc(cat.seo_description || "");
    setFormSubcategories(cat.subcategories?.join(", ") || "");
    setFormIsActive(cat.is_active);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(slugify(val));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Category name is required.");
      return;
    }

    const subcats = formSubcategories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingCategory) {
      // Update existing
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName.trim(),
                slug: formSlug.trim() || slugify(formName),
                parent_id: formParentId === "root" ? null : formParentId,
                description: formDescription.trim() || null,
                icon: formIcon,
                iconName: formIcon,
                position: Number(formPosition) || 1,
                image_url: formImageUrl.trim() || null,
                seo_title: formSeoTitle.trim() || null,
                seo_description: formSeoDesc.trim() || null,
                subcategories: subcats,
                is_active: formIsActive,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      );
      showToast(`Category "${formName}" updated successfully.`);
    } else {
      // Create new
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        slug: formSlug.trim() || slugify(formName),
        parent_id: formParentId === "root" ? null : formParentId,
        description: formDescription.trim() || null,
        icon: formIcon,
        iconName: formIcon,
        position: Number(formPosition) || categories.length + 1,
        image_url: formImageUrl.trim() || null,
        seo_title: formSeoTitle.trim() || `${formName} - Lennox ChinaMall`,
        seo_description: formSeoDesc.trim() || formDescription.trim() || null,
        subcategories: subcats,
        product_count: 0,
        is_active: formIsActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCategories((prev) => [newCat, ...prev]);
      showToast(`Category "${formName}" created successfully.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteCategory = (cat: CategoryItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Category "${cat.name}"?`,
      description: `Are you sure you want to delete this category? Products currently assigned will become uncategorized.`,
      onConfirm: () => {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        showToast(`Category "${cat.name}" deleted.`);
      },
    });
  };

  // Metrics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.is_active).length;
  const rootCategories = categories.filter((c) => !c.parent_id).length;
  const totalProducts = categories.reduce((sum, c) => sum + (c.product_count || 0), 0);

  // Table Columns
  const columns: Column<CategoryItem>[] = [
    {
      header: "Category Name",
      accessorKey: "name",
      sortable: true,
      cell: (row) => {
        const IconComponent = ICON_MAP[row.iconName || row.icon || "FolderTree"] || FolderTree;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative group">
              {row.image_url ? (
                <Image
                  src={row.image_url}
                  alt={row.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <IconComponent className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs hover:text-red-400 transition-colors">
                  {row.name}
                </span>
                {!row.parent_id && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                    Root
                  </span>
                )}
              </div>
              {row.subcategories && row.subcategories.length > 0 && (
                <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                  {row.subcategories.length} sub-branches: {row.subcategories.slice(0, 2).join(", ")}
                  {row.subcategories.length > 2 && "..."}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Slug / Path",
      accessorKey: "slug",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800/80">
          /{row.slug}
        </span>
      ),
    },
    {
      header: "Parent Node",
      accessorKey: "parent_id",
      cell: (row) => {
        if (!row.parent_id) {
          return (
            <span className="text-[11px] font-medium text-slate-500 italic">
              — (Top Level)
            </span>
          );
        }
        const parent = categories.find((c) => c.id === row.parent_id);
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <FolderTree className="w-3.5 h-3.5 text-red-400 shrink-0" />
            {parent ? parent.name : row.parent_id}
          </span>
        );
      },
    },
    {
      header: "Products",
      accessorKey: "product_count",
      sortable: true,
      cell: (row) => (
        <span className="font-bold font-mono text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
          {row.product_count || 0} SKUs
        </span>
      ),
    },
    {
      header: "Position",
      accessorKey: "position",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-400 font-bold">
          #{row.position}
        </span>
      ),
    },
    {
      header: "Active Status",
      accessorKey: "is_active",
      sortable: true,
      cell: (row) => (
        <StatusBadge
          status={row.is_active ? "active" : "inactive"}
          tone={row.is_active ? "emerald" : "slate"}
          label={row.is_active ? "Active" : "Hidden"}
        />
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Edit Category"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCategory(row)}
            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-800/50 transition-colors"
            title="Delete Category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Filters
  const filters: FilterOption[] = [
    {
      key: "is_active",
      label: "Status",
      options: [
        { value: "all", label: "All Statuses" },
        { value: "true", label: "Active Only" },
        { value: "false", label: "Hidden / Inactive" },
      ],
    },
  ];

  // Bulk Actions
  const bulkActions: BulkAction<CategoryItem>[] = [
    {
      label: "Activate Selected",
      variant: "success",
      icon: CheckCircle2,
      onClick: (selectedRows) => {
        const ids = new Set(selectedRows.map((r) => r.id));
        setCategories((prev) =>
          prev.map((c) => (ids.has(c.id) ? { ...c, is_active: true } : c))
        );
        showToast(`Activated ${selectedRows.length} categories.`);
      },
    },
    {
      label: "Deactivate Selected",
      variant: "default",
      icon: XCircle,
      onClick: (selectedRows) => {
        const ids = new Set(selectedRows.map((r) => r.id));
        setCategories((prev) =>
          prev.map((c) => (ids.has(c.id) ? { ...c, is_active: false } : c))
        );
        showToast(`Deactivated ${selectedRows.length} categories.`);
      },
    },
    {
      label: "Delete Selected",
      variant: "danger",
      icon: Trash2,
      onClick: (selectedRows) => {
        setConfirmDialog({
          isOpen: true,
          title: `Delete ${selectedRows.length} Categories?`,
          description: `This action will remove the selected ${selectedRows.length} categories permanently.`,
          onConfirm: () => {
            const ids = new Set(selectedRows.map((r) => r.id));
            setCategories((prev) => prev.filter((c) => !ids.has(c.id)));
            showToast(`Deleted ${selectedRows.length} categories.`);
          },
        });
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header */}
      <AdminPageHeader
        title="Categories & Taxonomy"
        subtitle="Organize your direct-from-China catalogue hierarchy, navigation branches, icons, and SEO metadata."
        badge={{ text: "CATALOGUE TREE", variant: "emerald" }}
        breadcrumbs={[
          { label: "Catalogue", href: "/admin/products" },
          { label: "Categories" },
        ]}
        actions={[
          {
            label: "Add Category",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreateModal,
          },
        ]}
      />

      {/* 2. KPI Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Categories
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {totalCategories}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Displayed
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {activeCategories}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Root Branches
            </span>
            <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">
              {rootCategories}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Products Linked
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
              {totalProducts}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <AdminDataTable
        data={categories}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search categories by name, slug, description..."
        searchFields={["name", "slug", "description"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="position"
        defaultSortDirection="asc"
        emptyTitle="No categories found"
        emptyDescription="Create your first catalogue category to begin organizing products."
        emptyAction={{
          label: "Add Category",
          onClick: handleOpenCreateModal,
        }}
      />

      {/* 4. CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Row 1: Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Category Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Consumer Electronics"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Slug <span className="text-slate-500 text-[10px]">(URL segment)</span>
              </label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="e.g. consumer-electronics"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#FF1028] transition-colors"
                required
              />
            </div>
          </div>

          {/* Row 2: Parent Category & Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Parent Category
              </label>
              <select
                value={formParentId}
                onChange={(e) => setFormParentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              >
                <option value="root">None (Top-Level Root Category)</option>
                {categories
                  .filter((c) => !editingCategory || c.id !== editingCategory.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Category Icon
              </label>
              <select
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              >
                {AVAILABLE_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Position & Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Display Position
              </label>
              <input
                type="number"
                min="1"
                value={formPosition}
                onChange={(e) => setFormPosition(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#FF1028] transition-colors"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Cover Image URL
              </label>
              <input
                type="url"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Description
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Short category description for storefront and SEO..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2 outline-none focus:border-[#FF1028] transition-colors resize-none"
            />
          </div>

          {/* Subcategories */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Subcategory Tags <span className="text-slate-500 text-[10px]">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formSubcategories}
              onChange={(e) => setFormSubcategories(e.target.value)}
              placeholder="e.g. Audio & Headphones, Smartwatches, Action Cameras"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
            />
          </div>

          {/* SEO Meta Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              SEO & Metadata
            </span>
            <div className="space-y-2">
              <input
                type="text"
                value={formSeoTitle}
                onChange={(e) => setFormSeoTitle(e.target.value)}
                placeholder="SEO Title (e.g. Consumer Electronics - Direct Factory)"
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#FF1028]"
              />
              <textarea
                rows={2}
                value={formSeoDesc}
                onChange={(e) => setFormSeoDesc(e.target.value)}
                placeholder="SEO Meta Description (150-160 characters)..."
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#FF1028] resize-none"
              />
            </div>
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">Active Status</span>
              <span className="text-[11px] text-slate-400">
                Visible to customers in storefront navigation and search
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF1028]"></div>
            </label>
          </div>

          {/* Submit Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors shadow-lg shadow-red-950/50"
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel="Delete Category"
        variant="danger"
      />

      {/* 6. Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-400/40">
          <span>✓ {toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 ml-2"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
