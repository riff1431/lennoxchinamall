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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Printer,
  Sparkles,
  Plane,
  Building,
  HelpCircle,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency, formatPrice, generateOrderNumber, generateMerchantTradeNo } from "@/utils/helpers";
import { useCurrency } from "@/store/useCurrencyStore";
import { calculateFreightCost, FREIGHT_CONFIGS } from "@/utils/shipping";
import { submitCheckoutOrder } from "@/app/actions/store-checkout";
import { CourierSelector } from "@/components/checkout/CourierSelector";
import { CourierLogo } from "@/components/checkout/CourierLogo";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedProductTitle } from "@/lib/i18n/productI18n";

type CheckoutStep = 1 | 2 | 3 | 4; // 4 = Order Success / Invoice

export default function CheckoutPage() {
  const router = useRouter();
  const { t, isSpanish } = useTranslation();
  const { currentCurrency } = useCurrency();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const discountAmount = useCartStore((state) => state.discountAmount);
  const couponCode = useCartStore((state) => state.couponCode);
  const clearCart = useCartStore((state) => state.clearCart);

  // Flow Step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  // Mobile Order Summary Accordion
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Form State: Shipping & Contact
  const [fullName, setFullName] = useState("Alex Harrison");
  const [email, setEmail] = useState("alex.harrison@example.com");
  const [phone, setPhone] = useState("+1 415 555 9182");
  const [street, setStreet] = useState("2847 Mission Street, Suite 400");
  const [city, setCity] = useState("San Francisco");
  const [state, setState] = useState("CA");
  const [postal, setPostal] = useState("94110");
  const [country, setCountry] = useState("United States");
  const storeShippingMethod = useCartStore((state) => state.shippingMethod);
  const setStoreShippingMethod = useCartStore((state) => state.setShippingMethod);
  const [shippingCourier, setShippingCourierState] = useState<"air" | "sea">(storeShippingMethod || "air");

  const setShippingCourier = (method: "air" | "sea") => {
    setShippingCourierState(method);
    setStoreShippingMethod(method);
  };
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

  // Dynamic Freight Shipping Calculation
  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);
  const isFreeShipping = useCartStore((state) => state.freeShipping);
  const courierCost = calculateFreightCost(items, shippingCourier, {
    isFreeShippingPromo: isFreeShipping,
    orderSubtotal: subtotal,
  });
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
      setPrepayId(`BINANCE-PREPAY-${Math.floor(100000000 + Math.random() * 900000000)}`);
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
      }, 1000);
    }, 1800);
  };

  const handleCopyAmount = () => {
    navigator.clipboard?.writeText(grandTotal.toFixed(2));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(prepayId || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  if (items.length === 0 && currentStep !== 4) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-[#FBFBFC]">
        <div className="text-center space-y-5 max-w-md mx-auto bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              {isSpanish ? "Tu carrito está vacío" : "Your cart is empty"}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {isSpanish
                ? "No tienes productos en proceso de compra. Explora nuestro catálogo de productos directos de fábrica."
                : "There are no procurement items in your cart. Discover products sourced directly from manufacturers."}
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-semibold font-heading transition-all cursor-pointer shadow-xs"
          >
            <span>{isSpanish ? "Explorar Productos" : "Browse Products"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] pb-24 font-sans text-slate-900 antialiased">
      {/* ── Top Header & Minimal Breadcrumb Bar ── */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Back to Cart + Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                title={isSpanish ? "Volver al carrito" : "Return to cart"}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isSpanish ? "Carrito" : "Cart"}</span>
              </Link>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-heading text-slate-900 tracking-tight">
                  {isSpanish ? "Finalizar Compra" : "Checkout"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{isSpanish ? "Escrow SSL" : "SSL Encrypted"}</span>
                </span>
              </div>
            </div>

            {/* Right: Minimal Modern Stepper */}
            {currentStep < 4 && (
              <nav aria-label="Progress" className="flex items-center gap-1.5 sm:gap-2">
                {/* Step 1 */}
                <button
                  type="button"
                  onClick={() => currentStep > 1 && setCurrentStep(1)}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                    currentStep === 1
                      ? "bg-slate-950 text-white font-semibold shadow-xs"
                      : currentStep > 1
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
                      : "text-slate-400"
                  }`}
                >
                  <span className="text-[11px] font-mono">
                    {currentStep > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : "1"}
                  </span>
                  <span>{isSpanish ? "Dirección" : "Shipping"}</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                {/* Step 2 */}
                <button
                  type="button"
                  onClick={() => currentStep > 2 && setCurrentStep(2)}
                  disabled={currentStep <= 2}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                    currentStep === 2
                      ? "bg-slate-950 text-white font-semibold shadow-xs"
                      : currentStep > 2
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
                      : "text-slate-400"
                  }`}
                >
                  <span className="text-[11px] font-mono">
                    {currentStep > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : "2"}
                  </span>
                  <span>{isSpanish ? "Flete" : "Freight"}</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                {/* Step 3 */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                    currentStep === 3
                      ? "bg-slate-950 text-white font-semibold shadow-xs"
                      : "text-slate-400"
                  }`}
                >
                  <span className="text-[11px] font-mono">3</span>
                  <span>{isSpanish ? "Pago" : "Payment"}</span>
                </div>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Order Summary Accordion (Visible on screens < lg) ── */}
      {currentStep < 4 && (
        <div className="lg:hidden bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-xs text-slate-700 font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-900">
                  {mobileSummaryOpen
                    ? isSpanish
                      ? "Ocultar resumen del pedido"
                      : "Hide order summary"
                    : isSpanish
                    ? "Ver resumen del pedido"
                    : "Show order summary"}
                </span>
                <span className="text-slate-400">({items.length})</span>
                {mobileSummaryOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <span className="font-heading font-bold text-sm text-slate-950 tabular-nums">
                {formatCurrency(grandTotal)}
              </span>
            </button>

            {/* Mobile Expanded Drawer */}
            {mobileSummaryOpen && (
              <div className="pt-3.5 pb-2 space-y-3.5 border-t border-slate-200/70 mt-3 animate-in fade-in duration-150 text-xs">
                {/* Product items */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="pt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white relative shrink-0 border border-slate-200/80">
                          <Image
                            src={item.image}
                            alt={getLocalizedProductTitle(item.slug, item.title, isSpanish)}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-slate-800 block truncate">
                            {getLocalizedProductTitle(item.slug, item.title, isSpanish)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {isSpanish ? `Cant: ${item.quantity}` : `Qty: ${item.quantity}`}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Freight breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-200/70 text-slate-600">
                  <div className="flex justify-between">
                    <span>{t.cart.subtotal}</span>
                    <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>{t.cart.discount} {couponCode && `(${couponCode})`}</span>
                      <span className="tabular-nums">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CourierLogo courier={shippingCourier} size="sm" className="w-4 h-4 rounded-md shrink-0" />
                      <span className="truncate">
                        {isSpanish
                          ? shippingCourier === "sea"
                            ? "Carga Marítima"
                            : "Carga Aérea Directa"
                          : FREIGHT_CONFIGS[shippingCourier]?.name || "Direct Air Freight"}
                      </span>
                    </div>
                    <span className="font-medium text-slate-900 tabular-nums">
                      {courierCost === 0 ? (
                        <span className="text-emerald-700 font-semibold">{isSpanish ? "GRATIS" : "FREE"}</span>
                      ) : (
                        formatPrice(courierCost)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-950 pt-2 border-t border-slate-200/80">
                    <span>{isSpanish ? "Total a Pagar" : "Total Due"}</span>
                    <span className="font-heading font-bold text-base tabular-nums">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── STEP 4: ORDER SUCCESS & CUSTOMS RECEIPT ── */}
        {currentStep === 4 ? (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 text-center space-y-6 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                  {isSpanish ? "Depósito Binance Pay USDT Confirmado" : "Binance Pay USDT Escrow Confirmed"}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950">
                  {isSpanish ? "¡Orden de Compra Confirmada!" : "Procurement Order Confirmed!"}
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {isSpanish
                    ? "Tu pedido ha sido registrado con éxito e ingresado a inspección de control de calidad en origen antes de su despacho de aduanas."
                    : "Your order has been recorded and scheduled for factory quality verification and export logistics clearance."}
                </p>
              </div>

              {/* Order Reference Box */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    {isSpanish ? "ID de Pedido" : "Order ID"}
                  </span>
                  <span className="font-semibold text-slate-900 font-mono text-[11px]">{createdOrderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    {isSpanish ? "No. de Transacción" : "Merchant Trade"}
                  </span>
                  <span className="font-medium text-slate-800 font-mono text-[11px] truncate block">{merchantTradeNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    {isSpanish ? "Método Flete" : "Logistics Mode"}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CourierLogo courier={shippingCourier} size="sm" className="w-4 h-4 rounded-md" />
                    <span className="font-semibold text-slate-800">
                      {shippingCourier === "sea" ? "Ocean Sea" : "Direct Air"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    {isSpanish ? "Total Liquidado" : "Settled Total"}
                  </span>
                  <span className="font-bold text-slate-950 font-heading tabular-nums">${grandTotal.toFixed(2)} USDT</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isSpanish ? "Imprimir Factura Aduanera" : "Print Customs Invoice"}</span>
                </button>
                <Link
                  href="/account/orders"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs transition-colors shadow-xs text-center cursor-pointer"
                >
                  {isSpanish ? "Ver Mis Pedidos" : "View Order in Account"}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ── STEPS 1, 2, 3: MAIN CHECKOUT GRID ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Column: Active Step Form (7 Cols) ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* STEP 1: Shipping Address Form */}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="font-heading font-bold text-base text-slate-950 tracking-tight flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-700" />
                        <span>{isSpanish ? "1. Dirección de Entrega" : "1. Destination Shipping Address"}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isSpanish
                          ? "Proporciona la dirección donde se despachará tu carga de fábrica"
                          : "Enter where your direct-from-factory cargo will be delivered"}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {isSpanish ? "Paso 1 de 3" : "Step 1 of 3"}
                    </span>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setCurrentStep(2);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          {isSpanish ? "Nombre Completo *" : "Full Legal Name *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Harrison"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          {isSpanish ? "Correo Electrónico *" : "Email Address *"}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex.harrison@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          {isSpanish ? "Teléfono / WhatsApp *" : "Phone / WhatsApp *"}
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 415 555 0192"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          {isSpanish ? "País / Territorio *" : "Country / Territory *"}
                        </label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all shadow-2xs cursor-pointer"
                        >
                          <option value="United States">
                            {isSpanish ? "Estados Unidos (Aéreo Rápido)" : "United States (Air Priority)"}
                          </option>
                          <option value="Canada">
                            {isSpanish ? "Canadá (Aéreo Express)" : "Canada (Air Express)"}
                          </option>
                          <option value="United Kingdom">
                            {isSpanish ? "Reino Unido (IVA Despachado)" : "United Kingdom (VAT DDP)"}
                          </option>
                          <option value="Germany">
                            {isSpanish ? "Alemania (Hub UE)" : "Germany (EU Hub)"}
                          </option>
                          <option value="Australia">
                            {isSpanish ? "Australia (Carga Directa)" : "Australia (Direct Cargo)"}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        {isSpanish ? "Dirección y Suite / Apartamento *" : "Street Address & Suite *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="2847 Mission Street, Suite 400"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          {isSpanish ? "Ciudad *" : "City *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="San Francisco"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          {isSpanish ? "Estado *" : "State / Prov *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="CA"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          {isSpanish ? "C. Postal *" : "Postal Code *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={postal}
                          onChange={(e) => setPostal(e.target.value)}
                          placeholder="94110"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        {isSpanish ? "Instrucciones Especiales / Aduanas (Opcional)" : "Customs Notes & Delivery Instructions (Optional)"}
                      </label>
                      <input
                        type="text"
                        placeholder={isSpanish ? "ej. Dejar en garita de seguridad, incluir factura comercial" : "e.g. Leave with building receptionist, commercial invoice required"}
                        value={customsNotes}
                        onChange={(e) => setCustomsNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-900 transition-all shadow-2xs"
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <button
                        type="submit"
                        className="w-full bg-slate-950 hover:bg-slate-900 text-white py-3.5 rounded-xl font-heading font-semibold text-sm transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{isSpanish ? "Continuar a Selección de Flete" : "Continue to Freight Selection"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 2: Freight Logistics Mode Selection */}
              {currentStep === 2 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="font-heading font-bold text-base text-slate-950 tracking-tight flex items-center gap-2">
                        <Plane className="w-4 h-4 text-slate-700" />
                        <span>{isSpanish ? "2. Método de Envío y Flete" : "2. Freight & Logistics Mode"}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isSpanish
                          ? "Selecciona entre Carga Aérea Rápida o Transporte Marítimo al por mayor"
                          : "Choose between Direct Air Express or Ocean Container Freight"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      {isSpanish ? "Editar Dirección" : "Edit Address"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <CourierSelector
                      selectedCourier={shippingCourier}
                      onSelectCourier={(courier) => setShippingCourier(courier)}
                      items={items}
                      isFreeShipping={isFreeShipping}
                      orderSubtotal={subtotal}
                    />

                    {/* DDP Trust Reassurance Pill */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-xs text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-900 block text-xs">
                          {isSpanish ? "Despacho DDP Incluido (Sin Sorpresas Arancelarias)" : "DDP Pre-Cleared Freight (Zero Surprise Duties)"}
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {isSpanish
                            ? "Todos los envíos incluyen despacho previo de aduanas e IVA. El precio liquidado es el costo final puesto en tu destino."
                            : "All air & ocean freight lanes include export paperwork and destination customs clearance. The settled total covers full delivery."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                    >
                      {isSpanish ? "Atrás" : "Back"}
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      disabled={isProcessing}
                      className="flex-1 bg-slate-950 hover:bg-slate-900 text-white py-3 rounded-xl font-heading font-semibold text-sm transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>{isSpanish ? "Proceder al Pago con Binance USDT" : "Proceed to Binance USDT Payment"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Binance Pay USDT Live Escrow Portal */}
              {currentStep === 3 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 space-y-6 shadow-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-heading font-bold text-base text-slate-950 tracking-tight">
                          {isSpanish ? "3. Depósito en Garantía Binance Pay" : "3. Binance Pay Escrow Payment"}
                        </h2>
                        <span className="text-[11px] text-slate-400">
                          {isSpanish ? "Liquidación USDT instantánea sin comisiones" : "Zero fee instant USDT settlement"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isSpanish ? "Protegido por Escrow" : "100% Escrow Protected"}</span>
                    </span>
                  </div>

                  {/* QR Simulator & Payment Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    {/* Visual QR Container */}
                    <div className="bg-slate-50/80 border border-slate-200/70 p-5 rounded-2xl text-center space-y-3">
                      <div className="aspect-square w-44 mx-auto bg-white rounded-xl flex items-center justify-center border border-slate-200/80 p-3 shadow-2xs">
                        <QrCode className="w-36 h-36 text-slate-900" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 block">
                        {isSpanish ? "Escanea con tu Binance App para pagar" : "Scan with Binance App to pay"}
                      </span>
                    </div>

                    {/* Amount & Trade Data */}
                    <div className="space-y-3 text-xs">
                      {/* Exact Amount Box */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-medium block">
                          {isSpanish ? "Monto Exacto a Transferir" : "Exact Settlement Amount"}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold font-heading text-slate-950 tabular-nums">
                            ${grandTotal.toFixed(2)}{" "}
                            <span className="text-xs font-semibold text-amber-600">USDT</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyAmount}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                            title={isSpanish ? "Copiar monto" : "Copy amount"}
                          >
                            {copiedAmount ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">{isSpanish ? "Copiado" : "Copied"}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{isSpanish ? "Copiar" : "Copy"}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Trade No Box */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-medium block">
                          {isSpanish ? "ID de Prepago Binance" : "Prepay ID / Trade No"}
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-slate-700 truncate">{prepayId}</span>
                          <button
                            type="button"
                            onClick={handleCopyAddress}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                            title={isSpanish ? "Copiar ID" : "Copy ID"}
                          >
                            {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expiry Timer Pill */}
                      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-800">
                        <span className="flex items-center gap-1.5 font-medium text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isSpanish ? "Tiempo restante para escanear:" : "QR expires in:"}</span>
                        </span>
                        <span className="font-mono font-bold text-xs tabular-nums text-amber-900">
                          {Math.floor(qrExpirySeconds / 60)}:{String(qrExpirySeconds % 60).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification CTA */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={handleSimulatePaymentVerification}
                      disabled={paymentStatus === "verifying" || paymentStatus === "paid"}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-semibold text-sm py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {paymentStatus === "verifying" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isSpanish ? "Verificando liquidación blockchain..." : "Verifying blockchain settlement..."}</span>
                        </>
                      ) : paymentStatus === "paid" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isSpanish ? "¡Pago confirmado! Generando recibo..." : "Payment confirmed! Directing..."}</span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4" />
                          <span>
                            {isSpanish
                              ? `He transferido $${grandTotal.toFixed(2)} USDT (Confirmar al Instante)`
                              : `I Have Transferred $${grandTotal.toFixed(2)} USDT (Confirm Instantly)`}
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-400">
                      {isSpanish
                        ? "La verificación se ejecuta contra el nodo de liquidación de Binance Pay"
                        : "Verification confirms instantly through the Binance Pay escrow gateway"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Sticky Desktop Order Summary (5 Cols, visible on screens >= lg) ── */}
            <div className="hidden lg:block lg:col-span-5 space-y-4 sticky top-20">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold font-heading text-slate-950">
                    {isSpanish ? `Resumen del Pedido (${items.length})` : `Order Summary (${items.length})`}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {totalUnits} {totalUnits === 1 ? (isSpanish ? "unidad" : "unit") : (isSpanish ? "unidades" : "units")}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 relative shrink-0 border border-slate-200/80">
                          <Image
                            src={item.image}
                            alt={getLocalizedProductTitle(item.slug, item.title, isSpanish)}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[9px] font-mono px-1 rounded-tl font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 block truncate">
                            {getLocalizedProductTitle(item.slug, item.title, isSpanish)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatCurrency(item.price)} × {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal / Shipping / Discount */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>{t.cart.subtotal}</span>
                    <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>{t.cart.discount} {couponCode && `(${couponCode})`}</span>
                      <span className="tabular-nums">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CourierLogo courier={shippingCourier} size="sm" className="w-4 h-4 rounded-md shrink-0" />
                      <span className="truncate">
                        {isSpanish
                          ? shippingCourier === "sea"
                            ? "Carga Marítima Consolidada"
                            : "Flete Aéreo Directo"
                          : FREIGHT_CONFIGS[shippingCourier]?.name || "Direct Air Freight"}
                      </span>
                    </div>
                    <span className="font-medium text-slate-900 tabular-nums shrink-0">
                      {courierCost === 0 ? (
                        <span className="text-emerald-700 font-semibold">{isSpanish ? "GRATIS" : "FREE"}</span>
                      ) : (
                        formatPrice(courierCost)
                      )}
                    </span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-baseline pt-3 border-t border-slate-200/80">
                    <div>
                      <span className="text-sm font-bold text-slate-950 font-heading block">
                        {isSpanish ? "Total a Pagar" : "Total Due"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isSpanish ? "Liquidación en Binance USDT" : "Settlement via Binance USDT"}
                      </span>
                    </div>
                    <span className="text-xl font-bold font-heading text-slate-950 tabular-nums">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Escrow Guarantee Pill */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isSpanish
                      ? "100% Depósito protegido. Los fondos se liberan tras confirmación de despacho."
                      : "100% Escrow protected. Funds are held safely until factory dispatch."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
