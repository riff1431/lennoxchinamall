"use client";

import React from "react";
import Link from "next/link";
import { Zap, ArrowRight, Flame } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { FlashDealCountdown } from "@/components/common/FlashDealCountdown";
import { Product } from "@/types/database";

interface FlashDealsSectionProps {
  flashDeals: Product[];
}

export function FlashDealsSection({ flashDeals }: FlashDealsSectionProps) {
  const deals = flashDeals.slice(0, 5);

  return (
    <section className="relative rounded-3xl overflow-hidden shadow-xl">
      {/* ── Dark Navy Gradient Background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00143D] via-[#000B24] to-[#00143D]" />

      {/* ── Dot Grid Pattern Overlay ── */}
      <div className="absolute inset-0 flash-deals-grid-bg pointer-events-none" />

      {/* ── Floating Decorative Shapes (hidden on mobile for performance) ── */}
      <div className="hidden md:block pointer-events-none" aria-hidden="true">
        {/* Top-right circle */}
        <div className="absolute top-8 right-12 w-32 h-32 rounded-full border border-amber-400/8 animate-float-shape" />
        {/* Bottom-left hexagon shape */}
        <div className="absolute bottom-16 left-8 w-24 h-24 rotate-45 rounded-xl border border-[#FF1028]/8 animate-float-shape-slow" />
        {/* Mid-right small circle */}
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full border border-white/5 animate-float-shape-mid" />
        {/* Top-left accent */}
        <div className="absolute top-20 left-1/3 w-10 h-10 rotate-12 rounded-lg border border-amber-400/6 animate-float-shape-slow" />
      </div>

      {/* ── Content Layer ── */}
      <div className="relative z-10">
        {/* ── Header Bar ── */}
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
            {/* Glowing icon + title */}
            <div className="flex items-center gap-2">
              <div className="animate-flash-glow">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-400 text-amber-400" />
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white font-heading">
                FLASH DEALS
              </h2>
            </div>

            {/* Separator + Countdown */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="hidden sm:inline-block w-px h-6 bg-white/20" />
              <FlashDealCountdown variant="premium" label="Ends In" />
            </div>
          </div>

          {/* View All CTA */}
          <Link
            href="/categories/flash-deals"
            className="flash-cta-glow text-xs font-black text-white flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-colors border border-white/15 backdrop-blur-xs"
          >
            <span>View All Flash Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── 5-Column Product Grid with Compact Card Design ── */}
        <div className="px-4 sm:px-6 pb-5 sm:pb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3.5">
          {deals.map((product, idx) => (
            <div
              key={product.id}
              className="flash-glass-card rounded-xl sm:rounded-2xl overflow-hidden animate-flash-card-enter flex flex-col justify-between"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Product Card Component */}
              <div className="bg-white rounded-t-xl sm:rounded-t-2xl flex-1 flex flex-col">
                <ProductCard product={product} priority={idx < 2} />
              </div>

              {/* ── Compact Claim Progress Bar ── */}
              <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 space-y-1 bg-black/20 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold">
                  <span className="text-amber-400 flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span
                      className="tabular-nums"
                      style={{ textShadow: "0 0 8px rgba(245, 158, 11, 0.4)" }}
                    >
                      {75 + idx * 5}% Claimed
                    </span>
                  </span>
                  <span
                    className={`tabular-nums ${
                      12 - idx * 2 <= 5
                        ? "text-[#FF1028] animate-urgency-pulse font-black"
                        : "text-slate-400"
                    }`}
                  >
                    {Math.max(4, 12 - idx * 2)} left
                  </span>
                </div>

                {/* Animated shimmer progress bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="flash-progress-bar h-full rounded-full"
                    style={{ width: `${75 + idx * 5}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
