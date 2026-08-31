"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Boxes,
  Plus,
  Building,
  Coins,
  History,
  Download,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
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
import { formatDate, formatCurrency } from "@/utils/helpers";
import {
  InventoryItemRecord,
  InventoryMovementRecord,
  InventoryOverviewMetrics,
} from "@/types/inventory";
import {
  getInventoryOverview,
  getInventoryItems,
  adjustItemStock,
  saveInventoryItem,
  deleteInventoryItem,
  getItemMovements,
  exportInventoryCSV,
} from "@/app/actions/admin-inventory";

export default function AdminInventoryPage() {
  const toast = useAdminToast();
  const [items, setItems] = useState<InventoryItemRecord[]>([]);
  const [metrics, setMetrics] = useState<InventoryOverviewMetrics>({
    total_skus: 0,
    total_stock_units: 0,
    available_units: 0,
    reserved_units: 0,
    low_stock_alerts: 0,
    out_of_stock_count: 0,
    total_inventory_value_usdt: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Modals & SlideOvers
  const [isAdjustSlideOverOpen, setIsAdjustSlideOverOpen] = useState(false);
  const [isItemSlideOverOpen, setIsItemSlideOverOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemRecord | null>(null);
  const [movements, setMovements] = useState<InventoryMovementRecord[]>([]);
  const [isMovementsLoading, setIsMovementsLoading] = useState(false);

  // Stock Adjustment Form State
  const [adjustWarehouse, setAdjustWarehouse] = useState<"shenzhenStock" | "guangzhouStock" | "hkAirStock">("shenzhenStock");
  const [adjustType, setAdjustType] = useState<"add" | "subtract" | "set">("add");
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>("Factory Restock (1688 Direct)");
  const [adjustNotes, setAdjustNotes] = useState<string>("");
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Full Item Form State
  const [formSku, setFormSku] = useState("");
  const [formProductName, setFormProductName] = useState("");
  const [formVariantName, setFormVariantName] = useState("");
  const [formCategory, setFormCategory] = useState("Consumer Electronics");
  const [formSupplierCode, setFormSupplierCode] = useState("");
  const [formSourcingCost, setFormSourcingCost] = useState<number>(45.0);
  const [formShenzhenStock, setFormShenzhenStock] = useState<number>(20);
  const [formGuangzhouStock, setFormGuangzhouStock] = useState<number>(10);
  const [formHkAirStock, setFormHkAirStock] = useState<number>(5);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState<number>(10);
  const [formReorderPoint, setFormReorderPoint] = useState<number>(20);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewRes, itemsRes] = await Promise.all([
        getInventoryOverview(),
        getInventoryItems({}),
      ]);
      if (overviewRes.success && overviewRes.metrics) {
        setMetrics(overviewRes.metrics);
      }
      if (itemsRes.success && itemsRes.items) {
        setItems(itemsRes.items);
      }
    } catch {
      toast.error("Failed to fetch multi-warehouse inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenAdjust = (item: InventoryItemRecord) => {
    setSelectedItem(item);
    setAdjustWarehouse("shenzhenStock");
    setAdjustType("add");
    setAdjustQuantity(10);
    setAdjustReason("Factory Restock (1688 Direct)");
    setAdjustNotes("");
    setIsAdjustSlideOverOpen(true);
  };

  const handleOpenMovements = async (item: InventoryItemRecord) => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
    setIsMovementsLoading(true);
    const res = await getItemMovements(item.id);
    if (res.success && res.movements) {
      setMovements(res.movements);
    }
    setIsMovementsLoading(false);
  };

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormSku(`LCM-${Math.floor(1000 + Math.random() * 9000)}-SKU`);
    setFormProductName("");
    setFormVariantName("Standard");
    setFormCategory("Consumer Electronics");
    setFormSupplierCode(`SUP-SZ-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormSourcingCost(45.0);
    setFormShenzhenStock(20);
    setFormGuangzhouStock(10);
    setFormHkAirStock(5);
    setFormLowStockThreshold(10);
    setFormReorderPoint(20);
    setIsItemSlideOverOpen(true);
  };

  const handleOpenEdit = (item: InventoryItemRecord) => {
    setSelectedItem(item);
    setFormSku(item.sku);
    setFormProductName(item.product_name);
    setFormVariantName(item.variant_name || "Standard");
    setFormCategory(item.category_name);
    setFormSupplierCode(item.supplier_code);
    setFormSourcingCost(item.sourcing_cost_usdt);
    setFormShenzhenStock(item.shenzhen_stock);
    setFormGuangzhouStock(item.guangzhou_stock);
    setFormHkAirStock(item.hk_air_stock);
    setFormLowStockThreshold(item.low_stock_threshold);
    setFormReorderPoint(item.reorder_point);
    setIsItemSlideOverOpen(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || adjustQuantity <= 0) return;
    setIsSubmittingAdjust(true);
    try {
      const res = await adjustItemStock({
        itemId: selectedItem.id,
        warehouse: adjustWarehouse,
        type: adjustType,
        quantity: Number(adjustQuantity),
        reason: adjustReason,
        notes: adjustNotes,
      });
      if (res.success) {
        toast.success(`Inventory stock adjusted for ${selectedItem.sku}.`);
        setIsAdjustSlideOverOpen(false);
        loadData();
      } else {
        toast.error(res.error || "Adjustment failed");
      }
    } catch {
      toast.error("Stock adjustment failed.");
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formProductName.trim()) {
      toast.warning("SKU and Product Name are required.");
      return;
    }

    const payload: Partial<InventoryItemRecord> = {
      id: selectedItem?.id,
      sku: formSku.trim().toUpperCase(),
      product_name: formProductName.trim(),
      variant_name: formVariantName.trim(),
      category_name: formCategory,
      supplier_code: formSupplierCode.trim(),
      sourcing_cost_usdt: Number(formSourcingCost) || 0,
      shenzhen_stock: Number(formShenzhenStock) || 0,
      guangzhou_stock: Number(formGuangzhouStock) || 0,
      hk_air_stock: Number(formHkAirStock) || 0,
      low_stock_threshold: Number(formLowStockThreshold) || 10,
      reorder_point: Number(formReorderPoint) || 20,
    };

    try {
      const res = await saveInventoryItem(payload);
      if (res.success) {
        toast.success(res.message || "Inventory SKU registered!");
        setIsItemSlideOverOpen(false);
        // Optimistic UI state update immediately
        setItems((prev) => {
          const total = (payload.shenzhen_stock || 0) + (payload.guangzhou_stock || 0) + (payload.hk_air_stock || 0);
          const existingIdx = prev.findIndex((i) => (payload.id && i.id === payload.id) || i.sku === payload.sku);
          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...updated[existingIdx],
              ...payload,
              total_stock: total,
              available_stock: Math.max(0, total - (updated[existingIdx].reserved_stock || 0)),
            } as InventoryItemRecord;
            return updated;
          } else {
            const newItem: InventoryItemRecord = {
              id: payload.id || `inv-${Date.now()}`,
              sku: payload.sku || "LCM-SKU",
              product_name: payload.product_name || "",
              variant_name: payload.variant_name || "Standard",
              category_name: payload.category_name || "Consumer Electronics",
              supplier_code: payload.supplier_code || "SUP-SZ-9021",
              sourcing_cost_usdt: payload.sourcing_cost_usdt || 0,
              shenzhen_stock: payload.shenzhen_stock || 0,
              guangzhou_stock: payload.guangzhou_stock || 0,
              hk_air_stock: payload.hk_air_stock || 0,
              reserved_stock: 0,
              total_stock: total,
              available_stock: total,
              low_stock_threshold: payload.low_stock_threshold || 10,
              reorder_point: payload.reorder_point || 20,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            return [newItem, ...prev];
          }
        });
        loadData();
      } else {
        toast.error(res.error || "Save failed");
      }
    } catch {
      toast.error("Failed to save inventory SKU.");
    }
  };

  const handleDeleteItem = async (item: InventoryItemRecord) => {
    try {
      const res = await deleteInventoryItem(item.id);
      if (res.success) {
        toast.success(`Deleted SKU ${item.sku}.`);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        loadData();
      } else {
        toast.error(res.message || "Deletion failed.");
      }
    } catch {
      toast.error("Failed to delete inventory SKU.");
    }
  };

  const handleExportCSV = async () => {
    const res = await exportInventoryCSV();
    if (res.success && res.csvContent) {
      const blob = new Blob([res.csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast.success("Inventory manifest exported to CSV.");
    }
  };

  // Columns definition
  const columns: Column<InventoryItemRecord>[] = [
    {
      header: "SKU / Supplier",
      accessorKey: "sku",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-slate-900 dark:text-white block text-xs">
            {row.sku}
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/40 inline-block">
            {row.supplier_code}
          </span>
        </div>
      ),
    },
    {
      header: "Product & Variant",
      accessorKey: "product_name",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5 max-w-xs">
          <span className="font-bold text-slate-900 dark:text-white block font-heading truncate text-xs">
            {row.product_name}
          </span>
          <span className="text-[11px] text-slate-400 block truncate">
            {row.variant_name || "Standard Unit"}
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category_name",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          {row.category_name}
        </span>
      ),
    },
    {
      header: "Hub Distribution (SZ / GZ / HK)",
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#2F65F6] border border-blue-200 dark:border-blue-900/40" title="Shenzhen">
            SZ: {row.shenzhen_stock}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700" title="Guangzhou">
            GZ: {row.guangzhou_stock}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 border border-purple-200 dark:border-purple-900/40" title="Hong Kong Air Hub">
            HK: {row.hk_air_stock}
          </span>
        </div>
      ),
    },
    {
      header: "Available",
      cell: (row) => {
        const total = row.shenzhen_stock + row.guangzhou_stock + row.hk_air_stock;
        const available = Math.max(0, total - row.reserved_stock);
        return (
          <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
            {available} units
          </span>
        );
      },
    },
    {
      header: "Stock Health",
      cell: (row) => {
        const total = row.shenzhen_stock + row.guangzhou_stock + row.hk_air_stock;
        const available = Math.max(0, total - row.reserved_stock);
        const tone: BadgeTone =
          available === 0
            ? "rose"
            : available <= row.low_stock_threshold
            ? "amber"
            : "emerald";
        const label =
          available === 0
            ? "Out of Stock"
            : available <= row.low_stock_threshold
            ? "Low Stock"
            : "In Stock";
        return <StatusBadge status={label} tone={tone} />;
      },
    },
    {
      header: "Unit Cost",
      accessorKey: "sourcing_cost_usdt",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
          ${row.sourcing_cost_usdt.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-20",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end">
          <AdminActionMenu
            itemTitle={`SKU "${row.sku}"`}
            onEdit={() => handleOpenEdit(row)}
            onDelete={() => handleDeleteItem(row)}
            customActions={[
              {
                label: "Quick Stock Adjustment",
                icon: SlidersHorizontal,
                onClick: () => handleOpenAdjust(row),
              },
              {
                label: "Movement Ledger Logs",
                icon: History,
                onClick: () => handleOpenMovements(row),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const tableFilters: FilterOption[] = [
    {
      key: "category_name",
      label: "Category",
      options: [
        { value: "Consumer Electronics", label: "Consumer Electronics" },
        { value: "3D Printers & CNC", label: "3D Printers & CNC" },
        { value: "Audio & Sound", label: "Audio & Sound" },
        { value: "Automotive Hardware", label: "Automotive Hardware" },
        { value: "Outdoor & Tactical", label: "Outdoor & Tactical" },
      ],
    },
  ];

  const bulkActions: BulkAction<InventoryItemRecord>[] = [
    {
      label: "Export Selected",
      icon: Download,
      variant: "default",
      onClick: (selected) => {
        const headers = "SKU,Product,Category,SupplierCode,UnitCost\n";
        const rows = selected.map((s) => `"${s.sku}","${s.product_name}","${s.category_name}","${s.supplier_code}",${s.sourcing_cost_usdt}`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inventory_selected.csv";
        a.click();
        toast.success(`Exported ${selected.length} inventory records.`);
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Multi-Warehouse Inventory"
        subtitle="Manage inventory levels across Shenzhen factory hub, Guangzhou logistics, and Hong Kong air depot."
        badge={{ text: `${metrics.total_skus} Active SKUs`, variant: "blue" }}
        breadcrumbs={[
          { label: "Catalogue & Inventory", href: "/admin/products" },
          { label: "Inventory" },
        ]}
        actions={[
          {
            label: "Export Manifest (CSV)",
            icon: Download,
            variant: "secondary",
            onClick: handleExportCSV,
          },
          {
            label: "Register SKU",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreate,
          },
        ]}
      />

      {/* ── 2. Top Metric KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 rounded-2xl p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Stock Units</span>
            <Boxes className="w-4 h-4 text-[#2F65F6]" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono block">
            {metrics.total_stock_units.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block">Across 3 regional logistics depots</span>
        </div>

        <div className="bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 rounded-2xl p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Available Units</span>
            <Building className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
            {metrics.available_units.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#16A34A] block">Free to fulfill immediately</span>
        </div>

        <div className="bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 rounded-2xl p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono block">
            {metrics.low_stock_alerts}
          </span>
          <span className="text-[10px] text-amber-500 block">Below reorder threshold</span>
        </div>

        <div className="bg-[#F3E8FF] dark:bg-[#28183B] border border-[#E9D5FF]/50 dark:border-purple-900/30 rounded-2xl p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Asset Valuation (USDT)</span>
            <Coins className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono block">
            {formatCurrency(metrics.total_inventory_value_usdt)}
          </span>
          <span className="text-[10px] text-purple-400 block">Factory acquisition basis</span>
        </div>
      </div>

      {/* ── 3. Reusable AdminDataTable ── */}
      <AdminDataTable<InventoryItemRecord>
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search SKU, Product, or Supplier Code..."
        searchFields={["sku", "product_name", "supplier_code"]}
        filters={tableFilters}
        bulkActions={bulkActions}
        defaultSortKey="sourcing_cost_usdt"
        defaultSortDirection="desc"
        isLoading={isLoading}
        emptyTitle="No inventory SKUs found"
        emptyDescription="Register your first multi-warehouse inventory SKU."
        emptyAction={{
          label: "Register SKU",
          onClick: handleOpenCreate,
        }}
        onExportCsv={handleExportCSV}
      />

      {/* ── 4. Slide-Over Panel: Quick Stock Adjustment ── */}
      <SlideOver
        isOpen={isAdjustSlideOverOpen}
        onClose={() => setIsAdjustSlideOverOpen(false)}
        title={`Adjust Stock: ${selectedItem?.sku || ""}`}
        description="Record factory receiving, warehouse transfer, or inventory reconciliation."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsAdjustSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmittingAdjust}
              onClick={handleSaveAdjust}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer disabled:opacity-50"
            >
              {isSubmittingAdjust ? "Applying..." : "Commit Stock Adjustment"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdjust} className="space-y-5">
          <AdminFormSection title="Adjustment Parameters">
            <AdminSelect
              label="Target Logistics Depot"
              value={adjustWarehouse}
              onChange={(e) => setAdjustWarehouse(e.target.value as typeof adjustWarehouse)}
              options={[
                { value: "shenzhenStock", label: "Shenzhen Factory Hub (SZ)" },
                { value: "guangzhouStock", label: "Guangzhou Logistics Hub (GZ)" },
                { value: "hkAirStock", label: "Hong Kong Air Depot (HK)" },
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <AdminSelect
                label="Action Type"
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value as typeof adjustType)}
                options={[
                  { value: "add", label: "+ Add Stock (Inbound)" },
                  { value: "subtract", label: "- Subtract Stock (Damaged / Outbound)" },
                  { value: "set", label: "= Set Absolute Stock" },
                ]}
              />

              <AdminInput
                label="Quantity"
                type="number"
                min={1}
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(Number(e.target.value))}
              />
            </div>

            <AdminSelect
              label="Operational Reason"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              options={[
                { value: "Factory Restock (1688 Direct)", label: "Factory Restock (1688 Direct)" },
                { value: "Depot Transfer Inbound", label: "Depot Transfer Inbound" },
                { value: "Customer Order Return", label: "Customer Order Return" },
                { value: "Damaged in Bench QC", label: "Damaged in Bench QC" },
                { value: "Periodic Audit Reconciliation", label: "Periodic Audit Reconciliation" },
              ]}
            />

            <AdminTextarea
              label="Procurement Log Notes"
              rows={3}
              placeholder="Enter batch tracking numbers or inspection notes..."
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
            />
          </AdminFormSection>
        </form>
      </SlideOver>

      {/* ── 5. Slide-Over Panel: Full SKU Register / Editor ── */}
      <SlideOver
        isOpen={isItemSlideOverOpen}
        onClose={() => setIsItemSlideOverOpen(false)}
        title={selectedItem ? `Edit SKU: ${selectedItem.sku}` : "Register New Inventory SKU"}
        description="Set multi-warehouse initial allocations and automated reorder alerts."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsItemSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveItem}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer"
            >
              {selectedItem ? "Save SKU Changes" : "Register Inventory SKU"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveItem} className="space-y-5">
          <AdminFormSection title="SKU Identification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="SKU Identifier"
                required
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
              />
              <AdminInput
                label="Secret Supplier Code"
                value={formSupplierCode}
                onChange={(e) => setFormSupplierCode(e.target.value)}
              />
            </div>

            <AdminInput
              label="Product Title"
              required
              value={formProductName}
              onChange={(e) => setFormProductName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminInput
                label="Variant Name"
                value={formVariantName}
                onChange={(e) => setFormVariantName(e.target.value)}
              />
              <AdminInput
                label="Unit Sourcing Cost (USDT)"
                type="number"
                step="0.01"
                value={formSourcingCost}
                onChange={(e) => setFormSourcingCost(Number(e.target.value))}
              />
            </div>
          </AdminFormSection>

          <AdminFormSection title="Warehouse Stock Quantities">
            <div className="grid grid-cols-3 gap-3">
              <AdminInput
                label="Shenzhen (SZ)"
                type="number"
                min={0}
                value={formShenzhenStock}
                onChange={(e) => setFormShenzhenStock(Number(e.target.value))}
              />
              <AdminInput
                label="Guangzhou (GZ)"
                type="number"
                min={0}
                value={formGuangzhouStock}
                onChange={(e) => setFormGuangzhouStock(Number(e.target.value))}
              />
              <AdminInput
                label="Hong Kong (HK)"
                type="number"
                min={0}
                value={formHkAirStock}
                onChange={(e) => setFormHkAirStock(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <AdminInput
                label="Low Stock Warning Threshold"
                type="number"
                min={1}
                value={formLowStockThreshold}
                onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
              />
              <AdminInput
                label="Reorder Target Point"
                type="number"
                min={1}
                value={formReorderPoint}
                onChange={(e) => setFormReorderPoint(Number(e.target.value))}
              />
            </div>
          </AdminFormSection>
        </form>
      </SlideOver>

      {/* ── 6. Movement History Modal ── */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Movement Ledger: ${selectedItem?.sku || ""}`}
        size="lg"
      >
        <div className="space-y-4">
          {isMovementsLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading movement history...
            </div>
          ) : movements.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No stock movements recorded for this SKU.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {movements.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block font-sans">
                      {m.reason}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {m.warehouse} • By {m.created_by || "Admin"} • {formatDate(m.created_at)}
                    </span>
                  </div>
                  <span
                    className={`font-black text-xs ${
                      m.change_qty > 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {m.change_qty > 0 ? `+${m.change_qty}` : m.change_qty} units
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
