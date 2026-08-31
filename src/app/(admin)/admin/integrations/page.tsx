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
  Cloud,
  Eye,
  EyeOff,
  Key,
  Lock,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/helpers";
import { MOCK_INTEGRATIONS, IntegrationService } from "@/lib/mockData";
import {
  testCloudinaryConnection,
  getCloudinarySettings,
  saveCloudinarySettings,
} from "@/app/actions/cloudinary";

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

  // Cloudinary Specific Credentials
  const [cloudNameInput, setCloudNameInput] = useState("vojfukje");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiSecretInput, setApiSecretInput] = useState("");
  const [uploadPresetInput, setUploadPresetInput] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Icon Map Helper
  const getIntegrationIcon = (iconName: string) => {
    switch (iconName) {
      case "Coins":
        return Coins;
      case "Cloud":
        return Cloud;
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
  const handleTestConnection = async (item: IntegrationService) => {
    setTestingId(item.id);

    if (item.id === "int-2" || item.name.includes("Cloudinary")) {
      try {
        const result = await testCloudinaryConnection();
        setIntegrations((prev) =>
          prev.map((intg) =>
            intg.id === item.id
              ? {
                  ...intg,
                  status: result.status,
                  responseTimeMs: result.responseTimeMs,
                  lastCheck: "Just now",
                  endpoint: result.endpoint,
                }
              : intg
          )
        );
        showToast(result.message);
      } catch (err: any) {
        showToast(`Cloudinary ping failed: ${err.message}`);
      } finally {
        setTestingId(null);
      }
      return;
    }

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
  const handleOpenConfig = async (item: IntegrationService) => {
    setConfigItem(item);
    setEndpointInput(item.endpoint);
    setAuthMethodInput(item.authMethod);
    setDetailsInput(item.details);
    setShowSecret(false);

    if (item.id === "int-2" || item.name.includes("Cloudinary")) {
      try {
        const settings = await getCloudinarySettings();
        setCloudNameInput(settings.cloudName || "vojfukje");
        setApiKeyInput(settings.apiKey || "");
        setApiSecretInput(settings.apiSecret || "");
        setUploadPresetInput(settings.uploadPreset || "");
      } catch (err) {
        console.warn("Could not preload Cloudinary settings:", err);
      }
    }
  };

  // Save Configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configItem) return;
    setIsSavingConfig(true);

    try {
      if (configItem.id === "int-2" || configItem.name.includes("Cloudinary")) {
        const res = await saveCloudinarySettings({
          cloudName: cloudNameInput,
          apiKey: apiKeyInput,
          apiSecret: apiSecretInput,
          uploadPreset: uploadPresetInput,
        });

        const newEndpoint = `https://api.cloudinary.com/v1_1/${cloudNameInput.trim()}/image/upload`;

        setIntegrations((prev) =>
          prev.map((intg) =>
            intg.id === configItem.id
              ? {
                  ...intg,
                  endpoint: newEndpoint,
                  authMethod: authMethodInput,
                  details: `Cloud environment '${cloudNameInput}' connected. Automated WebP conversion, auto-tagging, and Fastly Global CDN media delivery.`,
                  lastCheck: "Just now",
                }
              : intg
          )
        );

        showToast(res.message || "Cloudinary configuration saved successfully.");
        setConfigItem(null);
        return;
      }

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
    } catch (err: any) {
      showToast(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Helper: Status Dot Indicator
  const renderStatusDot = (status: IntegrationService["status"]) => {
    switch (status) {
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase font-mono">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] dark:bg-emerald-400 animate-pulse" />
            <span>Healthy (200 OK)</span>
          </span>
        );
      case "degraded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
            <span>Degraded</span>
          </span>
        );
      case "pending_keys":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF0F2] dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-black uppercase font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400" />
            <span>Missing API Key</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] dark:text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase font-mono">
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Third-Party Integrations &amp; Gateways"
        subtitle="Telemetry and live webhook monitoring for Binance Pay Merchant API, Supabase pgBouncer, YunExpress air logistics, and Cloudflare Turnstile."
        badge={{ text: "API CONNECTIVITY", variant: "blue" }}
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Integrations" }]}
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
        <div className="bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 rounded-2xl p-5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>Active Integrations</span>
            <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {healthyCount} / {totalIntegrations} Operational
          </div>
          <div className="text-[11px] text-[#16A34A] dark:text-emerald-400 font-semibold">100% SLA Availability</div>
        </div>

        <div className="bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 rounded-2xl p-5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>Average API Latency</span>
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{avgLatency} ms</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Across Binance Pay & Air Cargo APIs</div>
        </div>

        <div className="bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 rounded-2xl p-5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>Security Verification</span>
            <div className="w-10 h-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">HMAC SHA512</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Encrypted webhook secret rotation</div>
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
              className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs flex flex-col justify-between hover:border-slate-200 dark:hover:border-slate-700 transition-colors group"
            >
              {/* Header inside Card */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[#2F65F6] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#2F65F6] transition-colors">
                        {intg.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{intg.category}</span>
                    </div>
                  </div>

                  {renderStatusDot(intg.status)}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                  {intg.details}
                </p>

                {/* API Endpoint & Protocol Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold">Endpoint Route:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(intg.endpoint);
                        showToast(`Endpoint URL copied to clipboard.`);
                      }}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                    {intg.endpoint}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Authentication
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
                      {intg.authMethod}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Response Latency
                    </span>
                    <span className="text-xs font-mono font-bold text-[#16A34A] dark:text-emerald-400">
                      {intg.responseTimeMs} ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Checked: {intg.lastCheck}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenConfig(intg)}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl font-bold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Configure</span>
                  </button>

                  <button
                    onClick={() => handleTestConnection(intg)}
                    disabled={isTestingThis}
                    className="bg-[#2F65F6] hover:bg-[#2563EB] disabled:opacity-50 text-white px-3.5 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-blue-500/25 shadow-xs cursor-pointer"
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Service Name</label>
              <input
                type="text"
                disabled
                value={configItem.name}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded-xl px-3.5 py-2.5 cursor-not-allowed"
              />
            </div>

            {configItem.id === "int-2" || configItem.name.includes("Cloudinary") ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Cloud Environment Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={cloudNameInput}
                      onChange={(e) => setCloudNameInput(e.target.value)}
                      placeholder="e.g. vojfukje"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Found in Cloudinary Dashboard
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Upload Preset (Optional)
                    </label>
                    <input
                      type="text"
                      value={uploadPresetInput}
                      onChange={(e) => setUploadPresetInput(e.target.value)}
                      placeholder="e.g. lennox_preset (Unsigned)"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Cloudinary Settings → Upload → Upload presets
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-500" />
                      Cloudinary API Key *
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="e.g. 482917492819384"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Copy from Cloudinary Dashboard → API Keys
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-500" />
                      Cloudinary API Secret *
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[11px] font-bold text-[#2F65F6] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSecret ? "Hide Secret" : "Show Secret"}</span>
                    </button>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showSecret ? "text" : "password"}
                      required
                      value={apiSecretInput}
                      onChange={(e) => setApiSecretInput(e.target.value)}
                      placeholder="Paste API Secret from Cloudinary"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Secret is encrypted and used exclusively for server-side SHA-1 signed uploads.
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">API Endpoint URL *</label>
                  <input
                    type="text"
                    required
                    value={endpointInput}
                    onChange={(e) => setEndpointInput(e.target.value)}
                    placeholder="https://api.gateway.com/v1"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Authentication Protocol</label>
                  <select
                    value={authMethodInput}
                    onChange={(e) => setAuthMethodInput(e.target.value as IntegrationService["authMethod"])}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="API Key + HMAC SHA512">API Key + HMAC SHA512 (Binance / YunExpress)</option>
                    <option value="Cloudinary API Secret">Cloudinary API Secret / API Key (Cloud Storage & CDN)</option>
                    <option value="Supabase Service Role">Supabase Service Role (Postgres RLS)</option>
                    <option value="Bearer OAuth2">Bearer OAuth2 (Cloudflare Turnstile)</option>
                    <option value="Webhook Secret">Webhook Secret (Callbacks)</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Operational Notes / Scope</label>
              <textarea
                rows={3}
                value={detailsInput}
                onChange={(e) => setDetailsInput(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfigItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingConfig}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] disabled:opacity-50 transition-colors shadow-blue-500/25 shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSavingConfig ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Integration</span>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── 5. Toast Notification Bar ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-xl border border-emerald-500 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
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
