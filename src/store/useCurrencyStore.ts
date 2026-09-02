"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const CURRENCY_COOKIE_KEY = "lennox_currency";
export const DEFAULT_CURRENCY = "USDT";

export interface CurrencyInfo {
  code: string;
  symbol: string;
  label: string;
  rate: number;
  isCrypto: boolean;
  prefix: string;
  suffix: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  {
    code: "USDT",
    symbol: "₮",
    label: "USDT (Binance Pay — Zero Fee)",
    rate: 1.0,
    isCrypto: true,
    prefix: "$",
    suffix: " USDT",
  },
  {
    code: "USD",
    symbol: "$",
    label: "USD ($)",
    rate: 1.0,
    isCrypto: false,
    prefix: "$",
    suffix: "",
  },
  {
    code: "EUR",
    symbol: "€",
    label: "EUR (€)",
    rate: 0.92,
    isCrypto: false,
    prefix: "€",
    suffix: "",
  },
  {
    code: "GBP",
    symbol: "£",
    label: "GBP (£)",
    rate: 0.79,
    isCrypto: false,
    prefix: "£",
    suffix: "",
  },
];

export const CURRENCY_RATES: Record<string, number> = {
  USDT: 1.0,
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
};

interface CurrencyState {
  currentCurrency: string;
  currencies: CurrencyInfo[];
  rates: Record<string, number>;
  setCurrency: (code: string) => void;
  convert: (amountInUSD: number, targetCurrency?: string) => number;
  formatCurrency: (amountInUSD: number, targetCurrency?: string) => string;
  formatPrice: (amountInUSD: number, targetCurrency?: string) => string;
  formatComparePrice: (amountInUSD: number, targetCurrency?: string) => string;
  getCurrencyInfo: (code?: string) => CurrencyInfo;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currentCurrency: DEFAULT_CURRENCY,
      currencies: SUPPORTED_CURRENCIES,
      rates: CURRENCY_RATES,

      setCurrency: (code: string) => {
        const found = SUPPORTED_CURRENCIES.find(
          (c) => c.code.toUpperCase() === code.toUpperCase()
        );
        const nextCode = found ? found.code : DEFAULT_CURRENCY;

        if (typeof document !== "undefined") {
          document.cookie = `${CURRENCY_COOKIE_KEY}=${nextCode}; path=/; max-age=31536000; SameSite=Lax`;
        }

        set({ currentCurrency: nextCode });
      },

      getCurrencyInfo: (code?: string) => {
        const target = (code || get().currentCurrency).toUpperCase();
        return (
          SUPPORTED_CURRENCIES.find((c) => c.code === target) ||
          SUPPORTED_CURRENCIES[0]
        );
      },

      convert: (amountInUSD: number, targetCurrency?: string) => {
        if (typeof amountInUSD !== "number" || isNaN(amountInUSD)) return 0;
        const cur = (targetCurrency || get().currentCurrency).toUpperCase();
        const rate = get().rates[cur] || 1.0;
        return amountInUSD * rate;
      },

      formatCurrency: (amountInUSD: number, targetCurrency?: string) => {
        if (typeof amountInUSD !== "number" || isNaN(amountInUSD)) return "$0.00 USDT";
        const curCode = (targetCurrency || get().currentCurrency).toUpperCase();
        const info = get().getCurrencyInfo(curCode);
        const converted = get().convert(amountInUSD, curCode);

        if (curCode === "USDT") {
          return `$${converted.toFixed(2)} USDT`;
        }
        if (curCode === "USD") {
          return `$${converted.toFixed(2)}`;
        }
        if (curCode === "EUR") {
          return `€${converted.toFixed(2)}`;
        }
        if (curCode === "GBP") {
          return `£${converted.toFixed(2)}`;
        }
        return `${info.prefix}${converted.toFixed(2)}${info.suffix}`;
      },

      formatPrice: (amountInUSD: number, targetCurrency?: string) => {
        if (typeof amountInUSD !== "number" || isNaN(amountInUSD)) return "$0.00";
        const curCode = (targetCurrency || get().currentCurrency).toUpperCase();
        const converted = get().convert(amountInUSD, curCode);

        if (curCode === "EUR") {
          return `€${converted.toFixed(2)}`;
        }
        if (curCode === "GBP") {
          return `£${converted.toFixed(2)}`;
        }
        return `$${converted.toFixed(2)}`;
      },

      formatComparePrice: (amountInUSD: number, targetCurrency?: string) => {
        if (typeof amountInUSD !== "number" || isNaN(amountInUSD)) return "$0.00";
        const curCode = (targetCurrency || get().currentCurrency).toUpperCase();
        const converted = get().convert(amountInUSD, curCode);

        if (curCode === "EUR") {
          return `€${converted.toFixed(2)}`;
        }
        if (curCode === "GBP") {
          return `£${converted.toFixed(2)}`;
        }
        return `$${converted.toFixed(2)}`;
      },
    }),
    {
      name: "lennox_currency_storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          document.cookie = `${CURRENCY_COOKIE_KEY}=${state.currentCurrency}; path=/; max-age=31536000; SameSite=Lax`;
        }
      },
    }
  )
);

/**
 * Convenient React hook to use in components for reactive currency updates
 */
export function useCurrency() {
  const currentCurrency = useCurrencyStore((state) => state.currentCurrency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const convert = useCurrencyStore((state) => state.convert);
  const formatCurrency = useCurrencyStore((state) => state.formatCurrency);
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const formatComparePrice = useCurrencyStore((state) => state.formatComparePrice);
  const getCurrencyInfo = useCurrencyStore((state) => state.getCurrencyInfo);
  const currencies = useCurrencyStore((state) => state.currencies);

  const currencyInfo = getCurrencyInfo(currentCurrency);

  return {
    currentCurrency,
    currency: currentCurrency,
    setCurrency,
    convert,
    formatCurrency,
    formatPrice,
    formatComparePrice,
    getCurrencyInfo,
    currencies,
    currencyInfo,
    symbol: currencyInfo.symbol,
    rate: currencyInfo.rate,
    isCrypto: currencyInfo.isCrypto,
  };
}
