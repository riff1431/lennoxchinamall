"use client";

import React from "react";
import { Check, Dot } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface PasswordStrengthMeterProps {
  password?: string;
}

export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const { isSpanish } = useTranslation();

  const criteria = [
    {
      label: isSpanish ? "8+ caracteres" : "8+ characters",
      valid: password.length >= 8,
    },
    {
      label: isSpanish ? "Mayúscula (A-Z)" : "Uppercase (A-Z)",
      valid: /[A-Z]/.test(password),
    },
    {
      label: isSpanish ? "Minúscula (a-z)" : "Lowercase (a-z)",
      valid: /[a-z]/.test(password),
    },
    {
      label: isSpanish ? "Número (0-9)" : "Number (0-9)",
      valid: /[0-9]/.test(password),
    },
    {
      label: isSpanish ? "Símbolo (!@#$)" : "Symbol (!@#$)",
      valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  const score = criteria.filter((c) => c.valid).length;

  const getStrengthMeta = () => {
    if (!password) {
      return {
        text: isSpanish ? "Vacía" : "None",
        color: "bg-slate-200",
        textCol: "text-slate-400",
        bars: 0,
      };
    }
    if (score <= 2) {
      return {
        text: isSpanish ? "Débil" : "Weak",
        color: "bg-rose-500",
        textCol: "text-rose-600",
        bars: 1,
      };
    }
    if (score <= 3) {
      return {
        text: isSpanish ? "Regular" : "Fair",
        color: "bg-amber-500",
        textCol: "text-amber-600",
        bars: 2,
      };
    }
    if (score === 4) {
      return {
        text: isSpanish ? "Buena" : "Good",
        color: "bg-blue-500",
        textCol: "text-blue-600",
        bars: 3,
      };
    }
    return {
      text: isSpanish ? "Fuerte" : "Strong",
      color: "bg-emerald-500",
      textCol: "text-emerald-600",
      bars: 4,
    };
  };

  const meta = getStrengthMeta();

  return (
    <div className="space-y-2.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-left">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium text-slate-500">
          {isSpanish ? "Seguridad de contraseña" : "Password strength"}
        </span>
        <span className={`font-semibold ${meta.textCol}`}>{meta.text}</span>
      </div>

      {/* 4-Segment Minimal Strength Bar */}
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step <= meta.bars ? meta.color : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Compact Criteria Pills */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
        {criteria.map((c, i) => (
          <div
            key={i}
            className={`inline-flex items-center gap-1 text-[11px] transition-colors ${
              c.valid ? "text-emerald-700 font-medium" : "text-slate-400"
            }`}
          >
            {c.valid ? (
              <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
            ) : (
              <Dot className="w-3 h-3 text-slate-300 shrink-0" />
            )}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

