"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, KeyRound } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ForbiddenPage() {
  const { isSpanish } = useTranslation();

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-[#FF1028] flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold text-[#FF1028] uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          {isSpanish ? "403 — Acceso Prohibido" : "403 — Access Forbidden"}
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          {isSpanish ? "Permisos de Rol Insuficientes" : "Insufficient Role Permissions"}
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          {isSpanish
            ? "El rol de tu cuenta no tiene permisos para ver o ejecutar acciones en este recurso. Si crees que esto es un error, contacta a un Administrador Principal."
            : "Your account role does not have permission to view or execute actions on this resource. If you believe this is an error, contact a Super Administrator."}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto bg-[#00143D] hover:bg-[#002366] text-white px-6 py-3 rounded-xl text-xs font-black font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>{isSpanish ? "Volver a la Tienda" : "Return Storefront"}</span>
        </Link>
        <Link
          href="/admin/dashboard"
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>{isSpanish ? "Panel de Admin" : "Admin Dashboard"}</span>
        </Link>
      </div>
    </div>
  );
}
