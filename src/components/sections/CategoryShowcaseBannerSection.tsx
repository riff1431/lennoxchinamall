"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Category } from "@/types/database";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

const PASTEL_PALETTES = [
  "#EBF4FB", // Soft Ice Blue
  "#FDF0EB", // Soft Peach
  "#FBEBF4", // Soft Pink
  "#EBFBF2", // Soft Mint
  "#EBF9FB", // Soft Cyan
  "#F4FBEB", // Soft Lime
  "#FBEBEB", // Soft Rose
  "#EBF4FB", // Soft Sky Blue
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
  bannerImage = "/banners/banner-shop-everything.webp",
  bannerTitle = "Your World. All in One Place.",
  bannerCtaLink = "/categories",
  viewAllLink = "/categories",
}: CategoryShowcaseBannerSectionProps) {
  const storeCategories = useCategoryStore((state) => state.categories);
  const isLoaded = useCategoryStore((state) => state.isLoaded);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Use categories from store once loaded, otherwise SSR initial fallback
  const rawList = isLoaded && storeCategories && storeCategories.length > 0
    ? storeCategories
    : initialCategories || [];

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
    <section className="space-y-4 sm:space-y-5">
      {/* ── 1. Top White Card: Categories Showcase ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-[#00143D] font-heading tracking-tight">
              Categories
            </h2>
          </div>

          <Link
            href={viewAllLink}
            className="text-xs sm:text-sm font-bold text-slate-600 hover:text-[#FF1028] flex items-center gap-0.5 transition-colors group py-1 px-2 -mr-2 rounded-lg hover:bg-slate-50"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Categories Carousel / Horizontal Row with smooth scroll */}
        <div className="relative group/carousel">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll("left")}
              aria-label="Previous categories"
              className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200/80 flex items-center justify-center hover:bg-[#FF1028] hover:text-white hover:border-[#FF1028] transition-all cursor-pointer hidden sm:flex"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll("right")}
              aria-label="Next categories"
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200/80 flex items-center justify-center hover:bg-[#FF1028] hover:text-white hover:border-[#FF1028] transition-all cursor-pointer hidden sm:flex"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Categories Track */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollState}
            className="flex items-start gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {activeCategories.map((cat, idx) => {
              const bgColor = cat.bg_color || PASTEL_PALETTES[idx % PASTEL_PALETTES.length];
              const thumbnailSrc = cat.thumbnail_url || cat.image_url;

              return (
                <Link
                  key={cat.id || cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group flex flex-col items-center shrink-0 w-[78px] sm:w-[94px] md:w-[102px] lg:w-[108px] snap-start transition-transform focus:outline-none"
                >
                  {/* Circular Avatar Container */}
                  <div
                    style={{ backgroundColor: bgColor }}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-106 shadow-2xs group-hover:shadow-md border border-black/[0.04]"
                  >
                    {thumbnailSrc ? (
                      <div className="relative w-full h-full p-2 sm:p-2.5 flex items-center justify-center">
                        <Image
                          src={thumbnailSrc}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 64px, 96px"
                          className="object-contain p-2 sm:p-2.5 transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3 text-slate-700 group-hover:text-[#FF1028] transition-colors">
                        <CategoryIcon
                          icon={cat.icon || cat.iconName || "FolderTree"}
                          name={cat.name}
                          className="w-7 h-7 sm:w-9 sm:h-9"
                        />
                      </div>
                    )}
                  </div>

                  {/* Category Name Underneath */}
                  <span className="mt-2.5 text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 text-center line-clamp-2 leading-snug group-hover:text-[#FF1028] transition-colors font-heading">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. Bottom Promotional Hero Banner Card ── */}
      <Link
        href={bannerCtaLink}
        className="group relative w-full aspect-[21/9] sm:aspect-[2.5/1] md:aspect-[3/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all block border border-slate-200/90 bg-slate-950 focus:outline-none"
      >
        <Image
          src={bannerImage}
          alt={bannerTitle || "Promotional Banner"}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1400px"
          className="object-cover object-center group-hover:scale-102 transition-transform duration-700"
        />
        
        {/* Subtle hover gradient sheen */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
    </section>
  );
}
