"use client";

import React, { useState } from "react";
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
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Product } from "@/types/database";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/helpers";

interface HeroLennoxSectionProps {
  onOpenVideoModal: (videoData: {
    title: string;
    subtitle: string;
    productLink: string;
    productPrice: number;
    hub: string;
    tag: string;
  }) => void;
}

const FIVE_DEAL_ITEMS = [
  {
    id: "hero-deal-1",
    title: "CMF Buds Pro 2 Wireless Earbuds",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    discountBadge: "-$10.00",
    comparePrice: 373.0,
    price: 363.0,
    discountNote: "$10.00 Discount off",
    installments: "Installments in 12x $30.00 Interest free",
    freeShipping: "Free shipping ⚡ FULL",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "hero-deal-2",
    title: "iPhone 17 Pro Max 256GB Titanium",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    discountBadge: "-$10.00",
    comparePrice: 950.0,
    price: 940.0,
    discountNote: "$10.00 Discount off",
    installments: "Installments in 12x $78.00 Interest free",
    freeShipping: "Free shipping ⚡ FULL",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "hero-deal-3",
    title: "Elegant Floral Embroidered Handbag",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    discountBadge: "-$10.00",
    comparePrice: 100.0,
    price: 90.0,
    discountNote: "$10.00 Discount off",
    installments: "Installments in 12x $8.00 Interest free",
    freeShipping: "Free shipping ⚡ FULL",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "hero-deal-4",
    title: "Copper Alloy Inlaid Zircon Round Ring",
    slug: "konnwei-kw850-obd2-car-diagnostic-scanner",
    discountBadge: null,
    comparePrice: null,
    price: 9.0,
    discountNote: null,
    installments: "Installments in 12x $1.00 Interest free",
    freeShipping: "Free shipping ⚡ FULL",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "hero-deal-5",
    title: "iPhone 14 Pro Max 512GB Space Black",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    discountBadge: null,
    comparePrice: null,
    price: 1149.0,
    discountNote: null,
    installments: "Installments in 12x $96.00 Interest free",
    freeShipping: "Free shipping ⚡ FULL",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80",
  },
];

export function HeroLennoxSection({ onOpenVideoModal }: HeroLennoxSectionProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [isMutedTop, setIsMutedTop] = useState(true);
  const [isMutedBottom, setIsMutedBottom] = useState(true);

  const handleQuickAdd = (e: React.MouseEvent, item: typeof FIVE_DEAL_ITEMS[0]) => {
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
    }, 1500);
  };

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-stretch">
        {/* ═══════════════════════════════════════════════════════════
            1. LEFT COLUMN: DEAL OF THE DAY (3 Cols on Desktop)
        ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between p-4 sm:p-5 hover-lift transition-all">
          <div>
            {/* Header */}
            <h2 className="text-center font-black text-base sm:text-lg text-[#00143D] tracking-wider uppercase font-heading pb-3 border-b border-slate-100">
              DEAL OF THE DAY
            </h2>

            {/* Product Feature Box */}
            <Link
              href="/products/blitzwolf-bw-wa3-pro-120w-bluetooth-speaker"
              className="block group mt-5 space-y-4"
            >
              <div className="relative w-full aspect-square max-w-[220px] mx-auto rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-3">
                <Image
                  src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80"
                  alt="Acoustic Audio by Goldwood"
                  fill
                  sizes="220px"
                  className="object-contain p-2 group-hover:scale-106 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Title & Price */}
              <div className="text-center space-y-1.5 px-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#FF1028] transition-colors leading-snug line-clamp-2">
                  Acoustic Audio by Goldwood
                </h3>
                <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  $100.00
                </div>
              </div>
            </Link>
          </div>

          {/* Grab Deal Button */}
          <div className="pt-4 mt-auto">
            <Link
              href="/products/blitzwolf-bw-wa3-pro-120w-bluetooth-speaker"
              className="w-full block bg-[#00143D] hover:bg-[#FF1028] text-white text-center py-2.5 sm:py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 font-heading"
            >
              Grab This Deal
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            2. CENTER COLUMN: MAIN SHOWCASE BANNER + 5 MINI CARDS (6 Cols)
        ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between gap-3">
          {/* Top Showcase Promo Banner */}
          <Link
            href="/categories/consumer-electronics"
            className="group relative w-full h-[220px] sm:h-[260px] md:h-[280px] lg:h-[290px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#003B95] via-[#0055D4] to-[#0091FF] border border-blue-400/20 shadow-xs flex items-center justify-center block"
          >
            {/* High-Impact Hero Showcase Graphic */}
            <Image
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
              alt="Lennox Mall Direct Factory Deals Banner"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-103 transition-transform duration-700 opacity-90"
              priority
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

            {/* Banner Text Overlays */}
            <div className="absolute bottom-4 left-5 right-5 z-10 flex items-center justify-between">
              <div>
                <span className="bg-[#FF1028] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded font-heading shadow-xs">
                  DIRECT CHINA SOURCING
                </span>
                <h3 className="text-white text-base sm:text-xl font-black font-heading mt-1 drop-shadow-md">
                  Factory Gate Hardware &amp; Electronics
                </h3>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 bg-white/90 hover:bg-white text-[#00143D] text-xs font-black px-3 py-1.5 rounded-xl font-heading shadow-sm group-hover:translate-x-0.5 transition-transform">
                <span>Shop All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Bottom Row of 5 Product Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {FIVE_DEAL_ITEMS.map((item) => {
              const isAdded = !!addedItemIds[item.id];

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-xl border border-slate-200/90 p-2 sm:p-2.5 flex flex-col justify-between hover:border-blue-400/80 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    {/* Top Discount Badge & Image */}
                    <div className="relative w-full aspect-square rounded-lg bg-slate-50 overflow-hidden mb-2">
                      {item.discountBadge && (
                        <span className="absolute top-1 left-1 z-10 bg-[#10B981] text-white text-[8.5px] font-black px-1.5 py-0.2 rounded font-mono shadow-2xs">
                          {item.discountBadge}
                        </span>
                      )}

                      <Link href={`/products/${item.slug}`} className="block relative w-full h-full">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 12vw"
                          className="object-cover p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                    </div>

                    {/* Title */}
                    <Link href={`/products/${item.slug}`} className="block">
                      <h4 className="text-[11px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight min-h-[28px]">
                        {item.title}
                      </h4>
                    </Link>

                    {/* Price Block */}
                    <div className="mt-1">
                      {item.comparePrice && (
                        <span className="text-[10px] text-slate-400 line-through font-mono block">
                          ${item.comparePrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-black text-slate-900 font-mono block">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Perks / Installments Note */}
                    <div className="mt-1 space-y-0.5 text-[8.5px] leading-tight font-medium text-[#10B981]">
                      {item.discountNote && (
                        <div className="truncate">{item.discountNote}</div>
                      )}
                      {item.installments && (
                        <div className="text-slate-500 truncate">{item.installments}</div>
                      )}
                      {item.freeShipping && (
                        <div className="font-bold flex items-center gap-0.5">
                          <span>{item.freeShipping}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => handleQuickAdd(e, item)}
                    className={`w-full mt-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-[#2563EB] hover:bg-blue-700 text-white shadow-2xs"
                    }`}
                    aria-label={`Add ${item.title} to cart`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3 animate-in zoom-in" />
                        <span>Added</span>
                      </>
                    ) : (
                      <span>Add to cart</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            3. RIGHT COLUMN: 2 STACKED LIVE VIDEO CARDS (3 Cols)
        ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col justify-between gap-3">
          {/* Top Video Card (Canton Export Fair) */}
          <div
            onClick={() =>
              onOpenVideoModal({
                title: "Canton Fair Global Sourcing Live Stream",
                subtitle: "Guangzhou Complex • Verified Hardware & Robotics Suppliers",
                productLink: "/products/eachine-ex5-4k-gps-fpv-drone",
                productPrice: 189.0,
                hub: "Guangzhou Canton Hub",
                tag: "LIVE EXPORT FAIR",
              })
            }
            className="group relative flex-1 min-h-[190px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs cursor-pointer hover:border-blue-500 transition-all duration-300 flex flex-col justify-between p-3"
          >
            {/* Host Video Stream Image */}
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
              alt="Canton Fair Sourcing Live Stream"
              fill
              sizes="(max-width: 1024px) 100vw, 25vw"
              className="object-cover object-top opacity-90 group-hover:scale-104 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            {/* Top Bar: AD Badge & Controls */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="bg-black/70 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded border border-white/20 uppercase font-mono">
                AD
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMutedTop(!isMutedTop);
                  }}
                  className="w-6 h-6 rounded-md bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-colors"
                  aria-label="Toggle sound"
                >
                  {isMutedTop ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenVideoModal({
                      title: "Canton Fair Global Sourcing Live Stream",
                      subtitle: "Guangzhou Complex • Verified Hardware & Robotics Suppliers",
                      productLink: "/products/eachine-ex5-4k-gps-fpv-drone",
                      productPrice: 189.0,
                      hub: "Guangzhou Canton Hub",
                      tag: "LIVE EXPORT FAIR",
                    });
                  }}
                  className="w-6 h-6 rounded-md bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-colors"
                  aria-label="Expand video"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Overlay Label */}
            <div className="relative z-10 flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[11px] font-black drop-shadow-md font-heading">
                  Canton Fair Sourcing Booth
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-xs flex items-center justify-center group-hover:bg-[#FF1028] transition-colors">
                <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
              </div>
            </div>
          </div>

          {/* Bottom Video Card (Factory Inspection Live Stream) */}
          <div
            onClick={() =>
              onOpenVideoModal({
                title: "Shenzhen High-Tech Factory Lab Inspection",
                subtitle: "Direct Bench Quality Control • Circuitry & Load Verification",
                productLink: "/products/creality-ender-3-v3-se-3d-printer",
                productPrice: 219.0,
                hub: "Shenzhen SZX Hub",
                tag: "LAB BENCHMARK",
              })
            }
            className="group relative flex-1 min-h-[190px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs cursor-pointer hover:border-blue-500 transition-all duration-300 flex flex-col justify-between p-3"
          >
            {/* Host Video Stream Image */}
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
              alt="Shenzhen Factory Lab Inspection Live Stream"
              fill
              sizes="(max-width: 1024px) 100vw, 25vw"
              className="object-cover object-top opacity-90 group-hover:scale-104 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            {/* Top Bar: AD Badge & Controls */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="bg-black/70 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded border border-white/20 uppercase font-mono">
                AD
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMutedBottom(!isMutedBottom);
                  }}
                  className="w-6 h-6 rounded-md bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-colors"
                  aria-label="Toggle sound"
                >
                  {isMutedBottom ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenVideoModal({
                      title: "Shenzhen High-Tech Factory Lab Inspection",
                      subtitle: "Direct Bench Quality Control • Circuitry & Load Verification",
                      productLink: "/products/creality-ender-3-v3-se-3d-printer",
                      productPrice: 219.0,
                      hub: "Shenzhen SZX Hub",
                      tag: "LAB BENCHMARK",
                    });
                  }}
                  className="w-6 h-6 rounded-md bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-colors"
                  aria-label="Expand video"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Overlay Label */}
            <div className="relative z-10 flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[11px] font-black drop-shadow-md font-heading">
                  Shenzhen Inspection Host
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-xs flex items-center justify-center group-hover:bg-[#FF1028] transition-colors">
                <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
