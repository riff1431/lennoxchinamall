"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, Clock, RefreshCcw, ArrowLeft } from "lucide-react";
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
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] space-y-6 text-center">
      {/* Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-[#FF1028]">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-100 inline-block">
          {isSpanish ? "Bloqueo de Seguridad" : "Security Lockout"}
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
          {isSpanish ? "Demasiados Intentos Fallidos" : "Too Many Failed Attempts"}
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          {isSpanish
            ? "Para proteger tu cuenta se ha activado un bloqueo temporal. Por favor espera a que el temporizador finalice."
            : "To protect account security, authentication has been temporarily paused. Please wait for the timer to expire."}
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
        <span className="text-[11px] text-slate-500 font-medium block">
          {isSpanish ? "Tiempo de espera restante:" : "Lockout expires in:"}
        </span>
        <div className="text-3xl font-black font-mono text-slate-900 flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <span>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {remainingSeconds === 0 ? (
          <Link
            href="/auth/login"
            className="w-full sm:w-auto bg-[#FF1028] hover:bg-[#E00B20] text-white px-6 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>{isSpanish ? "Reintentar Inicio de Sesión" : "Retry Login Now"}</span>
          </Link>
        ) : (
          <Link
            href="/auth/forgot-password"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            {isSpanish ? "Restablecer Contraseña" : "Reset Password"}
          </Link>
        )}
      </div>

      {/* Return to Store */}
      <div className="pt-2 border-t border-slate-100">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isSpanish ? "Volver a la tienda" : "Return to store"}</span>
        </Link>
      </div>
    </div>
  );
}

