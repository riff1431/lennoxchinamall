"use client";

import React, { useState, useEffect, useRef } from "react";
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
  DollarSign,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { formatCurrency } from "@/utils/helpers";

const HOT_SEARCH_TAGS = [
  "4K Drones",
  "3D Printers",
  "OBD2 Scanners",
  "Tactical Flashlights",
  "RC Cars",
  "Bluetooth Speakers",
];

const LANGUAGES = [
  { code: "en", name: "English (US)", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ar", name: "العربية", flag: "🇦🇪" },
];

const CURRENCIES = [
  { code: "USDT", symbol: "₮", label: "USDT (Binance Pay - Zero Fee)", isCrypto: true },
  { code: "USD", symbol: "$", label: "USD ($)", isCrypto: false },
  { code: "EUR", symbol: "€", label: "EUR (€)", isCrypto: false },
  { code: "GBP", symbol: "£", label: "GBP (£)", isCrypto: false },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<{
    products: { id: string; title: string; slug: string; price: number; image?: string }[];
    categories: { id: string; name: string; slug: string; productCount?: number }[];
    suggestions: string[];
  }>({ products: [], categories: [], suggestions: [] });

  // Navigation Menus State
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string>(MOCK_CATEGORIES[0]?.id || "");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Selected Language & Currency
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);

  // Stores
  const cartTotalItems = useCartStore((state) => state.getTotalItems());
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistTotalItems = useWishlistStore((state) => state.getTotalItems());

  // Refs for click outside
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Fetch predictive search results
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchSuggestions({ products: [], categories: [], suggestions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchSuggestions(data);
        }
      } catch {
        // Search suggestion error ignored
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      const catParam = selectedCategory !== "all" ? `&category=${selectedCategory}` : "";
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}${catParam}`);
    }
  };

  const activeCategoryData = MOCK_CATEGORIES.find((c) => c.id === hoveredCategory) || MOCK_CATEGORIES[0];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs font-montserrat select-none">
      {/* ── 1. Top Utility & Localization Bar (Deep Navy #00143D) ── */}
      <div className="bg-[#00143D] text-slate-300 text-[11px] py-1.5 px-4 border-b border-[#000B24]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Announcement & Trust Badge */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#FF1028] font-black bg-white/10 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
              <Zap className="w-3 h-3 fill-[#FF1028]" /> DIRECT SOURCING
            </span>
            <span className="hidden sm:inline text-slate-200">
              Save up to 65% with coupon <strong className="text-white bg-[#FF1028] px-1.5 py-0.2 rounded font-black">LENNOX10</strong>
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-[#10B981] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Quality Checked at Factory Gate
            </span>
          </div>

          {/* Right Language, Currency & Quick Links */}
          <div className="flex items-center gap-3 sm:gap-4 text-slate-300">
            {/* Language & Currency Dropdown Trigger */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 hover:text-white transition-colors bg-[#000B24] hover:bg-[#002366] px-2 py-0.5 rounded text-[11px] font-semibold border border-white/10"
              >
                <span>{selectedLang.flag}</span>
                <span>{selectedLang.code.toUpperCase()} / {selectedCurrency.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Language / Currency Popup */}
              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Select Language
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLang(lang);
                            setIsLangMenuOpen(false);
                          }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            selectedLang.code === lang.code
                              ? "bg-[#00143D] text-white"
                              : "hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                          {selectedLang.code === lang.code && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Settlement Currency
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {CURRENCIES.map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setSelectedCurrency(curr);
                            setIsLangMenuOpen(false);
                          }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            selectedCurrency.code === curr.code
                              ? "bg-[#FF1028] text-white"
                              : "hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {curr.isCrypto ? <Coins className="w-3.5 h-3.5 text-[#10B981]" /> : <DollarSign className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{curr.label}</span>
                          </span>
                          {selectedCurrency.code === curr.code && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Track Sourcing Order */}
            <Link
              href="/account/orders"
              className="hover:text-white transition-colors flex items-center gap-1 text-[11px] font-medium hidden sm:inline-flex"
            >
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span>Track Sourcing</span>
            </Link>

            {/* Help / Ticket Desk */}
            <Link
              href="/account/support"
              className="hover:text-white transition-colors flex items-center gap-1 text-[11px] font-medium hidden lg:inline-flex"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-400" />
              <span>24/7 Sourcing Desk</span>
            </Link>

            {/* Admin Hub */}
            <Link
              href="/admin/dashboard"
              className="text-[11px] text-amber-300 hover:text-white font-bold transition-colors hidden md:inline"
            >
              Admin Hub
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Main Search & Branding Bar ── */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-700 hover:text-[#FF1028] rounded-lg hover:bg-slate-100"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Official Lennox China Mall Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/logo-lennoxchinamall.jpeg"
                alt="Lennox China Mall Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-[#00143D] leading-none">
                  LENNOX
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#FF1028] leading-none">
                  CHINAMALL
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-slate-500 uppercase flex items-center gap-1 mt-0.5">
                <span>Direct China Sourcing</span>
                <span className="w-1 h-1 rounded-full bg-[#10B981]"></span>
                <span className="text-[#10B981]">Wholesale</span>
              </span>
            </div>
          </Link>

          {/* Large Smart Search Bar (Desktop / Tablet) */}
          <div ref={searchContainerRef} className="flex-1 max-w-2xl hidden md:block relative">
            <form
              onSubmit={handleSearch}
              className="flex w-full items-center rounded-2xl border-2 border-[#00143D] bg-white overflow-hidden shadow-xs focus-within:border-[#FF1028] focus-within:ring-2 focus-within:ring-[#FF1028]/15 transition-all"
            >
              {/* Category Dropdown Picker */}
              <div className="relative shrink-0 border-r border-slate-200 bg-slate-50">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-slate-700 text-xs font-bold pl-3 pr-7 py-2.5 appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Search Input Field */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search 100,000+ direct factory products (e.g. 4K Drone, 3D Printer, OBD2)..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Red Search Submit Button (#FF1028) */}
              <button
                type="submit"
                className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-6 py-2.5 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>SEARCH</span>
              </button>
            </form>

            {/* Quick Hot Keyword Tags */}
            <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden text-[11px] text-slate-500">
              <span className="font-bold text-[#00143D] text-[10px] uppercase">Hot:</span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {HOT_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      router.push(`/search?q=${encodeURIComponent(tag)}`);
                    }}
                    className="hover:text-[#FF1028] hover:underline whitespace-nowrap transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Predictive Search Dropdown Panel */}
            {isSearchFocused && (searchSuggestions.products.length > 0 || searchSuggestions.categories.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-slate-100">
                {/* Matching Categories */}
                {searchSuggestions.categories.length > 0 && (
                  <div className="pb-3">
                    <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase block mb-1.5">
                      Matching Departments
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.slug}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="text-xs bg-slate-100 hover:bg-[#FF1028] hover:text-white px-3 py-1 rounded-lg font-bold text-slate-700 transition-colors"
                        >
                          {cat.name} ({cat.productCount}+)
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Product Matches with Thumbnails */}
                {searchSuggestions.products.length > 0 && (
                  <div className="pt-3">
                    <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase block mb-2">
                      Direct Factory Products
                    </span>
                    <div className="space-y-1.5">
                      {searchSuggestions.products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/products/${p.slug}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            {p.image && (
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200">
                                <Image
                                  src={p.image}
                                  alt={p.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span className="text-xs font-semibold text-slate-800 group-hover:text-[#FF1028] transition-colors line-clamp-1">
                              {p.title}
                            </span>
                          </div>
                          <span className="text-xs font-black text-[#FF1028] shrink-0 ml-2">
                            {formatCurrency(p.price)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Quick Actions (Wishlist, Account, Cart) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="p-2 text-slate-700 hover:text-[#FF1028] hover:bg-slate-50 rounded-xl transition-all relative flex flex-col items-center group"
              title="My Wishlist"
            >
              <div className="relative">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                {wishlistTotalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FF1028] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistTotalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-600 hidden lg:inline mt-0.5">
                Wishlist
              </span>
            </Link>

            {/* Account Dropdown */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="p-2 text-slate-700 hover:text-[#00143D] hover:bg-slate-50 rounded-xl transition-all flex flex-col items-center group cursor-pointer"
                title="My Sourcing Account"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-600 hidden lg:inline mt-0.5 flex items-center gap-0.5">
                  Account <ChevronDown className="w-2.5 h-2.5" />
                </span>
              </button>

              {/* Account Dropdown Menu */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="pb-2.5 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block">
                      Welcome to Lennox
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Wholesale China Sourcing Portal
                    </span>
                    <div className="flex gap-2 mt-2.5">
                      <Link
                        href="/auth/login"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white text-center py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  </div>

                  <ul className="space-y-1 text-xs font-medium text-slate-700">
                    <li>
                      <Link
                        href="/account/orders"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#FF1028] transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Sourcing Orders</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/addresses"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#FF1028] transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Shipping Addresses</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/support"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#FF1028] transition-colors"
                      >
                        <Headphones className="w-3.5 h-3.5 text-slate-400" />
                        <span>Support Tickets</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/returns"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#FF1028] transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>30-Day Returns</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Cart Trigger with Subtotal */}
            <button
              onClick={openCart}
              className="flex items-center gap-2.5 bg-[#00143D] hover:bg-[#FF1028] text-white px-3.5 sm:px-4 py-2.5 rounded-2xl transition-all cursor-pointer shadow-md group shrink-0"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                {cartTotalItems > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-[#FF1028] group-hover:bg-white group-hover:text-[#00143D] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center transition-colors shadow-xs">
                    {cartTotalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight text-left">
                <span className="text-[9px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider">
                  My Cart
                </span>
                <span className="text-xs font-black text-amber-300 group-hover:text-white">
                  {formatCurrency(cartSubtotal)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search input bar */}
        <form onSubmit={handleSearch} className="mt-2.5 flex md:hidden">
          <div className="flex w-full items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-[#FF1028] shadow-xs">
            <input
              type="text"
              placeholder="Search products direct from China..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#00143D] text-white px-4 py-2 text-xs font-bold"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* ── 3. Category Bar & Mega Menu (Banggood Signature Bar) ── */}
      <div className="bg-[#F8FAFC] border-t border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1">
            {/* Mega Category Menu Trigger */}
            <div className="relative" ref={megaMenuRef}>
              <button
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className="flex items-center gap-2.5 bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-3 font-black transition-colors cursor-pointer select-none rounded-t-xl shadow-xs tracking-wide"
              >
                <Menu className="w-4 h-4 stroke-[2.5]" />
                <span>ALL CATEGORIES</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isMegaMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Full Multi-Column Mega Menu Dropdown */}
              {isMegaMenuOpen && (
                <div className="absolute top-full left-0 w-[840px] bg-white border border-slate-200 shadow-2xl rounded-b-2xl z-50 flex overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Left Column: Category Department List */}
                  <div className="w-72 bg-slate-50 border-r border-slate-200 py-3 space-y-1">
                    {MOCK_CATEGORIES.map((category) => (
                      <div
                        key={category.id}
                        onMouseEnter={() => setHoveredCategory(category.id)}
                        className={`flex items-center justify-between px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors ${
                          hoveredCategory === category.id
                            ? "bg-white text-[#FF1028] border-l-4 border-[#FF1028] shadow-xs"
                            : "text-slate-700 hover:text-[#00143D]"
                        }`}
                      >
                        <span className="truncate">{category.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                    <div className="px-4 pt-2 border-t border-slate-200">
                      <Link
                        href="/categories"
                        className="text-[11px] font-black text-[#00143D] hover:text-[#FF1028] block"
                      >
                        Browse All Departments →
                      </Link>
                    </div>
                  </div>

                  {/* Right Pane: Subcategories & Sourcing Banner */}
                  <div className="flex-1 p-6 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                        <h4 className="text-sm font-black text-[#00143D]">
                          {activeCategoryData.name} Sourcing Line
                        </h4>
                        <Link
                          href={`/categories/${activeCategoryData.slug}`}
                          className="text-xs font-bold text-[#FF1028] hover:underline flex items-center gap-1"
                        >
                          <span>Explore Department</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Subcategory Pill Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {["Top Factory Picks", "Wholesale Bulk", "New Releases", "Clearance Lots", "Direct Tested", "Component Parts"].map((sub) => (
                          <Link
                            key={sub}
                            href={`/categories/${activeCategoryData.slug}`}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-[#FF1028] text-xs font-semibold text-slate-700 transition-colors border border-slate-100"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Promotional Sourcing Strip in Mega Menu */}
                    <div className="bg-gradient-to-r from-[#00143D] to-[#002366] text-white p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
                          Verified China Sourcing
                        </span>
                        <span className="text-xs font-bold text-white">
                          7-12 Days Tracked Air Freight & Zero USDT Gateway Fees
                        </span>
                      </div>
                      <Link
                        href={`/categories/${activeCategoryData.slug}`}
                        className="bg-[#FF1028] hover:bg-[#E00B20] text-white text-xs font-black px-4 py-2 rounded-xl transition-colors shrink-0 ml-4"
                      >
                        Sourcing Deals
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fast Navigation Tabs */}
            <nav className="flex items-center ml-2 space-x-1">
              <Link
                href="/categories/flash-deals"
                className="flex items-center gap-1.5 px-3 py-2 text-[#FF1028] hover:bg-red-50 rounded-lg transition-colors font-black"
              >
                <Zap className="w-3.5 h-3.5 fill-[#FF1028]" />
                <span>Flash Deals</span>
                <span className="bg-[#FF1028] text-white text-[9px] px-1 py-0.2 rounded font-black uppercase tracking-wider">
                  HOT
                </span>
              </Link>
              <Link
                href="/categories/new-arrivals"
                className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-[#00143D] hover:bg-slate-100 rounded-lg transition-colors font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>New Arrivals</span>
              </Link>
              <Link
                href="/categories/rc-drones-toys"
                className="px-3 py-2 text-slate-700 hover:text-[#00143D] hover:bg-slate-100 rounded-lg transition-colors font-bold"
              >
                RC Drones & Aerial
              </Link>
              <Link
                href="/categories/consumer-electronics"
                className="px-3 py-2 text-slate-700 hover:text-[#00143D] hover:bg-slate-100 rounded-lg transition-colors font-bold"
              >
                Electronics & Audio
              </Link>
              <Link
                href="/categories/tools-diy-hardware"
                className="px-3 py-2 text-slate-700 hover:text-[#00143D] hover:bg-slate-100 rounded-lg transition-colors font-bold"
              >
                3D Printers & Tools
              </Link>
              <Link
                href="/pages/about"
                className="flex items-center gap-1 px-3 py-2 text-slate-600 hover:text-[#00143D] hover:bg-slate-100 rounded-lg transition-colors font-bold"
              >
                <Factory className="w-3.5 h-3.5 text-slate-500" />
                <span>Factory Sourcing Hubs</span>
              </Link>
            </nav>
          </div>

          {/* Right Sourcing Assurance Pillar */}
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 text-[#10B981] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> 30-Day Money-Back Guarantee
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. Mobile Navigation Slide-Over Drawer ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-80 max-w-full bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-4 z-10">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
                    <Image
                      src="/logo-lennoxchinamall.jpeg"
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-black text-[#00143D]">
                    LENNOX CHINAMALL
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Department Categories */}
              <div className="space-y-1 mb-6">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                  Sourcing Departments
                </span>
                {MOCK_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 hover:text-[#FF1028]"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {cat.product_count}+
                    </span>
                  </Link>
                ))}
              </div>

              {/* Quick Links */}
              <div className="space-y-1 pt-4 border-t border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                  Quick Access
                </span>
                <Link
                  href="/categories/flash-deals"
                  className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-black text-[#FF1028] hover:bg-red-50"
                >
                  <Zap className="w-4 h-4 fill-[#FF1028]" />
                  <span>Flash Deals</span>
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>Track My Orders</span>
                </Link>
                <Link
                  href="/account/wishlist"
                  className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Heart className="w-4 h-4 text-slate-500" />
                  <span>My Wishlist ({wishlistTotalItems})</span>
                </Link>
                <Link
                  href="/account/support"
                  className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Headphones className="w-4 h-4 text-slate-500" />
                  <span>24/7 Sourcing Ticket Desk</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer Account CTA */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <Link
                href="/auth/login"
                className="block text-center bg-[#00143D] text-white py-2 rounded-xl text-xs font-bold"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="block text-center bg-[#FF1028] text-white py-2 rounded-xl text-xs font-bold"
              >
                Create Sourcing Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
