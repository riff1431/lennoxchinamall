"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { login } from "@/app/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account/profile";
  const successMessage = searchParams.get("message");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", redirectTo);

    try {
      const result = await login(formData);
      if (result && !result.success) {
        setError(result.error);
        if (result.locked) {
          setIsLocked(true);
        }
        if (typeof result.attemptsLeft === "number") {
          setAttemptsLeft(result.attemptsLeft);
        }
        setIsLoading(false);
      }
    } catch {
      // redirect() throws NEXT_REDIRECT — expected on success
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-slate-400">
          Access your sourcing orders, live air tracking, and saved USDT preferences.
        </p>
      </div>

      {successMessage === "password_reset_success" && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Password reset successful! Sign in with your new credentials.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF1028]" />
          <div className="flex-1">
            <span>{error}</span>
            {attemptsLeft !== null && attemptsLeft > 0 && attemptsLeft < 5 && (
              <span className="block text-[10px] text-amber-400 mt-0.5">
                {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} remaining before temporary lockout.
              </span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-slate-300 block font-heading uppercase text-[11px] tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              disabled={isLocked || isLoading}
              placeholder="alex@example.com"
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
              className="text-[11px] text-slate-400 hover:text-[#FF1028] transition-colors"
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

        <button
          type="submit"
          disabled={isLoading || isLocked}
          className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3.5 rounded-xl text-xs font-black font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-red-600/25 active:scale-98 disabled:opacity-50"
        >
          {isLoading ? (
            <span>Signing In...</span>
          ) : (
            <>
              <span>Sign In with USDT Escrow</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-white hover:text-[#FF1028] font-bold">
            Create Free Account
          </Link>
        </div>
      </form>

      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
        <span>Protected with cryptographic password hashing, brute-force defense, and Supabase SSR.</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-slate-900/90 rounded-3xl p-8 h-96 animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}
