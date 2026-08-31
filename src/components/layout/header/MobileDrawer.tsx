"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Bell } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { signout } from "@/app/actions/auth";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { NAV_LINKS } from "@/components/layout/header/headerConfig";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useMounted } from "@/hooks/useMounted";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { Category } from "@/types/database";

interface DrawerCategory extends Partial<Category> {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  iconName?: string;
  subcategories?: string[];
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl: string;
  storeName: string;
}

export function MobileDrawer({ isOpen, onClose, logoUrl, storeName }: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, displayName } = useAuth();
  const { getRootCategories } = useCategoryStore();
  const { locale, setLocale, t } = useTranslation();
  
  const isMounted = useMounted();
  const unreadNotificationsCount = useNotificationStore((state) => state.unreadCount);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const getLocalizedNavLabel = (href: string, fallback: string) => {
    switch (href) {
      case "/":
        return t.common.home;
      case "/flash-deals":
        return t.common.flashDeals;
      case "/new-arrivals":
        return t.common.newArrivals;
      case "/brands":
        return t.common.brands;
      case "/account/orders":
        return t.common.trackOrder;
      case "/factory-hubs":
        return t.common.factoryHubs;
      default:
        return fallback;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      // Small delay to ensure render before focus
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSignOut = async () => {
    await signout();
    onClose();
    router.push("/");
  };

  const rootCategories: DrawerCategory[] = isMounted ? getRootCategories() : MOCK_CATEGORIES;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between z-10"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <Link href="/" onClick={onClose} className="shrink-0 cursor-pointer">
                  <div className="relative h-12 w-[165px]">
                    <Image src={logoUrl} alt={`${storeName} Logo`} fill sizes="165px" className="object-contain object-left" />
                  </div>
                </Link>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-[#FF1028] rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Selector Pill */}
              <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl">
                <span className="text-xs font-bold text-slate-600">{t.header.selectLanguage}</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setLocale("en")}
                    className={`px-3 py-1 rounded-md text-xs font-black transition-all ${
                      locale === "en"
                        ? "bg-[#00143D] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale("es")}
                    className={`px-3 py-1 rounded-md text-xs font-black transition-all ${
                      locale === "es"
                        ? "bg-[#FF1028] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ES
                  </button>
                </div>
              </div>

              {/* User Account Quick Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
                {isMounted && user ? (
                  <div>
                    <span className="text-sm font-black text-[#00143D] block">{displayName || user.email}</span>
                    <span className="text-[10px] text-[#FF1028] font-bold uppercase tracking-wider">{role}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Direct Factory Sourcing</span>
                    <span className="text-xs text-slate-500">Join free for wholesale</span>
                  </div>
                )}
                {isMounted && user ? (
                  <button onClick={handleSignOut} className="text-xs font-bold text-slate-500 hover:text-[#FF1028] transition-colors cursor-pointer">
                    {t.header.logout}
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={onClose}
                    className="bg-[#00143D] hover:bg-[#001F5C] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    {t.header.login}
                  </Link>
                )}
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider ml-2">
                  Navigation
                </span>
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    const IconComponent = link.icon;
                    const label = getLocalizedNavLabel(link.href, link.label);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                          isActive ? "bg-red-50 text-[#FF1028]" : "hover:bg-slate-50 text-slate-700 hover:text-[#FF1028]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {IconComponent && <IconComponent className={`w-4 h-4 ${isActive ? "text-[#FF1028]" : "text-slate-400"}`} />}
                          <span className={`text-sm ${isActive ? "font-black" : "font-bold"}`}>{label}</span>
                        </div>
                        {link.badge && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${link.badgeColor || "bg-amber-100 text-amber-700"}`}>
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  {/* Notifications & Alerts */}
                  <Link
                    href="/account/notifications"
                    onClick={onClose}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                      pathname === "/account/notifications"
                        ? "bg-red-50 text-[#FF1028]"
                        : "hover:bg-slate-50 text-slate-700 hover:text-[#FF1028]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bell className={`w-4 h-4 ${pathname === "/account/notifications" ? "text-[#FF1028]" : "text-slate-400"}`} />
                      <span className={`text-sm ${pathname === "/account/notifications" ? "font-black" : "font-bold"}`}>
                        Notifications
                      </span>
                    </div>
                    {isMounted && unreadNotificationsCount > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF1028] text-white">
                        {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                </nav>
              </div>

              {/* Accordion Categories */}
              <div className="space-y-1.5 pb-4">
                <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider ml-2">
                  {t.common.allDepartments}
                </span>
                <div className="space-y-1">
                  {rootCategories.map((cat) => (
                    <div key={cat.id} className="border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                      <button
                        onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                        className="w-full flex items-center justify-between py-2.5 px-2 text-sm font-bold text-slate-700 hover:text-[#FF1028] transition-colors cursor-pointer"
                        aria-expanded={expandedCat === cat.id}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <CategoryIcon
                              icon={cat.icon || cat.iconName}
                              name={cat.name}
                              className="w-4 h-4 text-[#FF1028]"
                            />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            expandedCat === cat.id ? "rotate-180 text-[#FF1028]" : ""
                          }`}
                        />
                      </button>
                      
                      <AnimatePresence>
                        {expandedCat === cat.id && cat.subcategories && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-11 py-2 space-y-2">
                              {cat.subcategories.map((sub: string, i: number) => (
                                <Link
                                  key={i}
                                  href={`/categories/${cat.slug}`}
                                  onClick={onClose}
                                  className="block py-1.5 text-xs font-medium text-slate-500 hover:text-[#FF1028] transition-colors cursor-pointer"
                                >
                                  {sub}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between text-slate-600 text-xs font-medium">
                <span>{t.common.directChinaAirfreight}</span>
                <span className="font-bold text-[#00143D] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  USDT (Binance Pay)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <Link href="/account/orders" onClick={onClose} className="hover:text-[#FF1028] font-bold">
                  {t.common.trackOrder}
                </Link>
                <span>•</span>
                <Link href="/account/support" onClick={onClose} className="hover:text-[#FF1028] font-bold">
                  {t.common.sourcingDesk247}
                </Link>
              </div>
              <p className="text-[10px] text-slate-400 text-center font-medium">
                © {new Date().getFullYear()} Lennox ChinaMall Inc. {t.footer.allRightsReserved}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
