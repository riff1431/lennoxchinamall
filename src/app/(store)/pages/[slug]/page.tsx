import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lennoxchinamall.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const FAQ_ITEMS = [
  {
    question: "How do I pay with USDT on Lennox ChinaMall?",
    answer: "During checkout, select Binance Pay. A unique QR code and merchant trade reference are generated. Open your Binance mobile app, scan the QR code, and confirm. Your order status updates to 'Paid' within 3 seconds with zero blockchain gas fees.",
  },
  {
    question: "What if my product arrives defective?",
    answer: "We offer a 30-day factory replacement guarantee. Simply submit a return ticket with photos or video proof from your account portal, and we will issue a full USDT refund or ship an expedited replacement.",
  },
  {
    question: "How does the single-vendor direct sourcing model work?",
    answer: "Lennox ChinaMall is not an open marketplace with uncontrolled resellers. When you order, our automated procurement system purchases the hardware directly from certified China manufacturing clusters in Shenzhen and Ningbo, performs bench testing, and ships door-to-door via tracked air cargo.",
  },
  {
    question: "What are the shipping times and delivery carriers?",
    answer: "Standard Direct Air Freight takes 7 to 12 business days and is FREE on orders over $50 USDT. International Priority (DHL / FedEx) takes 3 to 5 business days.",
  },
];

const PAGES_DATA: Record<
  string,
  {
    title: string;
    subtitle: string;
    description: string;
    body: React.ReactNode;
  }
> = {
  about: {
    title: "Direct Factory Sourcing — How Lennox ChinaMall Works",
    subtitle:
      "Connecting buyers directly with certified manufacturing lines across Shenzhen, Guangzhou, and Ningbo.",
    description:
      "Learn how Lennox ChinaMall operates single-vendor direct-to-consumer commerce with automated USDT escrow and direct China factory procurement.",
    body: (
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <p>
          <strong>Lennox ChinaMall</strong> is a custom single-vendor commerce portal founded to eliminate excessive distributor markups. Unlike multi-vendor marketplaces where hundreds of third-party resellers inflate prices, Lennox operates on an automated buy-after-sale model.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-1">1. You Order in USDT</h3>
            <p className="text-xs text-slate-500">
              Checkout with zero crypto conversion delays using Binance Pay QR.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-1">2. Direct Procurement</h3>
            <p className="text-xs text-slate-500">
              We purchase the hardware straight from the supplier via internal routing codes.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-1">3. Inspected & Shipped</h3>
            <p className="text-xs text-slate-500">
              Tested for quality, packaged securely, and shipped with door-to-door tracking.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  "shipping-policy": {
    title: "Worldwide Shipping & Delivery Timelines",
    subtitle:
      "Fast air freight from China sorting facilities to North America, Europe, UAE, and worldwide.",
    description:
      "Worldwide tracked air cargo shipping policy for Lennox ChinaMall orders dispatched from Guangdong and Shenzhen sorting facilities.",
    body: (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          All orders placed on Lennox ChinaMall are dispatched from our primary hub in Guangdong / Shenzhen.
        </p>
        <ul className="list-disc list-inside space-y-2 text-xs text-slate-600">
          <li><strong>Standard Direct Air Freight:</strong> 7 - 12 business days (FREE on orders over $50 USDT).</li>
          <li><strong>International Priority (DHL / FedEx):</strong> 3 - 5 business days ($14.99 USDT).</li>
          <li><strong>Processing & Procurement Time:</strong> 24 - 48 hours for factory pickup and bench testing.</li>
          <li><strong>Customs & Import Fees:</strong> Handled seamlessly via DDP (Delivered Duty Paid) protocols.</li>
        </ul>
      </div>
    ),
  },
  faq: {
    title: "Frequently Asked Questions & USDT Sourcing Guide",
    subtitle: "Learn more about paying with cryptocurrency and order delivery.",
    description:
      "Frequently asked questions about paying with Binance Pay USDT, shipping tracking, factory warranties, and 30-day returns on Lennox ChinaMall.",
    body: (
      <div className="space-y-6 text-sm text-slate-700">
        {FAQ_ITEMS.map((faq, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-1.5">{faq.question}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    ),
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
  const page = PAGES_DATA[slug];

  if (!page) {
    return {
      title: "Page Not Found | Lennox ChinaMall",
      description: "Information page on Lennox ChinaMall.",
    };
  }

  return {
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

  const current = PAGES_DATA[slug];

  if (!current) {
    notFound();
  }

  const breadcrumbItems = [{ label: current.title, href: `/pages/${slug}` }];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {slug === "faq" && <FaqJsonLd questions={FAQ_ITEMS} />}

      <Breadcrumbs items={[{ label: current.title }]} />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-2 pb-4 border-b border-slate-100">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {current.title}
          </h1>
          <p className="text-xs text-slate-500">{current.subtitle}</p>
        </div>

        <div>{current.body}</div>
      </div>
    </div>
  );
}
