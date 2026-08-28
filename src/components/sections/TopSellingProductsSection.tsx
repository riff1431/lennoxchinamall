"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Star,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Award,
  Check,
} from "lucide-react";
import { Product } from "@/types/database";
import { formatCurrency, calcDiscount } from "@/utils/helpers";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

interface TopSellingProductsSectionProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  autoPlayInterval?: number; // in milliseconds (default: 2800ms)
}

export function TopSellingProductsSection({
  products,
  title = "Top Selling Direct Products",
  subtitle = "Highest volume verified factory hardware sourced directly from Shenzhen, Ningbo & Dongguan",
  autoPlayInterval = 2800,
}: TopSellingProductsSectionProps) {
  // Ensure we have a rich list of products to loop through
  const displayProducts = products && products.length > 0 ? products : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const addItem = useCartStore((state) => state.addItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamically compute itemsPerView based on viewport
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setItemsPerView(5); // Desktop: exactly 5 columns
      } else if (width >= 1024) {
        setItemsPerView(4); // Laptop: 4 columns
      } else if (width >= 768) {
        setItemsPerView(3); // Tablet: 3 columns
      } else if (width >= 520) {
        setItemsPerView(2); // Small Tablet: 2 columns
      } else {
        setItemsPerView(1); // Mobile: 1 column
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalItems = displayProducts.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  // Navigation handlers
  const nextSlide = useCallback(() => {
    if (totalItems === 0) return;
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex, totalItems]);

  const prevSlide = useCallback(() => {
    if (totalItems === 0) return;
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex, totalItems]);

  // Auto-rotating timer (2.8s loop, pauses when hovered or dragging)
  useEffect(() => {
    if (isPaused || totalItems <= itemsPerView) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, autoPlayInterval, totalItems, itemsPerView]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
  };

  // Quick Add to Cart
  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const activeVariant = product.variants?.[0];
    const activePrice = activeVariant?.price || product.base_price || 0;
    const comparePrice = product.compare_at_price || activePrice * 1.45;
    const primaryImg =
      product.media?.[0]?.url ||
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80";

    addItem({
      id: activeVariant?.id || product.id,
      productId: product.id,
      variantId: activeVariant?.id,
      title: product.title,
      slug: product.slug,
      image: primaryImg,
      price: activePrice,
      compareAtPrice: comparePrice,
      quantity: 1,
      stock: activeVariant?.stock || 50,
      supplierCode: product.supplier_code || undefined,
    });

    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));

    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  if (displayProducts.length === 0) return null;

  return (
    <section
      className="relative bg-white rounded-xl border border-slate-200/90 p-4 sm:p-6 lg:p-7 shadow-xs overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl pointer-events-none" />

      {/* ── Section Header ── */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div className="space-y-1">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-[#FF1028] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider font-heading shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
              <span>TOP SELLING FACTORY HARDWARE</span>
            </span>

            {/* Auto-play status pill */}
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[9px] font-mono text-slate-600">
              <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-500" : "bg-emerald-500 animate-ping"}`} />
              <span>{isPaused ? "Paused" : "Live Auto-Loop (2.8s)"}</span>
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#00143D] font-heading tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          {/* Carousel Arrows */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={prevSlide}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-md bg-white hover:bg-[#00143D] text-[#00143D] hover:text-white border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 group"
              aria-label="Previous Products"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={nextSlide}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-md bg-white hover:bg-[#FF1028] text-[#00143D] hover:text-white border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 group"
              aria-label="Next Products"
            >
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* View All CTA */}
          <Link
            href="/categories/consumer-electronics"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2 rounded-md bg-[#00143D] hover:bg-[#FF1028] text-white text-xs font-black font-heading transition-all shadow-xs group cursor-pointer btn-smooth"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Carousel Viewport (1 Row, 5 Columns Desktop) ── */}
      <div
        ref={containerRef}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing py-2.5 -my-2.5 px-1 -mx-1"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
          }}
        >
          {displayProducts.map((product, idx) => {
            const activePrice = product.base_price || 0;
            const comparePrice =
              product.compare_at_price || activePrice * 1.45;
            const discount = calcDiscount(comparePrice, activePrice);
            const inWish = isInWishlist(product.id);
            const isJustAdded = !!addedItemIds[product.id];
            const primaryImg =
              product.media?.[0]?.url ||
              "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80";
            const hoverImg = product.media?.[1]?.url || primaryImg;

            // Rank Badge Styling
            const rank = idx + 1;
            const rankBadgeColor =
              rank === 1
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-amber-500/20"
                : rank === 2
                ? "bg-gradient-to-r from-slate-300 to-slate-100 text-slate-800 font-bold"
                : rank === 3
                ? "bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold"
                : "bg-slate-900/85 text-white font-semibold";

            return (
              <div
                key={`${product.id}-${idx}`}
                className="shrink-0 px-1.5 sm:px-2 md:px-2.5"
                style={{ width: `${100 / itemsPerView}%` }}
              >
                <div className="group relative bg-[#F8FAFC] hover:bg-white rounded-lg border border-slate-200/90 hover:border-[#FF1028]/60 hover:shadow-[0_0_18px_rgba(255,16,40,0.22)] p-3 flex flex-col justify-between h-full transition-all duration-300 shadow-2xs hover:-translate-y-1">
                  {/* Top Badges & Actions Layer */}
                  <div className="relative">
                    {/* Rank Badge */}
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
                      <span
                        className={`text-[9px] sm:text-[10px] uppercase font-mono px-2 py-0.5 rounded-xs shadow-xs flex items-center gap-1 ${rankBadgeColor}`}
                      >
                        <Award className="w-3 h-3" />
                        <span>#{rank} TOP</span>
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist({
                          id: `w-${product.id}`,
                          productId: product.id,
                          title: product.title,
                          slug: product.slug,
                          image: primaryImg,
                          price: activePrice,
                          compareAtPrice: comparePrice,
                          rating: product.avg_rating || 4.9,
                          reviewCount: product.review_count || 120,
                        });
                      }}
                      className={`absolute top-2 right-2 z-20 w-6.5 h-6.5 rounded-md flex items-center justify-center shadow-xs transition-all cursor-pointer ${
                        inWish
                          ? "bg-[#FF1028] text-white"
                          : "bg-white/90 backdrop-blur-xs text-slate-600 hover:text-[#FF1028] hover:bg-white"
                      }`}
                      aria-label="Toggle Wishlist"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${inWish ? "fill-current" : ""}`}
                      />
                    </button>

                    {/* Image Area */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="block relative w-full aspect-square rounded-md overflow-hidden bg-slate-100 mb-3"
                    >
                      <Image
                        src={primaryImg}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover object-center group-hover:scale-106 transition-transform duration-500"
                      />

                      {/* Hover Overlay Image */}
                      {hoverImg && hoverImg !== primaryImg && (
                        <Image
                          src={hoverImg}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      )}

                      {/* Bottom Image Overlay Tag: Sold Count */}
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="bg-slate-900/80 backdrop-blur-xs text-emerald-400 font-mono text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-xs shadow-2xs">
                          {product.sold_count || 1200 + idx * 240}+ Sold
                        </span>
                      </div>

                      {/* Discount Tag */}
                      {discount > 0 && (
                        <div className="absolute bottom-2 right-2 z-10">
                          <span className="bg-[#FF1028] text-white font-heading font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-xs shadow-2xs">
                            -{discount}%
                          </span>
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* Product Details Content */}
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating & Hub */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.avg_rating?.toFixed(1) || "4.9"}</span>
                          <span className="text-slate-400 font-normal">
                            ({product.review_count || 120})
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono truncate max-w-[80px]">
                          {product.shipping_origin || "Shenzhen"}
                        </span>
                      </div>

                      {/* Product Title */}
                      <Link href={`/products/${product.slug}`} className="block">
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#FF1028] transition-colors line-clamp-2 leading-snug font-heading min-h-[32px]">
                          {product.title}
                        </h3>
                      </Link>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-1.5">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm sm:text-base font-black text-[#00143D] font-mono leading-none">
                            {formatCurrency(activePrice)}
                          </span>
                        </div>
                        {comparePrice > activePrice && (
                          <span className="text-[9px] text-slate-400 line-through font-mono">
                            ${comparePrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quick Add Button */}
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className={`p-2 rounded-md text-xs font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs ${
                          isJustAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-[#00143D] hover:bg-[#FF1028] text-white hover:shadow-[0_0_14px_rgba(255,16,40,0.35)]"
                        }`}
                        aria-label={`Add ${product.title} to cart`}
                        title="Quick Add to Cart"
                      >
                        {isJustAdded ? (
                          <Check className="w-3.5 h-3.5 animate-in zoom-in" />
                        ) : (
                          <ShoppingCart className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Carousel Bottom Progress / Indicators ── */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 mt-5">
        {Array.from({ length: Math.min(6, maxIndex + 1) }).map((_, dotIdx) => (
          <button
            key={dotIdx}
            onClick={() => setCurrentIndex(dotIdx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentIndex === dotIdx
                ? "w-6 bg-[#FF1028]"
                : "w-2 bg-slate-200 hover:bg-slate-300"
            }`}
            aria-label={`Go to slide page ${dotIdx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
