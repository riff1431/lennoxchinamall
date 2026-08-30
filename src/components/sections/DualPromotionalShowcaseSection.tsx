"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Award } from "lucide-react";
import { Product } from "@/types/database";
import { formatCurrency } from "@/utils/helpers";

interface DualPromotionalShowcaseSectionProps {
  bestSellers?: Product[];
  topRated?: Product[];
}

const DEFAULT_BEST_SELLERS = [
  {
    id: "promo-bs-1",
    title: "Elegant Floral Embroidered Handbag",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    discountBadge: "-$10.00",
    comparePrice: 100.0,
    price: 90.0,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "promo-bs-2",
    title: "iPhone 17 Pro Max 256GB Titanium",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    discountBadge: "-$10.00",
    comparePrice: 950.0,
    price: 940.0,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80",
  },
];

const DEFAULT_TOP_RATED = [
  {
    id: "promo-tr-1",
    title: "Elegant Floral Embroidered Handbag",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    discountBadge: "-$10.00",
    comparePrice: 100.0,
    price: 90.0,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "promo-tr-2",
    title: "iPhone 17 Pro Max 256GB Titanium",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    discountBadge: "-$10.00",
    comparePrice: 950.0,
    price: 940.0,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80",
  },
];

export function DualPromotionalShowcaseSection({
  bestSellers,
  topRated,
}: DualPromotionalShowcaseSectionProps) {
  const bestSellerItems =
    bestSellers && bestSellers.length > 0
      ? bestSellers.slice(0, 2).map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          discountBadge:
            p.compare_at_price && p.compare_at_price > p.base_price
              ? `-$${(p.compare_at_price - p.base_price).toFixed(2)}`
              : undefined,
          comparePrice: p.compare_at_price || p.base_price,
          price: p.base_price,
          image:
            p.media?.[0]?.url ||
            p.variants?.[0]?.image_url ||
            "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500&auto=format&fit=crop&q=80",
        }))
      : DEFAULT_BEST_SELLERS;

  const topRatedItems =
    topRated && topRated.length > 0
      ? topRated.slice(0, 2).map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          discountBadge:
            p.compare_at_price && p.compare_at_price > p.base_price
              ? `-$${(p.compare_at_price - p.base_price).toFixed(2)}`
              : undefined,
          comparePrice: p.compare_at_price || p.base_price,
          price: p.base_price,
          image:
            p.media?.[0]?.url ||
            p.variants?.[0]?.image_url ||
            "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80",
        }))
      : DEFAULT_TOP_RATED;

  return (
    <section className="space-y-4 sm:space-y-5">
      {/* ── 1. Top Section: Best Sellers & Top Rated Dual Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* ── Best Sellers Card ── */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-[#FF1028]/40 hover:shadow-[0_0_20px_rgba(255,16,40,0.18)] transition-all duration-300 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl">🏆</span>
                <h3 className="font-heading font-black text-base sm:text-lg text-[#00143D]">
                  Best sellings
                </h3>
              </div>
              <Link
                href="/categories/best-sellers"
                className="text-xs font-bold text-slate-600 hover:text-[#FF1028] flex items-center gap-0.5 transition-colors group"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* 2 Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bestSellerItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#FF1028]/50 hover:shadow-[0_0_14px_rgba(255,16,40,0.15)] rounded-lg p-2.5 flex items-center gap-3 transition-all duration-300"
                >
                  {/* Thumbnail with Discount Badge */}
                  <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-white border border-slate-200/60 flex items-center justify-center">
                    {item.discountBadge && (
                      <span className="absolute top-1 left-1 z-10 bg-[#00143D] text-white text-[8px] font-black px-1 py-0.2 rounded-xs font-mono shadow-2xs">
                        {item.discountBadge}
                      </span>
                    )}
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5 group-hover:scale-108 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#FF1028] transition-colors truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 line-through font-mono">
                        ${item.comparePrice.toFixed(2)}
                      </span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Top Rated Card ── */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-black text-base sm:text-lg text-[#00143D]">
                  Top rated
                </h3>
              </div>
              <Link
                href="/categories/top-rated"
                className="text-xs font-bold text-slate-600 hover:text-[#FF1028] flex items-center gap-0.5 transition-colors group"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* 2 Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topRatedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-amber-400/60 hover:shadow-[0_0_14px_rgba(245,158,11,0.2)] rounded-lg p-2.5 flex items-center gap-3 transition-all duration-300"
                >
                  {/* Thumbnail with Discount Badge */}
                  <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-white border border-slate-200/60 flex items-center justify-center">
                    {item.discountBadge && (
                      <span className="absolute top-1 left-1 z-10 bg-[#00143D] text-white text-[8px] font-black px-1 py-0.2 rounded-xs font-mono shadow-2xs">
                        {item.discountBadge}
                      </span>
                    )}
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5 group-hover:scale-108 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#FF1028] transition-colors truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 line-through font-mono">
                        ${item.comparePrice.toFixed(2)}
                      </span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Bottom Section: 2 Promotional Banners with Lennox China Mall Brand Images ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Banner 1: Lennox China Mall - Direct Factory Sourcing */}
        <Link
          href="/categories/consumer-electronics"
          className="group relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-sm hover:shadow-[0_0_24px_rgba(255,16,40,0.22)] transition-all duration-300 block border border-slate-200/80 bg-slate-900"
        >
          <Image
            src="/images/banners/lennox_china_mall_promo_1.jpg"
            alt="Lennox China Mall - Direct Factory Sourcing • De las Fábricas a tus Manos"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center group-hover:scale-103 transition-transform duration-700"
            priority
          />
        </Link>

        {/* Banner 2: Lennox China Mall - Verified Direct Hubs */}
        <Link
          href="/categories/all"
          className="group relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-sm hover:shadow-[0_0_24px_rgba(0,20,61,0.25)] transition-all duration-300 block border border-slate-200/80 bg-slate-900"
        >
          <Image
            src="/images/banners/lennox_china_mall_promo_2.jpg"
            alt="Lennox China Mall - Verified Direct Hubs"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center group-hover:scale-103 transition-transform duration-700"
            priority
          />
        </Link>
      </div>
    </section>
  );
}
