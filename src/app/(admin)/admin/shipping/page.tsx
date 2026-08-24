"use client";

import React, { useState, useEffect } from "react";
import {
  Plane,
  Truck,
  Plus,
  Edit2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Search,
  MapPin,
  Globe,
  Printer,
  RotateCcw,
  Download,
  RefreshCw,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/utils/helpers";
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
    let isMounted = true;
    (async () => {
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

      if (isMounted) {
        if (overviewRes.success && overviewRes.metrics) setMetrics(overviewRes.metrics);
        if (listRes.success && listRes.fulfillments) setFulfillments(listRes.fulfillments);
        if (methodsRes.success && methodsRes.methods) setShippingMethods(methodsRes.methods);
        if (returnsRes.success && returnsRes.returns) setReturns(returnsRes.returns);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
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
      setMethodBaseCost(9.0);
      setMethodPerKg(4.5);
      setMethodDaysMin(5);
      setMethodDaysMax(9);
      setMethodFreeMin(80.0);
    }
    setIsMethodModalOpen(true);
  };

  // Save Shipping Method
  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveShippingMethod({
      id: selectedMethod ? selectedMethod.id : undefined,
      name: methodName.trim(),
      carrier: methodCarrier,
      base_cost_usdt: Number(methodBaseCost),
      per_kg_cost_usdt: Number(methodPerKg),
      estimated_days_min: Number(methodDaysMin),
      estimated_days_max: Number(methodDaysMax),
      free_shipping_min_order: Number(methodFreeMin),
    });

    if (res.success) {
      showToast(res.message || "Method saved!");
      setIsMethodModalOpen(false);
      loadData();
    } else {
      showToast(res.error || "Failed to save method");
    }
  };

  // Process Return RMA
  const handleProcessReturn = async (id: string, newStatus: "approved" | "rejected" | "refunded", amount: number) => {
    const res = await processOrderReturn(id, newStatus, amount, "Processed via Lennox Logistics Hub");
    if (res.success) {
      showToast(res.message || `RMA status updated to ${newStatus}!`);
      loadData();
    } else {
      showToast(res.error || "Return update failed");
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Air Cargo Logistics &amp; Fulfilment"
        subtitle="Track international air express dispatches (YunExpress, SF International, DHL), manage shipping rates, and audit RMA returns."
        badge={{ text: "Cross-Border Cargo", variant: "blue" }}
        breadcrumbs={[{ label: "Shipping Hub" }]}
        actions={[
          {
            label: "Refresh",
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
            label: "Dispatch Parcel",
            onClick: handleOpenDispatch,
            icon: Plane,
            variant: "primary",
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

      {/* ── 2. Top 5 Pastel KPI Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              In-Transit Flight
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {metrics.active_in_transit}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Plane className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F3E8FF] dark:bg-[#28183B] border border-[#E9D5FF]/50 dark:border-purple-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Out for Delivery
            </span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {metrics.out_for_delivery}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Delivered Orders
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {metrics.delivered_count}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Open RMA Returns
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {metrics.open_returns_count}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2D1B22] border border-[#FECDD3]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Avg Air Transit
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {metrics.avg_transit_days} Days
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F43F5E] text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Master Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("parcels")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "parcels"
              ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700"
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Live Air Cargo Parcels ({fulfillments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("methods")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "methods"
              ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Shipping Rates &amp; Zones ({shippingMethods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("returns")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "returns"
              ? "bg-[#2F65F6] text-white shadow-blue-500/25 shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>RMA Returns &amp; Refunds ({returns.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: Live Air Cargo Parcels ─── */}
      {activeTab === "parcels" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Order #, Tracking, Recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs placeholder-slate-400 focus:outline-none focus:border-[#2F65F6] transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold focus:outline-none focus:border-[#2F65F6]"
              >
                <option value="all">All Air Carriers</option>
                <option value="YunExpress">YunExpress Direct</option>
                <option value="SF">SF International</option>
                <option value="DHL">DHL Express</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold focus:outline-none focus:border-[#2F65F6]"
              >
                <option value="all">All Transit Statuses</option>
                <option value="shipped">Origin Dispatched</option>
                <option value="in_transit">Flight in Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered &amp; Signed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order &amp; Tracking #</th>
                  <th className="py-3 px-4">Carrier &amp; Origin Hub</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4 text-center">Weight</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading parcels...
                    </td>
                  </tr>
                ) : fulfillments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No parcels found matching your search.
                    </td>
                  </tr>
                ) : (
                  fulfillments.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Order & Tracking */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white font-mono block">{f.order_number}</span>
                          <div className="flex items-center gap-1.5 text-[#2F65F6] font-mono text-[11px]">
                            <span>{f.tracking_number}</span>
                            {f.tracking_url && (
                              <a
                                href={f.tracking_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-[#2F65F6]"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Carrier & Hub */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-slate-200 block">{f.courier}</span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{f.origin_hub}</span>
                          </span>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white block">{f.recipient_name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {f.recipient_city}, {f.recipient_country}
                          </span>
                        </div>
                      </td>

                      {/* Weight */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {f.weight_kg} kg
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            f.status === "delivered"
                              ? "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border-[#BBF7D0]/60"
                              : f.status === "out_for_delivery"
                              ? "bg-[#F3E8FF] dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-[#E9D5FF]/60"
                              : f.status === "in_transit"
                              ? "bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] dark:text-blue-400 border-[#BFDBFE]/60"
                              : "bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-[#FED7AA]/60"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{f.status.replace(/_/g, " ")}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenStatusUpdate(f)}
                            title="Update Status & Location"
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          >
                            Status
                          </button>
                          <button
                            onClick={() => handleOpenPackingSlip(f)}
                            title="Generate Customs Packing Slip"
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#2F65F6] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenTimeline(f)}
                            title="View Milestone Timeline"
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Shipping Methods & Rates ─── */}
      {activeTab === "methods" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Configured Cross-Border Shipping Methods
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set base freight costs, per-KG rates, free shipping thresholds, and air transit SLAs.
              </p>
            </div>

            <button
              onClick={() => handleOpenMethodModal()}
              className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-blue-500/25 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Carrier Method</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shippingMethods.map((m) => (
              <div
                key={m.id}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 relative shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] dark:text-blue-400 border border-[#BFDBFE]/60">
                    {m.carrier}
                  </span>
                  <button
                    onClick={() => handleOpenMethodModal(m)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-slate-900 dark:text-white text-sm">{m.name}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Estimated: {m.estimated_days_min}–{m.estimated_days_max} Air Cargo Days</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Base Freight</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">${m.base_cost_usdt} USDT</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Per-KG Addon</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">${m.per_kg_cost_usdt} USDT/kg</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F0FDF4] dark:bg-emerald-950/60 border border-[#BBF7D0]/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between font-medium">
                  <span>Free Air Shipping:</span>
                  <span className="font-mono font-bold">${m.free_shipping_min_order} USDT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: Returns & USDT Refunds ─── */}
      {activeTab === "returns" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Customer Return Merchandise Authorization (RMA)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect returned hardware and release Binance Pay USDT escrow refunds directly.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer Email</th>
                  <th className="py-3 px-4">Return Reason</th>
                  <th className="py-3 px-4 text-center">Refund USDT</th>
                  <th className="py-3 px-4 text-center">RMA Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{r.order_number}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{r.customer_email}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="block truncate text-slate-800 dark:text-slate-200">{r.reason}</span>
                      {r.notes && <span className="text-[10px] text-slate-400 block">{r.notes}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${r.refund_amount_usdt} USDT
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          r.status === "refunded"
                            ? "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border-[#BBF7D0]/60"
                            : r.status === "approved"
                            ? "bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] dark:text-blue-400 border-[#BFDBFE]/60"
                            : "bg-[#FFF8EE] dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-[#FED7AA]/60"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.status === "requested" && (
                        <button
                          onClick={() => handleProcessReturn(r.id, "approved", r.refund_amount_usdt)}
                          className="px-2.5 py-1 rounded-xl bg-[#2F65F6] hover:bg-[#2563EB] text-white font-bold text-[11px] cursor-pointer shadow-blue-500/25 shadow-xs"
                        >
                          Approve RMA
                        </button>
                      )}
                      {r.status === "approved" && (
                        <button
                          onClick={() => handleProcessReturn(r.id, "refunded", r.refund_amount_usdt)}
                          className="px-2.5 py-1 rounded-xl bg-[#10B981] hover:bg-[#0EA271] text-white font-bold text-[11px] cursor-pointer shadow-emerald-500/25 shadow-xs"
                        >
                          Issue USDT Refund
                        </button>
                      )}
                      {r.status === "refunded" && (
                        <span className="text-[11px] text-slate-400 font-mono">Refund Settled</span>
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
        <form onSubmit={handleSubmitDispatch} className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Order Number *</label>
              <input
                type="text"
                required
                value={formOrderNum}
                onChange={(e) => setFormOrderNum(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Air Express Carrier *</label>
              <select
                value={formCourier}
                onChange={(e) => setFormCourier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#2F65F6]"
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
              <label className="font-bold text-slate-700 dark:text-slate-300">Air Waybill / Tracking # *</label>
              <input
                type="text"
                required
                value={formTracking}
                onChange={(e) => setFormTracking(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#2F65F6] font-mono font-bold focus:outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Origin Logistics Facility *</label>
              <select
                value={formOriginHub}
                onChange={(e) => setFormOriginHub(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-bold focus:outline-none focus:border-[#2F65F6]"
              >
                <option value="Shenzhen Drone Hub">Shenzhen Drone &amp; Tech Hub (SZ)</option>
                <option value="Guangzhou QC Center">Guangzhou Logistics &amp; QC Park (GZ)</option>
                <option value="HK International Air Hub">HK International Air Hub (HKG)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Recipient Name</label>
              <input
                type="text"
                required
                value={formRecipient}
                onChange={(e) => setFormRecipient(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Destination Country</label>
              <input
                type="text"
                required
                value={formCountry}
                onChange={(e) => setFormCountry(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Gross Weight (KG)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formWeight}
                onChange={(e) => setFormWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Internal QC &amp; Packaging Notes</label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2F65F6] hover:bg-[#2563EB] text-white font-bold transition-colors shadow-blue-500/25 shadow-xs cursor-pointer"
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
                className="bg-[#2F65F6] hover:bg-[#2563EB] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-blue-500/25 shadow-xs"
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
        title={`Air Cargo Timeline: ${selectedFulfillment?.tracking_number || ""}`}
        size="md"
      >
        <div className="space-y-5 text-xs text-slate-800 dark:text-slate-200">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">{selectedFulfillment?.order_number}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{selectedFulfillment?.courier}</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#2F65F6] bg-[#EEF4FF] dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-[#BFDBFE]/60">
              {selectedFulfillment?.status.toUpperCase()}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {selectedTimeline.length === 0 ? (
              <div className="text-slate-400">No milestones logged yet.</div>
            ) : (
              selectedTimeline.map((ev, idx) => (
                <div key={ev.id || idx} className="relative space-y-1">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-4 ring-white dark:ring-slate-900" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{ev.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(ev.created_at)}</span>
                  </div>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono block">{ev.location}</span>
                  {ev.description && <p className="text-[11px] text-slate-500 dark:text-slate-400">{ev.description}</p>}
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
        <form onSubmit={handleSubmitStatusUpdate} className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">New Transit Status *</label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value as FulfillmentStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#2F65F6]"
            >
              <option value="shipped">Origin Dispatched</option>
              <option value="in_transit">Flight in Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered &amp; Signed</option>
              <option value="returned">Returned to Factory</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Current Checkpoint Location *</label>
            <input
              type="text"
              required
              value={updateLocation}
              onChange={(e) => setUpdateLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Milestone Notes</label>
            <textarea
              rows={2}
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="e.g. Cleared US customs at LAX. Transferred to local FedEx Ground courier."
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsStatusUpdateOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2F65F6] hover:bg-[#2563EB] text-white font-bold transition-colors shadow-blue-500/25 shadow-xs cursor-pointer"
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
        <form onSubmit={handleSaveMethod} className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Method Name *</label>
            <input
              type="text"
              required
              value={methodName}
              onChange={(e) => setMethodName(e.target.value)}
              placeholder="e.g. YunExpress Priority Direct Line"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Base Cost (USDT)</label>
              <input
                type="number"
                step="0.01"
                required
                value={methodBaseCost}
                onChange={(e) => setMethodBaseCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Per-KG Addon (USDT)</label>
              <input
                type="number"
                step="0.01"
                required
                value={methodPerKg}
                onChange={(e) => setMethodPerKg(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Min Days</label>
              <input
                type="number"
                value={methodDaysMin}
                onChange={(e) => setMethodDaysMin(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Max Days</label>
              <input
                type="number"
                value={methodDaysMax}
                onChange={(e) => setMethodDaysMax(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">Free Air Shipping Threshold (USDT)</label>
            <input
              type="number"
              value={methodFreeMin}
              onChange={(e) => setMethodFreeMin(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsMethodModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2F65F6] hover:bg-[#2563EB] text-white font-bold transition-colors shadow-blue-500/25 shadow-xs cursor-pointer"
            >
              Save Carrier Rate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
