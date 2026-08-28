"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
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
  const bestSellerItems = DEFAULT_BEST_SELLERS;
  const topRatedItems = DEFAULT_TOP_RATED;

  return (
    <section className="space-y-4 sm:space-y-5">
      {/* ── 1. Top Section: Best Sellers & Top Rated Dual Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* ── Best Sellers Card ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
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
                  className="group bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-3 transition-all"
                >
                  {/* Thumbnail with Discount Badge */}
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200/60 flex items-center justify-center">
                    {item.discountBadge && (
                      <span className="absolute top-1 left-1 z-10 bg-[#00143D] text-white text-[8px] font-black px-1 py-0.2 rounded font-mono shadow-2xs">
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
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl">🎖️</span>
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
                  className="group bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-3 transition-all"
                >
                  {/* Thumbnail with Discount Badge */}
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200/60 flex items-center justify-center">
                    {item.discountBadge && (
                      <span className="absolute top-1 left-1 z-10 bg-[#00143D] text-white text-[8px] font-black px-1 py-0.2 rounded font-mono shadow-2xs">
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

      {/* ── 2. Bottom Section: 2 Promotional Banners with Exact Website Images ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Banner 1: Shop Everything in One Place */}
        <Link
          href="/categories/consumer-electronics"
          className="group relative w-full aspect-[21/9] sm:aspect-[2.3/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all block border border-slate-200/80 bg-slate-900"
        >
          <Image
            src="https://lennoxonemall.com/storage/banner/2026-04-26-69ed9f39f1267.webp"
            alt="Lennox OneMall - Shop Everything in One Place"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center group-hover:scale-103 transition-transform duration-700"
            priority
          />
        </Link>

        {/* Banner 2: The Ultimate Multi-Vendor Destination */}
        <Link
          href="/categories/all"
          className="group relative w-full aspect-[21/9] sm:aspect-[2.3/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all block border border-slate-200/80 bg-slate-900"
        >
          <Image
            src="https://lennoxonemall.com/storage/banner/2026-04-26-69ed9de01320e.webp"
            alt="Lennox OneMall - The Ultimate Multi-Vendor Destination"
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
