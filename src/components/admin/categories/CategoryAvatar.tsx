"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { cn } from "@/utils/helpers";

interface CategoryAvatarProps {
  name: string;
  thumbnailUrl?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  iconName?: string | null;
  bgColor?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  imageClassName?: string;
}

export function CategoryAvatar({
  name,
  thumbnailUrl,
  imageUrl,
  icon,
  iconName,
  bgColor = "#EBF4FB",
  size = "md",
  className,
  imageClassName,
}: CategoryAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const targetUrl = thumbnailUrl || imageUrl;

  // Reset error state if URL changes
  useEffect(() => {
    setHasError(false);
  }, [targetUrl]);

  // Check if URL is invalid blob
  const isBlob = targetUrl?.startsWith("blob:");

  const sizeClasses = {
    sm: "w-8 h-8 rounded-xl p-1",
    md: "w-11 h-11 rounded-2xl p-1.5",
    lg: "w-14 h-14 rounded-2xl p-2",
    xl: "w-20 h-20 rounded-full p-2.5",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const showImage = Boolean(targetUrl && !hasError);

  return (
    <div
      style={{ backgroundColor: bgColor || "#EBF4FB" }}
      className={cn(
        "border border-black/5 flex items-center justify-center shrink-0 relative overflow-hidden shadow-2xs transition-transform",
        sizeClasses[size],
        className
      )}
    >
      {showImage && targetUrl ? (
        <div className="relative w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={targetUrl}
            alt={name}
            onError={() => setHasError(true)}
            className={cn("w-full h-full object-contain", imageClassName)}
            loading="lazy"
          />
        </div>
      ) : (
        <CategoryIcon
          icon={icon || iconName || "FolderTree"}
          name={name}
          className={cn(iconSizes[size], "text-[#FF1028]")}
        />
      )}
    </div>
  );
}
