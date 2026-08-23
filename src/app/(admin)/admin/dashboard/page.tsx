"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  ShoppingCart,
  Truck,
  Coins,
  Package,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Filter,
  Check,
  Layers,
  Factory,
  Lock,
} from "lucide-react";
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_SUPPLIERS } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export default function AdminDashboardPage() {
  const [sourcingOrders, setSourcingOrders] = useState(
    MOCK_ORDERS.filter((o) => o.status === "paid" || o.status === "sourcing")
  );
  const [processedOrderIds, setProcessedOrderIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const totalRevenue = MOCK_ORDERS.reduce((sum, o) => sum + o.total, 0) + 48250.0;
  const totalOrdersCount = MOCK_ORDERS.length + 348;
  const avgOrderValue = totalRevenue / totalOrdersCount;

  // Low stock products (< 25 units in mock data)
  const lowStockProducts = MOCK_PRODUCTS.filter(
    (p) => (p.variants?.[0]?.stock || 0) <= 25
  );

  // Top products sorted by sold count
  const topProducts = [...MOCK_PRODUCTS]
    .sort((a, b) => b.sold_count - a.sold_count)
    .slice(0, 4);

  const handleMarkFactoryOrdered = (orderId: string, orderNumber: string) => {
    setProcessedOrderIds((prev) => [...prev, orderId]);
    setToastMsg(`PO for Order #${orderNumber} queued to China Factory Supplier!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-montserrat">
      {/* ── 1. Top Executive Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              LENNOX SOURCING OS
            </span>
            <span className="text-xs text-[#10B981] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              Binance Pay Gateway Online
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Procurement & Revenue Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Real-time China factory purchase order matching, private supplier code routing, and air cargo tracking.
          </p>
        </div>

        {/* Quick Management Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setToastMsg("Sourcing Manifest CSV exported successfully!");
              setTimeout(() => setToastMsg(null), 2500);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Export Manifest (CSV)</span>
          </button>

          <Link
            href="/admin/products"
            className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product & Videos</span>
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-[#10B981] text-slate-950 px-4 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>✓ {toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. Analytics & KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Revenue */}
        <div className="bg-[#00143D] border border-blue-900 rounded-3xl p-5 shadow-md space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue (USDT)</span>
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white price-tag">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#10B981] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+28.4% vs last month</span>
          </div>
        </div>

        {/* Total Settled Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Settled Sourcing Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {totalOrdersCount}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Avg Order: <strong className="text-white">{formatCurrency(avgOrderValue)}</strong>
          </div>
        </div>

        {/* Air Cargo Shipments */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Air Cargo</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            18 Parcels
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#10B981] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>YunExpress 100% on schedule</span>
          </div>
        </div>

        {/* Sourcing Profit Margin */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Net Sourcing Margin</span>
            <div className="w-8 h-8 rounded-xl bg-[#FF1028]/20 text-[#FF1028] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            +44.8%
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Direct China Factory Cost Arbitrage
          </div>
        </div>
      </div>

      {/* ── 3. Critical Sourcing Queue (Private Supplier Code Routing — PRD §4.2) ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF1028] animate-pulse" />
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Direct China Factory Sourcing Queue
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Paid customer orders mapped to secret supplier acquisition codes. Place factory purchase orders below.
            </p>
          </div>

          <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded-xl self-start sm:self-auto">
            ⚡ {sourcingOrders.length} Orders Require Factory PO
          </span>
        </div>

        <div className="space-y-4">
          {sourcingOrders.map((order) => {
            const isProcessed = processedOrderIds.includes(order.id);

            return (
              <div
                key={order.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-mono font-black text-white text-sm">
                      Order #{order.order_number}
                    </span>
                    <span className="text-slate-400 block">
                      Paid: <strong>{formatDate(order.created_at)}</strong> • Binance Pay Ref: <strong className="text-emerald-400 font-mono">BINANCE-USDT-99214</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                      USDT Settled
                    </span>
                    <span className="text-base font-black text-white price-tag">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Items and Secret Supplier Mapping */}
                <div className="space-y-2.5">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-200 block">
                          {item.product_title} (Qty: {item.quantity})
                        </span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Supplier Code: SUP-GZ-4419
                          </span>
                          <span className="text-slate-400">
                            Est. Factory Cost: <strong className="text-slate-200">$48.50</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href="https://1688.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 border border-slate-700"
                        >
                          <span>Open 1688 Factory Link</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sourcing Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-400">
                    Destination: <strong>San Francisco, United States (Alex Harrison)</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {isProcessed ? (
                      <span className="bg-[#10B981] text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Factory PO Confirmed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkFactoryOrdered(order.id, order.order_number)}
                        className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark PO Ordered & Assign Air Tracking</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Two-Column Grid: Low Stock Alerts & Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Low Stock Alerts (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low-Stock Inventory Alerts</span>
            </h3>
            <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800">
              {lowStockProducts.length} items critical
            </span>
          </div>

          <div className="space-y-3">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <Image
                      src={
                        p.media?.[0]?.url ||
                        "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=200&auto=format&fit=crop&q=80"
                      }
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">
                      {p.title}
                    </h4>
                    <span className="text-[11px] text-amber-400 font-bold block mt-0.5">
                      Only {p.variants?.[0]?.stock || 12} units remaining at factory
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setToastMsg(`Reorder PO placed for ${p.title}!`);
                    setTimeout(() => setToastMsg(null), 2500);
                  }}
                  className="bg-slate-800 hover:bg-[#FF1028] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0"
                >
                  Restock Batch
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Top Selling Hardware Products (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span>Top Performing Hardware</span>
            </h3>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              View Catalogue →
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <Image
                      src={
                        p.media?.[0]?.url ||
                        "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=200&auto=format&fit=crop&q=80"
                      }
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">
                      {p.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      {p.sold_count} units sold • {p.avg_rating.toFixed(1)}★ ({p.review_count})
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black text-emerald-400 shrink-0 price-tag">
                  {formatCurrency(p.base_price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Recent Orders Table ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            <span>Recent Customer Sourcing Orders</span>
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#FF1028] hover:underline"
          >
            Manage All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-black uppercase text-[10px]">
                <th className="py-3 px-3">Order Number</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">USDT Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Tracking</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {MOCK_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    #{order.order_number}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-200">
                    Alex Harrison
                  </td>
                  <td className="py-3.5 px-3 font-black text-emerald-400 price-tag">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                    YUN-982741920-US
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      href="/admin/orders"
                      className="text-xs font-bold text-blue-400 hover:text-white"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
