"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  ExternalLink,
  Coins,
  Plane,
  RotateCcw,
  Printer,
  Send,
  Download,
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
  AdminFormSection,
} from "@/components/admin/forms";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { MOCK_ORDERS } from "@/lib/mockData";
import { Order, OrderStatus } from "@/types/database";
import { getAdminOrders, updateOrderStatus, updateTrackingInfo } from "@/app/actions/admin-orders";

export default function AdminOrdersPage() {
  const toast = useAdminToast();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [isLoading, setIsLoading] = useState(false);

  // Selected Order for SlideOver Details & Refund Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  // Editable fields in detail slide-over
  const [editStatus, setEditStatus] = useState<OrderStatus>("paid");
  const [trackingNumber, setTrackingNumber] = useState("YUN-982741920-US");
  const [carrier, setCarrier] = useState("YunExpress Air Cargo");
  const [internalNoteInput, setInternalNoteInput] = useState("");
  const [notesList, setNotesList] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    {
      id: "n-1",
      author: "Admin (Procurement Desk)",
      text: "Factory PO dispatched to Guangzhou supplier (SUP-GZ-4419). Unit batch tested on electronics bench.",
      time: "Aug 22, 14:30",
    },
  ]);

  // Refund Form State
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("Factory transit defect");

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminOrders({});
      if (res.success) {
        setOrders(res.orders);
      }
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setTrackingNumber(order.tracking_number || "YUN-982741920-US");
    setCarrier(order.shipping_carrier || "YunExpress Air Cargo");
    setIsSlideOverOpen(true);
  };

  const handleOpenRefund = (order: Order) => {
    setSelectedOrder(order);
    setRefundAmount(order.total);
    setIsRefundModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    try {
      const res = await updateOrderStatus(selectedOrder.id, editStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: editStatus } : o))
        );
        toast.success(`Order #${selectedOrder.order_number} status updated to "${editStatus}".`);
      }
    } catch {
      toast.error("Failed to update order status.");
    }
    setIsSlideOverOpen(false);
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    try {
      const res = await updateTrackingInfo(selectedOrder.id, trackingNumber, carrier);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? { ...o, tracking_number: trackingNumber, shipping_carrier: carrier }
              : o
          )
        );
        toast.success(`Tracking dispatched for #${selectedOrder.order_number}.`);
      }
    } catch {
      toast.error("Failed to dispatch tracking.");
    }
  };

  const handleAddInternalNote = () => {
    if (!internalNoteInput.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      author: "Admin (Direct Console)",
      text: internalNoteInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setNotesList([newNote, ...notesList]);
    setInternalNoteInput("");
    toast.info("Internal fulfillment log recorded.");
  };

  const handleExecuteRefund = () => {
    if (!selectedOrder) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: "refunded" as OrderStatus } : o))
    );
    toast.success(`USDT settlement reversed. Refunded $${refundAmount} for #${selectedOrder.order_number}.`);
    setIsRefundModalOpen(false);
  };

  // Metrics
  const totalSettledRevenue = orders.reduce((sum, o) => sum + (o.status !== "refunded" ? o.total : 0), 0);
  const paidOrders = orders.filter((o) => o.status === "paid").length;
  const sourcingOrders = orders.filter((o) => o.status === "sourcing").length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;

  const tableFilters: FilterOption[] = [
    {
      key: "status",
      label: "Fulfillment Status",
      options: [
        { value: "paid", label: "USDT Paid" },
        { value: "sourcing", label: "Factory Sourcing" },
        { value: "shipped", label: "Air Cargo Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "refunded", label: "Refunded" },
      ],
    },
  ];

  const bulkActions: BulkAction<Order>[] = [
    {
      label: "Mark As Sourced",
      icon: CheckCircle2,
      variant: "success",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setOrders((prev) =>
          prev.map((o) => (ids.has(o.id) ? { ...o, status: "sourcing" as OrderStatus } : o))
        );
        toast.success(`Moved ${selected.length} orders to Factory Sourcing.`);
      },
    },
    {
      label: "Export Selected",
      icon: Download,
      variant: "default",
      onClick: (selected) => {
        const headers = "OrderNumber,Total,Status,Date\n";
        const rows = selected.map((o) => `"${o.order_number}",${o.total},"${o.status}","${o.created_at}"`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "orders_export.csv";
        a.click();
        toast.success(`Exported ${selected.length} orders to CSV.`);
      },
    },
  ];

  const orderColumns: Column<Order>[] = [
    {
      header: "Order #",
      accessorKey: "order_number",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
          #{row.order_number}
        </span>
      ),
    },
    {
      header: "Date Placed",
      accessorKey: "created_at",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      header: "Customer & Destination",
      cell: (row) => {
        const addr = typeof row.shipping_address === "object" && row.shipping_address !== null
          ? (row.shipping_address as Record<string, string>)
          : {};
        return (
          <div>
            <span className="font-bold text-slate-900 dark:text-white block font-heading text-xs">
              {addr.first_name ? `${addr.first_name} ${addr.last_name || ""}` : "Alex Harrison"}
            </span>
            <span className="text-[10px] text-slate-400">
              {addr.city ? `${addr.city}, ${addr.country || "USA"}` : "San Francisco, USA"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Items",
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-200 block line-clamp-1">
            {row.items?.[0]?.product_title || "Eachine EX5 4K Drone"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.items?.length || 1} line item(s)
          </span>
        </div>
      ),
    },
    {
      header: "Settlement",
      accessorKey: "total",
      sortable: true,
      cell: (row) => (
        <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-xs">
          {formatCurrency(row.total)}
        </span>
      ),
    },
    {
      header: "Fulfillment Status",
      accessorKey: "status",
      cell: (row) => {
        const tone: BadgeTone =
          row.status === "paid"
            ? "emerald"
            : row.status === "sourcing"
            ? "amber"
            : row.status === "shipped"
            ? "blue"
            : row.status === "delivered"
            ? "purple"
            : "rose";
        return <StatusBadge status={row.status} tone={tone} />;
      },
    },
    {
      header: "Tracking",
      accessorKey: "tracking_number",
      cell: (row) =>
        row.tracking_number ? (
          <span className="font-mono text-[11px] text-[#2F65F6] font-bold">
            {row.tracking_number}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
        ),
    },
    {
      header: "Actions",
      className: "text-right w-20",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end">
          <AdminActionMenu
            itemTitle={`Order #${row.order_number}`}
            onView={() => handleOpenDetail(row)}
            onEdit={() => handleOpenDetail(row)}
            customActions={[
              {
                label: "Print Invoice",
                icon: Printer,
                onClick: () => window.print(),
              },
              {
                label: "Reverse USDT Settlement",
                icon: RotateCcw,
                variant: "danger",
                onClick: () => handleOpenRefund(row),
                divider: true,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Orders & Sourcing Operations"
        subtitle="Track real-time USDT settlements, factory procurement purchase orders, and air cargo waybills."
        badge={{ text: `${orders.length} Live Orders`, variant: "emerald" }}
        breadcrumbs={[
          { label: "Orders & Fulfilment", href: "/admin/orders" },
          { label: "All Orders" },
        ]}
        actions={[
          {
            label: "Print Manifest",
            icon: Printer,
            variant: "secondary",
            onClick: () => window.print(),
          },
        ]}
      />

      {/* ── 2. Top Metric KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Order Volume
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {orders.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Settled Volume
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {formatCurrency(totalSettledRevenue)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Factory Sourcing
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {sourcingOrders + paidOrders}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F3E8FF] dark:bg-[#28183B] border border-[#E9D5FF]/50 dark:border-purple-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Air Dispatched
            </span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {shippedOrders}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
            <Plane className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Reusable AdminDataTable ── */}
      <AdminDataTable<Order>
        data={orders}
        columns={orderColumns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by Order #, Customer, or Line Items..."
        searchFields={["order_number", "id"]}
        filters={tableFilters}
        bulkActions={bulkActions}
        defaultSortKey="created_at"
        defaultSortDirection="desc"
        isLoading={isLoading}
        emptyTitle="No orders found"
        emptyDescription="There are no customer orders matching your current criteria."
      />

      {/* ── 4. Slide-Over Panel: Order Fulfillment Inspector ── */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={`Order #${selectedOrder?.order_number || ""}`}
        description="Fulfillment details, factory sourcing logs, and air cargo dispatch."
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                if (selectedOrder) handleOpenRefund(selectedOrder);
              }}
              className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition-colors cursor-pointer"
            >
              Issue Refund
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSlideOverOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        }
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status & Sourcing Control */}
            <AdminFormSection title="Fulfillment Stage">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminSelect
                  label="Update Pipeline Stage"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                  options={[
                    { value: "paid", label: "USDT Confirmed & Paid" },
                    { value: "sourcing", label: "Factory Sourcing & Bench QC" },
                    { value: "shipped", label: "Air Cargo Shipped" },
                    { value: "delivered", label: "Delivered to Customer" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-heading">
                    Settlement Hash (USDT TRC20)
                  </label>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
                    <span className="truncate">0x4f829d8a1c9e...47c8</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>
            </AdminFormSection>

            {/* Logistics & Air Cargo Dispatch */}
            <AdminFormSection
              title="Air Logistics Dispatch"
              icon={Plane}
              actions={
                <button
                  type="button"
                  onClick={handleSaveTracking}
                  className="px-3 py-1.5 rounded-xl bg-[#2F65F6] text-white text-xs font-bold shadow-xs hover:bg-blue-600 cursor-pointer"
                >
                  Save Waybill
                </button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="Tracking Number / Waybill"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. YUN-982741920-US"
                />
                <AdminInput
                  label="Logistics Carrier"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="YunExpress Air Cargo"
                />
              </div>
            </AdminFormSection>

            {/* Internal Procurement Bench Logs */}
            <AdminFormSection title="Fulfillment Logs & Quality Checks">
              <div className="flex gap-2">
                <AdminInput
                  placeholder="Log factory serial number, inspection results, or QC photos..."
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddInternalNote}
                  className="px-4 py-2.5 rounded-xl bg-[#00143D] text-white text-xs font-bold hover:bg-[#002266] transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log</span>
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {notesList.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-heading">
                        {n.author}
                      </span>
                      <span className="text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{n.text}</p>
                  </div>
                ))}
              </div>
            </AdminFormSection>
          </div>
        )}
      </SlideOver>

      {/* ── 5. Refund Reversal Modal ── */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Process USDT Settlement Reversal"
        size="md"
      >
        <div className="space-y-4 pt-1 text-slate-800 dark:text-slate-200">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Issue a manual USDT refund for Order #{selectedOrder?.order_number}. This will adjust the customer balance and record an audit log.
          </p>

          <AdminInput
            label="Refund Amount (USDT)"
            type="number"
            step="0.01"
            value={refundAmount}
            onChange={(e) => setRefundAmount(Number(e.target.value))}
          />

          <AdminSelect
            label="Reversal Reason"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            options={[
              { value: "Factory transit defect", label: "Factory transit defect" },
              { value: "Customer cancellation before factory dispatch", label: "Customer cancellation before factory dispatch" },
              { value: "Incorrect item received", label: "Incorrect item received" },
              { value: "Custom clearance exception", label: "Custom clearance exception" },
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRefundModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteRefund}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer font-heading uppercase"
            >
              Confirm USDT Refund
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
