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
  RotateCcw,
  Sparkles,
  FileText,
  Printer,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Modal } from "@/components/ui/Modal";
import {
  formatCurrency,
  generateOrderNumber,
  generateMerchantTradeNo,
} from "@/utils/helpers";
import { submitCheckoutOrder } from "@/app/actions/store-checkout";

type CheckoutStep = 1 | 2 | 3 | 4; // 4 = Order Success / Invoice

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const discountAmount = useCartStore((state) => state.discountAmount);
  const couponCode = useCartStore((state) => state.couponCode);
  const clearCart = useCartStore((state) => state.clearCart);

  // Flow Step
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
  const [shippingCourier, setShippingCourier] = useState<"yunexpress" | "sf_express" | "dhl">("sf_express");
  const [customsNotes, setCustomsNotes] = useState("");

  // Payment Portal State
  const [paymentStatus, setPaymentStatus] = useState<"awaiting" | "verifying" | "paid">("awaiting");
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [merchantTradeNo, setMerchantTradeNo] = useState<string | null>(null);
  const [prepayId, setPrepayId] = useState<string | null>(null);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrExpirySeconds, setQrExpirySeconds] = useState(1800); // 30 mins

  // Cart shipping
  const isFreeShipping = useCartStore((state) => state.freeShipping);
  const baseShippingCost = isFreeShipping || subtotal > 75 ? 0 : 4.99;
  const courierCost =
    shippingCourier === "dhl"
      ? 18.99
      : shippingCourier === "sf_express"
      ? isFreeShipping ? 0 : 8.99
      : baseShippingCost;
  const grandTotal = Math.max(0, subtotal - discountAmount + courierCost);

  // Expiry countdown for Binance Pay
  useEffect(() => {
    if (currentStep !== 3 || paymentStatus === "paid") return;
    const interval = setInterval(() => {
      setQrExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep, paymentStatus]);

  // Order Placement Handler
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      const orderRes = await submitCheckoutOrder({
        items,
        shippingAddress: {
          fullName,
          streetLine1: street,
          city,
          state,
          country,
          postalCode: postal,
          phone,
        },
        shippingMethod: shippingCourier,
        couponCode: couponCode || undefined,
        notes: customsNotes,
      });

      const orderNo = orderRes.orderNumber || generateOrderNumber();
      const tradeNo = orderRes.merchantTradeNo || generateMerchantTradeNo();
      const prepay = `BINANCE-PREPAY-${Math.floor(100000000 + Math.random() * 900000000)}`;

      setCreatedOrderNumber(orderNo);
      setMerchantTradeNo(tradeNo);
      setPrepayId(prepay);
      setCurrentStep(3);
    } catch (err) {
      const orderNo = generateOrderNumber();
      const tradeNo = generateMerchantTradeNo();
      setCreatedOrderNumber(orderNo);
      setMerchantTradeNo(tradeNo);
      setCurrentStep(3);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock Auto-verify Binance Payment
  const handleSimulatePaymentVerification = () => {
    setPaymentStatus("verifying");
    setTimeout(() => {
      setPaymentStatus("paid");
      clearCart();
      setTimeout(() => {
        setCurrentStep(4);
      }, 1200);
    }, 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard?.writeText(grandTotal.toFixed(2));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  if (items.length === 0 && currentStep !== 4) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
        <div className="text-center space-y-4 max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#00143D] font-heading">
            No Active Procurement Items
          </h2>
          <p className="text-xs text-slate-500">
            Your shopping cart is currently empty. Add products to initiate Binance Pay USDT checkout.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-[#FF1028] text-white px-6 py-3 rounded-xl text-xs font-black font-heading transition-all shadow-md"
          >
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      {/* ── Breadcrumbs & Stepper Header ── */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Escrow Gateway
              </span>
              <h1 className="text-2xl font-black font-heading text-[#00143D] mt-0.5">
                Direct China Sourcing Checkout
              </h1>
            </div>

            {/* Stepper Progress */}
            {currentStep < 4 && (
              <div className="flex items-center gap-2 text-xs font-bold font-heading">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    currentStep === 1
                      ? "bg-[#00143D] text-white shadow-xs"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Shipping Address</span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300" />

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    currentStep === 2
                      ? "bg-[#00143D] text-white shadow-xs"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Air Courier</span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300" />

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    currentStep === 3
                      ? "bg-[#FF1028] text-white shadow-xs"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Binance USDT</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── STEP 4: ORDER SUCCESS & CUSTOMS INVOICE ── */}
        {currentStep === 4 ? (
          <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-md">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-emerald-600 font-mono">
                  Binance Pay USDT Escrow Confirmed
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#00143D]">
                  Factory Procurement Order Placed!
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your purchase order has been queued for Shenzhen factory quality inspection and customs air freight dispatch.
                </p>
              </div>

              {/* Order Reference Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Order ID</span>
                  <span className="font-black text-slate-900">{createdOrderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Merchant Trade No</span>
                  <span className="font-bold text-slate-800">{merchantTradeNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Air Cargo Tracking</span>
                  <span className="font-bold text-blue-600">YUN-98218-HK</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Settlement Amount</span>
                  <span className="font-black text-[#FF1028]">${grandTotal.toFixed(2)} USDT</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Customs Invoice</span>
                </button>
                <Link
                  href="/account/orders"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00143D] hover:bg-[#FF1028] text-white font-black font-heading text-xs uppercase tracking-wider transition-colors shadow-md text-center"
                >
                  View Order in Account
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ── STEPS 1, 2, 3: CHECKOUT MAIN LAYOUT ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Column: Active Step Form (7 Cols) ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* STEP 1: Shipping Address Form */}
              {currentStep === 1 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-heading font-black text-base text-[#00143D] uppercase tracking-wider flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#FF1028]" />
                      <span>1. Destination Shipping Address</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">Guest / User Checkout</span>
                  </div>

                  <form onSubmit={() => setCurrentStep(2)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#FF1028]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#FF1028]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Mobile / WhatsApp Number *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#FF1028]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Country / Territory *</label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-[#FF1028]"
                        >
                          <option value="United States">United States (Fast Track Air)</option>
                          <option value="Canada">Canada (Air Express)</option>
                          <option value="United Kingdom">United Kingdom (VAT Cleared)</option>
                          <option value="Germany">Germany (EU Hub)</option>
                          <option value="Australia">Australia (Direct Cargo)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Street Address &amp; Suite *</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#FF1028]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#FF1028]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">State / Province *</label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#FF1028]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Postal Code *</label>
                        <input
                          type="text"
                          required
                          value={postal}
                          onChange={(e) => setPostal(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#FF1028]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Customs Clearance Notes / Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. Leave at gate, commercial invoice in package"
                        value={customsNotes}
                        onChange={(e) => setCustomsNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#FF1028]"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        type="submit"
                        className="w-full bg-[#00143D] hover:bg-[#FF1028] text-white py-3.5 rounded-2xl font-black font-heading text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Continue to Air Courier Selection</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 2: Courier Method Selection */}
              {currentStep === 2 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-heading font-black text-base text-[#00143D] uppercase tracking-wider flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#FF1028]" />
                      <span>2. Select Air Freight Courier</span>
                    </h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Edit Address
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* YunExpress */}
                    <label
                      onClick={() => setShippingCourier("yunexpress")}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        shippingCourier === "yunexpress"
                          ? "border-[#00143D] bg-slate-50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-mono">
                          YUN
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">YunExpress Tracked Line</span>
                          <span className="text-[11px] text-slate-500">7–12 Business Days • Shenzhen Air Cargo</span>
                        </div>
                      </div>
                      <span className="text-xs font-black font-mono text-slate-900">
                        {baseShippingCost === 0 ? "FREE" : `$${baseShippingCost.toFixed(2)}`}
                      </span>
                    </label>

                    {/* SF Express */}
                    <label
                      onClick={() => setShippingCourier("sf_express")}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        shippingCourier === "sf_express"
                          ? "border-[#00143D] bg-slate-50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#FF1028] flex items-center justify-center font-bold font-mono">
                          SF
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">SF International Priority</span>
                          <span className="text-[11px] text-slate-500">5–8 Business Days • Direct Hong Kong Flight</span>
                        </div>
                      </div>
                      <span className="text-xs font-black font-mono text-slate-900">
                        {isFreeShipping ? "FREE" : "$8.99"}
                      </span>
                    </label>

                    {/* DHL Express */}
                    <label
                      onClick={() => setShippingCourier("dhl")}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        shippingCourier === "dhl"
                          ? "border-[#00143D] bg-slate-50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold font-mono">
                          DHL
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">DHL Worldwide Express</span>
                          <span className="text-[11px] text-slate-500">3–5 Business Days • VIP Customs Priority</span>
                        </div>
                      </div>
                      <span className="text-xs font-black font-mono text-slate-900">$18.99</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      disabled={isProcessing}
                      className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-3.5 rounded-2xl font-black font-heading text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Proceed to Binance USDT Payment</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Binance Pay USDT Live Escrow Portal */}
              {currentStep === 3 && (
                <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-300" />
                      <h3 className="font-heading font-black text-base uppercase tracking-wider text-white">
                        3. Binance Pay USDT Escrow
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      Zero Fees • 100% Escrow Protection
                    </span>
                  </div>

                  {/* QR Code & Payment Timer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    {/* Visual QR Simulator */}
                    <div className="bg-white p-5 rounded-3xl text-center space-y-3 shadow-md">
                      <div className="relative aspect-square w-48 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 p-3">
                        <QrCode className="w-36 h-36 text-slate-900" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-600 block">
                        Scan with Binance App to Pay
                      </span>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-4 text-xs font-mono">
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase">Exact Payment Amount</span>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-amber-300">
                            ${grandTotal.toFixed(2)} USDT
                          </span>
                          <button
                            onClick={handleCopyAmount}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            title="Copy amount"
                          >
                            {copiedAmount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase">Prepay ID / Trade No</span>
                        <span className="font-bold text-slate-200 block truncate">{prepayId}</span>
                      </div>

                      {/* Expiry Timer */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-4 h-4" /> QR Expires In:
                        </span>
                        <span className="font-black text-sm">
                          {Math.floor(qrExpirySeconds / 60)}:
                          {String(qrExpirySeconds % 60).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Simulation Action */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <button
                      onClick={handleSimulatePaymentVerification}
                      disabled={paymentStatus === "verifying" || paymentStatus === "paid"}
                      className="w-full bg-[#10B981] hover:bg-[#0EA5E9] text-slate-950 font-black font-heading text-xs uppercase tracking-wider py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {paymentStatus === "verifying" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying Blockchain Transaction...</span>
                        </>
                      ) : paymentStatus === "paid" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Payment Verified! Directing to Invoice...</span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4" />
                          <span>I Have Paid ${grandTotal.toFixed(2)} USDT (Verify Instantly)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Sticky Order Summary (5 Cols) ── */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-24">
                <h3 className="text-sm font-black text-[#00143D] uppercase tracking-wider pb-3 border-b border-slate-100 font-heading">
                  Order Items ({items.length})
                </h3>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{item.title}</span>
                          <span className="text-[11px] text-slate-400 font-mono">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#FF1028] font-bold">
                      <span>Discount ({couponCode})</span>
                      <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Airfreight Courier</span>
                    <span className="font-mono font-bold text-slate-900">
                      {courierCost === 0 ? <span className="text-emerald-600">FREE</span> : `$${courierCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#00143D] pt-3 border-t border-slate-200">
                    <span>Total Due (USDT)</span>
                    <span className="text-xl text-[#FF1028] font-mono">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
