"use client";

import React, { useState } from "react";
import { Laptop, Smartphone, Tablet, Globe, Shield, Trash2, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { UserSession, AuthLoginHistory } from "@/types/database";
import { revokeUserSession } from "@/lib/auth/session-manager";
import { signout } from "@/app/actions/auth";

interface ActiveSessionsListProps {
  userId: string;
  initialSessions?: UserSession[];
  loginHistory?: AuthLoginHistory[];
}

export function ActiveSessionsList({
  userId,
  initialSessions = [],
  loginHistory = [],
}: ActiveSessionsListProps) {
  const [sessions, setSessions] = useState<UserSession[]>(initialSessions);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRevoke = async (sessionId: string) => {
    setLoadingId(sessionId);
    setFeedback(null);
    try {
      const ok = await revokeUserSession(sessionId, userId);
      if (ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setFeedback("Session revoked successfully.");
      }
    } catch {
      setFeedback("Failed to revoke session.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleGlobalLogout = async () => {
    if (confirm("Are you sure you want to sign out of all active devices?")) {
      await signout({ global: true });
    }
  };

  const getDeviceIcon = (type: string) => {
    if (type === "mobile") return <Smartphone className="w-5 h-5 text-blue-600" />;
    if (type === "tablet") return <Tablet className="w-5 h-5 text-amber-600" />;
    return <Laptop className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      {/* ── Active Sessions Section ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#00143D] font-heading flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Active Devices &amp; Sessions</span>
            </h3>
            <p className="text-xs text-slate-500">
              Manage authorized devices currently signed in to your Lennox ChinaMall account.
            </p>
          </div>

          <button
            onClick={handleGlobalLogout}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#FF1028] border border-red-200 text-xs font-bold font-heading flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out All Other Devices</span>
          </button>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getDeviceIcon(session.device_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{session.device_name}</span>
                      {session.is_current && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>IP: {session.ip_address}</span>
                      {session.location && <span>• {session.location}</span>}
                      <span>• Active: {new Date(session.last_active_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {!session.is_current && (
                  <button
                    onClick={() => handleRevoke(session.id)}
                    disabled={loadingId === session.id}
                    className="self-end sm:self-auto text-xs font-bold text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    title="Terminate session remotely"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke</span>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 space-y-1">
              <div className="flex justify-center">
                <Laptop className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-700">1 Active Session</p>
              <p className="text-[11px] text-slate-400">Your current browser session is protected via Supabase SSR.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Login Audit History ── */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h3 className="text-base font-black text-[#00143D] font-heading flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Recent Account Login History</span>
          </h3>
          <p className="text-xs text-slate-500">
            Audit logs of recent sign-in attempts for account integrity and security monitoring.
          </p>
        </div>

        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
          {loginHistory.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {loginHistory.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === "success" ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {item.browser || "Browser"} on {item.os || "Device"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        IP: {item.ip_address} {item.location ? `• ${item.location}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-md ${
                        item.status === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {item.status === "success" ? "Success" : "Failed"}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No recent security anomalies detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
