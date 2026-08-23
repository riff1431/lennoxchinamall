import React from "react";

export default function ProductDetailLoading() {
  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="h-4 bg-slate-200 rounded w-64" />

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery Skeleton (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Details & Purchase Box (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-12 bg-slate-200 rounded-xl" />
        </div>

        {/* Dual Video & Trust Column (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="h-64 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
