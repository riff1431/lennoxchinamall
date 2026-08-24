"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import { signup } from "@/app/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password strength
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const strengthScore = [hasMinLength, hasNumber, hasUppercase].filter(Boolean).length;

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!hasMinLength) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await signup(formData);
      if (result && !result.success) {
        setError(result.error);
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
          Create Sourcing Account
        </h1>
        <p className="text-xs text-slate-400">
          Get direct access to wholesale China products, USDT checkout, and real-time air cargo tracking.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-300 block">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="display_name"
              required
              autoComplete="name"
              placeholder="Alex Harrison"
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
              name="email"
              required
              autoComplete="email"
              placeholder="alex@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-300 block">Create Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      strengthScore >= level
                        ? strengthScore === 1
                          ? "bg-red-500"
                          : strengthScore === 2
                          ? "bg-amber-500"
                          : "bg-[#10B981]"
                        : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
                <span className={hasMinLength ? "text-[#10B981]" : "text-slate-500"}>
                  ✓ 8+ characters
                </span>
                <span className={hasNumber ? "text-[#10B981]" : "text-slate-500"}>
                  ✓ Contains number
                </span>
                <span className={hasUppercase ? "text-[#10B981]" : "text-slate-500"}>
                  ✓ Uppercase letter
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl text-xs font-black font-heading flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
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
        <span>By signing up, you agree to Lennox ChinaMall&apos;s Sourcing &amp; Delivery Terms.</span>
      </div>
    </div>
  );
}
