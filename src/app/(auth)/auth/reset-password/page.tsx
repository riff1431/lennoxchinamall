"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ResetPasswordPage() {
  const { isSpanish } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await resetPassword(formData);
      if (result && !result.success) {
        setError(
          result.error || (isSpanish ? "El restablecimiento de contraseña ha fallado." : "Password reset failed.")
        );
        setIsLoading(false);
      }
    } catch {
      // redirect() throws NEXT_REDIRECT — expected on success
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] space-y-6">
      {/* Header */}
      <div className="space-y-1 text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
          {isSpanish ? "Crear Nueva Contraseña" : "Create new password"}
        </h1>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">
          {isSpanish
            ? "Elige una contraseña segura que no hayas utilizado antes."
            : "Choose a secure password that you haven't used before."}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-medium flex items-start gap-2.5 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF1028] mt-0.5" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-700 block">
            {isSpanish ? "Nueva Contraseña" : "New Password"}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isLoading}
              placeholder={isSpanish ? "Mínimo 8 caracteres" : "Minimum 8 characters"}
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
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-700 block">
            {isSpanish ? "Confirmar Nueva Contraseña" : "Confirm New Password"}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirm_password"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isLoading}
              placeholder={isSpanish ? "Vuelve a ingresar la contraseña" : "Re-enter new password"}
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs transition-all duration-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-red-600/15 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isSpanish ? "Restableciendo..." : "Resetting password..."}</span>
            </>
          ) : (
            <>
              <span>{isSpanish ? "Guardar y Continuar" : "Save & Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Return to Sign In */}
      <div className="pt-2 border-t border-slate-100 text-center text-xs">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isSpanish ? "Volver al inicio de sesión" : "Back to sign in"}</span>
        </Link>
      </div>

      {/* Trust */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          {isSpanish
            ? "Tus contraseñas se almacenan con encriptación bcrypt de alta seguridad."
            : "Passwords are salted and hashed with secure bcrypt encryption."}
        </span>
      </div>
    </div>
  );
}

