"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import {
  Tag,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Check,
  Copy,
  Layers,
  Flame,
  TrendingUp,
  Download,
  Search,
  AlertCircle,
  DollarSign,
  Gift,
  Truck,
  Users,
  ChevronLeft,
  ChevronRight,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  Coupon,
  FlashDeal,
  PromotionAuditLog,
  PromotionScope,
  CouponType,
} from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/utils/helpers";
import { FlashDealCountdown } from "@/components/common/FlashDealCountdown";
import {
  getPromotionsData,
  createPromotion,
  updatePromotion,
  duplicatePromotion,
  togglePromotionStatus,
  deletePromotion,
  createFlashDeal,
  deleteFlashDeal,
  getPromotionAuditLogs,
  exportPromotionsCsv,
  PromotionPayload,
} from "@/app/actions/admin-promotions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState<"coupons" | "automatic" | "flash" | "audit">("coupons");
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Data State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [auditLogs, setAuditLogs] = useState<PromotionAuditLog[]>([]);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalDiscounts: 0,
    totalRedemptions: 0,
    activeCampaigns: 0,
  });

  // Modal States
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [isFlashModalOpen, setIsFlashModalOpen] = useState(false);

  // Coupon Form State
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<CouponType>("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(10);
  const [formMaxDiscount, setFormMaxDiscount] = useState<string>("");
  const [formMinSpend, setFormMinSpend] = useState<number>(0);
  const [formScope, setFormScope] = useState<PromotionScope>("all");
  const [formTargetCategories, setFormTargetCategories] = useState<string[]>([]);
  const [formFirstOrderOnly, setFormFirstOrderOnly] = useState(false);
  const [formIsAutomatic, setFormIsAutomatic] = useState(false);
  const [formIsStackable, setFormIsStackable] = useState(false);
  const [formUsageLimit, setFormUsageLimit] = useState<string>("500");
  const [formPerCustomerLimit, setFormPerCustomerLimit] = useState<number>(1);
  const [formStartsAt, setFormStartsAt] = useState<string>("2026-08-24T12:00");
  const [formExpiresAt, setFormExpiresAt] = useState<string>("2026-09-24T12:00");

  // BOGO / Tiered states
  const [formBogoBuy] = useState(1);
  const [formBogoGet] = useState(1);
  const [formBogoDiscount] = useState(100);

  // Flash Deal Form State
  const [flashTitle, setFlashTitle] = useState("Shenzhen Tech Expo 24h Drop");
  const [flashDiscount, setFlashDiscount] = useState(25);
  const [flashStart, setFlashStart] = useState("2026-08-24T12:00");
  const [flashEnd, setFlashEnd] = useState("2026-08-25T12:00");
  const [flashProductIds] = useState<string[]>([]);

  // Load Data
  const loadData = useCallback(async () => {
    const res = await getPromotionsData({
      search: searchQuery,
      type: typeFilter,
      status: statusFilter,
      scope: scopeFilter,
      page: currentPage,
      pageSize,
      sortBy,
    });

    if (res.success) {
      setCoupons(res.coupons || []);
      setTotalCoupons(res.totalCoupons || 0);
      setFlashDeals(res.flashDeals || []);
      if (res.analytics) setAnalytics(res.analytics);
    }
  }, [searchQuery, typeFilter, statusFilter, scopeFilter, currentPage, pageSize, sortBy]);

  const loadLogs = useCallback(async () => {
    const res = await getPromotionAuditLogs();
    if (res.success) {
      setAuditLogs(res.logs || []);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getPromotionsData({
      search: searchQuery,
      type: typeFilter,
      status: statusFilter,
      scope: scopeFilter,
      page: currentPage,
      pageSize,
      sortBy,
    }).then((res) => {
      if (!ignore && res.success) {
        setCoupons(res.coupons || []);
        setTotalCoupons(res.totalCoupons || 0);
        setFlashDeals(res.flashDeals || []);
        if (res.analytics) setAnalytics(res.analytics);
      }
    });
    return () => {
      ignore = true;
    };
  }, [searchQuery, typeFilter, statusFilter, scopeFilter, sortBy, currentPage, pageSize]);

  useEffect(() => {
    if (activeTab === "audit") {
      let ignore = false;
      getPromotionAuditLogs().then((res) => {
        if (!ignore && res.success) {
          setAuditLogs(res.logs || []);
        }
      });
      return () => {
        ignore = true;
      };
    }
  }, [activeTab]);

  const showToast = (text?: string, isError = false) => {
    if (text) {
      setToastMsg({ text, isError });
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  // Open Create Modal
  const handleOpenCreate = (isAuto = false) => {
    setEditingCouponId(null);
    setFormCode(isAuto ? "AUTO_880" : "DEAL25");
    setFormTitle(isAuto ? "Sitewide Direct Factory Auto-Discount" : "Factory Direct Special Voucher");
    setFormDescription(isAuto ? "Automatically applied at checkout on eligible orders." : "Save on direct-from-China hardware orders with USDT checkout.");
    setFormDiscountType("percentage");
    setFormDiscountValue(15);
    setFormMaxDiscount("50");
    setFormMinSpend(50);
    setFormScope("all");
    setFormTargetCategories([]);
    setFormFirstOrderOnly(false);
    setFormIsAutomatic(isAuto);
    setFormIsStackable(false);
    setFormUsageLimit("1000");
    setFormPerCustomerLimit(2);
    const now = new Date();
    setFormStartsAt(now.toISOString().slice(0, 16));
    setFormExpiresAt(new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setIsCouponModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c: Coupon) => {
    setEditingCouponId(c.id);
    setFormCode(c.code);
    setFormTitle(c.title || c.code);
    setFormDescription(c.description || "");
    setFormDiscountType((c.discount_type || c.type || "percentage") as CouponType);
    setFormDiscountValue(Number(c.discount_value ?? c.value) || 10);
    setFormMaxDiscount(c.max_discount_amount ? String(c.max_discount_amount) : "");
    setFormMinSpend(Number(c.min_order_amount ?? c.min_spend) || 0);
    setFormScope((c.scope || "all") as PromotionScope);
    setFormTargetCategories(c.target_category_ids || []);
    setFormFirstOrderOnly(Boolean(c.first_order_only));
    setFormIsAutomatic(Boolean(c.is_automatic));
    setFormIsStackable(Boolean(c.is_stackable));
    setFormUsageLimit(c.usage_limit ? String(c.usage_limit) : "");
    setFormPerCustomerLimit(c.per_customer_usage_limit || 1);
    setFormStartsAt(c.starts_at ? new Date(c.starts_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
    setFormExpiresAt(c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : "");
    setIsCouponModalOpen(true);
  };

  // Save Coupon (Create or Update)
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      showToast("Promotion code is required.", true);
      return;
    }

    const payload: PromotionPayload = {
      code: formCode.trim().toUpperCase(),
      title: formTitle,
      description: formDescription,
      discount_type: formDiscountType,
      discount_value: formDiscountValue,
      max_discount_amount: formMaxDiscount ? Number(formMaxDiscount) : null,
      min_order_amount: formMinSpend,
      scope: formScope,
      target_category_ids: formTargetCategories,
      first_order_only: formFirstOrderOnly,
      is_automatic: formIsAutomatic,
      is_stackable: formIsStackable,
      bogo_buy_qty: formBogoBuy,
      bogo_get_qty: formBogoGet,
      bogo_discount_percent: formBogoDiscount,
      usage_limit: formUsageLimit ? Number(formUsageLimit) : null,
      per_customer_usage_limit: formPerCustomerLimit,
      starts_at: new Date(formStartsAt).toISOString(),
      expires_at: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
      is_active: true,
      status: "active",
    };

    startTransition(async () => {
      if (editingCouponId) {
        const res = await updatePromotion(editingCouponId, payload);
        if (res.success) {
          showToast(res.message);
          setIsCouponModalOpen(false);
          loadData();
        } else {
          showToast(res.error || "Failed to update promotion.", true);
        }
      } else {
        const res = await createPromotion(payload);
        if (res.success) {
          showToast(res.message);
          setIsCouponModalOpen(false);
          loadData();
        } else {
          showToast(res.error || "Failed to create promotion.", true);
        }
      }
    });
  };

  // Duplicate Promotion
  const handleDuplicate = async (id: string) => {
    startTransition(async () => {
      const res = await duplicatePromotion(id);
      if (res.success) {
        showToast(res.message);
        loadData();
      } else {
        showToast(res.error || "Failed to duplicate.", true);
      }
    });
  };

  // Toggle Active Status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await togglePromotionStatus(id, !currentStatus);
      if (res.success) {
        showToast(res.message);
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
        );
      } else {
        showToast(res.error || "Failed to toggle status.", true);
      }
    });
  };

  // Delete Promotion
  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) return;
    startTransition(async () => {
      const res = await deletePromotion(id);
      if (res.success) {
        showToast(res.message);
        loadData();
      } else {
        showToast(res.error || "Failed to delete.", true);
      }
    });
  };

  // CSV Export
  const handleExportCsv = async () => {
    const res = await exportPromotionsCsv();
    if (res.success && res.csv) {
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `lennox_promotions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Promotions exported to CSV successfully.");
    } else {
      showToast("Failed to export CSV.", true);
    }
  };

  // Create Flash Deal
  const handleSaveFlash = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createFlashDeal({
        title: flashTitle,
        discountPercentage: flashDiscount,
        startTime: new Date(flashStart).toISOString(),
        endTime: new Date(flashEnd).toISOString(),
        productIds: flashProductIds,
      });

      if (res.success) {
        showToast(res.message);
        setIsFlashModalOpen(false);
        loadData();
      } else {
        showToast(res.error || "Failed to schedule flash deal.", true);
      }
    });
  };

  // Delete Flash Deal
  const handleDeleteFlash = async (id: string) => {
    if (!confirm("Are you sure you want to remove this flash deal?")) return;
    startTransition(async () => {
      const res = await deleteFlashDeal(id);
      if (res.success) {
        showToast(res.message);
        loadData();
      } else {
        showToast(res.error || "Failed to remove flash deal.", true);
      }
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCoupons / pageSize));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-top-2 ${
            toastMsg.isError
              ? "bg-[#E11D48] text-white border-rose-600"
              : "bg-[#16A34A] text-white border-emerald-600"
          }`}
        >
          {toastMsg.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Promotions &amp; Discounts Hub"
        subtitle="Manage dynamic coupons, automatic discounts, BOGO rules, tiered campaigns, and live flash sales."
        badge={{ text: "PROMOTIONS & FLASH OS", variant: "blue" }}
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Promotions" }]}
        actions={[
          {
            label: "Export CSV",
            icon: Download,
            variant: "secondary",
            onClick: handleExportCsv,
          },
          {
            label: "Create Coupon",
            icon: Plus,
            variant: "primary",
            onClick: () => handleOpenCreate(false),
          },
        ]}
      />

      {/* ── 2. KPI Metrics Row (NETIC Pastel Stat Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Promotion Revenue */}
        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Promotion Revenue
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {formatCurrency(analytics.totalRevenue)}
            </span>
            <span className="text-[11px] font-bold text-[#16A34A] block mt-0.5">
              +18.4% this month
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Discounts Granted */}
        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Discounts Granted
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {formatCurrency(analytics.totalDiscounts)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Across all channels
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Total Redemptions */}
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Redemptions
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {analytics.totalRedemptions.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-[#2F65F6] block mt-0.5">
              Verified checkout uses
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Active Campaigns
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {analytics.activeCampaigns} Active
            </span>
            <span className="text-[11px] font-bold text-amber-600 block mt-0.5">
              {flashDeals.length} live flash drops
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Tabbed Navigation (NETIC Pill Tabs) ── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab("coupons")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "coupons"
              ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Coupons &amp; Promo Codes ({totalCoupons})</span>
        </button>

        <button
          onClick={() => setActiveTab("automatic")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "automatic"
              ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Automatic &amp; BOGO Rules</span>
        </button>

        <button
          onClick={() => setActiveTab("flash")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "flash"
              ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Flash Deals &amp; Drops ({flashDeals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "audit"
              ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Admin Audit Logs</span>
        </button>
      </div>
      {/* ── 4. TAB 1: Coupons & Promo Codes ── */}
      {activeTab === "coupons" && (
        <div className="space-y-6">
          {/* Search & Filters Bar */}
          <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <input
                type="text"
                placeholder="Search by code, title, or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="all">All Discount Types</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount ($)</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="bogo">BOGO Deal</option>
                <option value="tiered">Quantity Tiered</option>
              </select>

              <select
                value={scopeFilter}
                onChange={(e) => {
                  setScopeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="all">All Scopes</option>
                <option value="cart">Cart-Level</option>
                <option value="category">Category-Specific</option>
                <option value="product">Product-Specific</option>
                <option value="brand">Brand-Specific</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="paused">Paused Only</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="created_at">Newest First</option>
                <option value="usage">Most Redeemed</option>
                <option value="value_desc">Highest Discount</option>
                <option value="expires">Expiring Soonest</option>
              </select>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Coupon Code &amp; Details</th>
                    <th className="py-3.5 px-4">Discount Type</th>
                    <th className="py-3.5 px-4">Scope &amp; Conditions</th>
                    <th className="py-3.5 px-4">Usage / Cap</th>
                    <th className="py-3.5 px-4">Valid Period</th>
                    <th className="py-3.5 px-4">Active</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  {coupons.map((c) => {
                    const discountType = c.discount_type || c.type || "percentage";
                    const discountVal = Number(c.discount_value ?? c.value) || 0;
                    const maxUses = c.usage_limit ?? c.max_uses;
                    const usedCount = c.used_count ?? c.usage_count ?? 0;
                    const usagePercent = maxUses ? Math.min(100, Math.round((usedCount / maxUses) * 100)) : 0;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Code & Title */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                {c.code}
                              </span>
                              {c.first_order_only && (
                                <span className="bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/40">
                                  1st Order
                                </span>
                              )}
                              {c.is_automatic && (
                                <span className="bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#BBF7D0] dark:border-emerald-900/40">
                                  Auto
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 block truncate max-w-xs">
                              {c.title || c.code}
                            </span>
                            {c.description && (
                              <p className="text-[10px] text-slate-400 truncate max-w-xs font-normal">
                                {c.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Discount Type & Value */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-xs text-[#2F65F6] dark:text-blue-400">
                              {discountType === "percentage" && `${discountVal}% OFF`}
                              {(discountType === "fixed" || discountType === "fixed_amount") && `$${discountVal.toFixed(2)} OFF`}
                              {discountType === "free_shipping" && "FREE SHIPPING"}
                              {discountType === "bogo" && "BOGO DEAL"}
                              {discountType === "tiered" && "TIERED BREAK"}
                            </span>
                            {c.max_discount_amount && (
                              <span className="text-[10px] text-slate-400 block font-normal">
                                Capped at ${Number(c.max_discount_amount).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Scope & Conditions */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize block">
                              Scope: {c.scope || "Sitewide"}
                            </span>
                            {Number(c.min_order_amount ?? c.min_spend) > 0 && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                                Min Spend: ${Number(c.min_order_amount ?? c.min_spend).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Usage / Cap */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 max-w-[120px]">
                            <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              <span>{usedCount}</span>
                              <span className="text-slate-400">/ {maxUses || "∞"}</span>
                            </div>
                            {maxUses && (
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#2F65F6] h-full rounded-full transition-all"
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Valid Period */}
                        <td className="py-3.5 px-4">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                            {c.expires_at ? (
                              <>
                                <span>Expires:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                                  {new Date(c.expires_at).toLocaleDateString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-[#16A34A] dark:text-emerald-400 font-bold">Never Expires</span>
                            )}
                          </div>
                        </td>

                        {/* Active Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c.id, c.is_active)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              c.is_active ? "bg-[#16A34A]" : "bg-slate-200 dark:bg-slate-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                c.is_active ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                              title="Edit Promotion"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(c.id)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id, c.code)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-slate-400 hover:text-[#E11D48] transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Showing page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong> ({totalCoupons} total)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === num
                          ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
                          : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. TAB 2: Automatic & BOGO Rules ── */}
      {activeTab === "automatic" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xs flex items-center justify-between border border-blue-800/40">
            <div className="space-y-1">
              <h3 className="text-base font-bold">Automatic Sourcing Discounts</h3>
              <p className="text-xs text-blue-200 font-normal">
                These rules apply directly at the cart without requiring buyers to enter a promo code.
              </p>
            </div>
            <button
              onClick={() => handleOpenCreate(true)}
              className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-blue-500/25 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Auto Rule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Automatic Free Air Freight</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Applies 100% shipping waiver on all orders exceeding $50 USDT.
              </p>
              <span className="inline-block bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#BBF7D0] dark:border-emerald-900/40">
                Active System Rule
              </span>
            </div>

            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Category Auto-Discounts</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Applies targeted percent discount when products in specific hardware clusters are in cart.
              </p>
              <span className="inline-block bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                Configured via Coupons Scope
              </span>
            </div>

            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">BOGO / Quantity Breaks</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Buy X units, get Y units free or at a discount rate for wholesale volume buyers.
              </p>
              <button
                onClick={() => handleOpenCreate(true)}
                className="text-xs font-bold text-[#2F65F6] hover:underline block cursor-pointer"
              >
                Configure BOGO Rule →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. TAB 3: Flash Deals & Timers ── */}
      {activeTab === "flash" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Live Flash Sourcing Drops</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                Time-limited flash sales with live synchronized countdown clocks across all product pages.
              </p>
            </div>
            <button
              onClick={() => setIsFlashModalOpen(true)}
              className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-blue-500/25 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Flash Drop</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {flashDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-[#FFF0F2] dark:bg-rose-950/60 text-[#E11D48] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#FFE4E8] dark:border-rose-900/40">
                    {deal.discount_percentage}% OFF FLASH DROP
                  </span>
                  <button
                    onClick={() => handleDeleteFlash(deal.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                    title="Remove Flash Deal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{deal.title}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal block">
                    Starts: {new Date(deal.start_time).toLocaleDateString()} — Ends: {new Date(deal.end_time).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Timer:</span>
                  <FlashDealCountdown targetDate={deal.end_time} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 7. TAB 4: Admin Audit Logs ── */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2F65F6]" />
              <span>Promotion Activity &amp; Modification History</span>
            </h3>
            <button
              onClick={loadLogs}
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#2F65F6] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Code / Item</th>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#2F65F6] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded text-[11px] border border-blue-200 dark:border-blue-900/40">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {log.promotion_code || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.admin_email}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 8. CREATE / EDIT PROMOTION MODAL ── */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title={editingCouponId ? `Edit Promotion "${formCode}"` : "Create New Promotion Rule"}
        size="lg"
      >
        <form onSubmit={handleSaveCoupon} className="space-y-5 text-xs text-slate-800 dark:text-slate-200 pt-1">
          {/* Section A: Code & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block text-[11px]">
                Voucher Code *
              </label>
              <input
                type="text"
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="e.g. FACTORY20"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-xs uppercase focus:outline-none focus:border-[#2F65F6] text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block text-[11px]">
                Campaign Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Direct Sourcing 20% Drop"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs focus:outline-none focus:border-[#2F65F6] text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block text-[11px]">
              Description
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Internal notes or customer-facing promo description..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#2F65F6] text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Section B: Discount Type & Value */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
              Discount Calculation &amp; Type
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "percentage", label: "Percentage (%)" },
                { id: "fixed_amount", label: "Fixed Amount ($)" },
                { id: "free_shipping", label: "Free Shipping" },
                { id: "bogo", label: "BOGO Deal" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormDiscountType(t.id as CouponType)}
                  className={`p-2.5 rounded-xl font-bold text-xs border transition-colors text-center cursor-pointer ${
                    formDiscountType === t.id
                      ? "bg-[#2F65F6] text-white border-[#2F65F6] shadow-blue-500/25 shadow-xs"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {formDiscountType === "percentage" ? "Discount Percentage (%)" : "Discount Value ($ USDT)"}
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formDiscountValue}
                  onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 focus:outline-none focus:border-[#2F65F6] text-slate-900 dark:text-slate-100"
                />
              </div>

              {formDiscountType === "percentage" && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Max Discount Cap ($ USDT, optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 focus:outline-none focus:border-[#2F65F6] text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section C: Scope & Minimum Spend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block text-[11px]">
                Promotion Scope
              </label>
              <select
                value={formScope}
                onChange={(e) => setFormScope(e.target.value as PromotionScope)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-[#2F65F6] text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <option value="all">Sitewide (All Products)</option>
                <option value="cart">Cart-Level Spend</option>
                <option value="category">Category-Specific</option>
                <option value="product">Specific Products</option>
                <option value="brand">Brand-Specific</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block text-[11px]">
                Minimum Purchase Amount ($ USDT)
              </label>
              <input
                type="number"
                min={0}
                value={formMinSpend}
                onChange={(e) => setFormMinSpend(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:border-[#2F65F6] text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Section D: Restrictions & Checkboxes */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
              Usage Restrictions &amp; Rules
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formFirstOrderOnly}
                  onChange={(e) => setFormFirstOrderOnly(e.target.checked)}
                  className="rounded text-[#2F65F6] focus:ring-[#2F65F6]"
                />
                <span>1st Order Only</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsAutomatic}
                  onChange={(e) => setFormIsAutomatic(e.target.checked)}
                  className="rounded text-[#2F65F6] focus:ring-[#2F65F6]"
                />
                <span>Automatic (No Code)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsStackable}
                  onChange={(e) => setFormIsStackable(e.target.checked)}
                  className="rounded text-[#2F65F6] focus:ring-[#2F65F6]"
                />
                <span>Stackable</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400 font-bold block">Total Usage Cap</label>
                <input
                  type="number"
                  min={1}
                  value={formUsageLimit}
                  onChange={(e) => setFormUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-400 font-bold block">Max Uses Per Customer</label>
                <input
                  type="number"
                  min={1}
                  value={formPerCustomerLimit}
                  onChange={(e) => setFormPerCustomerLimit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section E: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Start Date</label>
              <input
                type="datetime-local"
                value={formStartsAt}
                onChange={(e) => setFormStartsAt(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Expiry Date (Optional)</label>
              <input
                type="datetime-local"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-bold shadow-blue-500/25 shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isPending ? "Saving..." : editingCouponId ? "Update Promotion" : "Save & Activate"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 9. FLASH DEAL MODAL ── */}
      <Modal
        isOpen={isFlashModalOpen}
        onClose={() => setIsFlashModalOpen(false)}
        title="Schedule Flash Sourcing Deal"
        size="md"
      >
        <form onSubmit={handleSaveFlash} className="space-y-4 text-xs text-slate-800 dark:text-slate-200 pt-1">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block">Flash Deal Title</label>
            <input
              type="text"
              required
              value={flashTitle}
              onChange={(e) => setFlashTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block">Discount Percentage (%)</label>
            <input
              type="number"
              min={5}
              max={90}
              required
              value={flashDiscount}
              onChange={(e) => setFlashDiscount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Start Time</label>
              <input
                type="datetime-local"
                required
                value={flashStart}
                onChange={(e) => setFlashStart(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">End Time</label>
              <input
                type="datetime-local"
                required
                value={flashEnd}
                onChange={(e) => setFlashEnd(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFlashModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-bold shadow-blue-500/25 shadow-xs cursor-pointer transition-colors"
            >
              {isPending ? "Scheduling..." : "Schedule Flash Deal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
