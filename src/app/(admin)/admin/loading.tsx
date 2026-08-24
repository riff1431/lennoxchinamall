import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 rounded-lg w-64" />
          <div className="h-3.5 bg-slate-200 rounded-md w-96" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-slate-200 rounded-xl w-28" />
          <div className="h-10 bg-slate-200 rounded-xl w-32" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 rounded w-24" />
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
            </div>
            <div className="h-7 bg-slate-200 rounded w-32" />
            <div className="h-2.5 bg-slate-100 rounded w-40" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
        <div className="flex justify-between">
          <div className="h-9 bg-slate-100 rounded-xl w-72" />
          <div className="h-9 bg-slate-100 rounded-xl w-48" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
