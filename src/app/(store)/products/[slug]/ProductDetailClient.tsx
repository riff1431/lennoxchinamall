"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Plane,
  Coins,
  Maximize2,
  Check,
  Plus,
  Minus,
  CheckCircle2,
  Factory,
  Scale,
  Star,
  Clock,
  Flame,
  Award,
  Video,
  Share2,
  Copy,
  AlertTriangle,
  RotateCcw,
  Package,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Film,
  Truck,
  HelpCircle,
  ThumbsUp,
  Filter,
  ArrowRight,
} from "lucide-react";
import { Product, Category } from "@/types/database";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductReviewsAndQA } from "@/components/product/ProductReviewsAndQA";
import { Rating } from "@/components/ui/Rating";
import { Modal } from "@/components/ui/Modal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCompareStore } from "@/store/useCompareStore";
import { formatCurrency, calcDiscount } from "@/utils/helpers";

interface ProductDetailClientProps {
  product: Product;
  category?: Category | null;
}

export function ProductDetailClient({ product, category }: ProductDetailClientProps) {
  const router = useRouter();

  // Media & Gallery States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [destinationCountry, setDestinationCountry] = useState("United States");
  const [addedToast, setAddedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{ title: string; url: string; tag: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"specs" | "qc_report" | "reviews" | "shipping">("specs");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | "all">("all");

  // Flash deal countdown timer
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    if (!product.is_flash_deal) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [product.is_flash_deal]);

  // Stores
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInCompare = useCompareStore((state) => state.isInCompare(product.id));
  const toggleCompare = useCompareStore((state) => state.toggleItem);

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
  const images = product.media && product.media.length > 0
    ? product.media.map((m) => m.url)
    : [
        fallbackUrl,
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80",
      ];

  // Related products
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category_id === product.category_id || p.is_best_seller)
  ).slice(0, 4);

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
      {/* ── 1. Top Breadcrumbs ── */}
      <div className="bg-white border-b border-slate-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </div>

      {/* Toast Alert */}
      {addedToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Added {quantity} item(s) to cart at factory price!</span>
        </div>
      )}

      {/* ── 2. Main Product Hero (Gallery + Purchase Configurator) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ── Left Column: Media Gallery + Factory Video Spotlight (7 Cols) ── */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col-reverse sm:flex-row gap-4">
              {/* Thumbnail Strip */}
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] scrollbar-none shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-[#FF1028] shadow-md ring-2 ring-[#FF1028]/20"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Featured Image Container */}
              <div className="relative flex-1 aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md group">
                <Image
                  src={images[selectedImageIndex] || fallbackUrl}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {discount > 0 && (
                    <span className="bg-[#FF1028] text-white text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider font-heading shadow-md">
                      -{discount}% OFF
                    </span>
                  )}
                  {product.is_flash_deal && (
                    <span className="bg-[#00143D] text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-amber-300/30 uppercase tracking-wide shadow-md">
                      <Flame className="w-3.5 h-3.5 fill-amber-300" /> FLASH DROP
                    </span>
                  )}
                </div>

                {/* Lightbox Trigger */}
                <button
                  onClick={() => setIsZoomModalOpen(true)}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md text-slate-700 hover:text-[#00143D] flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer border border-slate-200"
                  title="Expand Fullscreen"
                  aria-label="Expand image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── 2 Direct Factory Video Spotlight Cards ── */}
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#FF1028]" />
                  <h4 className="font-heading font-black text-xs uppercase tracking-wider text-white">
                    Verified Factory QC Videos
                  </h4>
                </div>
                <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  SHENZHEN LAB TESTED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Video 1: Teardown Bench */}
                <div
                  onClick={() =>
                    setActiveVideoModal({
                      title: `${product.title} — QC Teardown & Circuit Inspection`,
                      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
                      tag: "QC LAB BENCHMARK",
                    })
                  }
                  className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between cursor-pointer hover:border-[#FF1028] transition-all"
                >
                  <Image
                    src={images[1] || images[0]}
                    alt="QC Video 1"
                    fill
                    className="object-cover opacity-40 group-hover:opacity-55 transition-opacity"
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                      VIDEO 1
                    </span>
                    <span className="text-[9px] text-slate-300 font-mono">02:15</span>
                  </div>
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-md">
                      <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      Hardware Teardown QC
                    </span>
                  </div>
                </div>

                {/* Video 2: Stress / Flight Test */}
                <div
                  onClick={() =>
                    setActiveVideoModal({
                      title: `${product.title} — 100% Full Load Stress & Performance Test`,
                      url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
                      tag: "FACTORY STRESS DEMO",
                    })
                  }
                  className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between cursor-pointer hover:border-[#FF1028] transition-all"
                >
                  <Image
                    src={images[2] || images[0]}
                    alt="QC Video 2"
                    fill
                    className="object-cover opacity-40 group-hover:opacity-55 transition-opacity"
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                      VIDEO 2
                    </span>
                    <span className="text-[9px] text-slate-300 font-mono">03:40</span>
                  </div>
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                      <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      Live Performance Test
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Purchase Configurator (5 Cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header / Title / Brand / SKU */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 font-mono bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {product.brand?.name || "Direct Factory Hardware"}
                </span>
                <span className="text-[11px] font-mono text-slate-400">SKU: {currentVariant?.sku || product.sku}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black font-heading text-[#00143D] leading-snug">
                {product.title}
              </h1>

              {/* Rating & Sold Row */}
              <div className="flex items-center gap-4 text-xs pt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-black text-slate-900">{(product.avg_rating || 4.9).toFixed(1)}</span>
                  <span className="text-slate-400">({product.review_count || 32} reviews)</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                  {product.sold_count >= 1000
                    ? `${(product.sold_count / 1000).toFixed(1)}k+ factory orders`
                    : `${product.sold_count || 85} sold`}
                </span>
                <button
                  onClick={handleShare}
                  className="ml-auto text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "Link Copied!" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* ── Price Block & Flash Sale Countdown ── */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-md">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Direct Wholesale Price
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-white font-mono leading-none">
                      {formatCurrency(activePrice)}
                    </span>
                    {activeComparePrice && activeComparePrice > activePrice && (
                      <span className="text-sm text-slate-400 line-through font-mono">
                        ${activeComparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {savings > 0 && (
                  <span className="bg-[#FF1028] text-white text-xs font-black px-2.5 py-1 rounded-xl uppercase font-heading shadow-md">
                    Save ${savings.toFixed(2)} USDT
                  </span>
                )}
              </div>

              {/* Flash Drop Micro Timer */}
              {product.is_flash_deal && (
                <div className="p-3 rounded-2xl bg-[#00143D] border border-amber-300/30 flex items-center justify-between text-xs font-mono text-amber-300">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <Clock className="w-4 h-4 text-amber-300" /> Flash Sourcing Deal Ends:
                  </span>
                  <span className="font-black text-sm text-amber-300">
                    {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              )}

              {/* Coupon Voucher Callout */}
              <div className="p-2.5 rounded-xl bg-white/10 text-slate-200 text-xs flex items-center justify-between">
                <span className="text-[11px]">Extra 10% Off with Coupon:</span>
                <span className="bg-[#FF1028] text-white font-black px-2 py-0.5 rounded font-mono text-[11px]">
                  LENNOX10
                </span>
              </div>
            </div>

            {/* ── Variant Selectors ── */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#00143D] uppercase tracking-wider font-heading">
                    Model / Spec Configuration
                  </span>
                  <span className="text-xs font-mono font-bold text-[#FF1028]">
                    {currentVariant?.title || currentVariant?.sku}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedVariantIndex === idx
                          ? "border-[#00143D] bg-slate-900 text-white shadow-md ring-2 ring-[#00143D]/20"
                          : "border-slate-200 hover:border-slate-400 bg-white text-slate-800"
                      }`}
                    >
                      <span className="text-xs font-bold block truncate">{variant.title || variant.sku}</span>
                      <span className="text-xs font-mono font-bold mt-1 block">
                        ${variant.price.toFixed(2)} USDT
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Quantity & Inventory Stock State ── */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Order Quantity</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isOutOfStock ? "Out of Stock" : `In Stock (${activeStock} units in Shenzhen)`}
                </span>
              </div>

              {/* Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-mono font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                  disabled={quantity >= activeStock || isOutOfStock}
                  className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Primary Action Buttons ── */}
            <div className="space-y-2.5">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-4 rounded-2xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-black font-heading text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now with Binance Pay (${(activePrice * quantity).toFixed(2)})</span>
              </button>

              <div className="grid grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock}
                  className="col-span-2 py-3.5 rounded-2xl bg-[#00143D] hover:bg-[#002366] text-white font-black font-heading text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
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
                  className={`py-3.5 rounded-2xl border transition-all flex items-center justify-center cursor-pointer ${
                    isInWishlist
                      ? "bg-red-50 border-red-200 text-[#FF1028]"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? "fill-[#FF1028]" : ""}`} />
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
                  className={`py-3.5 rounded-2xl border transition-all flex items-center justify-center cursor-pointer ${
                    isInCompare
                      ? "bg-blue-50 border-blue-200 text-blue-600"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                  title="Compare"
                >
                  <Scale className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Logistics SLA & Payment Security Guarantee ── */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Plane className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Air Express Cargo: 5–8 Business Days</span>
                  <span className="text-[11px] text-slate-500">
                    Tracked door-to-door via YunExpress / SF International / DHL. Free shipping on orders over $75 USDT.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-slate-200/80">
                <Coins className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Binance Pay USDT Zero-Fee Escrow</span>
                  <span className="text-[11px] text-slate-500">
                    Funds released upon verified airline delivery. 30-Day Money-Back Warranty policy.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Expandable Deep Information Tabs ── */}
        <div className="mt-16 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 overflow-x-auto">
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-6 py-4 text-xs font-black font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                activeTab === "specs"
                  ? "bg-white text-[#FF1028] border-b-2 border-[#FF1028]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab("qc_report")}
              className={`px-6 py-4 text-xs font-black font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                activeTab === "qc_report"
                  ? "bg-white text-[#FF1028] border-b-2 border-[#FF1028]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Shenzhen QC &amp; Factory Report
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-4 text-xs font-black font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-white text-[#FF1028] border-b-2 border-[#FF1028]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Customer Reviews ({product.review_count || 32})
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`px-6 py-4 text-xs font-black font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                activeTab === "shipping"
                  ? "bg-white text-[#FF1028] border-b-2 border-[#FF1028]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Airfreight &amp; Warranty
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8 text-xs text-slate-700">
            {/* Specs Tab */}
            {activeTab === "specs" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-black text-[#00143D] mb-2 font-heading">
                    Product Overview
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {product.description || "Direct factory manufactured with high-grade components. Fully tested for export compliance and backed by Lennox 30-Day Money-Back Warranty."}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-500 w-1/3">Manufacturing Origin</td>
                        <td className="py-3 px-4 font-bold text-slate-900">Shenzhen / Ningbo Tech Cluster, China</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-500">Quality Inspection Grade</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">Grade A+ Dual Laser Inspected</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-500">HS Customs Code</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">85176200 (Direct Air Transit)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-500">Gross Shipping Weight</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">1.25 kg (Reinforced Anti-Static Box)</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-500">Warranty Coverage</td>
                        <td className="py-3 px-4 font-bold text-slate-900">30-Day Money-Back Guarantee + 1-Year Factory Support</td>
                      </tr>
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

            {/* Reviews & Q&A Tab */}
            {activeTab === "reviews" && (
              <ProductReviewsAndQA
                productId={product.id}
                productTitle={product.title}
                productImage={images[0]}
                variants={product.variants?.map((v) => ({
                  id: v.id,
                  title: v.title || v.sku || "Standard Edition",
                  sku: v.sku,
                }))}
              />
            )}

            {/* Shipping & Warranty Tab */}
            {activeTab === "shipping" && (
              <div className="space-y-4">
                <h4 className="font-heading font-black text-xs uppercase text-slate-900">
                  Global Airfreight &amp; Customs Guarantee
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All shipments depart via Hong Kong (HKG) or Shenzhen (SZX) air cargo facilities directly to destination countries. Import duties are pre-cleared for North America and European Union destinations.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">30-Day Money-Back Warranty</span>
                    <span className="text-[11px] text-slate-500">Disputes settled instantly in USDT via Binance escrow.</span>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. Related Direct Factory Products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF1028] font-mono">
                  Sourced from Same Manufacturing Cluster
                </span>
                <h3 className="text-xl font-black font-heading text-[#00143D]">
                  Related Factory Hardware
                </h3>
              </div>
              <Link
                href="/categories"
                className="text-xs font-bold text-[#FF1028] hover:underline flex items-center gap-1"
              >
                <span>Explore All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 5. Sticky Bottom Action Bar on Mobile ── */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200">
                <Image src={images[0]} alt={product.title} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">{product.title}</span>
                <span className="text-sm font-black font-mono text-[#FF1028]">
                  ${(activePrice * quantity).toFixed(2)} USDT
                </span>
              </div>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="bg-[#FF1028] text-white px-5 py-2.5 rounded-xl font-black font-heading text-xs uppercase tracking-wider shadow-md shrink-0 cursor-pointer disabled:opacity-50"
            >
              Buy Now
            </button>
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

      {/* ── 7. QC Video Modal ── */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#00143D] border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden text-white">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/80">
              <div>
                <span className="text-[10px] font-black text-[#FF1028] uppercase font-mono block">
                  {activeVideoModal.tag}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{activeVideoModal.title}</h4>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <Image src={activeVideoModal.url} alt="Video Preview" fill className="object-cover opacity-60" />
              <div className="relative z-10 flex flex-col items-center gap-2 text-center p-4">
                <div className="w-14 h-14 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-xl animate-pulse">
                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                </div>
                <span className="text-xs font-bold text-slate-200">1080p 60FPS Laboratory Testing Stream</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
