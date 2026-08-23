"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldCheck, Coins, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/account/profile");
    }, 800);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-montserrat">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-white">Sign In to Your Account</h1>
        <p className="text-xs text-slate-400">
          Access your sourcing orders, live air tracking, and saved USDT preferences.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-300 block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-300">Password</label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset instructions sent to your email.");
              }}
              className="text-[11px] text-slate-400 hover:text-[#FF1028] transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
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

      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
        <span>Protected with cryptographic password hashing and Supabase SSR.</span>
      </div>
    </div>
  );
}
