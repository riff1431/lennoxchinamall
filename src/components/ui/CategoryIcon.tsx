"use client";

import React from "react";
import Image from "next/image";
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
