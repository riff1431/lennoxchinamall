"use client";

import React, { useState } from "react";
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  SlidersHorizontal,
  Lock,
  Search,
  Building,
  Plane,
  Truck,
  TrendingDown,
  Coins,
  Package,
  History,
  ArrowUpDown,
  Download,
  Warehouse,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { MOCK_INVENTORY, InventoryItem } from "@/lib/mockData";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Stock Adjustment Form State
  const [adjustWarehouse, setAdjustWarehouse] = useState<"shenzhenStock" | "guangzhouStock" | "hkAirStock">("shenzhenStock");
  const [adjustType, setAdjustType] = useState<"add" | "subtract" | "set">("add");
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>("Factory Restock (1688)");

  // Full Item Form State
  const [formSku, setFormSku] = useState("");
  const [formProductTitle, setFormProductTitle] = useState("");
  const [formVariantTitle, setFormVariantTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Consumer Electronics");
  const [formShenzhenStock, setFormShenzhenStock] = useState(20);
  const [formGuangzhouStock, setFormGuangzhouStock] = useState(10);
  const [formHkAirStock, setFormHkAirStock] = useState(5);
  const [formReservedStock, setFormReservedStock] = useState(0);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState(10);
  const [formReorderPoint, setFormReorderPoint] = useState(15);
  const [formUnitCost, setFormUnitCost] = useState(45.0);
  const [formSupplierCode, setFormSupplierCode] = useState("SUP-SZ-9021");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Open Adjust Modal
  const handleOpenAdjustModal = (item?: InventoryItem) => {
    const target = item || inventory[0];
    setSelectedItem(target);
    setAdjustWarehouse("shenzhenStock");
    setAdjustType("add");
    setAdjustQuantity(10);
    setAdjustReason("Factory Restock (1688)");
    setIsAdjustModalOpen(true);
  };

  // Submit Adjustment
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== selectedItem.id) return item;

        let currentWarehouseVal = item[adjustWarehouse] || 0;
        if (adjustType === "add") {
          currentWarehouseVal += Number(adjustQuantity);
        } else if (adjustType === "subtract") {
          currentWarehouseVal = Math.max(0, currentWarehouseVal - Number(adjustQuantity));
        } else if (adjustType === "set") {
          currentWarehouseVal = Math.max(0, Number(adjustQuantity));
        }

        const newShenzhen = adjustWarehouse === "shenzhenStock" ? currentWarehouseVal : item.shenzhenStock;
        const newGuangzhou = adjustWarehouse === "guangzhouStock" ? currentWarehouseVal : item.guangzhouStock;
        const newHk = adjustWarehouse === "hkAirStock" ? currentWarehouseVal : item.hkAirStock;
        const newTotal = newShenzhen + newGuangzhou + newHk;

        let newStatus: InventoryItem["status"] = item.status;
        if (newTotal <= 0) {
          newStatus = "out_of_stock";
        } else if (newTotal <= item.lowStockThreshold) {
          newStatus = "low_stock";
        } else if (item.status !== "reordering") {
          newStatus = "in_stock";
        }

        return {
          ...item,
          [adjustWarehouse]: currentWarehouseVal,
          totalStock: newTotal,
          status: newStatus,
          lastRestocked: new Date().toISOString(),
        };
      })
    );

    showToast(`Stock updated for ${selectedItem.sku} (${adjustReason}).`);
    setIsAdjustModalOpen(false);
  };

  // Open Full Item Modal
  const handleOpenCreateItem = () => {
    setSelectedItem(null);
    setFormSku(`LCM-SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormProductTitle("");
    setFormVariantTitle("Standard Edition");
    setFormCategory("Consumer Electronics");
    setFormShenzhenStock(25);
    setFormGuangzhouStock(10);
    setFormHkAirStock(5);
    setFormReservedStock(0);
    setFormLowStockThreshold(10);
    setFormReorderPoint(15);
    setFormUnitCost(45.0);
    setFormSupplierCode(`SUP-SZ-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormSku(item.sku);
    setFormProductTitle(item.productTitle);
    setFormVariantTitle(item.variantTitle);
    setFormCategory(item.category);
    setFormShenzhenStock(item.shenzhenStock);
    setFormGuangzhouStock(item.guangzhouStock);
    setFormHkAirStock(item.hkAirStock);
    setFormReservedStock(item.reservedStock);
    setFormLowStockThreshold(item.lowStockThreshold);
    setFormReorderPoint(item.reorderPoint);
    setFormUnitCost(item.unitCost);
    setFormSupplierCode(item.supplierCode);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formProductTitle.trim()) {
      showToast("SKU and Product Title are required.");
      return;
    }

    const total = Number(formShenzhenStock) + Number(formGuangzhouStock) + Number(formHkAirStock);
    let status: InventoryItem["status"] = "in_stock";
    if (total <= 0) {
      status = "out_of_stock";
    } else if (total <= Number(formLowStockThreshold)) {
      status = "low_stock";
    }

    if (selectedItem) {
      setInventory((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                sku: formSku.trim(),
                productTitle: formProductTitle.trim(),
                variantTitle: formVariantTitle.trim(),
                category: formCategory,
                shenzhenStock: Number(formShenzhenStock),
                guangzhouStock: Number(formGuangzhouStock),
                hkAirStock: Number(formHkAirStock),
                totalStock: total,
                reservedStock: Number(formReservedStock),
                lowStockThreshold: Number(formLowStockThreshold),
                reorderPoint: Number(formReorderPoint),
                unitCost: Number(formUnitCost),
                status,
                supplierCode: formSupplierCode.trim(),
              }
            : i
        )
      );
      showToast(`SKU ${formSku} updated.`);
    } else {
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        sku: formSku.trim(),
        productTitle: formProductTitle.trim(),
        variantTitle: formVariantTitle.trim(),
        category: formCategory,
        shenzhenStock: Number(formShenzhenStock),
        guangzhouStock: Number(formGuangzhouStock),
        hkAirStock: Number(formHkAirStock),
        totalStock: total,
        reservedStock: Number(formReservedStock),
        lowStockThreshold: Number(formLowStockThreshold),
        reorderPoint: Number(formReorderPoint),
        unitCost: Number(formUnitCost),
        status,
        supplierCode: formSupplierCode.trim(),
        lastRestocked: new Date().toISOString(),
      };
      setInventory((prev) => [newItem, ...prev]);
      showToast(`SKU ${formSku} registered in inventory.`);
    }

    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete SKU ${item.sku}?`,
      description: `Are you sure you want to remove this SKU record from inventory tracking?`,
      onConfirm: () => {
        setInventory((prev) => prev.filter((i) => i.id !== item.id));
        showToast(`SKU ${item.sku} deleted.`);
      },
    });
  };

  // Metrics
  const totalSkus = inventory.length;
  const totalStockUnits = inventory.reduce((sum, i) => sum + i.totalStock, 0);
  const lowStockCount = inventory.filter((i) => i.status === "low_stock" || i.status === "out_of_stock").length;
  const totalAssetValue = inventory.reduce((sum, i) => sum + i.totalStock * i.unitCost, 0);

  // Status Tone Helper
  const getStatusTone = (status: InventoryItem["status"]): BadgeTone => {
    switch (status) {
      case "in_stock":
        return "emerald";
      case "low_stock":
        return "amber";
      case "out_of_stock":
        return "red";
      case "reordering":
        return "blue";
      default:
        return "slate";
    }
  };

  // Columns
  const columns: Column<InventoryItem>[] = [
    {
      header: "SKU / Item",
      accessorKey: "sku",
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-white bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            {row.sku}
          </span>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            {row.category}
          </div>
        </div>
      ),
    },
    {
      header: "Product & Variant",
      accessorKey: "productTitle",
      sortable: true,
      cell: (row) => (
        <div className="max-w-xs">
          <div className="text-xs font-bold text-slate-200 truncate hover:text-white transition-colors">
            {row.productTitle}
          </div>
          <div className="text-[11px] text-red-400 font-medium mt-0.5">
            {row.variantTitle}
          </div>
        </div>
      ),
    },
    {
      header: "Shenzhen Hub",
      accessorKey: "shenzhenStock",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-bold text-slate-200">{row.shenzhenStock}</span>
        </div>
      ),
    },
    {
      header: "Guangzhou Central",
      accessorKey: "guangzhouStock",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <Warehouse className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="font-bold text-slate-200">{row.guangzhouStock}</span>
        </div>
      ),
    },
    {
      header: "HK Air Hub",
      accessorKey: "hkAirStock",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <Plane className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-bold text-slate-200">{row.hkAirStock}</span>
        </div>
      ),
    },
    {
      header: "Total Stock",
      accessorKey: "totalStock",
      sortable: true,
      cell: (row) => (
        <span
          className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg border ${
            row.totalStock <= 0
              ? "bg-red-950/60 text-red-300 border-red-800/60"
              : row.totalStock <= row.lowStockThreshold
              ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
              : "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
          }`}
        >
          {row.totalStock} units
        </span>
      ),
    },
    {
      header: "Reserved",
      accessorKey: "reservedStock",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-400">
          {row.reservedStock > 0 ? (
            <span className="text-amber-400 font-bold">{row.reservedStock} held</span>
          ) : (
            "—"
          )}
        </span>
      ),
    },
    {
      header: "Stock Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => (
        <StatusBadge
          status={row.status}
          tone={getStatusTone(row.status)}
          label={row.status.replace(/_/g, " ")}
        />
      ),
    },
    {
      header: "Supplier Code",
      accessorKey: "supplierCode",
      cell: (row) => (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-red-300 bg-red-950/30 border border-red-800/40 px-2 py-0.5 rounded-md">
          <Lock className="w-2.5 h-2.5 text-red-400" />
          {row.supplierCode}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenAdjustModal(row)}
            className="p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 hover:text-blue-200 border border-blue-800/50 transition-colors"
            title="Quick Stock Adjustment"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditItem(row)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Edit SKU Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteItem(row)}
            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-800/50 transition-colors"
            title="Delete SKU Record"
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
      label: "Stock Level",
      options: [
        { value: "all", label: "All Stock Levels" },
        { value: "in_stock", label: "In Stock (Healthy)" },
        { value: "low_stock", label: "Low Stock Alert" },
        { value: "out_of_stock", label: "Out of Stock" },
        { value: "reordering", label: "PO Reordering" },
      ],
    },
  ];

  // Bulk Actions
  const bulkActions: BulkAction<InventoryItem>[] = [
    {
      label: "Batch Reorder PO",
      variant: "default",
      icon: Truck,
      onClick: (selectedRows) => {
        const ids = new Set(selectedRows.map((r) => r.id));
        setInventory((prev) =>
          prev.map((i) => (ids.has(i.id) ? { ...i, status: "reordering" } : i))
        );
        showToast(`Triggered batch reorder PO for ${selectedRows.length} items.`);
      },
    },
    {
      label: "Mark as In Stock",
      variant: "success",
      icon: CheckCircle2,
      onClick: (selectedRows) => {
        const ids = new Set(selectedRows.map((r) => r.id));
        setInventory((prev) =>
          prev.map((i) => (ids.has(i.id) ? { ...i, status: "in_stock" } : i))
        );
        showToast(`Marked ${selectedRows.length} items as In Stock.`);
      },
    },
    {
      label: "Delete Selected",
      variant: "danger",
      icon: Trash2,
      onClick: (selectedRows) => {
        setConfirmDialog({
          isOpen: true,
          title: `Delete ${selectedRows.length} Inventory Records?`,
          description: `This will remove inventory tracking for selected SKUs.`,
          onConfirm: () => {
            const ids = new Set(selectedRows.map((r) => r.id));
            setInventory((prev) => prev.filter((i) => !ids.has(i.id)));
            showToast(`Deleted ${selectedRows.length} inventory records.`);
          },
        });
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header */}
      <AdminPageHeader
        title="Multi-Warehouse Inventory"
        subtitle="Real-time multi-depot stock sync across Shenzhen Bao'an, Guangzhou Hub, and HK Air Gateway."
        badge={{ text: "MULTI-HUB SYNC", variant: "emerald" }}
        breadcrumbs={[
          { label: "Catalogue", href: "/admin/products" },
          { label: "Inventory" },
        ]}
        actions={[
          {
            label: "Stock Adjustment",
            icon: ArrowUpDown,
            variant: "secondary",
            onClick: () => handleOpenAdjustModal(),
          },
          {
            label: "Add SKU Item",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreateItem,
          },
        ]}
      />

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Tracked SKUs
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {totalSkus}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Stock Units
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {totalStockUnits}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Low / Zero Stock Alerts
            </span>
            <span className={`text-2xl font-black font-mono mt-1 block ${lowStockCount > 0 ? "text-red-400" : "text-slate-400"}`}>
              {lowStockCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Inventory Value (USDT)
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
              ${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <AdminDataTable
        data={inventory}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by SKU, product name, variant, or supplier code..."
        searchFields={["sku", "productTitle", "variantTitle", "supplierCode", "category"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="totalStock"
        defaultSortDirection="asc"
        emptyTitle="No inventory items found"
        emptyDescription="Add SKUs or adjust your search filters to view inventory stock."
        emptyAction={{
          label: "Add SKU Item",
          onClick: handleOpenCreateItem,
        }}
      />

      {/* 4. Quick Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Stock Adjustment: ${selectedItem?.sku || "Inventory"}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4 pt-2">
          {selectedItem && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-white block">{selectedItem.productTitle}</span>
              <span className="text-slate-400">{selectedItem.variantTitle}</span>
              <div className="flex gap-4 pt-1 font-mono text-[11px]">
                <span className="text-blue-400">Shenzhen: {selectedItem.shenzhenStock}</span>
                <span className="text-purple-400">Guangzhou: {selectedItem.guangzhouStock}</span>
                <span className="text-amber-400">HK Air: {selectedItem.hkAirStock}</span>
              </div>
            </div>
          )}

          {/* Warehouse Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Target Warehouse Hub</label>
            <select
              value={adjustWarehouse}
              onChange={(e) => setAdjustWarehouse(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
            >
              <option value="shenzhenStock">Shenzhen Bao'an Hub (Main QC)</option>
              <option value="guangzhouStock">Guangzhou Central Depot</option>
              <option value="hkAirStock">HK Air Cargo Gateway</option>
            </select>
          </div>

          {/* Operation & Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Operation</label>
              <select
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
              >
                <option value="add">+ Add Received Units</option>
                <option value="subtract">- Deduct Units (Damaged/Lost)</option>
                <option value="set">= Set Exact Count (Audit)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Quantity</label>
              <input
                type="number"
                min="1"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#FF1028]"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Adjustment Reason / Reference</label>
            <input
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Batch received from 1688 supplier"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
              required
            />
          </div>

          {/* Submit Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors shadow-lg shadow-red-950/50"
            >
              Confirm Stock Update
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Create / Edit Full SKU Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={selectedItem ? `Edit SKU Details: ${selectedItem.sku}` : "Register New SKU Item"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4 pt-2">
          {/* SKU & Product Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                SKU Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                placeholder="e.g. EAC-EX5-1BAT"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#FF1028]"
                required
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Product Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formProductTitle}
                onChange={(e) => setFormProductTitle(e.target.value)}
                placeholder="e.g. Eachine EX5 4K GPS Drone"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
                required
              />
            </div>
          </div>

          {/* Variant Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Variant Option</label>
              <input
                type="text"
                value={formVariantTitle}
                onChange={(e) => setFormVariantTitle(e.target.value)}
                placeholder="e.g. 1 Battery / Standard"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Category</label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="e.g. RC Drones & Toys"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>
          </div>

          {/* Warehouse Stock Grid */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
              Multi-Warehouse Quantities
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                  <Building className="w-3 h-3" /> Shenzhen
                </label>
                <input
                  type="number"
                  min="0"
                  value={formShenzhenStock}
                  onChange={(e) => setFormShenzhenStock(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 outline-none font-mono focus:border-[#FF1028]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                  <Warehouse className="w-3 h-3" /> Guangzhou
                </label>
                <input
                  type="number"
                  min="0"
                  value={formGuangzhouStock}
                  onChange={(e) => setFormGuangzhouStock(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 outline-none font-mono focus:border-[#FF1028]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Plane className="w-3 h-3" /> HK Air Hub
                </label>
                <input
                  type="number"
                  min="0"
                  value={formHkAirStock}
                  onChange={(e) => setFormHkAirStock(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 outline-none font-mono focus:border-[#FF1028]"
                />
              </div>
            </div>
          </div>

          {/* Thresholds & Sourcing Secrets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Low Stock Alert Level</label>
              <input
                type="number"
                min="0"
                value={formLowStockThreshold}
                onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#FF1028]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Unit Cost (USDT)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formUnitCost}
                onChange={(e) => setFormUnitCost(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#FF1028]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-red-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Supplier Code
              </label>
              <input
                type="text"
                value={formSupplierCode}
                onChange={(e) => setFormSupplierCode(e.target.value)}
                placeholder="SUP-SZ-9021"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#FF1028]"
              />
            </div>
          </div>

          {/* Submit Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors shadow-lg shadow-red-950/50"
            >
              {selectedItem ? "Save SKU Changes" : "Create SKU Item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel="Delete SKU"
        variant="danger"
      />

      {/* 7. Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-400/40">
          <span>✓ {toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 ml-2"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
