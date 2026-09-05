"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { signup } from "@/app/actions/auth";
import { validatePasswordStrength } from "@/lib/auth/password";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function RegisterPage() {
  const { isSpanish } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validation = validatePasswordStrength(password);
    if (!validation.valid) {
      setError(
        validation.error ||
          (isSpanish
            ? "La contraseña no cumple con los requisitos de seguridad."
            : "Password does not meet security requirements.")
      );
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await signup(formData);
      if (result && !result.success) {
        setError(result.error || (isSpanish ? "El registro ha fallado." : "Registration failed."));
        setIsLoading(false);
      }
    } catch {
      // redirect() throws NEXT_REDIRECT — expected on success
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] space-y-6">
      {/* Segmented Auth Navigation Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl text-xs font-semibold text-slate-500">
        <Link
          href="/auth/login"
          className="py-2 text-center rounded-lg hover:text-slate-900 transition-colors"
        >
          {isSpanish ? "Iniciar Sesión" : "Sign In"}
        </Link>
        <span className="py-2 text-center rounded-lg bg-white text-slate-900 shadow-xs">
          {isSpanish ? "Crear Cuenta" : "Create Account"}
        </span>
      </div>

      {/* Header */}
      <div className="space-y-1 text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
          {isSpanish ? "Crea tu cuenta" : "Create your account"}
        </h1>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">
          {isSpanish
            ? "Accede a precios directos de fábrica de China y rastreo de envíos en tiempo real."
            : "Get factory-direct wholesale pricing and real-time shipment tracking."}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF1028] mt-0.5" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name / Company */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-700 block">
            {isSpanish ? "Nombre Completo / Empresa" : "Full Name or Company"}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="display_name"
              required
              autoComplete="name"
              disabled={isLoading}
              placeholder={isSpanish ? "Ej. Juan Pérez o Importadora Lennox" : "e.g. Alex Harrison"}
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs transition-all duration-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Email */}
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
              disabled={isLoading}
              placeholder="alex@example.com"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs transition-all duration-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-700 block">
            {isSpanish ? "Contraseña" : "Password"}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="new-password"
              disabled={isLoading}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs transition-all duration-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50"
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

          {/* Real-time Password Strength Meter */}
          {password.length > 0 && (
            <div className="pt-1 animate-in fade-in duration-200">
              <PasswordStrengthMeter password={password} />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-red-600/15 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isSpanish ? "Creando cuenta..." : "Creating account..."}</span>
            </>
          ) : (
            <>
              <span>{isSpanish ? "Crear Cuenta Gratis" : "Create Free Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Terms Notice */}
      <p className="text-[11px] text-slate-500 text-center leading-relaxed">
        {isSpanish ? "Al registrarte, aceptas nuestros " : "By signing up, you agree to our "}
        <Link href="/pages/terms" className="underline hover:text-slate-800 transition-colors">
          {isSpanish ? "Términos del Servicio" : "Terms of Service"}
        </Link>
        {isSpanish ? " y " : " and "}
        <Link href="/pages/privacy" className="underline hover:text-slate-800 transition-colors">
          {isSpanish ? "Política de Privacidad" : "Privacy Policy"}
        </Link>
        .
      </p>

      {/* Switch to Sign In */}
      <div className="pt-1 border-t border-slate-100 text-center text-xs text-slate-500">
        {isSpanish ? "¿Ya tienes una cuenta? " : "Already have an account? "}
        <Link href="/auth/login" className="text-[#FF1028] hover:text-[#E00B20] font-semibold transition-colors">
          {isSpanish ? "Iniciar Sesión" : "Sign In"}
        </Link>
      </div>

      {/* Trust reassurance */}
      <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {isSpanish ? "Datos Encriptados" : "Encrypted Data"}
        </span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {isSpanish ? "Acceso Directo" : "Direct Sourcing"}
        </span>
      </div>
    </div>
  );
}

