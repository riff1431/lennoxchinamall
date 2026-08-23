import React from "react";

export default function StorefrontLoading() {
  return (
    <div className="space-y-12 pb-16 animate-pulse max-w-7xl mx-auto px-4">
      {/* Hero Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="hidden lg:block lg:col-span-3 h-[460px] bg-slate-200 rounded-2xl" />
        <div className="lg:col-span-6 h-[460px] bg-slate-200 rounded-3xl" />
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-[460px]">
          <div className="flex-1 bg-slate-200 rounded-2xl" />
          <div className="flex-1 bg-slate-200 rounded-2xl" />
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100">
        <div className="h-5 bg-slate-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-200" />
              <div className="h-3.5 bg-slate-200 rounded w-20" />
              <div className="h-2.5 bg-slate-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-slate-200 rounded w-56" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-3 border border-slate-100 space-y-3">
              <div className="aspect-square bg-slate-200 rounded-xl" />
              <div className="h-3.5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
