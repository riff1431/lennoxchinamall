"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, ShieldAlert, KeyRound } from "lucide-react";
import { adminLogin } from "@/app/actions/auth";
import { SITE_NAME } from "@/lib/constants";

export default function DedicatedAdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", "/admin/dashboard");

    try {
      const result = await adminLogin(formData);
      if (result && !result.success) {
        setError(result.error || "Authentication failed");
        if (result.locked) {
          setIsLocked(true);
          setLockoutSeconds(result.lockedUntilSeconds || 900);
        }
        setIsLoading(false);
      }
    } catch {
      // NEXT_REDIRECT caught on successful login
    }
  };

  return (
    <div className="min-h-screen bg-[#00081C] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#FF1028]/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-white group-hover:scale-105 transition-transform">
              <Image
                src="/logo-lennoxchinamall.jpeg"
                alt="Lennox China Mall Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col text-left font-heading">
              <span className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
                LENNOX CHINA <span className="text-[#FF1028]">MALL</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Operations Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#FF1028] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono shadow-xs">
                RESTRICTED ACCESS
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                PORTAL-ID: 2026-ADM
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
              Staff & Operations Login
            </h1>
            <p className="text-xs text-slate-400">
              Authorized operations, product, and finance personnel only.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF1028]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block font-heading uppercase text-[11px] tracking-wider">
                Staff Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  disabled={isLocked || isLoading}
                  placeholder="staff@lennoxchinamall.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#FF1028] focus:ring-1 focus:ring-[#FF1028]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-300 block font-heading uppercase text-[11px] tracking-wider">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[10px] text-slate-400 hover:text-[#FF1028] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  disabled={isLocked || isLoading}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#FF1028] focus:ring-1 focus:ring-[#FF1028]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-0.5">
              <input
                type="checkbox"
                id="rememberStation"
                name="rememberStation"
                defaultChecked
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-[#FF1028] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#FF1028]"
              />
              <label htmlFor="rememberStation" className="text-[11px] text-slate-400 select-none cursor-pointer">
                Remember this authorized operations terminal
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3.5 rounded-xl text-xs font-black font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-red-600/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Authenticating with Escrow...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Verify Staff Credentials</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Every staff login is recorded with IP and hardware fingerprint. 5 failed attempts trigger a 15-minute temporary lockout.
            </span>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <span>Looking for customer store?</span>
            <Link href="/auth/login" className="text-white hover:text-[#FF1028] font-bold transition-colors">
              Customer Login →
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} {SITE_NAME} Security Infrastructure.
        </div>
      </div>
    </div>
  );
}
