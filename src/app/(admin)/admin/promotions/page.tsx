"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import {
  Tag,
  Sparkles,
  Plus,
  Copy,
  Layers,
  Flame,
  TrendingUp,
  Download,
  DollarSign,
  Gift,
  Truck,
  Activity,
  Trash2,
} from "lucide-react";
import {
  Coupon,
  FlashDeal,
  PromotionAuditLog,
  PromotionScope,
  CouponType,
} from "@/types/database";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { SlideOver } from "@/components/admin/SlideOver";
import { Modal } from "@/components/ui/Modal";
import {
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminFormSection,
} from "@/components/admin/forms";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatCurrency, formatDate, cn } from "@/utils/helpers";
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
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<"coupons" | "automatic" | "flash" | "audit">("coupons");
  const [isPending, startTransition] = useTransition();

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
  const [isLoading, setIsLoading] = useState(false);

  // Modal / SlideOver States
  const [isCouponSlideOverOpen, setIsCouponSlideOverOpen] = useState(false);
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
  const [formTargetCategories] = useState<string[]>([]);
  const [formFirstOrderOnly, setFormFirstOrderOnly] = useState(false);
  const [formIsAutomatic, setFormIsAutomatic] = useState(false);
  const [formIsStackable, setFormIsStackable] = useState(false);
  const [formUsageLimit, setFormUsageLimit] = useState<string>("500");
  const [formPerCustomerLimit, setFormPerCustomerLimit] = useState<number>(1);
  const [formStartsAt, setFormStartsAt] = useState<string>("2026-08-24T12:00");
  const [formExpiresAt, setFormExpiresAt] = useState<string>("2026-09-24T12:00");

  // Flash Deal Form State
  const [flashTitle, setFlashTitle] = useState("");
  const [flashDiscount, setFlashDiscount] = useState(25);
  const [flashStart, setFlashStart] = useState("");
  const [flashEnd, setFlashEnd] = useState("");

  const loadData = useCallback(() => {
    setIsLoading(true);
    getPromotionsData({
      page: 1,
      pageSize: 50,
    })
      .then((res) => {
        if (res.success) {
          setCoupons(res.coupons);
          setTotalCoupons(res.totalCoupons || 0);
          setFlashDeals(res.flashDeals);
          setAnalytics(res.analytics);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const loadLogs = useCallback(() => {
    getPromotionAuditLogs().then((res) => {
      if (res.success) {
        setAuditLogs(res.logs);
      }
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
      loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData, loadLogs]);

  // Open Create Modal
  const handleOpenCreate = (isAuto = false) => {
    setEditingCouponId(null);
    setFormCode(isAuto ? `AUTO-${Math.floor(1000 + Math.random() * 9000)}` : "SAVE10");
    setFormTitle("");
    setFormDescription("");
    setFormDiscountType("percentage");
    setFormDiscountValue(10);
    setFormMaxDiscount("");
    setFormMinSpend(0);
    setFormScope("all");
    setFormFirstOrderOnly(false);
    setFormIsAutomatic(isAuto);
    setFormIsStackable(false);
    setFormUsageLimit("500");
    setFormPerCustomerLimit(2);
    const now = new Date();
    setFormStartsAt(now.toISOString().slice(0, 16));
    setFormExpiresAt(new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setIsCouponSlideOverOpen(true);
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
    setFormFirstOrderOnly(Boolean(c.first_order_only));
    setFormIsAutomatic(Boolean(c.is_automatic));
    setFormIsStackable(Boolean(c.is_stackable));
    setFormUsageLimit(c.usage_limit ? String(c.usage_limit) : "");
    setFormPerCustomerLimit(c.per_customer_usage_limit || 1);
    setFormStartsAt(c.starts_at ? new Date(c.starts_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
    setFormExpiresAt(c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : "");
    setIsCouponSlideOverOpen(true);
  };

  // Save Coupon
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      toast.warning("Promotion code is required.");
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
          toast.success(res.message || "Promotion updated.");
          setIsCouponSlideOverOpen(false);
          loadData();
        } else {
          toast.error(res.error || "Failed to update promotion.");
        }
      } else {
        const res = await createPromotion(payload);
        if (res.success) {
          toast.success(res.message || "Promotion created.");
          setIsCouponSlideOverOpen(false);
          loadData();
        } else {
          toast.error(res.error || "Failed to create promotion.");
        }
      }
    });
  };

  const handleDuplicate = async (id: string) => {
    startTransition(async () => {
      const res = await duplicatePromotion(id);
      if (res.success) {
        toast.success(res.message || "Promotion duplicated.");
        loadData();
      } else {
        toast.error(res.error || "Failed to duplicate.");
      }
    });
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await togglePromotionStatus(id, !currentStatus);
      if (res.success) {
        toast.success(res.message || "Status updated.");
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
        );
      } else {
        toast.error(res.error || "Failed to toggle status.");
      }
    });
  };

  const handleDelete = async (id: string, code: string) => {
    startTransition(async () => {
      const res = await deletePromotion(id);
      if (res.success) {
        toast.success(`Promotion "${code}" deleted.`);
        loadData();
      } else {
        toast.error(res.error || "Failed to delete.");
      }
    });
  };

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
      toast.success("Promotions exported to CSV.");
    }
  };

  const handleSaveFlash = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createFlashDeal({
        title: flashTitle,
        discountPercentage: flashDiscount,
        startTime: flashStart,
        endTime: flashEnd,
      });
      if (res.success) {
        toast.success("Flash sourcing deal scheduled!");
        setIsFlashModalOpen(false);
        setFlashTitle("");
        loadData();
      } else {
        toast.error(res.error || "Failed to schedule flash deal.");
      }
    });
  };

  const handleDeleteFlash = async (id: string) => {
    startTransition(async () => {
      const res = await deleteFlashDeal(id);
      if (res.success) {
        toast.success("Flash deal removed.");
        loadData();
      }
    });
  };

  // Columns for Coupons
  const couponColumns: Column<Coupon>[] = [
    {
      header: "Code & Campaign",
      accessorKey: "code",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-slate-900 dark:text-white text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {row.code}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(row.code);
                toast.info(`Copied "${row.code}" to clipboard.`);
              }}
              className="text-slate-400 hover:text-[#2F65F6] p-0.5 cursor-pointer"
              title="Copy Code"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5 font-heading">
            {row.title || row.description || "Promotional Voucher"}
          </span>
        </div>
      ),
    },
    {
      header: "Discount",
      accessorKey: "discount_value",
      sortable: true,
      cell: (row) => {
        const type = row.discount_type || row.type || "percentage";
        const val = Number(row.discount_value ?? row.value) || 0;
        return (
          <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-xs">
            {type === "percentage" ? `${val}% OFF` : `$${val.toFixed(2)} OFF`}
          </span>
        );
      },
    },
    {
      header: "Scope",
      accessorKey: "scope",
      cell: (row) => (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#2F65F6] border border-blue-200 dark:border-blue-900/40">
          {row.scope || "Sitewide"}
        </span>
      ),
    },
    {
      header: "Redemptions",
      cell: (row) => {
        const used = row.used_count ?? row.usage_count ?? 0;
        const limit = row.usage_limit ?? row.max_uses ?? "∞";
        return (
          <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {used} / {limit} uses
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: (row) => {
        const tone: BadgeTone = row.is_active ? "emerald" : "slate";
        return <StatusBadge status={row.is_active ? "active" : "paused"} tone={tone} />;
      },
    },
    {
      header: "Actions",
      className: "text-right w-20",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end">
          <AdminActionMenu
            itemTitle={`coupon "${row.code}"`}
            onEdit={() => handleOpenEdit(row)}
            onDuplicate={() => handleDuplicate(row.id)}
            onDelete={() => handleDelete(row.id, row.code)}
            customActions={[
              {
                label: row.is_active ? "Pause Promotion" : "Activate Promotion",
                onClick: () => handleToggleStatus(row.id, row.is_active),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  // Columns for Audit Logs
  const auditColumns: Column<PromotionAuditLog>[] = [
    {
      header: "Action",
      accessorKey: "action",
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-[#2F65F6] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded text-[11px] border border-blue-200 dark:border-blue-900/40">
          {row.action}
        </span>
      ),
    },
    {
      header: "Voucher Code",
      accessorKey: "promotion_code",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
          {row.promotion_code || "—"}
        </span>
      ),
    },
    {
      header: "Admin Operator",
      accessorKey: "admin_email",
      cell: (row) => (
        <span className="text-slate-600 dark:text-slate-400 text-xs">{row.admin_email}</span>
      ),
    },
    {
      header: "Timestamp",
      accessorKey: "created_at",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-400 font-mono text-[11px]">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  const tableFilters: FilterOption[] = [
    {
      key: "is_active",
      label: "Campaign State",
      options: [
        { value: "true", label: "Active Only" },
        { value: "false", label: "Paused Only" },
      ],
    },
  ];

  const bulkActions: BulkAction<Coupon>[] = [
    {
      label: "Bulk Delete",
      icon: Trash2,
      variant: "danger",
      requiresConfirmation: true,
      confirmTitle: "Bulk Delete Promotions",
      confirmMessage: "Permanently delete the selected promotion vouchers?",
      onClick: (selected) => {
        selected.forEach((c) => handleDelete(c.id, c.code));
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Header ── */}
      <AdminPageHeader
        title="Promotions & Sourcing Deals"
        subtitle="Manage promotional discount codes, automatic cart rules, and synchronized flash sale timers."
        badge={{ text: `${analytics.activeCampaigns} Active Campaigns`, variant: "emerald" }}
        breadcrumbs={[
          { label: "Marketing & Deals", href: "/admin/promotions" },
          { label: "Promotions" },
        ]}
        actions={[
          {
            label: "Export CSV",
            icon: Download,
            variant: "secondary",
            onClick: handleExportCsv,
          },
          {
            label: "Create Promotion",
            icon: Plus,
            variant: "primary",
            onClick: () => handleOpenCreate(false),
          },
        ]}
      />

      {/* ── 2. KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Influenced Revenue
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {formatCurrency(analytics.totalRevenue)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Redemptions
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {analytics.totalRedemptions} Uses
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Discounts Granted
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {formatCurrency(analytics.totalDiscounts)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Gift className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Active Flash Drops
            </span>
            <span className="text-xl font-black text-[#FF1028] font-mono mt-0.5 block">
              {flashDeals.length} Drops
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FF1028] text-white flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("coupons")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "coupons"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Voucher Codes ({totalCoupons})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("automatic")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "automatic"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Automatic Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flash")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "flash"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Flash Deals ({flashDeals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "audit"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit Ledger</span>
        </button>
      </div>

      {/* ── 4. Main Tab Tables ── */}
      {activeTab === "coupons" && (
        <AdminDataTable<Coupon>
          data={coupons}
          columns={couponColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search coupons by code, title, or description..."
          searchFields={["code", "title", "description"]}
          filters={tableFilters}
          bulkActions={bulkActions}
          defaultSortKey="created_at"
          defaultSortDirection="desc"
          isLoading={isLoading}
          emptyTitle="No coupons found"
          emptyDescription="Create your first promotional discount voucher."
          emptyAction={{
            label: "Create Coupon",
            onClick: () => handleOpenCreate(false),
          }}
          onExportCsv={handleExportCsv}
        />
      )}

      {activeTab === "automatic" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Automatic Free Air Freight
              </h4>
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
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Department Auto-Discounts
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Applies targeted percent discount when hardware in specific clusters is added to cart.
              </p>
              <button
                type="button"
                onClick={() => handleOpenCreate(true)}
                className="text-xs font-bold text-[#2F65F6] hover:underline block cursor-pointer"
              >
                Configure Rule →
              </button>
            </div>

            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                BOGO / Wholesale Quantity Breaks
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Buy X units, get Y units free or at a bulk discount rate for volume buyers.
              </p>
              <button
                type="button"
                onClick={() => handleOpenCreate(true)}
                className="text-xs font-bold text-[#2F65F6] hover:underline block cursor-pointer"
              >
                Configure BOGO Rule →
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "flash" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Live Flash Sourcing Drops</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                Time-limited flash sales with synchronized countdown clocks across all product pages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFlashModalOpen(true)}
              className="bg-[#00143D] hover:bg-[#002266] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-heading uppercase"
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
                  <span className="bg-[#FFF0F2] dark:bg-rose-950/60 text-[#FF1028] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#FFE4E8] dark:border-rose-900/40 font-mono">
                    {deal.discount_percentage}% OFF FLASH DROP
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteFlash(deal.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                    title="Remove Flash Deal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                    {deal.title}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block">
                    Starts: {new Date(deal.start_time).toLocaleDateString()} — Ends: {new Date(deal.end_time).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-heading">
                    Live Timer:
                  </span>
                  <FlashDealCountdown targetDate={deal.end_time} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <AdminDataTable<PromotionAuditLog>
          data={auditLogs}
          columns={auditColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search audit trail by code or operator..."
          searchFields={["promotion_code", "admin_email", "action"]}
          defaultSortKey="created_at"
          defaultSortDirection="desc"
          emptyTitle="Audit ledger is clean"
          emptyDescription="Promotion modifications and voucher activations will be recorded here."
        />
      )}

      {/* ── 5. Slide-Over: Create / Edit Promotion ── */}
      <SlideOver
        isOpen={isCouponSlideOverOpen}
        onClose={() => setIsCouponSlideOverOpen(false)}
        title={editingCouponId ? `Edit Promotion "${formCode}"` : "Create Promotion Voucher"}
        description="Configure discount calculation, scope, spend limits, and activation dates."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsCouponSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSaveCoupon}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Saving..." : editingCouponId ? "Update Promotion" : "Save & Activate"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveCoupon} className="space-y-5">
          <AdminFormSection title="Voucher Identification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="Voucher Code"
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="e.g. FACTORY20"
              />
              <AdminInput
                label="Campaign Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Direct Sourcing 20% Drop"
              />
            </div>
            <AdminTextarea
              label="Description &amp; Terms"
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Internal notes or customer-facing promo description..."
            />
          </AdminFormSection>

          <AdminFormSection title="Discount Calculation">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminSelect
                label="Discount Type"
                value={formDiscountType}
                onChange={(e) => setFormDiscountType(e.target.value as CouponType)}
                options={[
                  { value: "percentage", label: "Percentage (%)" },
                  { value: "fixed_amount", label: "Fixed Amount ($ USDT)" },
                  { value: "free_shipping", label: "Free Shipping" },
                  { value: "bogo", label: "BOGO Deal" },
                ]}
              />
              <AdminInput
                label={formDiscountType === "percentage" ? "Percentage (%)" : "Amount ($ USDT)"}
                type="number"
                min={0}
                step="0.01"
                value={formDiscountValue}
                onChange={(e) => setFormDiscountValue(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="Min Purchase Amount ($ USDT)"
                type="number"
                min={0}
                value={formMinSpend}
                onChange={(e) => setFormMinSpend(Number(e.target.value))}
              />
              <AdminSelect
                label="Promotion Scope"
                value={formScope}
                onChange={(e) => setFormScope(e.target.value as PromotionScope)}
                options={[
                  { value: "all", label: "Sitewide (All Products)" },
                  { value: "cart", label: "Cart-Level Spend" },
                  { value: "category", label: "Category-Specific" },
                  { value: "product", label: "Specific Products" },
                  { value: "brand", label: "Brand-Specific" },
                ]}
              />
            </div>
          </AdminFormSection>

          <AdminFormSection title="Usage Caps &amp; Restrictions">
            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label="Total Usage Cap"
                type="number"
                min={1}
                value={formUsageLimit}
                onChange={(e) => setFormUsageLimit(e.target.value)}
                placeholder="Unlimited"
              />
              <AdminInput
                label="Max Uses Per Customer"
                type="number"
                min={1}
                value={formPerCustomerLimit}
                onChange={(e) => setFormPerCustomerLimit(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={formFirstOrderOnly}
                  onChange={(e) => setFormFirstOrderOnly(e.target.checked)}
                  className="rounded text-[#2F65F6]"
                />
                <span>1st Order Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={formIsAutomatic}
                  onChange={(e) => setFormIsAutomatic(e.target.checked)}
                  className="rounded text-[#2F65F6]"
                />
                <span>Automatic (No Code Required)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={formIsStackable}
                  onChange={(e) => setFormIsStackable(e.target.checked)}
                  className="rounded text-[#2F65F6]"
                />
                <span>Stackable with other discounts</span>
              </label>
            </div>
          </AdminFormSection>
        </form>
      </SlideOver>

      {/* ── 6. Flash Deal Modal ── */}
      <Modal
        isOpen={isFlashModalOpen}
        onClose={() => setIsFlashModalOpen(false)}
        title="Schedule Flash Sourcing Deal"
        size="md"
      >
        <form onSubmit={handleSaveFlash} className="space-y-4 pt-1 text-xs">
          <AdminInput
            label="Flash Deal Title"
            required
            value={flashTitle}
            onChange={(e) => setFlashTitle(e.target.value)}
            placeholder="e.g. 48-Hour Quadcopter Drop"
          />

          <AdminInput
            label="Discount Percentage (%)"
            type="number"
            min={5}
            max={90}
            required
            value={flashDiscount}
            onChange={(e) => setFlashDiscount(Number(e.target.value))}
          />

          <div className="grid grid-cols-2 gap-3">
            <AdminInput
              label="Start Time"
              type="datetime-local"
              required
              value={flashStart}
              onChange={(e) => setFlashStart(e.target.value)}
            />
            <AdminInput
              label="End Time"
              type="datetime-local"
              required
              value={flashEnd}
              onChange={(e) => setFlashEnd(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFlashModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] shadow-xs cursor-pointer font-heading uppercase"
            >
              {isPending ? "Scheduling..." : "Schedule Flash Deal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
