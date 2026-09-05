"use client";

import React from "react";
import Link from "next/link";
import { Lock, UserCheck, Home } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function UnauthorizedPage() {
  const { isSpanish } = useTranslation();

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] space-y-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600">
        <Lock className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-100 inline-block">
          {isSpanish ? "401 — Autenticación Requerida" : "401 — Sign In Required"}
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
          {isSpanish ? "Inicia Sesión Para Continuar" : "Sign In to Access"}
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          {isSpanish
            ? "Para acceder a este contenido, inicia sesión con tu cuenta de Lennox ChinaMall."
            : "The page you requested requires an active account session. Please sign in to proceed."}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/auth/login"
          className="w-full sm:w-auto bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>{isSpanish ? "Iniciar Sesión" : "Sign In"}</span>
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Home className="w-4 h-4 text-slate-600" />
          <span>{isSpanish ? "Volver a la Tienda" : "Return to Store"}</span>
        </Link>
      </div>
    </div>
  );
}

