import React from "react";
import Link from "next/link";
import { AlertOctagon, Mail, ShieldAlert, Home } from "lucide-react";

export default function AccountSuspendedPage() {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-[#FF1028] flex items-center justify-center mx-auto shadow-inner">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold text-[#FF1028] uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          Account Status: Suspended
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          Account Temporarily Suspended
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          Your Lennox ChinaMall account has been restricted by trust & safety moderation. Active orders and Binance Pay escrow remain secure while under review.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-left text-xs text-slate-300">
        <div className="flex items-center gap-2 font-bold text-white font-heading">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Need to appeal or query active orders?</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Contact our 24/7 Global Support Desk quoting your registered email address for immediate assistance.
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2 font-mono text-[11px] text-blue-400">
          <Mail className="w-3.5 h-3.5" />
          <span>support@lennoxchinamall.com</span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="mailto:support@lennoxchinamall.com?subject=Account%20Suspension%20Appeal"
          className="w-full sm:w-auto bg-[#FF1028] hover:bg-[#E00B20] text-white px-6 py-3 rounded-xl text-xs font-black font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Mail className="w-4 h-4" />
          <span>Contact Trust & Safety</span>
        </a>
        <Link
          href="/"
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-xs font-bold transition-colors"
        >
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}
