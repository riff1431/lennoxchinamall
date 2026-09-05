"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Home, KeyRound } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ForbiddenPage() {
  const { isSpanish } = useTranslation();

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] space-y-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-[#FF1028]">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-100 inline-block">
          {isSpanish ? "403 — Acceso Prohibido" : "403 — Access Forbidden"}
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
          {isSpanish ? "Permisos Insuficientes" : "Insufficient Permissions"}
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          {isSpanish
            ? "Tu cuenta no dispone de los permisos requeridos para acceder a esta sección."
            : "Your account does not have permission to view or manage this resource."}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>{isSpanish ? "Volver a la Tienda" : "Return to Store"}</span>
        </Link>
        <Link
          href="/admin/login"
          className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <KeyRound className="w-4 h-4 text-slate-600" />
          <span>{isSpanish ? "Portal Administrativo" : "Admin Portal"}</span>
        </Link>
      </div>
    </div>
  );
}

