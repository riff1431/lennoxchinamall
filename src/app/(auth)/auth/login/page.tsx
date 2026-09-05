"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/app/actions/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";

function LoginForm() {
  const { isSpanish } = useTranslation();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account/profile";
  const successMessage = searchParams.get("message");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const registerHref = `/auth/register${redirectTo !== "/account/profile" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] space-y-6">
      {/* Segmented Auth Navigation Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl text-xs font-semibold text-slate-500">
        <span className="py-2 text-center rounded-lg bg-white text-slate-900 shadow-xs">
          {isSpanish ? "Iniciar Sesión" : "Sign In"}
        </span>
        <Link
          href={registerHref}
          className="py-2 text-center rounded-lg hover:text-slate-900 transition-colors"
        >
          {isSpanish ? "Crear Cuenta" : "Create Account"}
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1 text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
          {isSpanish ? "Bienvenido de nuevo" : "Welcome back"}
        </h1>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">
          {isSpanish
            ? "Accede a tus pedidos, cotizaciones y rastreo aéreo en vivo."
            : "Sign in to track orders, manage shipments, and source products."}
        </p>
      </div>

      {/* Success Notification */}
      {successMessage === "password_reset_success" && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            {isSpanish
              ? "¡Contraseña restablecida! Inicia sesión con tus nuevas credenciales."
              : "Password reset successful! Sign in with your new credentials."}
          </span>
        </div>
      )}

      {/* Error / Lockout Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF1028] mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="leading-snug">{error}</p>
            {attemptsLeft !== null && attemptsLeft > 0 && attemptsLeft < 5 && (
              <p className="text-[11px] text-amber-700 font-semibold">
                {isSpanish
                  ? `Quedan ${attemptsLeft} intento(s) antes del bloqueo de seguridad.`
                  : `${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining before security lockout.`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-700 block">
            {isSpanish ? "Correo Electrónico" : "Email Address"}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              disabled={isLocked || isLoading}
              placeholder="alex@example.com"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs transition-all duration-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50 disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 block">
              {isSpanish ? "Contraseña" : "Password"}
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-slate-500 hover:text-[#FF1028] font-medium transition-colors"
            >
              {isSpanish ? "¿Olvidaste tu contraseña?" : "Forgot password?"}
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="current-password"
              disabled={isLocked || isLoading}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs transition-all duration-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50 disabled:bg-slate-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            defaultChecked
            className="w-4 h-4 rounded border-slate-300 text-[#FF1028] focus:ring-[#FF1028]/20 focus:ring-offset-0 cursor-pointer accent-[#FF1028]"
          />
          <label htmlFor="rememberMe" className="text-xs text-slate-600 select-none cursor-pointer">
            {isSpanish ? "Recordar mi sesión en este dispositivo" : "Keep me signed in on this device"}
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isLocked}
          className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-red-600/15 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isSpanish ? "Iniciando sesión..." : "Signing in..."}</span>
            </>
          ) : (
            <>
              <span>{isSpanish ? "Iniciar Sesión" : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="pt-1 text-center text-xs text-slate-500">
        {isSpanish ? "¿Aún no tienes una cuenta? " : "Don't have an account? "}
        <Link href={registerHref} className="text-[#FF1028] hover:text-[#E00B20] font-semibold transition-colors">
          {isSpanish ? "Regístrate gratis" : "Create one free"}
        </Link>
      </div>

      {/* Minimal Reassuring Trust Badges */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {isSpanish ? "Encriptación 256-bit" : "256-Bit Encrypted"}
        </span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {isSpanish ? "Compras Seguras" : "Buyer Protection"}
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 h-96 animate-pulse shadow-sm" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}

