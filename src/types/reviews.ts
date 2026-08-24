export type ReviewStatus = "approved" | "pending" | "rejected" | "hidden";

export interface ReviewMediaItem {
  id?: string;
  url: string;
  type: "image" | "video";
  thumbnailUrl?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productTitle?: string;
  productSlug?: string;
  productImage?: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  userLocation?: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  orderId?: string;
  variantId?: string;
  variantName?: string;
  media?: ReviewMediaItem[];
  status: ReviewStatus;
  helpfulVotes: number;
  unhelpfulVotes: number;
  reportCount?: number;
  isFeatured?: boolean;
  adminReply?: string;
  adminReplyAt?: string;
  adminRepliedBy?: string;
  adminRepliedByName?: string;
  rejectionReason?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewRatingDistribution {
  averageRating: number;
  totalReviews: number;
  breakdown: {
    5: { count: number; percentage: number };
    4: { count: number; percentage: number };
    3: { count: number; percentage: number };
    2: { count: number; percentage: number };
    1: { count: number; percentage: number };
  };
  verifiedPurchasesCount: number;
  withMediaCount: number;
}

export interface ReviewFilterParams {
  productId: string;
  search?: string;
  rating?: number | "all";
  verifiedOnly?: boolean;
  mediaOnly?: boolean;
  variantId?: string;
  sortBy?: "most_helpful" | "newest" | "highest_rating" | "lowest_rating";
  page?: number;
  pageSize?: number;
}

export interface ProductAnswer {
  id: string;
  questionId: string;
  userId?: string;
  responderName: string;
  isOfficialStaff: boolean;
  answer: string;
  status: "approved" | "pending" | "hidden";
  createdAt: string;
  updatedAt?: string;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  productTitle?: string;
  productSlug?: string;
  userId?: string;
  authorName: string;
  question: string;
  status: "approved" | "pending" | "hidden" | "rejected";
  helpfulVotes: number;
  answers: ProductAnswer[];
  createdAt: string;
  updatedAt?: string;
}

export interface VerifiedPurchaseCheckResult {
  isEligible: boolean;
  isVerifiedBuyer: boolean;
  hasAlreadyReviewed: boolean;
  existingReviewId?: string;
  purchasedVariantId?: string;
  purchasedVariantName?: string;
  orderId?: string;
  orderNumber?: string;
  message?: string;
}

export interface CustomerUnreviewedItem {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productImage: string;
  variantId?: string;
  variantTitle?: string;
  price: number;
}

export interface ReviewModerationLog {
  id: string;
  reviewId?: string;
  questionId?: string;
  adminId?: string;
  adminName?: string;
  action: "approved" | "rejected" | "hidden" | "edited" | "deleted" | "replied" | "featured_toggled";
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  notes?: string;
  createdAt: string;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  userId?: string;
  reason: string;
  details?: string;
  status: "pending" | "reviewed" | "dismissed" | "actioned";
  createdAt: string;
}

export interface QuestionReport {
  id: string;
  questionId: string;
  userId?: string;
  reason: string;
  details?: string;
  status: "pending" | "reviewed" | "dismissed" | "actioned";
  createdAt: string;
}

export interface AdminReviewStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  featured: number;
  reported: number;
  avgRating: string;
}

