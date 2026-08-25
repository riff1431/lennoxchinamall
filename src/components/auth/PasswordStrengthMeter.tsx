"use client";

import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password?: string;
}

export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const criteria = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { label: "Number digit (0-9)", valid: /[0-9]/.test(password) },
    { label: "Special symbol (!@#$%^&*)", valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const score = criteria.filter((c) => c.valid).length;

  const getStrengthMeta = () => {
    if (!password) return { text: "None", color: "bg-slate-700", textCol: "text-slate-500", percent: 0 };
    if (score <= 2) return { text: "Weak", color: "bg-red-500", textCol: "text-red-400", percent: 25 };
    if (score <= 3) return { text: "Fair", color: "bg-amber-500", textCol: "text-amber-400", percent: 50 };
    if (score === 4) return { text: "Good", color: "bg-blue-500", textCol: "text-blue-400", percent: 75 };
    return { text: "Strong", color: "bg-emerald-500", textCol: "text-emerald-400", percent: 100 };
  };

  const meta = getStrengthMeta();

  return (
    <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px]">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-400 font-heading uppercase text-[10px] tracking-wider">
          Password Strength
        </span>
        <span className={`font-mono font-bold ${meta.textCol}`}>{meta.text}</span>
      </div>

      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full ${meta.color} transition-all duration-300 rounded-full`}
          style={{ width: `${meta.percent}%` }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
        {criteria.map((c, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 text-[10px] ${
              c.valid ? "text-emerald-400 font-medium" : "text-slate-500"
            }`}
          >
            {c.valid ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-3 h-3 text-slate-600 shrink-0" />
            )}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
