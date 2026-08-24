/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Percent,
  Download,
  Factory,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Sparkles,
  Coins,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Users,
  Mail,
  Send,
  Trash2,
  Plus,
  TrendingUp,
  Activity,
  Globe,
  Search,
  Printer,
  Layers,
  BarChart3,
  ShoppingBag,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import {
  getAnalyticsData,
  getReportSchedules,
  saveReportSchedule,
  deleteReportSchedule,
  triggerInstantReportEmail,
  AnalyticsComprehensiveData,
  AnalyticsTimeRange,
  ReportSchedule,
} from "@/app/actions/admin-analytics";
import { cn } from "@/utils/helpers";

interface AnalyticsDashboardClientProps {
  initialData: AnalyticsComprehensiveData;
  initialSchedules: ReportSchedule[];
}

export function AnalyticsDashboardClient({
  initialData,
  initialSchedules,
}: AnalyticsDashboardClientProps) {
  const [data, setData] = useState<AnalyticsComprehensiveData>(initialData);
  const [schedules, setSchedules] = useState<ReportSchedule[]>(initialSchedules);
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "financials" | "products" | "logistics" | "binance" | "customers" | "refunds" | "schedules"
  >("overview");
  const [activeMetricChart, setActiveMetricChart] = useState<"revenue" | "orders" | "profit">("revenue");
  const [productSearch, setProductSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<{ text: string; type?: "success" | "error" } | null>(null);
  const [, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // New Schedule Form State
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    frequency: "daily" as "daily" | "weekly" | "monthly" | "quarterly",
    recipientEmails: "",
    format: "pdf" as "pdf" | "csv" | "json",
    metricsIncluded: ["revenue", "orders", "sourcing_margin", "inventory", "refunds"],
    isActive: true,
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4500);
  };

  // ─── Fetch Data Handler ───
  const fetchData = useCallback((range = timeRange, start = customStart, end = customEnd) => {
    setIsRefreshing(true);
    startTransition(async () => {
      const res = await getAnalyticsData({
        timeRange: range,
        startDate: range === "custom" ? start : undefined,
        endDate: range === "custom" ? end : undefined,
        compareWithPrevious,
      });

      setIsRefreshing(false);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        showToast(res.error || "Failed to refresh telemetry.", "error");
      }
    });
  }, [timeRange, customStart, customEnd, compareWithPrevious]);

  // ─── Supabase Realtime Subscription ───
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("analytics-telemetry-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        setIsRealtimeActive(true);
        fetchData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => {
        setIsRealtimeActive(true);
        fetchData();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsRealtimeActive(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // ─── CSV Export Functionality ───
  const handleExportCsv = () => {
    const rows: (string | number)[][] = [
      ["Lennox ChinaMall — Executive Financial & Telemetry Dossier"],
      ["Report Period", data.dateRange.label],
      ["Generated At", data.generatedAt],
      ["Operator Role", data.userRole],
      [],
      ["── 1. EXECUTIVE P&L SUMMARY ──"],
      ["Metric", "Current Period", "Previous Period", "Delta Change (%)"],
      ["Gross Revenue (USDT)", data.overview.grossRevenue.current, data.overview.grossRevenue.previous, `${data.overview.grossRevenue.percentageChange}%`],
      ["Net Sales (after refunds/coupons)", data.overview.netSales.current, data.overview.netSales.previous, `${data.overview.netSales.percentageChange}%`],
      ["Total Sourced Orders", data.overview.totalOrders.current, data.overview.totalOrders.previous, `${data.overview.totalOrders.percentageChange}%`],
      ["Average Order Value (AOV)", data.overview.averageOrderValue.current, data.overview.averageOrderValue.previous, `${data.overview.averageOrderValue.percentageChange}%`],
      ["Conversion Rate (%)", `${data.overview.conversionRate.current}%`, `${data.overview.conversionRate.previous}%`, `${data.overview.conversionRate.percentageChange}%`],
    ];

    if (data.isSuperAdmin && data.overview.grossProfit) {
      rows.push(
        ["Total Factory Sourcing Cost (USDT)", data.sourcingAndProfit.totalFactoryCostUSDT || 0, "-", "-"],
        ["Gross Sourcing Profit (USDT)", data.overview.grossProfit.current, data.overview.grossProfit.previous, `${data.overview.grossProfit.percentageChange}%`],
        ["Estimated Net Profit (USDT)", data.overview.estimatedNetProfit?.current || 0, data.overview.estimatedNetProfit?.previous || 0, `${data.overview.estimatedNetProfit?.percentageChange || 0}%`],
        ["Gross Profit Margin (%)", `${data.overview.netMarginPct}%`, "-", "-"]
      );
    }

    rows.push(
      [],
      ["── 2. TOP PERFORMING HARDWARE PRODUCTS ──"],
      ["SKU", "Product Title", "Category", "Base Price (USDT)", "Units Sold", "Gross Revenue (USDT)", "Stock Status"],
      ...data.productPerformance.bestSellers.map((p) => [
        p.sku,
        `"${p.title.replace(/"/g, '""')}"`,
        p.category,
        p.basePrice,
        p.unitsSold,
        p.grossRevenue,
        p.stock > 0 ? `In Stock (${p.stock})` : "Out of Stock",
      ]),
      [],
      ["── 3. SALES BY CATEGORY ──"],
      ["Category Name", "Units Sold", "Total Revenue (USDT)", "Revenue Share (%)"],
      ...data.categorySales.map((c) => [c.name, c.unitsSold, c.revenue, `${c.sharePct}%`]),
      [],
      ["── 4. GEOGRAPHIC DESTINATION REVENUE ──"],
      ["Country", "Order Count", "Total Revenue (USDT)", "Global Share (%)"],
      ...data.geoDistribution.map((g) => [g.country, g.orders, g.revenue, `${g.sharePct}%`]),
      [],
      ["── 5. MULTI-WAREHOUSE INVENTORY STATUS ──"],
      ["Hub Code", "Warehouse Location", "Stock Units on Hand", "Valuation (USDT)", "Low Stock Alerts"],
      ...data.inventoryTelemetry.hubs.map((h) => [
        h.hubCode,
        h.hubName,
        h.totalUnits,
        data.isSuperAdmin ? (h.valuationUSDT || 0) : "RESTRICTED",
        h.lowStockItemsCount,
      ])
    );

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LCM_Executive_Telemetry_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Executive telemetry successfully exported to CSV.");
  };

  // ─── Schedule Report Handler ───
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = newSchedule.recipientEmails.split(",").map((em) => em.trim()).filter(Boolean);
    if (!newSchedule.title || emails.length === 0) {
      showToast("Please provide a schedule title and at least one recipient email.", "error");
      return;
    }

    const res = await saveReportSchedule({
      title: newSchedule.title,
      frequency: newSchedule.frequency,
      recipientEmails: emails,
      metricsIncluded: newSchedule.metricsIncluded,
      format: newSchedule.format,
      isActive: newSchedule.isActive,
    });

    if (res.success) {
      showToast("Automated email report schedule configured successfully.");
      setIsScheduleModalOpen(false);
      const updated = await getReportSchedules();
      if (updated.data) setSchedules(updated.data);
    } else {
      showToast(res.error || "Failed to save schedule.", "error");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    const res = await deleteReportSchedule(id);
    if (res.success) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      showToast("Report schedule removed.");
    }
  };

  const handleTriggerInstantDispatch = async (email: string, title: string) => {
    showToast(`Dispatching instant executive report to ${email}...`);
    const res = await triggerInstantReportEmail({
      email,
      reportType: title,
      timeRange: data.dateRange.label,
    });
    if (res.success) {
      showToast(res.message || "Executive report dispatched.");
    } else {
      showToast(res.error || "Dispatch failed.", "error");
    }
  };

  // ─── Filtered Products ───
  const filteredBestSellers = useMemo(() => {
    if (!productSearch) return data.productPerformance.bestSellers;
    return data.productPerformance.bestSellers.filter(
      (p) =>
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [data.productPerformance.bestSellers, productSearch]);

  // ─── Chart Path Calculation (Pure SVG) ───
  const chartPoints = useMemo(() => {
    const pts = data.timeSeries;
    if (!pts || pts.length === 0) {
      return {
        currentPath: "",
        prevPath: "",
        areaPath: "",
        maxVal: 100,
        pointsCurrent: [],
        pointsPrev: [],
        width: 800,
        height: 240,
        padding: 30,
      };
    }

    const getVal = (p: (typeof pts)[0], isCurrent: boolean) => {
      if (activeMetricChart === "revenue") return isCurrent ? p.revenue : (p.previousRevenue || 0);
      if (activeMetricChart === "orders") return isCurrent ? p.orders : (p.previousOrders || 0);
      return isCurrent ? p.profit : (p.previousProfit || 0);
    };

    const maxVal = Math.max(
      ...pts.map((p) => Math.max(getVal(p, true), getVal(p, false))),
      50
    );

    const width = 800;
    const height = 240;
    const padding = 30;

    const pointsCurrent = pts.map((p, idx) => {
      const x = padding + (idx / Math.max(pts.length - 1, 1)) * (width - 2 * padding);
      const y = height - padding - (getVal(p, true) / maxVal) * (height - 2 * padding);
      return { x, y, val: getVal(p, true), label: p.label };
    });

    const pointsPrev = pts.map((p, idx) => {
      const x = padding + (idx / Math.max(pts.length - 1, 1)) * (width - 2 * padding);
      const y = height - padding - (getVal(p, false) / maxVal) * (height - 2 * padding);
      return { x, y, val: getVal(p, false), label: p.label };
    });

    const currentPath = pointsCurrent.reduce(
      (acc, curr, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${curr.x} ${curr.y}`,
      ""
    );

    const prevPath = pointsPrev.reduce(
      (acc, curr, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${curr.x} ${curr.y}`,
      ""
    );

    const areaPath = `${currentPath} L ${pointsCurrent[pointsCurrent.length - 1].x} ${height - padding} L ${pointsCurrent[0].x} ${height - padding} Z`;

    return { currentPath, prevPath, areaPath, maxVal, pointsCurrent, pointsPrev, width, height, padding };
  }, [data.timeSeries, activeMetricChart]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 font-montserrat text-slate-100">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Analytics & Executive Reports"
        subtitle="Real-time telemetry on Binance Pay USDT velocity, China factory procurement margins, air cargo fulfillment, and customer retention cohorts."
        badge={{
          text: data.isSuperAdmin ? "FULL FINANCIAL P&L" : "RESTRICTED VIEW",
          variant: data.isSuperAdmin ? "emerald" : "amber",
        }}
        breadcrumbs={[{ label: "Reports & Analytics" }]}
        actions={[
          {
            label: "Export CSV",
            onClick: handleExportCsv,
            icon: Download,
            variant: "outline",
          },
          {
            label: "Executive PDF",
            onClick: () => setIsPdfModalOpen(true),
            icon: Printer,
            variant: "primary",
          },
        ]}
      >
        {/* Date Filter & Realtime Telemetry Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-slate-800/80 flex-wrap">
          {/* Preset Time Range Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto max-w-full">
            {(
              [
                { id: "today", label: "Today" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "Quarter" },
                { id: "ytd", label: "YTD" },
                { id: "all", label: "All-Time" },
                { id: "custom", label: "Custom" },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setTimeRange(btn.id);
                  if (btn.id !== "custom") {
                    fetchData(btn.id);
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  timeRange === btn.id
                    ? "bg-[#FF1028] text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {timeRange === "custom" && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl animate-in fade-in">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl outline-none focus:border-[#FF1028]"
              />
              <span className="text-slate-500 text-xs font-bold">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl outline-none focus:border-[#FF1028]"
              />
              <button
                onClick={() => fetchData("custom", customStart, customEnd)}
                className="bg-[#FF1028] text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#E00B20] transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}

          {/* Comparison Toggle & Live Realtime Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCompareWithPrevious(!compareWithPrevious);
                showToast(
                  !compareWithPrevious
                    ? "Comparison mode enabled against previous period."
                    : "Comparison mode disabled."
                );
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                compareWithPrevious
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Compare Prior Period</span>
            </button>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-300">
                {isRealtimeActive ? "Supabase Realtime Live" : "Connected"}
              </span>
              <button
                onClick={() => fetchData()}
                disabled={isRefreshing}
                title="Refresh Analytics"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-[#FF1028]")} />
              </button>
            </div>
          </div>
        </div>
      </AdminPageHeader>

      {/* ── 2. Navigation Tabs for 8 Sub-Reports ── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Executive Overview", icon: BarChart3 },
          { id: "financials", label: "Financials & Sourcing (P&L)", icon: DollarSign },
          { id: "products", label: "Product & Inventory", icon: Package },
          { id: "logistics", label: "Orders & Logistics", icon: Truck },
          { id: "binance", label: "Binance USDT Ledger", icon: Coins },
          { id: "customers", label: "Customers & Carts", icon: Users },
          { id: "refunds", label: "Refunds & Warranty RMA", icon: ShieldAlert },
          { id: "schedules", label: "Automated Schedules", icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-[#FF1028] text-white shadow-lg shadow-[#FF1028]/20"
                  : "bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. Tab Content ── */}

      {/* ── TAB 1: EXECUTIVE OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top 4 Primary KPI Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Gross Revenue */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-md relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue (USDT)</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  ${data.overview.grossRevenue.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {compareWithPrevious && (
                  <div className="flex items-center gap-1.5 text-xs font-bold mt-1">
                    {data.overview.grossRevenue.isPositive ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{data.overview.grossRevenue.percentageChange}%
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-0.5">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        {data.overview.grossRevenue.percentageChange}%
                      </span>
                    )}
                    <span className="text-slate-500 font-medium">vs prior period (${data.overview.grossRevenue.previous.toFixed(0)})</span>
                  </div>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">100% Settled via Binance Pay Zero-Gas Fee</div>
            </div>

            {/* Total Orders */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-md relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sourced Orders</span>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {data.overview.totalOrders.current.toLocaleString()}
                </div>
                {compareWithPrevious && (
                  <div className="flex items-center gap-1.5 text-xs font-bold mt-1">
                    {data.overview.totalOrders.isPositive ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{data.overview.totalOrders.percentageChange}%
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-0.5">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        {data.overview.totalOrders.percentageChange}%
                      </span>
                    )}
                    <span className="text-slate-500 font-medium">{data.overview.paidOrders.current} paid dispatch</span>
                  </div>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Direct factory wholesale dispatch</div>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-md relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Order Value (AOV)</span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  ${data.overview.averageOrderValue.current.toFixed(2)}{" "}
                  <span className="text-xs text-slate-400 font-sans">USDT</span>
                </div>
                {compareWithPrevious && (
                  <div className="flex items-center gap-1.5 text-xs font-bold mt-1">
                    {data.overview.averageOrderValue.isPositive ? (
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{data.overview.averageOrderValue.percentageChange}%
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-0.5">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        {data.overview.averageOrderValue.percentageChange}%
                      </span>
                    )}
                    <span className="text-slate-500 font-medium">basket size</span>
                  </div>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Uplift from multi-battery drone kits</div>
            </div>

            {/* Gross Sourcing Profit / Net Margin */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-md relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {data.isSuperAdmin ? "Gross Profit (USDT)" : "Catalog Health"}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#FF1028]/10 border border-[#FF1028]/20 text-[#FF1028] flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
              <div>
                {data.isSuperAdmin && data.overview.grossProfit ? (
                  <>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                      ${data.overview.grossProfit.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{data.overview.netMarginPct}% Gross Sourcing Spread</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      {data.overview.conversionRate.current}%
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 mt-1">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Storefront Conversion Rate</span>
                    </div>
                  </>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {data.isSuperAdmin ? "Customer Checkout vs Shenzhen Factory Cost" : "Restricted: Super Admin Only"}
              </div>
            </div>
          </div>

          {/* Interactive Multi-Metric Comparison Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FF1028]" />
                  <h3 className="text-base font-black text-white">Performance Trajectory & Comparison</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Dual-series comparative trend line across selected timeline ({data.dateRange.label})
                </p>
              </div>

              {/* Metric Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                {(
                  [
                    { id: "revenue", label: "Gross Revenue" },
                    { id: "orders", label: "Order Count" },
                    ...(data.isSuperAdmin ? [{ id: "profit", label: "Gross Profit" }] : []),
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMetricChart(m.id as any)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      activeMetricChart === m.id
                        ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Line / Area Chart */}
            <div className="relative w-full overflow-hidden bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-white font-bold">
                    <span className="w-3 h-3 rounded-full bg-[#FF1028]" />
                    Current Period ({data.dateRange.label})
                  </span>
                  {compareWithPrevious && (
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-3 h-3 rounded-full bg-slate-600 border border-dashed border-slate-400" />
                      Prior Equivalent Period
                    </span>
                  )}
                </div>
                <span>Peak: ${chartPoints.maxVal.toLocaleString()}</span>
              </div>

              <svg
                viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                className="w-full h-56 sm:h-64 overflow-visible"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF1028" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#FF1028" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0.25, 0.5, 0.75, 1].map((lvl, idx) => (
                  <line
                    key={idx}
                    x1={chartPoints.padding}
                    y1={chartPoints.height - chartPoints.padding - lvl * (chartPoints.height - 2 * chartPoints.padding)}
                    x2={chartPoints.width - chartPoints.padding}
                    y2={chartPoints.height - chartPoints.padding - lvl * (chartPoints.height - 2 * chartPoints.padding)}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                ))}

                {/* Area Fill */}
                <path d={chartPoints.areaPath} fill="url(#chartGradient)" />

                {/* Previous Period Line (Dashed) */}
                {compareWithPrevious && (
                  <path
                    d={chartPoints.prevPath}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                  />
                )}

                {/* Current Period Line */}
                <path
                  d={chartPoints.currentPath}
                  fill="none"
                  stroke="#FF1028"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points on Current Path */}
                {chartPoints.pointsCurrent?.map((pt, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      className="fill-[#FF1028] stroke-slate-950 stroke-2 hover:r-6 transition-all"
                    />
                  </g>
                ))}
              </svg>

              {/* Timeline Axis Labels */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                {data.timeSeries.filter((_, idx) => idx % Math.ceil(data.timeSeries.length / 6) === 0).map((pt, idx) => (
                  <span key={idx}>{pt.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Sourcing Conversion Funnel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-black text-white">Storefront Sourcing & Checkout Funnel</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Full buyer progression from landing page to zero-fee Binance Pay settlement
                </p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                {data.overview.conversionRate.current}% End-to-End Conversion
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {data.conversionFunnel.map((stage, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3 relative group hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Stage #{idx + 1}</span>
                    <span className="font-mono text-emerald-400">{stage.conversionPct}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-black text-white font-mono">{stage.count.toLocaleString()}</div>
                    <div className="text-xs font-semibold text-slate-300 line-clamp-2">{stage.stage}</div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                      style={{ width: stage.conversionPct }}
                    />
                  </div>
                  {idx > 0 && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Dropoff: <span className="text-red-400">{stage.dropoffPct}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: FINANCIALS & SOURCING (P&L) ── */}
      {activeTab === "financials" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {!data.isSuperAdmin && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 flex items-center gap-4 text-amber-300">
              <ShieldAlert className="w-6 h-6 shrink-0 text-amber-400" />
              <div>
                <h4 className="text-sm font-black">Confidential Sourcing Data Redacted</h4>
                <p className="text-xs text-amber-300/80">
                  China supplier acquisition costs, private factory PO numbers, and net profit margins are restricted to Super Administrator roles.
                </p>
              </div>
            </div>
          )}

          {/* Sourcing Cost vs Selling Margin Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-[#FF1028]" />
                    <h3 className="text-base font-black text-white">Direct China Factory Sourcing P&L</h3>
                  </div>
                  <p className="text-xs text-slate-400">Wholesale acquisition spread across Guangdong & Zhejiang industrial hubs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-xs font-bold text-slate-400 block">Total Factory PO Cost</span>
                  <span className="text-2xl font-black text-slate-200 font-mono">
                    {data.isSuperAdmin && data.sourcingAndProfit.totalFactoryCostUSDT !== null
                      ? `$${data.sourcingAndProfit.totalFactoryCostUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
                      : "[RESTRICTED]"}
                  </span>
                  <span className="text-[11px] text-slate-500 block">Shenzhen & Guangzhou wholesale batches</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-xs font-bold text-slate-400 block">Customer Retail Sourced Value</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    ${data.sourcingAndProfit.totalRetailSourcedUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                  </span>
                  <span className="text-[11px] text-slate-500 block">Customer USDT checkout sum</span>
                </div>
              </div>

              {/* Sourcing Channels Progress */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Wholesale Procurement Channels Share
                </h4>
                <div className="space-y-3">
                  {data.sourcingAndProfit.sourcingChannels.map((plat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#FF1028]" />
                          {plat.platform} ({plat.poCount} POs)
                        </span>
                        <span className="font-mono text-slate-400 font-semibold">
                          {data.isSuperAdmin && plat.costUSDT !== null ? `$${plat.costUSDT.toFixed(2)} USDT` : ""} ({plat.sharePct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-[#FF1028] to-orange-500 rounded-full"
                          style={{ width: `${plat.sharePct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Net Profit Waterfall & Fee Savings */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-4 space-y-1">
                  <h3 className="text-base font-black text-white">Cost & Fee Deductions</h3>
                  <p className="text-xs text-slate-400">Estimated overhead and gateway savings</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Air Cargo Freight (DDP)</span>
                    <span className="font-mono font-bold text-slate-200">
                      -${data.sourcingAndProfit.estimatedAirFreightUSDT.toFixed(2)} USDT
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Binance Pay Gas Saved (1.5%)</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +${data.sourcingAndProfit.binancePayGasSavedUSDT.toFixed(2)} USDT
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">USDT Escrow Working Balance</span>
                    <span className="font-mono font-bold text-blue-400">
                      ${data.sourcingAndProfit.usdtEscrowBalance.toFixed(2)} USDT
                    </span>
                  </div>
                </div>
              </div>

              {data.isSuperAdmin && data.overview.estimatedNetProfit && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-300 block uppercase tracking-wider">
                    Estimated Net Profit (P&L)
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ${data.overview.estimatedNetProfit.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                  </div>
                  <span className="text-[10px] text-emerald-400/80 block">
                    After factory costs, YunExpress freight, and zero Binance fees
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: PRODUCT & INVENTORY ── */}
      {activeTab === "products" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Warehouse Valuation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.inventoryTelemetry.hubs.map((hub) => (
              <div
                key={hub.hubCode}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-md relative group hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 font-mono">{hub.hubCode}</span>
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                    {hub.totalUnits} Units
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{hub.hubName}</h4>
                  <div className="text-xl font-black text-slate-200 font-mono mt-1">
                    {data.isSuperAdmin && hub.valuationUSDT !== null
                      ? `$${hub.valuationUSDT.toLocaleString()} USDT Valuation`
                      : `${hub.totalUnits} Active Stock Units`}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Low-stock alerts:</span>
                  <span className={cn("font-bold font-mono", hub.lowStockItemsCount > 0 ? "text-amber-400" : "text-emerald-400")}>
                    {hub.lowStockItemsCount} SKUs
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Best Sellers Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-black text-white">Top Best-Selling Hardware SKUs</h3>
                </div>
                <p className="text-xs text-slate-400">Ranked by units sold and gross USDT sales volume</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl outline-none focus:border-[#FF1028]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Hardware Product</th>
                    <th className="py-3 px-4">SKU / Code</th>
                    <th className="py-3 px-4 text-right">Base Price</th>
                    {data.isSuperAdmin && <th className="py-3 px-4 text-right">Factory Cost</th>}
                    <th className="py-3 px-4 text-right">Units Sold</th>
                    <th className="py-3 px-4 text-right">Gross Sales</th>
                    {data.isSuperAdmin && <th className="py-3 px-4 text-center">Margin %</th>}
                    <th className="py-3 px-4 text-center">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredBestSellers.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="py-4 px-4 font-sans font-bold text-white">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-slate-500 w-4">#{idx + 1}</span>
                          <Link href={`/admin/products`} className="hover:text-[#FF1028] transition-colors line-clamp-1 max-w-xs">
                            {p.title}
                          </Link>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">{p.sku}</td>
                      <td className="py-4 px-4 text-right text-white font-bold">${p.basePrice.toFixed(2)}</td>
                      {data.isSuperAdmin && (
                        <td className="py-4 px-4 text-right text-slate-400">
                          {p.factoryCost ? `$${p.factoryCost.toFixed(2)}` : "-"}
                        </td>
                      )}
                      <td className="py-4 px-4 text-right text-emerald-400 font-black">{p.unitsSold}</td>
                      <td className="py-4 px-4 text-right text-white font-bold">${p.grossRevenue.toFixed(2)}</td>
                      {data.isSuperAdmin && (
                        <td className="py-4 px-4 text-center">
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black px-2 py-0.5 rounded">
                            {p.marginPct}%
                          </span>
                        </td>
                      )}
                      <td className="py-4 px-4 text-center font-sans">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold",
                            p.stock > 10 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          )}
                        >
                          {p.stock} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category & Brand Breakdown Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categories */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Sales by Category
              </h3>
              <div className="space-y-3">
                {data.categorySales.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold">{cat.name}</span>
                      <span className="font-mono text-slate-400">${cat.revenue.toFixed(2)} USDT ({cat.sharePct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cat.sharePct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Sales by Brand
              </h3>
              <div className="space-y-3">
                {data.brandSales.map((brand, idx) => (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold">{brand.name}</span>
                      <span className="font-mono text-slate-400">${brand.revenue.toFixed(2)} USDT ({brand.sharePct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${brand.sharePct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: ORDERS & LOGISTICS ── */}
      {activeTab === "logistics" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  Order Pipeline Distribution
                </h3>
                <p className="text-xs text-slate-400">Fulfillment stages across Shenzhen & Hong Kong hubs</p>
              </div>

              <div className="space-y-3">
                {data.orderStatusDistribution.map((st) => (
                  <div
                    key={st.status}
                    className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={st.color}>{st.label}</span>
                      <span className="font-mono text-white">
                        {st.count} orders ({st.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          st.status === "paid" || st.status === "delivered" ? "bg-emerald-500" : "bg-blue-500"
                        )}
                        style={{ width: `${Math.max(st.pct, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Heatmap Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  Air Cargo Destinations (DDP)
                </h3>
                <p className="text-xs text-slate-400">Global buyer delivery distribution</p>
              </div>

              <div className="space-y-3">
                {data.geoDistribution.map((geo) => (
                  <div
                    key={geo.country}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-slate-300">
                        {geo.code}
                      </span>
                      <span className="font-bold text-white">{geo.country}</span>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-emerald-400">${geo.revenue.toLocaleString()} USDT</div>
                      <div className="text-[10px] text-slate-500">{geo.orders} orders ({geo.sharePct}%)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: BINANCE USDT LEDGER ── */}
      {activeTab === "binance" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Binance USDT Settled</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                ${data.binancePaymentsReconciliation.totalReceivedUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 block">Instant Web3 / App Checkout</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reconciliation Variance</span>
              <div className="text-2xl font-black text-white font-mono">$0.00 USDT</div>
              <span className="text-[11px] text-emerald-400 block font-bold">100% Balanced Ledger</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zero-Fee Savings</span>
              <div className="text-2xl font-black text-purple-400 font-mono">
                ${data.sourcingAndProfit.binancePayGasSavedUSDT.toFixed(2)} USDT
              </div>
              <span className="text-[11px] text-slate-500 block">Saved vs 2.9% Credit Card Processing</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              Binance Pay Transaction Status Distribution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.binancePaymentsReconciliation.metrics.map((pm) => (
                <div
                  key={pm.status}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={pm.color}>{pm.label}</span>
                    <span className="font-mono text-slate-400">{pm.pct}%</span>
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    ${pm.totalAmountUSDT.toLocaleString()} USDT
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">{pm.count} transactions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: CUSTOMERS & ABANDONED CARTS ── */}
      {activeTab === "customers" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">New vs Returning Buyers</span>
              <div className="text-2xl font-black text-white font-mono">
                {data.customerRetention.returningBuyers}{" "}
                <span className="text-sm font-sans text-slate-400">/ {data.customerRetention.newBuyers} New</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold block">
                {data.customerRetention.repeatPurchaseRatePct}% Repeat Purchase Rate
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Lifetime Value (LTV)</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                ${data.customerRetention.customerLtvUSDT.toFixed(2)} USDT
              </div>
              <span className="text-[11px] text-slate-500 block">Average cumulative spend per customer</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recoverable Cart Revenue</span>
              <div className="text-2xl font-black text-amber-400 font-mono">
                ${data.abandonedCarts.totalLostRevenueUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </div>
              <span className="text-[11px] text-slate-500 block">
                {data.abandonedCarts.totalAbandonedCartsCount} Carts Inactive &gt;24 Hours
              </span>
            </div>
          </div>

          {/* Abandoned Carts Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
            <div className="border-b border-slate-800 pb-4 space-y-1">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                Active Abandoned Carts Recovery Queue
              </h3>
              <p className="text-xs text-slate-400">High-intent customers who added items without completing payment</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Customer Email</th>
                    <th className="py-3 px-4">Items In Cart</th>
                    <th className="py-3 px-4 text-right">Potential Value</th>
                    <th className="py-3 px-4 text-right">Last Active</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {data.abandonedCarts.recentAbandonedCarts.map((c) => (
                    <tr key={c.cartId} className="hover:bg-slate-950/60 transition-colors">
                      <td className="py-4 px-4 font-sans font-bold text-white">
                        <div>{c.userEmail}</div>
                        <span className="text-[10px] text-slate-500 font-normal">{c.customerName}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-sans">
                        <span className="font-mono text-emerald-400 font-bold">{c.itemCount} items: </span>
                        {c.products.map((p) => p.title).join(", ")}
                      </td>
                      <td className="py-4 px-4 text-right text-emerald-400 font-black">
                        ${c.valueUSDT.toFixed(2)} USDT
                      </td>
                      <td className="py-4 px-4 text-right text-slate-400 text-[11px]">
                        {new Date(c.lastActive).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => showToast(`Discount voucher email queued for ${c.userEmail}.`)}
                          className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-xl text-[11px] font-bold hover:bg-amber-500/20 transition-colors cursor-pointer"
                        >
                          Send Incentive
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: REFUNDS & WARRANTY RMA ── */}
      {activeTab === "refunds" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">30-Day Warranty Claims</span>
              <div className="text-2xl font-black text-white font-mono">
                {data.refundsAndRma.totalReturnClaims}{" "}
                <span className="text-xs text-slate-400 font-sans">
                  ({data.refundsAndRma.approvedClaims} Approved)
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold block">
                {data.refundsAndRma.returnRatePct}% Total Return Rate
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Refunded USDT</span>
              <div className="text-2xl font-black text-red-400 font-mono">
                ${data.refundsAndRma.totalRefundedAmountUSDT.toFixed(2)} USDT
              </div>
              <span className="text-[11px] text-slate-500 block">Covered by Factory Quality Guarantee</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inspection QC Speed</span>
              <div className="text-2xl font-black text-purple-400 font-mono">24.5 Hours</div>
              <span className="text-[11px] text-slate-500 block">Average Claim Resolution SLA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Defect Evidence Submission Breakdown
              </h3>
              <div className="space-y-3">
                {data.refundsAndRma.evidenceBreakdown.map((ev, idx) => (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold">{ev.type}</span>
                      <span className="font-mono text-slate-400">{ev.count} claims ({ev.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${ev.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Top Warranty Return Reasons
              </h3>
              <div className="space-y-3">
                {data.refundsAndRma.reasonsBreakdown.map((rsn, idx) => (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold">{rsn.reason}</span>
                      <span className="font-mono text-slate-400">{rsn.count} orders ({rsn.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${rsn.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 8: AUTOMATED SCHEDULED EMAIL REPORTS ── */}
      {activeTab === "schedules" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Automated Executive Email Schedules</h3>
              <p className="text-xs text-slate-400">
                Configure automated PDF and CSV reports dispatched directly to company executives and logistics leads.
              </p>
            </div>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="bg-[#FF1028] text-white px-4 py-2.5 rounded-2xl text-xs font-black hover:bg-[#E00B20] transition-colors flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Schedule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {schedules.map((sched) => (
              <div
                key={sched.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md relative group hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-[#FF1028]/10 text-[#FF1028] border border-[#FF1028]/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                    {sched.frequency} ({sched.format.toUpperCase()})
                  </span>
                  <button
                    onClick={() => handleDeleteSchedule(sched.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white">{sched.title}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{sched.recipientEmails.join(", ")}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {sched.metricsIncluded.map((m, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-950 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800 font-mono"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Last sent: {sched.lastSentAt ? new Date(sched.lastSentAt).toLocaleDateString() : "Never"}
                  </span>
                  <button
                    onClick={() => handleTriggerInstantDispatch(sched.recipientEmails[0], sched.title)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Modal: Create Report Schedule ── */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Configure Automated Report Schedule"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Report Schedule Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Daily Binance USDT & Sourcing Margin Flash"
              value={newSchedule.title}
              onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Frequency</label>
              <select
                value={newSchedule.frequency}
                onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              >
                <option value="daily">Daily (Shenzhen GMT+8 09:00)</option>
                <option value="weekly">Weekly (Every Monday)</option>
                <option value="monthly">Monthly (1st of Month)</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Export Format</label>
              <select
                value={newSchedule.format}
                onChange={(e) => setNewSchedule({ ...newSchedule, format: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              >
                <option value="pdf">Executive PDF (Branded Layout)</option>
                <option value="csv">Structured CSV (Spreadsheet)</option>
                <option value="json">Raw JSON (API Webhook)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Recipient Emails (comma-separated)</label>
            <input
              required
              type="text"
              placeholder="finance@lennoxchinamall.com, superadmin@lennoxchinamall.com"
              value={newSchedule.recipientEmails}
              onChange={(e) => setNewSchedule({ ...newSchedule, recipientEmails: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] cursor-pointer"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Modal: Printable Executive PDF Dossier ── */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title="Executive Report — Print & PDF Generator"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 pt-2 text-slate-900 bg-white p-8 rounded-2xl shadow-xl">
          {/* Document Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-2xl font-black text-[#FF1028] tracking-tight">LENNOX CHINAMALL</h2>
              <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                Executive Financial & Telemetry Dossier
              </p>
            </div>
            <div className="text-right text-xs text-slate-600 font-mono">
              <div>Period: <strong className="text-slate-900">{data.dateRange.label}</strong></div>
              <div>Generated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="border p-3 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Gross Revenue</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                ${data.overview.grossRevenue.current.toLocaleString()} USDT
              </span>
            </div>
            <div className="border p-3 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Orders</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {data.overview.totalOrders.current}
              </span>
            </div>
            <div className="border p-3 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Avg Order Value</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                ${data.overview.averageOrderValue.current.toFixed(2)}
              </span>
            </div>
            <div className="border p-3 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Gross Sourcing Margin</span>
              <span className="text-lg font-black text-emerald-700 font-mono">
                {data.overview.netMarginPct}%
              </span>
            </div>
          </div>

          {/* Summary Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-800">Top Performing Hardware SKUs</h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border">SKU</th>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border text-right">Units</th>
                  <th className="p-2 border text-right">Revenue (USDT)</th>
                </tr>
              </thead>
              <tbody>
                {data.productPerformance.bestSellers.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2 border font-mono">{p.sku}</td>
                    <td className="p-2 border font-medium">{p.title}</td>
                    <td className="p-2 border text-right font-mono font-bold">{p.unitsSold}</td>
                    <td className="p-2 border text-right font-mono font-bold">${p.grossRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsPdfModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ── 6. Toast Notification ── */}
      {toastMsg && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-xs font-black shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3",
            toastMsg.type === "error" ? "bg-[#FF1028] text-white" : "bg-[#10B981] text-slate-950"
          )}
        >
          <span>{toastMsg.type === "error" ? "⚠️" : "✓"} {toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm hover:opacity-70 cursor-pointer">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
