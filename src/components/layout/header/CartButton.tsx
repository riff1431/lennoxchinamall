"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/helpers";
import { useCurrency } from "@/store/useCurrencyStore";
import { useMounted } from "@/hooks/useMounted";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function CartButton() {
  const isMounted = useMounted();
  const { t } = useTranslation();
  const { currentCurrency, formatCurrency: formatCurrencyFromStore } = useCurrency();

  const cartTotalItems = useCartStore((state) => state.getTotalItems());
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const openCart = useCartStore((state) => state.openCart);

  const hasItems = isMounted && cartTotalItems > 0;

  return (
    <button
      onClick={openCart}
      className={`w-9.5 h-9.5 sm:w-10 sm:h-10 lg:w-auto lg:h-10.5 xl:h-11 flex items-center justify-center gap-2 lg:gap-2.5 bg-gradient-to-r from-[#00143D] via-[#001F5C] to-[#000F2E] hover:from-[#001E5B] hover:to-[#00143D] border ${
        hasItems
          ? "border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          : "border-blue-900/60"
      } hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] text-white p-2 lg:px-4 lg:py-2 rounded-xl shadow-xs transition-all duration-300 cursor-pointer group shrink-0`}
      aria-label={`Shopping cart with ${isMounted ? cartTotalItems : 0} items`}
      suppressHydrationWarning
    >
      <div className="relative flex items-center justify-center">
        <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white group-hover:scale-110 transition-transform" />
        {hasItems && (
          <span
            suppressHydrationWarning
            className="absolute -top-2 -right-2.5 min-w-[17px] sm:min-w-[18px] h-[17px] sm:h-[18px] bg-[#FF1028] text-white rounded-full text-[9px] sm:text-[10px] font-black flex items-center justify-center px-1 border-2 border-[#00143D] shadow-xs"
          >
            {cartTotalItems}
          </span>
        )}
      </div>
      <div className="hidden lg:flex flex-col text-left leading-tight">
        <span className="text-[9px] text-amber-300 font-extrabold uppercase tracking-wider">
          {t.common.myCart}
        </span>
        <span
          suppressHydrationWarning
          className="text-xs font-black text-white font-mono tracking-tight"
        >
          {formatCurrency(isMounted ? cartSubtotal : 0)}
        </span>
      </div>
    </button>
  );
}
