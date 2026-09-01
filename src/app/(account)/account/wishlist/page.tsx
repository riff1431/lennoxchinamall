"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ShoppingCart, Check, Zap } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { Rating } from "@/components/ui/Rating";
import { formatCurrency } from "@/utils/helpers";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedProductTitle } from "@/lib/i18n/productI18n";

export default function WishlistPage() {
  const { isSpanish } = useTranslation();
  const wishlistItems = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const [movedId, setMovedId] = useState<string | null>(null);

  const handleMoveToCart = (item: (typeof wishlistItems)[0]) => {
    addItem({
      id: item.productId,
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      image: item.image,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      quantity: 1,
      stock: 50,
    });

    setMovedId(item.productId);
    setTimeout(() => {
      removeItem(item.productId);
      setMovedId(null);
      openCart();
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#FF1028] fill-[#FF1028]" />
            <span>
              {isSpanish
                ? `Mi Lista de Deseos (${wishlistItems.length})`
                : `My Sourcing Wishlist (${wishlistItems.length})`}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isSpanish
              ? "Productos directos de fábrica de China guardados, listos para comprar con USDT en 1 clic."
              : "Saved direct-from-China factory products ready for single-click USDT procurement."}
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs text-slate-400 hover:text-red-500 font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            {isSpanish ? "Vaciar Lista de Deseos" : "Clear All Saved"}
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-xs">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#00143D]">
              {isSpanish ? "Tu Lista de Deseos Está Vacía" : "Your Wishlist is Empty"}
            </h3>
            <p className="text-xs text-slate-500">
              {isSpanish
                ? "Guarda productos mientras exploras nuestros catálogos de fábrica de China para monitorear descuentos y ofertas flash."
                : "Save products while browsing our China factory catalogues to monitor price drops and flash sales."}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl text-xs font-black transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>{isSpanish ? "Explorar Ofertas de Abastecimiento" : "Browse Sourcing Deals"}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#00143D]/30 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={item.image}
                    alt={getLocalizedProductTitle(item.slug, item.title, isSpanish)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-xs font-bold text-slate-800 hover:text-[#FF1028] transition-colors line-clamp-2 leading-snug"
                  >
                    {getLocalizedProductTitle(item.slug, item.title, isSpanish)}
                  </Link>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm font-black text-[#00143D] price-tag">
                      {formatCurrency(item.price)}
                    </span>
                    {item.compareAtPrice && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ${item.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleMoveToCart(item)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    movedId === item.productId
                      ? "bg-[#10B981] text-white"
                      : "bg-[#00143D] hover:bg-[#FF1028] text-white"
                  }`}
                >
                  {movedId === item.productId ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSpanish ? "¡Movido!" : "Moved!"}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isSpanish ? "Mover al Carrito" : "Move to Cart"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title={isSpanish ? "Eliminar de la lista" : "Remove from wishlist"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
