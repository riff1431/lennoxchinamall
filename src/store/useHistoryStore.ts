"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/database";

export interface HistoryItem {
  id: string;
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  viewedAt: string;
}

interface HistoryStore {
  items: HistoryItem[];
  addItem: (item: Omit<HistoryItem, "viewedAt">) => void;
  addProduct: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.filter((i) => i.productId !== item.productId);
        const newItem: HistoryItem = {
          ...item,
          viewedAt: new Date().toISOString(),
        };
        // Keep up to 24 items, newest first
        set({
          items: [newItem, ...existing].slice(0, 24),
        });
      },

      addProduct: (product) => {
        if (!product) return;
        const activeVariant = product.variants?.[0];
        const activePrice = activeVariant?.price || product.base_price || 0;
        const comparePrice = product.compare_at_price || undefined;
        const image =
          product.media?.[0]?.url ||
          product.variants?.[0]?.image_url ||
          "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80";

        get().addItem({
          id: `hist-${product.id}`,
          productId: product.id,
          title: product.title,
          slug: product.slug,
          image,
          price: activePrice,
          compareAtPrice: comparePrice,
        });
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      clearHistory: () => set({ items: [] }),
    }),
    {
      name: "lennox_browsing_history_storage",
    }
  )
);
