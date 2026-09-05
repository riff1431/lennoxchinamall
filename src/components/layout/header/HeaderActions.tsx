"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  ArrowLeftRight,
} from "lucide-react";
import { useCompareStore } from "@/store/useCompareStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useMounted } from "@/hooks/useMounted";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AccountDropdown } from "./AccountDropdown";
import { CartButton } from "./CartButton";

export function HeaderActions() {
  const compareTotalItems = useCompareStore((state) => state.getTotalItems());
  const wishlistTotalItems = useWishlistStore((state) => state.getTotalItems());
  const isMounted = useMounted();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2 lg:gap-2.5 shrink-0">
      {/* Compare Action Button - Visible on XL+ */}
      <Link
        href="/categories"
        title={t.header.compare}
        className="relative w-9 h-9 xl:w-10 xl:h-10 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-blue-300 transition-all duration-200 hidden xl:flex items-center justify-center cursor-pointer group shadow-2xs hover:shadow-sm text-slate-700 hover:text-blue-600"
        aria-label={t.header.compare}
      >
        <ArrowLeftRight className="w-4 h-4 xl:w-4.5 xl:h-4.5 group-hover:scale-110 transition-transform" />
        {isMounted && compareTotalItems > 0 && (
          <span
            suppressHydrationWarning
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-blue-600 text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border-2 border-white shadow-xs animate-in zoom-in-50"
          >
            {compareTotalItems}
          </span>
        )}
      </Link>

      {/* Wishlist Action Button - Visible on LG+ (MobileNav handles mobile/tablet) */}
      <Link
        href="/account/wishlist"
        title={t.header.wishlist}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-red-400 hover:shadow-[0_0_16px_rgba(255,16,40,0.2)] transition-all duration-200 hidden lg:flex items-center justify-center cursor-pointer group text-slate-700 hover:text-[#FF1028] shadow-2xs hover:shadow-sm"
        aria-label={t.header.wishlist}
      >
        <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-110 group-hover:fill-[#FF1028] transition-all" />
        {isMounted && wishlistTotalItems > 0 && (
          <span
            suppressHydrationWarning
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#FF1028] text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border-2 border-white shadow-xs animate-in zoom-in-50"
          >
            {wishlistTotalItems}
          </span>
        )}
      </Link>

      {/* Notification Bell */}
      <NotificationBell variant="storefront" />

      {/* Account Dropdown - Visible on MD+ (MobileNav Me tab & Drawer handle mobile) */}
      <div className="hidden md:block">
        <AccountDropdown />
      </div>

      {/* Shopping Cart Button */}
      <CartButton />
    </div>
  );
}
