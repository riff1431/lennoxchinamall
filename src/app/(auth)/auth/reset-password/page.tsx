"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
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
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          {isSpanish ? "Crear Nueva Contraseña" : "Create New Password"}
        </h1>
        <p className="text-xs text-slate-400">
          {isSpanish
            ? "Elige una contraseña segura que no hayas utilizado antes."
            : "Choose a strong password that you haven't used before."}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF1028]" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-300 block">
            {isSpanish ? "Nueva Contraseña" : "New Password"}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder={isSpanish ? "Mínimo 8 caracteres" : "Minimum 8 characters"}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-300 block">
            {isSpanish ? "Confirmar Nueva Contraseña" : "Confirm New Password"}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirm_password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder={isSpanish ? "Vuelve a ingresar tu nueva contraseña" : "Re-enter your new password"}
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
            <span>{isSpanish ? "Restableciendo Contraseña..." : "Resetting Password..."}</span>
          ) : (
            <>
              <span>{isSpanish ? "Restablecer Contraseña e Iniciar Sesión" : "Reset Password & Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
        <span>
          {isSpanish
            ? "Tu contraseña está encriptada con hash bcrypt y nunca se almacena en texto plano."
            : "Your password is encrypted with bcrypt hashing and never stored in plaintext."}
        </span>
      </div>
    </div>
  );
}
