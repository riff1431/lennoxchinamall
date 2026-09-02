"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Category } from "@/types/database";
import { LifestyleBannerSlide, DEFAULT_LIFESTYLE_SLIDES } from "@/types/homepage";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedCategoryName } from "@/lib/i18n/categoryI18n";

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
  slides?: LifestyleBannerSlide[];
  autoPlayInterval?: number;
  viewAllLink?: string;
}

export function CategoryShowcaseBannerSection({
  initialCategories,
  slides,
  autoPlayInterval = 5500,
  viewAllLink = "/categories",
}: CategoryShowcaseBannerSectionProps) {
  const { t, isSpanish } = useTranslation();
  const storeCategories = useCategoryStore((state) => state.categories);
  const isLoaded = useCategoryStore((state) => state.isLoaded);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // ── Categories Data ──
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

  // ── Lifestyle Banner Carousel State & Autoplay ──
  const activeSlides = (slides && slides.length > 0
    ? slides.filter((s) => s.is_active !== false)
    : DEFAULT_LIFESTYLE_SLIDES) as LifestyleBannerSlide[];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Auto-play timer
  useEffect(() => {
    if (isHovered || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isHovered, activeSlides.length, autoPlayInterval, nextSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  const currentSlide = activeSlides[currentSlideIndex] || activeSlides[0];

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
                  className="group flex flex-col items-center shrink-0 w-[82px] sm:w-[96px] md:w-[108px] lg:w-[118px] snap-start transition-transform focus:outline-none"
                >
                  {/* 25% Border Radius Squircle Avatar Container */}
                  <div
                    style={{ backgroundColor: bgColor, borderRadius: "25%" }}
                    className="w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] md:w-[100px] md:h-[100px] lg:w-[110px] lg:h-[110px] rounded-[25%] relative overflow-hidden transition-all duration-300 group-hover:scale-106 shadow-2xs group-hover:shadow-md border border-slate-200/90 group-hover:border-[#00B4D8]/60"
                  >
                    {thumbnailSrc ? (
                      <Image
                        src={thumbnailSrc}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 76px, (max-width: 1024px) 100px, 120px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3 text-slate-700 group-hover:text-[#00B4D8] transition-colors">
                        <CategoryIcon
                          icon={cat.icon || cat.iconName || "FolderTree"}
                          name={cat.name}
                          className="w-7 h-7 sm:w-9 sm:h-9"
                        />
                      </div>
                    )}
                  </div>

                  {/* Category Name Underneath */}
                  <span className="mt-2.5 text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 text-center line-clamp-2 leading-snug group-hover:text-[#00B4D8] transition-colors font-heading max-w-[95%]">
                    {getLocalizedCategoryName(cat.name, isSpanish)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. Bottom Promotional Hero Banner Carousel ("Your World. All in One Place.") ── */}
      <div
        className="relative group/banner w-full aspect-[2.2/1] sm:aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[3.3/1] min-h-[170px] sm:min-h-[220px] md:min-h-[260px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200/90 bg-[#06122C]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Track with Crossfade */}
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          const slideTitle = isSpanish
            ? (slide.id === "lifestyle-slide-1"
                ? "Tu Mundo."
                : slide.id === "lifestyle-slide-2"
                ? "Hardware de Nueva Generación."
                : slide.id === "lifestyle-slide-3"
                ? "Tendencias Globales."
                : slide.title)
            : slide.title;

          const slideHighlight = isSpanish
            ? (slide.id === "lifestyle-slide-1"
                ? "Un Solo Lugar."
                : slide.id === "lifestyle-slide-2"
                ? "Directo de Fábrica."
                : slide.id === "lifestyle-slide-3"
                ? "Precios al Por Mayor."
                : slide.title_highlight)
            : slide.title_highlight;

          const slideSubtitle = isSpanish
            ? (slide.id === "lifestyle-slide-1"
                ? "Todo para cada estilo de vida con abastecimiento directo."
                : slide.id === "lifestyle-slide-2"
                ? "Tecnología de alto rendimiento con 0% de intermediarios."
                : slide.id === "lifestyle-slide-3"
                ? "Moda, artículos para el hogar y accesorios con despacho aéreo."
                : slide.subtitle)
            : slide.subtitle;

          const slideButtonText = isSpanish
            ? (slide.id === "lifestyle-slide-1"
                ? "Comprar Ahora"
                : slide.id === "lifestyle-slide-2"
                ? "Explorar Tecnología"
                : slide.id === "lifestyle-slide-3"
                ? "Ver Colección"
                : slide.button_text)
            : slide.button_text;

          return (
            <Link
              key={slide.id || idx}
              href={slide.link || "/categories"}
              className={`absolute inset-0 block transition-opacity duration-700 ease-in-out focus:outline-none ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Lifestyle Image */}
              <Image
                src={slide.image || "/banners/banner-your-world-lifestyle.jpg"}
                alt={`${slideTitle} ${slideHighlight}`}
                fill
                priority={idx === 0}
                sizes="(max-width: 1024px) 100vw, 1400px"
                className="object-cover object-right sm:object-center transition-transform duration-1000 group-hover/banner:scale-102"
              />

              {/* Dynamic Dark Gradient Overlay on the left side */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#040C22]/95 via-[#040C22]/80 to-transparent sm:w-3/5 md:w-1/2 pointer-events-none" />

              {/* Left Side Content & Call-To-Action */}
              <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-14 max-w-xl text-white">
                {/* Main Headline */}
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-heading leading-tight tracking-tight text-white drop-shadow-sm">
                  {slideTitle}<br />
                  <span>{isSpanish ? "Todo en " : "All in "}</span>
                  <span className="text-[#00C2FF] drop-shadow-md">{slideHighlight}</span>
                </h3>

                {/* Subtitle */}
                {slideSubtitle && (
                  <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-slate-200 font-medium mt-1 sm:mt-2 drop-shadow-xs max-w-xs sm:max-w-sm line-clamp-2">
                    {slideSubtitle}
                  </p>
                )}

                {/* Cyan CTA Button */}
                <div className="mt-3 sm:mt-5 md:mt-6">
                  <span className="inline-flex items-center gap-2 bg-[#00C2FF] hover:bg-[#00A3D9] text-white font-heading font-black text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-md transition-all duration-300 group-hover/banner:shadow-cyan-500/30 group-hover/banner:translate-x-1">
                    <span>{slideButtonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/banner:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>

              {/* Subtle hover shimmer */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Link>
          );
        })}

        {/* ── Carousel Controls (if more than 1 slide) ── */}
        {activeSlides.length > 1 && (
          <>
            {/* Left Slide Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous lifestyle slide"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover/banner:opacity-100 cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Right Slide Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next lifestyle slide"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover/banner:opacity-100 cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Bottom Pagination Dots / Pills */}
            <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-8 z-20 flex items-center gap-1.5 sm:gap-2">
              {activeSlides.map((_, idx) => {
                const isActive = idx === currentSlideIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentSlideIndex(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "w-6 sm:w-8 bg-[#00C2FF] shadow-[0_0_10px_rgba(0,194,255,0.6)]"
                        : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
