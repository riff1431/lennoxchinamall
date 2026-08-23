import React from "react";

export default function SearchLoading() {
  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-48" />
      <div className="h-28 bg-slate-200 rounded-3xl" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="hidden lg:block lg:col-span-3 h-96 bg-slate-200 rounded-3xl" />
        <div className="lg:col-span-9 space-y-6">
          <div className="h-12 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
    </div>
  );
}
