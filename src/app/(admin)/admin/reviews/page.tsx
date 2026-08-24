"use client";

import React, { useState, useMemo } from "react";
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  ThumbsUp,
  AlertCircle,
  Plus,
  CornerDownRight,
  Award,
  Filter,
  Send,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { MOCK_ADMIN_REVIEWS, AdminReview } from "@/lib/mockData";
import { cn } from "@/utils/helpers";

// Additional rich initial reviews for comprehensive filtering demonstration
const INITIAL_REVIEWS: AdminReview[] = [
  ...MOCK_ADMIN_REVIEWS,
  {
    id: "rev-4",
    productTitle: "Creality K1 Max High-Speed 3D Printer",
    customerName: "Robert Chen",
    rating: 5,
    title: "Unbelievable 600mm/s speed, arrived in mint condition",
    comment: "The dual cooling fans and AI camera calibration work like magic. Direct factory firmware already installed. Highly recommend this store.",
    verifiedPurchase: true,
    hasMediaProof: true,
    status: "approved",
    isFeatured: true,
    sellerReply: "Thank you Robert! We calibrate all K1 Max units at our Shenzhen inspection facility before dispatch.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "rev-5",
    productTitle: "Dreame L10s Ultra Robot Vacuum",
    customerName: "Elena Rostova",
    rating: 4,
    title: "Great mop washing station, English manual requested",
    comment: "Robotic vacuum navigates flawlessly around dining chairs. USDT checkout on Polygon was confirmed in 8 seconds.",
    verifiedPurchase: true,
    hasMediaProof: false,
    status: "approved",
    isFeatured: false,
    sellerReply: "Hi Elena, our bilingual PDF user guide has been dispatched to your registered email address.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
  {
    id: "rev-6",
    productTitle: "Topshak TS-ESD4 20V Impact Wrench",
    customerName: "Marcus Vance",
    rating: 1,
    title: "Wrong socket size included in carry case",
    comment: "Kit was missing the 21mm wheel nut adapter. Please send replacement part or process return.",
    verifiedPurchase: true,
    hasMediaProof: true,
    status: "pending",
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: "rev-7",
    productTitle: "Xiaomi Mijia Smart Air Purifier 4 Pro",
    customerName: "Devon Lee",
    rating: 5,
    title: "Laser sensor is hyper-sensitive, PM2.5 cleared in minutes",
    comment: "Super quiet night mode. Fast air freight via YunExpress cleared customs without delay.",
    verifiedPurchase: true,
    hasMediaProof: true,
    status: "approved",
    isFeatured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "rev-8",
    productTitle: "BMAX MaxPad I11 Plus Tablet",
    customerName: "Unregistered Guest",
    rating: 1,
    title: "Spam advertisement link inside review text",
    comment: "Check out this promotional cryptocurrency giveaway link http://spam-promo.fake",
    verifiedPurchase: false,
    hasMediaProof: false,
    status: "rejected",
    isFeatured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>(INITIAL_REVIEWS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Moderation / Edit Modal State
  const [isModerateModalOpen, setIsModerateModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [modStatus, setModStatus] = useState<"approved" | "pending" | "rejected">("approved");
  const [modIsFeatured, setModIsFeatured] = useState<boolean>(false);
  const [modSellerReply, setModSellerReply] = useState<string>("");

  // Create Review Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newVerified, setNewVerified] = useState(true);
  const [newHasMedia, setNewHasMedia] = useState(false);
  const [newStatus, setNewStatus] = useState<"approved" | "pending" | "rejected">("approved");
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [newSellerReply, setNewSellerReply] = useState("");

  // Delete Confirm Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(null);
  const [bulkReviewsToDelete, setBulkReviewsToDelete] = useState<AdminReview[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    const pending = reviews.filter((r) => r.status === "pending").length;
    const rejected = reviews.filter((r) => r.status === "rejected").length;
    const featured = reviews.filter((r) => r.isFeatured).length;
    const avgRating =
      total > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1)
        : "5.0";
    return { total, approved, pending, rejected, featured, avgRating };
  }, [reviews]);

  // Open Moderation Modal
  const handleOpenModerateModal = (review: AdminReview) => {
    setSelectedReview(review);
    setModStatus(review.status);
    setModIsFeatured(review.isFeatured);
    setModSellerReply(review.sellerReply || "");
    setIsModerateModalOpen(true);
  };

  // Save Moderation Changes
  const handleSaveModeration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === selectedReview.id
          ? {
              ...r,
              status: modStatus,
              isFeatured: modIsFeatured,
              sellerReply: modSellerReply.trim() ? modSellerReply.trim() : undefined,
            }
          : r
      )
    );

    showToast(`Review for "${selectedReview.productTitle}" updated successfully!`);
    setIsModerateModalOpen(false);
    setSelectedReview(null);
  };

  // Quick Status Changes
  const handleQuickStatusChange = (id: string, status: "approved" | "rejected" | "pending") => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    showToast(`Review status marked as ${status.toUpperCase()}.`);
  };

  // Quick Featured Toggle
  const handleToggleFeatured = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextVal = !r.isFeatured;
          showToast(nextVal ? "Review pinned as Featured!" : "Review unpinned from Featured.");
          return { ...r, isFeatured: nextVal };
        }
        return r;
      })
    );
  };

  // Delete Action
  const handleOpenDeleteModal = (review: AdminReview) => {
    setReviewToDelete(review);
    setBulkReviewsToDelete([]);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (reviewToDelete) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
      showToast("Review deleted permanently.");
      setReviewToDelete(null);
    } else if (bulkReviewsToDelete.length > 0) {
      const idsToDelete = new Set(bulkReviewsToDelete.map((r) => r.id));
      setReviews((prev) => prev.filter((r) => !idsToDelete.has(r.id)));
      showToast(`${bulkReviewsToDelete.length} reviews deleted permanently.`);
      setBulkReviewsToDelete([]);
    }
    setIsDeleteDialogOpen(false);
  };

  // Create Review Handler
  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductTitle.trim() || !newCustomerName.trim() || !newTitle.trim()) return;

    const newReviewItem: AdminReview = {
      id: `rev-${Date.now()}`,
      productTitle: newProductTitle.trim(),
      customerName: newCustomerName.trim(),
      rating: newRating,
      title: newTitle.trim(),
      comment: newComment.trim(),
      verifiedPurchase: newVerified,
      hasMediaProof: newHasMedia,
      status: newStatus,
      isFeatured: newIsFeatured,
      sellerReply: newSellerReply.trim() ? newSellerReply.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    setReviews([newReviewItem, ...reviews]);
    showToast("New customer review added successfully!");
    setIsCreateModalOpen(false);

    // Reset form
    setNewProductTitle("");
    setNewCustomerName("");
    setNewRating(5);
    setNewTitle("");
    setNewComment("");
    setNewVerified(true);
    setNewHasMedia(false);
    setNewStatus("approved");
    setNewIsFeatured(false);
    setNewSellerReply("");
  };

  // Table Columns Definition
  const columns: Column<AdminReview>[] = [
    {
      header: "Product",
      accessorKey: "productTitle",
      sortable: true,
      cell: (row) => (
        <div className="max-w-[190px]">
          <div className="font-bold text-white text-xs truncate" title={row.productTitle}>
            {row.productTitle}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF1028] shrink-0" />
            <span>Factory Direct</span>
          </div>
        </div>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      sortable: true,
      cell: (row) => (
        <div className="text-xs font-semibold text-slate-200 flex items-center gap-2 max-w-[140px]">
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-300 shrink-0">
            {row.customerName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate" title={row.customerName}>
            {row.customerName}
          </span>
        </div>
      ),
    },
    {
      header: "Rating",
      accessorKey: "rating",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center text-sm tracking-tight select-none">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= row.rating ? "text-amber-400 font-bold" : "text-slate-700"}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-300 font-mono">({row.rating}.0)</span>
        </div>
      ),
    },
    {
      header: "Review Title",
      accessorKey: "title",
      sortable: true,
      cell: (row) => (
        <div className="font-bold text-xs text-slate-100 max-w-[160px] truncate" title={row.title}>
          {row.title}
        </div>
      ),
    },
    {
      header: "Comment",
      accessorKey: "comment",
      cell: (row) => (
        <div className="text-xs text-slate-400 max-w-[210px] truncate" title={row.comment}>
          {row.comment}
        </div>
      ),
    },
    {
      header: "Verified Purchase",
      accessorKey: "verifiedPurchase",
      sortable: true,
      cell: (row) =>
        row.verifiedPurchase ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
            <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/60 text-slate-400 border border-slate-700">
            Unverified
          </span>
        ),
    },
    {
      header: "Has Media",
      accessorKey: "hasMediaProof",
      sortable: true,
      cell: (row) =>
        row.hasMediaProof ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/80">
            <ImageIcon className="w-3 h-3 text-purple-400" />
            Media Proof
          </span>
        ) : (
          <span className="text-[11px] text-slate-500 font-mono text-center block">—</span>
        ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const toneMap: Record<string, "emerald" | "amber" | "red"> = {
          approved: "emerald",
          pending: "amber",
          rejected: "red",
        };
        return <StatusBadge status={row.status} tone={toneMap[row.status] || "slate"} />;
      },
    },
    {
      header: "Featured",
      accessorKey: "isFeatured",
      sortable: true,
      cell: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFeatured(row.id);
          }}
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer inline-flex items-center gap-1",
            row.isFeatured
              ? "bg-[#FF1028]/15 text-[#FF1028] border-[#FF1028]/40 hover:bg-[#FF1028]/25 shadow-xs"
              : "bg-slate-800/40 text-slate-500 border-slate-700 hover:text-slate-300"
          )}
          title="Click to toggle featured display on product page"
        >
          <Sparkles className="w-3 h-3" />
          {row.isFeatured ? "Featured" : "Standard"}
        </button>
      ),
    },
    {
      header: "Seller Reply",
      accessorKey: "sellerReply",
      cell: (row) =>
        row.sellerReply ? (
          <div
            className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold max-w-[110px] truncate"
            title={row.sellerReply}
          >
            <MessageSquare className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">Replied</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="w-3 h-3 text-slate-600 shrink-0" />
            <span>Pending reply</span>
          </div>
        ),
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => handleOpenModerateModal(row)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="Moderate Review & Reply"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {row.status !== "approved" && (
            <button
              onClick={() => handleQuickStatusChange(row.id, "approved")}
              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 transition-colors cursor-pointer"
              title="Quick Approve"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          {row.status !== "rejected" && (
            <button
              onClick={() => handleQuickStatusChange(row.id, "rejected")}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 transition-colors cursor-pointer"
              title="Quick Reject"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => handleOpenDeleteModal(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="Delete Review"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Filters Configuration
  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "approved", label: "Approved" },
        { value: "pending", label: "Pending Moderation" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    {
      key: "rating",
      label: "Rating",
      options: [
        { value: "5", label: "5 Stars (★★★★★)" },
        { value: "4", label: "4 Stars (★★★★☆)" },
        { value: "3", label: "3 Stars (★★★☆☆)" },
        { value: "2", label: "2 Stars (★★☆☆☆)" },
        { value: "1", label: "1 Star  (★☆☆☆☆)" },
      ],
    },
  ];

  // Bulk Actions Configuration
  const bulkActions: BulkAction<AdminReview>[] = [
    {
      label: "Approve Selected",
      icon: Check,
      variant: "success",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setReviews((prev) =>
          prev.map((r) => (ids.has(r.id) ? { ...r, status: "approved" } : r))
        );
        showToast(`${selected.length} reviews approved and published!`);
      },
    },
    {
      label: "Reject Selected",
      icon: X,
      variant: "danger",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setReviews((prev) =>
          prev.map((r) => (ids.has(r.id) ? { ...r, status: "rejected" } : r))
        );
        showToast(`${selected.length} reviews marked as rejected.`);
      },
    },
    {
      label: "Feature on Storefront",
      icon: Sparkles,
      variant: "default",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setReviews((prev) =>
          prev.map((r) => (ids.has(r.id) ? { ...r, isFeatured: true } : r))
        );
        showToast(`${selected.length} reviews pinned as featured.`);
      },
    },
    {
      label: "Delete Selected",
      icon: Trash2,
      variant: "danger",
      onClick: (selected) => {
        setBulkReviewsToDelete(selected);
        setReviewToDelete(null);
        setIsDeleteDialogOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Customer Reviews & Moderation"
        subtitle="Moderate product feedback, verify media proofs, pin top customer ratings to storefront cards, and post official factory responses."
        badge={{ text: "QC & SOCIAL PROOF", variant: "emerald" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Reviews Moderation" },
        ]}
        actions={[
          {
            label: "Add Review Entry",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsCreateModalOpen(true),
          },
        ]}
      />

      {/* ── 2. Stat Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Total Reviews
            </span>
            <MessageCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.total}</div>
          <div className="text-[10px] text-slate-400">All submitted feedback</div>
        </div>

        {/* Approved Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
              Approved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.approved}</div>
          <div className="text-[10px] text-slate-400">Live on storefront</div>
        </div>

        {/* Pending Moderation */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
              Pending QC
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{stats.pending}</div>
          <div className="text-[10px] text-slate-400">Requires moderation</div>
        </div>

        {/* Average Rating */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
              Avg Rating
            </span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono flex items-center gap-1.5">
            {stats.avgRating}
            <span className="text-xs text-amber-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[10px] text-slate-400">Store-wide average</div>
        </div>

        {/* Featured Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#FF1028] tracking-wider">
              Featured
            </span>
            <Award className="w-4 h-4 text-[#FF1028]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.featured}</div>
          <div className="text-[10px] text-slate-400">Pinned to product headers</div>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <AdminDataTable
          data={reviews}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search product, customer, title or comment..."
          searchFields={["productTitle", "customerName", "title", "comment"]}
          filters={filters}
          bulkActions={bulkActions}
          defaultSortKey="createdAt"
          defaultSortDirection="desc"
          emptyTitle="No reviews found"
          emptyDescription="There are no customer reviews matching your search query or filter selection."
          emptyAction={{
            label: "Add Test Review",
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      </div>

      {/* ── 4. Moderation & Reply Modal ── */}
      {selectedReview && (
        <Modal
          isOpen={isModerateModalOpen}
          onClose={() => setIsModerateModalOpen(false)}
          title={`Moderate Review: ${selectedReview.productTitle}`}
          size="xl"
        >
          <form onSubmit={handleSaveModeration} className="space-y-6 pt-2">
            {/* Customer & Rating Overview Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs text-white">
                    {selectedReview.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{selectedReview.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Posted on {formatDate(selectedReview.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Rating Stars & Badges */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400 text-base">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={
                          star <= selectedReview.rating ? "text-amber-400 font-bold" : "text-slate-700"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white font-mono">
                    ({selectedReview.rating}.0 / 5.0)
                  </span>
                </div>
              </div>

              {/* Badges strip */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedReview.verifiedPurchase ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                    Verified Binance USDT Purchase
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800/60 text-slate-400 border border-slate-700">
                    Non-Verified Purchase
                  </span>
                )}

                {selectedReview.hasMediaProof ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/80">
                    <ImageIcon className="w-3 h-3 text-purple-400" />
                    Customer Media Attached (Verified)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800/60 text-slate-500 border border-slate-800">
                    No Images Attached
                  </span>
                )}
              </div>

              {/* Review Headline & Body */}
              <div className="pt-2 space-y-1.5">
                <div className="text-sm font-black text-white">{selectedReview.title}</div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/60 font-normal">
                  {selectedReview.comment}
                </p>
              </div>
            </div>

            {/* Moderation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Moderation Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Moderation Decision *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setModStatus("approved")}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                      modStatus === "approved"
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-xs"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModStatus("pending")}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                      modStatus === "pending"
                        ? "bg-amber-950/80 text-amber-300 border-amber-500 shadow-xs"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pending</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModStatus("rejected")}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                      modStatus === "rejected"
                        ? "bg-red-950/80 text-red-300 border-red-500 shadow-xs"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    <X className="w-3.5 h-3.5 text-red-400" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Featured On Storefront */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Storefront Highlighting
                </label>
                <div
                  onClick={() => setModIsFeatured(!modIsFeatured)}
                  className={cn(
                    "h-[42px] px-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors select-none",
                    modIsFeatured
                      ? "bg-[#FF1028]/10 border-[#FF1028]/50 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className={cn("w-4 h-4", modIsFeatured ? "text-[#FF1028]" : "text-slate-500")}
                    />
                    <span className="text-xs font-bold">
                      {modIsFeatured ? "Featured Review (Pinned)" : "Standard Review"}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                      modIsFeatured
                        ? "bg-[#FF1028] border-[#FF1028] text-white"
                        : "border-slate-700 bg-slate-900 text-transparent"
                    )}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Official Seller / Factory Reply */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-[#FF1028]" />
                  <span>Official Factory Seller Reply</span>
                </label>
                <span className="text-[10px] text-slate-500">Visible publicly below customer review</span>
              </div>

              {/* Quick Canned Macros */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">Quick template:</span>
                <button
                  type="button"
                  onClick={() =>
                    setModSellerReply(
                      "Thank you for sourcing with Lennox ChinaMall! We have verified your unit QC certificate and our warranty team is available 24/7."
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  General Praise
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModSellerReply(
                      "We apologize for the logistics inconvenience. Our Guangzhou operations desk has dispatched an expedited replacement accessory."
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  Logistics Care
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModSellerReply(
                      "Please refer to our knowledge base for OTA firmware updates and setup instructions."
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  Technical Support
                </button>
              </div>

              <textarea
                rows={3}
                value={modSellerReply}
                onChange={(e) => setModSellerReply(e.target.value)}
                placeholder="Type official store reply to customer..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-3 outline-none focus:border-[#FF1028] transition-colors leading-relaxed placeholder-slate-600"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModerateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors shadow-md shadow-red-950/30 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Moderation Changes</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── 5. Create Review Modal ── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Customer Review Entry"
        size="lg"
      >
        <form onSubmit={handleCreateReview} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. BlitzWolf BW-WA3 Pro 120W Speaker"
                value={newProductTitle}
                onChange={(e) => setNewProductTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jason Thorne"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Rating (1 to 5 Stars) *</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              >
                <option value={5}>★★★★★ 5 Stars - Exceptional</option>
                <option value={4}>★★★★☆ 4 Stars - Very Good</option>
                <option value={3}>★★★☆☆ 3 Stars - Average</option>
                <option value={2}>★★☆☆☆ 2 Stars - Below Expectation</option>
                <option value={1}>★☆☆☆☆ 1 Star - Poor / Defective</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Moderation Status</label>
              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as "approved" | "pending" | "rejected")
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
              >
                <option value="approved">Approved & Published</option>
                <option value="pending">Pending Moderation</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Review Headline *</label>
            <input
              type="text"
              required
              placeholder="e.g. Excellent battery life and rugged build quality"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Full Review Comment *</label>
            <textarea
              rows={3}
              required
              placeholder="Enter customer feedback details..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-3 outline-none focus:border-[#FF1028]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={newVerified}
                onChange={(e) => setNewVerified(e.target.checked)}
                className="rounded text-[#FF1028] focus:ring-[#FF1028] bg-slate-900 border-slate-700"
              />
              <span>Verified Purchase</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={newHasMedia}
                onChange={(e) => setNewHasMedia(e.target.checked)}
                className="rounded text-[#FF1028] focus:ring-[#FF1028] bg-slate-900 border-slate-700"
              />
              <span>Has Media Proof</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={newIsFeatured}
                onChange={(e) => setNewIsFeatured(e.target.checked)}
                className="rounded text-[#FF1028] focus:ring-[#FF1028] bg-slate-900 border-slate-700"
              />
              <span>Featured Storefront</span>
            </label>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-300 block">
              Seller Reply (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Thanks for your business! Glad you enjoyed the direct factory pricing."
              value={newSellerReply}
              onChange={(e) => setNewSellerReply(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#FF1028]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors shadow-md cursor-pointer"
            >
              Publish Review
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 6. Delete Confirmation Dialog ── */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={
          reviewToDelete
            ? "Delete Review Record?"
            : `Delete ${bulkReviewsToDelete.length} Selected Reviews?`
        }
        description={
          reviewToDelete
            ? `Are you sure you want to permanently delete the review from "${reviewToDelete.customerName}" on "${reviewToDelete.productTitle}"? This action cannot be undone.`
            : `Are you sure you want to delete these ${bulkReviewsToDelete.length} customer reviews permanently?`
        }
        confirmLabel="Delete Review"
        variant="danger"
      />

      {/* ── 7. Floating Toast Notification ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span>✓ {toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 cursor-pointer ml-1"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
