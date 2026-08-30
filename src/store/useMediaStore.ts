"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MediaAsset } from "@/lib/mockData";

export const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: "med-v1",
    name: "2026-04-30-69f399744ce0c",
    url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov",
    type: "video",
    size: "11.5 MB",
    dimensions: "1080x1920",
    format: "MOV",
    category: "dual-video",
    uploaded_at: new Date().toISOString(),
  },
  {
    id: "med-v2",
    name: "2026-04-30-69f39980682e5",
    url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov",
    type: "video",
    size: "51.4 MB",
    dimensions: "1080x1920",
    format: "MOV",
    category: "dual-video",
    uploaded_at: new Date().toISOString(),
  },
  {
    id: "med-5",
    name: "lennox-hero-promo-banner.jpg",
    url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&auto=format&fit=crop&q=80",
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
    url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov",
    type: "video",
    size: "42.8 MB",
    dimensions: "1080p (60fps)",
    format: "MP4 / Dual-Video",
    category: "dual-video",
    uploaded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "med-1",
    name: "eachine-ex5-4k-hero.jpg",
    url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80",
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
    url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&auto=format&fit=crop&q=80",
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
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
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

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      media: DEFAULT_MEDIA_ASSETS,
      isLoaded: true,

      addMediaAsset: (newAsset: MediaAsset) => {
        set((state) => ({
          media: [newAsset, ...state.media],
        }));
      },

      deleteMediaAsset: (id: string) => {
        set((state) => ({
          media: state.media.filter((m) => m.id !== id),
        }));
      },

      resetToDefaults: () => {
        set({ media: DEFAULT_MEDIA_ASSETS });
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
      partialize: (state) => ({ media: state.media }),
    }
  )
);
