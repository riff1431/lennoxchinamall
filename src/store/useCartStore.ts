"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { calculateFreightCost } from "@/utils/shipping";
import { safeLocalStorage } from "@/utils/safeStorage";

export interface CartItemType {
  id: string; // unique item key: variantId or productId + attributes
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  stock: number;
  categoryId?: string;
  brandId?: string;
  attributes?: Record<string, string>;
  supplierCode?: string;
}

interface CartStore {
  items: CartItemType[];
  isOpen: boolean;
  couponCode: string | null;
  couponTitle: string | null;
  discountType: string | null;
  discountAmount: number;
  freeShipping: boolean;
  couponMessage: string | null;
  isApplyingCoupon: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItemType) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  revalidateCoupon: () => Promise<void>;
  removeCoupon: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getShippingCost: (method?: "air" | "sea" | "standard" | "express" | string) => number;
  getFinalTotal: (shippingMethod?: "air" | "sea" | "standard" | "express" | string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      couponTitle: null,
      discountType: null,
      discountAmount: 0,
      freeShipping: false,
      couponMessage: null,
      isApplyingCoupon: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === newItem.id);

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = Math.min(
            updatedItems[existingIndex].quantity + newItem.quantity,
            newItem.stock || 99
          );
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: newQty,
          };
          set({ items: updatedItems, isOpen: true });
        } else {
          set({ items: [...currentItems, newItem], isOpen: true });
        }

        // Revalidate applied coupon with new items
        get().revalidateCoupon();
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
        get().revalidateCoupon();
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.min(quantity, item.stock || 99) }
              : item
          ),
        });
        get().revalidateCoupon();
      },

      clearCart: () =>
        set({
          items: [],
          couponCode: null,
          couponTitle: null,
          discountType: null,
          discountAmount: 0,
          freeShipping: false,
          couponMessage: null,
        }),

      applyCoupon: async (code: string) => {
        const clean = code.trim().toUpperCase();
        if (!clean) {
          return { success: false, message: "Please enter a coupon code." };
        }

        set({ isApplyingCoupon: true });

        try {
          const res = await fetch("/api/promotions/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: clean,
              items: get().items,
              shippingCost: get().getShippingCost(),
            }),
          });

          const data = await res.json();

          if (data.valid) {
            set({
              couponCode: clean,
              couponTitle: data.coupon?.title || clean,
              discountType: data.coupon?.discountType || "percentage",
              discountAmount: data.discountAmount || 0,
              freeShipping: Boolean(data.freeShipping),
              couponMessage: data.message,
              isApplyingCoupon: false,
            });
            return { success: true, message: data.message };
          } else {
            set({
              couponMessage: data.message,
              isApplyingCoupon: false,
            });
            return { success: false, message: data.message || "Invalid coupon code." };
          }
        } catch {
          set({ isApplyingCoupon: false });
          return {
            success: false,
            message: "Unable to validate coupon at this moment.",
          };
        }
      },

      revalidateCoupon: async () => {
        const currentCode = get().couponCode;
        if (!currentCode || get().items.length === 0) {
          if (get().items.length === 0) {
            set({ discountAmount: 0, freeShipping: false });
          }
          return;
        }

        try {
          const res = await fetch("/api/promotions/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: currentCode,
              items: get().items,
              shippingCost: get().getShippingCost(),
            }),
          });

          const data = await res.json();
          if (data.valid) {
            set({
              discountAmount: data.discountAmount || 0,
              freeShipping: Boolean(data.freeShipping),
              couponMessage: data.message,
            });
          } else {
            // Min spend or scope no longer met
            set({
              discountAmount: 0,
              freeShipping: false,
              couponMessage: data.message,
            });
          }
        } catch {
          // Keep current if network fails
        }
      },

      removeCoupon: () =>
        set({
          couponCode: null,
          couponTitle: null,
          discountType: null,
          discountAmount: 0,
          freeShipping: false,
          couponMessage: null,
        }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return (
          Math.round(
            get().items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            ) * 100
          ) / 100
        );
      },

      getShippingCost: (method = "air") => {
        const items = get().items;
        const subtotal = get().getSubtotal();
        const isFree = get().freeShipping;
        return calculateFreightCost(items, method, {
          isFreeShippingPromo: isFree,
          orderSubtotal: subtotal,
        });
      },

      getFinalTotal: (shippingMethod = "air") => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingCost(shippingMethod);
        const discount = get().discountAmount;
        const total = Math.max(0, subtotal - discount + shipping);
        return Math.round(total * 100) / 100;
      },
    }),
    {
      name: "lennox_cart_storage",
      storage: createJSONStorage(() => safeLocalStorage),
    }
  )
);
