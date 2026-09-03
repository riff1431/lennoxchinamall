"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AllStoreSettings, BrandingSettings } from "@/types/settings";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-constants";
import { safeLocalStorage } from "@/utils/safeStorage";

interface SettingsState {
  settings: AllStoreSettings;
  isLoaded: boolean;
  setSettings: (settings: AllStoreSettings) => void;
  updateBranding: (branding: Partial<BrandingSettings>) => void;
  updateDomain: <D extends keyof AllStoreSettings, F extends keyof AllStoreSettings[D]>(
    domain: D,
    field: F,
    value: AllStoreSettings[D][F]
  ) => void;
  syncFromServer: (publicSettings: Partial<AllStoreSettings>) => void;
  getPrimaryLogo: () => string;
  getFavicon: () => string;
  getDarkLogo: () => string;
  getStoreName: () => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_STORE_SETTINGS,
      isLoaded: true,

      setSettings: (newSettings: AllStoreSettings) => {
        set({ settings: { ...DEFAULT_STORE_SETTINGS, ...newSettings } });
      },

      updateBranding: (brandingUpdates: Partial<BrandingSettings>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            branding: {
              ...state.settings.branding,
              ...brandingUpdates,
            },
          },
        }));
      },

      updateDomain: (domain, field, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [domain]: {
              ...state.settings[domain],
              [field]: value,
            },
          },
        }));
      },

      syncFromServer: (publicSettings: Partial<AllStoreSettings>) => {
        set((state) => {
          const merged: AllStoreSettings = { ...state.settings };
          Object.keys(publicSettings).forEach((key) => {
            const domainKey = key as keyof AllStoreSettings;
            if (publicSettings[domainKey]) {
              (merged as any)[domainKey] = {
                ...(merged as any)[domainKey],
                ...(publicSettings as any)[domainKey],
              };
            }
          });
          return { settings: merged };
        });
      },

      getPrimaryLogo: () => {
        const { settings } = get();
        return settings?.branding?.primary_logo_url || DEFAULT_STORE_SETTINGS.branding.primary_logo_url;
      },

      getFavicon: () => {
        const { settings } = get();
        return settings?.branding?.favicon_url || DEFAULT_STORE_SETTINGS.branding.favicon_url;
      },

      getDarkLogo: () => {
        const { settings } = get();
        return settings?.branding?.dark_logo_url || settings?.branding?.primary_logo_url || DEFAULT_STORE_SETTINGS.branding.primary_logo_url;
      },

      getStoreName: () => {
        const { settings } = get();
        return settings?.store_info?.store_name || DEFAULT_STORE_SETTINGS.store_info.store_name;
      },
    }),
    {
      name: "lennox_chinamall_store_settings_v1",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
