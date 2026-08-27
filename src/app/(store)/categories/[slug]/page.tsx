import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { CategoryPageClient } from "./CategoryPageClient";
import { CategoryJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lennoxchinamall.com";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const staticSlugs = [
    { slug: "flash-deals" },
    { slug: "new-arrivals" },
    ...MOCK_CATEGORIES.map((c) => ({ slug: c.slug })),
  ];
  return staticSlugs;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const isFlashDealsPage = slug === "flash-deals";
  const isNewArrivalsPage = slug === "new-arrivals";
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);

  const title = isFlashDealsPage
    ? "Flash Deals & Limited Drops — Direct Factory Pricing"
    : isNewArrivalsPage
    ? "New Arrivals — Fresh From China Manufacturing Clusters"
    : category
    ? `${category.name} — Direct China Factory Sourcing`
    : "Hardware Catalogue";

  const description = isFlashDealsPage
    ? "Time-limited factory drops with maximum discounts. Binance Pay USDT settlement."
    : isNewArrivalsPage
    ? "Newly inspected products with direct factory warranties and expedited air cargo."
    : category?.description ||
      "Direct-to-consumer wholesale sourcing from Shenzhen and Ningbo industrial hubs.";

  const image = category?.image_url || "/logo-lennoxchinamall.png";

  return {
    metadataBase: new URL(APP_URL),
    title,
    description,
    keywords: [
      category?.name || slug,
      "China factory",
      "wholesale hardware",
      "Binance Pay USDT",
      "direct sourcing",
    ],
    alternates: {
      canonical: `${APP_URL}/categories/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/categories/${slug}`,
      type: "website",
      images: [
        {
          url: image,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const isSpecial = slug === "flash-deals" || slug === "new-arrivals";
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);

  if (!category && !isSpecial) {
    notFound();
  }

  const pageTitle = isSpecial
    ? slug === "flash-deals"
      ? "Flash Deals"
      : "New Arrivals"
    : category?.name || "Department";

  const breadcrumbItems = [
    { label: "Departments", href: "/categories" },
    { label: pageTitle, href: `/categories/${slug}` },
  ];

  return (
    <>
      {category && <CategoryJsonLd category={category} />}
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <CategoryPageClient slug={slug} category={category} />
    </>
  );
}
