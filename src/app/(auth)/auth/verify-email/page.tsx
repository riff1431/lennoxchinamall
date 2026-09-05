"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, RefreshCw, ShieldCheck, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function VerifyEmailPage() {
  const { isSpanish } = useTranslation();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setResent(false);

    const supabase = createClient();
    await supabase.auth.resend({
      type: "signup",
      email: "",
    });

    setResending(false);
    setResent(true);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] space-y-6 text-center">
      {/* Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
        <Mail className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
          {isSpanish ? "Revisa tu bandeja de entrada" : "Check your email"}
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          {isSpanish
            ? "Te enviamos un enlace de confirmación. Haz clic para activar tu cuenta de Lennox ChinaMall."
            : "We've sent a verification link to your email address. Click the link to activate your account."}
        </p>
      </div>

      {/* Step Guide */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 text-left">
        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            {isSpanish
              ? "Abre tu bandeja y busca el mensaje de Lennox ChinaMall"
              : "Open your email inbox and look for Lennox ChinaMall"}
          </span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            {isSpanish
              ? "Haz clic en el enlace para confirmar tu cuenta"
              : "Click the confirmation button in the email"}
          </span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            {isSpanish
              ? "Tu sesión se iniciará de forma automática"
              : "You'll be automatically verified and signed in"}
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <p className="text-xs text-slate-500">
          {isSpanish
            ? "¿No recibiste el correo? Revisa spam o solicita otro:"
            : "Didn't receive the email? Check spam or resend:"}
        </p>

        <button
          onClick={handleResend}
          disabled={resending || resent}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#FF1028] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
          <span>
            {resent
              ? (isSpanish ? "¡Correo Reenviado!" : "Email resent!")
              : resending
              ? (isSpanish ? "Reenviando..." : "Resending...")
              : (isSpanish ? "Reenviar correo de verificación" : "Resend verification email")}
          </span>
        </button>
      </div>

      {/* Return to Sign In */}
      <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
        {isSpanish ? "¿Ya confirmaste tu correo? " : "Already verified? "}
        <Link href="/auth/login" className="text-[#FF1028] hover:text-[#E00B20] font-semibold transition-colors">
          {isSpanish ? "Iniciar Sesión" : "Sign In"}
        </Link>
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          {isSpanish
            ? "Verificación protegida contra accesos no autorizados."
            : "Verification protects your account against unauthorized access."}
        </span>
      </div>
    </div>
  );
}

