"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Coins,
  Lock,
  Plane,
  RotateCcw,
  Printer,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MOCK_ORDERS } from "@/lib/mockData";
import { Order, OrderStatus } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getAdminOrders, updateOrderStatus, updateTrackingInfo } from "@/app/actions/admin-orders";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Selected Order for Modal Details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  // Editable fields in detail modal
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

  const loadOrders = async () => {
    setIsLoading(true);
    const res = await getAdminOrders({
      search,
      status: statusFilter,
    });
    if (res.success) {
      setOrders(res.orders);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setIsLoading(true);
      const res = await getAdminOrders({
        search,
        status: statusFilter,
      });
      if (isMounted && res.success) {
        setOrders(res.orders);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [statusFilter, search]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.items && o.items.some((item) => (item.title || "").toLowerCase().includes(search.toLowerCase()))) ||
      search === "";

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setTrackingNumber(order.tracking_number || "YUN-982741920-US");
    setIsDetailModalOpen(true);
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;

    const res = await updateOrderStatus(selectedOrder.id, editStatus);
    if (trackingNumber && trackingNumber !== selectedOrder.tracking_number) {
      await updateTrackingInfo(selectedOrder.id, trackingNumber, carrier);
    }

    setToastMsg(res.message || `Order #${selectedOrder.order_number} status updated!`);
    loadOrders();
    setIsDetailModalOpen(false);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteInput.trim()) return;

    const newNote = {
      id: `n-${Date.now()}`,
      author: "Admin (Procurement Ops)",
      text: internalNoteInput.trim(),
      time: "Just now",
    };

    setNotesList([...notesList, newNote]);
    setInternalNoteInput("");
  };

  const handleExecuteRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    await updateOrderStatus(selectedOrder.id, "refunded" as OrderStatus, `Refund of $${refundAmount} processed: ${refundReason}`);
    setToastMsg(`Refund processed for Order #${selectedOrder.order_number}!`);
    setIsRefundModalOpen(false);
    setIsDetailModalOpen(false);
    loadOrders();
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const totalVolume = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const paidOrders = orders.filter((o) => o.status === "paid").length;
  const sourcingOrders = orders.filter((o) => o.status === "sourcing").length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Order Sourcing & Fulfilment"
        subtitle="Verify crypto settlements, review factory supplier allocations, dispatch air tracking, and audit orders."
        badge={{ text: `${orders.length} Total Orders`, variant: "blue" }}
        breadcrumbs={[
          { label: "Fulfilment", href: "/admin/orders" },
          { label: "All Orders" },
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

      {/* ── 2. Top 4 Pastel KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Orders
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
              USDT Settled
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {formatCurrency(totalVolume)}
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

      {/* ── 3. Search & Status Filter Tabs ── */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order #, Customer, or Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2F65F6] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: "all", label: "All Orders" },
            { id: "paid", label: "USDT Paid" },
            { id: "sourcing", label: "Factory Sourcing" },
            { id: "shipped", label: "Air Cargo Shipped" },
            { id: "delivered", label: "Delivered" },
            { id: "refunded", label: "Refunded" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Orders Master Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] bg-slate-50/70 dark:bg-slate-900/60 tracking-wider">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Customer &amp; Destination</th>
                <th className="py-3.5 px-3">Items</th>
                <th className="py-3.5 px-3">Settlement</th>
                <th className="py-3.5 px-3">Sourcing Status</th>
                <th className="py-3.5 px-3">Tracking</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPaid = order.status === "paid";
                  const isShipped = order.status === "shipped";
                  const isSourcing = order.status === "sourcing";

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        #{order.order_number}
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">Alex Harrison</span>
                        <span className="text-[10px] text-slate-400">San Francisco, USA</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-200 block line-clamp-1">
                          {order.items?.[0]?.product_title || "Eachine EX5 4K Drone"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Qty: {order.items?.[0]?.quantity || 1}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(order.total)}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isShipped
                              ? "bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] dark:text-blue-400 border border-[#BFDBFE]/60"
                              : isSourcing
                              ? "bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-[#FED7AA]/60"
                              : isPaid
                              ? "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]/60"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                        {order.tracking_number || "YUN-982741920-US"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetailModal(order)}
                          className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shadow-blue-500/25 shadow-xs"
                        >
                          Inspect PO →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Comprehensive Order Details & Sourcing Modal ── */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Order Management #${selectedOrder.order_number}`}
          size="xl"
        >
          <div className="space-y-5 text-xs text-slate-800 dark:text-slate-200">
            {/* Top Status & Fast Update Strip */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                  Current Lifecycle Status
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-bold text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
                  >
                    <option value="pending">Pending Payment</option>
                    <option value="paid">USDT Paid &amp; Escrowed</option>
                    <option value="sourcing">Factory Sourcing PO Placed</option>
                    <option value="processing">Quality Gate Passed</option>
                    <option value="shipped">Air Cargo Dispatched</option>
                    <option value="delivered">Delivered to Customer</option>
                    <option value="refunded">Refunded in USDT</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleUpdateOrderStatus}
                    className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shadow-blue-500/25 shadow-xs"
                  >
                    Save Status
                  </button>
                </div>
              </div>

              {/* Total & Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRefundAmount(selectedOrder.total);
                    setIsRefundModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/80 font-bold flex items-center gap-1 border border-rose-200 dark:border-rose-900/50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Issue Refund</span>
                </button>
              </div>
            </div>

            {/* 2-Column Grid: Payment Verification + Customer Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Binance Pay Verification Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5">
                <span className="font-bold text-amber-300 uppercase text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-800">
                  <Coins className="w-4 h-4 text-[#10B981]" />
                  <span>Binance Pay USDT Settlement Verified</span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Settled:</span>
                    <span className="font-black text-[#10B981] font-mono">{formatCurrency(selectedOrder.total)} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Merchant Trade No:</span>
                    <span className="font-mono text-slate-200">TRD-20260823-9182-3849</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network &amp; Gas Fees:</span>
                    <span className="font-bold text-[#10B981]">0.00 USDT (Zero-Fee)</span>
                  </div>
                </div>
              </div>

              {/* Customer & Destination Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white uppercase text-[11px] block pb-1 border-b border-slate-200 dark:border-slate-800">
                  Customer Destination (DDP Cargo)
                </span>
                <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                  <span className="font-bold block text-slate-900 dark:text-white">Alex Harrison</span>
                  <span className="block">2847 Mission Street, Suite 400</span>
                  <span className="block">San Francisco, CA 94110, United States</span>
                  <span className="block font-mono text-slate-400">📞 +1 415 555 9182</span>
                </div>
              </div>
            </div>

            {/* Sourced Items & Private Supplier Routing */}
            <div className="space-y-3">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-xs block">
                Sourced Hardware Items &amp; Factory Code
              </span>

              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white block font-heading">
                        {item.product_title}
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" /> Private Code: SUP-GZ-4419
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">
                          Cost: $48.50 • Retail: {formatCurrency(item.unit_price || item.price || 0)}
                        </span>
                      </div>
                    </div>

                    <a
                      href="https://1688.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-3.5 py-1.5 rounded-xl font-bold text-[11px] transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto shadow-blue-500/25 shadow-xs"
                    >
                      <span>1688 Factory Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Air Cargo Dispatch & Courier Tracking */}
            <div className="p-4 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-xs flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-[#2F65F6]" />
                <span>International Air Cargo Tracking Details</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Air Express Carrier</label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
                  >
                    <option value="YunExpress Air Cargo">YunExpress Air Express (7-12 Days)</option>
                    <option value="4PX Global Express">4PX Global Air Cargo</option>
                    <option value="DHL Express International">DHL Express Worldwide (3-5 Days)</option>
                    <option value="FedEx International Priority">FedEx Priority Air</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
                  />
                </div>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-3 pt-1">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-xs block">
                Internal Sourcing Notes (Private: Admin Only)
              </span>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {notesList.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 space-y-0.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span>{n.author}</span>
                      <span>{n.time}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add private supplier communication or QA notes..."
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#2F65F6]"
                />
                <button
                  type="submit"
                  className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer shadow-blue-500/25 shadow-xs"
                >
                  Add Note
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 6. USDT Refund Modal ── */}
      {selectedOrder && (
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          title={`Issue USDT Refund — Order #${selectedOrder.order_number}`}
          size="md"
        >
          <form onSubmit={handleExecuteRefund} className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-950 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-1">
              <span className="font-bold block text-rose-700 dark:text-rose-300">Direct Binance Pay USDT Refund</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Refund will be credited directly back to the customer&apos;s Binance Pay account with zero gateway penalty fees.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Refund Amount (USDT) *</label>
              <input
                type="number"
                step="0.01"
                required
                max={selectedOrder.total}
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-black text-sm focus:outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Reason for Refund *</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
              >
                <option value="Factory transit defect">Factory transit defect (30-day warranty)</option>
                <option value="Customer cancellation">Customer cancellation before air cargo dispatch</option>
                <option value="Stock shortage at manufacturer">Stock shortage at manufacturer</option>
              </select>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold transition-colors cursor-pointer shadow-rose-500/25 shadow-xs"
              >
                Confirm USDT Refund
              </button>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
