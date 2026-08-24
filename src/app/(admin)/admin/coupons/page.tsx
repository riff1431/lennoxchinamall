"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Percent,
  DollarSign,
  Plane,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Zap,
  Flame,
  Layers,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminDataTable,
  Column,
  FilterOption,
  BulkAction,
} from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { MOCK_COUPONS, PromotionCoupon } from "@/lib/mockData";

export default function AdminCouponsPage() {
  // Main Data State
  const [coupons, setCoupons] = useState<PromotionCoupon[]>(MOCK_COUPONS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<PromotionCoupon | null>(null);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed_amount" | "free_shipping">("percentage");
  const [formValue, setFormValue] = useState<number>(10);
  const [formMinSpend, setFormMinSpend] = useState<number>(50);
  const [formMaxUses, setFormMaxUses] = useState<number>(500);
  const [formDescription, setFormDescription] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<PromotionCoupon | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleteItems, setBulkDeleteItems] = useState<PromotionCoupon[]>([]);

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    triggerToast(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => {
      setCopiedCode((curr) => (curr === code ? null : curr));
    }, 2000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormCode(`DEAL${Math.floor(10 + Math.random() * 90)}`);
    setFormDiscountType("percentage");
    setFormValue(15);
    setFormMinSpend(50);
    setFormMaxUses(500);
    setFormDescription("Seasonal promotional discount on direct factory electronics");
    const defaultExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      .toISOString()
      .split("T")[0];
    setFormExpiresAt(defaultExpiry);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (coupon: PromotionCoupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormDiscountType(coupon.discountType);
    setFormValue(coupon.value);
    setFormMinSpend(coupon.minSpend);
    setFormMaxUses(coupon.maxUses);
    setFormDescription(coupon.description);
    const expDate = coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "";
    setFormExpiresAt(expDate);
    setFormIsActive(coupon.isActive);
    setIsModalOpen(true);
  };

  // Save Coupon (Create or Update)
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedCode = formCode.toUpperCase().trim();
    if (!sanitizedCode) return;

    const expiresIso = formExpiresAt
      ? new Date(formExpiresAt).toISOString()
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    if (editingCoupon) {
      // Update
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? {
                ...c,
                code: sanitizedCode,
                discountType: formDiscountType,
                value: formDiscountType === "free_shipping" ? 0 : Number(formValue),
                minSpend: Number(formMinSpend),
                maxUses: Number(formMaxUses),
                description: formDescription.trim(),
                expiresAt: expiresIso,
                isActive: formIsActive,
              }
            : c
        )
      );
      triggerToast(`Coupon "${sanitizedCode}" updated successfully!`);
    } else {
      // Create
      const newCoupon: PromotionCoupon = {
        id: `coup-${Date.now()}`,
        code: sanitizedCode,
        discountType: formDiscountType,
        value: formDiscountType === "free_shipping" ? 0 : Number(formValue),
        minSpend: Number(formMinSpend),
        maxUses: Number(formMaxUses),
        usageCount: 0,
        description: formDescription.trim(),
        expiresAt: expiresIso,
        isActive: formIsActive,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
      triggerToast(`New coupon "${sanitizedCode}" created!`);
    }

    setIsModalOpen(false);
  };

  // Toggle Active State
  const handleToggleActive = (id: string, currentStatus: boolean, code: string) => {
    const updatedStatus = !currentStatus;
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: updatedStatus } : c))
    );
    triggerToast(
      `Coupon "${code}" ${updatedStatus ? "activated" : "deactivated"}!`
    );
  };

  // Trigger Delete Confirmation
  const handleDeleteClick = (coupon: PromotionCoupon) => {
    setCouponToDelete(coupon);
    setDeleteConfirmOpen(true);
  };

  // Confirm Single Delete
  const handleConfirmDelete = () => {
    if (!couponToDelete) return;
    setCoupons((prev) => prev.filter((c) => c.id !== couponToDelete.id));
    triggerToast(`Coupon "${couponToDelete.code}" deleted permanently.`);
    setCouponToDelete(null);
  };

  // Bulk Actions
  const handleBulkActivate = (selected: PromotionCoupon[]) => {
    const selectedIds = new Set(selected.map((s) => s.id));
    setCoupons((prev) =>
      prev.map((c) => (selectedIds.has(c.id) ? { ...c, isActive: true } : c))
    );
    triggerToast(`${selected.length} coupons activated.`);
  };

  const handleBulkDeactivate = (selected: PromotionCoupon[]) => {
    const selectedIds = new Set(selected.map((s) => s.id));
    setCoupons((prev) =>
      prev.map((c) => (selectedIds.has(c.id) ? { ...c, isActive: false } : c))
    );
    triggerToast(`${selected.length} coupons deactivated.`);
  };

  const handleBulkDeleteClick = (selected: PromotionCoupon[]) => {
    setBulkDeleteItems(selected);
    setBulkDeleteConfirmOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    const idsToDelete = new Set(bulkDeleteItems.map((item) => item.id));
    setCoupons((prev) => prev.filter((c) => !idsToDelete.has(c.id)));
    triggerToast(`${bulkDeleteItems.length} coupons deleted successfully.`);
    setBulkDeleteItems([]);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Code",
      "Discount Type",
      "Value",
      "Min Spend (USDT)",
      "Max Uses",
      "Usage Count",
      "Active",
      "Expires At",
      "Description",
    ];
    const rows = coupons.map((c) => [
      c.id,
      c.code,
      c.discountType,
      c.value,
      c.minSpend,
      c.maxUses,
      c.usageCount,
      c.isActive ? "Active" : "Inactive",
      c.expiresAt,
      `"${c.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lennox_coupons_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Coupons ledger exported to CSV!");
  };

  // Statistics calculation
  const stats = useMemo(() => {
    const total = coupons.length;
    const activeCount = coupons.filter((c) => c.isActive).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + c.usageCount, 0);
    const totalMaxCap = coupons.reduce((sum, c) => sum + c.maxUses, 0);
    const redemptionRate = totalMaxCap > 0 ? Math.round((totalRedemptions / totalMaxCap) * 100) : 0;

    return {
      total,
      activeCount,
      totalRedemptions,
      redemptionRate,
    };
  }, [coupons]);

  // Table Columns Definition
  const columns: Column<PromotionCoupon>[] = [
    {
      header: "Promo Code",
      accessorKey: "code",
      sortable: true,
      className: "min-w-[170px]",
      cell: (row) => {
        const isCopied = copiedCode === row.code;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs tracking-wider shadow-xs flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-emerald-400" />
              <span>{row.code}</span>
            </span>
            <button
              type="button"
              onClick={() => handleCopyCode(row.code)}
              title="Copy promo code"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      header: "Discount Type",
      accessorKey: "discountType",
      sortable: true,
      className: "min-w-[140px]",
      cell: (row) => {
        if (row.discountType === "percentage") {
          return (
            <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md border font-mono text-[10px] px-2.5 py-1 bg-blue-950/60 text-blue-300 border-blue-800/80">
              <Percent className="w-3 h-3 text-blue-400" />
              <span>Percentage</span>
            </span>
          );
        }
        if (row.discountType === "fixed_amount") {
          return (
            <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md border font-mono text-[10px] px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border-emerald-800/80">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>Fixed USDT</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md border font-mono text-[10px] px-2.5 py-1 bg-purple-950/60 text-purple-300 border-purple-800/80">
            <Plane className="w-3 h-3 text-purple-400" />
            <span>Free Shipping</span>
          </span>
        );
      },
    },
    {
      header: "Value",
      accessorKey: "value",
      sortable: true,
      className: "min-w-[120px]",
      cell: (row) => {
        if (row.discountType === "percentage") {
          return (
            <span className="font-bold text-white text-xs font-mono">
              {row.value}% OFF
            </span>
          );
        }
        if (row.discountType === "fixed_amount") {
          return (
            <span className="font-bold text-emerald-400 text-xs font-mono">
              {formatCurrency(row.value)}
            </span>
          );
        }
        return (
          <span className="font-bold text-purple-300 text-xs font-sans">
            100% Free Air
          </span>
        );
      },
    },
    {
      header: "Min Spend",
      accessorKey: "minSpend",
      sortable: true,
      className: "min-w-[110px]",
      cell: (row) => (
        <span className="font-mono text-slate-300 text-xs">
          {row.minSpend > 0 ? formatCurrency(row.minSpend) : "No Min"}
        </span>
      ),
    },
    {
      header: "Max Uses",
      accessorKey: "maxUses",
      sortable: true,
      className: "min-w-[100px]",
      cell: (row) => (
        <span className="font-mono text-slate-400 text-xs">
          {row.maxUses.toLocaleString()} uses
        </span>
      ),
    },
    {
      header: "Usage & Capacity",
      accessorKey: "usageCount",
      sortable: true,
      className: "min-w-[180px]",
      cell: (row) => {
        const pct = Math.min(
          100,
          row.maxUses > 0 ? Math.round((row.usageCount / row.maxUses) * 100) : 0
        );
        const isNearCap = pct >= 80;
        const isFull = pct >= 100;

        return (
          <div className="space-y-1.5 max-w-[160px]">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-200 font-bold">
                {row.usageCount.toLocaleString()}
                <span className="text-slate-500 font-normal"> / {row.maxUses.toLocaleString()}</span>
              </span>
              <span
                className={
                  isFull
                    ? "text-red-400 font-bold"
                    : isNearCap
                    ? "text-amber-400 font-bold"
                    : "text-emerald-400 font-semibold"
                }
              >
                {pct}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull
                    ? "bg-red-500"
                    : isNearCap
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: "Description",
      accessorKey: "description",
      className: "min-w-[200px] max-w-[240px]",
      cell: (row) => (
        <span
          className="text-slate-400 text-xs line-clamp-1"
          title={row.description}
        >
          {row.description || "—"}
        </span>
      ),
    },
    {
      header: "Expires At",
      accessorKey: "expiresAt",
      sortable: true,
      className: "min-w-[120px]",
      cell: (row) => {
        const isExpired = new Date(row.expiresAt).getTime() < Date.now();
        return (
          <div className="space-y-0.5">
            <div
              className={`font-mono text-xs ${
                isExpired ? "text-red-400 font-bold" : "text-slate-300"
              }`}
            >
              {formatDate(row.expiresAt)}
            </div>
            {isExpired && (
              <span className="text-[9px] font-black uppercase text-red-400 tracking-wider">
                Expired
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Active",
      accessorKey: "isActive",
      sortable: true,
      className: "min-w-[90px] text-center",
      cell: (row) => (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => handleToggleActive(row.id, row.isActive, row.code)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              row.isActive ? "bg-emerald-500" : "bg-slate-800"
            }`}
            aria-label={`Toggle active state for ${row.code}`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                row.isActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "min-w-[100px] text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Edit Coupon"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            title="Delete Coupon"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Filter options for dropdowns
  const filters: FilterOption[] = [
    {
      key: "discountType",
      label: "Discount Type",
      options: [
        { value: "percentage", label: "Percentage (%)" },
        { value: "fixed_amount", label: "Fixed Amount (USDT)" },
        { value: "free_shipping", label: "Free Shipping" },
      ],
    },
    {
      key: "isActive",
      label: "Status",
      options: [
        { value: "true", label: "Active Only" },
        { value: "false", label: "Inactive Only" },
      ],
    },
  ];

  // Bulk action options
  const bulkActions: BulkAction<PromotionCoupon>[] = [
    {
      label: "Activate Selected",
      icon: CheckCircle2,
      variant: "success",
      onClick: handleBulkActivate,
    },
    {
      label: "Deactivate Selected",
      icon: AlertCircle,
      variant: "default",
      onClick: handleBulkDeactivate,
    },
    {
      label: "Delete Selected",
      icon: Trash2,
      variant: "danger",
      onClick: handleBulkDeleteClick,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Promotional Coupons & Vouchers"
        subtitle="Manage discount codes, percentage vouchers, and free air shipping campaigns for USDT buyers."
        badge={{ text: "Marketing & Drops", variant: "red" }}
        breadcrumbs={[
          { label: "Marketing", href: "/admin/promotions" },
          { label: "Coupons" },
        ]}
        actions={[
          {
            label: "Create Coupon",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreateModal,
          },
        ]}
      />

      {/* ── 2. KPI Metrics Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Coupons
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats.total}
          </div>
          <p className="text-[10px] text-slate-500">
            Registered campaign promotional codes
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Vouchers
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {stats.activeCount}
          </div>
          <p className="text-[10px] text-emerald-400/80 font-medium">
            Live and redeemable at checkout
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Redemptions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats.totalRedemptions.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">
            Completed orders using coupon discounts
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Redemption Capacity
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {stats.redemptionRate}%
          </div>
          <p className="text-[10px] text-slate-500">
            Aggregate campaign usage rate
          </p>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <AdminDataTable<PromotionCoupon>
        data={coupons}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search coupons by code, type or description..."
        searchFields={["code", "description", "discountType"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="usageCount"
        defaultSortDirection="desc"
        onExportCsv={handleExportCsv}
        emptyTitle="No coupons found"
        emptyDescription="Create your first promotional discount voucher or adjust your filter query."
        emptyAction={{
          label: "Create New Coupon",
          onClick: handleOpenCreateModal,
        }}
      />

      {/* ── 4. Create / Edit CRUD Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-white font-black">
            <Ticket className="w-5 h-5 text-[#FF1028]" />
            <span>{editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Promotion Coupon"}</span>
          </div>
        }
        className="!bg-slate-900 !border-slate-800 !text-white"
        size="lg"
      >
        <form onSubmit={handleSaveCoupon} className="space-y-5 pt-2 font-montserrat">
          {/* Coupon Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Coupon Promo Code *</span>
              <span className="text-[10px] text-slate-500 font-mono">Uppercase alphanumeric</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. VIP25, USDT10, FREEAIR"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-black text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
            />
          </div>

          {/* Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Discount Type *
              </label>
              <select
                value={formDiscountType}
                onChange={(e) =>
                  setFormDiscountType(
                    e.target.value as "percentage" | "fixed_amount" | "free_shipping"
                  )
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors cursor-pointer"
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="fixed_amount">Fixed Amount ($ USDT)</option>
                <option value="free_shipping">100% Free Air Shipping</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                {formDiscountType === "percentage"
                  ? "Discount Percentage (%) *"
                  : formDiscountType === "fixed_amount"
                  ? "Discount Amount (USDT) *"
                  : "Discount Benefit"}
              </label>
              <input
                type="number"
                min="0"
                max={formDiscountType === "percentage" ? 100 : 10000}
                step={formDiscountType === "percentage" ? 1 : 0.5}
                required={formDiscountType !== "free_shipping"}
                disabled={formDiscountType === "free_shipping"}
                value={formDiscountType === "free_shipping" ? 0 : formValue}
                onChange={(e) => setFormValue(parseFloat(e.target.value) || 0)}
                placeholder={formDiscountType === "free_shipping" ? "100% Free Shipping" : "e.g. 15"}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] disabled:opacity-50 transition-colors"
              />
            </div>
          </div>

          {/* Min Spend & Max Uses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Minimum Spend Requirement (USDT)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formMinSpend}
                onChange={(e) => setFormMinSpend(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
              <span className="text-[10px] text-slate-500 block">
                Set to 0 for no cart threshold
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Maximum Redemptions Cap
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
              <span className="text-[10px] text-slate-500 block">
                Total times coupon can be redeemed across all users
              </span>
            </div>
          </div>

          {/* Expiration Date & Active Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Expiration Date *
              </label>
              <input
                type="date"
                required
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Campaign Status
              </label>
              <label className="flex items-center gap-3 p-2.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF1028] focus:ring-0 focus:outline-none bg-slate-900 border-slate-700 accent-[#FF1028] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200">
                  {formIsActive ? "Active & Redeemable" : "Inactive (Draft/Paused)"}
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Promotion Description & Terms
            </label>
            <textarea
              rows={3}
              placeholder="e.g. 15% discount on all factory-direct electronics and drone hardware."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-3 outline-none focus:border-[#FF1028] transition-colors resize-none"
            />
          </div>

          {/* Submit Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors cursor-pointer shadow-md shadow-red-950/40"
            >
              {editingCoupon ? "Update Coupon" : "Publish Coupon"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Single Item Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setCouponToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Promotion Coupon"
        description={
          couponToDelete
            ? `Are you sure you want to permanently delete coupon code "${couponToDelete.code}"? Customers will no longer be able to redeem this voucher at checkout.`
            : "Are you sure you want to delete this coupon?"
        }
        confirmLabel="Delete Permanently"
        variant="danger"
      />

      {/* ── 6. Bulk Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => {
          setBulkDeleteConfirmOpen(false);
          setBulkDeleteItems([]);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Selected Coupons"
        description={`Are you sure you want to permanently delete ${bulkDeleteItems.length} selected coupon(s)? This action cannot be undone.`}
        confirmLabel={`Delete ${bulkDeleteItems.length} Coupons`}
        variant="danger"
      />

      {/* ── 7. Toast Notification Bar ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-400">
          <span>✓ {toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="font-black text-sm hover:opacity-70 cursor-pointer ml-2"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
