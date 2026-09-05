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
import { useSettingsStore } from "@/store/useSettingsStore";

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


  // Save active tab bundle
  const handleSaveActiveTab = async () => {
    setIsSaving(true);
    const saveResults: { success: boolean; message?: string; error?: string }[] = [];

    if (activeTab === "store_info") {
      saveResults.push(await updateSettingsDomain("store_info", settings.store_info));
      saveResults.push(await updateSettingsDomain("tax_customs", settings.tax_customs));
    } else if (activeTab === "branding") {
      saveResults.push(await updateSettingsDomain("branding", settings.branding));
      saveResults.push(await updateSettingsDomain("storage", settings.storage));
    } else if (activeTab === "currencies_shipping") {
      saveResults.push(await updateSettingsDomain("currencies", settings.currencies));
      saveResults.push(await updateSettingsDomain("shipping_zones", settings.shipping_zones));
      saveResults.push(await updateSettingsDomain("localization", settings.localization));
    } else if (activeTab === "orders_invoice") {
      saveResults.push(await updateSettingsDomain("order_workflow", settings.order_workflow));
      saveResults.push(await updateSettingsDomain("invoice", settings.invoice));
    } else if (activeTab === "email_notifications") {
      saveResults.push(await updateSettingsDomain("email_templates", settings.email_templates));
      saveResults.push(await updateSettingsDomain("notifications", settings.notifications));
    } else if (activeTab === "binance_pay") {
      saveResults.push(await updateSettingsDomain("binance_pay", settings.binance_pay));
    } else if (activeTab === "seo_analytics") {
      saveResults.push(await updateSettingsDomain("seo", settings.seo));
      saveResults.push(await updateSettingsDomain("analytics", settings.analytics));
    } else if (activeTab === "security_backups") {
      saveResults.push(await updateSettingsDomain("security", settings.security));
      saveResults.push(await updateSettingsDomain("maintenance", settings.maintenance));
      saveResults.push(await updateSettingsDomain("backups", settings.backups));
    }

    const failed = saveResults.find((r) => !r.success);
    if (failed) {
      showToast(failed.error || "Failed to persist settings. Please check credentials.");
    } else {
      // Ensure store is persisted with all latest values
      useSettingsStore.getState().setSettings(settings);
      showToast("All changes in this section applied across storefront!");
    }
    setIsSaving(false);
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
      {/* ── 1. Top Executive Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2F65F6] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ENTERPRISE CONFIG OS
            </span>
            <span className="text-xs text-[#2F65F6] font-bold flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Role: {userRole.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-7 h-7 text-[#2F65F6]" />
            <span>Storefront &amp; System Settings</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Centrally manage China procurement hubs, Binance Pay gateway API, zero-fee USDT conversions, air cargo zones, and storefront branding.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadData}
            title="Refresh Live Database Settings"
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {isSuperAdmin && (
            <button
              onClick={handleDownloadBackup}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Export System Backup (JSON)</span>
            </button>
          )}

          <button
            onClick={handleSaveActiveTab}
            disabled={isSaving}
            className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-blue-500/25 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold border border-emerald-500 flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 no-scrollbar">
        {[
          { key: "store_info", label: "Store & Logistics Hubs", icon: Building },
          { key: "branding", label: "Branding & Media", icon: ImageIcon },
          { key: "currencies_shipping", label: "Currencies & Shipping", icon: Coins },
          { key: "orders_invoice", label: "Orders & Invoices", icon: FileText },
          { key: "email_notifications", label: "Emails & Alerts", icon: Bell },
          { key: "binance_pay", label: "Binance Pay API", icon: CreditCard },
          { key: "seo_analytics", label: "SEO & Analytics", icon: Search },
          { key: "security_backups", label: "Security & Disaster Recovery", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[#2F65F6] text-white shadow-xs"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. Tab Contents ── */}

      {/* ─── TAB 1: Store Information & Logistics Hubs ─── */}
      {activeTab === "store_info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1.1: Business & Store Information */}
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#2F65F6]" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Store Identity</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">domain: store_info</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Public Store Name *</label>
                <input
                  type="text"
                  value={settings.store_info.store_name}
                  onChange={(e) => updateDomainField("store_info", "store_name", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Legal Entity Name</label>
                <input
                  type="text"
                  value={settings.store_info.legal_entity}
                  onChange={(e) => updateDomainField("store_info", "legal_entity", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Hero Tagline / Pitch</label>
                <input
                  type="text"
                  value={settings.store_info.tagline}
                  onChange={(e) => updateDomainField("store_info", "tagline", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Support Desk Email *</label>
                  <input
                    type="email"
                    value={settings.store_info.support_email}
                    onChange={(e) => updateDomainField("store_info", "support_email", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Business Phone</label>
                  <input
                    type="text"
                    value={settings.store_info.business_phone}
                    onChange={(e) => updateDomainField("store_info", "business_phone", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 1.2: Chinese Procurement Hubs */}
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">China Operations Hubs</h3>
              </div>
              <span className="text-[10px] text-amber-400 font-bold font-mono">Shenzhen &amp; Guangzhou</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Shenzhen Drone &amp; Electronics Hub</label>
                <textarea
                  rows={2}
                  value={settings.store_info.shenzhen_hub}
                  onChange={(e) => updateDomainField("store_info", "shenzhen_hub", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Guangzhou Logistics &amp; QC Center</label>
                <textarea
                  rows={2}
                  value={settings.store_info.guangzhou_hub}
                  onChange={(e) => updateDomainField("store_info", "guangzhou_hub", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Operating Hours</label>
                  <input
                    type="text"
                    value={settings.store_info.business_hours}
                    onChange={(e) => updateDomainField("store_info", "business_hours", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Timezone</label>
                  <input
                    type="text"
                    value={settings.store_info.timezone}
                    onChange={(e) => updateDomainField("store_info", "timezone", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Branding, Colors & Storage ─── */}
      {activeTab === "branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#2F65F6]" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Logos &amp; Visual Identity</h3>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              <AdminImageUpload
                label="Primary Storefront Logo"
                aspectRatioTip="Recommended: 240×60px transparent SVG or PNG"
                helperText="Drag & drop your store brand logo (PNG, SVG, WebP, JPG)"
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
                aspectRatioTip="Recommended: 32×32px or 64×64px .ico / .png / .svg"
                helperText="Drag & drop favicon or square icon file"
                value={settings.branding.favicon_url}
                onChange={(url) => updateDomainField("branding", "favicon_url", url)}
                bucket={settings.storage.banners_bucket || "products"}
                folder="branding"
                maxSizeMB={settings.storage.max_image_mb || 20}
                placeholder="/favicon.ico or https://..."
                previewShape="square"
              />

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Primary Red</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.branding.primary_color}
                      onChange={(e) => updateDomainField("branding", "primary_color", e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.branding.primary_color}
                      onChange={(e) => updateDomainField("branding", "primary_color", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Secondary Navy</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.branding.secondary_color}
                      onChange={(e) => updateDomainField("branding", "secondary_color", e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.branding.secondary_color}
                      onChange={(e) => updateDomainField("branding", "secondary_color", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Accent Green</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.branding.accent_color}
                      onChange={(e) => updateDomainField("branding", "accent_color", e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.branding.accent_color}
                      onChange={(e) => updateDomainField("branding", "accent_color", e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Supabase Storage &amp; Asset Limits</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Products Media Bucket</label>
                  <input
                    type="text"
                    value={settings.storage.products_bucket}
                    onChange={(e) => updateDomainField("storage", "products_bucket", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Banners Bucket</label>
                  <input
                    type="text"
                    value={settings.storage.banners_bucket}
                    onChange={(e) => updateDomainField("storage", "banners_bucket", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Max Image Size (MB)</label>
                  <input
                    type="number"
                    value={settings.storage.max_image_mb}
                    onChange={(e) => updateDomainField("storage", "max_image_mb", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Max Video Size (MB)</label>
                  <input
                    type="number"
                    value={settings.storage.max_video_mb}
                    onChange={(e) => updateDomainField("storage", "max_video_mb", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Currencies, Shipping & Localization ─── */}
      {activeTab === "currencies_shipping" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Exchange Rates &amp; Multi-Currency</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Base Settlement Currency</span>
                  <span className="text-[11px] text-emerald-400/80">Binance Pay USDT Escrow Default</span>
                </div>
                <span className="text-base font-black font-mono bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-lg">
                  {settings.currencies.base_currency}
                </span>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Secondary Currencies (vs 1 USDT)</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Object.entries(settings.currencies.rates || {}).map(([curr, rate]) => (
                    <div key={curr} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{curr}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={rate}
                        onChange={(e) => {
                          const newRates = { ...settings.currencies.rates, [curr]: Number(e.target.value) };
                          updateDomainField("currencies", "rates", newRates);
                        }}
                        className="w-16 text-right bg-transparent font-mono text-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Air Express Freight Rules</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Free Air Shipping Threshold ($ USDT)</label>
                  <input
                    type="number"
                    value={settings.shipping_zones.free_shipping_threshold}
                    onChange={(e) => updateDomainField("shipping_zones", "free_shipping_threshold", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Standard Air Freight Cost</label>
                  <input
                    type="number"
                    value={settings.shipping_zones.standard_air_cost}
                    onChange={(e) => updateDomainField("shipping_zones", "standard_air_cost", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Default Logistics Air Carrier</label>
                <input
                  type="text"
                  value={settings.shipping_zones.default_carrier}
                  onChange={(e) => updateDomainField("shipping_zones", "default_carrier", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Target Air Delivery Lead Time (Days)</label>
                <input
                  type="number"
                  value={settings.shipping_zones.air_express_lead_days}
                  onChange={(e) => updateDomainField("shipping_zones", "air_express_lead_days", Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Languages & Localization Card (Full Width in Grid) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-[#2F65F6]" />
                <div>
                  <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">
                    Storefront Languages &amp; Dynamic Localization
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Define the default store language for new visitors and manage active bilingual configurations (English &amp; Spanish).
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Bilingual Engine Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Default Language Selector */}
              <div className="space-y-3">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Default Storefront Language (New Visitors)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* English Card */}
                  <button
                    type="button"
                    onClick={() => updateDomainField("localization", "default_locale", "en")}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      (settings.localization.default_locale === "en" || settings.localization.default_locale === "en-US")
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-[#2F65F6] ring-1 ring-[#2F65F6] text-[#00143D] dark:text-white shadow-xs"
                        : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🇺🇸</span>
                      {(settings.localization.default_locale === "en" || settings.localization.default_locale === "en-US") && (
                        <CheckCircle2 className="w-4 h-4 text-[#2F65F6]" />
                      )}
                    </div>
                    <div className="mt-3">
                      <span className="font-heading font-black text-sm block">English (EN)</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Default Global Sourcing</span>
                    </div>
                  </button>

                  {/* Spanish Card */}
                  <button
                    type="button"
                    onClick={() => updateDomainField("localization", "default_locale", "es")}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      (settings.localization.default_locale === "es" || settings.localization.default_locale === "es-ES")
                        ? "bg-red-50/70 dark:bg-red-950/40 border-[#FF1028] ring-1 ring-[#FF1028] text-[#00143D] dark:text-white shadow-xs"
                        : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🇪🇸</span>
                      {(settings.localization.default_locale === "es" || settings.localization.default_locale === "es-ES") && (
                        <CheckCircle2 className="w-4 h-4 text-[#FF1028]" />
                      )}
                    </div>
                    <div className="mt-3">
                      <span className="font-heading font-black text-sm block">Español (ES)</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Spanish / América Latina</span>
                    </div>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  When a customer visits Lennox ChinaMall without prior language preferences, the storefront will automatically load in this default language.
                </p>
              </div>

              {/* Format & Units */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Date Format</label>
                    <input
                      type="text"
                      value={settings.localization.date_format}
                      onChange={(e) => updateDomainField("localization", "date_format", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Time Format</label>
                    <select
                      value={settings.localization.time_format}
                      onChange={(e) => updateDomainField("localization", "time_format", e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="24h">24 Hours (Military/Export)</option>
                      <option value="12h">12 Hours (AM/PM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Weight Unit</label>
                    <select
                      value={settings.localization.weight_unit}
                      onChange={(e) => updateDomainField("localization", "weight_unit", e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="kg">Kilograms (kg - International)</option>
                      <option value="lbs">Pounds (lbs)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Dimension Unit</label>
                    <select
                      value={settings.localization.dimension_unit}
                      onChange={(e) => updateDomainField("localization", "dimension_unit", e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="in">Inches (in)</option>
                    </select>
                  </div>
                </div>

                {/* Active Supported Languages pill info */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Active Supported Languages:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">
                      English (en)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">
                      Español (es)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: Orders & Invoices ─── */}
      {activeTab === "orders_invoice" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2F65F6]" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Order Workflow Rules</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Order Number Prefix</label>
                  <input
                    type="text"
                    value={settings.order_workflow.order_number_prefix}
                    onChange={(e) => updateDomainField("order_workflow", "order_number_prefix", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Unpaid Cancel Timer (Minutes)</label>
                  <input
                    type="number"
                    value={settings.order_workflow.unpaid_cancel_minutes}
                    onChange={(e) => updateDomainField("order_workflow", "unpaid_cancel_minutes", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Min Order USDT</label>
                  <input
                    type="number"
                    value={settings.order_workflow.min_order_amount_usdt}
                    onChange={(e) => updateDomainField("order_workflow", "min_order_amount_usdt", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Max Order USDT</label>
                  <input
                    type="number"
                    value={settings.order_workflow.max_order_amount_usdt}
                    onChange={(e) => updateDomainField("order_workflow", "max_order_amount_usdt", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Commercial Invoice Header</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={settings.invoice.invoice_prefix}
                  onChange={(e) => updateDomainField("invoice", "invoice_prefix", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Tax / Registration No.</label>
                <input
                  type="text"
                  value={settings.invoice.tax_registration_no}
                  onChange={(e) => updateDomainField("invoice", "tax_registration_no", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Invoice Terms &amp; Escrow Note</label>
                <textarea
                  rows={2}
                  value={settings.invoice.terms_note}
                  onChange={(e) => updateDomainField("invoice", "terms_note", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: Email & Notifications ─── */}
      {activeTab === "email_notifications" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Transactional Email Subjects</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Order Confirmation Subject</label>
                <input
                  type="text"
                  value={settings.email_templates.order_confirmation_subject}
                  onChange={(e) => updateDomainField("email_templates", "order_confirmation_subject", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Payment Verified Subject</label>
                <input
                  type="text"
                  value={settings.email_templates.payment_received_subject}
                  onChange={(e) => updateDomainField("email_templates", "payment_received_subject", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Air Cargo Dispatched Subject</label>
                <input
                  type="text"
                  value={settings.email_templates.shipping_dispatched_subject}
                  onChange={(e) => updateDomainField("email_templates", "shipping_dispatched_subject", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Staff Alerts &amp; Triggers</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Staff Alert Recipient Email</label>
                <input
                  type="email"
                  value={settings.notifications.alert_recipient_email}
                  onChange={(e) => updateDomainField("notifications", "alert_recipient_email", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.notify_on_new_order}
                    onChange={(e) => updateDomainField("notifications", "notify_on_new_order", e.target.checked)}
                    className="w-4 h-4 rounded text-[#2F65F6]"
                  />
                  <span className="font-bold text-slate-200">Alert staff on every new paid order</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.notify_on_low_stock}
                    onChange={(e) => updateDomainField("notifications", "notify_on_low_stock", e.target.checked)}
                    className="w-4 h-4 rounded text-[#2F65F6]"
                  />
                  <span className="font-bold text-slate-200">Alert on low factory stock (&lt; 5 units)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.notify_on_payment_failed}
                    onChange={(e) => updateDomainField("notifications", "notify_on_payment_failed", e.target.checked)}
                    className="w-4 h-4 rounded text-[#2F65F6]"
                  />
                  <span className="font-bold text-slate-200">Alert on crypto gateway signature failure</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: Binance Pay API Gateway (Restricted) ─── */}
      {activeTab === "binance_pay" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-[#10B981]" />
              <div>
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Binance Pay Merchant API Credentials</h3>
                <span className="text-[11px] text-slate-400">Zero-Fee USDT Escrow Settlement Gateway</span>
              </div>
            </div>
            {!isSuperAdmin && (
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                View Only (Super Admin Restricted)
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>0% Payment Processing Fee actively applied for all customer checkouts.</span>
            </div>
            <span className="font-bold font-mono text-[11px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
              Active
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Merchant ID *</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={settings.binance_pay.merchant_id}
                  onChange={(e) => updateDomainField("binance_pay", "merchant_id", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Environment</label>
                <select
                  disabled={!isSuperAdmin}
                  value={settings.binance_pay.environment}
                  onChange={(e) => updateDomainField("binance_pay", "environment", e.target.value as "live" | "sandbox")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold disabled:opacity-60"
                >
                  <option value="live">Live Production (mainnet)</option>
                  <option value="sandbox">Sandbox Testnet</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Binance API Key *</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={settings.binance_pay.api_key}
                onChange={(e) => updateDomainField("binance_pay", "api_key", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300">Binance API Secret (Encrypted) *</label>
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Webhook HMAC Secret *</label>
              <input
                type={showSecretKey ? "text" : "password"}
                disabled={!isSuperAdmin}
                value={settings.binance_pay.webhook_secret}
                onChange={(e) => updateDomainField("binance_pay", "webhook_secret", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 7: SEO & Analytics ─── */}
      {activeTab === "seo_analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Global SEO Metadata</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Default Meta Title</label>
                <input
                  type="text"
                  value={settings.seo.default_meta_title}
                  onChange={(e) => updateDomainField("seo", "default_meta_title", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Default Meta Description</label>
                <textarea
                  rows={3}
                  value={settings.seo.default_meta_description}
                  onChange={(e) => updateDomainField("seo", "default_meta_description", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Robots.txt Directives</label>
                <textarea
                  rows={3}
                  value={settings.seo.robots_txt}
                  onChange={(e) => updateDomainField("seo", "robots_txt", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <AdminImageUpload
                label="Social Share & OpenGraph Banner (og:image)"
                aspectRatioTip="Recommended: 1200×630px JPG/PNG"
                helperText="Drag & drop default social link preview card image"
                value={settings.seo.og_image_url}
                onChange={(url) => updateDomainField("seo", "og_image_url", url)}
                bucket={settings.storage.banners_bucket || "products"}
                folder="seo"
                maxSizeMB={settings.storage.max_image_mb || 20}
                placeholder="https://... or /og-banner.jpg"
                previewShape="rectangle"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-purple-400" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Analytics &amp; Pixels</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Google Analytics 4 (GA4) ID</label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.analytics.google_analytics_id}
                  onChange={(e) => updateDomainField("analytics", "google_analytics_id", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Facebook Pixel ID</label>
                <input
                  type="text"
                  placeholder="123456789012345"
                  value={settings.analytics.facebook_pixel_id}
                  onChange={(e) => updateDomainField("analytics", "facebook_pixel_id", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">TikTok Pixel ID</label>
                <input
                  type="text"
                  placeholder="CXXXXXXXXXXXXXX"
                  value={settings.analytics.tiktok_pixel_id}
                  onChange={(e) => updateDomainField("analytics", "tiktok_pixel_id", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 8: Security, Maintenance & Disaster Recovery ─── */}
      {activeTab === "security_backups" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Storefront Maintenance Gate</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Maintenance Mode</span>
                  <span className="text-[11px] text-slate-400">Lock storefront with scheduled upgrade screen</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenance.enabled}
                  onChange={(e) => updateDomainField("maintenance", "enabled", e.target.checked)}
                  className="w-5 h-5 rounded text-[#2F65F6]"
                />
              </label>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Maintenance Notice Heading</label>
                <input
                  type="text"
                  value={settings.maintenance.heading}
                  onChange={(e) => updateDomainField("maintenance", "heading", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Customer Message</label>
                <textarea
                  rows={2}
                  value={settings.maintenance.message}
                  onChange={(e) => updateDomainField("maintenance", "message", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#10B981]" />
                <h3 className="font-heading font-black text-slate-900 dark:text-white text-base">Disaster Recovery &amp; Backups</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 space-y-3">
                <span className="font-bold text-slate-900 dark:text-white block font-heading">
                  1-Click Full System Export
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Downloads a complete encrypted JSON dump of all products, Chinese supplier links, verified coupons, active orders, and system settings.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Complete Backup JSON</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Reset to Factory Defaults</span>
                  <span className="text-[10px] text-slate-500">Restore factory baseline configuration</span>
                </div>
                <button
                  type="button"
                  onClick={() => setResetConfirmDomain("store_info")}
                  className="text-xs text-red-400 hover:text-red-300 font-bold underline"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
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
