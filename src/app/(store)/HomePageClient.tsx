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
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { FlashDealCountdown } from "@/components/common/FlashDealCountdown";
import { FlashDealsSection } from "@/components/sections/FlashDealsSection";
import { TopSellingProductsSection } from "@/components/sections/TopSellingProductsSection";
import { HeroLennoxSection } from "@/components/sections/HeroLennoxSection";
import { DualPromotionalShowcaseSection } from "@/components/sections/DualPromotionalShowcaseSection";
import { ReelsVideoModal, ReelsVideoData } from "@/components/common/ReelsVideoModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCategoryStore } from "@/store/useCategoryStore";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { formatCurrency } from "@/utils/helpers";
import { HomepageSection } from "@/types/homepage";
import { MotionSection } from "@/components/animation/MotionSection";
import { StaggerGrid, StaggerItem } from "@/components/animation/StaggerGrid";

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

  const { getRootCategories } = useCategoryStore();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const rootCategories = isMounted ? getRootCategories() : MOCK_CATEGORIES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [activeVideoModal, setActiveVideoModal] = useState<ReelsVideoData | null>(null);

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
      {/* ── 1. 3-Column Hero Section ── */}
      <MotionSection effect="fade-in">
        <HeroLennoxSection onOpenVideoModal={setActiveVideoModal} />
      </MotionSection>

      {/* ── 2. Direct Sourcing Departments Grid ── */}
      <MotionSection effect="fade-up" delay={80}>
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
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-[#FF1028] text-[#00143D] hover:text-white border border-slate-200 text-xs font-black font-heading transition-all shadow-2xs group btn-smooth"
            >
              <span>All Departments</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" staggerDelay={0.05}>
            {CATEGORY_SHORTCUTS.map((cat) => (
              <StaggerItem key={cat.name}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group bg-[#F8FAFC] hover:bg-white rounded-2xl border border-slate-200/80 hover:border-[#FF1028]/40 p-3 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-md hover-lift h-full"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-200 mb-2.5 image-zoom-smooth">
                    <Image
                      src={cat.image}
                      alt={`${cat.name} Department - China Sourcing Hub`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover object-center group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Hub Badge */}
                    <span className="absolute top-2 left-2 bg-[#00143D]/90 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-black font-mono px-1.5 py-0.5 rounded shadow-2xs">
                      {cat.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#FF1028] transition-colors line-clamp-1 leading-snug font-heading">
                      {cat.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-semibold text-emerald-600 font-mono">{cat.count} Items</span>
                      <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">{cat.hub}</span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      </MotionSection>

      {/* ── 3. Top Selling Products Carousel (5 Columns, Auto-Loop 2.8s) ── */}
      <MotionSection effect="fade-up" delay={90}>
        <TopSellingProductsSection products={bestSellers} autoPlayInterval={2800} />
      </MotionSection>

      {/* ── 4. Flash Deals Section ── */}
      <MotionSection effect="fade-up" delay={100}>
        <FlashDealsSection flashDeals={flashDeals} />
      </MotionSection>

      {/* ── 5. Middle Section: Best Sellings, Top Rated & Dual Promotional Banners ── */}
      <MotionSection effect="fade-up" delay={100}>
        <DualPromotionalShowcaseSection />
      </MotionSection>

      {/* ── 6. Trending Products Grid with Category Tabs ── */}
      <MotionSection effect="fade-up" delay={110}>
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#FF1028] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                  CURATED SELECTION
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#00143D] font-heading">
                Top Trending Factory Products
              </h2>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveCategoryFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap btn-smooth ${
                  activeCategoryFilter === "all"
                    ? "bg-[#00143D] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                All Popular
              </button>
              {rootCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap btn-smooth ${
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

          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3.5" staggerDelay={0.04}>
            {filteredProducts.map((product, idx) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} priority={idx < 5} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      </MotionSection>

      {/* ── 5. Direct China Sourcing Hubs Overview ── */}
      <MotionSection effect="scale-up" delay={120}>
        <section className="bg-gradient-to-br from-[#00143D] via-[#001E5B] to-[#000B24] text-white rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xl border border-blue-900/60 hover-glow-navy">
          <div className="max-w-3xl mb-6 sm:mb-8 space-y-2">
            <span className="bg-emerald-500/20 text-[#10B981] border border-emerald-500/30 text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
              TRANSPARENT SOURCING PIPELINE
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-heading">
              Direct China Manufacturing Clusters
            </h2>
            <p className="text-[11px] sm:text-sm text-slate-300 leading-relaxed">
              China Mall bypasses intermediaries. Orders placed with USDT go directly from certified industrial clusters via expedited air cargo.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-amber-400/50 hover-lift transition-all">
              <span className="text-xl sm:text-2xl mb-2 block">🚁</span>
              <h4 className="text-xs sm:text-sm font-black text-white mb-1 font-heading">Shenzhen High-Tech</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mb-2 sm:mb-3">4K Camera Drones, Gimbal Stabilizers, Smart Microelectronics</p>
              <div className="text-[10px] sm:text-[11px] text-amber-300 font-bold flex items-center gap-1 font-mono">
                <span>✓ 7-10 Days Air Express</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-amber-400/50 hover-lift transition-all">
              <span className="text-xl sm:text-2xl mb-2 block">🖨️</span>
              <h4 className="text-xs sm:text-sm font-black text-white mb-1 font-heading">Ningbo Machinery</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mb-2 sm:mb-3">CoreXY 3D Printers, Laser Engravers, Heavy Power Hardware</p>
              <div className="text-[10px] sm:text-[11px] text-amber-300 font-bold flex items-center gap-1 font-mono">
                <span>✓ Inspected at Gate</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-amber-400/50 hover-lift transition-all">
              <span className="text-xl sm:text-2xl mb-2 block">🔊</span>
              <h4 className="text-xs sm:text-sm font-black text-white mb-1 font-heading">Dongguan Audio</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mb-2 sm:mb-3">120W Bluetooth Boomboxes, TWS Earbuds, Studio Soundcards</p>
              <div className="text-[10px] sm:text-[11px] text-amber-300 font-bold flex items-center gap-1 font-mono">
                <span>✓ Factory Batch Verified</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-amber-400/50 hover-lift transition-all">
              <span className="text-xl sm:text-2xl mb-2 block">🚗</span>
              <h4 className="text-xs sm:text-sm font-black text-white mb-1 font-heading">Guangzhou Automotive</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mb-2 sm:mb-3">OBD2 Diagnostic Tablets, Jump Starters, Car Electronics</p>
              <div className="text-[10px] sm:text-[11px] text-amber-300 font-bold flex items-center gap-1 font-mono">
                <span>✓ Direct Manufacturer PO</span>
              </div>
            </div>
          </div>
        </section>
      </MotionSection>

      {/* ── 6. Lennox Sourcing Assurance Strip ── */}
      <MotionSection effect="fade-up" delay={100}>
        <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-1.5">
            <span className="text-[11px] sm:text-xs font-black text-[#FF1028] uppercase tracking-wider font-mono">
              WHY SHOP AT CHINA MALL
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-[#00143D] font-heading">
              The Single-Vendor Sourcing Guarantee
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4 hover-lift rounded-2xl transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-50 text-[#FF1028] flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#00143D] mb-1 font-heading">Real Factory Cost</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                No middleman markup. Transparent pricing from China factory floors.
              </p>
            </div>

            <div className="text-center p-3 sm:p-4 hover-lift rounded-2xl transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#00143D] mb-1 font-heading">USDT Binance Pay</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Instant cryptographic settlement with zero chargebacks.
              </p>
            </div>

            <div className="text-center p-3 sm:p-4 hover-lift rounded-2xl transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#00143D] mb-1 font-heading">Door-to-Door Air Cargo</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Worldwide air transit with full step-by-step tracking.
              </p>
            </div>

            <div className="text-center p-3 sm:p-4 hover-lift rounded-2xl transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#00143D] mb-1 font-heading">30-Day Return Protection</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Factory warranty and direct USDT refund if items fail standards.
              </p>
            </div>
          </div>
        </section>
      </MotionSection>

      {/* ── 8. Interactive QC Reels Video Modal ── */}
      <ReelsVideoModal
        isOpen={!!activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
        videoData={activeVideoModal}
      />
    </div>
  );
}
