"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export interface DepartmentCluster {
  name: string;
  slug: string;
  count: string;
  hub: string;
  image: string;
  tag: string;
}

export const DIRECT_SOURCING_DEPARTMENTS: DepartmentCluster[] = [
  {
    name: "4K Aerial Drones & FPV",
    slug: "consumer-electronics",
    count: "1,240+",
    hub: "Shenzhen Hub",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80",
    tag: "AERIAL",
  },
  {
    name: "3D Printers & CNC",
    slug: "consumer-electronics",
    count: "890+",
    hub: "Ningbo Cluster",
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=600&auto=format&fit=crop&q=80",
    tag: "INDUSTRIAL",
  },
  {
    name: "High-Fidelity Audio",
    slug: "consumer-electronics",
    count: "3,400+",
    hub: "Dongguan Lab",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
    tag: "ACOUSTICS",
  },
  {
    name: "Car OBD2 & Diagnostic",
    slug: "consumer-electronics",
    count: "650+",
    hub: "Guangzhou Line",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
    tag: "DIAGNOSTICS",
  },
  {
    name: "Tactical & Outdoor Gear",
    slug: "consumer-electronics",
    count: "480+",
    hub: "Yiwu Cluster",
    image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&auto=format&fit=crop&q=80",
    tag: "TACTICAL",
  },
  {
    name: "Smart Robotics & IoT",
    slug: "consumer-electronics",
    count: "720+",
    hub: "Shenzhen Hub",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80",
    tag: "ROBOTICS",
  },
  {
    name: "Thermal & Laser Optics",
    slug: "consumer-electronics",
    count: "530+",
    hub: "Wuhan Optics",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    tag: "OPTICS",
  },
  {
    name: "Smart Wearables & AR",
    slug: "consumer-electronics",
    count: "980+",
    hub: "Shenzhen Lab",
    image: "https://images.unsplash.com/photo-1508655096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
    tag: "WEARABLES",
  },
  {
    name: "Portable Power & Solar",
    slug: "consumer-electronics",
    count: "610+",
    hub: "Changzhou Hub",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80",
    tag: "ENERGY",
  },
  {
    name: "Pro Camera & Rigging",
    slug: "consumer-electronics",
    count: "1,150+",
    hub: "Guangdong Hub",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
    tag: "STUDIO",
  },
];

interface DirectSourcingDepartmentsSectionProps {
  departments?: DepartmentCluster[];
  autoPlayInterval?: number; // default 3000ms (3 seconds)
}

export function DirectSourcingDepartmentsSection({
  departments,
  autoPlayInterval = 3000,
}: DirectSourcingDepartmentsSectionProps) {
  const { t, isSpanish } = useTranslation();
  const rawList = departments && departments.length > 0 ? departments : DIRECT_SOURCING_DEPARTMENTS;
  const displayDepartments = rawList.map((dep) => {
    if (!isSpanish) return dep;
    // Spanish mapping for department names
    const spanishNames: Record<string, string> = {
      "4K Aerial Drones & FPV": "Drones Aéreos 4K y FPV",
      "3D Printers & CNC": "Impresoras 3D y CNC",
      "High-Fidelity Audio": "Audio de Alta Fidelidad",
      "Car OBD2 & Diagnostic": "OBD2 y Diagnóstico Automotriz",
      "Tactical & Outdoor Gear": "Equipo Táctico y Exterior",
      "Smart Robotics & IoT": "Robótica Inteligente e IoT",
      "Thermal & Laser Optics": "Óptica Térmica y Láser",
      "Smart Wearables & AR": "Wearables Inteligentes y RA",
      "Portable Power & Solar": "Energía Portátil y Solar",
      "Pro Camera & Rigging": "Cámaras Profesionales y Soportes",
    };
    return {
      ...dep,
      name: spanishNames[dep.name] || dep.name,
      hub: dep.hub.replace("Hub", "Centro").replace("Cluster", "Clúster").replace("Lab", "Laboratorio").replace("Line", "Línea"),
    };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamically calculate visible items per view based on container / screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setItemsPerView(6); // Large desktop: 6 columns
      } else if (width >= 1024) {
        setItemsPerView(4); // Laptop: 4 columns
      } else if (width >= 768) {
        setItemsPerView(3); // Tablet: 3 columns
      } else if (width >= 500) {
        setItemsPerView(2); // Small Tablet: 2 columns
      } else {
        setItemsPerView(1.3); // Mobile: 1.3 columns with peek
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalItems = displayDepartments.length;
  // Extended array for seamless infinite looping
  const extendedDepartments = [...displayDepartments, ...displayDepartments];

  // Navigation handlers with seamless infinite wrapping
  const nextSlide = useCallback(() => {
    if (totalItems === 0) return;
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  }, [totalItems]);

  const prevSlide = useCallback(() => {
    if (totalItems === 0) return;
    if (currentIndex === 0) {
      // Jump silently to equivalent duplicated end, then animate to prev
      setWithTransition(false);
      setCurrentIndex(totalItems);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
          setCurrentIndex(totalItems - 1);
        });
      });
    } else {
      setWithTransition(true);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, totalItems]);

  // Seamless loop reset when sliding past original length
  const handleTransitionEnd = () => {
    if (currentIndex >= totalItems) {
      setWithTransition(false);
      setCurrentIndex(currentIndex % totalItems);
    }
  };

  // Auto-play interval timer: 3 seconds auto carousel loop
  useEffect(() => {
    if (isPaused || totalItems === 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, autoPlayInterval, totalItems]);

  // Touch Swipe Support
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
  };

  const activeDotIndex = currentIndex % totalItems;

  return (
    <section
      className="relative bg-white rounded-xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/3 rounded-full blur-3xl pointer-events-none" />

      {/* ── Section Header ── */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00143D] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
              {t.home.manufacturingClusters}
            </span>
          </div>

          <h3 className="text-lg sm:text-2xl font-black text-[#00143D] font-heading mt-1">
            {t.home.sourcingDepartments}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t.home.sourcingDepSubtitle}
          </p>
        </div>

        {/* Carousel Arrows & View All */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Carousel Arrow Controls */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={prevSlide}
              className="w-8 h-8 rounded-md bg-white hover:bg-[#00143D] text-[#00143D] hover:text-white border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 group"
              aria-label={isSpanish ? "Departamentos anteriores" : "Previous Departments"}
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-md bg-white hover:bg-[#FF1028] text-[#00143D] hover:text-white border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 group"
              aria-label={isSpanish ? "Siguientes departamentos" : "Next Departments"}
            >
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-md bg-slate-50 hover:bg-[#FF1028] text-[#00143D] hover:text-white border border-slate-200 text-xs font-black font-heading transition-all shadow-2xs group btn-smooth"
          >
            <span>{t.common.allDepartments}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Carousel Track ── */}
      <div
        ref={containerRef}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none py-2.5 -my-2.5 px-1 -mx-1"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`flex ${
            withTransition
              ? "transition-transform duration-500 ease-out"
              : "transition-none"
          }`}
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedDepartments.map((cat, idx) => (
            <div
              key={`${cat.name}-${idx}`}
              className="px-1.5 sm:px-2 shrink-0"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <Link
                href={`/categories/${cat.slug}`}
                className="group bg-[#F8FAFC] hover:bg-white rounded-lg border border-slate-200/80 hover:border-[#FF1028]/60 p-3 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-[0_0_16px_rgba(255,16,40,0.18)] hover:-translate-y-1 h-full block"
              >
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-slate-200 mb-2.5 image-zoom-smooth">
                  <Image
                    src={
                      imgErrors[idx]
                        ? "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80"
                        : cat.image
                    }
                    alt={`${cat.name} Department - China Sourcing Hub`}
                    fill
                    sizes="(max-width: 640px) 75vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover object-center group-hover:scale-108 transition-transform duration-500"
                    onError={() => setImgErrors((prev) => ({ ...prev, [idx]: true }))}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Hub Badge */}
                  <span className="absolute top-2 left-2 bg-[#00143D]/90 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-black font-mono px-1.5 py-0.5 rounded-xs shadow-2xs">
                    {cat.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#FF1028] transition-colors line-clamp-1 leading-snug font-heading">
                    {cat.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-semibold text-emerald-600 font-mono">{cat.count} {isSpanish ? "Artículos" : "Items"}</span>
                    <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">{cat.hub}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── Carousel Dot Indicators ── */}
      {totalItems > 0 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {displayDepartments.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => {
                setWithTransition(true);
                setCurrentIndex(dotIdx);
              }}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeDotIndex === dotIdx
                  ? "w-6 bg-[#00143D]"
                  : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
