import React from "react";
import Link from "next/link";
import { Link2Off, RefreshCcw, LogIn, ArrowRight } from "lucide-react";

export default function ExpiredLinkPage() {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
        <Link2Off className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Token Invalid or Expired
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          Security Link Expired
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          This email verification or password reset link has already been used or has expired for security reasons. One-time links expire after 60 minutes.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/auth/forgot-password"
          className="w-full sm:w-auto bg-[#FF1028] hover:bg-[#E00B20] text-white px-6 py-3 rounded-xl text-xs font-black font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Request New Reset Link</span>
        </Link>
        <Link
          href="/auth/login"
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <LogIn className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
