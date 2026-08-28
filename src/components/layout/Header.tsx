"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ChevronDown,
  Sparkles,
  Zap,
  Package,
  ShieldCheck,
  Coins,
  TrendingUp,
  X,
  Factory,
  Globe,
  Headphones,
  SlidersHorizontal,
  ChevronRight,
  LogOut,
  UserCheck,
  Clock,
  ArrowRight,
  Truck,
  Plane,
  Scale,
  Tag,
  Check,
  Layers,
  Flame,
  Radio,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCompareStore } from "@/store/useCompareStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { formatCurrency } from "@/utils/helpers";
import { useAuth } from "@/components/providers/AuthProvider";
import { isAdminRole, ROLE_LABELS } from "@/lib/auth/roles";
import { signout } from "@/app/actions/auth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SITE_NAME } from "@/lib/constants";

const HOT_SEARCH_TAGS = [
  "4K Drones",
  "3D Printers",
  "OBD2 Scanners",
  "Tactical Flashlights",
  "RC Cars",
  "Bluetooth Speakers",
];

const LANGUAGES = [
  { code: "EN", name: "English (US)", locale: "en" },
  { code: "ES", name: "Español", locale: "es" },
  { code: "FR", name: "Français", locale: "fr" },
  { code: "DE", name: "Deutsch", locale: "de" },
  { code: "AR", name: "العربية", locale: "ar" },
];

const CURRENCIES = [
  { code: "USDT", symbol: "₮", label: "USDT (Binance Pay - Zero Fee)", isCrypto: true },
  { code: "USD", symbol: "$", label: "USD ($)", isCrypto: false },
  { code: "EUR", symbol: "€", label: "EUR (€)", isCrypto: false },
  { code: "GBP", symbol: "£", label: "GBP (£)", isCrypto: false },
];

const NAV_LINKS = [
  { label: "Home", href: "/", icon: null },
  { label: "Flash Deals", href: "/categories/flash-deals", badge: "HOT", badgeColor: "bg-[#FF1028] text-white", icon: Flame },
  { label: "New Arrivals", href: "/categories/new-arrivals", icon: Sparkles },
  { label: "Brands", href: "/admin/brands", icon: Tag },
  { label: "Track Order", href: "/account/orders", icon: Plane },
  { label: "Factory Hubs", href: "/admin/sourcing", icon: Factory },
];

export interface HeaderProps {
  storeName?: string;
  tagline?: string;
  logoUrl?: string;
}

export function Header({
  storeName = SITE_NAME,
  tagline = "Direct China Sourcing",
  logoUrl = "/logo-lennoxchinamall.png",
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Dynamic brand name parsing (e.g. "Lennox China Mall" -> primary: "LENNOX CHINA", accent: "MALL")
  const brandWords = (storeName || SITE_NAME || "Lennox China Mall").trim().split(/\s+/);
  const primaryText = brandWords.slice(0, -1).join(" ") || brandWords[0];
  const accentText = brandWords.length > 1 ? brandWords[brandWords.length - 1] : "";

  // Scroll state for sticky glassmorphism
  const [isScrolled, setIsScrolled] = useState(false);

  // Dynamic Categories Store
  const { categories, getRootCategories } = useCategoryStore();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<{
    products: { id: string; title: string; slug: string; price: number; image?: string; sku?: string }[];
    categories: { id: string; name: string; slug: string; productCount?: number; icon?: string | null }[];
    suggestions: string[];
  }>({ products: [], categories: [], suggestions: [] });

  // Navigation Menus State
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string>(MOCK_CATEGORIES[0]?.id || "");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);

  // Selected Language & Currency
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);

  // Auth State
  const { user, role, displayName, isAuthenticated } = useAuth();

  // Stores
  const cartTotalItems = useCartStore((state) => state.getTotalItems());
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistTotalItems = useWishlistStore((state) => state.getTotalItems());
  const compareTotalItems = useCompareStore((state) => state.getTotalItems());

  // Client hydration check
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const rootCategories = isMounted ? getRootCategories() : (MOCK_CATEGORIES as any);
  const currentSelectedCategory = rootCategories.find((c: any) => c.slug === selectedCategory);

  // Update hovered category default once loaded
  useEffect(() => {
    if (rootCategories.length > 0 && !rootCategories.some((c: any) => c.id === hoveredCategory)) {
      setHoveredCategory(rootCategories[0]?.id || "");
    }
  }, [rootCategories, hoveredCategory]);

  // Refs for click outside
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const departmentMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Live autocomplete debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchSuggestions({ products: [], categories: [], suggestions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchSuggestions(data);
        }
      } catch {
        // Fallback filter from local catalogue
        const q = searchQuery.toLowerCase();
        const matchedProducts = MOCK_PRODUCTS.filter(
          (p) => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        ).slice(0, 5);

        const currentCats = isMounted ? categories : MOCK_CATEGORIES;
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

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (departmentMenuRef.current && !departmentMenuRef.current.contains(e.target as Node)) {
        setIsDepartmentMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(e.target as Node)) {
        setIsCurrencyMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchFocused(false);
        setIsDepartmentMenuOpen(false);
        setIsMegaMenuOpen(false);
        setIsAccountMenuOpen(false);
        setIsLangMenuOpen(false);
        setIsCurrencyMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle Search Submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    let url = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    if (selectedCategory !== "all") {
      url += `&category=${selectedCategory}`;
    }
    setIsSearchFocused(false);
    router.push(url);
  };

  const handleSelectSuggestion = (path: string) => {
    setIsSearchFocused(false);
    router.push(path);
  };

  const handleSignOut = async () => {
    await signout();
    setIsAccountMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="w-full relative z-40 font-sans text-slate-900 bg-white">
      {/* ── 1. Slim Announcement & Global Utility Top Bar ── */}
      <div className="bg-[#00143D] text-slate-200 text-xs border-b border-blue-950/60 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          {/* Left Ticker / Value Prop */}
          <div className="flex items-center gap-4 text-[11px] font-medium tracking-wide">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider">
              <Plane className="w-3.5 h-3.5" />
              Direct China Airfreight
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              Save up to 65% with coupon <strong className="text-white bg-[#FF1028] px-1.5 py-0.5 rounded font-black">LENNOX10</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Factory QC Pass
            </span>
          </div>

          {/* Right Global Selectors & Links */}
          <div className="flex items-center gap-4 text-[11px]">
            {/* Language Picker Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-white/10"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold">{selectedLang.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#00143D] border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs text-white">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang);
                        setIsLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-900/60 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{lang.name}</span>
                      {selectedLang.code === lang.code && <Check className="w-3.5 h-3.5 text-[#10B981]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Picker Dropdown */}
            <div className="relative" ref={currencyMenuRef}>
              <button
                onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-white/10"
                aria-label="Select Currency"
              >
                <Coins className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-bold">{selectedCurrency.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCurrencyMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#00143D] border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs text-white">
                  {CURRENCIES.map((cur) => (
                    <button
                      key={cur.code}
                      onClick={() => {
                        setSelectedCurrency(cur);
                        setIsCurrencyMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-900/60 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold">{cur.code}</span>
                        <span className="text-[10px] text-slate-400 block">{cur.label}</span>
                      </div>
                      {selectedCurrency.code === cur.code && <Check className="w-3.5 h-3.5 text-[#10B981]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Track Sourcing Order */}
            <Link
              href="/account/orders"
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors py-1"
            >
              <Plane className="w-3.5 h-3.5 text-blue-400" />
              <span>Track Sourcing</span>
            </Link>

            {/* Customer Support Desk */}
            <Link
              href="/account/support"
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors py-1"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
              <span>24/7 Sourcing Desk</span>
            </Link>

            {/* Admin Hub Direct Link if staff */}
            {user && isAdminRole(role) && (
              <Link
                href="/admin/dashboard"
                className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-2 py-0.5 rounded font-black text-[10px] transition-colors uppercase tracking-wider"
              >
                Admin Hub
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Main Executive Header Bar (Sticky) ── */}
      <div
        className={`sticky top-0 z-40 bg-white/98 backdrop-blur-md transition-all duration-300 border-b ${
          isScrolled ? "shadow-md border-slate-200 py-1.5 sm:py-2.5" : "border-slate-100 py-2 sm:py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#FF1028] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* ── Brand Logo Area ── */}
            <Link href="/" className="shrink-0 group py-1">
              <div
                className={`relative transition-all duration-300 ${
                  isScrolled
                    ? "h-11 w-[150px] sm:h-13 sm:w-[190px] md:h-16 md:w-[240px]"
                    : "h-14 w-[175px] sm:h-18 sm:w-[230px] md:h-22 md:w-[280px] lg:h-24 lg:w-[320px]"
                } group-hover:scale-[1.03]`}
              >
                <Image
                  src={logoUrl}
                  alt={`${storeName} Logo`}
                  fill
                  sizes="(max-width: 640px) 175px, (max-width: 1024px) 280px, 320px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* ── Smart Product Search Bar (Desktop / Tablet) ── */}
            <div ref={searchContainerRef} className="flex-1 max-w-2xl hidden md:block relative">
              <form
                onSubmit={handleSearch}
                className="flex w-full items-center rounded-2xl border-2 border-[#00143D] bg-white overflow-hidden shadow-xs focus-within:border-[#FF1028] focus-within:ring-2 focus-within:ring-[#FF1028]/15 transition-all"
              >
                {/* Dynamic Department Dropdown Picker */}
                <div className="hidden lg:block relative shrink-0" ref={departmentMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsDepartmentMenuOpen(!isDepartmentMenuOpen)}
                    className="h-full flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 shrink-0 cursor-pointer transition-colors select-none"
                    aria-expanded={isDepartmentMenuOpen}
                    aria-label="Filter search by department"
                  >
                    <div className="w-5 h-5 rounded-md bg-white border border-slate-200/80 flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs">
                      <CategoryIcon
                        icon={currentSelectedCategory ? (currentSelectedCategory.icon || currentSelectedCategory.iconName) : "Layers"}
                        name={currentSelectedCategory?.name || "All Departments"}
                        className="w-3.5 h-3.5 text-[#FF1028]"
                      />
                    </div>
                    <span className="max-w-[125px] truncate font-bold text-slate-800">
                      {currentSelectedCategory?.name || "All Departments"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        isDepartmentMenuOpen ? "rotate-180 text-[#FF1028]" : ""
                      }`}
                    />
                  </button>

                  {/* Floating Dropdown List */}
                  {isDepartmentMenuOpen && (
                    <div className="absolute left-0 top-[calc(100%+8px)] w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 p-1.5 max-h-80 overflow-y-auto font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory("all");
                          setIsDepartmentMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          selectedCategory === "all"
                            ? "bg-[#FF1028]/10 text-[#FF1028] font-black"
                            : "text-slate-700 hover:bg-slate-50 font-bold"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <Layers className="w-3.5 h-3.5 text-[#FF1028]" />
                          </div>
                          <span>All Departments</span>
                        </div>
                        {selectedCategory === "all" && <Check className="w-3.5 h-3.5 text-[#FF1028]" />}
                      </button>

                      <div className="h-px bg-slate-100 my-1" />

                      {rootCategories.map((cat: any) => {
                        const isSelected = selectedCategory === cat.slug;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat.slug);
                              setIsDepartmentMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#FF1028]/10 text-[#FF1028] font-bold"
                                : "text-slate-700 hover:bg-slate-50 font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                <CategoryIcon
                                  icon={cat.icon || cat.iconName}
                                  name={cat.name}
                                  className="w-4 h-4 text-[#FF1028]"
                                />
                              </div>
                              <span className="truncate">{cat.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#FF1028] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Main Search Input */}
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    placeholder="Search 100,000+ factory products (e.g. 4K Drone, 3D Printer, OBD2)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 bg-transparent placeholder:text-slate-400 outline-none font-medium"
                    aria-label="Search products"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 text-xs font-black font-heading uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </form>

              {/* Hot Search Quick Tags */}
              <div className="hidden lg:flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 overflow-hidden whitespace-nowrap">
                <span className="font-bold text-[#00143D]">Hot:</span>
                {HOT_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      router.push(`/search?q=${encodeURIComponent(tag)}`);
                    }}
                    className="hover:text-[#FF1028] transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* ── Autocomplete Dropdown Panel ── */}
              {isSearchFocused && searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 text-xs">
                  {/* Category Matches */}
                  {searchSuggestions.categories.length > 0 && (
                    <div className="p-3 bg-slate-50 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 font-mono">
                        Categories
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {searchSuggestions.categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleSelectSuggestion(`/categories/${cat.slug}`)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#FF1028] hover:text-[#FF1028] text-slate-700 font-bold transition-all text-xs flex items-center gap-1.5"
                          >
                            <CategoryIcon
                              icon={cat.icon}
                              name={cat.name}
                              className="w-3.5 h-3.5 text-[#FF1028]"
                            />
                            <span>{cat.name}</span>
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
                      Matching Factory Products
                    </span>
                    {searchSuggestions.products.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-xs">
                        No direct matches found for &quot;{searchQuery}&quot;. Press Search to see all results.
                      </div>
                    ) : (
                      searchSuggestions.products.map((prod) => (
                        <button
                          key={prod.id}
                          onClick={() => handleSelectSuggestion(`/products/${prod.slug}`)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors cursor-pointer group"
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
                      onClick={handleSearch}
                      className="text-xs font-black text-[#FF1028] hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                      <span>View all results for &quot;{searchQuery}&quot;</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Header Actions (Compare, Wishlist, Notifications, Account, Cart) ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
              {/* Compare Action Button */}
              <Link
                href="/categories"
                title="Product Comparison"
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-blue-300 transition-all duration-200 hidden sm:flex items-center justify-center cursor-pointer group shadow-2xs hover:shadow-sm text-slate-700 hover:text-blue-600"
                aria-label="View Product Comparison"
              >
                <Scale className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-110 transition-transform" />
                {isMounted && compareTotalItems > 0 && (
                  <span
                    suppressHydrationWarning
                    className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-blue-600 text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border-2 border-white shadow-xs animate-in zoom-in-50"
                  >
                    {compareTotalItems}
                  </span>
                )}
              </Link>

              {/* Wishlist Action Button */}
              <Link
                href="/account/wishlist"
                title="My Wishlist"
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-red-300 transition-all duration-200 flex items-center justify-center cursor-pointer group shadow-2xs hover:shadow-sm text-slate-700 hover:text-[#FF1028]"
                aria-label="View Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-110 group-hover:fill-[#FF1028] transition-all" />
                {isMounted && wishlistTotalItems > 0 && (
                  <span
                    suppressHydrationWarning
                    className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#FF1028] text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border-2 border-white shadow-xs animate-in zoom-in-50"
                  >
                    {wishlistTotalItems}
                  </span>
                )}
              </Link>

              {/* Notification Bell */}
              <div className="hidden sm:block">
                <NotificationBell variant="storefront" />
              </div>

              {/* Account Dropdown Menu */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl text-slate-700 hover:text-[#00143D] hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                  aria-label="Account Menu"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#00143D] text-white flex items-center justify-center text-[10px] sm:text-xs font-black shadow-xs shrink-0">
                    {user ? (displayName ? displayName[0].toUpperCase() : "U") : <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-[10px] text-slate-400 font-semibold leading-tight">
                      {user ? "Signed in as" : "Welcome"}
                    </span>
                    <span className="text-xs font-black text-[#00143D] leading-tight flex items-center gap-1">
                      {user ? displayName || "My Account" : "Account"}
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </span>
                  </div>
                </button>

                {/* Account Menu Dropdown */}
                {isAccountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                    {user ? (
                      <div className="space-y-1">
                        <div className="p-3 bg-slate-50 rounded-xl mb-2">
                          <span className="text-xs font-black text-[#00143D] block">{displayName || user.email}</span>
                          <span className="text-[10px] font-mono font-bold text-[#FF1028] uppercase">
                            Role: {role ? ROLE_LABELS[role] || role : "Customer"}
                          </span>
                        </div>

                        {isAdminRole(role) && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 p-2 rounded-lg bg-[#FF1028]/10 text-[#FF1028] font-bold hover:bg-[#FF1028]/20 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Executive Admin Panel</span>
                          </Link>
                        )}

                        <Link
                          href="/account/profile"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          href="/account/orders"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                        >
                          <Package className="w-4 h-4 text-slate-500" />
                          <span>My Orders &amp; Air Cargo</span>
                        </Link>

                        <Link
                          href="/account/wishlist"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                        >
                          <Heart className="w-4 h-4 text-slate-500" />
                          <span>Wishlist ({wishlistTotalItems})</span>
                        </Link>

                        <Link
                          href="/account/support"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                        >
                          <Headphones className="w-4 h-4 text-slate-500" />
                          <span>Support Tickets</span>
                        </Link>

                        <div className="pt-2 border-t border-slate-100 mt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-red-50 text-red-600 font-bold transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 space-y-3">
                        <div className="text-center pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800 block">
                            Direct Factory Sourcing Gateway
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Zero fees, fast USDT settlement &amp; factory tracking
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link
                            href="/auth/login"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="w-full bg-[#00143D] hover:bg-[#002366] text-white text-center py-2 rounded-xl text-xs font-black transition-colors"
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/auth/register"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-center py-2 rounded-xl text-xs font-bold transition-colors"
                          >
                            Join Free / Register
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Shopping Cart Premium Capsule Button ── */}
              <button
                onClick={openCart}
                className="flex items-center gap-2 sm:gap-2.5 bg-gradient-to-r from-[#00143D] via-[#001F5C] to-[#000F2E] hover:from-[#001E5B] hover:to-[#00143D] border border-blue-900/60 hover:border-amber-400/40 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                aria-label={`Shopping cart with ${isMounted ? cartTotalItems : 0} items`}
                suppressHydrationWarning
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white group-hover:scale-110 transition-transform" />
                  {isMounted && cartTotalItems > 0 && (
                    <span
                      suppressHydrationWarning
                      className="absolute -top-2 -right-2.5 min-w-[17px] sm:min-w-[18px] h-[17px] sm:h-[18px] bg-[#FF1028] text-white rounded-full text-[9px] sm:text-[10px] font-black flex items-center justify-center px-1 border-2 border-[#00143D] shadow-xs"
                    >
                      {cartTotalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[9px] text-amber-300 font-extrabold uppercase tracking-wider">
                    MY CART
                  </span>
                  <span
                    suppressHydrationWarning
                    className="text-xs font-black text-white font-mono tracking-tight"
                  >
                    {formatCurrency(isMounted ? cartSubtotal : 0)}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* ── Mobile Full-Width Search Input (Below Header Bar) ── */}
          <div className="mt-2 md:hidden relative">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search factory products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-[72px] min-h-[44px] rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#FF1028] focus:ring-2 focus:ring-[#FF1028]/10 font-medium transition-all"
                style={{ fontSize: '16px' }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-[56px] text-slate-400 p-1.5 min-h-[44px] flex items-center"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-2 rounded-lg bg-[#FF1028] text-white text-xs font-black uppercase shadow-xs min-h-[36px]"
              >
                Go
              </button>
            </form>

            {/* Mobile Autocomplete Suggestions Sheet */}
            {isSearchFocused && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in text-xs max-h-72 overflow-y-auto">
                {searchSuggestions.products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleSelectSuggestion(`/products/${prod.slug}`)}
                    className="w-full text-left p-2.5 border-b border-slate-100 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded bg-slate-100 shrink-0 relative overflow-hidden">
                      {prod.image ? (
                        <Image src={prod.image} alt={prod.title} fill className="object-cover" />
                      ) : (
                        <Package className="w-4 h-4 m-auto text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-800 block truncate text-xs">{prod.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">${prod.price.toFixed(2)} USDT</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Lower Navigation & Mega Menu Bar (Desktop / Tablet) ── */}
      <div className="bg-white border-b border-slate-200 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 sm:gap-8 h-12">
            {/* Mega Menu Toggle Button */}
            <div className="relative" ref={megaMenuRef}>
              <button
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className="flex items-center gap-2.5 bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl font-black font-heading text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                aria-expanded={isMegaMenuOpen}
              >
                <Layers className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMegaMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* ── Mega Menu Floating Dropdown ── */}
              {isMegaMenuOpen && (
                <div
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                  className="absolute left-0 top-full mt-1.5 w-[780px] bg-white rounded-3xl border border-slate-200 shadow-2xl grid grid-cols-12 overflow-hidden z-50 animate-in fade-in zoom-in-95"
                >
                  {/* Left Column: Category Tabs */}
                  <div className="col-span-5 bg-slate-50 p-3 border-r border-slate-200 space-y-1">
                    {rootCategories.map((cat: any) => (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setHoveredCategory(cat.id)}
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          router.push(`/categories/${cat.slug}`);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                          hoveredCategory === cat.id
                            ? "bg-white text-[#FF1028] shadow-xs border border-slate-200 font-black"
                            : "text-slate-700 hover:text-[#00143D]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-md bg-white border border-slate-200/80 flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                            <CategoryIcon
                              icon={cat.icon || cat.iconName}
                              name={cat.name}
                              className="w-3.5 h-3.5 text-[#FF1028]"
                            />
                          </div>
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>

                  {/* Right Column: Subcategories & Direct Sourcing Showcase */}
                  <div className="col-span-7 p-6 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                        <h4 className="font-heading font-black text-sm text-[#00143D]">
                          {rootCategories.find((c: any) => c.id === hoveredCategory)?.name || "Subcategories"}
                        </h4>
                        <Link
                          href={`/categories/${rootCategories.find((c: any) => c.id === hoveredCategory)?.slug || "consumer-electronics"}`}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="text-xs font-bold text-[#FF1028] hover:underline flex items-center gap-0.5"
                        >
                          <span>Explore All</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {rootCategories.find((c: any) => c.id === hoveredCategory)?.subcategories?.map((sub: string, i: number) => (
                          <Link
                            key={i}
                            href={`/categories/${rootCategories.find((c: any) => c.id === hoveredCategory)?.slug || "all"}`}
                            onClick={() => setIsMegaMenuOpen(false)}
                            className="p-2 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-[#00143D] font-medium transition-colors block"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Featured Factory Banner in Mega Menu */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#00143D] to-[#002366] text-white flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-300">
                          Direct Factory Deal
                        </span>
                        <h5 className="font-heading font-black text-xs">USDT Zero Fee Settlement</h5>
                      </div>
                      <Link
                        href="/categories/flash-deals"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="bg-[#FF1028] hover:bg-[#E00B20] text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Nav Links */}
            <nav className="flex items-center gap-1 sm:gap-6 text-xs font-bold text-slate-700">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative py-2 px-1 flex items-center gap-1.5 transition-colors group ${
                      isActive ? "text-[#FF1028] font-black" : "hover:text-[#FF1028]"
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${link.badgeColor}`}>
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF1028] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* ── 4. Mobile Slide-Out Drawer Menu ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Container */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <Link href="/" className="shrink-0">
                  <div className="relative h-12 w-[165px]">
                    <Image src={logoUrl} alt={`${storeName} Logo`} fill sizes="165px" className="object-contain object-left" />
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Quick Card in Drawer */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                {user ? (
                  <div>
                    <span className="text-xs font-black text-[#00143D] block">{displayName || user.email}</span>
                    <span className="text-[10px] text-[#FF1028] font-bold uppercase">{role}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Direct Factory Sourcing</span>
                    <span className="text-[10px] text-slate-400">Join free for wholesale prices</span>
                  </div>
                )}
                {user ? (
                  <button onClick={handleSignOut} className="text-xs font-bold text-red-600 hover:underline">
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-[#00143D] text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">
                  Navigation
                </span>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-800"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${link.badgeColor}`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Accordion Categories */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">
                  Departments
                </span>
                {rootCategories.map((cat: any) => (
                  <div key={cat.id} className="border-b border-slate-100 pb-1">
                    <button
                      onClick={() =>
                        setMobileExpandedCat(mobileExpandedCat === cat.id ? null : cat.id)
                      }
                      className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                          <CategoryIcon
                            icon={cat.icon || cat.iconName}
                            name={cat.name}
                            className="w-3.5 h-3.5 text-[#FF1028]"
                          />
                        </div>
                        <span>{cat.name}</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          mobileExpandedCat === cat.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {mobileExpandedCat === cat.id && cat.subcategories && (
                      <div className="pl-7 py-1 space-y-1">
                        {cat.subcategories.map((sub: string, i: number) => (
                          <Link
                            key={i}
                            href={`/categories/${cat.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-1 text-[11px] text-slate-600 hover:text-[#FF1028]"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Settlement Currency:</span>
                <span className="font-bold text-[#00143D]">USDT (Binance Pay)</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                © {new Date().getFullYear()} China Mall Inc. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
