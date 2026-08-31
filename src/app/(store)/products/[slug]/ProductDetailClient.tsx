"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Plane,
  Coins,
  Maximize2,
  Plus,
  Minus,
  CheckCircle2,
  Scale,
  Star,
  Clock,
  Flame,
  Share2,
  Copy,
  ChevronRight,
  ChevronLeft,
  Play,
  Film,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Ship,
  Box,
} from "lucide-react";
import { Product, Category } from "@/types/database";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { RelatedProductsSection } from "@/components/product/RelatedProductsSection";
import { ProductReviewsAndQA } from "@/components/product/ProductReviewsAndQA";
import { ProductQASection } from "@/components/product/ProductQASection";
import { Modal } from "@/components/ui/Modal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ReelsVideoModal, ReelsVideoData } from "@/components/common/ReelsVideoModal";
import { useCartStore } from "@/store/useCartStore";
import { calculateComprehensiveShipping } from "@/utils/shipping";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCompareStore } from "@/store/useCompareStore";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { formatCurrency, calcDiscount } from "@/utils/helpers";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ProductDetailClientProps {
  product?: Product | null;
  category?: Category | null;
  slug?: string;
}

export function ProductDetailClient({
  product: initialProduct,
  category: initialCategory,
  slug: urlSlug,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const searchSlug = urlSlug || initialProduct?.slug || initialProduct?.id || "";

  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const storeProduct = useProductStore((state) => (searchSlug ? state.getProductBySlug(searchSlug) : undefined));
  const isProductStoreLoaded = useProductStore((state) => state.isLoaded);
  const storeCategories = useCategoryStore((state) => state.categories);

  const product = initialProduct || (isMounted ? storeProduct : undefined);
  const category =
    (storeCategories && storeCategories.find((c) => c.id === product?.category_id)) ||
    initialCategory ||
    (product?.category_id ? MOCK_CATEGORIES.find((c) => c.id === product.category_id) : null);

  // Media & Gallery States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<ReelsVideoData | null>(null);
  const [activeTab, setActiveTab] = useState<"specs" | "qc_report" | "reviews" | "qa" | "shipping">("specs");
  const [qaCount, setQaCount] = useState(3);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Swipe gesture for gallery
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent, total: number) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = (touchStartX.current || 0) - (touchEndX.current || 0);
    if (Math.abs(diff) > 40) {
      if (diff > 0) setSelectedImageIndex((prev) => (prev + 1) % total);
      else setSelectedImageIndex((prev) => (prev - 1 + total) % total);
    }
  };

  // Flash deal countdown timer
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    if (!product?.is_flash_deal) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [product?.is_flash_deal]);

  // Stores
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const isInWishlist = useWishlistStore((state) => (product?.id ? state.isInWishlist(product.id) : false));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInCompare = useCompareStore((state) => (product?.id ? state.isInCompare(product.id) : false));
  const toggleCompare = useCompareStore((state) => state.toggleItem);
  const addProductToHistory = useHistoryStore((state) => state.addProduct);

  const mountedIsInWishlist = isMounted && isInWishlist;
  const mountedIsInCompare = isMounted && isInCompare;

  // Track product in browsing history
  useEffect(() => {
    if (product) {
      addProductToHistory(product);
    }
  }, [product, addProductToHistory]);

  // Scroll listener for sticky action bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fallback and loading states if product is not resolved
  if (!product) {
    if (!isMounted) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="h-6 w-64 bg-slate-200 rounded mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 aspect-square bg-slate-200 rounded-3xl" />
              <div className="lg:col-span-4 space-y-4">
                <div className="h-8 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-24 bg-slate-200 rounded-2xl" />
                <div className="h-12 bg-slate-200 rounded-2xl" />
              </div>
              <div className="lg:col-span-3 space-y-4">
                <div className="h-48 bg-slate-200 rounded-2xl" />
                <div className="h-48 bg-slate-200 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="w-16 h-16 bg-red-50 text-[#FF1028] rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#00143D] font-heading">
              Product Not Found
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              The product you are looking for ({searchSlug || "item"}) could not be located in our catalogue.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00143D] hover:bg-[#002366] text-white text-xs font-bold font-heading uppercase tracking-wider transition-colors shadow-xs"
            >
              Browse Catalogue
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              All Departments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Derived variant data
  const currentVariant = product.variants?.[selectedVariantIndex];
  const activePrice = currentVariant?.price || product.base_price;
  const activeComparePrice = currentVariant?.compare_at_price || product.compare_at_price || (product.is_flash_deal ? activePrice * 1.45 : undefined);
  const discount = activeComparePrice ? calcDiscount(activeComparePrice, activePrice) : 0;
  const savings = activeComparePrice ? Math.max(0, activeComparePrice - activePrice) : 0;
  const activeStock = currentVariant?.stock ?? 50;
  const isOutOfStock = activeStock <= 0;

  // Media gallery list
  const fallbackUrl = "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80";
  const images = (product.media && product.media.length > 0)
    ? product.media.map((m) => m.url).filter(Boolean)
    : [
        fallbackUrl,
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80",
      ];

  // Helper for video embed thumbnails
  const getEmbedThumbnail = (url: string): string | undefined => {
    if (!url) return undefined;
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (url.includes("/embed/")) {
      const id = url.split("/embed/")[1]?.split("?")[0];
      if (id && !id.includes("/")) {
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }
    }
    return undefined;
  };

  // Dynamic Video Configurations (Uses direct video frames, not product gallery photos)
  const video1Config = product.videos?.[0];
  const video1Url = video1Config?.url || "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov";
  const video1Title = video1Config?.title || `${product.title} — Hardware Teardown QC`;
  const isVideo1Embed = video1Url.includes("youtube") || video1Url.includes("vimeo") || video1Url.includes("/embed/");
  const video1Poster = isVideo1Embed ? getEmbedThumbnail(video1Url) : undefined;

  const video2Config = product.videos?.[1];
  const video2Url = video2Config?.url || "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov";
  const video2Title = video2Config?.title || `${product.title} — Live Performance & Stress Test`;
  const isVideo2Embed = video2Url.includes("youtube") || video2Url.includes("vimeo") || video2Url.includes("/embed/");
  const video2Poster = isVideo2Embed ? getEmbedThumbnail(video2Url) : undefined;

  // Dynamic Specifications
  const dynamicSpecs = useMemo(() => {
    const specsMap: Record<string, string> = {};

    if (product.specifications && typeof product.specifications === "object") {
      Object.assign(specsMap, product.specifications);
    }
    if (product.specs && typeof product.specs === "object") {
      Object.assign(specsMap, product.specs);
    }

    const dims = (product.dimensions && typeof product.dimensions === "object" ? product.dimensions : null) as any;
    const dimensionStr = dims && dims.length && dims.width && dims.height
      ? `${dims.length} × ${dims.width} × ${dims.height} ${dims.unit || "cm"}`
      : "30.0 × 20.0 × 12.0 cm";

    const cargoLabels: Record<string, string> = {
      general: "General Cargo (普货 - Non-Battery)",
      lithium_built_in: "Built-in Lithium Battery (PI967 Air Cargo Pass)",
      lithium_pure: "Pure Battery / Power Bank (PI965 Special Line)",
      liquid_cream: "Liquid / Cream / Cosmetics (Airfreight Certified)",
      magnetic: "Magnetized Goods (Shielded & Inspected)",
      powder: "Powder / Chemical (Lab Tested)",
    };

    const packageLabels: Record<string, string> = {
      corrugated_box: "Double-Wall Corrugated Air-Cargo Box",
      bubble_mailer: "Padded Waterproof Bubble Mailer",
      retail_box: "Original Factory Retail Color Box",
      wooden_crate: "Reinforced Wooden Pallet / Crate",
      anti_static: "Anti-Static Shielding Bag",
    };

    const defaults: Record<string, string> = {
      "Manufacturing Origin": product.shipping_origin || "Shenzhen / Guangdong, China",
      "Package Dimensions": dimensionStr,
      "Gross Shipping Weight": product.weight ? `${product.weight} kg` : "0.85 kg",
      "Net Product Weight": product.net_weight ? `${product.net_weight} kg` : (product.weight ? `${(product.weight * 0.8).toFixed(2)} kg` : "0.65 kg"),
      "Cargo Classification": cargoLabels[product.cargo_type || ""] || "Built-in Lithium Battery (PI967 Air Cargo Pass)",
      "Packaging Container": packageLabels[product.package_type || ""] || "Double-Wall Corrugated Air-Cargo Box",
      "Dispatch SLA": product.lead_time || "Same Day Dispatch (Within 24h)",
      "HS Customs Code": product.hs_code || "8517.62.00",
      "QC Certification": "100% Pre-Departure Dual Laser & Load Tested (Grade A+)",
      "SKU Identifier": currentVariant?.sku || product.sku,
      "Direct Brand": product.brand?.name || "Lennox Direct Factory",
      "Department / Cluster": category?.name || "Hardware & Electronics",
      "Payment Escrow": "Binance Pay USDT (Zero Gas Fees & Instant Escrow)",
      "Warranty & Guarantee": "30-Day Money-Back Guarantee + 1-Year Direct Factory Support",
    };

    return { ...defaults, ...specsMap };
  }, [product, currentVariant, category]);

  const shippingMethod = useCartStore((state) => state.shippingMethod);
  const setShippingMethod = useCartStore((state) => state.setShippingMethod);

  // Dynamic Live Freight Calculation for Current Product & Quantity
  const productShippingPreview = useMemo(() => {
    return calculateComprehensiveShipping([
      {
        id: currentVariant?.id || product.id,
        productId: product.id,
        title: product.title,
        quantity,
        dimensions: product.dimensions,
        weight: product.weight,
        cargoType: product.cargo_type,
      },
    ]);
  }, [product, currentVariant, quantity]);

  // Handlers
  const handleAddToCart = (openDrawer = true) => {
    if (isOutOfStock) return;

    addItem({
      id: currentVariant?.id || product.id,
      productId: product.id,
      variantId: currentVariant?.id,
      title: product.title,
      slug: product.slug,
      image: images[0],
      price: activePrice,
      compareAtPrice: activeComparePrice,
      quantity,
      stock: activeStock,
      attributes: currentVariant?.attributes as Record<string, string>,
      supplierCode: product.supplier_code || undefined,
      dimensions: product.dimensions || undefined,
      weight: product.weight ?? undefined,
      cargoType: product.cargo_type || undefined,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);

    if (openDrawer) {
      openCart();
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(false);
    router.push("/checkout");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      {/* ── 1. Top Breadcrumbs & Factory Trust Micro-Strip ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-2.5 sm:py-3 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 md:gap-2.5">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                {
                  label: category?.name || "Departments",
                  href: category ? `/categories/${category.slug}` : "/categories",
                },
                { label: product.title },
              ]}
            />

            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Shenzhen Sourcing Hub Active
              </span>
              <span className="text-slate-500 font-medium">
                100% Pre-Departure QC Tested
              </span>
            </div>

            {/* Mobile-only trust strip */}
            <div className="flex sm:hidden items-center gap-3 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                QC Verified
              </span>
              <span>•</span>
              <span>5–8 Day Air Cargo</span>
              <span>•</span>
              <span>USDT Pay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {addedToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Added {quantity} item(s) to cart at factory price!</span>
        </div>
      )}

      {/* ── 2. Main Product Hero (Gallery + Buy Box + Right-Hand Dual Video Column) ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Column: Media Gallery (Sticky on Desktop) ── */}
          <div className="lg:col-span-5 space-y-3.5 lg:sticky lg:top-20 self-start order-1">
            {/* Main Featured Image Container */}
            <div
              className="relative w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md group"
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, images.length)}
            >
              <Image
                src={images[selectedImageIndex] || fallbackUrl}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              {/* Top Badges */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 sm:gap-2 z-10">
                {discount > 0 && (
                  <span className="bg-[#FF1028] text-white text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg uppercase tracking-wider font-heading shadow-md">
                    -{discount}% OFF
                  </span>
                )}
                {product.is_flash_deal && (
                  <span className="bg-[#00143D] text-amber-300 text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg flex items-center gap-1 sm:gap-1.5 border border-amber-300/30 uppercase tracking-wide shadow-md">
                    <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-300" /> FLASH
                  </span>
                )}
              </div>

              {/* Swipe hint arrows (mobile only) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center z-10 sm:hidden"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center z-10 sm:hidden"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image Count & Zoom Hint */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10 flex items-center gap-2">
                <span className="bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-mono font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-white/15 shadow-sm">
                  {selectedImageIndex + 1} / {images.length}
                </span>
              </div>

              {/* Lightbox Trigger */}
              <button
                onClick={() => setIsZoomModalOpen(true)}
                className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-md text-slate-700 hover:text-[#00143D] flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer border border-slate-200"
                title="Expand Fullscreen"
                aria-label="Expand image"
              >
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Thumbnail Strip — horizontal scroll on mobile, grid on tablet+ */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 sm:grid sm:grid-cols-5 sm:overflow-x-visible no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative shrink-0 w-14 h-14 sm:w-auto sm:h-auto sm:aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-white border-2 transition-all cursor-pointer touch-manipulation ${
                    selectedImageIndex === idx
                      ? "border-[#FF1028] shadow-md ring-2 ring-[#FF1028]/20"
                      : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View product photo ${idx + 1}`}
                >
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* ── 4 Sourcing & Guarantee Highlight Cards (Matches Wireframe / Layout) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
              <div className="bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col justify-between group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black text-slate-900 font-heading leading-tight">
                    100% QC Pass
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-snug">
                  Lab bench verified
                </p>
              </div>

              <div className="bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-xs transition-all flex flex-col justify-between group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 group-hover:scale-105 transition-transform">
                    <Zap className="w-3.5 h-3.5 fill-blue-600" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black text-slate-900 font-heading leading-tight">
                    Direct Sourcing
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-snug">
                  0 Middleman markup
                </p>
              </div>

              <div className="bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-500 hover:shadow-xs transition-all flex flex-col justify-between group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/60 group-hover:scale-105 transition-transform">
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black text-slate-900 font-heading leading-tight">
                    5–8d Air Cargo
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-snug">
                  Express air courier
                </p>
              </div>

              <div className="bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-500 hover:shadow-xs transition-all flex flex-col justify-between group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60 group-hover:scale-105 transition-transform">
                    <Coins className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black text-slate-900 font-heading leading-tight">
                    USDT Escrow
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-snug">
                  30-day money back
                </p>
              </div>
            </div>
          </div>

          {/* ── Middle Column: Purchase Configurator & Buy Box (4 Cols on Desktop) ── */}
          <div className="lg:col-span-4 space-y-3.5 sm:space-y-5 order-3 lg:order-2">
            {/* Header / Title / Brand / SKU */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-600 font-mono bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/60 truncate max-w-[160px] sm:max-w-none">
                  {product.brand?.name || "Direct Factory Hardware"}
                </span>
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(currentVariant?.sku || product.sku);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }
                  }}
                  className="text-[10px] font-mono text-slate-500 hover:text-[#00143D] flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
                  title="Click to copy SKU"
                >
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">SKU: {currentVariant?.sku || product.sku}</span>
                  <span className="sm:hidden">{(currentVariant?.sku || product.sku).slice(0, 10)}</span>
                </button>
              </div>

              <h1 className="text-base sm:text-xl lg:text-2xl font-black font-heading text-[#00143D] leading-snug tracking-tight">
                {product.title}
              </h1>

              {/* Rating & Sold & Q&A Row */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 text-xs pt-0.5 flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab("reviews");
                    const el = document.getElementById("product-tabs-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-black text-slate-900">{(product.avg_rating || 4.9).toFixed(1)}</span>
                  <span className="text-slate-400">({product.review_count || 32} reviews)</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => {
                    setActiveTab("qa");
                    const el = document.getElementById("product-tabs-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-1 hover:underline cursor-pointer text-slate-600 hover:text-[#00143D]"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-slate-700">{qaCount} Q&amp;As</span>
                </button>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px]">
                  {product.sold_count >= 1000
                    ? `${(product.sold_count / 1000).toFixed(1)}k+ orders`
                    : `${product.sold_count || 85} sold`}
                </span>
                <button
                  onClick={handleShare}
                  className="ml-auto text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{copiedLink ? "Copied!" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* ── Price Block & Flash Sale Countdown (Minimalist Dark Glassmorphism) ── */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-[#000B24] text-white space-y-3 border border-slate-800 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                    Direct Wholesale Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono leading-none">
                      {formatCurrency(activePrice)}
                    </span>
                    {activeComparePrice && activeComparePrice > activePrice && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ${activeComparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {savings > 0 && (
                  <span className="bg-[#FF1028] text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-lg uppercase font-heading shadow-xs shrink-0">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              {/* Flash Drop Micro Timer */}
              {product.is_flash_deal && (
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#00143D] border border-amber-300/30 flex items-center justify-between text-xs font-mono text-amber-300">
                  <span className="flex items-center gap-1.5 font-bold text-white text-[10px] sm:text-[11px]">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 animate-pulse" />
                    <span className="hidden xs:inline">Sourcing Deal Ends:</span>
                    <span className="xs:hidden">Ends:</span>
                  </span>
                  <span className="font-black text-xs text-amber-300">
                    {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              )}

              {/* Interactive Coupon Voucher Callout */}
              <div
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText("LENNOX10");
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center justify-between cursor-pointer border border-white/10 transition-colors"
                title="Click to copy coupon code"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-medium">Extra 10% Off:</span>
                </div>
                <span className="bg-[#FF1028] text-white font-black px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 shrink-0">
                  <span>LENNOX10</span>
                  <Copy className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>

            {/* ── Variant Selectors ── */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#00143D] uppercase tracking-wider font-heading">
                    Model / Configuration
                  </span>
                  <span className="text-xs font-mono font-bold text-[#FF1028]">
                    {currentVariant?.title || currentVariant?.sku}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedVariantIndex === idx
                          ? "border-[#00143D] bg-slate-900 text-white shadow-xs ring-1 ring-[#00143D]"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-800"
                      }`}
                    >
                      <span className="text-xs font-bold block truncate">{variant.title || variant.sku}</span>
                      <span className="text-[11px] font-mono font-bold mt-0.5 block text-emerald-600 dark:text-emerald-400">
                        ${variant.price.toFixed(2)} USDT
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Quantity & Live Inventory Stock State ── */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Quantity</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  {isOutOfStock ? "Out of Stock" : `In Stock (${activeStock} Units)`}
                </span>
              </div>

              {/* Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center text-xs font-mono font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                  disabled={quantity >= activeStock || isOutOfStock}
                  className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Primary Action Buttons ── */}
            <div className="space-y-2">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3.5 rounded-2xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-black font-heading text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white shrink-0" />
                {/* Short text on mobile, full text on sm+ */}
                <span className="sm:hidden">Buy Now — ${(activePrice * quantity).toFixed(2)} USDT</span>
                <span className="hidden sm:inline">Buy Now with Binance Pay (${(activePrice * quantity).toFixed(2)} USDT)</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 min-h-[44px] rounded-2xl bg-[#00143D] hover:bg-[#002366] text-white font-black font-heading text-xs uppercase tracking-wider transition-all shadow-xs active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span className="sm:hidden">Cart</span>
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>

                <button
                  onClick={() =>
                    toggleWishlist({
                      id: `w-${product.id}`,
                      productId: product.id,
                      title: product.title,
                      slug: product.slug,
                      image: images[0],
                      price: activePrice,
                      compareAtPrice: activeComparePrice,
                      rating: product.avg_rating || 5.0,
                      reviewCount: product.review_count || 12,
                    })
                  }
                  className={`min-w-[44px] min-h-[44px] px-3 rounded-2xl border-2 transition-all flex items-center justify-center cursor-pointer ${
                    mountedIsInWishlist
                      ? "bg-red-50 border-[#FF1028] text-[#FF1028]"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                  title="Wishlist"
                  aria-label="Add to wishlist"
                >
                  <Heart className={`w-4 h-4 ${mountedIsInWishlist ? "fill-[#FF1028]" : ""}`} />
                </button>

                <button
                  onClick={() =>
                    toggleCompare({
                      id: `c-${product.id}`,
                      productId: product.id,
                      title: product.title,
                      slug: product.slug,
                      image: images[0],
                      price: activePrice,
                      rating: product.avg_rating || 5.0,
                      brand: product.brand?.name || "Direct Factory",
                    })
                  }
                  className={`min-w-[44px] min-h-[44px] px-3 rounded-2xl border-2 transition-all flex items-center justify-center cursor-pointer ${
                    mountedIsInCompare
                      ? "bg-blue-50 border-blue-200 text-blue-600"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                  title="Compare"
                  aria-label="Add to compare"
                >
                  <Scale className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Dynamic International Freight Logistics Calculator ── */}
            <div className="p-4 sm:p-4.5 rounded-3xl bg-gradient-to-b from-white to-slate-50/60 border border-slate-200/90 shadow-xs space-y-3.5 text-xs font-montserrat">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-900 block">
                      Freight Route &amp; Cost
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Live calculated for {quantity} {quantity === 1 ? "unit" : "units"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px] bg-slate-100/80 text-slate-700 font-bold px-2.5 py-1 rounded-full border border-slate-200/60">
                  <Box className="w-3 h-3 text-slate-500" />
                  <span>{productShippingPreview.totalGrossWeight.toFixed(2)} kg</span>
                  <span className="text-slate-300">•</span>
                  <span>{productShippingPreview.totalCbm.toFixed(4)} m³</span>
                </div>
              </div>

              {/* Air vs Sea Premium Segmented Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setShippingMethod("air")}
                  className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    shippingMethod === "air"
                      ? "bg-white text-[#00143D] shadow-xs ring-1 ring-slate-900/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase flex items-center gap-1.5 font-heading">
                      <Zap className={`w-3.5 h-3.5 ${shippingMethod === "air" ? "fill-blue-500 text-blue-600" : "text-slate-400"}`} />
                      Air Express
                    </span>
                    <span className={`text-xs font-mono font-black ${shippingMethod === "air" ? "text-blue-600" : "text-slate-700"}`}>
                      {productShippingPreview.air.totalCost === 0 ? "FREE" : `$${productShippingPreview.air.totalCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">{t.product.airLeadDays}</span>
                    <span className="text-[9px] font-bold font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">Fastest</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod("sea")}
                  className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    shippingMethod === "sea"
                      ? "bg-white text-[#00143D] shadow-xs ring-1 ring-slate-900/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase flex items-center gap-1.5 font-heading">
                      <Ship className={`w-3.5 h-3.5 ${shippingMethod === "sea" ? "text-blue-600" : "text-slate-400"}`} />
                      Sea Container
                    </span>
                    <span className={`text-xs font-mono font-black ${shippingMethod === "sea" ? "text-blue-600" : "text-slate-700"}`}>
                      {productShippingPreview.sea.totalCost === 0 ? "FREE" : `$${productShippingPreview.sea.totalCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">{t.product.seaLeadDays}</span>
                    <span className="text-[9px] font-bold font-mono text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">Lowest Rate</span>
                  </div>
                </button>
              </div>

              {/* Minimal Telemetry Pill & Customs Route */}
              <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {product.shipping_origin || "Shenzhen Hub Departure"} • {t.product.ddpPreCleared}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {shippingMethod === "sea"
                    ? `${productShippingPreview.sea.chargeableMetric} CBM billable`
                    : `${productShippingPreview.air.chargeableMetric} kg billable`}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right Column: 2 Factory QC Videos (Larger Size & Fully Responsive) ── */}
          <div className="lg:col-span-3 space-y-3.5 lg:sticky lg:top-20 self-start w-full order-2 lg:order-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#FF1028]" />
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-slate-900">
                  Factory QC Videos
                </h4>
              </div>
              <span className="text-[9px] text-amber-700 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                1080P QC PASS
              </span>
            </div>

            {/* Responsive grid: Stacked on mobile & desktop, 2-col on tablets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5 sm:gap-4">
              {/* Video 1 Card — Enlarged, Rich Visuals & Sizing */}
              <div
                onClick={() =>
                  setActiveVideoModal({
                    title: video1Title,
                    subtitle: "Shenzhen Inspection Lab Benchmark • 100% Signal & Load Testing",
                    tag: "QC LAB BENCHMARK",
                    hub: product.shipping_origin || "Shenzhen SZX Hub",
                    productPrice: activePrice,
                    productLink: `/products/${product.slug}`,
                    poster: video1Poster,
                    videoUrl: video1Url,
                  })
                }
                className="group relative h-60 sm:h-64 lg:h-60 xl:h-64 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer hover:border-[#FF1028] shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Live Video Preview — Uses Actual Video Stream / Frame */}
                {isVideo1Embed ? (
                  <iframe
                    src={video1Url}
                    title={video1Title}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-95"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video
                    src={video1Url}
                    poster={video1Poster}
                    playsInline
                    autoPlay
                    muted
                    loop
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000B24] via-[#000B24]/40 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm font-heading flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    VIDEO 1
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-black/70 backdrop-blur-xs text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-emerald-400/30">
                      1080P
                    </span>
                    <span className="bg-black/70 backdrop-blur-xs text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-300/30">
                      LIVE QC
                    </span>
                  </div>
                </div>

                {/* Center Play Button Overlay */}
                <div className="relative z-10 my-auto flex justify-center py-2 pointer-events-none">
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#E00B20] ring-4 ring-white/20 transition-all">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>

                {/* Card Footer Details */}
                <div className="relative z-10 space-y-1 bg-black/50 backdrop-blur-xs p-2.5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs sm:text-sm font-black text-white leading-tight font-heading group-hover:text-amber-300 transition-colors truncate">
                      {video1Config?.title || "Hardware Teardown QC"}
                    </h5>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">PASSED</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-1">
                    {product.shipping_origin || "Shenzhen Inspection Lab Benchmark"}
                  </p>
                </div>
              </div>

              {/* Video 2 Card — Enlarged, Rich Visuals & Sizing */}
              <div
                onClick={() =>
                  setActiveVideoModal({
                    title: video2Title,
                    subtitle: "Live Sourcing QC • Direct Verification",
                    tag: "FACTORY STRESS DEMO",
                    hub: product.shipping_origin || "Shenzhen SZX Hub",
                    productPrice: activePrice,
                    productLink: `/products/${product.slug}`,
                    poster: video2Poster,
                    videoUrl: video2Url,
                  })
                }
                className="group relative h-60 sm:h-64 lg:h-60 xl:h-64 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer hover:border-[#FF1028] shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Live Video Preview — Uses Actual Video Stream / Frame */}
                {isVideo2Embed ? (
                  <iframe
                    src={video2Url}
                    title={video2Title}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-95"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video
                    src={video2Url}
                    poster={video2Poster}
                    playsInline
                    autoPlay
                    muted
                    loop
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000B24] via-[#000B24]/40 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm font-heading flex items-center gap-1.5">
                    <Film className="w-3 h-3" />
                    VIDEO 2
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-black/70 backdrop-blur-xs text-blue-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-blue-400/30">
                      60 FPS
                    </span>
                    <span className="bg-black/70 backdrop-blur-xs text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-300/30">
                      LIVE DEMO
                    </span>
                  </div>
                </div>

                {/* Center Play Button Overlay */}
                <div className="relative z-10 my-auto flex justify-center py-2 pointer-events-none">
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-blue-500 ring-4 ring-white/20 transition-all">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>

                {/* Card Footer Details */}
                <div className="relative z-10 space-y-1 bg-black/50 backdrop-blur-xs p-2.5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs sm:text-sm font-black text-white leading-tight font-heading group-hover:text-amber-300 transition-colors truncate">
                      {video2Config?.title || "Live Performance Test"}
                    </h5>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">PASSED</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-1">
                    100% Full Load Stability &amp; Stress Pass
                  </p>
                </div>
              </div>
            </div>

            {/* QC Guarantee Card filling bottom space cleanly */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 font-heading">
                  Shenzhen Inspection Guarantee
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Every unit is recorded, tested, and certified before international cargo dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Expandable Deep Information Tabs ── */}
        <div id="product-tabs-section" className="mt-8 sm:mt-16 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                activeTab === "specs"
                  ? "bg-white text-[#FF1028] border-b-2 border-[#FF1028]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="sm:hidden">{t.product.specifications}</span>
              <span className="hidden sm:inline">{t.product.specifications}</span>
            </button>
            <button
              onClick={() => setActiveTab("qc_report")}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                activeTab === "qc_report"
                  ? "bg-white text-[#FF1028] border-b-2 border-[#FF1028]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="sm:hidden">{t.product.factoryVideos}</span>
              <span className="hidden sm:inline">Shenzhen QC &amp; {t.product.factoryVideos}</span>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-white text-[#FF1028] border-b-2 border-[#FF1028]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="sm:hidden">{t.product.customerReviews}</span>
              <span className="hidden sm:inline">{t.product.customerReviews} ({product.review_count || 32})</span>
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                activeTab === "qa"
                  ? "bg-white text-[#FF1028] border-b-2 border-[#FF1028]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="sm:hidden">{t.product.sourcingQA}</span>
              <span className="hidden sm:inline flex items-center gap-1.5">
                <span>{t.product.sourcingQA}</span>
                <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {qaCount}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                activeTab === "shipping"
                  ? "bg-white text-[#FF1028] border-b-2 border-[#FF1028]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="sm:hidden">{t.product.shippingCalculator}</span>
              <span className="hidden sm:inline">{t.common.directChinaAirfreight}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 md:p-8 text-xs text-slate-700">
            {/* Specs Tab */}
            {activeTab === "specs" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-black text-[#00143D] mb-2 font-heading">
                    Product Overview
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {product.description || product.short_description || "Direct factory manufactured with high-grade components. Fully tested for export compliance and backed by Lennox 30-Day Money-Back Warranty."}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-[11px] sm:text-xs divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(dynamicSpecs).map(([label, value], idx) => (
                        <tr key={label} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-slate-500 w-2/5 sm:w-1/3 align-top">
                            {label}
                          </td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-slate-900 break-words">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* QC Report Tab */}
            {activeTab === "qc_report" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-heading font-black text-xs">100% Pre-Departure Quality Pass</h4>
                    <p className="text-[11px] text-emerald-800">
                      Every production lot undergoes voltage benchmarking, circuit integrity analysis, and packaging seal tests before departure to Hong Kong or Shenzhen airport hubs.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">Check 01</span>
                    <h5 className="font-bold text-slate-900 text-xs">Laser Gimbal Calibration</h5>
                    <p className="text-[11px] text-slate-500">3-axis motorized gyro deviation under 0.01°.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">Check 02</span>
                    <h5 className="font-bold text-slate-900 text-xs">Thermal &amp; Power Stress</h5>
                    <p className="text-[11px] text-slate-500">Continuous 4-hour full-load thermal scan.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">Check 03</span>
                    <h5 className="font-bold text-slate-900 text-xs">Drop &amp; Vibration Seal</h5>
                    <p className="text-[11px] text-slate-500">Custom double-wall airfreight cargo carton.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <ProductReviewsAndQA
                productId={product.id}
                productTitle={product.title}
                productImage={images[0]}
                categoryName={category?.name}
                variants={product.variants?.map((v) => ({
                  id: v.id,
                  title: v.title || v.sku || "Standard Edition",
                  sku: v.sku,
                }))}
              />
            )}

            {/* Customer Q&A Tab */}
            {activeTab === "qa" && (
              <ProductQASection
                productId={product.id}
                productTitle={product.title}
                productImage={images[0]}
                categoryName={category?.name}
                onQuestionCountChange={(count) => setQaCount(count)}
              />
            )}

            {/* Shipping & Warranty Tab */}
            {activeTab === "shipping" && (
              <div className="space-y-6 font-montserrat">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-xs uppercase tracking-wider text-slate-900">
                        Global Air &amp; Ocean Freight Guarantee
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Shipments depart directly from <span className="font-bold text-slate-900">{product.shipping_origin || "Shenzhen (SZX) Hub"}</span> with export customs pre-clearance under HS Code <span className="font-mono font-bold text-blue-700">{product.hs_code || "8517.62.00"}</span>.
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold font-mono text-emerald-700 bg-emerald-100/80 border border-emerald-200 self-start sm:self-auto">
                    100% DDP Covered
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">01. Dimensions</span>
                      <Box className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-mono">
                        {dynamicSpecs["Package Dimensions"]}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Gross Wt: {dynamicSpecs["Gross Shipping Weight"]}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">02. Dispatch SLA</span>
                      <Clock className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {product.lead_time || "Same Day Dispatch (24h)"}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Shenzhen Airport Flight Facility</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider">03. DG Class</span>
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs truncate">
                        {dynamicSpecs["Cargo Classification"]}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">PI967 Certified Air Passenger Pass</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider">04. Customs Code</span>
                      <ShieldCheck className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-mono">
                        HS {product.hs_code || "8517.62.00"}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Fast-track automated manifest</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-heading font-black text-xs uppercase tracking-wider block">
                        30-Day Money-Back Warranty &amp; Binance Pay Escrow
                      </span>
                      <span className="text-[11px] text-slate-300">
                        Disputes settled instantly in USDT via Binance escrow with zero gateway surcharge.
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-[11px] font-mono shrink-0 uppercase tracking-wider">
                    Buyer Protected
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. Dynamic 5-in-a-Row Auto-Scrolling Related Products Section ── */}
        <RelatedProductsSection currentProduct={product} category={category} />
      </div>

      {/* ── 5. Sticky Bottom Action Bar on Mobile (sits above MobileNav tab bar) ── */}
      {showStickyBar && (
        <div
          className="fixed left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:hidden"
          style={{ bottom: 'calc(58px + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200">
                <Image src={images[0]} alt={product.title} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-900 block truncate">{product.title}</span>
                <span className="text-sm font-black font-mono text-[#FF1028]">
                  {formatCurrency(activePrice * quantity)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAddToCart(true)}
                disabled={isOutOfStock}
                className="bg-[#00143D] text-white p-2.5 rounded-xl font-black cursor-pointer disabled:opacity-50"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="bg-[#FF1028] text-white px-4 py-2.5 rounded-xl font-black font-heading text-xs uppercase tracking-wider shadow-md shrink-0 cursor-pointer disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Fullscreen Zoom Modal ── */}
      <Modal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        title={product.title}
        size="lg"
      >
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black">
          <Image
            src={images[selectedImageIndex] || fallbackUrl}
            alt={product.title}
            fill
            className="object-contain"
          />
        </div>
      </Modal>

      {/* ── 7. QC Reels Video Modal ── */}
      <ReelsVideoModal
        isOpen={!!activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
        videoData={activeVideoModal}
      />
    </div>
  );
}
