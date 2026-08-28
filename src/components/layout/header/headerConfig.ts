"use client";

import {
  Globe,
  ChevronDown,
  Check,
  Flame,
  Sparkles,
  Factory,
  Zap,
  CircleDollarSign,
  MapPin,
  MessageCircleMore,
  LayoutGrid,
  Award,
  ArrowLeftRight,
  ShoppingBag,
  UserCircle,
  BadgeCheck,
  Send,
  type LucideIcon,
} from "lucide-react";

// ─── Hot Search Tags (can be fetched from CMS/API in future) ───────────────
export const HOT_SEARCH_TAGS = [
  "4K Drones",
  "3D Printers",
  "OBD2 Scanners",
  "Tactical Flashlights",
  "RC Cars",
  "Bluetooth Speakers",
];

// ─── Languages ──────────────────────────────────────────────────────────────
export const LANGUAGES = [
  { code: "EN", name: "English (US)", locale: "en" },
  { code: "ES", name: "Español", locale: "es" },
  { code: "FR", name: "Français", locale: "fr" },
  { code: "DE", name: "Deutsch", locale: "de" },
  { code: "AR", name: "العربية", locale: "ar" },
];

// ─── Currencies ─────────────────────────────────────────────────────────────
export const CURRENCIES = [
  { code: "USDT", symbol: "₮", label: "USDT (Binance Pay — Zero Fee)", isCrypto: true },
  { code: "USD", symbol: "$", label: "USD ($)", isCrypto: false },
  { code: "EUR", symbol: "€", label: "EUR (€)", isCrypto: false },
  { code: "GBP", symbol: "£", label: "GBP (£)", isCrypto: false },
];

// ─── Navigation Links ──────────────────────────────────────────────────────
export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon | null;
  badge?: string;
  badgeColor?: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", icon: null },
  { label: "Flash Deals", href: "/categories/flash-deals", badge: "HOT", badgeColor: "bg-[#FF1028] text-white", icon: Zap },
  { label: "New Arrivals", href: "/categories/new-arrivals", icon: Sparkles },
  { label: "Brands", href: "/admin/brands", icon: Award },
  { label: "Track Order", href: "/account/orders", icon: MapPin },
  { label: "Factory Hubs", href: "/admin/sourcing", icon: Factory },
];

// ─── Announcement Bar Config ────────────────────────────────────────────────
export const ANNOUNCEMENT_CONFIG = {
  valueProp: "Direct China Airfreight",
  valueIcon: Send,
  couponText: "Save up to 65% with coupon",
  couponCode: "LENNOX10",
  qcText: "100% Factory QC Pass",
  qcIcon: BadgeCheck,
};

// ─── Premium Icon Mapping (Upgraded Icons) ──────────────────────────────────
export const HEADER_ICONS = {
  // Announcement bar
  airfreight: Send,
  qcPass: BadgeCheck,
  language: Globe,
  currency: CircleDollarSign,
  trackSourcing: MapPin,
  supportDesk: MessageCircleMore,
  chevronDown: ChevronDown,
  check: Check,
  // Navigation
  allCategories: LayoutGrid,
  flashDeals: Zap,
  newArrivals: Sparkles,
  brands: Award,
  trackOrder: MapPin,
  factoryHubs: Factory,
  // Actions
  compare: ArrowLeftRight,
  wishlist: Flame, // Will use Heart from lucide directly in component
  cart: ShoppingBag,
  account: UserCircle,
} as const;
