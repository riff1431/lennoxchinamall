"use client";

import React, { useState } from "react";
import {
  Cpu,
  Coins,
  Truck,
  Plane,
  ShieldCheck,
  RefreshCw,
  Zap,
  Copy,
  Clock,
  Radio,
  Activity,
  Server,
  Settings2,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/helpers";
import { MOCK_INTEGRATIONS, IntegrationService } from "@/lib/mockData";

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationService[]>(MOCK_INTEGRATIONS);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Configure Modal State
  const [configItem, setConfigItem] = useState<IntegrationService | null>(null);
  const [endpointInput, setEndpointInput] = useState("");
  const [authMethodInput, setAuthMethodInput] = useState<IntegrationService["authMethod"]>("API Key + HMAC SHA512");
  const [detailsInput, setDetailsInput] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Icon Map Helper
  const getIntegrationIcon = (iconName: string) => {
    switch (iconName) {
      case "Coins":
        return Coins;
      case "Cpu":
        return Cpu;
      case "Truck":
        return Truck;
      case "Plane":
        return Plane;
      case "ShieldCheck":
        return ShieldCheck;
      default:
        return Server;
    }
  };

  // Test Single Connection
  const handleTestConnection = (item: IntegrationService) => {
    setTestingId(item.id);
    setTimeout(() => {
      const newResponseTime = Math.floor(20 + Math.random() * 80);
      setIntegrations((prev) =>
        prev.map((intg) =>
          intg.id === item.id
            ? {
                ...intg,
                status: "healthy",
                responseTimeMs: newResponseTime,
                lastCheck: "Just now",
              }
            : intg
        )
      );
      setTestingId(null);
      showToast(`Connection to ${item.name} tested: HTTP 200 OK (${newResponseTime}ms latency).`);
    }, 800);
  };

  // Refresh All Integrations
  const handleRefreshAll = () => {
    setIsRefreshingAll(true);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((intg) => ({
          ...intg,
          status: "healthy",
          responseTimeMs: Math.floor(25 + Math.random() * 95),
          lastCheck: "Just now",
        }))
      );
      setIsRefreshingAll(false);
      showToast("All third-party services and payment gateways verified successfully.");
    }, 1200);
  };

  // Open Configure Modal
  const handleOpenConfig = (item: IntegrationService) => {
    setConfigItem(item);
    setEndpointInput(item.endpoint);
    setAuthMethodInput(item.authMethod);
    setDetailsInput(item.details);
  };

  // Save Configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configItem) return;

    setIntegrations((prev) =>
      prev.map((intg) =>
        intg.id === configItem.id
          ? {
              ...intg,
              endpoint: endpointInput.trim(),
              authMethod: authMethodInput,
              details: detailsInput.trim(),
              lastCheck: "Just now",
            }
          : intg
      )
    );

    showToast(`Integration settings for ${configItem.name} updated.`);
    setConfigItem(null);
  };

  // Helper: Status Dot Indicator
  const renderStatusDot = (status: IntegrationService["status"]) => {
    switch (status) {
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Healthy (200 OK)</span>
          </span>
        );
      case "degraded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Degraded</span>
          </span>
        );
      case "pending_keys":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-black uppercase font-mono">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Missing API Key</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase font-mono">
            <span>Configured</span>
          </span>
        );
    }
  };

  // Summary Metrics
  const totalIntegrations = integrations.length;
  const healthyCount = integrations.filter((i) => i.status === "healthy").length;
  const avgLatency = Math.round(
    integrations.reduce((acc, curr) => acc + curr.responseTimeMs, 0) / (totalIntegrations || 1)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Third-Party Integrations & Gateways"
        subtitle="Telemetry and live webhook monitoring for Binance Pay Merchant API, Supabase pgBouncer, YunExpress air logistics, and Cloudflare Turnstile."
        badge={{ text: "API CONNECTIVITY", variant: "blue" }}
        breadcrumbs={[{ label: "Integrations" }]}
        actions={[
          {
            label: isRefreshingAll ? "Verifying All..." : "Refresh All Gateways",
            onClick: handleRefreshAll,
            icon: RefreshCw,
            variant: "primary",
            disabled: isRefreshingAll,
          },
        ]}
      />

      {/* ── 2. Telemetry Overview Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Active Integrations</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {healthyCount} / {totalIntegrations} Operational
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">100% SLA Availability</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Average API Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{avgLatency} ms</div>
          <div className="text-[11px] text-slate-500">Across Binance Pay & Air Cargo APIs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Security Verification</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">HMAC SHA512</div>
          <div className="text-[11px] text-slate-500">Encrypted webhook secret rotation</div>
        </div>
      </div>

      {/* ── 3. Integration Cards Grid (2 Columns on Desktop) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((intg) => {
          const Icon = getIntegrationIcon(intg.iconName);
          const isTestingThis = testingId === intg.id;

          return (
            <div
              key={intg.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors group"
            >
              {/* Header inside Card */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 text-[#FF1028] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white leading-snug group-hover:text-[#FF1028] transition-colors">
                        {intg.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-semibold">{intg.category}</span>
                    </div>
                  </div>

                  {renderStatusDot(intg.status)}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  {intg.details}
                </p>

                {/* API Endpoint & Protocol Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold">Endpoint Route:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(intg.endpoint);
                        showToast(`Endpoint URL copied to clipboard.`);
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl font-mono text-[11px] text-slate-300 truncate">
                    {intg.endpoint}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Authentication
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300 line-clamp-1">
                      {intg.authMethod}
                    </span>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Response Latency
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {intg.responseTimeMs} ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Checked: {intg.lastCheck}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenConfig(intg)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Configure</span>
                  </button>

                  <button
                    onClick={() => handleTestConnection(intg)}
                    disabled={isTestingThis}
                    className="bg-[#FF1028] hover:bg-[#E00B20] disabled:opacity-50 text-white px-3.5 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Radio className={cn("w-3.5 h-3.5", isTestingThis && "animate-spin")} />
                    <span>{isTestingThis ? "Pinging..." : "Test Ping"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. Integration Configure Modal ── */}
      <Modal
        isOpen={!!configItem}
        onClose={() => setConfigItem(null)}
        title={configItem ? `Configure ${configItem.name}` : "Configure Gateway"}
        size="lg"
      >
        {configItem && (
          <form onSubmit={handleSaveConfig} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Service Name</label>
              <input
                type="text"
                disabled
                value={configItem.name}
                className="w-full bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-xl px-3.5 py-2.5 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">API Endpoint URL *</label>
              <input
                type="text"
                required
                value={endpointInput}
                onChange={(e) => setEndpointInput(e.target.value)}
                placeholder="https://api.gateway.com/v1"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Authentication Protocol</label>
              <select
                value={authMethodInput}
                onChange={(e) => setAuthMethodInput(e.target.value as IntegrationService["authMethod"])}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028] cursor-pointer"
              >
                <option value="API Key + HMAC SHA512">API Key + HMAC SHA512 (Binance / YunExpress)</option>
                <option value="Supabase Service Role">Supabase Service Role (Postgres RLS)</option>
                <option value="Bearer OAuth2">Bearer OAuth2 (Cloudflare Turnstile)</option>
                <option value="Webhook Secret">Webhook Secret (Callbacks)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Operational Notes / Scope</label>
              <textarea
                rows={3}
                value={detailsInput}
                onChange={(e) => setDetailsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-3.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfigItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors shadow-md cursor-pointer"
              >
                Save Integration
              </button>
            </div>
          </form>
        )}
      </Modal>

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
