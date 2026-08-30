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
  Play,
  ExternalLink,
  Loader2,
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
  AdminFormSection,
} from "@/components/admin/forms";
import { MediaDropzone, AnalyzedMediaFile } from "@/components/admin/MediaDropzone";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatDate } from "@/utils/helpers";
import { MOCK_MEDIA, MediaAsset } from "@/lib/mockData";
import { uploadMediaFile } from "@/app/actions/storage";

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:video/") || url.startsWith("blob:")) return true;
  return (
    /\.(mp4|webm|mov|avi|mkv|m4v|flv|wmv|3gp|ogv|ts|qt)(\?.*)?$/i.test(url) ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("/storage/hero-ad/") ||
    url.includes("/videos/")
  );
}

function getEmbedVideoUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("vimeo.com/") && !url.includes("player.vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  if (url.includes("/embed/")) {
    return url;
  }
  return null;
}

export default function AdminMediaPage() {
  const toast = useAdminToast();
  const [mediaList, setMediaList] = useState<MediaAsset[]>(MOCK_MEDIA);

  // Modals & SlideOver
  const [isUploadSlideOverOpen, setIsUploadSlideOverOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Upload Form Fields
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"image" | "video" | "document">("image");
  const [formCategory, setFormCategory] = useState<MediaAsset["category"]>("product");
  const [analyzedFile, setAnalyzedFile] = useState<AnalyzedMediaFile | null>(null);
  const [formDirectUrl, setFormDirectUrl] = useState("");

  const handleOpenUpload = () => {
    setFormName("");
    setFormType("image");
    setFormCategory("product");
    setAnalyzedFile(null);
    setFormDirectUrl("");
    setIsUploadSlideOverOpen(true);
  };

  const handleFileAnalyzed = (analyzed: AnalyzedMediaFile | null) => {
    setAnalyzedFile(analyzed);
    if (analyzed) {
      if (!formName) {
        setFormName(analyzed.name.replace(/\.[^/.]+$/, ""));
      }
      setFormType(analyzed.type);
      setFormCategory(analyzed.suggestedCategory);
    }
  };

  const handleDirectUrlChange = (url: string) => {
    setFormDirectUrl(url);
    if (url.trim()) {
      if (isVideoUrl(url)) {
        setFormType("video");
        setFormCategory("dual-video");
      } else if (/\.(pdf|doc|docx|txt)(\?.*)?$/i.test(url)) {
        setFormType("document");
      } else {
        setFormType("image");
      }
    }
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!analyzedFile && !formDirectUrl.trim()) {
      toast.warning("Please select a local file or specify a direct CDN / Video URL.");
      return;
    }

    setIsUploading(true);

    try {
      let finalUrl = formDirectUrl.trim();
      let finalSize = "1.5 MB";
      let finalDimensions = "1920x1080";
      let finalFormat = formType === "video" ? "MP4" : "JPG";
      let finalType = formType;

      if (analyzedFile) {
        finalSize = analyzedFile.size;
        finalDimensions = analyzedFile.dimensions;
        finalFormat = analyzedFile.format;
        finalType = analyzedFile.type;

        // Upload to storage bucket via Server Action
        const formData = new FormData();
        formData.append("file", analyzedFile.file);
        formData.append("bucket", "products");
        formData.append("folder", analyzedFile.type === "video" ? "videos" : "media");

        const uploadRes = await uploadMediaFile(formData);
        if (uploadRes.success && uploadRes.url) {
          finalUrl = uploadRes.url;
        } else {
          // Fallback to local Object URL / base64 for instant preview
          finalUrl = analyzedFile.previewUrl;
        }
      } else {
        const ext = finalUrl.split(".").pop()?.toUpperCase() || (isVideoUrl(finalUrl) ? "MP4" : "JPG");
        finalFormat = ext.length <= 5 ? ext : "MEDIA";
        finalType = isVideoUrl(finalUrl) ? "video" : "image";
      }

      const newAsset: MediaAsset = {
        id: `med-${Date.now()}`,
        name: formName.trim() || analyzedFile?.name || `Asset-${Date.now().toString().slice(-4)}`,
        url: finalUrl,
        type: finalType,
        category: formCategory,
        size: finalSize,
        dimensions: finalDimensions,
        format: finalFormat,
        uploaded_at: new Date().toISOString(),
      };

      setMediaList((prev) => [newAsset, ...prev]);
      toast.success(`${finalType === "video" ? "Video" : "Media"} asset "${newAsset.name}" added to Media Library.`);
      setIsUploadSlideOverOpen(false);
    } catch (err: unknown) {
      console.error("Save media asset error:", err);
      toast.error("Failed to commit asset. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAsset = (asset: MediaAsset) => {
    setMediaList((prev) => prev.filter((m) => m.id !== asset.id));
    toast.success(`Asset "${asset.name}" removed.`);
  };

  // Metrics
  const totalAssets = mediaList.length;
  const imageCount = mediaList.filter((m) => m.type === "image" && !isVideoUrl(m.url)).length;
  const videoCount = mediaList.filter((m) => m.type === "video" || isVideoUrl(m.url)).length;
  const bannerCount = mediaList.filter((m) => m.category === "banner").length;

  const columns: Column<MediaAsset>[] = [
    {
      header: "Asset Preview & Name",
      accessorKey: "name",
      sortable: true,
      cell: (row) => {
        const isVideo = row.type === "video" || isVideoUrl(row.url);
        const isDoc = !isVideo && (row.type === "document" || /\.(pdf|doc|docx|txt)(\?.*)?$/i.test(row.url));

        return (
          <div className="flex items-center gap-3">
            <div
              onClick={() => setPreviewAsset(row)}
              className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative cursor-pointer group shadow-2xs hover:ring-2 hover:ring-[#2F65F6] transition-all"
            >
              {isVideo ? (
                <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
                  <video
                    src={row.url}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                    <div className="w-6 h-6 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play className="w-3 h-3 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : isDoc ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-amber-500">
                  <FileText className="w-5 h-5 mb-0.5" />
                  <span className="text-[8px] font-mono font-bold uppercase text-slate-500">DOC</span>
                </div>
              ) : (
                <Image
                  src={row.url}
                  alt={row.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  unoptimized
                />
              )}
            </div>
            <div className="min-w-0">
              <span
                onClick={() => setPreviewAsset(row)}
                className="font-bold text-slate-900 dark:text-white text-xs font-heading block truncate max-w-xs hover:text-[#2F65F6] cursor-pointer"
                title={row.name}
              >
                {row.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                {row.format} • {row.dimensions} • {row.size}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Media Type",
      accessorKey: "type",
      sortable: true,
      cell: (row) => {
        const isVideo = row.type === "video" || isVideoUrl(row.url);
        const isDoc = !isVideo && (row.type === "document" || /\.(pdf|doc|docx|txt)(\?.*)?$/i.test(row.url));

        if (isVideo) {
          return (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex items-center gap-1 w-fit">
              <Video className="w-3 h-3" />
              VIDEO
            </span>
          );
        }

        if (isDoc) {
          return (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 flex items-center gap-1 w-fit">
              <FileText className="w-3 h-3" />
              DOCUMENT
            </span>
          );
        }

        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1 w-fit">
            <ImageIcon className="w-3 h-3" />
            IMAGE
          </span>
        );
      },
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
            : row.category === "dual-video"
            ? "rose"
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
        subtitle="Manage product imagery, factory QC video demonstrations, promotional banners, and CDN assets up to 100MB."
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
        onClose={() => !isUploading && setIsUploadSlideOverOpen(false)}
        title="Upload Media Asset"
        description="Upload any image, video file (MP4, MOV, WebM, AVI up to 100MB), or direct CDN link."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => setIsUploadSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={handleSaveUpload}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Commit Asset</span>
              )}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveUpload} className="space-y-5">
          <AdminFormSection title="File Payload (Images & Videos up to 100MB)">
            <MediaDropzone
              currentFile={analyzedFile}
              onFileAnalyzed={handleFileAnalyzed}
              maxSizeMB={100}
            />

            <div className="pt-2">
              <AdminInput
                label="Or Direct CDN / Video Embed URL"
                type="url"
                value={formDirectUrl}
                onChange={(e) => handleDirectUrlChange(e.target.value)}
                placeholder="https://... (.mp4, .mov, YouTube embed, etc.)"
              />
            </div>
          </AdminFormSection>

          <AdminFormSection title="Asset Metadata">
            <AdminInput
              label="Asset Name / Description"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Factory QC Drone Teardown 4K"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminSelect
                label="Asset Type"
                value={formType}
                onChange={(e) => setFormType(e.target.value as typeof formType)}
                options={[
                  { value: "image", label: "Product Imagery / Photo" },
                  { value: "video", label: "QC Video Demonstration / Video File" },
                  { value: "document", label: "Technical PDF Specification" },
                ]}
              />
              <AdminSelect
                label="Storefront Scope"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as typeof formCategory)}
                options={[
                  { value: "product", label: "Product Catalog" },
                  { value: "dual-video", label: "QC Teardown Video Slot" },
                  { value: "banner", label: "Homepage Header Banner" },
                  { value: "brand", label: "Manufacturer Emblem" },
                ]}
              />
            </div>
          </AdminFormSection>
        </form>
      </SlideOver>

      {/* ── 5. Preview Modal (Interactive Video Player & Image Lightbox) ── */}
      <Modal
        isOpen={Boolean(previewAsset)}
        onClose={() => setPreviewAsset(null)}
        title={previewAsset?.name || "Media Preview"}
        size="lg"
      >
        {previewAsset && (() => {
          const isVideo = previewAsset.type === "video" || isVideoUrl(previewAsset.url);
          const isDoc = !isVideo && (previewAsset.type === "document" || /\.(pdf|doc|docx|txt)(\?.*)?$/i.test(previewAsset.url));
          const embedUrl = getEmbedVideoUrl(previewAsset.url);

          return (
            <div className="space-y-4 pt-1">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner border border-slate-800">
                {isVideo ? (
                  embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={previewAsset.name}
                      className="w-full h-full rounded-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={previewAsset.url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain rounded-2xl bg-black"
                    />
                  )
                ) : isDoc ? (
                  <div className="text-white text-center space-y-3 p-6">
                    <FileText className="w-16 h-16 mx-auto text-amber-400" />
                    <p className="font-mono text-sm font-bold">{previewAsset.name}</p>
                    <a
                      href={previewAsset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F65F6] text-white font-bold text-xs hover:bg-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Document in New Tab
                    </a>
                  </div>
                ) : (
                  <Image
                    src={previewAsset.url}
                    alt={previewAsset.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {previewAsset.format} • {previewAsset.dimensions} • {previewAsset.size}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-md block">
                    {previewAsset.url}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(previewAsset.url);
                      toast.info("Copied CDN URL to clipboard.");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#2F65F6] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy CDN URL
                  </button>

                  <a
                    href={previewAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#2F65F6] text-white hover:bg-blue-600 font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Direct Link
                  </a>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

