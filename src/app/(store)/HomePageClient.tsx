"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { FlashDealCountdown } from "@/components/common/FlashDealCountdown";
import { FlashDealsSection } from "@/components/sections/FlashDealsSection";
import { TopSellingProductsSection } from "@/components/sections/TopSellingProductsSection";
import { DirectSourcingDepartmentsSection } from "@/components/sections/DirectSourcingDepartmentsSection";
import { ChinaManufacturingClustersSection } from "@/components/sections/ChinaManufacturingClustersSection";
import { BrowsingHistorySection } from "@/components/sections/BrowsingHistorySection";
import { HeroLennoxSection } from "@/components/sections/HeroLennoxSection";
import { DualPromotionalShowcaseSection } from "@/components/sections/DualPromotionalShowcaseSection";
import { SourcingAssuranceSection } from "@/components/sections/SourcingAssuranceSection";
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

      {/* ── 2. Top Selling Products Carousel (5 Columns, Auto-Loop 2.8s) ── */}
      <MotionSection effect="fade-up" delay={80}>
        <TopSellingProductsSection products={bestSellers} autoPlayInterval={2800} />
      </MotionSection>

      {/* ── 3. Flash Deals Section ── */}
      <MotionSection effect="fade-up" delay={90}>
        <FlashDealsSection flashDeals={flashDeals} />
      </MotionSection>

      {/* ── 4. Middle Section: Best Sellings, Top Rated & Dual Promotional Banners ── */}
      <MotionSection effect="fade-up" delay={100}>
        <DualPromotionalShowcaseSection />
      </MotionSection>

      {/* ── 5. Direct Sourcing Departments Carousel (Auto-Loop 3s) ── */}
      <MotionSection effect="fade-up" delay={105}>
        <DirectSourcingDepartmentsSection autoPlayInterval={3000} />
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
        <ChinaManufacturingClustersSection />
      </MotionSection>

      {/* ── 6. Tu Historial (Browsing History) Section ── */}
      <MotionSection effect="fade-up" delay={95}>
        <BrowsingHistorySection />
      </MotionSection>

      {/* ── 7. Lennox Sourcing Assurance Strip ── */}
      <MotionSection effect="fade-up" delay={100}>
        <SourcingAssuranceSection />
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
