"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Category } from "@/types/database";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { safeLocalStorage } from "@/utils/safeStorage";

interface CategoryState {
  categories: Category[];
  isLoaded: boolean;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;
  resetToDefaults: () => void;
  getRootCategories: () => Category[];
  getCategoryBySlug: (slug: string) => Category | undefined;
  getCategoryById: (id: string) => Category | undefined;
  setCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: MOCK_CATEGORIES as Category[],
      isLoaded: true,

      setCategories: (newCategories: Category[]) => {
        set({ categories: newCategories });
      },

      addCategory: (newCategory: Category) => {
        set((state) => ({
          categories: [newCategory, ...state.categories],
        }));
      },

      updateCategory: (id: string, updates: Partial<Category>) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id
              ? {
                  ...cat,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : cat
          ),
        }));
      },

      deleteCategory: (id: string) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }));
      },

      reorderCategories: (orderedIds: string[]) => {
        set((state) => {
          const map = new Map(state.categories.map((c) => [c.id, c]));
          const reordered: Category[] = [];
          orderedIds.forEach((id, idx) => {
            const cat = map.get(id);
            if (cat) {
              reordered.push({ ...cat, position: idx + 1 });
              map.delete(id);
            }
          });
          // Add any remaining
          map.forEach((cat) => reordered.push(cat));
          return { categories: reordered };
        });
      },

      resetToDefaults: () => {
        set({ categories: MOCK_CATEGORIES as Category[] });
      },

      getRootCategories: () => {
        const { categories } = get();
        const cats = categories && categories.length > 0 ? categories : (MOCK_CATEGORIES as Category[]);
        return cats
          .filter((c) => !c.parent_id && (c.is_active !== false))
          .sort((a, b) => (a.position || 0) - (b.position || 0));
      },

      getCategoryBySlug: (slug: string) => {
        const { categories } = get();
        const cats = categories && categories.length > 0 ? categories : (MOCK_CATEGORIES as Category[]);
        return cats.find((c) => c.slug === slug);
      },

      getCategoryById: (id: string) => {
        const { categories } = get();
        const cats = categories && categories.length > 0 ? categories : (MOCK_CATEGORIES as Category[]);
        return cats.find((c) => c.id === id);
      },
    }),
    {
      name: "lennox_chinamall_categories_v1",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ categories: state.categories }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.categories)) {
          state.categories = state.categories.map((cat) => ({
            ...cat,
            thumbnail_url: cat.thumbnail_url?.startsWith("blob:") ? null : cat.thumbnail_url,
            image_url: cat.image_url?.startsWith("blob:") ? null : cat.image_url,
          }));
        }
      },
    }
  )
);
