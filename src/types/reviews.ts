export type ReviewStatus = "approved" | "pending" | "rejected" | "hidden";

export interface ReviewMediaItem {
  id?: string;
  url: string;
  type: "image" | "video";
}

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  userLocation?: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
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
  rejectionReason?: string;
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
}

export interface ProductQuestion {
  id: string;
  productId: string;
  userId?: string;
  authorName: string;
  question: string;
  status: "approved" | "pending" | "hidden" | "rejected";
  helpfulVotes: number;
  answers: ProductAnswer[];
  createdAt: string;
}
