"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Flame,
  Tag,
  Percent,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Calendar,
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Timer,
  Check,
  RotateCcw,
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
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  calcDiscount,
  timeRemaining,
  cn,
} from "@/utils/helpers";
import { FlashDealCountdown } from "@/components/common/FlashDealCountdown";
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
} from "@/lib/mockData";
import { Product } from "@/types/database";

export default function AdminFlashDealsPage() {
  // Main Products State (Flash Deal Items)
  const [allProducts, setAllProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Flash Deals filtered list (products with is_flash_deal = true)
  const flashProducts = useMemo(() => {
    return allProducts.filter((p) => p.is_flash_deal);
  }, [allProducts]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [formBasePrice, setFormBasePrice] = useState<number>(89.99);
  const [formComparePrice, setFormComparePrice] = useState<number>(159.99);
  const [formEndsAt, setFormEndsAt] = useState<string>("");
  const [formIsFlashDeal, setFormIsFlashDeal] = useState<boolean>(true);
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);

  // Delete / End Deal Confirmation State
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [productToEnd, setProductToEnd] = useState<Product | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"end" | "extend">("end");
  const [bulkSelectedProducts, setBulkSelectedProducts] = useState<Product[]>([]);

  // Category Lookup Map
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    MOCK_CATEGORIES.forEach((cat) => {
      map.set(cat.id, cat.name);
    });
    return map;
  }, []);

  // Helper to format ISO date to input datetime-local value
  const toDateTimeLocalValue = (isoString?: string | null) => {
    if (!isoString) {
      const defaultDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      return defaultDate.toISOString().slice(0, 16);
    }
    const d = new Date(isoString);
    const offset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offset);
    return local.toISOString().slice(0, 16);
  };

  // Trigger Toast Helper
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Open Create / Add Flash Deal Modal
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    const nonFlash = allProducts.find((p) => !p.is_flash_deal) || allProducts[0];
    const initialProd = nonFlash || allProducts[0];

    setSelectedProductId(initialProd.id);
    setFormBasePrice(initialProd.base_price);
    setFormComparePrice(initialProd.compare_at_price || initialProd.base_price * 1.6);
    setFormEndsAt(toDateTimeLocalValue(new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()));
    setFormIsFlashDeal(true);
    setFormIsFeatured(initialProd.is_featured);
    setIsModalOpen(true);
  };

  // Open Edit Flash Deal Modal
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setSelectedProductId(prod.id);
    setFormBasePrice(prod.base_price);
    setFormComparePrice(prod.compare_at_price || prod.base_price * 1.5);
    setFormEndsAt(toDateTimeLocalValue(prod.flash_deal_ends_at));
    setFormIsFlashDeal(prod.is_flash_deal);
    setFormIsFeatured(prod.is_featured);
    setIsModalOpen(true);
  };

  // Handle Select Product Change in Modal
  const handleProductSelectChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = allProducts.find((p) => p.id === prodId);
    if (prod) {
      setFormBasePrice(prod.base_price);
      setFormComparePrice(prod.compare_at_price || prod.base_price * 1.5);
      setFormIsFeatured(prod.is_featured);
      if (prod.flash_deal_ends_at) {
        setFormEndsAt(toDateTimeLocalValue(prod.flash_deal_ends_at));
      }
    }
  };

  // Quick Preset Helper for Duration (+12h, +24h, +48h, +7d)
  const setQuickDuration = (hours: number) => {
    const targetDate = new Date(Date.now() + 1000 * 60 * 60 * hours);
    setFormEndsAt(toDateTimeLocalValue(targetDate.toISOString()));
  };

  // Save Flash Deal
  const handleSaveFlashDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const endsAtIso = formEndsAt
      ? new Date(formEndsAt).toISOString()
      : new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

    setAllProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProductId
          ? {
              ...p,
              base_price: Number(formBasePrice),
              compare_at_price: Number(formComparePrice),
              is_flash_deal: formIsFlashDeal,
              flash_deal_ends_at: endsAtIso,
              is_featured: formIsFeatured,
              updated_at: new Date().toISOString(),
            }
          : p
      )
    );

    const targetProduct = allProducts.find((p) => p.id === selectedProductId);
    const title = targetProduct?.title || "Product";
    triggerToast(
      editingProduct
        ? `Flash Deal updated for "${title}"!`
        : `"${title}" added to Flash Deals!`
    );
    setIsModalOpen(false);
  };

  // Extend 24h on a single product
  const handleExtend24h = (prod: Product) => {
    const currentEnd = prod.flash_deal_ends_at
      ? new Date(prod.flash_deal_ends_at).getTime()
      : Date.now();
    const newEnd = new Date(Math.max(Date.now(), currentEnd) + 1000 * 60 * 60 * 24).toISOString();

    setAllProducts((prev) =>
      prev.map((p) =>
        p.id === prod.id
          ? { ...p, flash_deal_ends_at: newEnd, is_flash_deal: true }
          : p
      )
    );
    triggerToast(`Extended campaign duration for "${prod.title}" by +24 hours!`);
  };

  // Trigger End Deal Confirmation
  const handleEndDealClick = (prod: Product) => {
    setProductToEnd(prod);
    setConfirmDialogOpen(true);
  };

  // Confirm End Deal for single product
  const handleConfirmEndDeal = () => {
    if (!productToEnd) return;
    setAllProducts((prev) =>
      prev.map((p) =>
        p.id === productToEnd.id
          ? { ...p, is_flash_deal: false, flash_deal_ends_at: null }
          : p
      )
    );
    triggerToast(`Flash deal ended for "${productToEnd.title}".`);
    setProductToEnd(null);
  };

  // Bulk Actions
  const handleBulkExtend24h = (selected: Product[]) => {
    const selectedIds = new Set(selected.map((s) => s.id));
    setAllProducts((prev) =>
      prev.map((p) => {
        if (!selectedIds.has(p.id)) return p;
        const currentEnd = p.flash_deal_ends_at
          ? new Date(p.flash_deal_ends_at).getTime()
          : Date.now();
        const newEnd = new Date(
          Math.max(Date.now(), currentEnd) + 1000 * 60 * 60 * 24
        ).toISOString();
        return { ...p, flash_deal_ends_at: newEnd, is_flash_deal: true };
      })
    );
    triggerToast(`Extended ${selected.length} flash deal(s) by +24 hours!`);
  };

  const handleBulkEndDealsClick = (selected: Product[]) => {
    setBulkSelectedProducts(selected);
    setBulkActionType("end");
    setBulkConfirmOpen(true);
  };

  const handleConfirmBulkEndDeals = () => {
    const selectedIds = new Set(bulkSelectedProducts.map((s) => s.id));
    setAllProducts((prev) =>
      prev.map((p) =>
        selectedIds.has(p.id)
          ? { ...p, is_flash_deal: false, flash_deal_ends_at: null }
          : p
      )
    );
    triggerToast(`${bulkSelectedProducts.length} flash deal(s) ended.`);
    setBulkSelectedProducts([]);
  };

  const handleBulkToggleFeatured = (selected: Product[]) => {
    const selectedIds = new Set(selected.map((s) => s.id));
    setAllProducts((prev) =>
      prev.map((p) =>
        selectedIds.has(p.id) ? { ...p, is_featured: !p.is_featured } : p
      )
    );
    triggerToast(`Toggled featured status for ${selected.length} deal(s).`);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Title",
      "SKU",
      "Category",
      "Flash Price (USDT)",
      "Compare Price (USDT)",
      "Discount %",
      "Stock",
      "Featured",
      "Status",
      "Ends At",
    ];

    const rows = flashProducts.map((p) => {
      const discount = calcDiscount(
        p.compare_at_price || p.base_price,
        p.base_price
      );
      const stock =
        p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 50;
      const categoryName = categoryMap.get(p.category_id) || p.category_id;

      return [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.sku,
        `"${categoryName}"`,
        p.base_price,
        p.compare_at_price || "",
        `${discount}%`,
        stock,
        p.is_featured ? "Featured" : "Standard",
        p.status,
        p.flash_deal_ends_at || "N/A",
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lennox_flash_deals_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Flash deals exported to CSV!");
  };

  // KPI Calculations
  interface FlashDealStats {
    activeDeals: number;
    avgDiscount: number;
    totalStock: number;
    nearestEndTime: number | null;
    nearestProduct: Product | null;
  }

  const stats = useMemo<FlashDealStats>(() => {
    const activeDeals = flashProducts.length;

    let totalDiscountSum = 0;
    let totalStock = 0;
    let nearestEndTime: number | null = null;
    let nearestProduct: Product | null = null;

    flashProducts.forEach((p) => {
      const discount = calcDiscount(
        p.compare_at_price || p.base_price,
        p.base_price
      );
      totalDiscountSum += discount;

      const prodStock =
        p.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 50;
      totalStock += prodStock;

      if (p.flash_deal_ends_at) {
        const time = new Date(p.flash_deal_ends_at).getTime();
        if (time > Date.now()) {
          if (nearestEndTime === null || time < nearestEndTime) {
            nearestEndTime = time;
            nearestProduct = p;
          }
        }
      }
    });

    const avgDiscount =
      activeDeals > 0 ? Math.round(totalDiscountSum / activeDeals) : 0;

    return {
      activeDeals,
      avgDiscount,
      totalStock,
      nearestEndTime,
      nearestProduct,
    };
  }, [flashProducts]);

  // Live modal discount calculation
  const calculatedModalDiscount = useMemo(() => {
    return calcDiscount(formComparePrice, formBasePrice);
  }, [formComparePrice, formBasePrice]);

  // Table Columns Definition
  const columns: Column<Product>[] = [
    {
      header: "Product Item",
      accessorKey: "title",
      sortable: true,
      className: "min-w-[240px]",
      cell: (row) => {
        const categoryName = categoryMap.get(row.category_id) || "Hardware";
        const thumbUrl =
          row.media?.[0]?.url ||
          "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=200&auto=format&fit=crop&q=80";

        return (
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
              <Image
                src={thumbUrl}
                alt={row.title}
                fill
                sizes="44px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 max-w-[200px]">
              <h4
                className="font-bold text-slate-100 text-xs truncate hover:text-[#FF1028] transition-colors"
                title={row.title}
              >
                {row.title}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-500 font-medium truncate">
                  {categoryName}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "SKU",
      accessorKey: "sku",
      sortable: true,
      className: "min-w-[130px]",
      cell: (row) => (
        <span className="font-mono font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px] inline-block shadow-xs">
          {row.sku}
        </span>
      ),
    },
    {
      header: "Flash Price",
      accessorKey: "base_price",
      sortable: true,
      className: "min-w-[110px]",
      cell: (row) => (
        <span className="font-mono font-black text-emerald-400 text-xs">
          {formatCurrency(row.base_price)}
        </span>
      ),
    },
    {
      header: "Compare At",
      accessorKey: "compare_at_price",
      sortable: true,
      className: "min-w-[110px]",
      cell: (row) => (
        <span className="font-mono text-slate-500 line-through text-xs">
          {row.compare_at_price ? formatCurrency(row.compare_at_price) : "—"}
        </span>
      ),
    },
    {
      header: "Discount %",
      className: "min-w-[110px]",
      cell: (row) => {
        const discount = calcDiscount(
          row.compare_at_price || row.base_price,
          row.base_price
        );
        return (
          <span className="inline-flex items-center gap-1 font-mono font-black text-[10px] px-2.5 py-1 rounded-md border bg-emerald-950/60 text-emerald-300 border-emerald-800/80 shadow-xs">
            <Flame className="w-3 h-3 text-emerald-400" />
            <span>-{discount}% OFF</span>
          </span>
        );
      },
    },
    {
      header: "Deal Countdown & Expiry",
      accessorKey: "flash_deal_ends_at",
      sortable: true,
      className: "min-w-[210px]",
      cell: (row) => {
        if (!row.flash_deal_ends_at) {
          return (
            <span className="text-xs text-slate-500 font-medium">
              No active timer
            </span>
          );
        }

        const remaining = timeRemaining(row.flash_deal_ends_at);
        if (remaining.expired) {
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-950/40 border border-red-800/60 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" /> Deal Expired
              </span>
              <div className="text-[10px] text-slate-500 font-mono">
                Ended: {formatDate(row.flash_deal_ends_at)}
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-1">
            <FlashDealCountdown targetDate={row.flash_deal_ends_at} />
            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-600" />
              <span>Ends: {formatDateTime(row.flash_deal_ends_at)}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Stock",
      className: "min-w-[90px]",
      cell: (row) => {
        const stock =
          row.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 50;
        const isLow = stock < 20;

        return (
          <div className="space-y-0.5">
            <span
              className={cn(
                "font-mono font-bold text-xs",
                isLow ? "text-amber-400" : "text-slate-300"
              )}
            >
              {stock} units
            </span>
            {isLow && (
              <span className="text-[9px] font-bold text-amber-500 block uppercase">
                Low Stock
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Featured",
      accessorKey: "is_featured",
      sortable: true,
      className: "min-w-[100px]",
      cell: (row) => {
        return row.is_featured ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/30">
            <Sparkles className="w-3 h-3" />
            <span>Featured</span>
          </span>
        ) : (
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            Standard
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      className: "min-w-[110px]",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      className: "min-w-[120px] text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleExtend24h(row)}
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
            title="Extend Deal +24 Hours"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Edit Flash Deal"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleEndDealClick(row)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            title="End Flash Deal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Filters
  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Catalog Status",
      options: [
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "is_featured",
      label: "Featured Drop",
      options: [
        { value: "true", label: "Featured Only" },
        { value: "false", label: "Standard Only" },
      ],
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Product>[] = [
    {
      label: "Extend +24h",
      icon: Clock,
      variant: "default",
      onClick: handleBulkExtend24h,
    },
    {
      label: "Toggle Featured",
      icon: Sparkles,
      variant: "success",
      onClick: handleBulkToggleFeatured,
    },
    {
      label: "End Flash Deals",
      icon: Flame,
      variant: "danger",
      onClick: handleBulkEndDealsClick,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Flash Deals & Lightning Campaigns"
        subtitle="Manage limited-time factory promotional drops, deep countdown discounts, and urgent buyer deals."
        badge={{ text: "Flash Drop Engine", variant: "red" }}
        breadcrumbs={[
          { label: "Marketing", href: "/admin/promotions" },
          { label: "Flash Deals" },
        ]}
        actions={[
          {
            label: "Add Flash Deal",
            icon: Zap,
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
              Active Flash Deals
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-[#FF1028] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats.activeDeals}
          </div>
          <p className="text-[10px] text-slate-500">
            Live high-velocity promotional drops
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Average Discount
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {stats.avgDiscount}% OFF
          </div>
          <p className="text-[10px] text-emerald-400/80 font-medium">
            Calculated against factory list price
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Flash Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats.totalStock.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">
            Available units across active campaigns
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nearest Expiry
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xs font-bold text-amber-400 truncate">
            {stats.nearestProduct ? (
              <FlashDealCountdown targetDate={stats.nearestProduct.flash_deal_ends_at || undefined} />
            ) : (
              <span className="text-slate-500">No active timers</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            {stats.nearestProduct ? stats.nearestProduct.title : "All deals stable"}
          </p>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <AdminDataTable<Product>
        data={flashProducts}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search flash deals by product title, SKU, or category..."
        searchFields={["title", "sku", "category_id"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="base_price"
        defaultSortDirection="asc"
        onExportCsv={handleExportCsv}
        emptyTitle="No flash deals active"
        emptyDescription="Select catalogue products to launch limited-time flash discount drops."
        emptyAction={{
          label: "Add Product to Flash Deals",
          onClick: handleOpenCreateModal,
        }}
      />

      {/* ── 4. Create / Edit CRUD Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-white font-black">
            <Zap className="w-5 h-5 text-[#FF1028]" />
            <span>
              {editingProduct
                ? `Edit Flash Deal: ${editingProduct.title}`
                : "Add Product to Flash Deals"}
            </span>
          </div>
        }
        className="!bg-slate-900 !border-slate-800 !text-white"
        size="lg"
      >
        <form onSubmit={handleSaveFlashDeal} className="space-y-5 pt-2 font-montserrat">
          {/* Select Product */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Target Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelectChange(e.target.value)}
              disabled={!!editingProduct}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {allProducts.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.title} ({prod.sku}) — {formatCurrency(prod.base_price)}
                </option>
              ))}
            </select>
            {editingProduct && (
              <span className="text-[10px] text-slate-500 block">
                Product SKU: {editingProduct.sku}
              </span>
            )}
          </div>

          {/* Pricing Row: Base Price & Compare Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Flash Sale Price (USDT) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={formBasePrice}
                onChange={(e) => setFormBasePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-black text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
              <span className="text-[10px] text-slate-500 block">
                Discounted price paid by buyer in USDT
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Original Compare-At Price (USDT) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={formComparePrice}
                onChange={(e) =>
                  setFormComparePrice(parseFloat(e.target.value) || 0)
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Strikethrough reference</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {calculatedModalDiscount > 0
                    ? `-${calculatedModalDiscount}% OFF`
                    : "No discount"}
                </span>
              </div>
            </div>
          </div>

          {/* Flash Deal End Date / Time with Quick Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 block">
                Flash Deal Ends At (UTC / Local) *
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDuration(12)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  +12h
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(24)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  +24h
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(48)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  +48h
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(168)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  +7d
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              required
              value={formEndsAt}
              onChange={(e) => setFormEndsAt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
            />
          </div>

          {/* Visual Live Countdown Preview in Modal */}
          {formEndsAt && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Timer Preview:</span>
              </div>
              <FlashDealCountdown targetDate={new Date(formEndsAt).toISOString()} />
            </div>
          )}

          {/* Toggles: is_flash_deal & is_featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={formIsFlashDeal}
                onChange={(e) => setFormIsFlashDeal(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF1028] bg-slate-900 border-slate-700 accent-[#FF1028] cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-200">
                {formIsFlashDeal ? "Flash Deal Active" : "Flash Deal Inactive"}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={formIsFeatured}
                onChange={(e) => setFormIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-200">
                {formIsFeatured ? "Featured Showcase" : "Standard Showcase"}
              </span>
            </label>
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors cursor-pointer shadow-md shadow-red-950/40 flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{editingProduct ? "Save Campaign" : "Launch Flash Deal"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Single Item End Deal Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setProductToEnd(null);
        }}
        onConfirm={handleConfirmEndDeal}
        title="End Flash Deal Campaign"
        description={
          productToEnd
            ? `Are you sure you want to end the flash deal for "${productToEnd.title}"? The product price will revert to normal catalogue pricing and the countdown badge will be removed.`
            : "Are you sure you want to end this flash deal?"
        }
        confirmLabel="End Flash Deal"
        variant="warning"
      />

      {/* ── 6. Bulk Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={bulkConfirmOpen}
        onClose={() => {
          setBulkConfirmOpen(false);
          setBulkSelectedProducts([]);
        }}
        onConfirm={handleConfirmBulkEndDeals}
        title="End Selected Flash Deals"
        description={`Are you sure you want to end flash deals on ${bulkSelectedProducts.length} selected product(s)? Their countdown timers will be cancelled immediately.`}
        confirmLabel={`End ${bulkSelectedProducts.length} Deals`}
        variant="warning"
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
