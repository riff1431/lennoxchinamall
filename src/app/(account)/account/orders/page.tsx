"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Coins,
  FileText,
  RotateCcw,
  Plane,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { CourierLogo } from "@/components/checkout/CourierLogo";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getLocalizedProductTitle } from "@/lib/i18n/productI18n";

export default function AccountOrdersPage() {
  const { isSpanish } = useTranslation();
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  const handleCopyTracking = (trackingNo: string) => {
    navigator.clipboard.writeText(trackingNo);
    setCopiedTracking(trackingNo);
    setTimeout(() => setCopiedTracking(null), 1500);
  };

  const getLocalizedOrderStatus = (status: string) => {
    if (isSpanish) {
      switch (status) {
        case "shipped":
          return "Enviado / En Tránsito";
        case "delivered":
          return "Entregado";
        case "processing":
          return "En Procesamiento";
        case "sourcing":
          return "Abasteciendo en Fábrica";
        case "cancelled":
          return "Cancelado";
        default:
          return status;
      }
    }
    switch (status) {
      case "shipped":
        return "Shipped / In Transit";
      case "delivered":
        return "Delivered";
      case "processing":
        return "Processing";
      case "sourcing":
        return "Factory Sourcing";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D]">
            {isSpanish ? "Mis Pedidos de Abastecimiento y Rastreo" : "My Sourcing Orders & Tracking"}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isSpanish
              ? "Actualizaciones de estado en tiempo real desde la liquidación USDT con Binance Pay hasta la entrega aérea en tu puerta."
              : "Real-time status updates from Binance Pay USDT settlement to global air cargo doorstep delivery."}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {MOCK_ORDERS.map((order) => {
          const isShipped = order.status === "shipped";
          const isProcessing = order.status === "sourcing" || order.status === "processing";

          return (
            <div
              key={order.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs hover:border-[#00143D]/40 transition-all"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#00143D] text-sm font-mono">
                      {isSpanish ? `Pedido #${order.order_number}` : `Order #${order.order_number}`}
                    </span>
                    <span className="bg-emerald-50 text-[#10B981] text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {isSpanish ? "Pagado con USDT" : "Paid with USDT"}
                    </span>
                  </div>
                  <span className="text-slate-400 font-semibold block">
                    {isSpanish ? `Realizado el ${formatDate(order.created_at)}` : `Placed on ${formatDate(order.created_at)}`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                      isShipped
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : isProcessing
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {getLocalizedOrderStatus(order.status)}
                  </span>
                  <span className="text-base font-black text-[#00143D] price-tag">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>

              {/* 5-Step Order Progress Timeline */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  {isSpanish ? "Cronograma de Abastecimiento y Despacho" : "Procurement & Dispatch Timeline"}
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="space-y-1">
                    <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center mx-auto text-xs font-black">
                      ✓
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 block">
                      {isSpanish ? "USDT Pagado" : "USDT Paid"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center mx-auto text-xs font-black">
                      ✓
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 block">
                      {isSpanish ? "Orden Fábrica" : "Factory PO"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 rounded-full text-white flex items-center justify-center mx-auto text-xs font-black ${
                        isShipped ? "bg-[#10B981]" : "bg-amber-500 animate-pulse"
                      }`}
                    >
                      {isShipped ? "✓" : "⚡"}
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 block">
                      {isSpanish ? "Prueba QC" : "Gate QC Test"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 rounded-full text-white flex items-center justify-center mx-auto text-xs font-black ${
                        isShipped ? "bg-[#FF1028] animate-pulse" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      ✈️
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 block">
                      {isSpanish ? "Aéreo Express" : "Air Express"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto text-xs font-black">
                      5
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {isSpanish ? "En Puerta" : "Doorstep"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-3 divide-y divide-slate-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <Image
                          src={
                            item.variant?.product?.media?.[0]?.url ||
                            item.image_url ||
                            "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80"
                          }
                          alt={item.product_title || item.title || "Product Item"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {getLocalizedProductTitle(item.variant?.product?.slug || "", item.product_title || item.title || "Product", isSpanish)}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          {isSpanish ? "Cant: " : "Qty: "}{item.quantity} × {formatCurrency(item.unit_price || item.price || 0)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#00143D] shrink-0 price-tag">
                      {formatCurrency(item.total || (item.price ? item.price * item.quantity : 0))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tracking Bar & Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CourierLogo courier="yunexpress" size="sm" className="w-5 h-5 rounded-md" />
                  <span className="text-slate-500 font-semibold">
                    {isSpanish ? "Guía YunExpress:" : "YunExpress Tracking:"}
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    YUN-982741920-US
                  </span>
                  <button
                    onClick={() => handleCopyTracking("YUN-982741920-US")}
                    className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    title={isSpanish ? "Copiar Guía de Rastreo" : "Copy Tracking Number"}
                  >
                    {copiedTracking === "YUN-982741920-US" ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(isSpanish ? `Factura generada para el Pedido #${order.order_number}` : `Invoice generated for Order #${order.order_number}`)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isSpanish ? "Descargar Factura" : "Download Invoice"}</span>
                  </button>
                  <Link
                    href={`/products/eachine-ex5-4k-gps-fpv-drone`}
                    className="px-3.5 py-1.5 rounded-xl bg-[#00143D] hover:bg-[#FF1028] text-white font-bold transition-colors cursor-pointer"
                  >
                    {isSpanish ? "Comprar de Nuevo" : "Buy Again"}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
