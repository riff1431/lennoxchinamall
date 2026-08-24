"use client";

import React, { useState } from "react";
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { MOCK_SEO_REDIRECTS, SeoRedirectItem } from "@/lib/mockData";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminDataTable,
  Column,
  FilterOption,
  BulkAction,
} from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/utils/helpers";

export default function AdminSeoRedirectsPage() {
  const [redirects, setRedirects] = useState<SeoRedirectItem[]>(MOCK_SEO_REDIRECTS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRedirectId, setEditingRedirectId] = useState<string | null>(null);

  // Form State
  const [formFromPath, setFormFromPath] = useState("");
  const [formToPath, setFormToPath] = useState("");
  const [formType, setFormType] = useState<"301" | "302">("301");
  const [formNote, setFormNote] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SeoRedirectItem | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    setRedirects((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "active" ? "inactive" : "active";
          showToast(
            `Redirect ${item.fromPath} is now ${nextStatus === "active" ? "Active" : "Inactive"}`
          );
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingRedirectId(null);
    setFormFromPath("");
    setFormToPath("");
    setFormType("301");
    setFormNote("");
    setFormStatus("active");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: SeoRedirectItem) => {
    setEditingRedirectId(item.id);
    setFormFromPath(item.fromPath);
    setFormToPath(item.toPath);
    setFormType(item.type);
    setFormNote(item.note);
    setFormStatus(item.status);
    setIsModalOpen(true);
  };

  // Format Path Helper
  const cleanPath = (p: string) => {
    const trimmed = p.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  };

  // Save Modal
  const handleSaveRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFromPath.trim() || !formToPath.trim()) return;

    const fromFormatted = cleanPath(formFromPath);
    const toFormatted = cleanPath(formToPath);

    if (editingRedirectId) {
      setRedirects((prev) =>
        prev.map((r) =>
          r.id === editingRedirectId
            ? {
                ...r,
                fromPath: fromFormatted,
                toPath: toFormatted,
                type: formType,
                note: formNote.trim(),
                status: formStatus,
              }
            : r
        )
      );
      showToast(`Redirect rule for "${fromFormatted}" updated!`);
    } else {
      const newRedirect: SeoRedirectItem = {
        id: `seo-${Date.now()}`,
        fromPath: fromFormatted,
        toPath: toFormatted,
        type: formType,
        hitCount: 0,
        status: formStatus,
        note: formNote.trim(),
        createdAt: new Date().toISOString(),
      };
      setRedirects([newRedirect, ...redirects]);
      showToast(`New redirect "${fromFormatted} → ${toFormatted}" created!`);
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    setRedirects((prev) => prev.filter((r) => r.id !== itemToDelete.id));
    showToast(`Redirect rule for "${itemToDelete.fromPath}" removed.`);
    setItemToDelete(null);
  };

  // Bulk Actions
  const bulkActions: BulkAction<SeoRedirectItem>[] = [
    {
      label: "Activate Selected",
      variant: "success",
      icon: CheckCircle2,
      onClick: (selected) => {
        const ids = new Set(selected.map((r) => r.id));
        setRedirects((prev) =>
          prev.map((r) => (ids.has(r.id) ? { ...r, status: "active" } : r))
        );
        showToast(`Activated ${selected.length} redirect rules.`);
      },
    },
    {
      label: "Deactivate Selected",
      variant: "default",
      onClick: (selected) => {
        const ids = new Set(selected.map((r) => r.id));
        setRedirects((prev) =>
          prev.map((r) => (ids.has(r.id) ? { ...r, status: "inactive" } : r))
        );
        showToast(`Deactivated ${selected.length} redirect rules.`);
      },
    },
    {
      label: "Delete Selected",
      variant: "danger",
      icon: Trash2,
      onClick: (selected) => {
        const ids = new Set(selected.map((r) => r.id));
        setRedirects((prev) => prev.filter((r) => !ids.has(r.id)));
        showToast(`Removed ${selected.length} redirect rules.`);
      },
    },
  ];

  // Filters
  const filters: FilterOption[] = [
    {
      key: "type",
      label: "Redirect Type",
      options: [
        { value: "301", label: "301 Permanent" },
        { value: "302", label: "302 Temporary" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  // Columns definition
  const columns: Column<SeoRedirectItem>[] = [
    {
      header: "Source (From Path)",
      accessorKey: "fromPath",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-red-400 font-semibold bg-red-950/30 px-2.5 py-1 rounded border border-red-900/40 select-all block max-w-xs truncate">
          {row.fromPath}
        </span>
      ),
    },
    {
      header: "",
      className: "w-10 text-center px-1",
      cell: () => (
        <div className="flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </div>
      ),
    },
    {
      header: "Target (To Path)",
      accessorKey: "toPath",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-emerald-400 font-semibold bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-900/40 select-all block max-w-xs truncate">
          {row.toPath}
        </span>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
      className: "text-center",
      cell: (row) => (
        <StatusBadge
          status={row.type === "301" ? "301 Permanent" : "302 Temporary"}
          tone={row.type === "301" ? "emerald" : "amber"}
          size="sm"
          dot={false}
        />
      ),
    },
    {
      header: "Hit Count",
      accessorKey: "hitCount",
      sortable: true,
      className: "text-center",
      cell: (row) => (
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-slate-200">
          <Flame className="w-3 h-3 text-amber-400" />
          <span>{row.hitCount.toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      className: "text-center",
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(row.id)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            row.status === "active" ? "bg-emerald-500" : "bg-slate-800"
          }`}
          aria-label={`Toggle redirect ${row.fromPath}`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              row.status === "active" ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      ),
    },
    {
      header: "Note / Campaign",
      accessorKey: "note",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-400 block max-w-xs truncate" title={row.note}>
          {row.note || "—"}
        </span>
      ),
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Edit Redirect"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setItemToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete Redirect"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Top metric stats
  const totalHits = redirects.reduce((acc, r) => acc + (r.hitCount || 0), 0);
  const permanentCount = redirects.filter((r) => r.type === "301").length;
  const temporaryCount = redirects.filter((r) => r.type === "302").length;
  const activeCount = redirects.filter((r) => r.status === "active").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="SEO & URL Redirects"
        subtitle="Manage HTTP 301 permanent and 302 temporary redirects to preserve SEO link equity and fix legacy URLs."
        badge={{ text: "301 REDIRECTS", variant: "red" }}
        breadcrumbs={[
          { label: "Storefront" },
          { label: "SEO & Redirects", href: "/admin/seo" },
        ]}
        actions={[
          {
            label: "Create Redirect",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreate,
          },
        ]}
      />

      {/* ── 2. Top Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Total Redirects
            </span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {redirects.length}
          </div>
          <p className="text-[11px] text-slate-400">{activeCount} active rules routing</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Total Hits Routed
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-heading">
            {totalHits.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Legacy requests saved from 404</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              301 Permanent SEO
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-heading">
            {permanentCount}
          </div>
          <p className="text-[11px] text-slate-400">Google rank equity preserved</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              302 Temporary Deals
            </span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {temporaryCount}
          </div>
          <p className="text-[11px] text-slate-400">Campaign banner shortcuts</p>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <AdminDataTable<SeoRedirectItem>
        data={redirects}
        columns={columns}
        keyExtractor={(r) => r.id}
        searchPlaceholder="Search by fromPath, toPath, note..."
        searchFields={["fromPath", "toPath", "note", "type"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="hitCount"
        defaultSortDirection="desc"
        emptyTitle="No redirect rules configured"
        emptyDescription="Create 301 or 302 redirects to prevent 404 errors and guide legacy traffic."
        emptyAction={{
          label: "Create Redirect",
          onClick: handleOpenCreate,
        }}
      />

      {/* ── 4. Create / Edit CRUD Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRedirectId ? "Edit Redirect Rule" : "Create Redirect Rule"}
        size="lg"
        className="!bg-slate-900 !border-slate-800 text-slate-100 [&>div:first-child]:!bg-slate-900/90 [&>div:first-child]:!border-slate-800 [&>div:first-child_div]:!text-white [&>div:first-child_button]:!text-slate-400 hover:[&>div:first-child_button]:!text-white hover:[&>div:first-child_button]:!bg-slate-800"
      >
        <form onSubmit={handleSaveRedirect} className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Source URL Path (From Path) <span className="text-[#FF1028]">*</span>
            </label>
            <input
              type="text"
              required
              value={formFromPath}
              onChange={(e) => setFormFromPath(e.target.value)}
              placeholder="e.g. /products/drone-4k or /old-landing-page"
              className="w-full bg-slate-950 border border-slate-800 text-red-400 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              The incoming URL request that visitors or search engines request.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Destination URL Path (To Path) <span className="text-[#FF1028]">*</span>
            </label>
            <input
              type="text"
              required
              value={formToPath}
              onChange={(e) => setFormToPath(e.target.value)}
              placeholder="e.g. /products/eachine-ex5-4k-gps-fpv-drone"
              className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              The canonical target destination to forward the user.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                HTTP Redirect Type <span className="text-[#FF1028]">*</span>
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as "301" | "302")}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors cursor-pointer"
              >
                <option value="301">301 - Moved Permanently (SEO Recommended)</option>
                <option value="302">302 - Found / Temporary (Campaign Deals)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) =>
                  setFormStatus(e.target.value as "active" | "inactive")
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors cursor-pointer"
              >
                <option value="active">Active (Forwarding requests)</option>
                <option value="inactive">Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Internal Note / Campaign Description
            </label>
            <input
              type="text"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="e.g. Legacy URL alias from old product campaign"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors cursor-pointer shadow-sm shadow-red-950"
            >
              {editingRedirectId ? "Save Changes" : "Create Redirect"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Redirect Rule"
        description={`Are you sure you want to remove the redirect for "${itemToDelete?.fromPath}"? Requests to this path will result in 404 Not Found.`}
        confirmLabel="Delete Rule"
        variant="danger"
      />

      {/* ── 6. Toast Notification ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span>✓ {toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
