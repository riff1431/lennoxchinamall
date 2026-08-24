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
        <div className="space-y-0.5 max-w-sm">
          <div className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
            {row.title}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
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
        <span className="font-mono text-xs text-[#2F65F6] bg-[#EEF4FF] dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40 select-all font-semibold">
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
          { tone: BadgeTone; label: string }
        > = {
          Policy: { tone: "purple", label: "Policy" },
          Company: { tone: "blue", label: "Company" },
          Help: { tone: "cyan", label: "Help & Guides" },
        };
        const cfg = catConfig[row.category] || {
          tone: "slate",
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
          <div className="text-xs text-slate-700 dark:text-slate-200 truncate">{row.seoTitle}</div>
          <div className="text-[10px] text-slate-400 font-mono">
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
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          {row.lastEditedBy}
        </span>
      ),
    },
    {
      header: "Updated At",
      accessorKey: "updatedAt",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
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
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[#2F65F6] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Preview Page"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
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
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Pages &amp; CMS Content"
        subtitle="Manage static legal policies, DDP shipping guides, Binance Pay tutorials, and company documentation."
        badge={{ text: "CMS", variant: "blue" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Pages & CMS" },
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

      {/* ── 2. Top Summary KPI Cards (Pastels) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total CMS Pages */}
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total CMS Pages
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {pages.length} Pages
            </span>
            <span className="text-[11px] font-bold text-[#2F65F6] block mt-0.5">
              Published &amp; draft documents
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Live & Published */}
        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Live &amp; Published
            </span>
            <span className="text-xl font-black text-[#16A34A] dark:text-emerald-400 font-mono mt-0.5 block">
              {publishedCount} Live
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Accessible by public URL
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Policy & Warranty */}
        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Policy &amp; Warranty
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {policyCount} Docs
            </span>
            <span className="text-[11px] font-bold text-amber-600 block mt-0.5">
              30-day warranty &amp; legal terms
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Help & Tutorials */}
        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Help &amp; Tutorials
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {helpCount} Guides
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Binance Pay &amp; DDP air guides
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
            <HelpCircle className="w-5 h-5" />
          </div>
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
      >
        <form onSubmit={handleSavePage} className="space-y-5 pt-1 text-slate-900 dark:text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Page Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. 30-Day Factory Direct Warranty Policy"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="text-[10px] text-[#2F65F6] hover:text-[#2563EB] font-bold cursor-pointer"
                >
                  Generate Slug
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                  /
                </span>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="warranty-policy"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl pl-6 pr-3 py-2.5 outline-none focus:border-[#2F65F6] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) =>
                  setFormCategory(e.target.value as "Policy" | "Company" | "Help")
                }
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] transition-colors cursor-pointer"
              >
                <option value="Policy">Policy &amp; Legal</option>
                <option value="Company">Company Information</option>
                <option value="Help">Help, FAQ &amp; Shipping Guides</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Publish Status
              </label>
              <select
                value={formStatus}
                onChange={(e) =>
                  setFormStatus(e.target.value as "published" | "draft")
                }
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] transition-colors cursor-pointer"
              >
                <option value="published">Published (Live)</option>
                <option value="draft">Draft (Internal Only)</option>
              </select>
            </div>
          </div>

          {/* SEO Meta Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Globe className="w-4 h-4 text-[#16A34A]" />
              <span>Search Engine Optimization (SEO Meta Tags)</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  SEO Title Tag
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {formSeoTitle.length}/60 recommended
                </span>
              </div>
              <input
                type="text"
                value={formSeoTitle}
                onChange={(e) => setFormSeoTitle(e.target.value)}
                placeholder="e.g. 30-Day Hardware Warranty & QC Policy - Lennox ChinaMall"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#2F65F6] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Meta Description
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {formSeoDescription.length}/160 recommended
                </span>
              </div>
              <textarea
                rows={2}
                value={formSeoDescription}
                onChange={(e) => setFormSeoDescription(e.target.value)}
                placeholder="Brief summary displayed in Google and Bing search results..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3 outline-none focus:border-[#2F65F6] transition-colors"
              />
            </div>
          </div>

          {/* Markdown Content Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#2F65F6]" />
                <span>Page Markdown Content</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {formContent.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={9}
              required
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="# Heading 1&#10;&#10;Write markdown documentation here..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl p-3.5 outline-none focus:border-[#2F65F6] transition-colors leading-relaxed"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] shadow-blue-500/25 shadow-xs transition-colors cursor-pointer"
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
      >
        {previewPage && (
          <div className="space-y-5 pt-1 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-bold">Public URL:</span>
                <span className="font-mono text-[#2F65F6] font-bold">
                  https://lennoxchinamall.com/{previewPage.slug}
                </span>
              </div>
              <StatusBadge
                status={previewPage.status}
                tone={previewPage.status === "published" ? "emerald" : "amber"}
                size="sm"
              />
            </div>

            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SEO Preview in Google
              </div>
              <div className="text-sm font-bold text-[#2F65F6] hover:underline cursor-pointer">
                {previewPage.seoTitle}
              </div>
              <div className="text-xs text-[#16A34A] font-mono">
                https://lennoxchinamall.com/{previewPage.slug}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {previewPage.seoDescription}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Raw Content Preview</div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {previewPage.content}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewPage(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
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
        <div className="fixed bottom-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500">
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
