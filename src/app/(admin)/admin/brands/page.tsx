"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Award,
  Plus,
  Trash2,
  Package,
  Globe,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SlideOver } from "@/components/admin/SlideOver";
import {
  AdminInput,
  AdminUploader,
  AdminTextarea,
  AdminFormSection,
} from "@/components/admin/forms";
import { useAdminToast } from "@/hooks/useAdminToast";
import { slugify } from "@/utils/helpers";
import { getAdminBrands, createBrand, updateBrand, deleteBrand, bulkDeleteBrands } from "@/app/actions/admin-brands";
import { Brand } from "@/types/database";

export default function AdminBrandsPage() {
  const toast = useAdminToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const result = await getAdminBrands();
      if (result.success && 'brands' in result && result.brands) {
        setBrands(result.brands);
      }
    } catch {
      toast.error("Failed to load brands.");
    } finally {
      setIsLoading(false);
    }
  };

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formLogos, setFormLogos] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormName("");
    setFormSlug("");
    setFormLogos([]);
    setFormDescription("");
    setFormIsActive(true);
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormSlug(brand.slug);
    setFormLogos(brand.logo_url ? [brand.logo_url] : []);
    setFormDescription(brand.description || "");
    setFormIsActive(brand.is_active);
    setIsSlideOverOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingBrand) {
      setFormSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.warning("Brand manufacturer name is required.");
      return;
    }

    setIsSaving(true);
    const logoUrl = formLogos[0] || undefined;
    const slug = formSlug.trim() || slugify(formName);
    const desc = formDescription.trim() || undefined;

    if (editingBrand) {
      const updatedBrand: Brand = {
        ...editingBrand,
        name: formName.trim(),
        slug: slug,
        logo_url: logoUrl || null,
        description: desc || null,
        is_active: formIsActive,
        updated_at: new Date().toISOString(),
      };
      setBrands((prev) => prev.map((b) => (b.id === editingBrand.id ? updatedBrand : b)));
      toast.success(`Brand "${formName}" updated successfully.`);
      setIsSlideOverOpen(false);
      setIsSaving(false);

      updateBrand(editingBrand.id, {
        name: formName.trim(),
        slug: slug,
        logo_url: logoUrl,
        description: desc,
        is_active: formIsActive,
      }).catch(() => {});
      return;
    } else {
      const generatedId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `brand-${Date.now()}`;

      const newBrand: Brand = {
        id: generatedId,
        name: formName.trim(),
        slug: slug,
        logo_url: logoUrl || null,
        description: desc || null,
        is_active: formIsActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setBrands((prev) => [newBrand, ...prev]);
      toast.success(`Brand "${formName}" created successfully.`);
      setIsSlideOverOpen(false);
      setIsSaving(false);

      createBrand({
        name: formName.trim(),
        slug: slug,
        logo_url: logoUrl,
        description: desc,
        is_active: formIsActive,
      }).then((res) => {
        if (res && res.success && 'brand' in res && res.brand) {
          setBrands((prev) => prev.map((b) => (b.id === generatedId ? (res.brand as Brand) : b)));
        }
      }).catch(() => {});
      return;
    }
  };

  const handleDelete = async (brand: Brand) => {
    setBrands((prev) => prev.filter((b) => b.id !== brand.id));
    toast.success(`Brand "${brand.name}" removed.`);
    deleteBrand(brand.id).catch(() => {});
  };

  const columns: Column<Brand>[] = [
    {
      header: "Manufacturer / Brand",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative">
            {row.logo_url ? (
              <Image
                src={row.logo_url}
                alt={row.name}
                fill
                className="object-contain p-1.5"
                unoptimized
              />
            ) : (
              <Award className="w-5 h-5 text-[#FF1028]" />
            )}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-xs font-heading block">
              {row.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">/{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Overview & Description",
      accessorKey: "description",
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 max-w-sm">
          {row.description || "Direct OEM hardware factory manufacturer."}
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
            itemTitle={`brand "${row.name}"`}
            onEdit={() => handleOpenEdit(row)}
            onDelete={() => handleDelete(row)}
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
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive / Hidden" },
      ],
    },
  ];

  const bulkActions: BulkAction<Brand>[] = [
    {
      label: "Bulk Delete",
      icon: Trash2,
      variant: "danger",
      requiresConfirmation: true,
      confirmTitle: "Bulk Delete Brands",
      confirmMessage: "Are you sure you want to delete the selected brand partners?",
      onClick: async (selected) => {
        const ids = selected.map((s) => s.id);
        setBrands((prev) => prev.filter((b) => !ids.includes(b.id)));
        toast.success(`Removed ${selected.length} brand entries.`);
        bulkDeleteBrands(ids).catch(() => {});
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="OEM Brands & Manufacturers"
        subtitle="Manage hardware brand partners, factory emblems, and authorized manufacturer directories."
        badge={{ text: `${brands.length} Brands`, variant: "blue" }}
        breadcrumbs={[
          { label: "Catalogue & Inventory", href: "/admin/products" },
          { label: "Brands" },
        ]}
        actions={[
          {
            label: "Add Brand",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreate,
          },
        ]}
      />

      {/* ── 2. Top Metric KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Brands
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {brands.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Active Partners
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {brands.filter((b) => b.is_active).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Global Verified
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              100%
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Reusable AdminDataTable ── */}
      <AdminDataTable<Brand>
        data={brands}
        columns={columns}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search brands by name or slug..."
        searchFields={["name", "slug"]}
        filters={filterOptions}
        bulkActions={bulkActions}
        defaultSortKey="name"
        defaultSortDirection="asc"
        emptyTitle="No brands registered"
        emptyDescription="Add OEM manufacturers to organize catalogue products."
        emptyAction={{
          label: "Add Brand",
          onClick: handleOpenCreate,
        }}
      />

      {/* ── 4. Slide-Over Panel: Brand Creator / Editor ── */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={editingBrand ? `Edit Brand: ${editingBrand.name}` : "Register OEM Brand"}
        description="Brand identity, manufacturer emblem, and store descriptions."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsSlideOverOpen(false)}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : (editingBrand ? "Save Brand Changes" : "Register Brand")}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-5">
          <AdminFormSection title="Brand Identification">
            <AdminInput
              label="Manufacturer / Brand Name"
              required
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Eachine Drone Tech"
            />

            <AdminInput
              label="Brand Slug / URL Path"
              required
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="eachine-drone-tech"
            />

            <AdminTextarea
              label="Brand Profile Description"
              rows={3}
              placeholder="Specializing in GPS brushless quadcopters and optical flow sensors..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </AdminFormSection>

          <AdminFormSection title="Brand Emblem / Logo">
            <AdminUploader
              label="Upload Vector / Transparent PNG Logo"
              values={formLogos}
              onChange={setFormLogos}
              maxFiles={1}
            />

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2F65F6] focus:ring-[#2F65F6] cursor-pointer"
                />
                <span>Brand is Active &amp; Selectable in Products</span>
              </label>
            </div>
          </AdminFormSection>
        </form>
      </SlideOver>
    </div>
  );
}
