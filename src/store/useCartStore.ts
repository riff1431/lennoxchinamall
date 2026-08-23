"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  attributes?: Record<string, string>;
  supplierCode?: string;
}

interface CartStore {
  items: CartItemType[];
  isOpen: boolean;
  couponCode: string | null;
  discountAmount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItemType) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      discountAmount: 0,

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
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
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
      },

      clearCart: () => set({ items: [], couponCode: null, discountAmount: 0 }),

      applyCoupon: (code) => {
        const clean = code.trim().toUpperCase();
        if (clean === "LENNOX10") {
          const subtotal = get().getSubtotal();
          const discount = Math.round(subtotal * 0.1 * 100) / 100;
          set({ couponCode: clean, discountAmount: discount });
          return { success: true, message: "10% Welcome Discount applied!" };
        } else if (clean === "USDT5") {
          set({ couponCode: clean, discountAmount: 5 });
          return { success: true, message: "$5 USDT Promo Voucher applied!" };
        }
        return { success: false, message: "Invalid or expired coupon code" };
      },

      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),

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

      getFinalTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = subtotal > 50 || subtotal === 0 ? 0 : 4.99;
        const total = Math.max(0, subtotal - get().discountAmount + shipping);
        return Math.round(total * 100) / 100;
      },
    }),
    {
      name: "lennox_cart_storage",
    }
  )
);
