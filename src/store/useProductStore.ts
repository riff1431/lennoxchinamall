"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/database";
import { MOCK_PRODUCTS } from "@/lib/mockData";

interface ProductState {
  products: Product[];
  isLoaded: boolean;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | null;
  resetToDefaults: () => void;
  setProducts: (products: Product[]) => void;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getPublishedProducts: () => Product[];
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: MOCK_PRODUCTS,
      isLoaded: true,

      addProduct: (newProduct: Product) => {
        set((state) => {
          // If already exists, replace it, otherwise add to front
          const exists = state.products.some((p) => p.id === newProduct.id);
          if (exists) {
            return {
              products: state.products.map((p) =>
                p.id === newProduct.id ? { ...p, ...newProduct, updated_at: new Date().toISOString() } : p
              ),
            };
          }
          return {
            products: [newProduct, ...state.products],
          };
        });
      },

      updateProduct: (id: string, updates: Partial<Product>) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      deleteProduct: (id: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      duplicateProduct: (id: string) => {
        const { products } = get();
        const existing = products.find((p) => p.id === id);
        if (!existing) return null;

        const timestamp = Date.now();
        const duplicated: Product = {
          ...existing,
          id: `prod-${timestamp}`,
          title: `${existing.title} (Copy)`,
          sku: `${existing.sku}-COPY`,
          slug: `${existing.slug}-copy-${timestamp.toString().slice(-4)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          products: [duplicated, ...state.products],
        }));

        return duplicated;
      },

      setProducts: (newProducts: Product[]) => {
        set({ products: newProducts });
      },

      resetToDefaults: () => {
        set({ products: MOCK_PRODUCTS });
      },

      getProductById: (id: string) => {
        const { products } = get();
        return products.find((p) => p.id === id || p.slug === id);
      },

      getProductBySlug: (slug: string) => {
        const { products } = get();
        return products.find((p) => p.slug === slug || p.id === slug);
      },

      getPublishedProducts: () => {
        const { products } = get();
        return products.filter((p) => p.status === "published");
      },
    }),
    {
      name: "lennox_chinamall_products_v2",
      partialize: (state) => ({ products: state.products }),
    }
  )
);
