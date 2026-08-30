"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ArrowLeft,
  Zap,
  Heart,
  RotateCcw,
  Plane,
  Clock,
  Sparkles,
  AlertCircle,
  Ship,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatCurrency } from "@/utils/helpers";
import { calculateFreightCost, FREIGHT_CONFIGS } from "@/utils/shipping";

const PRESET_COUPONS = [
  { code: "LENNOX10", desc: "10% Off Sourcing Order" },
  { code: "WELCOME10", desc: "10% Off First PO" },
  { code: "FREESHIP", desc: "Free Express Airfreight" },
];

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const discountAmount = useCartStore((state) => state.discountAmount);
  const couponCode = useCartStore((state) => state.couponCode);
  const isFreeShipping = useCartStore((state) => state.freeShipping);
  const shippingMethod = useCartStore((state) => state.shippingMethod);
  const setShippingMethod = useCartStore((state) => state.setShippingMethod);
  const getShippingBreakdown = useCartStore((state) => state.getShippingBreakdown);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const shippingBreakdown = getShippingBreakdown();
  const totalUnits = shippingBreakdown.totalUnits;
  const activeShipping = shippingMethod === "sea" ? shippingBreakdown.sea.totalCost : shippingBreakdown.air.totalCost;
  const totalDue = Math.max(0, subtotal - discountAmount + activeShipping);

  const freeShippingThreshold = FREIGHT_CONFIGS.air.freeThreshold || 150;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res: any = await applyCoupon(inputCoupon);
    setCouponMsg({ text: res?.message || "", isError: !res?.success });
    if (res?.success) setInputCoupon("");
  };

  const handlePresetCoupon = async (code: string) => {
    const res: any = await applyCoupon(code);
    setCouponMsg({ text: res?.message || "", isError: !res?.success });
  };

  const handleMoveToWishlist = (item: any) => {
    toggleWishlist({
      id: `w-${item.productId}`,
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      image: item.image,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      rating: 5.0,
      reviewCount: 18,
    });
    removeItem(item.id);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
        <div className="text-center space-y-5 max-w-md mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#00143D] font-heading">
              Your Sourcing Cart is Empty
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore 100,000+ factory-direct China electronics and hardware items with zero Binance Pay USDT gateway fees.
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-[#FF1028] hover:bg-[#E00B20] text-white px-6 py-3.5 rounded-2xl text-xs font-black font-heading transition-all shadow-md active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Explore Factory Catalogue</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      {/* ── Breadcrumbs & Header ── */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Sourcing Cart" },
            ]}
          />

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase font-mono">
                Direct China Factory Procurement
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#00143D] mt-0.5">
                Shopping Cart ({items.reduce((sum, i) => sum + i.quantity, 0)} Units)
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
              <span className="text-slate-300">|</span>
              <Link
                href="/categories"
                className="text-xs font-bold text-[#FF1028] hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Free Shipping Progress Banner ── */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-2 text-slate-800">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              {remainingForFreeShipping === 0 ? (
                <span className="text-emerald-600 font-black flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Your order qualifies for FREE International Air Cargo (5–8 Days)!
                </span>
              ) : (
                <span>
                  Add <strong className="text-[#FF1028]">${remainingForFreeShipping.toFixed(2)} USDT</strong> more to unlock FREE Air Cargo Express!
                </span>
              )}
            </span>
            <span className="text-xs font-mono font-black text-slate-500">
              {Math.round(progressToFreeShipping)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Items Table (8 Cols) ── */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 group">
                  {/* Image */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>

                  {/* Item Specs & Title */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#FF1028] transition-colors leading-snug line-clamp-2"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleMoveToWishlist(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF1028] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Move to Wishlist"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Remove from Cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Variant Specs */}
                      {item.attributes && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(item.attributes).map(([k, v]) => (
                            <span
                              key={k}
                              className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                            >
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity Stepper & Price Row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-black text-[#00143D] font-mono">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            (${item.price.toFixed(2)} ea)
                          </span>
                        )}
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1.5 text-xs font-black font-mono text-slate-800 min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sourcing Seal Card */}
            <div className="bg-[#00143D] text-white p-5 rounded-3xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-black font-heading block uppercase tracking-wider">
                    Factory Quality Assurance
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Inspected at Shenzhen factory gates before export packing. 30-day USDT dispute warranty.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Order Summary & Checkout Action (4 Cols) ── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-24">
              <h3 className="text-sm font-black text-[#00143D] uppercase tracking-wider pb-3 border-b border-slate-100 font-heading">
                Order Sourcing Summary
              </h3>

              {/* Dynamic Shipping Selection */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 font-heading uppercase tracking-wider text-[11px]">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Freight Shipping Route
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">
                    {shippingBreakdown.totalGrossWeight.toFixed(2)} kg • {shippingBreakdown.totalCbm.toFixed(3)} m³
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setShippingMethod("air")}
                    className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      shippingMethod === "air"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-300 ring-1 ring-blue-500/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase font-heading flex items-center gap-1.5">
                        <Zap className={`w-3.5 h-3.5 ${shippingMethod === "air" ? "fill-blue-500 text-blue-600" : "text-slate-400"}`} />
                        Direct Air
                      </span>
                      <span className={`text-xs font-mono font-black ${shippingMethod === "air" ? "text-blue-600" : "text-slate-700"}`}>
                        {shippingBreakdown.air.totalCost === 0 ? "FREE" : `$${shippingBreakdown.air.totalCost.toFixed(2)}`}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">5–8 Days Priority</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod("sea")}
                    className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      shippingMethod === "sea"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-300 ring-1 ring-blue-500/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase font-heading flex items-center gap-1.5">
                        <Ship className={`w-3.5 h-3.5 ${shippingMethod === "sea" ? "text-blue-600" : "text-slate-400"}`} />
                        Sea Cargo
                      </span>
                      <span className={`text-xs font-mono font-black ${shippingMethod === "sea" ? "text-blue-600" : "text-slate-700"}`}>
                        {shippingBreakdown.sea.totalCost === 0 ? "FREE" : `$${shippingBreakdown.sea.totalCost.toFixed(2)}`}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">20–30 Days Bulk</span>
                  </button>
                </div>
              </div>

              {/* Price Computations */}
              <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100 font-montserrat">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Procurement Subtotal</span>
                  <span className="font-bold text-slate-900 font-mono">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#FF1028] font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Voucher Discount ({couponCode})
                    </span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 font-medium">
                  <span>
                    {shippingMethod === "sea" ? "Ocean Container Freight" : "Priority Direct Air Cargo"} ({totalUnits} {totalUnits === 1 ? "unit" : "units"})
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {activeShipping === 0 ? (
                      <span className="text-emerald-600 font-black uppercase">FREE</span>
                    ) : (
                      formatCurrency(activeShipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-[#00143D] pt-3 border-t border-slate-200">
                  <span className="font-heading uppercase text-xs tracking-wider">Total Due (USDT)</span>
                  <span className="text-xl text-[#FF1028] font-mono font-black">
                    {formatCurrency(totalDue)}
                  </span>
                </div>
              </div>

              {/* Voucher Code Form */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <label className="text-xs font-black text-[#00143D] uppercase tracking-wider block font-heading">
                  Apply Sourcing Voucher
                </label>

                {couponCode ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <Check className="w-4 h-4" />
                      <span>Voucher <strong>{couponCode}</strong> Active</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. LENNOX10"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                        className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl uppercase font-mono font-bold focus:outline-none focus:border-[#FF1028]"
                      />
                      <button
                        type="submit"
                        className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2.5 rounded-xl text-xs font-black transition-colors shrink-0 cursor-pointer font-heading"
                      >
                        Apply
                      </button>
                    </form>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PRESET_COUPONS.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handlePresetCoupon(c.code)}
                          className="text-[10px] font-bold bg-slate-100 hover:bg-[#FF1028] hover:text-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer font-mono"
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {couponMsg && (
                  <div className={`text-[11px] font-bold ${couponMsg.isError ? "text-red-500" : "text-emerald-600"}`}>
                    {couponMsg.text}
                  </div>
                )}
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-4 px-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer font-heading active:scale-98"
              >
                <Lock className="w-4 h-4" />
                <span>Proceed to USDT Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Payment Info Badge */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-center gap-2 font-semibold">
                <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Binance Pay Zero-Fee Escrow • Instant Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h4 className="font-heading font-black text-base text-[#00143D]">
              Clear Shopping Cart?
            </h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove all {items.length} items from your shopping cart?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-black text-xs font-heading cursor-pointer"
              >
                Yes, Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
