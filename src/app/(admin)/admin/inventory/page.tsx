"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Building,
  Coins,
  History,
  Download,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/utils/helpers";
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
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

  // Modals
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemRecord | null>(null);
  const [movements, setMovements] = useState<InventoryMovementRecord[]>([]);
  const [isMovementsLoading, setIsMovementsLoading] = useState(false);

  // Delete dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItemRecord | null>(null);

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
  const [formSupplierCode, setFormSupplierCode] = useState("SUP-SZ-9021");
  const [formSourcingCost, setFormSourcingCost] = useState(45.0);
  const [formShenzhenStock, setFormShenzhenStock] = useState(20);
  const [formGuangzhouStock, setFormGuangzhouStock] = useState(10);
  const [formHkAirStock, setFormHkAirStock] = useState(5);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState(10);
  const [formReorderPoint, setFormReorderPoint] = useState(20);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    const [overviewRes, itemsRes] = await Promise.all([
      getInventoryOverview(),
      getInventoryItems({
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
      }),
    ]);

    if (overviewRes.success && overviewRes.metrics) {
      setMetrics(overviewRes.metrics);
    }
    if (itemsRes.success && itemsRes.items) {
      setItems(itemsRes.items);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      const [overviewRes, itemsRes] = await Promise.all([
        getInventoryOverview(),
        getInventoryItems({
          search: searchTerm,
          category: categoryFilter,
          status: statusFilter,
        }),
      ]);

      if (mounted) {
        if (overviewRes.success && overviewRes.metrics) {
          setMetrics(overviewRes.metrics);
        }
        if (itemsRes.success && itemsRes.items) {
          setItems(itemsRes.items);
        }
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [searchTerm, categoryFilter, statusFilter]);

  // Open Adjust Modal
  const handleOpenAdjust = (item: InventoryItemRecord) => {
    setSelectedItem(item);
    setAdjustWarehouse("shenzhenStock");
    setAdjustType("add");
    setAdjustQuantity(10);
    setAdjustReason("Factory Restock (1688 Direct)");
    setAdjustNotes("");
    setIsAdjustModalOpen(true);
  };

  // Submit Stock Adjustment
  const handleSubmitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmittingAdjust(true);
    const res = await adjustItemStock({
      itemId: selectedItem.id,
      warehouse: adjustWarehouse,
      type: adjustType,
      quantity: adjustQuantity,
      reason: adjustReason,
      notes: adjustNotes,
    });
    setIsSubmittingAdjust(false);

    if (res.success) {
      showToast(res.message || "Stock adjusted successfully!");
      setIsAdjustModalOpen(false);
      loadData();
    } else {
      showToast(res.error || "Adjustment failed");
    }
  };

  // Open Movement History
  const handleOpenHistory = async (item: InventoryItemRecord) => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
    setIsMovementsLoading(true);
    const res = await getItemMovements(item.id);
    if (res.success && res.movements) {
      setMovements(res.movements);
    }
    setIsMovementsLoading(false);
  };

  // Open Create/Edit Modal
  const handleOpenCreateModal = () => {
    setSelectedItem(null);
    setFormSku("");
    setFormProductName("");
    setFormVariantName("Standard");
    setFormCategory("Consumer Electronics");
    setFormSupplierCode("SUP-SZ-9021");
    setFormSourcingCost(45.0);
    setFormShenzhenStock(20);
    setFormGuangzhouStock(10);
    setFormHkAirStock(5);
    setFormLowStockThreshold(10);
    setFormReorderPoint(20);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItemRecord) => {
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
    setIsItemModalOpen(true);
  };

  // Save Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formProductName.trim()) return;

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

    const res = await saveInventoryItem(payload);
    if (res.success) {
      showToast(res.message || "Inventory SKU saved!");
      setIsItemModalOpen(false);
      loadData();
    } else {
      showToast(res.error || "Save failed");
    }
  };

  // Delete Item
  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const res = await deleteInventoryItem(itemToDelete.id);
      if (res.success) {
        showToast(res.message || "Item deleted");
        loadData();
      }
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Multi-Warehouse Inventory"
        subtitle="Manage inventory levels across Shenzhen factory hub, Guangzhou logistics, and Hong Kong air depot."
        badge={{ text: `${metrics.total_skus} Active SKUs`, variant: "blue" }}
        breadcrumbs={[
          { label: "Catalogue", href: "/admin/products" },
          { label: "Inventory" },
        ]}
        actions={[
          {
            label: "Export Manifest (CSV)",
            icon: Download,
            variant: "secondary",
            onClick: async () => {
              const res = await exportInventoryCSV();
              if (res.success && res.csvContent) {
                const blob = new Blob([res.csvContent], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                showToast("Inventory manifest exported!");
              }
            },
          },
          {
            label: "Register SKU",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreateModal,
          },
        ]}
      />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-[#DCFCE7] dark:bg-emerald-950 border border-[#BBF7D0] dark:border-emerald-800 text-[#16A34A] dark:text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm cursor-pointer">×</button>
        </div>
      )}

      {/* ── 2. Top Metrics 5 KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total SKUs */}
        <div className="bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 rounded-2xl p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total SKUs</span>
            <Boxes className="w-4 h-4 text-[#2F65F6]" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{metrics.total_skus}</div>
          <div className="text-[11px] text-slate-400">Active tracked items</div>
        </div>

        {/* Metric 2: Available Units */}
        <div className="bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 rounded-2xl p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Available Stock</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-black text-[#10B981] font-mono">{metrics.available_units}</div>
          <div className="text-[11px] text-slate-400">Ready for instant air dispatch</div>
        </div>

        {/* Metric 3: Reserved in Escrow */}
        <div className="bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 rounded-2xl p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Reserved in Escrow</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{metrics.reserved_units}</div>
          <div className="text-[11px] text-slate-400">Confirmed escrow orders</div>
        </div>

        {/* Metric 4: Low Stock Alerts */}
        <div className="bg-[#FFF0F2] dark:bg-[#2D1B22] border border-[#FECDD3]/50 dark:border-rose-900/30 rounded-2xl p-4.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{metrics.low_stock_alerts}</div>
          <div className="text-[11px] text-slate-400">Below factory reorder point</div>
        </div>

        {/* Metric 5: Total Sourcing Valuation */}
        <div className="bg-[#F3E8FF] dark:bg-[#28183B] border border-[#E9D5FF]/50 dark:border-purple-900/30 rounded-2xl p-4.5 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Inventory Value</span>
            <Building className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">${metrics.total_inventory_value_usdt.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Direct Chinese cost basis</div>
        </div>
      </div>

      {/* ── 3. Filters & Inventory Data Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-xs">
        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU, Product, Supplier Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#2F65F6] transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer outline-none focus:border-[#2F65F6]"
            >
              <option value="all">All Product Categories</option>
              <option value="Consumer Electronics">Consumer Electronics</option>
              <option value="3D Printers & CNC">3D Printers &amp; CNC</option>
              <option value="Audio & Sound">Audio &amp; Sound</option>
              <option value="Automotive Hardware">Automotive Hardware</option>
              <option value="Outdoor & Tactical">Outdoor &amp; Tactical</option>
              <option value="Industrial Machinery">Industrial Machinery</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "in_stock" | "low_stock" | "out_of_stock")}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer outline-none focus:border-[#2F65F6]"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (&gt; Threshold)</option>
              <option value="low_stock">Low Stock (≤ Threshold)</option>
              <option value="out_of_stock">Out of Stock (0 units)</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold">SKU / Supplier Code</th>
                <th className="py-3 px-4 font-bold">Product &amp; Variant</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold text-center">Multi-Warehouse Stock</th>
                <th className="py-3 px-4 font-bold text-center">Reserved</th>
                <th className="py-3 px-4 font-bold text-center">Available</th>
                <th className="py-3 px-4 font-bold text-center">Stock Health</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading inventory records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No inventory SKUs found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const totalStock = item.shenzhen_stock + item.guangzhou_stock + item.hk_air_stock;
                  const availableStock = Math.max(0, totalStock - item.reserved_stock);
                  const isOutOfStock = availableStock === 0;
                const isLowStock = availableStock > 0 && availableStock <= item.low_stock_threshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    {/* SKU & Supplier Code */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">{item.sku}</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/40 inline-block">
                          {item.supplier_code}
                        </span>
                      </div>
                    </td>

                    {/* Product & Variant */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        <span className="font-bold text-slate-900 dark:text-white block truncate font-heading">{item.product_name}</span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Variant: {item.variant_name || "Standard"}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{item.category_name}</td>

                    {/* Multi-Warehouse Distribution */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                        <span title="Shenzhen Drone Hub" className="text-[#2F65F6] font-bold">
                          SZ: {item.shenzhen_stock}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span title="Guangzhou Logistics Center" className="text-emerald-600 dark:text-emerald-400 font-bold">
                          GZ: {item.guangzhou_stock}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span title="HK International Air Hub" className="text-purple-600 dark:text-purple-400 font-bold">
                          HK: {item.hk_air_stock}
                        </span>
                      </div>
                    </td>

                    {/* Reserved Stock */}
                    <td className="py-4 px-4 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                      {item.reserved_stock > 0 ? (
                        <span className="bg-[#FEF3C7] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 px-2 py-0.5 rounded-full border border-[#FDE68A]/60">
                          {item.reserved_stock} locked
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Available Stock */}
                    <td className="py-4 px-4 text-center font-mono text-sm font-black text-slate-900 dark:text-white">
                      {availableStock}
                    </td>

                    {/* Stock Health Status */}
                    <td className="py-4 px-4 text-center">
                      {isOutOfStock ? (
                        <span className="bg-[#FEE2E2] dark:bg-rose-950/60 text-[#DC2626] dark:text-rose-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-[#FECDD3]/60 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Out of Stock</span>
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-[#FEF3C7] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-[#FDE68A]/60 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock ({availableStock})</span>
                        </span>
                      ) : (
                        <span className="bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-[#BBF7D0]/60 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Healthy</span>
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          title="Adjust Stock Quantity"
                          className="px-3 py-1 rounded-xl bg-[#2F65F6] hover:bg-[#2563EB] text-white text-[11px] font-bold transition-colors cursor-pointer shadow-blue-500/25 shadow-xs"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => handleOpenHistory(item)}
                          title="View Movement Audit History"
                          className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit SKU Details"
                          className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(item);
                            setDeleteConfirmOpen(true);
                          }}
                          title="Delete SKU"
                          className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-red-500 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Stock Adjustment Modal ── */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock: ${selectedItem?.sku || ""}`}
        size="md"
      >
        <form onSubmit={handleSubmitAdjust} className="space-y-5 text-xs text-slate-800 dark:text-slate-200">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block font-heading">{selectedItem?.product_name}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Variant: {selectedItem?.variant_name || "Standard"}</span>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Target Warehouse Hub *</label>
            <select
              value={adjustWarehouse}
              onChange={(e) => setAdjustWarehouse(e.target.value as "shenzhenStock" | "guangzhouStock" | "hkAirStock")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-[#2F65F6]"
            >
              <option value="shenzhenStock">Shenzhen Main Factory Hub (SZ-MAIN)</option>
              <option value="guangzhouStock">Guangzhou Logistics &amp; QC Center (GZ-LOG)</option>
              <option value="hkAirStock">HK International Air Freight Hub (HK-AIR)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Action Type</label>
              <select
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value as "add" | "subtract" | "set")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-[#2F65F6]"
              >
                <option value="add">+ Add Restock (Arrival)</option>
                <option value="subtract">- Subtract (Damage / Scrap)</option>
                <option value="set">= Set Exact Count</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Audit Reason *</label>
            <select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
            >
              <option value="Factory Restock (1688 Direct)">Factory Restock (1688 Direct)</option>
              <option value="Damaged / Scrapped in Transit">Damaged / Scrapped in Transit</option>
              <option value="Customer Return (Restocked)">Customer Return (Restocked)</option>
              <option value="Physical Warehouse Audit Count">Physical Warehouse Audit Count</option>
              <option value="Sample / Quality Inspection Hold">Sample / Quality Inspection Hold</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Admin Notes / PO Number</label>
            <input
              type="text"
              placeholder="e.g. PO-SZ-2026-081 arrived via SF Express"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingAdjust}
              className="px-6 py-2 rounded-xl bg-[#2F65F6] hover:bg-[#2563EB] text-white font-bold shadow-blue-500/25 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmittingAdjust ? "Applying..." : "Confirm Adjustment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Movement History Audit Drawer Modal ── */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Movement Audit Trail: ${selectedItem?.sku || ""}`}
        size="lg"
      >
        <div className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block font-heading">{selectedItem?.product_name}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Supplier: {selectedItem?.supplier_code}</span>
            </div>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
              Total: {(selectedItem?.shenzhen_stock || 0) + (selectedItem?.guangzhou_stock || 0) + (selectedItem?.hk_air_stock || 0)} Units
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {isMovementsLoading ? (
              <div className="p-8 text-center text-slate-400">Loading audit history...</div>
            ) : movements.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No stock movements recorded yet.</div>
            ) : (
              movements.map((mov) => (
                <div
                  key={mov.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{mov.reason}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {mov.warehouse}
                      </span>
                    </div>
                    {mov.notes && <p className="text-[11px] text-slate-500 dark:text-slate-400">{mov.notes}</p>}
                    <span className="text-[10px] text-slate-400 block">
                      {formatDate(mov.created_at)} • By {mov.created_by}
                    </span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span
                      className={`text-sm font-black font-mono block ${
                        mov.change_qty > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                      }`}
                    >
                      {mov.change_qty > 0 ? `+${mov.change_qty}` : mov.change_qty}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {mov.previous_total} → {mov.new_total}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* ── 6. Create / Edit SKU Modal ── */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={selectedItem ? "Edit Inventory SKU" : "Register New Inventory SKU"}
        size="lg"
      >
        <form onSubmit={handleSaveItem} className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Inventory SKU *</label>
              <input
                type="text"
                required
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                placeholder="e.g. DRONE-4K-STD"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Confidential Supplier Code *</label>
              <input
                type="text"
                required
                value={formSupplierCode}
                onChange={(e) => setFormSupplierCode(e.target.value)}
                placeholder="e.g. SUP-SZ-9021"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-mono font-bold focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Product Title *</label>
              <input
                type="text"
                required
                value={formProductName}
                onChange={(e) => setFormProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Variant Name</label>
              <input
                type="text"
                value={formVariantName}
                onChange={(e) => setFormVariantName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Unit Sourcing Cost (USDT) *</label>
              <input
                type="number"
                step="0.01"
                value={formSourcingCost}
                onChange={(e) => setFormSourcingCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="font-bold text-[#2F65F6]">Shenzhen Hub</label>
              <input
                type="number"
                value={formShenzhenStock}
                onChange={(e) => setFormShenzhenStock(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-emerald-600 dark:text-emerald-400">Guangzhou Hub</label>
              <input
                type="number"
                value={formGuangzhouStock}
                onChange={(e) => setFormGuangzhouStock(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-purple-600 dark:text-purple-400">HK Air Hub</label>
              <input
                type="number"
                value={formHkAirStock}
                onChange={(e) => setFormHkAirStock(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Low Stock Alert Threshold</label>
              <input
                type="number"
                value={formLowStockThreshold}
                onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Factory Reorder Point</label>
              <input
                type="number"
                value={formReorderPoint}
                onChange={(e) => setFormReorderPoint(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#2F65F6] hover:bg-[#2563EB] text-white font-bold shadow-blue-500/25 shadow-md cursor-pointer"
            >
              Save SKU
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 7. Confirm Delete Modal ── */}
      {deleteConfirmOpen && itemToDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Inventory SKU?"
          description={`Are you sure you want to delete SKU "${itemToDelete.sku}" (${itemToDelete.product_name})? This will permanently remove its multi-warehouse stock history.`}
          confirmLabel="Delete SKU"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
}
