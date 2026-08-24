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
  Play,
  Film,
  X,
  Plane,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { FlashDealCountdown } from "@/components/common/FlashDealCountdown";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { formatCurrency } from "@/utils/helpers";
import { HomepageSection } from "@/types/homepage";

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
    name: "4K Aerial Drones & FPV",
    slug: "consumer-electronics",
    count: "1,240+",
    hub: "Shenzhen Hub",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500&auto=format&fit=crop&q=80",
    tag: "AERIAL",
  },
  {
    name: "3D Printers & CNC",
    slug: "consumer-electronics",
    count: "890+",
    hub: "Ningbo Cluster",
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=500&auto=format&fit=crop&q=80",
    tag: "INDUSTRIAL",
  },
  {
    name: "High-Fidelity Audio",
    slug: "consumer-electronics",
    count: "3,400+",
    hub: "Dongguan Lab",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80",
    tag: "ACOUSTICS",
  },
  {
    name: "Car OBD2 & Diagnostic",
    slug: "consumer-electronics",
    count: "650+",
    hub: "Guangzhou Line",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80",
    tag: "DIAGNOSTICS",
  },
  {
    name: "Tactical & Outdoor Gear",
    slug: "consumer-electronics",
    count: "480+",
    hub: "Yiwu Cluster",
    image: "https://images.unsplash.com/photo-1510519138161-58474ebf8993?w=500&auto=format&fit=crop&q=80",
    tag: "TACTICAL",
  },
  {
    name: "Smart Robotics & IoT",
    slug: "consumer-electronics",
    count: "720+",
    hub: "Shenzhen Hub",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=80",
    tag: "ROBOTICS",
  },
];

export interface HomePageClientProps {
  sections?: HomepageSection[];
}

export function HomePageClient({ sections }: HomePageClientProps) {
  const heroSection = sections?.find((s) => s.type === "hero_banner" && s.is_active);
  const rawSlides = heroSection?.config?.slides;

  const slides = rawSlides && rawSlides.length > 0
    ? rawSlides.map((s, idx) => ({
        id: s.id || idx + 1,
        badge: s.badge,
        title: s.title,
        subtitle: s.subtitle,
        price: s.price,
        originalPrice: s.original_price,
        tag: s.tag,
        image: s.desktop_image,
        mobileImage: s.mobile_image,
        link: s.link,
        hub: s.hub || "Shenzhen Drone Hub",
      }))
    : HERO_SLIDES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [activeVideoModal, setActiveVideoModal] = useState<{
    title: string;
    subtitle: string;
    productLink: string;
    productPrice: number;
    hub: string;
    tag: string;
  } | null>(null);

  const flashDeals = MOCK_PRODUCTS.filter((p) => p.is_flash_deal);
  const bestSellers = MOCK_PRODUCTS.filter((p) => p.is_best_seller);

  // Auto rotate hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const filteredProducts =
    activeCategoryFilter === "all"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category_id === activeCategoryFilter);

  const activeSlide = slides[currentSlide] || slides[0];

  return (
    <div className="space-y-12 pb-16">
      {/* ── 1. Multi-Zone Hero Section ── */}
      <section className="space-y-4">
        {/* Top Trust Micro-Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#FF1028] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-[#00143D] block truncate font-heading">Direct Factory Gate</span>
              <span className="text-[10px] text-slate-500 block truncate">Shenzhen &amp; Ningbo Hubs</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-[#00143D] block truncate font-heading">Dual-Video QC Lab</span>
              <span className="text-[10px] text-slate-500 block truncate">1080p Pre-Departure Test</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-[#00143D] block truncate font-heading">Binance Pay USDT</span>
              <span className="text-[10px] text-slate-500 block truncate">0% Fees • Escrow Safe</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Plane className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-[#00143D] block truncate font-heading">5–8 Days Air Cargo</span>
              <span className="text-[10px] text-slate-500 block truncate">YunExpress &amp; SF Flight</span>
            </div>
          </div>
        </div>

        {/* Hero Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          {/* Main Column: High-Impact Carousel Banner (8 Cols on Desktop) */}
          <div className="lg:col-span-8 relative bg-slate-950 rounded-3xl overflow-hidden shadow-md flex flex-col justify-end min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[500px] group border border-slate-800">
            <Image
              src={activeSlide.image}
              alt={activeSlide.title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover object-center opacity-65 group-hover:scale-104 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000B24] via-[#000B24]/60 to-transparent" />

            {/* Slide Navigation Controls */}
            <button
              onClick={() =>
                setCurrentSlide(
                  (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                )
              }
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-[#FF1028] text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-lg border border-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
              }
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-[#FF1028] text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-lg border border-white/10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide Content */}
            <div className="relative z-10 p-5 sm:p-8 md:p-10 space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#FF1028] text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm font-heading">
                  {activeSlide.badge}
                </span>
                <span className="bg-white/15 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-amber-300/30">
                  {activeSlide.hub}
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight font-heading max-w-xl">
                {activeSlide.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-lg leading-relaxed">
                {activeSlide.subtitle}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-mono leading-none">
                    {formatCurrency(activeSlide.price)}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 line-through font-mono">
                    ${activeSlide.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-[#FF1028] bg-white px-2 py-0.5 rounded-md font-heading">
                    {activeSlide.tag}
                  </span>
                </div>

                <Link
                  href={activeSlide.link}
                  className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 sm:px-6 py-3 rounded-2xl font-black font-heading text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 shrink-0 cursor-pointer"
                >
                  <span>SOURCING DEAL</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Carousel Dots & Progress */}
              <div className="flex items-center gap-2 pt-2">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? "w-8 bg-[#FF1028]" : "w-2.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Factory Product Video Highlights (4 Cols on Desktop / 2-Col Grid on Tablet/Mobile) */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Video Card 1: 4K Laser Drone QC Flight Test */}
            <div
              onClick={() =>
                setActiveVideoModal({
                  title: "Eachine EX5 4K Drone — Factory Flight Benchmark",
                  subtitle: "Shenzhen Drone Hub QC Lab • 5km Transmission & Laser Gimbal Test",
                  productLink: "/products/eachine-ex5-4k-gps-fpv-drone",
                  productPrice: 189.0,
                  hub: "Shenzhen Drone Hub (SZX)",
                  tag: "QC FLIGHT DEMO",
                })
              }
              className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-md border border-slate-800 flex flex-col justify-between p-4 sm:p-5 cursor-pointer hover:border-[#FF1028] transition-all min-h-[220px] lg:min-h-[240px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"
                alt="4K Drone Flight Test"
                fill
                className="object-cover object-center opacity-45 group-hover:scale-105 group-hover:opacity-55 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000B24] via-[#000B24]/60 to-transparent" />

              {/* Top Badge & Status */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="bg-[#FF1028] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm font-heading">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  QC VIDEO
                </span>
                <span className="bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-300/30">
                  QC PASSED
                </span>
              </div>

              {/* Center Play Button */}
              <div className="relative z-10 my-auto flex justify-center py-2">
                <div className="w-12 h-12 rounded-full bg-[#FF1028]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-[#FF1028] transition-all">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
              </div>

              {/* Card Content */}
              <div className="relative z-10 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white leading-tight font-heading group-hover:text-amber-300 transition-colors">
                    4K Drone Flight Benchmark
                  </h4>
                  <span className="text-xs font-black text-[#10B981] font-mono">
                    $189.00
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-1">
                  5km Range &amp; Laser Gimbal Stability Test
                </p>
              </div>
            </div>

            {/* Video Card 2: CoreXY 600mm/s 3D Printer Teardown */}
            <div
              onClick={() =>
                setActiveVideoModal({
                  title: "Creality K1 Max — 600mm/s High-Speed Teardown",
                  subtitle: "Ningbo 3DP Lab • Dual-Gear Extruder & Vibration Compensation Test",
                  productLink: "/products/creality-ender-3-v3-se-3d-printer",
                  productPrice: 219.0,
                  hub: "Ningbo 3DP Lab (NGB)",
                  tag: "FACTORY SPEED TEST",
                })
              }
              className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-md border border-slate-800 flex flex-col justify-between p-4 sm:p-5 cursor-pointer hover:border-[#FF1028] transition-all min-h-[220px] lg:min-h-[240px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
                alt="600mm/s 3D Printer Speed Test"
                fill
                className="object-cover object-center opacity-45 group-hover:scale-105 group-hover:opacity-55 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000B24] via-[#000B24]/60 to-transparent" />

              {/* Top Badge & Status */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm font-heading">
                  <Film className="w-3 h-3" />
                  QC VIDEO
                </span>
                <span className="bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-300/30">
                  600 MM/S
                </span>
              </div>

              {/* Center Play Button */}
              <div className="relative z-10 my-auto flex justify-center py-2">
                <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-[#FF1028] transition-all">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
              </div>

              {/* Card Content */}
              <div className="relative z-10 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white leading-tight font-heading group-hover:text-amber-300 transition-colors">
                    CoreXY 600mm/s Speed Test
                  </h4>
                  <span className="text-xs font-black text-[#10B981] font-mono">
                    $219.00
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-1">
                  Dual Extruder &amp; AI Lidar Auto-Bed Leveling
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Direct Sourcing Departments Grid ── */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#00143D] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                CHINA MANUFACTURING CLUSTERS
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-[#00143D] font-heading mt-1">
              Direct Sourcing Departments
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Explore specialized manufacturing lines and verified factory clusters across China
            </p>
          </div>

          <Link
            href="/categories"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-[#FF1028] text-[#00143D] hover:text-white border border-slate-200 text-xs font-black font-heading transition-all shadow-2xs group"
          >
            <span>All Departments</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORY_SHORTCUTS.map((cat) => (
            <Link
              key={cat.name}
              href={`/categories/${cat.slug}`}
              className="group bg-[#F8FAFC] hover:bg-white rounded-2xl border border-slate-200/80 hover:border-[#FF1028]/40 p-3 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-md card-hover-effect"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-200 mb-2.5">
                <Image
                  src={cat.image}
                  alt={`${cat.name} Department - China Sourcing Hub`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Hub Badge */}
                <span className="absolute top-2 left-2 bg-[#00143D]/90 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-black font-mono px-1.5 py-0.5 rounded shadow-2xs">
                  {cat.tag}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#FF1028] transition-colors line-clamp-1 leading-snug">
                  {cat.name}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-semibold text-emerald-600 font-mono">{cat.count} Items</span>
                  <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">{cat.hub}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. Flash Deals Section ── */}
      <section className="bg-white rounded-3xl border-2 border-[#FF1028]/20 overflow-hidden shadow-md">
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

        <div className="p-5 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {flashDeals.slice(0, 4).map((product, idx) => (
            <div key={product.id} className="flex flex-col">
              <ProductCard product={product} priority={idx < 2} />
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

      {/* ── 4. Trending & Top Ranking Products ── */}
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

      {/* ── Interactive Video Demo Player Modal ── */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#00143D] border border-slate-750 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF1028] text-white flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FF1028] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                      {activeVideoModal.tag}
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                      {activeVideoModal.hub}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white font-heading mt-0.5">
                    {activeVideoModal.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80"
                alt="Video Stream Preview"
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-radial from-transparent to-black/70" />

              {/* Simulated Live Stream / Video Overlays */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE FACTORY FEED
                </span>
                <span className="bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                  1080p 60FPS • SZX HUB 04
                </span>
              </div>

              {/* Central Play Badge */}
              <div className="relative z-10 flex flex-col items-center gap-2 text-center p-6">
                <div className="w-16 h-16 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-2xl animate-pulse">
                  <Play className="w-8 h-8 ml-1 fill-current" />
                </div>
                <span className="text-xs font-bold text-slate-200 drop-shadow-md">
                  Inspected &amp; verified at Shenzhen assembly testing bench
                </span>
              </div>

              {/* Video Timeline Bar */}
              <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center gap-3 text-[11px] font-mono text-slate-300">
                <span className="text-amber-300 font-bold">01:45</span>
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-[#FF1028] rounded-full" />
                </div>
                <span>02:30</span>
              </div>
            </div>

            {/* Modal Footer & Direct Purchase Bar */}
            <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block">{activeVideoModal.subtitle}</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-black text-[#10B981] font-mono">
                    ${activeVideoModal.productPrice.toFixed(2)} USDT
                  </span>
                  <span className="text-xs text-slate-400">Zero Middleman Markup</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                >
                  Close
                </button>
                <Link
                  href={activeVideoModal.productLink}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-black text-xs font-heading transition-colors flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <span>View Full Factory Specs →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
