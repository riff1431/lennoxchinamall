"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Portal Error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-red-100 p-8 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-black font-heading text-slate-900">
            Admin Module Failed to Load
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {error.message || "An unexpected error occurred while processing admin telemetry. Please reload the data stream."}
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-[#00143D] hover:bg-[#FF1028] text-white font-black font-heading text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Module</span>
        </button>
      </div>
    </div>
  );
}
