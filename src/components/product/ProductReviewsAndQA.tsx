"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
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
} from "lucide-react";
import {
  ProductReview,
  ReviewRatingDistribution,
  ProductQuestion,
} from "@/types/reviews";
import {
  getProductReviews,
  submitProductReview,
  voteReviewHelpfulness,
  reportInappropriateReview,
} from "@/app/actions/product-reviews";
import {
  getProductQuestions,
  askProductQuestion,
  voteQuestionHelpfulness,
} from "@/app/actions/product-qa";
import { Modal } from "@/components/ui/Modal";

interface ProductReviewsAndQAProps {
  productId: string;
  productTitle: string;
  productImage?: string;
  variants?: Array<{ id: string; title: string; sku: string }>;
}

export function ProductReviewsAndQA({
  productId,
  productTitle,
  productImage,
  variants = [],
}: ProductReviewsAndQAProps) {
  const [activeMainTab, setActiveMainTab] = useState<"reviews" | "qa">("reviews");

  // Reviews Filter States
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mediaOnly, setMediaOnly] = useState(false);
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
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);
  const [reportModalReviewId, setReportModalReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("Spam or Advertising");

  // New Review Form
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formVariantId, setFormVariantId] = useState(variants[0]?.id || "");
  const [formMediaUrls, setFormMediaUrls] = useState<string[]>([]);
  const [newMediaInput, setNewMediaInput] = useState("");
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // New Question Form
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionAuthor, setNewQuestionAuthor] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionMsg, setQuestionMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch Reviews
  const fetchReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    const res = await getProductReviews({
      productId,
      search: searchQuery,
      rating: ratingFilter,
      verifiedOnly,
      mediaOnly,
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
  }, [productId, searchQuery, ratingFilter, verifiedOnly, mediaOnly, sortBy, currentPage]);

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

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewSubmitStatus(null);

    const selectedVar = variants.find((v) => v.id === formVariantId);

    const res = await submitProductReview({
      productId,
      rating: formRating,
      title: formTitle,
      body: formBody,
      variantId: formVariantId,
      variantName: selectedVar?.title || "Standard Model",
      mediaUrls: formMediaUrls,
    });

    setIsSubmittingReview(false);
    setReviewSubmitStatus({ success: res.success, message: res.message });

    if (res.success) {
      setTimeout(() => {
        setIsWriteReviewOpen(false);
        setFormTitle("");
        setFormBody("");
        setFormMediaUrls([]);
        setReviewSubmitStatus(null);
        fetchReviews();
      }, 1500);
    }
  };

  // Submit Question Handler
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setIsSubmittingQuestion(true);
    const res = await askProductQuestion(productId, newQuestionText, newQuestionAuthor);
    setIsSubmittingQuestion(false);
    setQuestionMsg({ success: res.success, message: res.message });

    if (res.success) {
      setTimeout(() => {
        setIsAskQuestionOpen(false);
        setNewQuestionText("");
        setNewQuestionAuthor("");
        setQuestionMsg(null);
        fetchQuestions();
      }, 1500);
    }
  };

  // Vote Review Helpfulness
  const handleVoteReview = async (reviewId: string, type: "helpful" | "unhelpful") => {
    await voteReviewHelpfulness(reviewId, type);
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              helpfulVotes: type === "helpful" ? r.helpfulVotes + 1 : r.helpfulVotes,
            }
          : r
      )
    );
  };

  // Report Review
  const handleReportReview = async () => {
    if (!reportModalReviewId) return;
    await reportInappropriateReview(reportModalReviewId, reportReason);
    setReportModalReviewId(null);
  };

  // Add Photo URL to Form
  const handleAddMedia = () => {
    if (newMediaInput.trim() && formMediaUrls.length < 4) {
      setFormMediaUrls((prev) => [...prev, newMediaInput.trim()]);
      setNewMediaInput("");
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-900">
      {/* ── Sub-Navigation Tabs: Reviews vs. Q&A ── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveMainTab("reviews")}
            className={`text-sm sm:text-base font-black font-heading transition-colors cursor-pointer flex items-center gap-2 ${
              activeMainTab === "reviews"
                ? "text-[#FF1028] border-b-2 border-[#FF1028] pb-1"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Customer Reviews ({distribution.totalReviews})</span>
          </button>

          <button
            onClick={() => setActiveMainTab("qa")}
            className={`text-sm sm:text-base font-black font-heading transition-colors cursor-pointer flex items-center gap-2 ${
              activeMainTab === "qa"
                ? "text-[#FF1028] border-b-2 border-[#FF1028] pb-1"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Questions &amp; Answers ({questions.length})</span>
          </button>
        </div>

        {activeMainTab === "reviews" ? (
          <button
            onClick={() => setIsWriteReviewOpen(true)}
            className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2 rounded-xl text-xs font-black font-heading transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAskQuestionOpen(true)}
            className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2 rounded-xl text-xs font-black font-heading transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask a Question</span>
          </button>
        )}
      </div>

      {/* ── TAB 1: REVIEWS & RATINGS ── */}
      {activeMainTab === "reviews" && (
        <div className="space-y-8">
          {/* 1. Rating Distribution Summary Header */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-2xs">
            {/* Score & Star Metric (4 Cols) */}
            <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-slate-200/80 pb-6 md:pb-0 md:pr-6">
              <span className="text-4xl sm:text-5xl font-black text-[#00143D] font-mono leading-none">
                {distribution.averageRating.toFixed(1)}
              </span>
              <div className="flex items-center justify-center md:justify-start text-amber-400 gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(distribution.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Based on {distribution.totalReviews} verified customer reviews
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" /> 100% Verified Purchases
                </span>
              </div>
            </div>

            {/* Rating Breakdown Bars (8 Cols) */}
            <div className="md:col-span-8 space-y-2 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const item = distribution.breakdown[stars as 1 | 2 | 3 | 4 | 5];
                return (
                  <button
                    key={stars}
                    onClick={() => {
                      setRatingFilter(ratingFilter === stars ? "all" : stars);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-colors cursor-pointer group ${
                      ratingFilter === stars ? "bg-amber-50/80" : "hover:bg-slate-100"
                    }`}
                  >
                    <span className="w-12 font-bold text-slate-700 text-right font-mono shrink-0">
                      {stars} Stars
                    </span>
                    <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item?.percentage || 0}%` }}
                      />
                    </div>
                    <span className="w-14 text-slate-500 text-right font-mono text-[11px] shrink-0">
                      {item?.count || 0} ({item?.percentage || 0}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Review Filter & Sort Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Star Rating Pills */}
              {["all", 5, 4, 3, 2, 1].map((r) => (
                <button
                  key={String(r)}
                  onClick={() => {
                    setRatingFilter(r as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ratingFilter === r
                      ? "bg-[#00143D] text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {r === "all" ? "All Reviews" : `${r}★`}
                </button>
              ))}

              {/* Photos & Videos Filter */}
              <button
                onClick={() => {
                  setMediaOnly(!mediaOnly);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mediaOnly
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>With Photos ({distribution.withMediaCount})</span>
              </button>

              {/* Verified Only */}
              <button
                onClick={() => {
                  setVerifiedOnly(!verifiedOnly);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  verifiedOnly
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Purchases</span>
              </button>
            </div>

            {/* Sort & Search Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="relative flex-1 md:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#FF1028]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="most_helpful">Most Helpful</option>
                <option value="newest">Newest First</option>
                <option value="highest_rating">Highest Rated</option>
                <option value="lowest_rating">Lowest Rated</option>
              </select>
            </div>
          </div>

          {/* 3. Review Cards List */}
          {isLoadingReviews ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                  <div className="h-12 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-black font-heading text-[#00143D]">
                No Reviews Found Matching Your Criteria
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first to share your experience with this factory hardware batch!
              </p>
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="bg-[#00143D] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Write First Review
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 space-y-4 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  {/* Customer Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold font-heading text-sm border border-slate-200">
                        {rev.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {rev.userName}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 font-mono">
                              <Check className="w-3 h-3" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {rev.userLocation || "Global Sourcing Hub"}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Rating Stars & Variant Tag */}
                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    {rev.variantName && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        Model: {rev.variantName}
                      </span>
                    )}
                  </div>

                  {/* Title & Body */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-slate-900 text-sm">{rev.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.body}</p>
                  </div>

                  {/* Photo & Video Gallery Thumbnails */}
                  {rev.media && rev.media.length > 0 && (
                    <div className="flex gap-2.5 pt-1 overflow-x-auto pb-1">
                      {rev.media.map((m, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedPhotoModal(m.url)}
                          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                        >
                          <Image src={m.url} alt="Review Media" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Official Staff Response Badge */}
                  {rev.adminReply && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#00143D] font-heading">
                        <Award className="w-3.5 h-3.5 text-[#FF1028]" />
                        <span>Lennox Factory Support Response</span>
                        {rev.adminReplyAt && (
                          <span className="text-[10px] font-normal text-slate-400 font-mono ml-auto">
                            {new Date(rev.adminReplyAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.adminReply}</p>
                    </div>
                  )}

                  {/* Helpful Voting & Report Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Was this review helpful?</span>
                      <button
                        onClick={() => handleVoteReview(rev.id, "helpful")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3 text-emerald-600" />
                        <span>Helpful ({rev.helpfulVotes})</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setReportModalReviewId(rev.id)}
                      className="text-[11px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. Pagination */}
          {totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <span className="text-xs text-slate-500 font-mono">
                Page {currentPage} of {totalPages} ({totalCount} Reviews)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: QUESTIONS & ANSWERS (Q&A) ── */}
      {activeMainTab === "qa" && (
        <div className="space-y-6">
          {/* Q&A Search & Action */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search answered questions..."
                value={qaSearch}
                onChange={(e) => setQaSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#FF1028]"
              />
            </div>

            <button
              onClick={() => setIsAskQuestionOpen(true)}
              className="w-full sm:w-auto bg-[#00143D] hover:bg-[#FF1028] text-white px-5 py-2.5 rounded-xl text-xs font-black font-heading transition-colors cursor-pointer shrink-0"
            >
              Ask a Factory Technician
            </button>
          </div>

          {/* Questions List */}
          {isLoadingQa ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-2 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-8 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-black font-heading text-[#00143D]">
                No Questions Yet for This Product
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Have questions about technical specs, air cargo delivery, or export compatibility?
              </p>
              <button
                onClick={() => setIsAskQuestionOpen(true)}
                className="bg-[#00143D] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Ask the First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 space-y-4 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#00143D] text-white flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5">
                        Q
                      </span>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm leading-snug">{q.question}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Asked by {q.authorName} • {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => voteQuestionHelpfulness(q.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[11px] shrink-0"
                    >
                      <ThumbsUp className="w-3 h-3 text-blue-600" />
                      <span>{q.helpfulVotes}</span>
                    </button>
                  </div>

                  {/* Answers */}
                  <div className="space-y-2.5 pl-8 border-l-2 border-slate-100 ml-3">
                    {q.answers.length > 0 ? (
                      q.answers.map((a) => (
                        <div key={a.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 font-heading">
                              {a.responderName}
                            </span>
                            {a.isOfficialStaff && (
                              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 uppercase font-mono">
                                Official Staff
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{a.answer}</p>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Pending official factory response...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 4. WRITE REVIEW MODAL ── */}
      <Modal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        title="Write a Customer Review"
        size="lg"
      >
        <form onSubmit={handleSubmitReview} className="space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 font-mono">
              DIRECT FACTORY SOURCING FEEDBACK
            </span>
            <h4 className="text-sm font-black font-heading text-slate-900">{productTitle}</h4>
          </div>

          {/* Star Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Your Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormRating(star)}
                  className="p-1 cursor-pointer hover:scale-115 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= formRating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-800 ml-2 font-mono">
                {formRating === 5 ? "5.0 (Excellent)" : `${formRating}.0 Stars`}
              </span>
            </div>
          </div>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Purchased Model / Variant
              </label>
              <select
                value={formVariantId}
                onChange={(e) => setFormVariantId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#FF1028]"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title || v.sku}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Review Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Exceptional 4K video stability and fast airfreight!"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#FF1028]"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Detailed Experience &amp; Comments *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Share details about performance, build quality, air cargo delivery, and Binance Pay checkout experience..."
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#FF1028]"
            />
          </div>

          {/* Photo URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Add Photo / Video Link (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newMediaInput}
                onChange={(e) => setNewMediaInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <button
                type="button"
                onClick={handleAddMedia}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Add Image
              </button>
            </div>

            {formMediaUrls.length > 0 && (
              <div className="flex gap-2 pt-1">
                {formMediaUrls.map((url, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border">
                    <Image src={url} alt="Uploaded" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormMediaUrls(formMediaUrls.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {reviewSubmitStatus && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                reviewSubmitStatus.success
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {reviewSubmitStatus.message}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWriteReviewOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-6 py-2.5 rounded-xl bg-[#00143D] hover:bg-[#FF1028] text-white font-black font-heading text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50"
            >
              {isSubmittingReview ? "Submitting..." : "Publish Review"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. ASK QUESTION MODAL ── */}
      <Modal
        isOpen={isAskQuestionOpen}
        onClose={() => setIsAskQuestionOpen(false)}
        title="Ask a Product Question"
        size="md"
      >
        <form onSubmit={handleSubmitQuestion} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex H."
              value={newQuestionAuthor}
              onChange={(e) => setNewQuestionAuthor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#FF1028]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Your Question *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ask about voltage compatibility, firmware support, air cargo tracking..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#FF1028]"
            />
          </div>

          {questionMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                questionMsg.success
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {questionMsg.message}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAskQuestionOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingQuestion}
              className="px-5 py-2 rounded-xl bg-[#00143D] hover:bg-[#FF1028] text-white font-black font-heading text-xs uppercase transition-colors"
            >
              {isSubmittingQuestion ? "Sending..." : "Submit Question"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 6. PHOTO LIGHTBOX MODAL ── */}
      {selectedPhotoModal && (
        <div
          onClick={() => setSelectedPhotoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs"
        >
          <div className="relative aspect-square max-w-xl w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
            <Image src={selectedPhotoModal} alt="Review Media Fullscreen" fill className="object-contain" />
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── 7. REPORT REVIEW MODAL ── */}
      {reportModalReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h4 className="font-heading font-black text-base text-[#00143D]">
              Report Inappropriate Review
            </h4>
            <p className="text-xs text-slate-500">
              Help us keep the Lennox verified sourcing platform authentic and secure.
            </p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            >
              <option value="Spam or Advertising">Spam or Advertising</option>
              <option value="Inappropriate Language">Inappropriate Language</option>
              <option value="Fake Review / Competitor">Fake Review / Competitor</option>
              <option value="Wrong Product">Wrong Product</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setReportModalReviewId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReportReview}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-black text-xs font-heading"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
