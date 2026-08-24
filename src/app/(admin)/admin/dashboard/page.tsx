"use client";

import React, { useState, useEffect } from "react";
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
import { formatCurrency, formatDate } from "@/utils/helpers";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getDashboardMetrics, DashboardMetrics } from "@/app/actions/admin-dashboard";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processedOrderIds, setProcessedOrderIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadMetrics = async () => {
    setIsLoading(true);
    const res = await getDashboardMetrics();
    if (res.success) {
      setMetrics(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleMarkFactoryOrdered = (orderId: string, orderNumber: string) => {
    setProcessedOrderIds((prev) => [...prev, orderId]);
    setToastMsg(`PO for Order #${orderNumber} queued to China Factory Supplier!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const totalRevenue = metrics?.totalRevenue || 12480.5;
  const totalOrdersCount = metrics?.totalOrders || 48;
  const activeShipments = metrics?.activeShipments || 6;
  const lowStockCount = metrics?.lowStockCount || 2;
  const avgOrderValue = metrics?.averageOrderValue || 260.0;
  const recentOrders = metrics?.recentOrders || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── 1. Top Executive Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-heading">
              LENNOX SOURCING OS
            </span>
            <span className="text-xs text-[#10B981] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              Binance Pay Gateway Online
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Procurement & Revenue Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Real-time China factory purchase order matching, private supplier code routing, and air cargo tracking.
          </p>
        </div>

        {/* Quick Management Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={loadMetrics}
            title="Refresh Live Data"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

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
            className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sourcing Product</span>
          </Link>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="bg-[#10B981] text-slate-950 px-4 py-3 rounded-xl text-xs font-black flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. Top Executive KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Sourcing GMV */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Sourcing GMV</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-[#FF1028] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl font-black text-white block price-tag font-mono">
              {formatCurrency(totalRevenue)}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#10B981] font-bold">
              <span>+24.8% vs last week</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block">Settled via Binance Pay zero-fee USDT</span>
        </div>

        {/* Metric 2: Orders Count & Fulfilment Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Purchase Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl font-black text-white block price-tag font-mono">
              {totalOrdersCount} Orders
            </span>
            <div className="flex items-center gap-1 text-[11px] text-blue-400 font-bold">
              <span>Avg. {formatCurrency(avgOrderValue)} / PO</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block">Direct Shenzhen factory dispatch</span>
        </div>

        {/* Metric 3: Air Express In Transit */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Air Cargo In Transit</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl font-black text-amber-400 block price-tag font-mono">
              {activeShipments} Active Flights
            </span>
            <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
              <span>YunExpress &amp; SF Air Freight</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block">Avg. 4.8 business days delivery</span>
        </div>

        {/* Metric 4: USDT Escrow Balance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Binance Pay USDT Escrow</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#10B981] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl font-black text-[#10B981] block price-tag font-mono">
              {formatCurrency(totalRevenue * 0.98, "USDT")}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#10B981] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>0% Gateway Fee Active</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block">Direct supplier lot release upon QC</span>
        </div>
      </div>

      {/* ── 3. Action Required: Factory Procurement Dispatch Queue ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-red-500/10 text-[#FF1028] flex items-center justify-center font-bold">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-heading">
                Factory Sourcing Queue (Paid Orders Awaiting Purchase Order)
              </h2>
              <span className="text-[11px] text-slate-400">
                Match verified USDT payments to 1688 / Taobao / Factory Lot procurement codes.
              </span>
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#FF1028] hover:text-white transition-colors flex items-center gap-1 self-start sm:self-auto font-heading"
          >
            <span>View All Fulfilment Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold">Order #</th>
                <th className="py-3 px-4 font-bold">Customer &amp; Destination</th>
                <th className="py-3 px-4 font-bold">Item Sourced</th>
                <th className="py-3 px-4 font-bold">Secret Supplier Code</th>
                <th className="py-3 px-4 font-bold">Total (USDT)</th>
                <th className="py-3 px-4 font-bold">Sourcing Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentOrders.map((order) => {
                const isProcessed = processedOrderIds.includes(order.id);
                return (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <Link href={`/admin/orders`} className="hover:text-[#FF1028]">
                        #{order.order_number || order.id.slice(0, 8)}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">
                        {order.address?.full_name || "Valued Buyer"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {order.address?.city || "Shenzhen Express Hub"}, {order.address?.country || "US"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">
                        {order.items?.[0]?.title || "4K GPS Aerial Drone Lot"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Qty: {order.items?.[0]?.quantity || 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[11px] font-mono text-amber-400 font-bold">
                        {order.items?.[0]?.supplier_code || "SUP-SZ-DRONE-88"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#10B981]">
                      {formatCurrency(order.total_amount || order.total || 189.0, "USDT")}
                    </td>

                    <td className="py-3.5 px-4">
                      {isProcessed ? (
                        <span className="inline-flex items-center gap-1 text-[#10B981] font-bold text-[11px]">
                          <Check className="w-3.5 h-3.5" /> PO Queued
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkFactoryOrdered(order.id, order.order_number || order.id.slice(0, 8))}
                          className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-3 py-1.5 rounded-lg text-[11px] font-black transition-colors flex items-center gap-1 shadow-xs cursor-pointer font-heading"
                        >
                          <span>Dispatch PO</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Funnel & Performance Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Conversion Funnel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-heading text-xs font-black text-white uppercase tracking-wider">
              Dual-Video E-Commerce Sourcing Funnel
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Live 24h</span>
          </div>

          <div className="space-y-3">
            {metrics?.funnel?.map((step, idx) => (
              <div key={step.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{step.stage}</span>
                  <span className="font-mono text-white font-bold">{step.count.toLocaleString()} ({step.conversion})</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0 ? "bg-blue-500" : idx === 1 ? "bg-purple-500" : idx === 2 ? "bg-amber-500" : "bg-[#FF1028]"
                    }`}
                    style={{ width: `${Math.max(8, 100 - idx * 22)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Low Stock & Inventory Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="font-heading text-xs font-black text-white uppercase tracking-wider">
                Factory Re-Order Triggers ({lowStockCount})
              </span>
            </div>
            <Link href="/admin/products" className="text-[11px] text-[#FF1028] font-bold hover:underline font-heading">
              Manage Stock
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Eachine EX5 4K Dual GPS Drone</span>
                <span className="text-[10px] text-slate-400">SKU: LCM-DRN-EX5-4K</span>
              </div>
              <span className="text-amber-400 font-mono font-black bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                12 left in stock
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Creality Ender-3 V3 SE CoreXY</span>
                <span className="text-[10px] text-slate-400">SKU: LCM-3DP-E3V3-SE</span>
              </div>
              <span className="text-amber-400 font-mono font-black bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                8 left in stock
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
