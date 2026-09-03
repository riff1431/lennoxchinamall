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

    // Helper to update or create link tag
    const updateOrCreateLink = (rel: string) => {
      let link: HTMLLinkElement | null = document.querySelector(`link[rel*='${rel}']`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = faviconUrl;

      // Update MIME type if possible
      if (faviconUrl.endsWith(".ico")) {
        link.type = "image/x-icon";
      } else if (faviconUrl.endsWith(".png")) {
        link.type = "image/png";
      } else if (faviconUrl.endsWith(".svg")) {
        link.type = "image/svg+xml";
      } else if (faviconUrl.endsWith(".webp")) {
        link.type = "image/webp";
      }
    };

    updateOrCreateLink("icon");
    updateOrCreateLink("shortcut icon");
    updateOrCreateLink("apple-touch-icon");
  }, [settingsFavicon, initialSettings]);

  return null;
}
