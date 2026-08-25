import React from "react";
import { Metadata } from "next";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserSessions, getUserLoginHistory } from "@/lib/auth/session-manager";
import { ActiveSessionsList } from "@/components/auth/ActiveSessionsList";
import { SecurityPasswordForm } from "@/components/auth/SecurityPasswordForm";
import { ShieldCheck, Lock, Smartphone, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Account Security & Active Devices | Lennox ChinaMall",
  description: "Manage your password, active sessions, and multi-device authentication security.",
};

export default async function AccountSecurityPage() {
  const session = await getSessionOrRedirect("/account/security");
  const sessions = await getUserSessions(session.id);
  const loginHistory = await getUserLoginHistory(session.id, 6);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* ── Header ── */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block">
          Security &amp; Privacy Center
        </span>
        <h1 className="text-2xl font-black text-[#00143D] font-heading">
          Security &amp; Active Devices
        </h1>
        <p className="text-xs text-slate-500">
          Protect your account credentials, monitor active sessions, and review recent sign-in history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Password Update & 2FA Status */}
        <div className="lg:col-span-1 space-y-6">
          <SecurityPasswordForm />

          {/* 2FA Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black text-[#00143D] uppercase font-heading">
                Two-Factor Security (2FA)
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add an additional layer of security to your verified orders and USDT wallet settings.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700">Status</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                SSL + SSR Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Sessions & Audit History */}
        <div className="lg:col-span-2">
          <ActiveSessionsList
            userId={session.id}
            initialSessions={sessions}
            loginHistory={loginHistory}
          />
        </div>
      </div>
    </div>
  );
}
