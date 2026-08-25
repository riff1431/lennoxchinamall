"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Search, Heart, User, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { cn } from "@/utils/helpers";

export function MobileNav() {
  const pathname = usePathname();
  const cartTotal = useCartStore((state) => state.getTotalItems());
  const wishlistTotal = useWishlistStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);

  // Do not show sticky mobile nav on admin paths
  if (pathname.startsWith("/admin")) return null;

  const navItems = [
    { label: "Home", href: "/", icon: Home, isActive: pathname === "/" },
    {
      label: "Categories",
      href: "/categories",
      icon: Grid3X3,
      isActive: pathname.startsWith("/categories"),
    },
    {
      label: "Search",
      href: "/search",
      icon: Search,
      isActive: pathname === "/search",
    },
    {
      label: "Wishlist",
      href: "/account/wishlist",
      icon: Heart,
      badge: wishlistTotal > 0 ? wishlistTotal : null,
      isActive: pathname === "/account/wishlist",
    },
    {
      label: "Account",
      href: "/account/profile",
      icon: User,
      isActive: pathname.startsWith("/account") && pathname !== "/account/wishlist",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200/90 md:hidden pt-1 pb-safe px-2 shadow-2xl">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-w-[56px] btn-smooth",
                item.isActive
                  ? "text-[#FF1028] font-bold"
                  : "text-slate-500 hover:text-[#00143D] font-medium"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5 transition-transform", item.isActive ? "scale-110" : "")} />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-[#FF1028] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-heading">{item.label}</span>
              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-[#FF1028] mt-0.5" />
              )}
            </Link>
          );
        })}

        {/* Floating Cart Icon on Mobile Nav */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center py-1 px-2 text-slate-500 relative min-w-[56px] cursor-pointer btn-smooth"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-slate-700" />
            {cartTotal > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#FF1028] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                {cartTotal}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-700 font-medium mt-0.5 font-heading">Cart</span>
        </button>
      </div>
    </div>
  );
}
