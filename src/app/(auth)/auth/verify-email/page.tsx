"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
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
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8 text-[#10B981]" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          {isSpanish ? "Revisa Tu Bandeja de Entrada" : "Check Your Inbox"}
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          {isSpanish
            ? "Hemos enviado un enlace de verificación a tu dirección de correo electrónico. Haz clic en el enlace para activar tu cuenta y comenzar a abastecerte."
            : "We've sent a verification link to your email address. Click the link to activate your Lennox ChinaMall account and start sourcing."}
        </p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-left">
        <div className="flex items-start gap-2.5 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
          <span>
            {isSpanish
              ? "Abre tu bandeja de entrada y encuentra el mensaje de Lennox ChinaMall"
              : "Open your email inbox and find the message from Lennox ChinaMall"}
          </span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
          <span>
            {isSpanish
              ? "Haz clic en el botón \"Confirmar tu correo\" en el mensaje"
              : "Click the \"Confirm your email\" button in the email"}
          </span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
          <span>
            {isSpanish
              ? "Iniciarás sesión automáticamente y serás redirigido a tu cuenta"
              : "You'll be automatically signed in and redirected to your account"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] text-slate-500">
          {isSpanish
            ? "¿No recibiste el correo? Revisa tu carpeta de spam o solicita uno nuevo."
            : "Didn't receive the email? Check your spam folder or request a new one."}
        </p>

        <button
          onClick={handleResend}
          disabled={resending || resent}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-[#FF1028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
          <span>
            {resent
              ? (isSpanish ? "¡Correo Reenviado!" : "Email Resent!")
              : resending
              ? (isSpanish ? "Reenviando..." : "Resending...")
              : (isSpanish ? "Reenviar Correo de Verificación" : "Resend Verification Email")}
          </span>
        </button>
      </div>

      <div className="pt-2 text-center text-xs text-slate-400">
        {isSpanish ? "¿Ya estás verificado? " : "Already verified? "}
        <Link href="/auth/login" className="text-white hover:text-[#FF1028] font-bold">
          {isSpanish ? "Iniciar Sesión" : "Sign In"}
        </Link>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
        <span>
          {isSpanish
            ? "La verificación por correo protege tu cuenta contra accesos no autorizados."
            : "Email verification protects your account from unauthorized access."}
        </span>
      </div>
    </div>
  );
}
