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
  AlertCircle,
  Ship,
  Box,
  Check,
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
import { calcDiscount } from "@/utils/helpers";
import { useCurrency } from "@/store/useCurrencyStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedProductTitle } from "@/lib/i18n/productI18n";
import { getLocalizedCategoryName } from "@/lib/i18n/categoryI18n";

interface ProductDetailClientProps {
  product?: Product | null;
  category?: Category | null;
  slug?: string;
}

/**
 * Editorial Markdown parser for Product Overview
 * Elegantly handles headings (###), bullet lists, and paragraphs
 * Eliminates raw markdown syntax leaking to users
 */
function FormattedDescription({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div className="space-y-3.5 text-slate-600 text-xs sm:text-sm leading-relaxed font-sans">
      {lines.map((line, idx) => {
        if (line.startsWith("### ")) {
          const heading = line.replace(/^###\s+/, "");
          return (
            <h4
              key={idx}
              className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pt-2 first:pt-0 font-heading"
            >
              {heading}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          const heading = line.replace(/^##\s+/, "");
          return (
            <h3
              key={idx}
              className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight pt-3 first:pt-0 font-heading"
            >
              {heading}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          const heading = line.replace(/^#\s+/, "");
          return (
            <h3
              key={idx}
              className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight pt-3 first:pt-0 font-heading"
            >
              {heading}
            </h3>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          const bullet = line.replace(/^[-*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
              <span className="text-slate-700">{bullet}</span>
            </div>
          );
        }
        return (
          <p key={idx} className="text-slate-600 leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function ProductDetailClient({
  product: initialProduct,
  category: initialCategory,
  slug: urlSlug,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { t, isSpanish } = useTranslation();
  const { formatCurrency, formatPrice } = useCurrency();
  const searchSlug = urlSlug || initialProduct?.slug || initialProduct?.id || "";

  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const storeProduct = useProductStore((state) =>
    searchSlug ? state.getProductBySlug(searchSlug) : undefined
  );
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
  const [copiedSku, setCopiedSku] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
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

  // Scroll listener for sticky action bar on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 420) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Derived variant & price variables
  const currentVariant = product?.variants?.[selectedVariantIndex];
  const activePrice = currentVariant?.price || product?.base_price || 0;
  const activeComparePrice =
    currentVariant?.compare_at_price ||
    product?.compare_at_price ||
    (product?.is_flash_deal ? activePrice * 1.45 : undefined);
  const discount = activeComparePrice ? calcDiscount(activeComparePrice, activePrice) : 0;
  const savings = activeComparePrice ? Math.max(0, activeComparePrice - activePrice) : 0;
  const activeStock = currentVariant?.stock ?? 50;
  const isOutOfStock = activeStock <= 0;

  const shippingMethod = useCartStore((state) => state.shippingMethod);
  const setShippingMethod = useCartStore((state) => state.setShippingMethod);

  // Dynamic Specifications
  const dynamicSpecs = useMemo(() => {
    if (!product) return {};
    const specsMap: Record<string, string> = {};

    if (product.specifications && typeof product.specifications === "object") {
      Object.assign(specsMap, product.specifications);
    }
    if (product.specs && typeof product.specs === "object") {
      Object.assign(specsMap, product.specs);
    }

    interface DimensionObj {
      length?: number;
      width?: number;
      height?: number;
      unit?: string;
    }
    const dims = (product.dimensions && typeof product.dimensions === "object"
      ? (product.dimensions as unknown as DimensionObj)
      : null);
    const dimensionStr =
      dims && dims.length && dims.width && dims.height
        ? `${dims.length} × ${dims.width} × ${dims.height} ${dims.unit || "cm"}`
        : "30.0 × 20.0 × 12.0 cm";

    const cargoLabels: Record<string, string> = {
      general: isSpanish ? "Carga General (Sin Batería)" : "General Cargo (Non-Battery)",
      lithium_built_in: isSpanish
        ? "Batería de Litio Integrada (Pase Aéreo PI967)"
        : "Built-in Lithium Battery (PI967 Air Pass)",
      lithium_pure: isSpanish
        ? "Batería Pura / Power Bank (Línea Especial PI965)"
        : "Pure Battery / Power Bank (PI965 Line)",
      liquid_cream: isSpanish
        ? "Líquido / Crema (Certificado Aéreo)"
        : "Liquid / Cream (Air Certified)",
      magnetic: isSpanish ? "Bienes Magnetizados (Blindados)" : "Magnetized Goods (Shielded)",
      powder: isSpanish ? "Polvo / Químico (Laboratorio)" : "Powder / Chemical (Lab Tested)",
    };

    const packageLabels: Record<string, string> = {
      corrugated_box: isSpanish
        ? "Caja Corrugada de Doble Pared"
        : "Double-Wall Corrugated Cargo Box",
      bubble_mailer: isSpanish ? "Sobre Acolchado Impermeable" : "Padded Waterproof Mailer",
      retail_box: isSpanish ? "Caja a Color Minorista Original" : "Original Factory Retail Box",
      wooden_crate: isSpanish ? "Caja de Madera Reforzada" : "Reinforced Wooden Crate",
      anti_static: isSpanish ? "Bolsa Antiestática" : "Anti-Static Shielding Bag",
    };

    const defaults: Record<string, string> = isSpanish
      ? {
          "Origen de Manufactura": product.shipping_origin || "Shenzhen, Guangdong, China",
          "Dimensiones del Paquete": dimensionStr,
          "Peso Bruto de Envío": product.weight ? `${product.weight} kg` : "0.85 kg",
          "Peso Neto del Producto": product.net_weight
            ? `${product.net_weight} kg`
            : product.weight
            ? `${(product.weight * 0.8).toFixed(2)} kg`
            : "0.65 kg",
          "Clasificación de Carga":
            cargoLabels[product.cargo_type || ""] || "Batería de Litio Integrada (PI967)",
          "Embalaje y Empaque":
            packageLabels[product.package_type || ""] || "Caja Corrugada de Doble Pared",
          "Plazo de Despacho": product.lead_time || "Despacho el Mismo Día (<24h)",
          "Código Arancelario HS": product.hs_code || "8517.62.00",
          "Certificación de Calidad": "100% Probado con Láser y Carga Previo al Envío (Grado A+)",
          "Identificador SKU": currentVariant?.sku || product.sku,
          "Marca Directa": product.brand?.name || "Lennox Direct Factory",
          "Departamento / Clúster":
            getLocalizedCategoryName(category?.name, true) || "Hardware & Electrónica",
          "Garantía de Pago": "Binance Pay USDT (Cero comisiones con depósito en garantía)",
          "Garantía y Devolución": "30 Días de Garantía + 1 Año de Soporte Técnico",
        }
      : {
          "Manufacturing Origin": product.shipping_origin || "Shenzhen, Guangdong, China",
          "Package Dimensions": dimensionStr,
          "Gross Shipping Weight": product.weight ? `${product.weight} kg` : "0.85 kg",
          "Net Product Weight": product.net_weight
            ? `${product.net_weight} kg`
            : product.weight
            ? `${(product.weight * 0.8).toFixed(2)} kg`
            : "0.65 kg",
          "Cargo Classification":
            cargoLabels[product.cargo_type || ""] || "Built-in Lithium Battery (PI967)",
          "Packaging Container":
            packageLabels[product.package_type || ""] || "Double-Wall Corrugated Cargo Box",
          "Dispatch SLA": product.lead_time || "Same Day Dispatch (<24h)",
          "HS Customs Code": product.hs_code || "8517.62.00",
          "QC Certification": "100% Pre-Departure Laser & Load Tested (Grade A+)",
          "SKU Identifier": currentVariant?.sku || product.sku,
          "Direct Brand": product.brand?.name || "Lennox Direct Factory",
          "Department / Cluster": category?.name || "Hardware & Electronics",
          "Payment Escrow": "Binance Pay USDT (Zero Gas Fees & Instant Escrow)",
          "Warranty & Guarantee": "30-Day Money-Back Guarantee + 1-Year Support",
        };

    return { ...defaults, ...specsMap };
  }, [product, currentVariant, category, isSpanish]);

  // Dynamic Live Freight Calculation for Current Product & Quantity
  const productShippingPreview = useMemo(() => {
    if (!product) {
      return {
        totalGrossWeight: 0,
        totalCbm: 0,
        air: { totalCost: 0, chargeableMetric: 0 },
        sea: { totalCost: 0, chargeableMetric: 0 },
      };
    }
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

  // Fallback and loading states if product is not resolved
  if (!product) {
    if (!isMounted) {
      return (
        <div className="min-h-screen bg-[#FAFAFC] pb-24 font-sans text-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="h-5 w-48 bg-slate-200/80 rounded-md mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 aspect-square bg-slate-200/80 rounded-3xl" />
              <div className="lg:col-span-4 space-y-4">
                <div className="h-7 bg-slate-200/80 rounded w-3/4" />
                <div className="h-4 bg-slate-200/80 rounded w-1/2" />
                <div className="h-28 bg-slate-200/80 rounded-2xl" />
                <div className="h-12 bg-slate-200/80 rounded-2xl" />
              </div>
              <div className="lg:col-span-3 space-y-4">
                <div className="h-52 bg-slate-200/80 rounded-2xl" />
                <div className="h-52 bg-slate-200/80 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-heading">
              Product Not Found
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              The product you are looking for ({searchSlug || "item"}) could not be located in our catalogue.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all shadow-xs"
            >
              Browse Catalogue
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              All Departments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Media gallery list
  const fallbackUrl =
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80";
  const images =
    product.media && product.media.length > 0
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

  // Dynamic Video Configurations
  const video1Config = product.videos?.[0];
  const video1Url =
    video1Config?.url || "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov";
  const video1Title = video1Config?.title || `${product.title} — Hardware Teardown QC`;
  const isVideo1Embed =
    video1Url.includes("youtube") || video1Url.includes("vimeo") || video1Url.includes("/embed/");
  const video1Poster = isVideo1Embed ? getEmbedThumbnail(video1Url) : undefined;

  const video2Config = product.videos?.[1];
  const video2Url =
    video2Config?.url || "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov";
  const video2Title = video2Config?.title || `${product.title} — Live Performance & Stress Test`;
  const isVideo2Embed =
    video2Url.includes("youtube") || video2Url.includes("vimeo") || video2Url.includes("/embed/");
  const video2Poster = isVideo2Embed ? getEmbedThumbnail(video2Url) : undefined;

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

  const handleCopySku = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentVariant?.sku || product.sku);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  const handleCopyCoupon = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("LENNOX10");
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* ── 1. Top Breadcrumbs & Refined Trust Strip ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/70 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 text-xs">
            <Breadcrumbs
              items={[
                { label: isSpanish ? "Inicio" : "Home", href: "/" },
                {
                  label:
                    getLocalizedCategoryName(category?.name, isSpanish) ||
                    (isSpanish ? "Departamentos" : "Departments"),
                  href: category ? `/categories/${category.slug}` : "/categories",
                },
                { label: getLocalizedProductTitle(product.slug, product.title, isSpanish) },
              ]}
            />

            {/* Desktop trust indicator */}
            <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {isSpanish ? "Hub Shenzhen Activo" : "Shenzhen Hub Active"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium text-[11px]">
                {isSpanish ? "100% Inspeccionado Pre-Despacho" : "100% Pre-Departure Inspected"}
              </span>
            </div>

            {/* Mobile trust indicator */}
            <div className="flex sm:hidden items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{isSpanish ? "Verificado QC" : "QC Verified"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Added Toast */}
      {addedToast && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isSpanish
              ? `¡${quantity} artículo(s) agregado(s) al carrito!`
              : `Added ${quantity} item(s) to cart at factory price!`}
          </span>
        </div>
      )}

      {/* ── 2. Main Product Hero ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ── Left Column: Media Gallery & Unified Sourcing Chips (5 Cols) ── */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-16 self-start order-1">
            {/* Primary Featured Image Frame */}
            <div
              className="relative w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] group"
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, images.length)}
            >
              <Image
                src={images[selectedImageIndex] || fallbackUrl}
                alt={getLocalizedProductTitle(product.slug, product.title, isSpanish)}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />

              {/* Status Badges Overlay */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 z-10">
                {discount > 0 && (
                  <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-heading shadow-xs">
                    -{discount}% {isSpanish ? "DCTO" : "OFF"}
                  </span>
                )}
                {product.is_flash_deal && (
                  <span className="bg-slate-900/90 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide border border-white/10 shadow-xs">
                    <Flame className="w-3 h-3 fill-amber-300" />
                    {isSpanish ? "OFERTA FLASH" : "FLASH DEAL"}
                  </span>
                )}
              </div>

              {/* Mobile Swipe Indicators */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
                    }
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 shadow-md flex items-center justify-center z-10 sm:hidden active:scale-95 transition-transform"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 shadow-md flex items-center justify-center z-10 sm:hidden active:scale-95 transition-transform"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image Counter & Fullscreen Zoom Button */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10">
                <span className="bg-white/90 backdrop-blur-md text-slate-700 text-[11px] font-mono font-medium px-2.5 py-1 rounded-full border border-slate-200/60 shadow-xs">
                  {selectedImageIndex + 1} / {images.length}
                </span>
              </div>

              <button
                onClick={() => setIsZoomModalOpen(true)}
                className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-xs hover:shadow-md border border-slate-200/80 transition-all hover:scale-105 cursor-pointer"
                title={isSpanish ? "Expandir pantalla completa" : "Expand Fullscreen"}
                aria-label="Expand image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Carousel */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-x-visible no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative shrink-0 w-14 h-14 sm:w-auto sm:h-auto sm:aspect-square rounded-xl overflow-hidden bg-white transition-all cursor-pointer touch-manipulation ${
                    selectedImageIndex === idx
                      ? "ring-2 ring-slate-900 ring-offset-2 opacity-100 shadow-xs"
                      : "border border-slate-200/80 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* ── 4 Minimalist Sourcing Guarantee Micro-Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-heading">
                    {isSpanish ? "100% QC" : "100% QC"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {isSpanish ? "Laboratorio certificado" : "Lab bench tested"}
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5 fill-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-heading">
                    {isSpanish ? "Fábrica" : "Direct Sourcing"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {isSpanish ? "Sin intermediarios" : "0 Middleman fee"}
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-heading">
                    {isSpanish ? "Aéreo 5–8d" : "5–8d Air"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {isSpanish ? "Courier express" : "Express courier"}
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Coins className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-heading">
                    {isSpanish ? "USDT Escrow" : "USDT Escrow"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {isSpanish ? "Garantía 30 días" : "30-day protection"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Middle Column: Configurator, Buy Box & Freight (4 Cols) ── */}
          <div className="lg:col-span-4 space-y-4 order-3 lg:order-2">
            {/* Header: Brand & SKU */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 font-medium tracking-wide uppercase font-mono text-[11px]">
                  {product.brand?.name || (isSpanish ? "Fábrica Directa Lennox" : "Direct Factory Hardware")}
                </span>
                <button
                  onClick={handleCopySku}
                  className="text-[11px] font-mono text-slate-400 hover:text-slate-700 flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  title="Click to copy SKU"
                >
                  {copiedSku ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>SKU: {currentVariant?.sku || product.sku}</span>
                </button>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 leading-snug tracking-tight">
                {getLocalizedProductTitle(product.slug, product.title, isSpanish)}
              </h1>

              {/* Social Proof Row: Rating, Q&A, Orders & Share */}
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5 flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab("reviews");
                    document.getElementById("product-tabs-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-900">{(product.avg_rating || 4.9).toFixed(1)}</span>
                  <span className="text-slate-400">({product.review_count || 32})</span>
                </button>
                <span className="text-slate-200">•</span>
                <button
                  onClick={() => {
                    setActiveTab("qa");
                    document.getElementById("product-tabs-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {qaCount} {isSpanish ? "Preguntas" : "Q&As"}
                </button>
                <span className="text-slate-200">•</span>
                <span>
                  {product.sold_count >= 1000
                    ? `${(product.sold_count / 1000).toFixed(1)}k+ ${isSpanish ? "pedidos" : "orders"}`
                    : `${product.sold_count || 85} ${isSpanish ? "vendidos" : "sold"}`}
                </span>
                <button
                  onClick={handleShare}
                  className="ml-auto text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px] cursor-pointer transition-colors"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{copiedLink ? (isSpanish ? "¡Copiado!" : "Copied!") : (isSpanish ? "Compartir" : "Share")}</span>
                </button>
              </div>
            </div>

            {/* ── Luminous Minimalist Pricing Card ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block font-sans">
                    {isSpanish ? "Precio Directo de Fábrica" : "Direct Factory Price"}
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight tabular-nums">
                      {formatCurrency(activePrice)}
                    </span>
                    {activeComparePrice && activeComparePrice > activePrice && (
                      <span className="text-sm text-slate-400 line-through font-mono">
                        {formatPrice(activeComparePrice)}
                      </span>
                    )}
                  </div>
                </div>

                {savings > 0 && (
                  <span className="bg-red-50 text-red-600 border border-red-200/60 text-xs font-bold px-2.5 py-1 rounded-full font-heading shrink-0">
                    -{discount}% {isSpanish ? "AHORRO" : "SAVE"}
                  </span>
                )}
              </div>

              {/* Flash Countdown if applicable */}
              {product.is_flash_deal && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
                  <span className="flex items-center gap-1.5 font-medium text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isSpanish ? "La oferta termina en:" : "Sourcing deal ends in:"}</span>
                  </span>
                  <span className="font-mono font-bold text-amber-700">
                    {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              )}

              {/* Minimalist Coupon Voucher Chip */}
              <div
                onClick={handleCopyCoupon}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 text-slate-600 text-xs flex items-center justify-between cursor-pointer border border-dashed border-slate-300 transition-colors"
                title={isSpanish ? "Clic para copiar cupón" : "Click to copy promo code"}
              >
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium text-slate-700">
                    {isSpanish ? "10% de descuento extra en primer pedido" : "Extra 10% off your first order"}
                  </span>
                </div>
                <span className="bg-white text-slate-900 border border-slate-200 font-mono font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 shrink-0 shadow-2xs">
                  <span>LENNOX10</span>
                  {copiedCoupon ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                </span>
              </div>
            </div>

            {/* ── Variant Selectors ── */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 font-heading">
                    {isSpanish ? "Modelo / Variante" : "Model / Option"}
                  </span>
                  <span className="font-mono text-slate-500 font-medium">
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
                          ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-800"
                      }`}
                    >
                      <span className="text-xs font-semibold block truncate">{variant.title || variant.sku}</span>
                      <span
                        className={`text-[11px] font-mono font-medium mt-0.5 block ${
                          selectedVariantIndex === idx ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {formatCurrency(variant.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Quantity & Stock State ── */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">{isSpanish ? "Cantidad" : "Quantity"}</span>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {isOutOfStock
                    ? isSpanish
                      ? "Agotado"
                      : "Out of Stock"
                    : isSpanish
                    ? `En Stock (${activeStock} unidades)`
                    : `In Stock (${activeStock} units)`}
                </span>
              </div>

              {/* Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-slate-600 hover:bg-slate-200/70 disabled:opacity-30 cursor-pointer transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                  disabled={quantity >= activeStock || isOutOfStock}
                  className="p-2 text-slate-600 hover:bg-slate-200/70 disabled:opacity-30 cursor-pointer transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="space-y-2">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-4 min-h-[48px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold font-heading text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white shrink-0" />
                <span className="sm:hidden">
                  {isSpanish ? `Comprar — ${formatCurrency(activePrice * quantity)}` : `Buy Now — ${formatCurrency(activePrice * quantity)}`}
                </span>
                <span className="hidden sm:inline">
                  {isSpanish
                    ? `Comprar Ahora con Binance Pay (${formatCurrency(activePrice * quantity)})`
                    : `Buy Now with Binance Pay (${formatCurrency(activePrice * quantity)})`}
                </span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 px-4 min-h-[48px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold font-heading text-xs uppercase tracking-wider transition-all shadow-xs active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span>{isSpanish ? "Añadir al Carrito" : "Add to Cart"}</span>
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
                  className={`min-w-[48px] min-h-[48px] px-3 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                    mountedIsInWishlist
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                  title="Wishlist"
                  aria-label="Add to wishlist"
                >
                  <Heart className={`w-4 h-4 ${mountedIsInWishlist ? "fill-red-600" : ""}`} />
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
                  className={`min-w-[48px] min-h-[48px] px-3 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                    mountedIsInCompare
                      ? "bg-blue-50 border-blue-200 text-blue-600"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                  title="Compare"
                  aria-label="Add to compare"
                >
                  <Scale className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Dynamic International Freight Route & Cost Card (Fixed Overlap) ── */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-heading font-bold text-xs text-slate-900 block">
                      {isSpanish ? "Ruta y Costo de Flete" : "Freight Route & Cost"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isSpanish
                        ? `Calculado para ${quantity} ${quantity === 1 ? "unidad" : "unidades"}`
                        : `Calculated for ${quantity} ${quantity === 1 ? "unit" : "units"}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md border border-slate-200/60">
                  <Box className="w-3 h-3 text-slate-400" />
                  <span>{productShippingPreview.totalGrossWeight.toFixed(2)} kg</span>
                  <span className="text-slate-300">•</span>
                  <span>{productShippingPreview.totalCbm.toFixed(4)} m³</span>
                </div>
              </div>

              {/* Air vs Sea Segmented Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setShippingMethod("air")}
                  className={`p-2.5 rounded-lg text-left transition-all cursor-pointer flex flex-col justify-between ${
                    shippingMethod === "air"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase flex items-center gap-1 font-heading">
                      <Zap className={`w-3 h-3 ${shippingMethod === "air" ? "fill-blue-600 text-blue-600" : "text-slate-400"}`} />
                      {isSpanish ? "Aéreo Express" : "Air Express"}
                    </span>
                    <span className={`text-xs font-mono font-bold ${shippingMethod === "air" ? "text-blue-600" : "text-slate-700"}`}>
                      {productShippingPreview.air.totalCost === 0
                        ? isSpanish
                          ? "GRATIS"
                          : "FREE"
                        : formatPrice(productShippingPreview.air.totalCost)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">{t.product.airLeadDays}</span>
                    <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {isSpanish ? "Más Rápido" : "Fastest"}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod("sea")}
                  className={`p-2.5 rounded-lg text-left transition-all cursor-pointer flex flex-col justify-between ${
                    shippingMethod === "sea"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase flex items-center gap-1 font-heading">
                      <Ship className={`w-3 h-3 ${shippingMethod === "sea" ? "text-blue-600" : "text-slate-400"}`} />
                      {isSpanish ? "Marítimo" : "Sea Freight"}
                    </span>
                    <span className={`text-xs font-mono font-bold ${shippingMethod === "sea" ? "text-blue-600" : "text-slate-700"}`}>
                      {productShippingPreview.sea.totalCost === 0
                        ? isSpanish
                          ? "GRATIS"
                          : "FREE"
                        : formatPrice(productShippingPreview.sea.totalCost)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">{t.product.seaLeadDays}</span>
                    <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                      {isSpanish ? "Económico" : "Lowest Rate"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Clean Telemetry Line with No Collision */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {product.shipping_origin || "Shenzhen Hub"} • {t.product.ddpPreCleared}
                  </span>
                </span>
                <span className="font-mono text-[10px] text-slate-400 shrink-0 sm:text-right">
                  {shippingMethod === "sea"
                    ? `${productShippingPreview.sea.chargeableMetric} ${isSpanish ? "CBM facturable" : "CBM billable"}`
                    : `${productShippingPreview.air.chargeableMetric} ${isSpanish ? "kg facturable" : "kg billable"}`}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right Column: 2 Factory QC Videos (3 Cols) ── */}
          <div className="lg:col-span-3 space-y-3.5 lg:sticky lg:top-16 self-start w-full order-2 lg:order-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-slate-700" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">
                  {isSpanish ? "Videos QC de Fábrica" : "Factory QC Videos"}
                </h4>
              </div>
              <span className="text-[10px] text-slate-600 font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                1080P QC PASS
              </span>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
              {/* Video 1 Card */}
              <div
                onClick={() =>
                  setActiveVideoModal({
                    title: video1Title,
                    subtitle: isSpanish
                      ? "Evaluación de Laboratorio • 100% Pruebas de Carga y Señal"
                      : "Shenzhen Lab Benchmark • 100% Signal & Load Testing",
                    tag: "QC LAB BENCHMARK",
                    hub: product.shipping_origin || "Shenzhen SZX Hub",
                    productPrice: activePrice,
                    productLink: `/products/${product.slug}`,
                    poster: video1Poster,
                    videoUrl: video1Url,
                  })
                }
                className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 p-3.5 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all duration-300"
              >
                {isVideo1Embed ? (
                  <iframe
                    src={video1Url}
                    title={video1Title}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-70 group-hover:opacity-85 transition-opacity"
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
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-heading">
                    VIDEO 1
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-emerald-400 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border border-white/10">
                    PASSED
                  </span>
                </div>

                {/* Play Button */}
                <div className="relative z-10 my-auto flex justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/30 transition-all">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </div>
                </div>

                {/* Footer Details */}
                <div className="relative z-10 space-y-0.5">
                  <h5 className="text-xs font-bold text-white leading-tight font-heading group-hover:text-slate-200 transition-colors truncate">
                    {video1Config?.title || (isSpanish ? "Desarme de Hardware QC" : "Hardware Teardown QC")}
                  </h5>
                  <p className="text-[10px] text-slate-300 line-clamp-1">
                    {product.shipping_origin || "Shenzhen Inspection Lab"}
                  </p>
                </div>
              </div>

              {/* Video 2 Card */}
              <div
                onClick={() =>
                  setActiveVideoModal({
                    title: video2Title,
                    subtitle: isSpanish
                      ? "Control de Calidad en Vivo • Verificación Directa"
                      : "Live Sourcing QC • Direct Verification",
                    tag: "FACTORY STRESS DEMO",
                    hub: product.shipping_origin || "Shenzhen SZX Hub",
                    productPrice: activePrice,
                    productLink: `/products/${product.slug}`,
                    poster: video2Poster,
                    videoUrl: video2Url,
                  })
                }
                className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 p-3.5 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all duration-300"
              >
                {isVideo2Embed ? (
                  <iframe
                    src={video2Url}
                    title={video2Title}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-70 group-hover:opacity-85 transition-opacity"
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
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-heading">
                    VIDEO 2
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-emerald-400 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border border-white/10">
                    PASSED
                  </span>
                </div>

                {/* Play Button */}
                <div className="relative z-10 my-auto flex justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/30 transition-all">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </div>
                </div>

                {/* Footer Details */}
                <div className="relative z-10 space-y-0.5">
                  <h5 className="text-xs font-bold text-white leading-tight font-heading group-hover:text-slate-200 transition-colors truncate">
                    {video2Config?.title || (isSpanish ? "Prueba de Rendimiento en Vivo" : "Live Performance Test")}
                  </h5>
                  <p className="text-[10px] text-slate-300 line-clamp-1">
                    {isSpanish ? "100% Estabilidad a Plena Carga" : "100% Full Load Stability Pass"}
                  </p>
                </div>
              </div>
            </div>

            {/* Inspection Guarantee Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 font-heading">
                  {isSpanish ? "Garantía de Inspección" : "Inspection Guarantee"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isSpanish
                  ? "Cada unidad es grabada, probada y certificada antes del despacho internacional."
                  : "Every unit is recorded, bench-tested, and certified prior to international cargo dispatch."}
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Deep Information Tabs (Minimal & Polished) ── */}
        <div
          id="product-tabs-section"
          className="mt-10 sm:mt-16 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          {/* Minimalist Tab Navigation Bar */}
          <div className="flex items-center border-b border-slate-200/70 bg-white px-2 sm:px-6 overflow-x-auto no-scrollbar gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("specs")}
              className={`py-3.5 px-3 sm:px-4 text-xs font-semibold font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer border-b-2 ${
                activeTab === "specs"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.product.specifications}
            </button>
            <button
              onClick={() => setActiveTab("qc_report")}
              className={`py-3.5 px-3 sm:px-4 text-xs font-semibold font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer border-b-2 ${
                activeTab === "qc_report"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {isSpanish ? "Control Shenzhen & QC" : "Shenzhen QC & Videos"}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-3.5 px-3 sm:px-4 text-xs font-semibold font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer border-b-2 flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{t.product.customerReviews}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono font-semibold">
                {product.review_count || 32}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`py-3.5 px-3 sm:px-4 text-xs font-semibold font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer border-b-2 flex items-center gap-1.5 ${
                activeTab === "qa"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{t.product.sourcingQA}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono font-semibold">
                {qaCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`py-3.5 px-3 sm:px-4 text-xs font-semibold font-heading uppercase tracking-wider transition-colors shrink-0 cursor-pointer border-b-2 ${
                activeTab === "shipping"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.common.directChinaAirfreight}
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-4 sm:p-6 md:p-8 text-xs text-slate-700">
            {/* Specs Tab (With Markdown Parsing & Clean Key-Value Table) */}
            {activeTab === "specs" && (
              <div className="space-y-8">
                {/* Clean Product Overview without raw markdown artifacts */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {isSpanish ? "Descripción del Producto" : "Product Overview"}
                  </h3>
                  <div className="bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200/60">
                    <FormattedDescription
                      content={
                        product.description ||
                        product.short_description ||
                        (isSpanish
                          ? "Fabricado directamente en fábrica con componentes de alta calidad. Probado para exportación y respaldado por la garantía Lennox de 30 días."
                          : "Direct factory manufactured with high-grade components. Fully tested for export compliance and backed by Lennox 30-Day Money-Back Warranty.")
                      }
                    />
                  </div>
                </div>

                {/* Minimalist Key-Value Specifications */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 font-heading">
                    {isSpanish ? "Ficha Técnica y Logística" : "Technical & Cargo Specifications"}
                  </h4>
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(dynamicSpecs).map(([label, value]) => (
                          <tr key={label} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 text-slate-500 font-medium w-2/5 sm:w-1/3 align-top">
                              {label}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900 break-words">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* QC Report Tab */}
            {activeTab === "qc_report" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-950">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-heading font-bold text-xs sm:text-sm">
                      {isSpanish ? "100% Control de Calidad Pre-Envío Aprobado" : "100% Pre-Departure Quality Pass"}
                    </h4>
                    <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                      {isSpanish
                        ? "Cada lote de producción se somete a pruebas de voltaje, integridad de circuitos y embalaje antes de la salida desde el hub de Shenzhen."
                        : "Every production lot undergoes voltage benchmarking, circuit integrity analysis, and packaging seal tests before departure to airport hubs."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Check 01
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-heading">
                      {isSpanish ? "Calibración de Señal y Sensores" : "Sensor & Signal Benchmarking"}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {isSpanish
                        ? "Inspección de precisión de lectura de bus OBD2 y sensores a plena carga."
                        : "OBD2 bus protocol handshake and live sensor waveform verification."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Check 02
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-heading">
                      {isSpanish ? "Estrés Térmico y Potencia" : "Thermal & Power Stress Test"}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {isSpanish
                        ? "Prueba de operación continua a 12V / 24V bajo gradiente de temperatura."
                        : "Continuous operational burn-in test under standard automotive voltage swings."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Check 03
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-heading">
                      {isSpanish ? "Embalaje Carga Aérea" : "Air Cargo Packaging Seal"}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {isSpanish
                        ? "Protección anti-impacto con cartón de doble pared certificado."
                        : "Anti-static wrap and double-wall export carton rated for international airfreight."}
                    </p>
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
                  title: v.title || v.sku || (isSpanish ? "Edición Estándar" : "Standard Edition"),
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

            {/* Airfreight & Logistics Tab */}
            {activeTab === "shipping" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">
                        {isSpanish ? "Garantía de Transporte Aéreo Directo" : "Direct Airfreight Guarantee"}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {isSpanish ? (
                          <>
                            Los envíos salen directamente desde{" "}
                            <span className="font-bold text-slate-900">{product.shipping_origin || "Shenzhen"}</span> con
                            despacho aduanero bajo el Código HS{" "}
                            <span className="font-mono font-bold text-slate-900">{product.hs_code || "8517.62.00"}</span>.
                          </>
                        ) : (
                          <>
                            Shipments depart directly from{" "}
                            <span className="font-bold text-slate-900">{product.shipping_origin || "Shenzhen Hub"}</span> with
                            export clearance under HS Code{" "}
                            <span className="font-mono font-bold text-slate-900">{product.hs_code || "8517.62.00"}</span>.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold font-mono text-emerald-700 bg-emerald-100/80 border border-emerald-200 self-start sm:self-auto">
                    100% DDP Covered
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      01. Dimensions
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-mono">
                      {dynamicSpecs["Dimensiones del Paquete"] || dynamicSpecs["Package Dimensions"]}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Gross Wt: {dynamicSpecs["Peso Bruto de Envío"] || dynamicSpecs["Gross Shipping Weight"]}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      02. Dispatch SLA
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {product.lead_time || (isSpanish ? "Despacho el Mismo Día" : "Same Day Dispatch")}
                    </h5>
                    <p className="text-[11px] text-slate-500">Shenzhen Airport Flight Facility</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      03. Cargo Class
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs truncate">
                      {dynamicSpecs["Clasificación de Carga"] || dynamicSpecs["Cargo Classification"]}
                    </h5>
                    <p className="text-[11px] text-slate-500">PI967 Certified Passenger Pass</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      04. Customs Code
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-mono">
                      HS {product.hs_code || "8517.62.00"}
                    </h5>
                    <p className="text-[11px] text-slate-500">Automated Express Manifest</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-heading font-bold text-xs uppercase tracking-wider block">
                        {isSpanish
                          ? "Garantía de Devolución de 30 Días con Binance Pay"
                          : "30-Day Money-Back Warranty & Binance Pay Escrow"}
                      </span>
                      <span className="text-[11px] text-slate-300">
                        {isSpanish
                          ? "Depósito en custodia en USDT con resolución de disputas garantizada."
                          : "Disputes settled instantly in USDT via Binance escrow with zero gateway surcharge."}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] font-mono shrink-0 uppercase tracking-wider">
                    {isSpanish ? "Comprador Protegido" : "Buyer Protected"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. Related Products Section ── */}
        <RelatedProductsSection currentProduct={product} category={category} />
      </div>

      {/* ── 5. Clean Mobile Floating Action Bar ── */}
      {showStickyBar && (
        <div
          className="fixed left-3 right-3 z-40 bg-white/95 backdrop-blur-md border border-slate-200/80 p-2.5 rounded-2xl shadow-xl animate-in slide-in-from-bottom-3 duration-200 sm:hidden"
          style={{ bottom: "calc(64px + env(safe-area-inset-bottom, 8px))" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200/80">
                <Image
                  src={images[0]}
                  alt={getLocalizedProductTitle(product.slug, product.title, isSpanish)}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-900 block truncate">
                  {getLocalizedProductTitle(product.slug, product.title, isSpanish)}
                </span>
                <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                  {formatCurrency(activePrice * quantity)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleAddToCart(true)}
                disabled={isOutOfStock}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 rounded-xl font-bold cursor-pointer disabled:opacity-40 transition-colors"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-bold font-heading text-xs uppercase tracking-wider shadow-xs shrink-0 cursor-pointer disabled:opacity-40 transition-colors"
              >
                {isSpanish ? "Comprar" : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Fullscreen Zoom Modal ── */}
      <Modal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        title={getLocalizedProductTitle(product.slug, product.title, isSpanish)}
        size="lg"
      >
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black">
          <Image
            src={images[selectedImageIndex] || fallbackUrl}
            alt={getLocalizedProductTitle(product.slug, product.title, isSpanish)}
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
