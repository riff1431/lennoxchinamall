"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Check,
  Video,
  Zap,
  ShieldCheck,
  Truck,
  Plane,
  Eye,
  Star,
} from "lucide-react";
import { Product } from "@/types/database";
import { Rating } from "@/components/ui/Rating";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatCurrency, calcDiscount } from "@/utils/helpers";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product.id)
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const primaryImage =
    product.media?.[0]?.url ||
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80";
  const hoverImage = product.media?.[1]?.url || primaryImage;

  const discount = product.compare_at_price
    ? calcDiscount(product.compare_at_price, product.base_price)
    : 0;

  const savingsAmount = product.compare_at_price
    ? Math.max(0, product.compare_at_price - product.base_price)
    : 0;

  const defaultVariant = product.variants?.[0];
  const videoCount = product.videos?.length || 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: defaultVariant?.id || product.id,
      productId: product.id,
      variantId: defaultVariant?.id,
      title: product.title,
      slug: product.slug,
      image: primaryImage,
      price: defaultVariant?.price || product.base_price,
      compareAtPrice: product.compare_at_price || undefined,
      quantity: 1,
      stock: defaultVariant?.stock ?? 99,
      supplierCode: product.supplier_code || undefined,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      id: `w-${product.id}`,
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: primaryImage,
      price: product.base_price,
      compareAtPrice: product.compare_at_price || undefined,
      rating: product.avg_rating,
      reviewCount: product.review_count,
    });
  };

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden card-hover-effect flex flex-col justify-between shadow-xs hover:border-[#00143D]/30 hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block relative">
        {/* ── 1. Consistent Square 1:1 Image Ratio ── */}
        <div className="relative w-full aspect-square bg-[#F8FAFC] overflow-hidden product-image-container">
          <Image
            src={isHovered ? hoverImage : primaryImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-all duration-500 group-hover:scale-105"
            priority={priority}
          />

          {/* Top Badges Overlay (Discount, Flash Deal, New) */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <span className="bg-[#FF1028] text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider font-heading">
                -{discount}% OFF
              </span>
            )}
            {product.is_flash_deal && (
              <span className="bg-[#00143D] text-amber-300 text-[9px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1 border border-amber-300/30 uppercase tracking-wide">
                <Zap className="w-2.5 h-2.5 fill-amber-300" /> FLASH DROP
              </span>
            )}
          </div>

          {/* Video Preview Tag */}
          {videoCount > 0 && (
            <div className="absolute bottom-2.5 left-2.5 bg-[#00143D]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 z-10 border border-white/15">
              <Video className="w-3 h-3 text-[#FF1028]" />
              <span>{videoCount} Demo Video{videoCount > 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Wishlist Button (Glassmorphism Circle) */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-[#FF1028] hover:scale-115 transition-all z-10 shadow-xs cursor-pointer border border-slate-100"
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            aria-label="Toggle wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isInWishlist ? "fill-[#FF1028] text-[#FF1028] scale-110" : ""
              }`}
            />
          </button>
        </div>

        {/* ── 2. Product Details & Typography ── */}
        <div className="p-3.5 sm:p-4 flex flex-col gap-1.5 flex-1">
          {/* Title */}
          <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#FF1028] transition-colors">
            {product.title}
          </h3>

          {/* Rating & Sold Count Row */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center gap-1 text-slate-600 font-semibold text-[11px]">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="ml-1 text-slate-800 font-bold tabular-nums">
                  {product.avg_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-slate-400">({product.review_count})</span>
            </div>

            {product.sold_count > 0 && (
              <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.2 rounded tabular-nums">
                {product.sold_count >= 1000
                  ? `${(product.sold_count / 1000).toFixed(1)}k+ sold`
                  : `${product.sold_count} sold`}
              </span>
            )}
          </div>

          {/* Price Block: Sale Price, Original Price, Savings */}
          <div className="mt-1.5 pt-1.5 border-t border-slate-100">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-black text-[#00143D] price-tag">
                {formatCurrency(product.base_price)}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  ${product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>

            {savingsAmount > 0 && (
              <div className="text-[10px] font-black text-[#FF1028] mt-0.5 font-heading tracking-wide">
                Save ${savingsAmount.toFixed(2)} USDT
              </div>
            )}
          </div>

          {/* Delivery & Sourcing Information */}
          <div className="mt-2 space-y-1 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Plane className="w-3 h-3 text-blue-600 shrink-0" />
              <span>7-12 Days Tracked Air Cargo</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span>Direct Factory Gate Inspected</span>
            </div>
          </div>
        </div>
      </Link>

      {/* ── 3. Quick-Add Action Bar ── */}
      <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1">
        <button
          onClick={handleQuickAdd}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-black font-heading flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
            justAdded
              ? "bg-[#10B981] text-white"
              : "bg-[#00143D] hover:bg-[#FF1028] text-white"
          }`}
          aria-label="Quick Add to Cart"
        >
          {justAdded ? (
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
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs animate-pulse">
      <div className="w-full aspect-square bg-slate-200" />
      <div className="p-3.5 space-y-2">
        <div className="h-3.5 bg-slate-200 rounded w-5/6" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-4 bg-slate-200 rounded w-1/3 mt-2" />
        <div className="h-3 bg-slate-200 rounded w-2/3 mt-1" />
      </div>
      <div className="p-3.5 pt-0">
        <div className="h-9 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}
