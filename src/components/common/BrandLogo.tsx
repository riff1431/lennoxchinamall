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

  const defaultWhiteLogo = "/logo-lennoxchinamall-white.png";
  const defaultPrimaryLogo = DEFAULT_STORE_SETTINGS.branding.primary_logo_url;

  const [hasError, setHasError] = useState(false);
  const [hasSecondaryError, setHasSecondaryError] = useState(false);

  const resolvedUrl =
    customUrl ||
    (variant === "dark"
      ? (storeDark && storeDark.trim() ? storeDark : null) || defaultWhiteLogo
      : storePrimary || defaultPrimaryLogo);

  // Reset error states if the URL changes
  React.useEffect(() => {
    setHasError(false);
    setHasSecondaryError(false);
  }, [resolvedUrl]);

  const logoAlt = alt || `${storeName} Logo`;

  // Fallback if the URL failed to load
  const fallbackSrc = variant === "dark" ? defaultWhiteLogo : defaultPrimaryLogo;
  const activeSrc = hasError ? fallbackSrc : resolvedUrl;

  const isDirectUrl =
    activeSrc.startsWith("data:") ||
    activeSrc.startsWith("blob:") ||
    activeSrc.startsWith("http") ||
    activeSrc.endsWith(".svg");

  // If even the fallback image fails to load, gracefully display the brand name
  if (hasSecondaryError) {
    return (
      <div className={cn("relative flex items-center justify-start select-none", fill ? "w-full h-full" : "", className)}>
        <span
          className={cn(
            "font-black tracking-tight uppercase text-lg sm:text-xl truncate",
            variant === "dark" ? "text-white" : "text-slate-900"
          )}
        >
          {storeName}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative flex items-center justify-start select-none", fill ? "w-full h-full" : "", className)}>
      {fill ? (
        <Image
          src={activeSrc}
          alt={logoAlt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={isDirectUrl}
          onError={() => {
            if (!hasError && activeSrc !== fallbackSrc) {
              setHasError(true);
            } else {
              setHasSecondaryError(true);
            }
          }}
          className={imageClassName}
        />
      ) : (
        <Image
          src={activeSrc}
          alt={logoAlt}
          width={width || 180}
          height={height || 50}
          priority={priority}
          unoptimized={isDirectUrl}
          onError={() => {
            if (!hasError && activeSrc !== fallbackSrc) {
              setHasError(true);
            } else {
              setHasSecondaryError(true);
            }
          }}
          className={imageClassName}
        />
      )}
    </div>
  );
}
