"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ShieldCheck,
  MessageSquare,
  Plus,
  Check,
  Edit2,
  Trash2,
  Clock,
  AlertTriangle,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  X,
} from "lucide-react";
import { Rating } from "@/components/ui/Rating";
import { Modal } from "@/components/ui/Modal";
import {
  getCustomerReviews,
  getCustomerUnreviewedProducts,
  updateCustomerReview,
  deleteCustomerReview,
  submitProductReview,
} from "@/app/actions/product-reviews";
import { ProductReview, CustomerUnreviewedItem } from "@/types/reviews";
import { formatDate, formatCurrency, cn } from "@/utils/helpers";

export default function AccountReviewsPage() {
  const [activeTab, setActiveTab] = useState<"submitted" | "unreviewed">("submitted");
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [unreviewedItems, setUnreviewedItems] = useState<CustomerUnreviewedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Review Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<ProductReview | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Write Review Modal State (from Unreviewed tab)
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [itemToWriteReview, setItemToWriteReview] = useState<CustomerUnreviewedItem | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Delete Confirm Dialog State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [revRes, unrevRes] = await Promise.all([
      getCustomerReviews(),
      getCustomerUnreviewedProducts(),
    ]);

    if (revRes.success) {
      setReviews(revRes.reviews);
    }
    if (unrevRes.success) {
      setUnreviewedItems(unrevRes.unreviewedItems);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Edit Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewToEdit) return;

    setIsSubmittingEdit(true);
    const res = await updateCustomerReview({
      reviewId: reviewToEdit.id,
      rating: editRating,
      title: editTitle,
      body: editBody,
    });
    setIsSubmittingEdit(false);

    if (res.success) {
      showToast("Your review has been updated successfully.");
      setIsEditModalOpen(false);
      loadData();
    } else {
      showToast(res.message);
    }
  };

  // Handle Write Submission for Unreviewed item
  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToWriteReview || !newTitle.trim() || !newBody.trim()) return;

    setIsSubmittingNew(true);
    const res = await submitProductReview({
      productId: itemToWriteReview.productId,
      rating: newRating,
      title: newTitle,
      body: newBody,
      orderId: itemToWriteReview.orderId,
      variantId: itemToWriteReview.variantId,
      variantName: itemToWriteReview.variantTitle,
    });
    setIsSubmittingNew(false);

    if (res.success) {
      showToast("Thank you! Your verified review has been published.");
      setIsWriteModalOpen(false);
      setItemToWriteReview(null);
      setNewTitle("");
      setNewBody("");
      setActiveTab("submitted");
      loadData();
    } else {
      showToast(res.message);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!reviewToDeleteId) return;
    const res = await deleteCustomerReview(reviewToDeleteId);
    if (res.success) {
      showToast("Review deleted successfully.");
      setIsDeleteModalOpen(false);
      setReviewToDeleteId(null);
      loadData();
    } else {
      showToast(res.message);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 font-montserrat">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00143D] text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D] flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>My Verified Hardware Reviews</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Share feedback on your factory purchases and earn Lennox Sourcing Reward Points.
          </p>
        </div>
      </div>

      {/* Tabs: Submitted Reviews vs Pending / Unreviewed Purchases */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveTab("submitted")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "submitted"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <span>Published Reviews</span>
          <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {reviews.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("unreviewed")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === "unreviewed"
              ? "bg-[#00143D] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <span>Unreviewed Purchases</span>
          {unreviewedItems.length > 0 && (
            <span className="bg-[#FF1028] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {unreviewedItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-200 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-slate-200 rounded" />
                  <div className="h-3 w-1/4 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-10 w-full bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : activeTab === "submitted" ? (
        /* Tab 1: Submitted Reviews */
        reviews.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs border border-slate-200">
              <Star className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-sm font-black text-[#00143D]">No reviews submitted yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t reviewed any purchased products yet. Review your orders to earn reward points.
            </p>
            {unreviewedItems.length > 0 && (
              <button
                onClick={() => setActiveTab("unreviewed")}
                className="bg-[#00143D] text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs hover:bg-[#002366]"
              >
                View ({unreviewedItems.length}) Unreviewed Purchases
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 hover:border-slate-300 transition-all"
              >
                {/* Top Row: Product Details & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                      <Image
                        src={
                          rev.productImage ||
                          "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80"
                        }
                        alt={rev.productTitle || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/products/${rev.productSlug}`}
                        className="text-xs font-bold text-slate-900 hover:text-[#FF1028] transition-colors line-clamp-1 flex items-center gap-1"
                      >
                        <span>{rev.productTitle}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Rating rating={rev.rating} size="sm" />
                        {rev.isVerifiedPurchase && (
                          <span className="bg-emerald-50 text-[#10B981] text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified Purchase
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded border",
                            rev.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : rev.status === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {rev.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-semibold shrink-0">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>

                {/* Review Body */}
                <div className="space-y-1 text-xs pt-1">
                  <h4 className="font-bold text-slate-900">{rev.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{rev.body}</p>
                </div>

                {/* Official Response if present */}
                {rev.adminReply && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#00143D]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{rev.adminRepliedByName || "Lennox Official Staff Reply"}</span>
                    </div>
                    <p className="text-slate-600">{rev.adminReply}</p>
                  </div>
                )}

                {/* Rejection Note if rejected */}
                {rev.status === "rejected" && rev.rejectionReason && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Rejection Reason: {rev.rejectionReason}</span>
                  </div>
                )}

                {/* Customer Edit & Delete Actions (30-day window) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <div className="text-[11px] text-slate-400 font-semibold">
                    {rev.helpfulVotes} customer(s) found this helpful
                  </div>

                  <div className="flex items-center gap-3">
                    {rev.canEdit && (
                      <button
                        onClick={() => {
                          setReviewToEdit(rev);
                          setEditRating(rev.rating);
                          setEditTitle(rev.title);
                          setEditBody(rev.body);
                          setIsEditModalOpen(true);
                        }}
                        className="text-slate-600 hover:text-[#00143D] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Review</span>
                      </button>
                    )}
                    {rev.canDelete && (
                      <button
                        onClick={() => {
                          setReviewToDeleteId(rev.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-[#FF1028] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Tab 2: Unreviewed Completed Purchases */
        unreviewedItems.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs border border-slate-200">
              <ShoppingBag className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-sm font-black text-[#00143D]">All purchased products reviewed!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You have shared feedback for all your delivered orders. Thank you for empowering our factory direct marketplace.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {unreviewedItems.map((item) => (
              <div
                key={item.productId}
                className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                    <Image src={item.productImage} alt={item.productTitle} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.productTitle}</h4>
                    {item.variantTitle && (
                      <div className="text-[11px] text-slate-500">Variant: {item.variantTitle}</div>
                    )}
                    <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      Order #{item.orderNumber} • {formatDate(item.orderDate)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setItemToWriteReview(item);
                    setNewRating(5);
                    setNewTitle("");
                    setNewBody("");
                    setIsWriteModalOpen(true);
                  }}
                  className="bg-[#FF1028] hover:bg-[#D90017] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Write Verified Review</span>
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: EDIT SUBMITTED REVIEW
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Your Verified Review"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 font-montserrat">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-800">Star Rating</label>
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

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
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
          MODAL: WRITE REVIEW (FOR UNREVIEWED ORDER ITEM)
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        title="Write a Verified Product Review"
      >
        {itemToWriteReview && (
          <form onSubmit={handleWriteSubmit} className="space-y-4 font-montserrat">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                <Image src={itemToWriteReview.productImage} alt="Product" fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{itemToWriteReview.productTitle}</div>
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Order #{itemToWriteReview.orderNumber}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-800">Your Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8",
                        newRating >= star ? "text-amber-500 fill-amber-500" : "text-slate-300 fill-slate-100"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-800">Review Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Excellent build quality, matched QC video"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-800">Comments & Details</label>
              <textarea
                required
                rows={4}
                placeholder="Share what you liked, performance benchmarks, and packaging condition..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingNew}
                className="bg-[#FF1028] text-white text-xs font-black px-6 py-2 rounded-xl hover:bg-[#D90017] transition-colors"
              >
                Publish Review
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────
          MODAL: DELETE CONFIRMATION
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Your Review?"
      >
        <div className="space-y-4 font-montserrat">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete this review? Your feedback and rating score will be permanently removed.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
            >
              Keep
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="bg-[#FF1028] text-white text-xs font-black px-5 py-2 rounded-xl hover:bg-[#D90017]"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
