import React from "react";
import type { Metadata } from "next";
import { HomePageClient } from "./HomePageClient";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lennoxchinamall.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Lennox ChinaMall — Direct China Sourcing & Wholesale Hardware Portal",
  description:
    "Buy 4K camera drones, CoreXY 3D printers, audio boomboxes, and OBD2 automotive tools at direct factory prices with Binance Pay USDT escrow checkout.",
  alternates: {
    canonical: `${APP_URL}`,
  },
  openGraph: {
    title: "Lennox ChinaMall — Direct China Sourcing & Wholesale Hardware Portal",
    description:
      "Buy 4K camera drones, CoreXY 3D printers, audio boomboxes, and OBD2 automotive tools at direct factory prices with Binance Pay USDT escrow checkout.",
    url: `${APP_URL}`,
    type: "website",
    images: [
      {
        url: "/logo-lennoxchinamall.jpeg",
        width: 800,
        height: 800,
        alt: "Lennox ChinaMall Direct Sourcing Portal",
      },
    ],
  },
};

export default function StoreHomePage() {
  return (
    <>
      <WebsiteJsonLd />
      <HomePageClient />
    </>
  );
}
