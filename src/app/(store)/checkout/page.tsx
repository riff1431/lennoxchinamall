"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  Coins,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  Tag,
  Plane,
  Building,
  CreditCard,
  AlertCircle,
  ExternalLink,
  PackageCheck,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Modal } from "@/components/ui/Modal";
import {
  formatCurrency,
  generateOrderNumber,
  generateMerchantTradeNo,
} from "@/utils/helpers";

type CheckoutStep = 1 | 2 | 3;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const discountAmount = useCartStore((state) => state.discountAmount);
  const couponCode = useCartStore((state) => state.couponCode);
  const clearCart = useCartStore((state) => state.clearCart);

  // Multi-step Checkout State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  // Form State: Shipping & Contact
  const [fullName, setFullName] = useState("Alex Harrison");
  const [email, setEmail] = useState("alex.harrison@example.com");
  const [phone, setPhone] = useState("+1 415 555 9182");
  const [street, setStreet] = useState("2847 Mission Street, Suite 400");
  const [city, setCity] = useState("San Francisco");
  const [state, setState] = useState("CA");
  const [postal, setPostal] = useState("94110");
  const [country, setCountry] = useState("United States");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [notes, setNotes] = useState("");

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"awaiting" | "verifying" | "success">("awaiting");
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [merchantTradeNo, setMerchantTradeNo] = useState<string | null>(null);
  const [prepayId, setPrepayId] = useState<string | null>(null);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedTradeNo, setCopiedTradeNo] = useState(false);
  const [qrExpirySeconds, setQrExpirySeconds] = useState(1800); // 30 mins

  // Cart state
  const isFreeShipping = useCartStore((state) => state.freeShipping);
  const isApplyingCoupon = useCartStore((state) => state.isApplyingCoupon);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);
  const [checkoutCoupon, setCheckoutCoupon] = useState("");
  const [checkoutCouponMsg, setCheckoutCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Automatic Shipping & USDT Calculations
  const standardShippingCost = isFreeShipping || subtotal > 50 ? 0 : 4.99;
  const shippingCost = isFreeShipping ? 0 : shippingMethod === "express" ? 14.99 : standardShippingCost;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyCheckoutCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCoupon.trim()) return;
    const res = await applyCoupon(checkoutCoupon);
    setCheckoutCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCheckoutCoupon("");
  };


  // Countdown timer for QR code
  useEffect(() => {
    if (!isPaymentModalOpen || paymentStatus === "success") return;
    const interval = setInterval(() => {
      setQrExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaymentModalOpen, paymentStatus]);

  const handleLaunchPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const orderNo = generateOrderNumber();
    const tradeNo = generateMerchantTradeNo();
    const mockPrepay = `BINANCE-USDT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    setCreatedOrderNumber(orderNo);
    setMerchantTradeNo(tradeNo);
    setPrepayId(mockPrepay);
    setPaymentStatus("awaiting");
    setQrExpirySeconds(1800);
    setIsPaymentModalOpen(true);
  };

  const handleSimulatePayment = () => {
    setPaymentStatus("verifying");
    setTimeout(() => {
      setPaymentStatus("success");
      clearCart();
    }, 2000);
  };

  const copyToClipboard = (text: string, type: "amount" | "tradeNo") => {
    navigator.clipboard.writeText(text);
    if (type === "amount") {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 1500);
    } else {
      setCopiedTradeNo(true);
      setTimeout(() => setCopiedTradeNo(false), 1500);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (items.length === 0 && !createdOrderNumber) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <PackageCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-[#00143D] font-heading">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-slate-500">
            Please add items to your cart before proceeding to checkout.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-[#00143D] hover:bg-[#002366] text-white py-2.5 px-6 rounded-xl text-xs font-black font-heading transition-colors"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Secure USDT Checkout", href: "#" },
        ]}
      />

      {/* ── 1. Step-by-Step Progress Header ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#00143D]">
              Direct China Sourcing Checkout
            </h1>
            <span className="text-xs text-slate-500 font-semibold">
              Binance Pay USDT Escrow • 7-12 Days Global Air Cargo
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Sourcing Gateway</span>
          </div>
        </div>

        {/* 3 Step Indicators */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all text-left ${
              currentStep === 1
                ? "border-[#00143D] bg-slate-50 shadow-xs"
                : "border-slate-100 opacity-70"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                currentStep === 1
                  ? "bg-[#00143D] text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              1
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                Shipping Address
              </span>
              <span className="text-[10px] text-slate-400">Destination Details</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all text-left ${
              currentStep === 2
                ? "border-[#00143D] bg-slate-50 shadow-xs"
                : "border-slate-100 opacity-70"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                currentStep === 2
                  ? "bg-[#00143D] text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              2
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                Air Freight
              </span>
              <span className="text-[10px] text-slate-400">Transit Carrier</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all text-left ${
              currentStep === 3
                ? "border-[#FF1028] bg-red-50/50 shadow-xs"
                : "border-slate-100 opacity-70"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                currentStep === 3
                  ? "bg-[#FF1028] text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              3
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                USDT Payment
              </span>
              <span className="text-[10px] text-slate-400">Binance Pay QR</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── 2. Main Checkout Grid (8 Cols Left, 4 Cols Summary) ── */}
      <form onSubmit={handleLaunchPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Steps (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Shipping Destination & Contact */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#00143D] uppercase flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>1. Shipping Destination & Buyer Contact</span>
              </h3>
              <span className="text-[11px] font-bold text-[#10B981]">DDP Customs Included</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-semibold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address (for Order Updates) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-semibold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number (with country code) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-semibold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Country / Region *</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-bold bg-white focus:outline-none focus:border-[#00143D]"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="France">France</option>
                  <option value="Spain">Spain</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Street Address *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-semibold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-semibold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">State / Prov *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-semibold focus:outline-none focus:border-[#00143D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-semibold focus:outline-none focus:border-[#00143D]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Air Cargo Shipping Method */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-black text-[#00143D] uppercase flex items-center gap-2 pb-3 border-b border-slate-100">
              <Plane className="w-4 h-4 text-[#FF1028]" />
              <span>2. International Air Freight Carrier</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setShippingMethod("standard")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  shippingMethod === "standard"
                    ? "border-[#00143D] bg-slate-50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-slate-900">
                      Standard Air Express
                    </span>
                    <span className="text-xs font-black text-[#10B981]">
                      {standardShippingCost === 0 ? "FREE" : "$4.99 USDT"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    7-12 business days. Full door-to-door tracking via YunExpress / 4PX Cargo.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 mt-2 block">
                  ✓ Most Popular Choice
                </span>
              </div>

              <div
                onClick={() => setShippingMethod("express")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  shippingMethod === "express"
                    ? "border-[#FF1028] bg-red-50/40 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-slate-900">
                      Priority DHL / FedEx Air
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      $14.99 USDT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    3-5 business days. Dedicated air freight routing with signature on delivery.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#FF1028] mt-2 block">
                  ⚡ Fastest Delivery
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: Payment Method Overview */}
          <div className="bg-gradient-to-br from-[#00143D] to-[#002366] text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF1028] text-white flex items-center justify-center shadow-md">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white">
                    3. Binance Pay USDT Settlement
                  </h3>
                  <span className="text-[10px] text-slate-300">
                    Instant zero-fee QR payment directly from Binance App
                  </span>
                </div>
              </div>
              <span className="bg-[#10B981] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                ZERO FEE
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              Upon clicking below, a unique Binance Pay QR code and prepay transaction ID will be generated. You can scan with your Binance App or Binance Web3 Wallet to complete the payment instantly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
                <span className="font-bold block text-amber-300">1. Instant Escrow</span>
                <span className="text-slate-300">Funds locked until factory release.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
                <span className="font-bold block text-amber-300">2. No Chargebacks</span>
                <span className="text-slate-300">Secure crypto transaction hash.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
                <span className="font-bold block text-amber-300">3. 30-Day Protection</span>
                <span className="text-slate-300">Direct USDT refund warranty.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Items Snapshot & Totals (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-5">
            <h3 className="text-sm font-black text-[#00143D] uppercase tracking-wider pb-3 border-b border-slate-200">
              Sourcing Order Review
            </h3>

            {/* Compact Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#00143D] shrink-0 price-tag">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Automatic Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {/* Dynamic Coupon Input */}
              <div className="pt-2">
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{couponCode} Applied (-{formatCurrency(discountAmount)})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCoupon()}
                      className="text-xs text-red-600 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Promo or Voucher Code"
                        value={checkoutCoupon}
                        onChange={(e) => setCheckoutCoupon(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-bold focus:outline-none focus:border-[#00143D]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCheckoutCoupon}
                        disabled={isApplyingCoupon}
                        className="bg-[#00143D] hover:bg-[#FF1028] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {isApplyingCoupon ? "Checking..." : "Apply"}
                      </button>
                    </div>
                    {checkoutCouponMsg && (
                      <p className={`text-[11px] font-semibold ${checkoutCouponMsg.isError ? "text-red-500" : "text-emerald-600"}`}>
                        {checkoutCouponMsg.text}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#FF1028] font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Voucher ({couponCode})
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}


              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Air Freight ({shippingMethod === "express" ? "Priority" : "Standard"})</span>
                <span className="font-bold text-slate-900">
                  {shippingCost === 0 ? (
                    <span className="text-[#10B981] font-black uppercase">FREE</span>
                  ) : (
                    formatCurrency(shippingCost)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-[#00143D] pt-3 border-t border-slate-200">
                <span>Final USDT Total</span>
                <span className="text-xl text-[#FF1028] price-tag">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Launch Payment Button */}
            <button
              type="submit"
              className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-98"
            >
              <QrCode className="w-5 h-5" />
              <span>Generate Binance Pay QR</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[10px] text-slate-400 font-semibold">
              🔒 Safe & direct factory procurement via Lennox Single-Vendor Gateway.
            </div>
          </div>
        </div>
      </form>

      {/* ── 3. Binance Pay USDT Modal & Live Payment Status Screen ── */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          if (paymentStatus !== "verifying") {
            setIsPaymentModalOpen(false);
          }
        }}
        title="Binance Pay USDT Prepay Gateway"
        size="md"
      >
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header Status Bar */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold">
              {paymentStatus === "awaiting" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-amber-700">Awaiting USDT Payment</span>
                </>
              )}
              {paymentStatus === "verifying" && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span className="text-blue-700">Verifying on Binance Chain...</span>
                </>
              )}
              {paymentStatus === "success" && (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">Payment Confirmed & Verified!</span>
                </>
              )}
            </div>

            <h3 className="text-lg font-black text-[#00143D]">
              {paymentStatus === "success"
                ? "Sourcing Order Dispatched to Factory!"
                : "Scan QR with Binance App"}
            </h3>
            <span className="text-xs text-slate-500 block">
              Order No: <strong>{createdOrderNumber}</strong>
            </span>
          </div>

          {paymentStatus !== "success" ? (
            <>
              {/* QR Code Card */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-48 h-48 bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=binancepay://order?prepayId=${prepayId}&amount=${grandTotal}`}
                    alt="Binance Pay QR Code"
                    width={180}
                    height={180}
                    className="object-contain"
                  />
                </div>

                {/* Expiry Countdown */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>QR Code expires in: <strong className="text-slate-800 font-mono">{formatTime(qrExpirySeconds)}</strong></span>
                </div>
              </div>

              {/* Payment Details Pill Breakdown */}
              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Total Due:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-[#FF1028] text-sm price-tag">
                      {formatCurrency(grandTotal)} USDT
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(grandTotal.toFixed(2), "amount")}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      title="Copy Amount"
                    >
                      {copiedAmount ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Merchant Trade No:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-700 text-[11px]">
                      {merchantTradeNo}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(merchantTradeNo || "", "tradeNo")}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      title="Copy Trade No"
                    >
                      {copiedTradeNo ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Prepay ID:</span>
                  <span className="font-mono text-slate-600 text-[10px]">
                    {prepayId}
                  </span>
                </div>
              </div>

              {/* Live Payment Simulator Trigger */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={paymentStatus === "verifying"}
                  onClick={handleSimulatePayment}
                  className="w-full bg-[#10B981] hover:bg-emerald-600 text-white py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {paymentStatus === "verifying" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Settlement on Binance Smart Chain...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      <span>Simulate Successful Binance Pay Transfer (Test Mode)</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success Receipt View */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center mx-auto shadow-sm">
                <PackageCheck className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-[#00143D]">
                  Thank You for Your Order!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your payment of <strong>{formatCurrency(grandTotal)} USDT</strong> has been settled. The direct factory purchase order has been queued for Shenzhen quality testing.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Order Number:</span>
                  <span className="font-black text-slate-900">{createdOrderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Destination:</span>
                  <span className="font-bold text-slate-900">{city}, {country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Estimated Arrival:</span>
                  <span className="font-bold text-[#10B981]">7-12 Business Days</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/account/orders"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 bg-[#00143D] hover:bg-[#002366] text-white py-3 rounded-xl text-xs font-black text-center transition-colors"
                >
                  Track Sourcing Order →
                </Link>
                <Link
                  href="/"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl text-xs font-black text-center transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
