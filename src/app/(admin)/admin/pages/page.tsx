"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Globe,
  CheckCircle2,
  FileCheck,
  Shield,
  HelpCircle,
  Building,
  Sparkles,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { MOCK_PAGES, AdminPage } from "@/lib/mockData";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminDataTable,
  Column,
  FilterOption,
  BulkAction,
} from "@/components/admin/AdminDataTable";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate, slugify } from "@/utils/helpers";

export default function AdminPagesPage() {
  const [pages, setPages] = useState<AdminPage[]>(MOCK_PAGES);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState<"Policy" | "Company" | "Help">("Policy");
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDescription, setFormSeoDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formStatus, setFormStatus] = useState<"published" | "draft">("published");

  // Content Preview Modal State
  const [previewPage, setPreviewPage] = useState<AdminPage | null>(null);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<AdminPage | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPageId(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory("Policy");
    setFormSeoTitle("");
    setFormSeoDescription("");
    setFormContent(
      "# New Documentation Page\n\nProvide transparent, factory-direct policy details for hardware buyers."
    );
    setFormStatus("published");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (page: AdminPage) => {
    setEditingPageId(page.id);
    setFormTitle(page.title);
    setFormSlug(page.slug);
    setFormCategory(page.category);
    setFormSeoTitle(page.seoTitle);
    setFormSeoDescription(page.seoDescription);
    setFormContent(page.content);
    setFormStatus(page.status);
    setIsModalOpen(true);
  };

  // Auto-generate slug from title
  const handleGenerateSlug = () => {
    if (formTitle.trim()) {
      setFormSlug(slugify(formTitle));
    }
  };

  // Save Page
  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSlug.trim()) return;

    const cleanSlug = formSlug.trim().replace(/^\/+/, "");

    if (editingPageId) {
      setPages((prev) =>
        prev.map((p) =>
          p.id === editingPageId
            ? {
                ...p,
                title: formTitle.trim(),
                slug: cleanSlug,
                category: formCategory,
                seoTitle: formSeoTitle.trim() || `${formTitle.trim()} - Lennox ChinaMall`,
                seoDescription: formSeoDescription.trim(),
                content: formContent,
                status: formStatus,
                lastEditedBy: "Super Admin",
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      showToast(`Page "${formTitle}" updated successfully!`);
    } else {
      const newPage: AdminPage = {
        id: `pg-${Date.now()}`,
        title: formTitle.trim(),
        slug: cleanSlug,
        category: formCategory,
        seoTitle: formSeoTitle.trim() || `${formTitle.trim()} - Lennox ChinaMall`,
        seoDescription: formSeoDescription.trim(),
        content: formContent,
        status: formStatus,
        lastEditedBy: "Super Admin",
        updatedAt: new Date().toISOString(),
      };
      setPages([newPage, ...pages]);
      showToast(`New page "${formTitle}" created!`);
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!pageToDelete) return;
    setPages((prev) => prev.filter((p) => p.id !== pageToDelete.id));
    showToast(`Page "${pageToDelete.title}" deleted.`);
    setPageToDelete(null);
  };

  // Bulk Actions
  const bulkActions: BulkAction<AdminPage>[] = [
    {
      label: "Publish Selected",
      variant: "success",
      icon: CheckCircle2,
      onClick: (selected) => {
        const ids = new Set(selected.map((p) => p.id));
        setPages((prev) =>
          prev.map((p) =>
            ids.has(p.id)
              ? { ...p, status: "published", updatedAt: new Date().toISOString() }
              : p
          )
        );
        showToast(`Published ${selected.length} CMS pages.`);
      },
    },
    {
      label: "Unpublish (Draft)",
      variant: "default",
      onClick: (selected) => {
        const ids = new Set(selected.map((p) => p.id));
        setPages((prev) =>
          prev.map((p) =>
            ids.has(p.id)
              ? { ...p, status: "draft", updatedAt: new Date().toISOString() }
              : p
          )
        );
        showToast(`Set ${selected.length} pages to Draft mode.`);
      },
    },
    {
      label: "Delete Selected",
      variant: "danger",
      icon: Trash2,
      onClick: (selected) => {
        const ids = new Set(selected.map((p) => p.id));
        setPages((prev) => prev.filter((p) => !ids.has(p.id)));
        showToast(`Deleted ${selected.length} CMS pages.`);
      },
    },
  ];

  // Filters
  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
      ],
    },
    {
      key: "category",
      label: "Category",
      options: [
        { value: "Policy", label: "Policy & Legal" },
        { value: "Company", label: "Company Info" },
        { value: "Help", label: "Help & Logistics" },
      ],
    },
  ];

  // Columns definition
  const columns: Column<AdminPage>[] = [
    {
      header: "Page Title",
      accessorKey: "title",
      sortable: true,
      cell: (row) => (
        <div className="space-y-1 max-w-sm">
          <div className="font-bold text-white text-xs leading-snug flex items-center gap-1.5">
            <span>{row.title}</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {row.seoDescription || "No meta description defined"}
          </div>
        </div>
      ),
    },
    {
      header: "URL Slug",
      accessorKey: "slug",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/40 select-all">
          /{row.slug}
        </span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      sortable: true,
      cell: (row) => {
        const catConfig: Record<
          string,
          { tone: BadgeTone; icon: any; label: string }
        > = {
          Policy: { tone: "purple", icon: Shield, label: "Policy" },
          Company: { tone: "blue", icon: Building, label: "Company" },
          Help: { tone: "cyan", icon: HelpCircle, label: "Help & Guides" },
        };
        const cfg = catConfig[row.category] || {
          tone: "slate",
          icon: FileText,
          label: row.category,
        };
        return (
          <StatusBadge status={cfg.label} tone={cfg.tone} size="sm" dot={false} />
        );
      },
    },
    {
      header: "SEO Meta Title",
      accessorKey: "seoTitle",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5 max-w-xs">
          <div className="text-xs text-slate-200 truncate">{row.seoTitle}</div>
          <div className="text-[10px] text-slate-500 font-mono">
            {row.seoTitle.length} chars
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      className: "text-center",
      cell: (row) => (
        <StatusBadge
          status={row.status}
          tone={row.status === "published" ? "emerald" : "amber"}
          size="sm"
        />
      ),
    },
    {
      header: "Last Edited By",
      accessorKey: "lastEditedBy",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-300 font-medium">
          {row.lastEditedBy}
        </span>
      ),
    },
    {
      header: "Updated At",
      accessorKey: "updatedAt",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatDate(row.updatedAt)}
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
            onClick={() => setPreviewPage(row)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Preview Page"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Edit Page"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setPageToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete Page"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Top metric stats
  const publishedCount = pages.filter((p) => p.status === "published").length;
  const policyCount = pages.filter((p) => p.category === "Policy").length;
  const helpCount = pages.filter((p) => p.category === "Help").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Pages & CMS Content"
        subtitle="Manage static legal policies, DDP shipping guides, Binance Pay tutorials, and company documentation."
        badge={{ text: "CMS", variant: "red" }}
        breadcrumbs={[
          { label: "Content" },
          { label: "Pages & CMS", href: "/admin/pages" },
        ]}
        actions={[
          {
            label: "Create Page",
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
              Total CMS Pages
            </span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {pages.length}
          </div>
          <p className="text-[11px] text-slate-400">Published & draft documents</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Live & Published
            </span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-heading">
            {publishedCount}
          </div>
          <p className="text-[11px] text-slate-400">Accessible by public URL</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Policy & Warranty
            </span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {policyCount}
          </div>
          <p className="text-[11px] text-slate-400">30-day warranty & legal terms</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Help & Tutorials
            </span>
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {helpCount}
          </div>
          <p className="text-[11px] text-slate-400">Binance Pay & DDP air guides</p>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <AdminDataTable<AdminPage>
        data={pages}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search by title, slug, SEO meta, content..."
        searchFields={["title", "slug", "seoTitle", "category", "content", "lastEditedBy"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="updatedAt"
        defaultSortDirection="desc"
        emptyTitle="No CMS pages found"
        emptyDescription="Get started by creating your first policy or guide page."
        emptyAction={{
          label: "Create Page",
          onClick: handleOpenCreate,
        }}
      />

      {/* ── 4. Create / Edit CRUD Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPageId ? "Edit CMS Document" : "Create CMS Document"}
        size="2xl"
        className="!bg-slate-900 !border-slate-800 text-slate-100 [&>div:first-child]:!bg-slate-900/90 [&>div:first-child]:!border-slate-800 [&>div:first-child_div]:!text-white [&>div:first-child_button]:!text-slate-400 hover:[&>div:first-child_button]:!text-white hover:[&>div:first-child_button]:!bg-slate-800"
      >
        <form onSubmit={handleSavePage} className="space-y-5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Page Title <span className="text-[#FF1028]">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. 30-Day Factory Direct Warranty Policy"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  URL Slug <span className="text-[#FF1028]">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                >
                  Generate Slug
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">
                  /
                </span>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="warranty-policy"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl pl-6 pr-3 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) =>
                  setFormCategory(e.target.value as "Policy" | "Company" | "Help")
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors cursor-pointer"
              >
                <option value="Policy">Policy & Legal</option>
                <option value="Company">Company Information</option>
                <option value="Help">Help, FAQ & Shipping Guides</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Publish Status
              </label>
              <select
                value={formStatus}
                onChange={(e) =>
                  setFormStatus(e.target.value as "published" | "draft")
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors cursor-pointer"
              >
                <option value="published">Published (Live)</option>
                <option value="draft">Draft (Internal Only)</option>
              </select>
            </div>
          </div>

          {/* SEO Meta Box */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-slate-800/80 pb-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Search Engine Optimization (SEO Meta Tags)</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400">
                  SEO Title Tag
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {formSeoTitle.length}/60 recommended
                </span>
              </div>
              <input
                type="text"
                value={formSeoTitle}
                onChange={(e) => setFormSeoTitle(e.target.value)}
                placeholder="e.g. 30-Day Hardware Warranty & QC Policy - Lennox ChinaMall"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#FF1028] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400">
                  Meta Description
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {formSeoDescription.length}/160 recommended
                </span>
              </div>
              <textarea
                rows={2}
                value={formSeoDescription}
                onChange={(e) => setFormSeoDescription(e.target.value)}
                placeholder="Brief summary displayed in Google and Bing search results..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-3 outline-none focus:border-[#FF1028] transition-colors"
              />
            </div>
          </div>

          {/* Markdown Content Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Page Markdown Content</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {formContent.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={9}
              required
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="# Heading 1&#10;&#10;Write markdown documentation here..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl p-3.5 outline-none focus:border-[#FF1028] transition-colors leading-relaxed"
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
              {editingPageId ? "Save Changes" : "Publish Document"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Preview Modal ── */}
      <Modal
        isOpen={Boolean(previewPage)}
        onClose={() => setPreviewPage(null)}
        title={previewPage?.title || "Page Preview"}
        size="xl"
        className="!bg-slate-900 !border-slate-800 text-slate-100 [&>div:first-child]:!bg-slate-900/90 [&>div:first-child]:!border-slate-800 [&>div:first-child_div]:!text-white [&>div:first-child_button]:!text-slate-400 hover:[&>div:first-child_button]:!text-white hover:[&>div:first-child_button]:!bg-slate-800"
      >
        {previewPage && (
          <div className="space-y-5 pt-1">
            <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">Public URL:</span>
                <span className="font-mono text-red-400 font-bold">
                  https://lennoxchinamall.com/{previewPage.slug}
                </span>
              </div>
              <StatusBadge
                status={previewPage.status}
                tone={previewPage.status === "published" ? "emerald" : "amber"}
                size="sm"
              />
            </div>

            <div className="space-y-2 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                SEO Preview in Google
              </div>
              <div className="text-sm font-bold text-blue-400 hover:underline">
                {previewPage.seoTitle}
              </div>
              <div className="text-xs text-emerald-400 font-mono">
                https://lennoxchinamall.com/{previewPage.slug}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                {previewPage.seoDescription}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">Raw Content Preview</div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {previewPage.content}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewPage(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── 6. Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete CMS Document"
        description={`Are you sure you want to delete "${pageToDelete?.title}"? The URL route /${pageToDelete?.slug} will immediately become unavailable.`}
        confirmLabel="Delete Page"
        variant="danger"
      />

      {/* ── 7. Toast Notification ── */}
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
