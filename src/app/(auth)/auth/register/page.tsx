"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ArrowRight, ShieldCheck, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/account/profile");
    }, 1000);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-montserrat">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-white">Create Sourcing Account</h1>
        <p className="text-xs text-slate-400">
          Get direct access to wholesale China products, USDT checkout, and real-time air cargo tracking.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-300 block">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Alex Harrison"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-300 block">Email Address</label>
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
          <label className="font-bold text-slate-300 block">Create Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="Minimum 8 characters"
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
            <span>Creating Account...</span>
          ) : (
            <>
              <span>Join Lennox ChinaMall Free</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-white hover:text-[#FF1028] font-bold">
            Sign In
          </Link>
        </div>
      </form>

      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
        <span>By signing up, you agree to Lennox ChinaMall&apos;s Sourcing & Delivery Terms.</span>
      </div>
    </div>
  );
}
