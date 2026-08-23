"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, notFound } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Share2,
  Package,
  Clock,
  Sparkles,
  Info,
  Layers,
  Award,
  Plus,
  Minus,
  Plane,
  Coins,
  Star,
  CheckCircle2,
  Video,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Maximize2,
  Factory,
} from "lucide-react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mockData";
import { DualVideoModule } from "@/components/product/DualVideoModule";
import { ProductCard } from "@/components/product/ProductCard";
import { Rating } from "@/components/ui/Rating";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatCurrency, calcDiscount } from "@/utils/helpers";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  // Resilient slug lookup matching exact slug, partial slug, or domain keyword
  const product =
    MOCK_PRODUCTS.find((p) => p.slug === slug) ||
    MOCK_PRODUCTS.find((p) => p.slug.includes(slug) || slug.includes(p.slug)) ||
    (slug.includes("drone") ? MOCK_PRODUCTS.find((p) => p.slug.includes("drone")) : null) ||
    (slug.includes("printer") ? MOCK_PRODUCTS.find((p) => p.slug.includes("printer")) : null) ||
    (slug.includes("speaker") ? MOCK_PRODUCTS.find((p) => p.slug.includes("speaker")) : null) ||
    MOCK_PRODUCTS[0];

  if (!product) {
    return notFound();
  }

  const category = MOCK_CATEGORIES.find((c) => c.id === product.category_id);

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [destinationCountry, setDestinationCountry] = useState("United States");
  const [addedToast, setAddedToast] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "sourcing" | "reviews" | "shipping">("specs");
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Store actions
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product.id)
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  // Scroll listener for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 480) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentVariant = product.variants?.[selectedVariantIndex];
  const activePrice = currentVariant?.price || product.base_price;
  const activeComparePrice =
    currentVariant?.compare_at_price || product.compare_at_price;
  const discount = activeComparePrice
    ? calcDiscount(activeComparePrice, activePrice)
    : 0;
  const savings = activeComparePrice
    ? Math.max(0, activeComparePrice - activePrice)
    : 0;

  const images =
    product.media && product.media.length > 0
      ? product.media.map((m) => m.url)
      : [
          "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&auto=format&fit=crop&q=80",
        ];

  const handleAddToCart = (openDrawer = true) => {
    addItem({
      id: currentVariant?.id || product.id,
      productId: product.id,
      variantId: currentVariant?.id,
      title: product.title,
      slug: product.slug,
      image: images[0],
      price: activePrice,
      compareAtPrice: activeComparePrice || undefined,
      quantity,
      stock: currentVariant?.stock || 50,
      attributes: currentVariant?.attributes as Record<string, string>,
      supplierCode: product.supplier_code || undefined,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);

    if (openDrawer) {
      openCart();
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(false);
    router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      id: `w-${product.id}`,
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: images[0],
      price: activePrice,
      compareAtPrice: activeComparePrice || undefined,
      rating: product.avg_rating,
      reviewCount: product.review_count,
    });
  };

  // Related products
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category_id === product.category_id
  ).slice(0, 4);

  return (
    <div className="space-y-12 pb-24 font-montserrat">
      {/* ── 1. Breadcrumbs ── */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          {
            label: category?.name || "Departments",
            href: category ? `/categories/${category.slug}` : "/categories",
          },
          { label: product.title, href: "#" },
        ]}
      />

      {/* ── 2. Primary Product Showcase (3-Column Layout on Desktop) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT COLUMN: Premium Image Gallery (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Showcase Image */}
          <div className="relative aspect-square w-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md group">
            <Image
              src={images[selectedImageIndex] || images[0]}
              alt={product.title}
              fill
              priority
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {discount > 0 && (
                <span className="bg-[#FF1028] text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
                  -{discount}% OFF
                </span>
              )}
              {product.is_flash_deal && (
                <span className="bg-[#00143D] text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 border border-amber-300/30">
                  <Zap className="w-3 h-3 fill-amber-300" /> FLASH DROP
                </span>
              )}
            </div>

            {/* Quick Actions (Zoom & Wishlist) */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={handleWishlistToggle}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-[#FF1028] hover:scale-110 transition-all shadow-md cursor-pointer"
                title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist ? "fill-[#FF1028] text-[#FF1028]" : ""
                  }`}
                />
              </button>

              <button
                onClick={() => setIsZoomModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-[#00143D] hover:scale-110 transition-all shadow-md cursor-pointer"
                title="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnail Carousel Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 transition-all shrink-0 cursor-pointer shadow-xs ${
                  selectedImageIndex === idx
                    ? "border-[#FF1028] ring-2 ring-[#FF1028]/20 scale-102"
                    : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Guarantee Banner beneath Gallery */}
          <div className="bg-[#00143D] text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#10B981] shrink-0" />
              <div>
                <span className="text-xs font-black block">Single-Vendor Assurance</span>
                <span className="text-[10px] text-slate-300">Lennox oversees factory production, testing & air cargo</span>
              </div>
            </div>
            <span className="bg-[#10B981] text-slate-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              VERIFIED
            </span>
          </div>
        </div>

        {/* ── CENTER COLUMN: Product Title, Pricing, Variants & Actions (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 text-[#00143D] text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                {product.brand?.name || "Lennox Direct"}
              </span>
              <span className="text-[11px] text-slate-400 font-bold">
                SKU: {currentVariant?.sku || product.sku}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-[#00143D] leading-snug">
              {product.title}
            </h1>

            {/* Rating & Sold count */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <Rating
                  rating={product.avg_rating}
                  reviewCount={product.review_count}
                  size="md"
                />
                <span className="text-slate-400 font-bold">|</span>
                <span className="text-slate-600 font-bold text-xs">
                  {product.review_count} verified reviews
                </span>
              </div>

              {product.sold_count > 0 && (
                <span className="bg-amber-50 text-amber-800 text-xs font-black px-2 py-0.5 rounded-md border border-amber-200">
                  🔥 {product.sold_count} sold
                </span>
              )}
            </div>
          </div>

          {/* Price Block */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-[#00143D] price-tag">
                {formatCurrency(activePrice)}
              </span>
              {activeComparePrice && (
                <span className="text-sm sm:text-base text-slate-400 line-through">
                  ${activeComparePrice.toFixed(2)}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-[#FF1028] text-white text-xs font-black px-2 py-0.5 rounded shadow-xs">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {savings > 0 && (
              <div className="text-xs font-black text-[#FF1028]">
                You save: ${savings.toFixed(2)} USDT (Direct Factory Price)
              </div>
            )}

            {/* Binance Pay Badge */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#10B981]">
              <span className="flex items-center gap-1">
                <Coins className="w-4 h-4" /> Binance Pay USDT Accepted
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Zero transaction fees</span>
            </div>
          </div>

          {/* Variant Selection (Bundle & Specs) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-black text-[#00143D] uppercase tracking-wider flex items-center justify-between">
                <span>Select Hardware Configuration:</span>
                <span className="text-[#FF1028] text-[11px] font-bold">
                  {currentVariant?.title}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.variants.map((v, idx) => (
                  <button
                    key={v.id || idx}
                    type="button"
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`p-3 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedVariantIndex === idx
                        ? "border-[#FF1028] bg-red-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">
                        {v.title}
                      </span>
                      {selectedVariantIndex === idx && (
                        <Check className="w-3.5 h-3.5 text-[#FF1028] shrink-0" />
                      )}
                    </div>
                    <span className="text-xs font-black text-[#00143D]">
                      {formatCurrency(v.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="space-y-2">
            <label className="text-xs font-black text-[#00143D] uppercase tracking-wider block">
              Quantity:
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-2 text-xs font-black text-slate-800 min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xs text-slate-500 font-semibold">
                In Stock ({currentVariant?.stock || 45} units available at factory)
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                className="w-full bg-[#00143D] hover:bg-[#002366] text-white py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now with USDT</span>
              </button>
            </div>

            {addedToast && (
              <div className="bg-[#10B981] text-white text-xs font-bold p-2.5 rounded-xl text-center animate-in fade-in slide-in-from-top-1">
                ✓ Added {quantity} item(s) to your cart!
              </div>
            )}
          </div>

          {/* Delivery & Air Freight Estimator */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-blue-600" /> Dispatch to:
              </span>
              <select
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="United Arab Emirates">UAE</option>
              </select>
            </div>

            <div className="space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span>Standard Air Express (7-12 Days):</span>
                <span className="font-bold text-[#10B981]">FREE over $50</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Priority DHL/FedEx (3-5 Days):</span>
                <span className="font-bold text-slate-800">$14.99 USDT</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Dedicated Dual Video Module (3 Cols on Desktop) ── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Dual Video Module Component */}
          {product.videos && product.videos.length > 0 && (
            <DualVideoModule
              videos={product.videos}
              productTitle={product.title}
            />
          )}

          {/* Factory Verification Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-[#00143D] text-xs font-black uppercase">
              <Factory className="w-4 h-4 text-[#FF1028]" />
              <span>Certified Factory Hub</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>100% Quality Checked before Air Dispatch</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Direct Batch PO from China Manufacturer</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>30-Day Money-Back Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Tabbed Specifications, Reviews & Sourcing Guide ── */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Tabs Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("specs")}
            className={`py-3 px-4 text-xs sm:text-sm font-black transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === "specs"
                ? "border-[#FF1028] text-[#FF1028]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab("sourcing")}
            className={`py-3 px-4 text-xs sm:text-sm font-black transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === "sourcing"
                ? "border-[#FF1028] text-[#FF1028]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Factory Quality & Testing
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-3 px-4 text-xs sm:text-sm font-black transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === "reviews"
                ? "border-[#FF1028] text-[#FF1028]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Verified Reviews ({product.review_count})
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`py-3 px-4 text-xs sm:text-sm font-black transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === "shipping"
                ? "border-[#FF1028] text-[#FF1028]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Shipping & USDT Guide
          </button>
        </div>

        {/* Tab Content: Specifications */}
        {activeTab === "specs" && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-black text-[#00143D] uppercase">
              Product Overview & Specifications
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {Object.entries(product.specs || {}).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-bold text-slate-500">{key}:</span>
                  <span className="font-black text-slate-900">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Sourcing & Quality */}
        {activeTab === "sourcing" && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-black text-[#00143D] uppercase">
              Lennox Single-Vendor Sourcing Inspection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every hardware unit undergoes rigorous inspection at our certified Shenzhen/Ningbo testing facility before being handed to international cargo lines.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl mb-1 block">🔬</span>
                <h4 className="text-xs font-black text-slate-800 mb-1">Electronics & Battery Bench Test</h4>
                <p className="text-[11px] text-slate-500">Voltage load, battery cycle efficiency, and wireless frequency validation.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl mb-1 block">📦</span>
                <h4 className="text-xs font-black text-slate-800 mb-1">Impact-Resistant Air Packaging</h4>
                <p className="text-[11px] text-slate-500">Reinforced air-column cushioning to prevent international transit damage.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl mb-1 block">🏷️</span>
                <h4 className="text-xs font-black text-slate-800 mb-1">Serialized Tracking Tag</h4>
                <p className="text-[11px] text-slate-500">Individual serial verification tied to your order number.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Verified Reviews */}
        {activeTab === "reviews" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Reviews Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="text-center pr-4 border-r border-slate-200">
                  <span className="text-3xl font-black text-[#00143D]">
                    {product.avg_rating.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-bold">out of 5.0</span>
                </div>
                <div>
                  <Rating rating={product.avg_rating} size="lg" />
                  <span className="text-xs text-slate-600 font-bold mt-1 block">
                    Based on {product.review_count} verified customer reviews
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert("Review submission form open!")}
                className="bg-[#00143D] hover:bg-[#FF1028] text-white px-5 py-2.5 rounded-xl text-xs font-black transition-colors"
              >
                Write a Verified Review
              </button>
            </div>

            {/* Individual Reviews List */}
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {rev.user?.display_name || "Verified Sourcing Buyer"}
                        </span>
                        {rev.is_verified_purchase && (
                          <span className="bg-emerald-50 text-[#10B981] text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <Rating rating={rev.rating} size="sm" />

                    {rev.title && (
                      <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rev.body}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  Be the first to review this direct factory hardware item!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Shipping Guide */}
        {activeTab === "shipping" && (
          <div className="space-y-4 animate-in fade-in text-xs text-slate-600 leading-relaxed">
            <h3 className="text-sm font-black text-[#00143D] uppercase">
              International Delivery & Binance Pay USDT Escrow
            </h3>
            <p>
              When an order is placed on Lennox ChinaMall, our automated procurement engine triggers a direct purchase order with the certified manufacturer in China. Your USDT is held securely in escrow until air cargo tracking confirms factory release.
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>Air Freight Carrier:</strong> YunExpress, 4PX, DHL Express, FedEx Cargo</li>
              <li><strong>Average Transit Time:</strong> 7-12 business days (USA, UK, Europe, UAE, Australia)</li>
              <li><strong>Customs & Import:</strong> Handled seamlessly via DDP (Delivered Duty Paid) protocols</li>
              <li><strong>Return Guarantee:</strong> 30-day full replacement or direct USDT refund in case of transit defect</li>
            </ul>
          </div>
        )}
      </section>

      {/* ── 4. Related & Complementary Products Grid ── */}
      {relatedProducts.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-[#00143D]">
              Related Sourcing Products & Accessories
            </h2>
            <Link
              href={`/categories/${category?.slug || ""}`}
              className="text-xs font-black text-[#FF1028] hover:underline"
            >
              View More in {category?.name || "Department"} →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── 5. Sticky Bottom Action Bar (Appears on Scroll) ── */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Thumbnail & Title Preview */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <Image
                  src={images[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="truncate hidden sm:block">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {product.title}
                </h4>
                <span className="text-[11px] text-[#FF1028] font-black price-tag">
                  {formatCurrency(activePrice)}
                </span>
              </div>
            </div>

            {/* Right: Sticky Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                className="bg-[#00143D] hover:bg-[#002366] text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now with USDT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Fullscreen Zoom Image Modal ── */}
      <Modal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        title={product.title}
        size="lg"
      >
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
          <Image
            src={images[selectedImageIndex] || images[0]}
            alt={product.title}
            fill
            className="object-contain"
          />
        </div>
      </Modal>
    </div>
  );
}
