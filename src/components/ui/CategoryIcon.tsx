"use client";

import React from "react";
import {
  Smartphone,
  Plane,
  Wrench,
  Home,
  Car,
  Compass,
  Package,
  Layers,
  Tag,
  Zap,
  Cpu,
  Boxes,
  FolderTree,
  ShoppingBag,
  Shirt,
  Watch,
  Camera,
  Tv,
  Headphones,
  Gamepad2,
  Baby,
  Dumbbell,
  Utensils,
  HeartPulse,
  Palette,
  Flame,
  Shield,
  Sparkles,
  Gem,
  Glasses,
  Footprints,
  Bike,
  Drill,
  Armchair,
  Gift,
  Music,
  Radio,
  Wifi,
  BatteryCharging,
  Trophy,
  Laptop,
  Monitor,
  Speaker,
  Tablet,
  Key,
  Scissors,
  Coffee,
  Printer,
  Store,
  ShoppingBasket,
  Award,
  Lightbulb,
  HardHat,
  Fan,
  Mic,
  Cable,
  Plug,
  Navigation,
  Anchor,
  Truck,
  Ship,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/helpers";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Tv,
  Camera,
  Headphones,
  Speaker,
  Gamepad2,
  Plane,
  Wrench,
  Drill,
  Home,
  Armchair,
  Car,
  Bike,
  Truck,
  Ship,
  Compass,
  Navigation,
  Package,
  Boxes,
  Layers,
  Tag,
  ShoppingBag,
  ShoppingBasket,
  Store,
  Shirt,
  Glasses,
  Footprints,
  Watch,
  Gem,
  Gift,
  Zap,
  Cpu,
  BatteryCharging,
  Wifi,
  Radio,
  Music,
  Mic,
  Cable,
  Plug,
  Fan,
  Printer,
  Coffee,
  Utensils,
  Baby,
  Dumbbell,
  HeartPulse,
  Palette,
  Scissors,
  Key,
  Flame,
  Shield,
  Sparkles,
  Award,
  Trophy,
  Lightbulb,
  HardHat,
  FolderTree,
  Anchor,
};

export const PRESET_CATEGORY_ICONS = Object.keys(CATEGORY_ICON_MAP);

// ── Premium Color Map for category background pills ──
export const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  Shirt:        { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200/60" },
  ShoppingBag:  { bg: "bg-pink-50",    text: "text-pink-600",    border: "border-pink-200/60" },
  Baby:         { bg: "bg-fuchsia-50", text: "text-fuchsia-600", border: "border-fuchsia-200/60" },
  Sparkles:     { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200/60" },
  Footprints:   { bg: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-200/60" },
  Smartphone:   { bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-indigo-200/60" },
  Cpu:          { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200/60" },
  Laptop:       { bg: "bg-sky-50",     text: "text-sky-600",     border: "border-sky-200/60" },
  Car:          { bg: "bg-slate-100",  text: "text-slate-700",   border: "border-slate-200/60" },
  Dumbbell:     { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200/60" },
  Home:         { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200/60" },
  Armchair:     { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200/60" },
  Wrench:       { bg: "bg-cyan-50",    text: "text-cyan-600",    border: "border-cyan-200/60" },
  Drill:        { bg: "bg-cyan-50",    text: "text-cyan-600",    border: "border-cyan-200/60" },
  Gamepad2:     { bg: "bg-purple-50",  text: "text-purple-600",  border: "border-purple-200/60" },
  Utensils:     { bg: "bg-yellow-50",  text: "text-yellow-600",  border: "border-yellow-200/60" },
  HeartPulse:   { bg: "bg-red-50",     text: "text-red-500",     border: "border-red-200/60" },
  Camera:       { bg: "bg-teal-50",    text: "text-teal-600",    border: "border-teal-200/60" },
  Gem:          { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200/60" },
  Watch:        { bg: "bg-zinc-100",   text: "text-zinc-600",    border: "border-zinc-200/60" },
};

const DEFAULT_CATEGORY_COLOR = { bg: "bg-slate-100", text: "text-[#FF1028]", border: "border-slate-200/60" };

export interface CategoryIconProps {
  icon?: string | null;
  name?: string;
  className?: string;
  imageClassName?: string;
  fallback?: LucideIcon;
}

export function CategoryIcon({
  icon,
  name,
  className = "w-4 h-4 text-[#FF1028]",
  imageClassName = "object-contain",
  fallback = Package,
}: CategoryIconProps) {
  if (!icon) {
    const FallbackIcon = fallback;
    return <FallbackIcon className={className} />;
  }

  // Check if icon is an image URL or SVG data URL
  const isImageUrl =
    icon.startsWith("http://") ||
    icon.startsWith("https://") ||
    icon.startsWith("data:image/") ||
    icon.startsWith("/images/") ||
    icon.startsWith("/icons/") ||
    icon.startsWith("/uploads/") ||
    icon.startsWith("/") && (icon.includes(".svg") || icon.includes(".png") || icon.includes(".webp") || icon.includes(".jpg") || icon.includes(".jpeg"));

  if (isImageUrl) {
    return (
      <div className={cn("relative inline-flex items-center justify-center shrink-0 overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={icon}
          alt={name ? `${name} icon` : "Category Icon"}
          className={cn("w-full h-full", imageClassName)}
          loading="lazy"
        />
      </div>
    );
  }

  // Check if it's a known Lucide preset icon
  const IconComponent = CATEGORY_ICON_MAP[icon] || CATEGORY_ICON_MAP[icon.trim()] || fallback;
  return <IconComponent className={className} />;
}

/**
 * Premium variant — renders a category icon inside a themed color pill.
 * Used in mega menus, mobile drawers, and featured category grids.
 */
export interface PremiumCategoryIconProps {
  icon?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PremiumCategoryIcon({
  icon,
  name,
  size = "md",
  className,
}: PremiumCategoryIconProps) {
  const iconKey = icon?.trim() || "";
  const colors = CATEGORY_COLOR_MAP[iconKey] || DEFAULT_CATEGORY_COLOR;

  const sizeClasses = {
    sm: "w-6 h-6 rounded-md",
    md: "w-8 h-8 rounded-lg",
    lg: "w-10 h-10 rounded-xl",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        colors.bg,
        "border",
        colors.border,
        "flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs transition-all",
        className,
      )}
    >
      <CategoryIcon
        icon={icon}
        name={name}
        className={cn(iconSizes[size], colors.text)}
      />
    </div>
  );
}
