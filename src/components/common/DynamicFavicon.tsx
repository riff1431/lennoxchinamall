"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-constants";
import { AllStoreSettings } from "@/types/settings";

interface DynamicFaviconProps {
  initialSettings?: Partial<AllStoreSettings>;
}

export function DynamicFavicon({ initialSettings }: DynamicFaviconProps = {}) {
  const settingsFavicon = useSettingsStore((s) => s.settings.branding?.favicon_url);
  const syncFromServer = useSettingsStore((s) => s.syncFromServer);

  // Sync initial server settings on mount if provided
  useEffect(() => {
    if (initialSettings) {
      syncFromServer(initialSettings);
    }
  }, [initialSettings, syncFromServer]);

  // Dynamically update document head favicon when changed in settings
  useEffect(() => {
    const faviconUrl =
      settingsFavicon ||
      initialSettings?.branding?.favicon_url ||
      DEFAULT_STORE_SETTINGS.branding.favicon_url;

    if (!faviconUrl || typeof document === "undefined") return;

    // Helper to update or create link tag (removing old link forces browser icon reload)
    const updateOrCreateLink = (rel: string) => {
      const existing = document.querySelectorAll<HTMLLinkElement>(`link[rel='${rel}']`);
      existing.forEach((el) => el.remove());

      const link = document.createElement("link");
      link.rel = rel;
      link.href = faviconUrl;
      if (faviconUrl.includes(".ico")) link.type = "image/x-icon";
      else if (faviconUrl.includes(".png")) link.type = "image/png";
      else if (faviconUrl.includes(".svg")) link.type = "image/svg+xml";
      else if (faviconUrl.includes(".webp")) link.type = "image/webp";
      document.head.appendChild(link);
    };

    updateOrCreateLink("icon");
    updateOrCreateLink("shortcut icon");
    updateOrCreateLink("apple-touch-icon");
  }, [settingsFavicon, initialSettings]);

  return null;
}
