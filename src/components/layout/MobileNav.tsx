"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Search,
  Heart,
  UserCircle,
  ShoppingBag,
  X,
  ArrowRight,
  Package,
  Zap,
  Tag,
  Plane,
  Star,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  FileText,
  RefreshCcw,
  Clock,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCategoryStore } from "@/store/useCategoryStore";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { formatCurrency } from "@/utils/helpers";
import { signout } from "@/app/actions/auth";
import type { Category } from "@/types/database";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedCategoryName } from "@/lib/i18n/categoryI18n";
import { getLocalizedProductTitle } from "@/lib/i18n/productI18n";

const getHotTags = (isSpanish: boolean) =>
  isSpanish
    ? ["Drones 4K", "Impresoras 3D", "OBD2", "Altavoces", "Autos RC", "Linternas"]
    : ["4K Drones", "3D Printers", "OBD2", "Speakers", "RC Cars", "Flashlights"];

const QUICK_CATEGORIES = [
  { name: "Flash Deals", slug: "flash-deals", icon: Zap, color: "bg-red-50 text-[#FF1028]" },
  { name: "New Arrivals", slug: "new-arrivals", icon: Star, color: "bg-amber-50 text-amber-600" },
  { name: "Best Sellers", slug: "consumer-electronics", icon: Tag, color: "bg-blue-50 text-blue-600" },
  { name: "Track Order", slug: null, href: "/account/orders", icon: Plane, color: "bg-emerald-50 text-emerald-600" },
];

type Sheet = "search" | "categories" | "account" | null;

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, displayName, isAuthenticated } = useAuth();
  const { t, isSpanish } = useTranslation();

  const cartTotal = useCartStore((state) => state.getTotalItems());
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistTotal = useWishlistStore((state) => state.getTotalItems());

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const mountedWishlistTotal = isMounted ? wishlistTotal : 0;
  const mountedCartTotal = isMounted ? cartTotal : 0;
  const mountedCartSubtotal = isMounted ? cartSubtotal : 0;

  const { getRootCategories } = useCategoryStore();
  const rootCategories: Category[] = isMounted ? getRootCategories() : (MOCK_CATEGORIES as unknown as Category[]);

  const [activeSheet, setActiveSheet] = useState<Sheet>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    products: { id: string; title: string; slug: string; price: number; image?: string }[];
    suggestions: string[];
  }>({ products: [], suggestions: [] });
  const [pressedTab, setPressedTab] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Don't show on admin paths or auth paths
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return null;

  // Live search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults({ products: [], suggestions: [] });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults({
            products: data.products || [],
            suggestions: data.suggestions || [],
          });
        }
      } catch {
        const q = searchQuery.toLowerCase();
        setSearchResults({
          products: MOCK_PRODUCTS.filter(
            (p) => p.title.toLowerCase().includes(q)
          ).slice(0, 6).map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: p.base_price,
            image: p.media?.[0]?.url,
          })),
          suggestions: getHotTags(isSpanish).filter((t) => t.toLowerCase().includes(q)),
        });
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery, isSpanish]);

  // Auto-focus search input
  useEffect(() => {
    if (activeSheet === "search") {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [activeSheet]);

  // Close sheet on route change
  useEffect(() => {
    setActiveSheet(null);
    setSearchQuery("");
  }, [pathname]);

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
    setSearchQuery("");
  }, []);

  const handleTabPress = (tabId: string) => {
    setPressedTab(tabId);
    setTimeout(() => setPressedTab(null), 150);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    closeSheet();
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSignOut = async () => {
    closeSheet();
    await signout();
    router.push("/");
  };

  const navItems = [
    {
      id: "home",
      label: t.common.home,
      href: "/",
      icon: Home,
      isActive: pathname === "/",
      badge: null,
    },
    {
      id: "categories",
      label: isSpanish ? "Categorías" : "Categories",
      href: null,
      icon: LayoutGrid,
      isActive: pathname.startsWith("/categories"),
      badge: null,
      sheet: "categories" as Sheet,
    },
    {
      id: "search",
      label: t.common.search,
      href: null,
      icon: Search,
      isActive: activeSheet === "search" || pathname === "/search",
      badge: null,
      sheet: "search" as Sheet,
    },
    {
      id: "wishlist",
      label: t.header.wishlist,
      href: "/account/wishlist",
      icon: Heart,
      isActive: pathname === "/account/wishlist",
      badge: mountedWishlistTotal > 0 ? mountedWishlistTotal : null,
    },
    {
      id: "account",
      label: isMounted && isAuthenticated ? (isSpanish ? "Mi Cuenta" : "Me") : t.header.login,
      href: null,
      icon: UserCircle,
      isActive:
        activeSheet === "account" ||
        (pathname.startsWith("/account") && pathname !== "/account/wishlist"),
      badge: null,
      sheet: "account" as Sheet,
    },
    {
      id: "cart",
      label: isSpanish ? "Carrito" : "Cart",
      href: null,
      icon: ShoppingBag,
      isActive: false,
      badge: mountedCartTotal > 0 ? mountedCartTotal : null,
      action: openCart,
    },
  ];

  return (
    <>
      {/* ── Sheet Backdrop ── */}
      {activeSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={closeSheet}
        />
      )}

      {/* ── Search Sheet ── */}
      {activeSheet === "search" && (
        <div className="fixed bottom-[65px] left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
          {/* Sheet Handle */}
          <div className="flex justify-center pt-2.5 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-300" />
          </div>

          {/* Search Input */}
          <div className="px-4 pb-3 shrink-0">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-4 border-2 border-transparent focus-within:border-[#FF1028] focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t.common.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-3.5 text-sm bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-400"
                  style={{ fontSize: "16px" }}
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </form>

            {/* Hot Tags */}
            {!searchQuery && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {getHotTags(isSpanish).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1.5 rounded-md bg-slate-100 text-xs font-bold text-slate-700 hover:bg-[#FF1028] hover:text-white transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="overflow-y-auto flex-1 pb-4">
            {searchQuery.trim().length >= 2 && (
              <div className="px-4 space-y-1">
                {/* Suggestion chips */}
                {searchResults.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {searchResults.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          closeSheet();
                          router.push(`/search?q=${encodeURIComponent(s)}`);
                        }}
                        className="px-3 py-1.5 rounded-md bg-[#FF1028]/10 text-xs font-bold text-[#FF1028] border border-[#FF1028]/20"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Product results */}
                {searchResults.products.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    {isSpanish ? `Sin resultados para "${searchQuery}"` : `No results for "${searchQuery}"`}
                  </div>
                ) : (
                  <>
                    {searchResults.products.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => {
                          closeSheet();
                          router.push(`/products/${prod.slug}`);
                        }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                      >
                        <div className="w-11 h-11 rounded-md overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200">
                          {prod.image ? (
                            <Image src={prod.image} alt={prod.title} fill className="object-cover" />
                          ) : (
                            <Package className="w-5 h-5 m-auto mt-3 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {getLocalizedProductTitle(prod.slug, prod.title, isSpanish)}
                          </p>
                          <p className="text-xs font-black text-[#00143D] font-mono">{formatCurrency(prod.price)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    ))}
                    <button
                      onClick={handleSearch}
                      className="w-full mt-2 py-3 rounded-md bg-[#00143D] text-white text-sm font-black flex items-center justify-center gap-2"
                    >
                      <span>{isSpanish ? `Ver todos los resultados para "${searchQuery}"` : `See all results for "${searchQuery}"`}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Category quick-links when idle */}
            {!searchQuery && (
              <div className="px-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 font-mono">{isSpanish ? "Explorar Departamentos" : "Browse Departments"}</p>
                <div className="grid grid-cols-3 gap-2">
                  {rootCategories.slice(0, 9).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      onClick={closeSheet}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-center"
                    >
                      <div className="w-8 h-8 rounded-md bg-[#00143D]/10 flex items-center justify-center p-1.5 overflow-hidden">
                        <CategoryIcon icon={cat.icon || cat.iconName} name={cat.name} className="w-4 h-4 text-[#00143D]" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2">{getLocalizedCategoryName(cat.name, isSpanish)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Categories Sheet ── */}
      {activeSheet === "categories" && (
        <div className="fixed bottom-[65px] left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-center pt-2.5 shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-300" />
          </div>

          <div className="px-4 py-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#00143D] font-heading">{t.common.allDepartments}</h3>
              <Link
                href="/categories"
                onClick={closeSheet}
                className="text-xs font-bold text-[#FF1028] flex items-center gap-1"
              >
                {isSpanish ? "Ver Todo" : "View All"} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Access Row */}
          <div className="px-4 pt-3 pb-2 shrink-0">
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: t.common.flashDeals, slug: "flash-deals", icon: Zap, color: "bg-red-50 text-[#FF1028]" },
                { name: t.common.newArrivals, slug: "new-arrivals", icon: Star, color: "bg-amber-50 text-amber-600" },
                { name: isSpanish ? "Más Vendidos" : "Best Sellers", slug: "consumer-electronics", icon: Tag, color: "bg-blue-50 text-blue-600" },
                { name: t.common.trackOrder, slug: null, href: "/account/orders", icon: Plane, color: "bg-emerald-50 text-emerald-600" },
              ].map((qc) => {
                const Icon = qc.icon;
                const href = qc.href || (qc.slug ? `/categories/${qc.slug}` : "#");
                return (
                  <Link
                    key={qc.name}
                    href={href}
                    onClick={closeSheet}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-center"
                  >
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center ${qc.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 leading-tight">{qc.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="px-4 pb-1 shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">{t.home.manufacturingClusters}</p>
          </div>

          {/* Full category list */}
          <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-1">
            {rootCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                onClick={closeSheet}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-[#00143D]/8 flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                    <CategoryIcon icon={cat.icon || cat.iconName} name={cat.name} className="w-4 h-4 text-[#00143D]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{getLocalizedCategoryName(cat.name, isSpanish)}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{cat.product_count || 0}+ {isSpanish ? "productos" : "products"}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF1028] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Account Sheet ── */}
      {activeSheet === "account" && (
        <div className="fixed bottom-[65px] left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-center pt-2.5 shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-300" />
          </div>

          {isAuthenticated && user ? (
            <>
              {/* Profile Card */}
              <div className="px-4 pt-3 pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#00143D] text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
                    {displayName ? displayName[0].toUpperCase() : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-[#00143D] truncate">{displayName || (isSpanish ? "Mi Cuenta" : "My Account")}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#FF1028] bg-red-50 px-2 py-0.5 rounded-md uppercase">
                        {isSpanish ? "Cliente Verificado" : "Verified Customer"}
                      </span>
                      {mountedWishlistTotal > 0 && (
                        <span className="text-[10px] font-bold text-slate-500">
                          ♡ {mountedWishlistTotal} {isSpanish ? "guardados" : "saved"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Link
                    href="/account/orders"
                    onClick={closeSheet}
                    className="flex flex-col items-center p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 active:scale-95 transition-all"
                  >
                    <Package className="w-5 h-5 text-blue-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600">{t.header.myOrders}</span>
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={closeSheet}
                    className="flex flex-col items-center p-2.5 rounded-lg bg-slate-50 hover:bg-red-50 active:scale-95 transition-all relative"
                  >
                    <Heart className="w-5 h-5 text-[#FF1028] mb-1" />
                    {mountedWishlistTotal > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF1028] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                        {mountedWishlistTotal}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-600">{t.header.wishlist}</span>
                  </Link>
                  <Link
                    href="/account/returns"
                    onClick={closeSheet}
                    className="flex flex-col items-center p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50 active:scale-95 transition-all"
                  >
                    <RefreshCcw className="w-5 h-5 text-amber-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600">{isSpanish ? "Devoluciones" : "Returns"}</span>
                  </Link>
                </div>
              </div>

              {/* Menu Links */}
              <div className="overflow-y-auto flex-1 px-4 py-3 space-y-1">
                {[
                  { href: "/account/profile", label: t.header.profile, icon: UserCircle, color: "text-slate-600" },
                  { href: "/account/orders", label: isSpanish ? "Pedidos y Rastreo de Carga Aérea" : "Orders & Air Cargo Tracking", icon: Package, color: "text-blue-600" },
                  { href: "/account/history", label: isSpanish ? "Historial de Navegación" : "Browsing History", icon: Clock, color: "text-indigo-600" },
                  { href: "/account/notifications", label: isSpanish ? "Notificaciones" : "Notifications", icon: Bell, color: "text-purple-600" },
                  { href: "/account/reviews", label: isSpanish ? "Mis Reseñas" : "My Reviews", icon: Star, color: "text-amber-600" },
                  { href: "/account/support", label: isSpanish ? "Tickets de Soporte" : "Support Tickets", icon: FileText, color: "text-emerald-600" },
                  { href: "/account/addresses", label: isSpanish ? "Direcciones Guardadas" : "Saved Addresses", icon: Settings, color: "text-slate-600" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSheet}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </Link>
                  );
                })}

                {/* Cart summary link */}
                {mountedCartTotal > 0 && (
                  <button
                    onClick={() => { closeSheet(); openCart(); }}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-[#00143D]/5 hover:bg-[#00143D]/10 active:scale-98 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5 text-[#00143D]" />
                      <div className="text-left">
                        <p className="text-sm font-bold text-[#00143D]">
                          {isSpanish ? `Mi Carrito (${mountedCartTotal} ${mountedCartTotal === 1 ? "artículo" : "artículos"})` : `My Cart (${mountedCartTotal} ${mountedCartTotal === 1 ? "item" : "items"})`}
                        </p>
                        <p className="text-xs font-black text-[#10B981] font-mono">{formatCurrency(mountedCartSubtotal)} USDT</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00143D] transition-colors" />
                  </button>
                )}

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors mt-2"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-bold text-red-600">{t.header.logout}</span>
                </button>
              </div>
            </>
          ) : (
            /* Guest account panel */
            <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <UserCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-[#00143D] font-heading">{isSpanish ? "Únete a China Mall" : "Join China Mall"}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {isSpanish ? "Inicia sesión para rastrear pedidos, guardar productos y obtener precios de mayoreo." : "Sign in to track orders, save products and get exclusive wholesale prices."}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  onClick={closeSheet}
                  className="w-full py-3 rounded-md bg-[#00143D] text-white text-sm font-black text-center"
                >
                  {t.header.login}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={closeSheet}
                  className="w-full py-3 rounded-md bg-slate-100 text-slate-800 text-sm font-bold text-center"
                >
                  {t.header.register}
                </Link>
              </div>

              <div className="flex flex-col gap-1">
                {[
                  { href: "/account/orders", label: t.common.trackOrder, icon: Package },
                  { href: "/account/support", label: isSpanish ? "Soporte de Abastecimiento 24/7" : "24/7 Sourcing Support", icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSheet}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom Tab Bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-xl border-t border-slate-200/90 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch justify-around h-[58px] px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isPressed = pressedTab === item.id;

            const content = (
              <>
                <div
                  className={`relative transition-all duration-150 ${
                    item.isActive ? "scale-110" : isPressed ? "scale-90" : "scale-100"
                  }`}
                >
                  {/* Active glow pill */}
                  {item.isActive && (
                    <span className="absolute inset-0 -m-1.5 rounded-xl bg-[#FF1028]/10 -z-10" />
                  )}
                  <Icon
                    className={`w-[22px] h-[22px] transition-colors duration-150 ${
                      item.isActive
                        ? "text-[#FF1028]"
                        : item.id === "cart" && mountedCartTotal > 0
                        ? "text-[#00143D]"
                        : "text-slate-500"
                    }`}
                    strokeWidth={item.isActive ? 2.5 : 2}
                  />
                  {/* Badge */}
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 bg-[#FF1028] text-white text-[8px] font-black min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 shadow-sm border border-white">
                      {Number(item.badge) > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[9px] font-bold mt-0.5 leading-none transition-colors duration-150 ${
                    item.isActive ? "text-[#FF1028]" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active indicator dot */}
                {item.isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#FF1028]" />
                )}
              </>
            );

            const commonClasses = `relative flex flex-col items-center justify-center flex-1 min-h-full pt-1.5 transition-all duration-150 select-none cursor-pointer ${
              isPressed ? "opacity-70" : ""
            }`;

            if (item.action) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabPress(item.id);
                    item.action!();
                  }}
                  className={commonClasses}
                  aria-label={item.label}
                >
                  {content}
                </button>
              );
            }

            if (item.sheet) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabPress(item.id);
                    setActiveSheet(activeSheet === item.sheet ? null : item.sheet);
                  }}
                  className={commonClasses}
                  aria-label={item.label}
                  aria-expanded={activeSheet === item.sheet}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href!}
                onClick={() => handleTabPress(item.id)}
                className={commonClasses}
                aria-label={item.label}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
