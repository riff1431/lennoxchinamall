import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/utils/helpers";

interface RatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  showScore?: boolean;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({
  rating,
  maxStars = 5,
  showScore = true,
  reviewCount,
  size = "sm",
  className,
}: RatingProps) {
  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4 && rating % 1 <= 0.8;

  for (let i = 1; i <= maxStars; i++) {
    if (i <= fullStars) {
      stars.push(
        <Star
          key={i}
          className={cn(starSizes[size], "fill-amber-400 text-amber-400")}
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <StarHalf
          key={i}
          className={cn(starSizes[size], "fill-amber-400 text-amber-400")}
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          className={cn(starSizes[size], "text-slate-200 fill-slate-100")}
        />
      );
    }
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showScore && (
        <span className={cn("font-bold text-slate-700", textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={cn("text-slate-400 font-normal", textSizes[size])}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
