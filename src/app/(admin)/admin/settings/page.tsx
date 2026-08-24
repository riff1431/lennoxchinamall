"use client";

import React, { useState } from "react";
import {
  Store,
  MapPin,
  Coins,
  ToggleLeft,
  ToggleRight,
  Save,
  RotateCcw,
  Building,
  Mail,
  Phone,
  Layers,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MOCK_STORE_SETTINGS, StoreSettingsData } from "@/lib/mockData";
import { getStoreSettings, updateStoreSettings } from "@/app/actions/admin-settings";

export default function AdminStoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettingsData>(MOCK_STORE_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadSettings = async () => {
    const res = await getStoreSettings();
    if (res.success && res.settings) {
      setSettings((prev) => ({
        ...prev,
        storeName: res.settings.siteName || prev.storeName,
        supportEmail: res.settings.supportEmail || prev.supportEmail,
        defaultCurrency: res.settings.defaultCurrency || prev.defaultCurrency,
        freeAirShippingThreshold: res.settings.freeShippingThreshold || prev.freeAirShippingThreshold,
      }));
    }
  };

  React.useEffect(() => {
    loadSettings();
  }, []);

  // Form field updater helper
  const updateField = <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Save
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.set("site_name", settings.storeName);
    formData.set("support_email", settings.supportEmail);
    formData.set("currency", settings.defaultCurrency);
    formData.set("air_lead_days", "5");
    formData.set("free_shipping_threshold", String(settings.freeAirShippingThreshold));
    formData.set("binance_pay_enabled", "true");

    const res = await updateStoreSettings(formData);
    setIsSaving(false);
    showToast(res.message || "Store settings and factory hub configurations saved successfully!");
  };

  // Handle Reset Defaults
  const handleResetDefaults = () => {
    setSettings(MOCK_STORE_SETTINGS);
    showToast("Settings restored to factory defaults.");
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Store & Logistics Settings"
        subtitle="Configure China procurement hubs, Binance Pay USDT rate conversions, and air shipping delivery thresholds."
        badge={{ text: "GLOBAL CONFIG", variant: "red" }}
        breadcrumbs={[{ label: "Store Settings" }]}
        actions={[
          {
            label: "Reset to Defaults",
            onClick: () => setShowResetConfirm(true),
            icon: RotateCcw,
            variant: "secondary",
          },
          {
            label: isSaving ? "Saving..." : "Save Settings",
            onClick: () => handleSave(),
            icon: Save,
            variant: "primary",
            disabled: isSaving,
          },
        ]}
      />

      <form onSubmit={handleSave} className="space-y-8">
        {/* ── Section 1: Store Identity ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FF1028]/10 text-[#FF1028] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Storefront Identity & Brand Metadata</h3>
              <p className="text-xs text-slate-400">Public store name, customer support touchpoints, and SEO tagline</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Store Name *</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => updateField("storeName", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Support Contact Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={settings.supportEmail}
                  onChange={(e) => updateField("supportEmail", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:border-[#FF1028] font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block">Store Tagline / Slogan</label>
              <input
                type="text"
                value={settings.storeTagline}
                onChange={(e) => updateField("storeTagline", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block">Procurement Support Phone / WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => updateField("supportPhone", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:border-[#FF1028] font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Warehouse Addresses ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">China Logistics & Sourcing Hubs</h3>
              <p className="text-xs text-slate-400">
                Primary receiving and QC sorting facilities in Shenzhen (drone lab) and Guangzhou (electronics)
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF1028]" />
                  <span>Shenzhen High-Tech Hub Address (Drones & Precision Tech)</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Active QC Lab
                </span>
              </div>
              <textarea
                rows={2}
                value={settings.shenzhenHubAddress}
                onChange={(e) => updateField("shenzhenHubAddress", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-3.5 outline-none focus:border-[#FF1028] font-mono leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Guangzhou Baiyun Logistics Hub Address (Wholesale Air Cargo)</span>
                </label>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  YunExpress Sort Facility
                </span>
              </div>
              <textarea
                rows={2}
                value={settings.guangzhouHubAddress}
                onChange={(e) => updateField("guangzhouHubAddress", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-3.5 outline-none focus:border-[#FF1028] font-mono leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: Commerce & Pricing Settings ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Commerce, Currency & Air Shipping Rules</h3>
              <p className="text-xs text-slate-400">
                Binance Pay USDT fixed settlement rules, free priority air express tiers, and order formatting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Default Settlement Currency</label>
              <input
                type="text"
                disabled
                value={settings.defaultCurrency}
                className="w-full bg-slate-950/60 border border-slate-800 text-slate-400 text-xs font-mono font-bold rounded-xl px-3.5 py-2.5 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">USDT to USD Conversion Rate</label>
              <input
                type="number"
                step="0.01"
                value={settings.usdtFixedRateUSD}
                onChange={(e) => updateField("usdtFixedRateUSD", parseFloat(e.target.value) || 1.0)}
                className="w-full bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Order Prefix String</label>
              <input
                type="text"
                value={settings.orderPrefix}
                onChange={(e) => updateField("orderPrefix", e.target.value.toUpperCase())}
                placeholder="LCM"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Free Air Cargo Threshold ($ USDT)
              </label>
              <input
                type="number"
                step="1"
                value={settings.freeAirShippingThreshold}
                onChange={(e) => updateField("freeAirShippingThreshold", parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
              />
              <span className="text-[10px] text-slate-500 block">Free YunExpress Air Cargo above this spend</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Standard Air Shipping Cost ($ USDT)
              </label>
              <input
                type="number"
                step="0.5"
                value={settings.standardAirShippingCost}
                onChange={(e) => updateField("standardAirShippingCost", parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
              />
              <span className="text-[10px] text-slate-500 block">Applied when order total is below threshold</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Min Order Spend ($ USDT)
              </label>
              <input
                type="number"
                step="1"
                value={settings.minOrderAmountUSDT}
                onChange={(e) => updateField("minOrderAmountUSDT", parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
              />
              <span className="text-[10px] text-slate-500 block">Minimum threshold for Binance Pay checkout</span>
            </div>
          </div>
        </div>

        {/* ── Section 4: Feature Flags & Operational Toggles ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">System Feature Flags & Security Modes</h3>
              <p className="text-xs text-slate-400">Store-wide operational controls, maintenance switches, and checkout gates</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5 max-w-xl">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Storewide Maintenance Mode</span>
                  {settings.maintenanceMode && (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  When enabled, non-admin visitors will see a maintenance screen. Admin dashboard remains fully accessible.
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateField("maintenanceMode", !settings.maintenanceMode)}
                className="cursor-pointer"
              >
                {settings.maintenanceMode ? (
                  <ToggleRight className="w-9 h-9 text-[#FF1028]" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-600 hover:text-slate-400" />
                )}
              </button>
            </div>

            {/* Allow Guest Checkout Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5 max-w-xl">
                <div className="text-xs font-bold text-white">Allow Anonymous Guest USDT Checkout</div>
                <p className="text-[11px] text-slate-400">
                  When disabled, buyers must create an account or verify email before Binance Pay QR code generation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateField("allowGuestCheckout", !settings.allowGuestCheckout)}
                className="cursor-pointer"
              >
                {settings.allowGuestCheckout ? (
                  <ToggleRight className="w-9 h-9 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-600 hover:text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Submit Row ── */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            Discard Changes
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] disabled:opacity-50 transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Settings..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>

      {/* ── Reset Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetDefaults}
        title="Reset Store Settings to Default?"
        description="Are you sure you want to restore all settings, warehouse addresses, and shipping thresholds to their initial default values?"
        confirmLabel="Reset Defaults"
        variant="warning"
      />

      {/* ── Toast Notification Bar ── */}
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
