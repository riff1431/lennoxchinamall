"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Lock,
  ExternalLink,
  ShieldCheck,
  Building,
  Clock,
  Download,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SlideOver } from "@/components/admin/SlideOver";
import {
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminFormSection,
} from "@/components/admin/forms";
import { useAdminToast } from "@/hooks/useAdminToast";
import { Supplier, SourcingPurchase } from "@/types/database";
import { getSuppliers, createSupplier } from "@/app/actions/admin-suppliers";

export default function AdminSuppliersPage() {
  const toast = useAdminToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [, setSourcingPurchases] = useState<SourcingPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // SlideOver State
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [code, setCode] = useState("SUP-SZ-8021");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [platform, setPlatform] = useState("1688 / Factory Direct");
  const [sourceUrl, setSourceUrl] = useState("https://1688.com");
  const [region, setRegion] = useState("Shenzhen, Guangdong");
  const [leadTime, setLeadTime] = useState(2);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSuppliers();
      if (res.success) {
        setSuppliers(res.suppliers);
        setSourcingPurchases(res.sourcingPurchases);
      }
    } catch {
      toast.error("Failed to load factory suppliers.");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setCode(`SUP-SZ-${Math.floor(1000 + Math.random() * 9000)}`);
    setName("");
    setContact("");
    setPlatform("1688 / Factory Direct");
    setSourceUrl("https://1688.com");
    setRegion("Shenzhen, Guangdong");
    setLeadTime(2);
    setNotes("");
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setCode(sup.code);
    setName(sup.name);
    setContact(sup.contact_info?.wechat || sup.contact_info?.phone || "");
    setPlatform(sup.platform || "1688 / Factory Direct");
    setSourceUrl(sup.platform_store_url || "https://1688.com");
    setRegion(sup.region || "Shenzhen, Guangdong");
    setLeadTime(sup.lead_time_days || 2);
    setNotes(sup.notes || "");
    setIsSlideOverOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Supplier factory name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("code", code);
      formData.set("name", name.trim());
      formData.set("contact", contact.trim());
      formData.set("platform", platform);
      formData.set("source_url", sourceUrl.trim());
      formData.set("region", region.trim());
      formData.set("lead_time", String(leadTime));
      formData.set("notes", notes.trim());

      const res = await createSupplier(formData);
      if (res.success) {
        toast.success(`Factory partner "${name}" registered successfully.`);
        setIsSlideOverOpen(false);
        loadData();
      } else {
        toast.error(res.message || "Failed to register supplier.");
      }
    } catch {
      toast.error("Failed to save supplier partner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const supplierColumns: Column<Supplier>[] = [
    {
      header: "Supplier Code",
      accessorKey: "code",
      sortable: true,
      cell: (row) => (
        <span className="bg-[#FFF8EE] dark:bg-amber-950/60 border border-[#FED7AA]/60 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full inline-block">
          {row.code}
        </span>
      ),
    },
    {
      header: "Factory / Entity",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 dark:text-white block font-heading text-xs">
            {row.name}
          </span>
          <span className="text-[11px] text-slate-400 block">{row.platform}</span>
        </div>
      ),
    },
    {
      header: "Manufacturing Hub",
      accessorKey: "region",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.region || "Guangdong"}
        </span>
      ),
    },
    {
      header: "Factory Lead Time",
      accessorKey: "lead_time_days",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-bold">
          ~{row.lead_time_days || 2} days
        </span>
      ),
    },
    {
      header: "Verification",
      cell: () => (
        <StatusBadge status="verified" tone="emerald" />
      ),
    },
    {
      header: "Actions",
      className: "text-right w-20",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end">
          <AdminActionMenu
            itemTitle={`factory "${row.name}"`}
            onEdit={() => handleOpenEdit(row)}
            customActions={[
              {
                label: "Open 1688 / Direct Shop",
                icon: ExternalLink,
                onClick: () => {
                  if (row.platform_store_url) window.open(row.platform_store_url, "_blank");
                  else toast.info("No direct shop URL registered for this partner.");
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const bulkActions: BulkAction<Supplier>[] = [
    {
      label: "Export Selected",
      icon: Download,
      variant: "default",
      onClick: (selected) => {
        const headers = "Code,Name,Platform,Region,LeadTime\n";
        const rows = selected.map((s) => `"${s.code}","${s.name}","${s.platform}","${s.region}",${s.lead_time_days}`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "suppliers_export.csv";
        a.click();
        toast.success(`Exported ${selected.length} suppliers to CSV.`);
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Direct Factory Suppliers (1688 / Taobao)"
        subtitle="Manage verified Chinese manufacturers, encrypted supplier codes, and lead-time guarantees."
        badge={{ text: `${suppliers.length} Factory Partners`, variant: "emerald" }}
        breadcrumbs={[
          { label: "Orders & Sourcing", href: "/admin/sourcing" },
          { label: "Suppliers" },
        ]}
        actions={[
          {
            label: "Register Factory",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreate,
          },
        ]}
      />

      {/* ── 2. Confidentiality Alert Banner ── */}
      <div className="p-4 rounded-2xl bg-[#FFF8EE] dark:bg-amber-950/30 border border-[#FED7AA]/60 dark:border-amber-900/30 flex items-start gap-3 shadow-xs">
        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-amber-900 dark:text-amber-200">
          <span className="font-bold block">
            Strict Confidentiality: Sourcing Links &amp; Wholesale Factory Names are Internal Only
          </span>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
            Supplier URLs, Chinese business contacts, and acquisition pricing are stripped from all public API endpoints and storefront views.
          </p>
        </div>
      </div>

      {/* ── 3. Top 3 KPI Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Verified Factory Partners
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {suppliers.length} Factories
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Shenzhen, Ningbo, Dongguan</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Sourcing Reliability
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              99.4%
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Direct China QC inspection passed</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Avg. Factory Lead Time
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              2.4 Days
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">To Shenzhen Sort Hub</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 4. Reusable AdminDataTable ── */}
      <AdminDataTable<Supplier>
        data={suppliers}
        columns={supplierColumns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search suppliers by name, code, or city..."
        searchFields={["name", "code", "region"]}
        bulkActions={bulkActions}
        defaultSortKey="lead_time_days"
        defaultSortDirection="asc"
        isLoading={isLoading}
        emptyTitle="No supplier partners found"
        emptyDescription="Register verified factory procurement sources."
        emptyAction={{
          label: "Register Factory",
          onClick: handleOpenCreate,
        }}
      />

      {/* ── 5. Slide-Over Panel: Factory Partner Registration ── */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : "Register Factory Partner"}
        description="Encrypted factory identity details, 1688 procurement URLs, and WeChat contacts."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveSupplier}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Save Factory Partner"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveSupplier} className="space-y-5">
          <AdminFormSection title="Factory Entity Identification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="Confidential Supplier Code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <AdminInput
                label="Manufacturing Hub City"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Shenzhen, Guangdong"
              />
            </div>

            <AdminInput
              label="Legal Factory Entity / Store Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shenzhen Eachine Drone Technology Co., Ltd."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminSelect
                label="Wholesale Sourcing Platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                options={[
                  { value: "1688 / Factory Direct", label: "1688 (Alibaba China Direct)" },
                  { value: "Taobao Enterprise Shop", label: "Taobao Enterprise Shop" },
                  { value: "JD Industrial Supply", label: "JD Industrial Supply" },
                  { value: "Direct Factory Contract", label: "Direct Factory Contract (OEM)" },
                ]}
              />

              <AdminInput
                label="Production Lead Time (Days)"
                type="number"
                min={1}
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
              />
            </div>
          </AdminFormSection>

          <AdminFormSection title="Sourcing Link &amp; Communication">
            <AdminInput
              label="Direct 1688 Store / Item URL"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://detail.1688.com/offer/..."
            />

            <AdminInput
              label="WeChat ID / Trade Rep Phone"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="WeChat ID: eachine_factory_b2b"
            />

            <AdminTextarea
              label="Procurement &amp; QC Terms"
              rows={3}
              placeholder="MOQ agreements, warranty replacement policies, or bench test criteria..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </AdminFormSection>
        </form>
      </SlideOver>
    </div>
  );
}
