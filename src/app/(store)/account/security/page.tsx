import React from "react";
import { Metadata } from "next";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserSessions, getUserLoginHistory } from "@/lib/auth/session-manager";
import { ActiveSessionsList } from "@/components/auth/ActiveSessionsList";
import { SecurityPasswordForm } from "@/components/auth/SecurityPasswordForm";
import { AccountSecurityHeader, TwoFactorAuthCard } from "@/components/auth/AccountSecurityHeader";

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
      <AccountSecurityHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Password Update & 2FA Status */}
        <div className="lg:col-span-1 space-y-6">
          <SecurityPasswordForm />
          <TwoFactorAuthCard />
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
