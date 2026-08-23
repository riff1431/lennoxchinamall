"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Coins,
  ShieldCheck,
  FileText,
  Lock,
  Plane,
  RotateCcw,
  Plus,
  Check,
  Copy,
  AlertTriangle,
  Send,
  Printer,
  ChevronRight,
  Eye,
  Edit,
  X,
} from "lucide-react";
import { MOCK_ORDERS, MOCK_PRODUCTS } from "@/lib/mockData";
import { Order, OrderStatus } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
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

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.items && o.items.some((item) => item.product_title.toLowerCase().includes(search.toLowerCase()))) ||
      search === "";

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setTrackingNumber("YUN-982741920-US");
    setIsDetailModalOpen(true);
  };

  const handleUpdateOrderStatus = () => {
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: editStatus } : o
      )
    );

    setSelectedOrder({ ...selectedOrder, status: editStatus });
    setToastMsg(`Order #${selectedOrder.order_number} status updated to "${ORDER_STATUS_LABELS[editStatus]}".`);
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

  const handleExecuteRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: "refunded" as OrderStatus } : o
      )
    );

    setToastMsg(`Refund of $${refundAmount} USDT processed for Order #${selectedOrder.order_number}!`);
    setIsRefundModalOpen(false);
    setIsDetailModalOpen(false);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-montserrat">
      {/* ── 1. Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              LENNOX FULFILMENT OS
            </span>
            <span className="text-xs text-slate-400 font-bold">
              {orders.length} Active Sourcing Orders
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-[#FF1028]" />
            <span>Order Sourcing & Fulfilment Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Verify Binance Pay USDT settlements, assign secret China supplier codes, manage tracking, and issue refunds.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-[#10B981] text-slate-950 px-4 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>✓ {toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. Search & Advanced Status Filter Tabs ── */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order #, Customer, or Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
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
                  ? "bg-[#00143D] text-white border border-blue-800 shadow-xs"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. Orders Master Table ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-black uppercase text-[10px] bg-slate-950/60">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Customer & Destination</th>
                <th className="py-3.5 px-3">Items</th>
                <th className="py-3.5 px-3">Settlement (USDT)</th>
                <th className="py-3.5 px-3">Sourcing Status</th>
                <th className="py-3.5 px-3">Tracking</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.map((order) => {
                const isPaid = order.status === "paid";
                const isShipped = order.status === "shipped";
                const isSourcing = order.status === "sourcing";

                return (
                  <tr key={order.id} className="hover:bg-slate-950/40 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{order.order_number}
                    </td>

                    <td className="py-3.5 px-3 text-slate-400">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-200 block">Alex Harrison</span>
                      <span className="text-[10px] text-slate-400">San Francisco, USA</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-200 block line-clamp-1">
                        {order.items?.[0]?.product_title || "Eachine EX5 4K Drone"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Qty: {order.items?.[0]?.quantity || 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-black text-emerald-400 price-tag">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isShipped
                            ? "bg-blue-950 text-blue-300 border border-blue-800"
                            : isSourcing
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : isPaid
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                      YUN-982741920-US
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetailModal(order)}
                        className="bg-[#00143D] hover:bg-[#FF1028] text-white px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Inspect PO →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Comprehensive Order Details & Sourcing Modal ── */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Order Management #${selectedOrder.order_number}`}
          size="xl"
        >
          <div className="p-6 space-y-6 font-montserrat text-xs text-slate-800">
            {/* Top Status & Fast Update Strip */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Current Lifecycle Status
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-xs focus:outline-none focus:border-[#00143D]"
                  >
                    <option value="pending">Pending Payment</option>
                    <option value="paid">USDT Paid & Escrowed</option>
                    <option value="sourcing">Factory Sourcing PO Placed</option>
                    <option value="processing">Quality Gate Passed</option>
                    <option value="shipped">Air Cargo Dispatched</option>
                    <option value="delivered">Delivered to Customer</option>
                    <option value="refunded">Refunded in USDT</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleUpdateOrderStatus}
                    className="bg-[#00143D] hover:bg-[#FF1028] text-white px-3.5 py-1.5 rounded-xl font-black transition-colors cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-1"
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
                  className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold flex items-center gap-1 border border-red-200"
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
                <span className="font-black text-amber-300 uppercase text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-800">
                  <Coins className="w-4 h-4 text-[#10B981]" />
                  <span>Binance Pay USDT Settlement Verified</span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Settled:</span>
                    <span className="font-black text-[#10B981] price-tag">{formatCurrency(selectedOrder.total)} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Merchant Trade No:</span>
                    <span className="font-mono text-slate-200">TRD-20260823-9182-3849</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network & Gas Fees:</span>
                    <span className="font-bold text-[#10B981]">0.00 USDT (Zero-Fee)</span>
                  </div>
                </div>
              </div>

              {/* Customer & Destination Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-black text-[#00143D] uppercase text-[11px] block pb-1 border-b border-slate-200">
                  Customer Destination (DDP Cargo)
                </span>
                <div className="space-y-1 text-[11px] text-slate-700">
                  <span className="font-bold block text-slate-900">Alex Harrison</span>
                  <span className="block">2847 Mission Street, Suite 400</span>
                  <span className="block">San Francisco, CA 94110, United States</span>
                  <span className="block font-mono text-slate-500">📞 +1 415 555 9182</span>
                </div>
              </div>
            </div>

            {/* Sourced Items & Private Supplier Routing (PRD §6.3) */}
            <div className="space-y-3">
              <span className="font-black text-[#00143D] uppercase text-xs block">
                Sourced Hardware Items & Private Factory Code
              </span>

              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block">
                        {item.product_title}
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-amber-700 font-mono font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" /> Private Code: SUP-GZ-4419
                        </span>
                        <span className="text-slate-500">
                          Factory Cost: <strong>$48.50</strong> • Retail: <strong>{formatCurrency(item.unit_price)}</strong>
                        </span>
                      </div>
                    </div>

                    <a
                      href="https://1688.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#00143D] hover:bg-[#FF1028] text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto"
                    >
                      <span>1688 Factory Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Air Cargo Dispatch & Courier Tracking */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
              <span className="font-black text-blue-950 uppercase text-xs flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-blue-600" />
                <span>International Air Cargo Tracking Details</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Air Express Carrier</label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none"
                  >
                    <option value="YunExpress Air Cargo">YunExpress Air Express (7-12 Days)</option>
                    <option value="4PX Global Express">4PX Global Air Cargo</option>
                    <option value="DHL Express International">DHL Express Worldwide (3-5 Days)</option>
                    <option value="FedEx International Priority">FedEx Priority Air</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Internal Admin Notes (Private — PRD §6.3) */}
            <div className="space-y-3 pt-2">
              <span className="font-black text-[#00143D] uppercase text-xs block">
                Internal Sourcing Notes (Private: Admin Only)
              </span>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {notesList.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-100 text-slate-800 space-y-0.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
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
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2 rounded-xl font-black transition-colors"
                >
                  Add Note
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 5. USDT Refund Modal ── */}
      {selectedOrder && (
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          title={`Issue USDT Refund — Order #${selectedOrder.order_number}`}
          size="md"
        >
          <form onSubmit={handleExecuteRefund} className="p-6 space-y-4 font-montserrat text-xs text-slate-800">
            <div className="p-3 bg-red-50 text-red-950 rounded-xl border border-red-200 space-y-1">
              <span className="font-black block">Direct Binance Pay USDT Refund</span>
              <p className="text-[11px] text-slate-600">
                Refund will be credited directly back to the customer's Binance Pay account with zero gateway penalty fees.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Refund Amount (USDT) *</label>
              <input
                type="number"
                step="0.01"
                required
                max={selectedOrder.total}
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-black text-sm text-[#FF1028] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Reason for Refund *</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none"
              >
                <option value="Factory transit defect">Factory transit defect (30-day warranty)</option>
                <option value="Customer cancellation">Customer cancellation before air cargo dispatch</option>
                <option value="Stock shortage at manufacturer">Stock shortage at manufacturer</option>
              </select>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl font-black transition-colors"
              >
                Confirm USDT Refund
              </button>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold"
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
