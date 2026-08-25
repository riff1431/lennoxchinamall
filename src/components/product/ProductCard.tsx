"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Check,
  Video,
  Zap,
  ShieldCheck,
  Plane,
  Star,
  Eye,
  Scale,
  Clock,
  Flame,
  Sparkles,
  AlertTriangle,
  X,
  Package,
  Layers,
  Award,
  ChevronRight,
} from "lucide-react";
import { Product } from "@/types/database";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCompareStore } from "@/store/useCompareStore";
import { formatCurrency, calcDiscount } from "@/utils/helpers";
import { Modal } from "@/components/ui/Modal";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants?.[0]?.id || null
  );

  // Countdown timer for flash sale products
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
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInCompare = useCompareStore((state) => state.isInCompare(product.id));
  const toggleCompare = useCompareStore((state) => state.toggleItem);

  // Selected variant derivation
  const activeVariant = product.variants?.find((v) => v.id === selectedVariantId) || product.variants?.[0];
  const activePrice = activeVariant?.price || product.base_price || 0;
  const comparePrice = product.compare_at_price || (product.is_flash_deal ? activePrice * 1.45 : undefined);
  const discount = comparePrice ? calcDiscount(comparePrice, activePrice) : 0;
  const savingsAmount = comparePrice ? Math.max(0, comparePrice - activePrice) : 0;

  // Stock calculation
  const totalStock = product.variants && product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : 50;
  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock <= 6;

  // Images
  const fallbackUrl = "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80";
  const primaryImage = imgError
    ? fallbackUrl
    : product.media?.[0]?.url || fallbackUrl;
  const hoverImage = product.media?.[1]?.url || primaryImage;
  const videoCount = product.videos?.length || 0;

  // Quick Add to Cart Handler
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      id: activeVariant?.id || product.id,
      productId: product.id,
      variantId: activeVariant?.id,
      title: product.title,
      slug: product.slug,
      image: primaryImage,
      price: activePrice,
      compareAtPrice: comparePrice,
      quantity: 1,
      stock: activeVariant?.stock ?? totalStock,
      supplierCode: product.supplier_code || undefined,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  // Wishlist Toggle Handler
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      id: `w-${product.id}`,
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: primaryImage,
      price: activePrice,
      compareAtPrice: comparePrice,
      rating: product.avg_rating || 5.0,
      reviewCount: product.review_count || 12,
    });
  };

  // Compare Toggle Handler
  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleCompare({
      id: `c-${product.id}`,
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: primaryImage,
      price: activePrice,
      rating: product.avg_rating || 5.0,
      brand: product.brand_id || "Direct Factory",
    });
  };

  // Quick View Trigger
  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <div
        className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between h-full overflow-hidden hover-lift ${
          isOutOfStock
            ? "border-slate-200 opacity-75"
            : "border-slate-200/90 hover:border-[#FF1028]/40 hover:shadow-xl shadow-2xs"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/products/${product.slug}`} className="block relative flex-1 flex flex-col">
          {/* ── 1. Consistent Square 1:1 Image Ratio with Hover Transition ── */}
          <div className="relative w-full aspect-square bg-[#F8FAFC] overflow-hidden">
            <Image
              src={isHovered ? hoverImage : primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
              className={`object-cover object-center transition-transform duration-700 ${
                isHovered ? "scale-108" : "scale-100"
              }`}
              priority={priority}
              onError={() => setImgError(true)}
            />

            {/* Subtle Gradient Shadow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* ── Top Badges (Discount, Flash Deal, Best Seller, New, Out of Stock) ── */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
              {isOutOfStock ? (
                <span className="bg-slate-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs font-heading backdrop-blur-xs">
                  OUT OF STOCK
                </span>
              ) : (
                <>
                  {discount > 0 && (
                    <span className="bg-[#FF1028] text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider font-heading">
                      -{discount}%
                    </span>
                  )}
                  {product.is_flash_deal && (
                    <span className="bg-[#00143D] text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 border border-amber-300/30 uppercase tracking-wide">
                      <Flame className="w-3 h-3 fill-amber-300 text-amber-300" /> FLASH DROP
                    </span>
                  )}
                  {product.is_best_seller && !product.is_flash_deal && (
                    <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide flex items-center gap-1 font-heading">
                      <Award className="w-3 h-3" /> BEST SELLER
                    </span>
                  )}
                  {isLowStock && (
                    <span className="bg-orange-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide shadow-xs flex items-center gap-1 font-mono">
                      <AlertTriangle className="w-2.5 h-2.5" /> ONLY {totalStock} LEFT
                    </span>
                  )}
                </>
              )}
            </div>

            {/* ── Video QC Demo Badge ── */}
            {videoCount > 0 && (
              <div className="absolute bottom-2.5 left-2.5 bg-[#00143D]/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 z-10 border border-white/20 shadow-xs">
                <Video className="w-3 h-3 text-[#FF1028]" />
                <span>{videoCount} Factory Video{videoCount > 1 ? "s" : ""}</span>
              </div>
            )}

            {/* ── Floating Action Bar (Right Side Hover) ── */}
            <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-[#FF1028] hover:scale-115 transition-all shadow-xs cursor-pointer border border-slate-100"
                title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                aria-label="Toggle Wishlist"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isInWishlist ? "fill-[#FF1028] text-[#FF1028] scale-110" : ""
                  }`}
                />
              </button>

              {/* Compare Button */}
              <button
                onClick={handleCompareToggle}
                className={`w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center transition-all shadow-xs cursor-pointer border border-slate-100 ${
                  isInCompare
                    ? "text-blue-600 border-blue-200"
                    : "text-slate-400 hover:text-blue-600 hover:scale-115"
                }`}
                title={isInCompare ? "In comparison list" : "Add to comparison"}
                aria-label="Toggle Compare"
              >
                <Scale className="w-4 h-4" />
              </button>

              {/* Quick View Button (Visible on Hover on Desktop) */}
              <button
                onClick={handleOpenQuickView}
                className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-[#00143D] hover:scale-115 transition-all shadow-xs cursor-pointer border border-slate-100 opacity-0 group-hover:opacity-100 hidden sm:flex"
                title="Quick View Product"
                aria-label="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* ── Flash Sale Countdown Bar Overlay (Bottom of Image) ── */}
            {product.is_flash_deal && (
              <div className="absolute bottom-0 left-0 right-0 bg-[#00143D]/95 backdrop-blur-md text-amber-300 py-1 px-2.5 flex items-center justify-between text-[10px] font-mono border-t border-amber-300/30 z-10">
                <span className="flex items-center gap-1 font-bold text-white">
                  <Clock className="w-3 h-3 text-amber-300" /> Ends In:
                </span>
                <span className="font-black text-amber-300 tracking-wider">
                  {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* ── 2. Product Details & Typography ── */}
          <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2">
            <div>
              {/* Category / Brand Micro Tag */}
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block truncate">
                Direct China Factory • Verified QC
              </span>

              {/* Product Title */}
              <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#FF1028] transition-colors mt-0.5">
                {product.title}
              </h3>
            </div>

            {/* Rating & Sold Count Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1 text-slate-600 font-semibold text-[11px]">
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="ml-1 text-slate-800 font-black tabular-nums">
                    {(product.avg_rating || 4.9).toFixed(1)}
                  </span>
                </div>
                <span className="text-slate-600">({product.review_count || 18})</span>
              </div>

              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md tabular-nums">
                {product.sold_count >= 1000
                  ? `${(product.sold_count / 1000).toFixed(1)}k+ sold`
                  : `${product.sold_count || 48} sold`}
              </span>
            </div>

            {/* Variant Selector Pills (If variants exist) */}
            {product.variants && product.variants.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
                {product.variants.slice(0, 4).map((v) => (
                  <button
                    key={v.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariantId(v.id);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono transition-all shrink-0 cursor-pointer ${
                      selectedVariantId === v.id
                        ? "bg-[#00143D] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {v.title || v.sku}
                  </button>
                ))}
              </div>
            )}

            {/* Price Block: Sale Price, Compare Price, Savings */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black text-[#00143D] font-mono leading-none">
                  {formatCurrency(activePrice)}
                </span>
                {comparePrice && comparePrice > activePrice && (
                  <span className="text-xs text-slate-400 line-through tabular-nums font-mono">
                    ${comparePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {savingsAmount > 0 && (
                <div className="text-[10px] font-black text-[#FF1028] mt-0.5 font-heading tracking-wide flex items-center gap-1">
                  <span>Save ${savingsAmount.toFixed(2)} USDT</span>
                  <span className="text-[9px] text-slate-600 font-normal">• Zero Fee</span>
                </div>
              )}
            </div>

            {/* Logistics & QC Micro Badges */}
            <div className="space-y-1 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Plane className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">5-8 Days Direct Air Cargo</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>100% Factory Gate QC Pass</span>
              </div>
            </div>
          </div>
        </Link>

        {/* ── 3. Quick-Add Action Bar ── */}
        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-black font-heading flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer ${
              isOutOfStock
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : justAdded
                ? "bg-[#10B981] text-white"
                : "bg-[#00143D] hover:bg-[#FF1028] text-white"
            }`}
            aria-label={isOutOfStock ? "Out of Stock" : "Quick Add to Cart"}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 4. Interactive Quick View Modal ── */}
      <Modal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        title={product.title}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-slate-800">
          {/* Gallery Preview */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image src={primaryImage} alt={product.title} fill className="object-cover" />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-[#FF1028] text-white text-xs font-black px-2.5 py-1 rounded-md uppercase font-heading">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {product.media && product.media.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.media.slice(0, 4).map((m, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-16 rounded-xl overflow-hidden relative border border-slate-200 shrink-0 bg-slate-50"
                  >
                    <Image src={m.url} alt="Thumbnail" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Specifications & Purchase Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#00143D] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  DIRECT FACTORY SOURCING
                </span>
                <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {(product.avg_rating || 4.9).toFixed(1)} ({product.review_count || 18} Reviews)
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black font-heading text-slate-900 leading-tight">
                {product.title}
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {product.description || "Direct factory manufactured with high-grade components. Fully tested for export compliance and backed by Lennox 30-Day Money-Back Warranty."}
              </p>

              {/* Price Row */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black font-mono text-[#00143D]">
                    {formatCurrency(activePrice)}
                  </span>
                  {comparePrice && comparePrice > activePrice && (
                    <span className="ml-2 text-xs text-slate-400 line-through font-mono">
                      ${comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                  USDT Zero-Fee Escrow
                </span>
              </div>

              {/* Variant Selector in Quick View */}
              {product.variants && product.variants.length > 1 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">Select Variant / Specs:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                          selectedVariantId === v.id
                            ? "bg-[#00143D] text-white border-[#00143D]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {v.title || v.sku} — ${v.price.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick View Actions */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <button
                onClick={(e) => {
                  handleQuickAdd(e);
                  setIsQuickViewOpen(false);
                }}
                disabled={isOutOfStock}
                className="w-full py-3 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-black font-heading text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart ({formatCurrency(activePrice)})</span>
              </button>

              <Link
                href={`/products/${product.slug}`}
                onClick={() => setIsQuickViewOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors text-center"
              >
                <span>View Complete Product Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between h-full shadow-xs animate-pulse">
      <div className="w-full aspect-square bg-slate-100 relative">
        <div className="absolute top-2.5 left-2.5 w-14 h-5 bg-slate-200 rounded-md" />
        <div className="absolute top-2.5 right-2.5 w-8 h-8 bg-slate-200 rounded-full" />
      </div>
      <div className="p-3.5 space-y-2.5 flex-1">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-3.5 bg-slate-200 rounded w-5/6" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-5 bg-slate-200 rounded w-2/5 mt-2" />
        <div className="h-3 bg-slate-200 rounded w-3/4 mt-1" />
      </div>
      <div className="p-3.5 pt-0">
        <div className="h-10 bg-slate-200 rounded-xl w-full" />
      </div>
    </div>
  );
}
