"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItemType {
  id: string;
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItemType[];
  addItem: (item: Omit<WishlistItemType, "addedAt">) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<WishlistItemType, "addedAt">) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().isInWishlist(item.productId)) {
          set({
            items: [
              ...get().items,
              { ...item, addedAt: new Date().toISOString() },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      toggleItem: (item) => {
        if (get().isInWishlist(item.productId)) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      clearWishlist: () => set({ items: [] }),

      getTotalItems: () => get().items.length,
    }),
    {
      name: "lennox_wishlist_storage",
    }
  )
);
