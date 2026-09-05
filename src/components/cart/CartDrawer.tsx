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
  Tag,
  Truck,
  Check,
  Lock,
  Zap,
  Ship,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/utils/helpers";
import { useCurrency } from "@/store/useCurrencyStore";
import { FREIGHT_CONFIGS } from "@/utils/shipping";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedProductTitle } from "@/lib/i18n/productI18n";

export function CartDrawer() {
  const { t, isSpanish } = useTranslation();
  const { currentCurrency } = useCurrency();
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const discountAmount = useCartStore((state) => state.discountAmount);
  const couponCode = useCartStore((state) => state.couponCode);
  const isApplyingCoupon = useCartStore((state) => state.isApplyingCoupon);
  const shippingMethod = useCartStore((state) => state.shippingMethod);
  const setShippingMethod = useCartStore((state) => state.setShippingMethod);
  const getShippingBreakdown = useCartStore((state) => state.getShippingBreakdown);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const [inputCoupon, setInputCoupon] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const shippingBreakdown = getShippingBreakdown();
  const totalUnits = useCartStore((state) => state.getTotalItems());
  const activeShippingCost =
    shippingMethod === "sea"
      ? shippingBreakdown.sea.totalCost
      : shippingBreakdown.air.totalCost;
  const totalDue = Math.max(0, subtotal - discountAmount + activeShippingCost);

  const freeShippingThreshold = FREIGHT_CONFIGS.air.freeThreshold || 150;
  const progressToFreeShipping = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const presetCoupons = [
    {
      code: "LENNOX10",
      desc: isSpanish ? "10% DCTO" : "10% OFF",
    },
    {
      code: "USDT5",
      desc: isSpanish ? "$5 DCTO > $50" : "$5 OFF > $50",
    },
  ];

  const getLocalizedCouponMessage = (msg: string, isSuccess: boolean) => {
    if (!isSpanish) return msg;
    if (isSuccess) {
      if (
        msg.toLowerCase().includes("activated") ||
        msg.toLowerCase().includes("applied")
      ) {
        return "¡Cupón aplicado exitosamente!";
      }
      return msg;
    } else {
      if (msg.toLowerCase().includes("invalid"))
        return "Código de cupón no válido o expirado.";
      if (msg.toLowerCase().includes("unable"))
        return "No se pudo validar el cupón en este momento.";
      return msg;
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = await applyCoupon(inputCoupon);
    setCouponMsg({
      text: getLocalizedCouponMessage(res.message, res.success),
      isError: !res.success,
    });
    if (res.success) setInputCoupon("");
  };

  const handlePresetCoupon = async (code: string) => {
    const res = await applyCoupon(code);
    setCouponMsg({
      text: getLocalizedCouponMessage(res.message, res.success),
      isError: !res.success,
    });
  };


  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      headerClassName="px-4 sm:px-5 py-3.5 bg-white border-b border-slate-100"
      contentClassName="p-0 overflow-y-auto"
      footerClassName="px-4 sm:px-5 py-3 sm:py-4 bg-white border-t border-slate-100 pb-[max(1rem,env(safe-area-inset-bottom))]"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 font-heading leading-none">
                {t.cart.title}
              </h3>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-mono leading-none">
                {totalUnits}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1">
              {shippingBreakdown.totalGrossWeight.toFixed(2)} kg · {shippingBreakdown.totalCbm.toFixed(3)} m³
            </span>
          </div>
        </div>
      }
      size="md"
      footer={
        items.length > 0 ? (
          <div className="flex flex-col gap-2.5 w-full font-montserrat">
            {/* Dynamic Air vs Sea Freight Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-0.5">
                <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px] text-slate-600">
                  <Truck className="w-3 h-3 text-slate-400" />
                  {t.checkout.shippingMethod}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {shippingBreakdown.totalGrossWeight.toFixed(2)} kg · {shippingBreakdown.totalCbm.toFixed(3)} m³
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-xl">
                <button
                  type="button"
                  onClick={() => setShippingMethod("air")}
                  className={`py-1.5 px-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    shippingMethod === "air"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold flex items-center gap-1 truncate">
                      <Zap
                        className={`w-3 h-3 shrink-0 ${
                          shippingMethod === "air"
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-400"
                        }`}
                      />
                      {isSpanish ? "Aéreo Express" : "Air Cargo"}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold shrink-0 ${
                        shippingBreakdown.air.totalCost === 0
                          ? "text-emerald-600"
                          : "text-slate-700"
                      }`}
                    >
                      {shippingBreakdown.air.totalCost === 0
                        ? isSpanish
                          ? "GRATIS"
                          : "FREE"
                        : `$${shippingBreakdown.air.totalCost.toFixed(2)}`}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block truncate pl-4">
                    {isSpanish ? "5–8 Días Express" : "5–8 Days Express"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod("sea")}
                  className={`py-1.5 px-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    shippingMethod === "sea"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold flex items-center gap-1 truncate">
                      <Ship
                        className={`w-3 h-3 shrink-0 ${
                          shippingMethod === "sea"
                            ? "text-blue-500"
                            : "text-slate-400"
                        }`}
                      />
                      {isSpanish ? "Carga Marítima" : "Sea Cargo"}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold shrink-0 ${
                        shippingBreakdown.sea.totalCost === 0
                          ? "text-emerald-600"
                          : "text-slate-700"
                      }`}
                    >
                      {shippingBreakdown.sea.totalCost === 0
                        ? isSpanish
                          ? "GRATIS"
                          : "FREE"
                        : `$${shippingBreakdown.sea.totalCost.toFixed(2)}`}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block truncate pl-4">
                    {isSpanish ? "20–30 Días Granel" : "20–30 Days Bulk"}
                  </span>
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {t.cart.discount}{" "}
                    {couponCode ? `(${couponCode})` : ""}
                  </span>
                  <span className="font-mono">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 font-medium">
                <span>
                  {t.cart.estimatedShipping} (
                  {shippingMethod === "sea"
                    ? isSpanish
                      ? "Marítimo"
                      : "Sea"
                    : isSpanish
                    ? "Aéreo"
                    : "Air"}
                  )
                </span>
                <span className="font-semibold font-mono">
                  {activeShippingCost === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase">
                      {isSpanish ? "GRATIS" : "FREE"}
                    </span>
                  ) : (
                    <span className="text-slate-800">
                      {formatCurrency(activeShippingCost)}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-slate-900 font-heading uppercase tracking-wide">
                    {t.cart.total}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({currentCurrency})
                  </span>
                </div>
                <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  {formatCurrency(totalDue)}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 sm:py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all active:scale-[0.99] font-heading uppercase tracking-wider cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 opacity-90" />
              <span>{t.cart.proceedToCheckout}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/cart"
              onClick={closeCart}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors py-0.5 block"
            >
              {isSpanish
                ? "Ver Carrito Completo y Detalles →"
                : "View Full Cart & Edit Details →"}
            </Link>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 font-heading">
              {t.cart.emptyCartTitle}
            </h4>
            <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
              {t.cart.emptyCartSubtitle}
            </p>
          </div>
          <Button
            variant="deal"
            size="sm"
            onClick={closeCart}
            className="mt-2 font-bold text-xs rounded-xl px-4 py-2"
          >
            {t.cart.continueShopping}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Free Shipping Progress Notification Banner */}
          <div className="bg-slate-50/80 border-b border-slate-100 px-4 sm:px-5 py-2.5 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {isSpanish
                      ? "¡Calificaste para Envío Aéreo GRATIS!"
                      : "You qualified for FREE Air Cargo!"}
                  </span>
                ) : (
                  <span className="text-slate-600">
                    {isSpanish ? (
                      <>
                        Agrega{" "}
                        <strong className="font-semibold text-slate-900">
                          ${remainingForFreeShipping.toFixed(2)}
                        </strong>{" "}
                        para Envío Aéreo GRATIS
                      </>
                    ) : (
                      <>
                        Add{" "}
                        <strong className="font-semibold text-slate-900">
                          ${remainingForFreeShipping.toFixed(2)}
                        </strong>{" "}
                        for FREE Air Cargo
                      </>
                    )}
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-400 font-bold font-mono">
                {Math.round(progressToFreeShipping)}%
              </span>
            </div>
            <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item Cards List */}
          <div className="px-4 sm:px-5 py-1 divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="py-3.5 first:pt-3 last:pb-3 flex gap-3 sm:gap-3.5 group"
              >
                {/* Thumbnail */}
                <Link
                  href={`/products/${item.slug}`}
                  onClick={closeCart}
                  className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 block group-hover:opacity-90 transition-opacity"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 64px, 72px"
                    className="object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="text-xs sm:text-[13px] font-semibold text-slate-800 hover:text-[#FF1028] transition-colors line-clamp-2 leading-snug"
                      >
                        {getLocalizedProductTitle(item.slug, item.title, isSpanish)}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors cursor-pointer shrink-0 -mr-1 -mt-0.5"
                        title={isSpanish ? "Eliminar producto" : "Remove item"}
                        aria-label={isSpanish ? "Eliminar producto" : "Remove item"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Variant Attributes */}
                    {item.attributes &&
                      Object.keys(item.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.attributes).map(([k, v]) => (
                            <span
                              key={k}
                              className="bg-slate-100 text-slate-500 text-[10px] font-medium px-1.5 py-0.5 rounded"
                            >
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Price & Modern Stepper */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                      {formatCurrency(item.price)}
                    </span>

                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50/50 p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer active:scale-95"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 sm:w-7 text-center text-xs font-bold text-slate-800 select-none font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer active:scale-95"
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

          {/* Sourcing Voucher Section */}
          <div className="px-4 sm:px-5 py-3 border-t border-slate-100">
            {couponCode ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    <strong className="font-bold">{couponCode}</strong>{" "}
                    {isSpanish ? "aplicado" : "applied"} (-
                    {formatCurrency(discountAmount)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer transition-colors"
                >
                  {isSpanish ? "Quitar" : "Remove"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowPromoInput(!showPromoInput)}
                  className="flex items-center justify-between w-full text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors py-0.5 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    {isSpanish
                      ? "¿Tienes un cupón de descuento?"
                      : "Have a sourcing voucher?"}
                  </span>
                  {showPromoInput ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {showPromoInput && (
                  <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder={
                          isSpanish
                            ? "Código (ej. LENNOX10)..."
                            : "Enter code (e.g. LENNOX10)..."
                        }
                        value={inputCoupon}
                        onChange={(e) =>
                          setInputCoupon(e.target.value.toUpperCase())
                        }
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl uppercase font-semibold focus:outline-none focus:border-slate-900 bg-white placeholder:normal-case placeholder:font-normal"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !inputCoupon.trim()}
                        className="bg-slate-900 hover:bg-[#FF1028] disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center justify-center min-w-[64px] cursor-pointer"
                      >
                        {isApplyingCoupon ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isSpanish ? (
                          "Aplicar"
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </form>

                    {/* Quick preset voucher chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {isSpanish ? "Sugeridos:" : "Quick codes:"}
                      </span>
                      {presetCoupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handlePresetCoupon(c.code)}
                          disabled={isApplyingCoupon}
                          className="text-[10px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 transition-colors cursor-pointer"
                        >
                          <span className="font-bold text-slate-800">
                            {c.code}
                          </span>{" "}
                          ({c.desc})
                        </button>
                      ))}
                    </div>

                    {couponMsg && (
                      <p
                        className={`text-[11px] font-medium pt-0.5 ${
                          couponMsg.isError
                            ? "text-red-500"
                            : "text-emerald-600"
                        }`}
                      >
                        {couponMsg.text}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
