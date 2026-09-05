"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
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
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] space-y-6">
      {/* Header */}
      <div className="space-y-1 text-left">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
          {isSpanish ? "Restablecer Contraseña" : "Reset your password"}
        </h1>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">
          {isSpanish
            ? "Ingresa tu correo y te enviaremos las instrucciones para restablecerla de forma segura."
            : "Enter your registered email and we'll send a secure password reset link."}
        </p>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium flex items-start gap-2.5 text-left">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>
            {isSpanish
              ? "¡Enlace enviado! Revisa tu correo y sigue las instrucciones para crear tu nueva contraseña."
              : "Reset email sent! Check your inbox and click the link to choose a new password."}
          </span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-medium flex items-start gap-2.5 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF1028] mt-0.5" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-red-600/15 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isSpanish ? "Enviando enlace..." : "Sending reset link..."}</span>
              </>
            ) : (
              <>
                <span>{isSpanish ? "Enviar Enlace de Restablecimiento" : "Send Reset Link"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

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

      {/* Trust reassurance */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          {isSpanish
            ? "Los enlaces expiran en 1 hora por motivos de seguridad."
            : "Reset links expire in 1 hour for your security."}
        </span>
      </div>
    </div>
  );
}

