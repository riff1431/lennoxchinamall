import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaticInformationPageClient } from "./StaticInformationPageClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lennoxchinamall.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const META_PAGES: Record<string, { title: string; description: string }> = {
  about: {
    title: "Direct Factory Sourcing — How Lennox ChinaMall Works",
    description:
      "Learn how Lennox ChinaMall operates single-vendor direct-to-consumer commerce with automated USDT escrow and direct China factory procurement.",
  },
  "shipping-policy": {
    title: "Worldwide Shipping & Delivery Timelines",
    description:
      "Worldwide tracked air cargo shipping policy for Lennox ChinaMall orders dispatched from Guangdong and Shenzhen sorting facilities.",
  },
  faq: {
    title: "Frequently Asked Questions & USDT Sourcing Guide",
    description:
      "Frequently asked questions about paying with Binance Pay USDT, shipping tracking, factory warranties, and 30-day returns on Lennox ChinaMall.",
  },
};

export async function generateStaticParams() {
  return [
    { slug: "about" },
    { slug: "shipping-policy" },
    { slug: "faq" },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const page = META_PAGES[slug];

  if (!page) {
    return {
      title: "Page Not Found | Lennox ChinaMall",
      description: "Information page on Lennox ChinaMall.",
    };
  }

  return {
    metadataBase: new URL(APP_URL),
    title: `${page.title}`,
    description: page.description,
    alternates: {
      canonical: `${APP_URL}/pages/${slug}`,
    },
    openGraph: {
      title: `${page.title} | Lennox ChinaMall`,
      description: page.description,
      url: `${APP_URL}/pages/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | Lennox ChinaMall`,
      description: page.description,
    },
  };
}

export default async function StaticInformationPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!META_PAGES[slug]) {
    notFound();
  }

  return <StaticInformationPageClient slug={slug} />;
}
