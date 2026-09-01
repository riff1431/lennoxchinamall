import React from "react";
import type { Metadata } from "next";
import { getCategories } from "@/services/categories";
import { CategoriesDirectoryClient } from "./CategoriesDirectoryClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lennoxchinamall.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Direct China Factory Departments & Sourcing Hubs",
  description:
    "Explore certified China manufacturing clusters in Shenzhen, Ningbo, and Dongguan. Sourcing 4K camera drones, 3D printers, electronics, and automotive tools.",
  alternates: {
    canonical: `${APP_URL}/categories`,
  },
  openGraph: {
    title: "Direct China Factory Departments & Sourcing Hubs | Lennox ChinaMall",
    description:
      "Explore certified China manufacturing clusters in Shenzhen, Ningbo, and Dongguan. Sourcing 4K camera drones, 3D printers, electronics, and automotive tools.",
    url: `${APP_URL}/categories`,
    type: "website",
  },
};

export default async function CategoriesDirectoryPage() {
  const categories = await getCategories();

  return <CategoriesDirectoryClient categories={categories} />;
}


