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
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatCurrency } from "@/utils/helpers";

const PRESET_COUPONS = [
  { code: "LENNOX10", desc: "10% OFF Sourcing Order" },
  { code: "USDT5", desc: "$5 OFF Orders > $50" },
];

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const finalTotal = useCartStore((state) => state.getFinalTotal());
  const discountAmount = useCartStore((state) => state.discountAmount);
  const couponCode = useCartStore((state) => state.couponCode);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 4.99;
  const freeShippingThreshold = 50;
  const progressToFreeShipping = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setInputCoupon("");
  };

  const handlePresetCoupon = (code: string) => {
    const res = applyCoupon(code);
    setCouponMsg({ text: res.message, isError: !res.success });
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-5 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-[#00143D] font-heading">Your Cart is Empty</h1>
          <p className="text-xs text-slate-500">
            Explore 100,000+ factory-direct China hardware products with zero Binance Pay USDT gateway fees.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#FF1028] hover:bg-[#E00B20] text-white px-6 py-3 rounded-xl text-xs font-black font-heading transition-all shadow-md"
        >
          <Zap className="w-4 h-4" />
          <span>Explore Sourcing Deals</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shopping Cart", href: "#" },
        ]}
      />

      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#00143D]">
            Sourcing Shopping Cart
          </h1>
          <span className="text-xs text-slate-500 font-semibold mt-0.5 block">
            {items.length} items ready for direct China procurement & air freight
          </span>
        </div>
        <Link
          href="/"
          className="text-xs font-bold text-[#FF1028] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Sourcing</span>
        </Link>
      </div>

      {/* Free Shipping Progress Banner */}
      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-2 text-slate-800">
            <Truck className="w-4 h-4 text-blue-600" />
            {remainingForFreeShipping === 0 ? (
              <span className="text-[#10B981] font-black">
                🎉 Congratulations! Your order qualifies for FREE International Air Cargo.
              </span>
            ) : (
              <span>
                Add <strong className="text-[#FF1028]">${remainingForFreeShipping.toFixed(2)} USDT</strong> more to unlock FREE Air Cargo Express!
              </span>
            )}
          </span>
          <span className="text-xs text-slate-500 font-black">{Math.round(progressToFreeShipping)}%</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#10B981] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Items List (8 Cols) ── */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 group">
                {/* Thumbnail */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#FF1028] transition-colors leading-snug line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Variant Attributes */}
                    {item.attributes && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {Object.entries(item.attributes).map(([k, v]) => (
                          <span
                            key={k}
                            className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md"
                          >
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Stepper Row */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base sm:text-lg font-black text-[#00143D] price-tag">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[11px] text-slate-400 font-semibold">
                          ({formatCurrency(item.price)} each)
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1.5 text-xs font-black text-slate-800 min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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

          {/* Sourcing Guarantee Footer */}
          <div className="bg-[#00143D] text-white p-4 rounded-3xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#10B981] shrink-0" />
              <div>
                <span className="text-xs font-black block">Single-Vendor Assurance</span>
                <span className="text-[10px] text-slate-300">
                  Every PO is validated with China factories & quality inspected before international air cargo dispatch.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Order Summary & Checkout CTA (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-5">
            <h3 className="text-sm font-black text-[#00143D] uppercase tracking-wider pb-3 border-b border-slate-200">
              Order Sourcing Summary
            </h3>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#FF1028] font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Voucher Discount ({couponCode})
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Standard Air Freight</span>
                <span className="font-bold text-slate-900">
                  {shipping === 0 ? (
                    <span className="text-[#10B981] font-black uppercase">FREE</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-[#00143D] pt-3 border-t border-slate-200">
                <span>Total Due (USDT)</span>
                <span className="text-xl text-[#FF1028] price-tag">
                  {formatCurrency(finalTotal + shipping)}
                </span>
              </div>
            </div>

            {/* Voucher Code Form */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <label className="text-xs font-black text-[#00143D] uppercase tracking-wider block">
                Have a Voucher Code?
              </label>

              {couponCode ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 text-[#10B981] font-bold">
                    <Check className="w-4 h-4" />
                    <span>Voucher <strong>{couponCode}</strong> active</span>
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
                      className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl uppercase font-bold focus:outline-none focus:border-[#FF1028]"
                    />
                    <button
                      type="submit"
                      className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2.5 rounded-xl text-xs font-black transition-colors shrink-0 cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PRESET_COUPONS.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handlePresetCoupon(c.code)}
                        className="text-[10px] font-black bg-red-50 hover:bg-[#FF1028] text-[#FF1028] hover:text-white border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
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

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>Proceed to USDT Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Crypto Notice */}
            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-semibold">
              <Coins className="w-4 h-4 text-[#10B981]" />
              <span>Binance Pay Instant Settlement • Zero Fees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
