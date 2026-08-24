"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldAlert, AlertCircle } from "lucide-react";
import { login } from "@/app/actions/auth";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", "/admin/dashboard");

    try {
      const result = await login(formData);
      if (result && !result.success) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch {
      // redirect() throws NEXT_REDIRECT — this is expected on success
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-heading">
            RESTRICTED ACCESS
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          Admin Control Panel
        </h1>
        <p className="text-xs text-slate-400">
          Access restricted to authorized Lennox ChinaMall personnel only.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-300 block">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="admin@lennoxchinamall.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-300 block">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl text-xs font-black font-heading flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
        >
          {isLoading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Access Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          Unauthorized access attempts are logged and monitored. Contact Super Admin for credentials.
        </span>
      </div>

      <div className="text-center text-[11px] text-slate-500">
        <Link href="/auth/login" className="hover:text-slate-300 transition-colors">
          ← Return to Customer Login
        </Link>
      </div>
    </div>
  );
}
