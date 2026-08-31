import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SupportedLocale, TranslationDictionary, getDictionary, DEFAULT_LOCALE, LOCALE_COOKIE_KEY } from "@/lib/i18n";

interface LanguageState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  toggleLocale: () => void;
  initDefaultLocale: (defaultLocale?: string) => void;
  t: TranslationDictionary;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      t: getDictionary(DEFAULT_LOCALE),
      setLocale: (locale: SupportedLocale) => {
        const normalized: SupportedLocale = locale === "es" ? "es" : "en";
        // Update document cookie for SSR consistency
        if (typeof document !== "undefined") {
          document.cookie = `${LOCALE_COOKIE_KEY}=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
          document.documentElement.lang = normalized;
        }
        set({
          locale: normalized,
          t: getDictionary(normalized),
        });
      },
      toggleLocale: () => {
        const current = get().locale;
        const next: SupportedLocale = current === "en" ? "es" : "en";
        get().setLocale(next);
      },
      initDefaultLocale: (defaultLocale?: string) => {
        // Only set if not already set by user
        if (!defaultLocale) return;
        const normalized: SupportedLocale = (defaultLocale.startsWith("es") || defaultLocale === "es") ? "es" : "en";
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("lennox_locale_storage");
          if (!stored) {
            get().setLocale(normalized);
          }
        }
      },
    }),
    {
      name: "lennox_locale_storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          document.cookie = `${LOCALE_COOKIE_KEY}=${state.locale}; path=/; max-age=31536000; SameSite=Lax`;
          document.documentElement.lang = state.locale;
          state.t = getDictionary(state.locale);
        }
      },
    }
  )
);
