"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "@/app/actions/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ForgotPasswordPage() {
  const { isSpanish } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await forgotPassword(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          {isSpanish ? "Restablecer Tu Contraseña" : "Reset Your Password"}
        </h1>
        <p className="text-xs text-slate-400">
          {isSpanish
            ? "Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña."
            : "Enter your email address and we'll send you a secure link to reset your password."}
        </p>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            {isSpanish
              ? "¡Correo de restablecimiento enviado! Revisa tu bandeja de entrada y sigue el enlace para crear una nueva contraseña."
              : "Password reset email sent! Check your inbox and follow the link to create a new password."}
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">
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
              <span>{isSpanish ? "Enviando Enlace..." : "Sending Reset Link..."}</span>
            ) : (
              <>
                <span>{isSpanish ? "Enviar Enlace de Restablecimiento" : "Send Password Reset Link"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-slate-400">
        {isSpanish ? "¿Recuerdas tu contraseña? " : "Remember your password? "}
        <Link href="/auth/login" className="text-white hover:text-[#FF1028] font-bold">
          {isSpanish ? "Iniciar Sesión" : "Sign In"}
        </Link>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
        <span>
          {isSpanish
            ? "Los enlaces de restablecimiento expiran después de 1 hora por tu seguridad."
            : "Reset links expire after 1 hour for your security."}
        </span>
      </div>
    </div>
  );
}
