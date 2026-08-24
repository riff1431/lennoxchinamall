"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Star,
  ShieldCheck,
  HelpCircle,
  History,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { SlideOver } from "@/components/admin/SlideOver";
import { Modal } from "@/components/ui/Modal";
import { Rating } from "@/components/ui/Rating";
import {
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminFormSection,
} from "@/components/admin/forms";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatDate, cn } from "@/utils/helpers";
import {
  ProductReview,
  ProductQuestion,
  AdminReviewStats,
  ReviewModerationLog,
} from "@/types/reviews";
import {
  getAdminReviews,
  getAdminReviewStats,
  moderateAdminReview,
  deleteAdminReview,
  bulkModerateReviews,
  getAdminQuestions,
  answerProductQuestionAdmin,
  getAdminModerationLogs,
} from "@/app/actions/admin-reviews";

export default function AdminReviewsPage() {
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<"reviews" | "qa" | "logs">("reviews");

  // Reviews Data
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<AdminReviewStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    featured: 0,
    reported: 0,
    avgRating: "5.0",
  });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Q&A Data
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Logs Data
  const [logs, setLogs] = useState<ReviewModerationLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Moderation / Edit SlideOver State
  const [isModerateSlideOverOpen, setIsModerateSlideOverOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null);
  const [modStatus, setModStatus] = useState<"approved" | "pending" | "rejected" | "hidden">("approved");
  const [modIsFeatured, setModIsFeatured] = useState<boolean>(false);
  const [modTitle, setModTitle] = useState<string>("");
  const [modBody, setModBody] = useState<string>("");
  const [modSellerReply, setModSellerReply] = useState<string>("");
  const [isSavingMod, setIsSavingMod] = useState(false);

  // Q&A Answer Modal State
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ProductQuestion | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  const loadReviewsData = useCallback(async () => {
    setIsLoadingReviews(true);
    try {
      const [resReviews, resStats] = await Promise.all([
        getAdminReviews(),
        getAdminReviewStats(),
      ]);
      if (resReviews.success) setReviews(resReviews.reviews);
      if (resStats) setStats(resStats);
    } catch {
      toast.error("Failed to load reviews.");
    } finally {
      setIsLoadingReviews(false);
    }
  }, [toast]);

  const loadQuestionsData = useCallback(async () => {
    setIsLoadingQuestions(true);
    try {
      const res = await getAdminQuestions();
      if (res.success) setQuestions(res.questions);
    } catch {
      toast.error("Failed to load questions.");
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [toast]);

  const loadLogsData = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const res = await getAdminModerationLogs();
      if (res.success) setLogs(res.logs);
    } catch {
      toast.error("Failed to load moderation logs.");
    } finally {
      setIsLoadingLogs(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReviewsData();
      loadQuestionsData();
      loadLogsData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadReviewsData, loadQuestionsData, loadLogsData]);

  // Open Moderation SlideOver
  const handleOpenModeration = (review: ProductReview) => {
    setSelectedReview(review);
    setModStatus(review.status);
    setModIsFeatured(Boolean(review.isFeatured));
    setModTitle(review.title || "");
    setModBody(review.body || "");
    setModSellerReply(review.adminReply || "");
    setIsModerateSlideOverOpen(true);
  };

  // Save Moderation
  const handleSaveModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;
    setIsSavingMod(true);
    try {
      const res = await moderateAdminReview({
        reviewId: selectedReview.id,
        status: modStatus,
        isFeatured: modIsFeatured,
        title: modTitle,
        body: modBody,
        sellerReply: modSellerReply,
      });
      if (res.success) {
        toast.success(res.message || "Review updated successfully.");
        setIsModerateSlideOverOpen(false);
        loadReviewsData();
      } else {
        toast.error(res.message || "Moderation save failed.");
      }
    } catch {
      toast.error("Failed to moderate review.");
    } finally {
      setIsSavingMod(false);
    }
  };

  // Delete Single Review
  const handleDeleteReview = async (review: ProductReview) => {
    try {
      const res = await deleteAdminReview(review.id);
      if (res.success) {
        toast.success("Review deleted.");
        loadReviewsData();
      } else {
        toast.error(res.message || "Failed to delete review.");
      }
    } catch {
      toast.error("Failed to delete review.");
    }
  };

  // Save Q&A Answer
  const handleSaveAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !answerText.trim()) return;
    setIsSavingAnswer(true);
    try {
      const res = await answerProductQuestionAdmin(selectedQuestion.id, answerText);
      if (res.success) {
        toast.success("Official merchant response published.");
        setIsAnswerModalOpen(false);
        setSelectedQuestion(null);
        setAnswerText("");
        loadQuestionsData();
      } else {
        toast.error(res.message || "Failed to save answer.");
      }
    } catch {
      toast.error("Failed to save answer.");
    } finally {
      setIsSavingAnswer(false);
    }
  };

  // Review Columns
  const reviewColumns: Column<ProductReview>[] = [
    {
      header: "Product & Customer",
      accessorKey: "userName",
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 dark:text-white block font-heading text-xs truncate max-w-xs">
            {row.productTitle || "Drone Hardware"}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{row.userName}</span>
            {row.isVerifiedPurchase && (
              <span className="text-emerald-500 font-bold text-[9px] flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Verified Buyer
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Rating & Headline",
      cell: (row) => (
        <div className="space-y-1">
          <Rating rating={row.rating} size="sm" />
          <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs truncate max-w-xs">
            {row.title || "Customer Feedback"}
          </span>
        </div>
      ),
    },
    {
      header: "Review Content",
      accessorKey: "body",
      cell: (row) => (
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 max-w-sm">
          {row.body}
        </p>
      ),
    },
    {
      header: "Moderation Status",
      accessorKey: "status",
      cell: (row) => {
        const tone: BadgeTone =
          row.status === "approved"
            ? "emerald"
            : row.status === "pending"
            ? "amber"
            : "rose";
        return <StatusBadge status={row.status} tone={tone} />;
      },
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] text-slate-500 font-mono">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-20",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end">
          <AdminActionMenu
            itemTitle={`review from "${row.userName}"`}
            onEdit={() => handleOpenModeration(row)}
            onDelete={() => handleDeleteReview(row)}
            customActions={[
              {
                label: "Reply as Merchant",
                icon: MessageSquare,
                onClick: () => handleOpenModeration(row),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  // Question Columns
  const questionColumns: Column<ProductQuestion>[] = [
    {
      header: "Product Scope",
      cell: (row) => (
        <span className="font-bold text-slate-900 dark:text-white block font-heading text-xs">
          {row.productTitle || "Product"}
        </span>
      ),
    },
    {
      header: "Customer Question",
      accessorKey: "question",
      cell: (row) => (
        <div className="space-y-0.5 max-w-md">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.question}</p>
          <span className="text-[10px] text-slate-400">Asked by {row.authorName}</span>
        </div>
      ),
    },
    {
      header: "Merchant Answer",
      cell: (row) => {
        const firstAns = row.answers?.[0]?.answer;
        return firstAns ? (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium line-clamp-2">
            ✓ {firstAns}
          </span>
        ) : (
          <span className="text-xs text-amber-500 italic">Awaiting response</span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <StatusBadge
          status={row.status}
          tone={row.status === "approved" ? "emerald" : "amber"}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right w-20",
      cell: (row) => (
        <button
          type="button"
          onClick={() => {
            setSelectedQuestion(row);
            setAnswerText(row.answers?.[0]?.answer || "");
            setIsAnswerModalOpen(true);
          }}
          className="px-3 py-1 rounded-xl bg-[#00143D] text-white text-xs font-bold hover:bg-[#002266] transition-colors cursor-pointer"
        >
          {row.answers?.[0]?.answer ? "Edit Answer" : "Answer"}
        </button>
      ),
    },
  ];

  // Log Columns
  const logColumns: Column<ReviewModerationLog>[] = [
    {
      header: "Moderator",
      accessorKey: "adminName",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-900 dark:text-white font-bold">
          {row.adminName || "Admin"}
        </span>
      ),
    },
    {
      header: "Action Performed",
      accessorKey: "action",
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#2F65F6] bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
          {row.action}
        </span>
      ),
    },
    {
      header: "Reason / Notes",
      accessorKey: "notes",
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">{row.notes || "—"}</span>
      ),
    },
    {
      header: "Timestamp",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-400">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  const reviewFilters: FilterOption[] = [
    {
      key: "status",
      label: "Moderation Status",
      options: [
        { value: "approved", label: "Approved Feedback" },
        { value: "pending", label: "Pending Moderation" },
        { value: "rejected", label: "Rejected" },
      ],
    },
  ];

  const reviewBulkActions: BulkAction<ProductReview>[] = [
    {
      label: "Approve Selected",
      variant: "success",
      onClick: async (selected) => {
        const ids = selected.map((s) => s.id);
        const res = await bulkModerateReviews(ids, "approve");
        toast.success(res.message);
        loadReviewsData();
      },
    },
    {
      label: "Reject Selected",
      variant: "danger",
      onClick: async (selected) => {
        const ids = selected.map((s) => s.id);
        const res = await bulkModerateReviews(ids, "reject");
        toast.success(res.message);
        loadReviewsData();
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Reviews &amp; Q&amp;A Moderation Desk"
        subtitle="Monitor verified customer feedback, rating distributions, official seller responses, and product inquiries."
        badge={{ text: `${stats.total} Total Reviews`, variant: "blue" }}
        breadcrumbs={[
          { label: "Marketing & CRM", href: "/admin/promotions" },
          { label: "Reviews & Q&A" },
        ]}
      />

      {/* ── 2. Top Metric KPI Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Reviews</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">Approved</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">{stats.approved}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase">Pending Review</span>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">{stats.pending}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase">Rejected</span>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono">{stats.rejected}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase">Featured Flag</span>
          <div className="text-2xl font-black text-purple-600 mt-1 font-mono">{stats.featured}</div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-amber-500 uppercase">Avg Rating</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5 font-mono">
            <span>{stats.avgRating}</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* ── 3. Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "reviews"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Product Reviews ({stats.total})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("qa")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "qa"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Customer Q&amp;A Desk ({questions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "logs"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <History className="w-3.5 h-3.5" />
          <span>Moderation Audit Trail</span>
        </button>
      </div>

      {/* ── 4. Main Tables By Tab ── */}
      {activeTab === "reviews" && (
        <AdminDataTable<ProductReview>
          data={reviews}
          columns={reviewColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search reviews by buyer or content..."
          searchFields={["userName", "title", "body"]}
          filters={reviewFilters}
          bulkActions={reviewBulkActions}
          defaultSortKey="createdAt"
          defaultSortDirection="desc"
          isLoading={isLoadingReviews}
          emptyTitle="No customer reviews"
          emptyDescription="Verified reviews will appear as buyers rate delivered hardware."
        />
      )}

      {activeTab === "qa" && (
        <AdminDataTable<ProductQuestion>
          data={questions}
          columns={questionColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search questions..."
          searchFields={["question", "authorName"]}
          defaultSortKey="createdAt"
          defaultSortDirection="desc"
          isLoading={isLoadingQuestions}
          emptyTitle="No inquiries logged"
          emptyDescription="Customer pre-purchase questions will appear here."
        />
      )}

      {activeTab === "logs" && (
        <AdminDataTable<ReviewModerationLog>
          data={logs}
          columns={logColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search audit logs..."
          searchFields={["adminName", "action"]}
          defaultSortKey="createdAt"
          defaultSortDirection="desc"
          isLoading={isLoadingLogs}
          emptyTitle="Moderation ledger is clean"
          emptyDescription="Audits are logged whenever reviews are approved or modified."
        />
      )}

      {/* ── 5. Slide-Over Panel: Review Moderation & Reply ── */}
      <SlideOver
        isOpen={isModerateSlideOverOpen}
        onClose={() => setIsModerateSlideOverOpen(false)}
        title="Moderate Customer Review"
        description="Verify authenticity, adjust display status, or publish an official merchant response."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsModerateSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSavingMod}
              onClick={handleSaveModeration}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs shadow-xs font-heading uppercase cursor-pointer disabled:opacity-50"
            >
              {isSavingMod ? "Saving..." : "Save Moderation"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveModeration} className="space-y-5">
          <AdminFormSection title="Moderation Status">
            <AdminSelect
              label="Publication State"
              value={modStatus}
              onChange={(e) => setModStatus(e.target.value as typeof modStatus)}
              options={[
                { value: "approved", label: "Approved & Live on Storefront" },
                { value: "pending", label: "Pending Verification" },
                { value: "rejected", label: "Rejected / Spam" },
                { value: "hidden", label: "Hidden from Public Feed" },
              ]}
            />

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={modIsFeatured}
                  onChange={(e) => setModIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-600 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  Feature Review at Top of Storefront Product Page
                </span>
              </label>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Review Content">
            <AdminInput
              label="Review Headline"
              value={modTitle}
              onChange={(e) => setModTitle(e.target.value)}
            />
            <AdminTextarea
              label="Review Body"
              rows={4}
              value={modBody}
              onChange={(e) => setModBody(e.target.value)}
            />
          </AdminFormSection>

          <AdminFormSection title="Official Merchant Response">
            <AdminTextarea
              label="Public Seller Reply"
              rows={3}
              placeholder="Thank the customer or provide warranty assistance..."
              value={modSellerReply}
              onChange={(e) => setModSellerReply(e.target.value)}
              helperText="Visible beneath customer review with a verified 'Merchant Response' badge."
            />
          </AdminFormSection>
        </form>
      </SlideOver>

      {/* ── 6. Modal: Q&A Answer ── */}
      <Modal
        isOpen={isAnswerModalOpen}
        onClose={() => setIsAnswerModalOpen(false)}
        title="Answer Customer Inquiries"
        size="md"
      >
        <form onSubmit={handleSaveAnswer} className="space-y-4 pt-1 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Customer Question</span>
            <p className="text-slate-800 dark:text-slate-200 font-semibold">{selectedQuestion?.question}</p>
          </div>

          <AdminTextarea
            label="Official Lennox ChinaMall Answer"
            rows={4}
            required
            placeholder="Provide technical specs, battery compatibility, or shipping details..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAnswerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingAnswer}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00143D] hover:bg-[#002266] shadow-xs cursor-pointer font-heading uppercase"
            >
              {isSavingAnswer ? "Publishing..." : "Publish Answer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
