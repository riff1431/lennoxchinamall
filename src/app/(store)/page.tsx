"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Coins,
  Package,
  Layers,
  Star,
  ChevronLeft,
  ChevronRight,
  Factory,
  Radio,
  Clock,
  Award,
  Video,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { FlashDealCountdown } from "@/components/common/FlashDealCountdown";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { formatCurrency } from "@/utils/helpers";

const HERO_SLIDES = [
  {
    id: 1,
    badge: "DIRECT SHENZHEN FACTORY LAUNCH",
    title: "4K Laser Gimbal Aerial Drones",
    subtitle: "Triple GPS auto-return, 5km transmission range & brushless motors. Sourced directly with zero middleman markups.",
    price: 189.0,
    originalPrice: 349.0,
    tag: "-46% OFF",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80",
    link: "/products/eachine-ex5-4k-gps-fpv-drone",
    hub: "Shenzhen Drone Hub",
  },
  {
    id: 2,
    badge: "DIRECT NINGBO INDUSTRIAL DROP",
    title: "CoreXY 600mm/s High-Speed 3D Printer",
    subtitle: "Dual-gear direct extruder, AI lidar auto-bed leveling, and enclosed heated chamber for engineering filaments.",
    price: 349.0,
    originalPrice: 599.0,
    tag: "-42% OFF",
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=1200&auto=format&fit=crop&q=80",
    link: "/products/creality-k1-max-high-speed-3d-printer",
    hub: "Ningbo 3D Cluster",
  },
  {
    id: 3,
    badge: "DONGGUAN ACOUSTICS CLUSTER",
    title: "120W Tri-Driver Bluetooth Boombox",
    subtitle: "IPX7 waterproof, 24-hour battery bank, TWS stereo pairing, and punchy DSP acoustic bass response.",
    price: 79.99,
    originalPrice: 139.99,
    tag: "-43% OFF",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&auto=format&fit=crop&q=80",
    link: "/products/blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    hub: "Dongguan Audio Hub",
  },
];

const CATEGORY_SHORTCUTS = [
  {
    name: "RC Drones & Aerial",
    slug: "rc-drones-toys",
    count: "1,240+",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=300&auto=format&fit=crop&q=80",
    icon: "🚁",
  },
  {
    name: "3D Printers & Tools",
    slug: "tools-diy-hardware",
    count: "890+",
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=300&auto=format&fit=crop&q=80",
    icon: "🖨️",
  },
  {
    name: "Audio & Electronics",
    slug: "consumer-electronics",
    count: "3,400+",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80",
    icon: "🔊",
  },
  {
    name: "Car OBD2 Diagnostics",
    slug: "automotive-parts",
    count: "650+",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300&auto=format&fit=crop&q=80",
    icon: "🚗",
  },
  {
    name: "Tactical Flashlights",
    slug: "outdoor-sports",
    count: "480+",
    image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=300&auto=format&fit=crop&q=80",
    icon: "🔦",
  },
  {
    name: "Power Workshop Gear",
    slug: "industrial-machinery",
    count: "720+",
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300&auto=format&fit=crop&q=80",
    icon: "⚡",
  },
];

export default function StoreHomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");

  const flashDeals = MOCK_PRODUCTS.filter((p) => p.is_flash_deal);
  const bestSellers = MOCK_PRODUCTS.filter((p) => p.is_best_seller);

  // Auto rotate hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts =
    activeCategoryFilter === "all"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category_id === activeCategoryFilter);

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <div className="space-y-12 pb-16 font-montserrat">
      {/* ── 1. Banggood-Style Multi-Zone Hero Section ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Category Directory (3 Cols on Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-black tracking-wider text-[#00143D] uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF1028]" />
                Sourcing Hubs
              </span>
              <span className="text-[10px] bg-[#FF1028]/10 text-[#FF1028] px-2 py-0.5 rounded font-black uppercase">
                DIRECT
              </span>
            </div>

            <ul className="space-y-1">
              {MOCK_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-[#FF1028] transition-all group"
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-[#FF1028] font-semibold">
                      {cat.product_count}+
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sourcing Model Notice */}
          <div className="mt-4 pt-3 border-t border-slate-100 bg-[#00143D] text-white p-3.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-[#10B981] text-xs font-black mb-1">
              <Coins className="w-3.5 h-3.5" /> Binance Pay USDT
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              No credit card chargebacks. Fast crypto settlement at real factory price.
            </p>
          </div>
        </div>

        {/* Center Column: High-Impact Carousel Banner (6 Cols on Desktop) */}
        <div className="lg:col-span-6 relative bg-slate-900 rounded-3xl overflow-hidden shadow-md flex flex-col justify-end min-h-[380px] sm:min-h-[460px] group border border-slate-800">
          <Image
            src={activeSlide.image}
            alt={activeSlide.title}
            fill
            className="object-cover object-center opacity-65 group-hover:scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00143D] via-[#00143D]/50 to-transparent" />

          {/* Slide Navigation Controls */}
          <button
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
              )
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-[#FF1028] text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 hover:bg-[#FF1028] text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Content */}
          <div className="relative z-10 p-6 sm:p-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#FF1028] text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                {activeSlide.badge}
              </span>
              <span className="bg-[#002366] text-amber-300 text-[10px] font-bold px-2 py-1 rounded border border-amber-300/30">
                {activeSlide.hub}
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
              {activeSlide.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-lg leading-relaxed">
              {activeSlide.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-white price-tag">
                  {formatCurrency(activeSlide.price)}
                </span>
                <span className="text-sm text-slate-300 line-through">
                  ${activeSlide.originalPrice.toFixed(2)}
                </span>
                <span className="text-xs font-black text-[#FF1028] bg-white px-2 py-0.5 rounded">
                  {activeSlide.tag}
                </span>
              </div>

              <Link
                href={activeSlide.link}
                className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md group-hover:shadow-lg"
              >
                <span>SOURCING DEAL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Carousel Dots */}
            <div className="flex items-center gap-2 pt-2">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? "w-6 bg-[#FF1028]" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Buyer Welcome & VIP Deals (3 Cols on Desktop) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* VIP Welcome Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#00143D] text-white flex items-center justify-center font-black text-sm">
                  VIP
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#00143D]">
                    Direct Sourcing Desk
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Wholesale China Gateway
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enjoy zero middleman fees and automated USDT escrow checkout.
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <Link
                href="/auth/register"
                className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white text-center py-2 rounded-xl text-xs font-black transition-colors"
              >
                Join Free
              </Link>
              <Link
                href="/auth/login"
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* New Buyer Coupon Box */}
          <div className="bg-gradient-to-br from-[#00143D] to-[#002366] text-white rounded-2xl p-4 shadow-md flex-1 flex flex-col justify-between border border-blue-900">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> First Order Voucher
                </span>
                <span className="bg-[#FF1028] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                  USDT-READY
                </span>
              </div>
              <h4 className="text-lg font-black leading-tight text-white mb-1">
                Save 10% Extra
              </h4>
              <p className="text-xs text-slate-300">
                Use code <strong className="text-amber-300 font-black">LENNOX10</strong> on any factory item.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-semibold">Valid storewide</span>
              <Link
                href="/categories/flash-deals"
                className="text-amber-300 hover:text-white font-black flex items-center gap-1"
              >
                Claim Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Category Shortcuts Grid (Circular / Rounded Cards) ── */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#00143D] flex items-center gap-2">
              <span>🏭 Direct Sourcing Departments</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Explore specialized manufacturing lines across China
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-black text-[#FF1028] hover:underline flex items-center gap-1"
          >
            <span>All Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORY_SHORTCUTS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 hover:bg-red-50/50 border border-slate-100 hover:border-[#FF1028]/30 transition-all card-hover-effect"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden relative mb-2.5 bg-white border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#FF1028] transition-colors line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {cat.count} items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. Flash Deals Section (Red Banner & Countdown) ── */}
      <section className="bg-white rounded-3xl border-2 border-[#FF1028]/20 overflow-hidden shadow-md">
        {/* Flash Deals Header Bar (Brand Red #FF1028) */}
        <div className="bg-[#FF1028] text-white p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 fill-white text-white animate-bounce" />
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                FLASH DEALS
              </h2>
            </div>
            <span className="hidden sm:inline text-red-200">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-100 uppercase">Ends In:</span>
              <FlashDealCountdown />
            </div>
          </div>

          <Link
            href="/categories/flash-deals"
            className="text-xs font-black text-white hover:text-amber-200 flex items-center gap-1 bg-black/20 hover:bg-black/30 px-3.5 py-1.5 rounded-xl transition-colors"
          >
            <span>View All Flash Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Flash Deals Product Grid */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {flashDeals.slice(0, 4).map((product, idx) => (
            <div key={product.id} className="flex flex-col">
              <ProductCard product={product} priority={idx < 2} />
              {/* Claimed progress bar */}
              <div className="mt-2 px-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span className="text-[#FF1028]">🔥 {75 + idx * 6}% Claimed</span>
                  <span>{12 - idx * 2} left</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-[#FF1028] h-full rounded-full"
                    style={{ width: `${75 + idx * 6}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Trending & Top Ranking Products (Department Tabs) ── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#FF1028] text-xs font-black uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>MOST POPULAR CHINA HARDWARE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#00143D]">
              Top Trending Factory Products
            </h2>
          </div>

          {/* Department Filter Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveCategoryFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === "all"
                  ? "bg-[#00143D] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Popular
            </button>
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategoryFilter === cat.id
                    ? "bg-[#FF1028] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      </section>

      {/* ── 5. Direct China Sourcing Hubs Overview ── */}
      <section className="bg-gradient-to-br from-[#00143D] via-[#001E5B] to-[#000B24] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-900/60">
        <div className="max-w-3xl mb-8 space-y-2">
          <span className="bg-emerald-500/20 text-[#10B981] border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
            TRANSPARENT SOURCING PIPELINE
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-white">
            Direct China Manufacturing Clusters
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Lennox ChinaMall bypasses intermediaries. When you place an order with USDT, we purchase directly from certified industrial clusters and ship via expedited international air cargo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-amber-400/50 transition-colors">
            <span className="text-2xl mb-2 block">🚁</span>
            <h4 className="text-sm font-black text-white mb-1">Shenzhen High-Tech</h4>
            <p className="text-xs text-slate-400 mb-3">4K Camera Drones, Gimbal Stabilizers, Smart Microelectronics</p>
            <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
              <span>✓ 7-10 Days Air Express</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-amber-400/50 transition-colors">
            <span className="text-2xl mb-2 block">🖨️</span>
            <h4 className="text-sm font-black text-white mb-1">Ningbo Machinery</h4>
            <p className="text-xs text-slate-400 mb-3">CoreXY 3D Printers, Laser Engravers, Heavy Power Hardware</p>
            <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
              <span>✓ Inspected at Gate</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-amber-400/50 transition-colors">
            <span className="text-2xl mb-2 block">🔊</span>
            <h4 className="text-sm font-black text-white mb-1">Dongguan Audio</h4>
            <p className="text-xs text-slate-400 mb-3">120W Bluetooth Boomboxes, TWS Earbuds, Studio Soundcards</p>
            <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
              <span>✓ Factory Batch Verified</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-amber-400/50 transition-colors">
            <span className="text-2xl mb-2 block">🚗</span>
            <h4 className="text-sm font-black text-white mb-1">Guangzhou Automotive</h4>
            <p className="text-xs text-slate-400 mb-3">OBD2 Diagnostic Tablets, Jump Starters, Car Electronics</p>
            <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
              <span>✓ Direct Manufacturer PO</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Lennox Sourcing Assurance Strip ── */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
          <span className="text-xs font-black text-[#FF1028] uppercase tracking-wider">
            WHY SHOP AT LENNOX CHINAMALL
          </span>
          <h3 className="text-lg sm:text-2xl font-black text-[#00143D]">
            The Single-Vendor Sourcing Guarantee
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF1028] flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#00143D] mb-1">Real Factory Cost</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              No middleman markup. Transparent pricing sourced directly from China factory floors.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Coins className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#00143D] mb-1">USDT (Binance Pay)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant cryptographic settlement with zero chargebacks and automated receipt dispatch.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#00143D] mb-1">Door-to-Door Air Cargo</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Worldwide air transit with complete step-by-step tracking in your customer portal.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#00143D] mb-1">30-Day Return Protection</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Factory warranty coverage and direct USDT refund if items fail quality standards.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
