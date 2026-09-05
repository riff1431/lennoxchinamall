"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  MapPin,
  Coins,
  Save,
  Building,
  Mail,
  Truck,
  FileText,
  Bell,
  CreditCard,
  Image as ImageIcon,
  Search,
  BarChart,
  Shield,
  Download,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Server,
  Zap,
  Globe,
  Languages,
} from "lucide-react";
import { AllStoreSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-constants";
import {
  getCompleteStoreSettings,
  updateSettingsDomain,
  resetSettingsToDefault,
  exportDatabaseBackup,
} from "@/app/actions/admin-settings";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AdminImageUpload } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTabs, AdminTabItem } from "@/components/admin/AdminTabs";
import { AdminCard } from "@/components/admin/AdminCard";
import { useSettingsStore } from "@/store/useSettingsStore";

const SETTINGS_TABS: AdminTabItem[] = [
  { id: "store_info", label: "Store & Logistics", icon: Building },
  { id: "branding", label: "Branding & Media", icon: ImageIcon },
  { id: "currencies_shipping", label: "Currencies & Shipping", icon: Coins },
  { id: "orders_invoice", label: "Orders & Invoices", icon: FileText },
  { id: "email_notifications", label: "Emails & Alerts", icon: Bell },
  { id: "binance_pay", label: "Binance Pay API", icon: CreditCard },
  { id: "seo_analytics", label: "SEO & Analytics", icon: Search },
  { id: "security_backups", label: "Security & Recovery", icon: Shield },
];

type TabKey =
  | "store_info"
  | "branding"
  | "currencies_shipping"
  | "orders_invoice"
  | "email_notifications"
  | "binance_pay"
  | "seo_analytics"
  | "security_backups";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("store_info");
  const [settings, setSettings] = useState<AllStoreSettings>(DEFAULT_STORE_SETTINGS);
  const [userRole, setUserRole] = useState<string>("super_admin");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [resetConfirmDomain, setResetConfirmDomain] = useState<keyof AllStoreSettings | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    const res = await getCompleteStoreSettings();
    if (res.success && res.settings) {
      setSettings(res.settings);
      useSettingsStore.getState().setSettings(res.settings);
      if (res.userRole) setUserRole(res.userRole);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  // Update domain in local state & live store
  const updateDomainField = <D extends keyof AllStoreSettings, F extends keyof AllStoreSettings[D]>(
    domain: D,
    field: F,
    value: AllStoreSettings[D][F]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        [field]: value,
      },
    }));

    // Instantly reflect in live store for instant real-time feedback
    useSettingsStore.getState().updateDomain(domain, field, value);
  };


  // Persist domain helper with API route priority
  const persistDomain = async (domain: string, payload: any) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, payload }),
      });
      const data = await res.json();
      if (data.success) return data;
      return { success: false, error: data.error || "Failed to persist settings." };
    } catch (err: any) {
      console.warn("API settings save error, trying server action:", err);
      try {
        return await updateSettingsDomain(domain, payload);
      } catch (actionErr: any) {
        return { success: false, error: actionErr?.message || "Save request failed." };
      }
    }
  };

  // Save active tab bundle
  const handleSaveActiveTab = async () => {
    setIsSaving(true);
    const saveResults: { success: boolean; message?: string; error?: string }[] = [];

    // Failsafe timeout so the button can NEVER hang on "Saving..."
    const failsafeTimeout = setTimeout(() => {
      setIsSaving(false);
    }, 6000);

    try {
      if (activeTab === "store_info") {
        saveResults.push(await persistDomain("store_info", settings.store_info));
        saveResults.push(await persistDomain("tax_customs", settings.tax_customs));
      } else if (activeTab === "branding") {
        saveResults.push(await persistDomain("branding", settings.branding));
        saveResults.push(await persistDomain("storage", settings.storage));
      } else if (activeTab === "currencies_shipping") {
        saveResults.push(await persistDomain("currencies", settings.currencies));
        saveResults.push(await persistDomain("shipping_zones", settings.shipping_zones));
        saveResults.push(await persistDomain("localization", settings.localization));
      } else if (activeTab === "orders_invoice") {
        saveResults.push(await persistDomain("order_workflow", settings.order_workflow));
        saveResults.push(await persistDomain("invoice", settings.invoice));
      } else if (activeTab === "email_notifications") {
        saveResults.push(await persistDomain("email_templates", settings.email_templates));
        saveResults.push(await persistDomain("notifications", settings.notifications));
      } else if (activeTab === "binance_pay") {
        saveResults.push(await persistDomain("binance_pay", settings.binance_pay));
      } else if (activeTab === "seo_analytics") {
        saveResults.push(await persistDomain("seo", settings.seo));
        saveResults.push(await persistDomain("analytics", settings.analytics));
      } else if (activeTab === "security_backups") {
        saveResults.push(await persistDomain("security", settings.security));
        saveResults.push(await persistDomain("maintenance", settings.maintenance));
        saveResults.push(await persistDomain("backups", settings.backups));
      }

      const failed = saveResults.find((r) => !r.success);
      if (failed) {
        showToast(failed.error || "Failed to persist settings. Please try again.");
      } else {
        // Ensure store is persisted with all latest values
        useSettingsStore.getState().setSettings(settings);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("lennox_settings_updated"));
        }
        showToast("All changes in this section applied across storefront!");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      showToast(err?.message || "Failed to save settings.");
    } finally {
      clearTimeout(failsafeTimeout);
      setIsSaving(false);
    }
  };

  // Download System Disaster Recovery Backup
  const handleDownloadBackup = async () => {
    showToast("Packaging complete catalogue, suppliers, and ledger into JSON backup...");
    const res = await exportDatabaseBackup();
    if (res.success && res.backupData) {
      const blob = new Blob([JSON.stringify(res.backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = res.filename || `lennoxchinamall_backup_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Backup JSON downloaded successfully!");
    } else {
      showToast(res.error || "Failed to create backup.");
    }
  };

  // Reset handler
  const handleConfirmReset = async () => {
    if (resetConfirmDomain) {
      const res = await resetSettingsToDefault(resetConfirmDomain);
      if (res.success) {
        showToast(`Reset ${resetConfirmDomain} to factory defaults.`);
        loadData();
      } else {
        showToast(res.error || "Reset failed.");
      }
      setResetConfirmDomain(null);
    }
  };

  const isSuperAdmin = userRole === "super_admin";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Modern Minimal Header Bar ── */}
      <AdminPageHeader
        title="Storefront & System Settings"
        subtitle="Centrally manage China procurement hubs, Binance Pay gateway API, zero-fee USDT conversions, and storefront branding."
        badge={{ text: userRole.toUpperCase(), variant: "slate" }}
        breadcrumbs={[
          { label: "Settings & Security", href: "/admin/settings" },
          { label: "Storefront & System Settings" },
        ]}
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            variant: "secondary",
            onClick: loadData,
            disabled: isLoading,
          },
          ...(isSuperAdmin
            ? [
                {
                  label: "Export Backup",
                  icon: Download,
                  variant: "secondary" as const,
                  onClick: handleDownloadBackup,
                },
              ]
            : []),
          {
            label: isSaving ? "Saving..." : "Save Changes",
            icon: Save,
            variant: "primary",
            onClick: handleSaveActiveTab,
            disabled: isSaving,
          },
        ]}
      />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm hover:opacity-70 cursor-pointer">×</button>
        </div>
      )}

      {/* ── 2. Modern Navigation Tabs ── */}
      <AdminTabs
        tabs={SETTINGS_TABS}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as TabKey)}
        variant="underline"
        className="pb-0"
      />

      {/* ── 3. Tab Contents ── */}

      {/* ─── TAB 1: Store Information & Logistics Hubs ─── */}
      {activeTab === "store_info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Section 1.1: Business & Store Information */}
          <AdminCard
            title="Store Identity"
            description="Manage legal identity, public storefront branding names, and support contacts."
            icon={Store}
          >
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Public Store Name *</label>
                <input
                  type="text"
                  value={settings.store_info.store_name}
                  onChange={(e) => updateDomainField("store_info", "store_name", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Legal Entity Name</label>
                <input
                  type="text"
                  value={settings.store_info.legal_entity}
                  onChange={(e) => updateDomainField("store_info", "legal_entity", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Hero Tagline / Pitch</label>
                <input
                  type="text"
                  value={settings.store_info.tagline}
                  onChange={(e) => updateDomainField("store_info", "tagline", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Support Desk Email *</label>
                  <input
                    type="email"
                    value={settings.store_info.support_email}
                    onChange={(e) => updateDomainField("store_info", "support_email", e.target.value)}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Business Phone</label>
                  <input
                    type="text"
                    value={settings.store_info.business_phone}
                    onChange={(e) => updateDomainField("store_info", "business_phone", e.target.value)}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Section 1.2: Chinese Procurement Hubs */}
          <AdminCard
            title="China Operations Hubs"
            description="Procurement logistics, warehouse consolidation, and quality control offices in China."
            icon={MapPin}
          >
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Shenzhen Drone &amp; Electronics Hub</label>
                <textarea
                  rows={2}
                  value={settings.store_info.shenzhen_hub}
                  onChange={(e) => updateDomainField("store_info", "shenzhen_hub", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Guangzhou Logistics &amp; QC Center</label>
                <textarea
                  rows={2}
                  value={settings.store_info.guangzhou_hub}
                  onChange={(e) => updateDomainField("store_info", "guangzhou_hub", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Operating Hours</label>
                  <input
                    type="text"
                    value={settings.store_info.business_hours}
                    onChange={(e) => updateDomainField("store_info", "business_hours", e.target.value)}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Timezone</label>
                  <input
                    type="text"
                    value={settings.store_info.timezone}
                    onChange={(e) => updateDomainField("store_info", "timezone", e.target.value)}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ─── TAB 2: Branding, Colors & Storage ─── */}
      {activeTab === "branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AdminCard
            title="Logos & Visual Identity"
            description="Manage your storefront branding, navigation logo, and browser favicon."
            icon={ImageIcon}
          >
            <div className="space-y-5 text-xs">
              <AdminImageUpload
                label="Primary Storefront Logo"
                aspectRatioTip="240×60px transparent SVG or PNG"
                helperText="Brand emblem shown on header and preloader"
                value={settings.branding.primary_logo_url}
                onChange={(url) => updateDomainField("branding", "primary_logo_url", url)}
                bucket={settings.storage.banners_bucket || "products"}
                folder="branding"
                maxSizeMB={settings.storage.max_image_mb || 20}
                placeholder="/logo-lennoxchinamall.png or https://..."
                previewShape="rectangle"
              />

              <AdminImageUpload
                label="Store Favicon / Browser Tab Icon"
                aspectRatioTip="32×32px or 64×64px .ico / .png"
                helperText="Icon displayed in browser tabs and bookmarks"
                value={settings.branding.favicon_url}
                onChange={(url) => updateDomainField("branding", "favicon_url", url)}
                bucket={settings.storage.banners_bucket || "products"}
                folder="branding"
                maxSizeMB={settings.storage.max_image_mb || 20}
                placeholder="/favicon.ico or https://..."
                previewShape="square"
              />

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-2">Theme Accent Colors</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 block">Primary Red</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.branding.primary_color}
                        onChange={(e) => updateDomainField("branding", "primary_color", e.target.value)}
                        className="w-7 h-7 rounded-md bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.branding.primary_color}
                        onChange={(e) => updateDomainField("branding", "primary_color", e.target.value)}
                        className="h-8 w-full px-2 rounded-md bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 block">Secondary Navy</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.branding.secondary_color}
                        onChange={(e) => updateDomainField("branding", "secondary_color", e.target.value)}
                        className="w-7 h-7 rounded-md bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.branding.secondary_color}
                        onChange={(e) => updateDomainField("branding", "secondary_color", e.target.value)}
                        className="h-8 w-full px-2 rounded-md bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 block">Accent Green</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.branding.accent_color}
                        onChange={(e) => updateDomainField("branding", "accent_color", e.target.value)}
                        className="w-7 h-7 rounded-md bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.branding.accent_color}
                        onChange={(e) => updateDomainField("branding", "accent_color", e.target.value)}
                        className="h-8 w-full px-2 rounded-md bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard
            title="Storage & Asset Limits"
            description="Manage media bucket routing and file upload thresholds for Supabase Storage."
            icon={Server}
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Products Media Bucket</label>
                  <input
                    type="text"
                    value={settings.storage.products_bucket}
                    onChange={(e) => updateDomainField("storage", "products_bucket", e.target.value)}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Banners Bucket</label>
                  <input
                    type="text"
                    value={settings.storage.banners_bucket}
                    onChange={(e) => updateDomainField("storage", "banners_bucket", e.target.value)}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Max Image Size (MB)</label>
                  <input
                    type="number"
                    value={settings.storage.max_image_mb}
                    onChange={(e) => updateDomainField("storage", "max_image_mb", Number(e.target.value))}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Max Video Size (MB)</label>
                  <input
                    type="number"
                    value={settings.storage.max_video_mb}
                    onChange={(e) => updateDomainField("storage", "max_video_mb", Number(e.target.value))}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ─── TAB 3: Currencies, Shipping & Localization ─── */}
      {activeTab === "currencies_shipping" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminCard
              title="Exchange Rates & Multi-Currency"
              description="Configure base settlement currency and secondary currency conversion multipliers."
              icon={Coins}
            >
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block">Base Settlement Currency</span>
                    <span className="text-[11px] opacity-80">Binance Pay USDT Escrow Default</span>
                  </div>
                  <span className="text-xs font-semibold font-mono bg-emerald-600 text-white px-2 py-0.5 rounded">
                    {settings.currencies.base_currency}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-slate-700 dark:text-slate-300 block">Secondary Currencies (vs 1 USDT)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(settings.currencies.rates || {}).map(([curr, rate]) => (
                      <div key={curr} className="p-2 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{curr}</span>
                        <input
                          type="number"
                          step="0.01"
                          value={rate}
                          onChange={(e) => {
                            const newRates = { ...settings.currencies.rates, [curr]: Number(e.target.value) };
                            updateDomainField("currencies", "rates", newRates);
                          }}
                          className="w-16 text-right bg-transparent font-mono text-slate-900 dark:text-white outline-none focus:text-slate-900 dark:focus:text-white font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AdminCard>

            <AdminCard
              title="Air Express Freight Rules"
              description="Logistics rates, transit lead time benchmarks, and free shipping triggers."
              icon={Truck}
            >
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Free Air Shipping Threshold ($)</label>
                    <input
                      type="number"
                      value={settings.shipping_zones.free_shipping_threshold}
                      onChange={(e) => updateDomainField("shipping_zones", "free_shipping_threshold", Number(e.target.value))}
                      className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Standard Air Freight Cost ($)</label>
                    <input
                      type="number"
                      value={settings.shipping_zones.standard_air_cost}
                      onChange={(e) => updateDomainField("shipping_zones", "standard_air_cost", Number(e.target.value))}
                      className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Default Logistics Air Carrier</label>
                  <input
                    type="text"
                    value={settings.shipping_zones.default_carrier}
                    onChange={(e) => updateDomainField("shipping_zones", "default_carrier", e.target.value)}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Target Air Delivery Lead Time (Days)</label>
                  <input
                    type="number"
                    value={settings.shipping_zones.air_express_lead_days}
                    onChange={(e) => updateDomainField("shipping_zones", "air_express_lead_days", Number(e.target.value))}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            </AdminCard>
          </div>

          <AdminCard
            title="Storefront Languages & Dynamic Localization"
            description="Define default language for new visitors and manage unit standards across all catalogs."
            icon={Languages}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <label className="font-medium text-slate-700 dark:text-slate-300 block">
                  Default Storefront Language (New Visitors)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateDomainField("localization", "default_locale", "en")}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      (settings.localization.default_locale === "en" || settings.localization.default_locale === "en-US")
                        ? "bg-slate-100 dark:bg-slate-800/80 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-white ring-1 ring-slate-400 dark:ring-slate-600"
                        : "bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">🇺🇸</span>
                      {(settings.localization.default_locale === "en" || settings.localization.default_locale === "en-US") && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      )}
                    </div>
                    <div className="mt-2.5">
                      <span className="font-semibold text-xs block">English (EN)</span>
                      <span className="text-[10px] text-slate-500">Default Global Sourcing</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateDomainField("localization", "default_locale", "es")}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      (settings.localization.default_locale === "es" || settings.localization.default_locale === "es-ES")
                        ? "bg-slate-100 dark:bg-slate-800/80 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-white ring-1 ring-slate-400 dark:ring-slate-600"
                        : "bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">🇪🇸</span>
                      {(settings.localization.default_locale === "es" || settings.localization.default_locale === "es-ES") && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      )}
                    </div>
                    <div className="mt-2.5">
                      <span className="font-semibold text-xs block">Español (ES)</span>
                      <span className="text-[10px] text-slate-500">América Latina & Spain</span>
                    </div>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Storefront automatically switches to this default locale when no prior preference cookie exists.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Date Format</label>
                    <input
                      type="text"
                      value={settings.localization.date_format}
                      onChange={(e) => updateDomainField("localization", "date_format", e.target.value)}
                      className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Time Format</label>
                    <select
                      value={settings.localization.time_format}
                      onChange={(e) => updateDomainField("localization", "time_format", e.target.value as any)}
                      className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                    >
                      <option value="24h">24 Hours (International)</option>
                      <option value="12h">12 Hours (AM/PM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Weight Unit</label>
                    <select
                      value={settings.localization.weight_unit}
                      onChange={(e) => updateDomainField("localization", "weight_unit", e.target.value as any)}
                      className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lbs">Pounds (lbs)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Dimension Unit</label>
                    <select
                      value={settings.localization.dimension_unit}
                      onChange={(e) => updateDomainField("localization", "dimension_unit", e.target.value as any)}
                      className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="in">Inches (in)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ─── TAB 4: Orders & Invoices ─── */}
      {activeTab === "orders_invoice" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminCard
            title="Order Workflow Rules"
            description="Prefix sequences, cancellation thresholds, and order size constraints."
            icon={FileText}
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Order Number Prefix</label>
                  <input
                    type="text"
                    value={settings.order_workflow.order_number_prefix}
                    onChange={(e) => updateDomainField("order_workflow", "order_number_prefix", e.target.value)}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-medium outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Unpaid Cancel Timer (Minutes)</label>
                  <input
                    type="number"
                    value={settings.order_workflow.unpaid_cancel_minutes}
                    onChange={(e) => updateDomainField("order_workflow", "unpaid_cancel_minutes", Number(e.target.value))}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Min Order USDT</label>
                  <input
                    type="number"
                    value={settings.order_workflow.min_order_amount_usdt}
                    onChange={(e) => updateDomainField("order_workflow", "min_order_amount_usdt", Number(e.target.value))}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Max Order USDT</label>
                  <input
                    type="number"
                    value={settings.order_workflow.max_order_amount_usdt}
                    onChange={(e) => updateDomainField("order_workflow", "max_order_amount_usdt", Number(e.target.value))}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard
            title="Commercial Invoice Header"
            description="Legal tax registration, invoice numbering sequence, and escrow disclaimers."
            icon={FileText}
          >
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={settings.invoice.invoice_prefix}
                  onChange={(e) => updateDomainField("invoice", "invoice_prefix", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Tax / Registration No.</label>
                <input
                  type="text"
                  value={settings.invoice.tax_registration_no}
                  onChange={(e) => updateDomainField("invoice", "tax_registration_no", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Invoice Terms & Escrow Note</label>
                <textarea
                  rows={2}
                  value={settings.invoice.terms_note}
                  onChange={(e) => updateDomainField("invoice", "terms_note", e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors text-xs resize-none"
                />
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ─── TAB 5: Email & Notifications ─── */}
      {activeTab === "email_notifications" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminCard
            title="Transactional Email Subjects"
            description="Configure subject lines for customer lifecycle and procurement updates."
            icon={Mail}
          >
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Order Confirmation Subject</label>
                <input
                  type="text"
                  value={settings.email_templates.order_confirmation_subject}
                  onChange={(e) => updateDomainField("email_templates", "order_confirmation_subject", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Payment Verified Subject</label>
                <input
                  type="text"
                  value={settings.email_templates.payment_received_subject}
                  onChange={(e) => updateDomainField("email_templates", "payment_received_subject", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Air Cargo Dispatched Subject</label>
                <input
                  type="text"
                  value={settings.email_templates.shipping_dispatched_subject}
                  onChange={(e) => updateDomainField("email_templates", "shipping_dispatched_subject", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard
            title="Staff Alerts & Automated Triggers"
            description="Internal team notifications for inventory, payments, and new order events."
            icon={Bell}
          >
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Staff Alert Recipient Email</label>
                <input
                  type="email"
                  value={settings.notifications.alert_recipient_email}
                  onChange={(e) => updateDomainField("notifications", "alert_recipient_email", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.notify_on_new_order}
                    onChange={(e) => updateDomainField("notifications", "notify_on_new_order", e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Alert staff on every new paid order</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.notify_on_low_stock}
                    onChange={(e) => updateDomainField("notifications", "notify_on_low_stock", e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Alert on low factory stock (&lt; 5 units)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.notify_on_payment_failed}
                    onChange={(e) => updateDomainField("notifications", "notify_on_payment_failed", e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Alert on crypto gateway signature failure</span>
                </label>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ─── TAB 6: Binance Pay API Gateway (Restricted) ─── */}
      {activeTab === "binance_pay" && (
        <div className="max-w-3xl">
          <AdminCard
            title="Binance Pay Merchant API Credentials"
            description="Zero-fee USDT escrow gateway settlement for customer checkouts."
            icon={Coins}
            badge={!isSuperAdmin ? <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">View Only</span> : undefined}
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>0% Payment Processing Fee actively applied for all customer checkouts.</span>
                </div>
                <span className="font-semibold font-mono text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Merchant ID *</label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={settings.binance_pay.merchant_id}
                    onChange={(e) => updateDomainField("binance_pay", "merchant_id", e.target.value)}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Environment</label>
                  <select
                    disabled={!isSuperAdmin}
                    value={settings.binance_pay.environment}
                    onChange={(e) => updateDomainField("binance_pay", "environment", e.target.value as "live" | "sandbox")}
                    className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors disabled:opacity-60"
                  >
                    <option value="live">Live Production (mainnet)</option>
                    <option value="sandbox">Sandbox Testnet</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Binance API Key *</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={settings.binance_pay.api_key}
                  onChange={(e) => updateDomainField("binance_pay", "api_key", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-slate-700 dark:text-slate-300">Binance API Secret (Encrypted) *</label>
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSecretKey ? "Hide" : "Reveal"}</span>
                    </button>
                  )}
                </div>
                <input
                  type={showSecretKey ? "text" : "password"}
                  disabled={!isSuperAdmin}
                  value={settings.binance_pay.api_secret}
                  onChange={(e) => updateDomainField("binance_pay", "api_secret", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Webhook HMAC Secret *</label>
                <input
                  type={showSecretKey ? "text" : "password"}
                  disabled={!isSuperAdmin}
                  value={settings.binance_pay.webhook_secret}
                  onChange={(e) => updateDomainField("binance_pay", "webhook_secret", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors disabled:opacity-60"
                />
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ─── TAB 7: SEO & Analytics ─── */}
      {activeTab === "seo_analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminCard
            title="Global SEO Metadata"
            description="Search engine indexing tags, crawler robots rules, and social preview assets."
            icon={Search}
          >
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Default Meta Title</label>
                <input
                  type="text"
                  value={settings.seo.default_meta_title}
                  onChange={(e) => updateDomainField("seo", "default_meta_title", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Default Meta Description</label>
                <textarea
                  rows={3}
                  value={settings.seo.default_meta_description}
                  onChange={(e) => updateDomainField("seo", "default_meta_description", e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Robots.txt Directives</label>
                <textarea
                  rows={3}
                  value={settings.seo.robots_txt}
                  onChange={(e) => updateDomainField("seo", "robots_txt", e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px] outline-none focus:border-slate-900 dark:focus:border-white transition-colors resize-none"
                />
              </div>

              <AdminImageUpload
                label="Social Share & OpenGraph Banner (og:image)"
                aspectRatioTip="Recommended: 1200×630px JPG/PNG"
                helperText="Upload default social link preview card image"
                value={settings.seo.og_image_url}
                onChange={(url) => updateDomainField("seo", "og_image_url", url)}
                bucket={settings.storage.banners_bucket || "products"}
                folder="seo"
                maxSizeMB={settings.storage.max_image_mb || 20}
                placeholder="https://... or /og-banner.jpg"
                previewShape="rectangle"
              />
            </div>
          </AdminCard>

          <AdminCard
            title="Analytics & Tracking Pixels"
            description="Tracking IDs for conversion measurement and ad channel attribution."
            icon={BarChart}
          >
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Google Analytics 4 (GA4) ID</label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.analytics.google_analytics_id}
                  onChange={(e) => updateDomainField("analytics", "google_analytics_id", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Facebook Pixel ID</label>
                <input
                  type="text"
                  placeholder="123456789012345"
                  value={settings.analytics.facebook_pixel_id}
                  onChange={(e) => updateDomainField("analytics", "facebook_pixel_id", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">TikTok Pixel ID</label>
                <input
                  type="text"
                  placeholder="CXXXXXXXXXXXXXX"
                  value={settings.analytics.tiktok_pixel_id}
                  onChange={(e) => updateDomainField("analytics", "tiktok_pixel_id", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ─── TAB 8: Security, Maintenance & Disaster Recovery ─── */}
      {activeTab === "security_backups" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminCard
            title="Storefront Maintenance Gate"
            description="Temporarily pause public storefront operations during scheduled platform upgrades."
            icon={AlertTriangle}
          >
            <div className="space-y-4 text-xs">
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-medium text-slate-900 dark:text-white block">Maintenance Mode</span>
                  <span className="text-[11px] text-slate-500">Lock storefront with scheduled upgrade screen</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenance.enabled}
                  onChange={(e) => updateDomainField("maintenance", "enabled", e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                />
              </label>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Maintenance Notice Heading</label>
                <input
                  type="text"
                  value={settings.maintenance.heading}
                  onChange={(e) => updateDomainField("maintenance", "heading", e.target.value)}
                  className="h-9 w-full px-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">Customer Message</label>
                <textarea
                  rows={2}
                  value={settings.maintenance.message}
                  onChange={(e) => updateDomainField("maintenance", "message", e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors text-xs resize-none"
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard
            title="Disaster Recovery & System Snapshots"
            description="Download encrypted configurations or restore factory baseline settings."
            icon={Download}
          >
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Full System Export
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Downloads a complete encrypted JSON dump of all products, Chinese supplier links, verified coupons, active orders, and system settings.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 py-2 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Complete Backup JSON</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 block">Reset to Factory Defaults</span>
                  <span className="text-[10px] text-slate-500">Restore factory baseline configuration</span>
                </div>
                <button
                  type="button"
                  onClick={() => setResetConfirmDomain("store_info")}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* ── 4. Confirmation Dialog for Reset ── */}
      {resetConfirmDomain && (
        <ConfirmDialog
          isOpen={true}
          title="Reset to Factory Defaults?"
          description={`Are you sure you want to reset the configuration for ${resetConfirmDomain} back to factory defaults? This action cannot be undone.`}
          confirmLabel="Reset to Defaults"
          variant="danger"
          onConfirm={handleConfirmReset}
          onClose={() => setResetConfirmDomain(null)}
        />
      )}
    </div>
  );
}
