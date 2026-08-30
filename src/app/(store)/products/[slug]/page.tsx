import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, getCachedProductBySlug } from "@/lib/mockData";
import { getProductBySlug } from "@/services/products";
import { getCategories } from "@/services/categories";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lennoxchinamall.com";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product =
    (await getProductBySlug(resolvedParams.slug)) ||
    getCachedProductBySlug(resolvedParams.slug) ||
    MOCK_PRODUCTS.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    return {
      title: "Product Not Found | Lennox ChinaMall",
      description: "Direct-to-consumer hardware sourcing portal.",
    };
  }

  const primaryImage =
    product.media?.[0]?.url ||
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80";

  const description =
    product.short_description ||
    product.description ||
    `Buy ${product.title} at direct China factory price with Binance Pay USDT escrow.`;

  return {
    metadataBase: new URL(APP_URL),
    title: `${product.title} — Direct Factory Sourcing`,
    description,
    keywords: [
      product.title,
      product.brand?.name || "Lennox Direct",
      product.sku,
      ...(product.tags || []),
      "China factory price",
      "Binance Pay USDT",
    ],
    alternates: {
      canonical: `${APP_URL}/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.title} — Direct Factory Sourcing`,
      description,
      url: `${APP_URL}/products/${product.slug}`,
      type: "website",
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — Direct Factory Sourcing`,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const [dbProduct, categories] = await Promise.all([
    getProductBySlug(slug),
    getCategories(),
  ]);

  const product =
    dbProduct ||
    getCachedProductBySlug(slug) ||
    MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  const category = product?.category_id
    ? categories.find((c) => c.id === product.category_id) ||
      MOCK_CATEGORIES.find((c) => c.id === product.category_id)
    : null;

  const breadcrumbItems = product
    ? [
        {
          label: category?.name || "Departments",
          href: category ? `/categories/${category.slug}` : "/categories",
        },
        { label: product.title, href: `/products/${product.slug}` },
      ]
    : [];

  return (
    <>
      {product && (
        <>
          <ProductJsonLd product={product} />
          <BreadcrumbJsonLd items={breadcrumbItems} />
        </>
      )}
      <ProductDetailClient
        product={product || null}
        category={category}
        slug={slug}
      />
    </>
  );
}
