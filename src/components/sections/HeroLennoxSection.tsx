"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Volume2,
  VolumeX,
  Maximize2,
  Play,
  ShoppingCart,
  Check,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  ShieldCheck,
  Sparkles,
  Eye,
  Heart,
  Star,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatCurrency } from "@/utils/helpers";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useCurrency } from "@/store/useCurrencyStore";

import { ReelsVideoData } from "@/components/common/ReelsVideoModal";
import {
  HeroLennoxConfig,
  HeroDealOfTheDay,
  HeroMiddleBanner,
  HeroFourDealItem,
  HeroVideoReelItem,
  DEFAULT_HERO_LENNOX_CONFIG,
} from "@/types/homepage";

interface HeroLennoxSectionProps {
  config?: HeroLennoxConfig;
  onOpenVideoModal: (videoData: ReelsVideoData) => void;
}

export function HeroLennoxSection({ config, onOpenVideoModal }: HeroLennoxSectionProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { t, isSpanish } = useTranslation();
  const { formatCurrency, formatPrice, currency, convert } = useCurrency();
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [isMutedTop, setIsMutedTop] = useState(true);
  const [isMutedBottom, setIsMutedBottom] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Merged dynamic content with built-in fallbacks
  const activeDeal = config?.deal_of_the_day || DEFAULT_HERO_LENNOX_CONFIG.deal_of_the_day!;
  const activeBanner = config?.middle_banner || DEFAULT_HERO_LENNOX_CONFIG.middle_banner!;
  const activeFourDeals =
    config?.four_deals && config.four_deals.length > 0
      ? config.four_deals
      : DEFAULT_HERO_LENNOX_CONFIG.four_deals || [];
  const activeReels =
    config?.video_reels && config.video_reels.length > 0
      ? config.video_reels
      : DEFAULT_HERO_LENNOX_CONFIG.video_reels || [];

  const reelTop = activeReels[0] || DEFAULT_HERO_LENNOX_CONFIG.video_reels![0];
  const reelBottom = activeReels[1] || DEFAULT_HERO_LENNOX_CONFIG.video_reels![1];

  // Dynamic countdown timer for Deal of the Day
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Continuous Auto-Looping Deals Carousel (3 items per view on Desktop) ──
  const [dealsCurrentIndex, setDealsCurrentIndex] = useState(0);
  const [dealsWithTransition, setDealsWithTransition] = useState(true);
  const [isDealsPaused, setIsDealsPaused] = useState(false);
  const [dealsItemsPerView, setDealsItemsPerView] = useState(3);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Compute items per view based on viewport: 3 on Desktop (1024px+), 2 on Mobile/Tablet
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setDealsItemsPerView(3); // Desktop: exactly 3 columns
      } else if (width >= 560) {
        setDealsItemsPerView(2); // Tablet: 2 columns
      } else {
        setDealsItemsPerView(2); // Mobile: 2 columns
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalDeals = activeFourDeals.length;
  // Extended array for seamless infinite looping (3 sets ensures smooth continuous scrolling without rewind jumps)
  const extendedFourDeals =
    totalDeals > 0
      ? [...activeFourDeals, ...activeFourDeals, ...activeFourDeals]
      : [];

  const nextDeal = useCallback(() => {
    if (totalDeals === 0) return;
    setDealsWithTransition(true);
    setDealsCurrentIndex((prev) => prev + 1);
  }, [totalDeals]);

  const prevDeal = useCallback(() => {
    if (totalDeals === 0) return;
    if (dealsCurrentIndex === 0) {
      setDealsWithTransition(false);
      setDealsCurrentIndex(totalDeals);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDealsWithTransition(true);
          setDealsCurrentIndex(totalDeals - 1);
        });
      });
    } else {
      setDealsWithTransition(true);
      setDealsCurrentIndex((prev) => prev - 1);
    }
  }, [dealsCurrentIndex, totalDeals]);

  const handleDealsTransitionEnd = () => {
    if (dealsCurrentIndex >= totalDeals) {
      setDealsWithTransition(false);
      setDealsCurrentIndex(dealsCurrentIndex % totalDeals);
    }
  };

  // Auto-rotating timer: 3 seconds auto carousel loop (pauses when hovered or dragged)
  useEffect(() => {
    if (isDealsPaused || totalDeals <= dealsItemsPerView) return;

    const timer = setInterval(() => {
      nextDeal();
    }, 3000);

    return () => clearInterval(timer);
  }, [isDealsPaused, nextDeal, totalDeals, dealsItemsPerView]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || touchStartX === null) return;
    setIsDragging(false);
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 40) {
      nextDeal();
    } else if (diff < -40) {
      prevDeal();
    }
    setTouchStartX(null);
  };

  const handleQuickAdd = (e: React.MouseEvent, item: HeroFourDealItem) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: item.id,
      productId: item.id,
      title: item.title,
      slug: item.slug,
      image: item.image,
      price: item.price,
      compareAtPrice: item.comparePrice || undefined,
      quantity: 1,
      stock: 50,
    });

    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1600);
  };

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 items-stretch">
        {/* ═══════════════════════════════════════════════════════════
            1. LEFT COLUMN: DEAL OF THE DAY
            • Desktop: 3 Cols / Full Height Card
            • Mobile/Tablet: Sleek Compact Interactive Card
        ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 xl:col-span-3 bg-gradient-to-b from-white to-slate-50/80 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between p-4 sm:p-4.5 hover:border-[#FF1028]/60 hover:shadow-[0_0_20px_-2px_rgba(255,16,40,0.22)] transition-all duration-300 group">
          <div>
            {/* Header & Live Scarcity Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FF1028] animate-bounce" />
                <h2 className="font-black text-sm sm:text-base text-[#00143D] tracking-wider uppercase font-heading">
                  {t.home.dealOfTheDay}
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#FF1028] bg-red-50 px-2 py-0.5 rounded-md border border-red-100 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </span>
            </div>

            {/* Featured Product Box */}
            <Link
              href={activeDeal.slug.startsWith("/") ? activeDeal.slug : `/products/${activeDeal.slug}`}
              className="block group mt-4 sm:mt-5 space-y-3.5"
            >
              {/* Product Image Stage */}
              <div className="relative w-full aspect-square max-w-[210px] sm:max-w-[230px] mx-auto rounded-lg overflow-hidden bg-white border border-slate-100 shadow-2xs flex items-center justify-center p-3 group-hover:shadow-md transition-shadow">
                {/* Discount Tag */}
                <span className="absolute top-2.5 left-2.5 z-10 bg-[#FF1028] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-xs font-heading shadow-xs">
                  {activeDeal.discount_badge || `-45% ${t.common.off}`}
                </span>

                <Image
                  src={activeDeal.image}
                  alt={activeDeal.title}
                  fill
                  sizes="(max-width: 640px) 180px, 230px"
                  className="object-contain p-2 group-hover:scale-108 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Title & Price Information */}
              <div className="text-center space-y-1 px-1">
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                  <span className="text-[10px] font-bold text-slate-500 ml-1 font-mono">
                    ({activeDeal.rating || 4.9} • {activeDeal.reviews_count || 380}+ {t.common.soldCount})
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#FF1028] transition-colors leading-snug line-clamp-2">
                  {isSpanish ? (activeDeal.title_es || activeDeal.title) : activeDeal.title}
                </h3>

                <div className="flex items-baseline justify-center gap-2 pt-0.5">
                  <span className="text-base sm:text-xl font-black text-[#00143D] font-mono">
                    {formatPrice(activeDeal.price)} {currency === "USDT" && <span className="text-xs text-slate-500 font-sans font-normal">USDT</span>}
                  </span>
                  {activeDeal.compare_price > 0 && (
                    <span className="text-xs text-slate-400 line-through font-mono">
                      {formatPrice(activeDeal.compare_price)}
                    </span>
                  )}
                </div>

                {/* Stock Progress Bar */}
                <div className="pt-2 max-w-[200px] mx-auto">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1">
                    <span className="text-[#FF1028] font-mono">
                      {isSpanish ? `Solo ${activeDeal.units_left || 8} disponibles` : `Only ${activeDeal.units_left || 8} Units Left`}
                    </span>
                    <span className="font-mono">{activeDeal.claimed_percent || 82}% {t.home.claimed}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-[#FF1028] rounded-full"
                      style={{ width: `${activeDeal.claimed_percent || 82}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Grab Deal Button */}
          <div className="pt-4 mt-auto">
            <Link
              href={activeDeal.slug.startsWith("/") ? activeDeal.slug : `/products/${activeDeal.slug}`}
              className="w-full block bg-[#00143D] hover:bg-[#FF1028] text-white text-center py-2.5 sm:py-3 px-4 rounded-md font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-[0_0_18px_rgba(255,16,40,0.35)] active:scale-97 font-heading"
            >
              {isSpanish
                ? (activeDeal.button_text_es || activeDeal.button_text || t.home.grabDeal)
                : (activeDeal.button_text || t.home.grabDeal)}
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            2. CENTER COLUMN: SHOWCASE PROMO BANNER + 4 PRODUCT CARDS
            • Desktop: 6 Cols
            • Mobile: Smooth swipeable row or 2-col responsive touch cards
        ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between gap-3 sm:gap-3.5">
          {/* Top Showcase Promo Banner */}
          <Link
            href={activeBanner.link || "/categories/consumer-electronics"}
            className="group relative w-full h-[180px] sm:h-[230px] md:h-[260px] lg:h-[285px] rounded-xl overflow-hidden bg-gradient-to-r from-[#002661] via-[#0048B3] to-[#007AFF] border border-blue-400/20 shadow-xs flex items-center justify-center block hover:shadow-[0_0_24px_rgba(0,122,255,0.25)] transition-all duration-300"
          >
            {/* High-Impact Hero Showcase Graphic */}
            <Image
              src={activeBanner.image}
              alt={activeBanner.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-104 transition-transform duration-700 opacity-90"
              priority
            />

            {/* Ambient Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00143D]/60 via-transparent to-transparent" />

            {/* Banner Text Overlays */}
            <div className="absolute bottom-3.5 sm:bottom-4 left-3.5 sm:left-5 right-3.5 sm:right-5 z-10 flex items-end justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-[#FF1028] text-white text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-md font-heading shadow-xs">
                    {isSpanish ? (activeBanner.badge_es || activeBanner.badge || t.home.directChinaFactory) : (activeBanner.badge || t.home.directChinaFactory)}
                  </span>
                  {(activeBanner.badge_sub || t.home.zeroMiddleman) && (
                    <span className="bg-white/20 backdrop-blur-xs text-amber-300 text-[8px] sm:text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/20 hidden xs:inline-block">
                      {isSpanish ? (activeBanner.badge_sub_es || activeBanner.badge_sub || t.home.zeroMiddleman) : (activeBanner.badge_sub || t.home.zeroMiddleman)}
                    </span>
                  )}
                </div>
                <h3 className="text-white text-sm sm:text-lg md:text-xl font-black font-heading leading-tight drop-shadow-md">
                  {isSpanish ? (activeBanner.title_es || activeBanner.title || t.home.factoryGateHardware) : (activeBanner.title || t.home.factoryGateHardware)}
                </h3>
              </div>

              <span className="shrink-0 inline-flex items-center gap-1 bg-white/95 hover:bg-white text-[#00143D] text-[11px] sm:text-xs font-black px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md font-heading shadow-sm group-hover:translate-x-0.5 transition-transform">
                <span>{isSpanish ? (activeBanner.button_text_es || activeBanner.button_text || t.home.exploreCluster) : (activeBanner.button_text || t.home.exploreCluster)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Bottom Row: Continuous Carousel (3 Products per view on Desktop) */}
          <div
            className="relative group/deals select-none -mx-1 px-1"
            onMouseEnter={() => setIsDealsPaused(true)}
            onMouseLeave={() => setIsDealsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Viewport */}
            <div className="overflow-hidden py-1 px-0.5">
              <div
                className={`flex ${
                  dealsWithTransition
                    ? "transition-transform duration-500 ease-out"
                    : "transition-none"
                }`}
                style={{
                  transform: `translateX(-${(dealsCurrentIndex * 100) / dealsItemsPerView}%)`,
                }}
                onTransitionEnd={handleDealsTransitionEnd}
              >
                {extendedFourDeals.map((item, idx) => {
                  const isAdded = !!addedItemIds[item.id];
                  const inWish = isMounted && isInWishlist(item.id);

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="shrink-0 px-1 sm:px-1.5"
                      style={{ width: `${100 / dealsItemsPerView}%` }}
                    >
                      <div className="group relative bg-white rounded-lg border border-slate-200/90 p-2 sm:p-2.5 flex flex-col justify-between h-full hover:border-[#FF1028]/60 hover:shadow-[0_0_16px_rgba(255,16,40,0.2)] transition-all duration-300">
                        <div>
                          {/* Top Discount Badge & Wishlist Button */}
                          <div className="relative w-full aspect-square rounded-md bg-slate-50 overflow-hidden mb-1.5">
                            {item.discountBadge && (
                              <span className="absolute top-1.5 left-1.5 z-10 bg-[#10B981] text-white text-[8px] sm:text-[8.5px] font-black px-1.5 py-0.5 rounded-xs font-mono shadow-2xs">
                                {item.discountBadge}
                              </span>
                            )}

                            {/* Wishlist toggle */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleItem({
                                  id: `w-${item.id}`,
                                  productId: item.id,
                                  title: item.title,
                                  slug: item.slug,
                                  image: item.image,
                                  price: item.price,
                                  compareAtPrice: item.comparePrice || undefined,
                                  rating: item.rating || 4.9,
                                  reviewCount: item.reviews || 100,
                                });
                              }}
                              className={`absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer ${
                                inWish
                                  ? "bg-[#FF1028] text-white"
                                  : "bg-white/80 text-slate-500 hover:text-[#FF1028] opacity-0 group-hover:opacity-100"
                              }`}
                              aria-label="Wishlist"
                            >
                              <Heart className={`w-3 h-3 ${inWish ? "fill-current" : ""}`} />
                            </button>

                            <Link href={item.slug.startsWith("/") ? item.slug : `/products/${item.slug}`} className="block relative w-full h-full">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
                                className="object-cover p-1 group-hover:scale-106 transition-transform duration-300"
                              />
                            </Link>
                          </div>

                          {/* Title */}
                          <Link href={item.slug.startsWith("/") ? item.slug : `/products/${item.slug}`} className="block">
                            <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-[#FF1028] transition-colors line-clamp-2 leading-tight min-h-[28px]">
                              {isSpanish ? (item.titleEs || item.title) : item.title}
                            </h4>
                          </Link>

                          {/* Price Block */}
                          <div className="mt-1">
                            {item.comparePrice ? (
                              <span className="text-[9.5px] text-slate-400 line-through font-mono block">
                                {formatPrice(item.comparePrice)}
                              </span>
                            ) : (
                              <span className="text-[9.5px] text-transparent select-none font-mono block">
                                -
                              </span>
                            )}
                            <span className="text-xs sm:text-sm font-black text-slate-900 font-mono block">
                              {formatPrice(item.price)}
                            </span>
                          </div>

                          {/* Perks / Installments Note */}
                          <div className="mt-1 space-y-0.5 text-[8px] sm:text-[8.5px] leading-tight font-medium text-[#10B981]">
                            {item.discountNote && (
                              <div className="truncate">
                                {isSpanish
                                  ? item.discountNote.replace("Discount off", "de descuento").replace("Direct Factory Price", "Precio Directo de Fábrica")
                                  : item.discountNote}
                              </div>
                            )}
                            {item.installments && (
                              <div className="text-slate-500 truncate">
                                {isSpanish
                                  ? `12x ${formatPrice(item.price / 12)} sin interés`
                                  : `12x ${formatPrice(item.price / 12)} Interest free`}
                              </div>
                            )}
                            {item.freeShipping && (
                              <div className="font-bold flex items-center gap-0.5 truncate">
                                <span>
                                  {isSpanish
                                    ? item.freeShipping.replace("Free shipping", "Envío gratis")
                                    : item.freeShipping}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={(e) => handleQuickAdd(e, item)}
                          className={`w-full mt-2 py-1.5 rounded-lg sm:rounded-xl text-[10.5px] sm:text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                            isAdded
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-[#FF1028] hover:bg-[#e00d22] text-white shadow-2xs"
                          }`}
                          aria-label={`Add ${isSpanish ? (item.titleEs || item.title) : item.title} to cart`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3 animate-in zoom-in" />
                              <span>{t.common.success}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3 h-3 sm:hidden" />
                              <span>{t.common.addToCart}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Left & Right Floating Navigation Controls */}
            {totalDeals > dealsItemsPerView && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    prevDeal();
                  }}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-[#00143D] text-[#00143D] hover:text-white border border-slate-200/90 shadow-md flex items-center justify-center transition-all opacity-0 group-hover/deals:opacity-100 z-20 cursor-pointer active:scale-95"
                  aria-label={isSpanish ? "Ofertas anteriores" : "Previous deals"}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextDeal();
                  }}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-[#FF1028] text-[#00143D] hover:text-white border border-slate-200/90 shadow-md flex items-center justify-center transition-all opacity-0 group-hover/deals:opacity-100 z-20 cursor-pointer active:scale-95"
                  aria-label={isSpanish ? "Siguientes ofertas" : "Next deals"}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Carousel Dot Indicators */}
            {totalDeals > dealsItemsPerView && (
              <div className="flex items-center justify-center gap-1 pt-1.5">
                {activeFourDeals.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDealsWithTransition(true);
                      setDealsCurrentIndex(i);
                    }}
                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                      i === (dealsCurrentIndex % totalDeals)
                        ? "w-4 bg-[#FF1028]"
                        : "w-1.5 bg-slate-200 hover:bg-slate-300"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            3. RIGHT COLUMN: 2 STACKED LIVE QC VIDEO CARDS
            • Desktop: 3 Cols (2 stacked square cards)
            • Mobile/Tablet: 2 side-by-side video cards
        ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 xl:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-3.5">
          {/* Top Video Card (Canton Export Fair) */}
          <div
            onClick={() =>
              onOpenVideoModal({
                title: isSpanish ? (reelTop.title_es || reelTop.title) : reelTop.title,
                subtitle: isSpanish
                  ? (reelTop.subtitle_es || reelTop.subtitle || "Complejo Cantón • Proveedores Verificados de Hardware y Robótica")
                  : (reelTop.subtitle || "Guangzhou Complex • Verified Hardware & Robotics Suppliers"),
                productLink: reelTop.product_link || "/products/eachine-ex5-4k-gps-fpv-drone",
                productPrice: reelTop.product_price || 189.0,
                hub: reelTop.hub || "Guangzhou Canton Hub",
                tag: reelTop.tag || (isSpanish ? "FERIA DE EXPORTACIÓN EN VIVO" : "LIVE EXPORT FAIR"),
                videoUrl: reelTop.video_url,
                poster: reelTop.poster,
              })
            }
            className="group relative min-h-[170px] sm:min-h-[195px] lg:min-h-0 lg:flex-1 rounded-xl overflow-hidden border border-slate-200/90 bg-slate-950 shadow-xs cursor-pointer hover:border-[#FF1028]/60 hover:shadow-[0_0_20px_rgba(255,16,40,0.25)] transition-all duration-300 flex flex-col justify-between p-3 sm:p-3.5"
          >
            {/* Host Video Stream */}
            <video
              poster={reelTop.poster}
              playsInline
              autoPlay
              muted={isMutedTop}
              loop
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            >
              {reelTop.video_url?.endsWith(".mov") && (
                <source src={reelTop.video_url.replace(/\.mov$/i, ".mp4")} type="video/mp4" />
              )}
              {reelTop.video_url?.endsWith(".mp4") && (
                <source src={reelTop.video_url} type="video/mp4" />
              )}
              <source src={reelTop.video_url} type="video/quicktime" />
              <source src={reelTop.video_url} />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#000B24] via-transparent to-black/40 pointer-events-none" />

            {/* Top Bar: AD Badge & Controls */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="bg-black/70 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-md border border-white/20 uppercase font-mono">
                AD
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMutedTop(!isMutedTop);
                  }}
                  className="w-6 h-6 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-colors cursor-pointer"
                  aria-label="Toggle sound"
                >
                  {isMutedTop ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenVideoModal({
                      title: isSpanish ? (reelTop.title_es || reelTop.title) : reelTop.title,
                      subtitle: isSpanish
                        ? (reelTop.subtitle_es || reelTop.subtitle || "Complejo Cantón • Proveedores Verificados de Hardware y Robótica")
                        : (reelTop.subtitle || "Guangzhou Complex • Verified Hardware & Robotics Suppliers"),
                      productLink: reelTop.product_link || "/products/eachine-ex5-4k-gps-fpv-drone",
                      productPrice: reelTop.product_price || 189.0,
                      hub: reelTop.hub || "Guangzhou Canton Hub",
                      tag: reelTop.tag || (isSpanish ? "FERIA DE EXPORTACIÓN EN VIVO" : "LIVE EXPORT FAIR"),
                      videoUrl: reelTop.video_url,
                      poster: reelTop.poster,
                    });
                  }}
                  className="w-6 h-6 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-colors cursor-pointer"
                  aria-label="Expand video"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Center Pulsing Play Icon */}
            <div className="relative z-10 my-auto flex justify-center py-1 pointer-events-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FF1028]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-[#FF1028] transition-all">
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 fill-current" />
              </div>
            </div>

            {/* Bottom Overlay Label */}
            <div className="relative z-10 flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-black drop-shadow-md font-heading truncate">
                  {isSpanish ? (reelTop.title_es || reelTop.title || t.home.cantonFairLive) : (reelTop.title || t.home.cantonFairLive)}
                </span>
              </div>
              <span className="text-[9px] font-mono text-amber-300 font-bold hidden sm:inline-block shrink-0">
                {reelTop.tag || t.home.liveQC}
              </span>
            </div>
          </div>

          {/* Bottom Video Card (Factory Inspection Live Stream) */}
          <div
            onClick={() =>
              onOpenVideoModal({
                title: isSpanish ? (reelBottom.title_es || reelBottom.title) : reelBottom.title,
                subtitle: isSpanish
                  ? (reelBottom.subtitle_es || reelBottom.subtitle || "Control de Calidad en Banco de Pruebas • Verificación de Carga y Circuitos")
                  : (reelBottom.subtitle || "Direct Bench Quality Control • Circuitry & Load Verification"),
                productLink: reelBottom.product_link || "/products/creality-ender-3-v3-se-3d-printer",
                productPrice: reelBottom.product_price || 219.0,
                hub: reelBottom.hub || "Shenzhen SZX Hub",
                tag: reelBottom.tag || (isSpanish ? "PRUEBAS DE LABORATORIO" : "LAB BENCHMARK"),
                videoUrl: reelBottom.video_url,
                poster: reelBottom.poster,
              })
            }
            className="group relative min-h-[170px] sm:min-h-[195px] lg:min-h-0 lg:flex-1 rounded-xl overflow-hidden border border-slate-200/90 bg-slate-950 shadow-xs cursor-pointer hover:border-[#FF1028]/60 hover:shadow-[0_0_20px_rgba(255,16,40,0.25)] transition-all duration-300 flex flex-col justify-between p-3 sm:p-3.5"
          >
            {/* Host Video Stream */}
            <video
              poster={reelBottom.poster}
              playsInline
              autoPlay
              muted={isMutedBottom}
              loop
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            >
              {reelBottom.video_url?.endsWith(".mov") && (
                <source src={reelBottom.video_url.replace(/\.mov$/i, ".mp4")} type="video/mp4" />
              )}
              {reelBottom.video_url?.endsWith(".mp4") && (
                <source src={reelBottom.video_url} type="video/mp4" />
              )}
              <source src={reelBottom.video_url} type="video/quicktime" />
              <source src={reelBottom.video_url} />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#000B24] via-transparent to-black/40 pointer-events-none" />

            {/* Top Bar: AD Badge & Controls */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="bg-black/70 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-md border border-white/20 uppercase font-mono">
                AD
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMutedBottom(!isMutedBottom);
                  }}
                  className="w-6 h-6 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-colors cursor-pointer"
                  aria-label="Toggle sound"
                >
                  {isMutedBottom ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenVideoModal({
                      title: isSpanish ? (reelBottom.title_es || reelBottom.title) : reelBottom.title,
                      subtitle: isSpanish
                        ? (reelBottom.subtitle_es || reelBottom.subtitle || "Control de Calidad en Banco de Pruebas • Verificación de Carga y Circuitos")
                        : (reelBottom.subtitle || "Direct Bench Quality Control • Circuitry & Load Verification"),
                      productLink: reelBottom.product_link || "/products/creality-ender-3-v3-se-3d-printer",
                      productPrice: reelBottom.product_price || 219.0,
                      hub: reelBottom.hub || "Shenzhen SZX Hub",
                      tag: reelBottom.tag || (isSpanish ? "PRUEBAS DE LABORATORIO" : "LAB BENCHMARK"),
                      videoUrl: reelBottom.video_url,
                      poster: reelBottom.poster,
                    });
                  }}
                  className="w-6 h-6 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-colors cursor-pointer"
                  aria-label="Expand video"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Center Pulsing Play Icon */}
            <div className="relative z-10 my-auto flex justify-center py-1 pointer-events-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-[#FF1028] transition-all">
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 fill-current" />
              </div>
            </div>

            {/* Bottom Overlay Label */}
            <div className="relative z-10 flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-black drop-shadow-md font-heading truncate">
                  {isSpanish ? (reelBottom.title_es || reelBottom.title || t.home.shenzhenLabInspection) : (reelBottom.title || t.home.shenzhenLabInspection)}
                </span>
              </div>
              <span className="text-[9px] font-mono text-amber-300 font-bold hidden sm:inline-block shrink-0">
                {reelBottom.tag || t.home.qcPassed}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
