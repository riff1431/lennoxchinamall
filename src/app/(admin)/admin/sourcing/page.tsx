"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Lock,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminDataTable,
  Column,
  FilterOption,
  BulkAction,
} from "@/components/admin/AdminDataTable";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { MOCK_SOURCING_POS, SourcingPO } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/utils/helpers";

export default function AdminSourcingPage() {
  const [purchaseOrders, setPurchaseOrders] =
    useState<SourcingPO[]>(MOCK_SOURCING_POS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<SourcingPO | null>(null);
  const [viewingPO, setViewingPO] = useState<SourcingPO | null>(null);

  // Delete confirm dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPOId, setDeletingPOId] = useState<string | null>(null);

  // Form Fields State
  const [poNumber, setPoNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierPlatform, setSupplierPlatform] = useState("1688 Direct B2B");
  const [supplierItemUrl, setSupplierItemUrl] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [factoryUnitCost, setFactoryUnitCost] = useState(0);
  const [buyerAdmin, setBuyerAdmin] = useState("Arifur (Shenzhen Lead)");
  const [status, setStatus] = useState<SourcingPO["status"]>("pending_po");
  const [trackingOrPoRef, setTrackingOrPoRef] = useState("");
  const [expectedDeliveryToHub, setExpectedDeliveryToHub] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    setEditingPO(null);
    setPoNumber(`PO-${today}-${randomSuffix}`);
    setOrderNumber(`LCM-${today}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    setSupplierCode("SUP-SZ-9021");
    setSupplierName("Shenzhen Factory Automation Tech");
    setSupplierPlatform("1688 Direct B2B");
    setSupplierItemUrl("https://1688.com/item/direct-sourcing.html");
    setProductTitle("");
    setQuantity(1);
    setFactoryUnitCost(35.0);
    setBuyerAdmin("Arifur (Shenzhen Lead)");
    setStatus("ordered");
    setTrackingOrPoRef(`1688-PO-${Math.floor(1000000 + Math.random() * 9000000)}`);
    setExpectedDeliveryToHub("Aug 28, 2026");
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (po: SourcingPO) => {
    setEditingPO(po);
    setPoNumber(po.poNumber);
    setOrderNumber(po.orderNumber);
    setSupplierCode(po.supplierCode);
    setSupplierName(po.supplierName);
    setSupplierPlatform(po.supplierPlatform);
    setSupplierItemUrl(po.supplierItemUrl);
    setProductTitle(po.productTitle);
    setQuantity(po.quantity);
    setFactoryUnitCost(po.factoryUnitCost);
    setBuyerAdmin(po.buyerAdmin);
    setStatus(po.status);
    setTrackingOrPoRef(po.trackingOrPoRef);
    setExpectedDeliveryToHub(po.expectedDeliveryToHub);
    setIsFormModalOpen(true);
  };

  // Save (Create or Update)
  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle.trim()) {
      showToast("Please provide a valid product title.");
      return;
    }

    const calculatedTotal = parseFloat((quantity * factoryUnitCost).toFixed(2));

    if (editingPO) {
      setPurchaseOrders((prev) =>
        prev.map((item) =>
          item.id === editingPO.id
            ? {
                ...item,
                poNumber,
                orderNumber,
                supplierCode,
                supplierName,
                supplierPlatform,
                supplierItemUrl,
                productTitle,
                quantity: Number(quantity),
                factoryUnitCost: Number(factoryUnitCost),
                totalCostUSDT: calculatedTotal,
                buyerAdmin,
                status,
                trackingOrPoRef,
                expectedDeliveryToHub,
              }
            : item
        )
      );
      showToast(`Purchase Order ${poNumber} updated successfully.`);
    } else {
      const newPO: SourcingPO = {
        id: `po-${Date.now()}`,
        poNumber,
        orderNumber,
        supplierCode,
        supplierName,
        supplierPlatform,
        supplierItemUrl,
        productTitle,
        quantity: Number(quantity),
        factoryUnitCost: Number(factoryUnitCost),
        totalCostUSDT: calculatedTotal,
        buyerAdmin,
        status,
        trackingOrPoRef,
        orderDate: new Date().toISOString(),
        expectedDeliveryToHub: expectedDeliveryToHub || "3-5 days to hub",
      };
      setPurchaseOrders((prev) => [newPO, ...prev]);
      showToast(`New Purchase Order ${poNumber} placed with factory!`);
    }

    setIsFormModalOpen(false);
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    if (!deletingPOId) return;
    setPurchaseOrders((prev) => prev.filter((item) => item.id !== deletingPOId));
    showToast("Purchase order deleted.");
    setDeletingPOId(null);
  };

  // Status mapping for badge tones
  const getStatusTone = (st: SourcingPO["status"]): BadgeTone => {
    switch (st) {
      case "pending_po":
        return "amber";
      case "ordered":
        return "blue";
      case "factory_dispatched":
        return "purple";
      case "qc_received":
        return "emerald";
      case "issue":
        return "red";
      default:
        return "slate";
    }
  };

  const getStatusLabel = (st: SourcingPO["status"]): string => {
    switch (st) {
      case "pending_po":
        return "Pending PO";
      case "ordered":
        return "Ordered";
      case "factory_dispatched":
        return "Factory Dispatched";
      case "qc_received":
        return "QC Received";
      case "issue":
        return "Issue Reported";
      default:
        return st;
    }
  };

  // KPI Calculations
  const totalSpend = purchaseOrders.reduce(
    (sum, po) => sum + po.totalCostUSDT,
    0
  );
  const pendingCount = purchaseOrders.filter(
    (po) => po.status === "pending_po" || po.status === "ordered"
  ).length;
  const qcReceivedCount = purchaseOrders.filter(
    (po) => po.status === "qc_received"
  ).length;

  // AdminDataTable Column definitions
  const columns: Column<SourcingPO>[] = [
    {
      header: "PO Number",
      accessorKey: "poNumber",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-slate-900 dark:text-white block text-xs">
            {row.poNumber}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {formatDate(row.orderDate)}
          </span>
        </div>
      ),
    },
    {
      header: "Order #",
      accessorKey: "orderNumber",
      sortable: true,
      cell: (row) => (
        <Link
          href={`/admin/orders`}
          className="font-mono text-slate-700 dark:text-slate-300 hover:text-[#2F65F6] transition-colors text-xs font-semibold"
        >
          {row.orderNumber}
        </Link>
      ),
    },
    {
      header: "Supplier Code",
      accessorKey: "supplierCode",
      sortable: true,
      cell: (row) => (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400 bg-[#FFF8EE] dark:bg-amber-950/60 border border-[#FED7AA]/60 px-2 py-0.5 rounded-full text-[11px]">
          <Lock className="w-3 h-3 text-amber-500 shrink-0" />
          <span>{row.supplierCode}</span>
        </span>
      ),
    },
    {
      header: "Supplier & Platform",
      accessorKey: "supplierName",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5 max-w-[180px]">
          <span className="font-bold text-slate-900 dark:text-slate-200 block truncate text-xs">
            {row.supplierName}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
            {row.supplierPlatform}
          </span>
        </div>
      ),
    },
    {
      header: "Product Item",
      accessorKey: "productTitle",
      sortable: true,
      cell: (row) => (
        <div className="max-w-[200px]">
          <span
            className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1 text-xs block"
            title={row.productTitle}
          >
            {row.productTitle}
          </span>
          {row.supplierItemUrl && (
            <a
              href={row.supplierItemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#2F65F6] hover:underline inline-flex items-center gap-1 mt-0.5 font-semibold"
            >
              <span>1688 Sourcing Link</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      ),
    },
    {
      header: "Qty",
      accessorKey: "quantity",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-center block">
          {row.quantity}
        </span>
      ),
    },
    {
      header: "Unit Cost",
      accessorKey: "factoryUnitCost",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
          ${row.factoryUnitCost.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Total (USDT)",
      accessorKey: "totalCostUSDT",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
          {formatCurrency(row.totalCostUSDT)}
        </span>
      ),
    },
    {
      header: "Buyer Admin",
      accessorKey: "buyerAdmin",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">
          {row.buyerAdmin}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => (
        <StatusBadge
          status={row.status}
          tone={getStatusTone(row.status)}
          label={getStatusLabel(row.status)}
        />
      ),
    },
    {
      header: "Tracking / PO Ref",
      accessorKey: "trackingOrPoRef",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px] block truncate max-w-[120px]">
          {row.trackingOrPoRef || "—"}
        </span>
      ),
    },
    {
      header: "Hub ETA",
      accessorKey: "expectedDeliveryToHub",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          {row.expectedDeliveryToHub}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewingPO(row)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2F65F6] hover:text-white text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Edit Purchase Order"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setDeletingPOId(row.id);
              setIsDeleteDialogOpen(true);
            }}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Delete Purchase Order"
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
      label: "Status",
      options: [
        { value: "pending_po", label: "Pending PO" },
        { value: "ordered", label: "Ordered" },
        { value: "factory_dispatched", label: "Factory Dispatched" },
        { value: "qc_received", label: "QC Received" },
        { value: "issue", label: "Issue Reported" },
      ],
    },
    {
      key: "supplierPlatform",
      label: "Platform",
      options: [
        { value: "1688 Direct B2B", label: "1688 Direct B2B" },
        { value: "AliExpress Wholesale", label: "AliExpress Wholesale" },
        { value: "Taobao Factory", label: "Taobao Factory" },
      ],
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<SourcingPO>[] = [
    {
      label: "Mark as Ordered",
      icon: CheckCircle2,
      variant: "success",
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map((r) => r.id));
        setPurchaseOrders((prev) =>
          prev.map((po) =>
            selectedIds.has(po.id) ? { ...po, status: "ordered" } : po
          )
        );
        showToast(
          `Marked ${selectedRows.length} purchase orders as "Ordered".`
        );
      },
    },
    {
      label: "Mark as QC Received",
      icon: ShieldCheck,
      variant: "default",
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map((r) => r.id));
        setPurchaseOrders((prev) =>
          prev.map((po) =>
            selectedIds.has(po.id) ? { ...po, status: "qc_received" } : po
          )
        );
        showToast(
          `Marked ${selectedRows.length} purchase orders as "QC Received".`
        );
      },
    },
    {
      label: "Delete Selected",
      icon: Trash2,
      variant: "danger",
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map((r) => r.id));
        setPurchaseOrders((prev) =>
          prev.filter((po) => !selectedIds.has(po.id))
        );
        showToast(`Deleted ${selectedRows.length} purchase orders.`);
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Sourcing &amp; Purchase Orders"
        subtitle="Direct B2B factory procurement pipeline across Shenzhen, Ningbo &amp; Guangzhou manufacturing hubs."
        badge={{ text: "B2B Procurement OS", variant: "blue" }}
        breadcrumbs={[{ label: "Sourcing & Purchases" }]}
        actions={[
          {
            label: "New Purchase Order",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreateModal,
          },
        ]}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-[#DCFCE7] dark:bg-emerald-950 border border-[#BBF7D0] dark:border-emerald-800 text-[#16A34A] dark:text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm cursor-pointer">×</button>
        </div>
      )}

      {/* ── 2. Top 4 Pastel KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total PO Pipeline
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {purchaseOrders.length} POs
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Across 3 Direct China Factory Platforms</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Factory Sourcing Spend
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {formatCurrency(totalSpend)}
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Direct Factory Settlement (USDT)</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Pending / In Production
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {pendingCount} Orders
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Awaiting dispatch or tracking ref</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F3E8FF] dark:bg-[#28183B] border border-[#E9D5FF]/50 dark:border-purple-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              QC Received at Hub
            </span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {qcReceivedCount} Batches
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Shenzhen Sorting Center Ready</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <AdminDataTable
        data={purchaseOrders}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by PO #, Order #, Supplier Code, or Product..."
        searchFields={[
          "poNumber",
          "orderNumber",
          "supplierCode",
          "supplierName",
          "productTitle",
          "buyerAdmin",
          "trackingOrPoRef",
        ]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="poNumber"
        defaultSortDirection="desc"
        emptyTitle="No purchase orders found"
        emptyDescription="Try adjusting your search criteria or create a new factory purchase order."
        emptyAction={{
          label: "New Purchase Order",
          onClick: handleOpenCreateModal,
        }}
      />

      {/* ── 4. Create / Edit Sourcing PO Modal ── */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingPO ? `Edit Purchase Order — ${editingPO.poNumber}` : "Create Sourcing Purchase Order (PO)"}
        size="xl"
      >
        <form onSubmit={handleSavePO} className="space-y-5 text-xs text-slate-800 dark:text-slate-200">
          {/* Secret Sourcing Callout */}
          <div className="p-3.5 bg-[#FFF8EE] dark:bg-amber-950/40 rounded-2xl border border-[#FED7AA]/60 dark:border-amber-800/60 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-700 dark:text-amber-300 uppercase text-[10px] tracking-wider block">
                Private Factory Sourcing Guard (PRD §6.3)
              </span>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                Factory unit cost and supplier secret codes are strictly confidential to procurement admins and will never be exposed to public buyer accounts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                PO Reference Number *
              </label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Customer Order Number *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Secret Supplier Code *
              </label>
              <input
                type="text"
                required
                value={supplierCode}
                onChange={(e) => setSupplierCode(e.target.value)}
                placeholder="e.g. SUP-SZ-9021"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Factory Corporate Name *
              </label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Shenzhen BlitzWolf Acoustic Tech"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Procurement Platform *
              </label>
              <select
                value={supplierPlatform}
                onChange={(e) => setSupplierPlatform(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="1688 Direct B2B">1688 Direct B2B</option>
                <option value="AliExpress Wholesale">AliExpress Wholesale</option>
                <option value="Taobao Factory">Taobao Factory</option>
                <option value="Direct Factory Contract">Direct Factory Contract</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                1688 / Direct Factory Item Link
              </label>
              <input
                type="url"
                value={supplierItemUrl}
                onChange={(e) => setSupplierItemUrl(e.target.value)}
                placeholder="https://1688.com/item/..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Product Title &amp; Sourcing Specification *
              </label>
              <input
                type="text"
                required
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="e.g. Eachine EX5 4K GPS FPV Brushless Drone (1 Battery)"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Quantity Sourced *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Factory Unit Cost (USDT) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={factoryUnitCost}
                onChange={(e) => setFactoryUnitCost(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="sm:col-span-2 p-3 bg-[#F0FDF4] dark:bg-emerald-950/60 rounded-xl border border-[#BBF7D0]/60 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                Calculated Total Factory Cost (USDT):
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black text-sm">
                ${(quantity * factoryUnitCost).toFixed(2)} USDT
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Assigned Buyer Admin *
              </label>
              <input
                type="text"
                required
                value={buyerAdmin}
                onChange={(e) => setBuyerAdmin(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                PO Lifecycle Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SourcingPO["status"])}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="pending_po">Pending PO Submission</option>
                <option value="ordered">Ordered / Factory Processing</option>
                <option value="factory_dispatched">Factory Dispatched</option>
                <option value="qc_received">QC Received at Shenzhen Hub</option>
                <option value="issue">Issue Reported</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Tracking / 1688 PO Ref
              </label>
              <input
                type="text"
                value={trackingOrPoRef}
                onChange={(e) => setTrackingOrPoRef(e.target.value)}
                placeholder="e.g. 1688-PO-8829104 or SF-8891204899CN"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Expected Delivery to Hub
              </label>
              <input
                type="text"
                value={expectedDeliveryToHub}
                onChange={(e) => setExpectedDeliveryToHub(e.target.value)}
                placeholder="e.g. Aug 28, 2026"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          {/* Submit Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] transition-colors cursor-pointer shadow-blue-500/25 shadow-xs"
            >
              {editingPO ? "Save Changes" : "Submit Factory PO"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Detailed PO Inspect Modal ── */}
      {viewingPO && (
        <Modal
          isOpen={!!viewingPO}
          onClose={() => setViewingPO(null)}
          title={`Purchase Order Dossier — ${viewingPO.poNumber}`}
          size="lg"
        >
          <div className="space-y-5 text-xs text-slate-800 dark:text-slate-200">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {viewingPO.poNumber}
                </span>
                <StatusBadge
                  status={viewingPO.status}
                  tone={getStatusTone(viewingPO.status)}
                  label={getStatusLabel(viewingPO.status)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Customer Order Ref:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {viewingPO.orderNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">PO Date:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {formatDate(viewingPO.orderDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Buyer Admin:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    {viewingPO.buyerAdmin}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Hub ETA:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {viewingPO.expectedDeliveryToHub}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider block border-b border-slate-200 dark:border-slate-800 pb-1">
                Factory &amp; Supplier Intelligence
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Secret Supplier Code:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-[#FFF8EE] dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-[#FED7AA]/60 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {viewingPO.supplierCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Factory Corporate Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingPO.supplierName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Platform:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {viewingPO.supplierPlatform}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Domestic Tracking Ref:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {viewingPO.trackingOrPoRef || "Pending Dispatch"}
                  </span>
                </div>
              </div>

              {viewingPO.supplierItemUrl && (
                <div className="pt-2">
                  <a
                    href={viewingPO.supplierItemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-[#2F65F6] hover:bg-[#2563EB] text-white rounded-xl font-bold text-center block transition-colors shadow-blue-500/25 shadow-xs"
                  >
                    Open 1688 Factory Listing ↗
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider block border-b border-slate-200 dark:border-slate-800 pb-1">
                Hardware Product Breakdown
              </span>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block font-heading">
                  {viewingPO.productTitle}
                </span>
                <div className="flex justify-between pt-1 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Quantity Sourced:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {viewingPO.quantity} units
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Unit Factory Cost:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ${viewingPO.factoryUnitCost.toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">
                    Total Sourcing Settlement:
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-sm">
                    {formatCurrency(viewingPO.totalCostUSDT)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const po = viewingPO;
                  setViewingPO(null);
                  handleOpenEditModal(po);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] cursor-pointer shadow-blue-500/25 shadow-xs"
              >
                Edit PO
              </button>
              <button
                type="button"
                onClick={() => setViewingPO(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 6. Delete Confirmation Dialog ── */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Purchase Order"
        description="Are you sure you want to remove this factory purchase order? This record will be permanently deleted from the procurement ledger."
        confirmLabel="Delete PO"
        variant="danger"
      />
    </div>
  );
}
