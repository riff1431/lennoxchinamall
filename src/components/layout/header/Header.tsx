"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  X,
} from "lucide-react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useAuth } from "@/components/providers/AuthProvider";
import { isAdminRole } from "@/lib/auth/roles";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { SITE_NAME } from "@/lib/constants";
import { useMounted } from "@/hooks/useMounted";

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
  logoUrl = "/logo-lennoxchinamall.png",
}: HeaderProps) {
  const router = useRouter();
  const { user, role } = useAuth();

  // Scroll state for sticky glassmorphism
  const [isScrolled, setIsScrolled] = useState(false);

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mobile search state
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

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
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobile search handler
  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileSearchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
    setMobileSearchQuery("");
  };

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
          isScrolled ? "shadow-md border-slate-200 py-1.5 sm:py-2" : "border-slate-100 py-2 sm:py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#FF1028] rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer active:scale-95"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo */}
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

            {/* Smart Search Bar (Desktop / Tablet) */}
            <HeaderSearchBar
              rootCategories={rootCategories}
              categories={categories}
              isMounted={isMounted}
            />

            {/* Header Actions (Compare, Wishlist, Notifications, Account, Cart) */}
            <HeaderActions />
          </div>

          {/* ── Mobile Full-Width Search Input ── */}
          <div className="mt-2 md:hidden relative">
            <form onSubmit={handleMobileSearch} className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search factory products..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                className="w-full pl-10 pr-[72px] min-h-[44px] rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#FF1028] focus:ring-2 focus:ring-[#FF1028]/10 font-medium transition-all"
                style={{ fontSize: "16px" }}
                aria-label="Search products"
              />
              {mobileSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setMobileSearchQuery("")}
                  className="absolute right-[56px] text-slate-400 p-1.5 min-h-[44px] flex items-center cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#FF1028] to-[#E00B20] text-white text-xs font-black uppercase shadow-xs min-h-[36px] cursor-pointer hover:shadow-md active:scale-[0.97] transition-all"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── 3. Lower Navigation & Mega Menu Bar (Desktop) ── */}
      <NavigationBar />

      {/* ── 4. Mobile Slide-Out Drawer ── */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        logoUrl={logoUrl}
        storeName={storeName}
      />
    </header>
  );
}
