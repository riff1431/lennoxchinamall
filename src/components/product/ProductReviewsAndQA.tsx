"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Search,
  Filter,
  Plus,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  Camera,
  Video,
  X,
  Check,
  Award,
  Sparkles,
  Send,
  Flag,
  User,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  Play,
  RotateCcw,
  UploadCloud,
  CheckCircle,
} from "lucide-react";
import {
  ProductReview,
  ReviewRatingDistribution,
  ProductQuestion,
  VerifiedPurchaseCheckResult,
} from "@/types/reviews";
import {
  getProductReviews,
  submitProductReview,
  updateCustomerReview,
  deleteCustomerReview,
  voteReviewHelpfulness,
  reportInappropriateReview,
  checkVerifiedBuyerEligibility,
} from "@/app/actions/product-reviews";
import {
  getProductQuestions,
  askProductQuestion,
  voteQuestionHelpfulness,
  reportInappropriateQuestion,
} from "@/app/actions/product-qa";
import { ProductQASection } from "@/components/product/ProductQASection";
import { uploadReviewMedia } from "@/app/actions/review-media";
import { Modal } from "@/components/ui/Modal";
import { Rating } from "@/components/ui/Rating";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDate, cn } from "@/utils/helpers";

interface ProductReviewsAndQAProps {
  productId: string;
  productTitle: string;
  productImage?: string;
  categoryName?: string;
  variants?: Array<{ id: string; title: string; sku: string }>;
}

export function ProductReviewsAndQA({
  productId,
  productTitle,
  productImage,
  categoryName,
  variants = [],
}: ProductReviewsAndQAProps) {
  const { user, displayName, isAuthenticated } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState<"reviews" | "qa">("reviews");

  // Reviews Filter States
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mediaOnly, setMediaOnly] = useState(false);
  const [variantFilter, setVariantFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"most_helpful" | "newest" | "highest_rating" | "lowest_rating">("most_helpful");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reviews Data States
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [distribution, setDistribution] = useState<ReviewRatingDistribution>({
    averageRating: 5.0,
    totalReviews: 0,
    breakdown: {
      5: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      1: { count: 0, percentage: 0 },
    },
    verifiedPurchasesCount: 0,
    withMediaCount: 0,
  });
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Q&A States
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [qaSearch, setQaSearch] = useState("");
  const [isLoadingQa, setIsLoadingQa] = useState(true);

  // Modals
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isEditReviewOpen, setIsEditReviewOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<ProductReview | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<string | null>(null);
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);
  const [activeMediaLightbox, setActiveMediaLightbox] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [reportModalReviewId, setReportModalReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("Spam or Advertising");
  const [reportDetails, setReportDetails] = useState("");
  const [reportQuestionModalId, setReportQuestionModalId] = useState<string | null>(null);

  // Eligibility
  const [eligibility, setEligibility] = useState<VerifiedPurchaseCheckResult | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  // New Review Form State
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formVariantId, setFormVariantId] = useState(variants[0]?.id || "");
  const [formMediaFiles, setFormMediaFiles] = useState<Array<{ url: string; type: "image" | "video" }>>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Edit Review Form State
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editMediaFiles, setEditMediaFiles] = useState<Array<{ url: string; type: "image" | "video" }>>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // New Question Form
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionAuthor, setNewQuestionAuthor] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionMsg, setQuestionMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Local Vote Trackers (for instant UI response)
  const [votedReviews, setVotedReviews] = useState<Record<string, "helpful" | "unhelpful">>({});
  const [votedQuestions, setVotedQuestions] = useState<Record<string, boolean>>({});

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Reviews
  const fetchReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    const res = await getProductReviews({
      productId,
      search: searchQuery,
      rating: ratingFilter,
      verifiedOnly,
      mediaOnly,
      variantId: variantFilter || undefined,
      sortBy,
      page: currentPage,
      pageSize: 6,
    });
    if (res.success) {
      setReviews(res.reviews);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
      setDistribution(res.distribution);
    }
    setIsLoadingReviews(false);
  }, [productId, searchQuery, ratingFilter, verifiedOnly, mediaOnly, variantFilter, sortBy, currentPage]);

  // Fetch Q&A
  const fetchQuestions = useCallback(async () => {
    setIsLoadingQa(true);
    const res = await getProductQuestions(productId, qaSearch);
    if (res.success) {
      setQuestions(res.questions);
    }
    setIsLoadingQa(false);
  }, [productId, qaSearch]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (activeMainTab === "qa") {
      fetchQuestions();
    }
  }, [activeMainTab, fetchQuestions]);

  // Check Buyer Eligibility when opening "Write Review" modal
  const handleOpenWriteReview = async () => {
    setIsCheckingEligibility(true);
    setIsWriteReviewOpen(true);
    setReviewSubmitStatus(null);
    try {
      const elig = await checkVerifiedBuyerEligibility(productId);
      setEligibility(elig);
      if (elig.purchasedVariantId) {
        setFormVariantId(elig.purchasedVariantId);
      }
    } catch {
      setEligibility({ isEligible: true, isVerifiedBuyer: true, hasAlreadyReviewed: false });
    }
    setIsCheckingEligibility(false);
  };

  // Upload Media Files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadReviewMedia(fd);
      if (res.success && res.url) {
        return { url: res.url, type: res.type || "image" };
      }
      return null;
    });

    const results = await Promise.all(uploadPromises);
    const valid = results.filter((r): r is { url: string; type: "image" | "video" } => r !== null);

    if (isEdit) {
      setEditMediaFiles((prev) => [...prev, ...valid]);
    } else {
      setFormMediaFiles((prev) => [...prev, ...valid]);
    }
    setIsUploadingMedia(false);
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formBody.trim()) {
      setReviewSubmitStatus({ success: false, message: "Please enter a headline and your review comments." });
      return;
    }

    setIsSubmittingReview(true);
    const selectedVariant = variants.find((v) => v.id === formVariantId);

    const res = await submitProductReview({
      productId,
      rating: formRating,
      title: formTitle,
      body: formBody,
      orderId: eligibility?.orderId,
      variantId: formVariantId || undefined,
      variantName: selectedVariant ? selectedVariant.title : undefined,
      mediaUrls: formMediaFiles.map((m) => m.url),
    });

    setIsSubmittingReview(false);

    if (res.success) {
      setReviewSubmitStatus({ success: true, message: res.message });
      showToast("Thank you! Your verified review has been published.");
      setTimeout(() => {
        setIsWriteReviewOpen(false);
        setFormTitle("");
        setFormBody("");
        setFormMediaFiles([]);
        fetchReviews();
      }, 1200);
    } else {
      setReviewSubmitStatus({ success: false, message: res.message });
    }
  };

  // Open Edit Review Modal
  const handleOpenEditReview = (review: ProductReview) => {
    setReviewToEdit(review);
    setEditRating(review.rating);
    setEditTitle(review.title);
    setEditBody(review.body);
    setEditMediaFiles((review.media || []).map((m) => ({ url: m.url, type: m.type })));
    setIsEditReviewOpen(true);
  };

  // Submit Edit Review
  const handleSubmitEditReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewToEdit) return;

    setIsSubmittingEdit(true);
    const res = await updateCustomerReview({
      reviewId: reviewToEdit.id,
      rating: editRating,
      title: editTitle,
      body: editBody,
      mediaUrls: editMediaFiles.map((m) => m.url),
    });
    setIsSubmittingEdit(false);

    if (res.success) {
      showToast("Your review has been updated successfully.");
      setIsEditReviewOpen(false);
      fetchReviews();
    } else {
      showToast(res.message);
    }
  };

  // Confirm Delete Review
  const handleConfirmDelete = async () => {
    if (!reviewToDeleteId) return;
    const res = await deleteCustomerReview(reviewToDeleteId);
    if (res.success) {
      showToast("Your review has been removed.");
      setIsDeleteConfirmOpen(false);
      setReviewToDeleteId(null);
      fetchReviews();
    } else {
      showToast(res.message);
    }
  };

  // Helpful Voting
  const handleVoteReview = async (reviewId: string, type: "helpful" | "unhelpful") => {
    if (votedReviews[reviewId] === type) return;

    // Optimistic UI update
    setVotedReviews((prev) => ({ ...prev, [reviewId]: type }));
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            helpfulVotes: type === "helpful" ? r.helpfulVotes + 1 : r.helpfulVotes,
            unhelpfulVotes: type === "unhelpful" ? r.unhelpfulVotes + 1 : r.unhelpfulVotes,
          };
        }
        return r;
      })
    );

    await voteReviewHelpfulness(reviewId, type);
    showToast(`Feedback recorded as ${type}.`);
  };

  // Report Review
  const handleReportReviewSubmit = async () => {
    if (!reportModalReviewId) return;
    await reportInappropriateReview(reportModalReviewId, reportReason, reportDetails);
    showToast("Report submitted to Lennox Moderation Desk.");
    setReportModalReviewId(null);
    setReportDetails("");
  };

  // Ask Question
  const handleAskQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setIsSubmittingQuestion(true);
    const res = await askProductQuestion(productId, newQuestionText, newQuestionAuthor);
    setIsSubmittingQuestion(false);

    if (res.success) {
      setQuestionMsg({ success: true, message: res.message });
      showToast("Question posted! Factory support will respond shortly.");
      setTimeout(() => {
        setIsAskQuestionOpen(false);
        setNewQuestionText("");
        setNewQuestionAuthor("");
        setQuestionMsg(null);
        fetchQuestions();
      }, 1500);
    } else {
      setQuestionMsg({ success: false, message: res.message });
    }
  };

  // Vote Question
  const handleVoteQuestion = async (questionId: string) => {
    if (votedQuestions[questionId]) return;
    setVotedQuestions((prev) => ({ ...prev, [questionId]: true }));
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, helpfulVotes: q.helpfulVotes + 1 } : q))
    );
    await voteQuestionHelpfulness(questionId);
    showToast("Thank you for upvoting this question!");
  };

  // Report Question
  const handleReportQuestionSubmit = async () => {
    if (!reportQuestionModalId) return;
    await reportInappropriateQuestion(reportQuestionModalId, "Inappropriate Content");
    showToast("Question reported to Lennox Moderation Desk.");
    setReportQuestionModalId(null);
  };

  // Collect all customer media for the gallery preview strip
  const allReviewMedia = reviews.flatMap((r) =>
    (r.media || []).map((m) => ({ ...m, reviewId: r.id, reviewerName: r.userName }))
  );

  return (
    <div id="customer-reviews-section" className="space-y-8 font-montserrat">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00143D] text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Tab Navigation: Customer Reviews vs Product Q&A */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-4 sm:gap-8">
          <button
            onClick={() => setActiveMainTab("reviews")}
            className={cn(
              "pb-3 text-sm sm:text-base font-black flex items-center gap-2 transition-colors relative",
              activeMainTab === "reviews"
                ? "text-[#00143D]"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Verified Customer Reviews</span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {distribution.totalReviews}
            </span>
            {activeMainTab === "reviews" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF1028]" />
            )}
          </button>

          <button
            onClick={() => setActiveMainTab("qa")}
            className={cn(
              "pb-3 text-sm sm:text-base font-black flex items-center gap-2 transition-colors relative",
              activeMainTab === "qa"
                ? "text-[#00143D]"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <HelpCircle className="w-4 h-4 text-[#002366]" />
            <span>Questions & Answers (Q&A)</span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {questions.length}
            </span>
            {activeMainTab === "qa" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF1028]" />
            )}
          </button>
        </div>

        {activeMainTab === "reviews" ? (
          <button
            onClick={handleOpenWriteReview}
            className="bg-[#FF1028] hover:bg-[#D90017] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Write a Verified Review</span>
            <span className="sm:hidden">Write Review</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAskQuestionOpen(true)}
            className="bg-[#00143D] hover:bg-[#002366] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ask Factory Sourcing Desk</span>
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 1: CUSTOMER REVIEWS & RATINGS DISTRIBUTION
      ────────────────────────────────────────────────────────────────────────── */}
      {activeMainTab === "reviews" && (
        <div className="space-y-8">
          {/* Rating Summary Card & Distribution Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 bg-slate-50/80 rounded-3xl border border-slate-200">
            {/* Left: Overall Rating Score */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 lg:border-r border-slate-200">
              <div className="text-5xl sm:text-6xl font-black text-[#00143D] tracking-tight">
                {distribution.averageRating.toFixed(1)}
              </div>
              <div className="mt-2">
                <Rating rating={distribution.averageRating} size="lg" />
              </div>
              <p className="text-xs font-bold text-slate-500 mt-2">
                Based on <span className="text-slate-900">{distribution.totalReviews} verified reviews</span>
              </p>
              <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Direct Factory Verified Orders</span>
              </div>
            </div>

            {/* Middle: 5-Star Breakdown Progress Bars (Clickable to Filter) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-2.5 px-0 sm:px-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const item = distribution.breakdown[star as 1 | 2 | 3 | 4 | 5];
                const isSelected = ratingFilter === star;
                return (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(isSelected ? "all" : star)}
                    className={cn(
                      "flex items-center gap-3 w-full text-left group p-1.5 rounded-xl transition-all cursor-pointer",
                      isSelected ? "bg-amber-50 border border-amber-200" : "hover:bg-slate-100"
                    )}
                  >
                    <span className="w-12 text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0">
                      <span>{star}</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500 rounded-full",
                          isSelected ? "bg-amber-500" : "bg-[#00143D] group-hover:bg-[#FF1028]"
                        )}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-[11px] font-semibold text-slate-400 text-right shrink-0">
                      {item.count} ({item.percentage}%)
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Key Quality Badges */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-black text-[#00143D] uppercase tracking-wider">
                Lennox Verified Assurance
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Dual Video QC Benchmark Recorded</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Shenzhen Factory Direct Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Escrow-Protected USDT & Card Payment</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>With Photos/Videos</span>
                <span className="text-[#00143D]">{distribution.withMediaCount} reviews</span>
              </div>
            </div>
          </div>

          {/* Customer Photos & Videos Gallery Grid (if media exists) */}
          {allReviewMedia.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#00143D] uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-slate-600" />
                  <span>Customer Uploaded Media ({allReviewMedia.length})</span>
                </h4>
                <button
                  onClick={() => setMediaOnly(!mediaOnly)}
                  className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer",
                    mediaOnly
                      ? "bg-[#00143D] text-white border-[#00143D]"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  )}
                >
                  {mediaOnly ? "✓ Media Only Active" : "Filter by Media Only"}
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {allReviewMedia.slice(0, 8).map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMediaLightbox({ url: media.url, type: media.type })}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 hover:border-[#FF1028] transition-all cursor-pointer shadow-2xs"
                  >
                    {media.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                        <Play className="w-6 h-6 text-white fill-white group-hover:scale-110 transition-transform" />
                      </div>
                    ) : (
                      <Image
                        src={media.url}
                        alt="Customer review photo"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                    {media.type === "video" && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-[10px] text-white font-bold px-1.5 py-0.5 rounded">
                        Video
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Review Filter & Search Bar Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews by keyword, topic, or buyer..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00143D]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Star Rating Select */}
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value === "all" ? "all" : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">5 Stars only</option>
                <option value="4">4 Stars only</option>
                <option value="3">3 Stars only</option>
                <option value="2">2 Stars only</option>
                <option value="1">1 Star only</option>
              </select>

              {/* Variant Filter (if product has variants) */}
              {variants.length > 0 && (
                <select
                  value={variantFilter}
                  onChange={(e) => {
                    setVariantFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="">All Variants</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title || v.sku}
                    </option>
                  ))}
                </select>
              )}

              {/* Verified Filter Pill */}
              <button
                onClick={() => {
                  setVerifiedOnly(!verifiedOnly);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer",
                  verifiedOnly
                    ? "bg-emerald-50 text-[#10B981] border-emerald-300"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Buyer</span>
              </button>

              {/* Sorting Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="most_helpful">Sort: Most Helpful</option>
                <option value="newest">Sort: Most Recent</option>
                <option value="highest_rating">Sort: Highest Rating</option>
                <option value="lowest_rating">Sort: Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {isLoadingReviews ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-28 bg-slate-200 rounded" />
                      <div className="h-2.5 w-40 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                  <div className="h-12 w-full bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs border border-slate-200">
                <Star className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#00143D]">No matching reviews found</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Try clearing your active filters or be the first verified buyer to share feedback on this hardware item.
                </p>
              </div>
              <button
                onClick={handleOpenWriteReview}
                className="bg-[#00143D] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-xs hover:bg-[#002366] transition-colors"
              >
                Write First Verified Review
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={cn(
                    "p-6 rounded-3xl border transition-all space-y-4",
                    review.isFeatured
                      ? "bg-amber-50/30 border-amber-200/80 shadow-xs"
                      : "bg-white border-slate-200 shadow-2xs"
                  )}
                >
                  {/* Top Row: User Avatar, Name, Verified Badge, Rating, Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#00143D] text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase overflow-hidden">
                        {review.userAvatar ? (
                          <Image src={review.userAvatar} alt={review.userName} width={40} height={40} className="object-cover" />
                        ) : (
                          review.userName.slice(0, 2)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900">{review.userName}</span>
                          {review.isVerifiedPurchase && (
                            <span className="bg-emerald-50 text-[#10B981] text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified Purchase
                            </span>
                          )}
                          {review.isFeatured && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-600" /> Factory Spotlight
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          {review.userLocation || "Verified Customer"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <Rating rating={review.rating} size="sm" />
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Variant Tag (if present) */}
                  {review.variantName && (
                    <div className="inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Purchased: <span className="text-slate-800">{review.variantName}</span>
                    </div>
                  )}

                  {/* Review Content */}
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-[#00143D] leading-snug">{review.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{review.body}</p>
                  </div>

                  {/* Media Thumbnails */}
                  {review.media && review.media.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {review.media.map((item, mIdx) => (
                        <button
                          key={mIdx}
                          onClick={() => setActiveMediaLightbox({ url: item.url, type: item.type })}
                          className="group relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 hover:border-[#FF1028] transition-all cursor-pointer"
                        >
                          {item.type === "video" ? (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                              <Play className="w-5 h-5 fill-white" />
                            </div>
                          ) : (
                            <Image src={item.url} alt="Review media" fill className="object-cover group-hover:scale-105 transition-transform" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Official Seller / Admin Reply */}
                  {review.adminReply && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 ml-0 sm:ml-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#00143D]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>{review.adminRepliedByName || "Lennox Factory Sourcing Desk"}</span>
                          <span className="bg-[#00143D] text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide">
                            OFFICIAL
                          </span>
                        </div>
                        {review.adminReplyAt && (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {formatDate(review.adminReplyAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{review.adminReply}</p>
                    </div>
                  )}

                  {/* Bottom Actions: Helpful Voting, Edit/Delete (if author), Report */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-semibold">Was this helpful?</span>
                      <button
                        onClick={() => handleVoteReview(review.id, "helpful")}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                          votedReviews[review.id] === "helpful"
                            ? "bg-[#00143D] text-white border-[#00143D]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{review.helpfulVotes}</span>
                      </button>
                      <button
                        onClick={() => handleVoteReview(review.id, "unhelpful")}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                          votedReviews[review.id] === "unhelpful"
                            ? "bg-[#00143D] text-white border-[#00143D]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>{review.unhelpfulVotes}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {review.canEdit && (
                        <button
                          onClick={() => handleOpenEditReview(review)}
                          className="text-slate-500 hover:text-[#00143D] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                      {review.canDelete && (
                        <button
                          onClick={() => {
                            setReviewToDeleteId(review.id);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="text-slate-400 hover:text-[#FF1028] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                      <button
                        onClick={() => setReportModalReviewId(review.id)}
                        className="text-slate-400 hover:text-[#FF1028] font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    currentPage === page
                      ? "bg-[#00143D] text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          TAB 2: PRODUCT QUESTIONS & ANSWERS (Q&A)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeMainTab === "qa" && (
        <ProductQASection
          productId={productId}
          productTitle={productTitle}
          productImage={productImage}
          categoryName={categoryName}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: WRITE VERIFIED REVIEW
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        title="Write a Verified Product Review"
      >
        {isCheckingEligibility ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#00143D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Verifying purchase credentials with Supabase...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-5 font-montserrat">
            {/* Eligibility Banner */}
            {eligibility?.isVerifiedBuyer ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>
                  {eligibility.orderNumber
                    ? `Verified Order #${eligibility.orderNumber} confirmed. Your review will display the Verified Buyer badge.`
                    : "Verified customer detected. Thank you for your feedback!"}
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Sign in with the account used for purchase to earn Lennox Sourcing Rewards and the Verified Badge.
                </span>
              </div>
            )}

            {reviewSubmitStatus && (
              <div
                className={cn(
                  "p-3 rounded-xl text-xs font-bold flex items-center gap-2",
                  reviewSubmitStatus.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                )}
              >
                {reviewSubmitStatus.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{reviewSubmitStatus.message}</span>
              </div>
            )}

            {/* 1. Star Rating Selector */}
            <div className="space-y-1.5 text-center sm:text-left">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Your Overall Rating <span className="text-[#FF1028]">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFormRating(star)}
                    onMouseEnter={() => setFormHoverRating(star)}
                    onMouseLeave={() => setFormHoverRating(0)}
                    className="p-1 transition-transform hover:scale-115 focus:outline-hidden cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8 transition-colors",
                        (formHoverRating || formRating) >= star
                          ? "text-amber-500 fill-amber-500"
                          : "text-slate-300 fill-slate-100"
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-black text-slate-700">
                  {formRating === 5 ? "5.0 (Exceptional)" : `${formRating}.0`}
                </span>
              </div>
            </div>

            {/* 2. Variant Selector (if applicable) */}
            {variants.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800">Purchased Hardware Variant</label>
                <select
                  value={formVariantId}
                  onChange={(e) => setFormVariantId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#00143D]"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title || v.sku}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Review Headline */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Review Headline <span className="text-[#FF1028]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Incredible 4K Optical Clarity & High-Speed CNC build"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00143D]"
              />
            </div>

            {/* 4. Detailed Comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Detailed Feedback & Experience <span className="text-[#FF1028]">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Share your experience with build quality, flight time, factory QC video match, and logistics delivery speed..."
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#00143D]"
              />
            </div>

            {/* 5. Photos & Videos Upload */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Upload Photos / Unboxing Video (Optional)</span>
                <span className="text-[10px] text-slate-400 font-semibold">Max 100MB JPG/PNG, 100MB MP4</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm"
                onChange={(e) => handleFileUpload(e, false)}
                className="hidden"
              />

              <div className="flex flex-wrap gap-2">
                {formMediaFiles.map((m, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200"
                  >
                    {m.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Play className="w-4 h-4 fill-white" />
                      </div>
                    ) : (
                      <Image src={m.url} alt="Upload preview" fill className="object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setFormMediaFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-[#FF1028]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  disabled={isUploadingMedia}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#00143D] text-slate-500 hover:text-[#00143D] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploadingMedia ? (
                    <div className="w-4 h-4 border-2 border-[#00143D] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsWriteReviewOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview || isUploadingMedia}
                className="bg-[#FF1028] hover:bg-[#D90017] text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSubmittingReview && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Publish Verified Review</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: EDIT CUSTOMER REVIEW (30-day window)
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isEditReviewOpen}
        onClose={() => setIsEditReviewOpen(false)}
        title="Edit Your Review"
      >
        <form onSubmit={handleSubmitEditReview} className="space-y-4 font-montserrat">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-800">Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setEditRating(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={cn(
                      "w-7 h-7",
                      editRating >= star ? "text-amber-500 fill-amber-500" : "text-slate-300 fill-slate-100"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-800">Headline</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-800">Comments</label>
            <textarea
              required
              rows={4}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold"
            />
          </div>

          {/* Media attachments */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800">Attachments</label>
            <input
              ref={editFileInputRef}
              type="file"
              multiple
              accept="image/*,video/mp4"
              onChange={(e) => handleFileUpload(e, true)}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              {editMediaFiles.map((m, idx) => (
                <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border">
                  {m.type === "video" ? (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <Play className="w-4 h-4 fill-white" />
                    </div>
                  ) : (
                    <Image src={m.url} alt="Upload preview" fill className="object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setEditMediaFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => editFileInputRef.current?.click()}
                className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditReviewOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit}
              className="bg-[#00143D] text-white text-xs font-black px-5 py-2 rounded-xl hover:bg-[#002366] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: DELETE CONFIRMATION
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete Your Review?"
      >
        <div className="space-y-4 font-montserrat">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete your review? This action will remove your feedback and rating contribution from the product page.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
            >
              Keep Review
            </button>
            <button
              onClick={handleConfirmDelete}
              className="bg-[#FF1028] text-white text-xs font-black px-5 py-2 rounded-xl hover:bg-[#D90017]"
            >
              Yes, Delete Review
            </button>
          </div>
        </div>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: REPORT INAPPROPRIATE REVIEW
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(reportModalReviewId)}
        onClose={() => setReportModalReviewId(null)}
        title="Report Inappropriate Review"
      >
        <div className="space-y-4 font-montserrat">
          <p className="text-xs text-slate-600">
            Help us keep Lennox China Mall trustworthy. Why are you reporting this review?
          </p>

          <div className="space-y-2">
            {[
              "Spam or Advertising",
              "Offensive, Abusive or Hateful Content",
              "Fake Review or Competitor Attack",
              "Irrelevant to this Hardware Product",
              "Other Violation",
            ].map((reason) => (
              <label
                key={reason}
                onClick={() => setReportReason(reason)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                  reportReason === reason
                    ? "bg-slate-100 border-[#00143D] text-[#00143D]"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                <input
                  type="radio"
                  name="reportReason"
                  checked={reportReason === reason}
                  onChange={() => setReportReason(reason)}
                  className="accent-[#00143D]"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-800">Additional Details (Optional)</label>
            <textarea
              rows={2}
              placeholder="Provide any specific context..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setReportModalReviewId(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleReportReviewSubmit}
              className="bg-[#FF1028] text-white text-xs font-black px-5 py-2 rounded-xl hover:bg-[#D90017]"
            >
              Submit Report
            </button>
          </div>
        </div>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: ASK PRODUCT QUESTION
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAskQuestionOpen}
        onClose={() => setIsAskQuestionOpen(false)}
        title="Ask Factory Sourcing Desk"
      >
        <form onSubmit={handleAskQuestionSubmit} className="space-y-4 font-montserrat">
          <p className="text-xs text-slate-600 leading-relaxed">
            Have a question about specifications, voltage compatibility, or YunExpress airfreight? Our Shenzhen team answers questions directly.
          </p>

          {questionMsg && (
            <div
              className={cn(
                "p-3 rounded-xl text-xs font-bold flex items-center gap-2",
                questionMsg.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}
            >
              {questionMsg.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{questionMsg.message}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-800">Your Name (or Display Name)</label>
            <input
              type="text"
              placeholder={displayName || "Verified Customer"}
              value={newQuestionAuthor}
              onChange={(e) => setNewQuestionAuthor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-800">
              Your Question <span className="text-[#FF1028]">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Does the 3D printer include EU 220V power adapter and replacement nozzle kit?"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-semibold"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAskQuestionOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingQuestion}
              className="bg-[#00143D] text-white text-xs font-black px-6 py-2 rounded-xl hover:bg-[#002366] transition-colors"
            >
              Submit Question
            </button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: MEDIA LIGHTBOX (PHOTO ZOOM & VIDEO PLAYBACK)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeMediaLightbox && (
        <div
          onClick={() => setActiveMediaLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <button
            onClick={() => setActiveMediaLightbox(null)}
            className="absolute top-6 right-6 text-white hover:text-slate-300 p-2 rounded-full bg-black/50"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full rounded-2xl overflow-hidden flex items-center justify-center"
          >
            {activeMediaLightbox.type === "video" ? (
              <video
                src={activeMediaLightbox.url}
                controls
                autoPlay
                className="max-h-[80vh] w-auto rounded-2xl"
              />
            ) : (
              <div className="relative w-full h-[75vh]">
                <Image
                  src={activeMediaLightbox.url}
                  alt="Full size review photo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
