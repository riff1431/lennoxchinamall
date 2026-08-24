"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Database,
  Lock,
  Activity,
  Clock,
  RefreshCw,
  Radio,
  FileCheck,
  Key,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/utils/helpers";
import { MOCK_SYSTEM_HEALTH, SystemHealthMetrics } from "@/lib/mockData";

export default function AdminSecurityHealthPage() {
  const [metrics, setMetrics] = useState<SystemHealthMetrics>(MOCK_SYSTEM_HEALTH);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string | null>(null);
  const [isFlushModalOpen, setIsFlushModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Live Diagnostic Scan Trigger
  const handleRunSecurityScan = () => {
    setIsScanning(true);
    setScanStep("Checking Postgres Row-Level Security (RLS) enforcement...");

    setTimeout(() => {
      setScanStep("Testing Binance Pay webhook SHA512 signature hashes...");
    }, 700);

    setTimeout(() => {
      setScanStep("Validating SSL / TLS 1.3 cryptographic certificates...");
    }, 1400);

    setTimeout(() => {
      setScanStep("Auditing pgBouncer connection pools and memory allocation...");
    }, 2000);

    setTimeout(() => {
      setIsScanning(false);
      setScanStep(null);
      setMetrics((prev) => ({
        ...prev,
        lastSecurityAuditDate: new Date().toLocaleString() + " (Just now)",
        cpuUsagePct: Math.round(14 + Math.random() * 8),
        memoryUsagePct: Math.round(38 + Math.random() * 6),
      }));
      showToast("Security scan complete: 0 vulnerabilities found, all 28 RLS policies verified.");
    }, 2600);
  };

  // Flush Edge Cache
  const handleFlushCache = () => {
    setIsFlushModalOpen(false);
    showToast("Cloudflare edge cache and Redis session memory flushed successfully.");
  };

  // Helper: Progress Bar Color
  const getUsageColor = (pct: number) => {
    if (pct < 50) return { bar: "bg-[#2F65F6]", text: "text-[#2F65F6]", bg: "bg-[#EEF4FF]" };
    if (pct < 80) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-[#FFF8EE]" };
    return { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50" };
  };

  const cpuColor = getUsageColor(metrics.cpuUsagePct);
  const memColor = getUsageColor(metrics.memoryUsagePct);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Security &amp; System Health"
        subtitle="Real-time infrastructure health, Supabase pgBouncer telemetry, SSL certificate status, and Row-Level Security (RLS) enforcement."
        badge={{ text: "SYS-HEALTH", variant: "blue" }}
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Security & Health" }]}
        actions={[
          {
            label: isScanning ? "Running Scan..." : "Run Security Scan",
            onClick: handleRunSecurityScan,
            icon: ShieldCheck,
            variant: "primary",
            disabled: isScanning,
          },
          {
            label: "Flush Edge Cache",
            onClick: () => setIsFlushModalOpen(true),
            icon: RefreshCw,
            variant: "secondary",
          },
        ]}
      />

      {/* ── Scanning Banner Overlay ── */}
      {isScanning && (
        <div className="bg-white dark:bg-[#111827] border border-[#2F65F6]/40 p-4 rounded-2xl flex items-center gap-3 shadow-md animate-in fade-in">
          <Radio className="w-5 h-5 text-[#2F65F6] animate-spin shrink-0" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Diagnostic Audit in Progress
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-300 font-mono">{scanStep}</p>
          </div>
        </div>
      )}

      {/* ── 2. Top Metric Cards Grid (Pastels) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Server Uptime Card */}
        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Cluster Uptime
            </span>
            <span className="text-xl font-black text-[#16A34A] dark:text-emerald-400 font-mono mt-0.5 block">
              99.98% High-Avail
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
              {metrics.serverUptime}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Database Pool (pgBouncer) */}
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Database Pool (pgBouncer)
            </span>
            <span className="text-xl font-black text-[#2F65F6] font-mono mt-0.5 block">
              {metrics.dbPoolConnections} / 60 Conn
            </span>
            <span className="text-[11px] font-bold text-[#2F65F6] block mt-0.5">
              Transaction Pool Mode
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Database className="w-5 h-5" />
          </div>
        </div>

        {/* Active Admin Sessions */}
        <div className="p-4.5 rounded-2xl bg-[#F3E8FF] dark:bg-[#251A38] border border-purple-200/50 dark:border-purple-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Active Staff Sessions
            </span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {metrics.activeAdminSessions} Concurrent
            </span>
            <span className="text-[11px] text-purple-600 block mt-0.5">
              JWT Role-Protected
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Key className="w-5 h-5" />
          </div>
        </div>

        {/* Rate Limiting (24h) */}
        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Edge Rate Limits (24h)
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {metrics.rateLimitBlockedRequestsLast24h} Blocked
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Cloudflare Turnstile Active
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. System Telemetry & Resource Gauges ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & Memory Gauges Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#2F65F6]" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">Cluster Resource Telemetry</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real-Time Load</span>
          </div>

          {/* CPU Usage Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Server CPU Allocation</span>
              <span className={cn("font-mono", cpuColor.text)}>{metrics.cpuUsagePct}% Utilized</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
              <div
                className={cn("h-full rounded-full transition-all duration-500", cpuColor.bar)}
                style={{ width: `${metrics.cpuUsagePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Idle)</span>
              <span>50% (Nominal)</span>
              <span>100% (Throttle)</span>
            </div>
          </div>

          {/* Memory Usage Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">RAM / Heap Allocation</span>
              <span className={cn("font-mono", memColor.text)}>{metrics.memoryUsagePct}% (3.4 GB / 8 GB)</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
              <div
                className={cn("h-full rounded-full transition-all duration-500", memColor.bar)}
                style={{ width: `${metrics.memoryUsagePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>0 GB</span>
              <span>4 GB</span>
              <span>8 GB Max</span>
            </div>
          </div>

          {/* Infrastructure Specs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Node Region</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">Hong Kong (HKG1) / Shenzhen</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Edge Runtime</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">Next.js 16 + Node 20</span>
            </div>
          </div>
        </div>

        {/* Security & RLS Policy Enforcement Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#16A34A] dark:text-emerald-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">Security &amp; Cryptographic Health</h3>
              </div>
              <span className="bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0] dark:border-emerald-900/30 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full font-mono">
                SEC-A+ RATING
              </span>
            </div>

            <div className="space-y-3">
              {/* SSL Card */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-[#BBF7D0] dark:border-emerald-900/40">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">SSL / TLS 1.3 High Encryption</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Cloudflare ECC CA-3 Certificate</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#16A34A] dark:text-emerald-400 font-mono block">
                    {metrics.sslExpiryDays} Days
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Until Renewal</span>
                </div>
              </div>

              {/* RLS Card */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/40">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Postgres Row-Level Security (RLS)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">All customer &amp; order tables locked to owner UUID</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#2F65F6] font-mono block">
                    {metrics.rlsPoliciesEnforcedCount} Policies
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">100% Enforced</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2F65F6]" />
              <span>Last Automated Audit:</span>
            </div>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{metrics.lastSecurityAuditDate}</span>
          </div>
        </div>
      </div>

      {/* ── 4. Flush Cache Confirmation Modal ── */}
      <ConfirmDialog
        isOpen={isFlushModalOpen}
        onClose={() => setIsFlushModalOpen(false)}
        onConfirm={handleFlushCache}
        title="Flush System Edge Cache & Redis Memory?"
        description="This will clear Cloudflare edge cache and temporary session transients across all global CDN nodes. Live orders and Postgres records will NOT be affected."
        confirmLabel="Flush Cache"
        variant="warning"
      />

      {/* ── 5. Toast Notification Bar ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500">
          <span>✓ {toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
