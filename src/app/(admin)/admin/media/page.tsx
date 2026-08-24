"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Copy,
  Check,
  Trash2,
  Search,
  Eye,
  CheckSquare,
  Square,
  Play,
  Layers,
  HardDrive,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/utils/helpers";
import { MOCK_MEDIA, MediaAsset } from "@/lib/mockData";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaAsset[]>(MOCK_MEDIA);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Confirm Dialog State
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

  // Upload Form State
  const [formName, setFormName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formType, setFormType] = useState<"image" | "video" | "document">("image");
  const [formCategory, setFormCategory] = useState<MediaAsset["category"]>("product");
  const [formDimensions, setFormDimensions] = useState("1920x1080");
  const [formSize, setFormSize] = useState("1.5 MB");
  const [formFormat, setFormFormat] = useState("JPG");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    showToast(`Copied direct asset link to clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Upload Modal
  const handleOpenUploadModal = () => {
    setFormName("");
    setFormUrl("https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80");
    setFormType("image");
    setFormCategory("product");
    setFormDimensions("1920x1080");
    setFormSize("1.8 MB");
    setFormFormat("JPG");
    setIsUploadModalOpen(true);
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim()) {
      showToast("File name and URL are required.");
      return;
    }

    const newAsset: MediaAsset = {
      id: `med-${Date.now()}`,
      name: formName.trim(),
      url: formUrl.trim(),
      type: formType,
      category: formCategory,
      size: formSize.trim() || "1.2 MB",
      dimensions: formDimensions.trim() || "1920x1080",
      format: formFormat.trim().toUpperCase() || "JPG",
      uploaded_at: new Date().toISOString(),
    };

    setMediaList((prev) => [newAsset, ...prev]);
    showToast(`Asset "${formName}" added to Media Library.`);
    setIsUploadModalOpen(false);
  };

  const handleDeleteAsset = (asset: MediaAsset) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete "${asset.name}"?`,
      description: `This asset will be permanently removed from CDN storage. Any product or banner referencing this URL will need updating.`,
      onConfirm: () => {
        setMediaList((prev) => prev.filter((m) => m.id !== asset.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(asset.id);
          return next;
        });
        showToast(`Asset "${asset.name}" deleted.`);
      },
    });
  };

  // Multi-select toggles
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredMedia.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMedia.map((m) => m.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${selectedIds.size} Media Assets?`,
      description: `Are you sure you want to delete the selected ${selectedIds.size} files from the Media Library?`,
      onConfirm: () => {
        setMediaList((prev) => prev.filter((m) => !selectedIds.has(m.id)));
        showToast(`Deleted ${selectedIds.size} assets.`);
        setSelectedIds(new Set());
      },
    });
  };

  // Filtered Assets
  const filteredMedia = mediaList.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.format.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || asset.type === selectedType;
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Metrics
  const totalAssets = mediaList.length;
  const imageCount = mediaList.filter((m) => m.type === "image").length;
  const videoCount = mediaList.filter((m) => m.type === "video").length;
  const bannerCount = mediaList.filter((m) => m.category === "banner").length;

  const getCategoryBadgeTone = (cat: MediaAsset["category"]): BadgeTone => {
    switch (cat) {
      case "product":
        return "emerald";
      case "banner":
        return "purple";
      case "dual-video":
        return "red";
      case "review":
        return "amber";
      case "brand":
        return "blue";
      default:
        return "slate";
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* 1. Header */}
      <AdminPageHeader
        title="Media Asset Library"
        subtitle="Manage product imagery, factory QC video demonstrations, promotional banners, and CDN assets."
        badge={{ text: `${totalAssets} Media Files`, variant: "blue" }}
        breadcrumbs={[
          { label: "Catalogue", href: "/admin/products" },
          { label: "Media Library" },
        ]}
        actions={[
          {
            label: "Upload Asset",
            icon: Upload,
            variant: "primary",
            onClick: handleOpenUploadModal,
          },
        ]}
      />

      {/* 2. KPI Metrics Bar */}
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
              Photos & Graphics
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {imageCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
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
          <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
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
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets by file name, format, or category..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-[#2F65F6] transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
            >
              <option value="all">All Media Types</option>
              <option value="image">Images Only</option>
              <option value="video">Videos Only</option>
              <option value="document">Documents</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="product">Product Photography</option>
              <option value="banner">Promo Banners</option>
              <option value="dual-video">Dual-Video QC</option>
              <option value="review">Customer Reviews</option>
              <option value="brand">Brand Assets</option>
            </select>

            {/* Bulk Selection Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {selectedIds.size === filteredMedia.length && filteredMedia.length > 0 ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-[#2F65F6]" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    Select All
                  </>
                )}
              </button>

              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FEE2E2] dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-[#DC2626] dark:text-rose-300 border border-[#FECDD3] dark:border-rose-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete ({selectedIds.size})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Responsive Grid Display */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No media assets found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No files match your current search or filter criteria. Upload images or clear filters.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenUploadModal}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] transition-colors shadow-blue-500/25 shadow-md cursor-pointer"
          >
            Upload First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMedia.map((asset) => {
            const isSelected = selectedIds.has(asset.id);
            const isCopied = copiedId === asset.id;

            return (
              <div
                key={asset.id}
                className={`group rounded-2xl bg-white dark:bg-[#111827] border transition-all duration-200 overflow-hidden flex flex-col shadow-xs ${
                  isSelected
                    ? "border-[#2F65F6] ring-2 ring-[#2F65F6]/40"
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Thumbnail Preview Area */}
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  {asset.type === "image" ? (
                    <Image
                      src={asset.url}
                      alt={asset.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : asset.type === "video" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 group-hover:bg-slate-800 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 mt-2 font-mono">
                        QC Video Stream
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400">
                      <FileText className="w-10 h-10 text-slate-400" />
                      <span className="text-[10px] font-mono mt-1">{asset.format} Document</span>
                    </div>
                  )}

                  {/* Top Badges & Select Overlay */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(asset.id);
                      }}
                      className="pointer-events-auto w-6 h-6 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xs"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#2F65F6]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs">
                      {asset.format}
                    </span>
                  </div>

                  {/* Hover Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setPreviewAsset(asset)}
                      className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white hover:scale-110 border border-slate-200 dark:border-slate-600 transition-all cursor-pointer shadow-xs"
                      title="Preview Media"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset)}
                      className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white hover:scale-110 border border-slate-200 dark:border-slate-600 transition-all cursor-pointer shadow-xs"
                      title="Copy URL"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset)}
                      className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 hover:scale-110 border border-rose-500 transition-all cursor-pointer shadow-xs"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge
                        status={asset.category}
                        tone={getCategoryBadgeTone(asset.category)}
                        label={asset.category}
                        size="sm"
                      />
                      <span className="font-mono text-[10px] text-slate-400">
                        {asset.size}
                      </span>
                    </div>

                    <h4
                      className="font-bold text-xs text-slate-900 dark:text-white truncate mt-2 hover:text-[#2F65F6] transition-colors"
                      title={asset.name}
                    >
                      {asset.name}
                    </h4>
                  </div>

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{asset.dimensions || "—"}</span>
                    <span>{formatDate(asset.uploaded_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Media Asset to CDN"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveUpload} className="space-y-4 pt-1 text-xs text-slate-800 dark:text-slate-200">
          {/* File Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Asset File Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. eachine-ex5-4k-unboxing.jpg"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#2F65F6]"
              required
            />
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Asset Direct / Embed URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or https://youtube.com/embed/..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#2F65F6]"
              required
            />
          </div>

          {/* Type & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Media Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as "image" | "video" | "document")}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="image">Image (JPG, PNG, WebP)</option>
                <option value="video">Dual-Video (MP4 / YouTube Embed)</option>
                <option value="document">Document (PDF / Manual)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Usage Tag</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as MediaAsset["category"])}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="product">Product Photography</option>
                <option value="banner">Promotional Banner</option>
                <option value="dual-video">Dual-Video QC Teardown</option>
                <option value="review">Customer Review Media</option>
                <option value="brand">Brand Logo & Header</option>
              </select>
            </div>
          </div>

          {/* Dimensions, Size, Format */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Dimensions</label>
              <input
                type="text"
                value={formDimensions}
                onChange={(e) => setFormDimensions(e.target.value)}
                placeholder="1920x1080"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 outline-none font-mono focus:border-[#2F65F6]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">File Size</label>
              <input
                type="text"
                value={formSize}
                onChange={(e) => setFormSize(e.target.value)}
                placeholder="2.4 MB"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 outline-none font-mono focus:border-[#2F65F6]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Format</label>
              <input
                type="text"
                value={formFormat}
                onChange={(e) => setFormFormat(e.target.value)}
                placeholder="JPG"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 outline-none font-mono focus:border-[#2F65F6]"
              />
            </div>
          </div>

          {/* Submit Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] transition-colors shadow-blue-500/25 shadow-md cursor-pointer"
            >
              Register Asset
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Preview Modal */}
      {previewAsset && (
        <Modal
          isOpen={Boolean(previewAsset)}
          onClose={() => setPreviewAsset(null)}
          title={`Asset Preview: ${previewAsset.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 pt-1 text-xs text-slate-800 dark:text-slate-200">
            <div className="relative aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
              {previewAsset.type === "image" ? (
                <Image
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : previewAsset.type === "video" ? (
                <iframe
                  src={previewAsset.url}
                  title={previewAsset.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-16 h-16 text-slate-500 mb-2" />
                  <span>Document File Preview</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-slate-900 dark:text-white font-bold">{previewAsset.name}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">{previewAsset.dimensions} • {previewAsset.size}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={previewAsset.url}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewAsset)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2F65F6] text-white hover:bg-[#2563EB] transition-colors cursor-pointer shadow-blue-500/25 shadow-xs"
                >
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel="Delete Asset"
        variant="danger"
      />

      {/* 8. Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#DCFCE7] dark:bg-emerald-950 border border-[#BBF7D0] dark:border-emerald-800 text-[#16A34A] dark:text-emerald-300 px-5 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span>✓ {toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
