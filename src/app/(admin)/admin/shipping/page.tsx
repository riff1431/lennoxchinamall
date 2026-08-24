"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { MOCK_SHIPPING, ShippingParcel } from "@/lib/mockData";
import { formatDate } from "@/utils/helpers";

export default function AdminShippingPage() {
  const [parcels, setParcels] = useState<ShippingParcel[]>(MOCK_SHIPPING);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingParcel, setEditingParcel] = useState<ShippingParcel | null>(null);
  const [viewingParcel, setViewingParcel] = useState<ShippingParcel | null>(null);

  // Delete confirm dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingParcelId, setDeletingParcelId] = useState<string | null>(null);

  // Form Fields State
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("YunExpress Air Cargo");
  const [orderNumber, setOrderNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [serviceType, setServiceType] = useState<ShippingParcel["serviceType"]>(
    "YunExpress Priority Air"
  );
  const [weightKg, setWeightKg] = useState(0.85);
  const [currentStatus, setCurrentStatus] =
    useState<ShippingParcel["currentStatus"]>("in_transit");
  const [latestEvent, setLatestEvent] = useState("");
  const [latestEventTime, setLatestEventTime] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [ddpTaxPaid, setDdpTaxPaid] = useState(true);

  // Copy tracking helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyTracking = (trackNum: string, id: string) => {
    navigator.clipboard.writeText(trackNum);
    setCopiedId(id);
    showToast(`Copied tracking #${trackNum} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    setEditingParcel(null);
    setTrackingNumber(`YUN-${randomSuffix}-US`);
    setOrderNumber(`LCM-${today}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    setCarrier("YunExpress Air Cargo");
    setRecipientName("");
    setDestinationCountry("United States (CA)");
    setServiceType("YunExpress Priority Air");
    setWeightKg(1.2);
    setCurrentStatus("in_transit");
    setLatestEvent("Departed Shenzhen Sorting Hub -> Manifested for Flight HKG-LAX");
    setLatestEventTime("Just now");
    setEstimatedDelivery("7-10 business days");
    setDdpTaxPaid(true);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (parcel: ShippingParcel) => {
    setEditingParcel(parcel);
    setTrackingNumber(parcel.trackingNumber);
    setCarrier(parcel.carrier);
    setOrderNumber(parcel.orderNumber);
    setRecipientName(parcel.recipientName);
    setDestinationCountry(parcel.destinationCountry);
    setServiceType(parcel.serviceType);
    setWeightKg(parcel.weightKg);
    setCurrentStatus(parcel.currentStatus);
    setLatestEvent(parcel.latestEvent);
    setLatestEventTime(parcel.latestEventTime);
    setEstimatedDelivery(parcel.estimatedDelivery);
    setDdpTaxPaid(parcel.ddpTaxPaid);
    setIsFormModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim() || !recipientName.trim()) {
      showToast("Please provide tracking number and recipient name.");
      return;
    }

    if (editingParcel) {
      setParcels((prev) =>
        prev.map((item) =>
          item.id === editingParcel.id
            ? {
                ...item,
                trackingNumber,
                carrier,
                orderNumber,
                recipientName,
                destinationCountry,
                serviceType,
                weightKg: Number(weightKg),
                currentStatus,
                latestEvent,
                latestEventTime: latestEventTime || "Updated just now",
                estimatedDelivery,
                ddpTaxPaid,
              }
            : item
        )
      );
      showToast(`Air parcel ${trackingNumber} updated successfully.`);
    } else {
      const newParcel: ShippingParcel = {
        id: `shp-${Date.now()}`,
        trackingNumber,
        carrier,
        orderNumber,
        recipientName,
        destinationCountry,
        serviceType,
        weightKg: Number(weightKg),
        currentStatus,
        latestEvent,
        latestEventTime: latestEventTime || "Just now",
        estimatedDelivery: estimatedDelivery || "7-12 days",
        ddpTaxPaid,
      };
      setParcels((prev) => [newParcel, ...prev]);
      showToast(`New air cargo dispatch registered (${trackingNumber})!`);
    }

    setIsFormModalOpen(false);
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    if (!deletingParcelId) return;
    setParcels((prev) => prev.filter((item) => item.id !== deletingParcelId));
    showToast("Shipping parcel record removed.");
    setDeletingParcelId(null);
  };

  // Status mapping for badge tones
  const getStatusTone = (st: ShippingParcel["currentStatus"]): BadgeTone => {
    switch (st) {
      case "in_transit":
        return "blue";
      case "customs_cleared":
        return "amber";
      case "departed_hkg":
        return "purple";
      case "out_for_delivery":
        return "cyan";
      case "delivered":
        return "emerald";
      default:
        return "slate";
    }
  };

  const getStatusLabel = (st: ShippingParcel["currentStatus"]): string => {
    switch (st) {
      case "in_transit":
        return "In Transit";
      case "customs_cleared":
        return "Customs Cleared";
      case "departed_hkg":
        return "Departed HKG";
      case "out_for_delivery":
        return "Out For Delivery";
      case "delivered":
        return "Delivered";
      default:
        return st;
    }
  };

  // KPI Calculations
  const inTransitCount = parcels.filter(
    (p) => p.currentStatus === "in_transit" || p.currentStatus === "departed_hkg"
  ).length;
  const customsClearedCount = parcels.filter(
    (p) => p.currentStatus === "customs_cleared"
  ).length;
  const outForDeliveryCount = parcels.filter(
    (p) => p.currentStatus === "out_for_delivery"
  ).length;
  const deliveredCount = parcels.filter(
    (p) => p.currentStatus === "delivered"
  ).length;

  // AdminDataTable Column definitions
  const columns: Column<ShippingParcel>[] = [
    {
      header: "Tracking #",
      accessorKey: "trackingNumber",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold text-white text-xs block">
            {row.trackingNumber}
          </span>
          <button
            type="button"
            onClick={() => handleCopyTracking(row.trackingNumber, row.id)}
            className="text-slate-400 hover:text-[#FF1028] transition-colors p-0.5"
            title="Copy Tracking Number"
          >
            {copiedId === row.id ? (
              <Check className="w-3 h-3 text-[#10B981]" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      ),
    },
    {
      header: "Carrier",
      accessorKey: "carrier",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-bold text-slate-200 text-xs block">
            {row.carrier}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            {row.serviceType}
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
          className="font-mono text-slate-300 hover:text-[#FF1028] transition-colors text-xs font-semibold"
        >
          {row.orderNumber}
        </Link>
      ),
    },
    {
      header: "Recipient & Destination",
      accessorKey: "recipientName",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5 max-w-[170px]">
          <span className="font-bold text-white block truncate text-xs">
            {row.recipientName}
          </span>
          <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-slate-500 shrink-0" />
            <span className="truncate">{row.destinationCountry}</span>
          </span>
        </div>
      ),
    },
    {
      header: "Weight",
      accessorKey: "weightKg",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-200 text-xs">
          {row.weightKg.toFixed(2)} kg
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "currentStatus",
      sortable: true,
      cell: (row) => (
        <StatusBadge
          status={row.currentStatus}
          tone={getStatusTone(row.currentStatus)}
          label={getStatusLabel(row.currentStatus)}
        />
      ),
    },
    {
      header: "Latest Event",
      accessorKey: "latestEvent",
      cell: (row) => (
        <div className="max-w-[220px]">
          <span
            className="text-slate-300 text-xs line-clamp-1 block"
            title={row.latestEvent}
          >
            {row.latestEvent}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
            {row.latestEventTime}
          </span>
        </div>
      ),
    },
    {
      header: "ETA",
      accessorKey: "estimatedDelivery",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-slate-300 text-xs">
          {row.estimatedDelivery}
        </span>
      ),
    },
    {
      header: "DDP Tax",
      accessorKey: "ddpTaxPaid",
      sortable: true,
      cell: (row) =>
        row.ddpTaxPaid ? (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/80 px-2 py-0.5 rounded-lg text-[10px] uppercase">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Pre-Paid</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-400 bg-amber-950/50 border border-amber-800/80 px-2 py-0.5 rounded-lg text-[10px] uppercase">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Unpaid</span>
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
            onClick={() => setViewingParcel(row)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Inspect Tracking Waybill"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Edit Shipping Status"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setDeletingParcelId(row.id);
              setIsDeleteDialogOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Delete Waybill"
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
      key: "currentStatus",
      label: "Status",
      options: [
        { value: "in_transit", label: "In Transit" },
        { value: "customs_cleared", label: "Customs Cleared" },
        { value: "departed_hkg", label: "Departed HKG" },
        { value: "out_for_delivery", label: "Out For Delivery" },
        { value: "delivered", label: "Delivered" },
      ],
    },
    {
      key: "carrier",
      label: "Carrier",
      options: [
        { value: "YunExpress Air Cargo", label: "YunExpress Air Cargo" },
        { value: "Yanwen Special Line", label: "Yanwen Special Line" },
        { value: "4PX Global Direct", label: "4PX Global Direct" },
        { value: "SF International", label: "SF International" },
      ],
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<ShippingParcel>[] = [
    {
      label: "Mark as Delivered",
      icon: CheckCircle2,
      variant: "success",
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map((r) => r.id));
        setParcels((prev) =>
          prev.map((parcel) =>
            selectedIds.has(parcel.id)
              ? {
                  ...parcel,
                  currentStatus: "delivered",
                  latestEvent: "Delivered to recipient doorstep & signed",
                  latestEventTime: "Just now",
                  estimatedDelivery: "Delivered",
                }
              : parcel
          )
        );
        showToast(
          `Marked ${selectedRows.length} parcels as "Delivered".`
        );
      },
    },
    {
      label: "Mark as Customs Cleared",
      icon: ShieldCheck,
      variant: "default",
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map((r) => r.id));
        setParcels((prev) =>
          prev.map((parcel) =>
            selectedIds.has(parcel.id)
              ? {
                  ...parcel,
                  currentStatus: "customs_cleared",
                  latestEvent: "DDP import customs cleared successfully -> Local courier injection",
                  latestEventTime: "Just now",
                }
              : parcel
          )
        );
        showToast(
          `Marked ${selectedRows.length} parcels as "Customs Cleared".`
        );
      },
    },
    {
      label: "Delete Selected",
      icon: Trash2,
      variant: "danger",
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map((r) => r.id));
        setParcels((prev) =>
          prev.filter((parcel) => !selectedIds.has(parcel.id))
        );
        showToast(`Deleted ${selectedRows.length} air cargo waybill records.`);
      },
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Shipping & Air Cargo Tracking"
        subtitle="Real-time international air logistics routing from Shenzhen & HKG air hubs with pre-cleared DDP customs."
        badge={{ text: "Air Logistics Hub", variant: "blue" }}
        breadcrumbs={[{ label: "Shipping & Tracking" }]}
        actions={[
          {
            label: "New Cargo Dispatch",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreateModal,
          },
        ]}
      />

      {/* ── 2. KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              In-Flight / In-Transit
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {inTransitCount} Parcels
          </div>
          <div className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
            <span>HKG & Shenzhen Flight Departures</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              DDP Customs Cleared
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {customsClearedCount} Parcels
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Zero-Tariff Handover to Local Carriers
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Out for Final Delivery
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300">
            {outForDeliveryCount} Parcels
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Last-mile courier courier routes
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Delivered Successfully
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#10B981] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {deliveredCount} Delivered
          </div>
          <div className="text-[11px] text-[#10B981] font-bold">
            Average Air Transit: 8.4 Days
          </div>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <AdminDataTable
        data={parcels}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by Tracking #, Order #, Recipient, Country, or Carrier..."
        searchFields={[
          "trackingNumber",
          "orderNumber",
          "recipientName",
          "destinationCountry",
          "carrier",
          "serviceType",
          "latestEvent",
        ]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="trackingNumber"
        defaultSortDirection="desc"
        emptyTitle="No shipping parcels found"
        emptyDescription="Try adjusting your filters or dispatch a new air cargo shipment."
        emptyAction={{
          label: "New Cargo Dispatch",
          onClick: handleOpenCreateModal,
        }}
      />

      {/* ── 4. Create / Edit Shipping Parcel Modal ── */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingParcel ? `Update Air Cargo Waybill — ${editingParcel.trackingNumber}` : "Dispatch New Air Cargo Parcel"}
        size="xl"
      >
        <form onSubmit={handleSaveParcel} className="space-y-5 pt-1 text-xs">
          {/* DDP Customs Guarantee Callout */}
          <div className="p-3.5 bg-blue-950/40 rounded-2xl border border-blue-800/60 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-black text-blue-300 uppercase text-[10px] tracking-wider block">
                Delivered Duty Paid (DDP) Express Air Line
              </span>
              <p className="text-[11px] text-blue-200/80 leading-relaxed">
                All shipments utilize Lennox pre-paid DDP customs lines through HKG and Baiyun International airports with no hidden import duties for global buyers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Air Waybill / Tracking # *
              </label>
              <input
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Customer Order Number *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Air Express Carrier *
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028] cursor-pointer"
              >
                <option value="YunExpress Air Cargo">YunExpress Air Cargo (7-12 Days)</option>
                <option value="Yanwen Special Line">Yanwen Special Line (6-10 Days)</option>
                <option value="4PX Global Direct">4PX Global Direct (7-14 Days)</option>
                <option value="SF International">SF International Priority (4-8 Days)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Specific Air Service Line *
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028] cursor-pointer"
              >
                <option value="YunExpress Priority Air">YunExpress Priority Air</option>
                <option value="Yanwen Special Line">Yanwen Special Line</option>
                <option value="4PX Global Direct">4PX Global Direct</option>
                <option value="SF International">SF International</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Recipient Full Name *
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Alex Harrison"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Destination Country & State *
              </label>
              <input
                type="text"
                required
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                placeholder="e.g. United States (CA) or Germany (Berlin)"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Parcel Gross Weight (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Tracking Status *
              </label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028] cursor-pointer"
              >
                <option value="in_transit">In Transit (Shenzhen Sort Facility)</option>
                <option value="departed_hkg">Departed HKG Airport (Flight In-Air)</option>
                <option value="customs_cleared">Customs Cleared (DDP Port)</option>
                <option value="out_for_delivery">Out for Final Delivery</option>
                <option value="delivered">Delivered to Recipient</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Latest Logistics Event / Checkpoint Description *
              </label>
              <input
                type="text"
                required
                value={latestEvent}
                onChange={(e) => setLatestEvent(e.target.value)}
                placeholder="e.g. Flight CZ431 Departed HKG -> In Flight to London Heathrow (LHR)"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Checkpoint Event Timestamp
              </label>
              <input
                type="text"
                value={latestEventTime}
                onChange={(e) => setLatestEventTime(e.target.value)}
                placeholder="e.g. Aug 24, 09:15 AM"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Estimated Delivery (ETA)
              </label>
              <input
                type="text"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                placeholder="e.g. Sep 02, 2026 or Delivered"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="sm:col-span-2 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-white text-xs block">
                  DDP Import Customs Clearance Status
                </span>
                <span className="text-[11px] text-slate-400">
                  Duty and value-added tax pre-settled by Lennox logistics.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ddpTaxPaid}
                  onChange={(e) => setDdpTaxPaid(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
              </label>
            </div>
          </div>

          {/* Submit Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors cursor-pointer shadow-md"
            >
              {editingParcel ? "Save Waybill Changes" : "Dispatch Air Shipment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Detailed Air Waybill Inspect Modal ── */}
      {viewingParcel && (
        <Modal
          isOpen={!!viewingParcel}
          onClose={() => setViewingParcel(null)}
          title={`Air Cargo Waybill Dossier — ${viewingParcel.trackingNumber}`}
          size="lg"
        >
          <div className="space-y-5 pt-1 text-xs text-slate-300">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-400" />
                  <span className="font-mono font-black text-white text-sm">
                    {viewingParcel.trackingNumber}
                  </span>
                </div>
                <StatusBadge
                  status={viewingParcel.currentStatus}
                  tone={getStatusTone(viewingParcel.currentStatus)}
                  label={getStatusLabel(viewingParcel.currentStatus)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Carrier Service:</span>
                  <span className="font-bold text-white">
                    {viewingParcel.carrier}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Associated Order:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {viewingParcel.orderNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gross Weight:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {viewingParcel.weightKg} kg
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Delivery ETA:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {viewingParcel.estimatedDelivery}
                  </span>
                </div>
              </div>
            </div>

            {/* Recipient Destination Box */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-black text-slate-200 uppercase text-[10px] tracking-wider block border-b border-slate-800 pb-1">
                Destination Recipient Details
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-bold text-white">
                    {viewingParcel.recipientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination Region:</span>
                  <span className="text-slate-200">
                    {viewingParcel.destinationCountry}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DDP Duty Clearance:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {viewingParcel.ddpTaxPaid ? "Pre-Paid & Customs Cleared" : "Pending Customs"}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Tracking Journey Timeline */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="font-black text-slate-200 uppercase text-[10px] tracking-wider block border-b border-slate-800 pb-1">
                Air Freight Transit Milestones
              </span>

              <div className="space-y-3 pl-2 border-l-2 border-slate-800 text-xs">
                <div className="relative pl-4 space-y-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] absolute -left-[21px] top-1 ring-4 ring-slate-950" />
                  <span className="font-bold text-white block">
                    {viewingParcel.latestEvent}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {viewingParcel.latestEventTime}
                  </span>
                </div>

                <div className="relative pl-4 space-y-0.5 opacity-70">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute -left-[21px] top-1 ring-4 ring-slate-950" />
                  <span className="font-semibold text-slate-300 block">
                    Processed at Shenzhen International Hub (PRD Logistics Gate)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Departed Origin Sorting Line
                  </span>
                </div>

                <div className="relative pl-4 space-y-0.5 opacity-40">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 absolute -left-[21px] top-1 ring-4 ring-slate-950" />
                  <span className="font-medium text-slate-400 block">
                    Air Cargo Manifest Dispatched by Lennox Fulfilment OS
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const p = viewingParcel;
                  setViewingParcel(null);
                  handleOpenEditModal(p);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Edit Waybill
              </button>
              <button
                type="button"
                onClick={() => setViewingParcel(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
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
        title="Delete Shipping Record"
        description="Are you sure you want to remove this air cargo shipment waybill? This action cannot be reversed."
        confirmLabel="Delete Waybill"
        variant="danger"
      />

      {/* ── 7. Toast Notification Bar ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span>✓ {toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
