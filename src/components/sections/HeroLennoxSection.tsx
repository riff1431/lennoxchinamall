"use client";

import React, { useState, useEffect } from "react";
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

import { ReelsVideoData } from "@/components/common/ReelsVideoModal";

interface HeroLennoxSectionProps {
  onOpenVideoModal: (videoData: ReelsVideoData) => void;
}

const FOUR_DEAL_ITEMS = [
  {
    id: "hero-deal-1",
    title: "CMF Buds Pro 2 Wireless Earbuds",
    titleEs: "Auriculares Inalámbricos CMF Buds Pro 2",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    discountBadge: "-$10.00",
    comparePrice: 373.0,
    price: 363.0,
    rating: 4.9,
    reviews: 142,
    discountNote: "$10.00 Discount off",
    installments: "12x $30.00 Interest free",
    freeShipping: "Free shipping ⚡ FULL",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "hero-deal-2",
    title: "iPhone 17 Pro Max Titanium Sourcing",
    titleEs: "iPhone 17 Pro Max Titanio de Fábrica",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    discountBadge: "-$10.00",
    comparePrice: 950.0,
    price: 940.0,
    rating: 5.0,
    reviews: 89,
    discountNote: "$10.00 Discount off",
    installments: "12x $78.00 Interest free",
    freeShipping: "Free shipping ⚡ FULL",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "hero-deal-3",
    title: "Elegant Floral Embroidered Handbag",
    titleEs: "Bolso Elegante con Bordado Floral",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    discountBadge: "-$10.00",
    comparePrice: 100.0,
    price: 90.0,
    rating: 4.8,
    reviews: 210,
    discountNote: "$10.00 Discount off",
    installments: "12x $8.00 Interest free",
    freeShipping: "Free shipping ⚡ FULL",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "hero-deal-4",
    title: "Copper Alloy Inlaid Zircon Round Ring",
    titleEs: "Anillo Redondo con Zircón Incrustado",
    slug: "konnwei-kw850-obd2-car-diagnostic-scanner",
    discountBadge: "-50%",
    comparePrice: 18.0,
    price: 9.0,
    rating: 4.9,
    reviews: 56,
    discountNote: "Direct Factory Price",
    installments: "12x $1.00 Interest free",
    freeShipping: "Free shipping ⚡ FULL",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80",
  },
];

export function HeroLennoxSection({ onOpenVideoModal }: HeroLennoxSectionProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { t, isSpanish } = useTranslation();
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [isMutedTop, setIsMutedTop] = useState(true);
  const [isMutedBottom, setIsMutedBottom] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleQuickAdd = (e: React.MouseEvent, item: typeof FOUR_DEAL_ITEMS[0]) => {
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
              href="/products/blitzwolf-bw-wa3-pro-120w-bluetooth-speaker"
              className="block group mt-4 sm:mt-5 space-y-3.5"
            >
              {/* Product Image Stage */}
              <div className="relative w-full aspect-square max-w-[210px] sm:max-w-[230px] mx-auto rounded-lg overflow-hidden bg-white border border-slate-100 shadow-2xs flex items-center justify-center p-3 group-hover:shadow-md transition-shadow">
                {/* Discount Tag */}
                <span className="absolute top-2.5 left-2.5 z-10 bg-[#FF1028] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-xs font-heading shadow-xs">
                  -45% {t.common.off}
                </span>

                <Image
                  src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80"
                  alt="Acoustic Audio by Goldwood"
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
                  <span className="text-[10px] font-bold text-slate-500 ml-1 font-mono">(4.9 • 380+ {t.common.soldCount})</span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#FF1028] transition-colors leading-snug line-clamp-2">
                  {isSpanish ? "Audio Acústico Goldwood 120W" : "Acoustic Audio by Goldwood 120W"}
                </h3>

                <div className="flex items-baseline justify-center gap-2 pt-0.5">
                  <span className="text-base sm:text-xl font-black text-[#00143D] font-mono">
                    $100.00 <span className="text-xs text-slate-500 font-sans font-normal">USDT</span>
                  </span>
                  <span className="text-xs text-slate-400 line-through font-mono">
                    $180.00
                  </span>
                </div>

                {/* Stock Progress Bar */}
                <div className="pt-2 max-w-[200px] mx-auto">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1">
                    <span className="text-[#FF1028] font-mono">{t.home.unitsLeft}</span>
                    <span className="font-mono">82% {t.home.claimed}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[82%] h-full bg-gradient-to-r from-amber-500 to-[#FF1028] rounded-full" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Grab Deal Button */}
          <div className="pt-4 mt-auto">
            <Link
              href="/products/blitzwolf-bw-wa3-pro-120w-bluetooth-speaker"
              className="w-full block bg-[#00143D] hover:bg-[#FF1028] text-white text-center py-2.5 sm:py-3 px-4 rounded-md font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-[0_0_18px_rgba(255,16,40,0.35)] active:scale-97 font-heading"
            >
              {t.home.grabDeal}
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
            href="/categories/consumer-electronics"
            className="group relative w-full h-[180px] sm:h-[230px] md:h-[260px] lg:h-[285px] rounded-xl overflow-hidden bg-gradient-to-r from-[#002661] via-[#0048B3] to-[#007AFF] border border-blue-400/20 shadow-xs flex items-center justify-center block hover:shadow-[0_0_24px_rgba(0,122,255,0.25)] transition-all duration-300"
          >
            {/* High-Impact Hero Showcase Graphic */}
            <Image
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
              alt="Lennox Mall Direct Factory Deals Banner"
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
                    {t.home.directChinaFactory}
                  </span>
                  <span className="bg-white/20 backdrop-blur-xs text-amber-300 text-[8px] sm:text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/20 hidden xs:inline-block">
                    {t.home.zeroMiddleman}
                  </span>
                </div>
                <h3 className="text-white text-sm sm:text-lg md:text-xl font-black font-heading leading-tight drop-shadow-md">
                  {t.home.factoryGateHardware}
                </h3>
              </div>

              <span className="shrink-0 inline-flex items-center gap-1 bg-white/95 hover:bg-white text-[#00143D] text-[11px] sm:text-xs font-black px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-md font-heading shadow-sm group-hover:translate-x-0.5 transition-transform">
                <span>{t.home.exploreCluster}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Bottom Row of 4 Product Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {FOUR_DEAL_ITEMS.map((item) => {
              const isAdded = !!addedItemIds[item.id];
              const inWish = isMounted && isInWishlist(item.id);

              return (
                <div
                  key={item.id}
                  className="group relative bg-white rounded-lg border border-slate-200/90 p-2 sm:p-2.5 flex flex-col justify-between hover:border-[#FF1028]/60 hover:shadow-[0_0_16px_rgba(255,16,40,0.2)] transition-all duration-300"
                >
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
                            rating: item.rating,
                            reviewCount: item.reviews,
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

                      <Link href={`/products/${item.slug}`} className="block relative w-full h-full">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 10vw"
                          className="object-cover p-1 group-hover:scale-106 transition-transform duration-300"
                        />
                      </Link>
                    </div>

                    {/* Title */}
                    <Link href={`/products/${item.slug}`} className="block">
                      <h4 className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-800 group-hover:text-[#FF1028] transition-colors line-clamp-2 leading-tight min-h-[28px]">
                        {isSpanish ? item.titleEs : item.title}
                      </h4>
                    </Link>

                    {/* Price Block */}
                    <div className="mt-1">
                      {item.comparePrice ? (
                        <span className="text-[9.5px] text-slate-400 line-through font-mono block">
                          ${item.comparePrice.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[9.5px] text-transparent select-none font-mono block">
                          -
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-black text-slate-900 font-mono block">
                        ${item.price.toFixed(2)}
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
                            ? item.installments.replace("Interest free", "sin interés")
                            : item.installments}
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
                    aria-label={`Add ${isSpanish ? item.titleEs : item.title} to cart`}
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
              );
            })}
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
                title: t.home.cantonFairLive,
                subtitle: isSpanish
                  ? "Complejo Cantón • Proveedores Verificados de Hardware y Robótica"
                  : "Guangzhou Complex • Verified Hardware & Robotics Suppliers",
                productLink: "/products/eachine-ex5-4k-gps-fpv-drone",
                productPrice: 189.0,
                hub: "Guangzhou Canton Hub",
                tag: isSpanish ? "FERIA DE EXPORTACIÓN EN VIVO" : "LIVE EXPORT FAIR",
                videoUrl: "/videos/hero/hero_ad_1.mov",
                poster: "/videos/hero/hero_ad_1_thumb.jpg",
              })
            }
            className="group relative min-h-[170px] sm:min-h-[195px] lg:min-h-0 lg:flex-1 rounded-xl overflow-hidden border border-slate-200/90 bg-slate-950 shadow-xs cursor-pointer hover:border-[#FF1028]/60 hover:shadow-[0_0_20px_rgba(255,16,40,0.25)] transition-all duration-300 flex flex-col justify-between p-3 sm:p-3.5"
          >
            {/* Host Video Stream */}
            <video
              src="/videos/hero/hero_ad_1.mov"
              poster="/videos/hero/hero_ad_1_thumb.jpg"
              playsInline
              autoPlay
              muted={isMutedTop}
              loop
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
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
                      title: t.home.cantonFairLive,
                      subtitle: isSpanish
                        ? "Complejo Cantón • Proveedores Verificados de Hardware y Robótica"
                        : "Guangzhou Complex • Verified Hardware & Robotics Suppliers",
                      productLink: "/products/eachine-ex5-4k-gps-fpv-drone",
                      productPrice: 189.0,
                      hub: "Guangzhou Canton Hub",
                      tag: isSpanish ? "FERIA DE EXPORTACIÓN EN VIVO" : "LIVE EXPORT FAIR",
                      videoUrl: "/videos/hero/hero_ad_1.mov",
                      poster: "/videos/hero/hero_ad_1_thumb.jpg",
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
                  {t.home.cantonFairLive}
                </span>
              </div>
              <span className="text-[9px] font-mono text-amber-300 font-bold hidden sm:inline-block shrink-0">
                {t.home.liveQC}
              </span>
            </div>
          </div>

          {/* Bottom Video Card (Factory Inspection Live Stream) */}
          <div
            onClick={() =>
              onOpenVideoModal({
                title: t.home.shenzhenLabInspection,
                subtitle: isSpanish
                  ? "Control de Calidad en Banco de Pruebas • Verificación de Carga y Circuitos"
                  : "Direct Bench Quality Control • Circuitry & Load Verification",
                productLink: "/products/creality-ender-3-v3-se-3d-printer",
                productPrice: 219.0,
                hub: "Shenzhen SZX Hub",
                tag: isSpanish ? "PRUEBAS DE LABORATORIO" : "LAB BENCHMARK",
                videoUrl: "/videos/hero/hero_ad_2.mov",
                poster: "/videos/hero/hero_ad_2_thumb.jpg",
              })
            }
            className="group relative min-h-[170px] sm:min-h-[195px] lg:min-h-0 lg:flex-1 rounded-xl overflow-hidden border border-slate-200/90 bg-slate-950 shadow-xs cursor-pointer hover:border-[#FF1028]/60 hover:shadow-[0_0_20px_rgba(255,16,40,0.25)] transition-all duration-300 flex flex-col justify-between p-3 sm:p-3.5"
          >
            {/* Host Video Stream */}
            <video
              src="/videos/hero/hero_ad_2.mov"
              poster="/videos/hero/hero_ad_2_thumb.jpg"
              playsInline
              autoPlay
              muted={isMutedBottom}
              loop
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
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
                      title: t.home.shenzhenLabInspection,
                      subtitle: isSpanish
                        ? "Control de Calidad en Banco de Pruebas • Verificación de Carga y Circuitos"
                        : "Direct Bench Quality Control • Circuitry & Load Verification",
                      productLink: "/products/creality-ender-3-v3-se-3d-printer",
                      productPrice: 219.0,
                      hub: "Shenzhen SZX Hub",
                      tag: isSpanish ? "PRUEBAS DE LABORATORIO" : "LAB BENCHMARK",
                      videoUrl: "/videos/hero/hero_ad_2.mov",
                      poster: "/videos/hero/hero_ad_2_thumb.jpg",
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
                  {t.home.shenzhenLabInspection}
                </span>
              </div>
              <span className="text-[9px] font-mono text-amber-300 font-bold hidden sm:inline-block shrink-0">
                {t.home.qcPassed}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
