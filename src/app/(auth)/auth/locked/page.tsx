"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldX, Clock, RefreshCcw, HelpCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function AccountLockedPage() {
  const { isSpanish } = useTranslation();
  const [remainingSeconds, setRemainingSeconds] = useState(900); // 15 minutes default

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-[#FF1028] flex items-center justify-center mx-auto shadow-inner">
        <ShieldX className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold text-[#FF1028] uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          {isSpanish ? "Bloqueo de Seguridad Activado" : "Security Lockout Engaged"}
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          {isSpanish ? "Demasiados Intentos Fallidos" : "Too Many Failed Login Attempts"}
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          {isSpanish
            ? "Para proteger la seguridad de la cuenta y prevenir accesos no autorizados, se ha activado un bloqueo temporal de autenticación."
            : "To protect account security and prevent unauthorized access, temporary authentication lock has been activated."}
        </p>
      </div>

      {/* Countdown Timer Display */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
          {isSpanish ? "El Bloqueo Expira En" : "Lockout Expires In"}
        </span>
        <div className="text-3xl font-black font-mono text-amber-400 flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 text-amber-400" />
          <span>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {remainingSeconds === 0 ? (
          <Link
            href="/auth/login"
            className="w-full sm:w-auto bg-[#FF1028] hover:bg-[#E00B20] text-white px-6 py-3 rounded-xl text-xs font-black font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>{isSpanish ? "Reintentar Inicio de Sesión" : "Retry Login Now"}</span>
          </Link>
        ) : (
          <Link
            href="/auth/forgot-password"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {isSpanish ? "Restablecer Contraseña" : "Reset Account Password"}
          </Link>
        )}
        <Link
          href="/"
          className="w-full sm:w-auto text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isSpanish ? "Volver a la Tienda" : "Return to Store"}
        </Link>
      </div>
    </div>
  );
}
