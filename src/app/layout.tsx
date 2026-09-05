import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { getPublicStoreSettings } from "@/lib/settings";
import { DynamicFavicon } from "@/components/common/DynamicFavicon";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-constants";
import "./globals.css";

// Heading & Display Font: Plus Jakarta Sans (Modern Geometric, High-End Luxury E-Commerce)
const fontHeading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

// Body & UI Font: Inter (Crisp, High-Density Readability)
const fontSans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Monospace & Crypto Font: JetBrains Mono (Order IDs, Hashes, Prepay IDs, Secret Supplier Codes)
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#00143D",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicStoreSettings();
  const storeName = settings?.store_info?.store_name || "Lennox ChinaMall";
  const faviconUrl = settings?.branding?.favicon_url || DEFAULT_STORE_SETTINGS.branding.favicon_url;
  const ogImageUrl = settings?.seo?.og_image_url || "/logo-lennoxchinamall.png";

  return {
    title: {
      default: `${storeName} — Direct China Sourcing & Wholesale Portal`,
      template: `%s | ${storeName}`,
    },
    description:
      settings?.seo?.default_meta_description ||
      "Leading China direct-to-consumer e-commerce portal. Buy electronics, 4K drones, 3D printers, tools and hardware at factory prices with Binance Pay USDT settlement.",
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    openGraph: {
      title: `${storeName} — Direct China Sourcing & Wholesale Portal`,
      description: settings?.seo?.default_meta_description || "Leading China direct-to-consumer e-commerce portal.",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
    },
  };
}

import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { RouteProgressBar } from "@/components/common/RouteProgressBar";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { LOCALE_COOKIE_KEY, DEFAULT_LOCALE } from "@/lib/i18n";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  const initialLocale = rawLocale === "en" ? "en" : DEFAULT_LOCALE;
  const publicSettings = await getPublicStoreSettings();

  return (
    <html
      lang={initialLocale}
      className={`${fontHeading.variable} ${fontSans.variable} ${fontMono.variable} min-h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="font-sans text-slate-800 bg-[#F8FAFC] min-h-screen antialiased selection:bg-[#FF1028] selection:text-white"
        suppressHydrationWarning
      >
        <SettingsProvider initialSettings={publicSettings}>
          <DynamicFavicon initialSettings={publicSettings} />
          <LanguageProvider defaultLocale={initialLocale}>
            <Suspense fallback={null}>
              <RouteProgressBar />
            </Suspense>
            <AuthProvider>
              <SmoothScrollProvider>{children}</SmoothScrollProvider>
            </AuthProvider>
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
