import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { SupportedLocale, TranslationDictionary } from "./types";

export * from "./types";

export const DICTIONARIES: Record<SupportedLocale, TranslationDictionary> = {
  en,
  es,
};

export const DEFAULT_LOCALE: SupportedLocale = "es";
export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "es"];
export const LOCALE_COOKIE_KEY = "NEXT_LOCALE";

export function getDictionary(locale: SupportedLocale = DEFAULT_LOCALE): TranslationDictionary {
  return DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];
}
