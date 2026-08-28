"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  History,
  Trash2,
  ShoppingCart,
  Zap,
  ArrowRight,
  Search,
  ExternalLink,
  RotateCcw,
  Check,
} from "lucide-react";
import { useHistoryStore, HistoryItem } from "@/store/useHistoryStore";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/utils/helpers";

const DEFAULT_EXPLORE_ITEMS = [
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
];

export default function BrowsingHistoryPage() {
  const historyItems = useHistoryStore((state) => state.items);
  const removeItem = useHistoryStore((state) => state.removeItem);
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const items = isMounted ? historyItems : [];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (item: HistoryItem | (typeof DEFAULT_EXPLORE_ITEMS)[0]) => {
    addItem({
      id: item.productId,
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      image: item.image,
      price: item.price,
      quantity: 1,
      stock: 50,
    });

    setAddedId(item.productId);
    setTimeout(() => {
      setAddedId(null);
      openCart();
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
              HISTORIAL DE NAVEGACIÓN
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D] mt-1 font-heading">
            Tu historial ({items.length})
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Productos que has consultado recientemente en Lennox ChinaMall.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            {showConfirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">¿Borrar todo?</span>
                <button
                  onClick={() => {
                    clearHistory();
                    setShowConfirmClear(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Sí, borrar
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Borrar historial</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Search Bar (if has items) ── */}
      {items.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en tu historial..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>
      )}

      {/* ── History Items Grid or Empty State ── */}
      {items.length === 0 ? (
        <div className="space-y-8">
          <div className="py-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-xs">
              <History className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#00143D] font-heading">
                Aún no tienes productos en tu historial
              </h3>
              <p className="text-xs text-slate-500">
                A medida que navegues por los productos de nuestras fábricas en China, aparecerán aquí para que puedas encontrarlos fácilmente.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#00143D] hover:bg-[#002366] text-white px-5 py-2.5 rounded-xl text-xs font-black transition-colors"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Explorar Catálogo Principal</span>
            </Link>
          </div>

          {/* Fallback Trending Items Showcase */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-[#00143D] font-heading">
              Productos recomendados para ti
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {DEFAULT_EXPLORE_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col p-2.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-500/50 hover:shadow-xs transition-all"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative w-full aspect-square rounded-xl bg-slate-50 flex items-center justify-center p-2 mb-2 group-hover:scale-102 transition-transform"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-contain p-1"
                      unoptimized={item.image?.startsWith("http")}
                    />
                  </Link>
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-xs text-slate-700 font-medium line-clamp-2 hover:text-blue-600 leading-snug mb-1.5 flex-1"
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-xs font-black text-slate-900 font-mono">
                      {formatCurrency(item.price)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                      title="Agregar al carrito"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          No se encontraron productos que coincidan con &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col p-3 rounded-2xl border border-slate-200 bg-white hover:border-blue-500/50 hover:shadow-md transition-all"
            >
              {/* Remove button */}
              <button
                onClick={() => removeItem(item.productId)}
                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/90 shadow-xs border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                title="Eliminar de mi historial"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              {/* Image */}
              <Link
                href={`/products/${item.slug}`}
                className="relative w-full aspect-square rounded-xl bg-slate-50 flex items-center justify-center p-2 mb-2 group-hover:scale-102 transition-transform"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-contain p-1"
                  unoptimized={item.image?.startsWith("http")}
                />
              </Link>

              {/* Title */}
              <Link
                href={`/products/${item.slug}`}
                className="text-xs text-slate-700 font-medium line-clamp-2 hover:text-blue-600 leading-snug mb-2 flex-1"
              >
                {item.title}
              </Link>

              {/* Price and Cart */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                <span className="text-xs font-black text-slate-900 font-mono">
                  {formatCurrency(item.price)}
                </span>
                <button
                  onClick={() => handleAddToCart(item)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    addedId === item.productId
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                  }`}
                  title="Agregar al carrito"
                >
                  {addedId === item.productId ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <ShoppingCart className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
