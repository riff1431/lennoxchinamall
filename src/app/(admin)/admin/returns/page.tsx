"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  Camera,
  Coins,
  DollarSign,
  ExternalLink,
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
import { MOCK_RETURNS, ReturnClaim } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/utils/helpers";

export default function AdminReturnsPage() {
  const [returnClaims, setReturnClaims] =
    useState<ReturnClaim[]>(MOCK_RETURNS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<ReturnClaim | null>(null);
  const [viewingEvidenceClaim, setViewingEvidenceClaim] =
    useState<ReturnClaim | null>(null);

  // Delete confirm dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClaimId, setDeletingClaimId] = useState<string | null>(null);

  // Form Fields State
  const [rmaNumber, setRmaNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [reason, setReason] = useState("Factory transit defect");
  const [defectDescription, setDefectDescription] = useState("");
  const [evidenceType, setEvidenceType] =
    useState<ReturnClaim["evidenceType"]>("video_proof");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [status, setStatus] = useState<ReturnClaim["status"]>("requested");
  const [refundAmountUSDT, setRefundAmountUSDT] = useState(0);
  const [assignedInspector, setAssignedInspector] = useState("Support Desk Lead");
  const [resolutionNote, setResolutionNote] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setEditingClaim(null);
    setRmaNumber(`RMA-${today.slice(0, 4)}-${randomNum}`);
    setOrderNumber(`LCM-${today}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    setCustomerName("");
    setCustomerEmail("");
    setProductTitle("");
    setReason("Hardware functional fault within 30-day warranty");
    setDefectDescription("");
    setEvidenceType("video_proof");
    setEvidenceUrl("https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80");
    setStatus("requested");
    setRefundAmountUSDT(49.99);
    setAssignedInspector("Support Desk Lead");
    setResolutionNote("");
    setIsReviewModalOpen(true);
  };

  // Open Edit / Review Modal
  const handleOpenReviewModal = (claim: ReturnClaim) => {
    setEditingClaim(claim);
    setRmaNumber(claim.rmaNumber);
    setOrderNumber(claim.orderNumber);
    setCustomerName(claim.customerName);
    setCustomerEmail(claim.customerEmail);
    setProductTitle(claim.productTitle);
    setReason(claim.reason);
    setDefectDescription(claim.defectDescription);
    setEvidenceType(claim.evidenceType);
    setEvidenceUrl(claim.evidenceUrl);
    setStatus(claim.status);
    setRefundAmountUSDT(claim.refundAmountUSDT);
    setAssignedInspector(claim.assignedInspector);
    setResolutionNote(claim.resolutionNote || "");
    setIsReviewModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !productTitle.trim()) {
      showToast("Please provide customer name and product title.");
      return;
    }

    if (editingClaim) {
      setReturnClaims((prev) =>
        prev.map((item) =>
          item.id === editingClaim.id
            ? {
                ...item,
                rmaNumber,
                orderNumber,
                customerName,
                customerEmail,
                productTitle,
                reason,
                defectDescription,
                evidenceType,
                evidenceUrl,
                status,
                refundAmountUSDT: Number(refundAmountUSDT),
                assignedInspector,
                resolutionNote,
              }
            : item
        )
      );
      showToast(`RMA Claim ${rmaNumber} updated successfully.`);
    } else {
      const newClaim: ReturnClaim = {
        id: `ret-${Date.now()}`,
        rmaNumber,
        orderNumber,
        customerName,
        customerEmail,
        productTitle,
        reason,
        defectDescription,
        evidenceType,
        evidenceUrl,
        claimDate: new Date().toISOString(),
        status,
        refundAmountUSDT: Number(refundAmountUSDT),
        assignedInspector,
        resolutionNote: resolutionNote || "RMA claim filed under 30-day warranty policy.",
      };
      setReturnClaims((prev) => [newClaim, ...prev]);
      showToast(`New RMA warranty claim ${rmaNumber} created!`);
    }

    setIsReviewModalOpen(false);
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    if (!deletingClaimId) return;
    setReturnClaims((prev) => prev.filter((item) => item.id !== deletingClaimId));
    showToast("Warranty RMA claim removed.");
    setDeletingClaimId(null);
  };

  // Status mapping for badge tones
  const getStatusTone = (st: ReturnClaim["status"]): BadgeTone => {
    switch (st) {
      case "requested":
        return "amber";
      case "under_review":
        return "blue";
      case "approved":
        return "emerald";
      case "rejected":
        return "red";
      case "refunded":
        return "purple";
      default:
        return "slate";
    }
  };

  const getStatusLabel = (st: ReturnClaim["status"]): string => {
    switch (st) {
      case "requested":
        return "Requested";
      case "under_review":
        return "Under Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "refunded":
        return "Refunded";
      default:
        return st;
    }
  };

  // KPI Calculations
  const totalClaims = returnClaims.length;
  const underReviewCount = returnClaims.filter(
    (r) => r.status === "under_review" || r.status === "requested"
  ).length;
  const totalRefundedUSDT = returnClaims
    .filter((r) => r.status === "approved" || r.status === "refunded")
    .reduce((sum, r) => sum + r.refundAmountUSDT, 0);
  const approvedCount = returnClaims.filter(
    (r) => r.status === "approved" || r.status === "refunded"
  ).length;
  const resolutionRate =
    totalClaims > 0 ? Math.round((approvedCount / totalClaims) * 100) : 100;

  // AdminDataTable Column definitions
  const columns: Column<ReturnClaim>[] = [
    {
      header: "RMA #",
      accessorKey: "rmaNumber",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-white text-xs block">
            {row.rmaNumber}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {formatDate(row.claimDate)}
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
      header: "Customer",
      accessorKey: "customerName",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5 max-w-[170px]">
          <span className="font-bold text-white block truncate text-xs">
            {row.customerName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block truncate">
            {row.customerEmail}
          </span>
        </div>
      ),
    },
    {
      header: "Product Item",
      accessorKey: "productTitle",
      sortable: true,
      cell: (row) => (
        <span
          className="text-slate-200 font-medium line-clamp-1 text-xs block max-w-[180px]"
          title={row.productTitle}
        >
          {row.productTitle}
        </span>
      ),
    },
    {
      header: "Reason / Defect",
      accessorKey: "reason",
      cell: (row) => (
        <div className="max-w-[180px]">
          <span
            className="text-slate-300 text-xs line-clamp-1 font-semibold block"
            title={row.reason}
          >
            {row.reason}
          </span>
          <span
            className="text-[10px] text-slate-500 line-clamp-1 block mt-0.5"
            title={row.defectDescription}
          >
            {row.defectDescription}
          </span>
        </div>
      ),
    },
    {
      header: "Evidence",
      accessorKey: "evidenceType",
      sortable: true,
      cell: (row) => (
        <button
          type="button"
          onClick={() => setViewingEvidenceClaim(row)}
          className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
            row.evidenceType === "video_proof"
              ? "bg-purple-950/50 text-purple-300 border-purple-800/80 hover:bg-purple-900/60"
              : "bg-cyan-950/50 text-cyan-300 border-cyan-800/80 hover:bg-cyan-900/60"
          }`}
          title="Click to inspect defect evidence"
        >
          {row.evidenceType === "video_proof" ? (
            <Video className="w-3 h-3 text-purple-400" />
          ) : (
            <Camera className="w-3 h-3 text-cyan-400" />
          )}
          <span>
            {row.evidenceType === "video_proof" ? "Video Proof" : "Photo Proof"}
          </span>
        </button>
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
      header: "Refund (USDT)",
      accessorKey: "refundAmountUSDT",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-emerald-400 price-tag text-xs">
          {formatCurrency(row.refundAmountUSDT)}
        </span>
      ),
    },
    {
      header: "Inspector",
      accessorKey: "assignedInspector",
      sortable: true,
      cell: (row) => (
        <span className="text-slate-300 text-xs font-medium">
          {row.assignedInspector}
        </span>
      ),
    },
    {
      header: "Resolution Note",
      accessorKey: "resolutionNote",
      cell: (row) => (
        <span
          className="text-slate-400 text-[11px] line-clamp-1 max-w-[170px] block"
          title={row.resolutionNote}
        >
          {row.resolutionNote || "Pending investigation"}
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
            onClick={() => setViewingEvidenceClaim(row)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Inspect Evidence Media"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenReviewModal(row)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Review RMA Claim & Refund"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setDeletingClaimId(row.id);
              setIsDeleteDialogOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Delete RMA Claim"
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
        { value: "requested", label: "Requested" },
        { value: "under_review", label: "Under Review" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "refunded", label: "Refunded" },
      ],
    },
    {
      key: "evidenceType",
      label: "Evidence Type",
      options: [
        { value: "video_proof", label: "Video Proof" },
        { value: "photo_inspection", label: "Photo Inspection" },
      ],
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<ReturnClaim>[] = [
    {
      label: "Approve Claims",
      icon: CheckCircle2,
      variant: "success",
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map((r) => r.id));
        setReturnClaims((prev) =>
          prev.map((claim) =>
            selectedIds.has(claim.id)
              ? {
                  ...claim,
                  status: "approved",
                  resolutionNote:
                    "Batch approved under Lennox 30-Day Factory Direct Warranty Policy.",
                }
              : claim
          )
        );
        showToast(
          `Approved ${selectedRows.length} RMA warranty claims.`
        );
      },
    },
    {
      label: "Reject Claims",
      icon: XCircle,
      variant: "danger",
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map((r) => r.id));
        setReturnClaims((prev) =>
          prev.map((claim) =>
            selectedIds.has(claim.id)
              ? {
                  ...claim,
                  status: "rejected",
                  resolutionNote:
                    "Claim rejected: Insufficient defect evidence or outside 30-day warranty window.",
                }
              : claim
          )
        );
        showToast(
          `Rejected ${selectedRows.length} RMA warranty claims.`
        );
      },
    },
    {
      label: "Mark as Refunded",
      icon: Coins,
      variant: "default",
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map((r) => r.id));
        setReturnClaims((prev) =>
          prev.map((claim) =>
            selectedIds.has(claim.id)
              ? {
                  ...claim,
                  status: "refunded",
                  resolutionNote:
                    "Direct Binance Pay USDT refund settled with customer.",
                }
              : claim
          )
        );
        showToast(
          `Marked ${selectedRows.length} claims as USDT Refunded.`
        );
      },
    },
    {
      label: "Delete Selected",
      icon: Trash2,
      variant: "danger",
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map((r) => r.id));
        setReturnClaims((prev) =>
          prev.filter((claim) => !selectedIds.has(claim.id))
        );
        showToast(`Deleted ${selectedRows.length} RMA claims.`);
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Returns &amp; Warranty RMA Claims"
        subtitle="Manage 30-day factory direct warranty claims, inspect video/photo defect evidence, and issue Binance Pay USDT refunds."
        badge={{ text: "30-Day RMA Warranty", variant: "purple" }}
        breadcrumbs={[{ label: "Returns & Warranty" }]}
        actions={[
          {
            label: "New RMA Claim",
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
        <div className="p-4.5 rounded-2xl bg-[#F3E8FF] dark:bg-[#28183B] border border-[#E9D5FF]/50 dark:border-purple-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total RMA Pipeline
            </span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {totalClaims} Claims
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">30-day factory direct warranty</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Under Review
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {underReviewCount} Claims
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Teardown video proof queue</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              USDT Refund Settled
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {formatCurrency(totalRefundedUSDT)}
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Zero gateway penalty fee</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Warranty Approval Rate
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {resolutionRate}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Honored factory replacements</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <AdminDataTable
        data={returnClaims}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by RMA #, Order #, Customer, Product, or Reason..."
        searchFields={[
          "rmaNumber",
          "orderNumber",
          "customerName",
          "customerEmail",
          "productTitle",
          "reason",
          "assignedInspector",
        ]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="rmaNumber"
        defaultSortDirection="desc"
        emptyTitle="No warranty RMA claims found"
        emptyDescription="Try changing your filters or create a new customer return claim."
        emptyAction={{
          label: "New RMA Claim",
          onClick: handleOpenCreateModal,
        }}
      />

      {/* ── 4. Review / Edit Claim Modal ── */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={editingClaim ? `Review RMA Claim — ${editingClaim.rmaNumber}` : "Create Warranty RMA Claim"}
        size="xl"
      >
        <form onSubmit={handleSaveClaim} className="space-y-5 text-xs text-slate-800 dark:text-slate-200">
          {/* Warranty Policy Strip */}
          <div className="p-3.5 bg-[#F3E8FF] dark:bg-purple-950/40 rounded-2xl border border-[#E9D5FF]/60 dark:border-purple-800/60 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-purple-700 dark:text-purple-300 uppercase text-[10px] tracking-wider block">
                Lennox 30-Day Direct Factory Warranty Gate
              </span>
              <p className="text-[11px] text-purple-900/80 dark:text-purple-200/80 leading-relaxed">
                Review defect diagnosis, inspect audio/video proof, and issue instant zero-gas fee USDT settlement directly back to customer Binance Pay wallets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                RMA Authorization # *
              </label>
              <input
                type="text"
                required
                value={rmaNumber}
                onChange={(e) => setRmaNumber(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Original Order Number *
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
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Robert Taylor"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Customer Email *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. robert.t@outlook.com"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="e.g. BlitzWolf BW-WA3 Pro 120W Speaker"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Primary RMA Reason *
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Bluetooth Audio Distortion on Right Subwoofer"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Evidence Format Type *
              </label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value as ReturnClaim["evidenceType"])}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="video_proof">Video Proof (Diagnostic Teardown / Audio)</option>
                <option value="photo_inspection">Photo Inspection (Outer Box Impact / Defect)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Evidence Media URL (YouTube Embed / Image CDN)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Customer Defect Description &amp; Teardown Notes
              </label>
              <textarea
                rows={3}
                value={defectDescription}
                onChange={(e) => setDefectDescription(e.target.value)}
                placeholder="Detailed explanation of failure mode, sound distortion, impact damage..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Claim Lifecycle Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReturnClaim["status"])}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="requested">Requested (Pending Staff Review)</option>
                <option value="under_review">Under Review (Inspecting Media Proof)</option>
                <option value="approved">Approved (Eligible for USDT Refund)</option>
                <option value="rejected">Rejected (Does Not Meet Policy)</option>
                <option value="refunded">Refunded (Binance Pay Settled)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Refund Amount (USDT) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={refundAmountUSDT}
                onChange={(e) => setRefundAmountUSDT(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Assigned Inspector *
              </label>
              <input
                type="text"
                required
                value={assignedInspector}
                onChange={(e) => setAssignedInspector(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Staff Resolution Note
              </label>
              <textarea
                rows={2}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Approved factory replacement warranty claim under 30-day policy."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          {/* Submit Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] transition-colors cursor-pointer shadow-blue-500/25 shadow-xs"
            >
              {editingClaim ? "Save RMA Resolution" : "Submit RMA Claim"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Evidence & Teardown Inspection Modal ── */}
      {viewingEvidenceClaim && (
        <Modal
          isOpen={!!viewingEvidenceClaim}
          onClose={() => setViewingEvidenceClaim(null)}
          title={`Defect Evidence Inspection — ${viewingEvidenceClaim.rmaNumber}`}
          size="lg"
        >
          <div className="space-y-5 text-xs text-slate-800 dark:text-slate-200">
            {/* Header info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {viewingEvidenceClaim.rmaNumber}
                </span>
                <StatusBadge
                  status={viewingEvidenceClaim.status}
                  tone={getStatusTone(viewingEvidenceClaim.status)}
                  label={getStatusLabel(viewingEvidenceClaim.status)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Product:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingEvidenceClaim.productTitle}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Customer:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {viewingEvidenceClaim.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Reported Fault:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    {viewingEvidenceClaim.reason}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Refund Value:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ${viewingEvidenceClaim.refundAmountUSDT.toFixed(2)} USDT
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Viewer Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  {viewingEvidenceClaim.evidenceType === "video_proof" ? (
                    <Video className="w-4 h-4 text-[#8B5CF6]" />
                  ) : (
                    <Camera className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  )}
                  <span>
                    {viewingEvidenceClaim.evidenceType === "video_proof"
                      ? "Diagnostic Video Proof"
                      : "Photo Inspection Proof"}
                  </span>
                </span>

                {viewingEvidenceClaim.evidenceUrl && (
                  <a
                    href={viewingEvidenceClaim.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#2F65F6] hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Raw Media Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Media Preview Container */}
              {viewingEvidenceClaim.evidenceType === "video_proof" ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <iframe
                    src={viewingEvidenceClaim.evidenceUrl}
                    title="Defect Diagnostic Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <Image
                    src={viewingEvidenceClaim.evidenceUrl}
                    alt="Defect proof"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* Defect Description */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[9px] block">
                  Customer Problem Log:
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  {viewingEvidenceClaim.defectDescription || "No additional description provided."}
                </p>
              </div>
            </div>

            {/* Resolution note */}
            {viewingEvidenceClaim.resolutionNote && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] block">
                  Inspector Findings &amp; Resolution:
                </span>
                <p className="text-slate-800 dark:text-slate-200 text-xs">
                  {viewingEvidenceClaim.resolutionNote}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const c = viewingEvidenceClaim;
                  setViewingEvidenceClaim(null);
                  handleOpenReviewModal(c);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] cursor-pointer shadow-blue-500/25 shadow-xs"
              >
                Review &amp; Set Refund
              </button>
              <button
                type="button"
                onClick={() => setViewingEvidenceClaim(null)}
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
        title="Delete RMA Claim"
        description="Are you sure you want to delete this warranty claim? This record will be permanently deleted."
        confirmLabel="Delete Claim"
        variant="danger"
      />
    </div>
  );
}
