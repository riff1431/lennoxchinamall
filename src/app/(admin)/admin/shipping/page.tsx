"use client";

import React, { useState, useEffect } from "react";
import {
  Plane,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
  ArrowUpRight,
  Search,
  Check,
  Copy,
  ShieldCheck,
  MapPin,
  Calendar,
  Send,
  Navigation,
  Globe,
  Printer,
  RotateCcw,
  Download,
  Coins,
  RefreshCw,
  FileText,
  Barcode,
  Layers,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/utils/helpers";
import {
  FulfillmentRecord,
  FulfillmentTimelineEvent,
  ShippingMethodRecord,
  OrderReturnRecord,
  ShippingOverviewMetrics,
  FulfillmentStatus,
} from "@/types/shipping";
import {
  getShippingOverview,
  getFulfillmentsList,
  createFulfillment,
  updateFulfillmentStatus,
  getFulfillmentDetails,
  getShippingMethods,
  saveShippingMethod,
  getOrderReturns,
  processOrderReturn,
  exportShippingCSV,
} from "@/app/actions/admin-shipping";

type ActiveTab = "parcels" | "methods" | "returns";

export default function AdminShippingPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("parcels");
  const [fulfillments, setFulfillments] = useState<FulfillmentRecord[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodRecord[]>([]);
  const [returns, setReturns] = useState<OrderReturnRecord[]>([]);
  const [metrics, setMetrics] = useState<ShippingOverviewMetrics>({
    active_in_transit: 0,
    out_for_delivery: 0,
    delivered_count: 0,
    pending_dispatch: 0,
    open_returns_count: 0,
    avg_transit_days: 5.4,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [carrierFilter, setCarrierFilter] = useState("all");

  // Modals state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);

  const [selectedFulfillment, setSelectedFulfillment] = useState<FulfillmentRecord | null>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<FulfillmentTimelineEvent[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethodRecord | null>(null);

  // Dispatch Form State
  const [formOrderNum, setFormOrderNum] = useState("LCM-99015");
  const [formRecipient, setFormRecipient] = useState("");
  const [formCountry, setFormCountry] = useState("United States");
  const [formCity, setFormCity] = useState("San Francisco, CA");
  const [formAddress, setFormAddress] = useState("");
  const [formCourier, setFormCourier] = useState("YunExpress Air Freight");
  const [formService, setFormService] = useState("Priority Air Cargo");
  const [formTracking, setFormTracking] = useState("");
  const [formWeight, setFormWeight] = useState(1.2);
  const [formOriginHub, setFormOriginHub] = useState("Shenzhen Drone Hub");
  const [formNotes, setFormNotes] = useState("");

  // Status Update State
  const [updateStatus, setUpdateStatus] = useState<FulfillmentStatus>("in_transit");
  const [updateLocation, setUpdateLocation] = useState("Hong Kong International Airport (HKG)");
  const [updateNotes, setUpdateNotes] = useState("");

  // Method Form State
  const [methodName, setMethodName] = useState("");
  const [methodCarrier, setMethodCarrier] = useState("YunExpress");
  const [methodBaseCost, setMethodBaseCost] = useState(8.5);
  const [methodPerKg, setMethodPerKg] = useState(4.0);
  const [methodDaysMin, setMethodDaysMin] = useState(5);
  const [methodDaysMax, setMethodDaysMax] = useState(8);
  const [methodFreeMin, setMethodFreeMin] = useState(75.0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    const [overviewRes, listRes, methodsRes, returnsRes] = await Promise.all([
      getShippingOverview(),
      getFulfillmentsList({
        search: searchTerm,
        status: statusFilter,
        carrier: carrierFilter,
      }),
      getShippingMethods(),
      getOrderReturns(),
    ]);

    if (overviewRes.success && overviewRes.metrics) setMetrics(overviewRes.metrics);
    if (listRes.success && listRes.fulfillments) setFulfillments(listRes.fulfillments);
    if (methodsRes.success && methodsRes.methods) setShippingMethods(methodsRes.methods);
    if (returnsRes.success && returnsRes.returns) setReturns(returnsRes.returns);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter, carrierFilter]);

  // Open Dispatch Modal
  const handleOpenDispatch = () => {
    const autoTracking = `YT${Date.now().toString().slice(-8)}US`;
    setFormOrderNum(`LCM-${Math.floor(10000 + Math.random() * 90000)}`);
    setFormRecipient("David Henderson");
    setFormCountry("United States");
    setFormCity("Seattle, WA");
    setFormAddress("1200 4th Ave, Suite 210");
    setFormCourier("YunExpress Air Freight");
    setFormService("Priority Air Cargo");
    setFormTracking(autoTracking);
    setFormWeight(1.4);
    setFormOriginHub("Shenzhen Drone Hub");
    setFormNotes("Quality test flight passed. Sealed in static-shield bag.");
    setIsDispatchModalOpen(true);
  };

  // Submit Dispatch
  const handleSubmitDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createFulfillment({
      order_id: `ord-${Date.now()}`,
      order_number: formOrderNum.trim(),
      recipient_name: formRecipient.trim(),
      recipient_country: formCountry.trim(),
      recipient_city: formCity.trim(),
      recipient_address: formAddress.trim(),
      courier: formCourier,
      service_type: formService,
      tracking_number: formTracking.trim(),
      weight_kg: Number(formWeight),
      origin_hub: formOriginHub,
      internal_notes: formNotes.trim(),
      items: [{ sku: "DRONE-4K-STD", name: "Eachine EX5 4K GPS FPV Drone", qty: 1, hs_code: "85176200" }],
    });

    if (res.success) {
      showToast(res.message || "Air cargo dispatched!");
      setIsDispatchModalOpen(false);
      loadData();
    } else {
      showToast(res.error || "Dispatch failed");
    }
  };

  // Open Packing Slip Modal
  const handleOpenPackingSlip = (f: FulfillmentRecord) => {
    setSelectedFulfillment(f);
    setIsPackingSlipOpen(true);
  };

  // Open Timeline Modal
  const handleOpenTimeline = async (f: FulfillmentRecord) => {
    setSelectedFulfillment(f);
    const res = await getFulfillmentDetails(f.id);
    if (res.success && res.timeline) {
      setSelectedTimeline(res.timeline);
    }
    setIsTimelineOpen(true);
  };

  // Open Status Update Modal
  const handleOpenStatusUpdate = (f: FulfillmentRecord) => {
    setSelectedFulfillment(f);
    setUpdateStatus(f.status);
    setUpdateLocation("Hong Kong International Airport (HKG)");
    setUpdateNotes("");
    setIsStatusUpdateOpen(true);
  };

  // Submit Status Update
  const handleSubmitStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFulfillment) return;

    const res = await updateFulfillmentStatus(
      selectedFulfillment.id,
      updateStatus,
      updateLocation.trim(),
      updateNotes.trim()
    );

    if (res.success) {
      showToast(res.message || "Status updated!");
      setIsStatusUpdateOpen(false);
      loadData();
    } else {
      showToast(res.error || "Update failed");
    }
  };

  // Open Method Modal
  const handleOpenMethodModal = (m?: ShippingMethodRecord) => {
    if (m) {
      setSelectedMethod(m);
      setMethodName(m.name);
      setMethodCarrier(m.carrier);
      setMethodBaseCost(m.base_cost_usdt);
      setMethodPerKg(m.per_kg_cost_usdt);
      setMethodDaysMin(m.estimated_days_min);
      setMethodDaysMax(m.estimated_days_max);
      setMethodFreeMin(m.free_shipping_min_order || 75);
    } else {
      setSelectedMethod(null);
      setMethodName("");
      setMethodCarrier("YunExpress");
      setMethodBaseCost(8.5);
      setMethodPerKg(4.0);
      setMethodDaysMin(5);
      setMethodDaysMax(8);
      setMethodFreeMin(75.0);
    }
    setIsMethodModalOpen(true);
  };

  // Save Method
  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveShippingMethod({
      id: selectedMethod?.id,
      name: methodName.trim(),
      carrier: methodCarrier,
      base_cost_usdt: Number(methodBaseCost),
      per_kg_cost_usdt: Number(methodPerKg),
      estimated_days_min: Number(methodDaysMin),
      estimated_days_max: Number(methodDaysMax),
      free_shipping_min_order: Number(methodFreeMin),
    });

    if (res.success) {
      showToast(res.message || "Shipping method saved!");
      setIsMethodModalOpen(false);
      loadData();
    } else {
      showToast(res.error || "Save failed");
    }
  };

  // Process Return RMA
  const handleProcessReturn = async (retId: string, status: OrderReturnRecord["status"], refundAmount: number) => {
    const res = await processOrderReturn(retId, status, refundAmount, "Approved and processed by order manager");
    if (res.success) {
      showToast(res.message || "Return updated!");
      loadData();
    } else {
      showToast(res.error || "Action failed");
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    showToast("Generating Air Cargo CSV export...");
    const res = await exportShippingCSV();
    if (res.success && res.csvContent) {
      const blob = new Blob([res.csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = res.filename || "fulfillments_export.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Fulfillments CSV downloaded successfully!");
    } else {
      showToast(res.error || "Export failed");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 font-sans text-slate-100">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Air Cargo Logistics &amp; Fulfilment Hub"
        subtitle="Track international China air express dispatches (YunExpress, SF International, DHL), manage shipping rates, and process USDT escrow returns."
        badge={{ text: "CROSS-BORDER AIR CARGO", variant: "red" }}
        breadcrumbs={[{ label: "Shipping Studio" }]}
        actions={[
          {
            label: "Refresh Cargo",
            onClick: loadData,
            icon: RefreshCw,
            variant: "secondary",
          },
          {
            label: "Export CSV",
            onClick: handleExportCSV,
            icon: Download,
            variant: "secondary",
          },
          {
            label: "Dispatch Air Parcel",
            onClick: handleOpenDispatch,
            icon: Plane,
            variant: "primary",
          },
        ]}
      />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-[#10B981] text-slate-950 px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. Top Metrics Summary Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: In Transit */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase font-heading">In-Transit Air Cargo</span>
            <Plane className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{metrics.active_in_transit}</div>
          <div className="text-[11px] text-slate-400">Flight transit in progress</div>
        </div>

        {/* Metric 2: Out for Delivery */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase font-heading">Out for Delivery</span>
            <Truck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{metrics.out_for_delivery}</div>
          <div className="text-[11px] text-slate-400">Final last-mile courier</div>
        </div>

        {/* Metric 3: Delivered */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase font-heading">Delivered Orders</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-black text-[#10B981] font-mono">{metrics.delivered_count}</div>
          <div className="text-[11px] text-slate-400">Escrow released &amp; signed</div>
        </div>

        {/* Metric 4: Pending Returns */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase font-heading">Open RMA Returns</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{metrics.open_returns_count}</div>
          <div className="text-[11px] text-slate-400">USDT refund inspection hold</div>
        </div>

        {/* Metric 5: Avg Transit Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase font-heading">Avg Air Transit</span>
            <Clock className="w-4 h-4 text-[#FF1028]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{metrics.avg_transit_days} Days</div>
          <div className="text-[11px] text-slate-400">China Hub to Customer Door</div>
        </div>
      </div>

      {/* ── 3. Master Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("parcels")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "parcels"
              ? "bg-[#FF1028] text-white font-black font-heading shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Live Air Cargo Parcels ({fulfillments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("methods")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "methods"
              ? "bg-[#FF1028] text-white font-black font-heading shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Shipping Zones &amp; Carrier Rates ({shippingMethods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("returns")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "returns"
              ? "bg-[#FF1028] text-white font-black font-heading shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Returns &amp; USDT Refunds ({returns.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: Live Air Cargo Parcels ─── */}
      {activeTab === "parcels" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search Order #, Tracking, Recipient, Country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold"
              >
                <option value="all">All Air Carriers</option>
                <option value="YunExpress">YunExpress Direct</option>
                <option value="SF">SF International</option>
                <option value="DHL">DHL Express</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold"
              >
                <option value="all">All Transit Statuses</option>
                <option value="shipped">Origin Dispatched</option>
                <option value="in_transit">Flight in Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered &amp; Signed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Order &amp; Tracking #</th>
                  <th className="py-3 px-4 font-bold">Carrier &amp; Origin Hub</th>
                  <th className="py-3 px-4 font-bold">Destination</th>
                  <th className="py-3 px-4 font-bold text-center">Weight</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {fulfillments.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Order & Tracking */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white font-mono block">{f.order_number}</span>
                        <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[11px]">
                          <span>{f.tracking_number}</span>
                          {f.tracking_url && (
                            <a
                              href={f.tracking_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-blue-400"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Carrier & Hub */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-200 block">{f.courier}</span>
                        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{f.origin_hub}</span>
                        </span>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">{f.recipient_name}</span>
                        <span className="text-[11px] text-slate-400 block">
                          {f.recipient_city}, {f.recipient_country}
                        </span>
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-300">
                      {f.weight_kg} kg
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                          f.status === "delivered"
                            ? "bg-emerald-500/10 text-[#10B981] border-emerald-500/20"
                            : f.status === "out_for_delivery"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : f.status === "in_transit"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{f.status.replace(/_/g, " ")}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenStatusUpdate(f)}
                          title="Update Status & Location"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors cursor-pointer border border-slate-700"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => handleOpenPackingSlip(f)}
                          title="Generate Customs Packing Slip"
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenTimeline(f)}
                          title="View Milestone Timeline"
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-purple-400 border border-slate-800 transition-colors cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Shipping Methods & Rates ─── */}
      {activeTab === "methods" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-black text-white font-heading">
                Configured Cross-Border Shipping Methods
              </h2>
              <p className="text-xs text-slate-400">
                Set base freight costs, per-KG rates, free shipping thresholds, and air transit SLAs.
              </p>
            </div>

            <button
              onClick={() => handleOpenMethodModal()}
              className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2 rounded-xl text-xs font-black font-heading transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Carrier Method</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shippingMethods.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {m.carrier}
                  </span>
                  <button
                    onClick={() => handleOpenMethodModal(m)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="font-heading font-black text-white text-sm">{m.name}</h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Estimated: {m.estimated_days_min}–{m.estimated_days_max} Air Cargo Days</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Base Freight</span>
                    <span className="font-mono font-bold text-white">${m.base_cost_usdt} USDT</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Per-KG Addon</span>
                    <span className="font-mono font-bold text-white">${m.per_kg_cost_usdt} USDT/kg</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                  <span>Free Air Shipping:</span>
                  <span className="font-mono font-black">${m.free_shipping_min_order} USDT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: Returns & USDT Refunds ─── */}
      {activeTab === "returns" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-black text-white font-heading">
                Customer Return Merchandise Authorization (RMA)
              </h2>
              <p className="text-xs text-slate-400">
                Inspect returned hardware and release Binance Pay USDT escrow refunds directly.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Order #</th>
                  <th className="py-3 px-4 font-bold">Customer Email</th>
                  <th className="py-3 px-4 font-bold">Return Reason</th>
                  <th className="py-3 px-4 font-bold text-center">Refund USDT</th>
                  <th className="py-3 px-4 font-bold text-center">RMA Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">{r.order_number}</td>
                    <td className="py-4 px-4 text-slate-300">{r.customer_email}</td>
                    <td className="py-4 px-4 max-w-xs">
                      <span className="block truncate text-slate-300">{r.reason}</span>
                      {r.notes && <span className="text-[10px] text-slate-500 block">{r.notes}</span>}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-emerald-400">
                      ${r.refund_amount_usdt} USDT
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          r.status === "refunded"
                            ? "bg-emerald-500/10 text-[#10B981] border-emerald-500/20"
                            : r.status === "approved"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {r.status === "requested" && (
                        <button
                          onClick={() => handleProcessReturn(r.id, "approved", r.refund_amount_usdt)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Approve RMA
                        </button>
                      )}
                      {r.status === "approved" && (
                        <button
                          onClick={() => handleProcessReturn(r.id, "refunded", r.refund_amount_usdt)}
                          className="px-2.5 py-1 rounded-lg bg-[#10B981] hover:bg-[#0EA271] text-slate-950 font-black font-heading text-[11px] cursor-pointer"
                        >
                          Issue USDT Refund
                        </button>
                      )}
                      {r.status === "refunded" && (
                        <span className="text-[11px] text-slate-500 font-mono">Refund Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 4. Dispatch Air Parcel Modal ── */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Dispatch International Air Express Parcel"
        size="lg"
      >
        <form onSubmit={handleSubmitDispatch} className="space-y-4 text-xs font-sans text-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Order Number *</label>
              <input
                type="text"
                required
                value={formOrderNum}
                onChange={(e) => setFormOrderNum(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Air Express Carrier *</label>
              <select
                value={formCourier}
                onChange={(e) => setFormCourier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              >
                <option value="YunExpress Air Freight">YunExpress Priority Direct Line</option>
                <option value="SF International Express">SF International Priority Express</option>
                <option value="DHL Express Airfreight">DHL Express Wholesale Airfreight</option>
                <option value="Yanwen Special Line">Yanwen Special Line</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Air Waybill / Tracking # *</label>
              <input
                type="text"
                required
                value={formTracking}
                onChange={(e) => setFormTracking(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Origin Logistics Facility *</label>
              <select
                value={formOriginHub}
                onChange={(e) => setFormOriginHub(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold"
              >
                <option value="Shenzhen Drone Hub">Shenzhen Drone &amp; Tech Hub (SZ)</option>
                <option value="Guangzhou QC Center">Guangzhou Logistics &amp; QC Park (GZ)</option>
                <option value="HK International Air Hub">HK International Air Hub (HKG)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Recipient Name</label>
              <input
                type="text"
                required
                value={formRecipient}
                onChange={(e) => setFormRecipient(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Destination Country</label>
              <input
                type="text"
                required
                value={formCountry}
                onChange={(e) => setFormCountry(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Gross Weight (KG)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formWeight}
                onChange={(e) => setFormWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Internal QC &amp; Packaging Notes</label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-black font-heading shadow-md cursor-pointer"
            >
              Confirm Air Dispatch
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Printable Customs Packing Slip Modal ── */}
      <Modal
        isOpen={isPackingSlipOpen}
        onClose={() => setIsPackingSlipOpen(false)}
        title="Commercial Air Cargo Packing Slip &amp; Shipping Label"
        size="lg"
      >
        {selectedFulfillment && (
          <div className="space-y-6 text-slate-900 bg-white p-6 rounded-2xl print:p-0">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
              <div>
                <h2 className="text-xl font-black font-heading tracking-wider">LENNOX CHINAMALL</h2>
                <span className="text-[11px] text-slate-600 block">
                  Direct Factory Airfreight • Shenzhen / Guangzhou Logistics Park
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black font-mono block">{selectedFulfillment.order_number}</span>
                <span className="text-[11px] text-slate-500 font-mono">Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Address Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-100 rounded-xl">
                <span className="font-bold text-slate-500 text-[10px] uppercase block">Shipped From:</span>
                <span className="font-bold block text-slate-900">{selectedFulfillment.origin_hub}</span>
                <span className="text-slate-600 block text-[11px]">Baoan Airport Logistics Park, GD, China</span>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <span className="font-bold text-slate-500 text-[10px] uppercase block">Deliver To:</span>
                <span className="font-bold block text-slate-900">{selectedFulfillment.recipient_name}</span>
                <span className="text-slate-600 block text-[11px]">
                  {selectedFulfillment.recipient_city}, {selectedFulfillment.recipient_country}
                </span>
              </div>
            </div>

            {/* Carrier & Tracking */}
            <div className="p-3 border border-slate-300 rounded-xl flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Carrier &amp; Service</span>
                <span className="font-bold">{selectedFulfillment.courier} ({selectedFulfillment.service_type})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">Air Waybill Tracking</span>
                <span className="font-black text-sm text-blue-700">{selectedFulfillment.tracking_number}</span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3">Item / Description</th>
                  <th className="py-2 px-3">HS Code</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Gross Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedFulfillment.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold">{it.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{it.hs_code || "85176200"}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{it.qty}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{selectedFulfillment.weight_kg} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Customs Declaration */}
            <div className="text-[10px] text-slate-500 border-t pt-3 flex items-center justify-between">
              <span>Verified for export customs departure. Payment settled via Binance Pay escrow.</span>
              <span className="font-black uppercase text-emerald-700 border border-emerald-700 px-2 py-0.5 rounded">
                ✓ SHENZHEN QC PASSED
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => window.print()}
                className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Packing Slip</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── 6. Milestone Timeline Modal ── */}
      <Modal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        title={`Air Cargo Milestone Timeline: ${selectedFulfillment?.tracking_number || ""}`}
        size="md"
      >
        <div className="space-y-6 text-xs font-sans text-slate-200">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">{selectedFulfillment?.order_number}</span>
              <span className="text-[11px] text-slate-400">{selectedFulfillment?.courier}</span>
            </div>
            <span className="text-xs font-mono font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              {selectedFulfillment?.status.toUpperCase()}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {selectedTimeline.length === 0 ? (
              <div className="text-slate-500">No milestones logged yet.</div>
            ) : (
              selectedTimeline.map((ev, idx) => (
                <div key={ev.id || idx} className="relative space-y-1">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-4 ring-slate-900" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{ev.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{formatDate(ev.created_at)}</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-mono block">{ev.location}</span>
                  {ev.description && <p className="text-[11px] text-slate-400">{ev.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* ── 7. Status Update Modal ── */}
      <Modal
        isOpen={isStatusUpdateOpen}
        onClose={() => setIsStatusUpdateOpen(false)}
        title={`Update Air Cargo Status: ${selectedFulfillment?.tracking_number || ""}`}
        size="md"
      >
        <form onSubmit={handleSubmitStatusUpdate} className="space-y-4 text-xs font-sans text-slate-200">
          <div className="space-y-1">
            <label className="font-bold text-slate-300">New Transit Status *</label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value as FulfillmentStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
            >
              <option value="shipped">Origin Dispatched</option>
              <option value="in_transit">Flight in Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered &amp; Signed</option>
              <option value="returned">Returned to Factory</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Current Checkpoint Location *</label>
            <input
              type="text"
              required
              value={updateLocation}
              onChange={(e) => setUpdateLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Milestone Notes</label>
            <textarea
              rows={2}
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="e.g. Cleared US customs at LAX. Transferred to local FedEx Ground courier."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsStatusUpdateOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-black font-heading shadow-md cursor-pointer"
            >
              Save Milestone &amp; Status
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 8. Add/Edit Shipping Method Modal ── */}
      <Modal
        isOpen={isMethodModalOpen}
        onClose={() => setIsMethodModalOpen(false)}
        title={selectedMethod ? "Edit Carrier Rate" : "Add Shipping Method"}
        size="md"
      >
        <form onSubmit={handleSaveMethod} className="space-y-4 text-xs font-sans text-slate-200">
          <div className="space-y-1">
            <label className="font-bold text-slate-300">Method Name *</label>
            <input
              type="text"
              required
              value={methodName}
              onChange={(e) => setMethodName(e.target.value)}
              placeholder="e.g. YunExpress Priority Direct Line"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Base Cost (USDT)</label>
              <input
                type="number"
                step="0.01"
                required
                value={methodBaseCost}
                onChange={(e) => setMethodBaseCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Per-KG Addon (USDT)</label>
              <input
                type="number"
                step="0.01"
                required
                value={methodPerKg}
                onChange={(e) => setMethodPerKg(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Min Days</label>
              <input
                type="number"
                value={methodDaysMin}
                onChange={(e) => setMethodDaysMin(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Max Days</label>
              <input
                type="number"
                value={methodDaysMax}
                onChange={(e) => setMethodDaysMax(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Free Air Shipping Threshold (USDT)</label>
            <input
              type="number"
              value={methodFreeMin}
              onChange={(e) => setMethodFreeMin(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsMethodModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-black font-heading shadow-md cursor-pointer"
            >
              Save Carrier Rate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
