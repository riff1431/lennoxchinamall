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
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedProductTitle } from "@/lib/i18n/productI18n";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { t, isSpanish } = useTranslation();
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

  // Client hydration check
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Stores
  const addItem = useCartStore((state) => state.addItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInCompare = useCompareStore((state) => state.isInCompare(product.id));
  const toggleCompare = useCompareStore((state) => state.toggleItem);

  const mountedIsInWishlist = isMounted && isInWishlist;
  const mountedIsInCompare = isMounted && isInCompare;

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
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`group relative bg-white rounded-lg border transition-all duration-300 flex flex-col justify-between h-full overflow-hidden ${
          isOutOfStock
            ? "border-slate-200 opacity-75"
            : "border-slate-200/90 hover:border-[#FF1028]/60 hover:shadow-[0_0_20px_-2px_rgba(255,16,40,0.22),0_12px_24px_-6px_rgba(0,20,61,0.08)] shadow-2xs"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/products/${product.slug}`} className="block relative flex-1 flex flex-col">
          {/* ── 1. Consistent Square 1:1 Image Ratio with Hover Transition ── */}
          <div className="relative w-full aspect-square bg-[#F8FAFC] overflow-hidden rounded-t-lg">
            <Image
              src={isHovered ? hoverImage : primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              priority={priority}
              onError={() => setImgError(true)}
              className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-108"
            />

            {/* ── Dynamic Category Badges ── */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {product.is_flash_deal ? (
                <>
                  <span className="bg-[#FF1028] text-white text-[8px] sm:text-[8.5px] font-black px-1.5 py-0.5 rounded-xs shadow-2xs uppercase tracking-wide font-mono">
                    -{discount > 0 ? `${discount}%` : "45%"}
                  </span>
                  <span className="bg-amber-400 text-slate-950 text-[7.5px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wider flex items-center gap-0.5 shadow-2xs font-mono">
                    <Flame className="w-2.5 h-2.5 fill-slate-950" /> {isSpanish ? "OFERTA FLASH" : "FLASH DROP"}
                  </span>
                </>
              ) : (
                <>
                  {discount > 0 && (
                    <span className="bg-[#FF1028] text-white text-[8px] sm:text-[8.5px] font-black px-1.5 py-0.5 rounded-xs shadow-2xs uppercase tracking-wide font-mono">
                      -{discount}%
                    </span>
                  )}
                  {product.is_new_arrival && (
                    <span className="bg-emerald-600 text-white text-[8px] sm:text-[8.5px] font-black px-1.5 py-0.5 rounded-xs shadow-2xs uppercase tracking-wide flex items-center gap-1 font-heading">
                      <Sparkles className="w-2.5 h-2.5" /> {isSpanish ? "NUEVO" : "NEW"}
                    </span>
                  )}
                  {product.is_best_seller && !product.is_flash_deal && (
                    <span className="bg-amber-500 text-slate-950 text-[8px] sm:text-[8.5px] font-black px-1.5 py-0.5 rounded-xs shadow-2xs uppercase tracking-wide flex items-center gap-1 font-heading">
                      <Award className="w-2.5 h-2.5" /> {isSpanish ? "MÁS VENDIDO" : "BEST SELLER"}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* ── Floating Action Bar (Right Side Hover) ── */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className={`w-6.5 h-6.5 rounded-md bg-white/95 backdrop-blur-md flex items-center justify-center transition-all shadow-xs cursor-pointer border border-slate-100 hover:scale-115 ${
                  mountedIsInWishlist ? "text-[#FF1028]" : "text-slate-400 hover:text-[#FF1028]"
                }`}
                title={mountedIsInWishlist ? (isSpanish ? "Eliminar de favoritos" : "Remove from wishlist") : (isSpanish ? "Añadir a favoritos" : "Add to wishlist")}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${mountedIsInWishlist ? "fill-[#FF1028]" : ""}`} />
              </button>

              {/* Compare Button */}
              <button
                onClick={handleCompareToggle}
                className={`w-6.5 h-6.5 rounded-md bg-white/95 backdrop-blur-md flex items-center justify-center transition-all shadow-xs cursor-pointer border border-slate-100 hover:scale-115 ${
                  mountedIsInCompare ? "text-blue-600 font-bold" : "text-slate-400 hover:text-blue-600"
                }`}
                title={mountedIsInCompare ? (isSpanish ? "Eliminar de comparar" : "Remove from comparison") : (isSpanish ? "Añadir a comparar" : "Add to compare")}
                aria-label="Compare Product"
              >
                <Scale className="w-3.5 h-3.5" />
              </button>

              {/* Quick View Button */}
              <button
                onClick={handleOpenQuickView}
                className="w-6.5 h-6.5 rounded-md bg-white/95 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-slate-800 hover:scale-115 transition-all shadow-xs cursor-pointer border border-slate-100"
                title={isSpanish ? "Vista Rápida" : "Quick View Details"}
                aria-label="Quick View"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Flash Deal Live Ticking Strip on Image Bottom */}
            {product.is_flash_deal && (
              <div className="absolute bottom-0 inset-x-0 bg-[#00143D]/95 backdrop-blur-md text-amber-300 text-[8.5px] sm:text-[9.5px] font-black py-0.5 px-2 flex items-center justify-between z-10 border-t border-amber-400/20 font-mono">
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-2.5 h-2.5 text-amber-400" /> {isSpanish ? "Termina:" : "Ends:"}
                </span>
                <span className="tracking-widest font-black">
                  {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* ── 2. Compact Product Details ── */}
          <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-1.5">
            {/* Origin & QC Tag */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 uppercase tracking-wider font-mono">
              <span className="truncate">{product.shipping_origin ? (isSpanish ? "Fábrica Directa China" : "Direct China Factory") : (isSpanish ? "Fábrica Directa" : "Direct Factory")}</span>
              <span className="text-emerald-700 font-bold shrink-0">QC</span>
            </div>

            {/* Title */}
            <h3 className="font-sans font-bold text-xs sm:text-[13px] text-slate-800 line-clamp-2 leading-tight group-hover:text-[#FF1028] transition-colors">
              {getLocalizedProductTitle(product.slug, product.title, isSpanish)}
            </h3>

            {/* Rating & Social Proof */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
              <div className="flex items-center gap-0.5 text-amber-500">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold font-mono text-slate-800 text-[10px]">
                  {product.avg_rating ? product.avg_rating.toFixed(1) : "4.9"}
                </span>
              </div>
              <span className="text-slate-400 text-[9px]">({product.review_count || 120})</span>
              <span className="text-slate-300">•</span>
              <span className="text-[9px] font-mono text-slate-500 truncate">
                {product.sold_count ? `${(product.sold_count / 1000).toFixed(1)}k+ ${isSpanish ? "vendidos" : "sold"}` : (isSpanish ? "500+ vendidos" : "500+ sold")}
              </span>
            </div>

            {/* Variant Pills (if available) */}
            {product.variants && product.variants.length > 1 && (
              <div className="flex items-center gap-1 overflow-hidden py-0.5">
                {product.variants.slice(0, 3).map((v) => (
                  <button
                    key={v.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariantId(v.id);
                    }}
                    className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-xs border transition-all cursor-pointer truncate max-w-[80px] ${
                      selectedVariantId === v.id
                        ? "bg-[#00143D] text-white border-[#00143D] font-bold"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            )}

            {/* Price Block */}
            <div className="pt-1 border-t border-slate-100 flex items-baseline gap-1.5">
              <span className="text-sm font-black text-[#00143D] font-mono">
                {formatCurrency(activePrice)}
              </span>
              {comparePrice && comparePrice > activePrice && (
                <span className="text-[10px] text-slate-400 line-through font-mono">
                  ${comparePrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Logistics & QC Micro Badges */}
            <div className="space-y-0.5 text-[9px] sm:text-[9.5px] text-slate-500 font-medium">
              <div className="flex items-center gap-1 text-slate-600 truncate">
                <Plane className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                <span className="truncate">{t.product.airLeadDays}</span>
              </div>
              <div className="flex items-center gap-1 text-[#10B981] font-semibold truncate">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span className="truncate">{t.common.factoryQCPass}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* ── 3. Quick-Add Action Bar ── */}
        <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3 pt-0.5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-2 px-2.5 rounded-md text-xs font-black font-heading flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isOutOfStock
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : justAdded
                ? "bg-[#10B981] text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]"
                : "bg-[#00143D] hover:bg-[#FF1028] text-white hover:shadow-[0_0_16px_rgba(255,16,40,0.35)]"
            }`}
          >
            {isOutOfStock ? (
              <span>{t.common.outOfStock}</span>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t.common.success}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{t.common.addToCart}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── 4. Interactive Quick View Modal ── */}
      <Modal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        title={getLocalizedProductTitle(product.slug, product.title, isSpanish)}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-slate-800">
          {/* Gallery Preview */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image src={primaryImage} alt={product.title} fill className="object-cover" />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-[#FF1028] text-white text-xs font-black px-2.5 py-1 rounded-md uppercase font-heading">
                  -{discount}% {isSpanish ? "DESCUENTO" : "OFF"}
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
                  {isSpanish ? "SUMINISTRO DIRECTO DE FÁBRICA" : "DIRECT FACTORY SOURCING"}
                </span>
                <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {(product.avg_rating || 4.9).toFixed(1)} ({product.review_count || 18} {isSpanish ? "Reseñas" : "Reviews"})
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black font-heading text-slate-900 leading-tight">
                {getLocalizedProductTitle(product.slug, product.title, isSpanish)}
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {product.description || (isSpanish ? "Fabricado directamente en fábrica con componentes de alta calidad. Probado para exportación y respaldado por la garantía Lennox de 30 días." : "Direct factory manufactured with high-grade components. Fully tested for export compliance and backed by Lennox 30-Day Money-Back Warranty.")}
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
                  {isSpanish ? "Depósito en Garantía USDT Sin Comisión" : "USDT Zero-Fee Escrow"}
                </span>
              </div>

              {/* Variant Selector in Quick View */}
              {product.variants && product.variants.length > 1 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">{isSpanish ? "Seleccionar Variante / Especificaciones:" : "Select Variant / Specs:"}</span>
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
                <span>{t.common.addToCart} ({formatCurrency(activePrice)})</span>
              </button>

              <Link
                href={`/products/${product.slug}`}
                onClick={() => setIsQuickViewOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors text-center"
              >
                <span>{isSpanish ? "Ver Página Completa del Producto" : "View Complete Product Page"}</span>
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
