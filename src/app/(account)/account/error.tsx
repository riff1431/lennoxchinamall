"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Account Portal Error:", error);
  }, [error]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-4 shadow-md">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-black font-heading text-slate-900">
            Account Section Temporarily Unavailable
          </h3>
          <p className="text-xs text-slate-500">
            We couldn't synchronize your account records. Please retry.
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-xl bg-[#00143D] hover:bg-[#FF1028] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
}
