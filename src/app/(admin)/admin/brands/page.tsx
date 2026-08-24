"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Sparkles,
  Building2,
  Package,
  Globe,
  Tag,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate, slugify } from "@/utils/helpers";
import { MOCK_BRANDS } from "@/lib/mockData";
import { Brand } from "@/types/database";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
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
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingBrand(null);
    setFormName("");
    setFormSlug("");
    setFormLogoUrl("");
    setFormDescription("");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormSlug(brand.slug);
    setFormLogoUrl(brand.logo_url || "");
    setFormDescription(brand.description || "");
    setFormIsActive(brand.is_active);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingBrand) {
      setFormSlug(slugify(val));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Brand name is required.");
      return;
    }

    if (editingBrand) {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === editingBrand.id
            ? {
                ...b,
                name: formName.trim(),
                slug: formSlug.trim() || slugify(formName),
                logo_url: formLogoUrl.trim() || null,
                description: formDescription.trim() || null,
                is_active: formIsActive,
              }
            : b
        )
      );
      showToast(`Brand "${formName}" updated successfully.`);
    } else {
      const newBrand: Brand = {
        id: `brand-${Date.now()}`,
        name: formName.trim(),
        slug: formSlug.trim() || slugify(formName),
        logo_url: formLogoUrl.trim() || null,
        description: formDescription.trim() || null,
        is_active: formIsActive,
        product_count: 0,
        created_at: new Date().toISOString(),
      };
      setBrands((prev) => [newBrand, ...prev]);
      showToast(`Brand "${formName}" created successfully.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteBrand = (brand: Brand) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Brand "${brand.name}"?`,
      description: `Are you sure you want to delete this brand? Products linked to this brand will remain in catalogue without a brand tag.`,
      onConfirm: () => {
        setBrands((prev) => prev.filter((b) => b.id !== brand.id));
        showToast(`Brand "${brand.name}" deleted.`);
      },
    });
  };

  // Metrics
  const totalBrands = brands.length;
  const activeBrands = brands.filter((b) => b.is_active).length;
  const totalProducts = brands.reduce((sum, b) => sum + (b.product_count || 12), 0);

  // Table Columns
  const columns: Column<Brand>[] = [
    {
      header: "Brand Name",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative font-black text-xs text-white">
            {row.logo_url ? (
              <Image
                src={row.logo_url}
                alt={row.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="text-red-400 font-mono tracking-tighter">
                {row.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="font-bold text-white text-xs hover:text-red-400 transition-colors">
              {row.name}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              ID: {row.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Slug / Link",
      accessorKey: "slug",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800/80">
          /brands/{row.slug}
        </span>
      ),
    },
    {
      header: "Description / Niche",
      accessorKey: "description",
      cell: (row) => (
        <p className="text-xs text-slate-300 max-w-xs truncate">
          {row.description || <span className="text-slate-500 italic">No description set</span>}
        </p>
      ),
    },
    {
      header: "Products Linked",
      accessorKey: "product_count",
      sortable: true,
      cell: (row) => (
        <span className="font-bold font-mono text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
          {row.product_count || 12} SKUs
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
          label={row.is_active ? "Active" : "Archived"}
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
            title="Edit Brand"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteBrand(row)}
            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-800/50 transition-colors"
            title="Delete Brand"
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
        { value: "true", label: "Active Brands" },
        { value: "false", label: "Archived / Inactive" },
      ],
    },
  ];

  // Bulk Actions
  const bulkActions: BulkAction<Brand>[] = [
    {
      label: "Activate Selected",
      variant: "success",
      icon: CheckCircle2,
      onClick: (selectedRows) => {
        const ids = new Set(selectedRows.map((r) => r.id));
        setBrands((prev) =>
          prev.map((b) => (ids.has(b.id) ? { ...b, is_active: true } : b))
        );
        showToast(`Activated ${selectedRows.length} brands.`);
      },
    },
    {
      label: "Deactivate Selected",
      variant: "default",
      icon: XCircle,
      onClick: (selectedRows) => {
        const ids = new Set(selectedRows.map((r) => r.id));
        setBrands((prev) =>
          prev.map((b) => (ids.has(b.id) ? { ...b, is_active: false } : b))
        );
        showToast(`Deactivated ${selectedRows.length} brands.`);
      },
    },
    {
      label: "Delete Selected",
      variant: "danger",
      icon: Trash2,
      onClick: (selectedRows) => {
        setConfirmDialog({
          isOpen: true,
          title: `Delete ${selectedRows.length} Brands?`,
          description: `This action will permanently delete the selected ${selectedRows.length} brands from directory.`,
          onConfirm: () => {
            const ids = new Set(selectedRows.map((r) => r.id));
            setBrands((prev) => prev.filter((b) => !ids.has(b.id)));
            showToast(`Deleted ${selectedRows.length} brands.`);
          },
        });
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header */}
      <AdminPageHeader
        title="Brands Directory"
        subtitle="Manage official China direct brands, manufacturing labels, logos, and catalog filtering."
        badge={{ text: "FACTORY BRANDS", variant: "red" }}
        breadcrumbs={[
          { label: "Catalogue", href: "/admin/products" },
          { label: "Brands" },
        ]}
        actions={[
          {
            label: "Add Brand",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreateModal,
          },
        ]}
      />

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Brands
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {totalBrands}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Official Brands
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {activeBrands}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Assigned Products
            </span>
            <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">
              {totalProducts}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <AdminDataTable
        data={brands}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search brands by name, slug, description..."
        searchFields={["name", "slug", "description"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="name"
        defaultSortDirection="asc"
        emptyTitle="No brands found"
        emptyDescription="Add partner brands to showcase official factory merchandise."
        emptyAction={{
          label: "Add Brand",
          onClick: handleOpenCreateModal,
        }}
      />

      {/* 4. CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? `Edit Brand: ${editingBrand.name}` : "Add New Brand"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Brand Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Brand Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Eachine Labs"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Slug <span className="text-slate-500 text-[10px]">(URL prefix)</span>
              </label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="e.g. eachine-labs"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#FF1028] transition-colors"
                required
              />
            </div>
          </div>

          {/* Logo URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Logo Image URL
            </label>
            <input
              type="url"
              value={formLogoUrl}
              onChange={(e) => setFormLogoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or CDN link"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Brand Overview / Niche
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="FPV drone systems, high-discharge batteries, industrial quadcopters..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors resize-none"
            />
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">Active Status</span>
              <span className="text-[11px] text-slate-400">
                Display in brand filters and product brand badges
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
              {editingBrand ? "Update Brand" : "Create Brand"}
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
        confirmLabel="Delete Brand"
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
