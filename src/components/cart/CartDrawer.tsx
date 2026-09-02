"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Coins,
  Truck,
  Check,
  Lock,
  Zap,
  Ship,
  Box,
} from "lucide-react";
import { formatCurrency } from "@/utils/helpers";
import { useCurrency } from "@/store/useCurrencyStore";
import { calculateFreightCost, FREIGHT_CONFIGS } from "@/utils/shipping";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedProductTitle } from "@/lib/i18n/productI18n";

const PRESET_COUPONS = [
  { code: "LENNOX10", desc: "10% OFF Storewide" },
  { code: "USDT5", desc: "$5 OFF Orders > $50" },
];

export function CartDrawer() {
  const { t, isSpanish } = useTranslation();
  const { currentCurrency, formatCurrency: formatCurrencyFromStore } = useCurrency();
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const discountAmount = useCartStore((state) => state.discountAmount);
  const couponCode = useCartStore((state) => state.couponCode);
  const isFreeShipping = useCartStore((state) => state.freeShipping);
  const shippingMethod = useCartStore((state) => state.shippingMethod);
  const setShippingMethod = useCartStore((state) => state.setShippingMethod);
  const getShippingBreakdown = useCartStore((state) => state.getShippingBreakdown);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const shippingBreakdown = getShippingBreakdown();
  const totalUnits = shippingBreakdown.totalUnits;
  const activeShippingCost = shippingMethod === "sea" ? shippingBreakdown.sea.totalCost : shippingBreakdown.air.totalCost;
  const totalDue = Math.max(0, subtotal - discountAmount + activeShippingCost);

  const freeShippingThreshold = FREIGHT_CONFIGS.air.freeThreshold || 150;
  const progressToFreeShipping = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const getLocalizedCouponMessage = (msg: string, isSuccess: boolean) => {
    if (!isSpanish) return msg;
    if (isSuccess) {
      if (msg.toLowerCase().includes("activated") || msg.toLowerCase().includes("applied")) {
        return "¡Cupón aplicado exitosamente!";
      }
      return msg;
    } else {
      if (msg.toLowerCase().includes("invalid")) return "Código de cupón no válido o expirado.";
      if (msg.toLowerCase().includes("unable")) return "No se pudo validar el cupón en este momento.";
      return msg;
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = await applyCoupon(inputCoupon);
    setCouponMsg({ text: getLocalizedCouponMessage(res.message, res.success), isError: !res.success });
    if (res.success) setInputCoupon("");
  };

  const handlePresetCoupon = async (code: string) => {
    const res = await applyCoupon(code);
    setCouponMsg({ text: getLocalizedCouponMessage(res.message, res.success), isError: !res.success });
  };


  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF1028]/15 text-[#FF1028] flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#00143D] font-heading">{t.cart.title}</h3>
            <span className="text-[10px] text-slate-400 font-medium block font-mono">
              {items.length} {isSpanish ? "artículo(s)" : "item(s)"} • {shippingBreakdown.totalGrossWeight.toFixed(2)} KG • {shippingBreakdown.totalCbm.toFixed(3)} m³
            </span>
          </div>
        </div>
      }
      size="md"
      footer={
        items.length > 0 ? (
          <div className="flex flex-col gap-3 w-full font-montserrat">
            {/* Dynamic Air vs Sea Freight Selector */}
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-0.5">
                <span className="flex items-center gap-1.5 font-heading uppercase tracking-wider text-[10px]">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  {t.checkout.shippingMethod}
                </span>
                <span className="font-mono text-[10px] text-slate-400 font-semibold">
                  {shippingBreakdown.totalGrossWeight.toFixed(2)} kg • {shippingBreakdown.totalCbm.toFixed(3)} m³
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setShippingMethod("air")}
                  className={`p-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                    shippingMethod === "air"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-300 ring-1 ring-blue-500/20"
                      : "bg-slate-100/70 text-slate-600 hover:bg-white/60 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase flex items-center gap-1 font-heading">
                      <Zap className={`w-3 h-3 ${shippingMethod === "air" ? "fill-blue-500 text-blue-600" : "text-slate-400"}`} />
                      {isSpanish ? "Aéreo Express" : "Air Cargo"}
                    </span>
                    <span className={`text-xs font-mono font-black ${shippingMethod === "air" ? "text-blue-600" : "text-slate-700"}`}>
                      {shippingBreakdown.air.totalCost === 0 ? (isSpanish ? "GRATIS" : "FREE") : `$${shippingBreakdown.air.totalCost.toFixed(2)}`}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{isSpanish ? "5–8 Días Express" : "5–8 Days Express"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod("sea")}
                  className={`p-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                    shippingMethod === "sea"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-300 ring-1 ring-blue-500/20"
                      : "bg-slate-100/70 text-slate-600 hover:bg-white/60 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase flex items-center gap-1 font-heading">
                      <Ship className={`w-3 h-3 ${shippingMethod === "sea" ? "text-blue-600" : "text-slate-400"}`} />
                      {isSpanish ? "Carga Marítima" : "Sea Cargo"}
                    </span>
                    <span className={`text-xs font-mono font-black ${shippingMethod === "sea" ? "text-blue-600" : "text-slate-700"}`}>
                      {shippingBreakdown.sea.totalCost === 0 ? (isSpanish ? "GRATIS" : "FREE") : `$${shippingBreakdown.sea.totalCost.toFixed(2)}`}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{isSpanish ? "20–30 Días Granel" : "20–30 Days Bulk"}</span>
                </button>
              </div>
            </div>

            {/* Automatic Price Calculations */}
            <div className="space-y-1.5 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>{t.cart.subtotal}</span>
                <span className="font-bold text-slate-900 font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#FF1028] font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {t.cart.discount} ({couponCode})
                  </span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 font-medium">
                <span>
                  {t.cart.estimatedShipping} ({shippingMethod === "sea" ? (isSpanish ? "Contenedor Marítimo" : "Ocean Container") : (isSpanish ? "Aéreo Prioritario" : "Priority Air")})
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {activeShippingCost === 0 ? (
                    <span className="text-emerald-600 font-black uppercase">{isSpanish ? "GRATIS" : "FREE"}</span>
                  ) : (
                    formatCurrency(activeShippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#00143D] pt-2 border-t border-slate-200">
                <span className="font-heading uppercase text-xs tracking-wider">{t.cart.total} ({currentCurrency})</span>
                <span className="text-base text-[#FF1028] price-tag font-mono font-black">
                  {formatCurrency(totalDue)}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 font-heading uppercase tracking-wider"
            >
              <Lock className="w-4 h-4" />
              <span>{t.cart.proceedToCheckout}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/cart"
              onClick={closeCart}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-[#00143D] transition-colors py-0.5"
            >
              {isSpanish ? "Ver Carrito Completo y Detalles →" : "View Full Cart & Edit Details →"}
            </Link>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-black text-[#00143D] font-heading">{t.cart.emptyCartTitle}</h4>
            <p className="text-xs text-slate-500 max-w-xs">
              {t.cart.emptyCartSubtitle}
            </p>
          </div>
          <Button
            variant="deal"
            size="md"
            onClick={closeCart}
            className="mt-2 font-black font-heading"
          >
            {t.cart.continueShopping}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Free Shipping Progress Bar */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-[#10B981] font-black">
                    {isSpanish ? "🎉 ¡Calificaste para Envío Aéreo GRATIS!" : "🎉 You qualified for FREE Air Cargo!"}
                  </span>
                ) : (
                  <span>
                    {isSpanish ? (
                      <>Agrega <strong className="text-[#FF1028]">${remainingForFreeShipping.toFixed(2)}</strong> para Envío GRATIS</>
                    ) : (
                      <>Add <strong className="text-[#FF1028]">${remainingForFreeShipping.toFixed(2)}</strong> for FREE Shipping</>
                    )}
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-400 font-extrabold">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#10B981] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item Cards List */}
          <div className="space-y-3 divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex gap-3 group">
                {/* Thumbnail */}
                <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="text-xs font-bold text-slate-800 hover:text-[#FF1028] transition-colors line-clamp-2 leading-snug"
                      >
                        {getLocalizedProductTitle(item.slug, item.title, isSpanish)}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer shrink-0"
                        title={isSpanish ? "Eliminar producto" : "Remove item"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Variant Attributes */}
                    {item.attributes && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.attributes).map(([k, v]) => (
                          <span
                            key={k}
                            className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-1.5 py-0.2 rounded"
                          >
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Quantity Stepper */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs sm:text-sm font-black text-[#00143D] price-tag">
                      {formatCurrency(item.price)}
                    </span>

                    {/* Stepper */}
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 py-1 text-xs font-black text-slate-800 min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Input & Quick Vouchers */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="text-xs font-black text-[#00143D] uppercase tracking-wider block">
              {isSpanish ? "Aplicar Cupón de Descuento:" : "Apply Sourcing Voucher:"}
            </span>

            {couponCode ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 text-[#10B981] font-bold">
                  <Check className="w-4 h-4" />
                  <span>{isSpanish ? <>¡Cupón <strong>{couponCode}</strong> aplicado!</> : <>Voucher <strong>{couponCode}</strong> applied!</>}</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                >
                  {isSpanish ? "Eliminar" : "Remove"}
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={isSpanish ? "Ingresa código de cupón (ej. LENNOX10)..." : "Enter voucher code (e.g. LENNOX10)..."}
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl uppercase font-bold focus:outline-none focus:border-[#FF1028]"
                  />
                  <button
                    type="submit"
                    className="bg-[#00143D] hover:bg-[#FF1028] text-white px-3.5 py-2 rounded-xl text-xs font-black transition-colors shrink-0"
                  >
                    {isSpanish ? "Aplicar" : "Apply"}
                  </button>
                </form>

                {/* Preset Voucher Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { code: "LENNOX10", desc: isSpanish ? "10% DCTO en Toda la Tienda" : "10% OFF Storewide" },
                    { code: "USDT5", desc: isSpanish ? "$5 DCTO en Pedidos > $50" : "$5 OFF Orders > $50" },
                  ].map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handlePresetCoupon(c.code)}
                      className="text-[10px] font-black bg-red-50 hover:bg-[#FF1028] text-[#FF1028] hover:text-white border border-red-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      {c.code} ({c.desc})
                    </button>
                  ))}
                </div>
              </>
            )}

            {couponMsg && (
              <div
                className={`text-[11px] font-bold ${
                  couponMsg.isError ? "text-red-500" : "text-[#10B981]"
                }`}
              >
                {couponMsg.text}
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
