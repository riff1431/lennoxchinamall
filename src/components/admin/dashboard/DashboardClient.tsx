"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Package,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  Copy,
  Download,
  Flame,
  Zap,
  Box,
} from "lucide-react";
import {
  ComprehensiveDashboardData,
  DashboardTimeRange,
  DashboardFilterOptions,
  getDashboardOverviewData,
} from "@/app/actions/admin-dashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { AdminDatePicker } from "@/components/admin/forms/AdminDatePicker";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatCurrency, formatDate, cn } from "@/utils/helpers";
import { createClient } from "@/lib/supabase/client";
import { DashboardTelemetryChart } from "./DashboardTelemetryChart";
import {
  DashboardLayoutModal,
  DEFAULT_WIDGETS,
  WidgetConfig,
  WidgetId,
} from "./DashboardLayoutModal";

interface DashboardClientProps {
  initialData: ComprehensiveDashboardData;
}

const STORAGE_KEY_WIDGETS = "lennox_admin_dashboard_widgets_v2";

export function DashboardClient({ initialData }: DashboardClientProps) {
  const toast = useAdminToast();
  const [data, setData] = useState<ComprehensiveDashboardData>(initialData);
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>(initialData.timeRange || "30d");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Custom Date Range Modal with static initial strings
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("2026-08-01");
  const [customEndDate, setCustomEndDate] = useState("2026-08-31");

  // Widget Layout Preferences using lazy initializer
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_WIDGETS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_WIDGETS;
  });
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  const handleUpdateWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    try {
      localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(newWidgets));
      toast.success("Dashboard layout saved.");
    } catch {
      // ignore
    }
  };

  const isWidgetEnabled = (id: WidgetId) => {
    const w = widgets.find((item) => item.id === id);
    return w ? w.enabled : true;
  };

  // Fetch Dashboard Telemetry Data
  const fetchData = useCallback(
    async (options?: DashboardFilterOptions) => {
      setIsLoading(true);
      const opts: DashboardFilterOptions = options || {
        timeRange,
        startDate: timeRange === "custom" ? customStartDate : undefined,
        endDate: timeRange === "custom" ? customEndDate : undefined,
      };

      try {
        const res = await getDashboardOverviewData(opts);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.error || "Failed to refresh dashboard.");
        }
      } catch {
        toast.error("Telemetry query failed.");
      } finally {
        setIsLoading(false);
      }
    },
    [timeRange, customStartDate, customEndDate, toast]
  );

  // Handle Time Range Change
  const handleRangeChange = (range: DashboardTimeRange) => {
    if (range === "custom") {
      setIsCustomDateModalOpen(true);
      return;
    }
    setTimeRange(range);
    startTransition(() => {
      fetchData({ timeRange: range });
    });
  };

  const handleApplyCustomRange = () => {
    setTimeRange("custom");
    setIsCustomDateModalOpen(false);
    startTransition(() => {
      fetchData({
        timeRange: "custom",
        startDate: customStartDate,
        endDate: customEndDate,
      });
    });
  };

  // Supabase Realtime Subscription for live updates
  useEffect(() => {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel("admin-dashboard-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload) => {
            setIsRealtimeActive(true);
            if (payload.eventType === "INSERT") {
              toast.info(`New Order #${payload.new?.order_number || "Incoming"} received!`);
            }
            fetchData();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "payments" },
          () => {
            fetchData();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsRealtimeActive(true);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Realtime fallback
    }
  }, [fetchData, toast]);

  // Export Overview CSV
  const handleExportOverview = () => {
    const csvContent =
      "Metric,Current,Previous,PercentageChange\n" +
      `Revenue,${data.kpis.revenue.current},${data.kpis.revenue.previous},${data.kpis.revenue.percentageChange}%\n` +
      `Orders,${data.kpis.orders.current},${data.kpis.orders.previous},${data.kpis.orders.percentageChange}%\n` +
      `Customers,${data.kpis.customers.current},${data.kpis.customers.previous},${data.kpis.customers.percentageChange}%\n` +
      `AOV,${data.kpis.aov.current},${data.kpis.aov.previous},${data.kpis.aov.percentageChange}%\n`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lennox_dashboard_overview_${timeRange}_${Date.now()}.csv`;
    a.click();
    toast.success("Dashboard telemetry exported to CSV.");
  };

  const getStatusBadgeTone = (status: string): BadgeTone => {
    switch (status.toLowerCase()) {
      case "paid":
      case "delivered":
        return "emerald";
      case "sourcing":
      case "processing":
        return "blue";
      case "shipped":
        return "amber";
      case "cancelled":
      case "failed":
        return "red";
      default:
        return "slate";
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 font-montserrat">
      {/* ── 1. Header & Live Indicator ── */}
      <AdminPageHeader
        title="Admin Operations &amp; Intelligence Desk"
        subtitle="Real-time multi-warehouse inventory, China factory sourcing pipeline, Binance Pay USDT settlements, and executive KPI telemetry."
        badge={{
          text: isRealtimeActive ? "Supabase Live Stream Online" : "Telemetry Active",
          variant: isRealtimeActive ? "emerald" : "blue",
        }}
        breadcrumbs={[{ label: "Overview", href: "/admin/dashboard" }, { label: "Executive Dashboard" }]}
        actions={[
          {
            label: "New Product",
            icon: Plus,
            variant: "primary",
            href: "/admin/products",
          },
        ]}
      />

      {/* ── 2. Time Filter Bar & Quick Actions Toolbar ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Time Range Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {(
            [
              { key: "today", label: "Today" },
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
              { key: "ytd", label: "Year to Date" },
              { key: "1y", label: "12 Months" },
              { key: "custom", label: "Custom Range" },
            ] as Array<{ key: DashboardTimeRange; label: string }>
          ).map((t) => {
            const isActive = timeRange === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleRangeChange(t.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-[#00143D] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Right: Quick Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/orders"
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#2F65F6]" />
            <span>Orders</span>
          </Link>

          <Link
            href="/admin/inventory"
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Box className="w-3.5 h-3.5 text-amber-500" />
            <span>Stock</span>
          </Link>

          <Link
            href="/admin/promotions"
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Promotions</span>
          </Link>

          <button
            type="button"
            onClick={handleExportOverview}
            title="Export CSV"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsLayoutModalOpen(true)}
            title="Configure Dashboard Widgets"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => fetchData()}
            title="Refresh Live Database Data"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", (isLoading || isPending) && "animate-spin text-[#2F65F6]")} />
          </button>
        </div>
      </div>

      {/* ── 3. Dynamic KPI Cards Row (6 Cards) ── */}
      {isWidgetEnabled("kpis") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: Revenue (USDT) */}
          <div className="p-4.5 rounded-3xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex flex-col justify-between shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Gross Revenue
              </span>
              <div className="w-8 h-8 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono block">
                {formatCurrency(data.kpis.revenue.current)}
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono">
                <span
                  className={cn(
                    "font-bold flex items-center",
                    data.kpis.revenue.isPositive ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {data.kpis.revenue.isPositive ? "+" : ""}
                  {data.kpis.revenue.percentageChange}%
                </span>
                <span className="text-slate-400">vs prior period</span>
              </div>
            </div>
          </div>

          {/* Card 2: Orders Count */}
          <div className="p-4.5 rounded-3xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex flex-col justify-between shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Total Orders
              </span>
              <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono block">
                {data.kpis.orders.current}
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono">
                <span
                  className={cn(
                    "font-bold flex items-center",
                    data.kpis.orders.isPositive ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {data.kpis.orders.isPositive ? "+" : ""}
                  {data.kpis.orders.percentageChange}%
                </span>
                <span className="text-slate-400">vs prior period</span>
              </div>
            </div>
          </div>

          {/* Card 3: Customers & Buyers */}
          <div className="p-4.5 rounded-3xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex flex-col justify-between shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                New Customers
              </span>
              <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono block">
                {data.kpis.customers.current}
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono">
                <span
                  className={cn(
                    "font-bold flex items-center",
                    data.kpis.customers.isPositive ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {data.kpis.customers.isPositive ? "+" : ""}
                  {data.kpis.customers.percentageChange}%
                </span>
                <span className="text-slate-400">vs prior period</span>
              </div>
            </div>
          </div>

          {/* Card 4: Estimated Profit & Margin */}
          <div className="p-4.5 rounded-3xl bg-[#FAF5FF] dark:bg-[#20182E] border border-[#E9D5FF]/50 dark:border-purple-900/30 flex flex-col justify-between shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                {data.isFinancialDataAllowed ? "Estimated Profit" : "Average Order (AOV)"}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono block">
                {data.isFinancialDataAllowed && data.kpis.profit
                  ? formatCurrency(data.kpis.profit.current)
                  : formatCurrency(data.kpis.aov.current)}
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono">
                {data.isFinancialDataAllowed && data.kpis.profitMarginPct !== null ? (
                  <span className="font-bold text-purple-600 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.2 rounded">
                    {data.kpis.profitMarginPct}% margin
                  </span>
                ) : (
                  <span className="text-slate-400">per transaction</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: Pending Payments & USDT Escrow */}
          <div className="p-4.5 rounded-3xl bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex flex-col justify-between shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Pending Crypto
              </span>
              <div className="w-8 h-8 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono block">
                {formatCurrency(data.kpis.pendingPaymentsAmount)}
              </span>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-400">
                <span>{data.kpis.pendingPaymentsCount} checkout sessions</span>
              </div>
            </div>
          </div>

          {/* Card 6: Low Stock SKUs */}
          <div className="p-4.5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Low Stock Alerts
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="mt-3">
              <span
                className={cn(
                  "text-xl sm:text-2xl font-black font-mono block",
                  data.kpis.lowStockCount > 0 ? "text-amber-500" : "text-slate-900 dark:text-white"
                )}
              >
                {data.kpis.lowStockCount} SKUs
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-slate-400">
                <Link href="/admin/inventory" className="text-[#2F65F6] hover:underline font-bold">
                  View safety thresholds →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Action Required Priority Queue Section ── */}
      {isWidgetEnabled("tasks") && data.actionTasks && data.actionTasks.length > 0 && (
        <div className="bg-gradient-to-r from-[#00143D] to-[#0A2566] text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="font-heading font-black text-sm sm:text-base tracking-wide uppercase">
                Action Required • Priority Tasks
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold bg-white/10 px-2.5 py-0.5 rounded-full text-white">
              {data.actionTasks.length} Active Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.actionTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex flex-col justify-between space-y-3 hover:bg-white/15 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono",
                        task.severity === "urgent"
                          ? "bg-rose-500/80 text-white"
                          : task.severity === "high"
                          ? "bg-amber-500/80 text-white"
                          : "bg-blue-500/80 text-white"
                      )}
                    >
                      {task.severity}
                    </span>
                    {task.count !== undefined && (
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {task.count} items
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xs font-heading text-white pt-1">
                    {task.title}
                  </h3>
                  <p className="text-[11px] text-slate-200/80 leading-relaxed line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <Link
                  href={task.actionHref}
                  className="w-full py-1.5 rounded-xl bg-white text-[#00143D] hover:bg-amber-300 text-center font-bold text-xs transition-colors shadow-xs"
                >
                  {task.actionLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. Telemetry Chart Section ── */}
      {isWidgetEnabled("chart") && (
        <DashboardTelemetryChart
          data={data.chartData}
          isFinancialDataAllowed={data.isFinancialDataAllowed}
          timeRangeLabel={data.timeRangeLabel}
        />
      )}

      {/* ── 6. Two-Column Grid: Recent Orders & Sourcing Queue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Recent Orders */}
        {isWidgetEnabled("recentOrders") && (
          <div className={cn(isWidgetEnabled("sourcing") ? "lg:col-span-8" : "lg:col-span-12", "bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4")}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Recent Orders &amp; Fulfillment
                </h2>
                <p className="text-xs text-slate-400">Live stream of customer settlements and waybill statuses.</p>
              </div>
              <Link
                href="/admin/orders"
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#2F65F6] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                View All Orders →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Order Number</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Settlement</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Carrier / Tracking</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <Link href="/admin/orders" className="font-mono font-bold text-slate-900 dark:text-white hover:text-[#2F65F6]">
                          #{order.orderNumber}
                        </Link>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[140px]">
                          {order.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">
                          {order.customerEmail}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge
                          status={order.status}
                          tone={getStatusBadgeTone(order.status)}
                          size="sm"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {order.shippingStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <AdminActionMenu
                          itemTitle={`order #${order.orderNumber}`}
                          customActions={[
                            {
                              label: "Inspect Waybill",
                              onClick: () => toast.info(`Viewing order #${order.orderNumber}`),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Right Column (4 cols): Sourcing Queue */}
        {isWidgetEnabled("sourcing") && (
          <div className={cn(isWidgetEnabled("recentOrders") ? "lg:col-span-4" : "lg:col-span-12", "bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4")}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  China Sourcing Hubs
                </h2>
                <p className="text-xs text-slate-400">Shenzhen &amp; Guangzhou queue</p>
              </div>
              <Link href="/admin/suppliers" className="text-xs text-[#2F65F6] font-bold hover:underline">
                Suppliers →
              </Link>
            </div>

            <div className="space-y-3">
              {data.sourcingQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      #{item.orderNumber}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#2F65F6] bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {item.supplierCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">
                    {item.productTitle} (Qty: {item.quantity})
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/40 dark:border-slate-800">
                    <span>{item.hub}</span>
                    <span className="text-amber-600 font-bold">{item.sourcingStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 7. Two-Column Grid: Top Selling Products & Low Stock Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Top Selling Products */}
        {isWidgetEnabled("topProducts") && (
          <div className="lg:col-span-6 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Top-Selling Hardware Leaderboard
                </h2>
                <p className="text-xs text-slate-400">Ranked by unit velocity and revenue</p>
              </div>
              <Link href="/admin/products" className="text-xs text-[#2F65F6] font-bold hover:underline">
                Catalog →
              </Link>
            </div>

            <div className="space-y-3">
              {data.topSellingProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-black font-mono text-sm text-slate-400 w-4">
                      0{idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden relative shrink-0">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.title} fill className="object-cover" unoptimized />
                      ) : (
                        <Package className="w-5 h-5 m-auto mt-2.5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white text-xs block truncate">
                        {p.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {p.sku} • {p.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-xs text-slate-900 dark:text-white block">
                      {formatCurrency(p.grossRevenue)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {p.unitsSold} sold • {p.stock} in stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Column (6 cols): Low Stock Alerts */}
        {isWidgetEnabled("lowStock") && (
          <div className="lg:col-span-6 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Inventory Low-Stock Thresholds
                </h2>
                <p className="text-xs text-slate-400">Immediate replenishment required</p>
              </div>
              <Link href="/admin/inventory" className="text-xs text-amber-600 font-bold hover:underline">
                Reorder Portal →
              </Link>
            </div>

            <div className="space-y-3">
              {data.lowStockAlerts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {item.productName}
                      </span>
                      {item.variantName && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({item.variantName})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      SKU: {item.sku} • {item.warehouse}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-rose-600 dark:text-rose-400 block">
                        {item.stock} left
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        threshold: {item.threshold}
                      </span>
                    </div>

                    <Link
                      href="/admin/inventory"
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-heading shadow-xs"
                    >
                      Reorder
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 8. Two-Column Grid: Binance Pay USDT Feed & Order Lifecycle Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (6 cols): Binance Pay USDT Feed */}
        {isWidgetEnabled("payments") && (
          <div className="lg:col-span-6 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Binance Pay USDT Settlement Stream
                </h2>
                <p className="text-xs text-slate-400">HMAC-SHA512 webhook signature validated transactions</p>
              </div>
              <Link href="/admin/payments" className="text-xs text-[#2F65F6] font-bold hover:underline">
                Ledger →
              </Link>
            </div>

            <div className="space-y-3">
              {data.recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-white block">
                      #{p.orderNumber}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <span>{p.merchantTradeNo}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(p.merchantTradeNo);
                          toast.info("Copied trade number.");
                        }}
                        className="text-slate-400 hover:text-[#2F65F6]"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 block">
                      {formatCurrency(p.amount)}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-900/40 inline-flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> HMAC VALID
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right (6 cols): Order Status Lifecycle Funnel */}
        {isWidgetEnabled("orderDistribution") && (
          <div className="lg:col-span-6 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Fulfillment Lifecycle Funnel
                </h2>
                <p className="text-xs text-slate-400">Order distribution across operational stages</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                100% Reconciled
              </span>
            </div>

            <div className="space-y-3">
              {data.orderStatusDistribution.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.count} orders ({item.pct}%) • {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, item.pct)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 9. Custom Date Range Modal ── */}
      <Modal
        isOpen={isCustomDateModalOpen}
        onClose={() => setIsCustomDateModalOpen(false)}
        title="Custom Analytics Date Range"
        size="sm"
      >
        <div className="space-y-4 pt-1">
          <div className="space-y-3">
            <AdminDatePicker
              label="Select Date Range"
              isRange={true}
              fromValue={customStartDate}
              toValue={customEndDate}
              onChange={({ from, to }) => {
                if (from) setCustomStartDate(from);
                if (to) setCustomEndDate(to);
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCustomDateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCustomRange}
              className="px-5 py-2.5 rounded-xl bg-[#00143D] hover:bg-[#002266] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </Modal>

      {/* ── 10. Dashboard Layout Customizer Modal ── */}
      <DashboardLayoutModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        widgets={widgets}
        onUpdateWidgets={handleUpdateWidgets}
      />
    </div>
  );
}
