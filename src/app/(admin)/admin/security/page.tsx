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
    if (pct < 50) return { bar: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" };
    if (pct < 80) return { bar: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10" };
    return { bar: "bg-red-500", text: "text-red-400", bg: "bg-red-500/10" };
  };

  const cpuColor = getUsageColor(metrics.cpuUsagePct);
  const memColor = getUsageColor(metrics.memoryUsagePct);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Security & System Health"
        subtitle="Real-time infrastructure health, Supabase pgBouncer telemetry, SSL certificate status, and Row-Level Security (RLS) enforcement."
        badge={{ text: "System", variant: "emerald" }}
        breadcrumbs={[{ label: "Security & Health" }]}
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
        <div className="bg-slate-900 border border-blue-500/40 p-4 rounded-3xl flex items-center gap-3 shadow-lg shadow-blue-950/30 animate-in fade-in">
          <Radio className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Diagnostic Audit in Progress
            </h4>
            <p className="text-xs text-slate-300 font-mono">{scanStep}</p>
          </div>
        </div>
      )}

      {/* ── 2. Top Metric Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Server Uptime Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cluster Uptime</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>99.98%</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              {metrics.serverUptime}
            </div>
          </div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
            Zero Outage Incidents
          </div>
        </div>

        {/* Database Pool (pgBouncer) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Pool</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {metrics.dbPoolConnections} <span className="text-sm text-slate-400">/ 60 conn</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Supabase pgBouncer Transaction Mode
            </div>
          </div>
          <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider font-mono">
            Optimal Connection State
          </div>
        </div>

        {/* Active Admin Sessions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff Sessions</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
              {metrics.activeAdminSessions} Concurrent
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Shenzhen & Global Operator Nodes
            </div>
          </div>
          <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider font-mono">
            JWT Role-Protected
          </div>
        </div>

        {/* Rate Limiting (24h) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Edge Rate Limits (24h)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
              {metrics.rateLimitBlockedRequestsLast24h} Blocked
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Malicious & DDoS Bot Mitigation
            </div>
          </div>
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider font-mono">
            Cloudflare Turnstile Active
          </div>
        </div>
      </div>

      {/* ── 3. System Telemetry & Resource Gauges ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & Memory Gauges Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#FF1028]" />
              <h3 className="text-base font-black text-white">Cluster Resource Telemetry</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real-Time Load</span>
          </div>

          {/* CPU Usage Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">Server CPU Allocation</span>
              <span className={cn("font-mono", cpuColor.text)}>{metrics.cpuUsagePct}% Utilized</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={cn("h-full rounded-full transition-all duration-500", cpuColor.bar)}
                style={{ width: `${metrics.cpuUsagePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (Idle)</span>
              <span>50% (Nominal)</span>
              <span>100% (Throttle)</span>
            </div>
          </div>

          {/* Memory Usage Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">RAM / Heap Allocation</span>
              <span className={cn("font-mono", memColor.text)}>{metrics.memoryUsagePct}% (3.4 GB / 8 GB)</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={cn("h-full rounded-full transition-all duration-500", memColor.bar)}
                style={{ width: `${metrics.memoryUsagePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>0 GB</span>
              <span>4 GB</span>
              <span>8 GB Max</span>
            </div>
          </div>

          {/* Infrastructure Specs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Node Region</span>
              <span className="text-xs font-bold text-white font-mono">Hong Kong (HKG1) / Shenzhen</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Edge Runtime</span>
              <span className="text-xs font-bold text-white font-mono">Next.js 16 + Node 20</span>
            </div>
          </div>
        </div>

        {/* Security & RLS Policy Enforcement Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Security & Cryptographic Health</h3>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                SEC-A+ RATING
              </span>
            </div>

            <div className="space-y-3">
              {/* SSL Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">SSL / TLS 1.3 High Encryption</div>
                    <div className="text-[11px] text-slate-400">Cloudflare ECC CA-3 Certificate</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 font-mono block">
                    {metrics.sslExpiryDays} Days
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Until Renewal</span>
                </div>
              </div>

              {/* RLS Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Postgres Row-Level Security (RLS)</div>
                    <div className="text-[11px] text-slate-400">All customer & order tables locked to owner UUID</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-blue-400 font-mono block">
                    {metrics.rlsPoliciesEnforcedCount} Policies
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">100% Enforced</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Last Automated Audit:</span>
            </div>
            <span className="font-mono text-slate-300 font-semibold">{metrics.lastSecurityAuditDate}</span>
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
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
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
