"use client";

import React from "react";
import Link from "next/link";
import { AlertOctagon, Mail, ShieldAlert, Home } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function AccountSuspendedPage() {
  const { isSpanish } = useTranslation();

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] space-y-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-[#FF1028]">
        <AlertOctagon className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-100 inline-block">
          {isSpanish ? "Cuenta Suspendida" : "Account Suspended"}
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
          {isSpanish ? "Cuenta Temporalmente Suspendida" : "Account Temporarily Suspended"}
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          {isSpanish
            ? "Tu cuenta ha sido restringida por motivos de verificación de seguridad. Tus órdenes y fondos permanecen resguardados."
            : "Your account has been temporarily restricted for security verification. Existing orders and funds remain protected."}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-left text-xs text-slate-700">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{isSpanish ? "¿Deseas solicitar una revisión?" : "Need to appeal this decision?"}</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {isSpanish
            ? "Escríbenos a nuestro equipo de soporte con tu correo registrado para recibir asistencia prioritaria."
            : "Contact our dedicated support desk with your registered email for rapid review."}
        </p>
        <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 font-mono text-[11px] text-slate-700">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>support@lennoxchinamall.com</span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="mailto:support@lennoxchinamall.com?subject=Account%20Suspension%20Appeal"
          className="w-full sm:w-auto bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Mail className="w-4 h-4" />
          <span>{isSpanish ? "Contactar a Soporte" : "Contact Support"}</span>
        </a>
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

