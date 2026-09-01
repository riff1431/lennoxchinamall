"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Layers,
  Tag,
  Award,
  Zap,
} from "lucide-react";
import { Product, Category } from "@/types/database";
import { ProductCard } from "@/components/product/ProductCard";
import { getRelatedProducts } from "@/lib/related-products";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedCategoryName } from "@/lib/i18n/categoryI18n";

export interface RelatedProductsSectionProps {
  currentProduct: Product;
  category?: Category | null;
  initialCatalog?: Product[];
}

type FilterTab = "all" | "category" | "tags" | "bestsellers";

const emptySubscribe = () => () => {};

export function RelatedProductsSection({
  currentProduct,
  category,
  initialCatalog,
}: RelatedProductsSectionProps) {
  const { isSpanish } = useTranslation();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5); // Default to 5 items in a row on desktop
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [progress, setProgress] = useState(0);

  // Touch gesture support
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Compute dynamic related products list
  const allRelatedProducts = useMemo(() => {
    return getRelatedProducts(currentProduct, {
      catalog: initialCatalog && initialCatalog.length > 0 ? initialCatalog : MOCK_PRODUCTS,
      limit: 15,
    });
  }, [currentProduct, initialCatalog]);

  // 2. Filter products based on active sub-tab
  const filteredProducts = useMemo(() => {
    if (activeFilter === "category") {
      const sameCat = allRelatedProducts.filter(
        (p) => p.category_id === currentProduct.category_id
      );
      return sameCat.length >= 3 ? sameCat : allRelatedProducts;
    }
    if (activeFilter === "tags") {
      const currentTags = (currentProduct.tags || []).map((t) => t.toLowerCase());
      const sameTags = allRelatedProducts.filter((p) =>
        (p.tags || []).some((t) => currentTags.includes(t.toLowerCase()))
      );
      return sameTags.length >= 3 ? sameTags : allRelatedProducts;
    }
    if (activeFilter === "bestsellers") {
      const best = allRelatedProducts.filter((p) => p.is_best_seller || (p.avg_rating || 0) >= 4.8);
      return best.length >= 3 ? best : allRelatedProducts;
    }
    return allRelatedProducts;
  }, [activeFilter, allRelatedProducts, currentProduct]);

  // 3. Dynamic responsive items-per-view calculator (5 items on desktop)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setItemsPerView(5); // 5 products in a row on desktop
      } else if (width >= 1024) {
        setItemsPerView(4); // 4 products on laptop
      } else if (width >= 768) {
        setItemsPerView(3); // 3 products on tablet
      } else if (width >= 540) {
        setItemsPerView(2); // 2 products on large mobile
      } else {
        setItemsPerView(2); // 2 products on mobile
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalItems = filteredProducts.length;
  // Maximum starting index so we don't display empty slots at the end
  const maxIndex = Math.max(0, totalItems - itemsPerView);
  const safeCurrentIndex = Math.min(currentIndex, maxIndex);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerView));
  const currentPage = Math.min(
    totalPages - 1,
    Math.floor(safeCurrentIndex / itemsPerView)
  );

  // Navigation handlers with smooth transition
  const goToIndex = useCallback(
    (newIndex: number) => {
      if (isSliding) return;
      setIsSliding(true);
      setCurrentIndex(Math.max(0, Math.min(newIndex, maxIndex)));
      setProgress(0);
      setTimeout(() => {
        setIsSliding(false);
      }, 300);
    },
    [isSliding, maxIndex]
  );

  const handlePrev = useCallback(() => {
    if (safeCurrentIndex <= 0) {
      goToIndex(maxIndex); // Loop around
    } else {
      goToIndex(Math.max(0, safeCurrentIndex - 1));
    }
  }, [safeCurrentIndex, maxIndex, goToIndex]);

  const handleNext = useCallback(() => {
    if (safeCurrentIndex >= maxIndex) {
      goToIndex(0); // Loop to start
    } else {
      goToIndex(Math.min(maxIndex, safeCurrentIndex + 1));
    }
  }, [safeCurrentIndex, maxIndex, goToIndex]);

  const handleFilterChange = (tab: FilterTab) => {
    setActiveFilter(tab);
    setCurrentIndex(0);
    setProgress(0);
  };

  // 4. Auto-scroll Carousel Engine (every 4.5 seconds with progress bar)
  const AUTO_SCROLL_DURATION = 4500; // ms
  const PROGRESS_TICK = 50; // ms

  useEffect(() => {
    if (!isAutoScrolling || isHovered || totalItems <= itemsPerView) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const intervalTime = AUTO_SCROLL_DURATION;
    const stepPercent = (PROGRESS_TICK / intervalTime) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + stepPercent;
      });
    }, PROGRESS_TICK);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isAutoScrolling, isHovered, totalItems, itemsPerView, handleNext]);

  // 5. Touch / Swipe Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHovered(true); // Pause on touch
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsHovered(false); // Resume after touch
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (totalItems === 0) return null;

  return (
    <section
      className="mt-12 sm:mt-16 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Related Products"
    >
      {/* ── 1. Top Section Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF1028] font-mono bg-red-50 px-2 py-0.5 rounded-md border border-red-200/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF1028]" />
              {isSpanish ? "Coincidencias Directas de Fábrica" : "Direct Factory Matches"}
            </span>
            <span className="text-[10px] font-mono text-slate-500 hidden md:inline">
              {isSpanish
                ? "Mismo Clúster • Especificaciones y Categoría Similares"
                : "Same Cluster • Similar Specifications & Category"}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-black font-heading text-[#00143D] tracking-tight">
            {isSpanish ? "Hardware Relacionado de Fábrica" : "Related Factory Hardware"}
          </h3>
        </div>

        {/* Action Controls: Auto-Scroll Toggle, Nav Arrows & Explore All */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Autoplay Play/Pause & Mini Progress Indicator */}
          <button
            onClick={() => setIsAutoScrolling((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-colors cursor-pointer ${
              isAutoScrolling
                ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            }`}
            title={isAutoScrolling ? (isSpanish ? "Pausar Auto-Desplazamiento" : "Pause Auto-scroll") : (isSpanish ? "Activar Auto-Desplazamiento" : "Enable Auto-scroll")}
            aria-label={isAutoScrolling ? (isSpanish ? "Pausar Auto-Desplazamiento" : "Pause Auto-scroll") : (isSpanish ? "Activar Auto-Desplazamiento" : "Enable Auto-scroll")}
          >
            {isAutoScrolling ? (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[10px] hidden xs:inline">{isSpanish ? "Auto-Desplazamiento" : "Auto-Scroll"}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-amber-700" />
                <span className="text-[10px] hidden xs:inline">{isSpanish ? "Pausado" : "Paused"}</span>
              </>
            )}
            {/* Miniature progress meter when autoplaying */}
            {isAutoScrolling && !isHovered && isMounted && (
              <span className="w-8 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                <span
                  className="h-full bg-[#FF1028] block transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </span>
            )}
          </button>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-[#00143D] text-slate-700 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 border border-slate-200"
              aria-label="Previous related products"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-[#FF1028] text-slate-700 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 border border-slate-200"
              aria-label="Next related products"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href={category ? `/categories/${category.slug}` : "/categories"}
            className="text-xs font-bold text-[#00143D] hover:text-[#FF1028] flex items-center gap-1 ml-1 hover:underline transition-colors hidden sm:flex"
          >
            <span>{isSpanish ? "Ver Categoría" : "View Category"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 2. Interactive Filter Chips ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-3 no-scrollbar">
        <button
          onClick={() => handleFilterChange("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold font-heading whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
            activeFilter === "all"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>{isSpanish ? `Todos Recomendados (${allRelatedProducts.length})` : `All Recommended (${allRelatedProducts.length})`}</span>
        </button>

        {category && (
          <button
            onClick={() => handleFilterChange("category")}
            className={`px-3 py-1 rounded-full text-xs font-bold font-heading whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              activeFilter === "category"
                ? "bg-[#00143D] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>{isSpanish ? `Misma Categoría: ${getLocalizedCategoryName(category.name, isSpanish)}` : `Same Category: ${category.name}`}</span>
          </button>
        )}

        {currentProduct.tags && currentProduct.tags.length > 0 && (
          <button
            onClick={() => handleFilterChange("tags")}
            className={`px-3 py-1 rounded-full text-xs font-bold font-heading whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              activeFilter === "tags"
                ? "bg-[#00143D] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{isSpanish ? "Mismas Especificaciones y Etiquetas" : "Matching Specs & Tags"}</span>
          </button>
        )}

        <button
          onClick={() => handleFilterChange("bestsellers")}
          className={`px-3 py-1 rounded-full text-xs font-bold font-heading whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
            activeFilter === "bestsellers"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Award className="w-3 h-3" />
          <span>{isSpanish ? "Mejor Valorados y Más Vendidos" : "Top Rated & Best Sellers"}</span>
        </button>
      </div>

      {/* ── 3. Dynamic Carousel Track (5 Products in a row on desktop) ── */}
      <div className="relative group/track pt-2 pb-2">
        {/* Floating Left Arrow */}
        <button
          onClick={handlePrev}
          aria-label="Previous products"
          className="absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-slate-200/90 text-slate-700 hover:text-white hover:bg-[#FF1028] hover:border-[#FF1028] flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/track:opacity-100 disabled:opacity-0 hidden sm:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Floating Right Arrow */}
        <button
          onClick={handleNext}
          aria-label="Next products"
          className="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-slate-200/90 text-slate-700 hover:text-white hover:bg-[#FF1028] hover:border-[#FF1028] flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/track:opacity-100 disabled:opacity-0 hidden sm:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Viewport */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${safeCurrentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                style={{
                  flex: `0 0 ${100 / itemsPerView}%`,
                  maxWidth: `${100 / itemsPerView}%`,
                }}
                className="px-1.5 sm:px-2 box-border"
              >
                <div className="h-full">
                  <ProductCard product={p} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Pagination Dots & Summary ── */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
        <span className="text-[11px] font-mono text-slate-500">
          Showing {safeCurrentIndex + 1}–{Math.min(safeCurrentIndex + itemsPerView, totalItems)} of {totalItems} related products
        </span>

        {/* Dot Indicators */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5" aria-label="Carousel pagination">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const isActive = currentPage === idx;
              return (
                <button
                  key={idx}
                  onClick={() => goToIndex(idx * itemsPerView)}
                  className={`transition-all rounded-full cursor-pointer ${
                    isActive
                      ? "w-6 h-2 bg-[#FF1028] shadow-xs"
                      : "w-2 h-2 bg-slate-200 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide page ${idx + 1}`}
                />
              );
            })}
          </div>
        )}

        <Link
          href={category ? `/categories/${category.slug}` : "/categories"}
          className="text-xs font-bold text-[#FF1028] hover:underline flex items-center gap-1 sm:hidden"
        >
          <span>Explore</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}
