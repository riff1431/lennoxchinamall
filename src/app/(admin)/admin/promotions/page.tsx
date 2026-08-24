"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  Zap,
  Sparkles,
  Percent,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Copy,
  Layers,
  Flame,
  TrendingUp,
  Download,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Eye,
  Sliders,
  DollarSign,
  Gift,
  ShieldCheck,
  Truck,
  Users,
  ChevronLeft,
  ChevronRight,
  Activity,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  Coupon,
  FlashDeal,
  PromotionAuditLog,
  PromotionScope,
  CouponType,
} from "@/types/database";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/utils/helpers";
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
  const [formStartsAt, setFormStartsAt] = useState<string>(new Date().toISOString().slice(0, 16));
  const [formExpiresAt, setFormExpiresAt] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  // BOGO / Tiered states
  const [formBogoBuy, setFormBogoBuy] = useState(1);
  const [formBogoGet, setFormBogoGet] = useState(1);
  const [formBogoDiscount, setFormBogoDiscount] = useState(100);

  // Flash Deal Form State
  const [flashTitle, setFlashTitle] = useState("Shenzhen Tech Expo 24h Drop");
  const [flashDiscount, setFlashDiscount] = useState(25);
  const [flashStart, setFlashStart] = useState(new Date().toISOString().slice(0, 16));
  const [flashEnd, setFlashEnd] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [flashProductIds, setFlashProductIds] = useState<string[]>([]);

  // Load Data
  const loadData = async () => {
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
  };

  const loadLogs = async () => {
    const res = await getPromotionAuditLogs();
    if (res.success) {
      setAuditLogs(res.logs || []);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, typeFilter, statusFilter, scopeFilter, sortBy, currentPage]);

  useEffect(() => {
    if (activeTab === "audit") {
      loadLogs();
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
    setFormCode(isAuto ? `AUTO_${Math.floor(100 + Math.random() * 900)}` : `DEAL${Math.floor(10 + Math.random() * 90)}`);
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
    setFormStartsAt(new Date().toISOString().slice(0, 16));
    setFormExpiresAt(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
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
    <div className="space-y-8 pb-20 font-montserrat">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-black flex items-center gap-2 border animate-in slide-in-from-top-2 ${
            toastMsg.isError
              ? "bg-red-500 text-white border-red-600"
              : "bg-[#00143D] text-white border-[#002366]"
          }`}
        >
          {toastMsg.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4 text-[#10B981]" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FF1028]/10 text-[#FF1028]">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#00143D]">
              Promotions & Discounts Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            Manage dynamic coupons, automatic discounts, BOGO rules, tiered campaigns, and live flash sales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleOpenCreate(false)}
            className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI Metrics Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Promotion Revenue
            </span>
            <span className="text-lg font-black text-[#00143D] price-tag">
              {formatCurrency(analytics.totalRevenue)}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
              +18.4% this month
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF1028] flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Discounts Granted
            </span>
            <span className="text-lg font-black text-[#00143D] price-tag">
              {formatCurrency(analytics.totalDiscounts)}
            </span>
            <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
              Across all channels
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Redemptions
            </span>
            <span className="text-lg font-black text-[#00143D]">
              {analytics.totalRedemptions.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-blue-600 block mt-0.5">
              Verified checkout uses
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Active Campaigns
            </span>
            <span className="text-lg font-black text-[#00143D]">
              {analytics.activeCampaigns} Active
            </span>
            <span className="text-[10px] font-bold text-amber-600 block mt-0.5">
              {flashDeals.length} live flash drops
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Tabbed Navigation ── */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-black">
        <button
          onClick={() => setActiveTab("coupons")}
          className={`pb-3 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "coupons"
              ? "text-[#FF1028] border-b-2 border-[#FF1028]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Coupons & Promo Codes ({totalCoupons})</span>
        </button>

        <button
          onClick={() => setActiveTab("automatic")}
          className={`pb-3 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "automatic"
              ? "text-[#FF1028] border-b-2 border-[#FF1028]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Automatic & BOGO Rules</span>
        </button>

        <button
          onClick={() => setActiveTab("flash")}
          className={`pb-3 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "flash"
              ? "text-[#FF1028] border-b-2 border-[#FF1028]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Flash Deals & Drops ({flashDeals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "audit"
              ? "text-[#FF1028] border-b-2 border-[#FF1028]"
              : "text-slate-500 hover:text-slate-800"
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
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <input
                type="text"
                placeholder="Search by code, title, or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00143D]"
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
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none cursor-pointer"
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
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none cursor-pointer"
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
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="paused">Paused Only</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="created_at">Newest First</option>
                <option value="usage">Most Redeemed</option>
                <option value="value_desc">Highest Discount</option>
                <option value="expires">Expiring Soonest</option>
              </select>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Coupon Code & Details</th>
                    <th className="py-3.5 px-4">Discount Type</th>
                    <th className="py-3.5 px-4">Scope & Conditions</th>
                    <th className="py-3.5 px-4">Usage / Cap</th>
                    <th className="py-3.5 px-4">Valid Period</th>
                    <th className="py-3.5 px-4">Active</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {coupons.map((c) => {
                    const discountType = c.discount_type || c.type || "percentage";
                    const discountVal = Number(c.discount_value ?? c.value) || 0;
                    const maxUses = c.usage_limit ?? c.max_uses;
                    const usedCount = c.used_count ?? c.usage_count ?? 0;
                    const usagePercent = maxUses ? Math.min(100, Math.round((usedCount / maxUses) * 100)) : 0;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Code & Title */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-xs text-[#00143D] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                {c.code}
                              </span>
                              {c.first_order_only && (
                                <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded">
                                  1st Order
                                </span>
                              )}
                              {c.is_automatic && (
                                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded">
                                  Auto
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 block truncate max-w-xs">
                              {c.title || c.code}
                            </span>
                            {c.description && (
                              <p className="text-[10px] text-slate-400 truncate max-w-xs font-medium">
                                {c.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Discount Type & Value */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-xs text-[#FF1028] price-tag">
                              {discountType === "percentage" && `${discountVal}% OFF`}
                              {(discountType === "fixed" || discountType === "fixed_amount") && `$${discountVal.toFixed(2)} OFF`}
                              {discountType === "free_shipping" && "FREE SHIPPING"}
                              {discountType === "bogo" && "BOGO DEAL"}
                              {discountType === "tiered" && "TIERED BREAK"}
                            </span>
                            {c.max_discount_amount && (
                              <span className="text-[10px] text-slate-400 block">
                                Capped at ${Number(c.max_discount_amount).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Scope & Conditions */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            <span className="font-bold text-slate-800 capitalize block">
                              Scope: {c.scope || "Sitewide"}
                            </span>
                            {Number(c.min_order_amount ?? c.min_spend) > 0 && (
                              <span className="text-[10px] text-slate-500 block">
                                Min Spend: ${Number(c.min_order_amount ?? c.min_spend).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Usage / Cap */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 max-w-[120px]">
                            <div className="flex justify-between text-[11px] font-bold text-slate-700">
                              <span>{usedCount}</span>
                              <span className="text-slate-400">/ {maxUses || "∞"}</span>
                            </div>
                            {maxUses && (
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#00143D] h-full rounded-full transition-all"
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Valid Period */}
                        <td className="py-3.5 px-4">
                          <div className="text-[10px] text-slate-500 space-y-0.5">
                            {c.expires_at ? (
                              <>
                                <span>Expires:</span>
                                <span className="font-bold text-slate-700 block">
                                  {new Date(c.expires_at).toLocaleDateString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-emerald-600 font-bold">Never Expires</span>
                            )}
                          </div>
                        </td>

                        {/* Active Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c.id, c.is_active)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              c.is_active ? "bg-[#10B981]" : "bg-slate-200"
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
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                              title="Edit Promotion"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(c.id)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id, c.code)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors"
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
              <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-bold">
                  Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCoupons} total)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                        currentPage === num
                          ? "bg-[#00143D] text-white"
                          : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
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
          <div className="bg-gradient-to-r from-[#00143D] to-[#002366] text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black">Automatic Sourcing Discounts</h3>
              <p className="text-xs text-slate-300">
                These rules apply directly at the cart without requiring buyers to enter a promo code.
              </p>
            </div>
            <button
              onClick={() => handleOpenCreate(true)}
              className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Auto Rule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-[#00143D]">Automatic Free Air Freight</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Applies 100% shipping waiver on all orders exceeding $50 USDT.
              </p>
              <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md">
                Active System Rule
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-[#00143D]">Category Auto-Discounts</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Applies targeted percent discount when products in specific hardware clusters are in cart.
              </p>
              <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md">
                Configured via Coupons Scope
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-[#00143D]">BOGO / Quantity Breaks</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Buy X units, get Y units free or at a discount rate for wholesale volume buyers.
              </p>
              <button
                onClick={() => handleOpenCreate(true)}
                className="text-xs font-bold text-[#FF1028] hover:underline block"
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-[#00143D] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#FF1028]" />
                <span>Live Flash Sourcing Drops</span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Time-limited flash sales with live synchronized countdown clocks across all product pages.
              </p>
            </div>
            <button
              onClick={() => setIsFlashModalOpen(true)}
              className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Flash Drop</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flashDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-gradient-to-br from-[#00143D] to-[#002366] text-white p-6 rounded-3xl shadow-md space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {deal.discount_percentage}% OFF FLASH DROP
                  </span>
                  <button
                    onClick={() => handleDeleteFlash(deal.id)}
                    className="text-white/60 hover:text-white p-1"
                    title="Remove Flash Deal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white">{deal.title}</h4>
                  <span className="text-xs text-slate-300 font-semibold block">
                    Starts: {new Date(deal.start_time).toLocaleDateString()} — Ends: {new Date(deal.end_time).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Live Timer:</span>
                  <FlashDealCountdown targetDate={deal.end_time} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 7. TAB 4: Admin Audit Logs ── */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-[#00143D] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF1028]" />
              <span>Promotion Activity & Modification History</span>
            </h3>
            <button
              onClick={loadLogs}
              className="text-xs font-bold text-slate-600 hover:text-[#00143D] flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Code / Item</th>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#00143D] bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.promotion_code || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.admin_email}</td>
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
        <form onSubmit={handleSaveCoupon} className="p-6 space-y-6 text-xs font-montserrat">
          {/* Section A: Code & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-black text-[#00143D] uppercase tracking-wider block text-[11px]">
                Voucher Code *
              </label>
              <input
                type="text"
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="e.g. FACTORY20"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-black text-xs uppercase focus:outline-none focus:border-[#00143D]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-black text-[#00143D] uppercase tracking-wider block text-[11px]">
                Campaign Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Direct Sourcing 20% Drop"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-xs focus:outline-none focus:border-[#00143D]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-black text-[#00143D] uppercase tracking-wider block text-[11px]">
              Description
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Internal notes or customer-facing promo description..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#00143D]"
            />
          </div>

          {/* Section B: Discount Type & Value */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="font-black text-[#00143D] uppercase text-[11px]">
              Discount Calculation & Type
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
                  className={`p-2.5 rounded-xl font-bold text-xs border transition-colors text-center ${
                    formDiscountType === t.id
                      ? "bg-[#00143D] text-white border-[#00143D]"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  {formDiscountType === "percentage" ? "Discount Percentage (%)" : "Discount Value ($ USDT)"}
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formDiscountValue}
                  onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-black bg-white focus:outline-none focus:border-[#00143D]"
                />
              </div>

              {formDiscountType === "percentage" && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Max Discount Cap ($ USDT, optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-[#00143D]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section C: Scope & Minimum Spend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-black text-[#00143D] uppercase tracking-wider block text-[11px]">
                Promotion Scope
              </label>
              <select
                value={formScope}
                onChange={(e) => setFormScope(e.target.value as PromotionScope)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-[#00143D]"
              >
                <option value="all">Sitewide (All Products)</option>
                <option value="cart">Cart-Level Spend</option>
                <option value="category">Category-Specific</option>
                <option value="product">Specific Products</option>
                <option value="brand">Brand-Specific</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-black text-[#00143D] uppercase tracking-wider block text-[11px]">
                Minimum Purchase Amount ($ USDT)
              </label>
              <input
                type="number"
                min={0}
                value={formMinSpend}
                onChange={(e) => setFormMinSpend(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-[#00143D]"
              />
            </div>
          </div>

          {/* Section D: Restrictions & Checkboxes */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-[#00143D] uppercase text-[11px]">
              Usage Restrictions & Rules
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formFirstOrderOnly}
                  onChange={(e) => setFormFirstOrderOnly(e.target.checked)}
                  className="rounded text-[#FF1028] focus:ring-[#FF1028]"
                />
                <span>1st Order Only</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsAutomatic}
                  onChange={(e) => setFormIsAutomatic(e.target.checked)}
                  className="rounded text-[#FF1028] focus:ring-[#FF1028]"
                />
                <span>Automatic (No Code)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsStackable}
                  onChange={(e) => setFormIsStackable(e.target.checked)}
                  className="rounded text-[#FF1028] focus:ring-[#FF1028]"
                />
                <span>Stackable</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-slate-600 font-bold block">Total Usage Cap</label>
                <input
                  type="number"
                  min={1}
                  value={formUsageLimit}
                  onChange={(e) => setFormUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold block">Max Uses Per Customer</label>
                <input
                  type="number"
                  min={1}
                  value={formPerCustomerLimit}
                  onChange={(e) => setFormPerCustomerLimit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section E: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Start Date</label>
              <input
                type="datetime-local"
                value={formStartsAt}
                onChange={(e) => setFormStartsAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Expiry Date (Optional)</label>
              <input
                type="datetime-local"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-6 py-2.5 rounded-xl font-black shadow-md disabled:opacity-50"
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
        <form onSubmit={handleSaveFlash} className="p-6 space-y-4 text-xs font-montserrat">
          <div className="space-y-1.5">
            <label className="font-black text-[#00143D] uppercase block">Flash Deal Title</label>
            <input
              type="text"
              required
              value={flashTitle}
              onChange={(e) => setFlashTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-black text-[#00143D] uppercase block">Discount Percentage (%)</label>
            <input
              type="number"
              min={5}
              max={90}
              required
              value={flashDiscount}
              onChange={(e) => setFlashDiscount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Start Time</label>
              <input
                type="datetime-local"
                required
                value={flashStart}
                onChange={(e) => setFlashStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">End Time</label>
              <input
                type="datetime-local"
                required
                value={flashEnd}
                onChange={(e) => setFlashEnd(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsFlashModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#FF1028] text-white px-6 py-2.5 rounded-xl font-black shadow-md"
            >
              {isPending ? "Scheduling..." : "Schedule Flash Deal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
