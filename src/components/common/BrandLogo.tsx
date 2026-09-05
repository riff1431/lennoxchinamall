"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSettingsStore } from "@/store/useSettingsStore";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-constants";
import { cn } from "@/utils/helpers";

export interface BrandLogoProps {
  variant?: "primary" | "dark" | "icon";
  className?: string;
  imageClassName?: string;
  alt?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  customUrl?: string;
  sizes?: string;
}

export function BrandLogo({
  variant = "primary",
  className = "",
  imageClassName = "object-contain",
  alt,
  priority = false,
  fill = true,
  width,
  height,
  customUrl,
  sizes = "(max-width: 640px) 145px, (max-width: 1024px) 240px, 280px",
}: BrandLogoProps) {
  const storePrimary = useSettingsStore((s) => s.settings.branding?.primary_logo_url);
  const storeDark = useSettingsStore((s) => s.settings.branding?.dark_logo_url);
  const storeName = useSettingsStore((s) => s.settings.store_info?.store_name) || "Lennox ChinaMall";

  const [hasError, setHasError] = useState(false);

  const resolvedUrl =
    customUrl ||
    (variant === "dark" ? storeDark || storePrimary : storePrimary) ||
    DEFAULT_STORE_SETTINGS.branding.primary_logo_url;

  // Reset error state if the URL changes
  React.useEffect(() => {
    setHasError(false);
  }, [resolvedUrl]);

  const logoAlt = alt || `${storeName} Logo`;

  // Fallback if the URL failed to load
  const activeSrc = hasError ? DEFAULT_STORE_SETTINGS.branding.primary_logo_url : resolvedUrl;

  const isDataOrBlob =
    activeSrc.startsWith("data:") ||
    activeSrc.startsWith("blob:") ||
    activeSrc.endsWith(".svg");

  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      {fill ? (
        <Image
          src={activeSrc}
          alt={logoAlt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={isDataOrBlob}
          onError={() => setHasError(true)}
          className={imageClassName}
        />
      ) : (
        <Image
          src={activeSrc}
          alt={logoAlt}
          width={width || 240}
          height={height || 60}
          priority={priority}
          unoptimized={isDataOrBlob}
          onError={() => setHasError(true)}
          className={imageClassName}
        />
      )}
    </div>
  );
}
