"use client";

import React from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function AccountSecurityHeader() {
  const { isSpanish } = useTranslation();

  return (
    <div className="space-y-1">
      <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block">
        {isSpanish ? "Centro de Seguridad y Privacidad" : "Security & Privacy Center"}
      </span>
      <h1 className="text-2xl font-black text-[#00143D] font-heading">
        {isSpanish ? "Seguridad y Dispositivos Activos" : "Security & Active Devices"}
      </h1>
      <p className="text-xs text-slate-500">
        {isSpanish
          ? "Protege tus credenciales, monitorea sesiones activas y revisa el historial reciente de accesos."
          : "Protect your account credentials, monitor active sessions, and review recent sign-in history."}
      </p>
    </div>
  );
}

export function TwoFactorAuthCard() {
  const { isSpanish } = useTranslation();

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs font-black text-[#00143D] uppercase font-heading">
          {isSpanish ? "Seguridad de Dos Factores (2FA)" : "Two-Factor Security (2FA)"}
        </h3>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        {isSpanish
          ? "Agrega una capa adicional de protección a tus pedidos verificados y configuraciones de billetera USDT."
          : "Add an additional layer of security to your verified orders and USDT wallet settings."}
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-700">{isSpanish ? "Estado" : "Status"}</span>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
          {isSpanish ? "Verificado por SSL + SSR" : "SSL + SSR Verified"}
        </span>
      </div>
    </div>
  );
}
