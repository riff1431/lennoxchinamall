"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function UnauthorizedPage() {
  const { isSpanish } = useTranslation();

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          {isSpanish ? "401 — Autenticación Requerida" : "401 — Authentication Required"}
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          {isSpanish ? "Se Requiere Iniciar Sesión" : "Session Authentication Needed"}
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          {isSpanish
            ? "La página solicitada requiere una sesión activa autenticada. Por favor inicia sesión con tus credenciales verificadas para continuar."
            : "The requested page requires an active authenticated session. Please log in with your verified credentials to proceed."}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/auth/login"
          className="w-full sm:w-auto bg-[#FF1028] hover:bg-[#E00B20] text-white px-6 py-3 rounded-xl text-xs font-black font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>{isSpanish ? "Iniciar Sesión" : "Customer Sign In"}</span>
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          {isSpanish ? "Volver al Inicio" : "Return to Home"}
        </Link>
      </div>
    </div>
  );
}
