"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCircle, ShieldCheck, Heart, Package, MessageCircleMore, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { signout } from "@/app/actions/auth";
import { isAdminRole, ROLE_LABELS } from "@/lib/auth/roles";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useMounted } from "@/hooks/useMounted";

export function AccountDropdown() {
  const { user, role, displayName, isAuthenticated } = useAuth();
  const { t, isSpanish } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const wishlistTotalItems = useWishlistStore((state) => state.getTotalItems());
  const isMounted = useMounted();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signout();
    router.push("/");
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 xl:p-1.5 rounded-xl text-slate-700 hover:text-[#00143D] hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
        aria-label={t.header.myAccount}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 xl:w-9 xl:h-9 rounded-lg bg-[#00143D] text-white flex items-center justify-center text-[11px] sm:text-xs font-black shadow-xs shrink-0">
          {isAuthenticated && displayName ? (
            displayName[0].toUpperCase()
          ) : (
            <UserCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          )}
        </div>
        <div className="hidden xl:flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-semibold leading-tight">
            {isAuthenticated ? t.common.signedInAs : t.header.myAccount}
          </span>
          <span className="text-xs font-black text-[#00143D] leading-tight flex items-center gap-1">
            {isAuthenticated ? displayName || t.header.myAccount : t.header.myAccount}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-24px)] bg-white rounded-xl border border-slate-200 shadow-2xl p-2 z-50 text-xs"
          >
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="p-3 bg-slate-50 rounded-lg mb-2">
                  <span className="text-xs font-black text-[#00143D] block">{displayName || user?.email}</span>
                  <span className="text-[10px] font-mono font-bold text-[#FF1028] uppercase">
                    {t.header.role}: {role ? ROLE_LABELS[role] || role : "Customer"}
                  </span>
                </div>

                {isAdminRole(role) && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 p-2 rounded-md bg-[#FF1028]/10 text-[#FF1028] font-bold hover:bg-[#FF1028]/20 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.common.adminHub}</span>
                  </Link>
                )}

                <Link
                  href="/account/profile"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-slate-500" />
                  <span>{t.header.profile}</span>
                </Link>

                <Link
                  href="/account/orders"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                >
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>{t.header.myOrders}</span>
                </Link>

                <Link
                  href="/account/wishlist"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                >
                  <Heart className="w-4 h-4 text-slate-500" />
                  <span suppressHydrationWarning>{t.header.wishlist} ({isMounted ? wishlistTotalItems : 0})</span>
                </Link>

                <Link
                  href="/account/support"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
                >
                  <MessageCircleMore className="w-4 h-4 text-slate-500" />
                  <span>{t.header.supportTickets}</span>
                </Link>

                <div className="pt-2 border-t border-slate-100 mt-1">
                  <button
                    onClick={handleSignOut}
                    role="menuitem"
                    className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-red-50 text-red-600 font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.header.logout}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 space-y-3">
                <div className="text-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block">
                    {isSpanish ? "Pasarela Directa de Fábrica" : "Direct Factory Sourcing Gateway"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isSpanish ? "Sin comisiones, liquidación rápida en USDT y seguimiento" : "Zero fees, fast USDT settlement & factory tracking"}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className="w-full bg-[#00143D] hover:bg-[#002366] text-white text-center py-2 rounded-xl text-xs font-black transition-colors cursor-pointer"
                  >
                    {t.header.login}
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-center py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t.header.register}
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
