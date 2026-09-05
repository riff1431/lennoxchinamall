"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ArrowRight,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { formatCurrency } from "@/utils/helpers";
import { HOT_SEARCH_TAGS, getLocalizedHotSearchTags } from "./headerConfig";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedCategoryName } from "@/lib/i18n/categoryI18n";
import type { Category } from "@/types/database";

interface SearchCategory extends Partial<Category> {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  iconName?: string;
  product_count?: number;
}

interface HeaderSearchBarProps {
  rootCategories?: SearchCategory[];
  categories?: SearchCategory[];
  isMounted?: boolean;
}

export function HeaderSearchBar({
  categories = [],
  isMounted = true,
}: HeaderSearchBarProps) {
  const router = useRouter();
  const { t, isSpanish } = useTranslation();
  const hotTags = getLocalizedHotSearchTags(isSpanish);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<{
    products: { id: string; title: string; slug: string; price: number; image?: string; sku?: string }[];
    categories: { id: string; name: string; slug: string; productCount?: number; icon?: string | null }[];
    suggestions: string[];
  }>({ products: [], categories: [], suggestions: [] });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live autocomplete debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        setSearchSuggestions({ products: [], categories: [], suggestions: [] });
        return;
      }

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchSuggestions(data);
        }
      } catch {
        const q = searchQuery.toLowerCase();
        const matchedProducts = MOCK_PRODUCTS.filter(
          (p) => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        ).slice(0, 5);

        const currentCats = isMounted ? categories : [];
        const matchedCats = currentCats.filter((c) =>
          c.name.toLowerCase().includes(q)
        ).slice(0, 3);

        setSearchSuggestions({
          products: matchedProducts.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: p.base_price,
            image: p.media?.[0]?.url,
            sku: p.sku,
          })),
          categories: matchedCats.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            productCount: c.product_count,
            icon: c.icon || c.iconName,
          })),
          suggestions: HOT_SEARCH_TAGS.filter((t) => t.toLowerCase().includes(q)),
        });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, categories, isMounted]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    const url = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    setIsSearchFocused(false);
    router.push(url);
  };

  const handleSelectSuggestion = (path: string) => {
    setIsSearchFocused(false);
    setSearchQuery("");
    router.push(path);
  };

  const hasSuggestions = isSearchFocused && searchQuery.trim().length >= 2;

  return (
    <div ref={searchContainerRef} className="flex-1 max-w-2xl hidden md:block relative min-w-0">
      {/* ── Mercado Libre Style Clean Search Bar ── */}
      <form
        onSubmit={handleSearch}
        className="flex w-full items-center bg-white rounded-xl shadow-2xs hover:shadow-xs focus-within:shadow-sm border border-slate-200 focus-within:border-slate-300 transition-all duration-200 relative h-10.5 lg:h-11.5 overflow-hidden"
      >
        {/* Main Search Input */}
        <input
          type="text"
          placeholder={t.common.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          className="w-full h-full pl-4 pr-14 text-xs sm:text-sm text-slate-800 bg-transparent placeholder:text-slate-400 outline-none font-normal"
          aria-label={t.common.search}
          aria-autocomplete="list"
          role="combobox"
          aria-controls="search-suggestions-popup"
          aria-expanded={hasSuggestions}
        />

        {/* Clear Search Button */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-12 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Search Action Button with subtle left divider line */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          <span className="h-5.5 sm:h-6 w-px bg-slate-200" />
          <button
            type="submit"
            className="h-full px-4 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
            aria-label={t.common.search}
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </form>

      {/* Hot Search Quick Tags */}
      <div className="hidden lg:flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
        <span className="font-bold text-[#00143D] shrink-0">{t.common.hotKeywords}:</span>
        {hotTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setSearchQuery(tag);
              router.push(`/search?q=${encodeURIComponent(tag)}`);
            }}
            className="hover:text-[#FF1028] transition-colors cursor-pointer shrink-0"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ── Autocomplete Dropdown Panel ── */}
      <AnimatePresence>
        {hasSuggestions && (
          <motion.div
            id="search-suggestions-popup"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 text-xs"
            role="listbox"
          >
            {/* Category Matches */}
            {searchSuggestions.categories.length > 0 && (
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 font-mono">
                  {t.header.suggestedCategories}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {searchSuggestions.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectSuggestion(`/categories/${cat.slug}`)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#FF1028] hover:text-[#FF1028] text-slate-700 font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer hover:shadow-sm active:scale-[0.97]"
                      role="option"
                      aria-selected={false}
                    >
                      <CategoryIcon
                        icon={cat.icon}
                        name={cat.name}
                        className="w-3.5 h-3.5 text-[#FF1028]"
                      />
                      <span>{getLocalizedCategoryName(cat.name, isSpanish)}</span>
                      {cat.productCount && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({cat.productCount})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Products */}
            <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 block font-mono">
                {t.header.suggestedProducts}
              </span>
              {searchSuggestions.products.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">
                  {t.header.noMatchingProducts}
                </div>
              ) : (
                searchSuggestions.products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleSelectSuggestion(`/products/${prod.slug}`)}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer group active:bg-slate-100"
                    role="option"
                    aria-selected={false}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200">
                      {prod.image ? (
                        <Image src={prod.image} alt={prod.title} fill className="object-cover" />
                      ) : (
                        <Package className="w-5 h-5 m-auto text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-800 group-hover:text-[#FF1028] block truncate text-xs transition-colors">
                        {prod.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku || "PROD-GEN"}</span>
                    </div>
                    <span className="font-mono font-black text-xs text-[#00143D] shrink-0">
                      {formatCurrency(prod.price)}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* View All Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => handleSearch()}
                className="text-xs font-black text-[#FF1028] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <span>{t.header.viewAllResults} &quot;{searchQuery}&quot;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HeaderSearchBar;
