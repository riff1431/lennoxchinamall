"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Copy,
  Trash2,
  HardDrive,
  UploadCloud,
  Layers,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { SlideOver } from "@/components/admin/SlideOver";
import { Modal } from "@/components/ui/Modal";
import {
  AdminInput,
  AdminSelect,
  AdminUploader,
  AdminFormSection,
} from "@/components/admin/forms";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatDate } from "@/utils/helpers";
import { MOCK_MEDIA, MediaAsset } from "@/lib/mockData";

export default function AdminMediaPage() {
  const toast = useAdminToast();
  const [mediaList, setMediaList] = useState<MediaAsset[]>(MOCK_MEDIA);

  // Modals & SlideOver
  const [isUploadSlideOverOpen, setIsUploadSlideOverOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Upload Form Fields
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"image" | "video" | "document">("image");
  const [formCategory, setFormCategory] = useState<MediaAsset["category"]>("product");
  const [formUploads, setFormUploads] = useState<string[]>([]);
  const [formDirectUrl, setFormDirectUrl] = useState("");

  const handleOpenUpload = () => {
    setFormName("");
    setFormType("image");
    setFormCategory("product");
    setFormUploads([]);
    setFormDirectUrl("");
    setIsUploadSlideOverOpen(true);
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = formUploads[0] || formDirectUrl.trim();
    if (!finalUrl) {
      toast.warning("Please upload a file or specify a direct URL.");
      return;
    }

    const newAsset: MediaAsset = {
      id: `med-${Date.now()}`,
      name: formName.trim() || `Asset-${Date.now().toString().slice(-4)}`,
      url: finalUrl,
      type: formType,
      category: formCategory,
      size: "1.2 MB",
      dimensions: "1920x1080",
      format: finalUrl.endsWith(".mp4") ? "MP4" : "JPG",
      uploaded_at: new Date().toISOString(),
    };

    setMediaList((prev) => [newAsset, ...prev]);
    toast.success(`Asset "${newAsset.name}" added to Media Library.`);
    setIsUploadSlideOverOpen(false);
  };

  const handleDeleteAsset = (asset: MediaAsset) => {
    setMediaList((prev) => prev.filter((m) => m.id !== asset.id));
    toast.success(`Asset "${asset.name}" removed.`);
  };

  // Metrics
  const totalAssets = mediaList.length;
  const imageCount = mediaList.filter((m) => m.type === "image").length;
  const videoCount = mediaList.filter((m) => m.type === "video").length;
  const bannerCount = mediaList.filter((m) => m.category === "banner").length;

  const columns: Column<MediaAsset>[] = [
    {
      header: "Asset Preview & Name",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative">
            {row.type === "image" ? (
              <Image
                src={row.url}
                alt={row.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : row.type === "video" ? (
              <Video className="w-5 h-5 text-[#2F65F6]" />
            ) : (
              <FileText className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-xs font-heading block truncate max-w-xs">
              {row.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              {row.format} • {row.dimensions} • {row.size}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Media Type",
      accessorKey: "type",
      sortable: true,
      cell: (row) => (
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.type}
        </span>
      ),
    },
    {
      header: "Category Scope",
      accessorKey: "category",
      cell: (row) => {
        const tone: BadgeTone =
          row.category === "product"
            ? "emerald"
            : row.category === "banner"
            ? "purple"
            : "blue";
        return <StatusBadge status={row.category} tone={tone} />;
      },
    },
    {
      header: "Uploaded Date",
      accessorKey: "uploaded_at",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-500">
          {formatDate(row.uploaded_at)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-20",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end">
          <AdminActionMenu
            itemTitle={`asset "${row.name}"`}
            onView={() => setPreviewAsset(row)}
            onDelete={() => handleDeleteAsset(row)}
            customActions={[
              {
                label: "Copy CDN URL",
                icon: Copy,
                onClick: () => {
                  navigator.clipboard.writeText(row.url);
                  toast.info("Copied CDN URL to clipboard.");
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: "type",
      label: "Media Type",
      options: [
        { value: "image", label: "Images & Photos" },
        { value: "video", label: "Dual QC Videos" },
        { value: "document", label: "Documents & PDFs" },
      ],
    },
  ];

  const bulkActions: BulkAction<MediaAsset>[] = [
    {
      label: "Bulk Delete",
      icon: Trash2,
      variant: "danger",
      requiresConfirmation: true,
      confirmTitle: "Bulk Delete Media",
      confirmMessage: "Are you sure you want to permanently delete the selected media files?",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setMediaList((prev) => prev.filter((m) => !ids.has(m.id)));
        toast.success(`Deleted ${selected.length} media assets.`);
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Media Asset Library"
        subtitle="Manage product imagery, factory QC video demonstrations, promotional banners, and CDN assets."
        badge={{ text: `${totalAssets} Media Files`, variant: "blue" }}
        breadcrumbs={[
          { label: "Catalogue & Inventory", href: "/admin/products" },
          { label: "Media Library" },
        ]}
        actions={[
          {
            label: "Upload Media Asset",
            icon: UploadCloud,
            variant: "primary",
            onClick: handleOpenUpload,
          },
        ]}
      />

      {/* ── 2. Top Metric KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Assets
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {totalAssets}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Photos &amp; Graphics
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {imageCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2D1B22] border border-[#FECDD3]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Dual QC Videos
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {videoCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-xs">
            <Video className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Marketing Banners
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {bannerCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Reusable AdminDataTable ── */}
      <AdminDataTable<MediaAsset>
        data={mediaList}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search media assets by name or format..."
        searchFields={["name", "format", "category"]}
        filters={filterOptions}
        bulkActions={bulkActions}
        defaultSortKey="uploaded_at"
        defaultSortDirection="desc"
        emptyTitle="No media assets"
        emptyDescription="Upload photos, videos, or documents to Lennox CDN."
        emptyAction={{
          label: "Upload Asset",
          onClick: handleOpenUpload,
        }}
      />

      {/* ── 4. Slide-Over Panel: Media Asset Uploader ── */}
      <SlideOver
        isOpen={isUploadSlideOverOpen}
        onClose={() => setIsUploadSlideOverOpen(false)}
        title="Upload Media Asset"
        description="Upload images, dual-video demo files, or promotional banners to CDN."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsUploadSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveUpload}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer"
            >
              Commit Asset
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveUpload} className="space-y-5">
          <AdminFormSection title="Asset Metadata">
            <AdminInput
              label="Asset Name / Description"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. EX5 Quadcopter Hero Angle"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminSelect
                label="Asset Type"
                value={formType}
                onChange={(e) => setFormType(e.target.value as typeof formType)}
                options={[
                  { value: "image", label: "Product Imagery / Photo" },
                  { value: "video", label: "Dual QC Video Demonstration" },
                  { value: "document", label: "Technical PDF Specification" },
                ]}
              />
              <AdminSelect
                label="Storefront Scope"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as typeof formCategory)}
                options={[
                  { value: "product", label: "Product Catalog" },
                  { value: "banner", label: "Homepage Header Banner" },
                  { value: "dual-video", label: "QC Teardown Video Slot" },
                  { value: "brand", label: "Manufacturer Emblem" },
                ]}
              />
            </div>
          </AdminFormSection>

          <AdminFormSection title="File Payload">
            <AdminUploader
              label="Drop or Select Local File"
              values={formUploads}
              onChange={setFormUploads}
              maxFiles={1}
            />

            <div className="pt-2">
              <AdminInput
                label="Or Direct CDN / Video Embed URL"
                type="url"
                value={formDirectUrl}
                onChange={(e) => setFormDirectUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </AdminFormSection>
        </form>
      </SlideOver>

      {/* ── 5. Preview Modal ── */}
      <Modal
        isOpen={Boolean(previewAsset)}
        onClose={() => setPreviewAsset(null)}
        title={previewAsset?.name || "Media Preview"}
        size="lg"
      >
        {previewAsset && (
          <div className="space-y-4 pt-1">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
              {previewAsset.type === "image" ? (
                <Image
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="text-white text-center space-y-2 p-4">
                  <Video className="w-12 h-12 mx-auto text-[#2F65F6]" />
                  <span className="font-mono text-xs block">{previewAsset.url}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs font-mono">
              <span className="text-slate-400">
                {previewAsset.format} • {previewAsset.dimensions} • {previewAsset.size}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(previewAsset.url);
                  toast.info("Copied CDN URL.");
                }}
                className="text-[#2F65F6] hover:underline font-bold"
              >
                Copy CDN URL
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
