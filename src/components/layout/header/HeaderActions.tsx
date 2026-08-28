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
import { AccountDropdown } from "./AccountDropdown";
import { CartButton } from "./CartButton";

export function HeaderActions() {
  const compareTotalItems = useCompareStore((state) => state.getTotalItems());
  const wishlistTotalItems = useWishlistStore((state) => state.getTotalItems());
  const isMounted = useMounted();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
      {/* Compare Action Button */}
      <Link
        href="/categories"
        title="Product Comparison"
        className="relative w-10 h-10 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-blue-300 transition-all duration-200 hidden sm:flex items-center justify-center cursor-pointer group shadow-2xs hover:shadow-sm text-slate-700 hover:text-blue-600"
        aria-label="View Product Comparison"
      >
        <ArrowLeftRight className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
        {isMounted && compareTotalItems > 0 && (
          <span
            suppressHydrationWarning
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-blue-600 text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border-2 border-white shadow-xs animate-in zoom-in-50"
          >
            {compareTotalItems}
          </span>
        )}
      </Link>

      {/* Wishlist Action Button */}
      <Link
        href="/account/wishlist"
        title="My Wishlist"
        className="relative w-10 h-10 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-red-400 hover:shadow-[0_0_16px_rgba(255,16,40,0.2)] transition-all duration-200 flex items-center justify-center cursor-pointer group text-slate-700 hover:text-[#FF1028] shadow-2xs hover:shadow-sm"
        aria-label="View Wishlist"
      >
        <Heart className="w-4.5 h-4.5 group-hover:scale-110 group-hover:fill-[#FF1028] transition-all" />
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
      <div className="hidden sm:block">
        <NotificationBell variant="storefront" />
      </div>

      {/* Account Dropdown */}
      <AccountDropdown />

      {/* Shopping Cart Button */}
      <CartButton />
    </div>
  );
}
