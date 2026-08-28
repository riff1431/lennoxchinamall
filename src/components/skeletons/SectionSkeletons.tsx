"use client";

import React from "react";

export function ShimmerBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/80 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent ${className}`}
    />
  );
}

export function HeroSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4.5 animate-pulse">
      {/* Deal of the Day Skeleton (3 cols) */}
      <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 flex flex-col justify-between min-h-[480px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <ShimmerBox className="h-5 w-28 rounded-md" />
            <ShimmerBox className="h-5 w-20 rounded-md" />
          </div>
          <ShimmerBox className="w-full aspect-[4/3] rounded-2xl" />
          <div className="space-y-2">
            <ShimmerBox className="h-4 w-3/4 rounded" />
            <ShimmerBox className="h-4 w-1/2 rounded" />
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <ShimmerBox className="h-7 w-24 rounded" />
          <ShimmerBox className="h-10 w-full rounded-2xl" />
        </div>
      </div>

      {/* Center Promo Banner + 5 Mini Cards Skeleton (6 cols) */}
      <div className="lg:col-span-6 flex flex-col justify-between gap-3.5">
        <ShimmerBox className="w-full aspect-[21/9] sm:aspect-[2.4/1] rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-2 space-y-2">
              <ShimmerBox className="w-full aspect-square rounded-xl" />
              <ShimmerBox className="h-3 w-3/4 rounded" />
              <ShimmerBox className="h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Right 2 Live Videos Skeleton (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-3.5">
        <ShimmerBox className="w-full aspect-[4/3] rounded-3xl" />
        <ShimmerBox className="w-full aspect-[4/3] rounded-3xl" />
      </div>
    </div>
  );
}

export function DepartmentsSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <ShimmerBox className="h-4 w-32 rounded" />
          <ShimmerBox className="h-6 w-48 rounded" />
        </div>
        <ShimmerBox className="h-9 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2.5">
            <ShimmerBox className="w-full aspect-square rounded-xl" />
            <ShimmerBox className="h-3.5 w-3/4 rounded" />
            <ShimmerBox className="h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FlashDealsSkeleton() {
  return (
    <div className="bg-[#00143D] rounded-3xl p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShimmerBox className="h-8 w-36 rounded-xl bg-white/10" />
          <ShimmerBox className="h-8 w-44 rounded-xl bg-white/10" />
        </div>
        <ShimmerBox className="h-8 w-32 rounded-xl bg-white/10" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-3 space-y-2.5">
            <ShimmerBox className="w-full aspect-square rounded-xl" />
            <ShimmerBox className="h-3 w-full rounded" />
            <ShimmerBox className="h-4 w-1/2 rounded" />
            <ShimmerBox className="h-8 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DualShowcaseSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4">
          <ShimmerBox className="h-6 w-36 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ShimmerBox className="h-24 rounded-xl" />
            <ShimmerBox className="h-24 rounded-xl" />
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4">
          <ShimmerBox className="h-6 w-36 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ShimmerBox className="h-24 rounded-xl" />
            <ShimmerBox className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        <ShimmerBox className="w-full aspect-[2.3/1] rounded-3xl" />
        <ShimmerBox className="w-full aspect-[2.3/1] rounded-3xl" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 space-y-2.5">
          <ShimmerBox className="w-full aspect-square rounded-xl" />
          <ShimmerBox className="h-3 w-4/5 rounded" />
          <ShimmerBox className="h-3.5 w-1/2 rounded" />
          <ShimmerBox className="h-8 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
