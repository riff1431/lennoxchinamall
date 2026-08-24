"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareItemType {
  id: string;
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  rating: number;
  category?: string;
  brand?: string;
  specifications?: Record<string, string>;
  addedAt: string;
}

interface CompareStore {
  items: CompareItemType[];
  addItem: (item: Omit<CompareItemType, "addedAt">) => boolean;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<CompareItemType, "addedAt">) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  getTotalItems: () => number;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const current = get().items;
        if (current.length >= 4) {
          return false; // Limit to 4 items max for comparison
        }
        if (!get().isInCompare(item.productId)) {
          set({
            items: [...current, { ...item, addedAt: new Date().toISOString() }],
          });
          return true;
        }
        return true;
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      toggleItem: (item) => {
        if (get().isInCompare(item.productId)) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      isInCompare: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      clearCompare: () => set({ items: [] }),

      getTotalItems: () => get().items.length,
    }),
    {
      name: "lennox_compare_storage",
    }
  )
);
