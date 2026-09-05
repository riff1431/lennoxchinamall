"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  X,
  ArrowRight,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuth } from "@/components/providers/AuthProvider";
import { isAdminRole } from "@/lib/auth/roles";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { SITE_NAME } from "@/lib/constants";
import { useMounted } from "@/hooks/useMounted";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatCurrency } from "@/utils/helpers";
import { HOT_SEARCH_TAGS, getLocalizedHotSearchTags } from "./headerConfig";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedCategoryName } from "@/lib/i18n/categoryI18n";

import { AnnouncementBar } from "./AnnouncementBar";
import { HeaderSearchBar } from "./HeaderSearchBar";
import { HeaderActions } from "./HeaderActions";
import { NavigationBar } from "./NavigationBar";
import { MobileDrawer } from "./MobileDrawer";

export interface HeaderProps {
  storeName?: string;
  tagline?: string;
  logoUrl?: string;
}

export function Header({
  storeName = SITE_NAME,
  logoUrl,
}: HeaderProps) {
  const router = useRouter();
  const { user, role } = useAuth();
  const { t, isSpanish } = useTranslation();
  const hotTags = getLocalizedHotSearchTags(isSpanish);

  const settingsLogo = useSettingsStore((s) => s.settings.branding?.primary_logo_url);
  const settingsStoreName = useSettingsStore((s) => s.settings.store_info?.store_name);

  const effectiveLogo = logoUrl || settingsLogo || "/logo-lennoxchinamall.png";
  const effectiveStoreName = storeName || settingsStoreName || SITE_NAME;

  // Scroll state for sticky glassmorphism
  const [isScrolled, setIsScrolled] = useState(false);

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mobile search state
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [mobileSuggestions, setMobileSuggestions] = useState<{
    products: { id: string; title: string; slug: string; price: number; image?: string; sku?: string }[];
    categories: { id: string; name: string; slug: string; productCount?: number; icon?: string | null }[];
    suggestions: string[];
  }>({ products: [], categories: [], suggestions: [] });

  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Categories Store
  const { categories, getRootCategories } = useCategoryStore();

  const isMounted = useMounted();
  const rootCategories = isMounted ? getRootCategories() : MOCK_CATEGORIES;

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsMobileSearchFocused(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close mobile search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(e.target as Node)
      ) {
        setIsMobileSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live debounced autocomplete for mobile search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!mobileSearchQuery.trim() || mobileSearchQuery.trim().length < 2) {
        setMobileSuggestions({ products: [], categories: [], suggestions: [] });
        return;
      }

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setMobileSuggestions(data);
        }
      } catch {
        const q = mobileSearchQuery.toLowerCase().trim();
        const matchedProducts = MOCK_PRODUCTS.filter(
          (p) => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        ).slice(0, 4);

        const currentCats = isMounted ? categories : [];
        const matchedCats = currentCats.filter((c) =>
          c.name.toLowerCase().includes(q)
        ).slice(0, 3);

        setMobileSuggestions({
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
    }, 180);

    return () => clearTimeout(timer);
  }, [mobileSearchQuery, categories, isMounted]);

  // Mobile search submit handler
  const handleMobileSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!mobileSearchQuery.trim()) return;
    setIsMobileSearchFocused(false);
    router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
  };

  const handleSelectMobileSuggestion = (path: string) => {
    setIsMobileSearchFocused(false);
    setMobileSearchQuery("");
    router.push(path);
  };

  const hasMobileSuggestions =
    isMobileSearchFocused && mobileSearchQuery.trim().length >= 2;

  return (
    <header className="w-full relative z-40 font-sans text-slate-900 bg-white">
      {/* ── 1. Top Announcement & Utility Bar ── */}
      <AnnouncementBar
        user={user}
        role={role}
        isAdminRole={isAdminRole}
      />

      {/* ── 2. Main Header Bar (Sticky) ── */}
      <div
        className={`sticky top-0 z-40 bg-white/98 backdrop-blur-md transition-all duration-300 border-b ${
          isScrolled ? "shadow-md border-slate-200 py-1 sm:py-2" : "border-slate-100 py-1.5 sm:py-2.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-700 hover:text-[#FF1028] rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
              aria-label={t.header.openMenu}
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Brand Logo - Responsive scaling for all mobile screen sizes */}
            <Link href="/" className="shrink-0 group py-0.5">
              <div
                className={`relative transition-all duration-300 ${
                  isScrolled
                    ? "h-8 w-[115px] xs:h-9 xs:w-[130px] sm:h-12 sm:w-[170px] md:h-14 md:w-[210px] lg:h-16 lg:w-[260px]"
                    : "h-9 w-[125px] xs:h-10 xs:w-[145px] sm:h-14 sm:w-[190px] md:h-18 md:w-[240px] lg:h-20 lg:w-[280px]"
                } group-hover:scale-[1.02]`}
              >
                <Image
                  src={effectiveLogo}
                  alt={`${effectiveStoreName} Logo`}
                  fill
                  sizes="(max-width: 640px) 145px, (max-width: 1024px) 240px, 280px"
                  className="object-contain object-left"
                  priority
                  unoptimized={effectiveLogo.startsWith("data:") || effectiveLogo.startsWith("blob:") || effectiveLogo.startsWith("http")}
                />
              </div>
            </Link>

            {/* Smart Search Bar (Desktop / Tablet) */}
            <HeaderSearchBar
              rootCategories={rootCategories}
              categories={categories}
              isMounted={isMounted}
            />

            {/* Header Actions (Notifications, Cart, Account, Wishlist) */}
            <HeaderActions />
          </div>

          {/* ── Mobile Full-Width Search Input & Autocomplete ── */}
          <div className="mt-1.5 md:hidden relative" ref={mobileSearchContainerRef}>
            <form onSubmit={handleMobileSearch} className="relative flex items-center bg-white rounded-lg border border-slate-200 focus-within:border-slate-300 shadow-xs h-10 overflow-hidden">
              <input
                type="text"
                placeholder={t.common.searchPlaceholder}
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                onFocus={() => setIsMobileSearchFocused(true)}
                className="w-full h-full pl-3.5 pr-12 text-xs text-slate-800 bg-transparent placeholder:text-slate-400 outline-none font-normal"
                style={{ fontSize: "16px" }}
                aria-label={t.common.search}
                role="combobox"
                aria-expanded={hasMobileSuggestions || (isMobileSearchFocused && !mobileSearchQuery)}
              />
              {mobileSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setMobileSearchQuery("")}
                  className="absolute right-11 text-slate-400 p-1 flex items-center cursor-pointer hover:text-slate-600"
                  aria-label={t.common.clear}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
              <div className="absolute right-0 top-0 bottom-0 flex items-center">
                <span className="h-5 w-px bg-slate-200" />
                <button
                  type="submit"
                  className="h-full px-3 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label={t.common.searchButton}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* ── Mobile Search Dropdown Autocomplete Panel ── */}
            <AnimatePresence>
              {isMobileSearchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 text-xs max-h-[75vh] flex flex-col"
                >
                  {/* Hot Search Quick Chips if query is short */}
                  {(!mobileSearchQuery || mobileSearchQuery.trim().length < 2) && (
                    <div className="p-3 bg-slate-50">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 font-mono">
                        {t.header.popularSearches}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {hotTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setMobileSearchQuery(tag);
                              setIsMobileSearchFocused(false);
                              router.push(`/search?q=${encodeURIComponent(tag)}`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#FF1028] hover:text-[#FF1028] text-slate-700 font-bold text-[11px] transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category Matches */}
                  {hasMobileSuggestions && mobileSuggestions.categories.length > 0 && (
                    <div className="p-2.5 bg-slate-50/80 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">
                        {t.header.suggestedCategories}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {mobileSuggestions.categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelectMobileSuggestion(`/categories/${cat.slug}`)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#FF1028] hover:text-[#FF1028] text-slate-700 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <CategoryIcon
                              icon={cat.icon}
                              name={cat.name}
                              className="w-3.5 h-3.5 text-[#FF1028]"
                            />
                            <span>{getLocalizedCategoryName(cat.name, isSpanish)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Products */}
                  {hasMobileSuggestions && (
                    <div className="p-2 space-y-1 overflow-y-auto max-h-64">
                      {mobileSuggestions.products.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          {t.header.noMatchingProducts}
                        </div>
                      ) : (
                        mobileSuggestions.products.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => handleSelectMobileSuggestion(`/products/${prod.slug}`)}
                            className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer group active:bg-slate-100"
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200">
                              {prod.image ? (
                                <Image src={prod.image} alt={prod.title} fill className="object-cover" />
                              ) : (
                                <Package className="w-4 h-4 m-auto text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-slate-800 group-hover:text-[#FF1028] block truncate text-xs transition-colors">
                                {prod.title}
                              </span>
                              <span className="font-mono font-black text-[11px] text-[#00143D]">
                                {formatCurrency(prod.price)}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* View All Button */}
                  {hasMobileSuggestions && (
                    <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                      <button
                        type="button"
                        onClick={() => handleMobileSearch()}
                        className="text-xs font-black text-[#FF1028] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer py-0.5"
                      >
                        <span>{t.header.viewAllResults} &quot;{mobileSearchQuery}&quot;</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── 3. Lower Navigation & Mega Menu Bar (Desktop) ── */}
      <NavigationBar />

      {/* ── 4. Mobile Slide-Out Drawer ── */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        logoUrl={effectiveLogo}
        storeName={effectiveStoreName}
      />
    </header>
  );
}
