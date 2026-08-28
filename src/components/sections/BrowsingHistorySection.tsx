"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { useHistoryStore } from "@/store/useHistoryStore";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { formatCurrency } from "@/utils/helpers";

// Default fallback items resembling high-affinity catalog items if history is empty
const DEFAULT_FALLBACK_PRODUCTS = [
  {
    id: "hist-def-1",
    productId: "prod-total-glue-gun",
    title: "Pistola De Silicona Electrica 220w Total Tt301116 Profesional",
    slug: "creality-k1-max-high-speed-3d-printer",
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80",
    price: 18.99,
  },
  {
    id: "hist-def-2",
    productId: "prod-circuit-breaker",
    title: "Interruptor Automático Extinguidor Incendios Para Riel Din",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    price: 24.50,
  },
  {
    id: "hist-def-3",
    productId: "prod-phone-holder",
    title: "Porta Celular Soporte Teléfono Escritorio Ajustable 360",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&auto=format&fit=crop&q=80",
    price: 7.99,
  },
  {
    id: "hist-def-4",
    productId: "prod-phone-stand-pro",
    title: "Soporte Teléfono Ajustable Porta Celular Escritorio Plegable",
    slug: "creality-k1-max-high-speed-3d-printer",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&auto=format&fit=crop&q=80",
    price: 9.50,
  },
  {
    id: "hist-def-5",
    productId: "prod-usb-cable",
    title: "Cable Carga Rápida Tipo-C USB 1.5m Con Soporte Reforzado",
    slug: "blitzwolf-bw-wa3-pro-120w-bluetooth-speaker",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    price: 4.99,
  },
  {
    id: "hist-def-6",
    productId: "prod-traditional-dress",
    title: "Vestido Huasa China Niña Talla 10-12-14-16 Cueca Tradicional",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80",
    price: 32.00,
  },
  {
    id: "hist-def-7",
    productId: "prod-corexy-printer",
    title: "CoreXY 600mm/s High-Speed 3D Printer Dual Extruder",
    slug: "creality-k1-max-high-speed-3d-printer",
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=600&auto=format&fit=crop&q=80",
    price: 349.00,
  },
  {
    id: "hist-def-8",
    productId: "prod-drone-4k",
    title: "4K Laser Gimbal Aerial Drone Brushless Dual GPS",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80",
    price: 189.00,
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
    slug: "eachine-ex5-4k-gps-fpv-drone",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    price: 45.00,
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
    productId: "prod-mini-camera",
    title: "Ultra Compact 4K Action Camera Waterproof Housing",
    slug: "eachine-ex5-4k-gps-fpv-drone",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
    price: 68.00,
  },
];

export function BrowsingHistorySection() {
  const historyItems = useHistoryStore((state) => state.items);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute responsive itemsPerView
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setItemsPerView(6); // Desktop: 6 items
      } else if (width >= 1024) {
        setItemsPerView(5); // Laptop: 5 items
      } else if (width >= 768) {
        setItemsPerView(4); // Tablet: 4 items
      } else if (width >= 480) {
        setItemsPerView(3); // Small Tablet: 3 items
      } else {
        setItemsPerView(2); // Mobile: 2 items
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Combine actual history with default items so there is always a full carousel
  const displayItems = isMounted && historyItems.length > 0
    ? [
        ...historyItems,
        ...DEFAULT_FALLBACK_PRODUCTS.filter(
          (def) => !historyItems.some((h) => h.productId === def.productId)
        ),
      ]
    : DEFAULT_FALLBACK_PRODUCTS;

  const totalPages = Math.max(1, Math.ceil(displayItems.length / itemsPerView));
  const maxPageIndex = totalPages - 1;

  // Pagination navigation
  const handlePrev = useCallback(() => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : maxPageIndex));
  }, [maxPageIndex]);

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => (prev < maxPageIndex ? prev + 1 : 0));
  }, [maxPageIndex]);

  const startIndex = currentPage * itemsPerView;
  const visibleItems = displayItems.slice(startIndex, startIndex + itemsPerView);

  // If page overflows when resizing, clamp it
  useEffect(() => {
    if (currentPage > maxPageIndex) {
      setCurrentPage(0);
    }
  }, [currentPage, maxPageIndex]);

  return (
    <section className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs overflow-hidden">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 font-heading">
            Tu historial
          </h2>
          <Link
            href="/categories"
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Ir a mi historial de navegación
          </Link>
        </div>

        {/* Header Pagination Dots (MercadoLibre style) */}
        <div className="flex items-center gap-1.5 shrink-0" aria-label="Historial pagination">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`transition-all rounded-full cursor-pointer ${
                currentPage === idx
                  ? "w-2 h-2 bg-blue-600"
                  : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Página ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Carousel Track with Floating Navigation Buttons ── */}
      <div className="relative group">
        {/* Left Floating Button (visible when not on first page or can cycle) */}
        {totalPages > 1 && (
          <button
            onClick={handlePrev}
            className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xs shadow-md border border-slate-200 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Floating Button */}
        {totalPages > 1 && (
          <button
            onClick={handleNext}
            className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xs shadow-md border border-slate-200 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Items Grid for Current Page */}
        <div
          className="grid gap-3 sm:gap-4 transition-opacity duration-300"
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
              <div className="relative w-full aspect-square rounded-xl bg-white flex items-center justify-center p-2 mb-2 transition-transform duration-300 group-hover/item:scale-103">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-contain object-center p-1.5"
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
