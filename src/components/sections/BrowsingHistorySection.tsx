"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHistoryStore } from "@/store/useHistoryStore";
import { formatCurrency } from "@/utils/helpers";

// Default fallback items resembling high-affinity catalog items if history is empty (matching user screenshot)
const DEFAULT_FALLBACK_PRODUCTS = [
  {
    id: "hist-def-1",
    productId: "prod-total-glue-gun",
    title: "Pistola De Silicona Electrica 220w Total Tt301116...",
    slug: "ts101-smart-usbc-soldering-iron",
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80",
    price: 18.99,
  },
  {
    id: "hist-def-2",
    productId: "prod-circuit-breaker",
    title: "Interruptor Automático Extinguidor Incendios Par...",
    slug: "konnwei-kw850-obd2-car-diagnostic-scanner",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    price: 24.5,
  },
  {
    id: "hist-def-3",
    productId: "prod-phone-holder",
    title: "Porta Celular Soporte Telefono Escritorio...",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&auto=format&fit=crop&q=80",
    price: 7.99,
  },
  {
    id: "hist-def-4",
    productId: "prod-phone-stand-pro",
    title: "Soporte Teléfono Ajustable Porta Celular Escritorio",
    slug: "creality-ender-3-v3-se-3d-printer",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&auto=format&fit=crop&q=80",
    price: 9.5,
  },
  {
    id: "hist-def-5",
    productId: "prod-usb-cable",
    title: "Cable Carga Rápida Tipo-c Usb 1.5m Con Soporte...",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    price: 4.99,
  },
  {
    id: "hist-def-6",
    productId: "prod-traditional-dress",
    title: "Vestido Huasa China Niña Talla 10-12-14-16 Cueca...",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80",
    price: 32.0,
  },
  {
    id: "hist-def-7",
    productId: "prod-corexy-printer",
    title: "CoreXY 600mm/s High-Speed 3D Printer Dual Extruder",
    slug: "creality-ender-3-v3-se-3d-printer",
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=600&auto=format&fit=crop&q=80",
    price: 349.0,
  },
  {
    id: "hist-def-8",
    productId: "prod-drone-4k",
    title: "4K Laser Gimbal Aerial Drone Brushless Dual GPS",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80",
    price: 189.0,
  },
  {
    id: "hist-def-9",
    productId: "prod-speaker-boombox",
    title: "120W Tri-Driver Bluetooth IPX7 Outdoor Boombox",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
    price: 79.99,
  },
  {
    id: "hist-def-10",
    productId: "prod-smart-watch",
    title: "Smart Sports Watch AMOLED Display Heart Rate Monitor",
    slug: "astrolux-ft03s-9300lm-tactical-flashlight",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    price: 45.0,
  },
  {
    id: "hist-def-11",
    productId: "prod-wireless-headphones",
    title: "ANC Wireless Noise Cancelling Over-Ear Headphones",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    price: 59.99,
  },
  {
    id: "hist-def-12",
    productId: "prod-impact-wrench",
    title: "Topshak 20V Cordless Brushless Impact Wrench Set",
    slug: "topshak-ts-esd4-20v-brushless-impact-wrench",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80",
    price: 89.99,
  },
];

export function BrowsingHistorySection() {
  const historyItems = useHistoryStore((state) => state.items);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [isSliding, setIsSliding] = useState(false);

  // Touch gesture support
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute responsive itemsPerView dynamically
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setItemsPerView(6); // Desktop: 6 items (exact matching screenshot)
      } else if (width >= 1024) {
        setItemsPerView(5); // Laptop: 5 items
      } else if (width >= 768) {
        setItemsPerView(4); // Tablet: 4 items
      } else if (width >= 540) {
        setItemsPerView(3); // Small Tablet: 3 items
      } else {
        setItemsPerView(2); // Mobile: 2 items
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Combine actual history with fallback items so there is always a rich carousel
  const displayItems =
    isMounted && historyItems.length > 0
      ? [
          ...historyItems,
          ...DEFAULT_FALLBACK_PRODUCTS.filter(
            (def) => !historyItems.some((h) => h.productId === def.productId)
          ),
        ]
      : DEFAULT_FALLBACK_PRODUCTS;

  const totalPages = Math.max(1, Math.ceil(displayItems.length / itemsPerView));
  const maxPageIndex = totalPages - 1;

  // Pagination navigation with transition animation
  const triggerPageChange = useCallback(
    (newPageIndex: number) => {
      setIsSliding(true);
      setTimeout(() => {
        setCurrentPage(newPageIndex);
        setIsSliding(false);
      }, 150);
    },
    []
  );

  const handlePrev = useCallback(() => {
    const prevIndex = currentPage > 0 ? currentPage - 1 : maxPageIndex;
    triggerPageChange(prevIndex);
  }, [currentPage, maxPageIndex, triggerPageChange]);

  const handleNext = useCallback(() => {
    const nextIndex = currentPage < maxPageIndex ? currentPage + 1 : 0;
    triggerPageChange(nextIndex);
  }, [currentPage, maxPageIndex, triggerPageChange]);

  const startIndex = currentPage * itemsPerView;
  const visibleItems = displayItems.slice(startIndex, startIndex + itemsPerView);

  // If page overflows when resizing, clamp it
  useEffect(() => {
    if (currentPage > maxPageIndex) {
      setCurrentPage(0);
    }
  }, [currentPage, maxPageIndex]);

  // Touch Swipe Event Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45; // Minimum px distance to trigger swipe

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section
      className="relative bg-white rounded-xl border border-slate-200/90 p-4 sm:p-6 shadow-xs overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#00143D] tracking-tight font-heading">
            Tu historial
          </h2>
          <Link
            href="/account/history"
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
          >
            Ir a mi historial de navegación
          </Link>
        </div>

        {/* Header Pagination Dots (MercadoLibre style) */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 shrink-0" aria-label="Historial pagination">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => triggerPageChange(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  currentPage === idx
                    ? "w-2 h-2 bg-blue-600 ring-2 ring-blue-200"
                    : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Página ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Carousel Track with Floating Navigation Buttons ── */}
      <div className="relative group">
        {/* Left Floating Button (visible when on page > 0 or on multi-page) */}
        {totalPages > 1 && (
          <button
            onClick={handlePrev}
            className={`absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-md bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              currentPage === 0 ? "opacity-40 hover:opacity-100" : "opacity-90"
            }`}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Floating Button (matches round arrow button in screenshot) */}
        {totalPages > 1 && (
          <button
            onClick={handleNext}
            className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-md bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-90 hover:opacity-100"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Items Grid for Current Page */}
        <div
          className={`grid gap-3 sm:gap-4 transition-all duration-200 ${
            isSliding ? "opacity-40 scale-[0.99]" : "opacity-100 scale-100"
          }`}
          style={{
            gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
          }}
        >
          {visibleItems.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="group/item flex flex-col items-center text-left focus:outline-hidden"
            >
              {/* Product Image Container */}
              <div className="relative w-full aspect-square rounded-lg bg-white border border-slate-100 flex items-center justify-center p-2 mb-2 transition-all duration-300 group-hover/item:border-blue-400 group-hover/item:shadow-[0_0_14px_rgba(37,99,235,0.15)] group-hover/item:scale-103">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-contain object-center p-1.5"
                  unoptimized={item.image?.startsWith("http")}
                />
              </div>

              {/* Product Title (2-line clamped) */}
              <div className="w-full">
                <p className="text-xs sm:text-[13px] text-slate-700 leading-snug line-clamp-2 font-normal group-hover/item:text-blue-600 transition-colors">
                  {item.title}
                </p>
                {item.price > 0 && (
                  <p className="text-xs font-semibold text-slate-900 font-mono mt-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    {formatCurrency(item.price)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
