"use client";

import React, { useRef } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { AllStoreSettings } from "@/types/settings";

interface SettingsProviderProps {
  initialSettings?: Partial<AllStoreSettings>;
  children: React.ReactNode;
}

export function SettingsProvider({
  initialSettings,
  children,
}: SettingsProviderProps) {
  const initialized = useRef(false);

  // Synchronously initialize the Zustand store on the first render before components mount
  if (!initialized.current && initialSettings) {
    useSettingsStore.getState().syncFromServer(initialSettings);
    initialized.current = true;
  }

  React.useEffect(() => {
    if (initialSettings) {
      useSettingsStore.getState().syncFromServer(initialSettings);
    }
  }, [initialSettings]);

  return <>{children}</>;
}
