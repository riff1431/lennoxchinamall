"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Trash2,
  Layers,
  Tag,
  Eye,
  RotateCcw,
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
import { useAdminToast } from "@/hooks/useAdminToast";
import { slugify } from "@/utils/helpers";
import { Category } from "@/types/database";
import { useCategoryStore } from "@/store/useCategoryStore";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export default function AdminCategoriesPage() {
  const toast = useAdminToast();
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults,
  } = useCategoryStore();

  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
  const [formSubcategories, setFormSubcategories] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormParentId("root");
    setFormDescription("");
    setFormIcon("FolderTree");
    setFormPosition(categories.length + 1);
    setFormImages([]);
    setFormThumbnailImages([]);
    setFormBgColor("#EBF4FB");
    setFormSeoTitle("");
    setFormSeoDesc("");
    setFormSubcategories("");
    setFormIsActive(true);
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormParentId(cat.parent_id || "root");
    setFormDescription(cat.description || "");
    setFormIcon(cat.icon || cat.iconName || "FolderTree");
    setFormPosition(cat.position || 1);
    setFormImages(cat.image_url ? [cat.image_url] : []);
    setFormThumbnailImages(cat.thumbnail_url ? [cat.thumbnail_url] : cat.image_url ? [cat.image_url] : []);
    setFormBgColor(cat.bg_color || "#EBF4FB");
    setFormSeoTitle(cat.seo_title || "");
    setFormSeoDesc(cat.seo_description || "");
    setFormSubcategories(cat.subcategories?.join(", ") || "");
    setFormIsActive(cat.is_active);
    setIsSlideOverOpen(true);
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
      toast.warning("Category name is required.");
      return;
    }

    const subcats = formSubcategories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

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
        seo_title: formSeoTitle.trim() || null,
        seo_description: formSeoDesc.trim() || null,
        subcategories: subcats,
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
        seo_title: formSeoTitle.trim() || `${formName} - Lennox ChinaMall`,
        seo_description: formSeoDesc.trim() || formDescription.trim() || null,
        subcategories: subcats,
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

  // Metrics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.is_active).length;
  const rootCategories = categories.filter((c) => !c.parent_id).length;

  // Table Columns
  const columns: Column<Category>[] = [
    {
      header: "Category & Circle Avatar",
      accessorKey: "name",
      sortable: true,
      cell: (row) => {
        const bg = row.bg_color || "#EBF4FB";
        const thumb = row.thumbnail_url || row.image_url;

        return (
          <div className="flex items-center gap-3">
            {/* Storefront Circular Avatar Thumbnail */}
            <div
              style={{ backgroundColor: bg }}
              className="w-11 h-11 rounded-full border border-black/5 flex items-center justify-center shrink-0 p-1.5 shadow-2xs relative overflow-hidden"
            >
              {thumb ? (
                <div className="relative w-full h-full">
                  <Image
                    src={thumb}
                    alt={row.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <CategoryIcon
                  icon={row.icon || row.iconName || "FolderTree"}
                  name={row.name}
                  className="w-5 h-5 text-[#FF1028]"
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-xs font-heading">
                  {row.name}
                </span>
                {!row.parent_id && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
                    Root
                  </span>
                )}
              </div>
              {row.subcategories && row.subcategories.length > 0 && (
                <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                  {row.subcategories.length} branches: {row.subcategories.slice(0, 2).join(", ")}
                  {row.subcategories.length > 2 && "..."}
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
            <div className="w-12 h-7 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100">
              <Image
                src={row.image_url}
                alt={row.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 italic">No banner</span>
          )}
        </div>
      ),
    },
    {
      header: "Slug / Path",
      accessorKey: "slug",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
          /{row.slug}
        </span>
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
            <FolderTree className="w-3.5 h-3.5 text-[#FF1028] shrink-0" />
            {parent ? parent.name : row.parent_id}
          </span>
        );
      },
    },
    {
      header: "Order Priority",
      accessorKey: "position",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500 font-bold">
          #{row.position || 1}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: (row) => (
        <StatusBadge
          status={row.is_active ? "active" : "inactive"}
          tone={row.is_active ? "emerald" : "slate"}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right w-20",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end">
          <AdminActionMenu
            itemTitle={`category "${row.name}"`}
            onView={() => window.open(`/categories/${row.slug}`, "_blank")}
            onEdit={() => handleOpenEdit(row)}
            onDelete={() => handleDeleteCategory(row)}
            customActions={[
              {
                label: "Storefront View",
                icon: Eye,
                onClick: () => window.open(`/categories/${row.slug}`, "_blank"),
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Department Taxonomy & Icons"
        subtitle="Manage storefront department categories, dynamic navigational icons (SVG / preset), parent trees, and banners."
        badge={{ text: `${totalCategories} Categories`, variant: "blue" }}
        breadcrumbs={[
          { label: "Catalogue & Inventory", href: "/admin/products" },
          { label: "Categories" },
        ]}
        actions={[
          {
            label: "Reset Defaults",
            icon: RotateCcw,
            variant: "outline",
            onClick: handleResetDefaults,
          },
          {
            label: "Create Category",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreate,
          },
        ]}
      />

      {/* ── 2. Top Metric KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total Department Nodes</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {totalCategories}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Live &amp; Active</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {activeCategories}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Header All Departments</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {rootCategories}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Reusable AdminDataTable ── */}
      <AdminDataTable<Category>
        data={categories}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search categories by name or slug..."
        searchFields={["name", "slug"]}
        filters={filterOptions}
        bulkActions={bulkActions}
        defaultSortKey="position"
        defaultSortDirection="asc"
        emptyTitle="No categories found"
        emptyDescription="Create your first department category to organize products."
        emptyAction={{
          label: "Add Category",
          onClick: handleOpenCreate,
        }}
      />

      {/* ── 4. Slide-Over Panel: Category Creator / Editor ── */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={editingCategory ? `Edit: ${editingCategory.name}` : "Create New Category Node"}
        description="Configure taxonomy names, parent relationships, storefront navigational icons, and SEO metadata."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs font-heading uppercase"
            >
              {editingCategory ? "Save Category Changes" : "Create Category Node"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-6">
          <AdminFormSection title="Category Node Details">
            <AdminInput
              label="Category Name"
              required
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Drones &amp; Aerial Tech"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="URL Slug"
                required
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="drones-aerial-tech"
              />

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

            <AdminInput
              label="Sort Order Priority"
              type="number"
              min={1}
              value={formPosition}
              onChange={(e) => setFormPosition(Number(e.target.value))}
              helperText="Determines position in Header 'All Departments' dropdown (1 = Top)."
            />

            <AdminInput
              label="Subcategories / Tags (Comma-separated)"
              placeholder="FPV Drones, Quadcopters, 4K Cameras, Drone Batteries"
              value={formSubcategories}
              onChange={(e) => setFormSubcategories(e.target.value)}
              helperText="Creates searchable branch tags for storefront navigation pills and mega menu."
            />
          </AdminFormSection>

          {/* ── 1. Homepage Category Circular Thumbnail & Background Color ── */}
          <AdminFormSection title="Homepage Category Circular Avatar & Pastel Tint">
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

              {/* Live Preview Card */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Storefront Homepage Live Preview
                </span>
                <div className="flex flex-col items-center">
                  <div
                    style={{ backgroundColor: formBgColor }}
                    className="w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden shadow-2xs border border-black/[0.04] transition-all"
                  >
                    {formThumbnailImages[0] ? (
                      <div className="relative w-full h-full p-2">
                        <Image
                          src={formThumbnailImages[0]}
                          alt={formName || "Preview"}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <CategoryIcon
                        icon={formIcon}
                        name={formName}
                        className="w-8 h-8 text-slate-700"
                      />
                    )}
                  </div>
                  <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 text-center max-w-[100px] line-clamp-1 font-heading">
                    {formName || "Category Name"}
                  </span>
                </div>
              </div>
            </div>
          </AdminFormSection>

          {/* ── Category Navigational Icon (Dedicated for Header & Dropdowns) ── */}
          <AdminFormSection title="Category Navigational Icon">
            <AdminIconPicker
              label="Category Navigational Icon"
              helperText="This icon is displayed next to the category in the Header 'All Departments' dropdown, MegaMenu, and search tags. Choose a preset vector or upload custom SVG/PNG."
              value={formIcon}
              onChange={setFormIcon}
              required
            />
          </AdminFormSection>

          {/* ── Category Cover Banner Image (Dedicated for Landing Pages) ── */}
          <AdminFormSection title="Category Landing Banner">
            <AdminUploader
              label="Category Cover Banner Image (Optional)"
              values={formImages}
              onChange={setFormImages}
              maxFiles={1}
              helperText="High-resolution banner (1200x400) displayed on the Category landing page."
            />
          </AdminFormSection>

          <AdminFormSection title="SEO & Visibility">
            <AdminInput
              label="SEO Title Tag"
              placeholder="Buy Drones &amp; Aerial Tech Online | Lennox ChinaMall"
              value={formSeoTitle}
              onChange={(e) => setFormSeoTitle(e.target.value)}
            />
            <AdminTextarea
              label="SEO Meta Description"
              rows={3}
              placeholder="Explore high performance FPV drones directly from verified factory suppliers..."
              value={formSeoDesc}
              onChange={(e) => setFormSeoDesc(e.target.value)}
            />

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
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
          </AdminFormSection>
        </form>
      </SlideOver>
    </div>
  );
}
