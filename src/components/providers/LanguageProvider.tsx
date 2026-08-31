"use client";

import React, { useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";

interface LanguageProviderProps {
  defaultLocale?: string;
  children: React.ReactNode;
}

export function LanguageProvider({
  defaultLocale = "es",
  children,
}: LanguageProviderProps) {
  const initDefaultLocale = useLanguageStore((state) => state.initDefaultLocale);

  useEffect(() => {
    initDefaultLocale(defaultLocale);
  }, [defaultLocale, initDefaultLocale]);

  return <>{children}</>;
}
