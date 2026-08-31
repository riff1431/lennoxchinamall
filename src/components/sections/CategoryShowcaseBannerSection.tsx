"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Category } from "@/types/database";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { useTranslation } from "@/lib/i18n/useTranslation";

const PASTEL_PALETTES = [
  "#EBF4FB", // Soft Ice Blue (Men's Fashion)
  "#FDF0EB", // Soft Peach (Women's Fashion)
  "#FBEBF4", // Soft Pink (Kid's Fashion)
  "#EBFBF2", // Soft Mint (Health & Beauty)
  "#EBF9FB", // Soft Cyan (Pet Supplies)
  "#F4FBEB", // Soft Lime (Home & Kitchen)
  "#FBEBEB", // Soft Blush (Baby & Toddler)
  "#EBF4FB", // Soft Sky Blue (Sports & Outdoors)
  "#EEF2FF", // Soft Indigo
  "#F3E8FF", // Soft Lavender
  "#FEF3C7", // Soft Amber
  "#E0F2FE", // Soft Ocean
];

export interface CategoryShowcaseBannerSectionProps {
  initialCategories?: Category[];
  bannerImage?: string;
  bannerTitle?: string;
  bannerCtaLink?: string;
  viewAllLink?: string;
}

export function CategoryShowcaseBannerSection({
  initialCategories,
  bannerImage = "/banners/banner-your-world-lifestyle.jpg",
  bannerTitle,
  bannerCtaLink = "/categories",
  viewAllLink = "/categories",
}: CategoryShowcaseBannerSectionProps) {
  const { t, isSpanish } = useTranslation();
  const storeCategories = useCategoryStore((state) => state.categories);
  const isLoaded = useCategoryStore((state) => state.isLoaded);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fallback to MOCK_CATEGORIES for instant SSR render
  const rawList = isLoaded && storeCategories && storeCategories.length > 0
    ? storeCategories
    : initialCategories && initialCategories.length > 0
    ? initialCategories
    : MOCK_CATEGORIES;

  const activeCategories = rawList
    .filter((c) => c.is_active !== false)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollState();
    window.addEventListener("resize", checkScrollState);
    return () => window.removeEventListener("resize", checkScrollState);
  }, [activeCategories.length]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkScrollState, 350);
    }
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* ── 1. Top White Card: Categories Showcase (8 Rounded Category Circles) ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-7 shadow-xs">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#00143D] font-heading tracking-tight">
              {isSpanish ? "Categorías Destacadas" : "Categories"}
            </h2>
          </div>

          <Link
            href={viewAllLink}
            className="text-xs sm:text-sm font-bold text-slate-600 hover:text-[#00B4D8] flex items-center gap-0.5 transition-colors group py-1 px-2.5 -mr-2 rounded-xl hover:bg-slate-50"
          >
            <span>{t.home.viewAllDeals}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Categories Carousel / Horizontal Row with smooth scroll */}
        <div className="relative group/carousel">
          {/* Left Navigation Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll("left")}
              aria-label="Previous categories"
              className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200 flex items-center justify-center hover:bg-[#00143D] hover:text-white hover:border-[#00143D] transition-all cursor-pointer hidden sm:flex"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll("right")}
              aria-label="Next categories"
              className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200 flex items-center justify-center hover:bg-[#00143D] hover:text-white hover:border-[#00143D] transition-all cursor-pointer hidden sm:flex"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Categories Track */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollState}
            className="flex items-start justify-between gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {activeCategories.slice(0, 10).map((cat, idx) => {
              const bgColor = cat.bg_color || PASTEL_PALETTES[idx % PASTEL_PALETTES.length];
              const thumbnailSrc = cat.thumbnail_url || cat.image_url;

              return (
                <Link
                  key={cat.id || cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group flex flex-col items-center shrink-0 w-[74px] sm:w-[88px] md:w-[98px] lg:w-[108px] snap-start transition-transform focus:outline-none"
                >
                  {/* Circular Avatar Container */}
                  <div
                    style={{ backgroundColor: bgColor }}
                    className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-108 shadow-2xs group-hover:shadow-md border border-black/[0.04]"
                  >
                    {thumbnailSrc ? (
                      <div className="relative w-full h-full p-2.5 sm:p-3 flex items-center justify-center">
                        <Image
                          src={thumbnailSrc}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 64px, (max-width: 1024px) 88px, 110px"
                          className="object-contain p-2 sm:p-2.5 transition-transform duration-300 group-hover:scale-112"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3 text-slate-700 group-hover:text-[#00B4D8] transition-colors">
                        <CategoryIcon
                          icon={cat.icon || cat.iconName || "FolderTree"}
                          name={cat.name}
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                      </div>
                    )}
                  </div>

                  {/* Category Name Underneath */}
                  <span className="mt-2 text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 text-center line-clamp-2 leading-snug group-hover:text-[#00B4D8] transition-colors font-heading">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. Bottom Promotional Hero Banner Card ("Your World. All in One Place.") ── */}
      <Link
        href={bannerCtaLink}
        className="group relative w-full aspect-[2.2/1] sm:aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[3.3/1] min-h-[170px] sm:min-h-[220px] md:min-h-[260px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 block border border-slate-200/90 bg-[#06122C] focus:outline-none"
      >
        {/* Background Lifestyle Image */}
        <Image
          src={bannerImage}
          alt={bannerTitle || "Your World. All in One Place."}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1400px"
          className="object-cover object-right sm:object-center group-hover:scale-102 transition-transform duration-700"
        />

        {/* Dynamic Dark Gradient Overlay on the left side to ensure 100% text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040C22]/95 via-[#040C22]/80 to-transparent sm:w-3/5 md:w-1/2 pointer-events-none" />

        {/* Left Side Content & Call-To-Action */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-14 max-w-xl text-white">
          {/* Main Headline */}
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-heading leading-tight tracking-tight text-white drop-shadow-sm">
            {isSpanish ? (
              <>
                Tu Mundo.<br />
                <span>Todo en </span>
                <span className="text-[#00C2FF] drop-shadow-md">Un Solo Lugar.</span>
              </>
            ) : (
              <>
                Your World.<br />
                <span>All in </span>
                <span className="text-[#00C2FF] drop-shadow-md">One Place.</span>
              </>
            )}
          </h3>

          {/* Subtitle */}
          <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-slate-200 font-medium mt-1 sm:mt-2 drop-shadow-xs max-w-xs sm:max-w-sm">
            {isSpanish ? "Todo para cada estilo de vida con abastecimiento directo." : "Everything for every lifestyle."}
          </p>

          {/* Cyan CTA Button */}
          <div className="mt-3 sm:mt-5 md:mt-6">
            <span className="inline-flex items-center gap-2 bg-[#00C2FF] hover:bg-[#00A3D9] text-white font-heading font-black text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-md transition-all duration-300 group-hover:shadow-cyan-500/30 group-hover:translate-x-1">
              <span>{isSpanish ? "Comprar Ahora" : "Shop Now"}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Subtle hover shimmer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>
    </section>
  );
}
