"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Trash2,
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
  Eye,
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
} from "@/components/admin/forms";
import { useAdminToast } from "@/hooks/useAdminToast";
import { slugify } from "@/utils/helpers";
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
  "FolderTree",
];

export default function AdminCategoriesPage() {
  const toast = useAdminToast();
  const [categories, setCategories] = useState<CategoryItem[]>(MOCK_CATEGORIES);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState<string>("root");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("FolderTree");
  const [formPosition, setFormPosition] = useState(1);
  const [formImages, setFormImages] = useState<string[]>([]);
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
    setFormSeoTitle("");
    setFormSeoDesc("");
    setFormSubcategories("");
    setFormIsActive(true);
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormParentId(cat.parent_id || "root");
    setFormDescription(cat.description || "");
    setFormIcon(cat.iconName || cat.icon || "FolderTree");
    setFormPosition(cat.position || 1);
    setFormImages(cat.image_url ? [cat.image_url] : []);
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

    if (editingCategory) {
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
                image_url: imageUrl,
                seo_title: formSeoTitle.trim() || null,
                seo_description: formSeoDesc.trim() || null,
                subcategories: subcats,
                is_active: formIsActive,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      );
      toast.success(`Category "${formName}" updated successfully.`);
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        slug: formSlug.trim() || slugify(formName),
        parent_id: formParentId === "root" ? null : formParentId,
        description: formDescription.trim() || null,
        icon: formIcon,
        iconName: formIcon,
        position: Number(formPosition) || categories.length + 1,
        image_url: imageUrl,
        seo_title: formSeoTitle.trim() || `${formName} - Lennox ChinaMall`,
        seo_description: formSeoDesc.trim() || formDescription.trim() || null,
        subcategories: subcats,
        product_count: 0,
        is_active: formIsActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCategories((prev) => [newCat, ...prev]);
      toast.success(`Category "${formName}" created successfully.`);
    }

    setIsSlideOverOpen(false);
  };

  const handleDeleteCategory = (cat: CategoryItem) => {
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    toast.success(`Category "${cat.name}" deleted.`);
  };

  // Metrics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.is_active).length;
  const rootCategories = categories.filter((c) => !c.parent_id).length;

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
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative">
              {row.image_url ? (
                <Image
                  src={row.image_url}
                  alt={row.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <IconComponent className="w-5 h-5 text-[#FF1028]" />
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
          return <span className="text-[11px] text-slate-400 italic">— (Top Level)</span>;
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
      header: "Products",
      accessorKey: "product_count",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
          {row.product_count || 12} items
        </span>
      ),
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

  const bulkActions: BulkAction<CategoryItem>[] = [
    {
      label: "Bulk Delete",
      icon: Trash2,
      variant: "danger",
      requiresConfirmation: true,
      confirmTitle: "Bulk Delete Categories",
      confirmMessage: "Are you sure you want to delete the selected categories?",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setCategories((prev) => prev.filter((c) => !ids.has(c.id)));
        toast.success(`Deleted ${selected.length} categories.`);
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Department Taxonomy"
        subtitle="Manage product categories, hierarchy trees, navigational icons, and SEO descriptions."
        badge={{ text: `${totalCategories} Categories`, variant: "blue" }}
        breadcrumbs={[
          { label: "Catalogue & Inventory", href: "/admin/products" },
          { label: "Categories" },
        ]}
        actions={[
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total Nodes</span>
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Root Departments</span>
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
      <AdminDataTable<CategoryItem>
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
        title={editingCategory ? "Edit Category Node" : "Create New Category Node"}
        description="Configure taxonomy node names, parent relationships, icons, and SEO metadata."
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
                  { value: "root", label: "Root Level (Top Department)" },
                  ...categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => ({ value: c.id, label: `└─ ${c.name}` })),
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminSelect
                label="Navigational Icon"
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                options={AVAILABLE_ICONS.map((ico) => ({ value: ico, label: ico }))}
              />

              <AdminInput
                label="Sort Order Index"
                type="number"
                min={1}
                value={formPosition}
                onChange={(e) => setFormPosition(Number(e.target.value))}
              />
            </div>

            <AdminInput
              label="Subcategories / Tags (Comma-separated)"
              placeholder="FPV Drones, Quadcopters, 4K Cameras, Drone Batteries"
              value={formSubcategories}
              onChange={(e) => setFormSubcategories(e.target.value)}
              helperText="Creates searchable branch tags for storefront navigation pills."
            />
          </AdminFormSection>

          <AdminFormSection title="Cover Banner Image">
            <AdminUploader
              label="Category Header Banner"
              values={formImages}
              onChange={setFormImages}
              maxFiles={1}
              helperText="High-resolution banner (1200x400) for department landing headers."
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
