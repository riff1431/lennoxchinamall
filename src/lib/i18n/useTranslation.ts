"use client";

import { useLanguageStore } from "@/store/useLanguageStore";

export function useTranslation() {
  const locale = useLanguageStore((state) => state.locale);
  const setLocale = useLanguageStore((state) => state.setLocale);
  const toggleLocale = useLanguageStore((state) => state.toggleLocale);
  const t = useLanguageStore((state) => state.t);

  return {
    locale,
    setLocale,
    toggleLocale,
    t,
    isSpanish: locale === "es",
    isEnglish: locale === "en",
  };
}
