"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
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
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          {isSpanish ? "Crear Cuenta de Abastecimiento" : "Create Sourcing Account"}
        </h1>
        <p className="text-xs text-slate-400">
          {isSpanish
            ? "Obtén acceso directo a productos al mayoreo de China, pagos en USDT y rastreo de carga aérea en tiempo real."
            : "Get direct access to wholesale China products, USDT checkout, and real-time air cargo tracking."}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF1028]" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-slate-300 block font-heading uppercase text-[11px] tracking-wider">
            {isSpanish ? "Nombre Completo / Nombre Comercial" : "Full Name / Business Name"}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="display_name"
              required
              autoComplete="name"
              placeholder="Alex Harrison"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#FF1028] focus:ring-1 focus:ring-[#FF1028]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-300 block font-heading uppercase text-[11px] tracking-wider">
            {isSpanish ? "Correo Electrónico" : "Email Address"}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="alex@example.com"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#FF1028] focus:ring-1 focus:ring-[#FF1028]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-300 block font-heading uppercase text-[11px] tracking-wider">
            {isSpanish ? "Crear Contraseña Maestra" : "Create Master Password"}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="new-password"
              placeholder={
                isSpanish
                  ? "Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo"
                  : "Minimum 8 characters with upper, lower, number, symbol"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-[#FF1028] focus:ring-1 focus:ring-[#FF1028]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Real-time Password Strength Meter */}
          {password.length > 0 && <PasswordStrengthMeter password={password} />}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3.5 rounded-xl text-xs font-black font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-red-600/25 active:scale-98 disabled:opacity-50"
        >
          {isLoading ? (
            <span>{isSpanish ? "Generando Cuenta Segura..." : "Generating Secure Sourcing Account..."}</span>
          ) : (
            <>
              <span>{isSpanish ? "Unirse a Lennox ChinaMall Gratis" : "Join Lennox ChinaMall Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-slate-400">
          {isSpanish ? "¿Ya tienes una cuenta? " : "Already have an account? "}
          <Link href="/auth/login" className="text-white hover:text-[#FF1028] font-bold transition-colors">
            {isSpanish ? "Iniciar Sesión" : "Sign In"}
          </Link>
        </div>
      </form>

      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
        <span>
          {isSpanish
            ? "Al registrarte, aceptas los Términos de Abastecimiento Verificado y Depósito en Garantía USDT de Lennox ChinaMall."
            : "By signing up, you agree to Lennox ChinaMall's Verified Sourcing & USDT Escrow Terms."}
        </span>
      </div>
    </div>
  );
}
