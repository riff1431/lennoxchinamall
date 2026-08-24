import React from "react";

export default function AccountLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-20" />
            <div className="h-6 bg-slate-200 rounded w-28" />
          </div>
        ))}
      </div>
      <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-40" />
        <div className="h-24 bg-slate-50 rounded-2xl" />
      </div>
    </div>
  );
}
