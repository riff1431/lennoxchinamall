"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MediaAsset } from "@/lib/mockData";

export const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: "med-v1",
    name: "2026-04-30-69f39980682e5",
    url: "https://pdeooqamevjpkcnaokac.supabase.co/storage/v1/object/public/products/products/videos/2026-04-30-69f39980682e5.mp4",
    type: "video",
    size: "41.5 MB",
    dimensions: "1080x1920",
    format: "MP4",
    category: "dual-video",
    uploaded_at: new Date().toISOString(),
  },
  {
    id: "med-v2",
    name: "2026-04-30-69f399744ce0c",
    url: "https://pdeooqamevjpkcnaokac.supabase.co/storage/v1/object/public/products/products/videos/2026-04-30-69f399744ce0c.mov",
    type: "video",
    size: "11.5 MB",
    dimensions: "1080x1920",
    format: "MOV",
    category: "dual-video",
    uploaded_at: new Date().toISOString(),
  },
  {
    id: "med-5",
    name: "lennox-hero-promo-banner.jpg",
    url: "https://pdeooqamevjpkcnaokac.supabase.co/storage/v1/object/public/products/products/demo/lennox-hero-promo-banner.jpg",
    type: "image",
    size: "1.8 MB",
    dimensions: "1920x600",
    format: "JPG",
    category: "banner",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "med-4",
    name: "drone-flight-test-qc.mp4",
    url: "https://pdeooqamevjpkcnaokac.supabase.co/storage/v1/object/public/products/products/videos/2026-04-30-69f39980682e5.mp4",
    type: "video",
    size: "41.5 MB",
    dimensions: "1080p (60fps)",
    format: "MP4 / Dual-Video",
    category: "dual-video",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "med-1",
    name: "eachine-ex5-4k-hero.jpg",
    url: "https://pdeooqamevjpkcnaokac.supabase.co/storage/v1/object/public/products/products/demo/eachine-ex5-4k-hero.jpg",
    type: "image",
    size: "1.4 MB",
    dimensions: "1920x1080",
    format: "JPG",
    category: "product",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: "med-2",
    name: "blitzwolf-speaker-rgb.jpg",
    url: "https://pdeooqamevjpkcnaokac.supabase.co/storage/v1/object/public/products/products/demo/blitzwolf-speaker-rgb.jpg",
    type: "image",
    size: "2.1 MB",
    dimensions: "2400x1600",
    format: "JPG",
    category: "product",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: "med-3",
    name: "creality-k1-3d-lab.jpg",
    url: "https://pdeooqamevjpkcnaokac.supabase.co/storage/v1/object/public/products/products/demo/creality-k1-3d-lab.jpg",
    type: "image",
    size: "3.2 MB",
    dimensions: "3000x2000",
    format: "JPG",
    category: "product",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
];

interface MediaState {
  media: MediaAsset[];
  isLoaded: boolean;
  addMediaAsset: (asset: MediaAsset) => void;
  deleteMediaAsset: (id: string) => void;
  resetToDefaults: () => void;
  getVideoAssets: () => MediaAsset[];
  getDualVideos: () => MediaAsset[];
}

export function normalizeAssetType(asset: MediaAsset): MediaAsset {
  const format = (asset.format || "").toUpperCase();
  const url = asset.url || "";
  const name = (asset.name || "").toLowerCase();

  const isImageExt =
    ["JPG", "JPEG", "PNG", "WEBP", "GIF", "SVG", "AVIF", "BMP", "ICO"].includes(format) ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|ico)$/i.test(name) ||
    url.startsWith("data:image/") ||
    (url.startsWith("https://images.unsplash.com") && !url.includes("video"));

  const isVideoExt =
    ["MP4", "WEBM", "MOV", "AVI", "MKV", "M4V", "FLV", "WMV", "3GP", "OGV"].includes(format) ||
    format.includes("VIDEO") ||
    /\.(mp4|webm|mov|avi|mkv|m4v|flv|wmv|3gp|ogv|ts|qt)(\?.*)?$/i.test(url) ||
    url.startsWith("data:video/") ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("/storage/hero-ad/");

  const isDocExt =
    ["PDF", "DOC", "DOCX", "TXT", "XLS", "XLSX", "CSV"].includes(format) ||
    /\.(pdf|doc|docx|txt|xls|xlsx|csv)(\?.*)?$/i.test(url) ||
    /\.(pdf|doc|docx|txt|xls|xlsx|csv)$/i.test(name);

  let correctedType: "image" | "video" | "document" = asset.type || "image";
  if (isImageExt) {
    correctedType = "image";
  } else if (isVideoExt) {
    correctedType = "video";
  } else if (isDocExt) {
    correctedType = "document";
  }

  return {
    ...asset,
    type: correctedType,
  };
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      media: DEFAULT_MEDIA_ASSETS.map(normalizeAssetType),
      isLoaded: true,

      addMediaAsset: (newAsset: MediaAsset) => {
        const normalized = normalizeAssetType(newAsset);
        set((state) => ({
          media: [normalized, ...state.media.map(normalizeAssetType)],
        }));
      },

      deleteMediaAsset: (id: string) => {
        set((state) => ({
          media: state.media.filter((m) => m.id !== id),
        }));
      },

      resetToDefaults: () => {
        set({ media: DEFAULT_MEDIA_ASSETS.map(normalizeAssetType) });
      },

      getVideoAssets: () => {
        const { media } = get();
        return media.filter(
          (m) =>
            m.type === "video" ||
            m.category === "dual-video" ||
            /\.(mp4|webm|mov|avi|mkv|m4v)(\?.*)?$/i.test(m.url) ||
            m.url.includes("youtube") ||
            m.url.includes("vimeo") ||
            m.url.includes("/storage/hero-ad/")
        );
      },

      getDualVideos: () => {
        const { media } = get();
        return media.filter(
          (m) =>
            m.category === "dual-video" ||
            m.type === "video" ||
            m.url.includes("/storage/hero-ad/")
        );
      },
    }),
    {
      name: "lennox_chinamall_media_v2",
      partialize: (state) => ({ media: state.media.map(normalizeAssetType) }),
    }
  )
);
