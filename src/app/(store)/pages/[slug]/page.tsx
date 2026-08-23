"use client";

import React, { use } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ShieldCheck, Truck, Coins, CheckCircle2 } from "lucide-react";

export default function StaticInformationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const contentMap: Record<
    string,
    { title: string; subtitle: string; body: React.ReactNode }
  > = {
    about: {
      title: "Direct Factory Sourcing — How Lennox ChinaMall Works",
      subtitle:
        "Connecting buyers directly with certified manufacturing lines across Shenzhen, Guangzhou, and Ningbo.",
      body: (
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>
            <strong>Lennox ChinaMall</strong> is a custom single-vendor commerce portal founded to eliminate excessive distributor markups. Unlike multi-vendor marketplaces where hundreds of third-party resellers inflate prices, Lennox operates on an automated buy-after-sale model.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">1. You Order in USDT</h4>
              <p className="text-xs text-slate-500">
                Checkout with zero crypto conversion delays using Binance Pay QR.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">2. Direct Procurement</h4>
              <p className="text-xs text-slate-500">
                We purchase the hardware straight from the supplier via internal routing codes.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">3. Inspected & Shipped</h4>
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
        "Fast air freight from China sorting facilities to North America, Europe, and worldwide.",
      body: (
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            All orders placed on Lennox ChinaMall are dispatched from our primary hub in Guangdong / Shenzhen.
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-600">
            <li><strong>Standard Direct Air Freight:</strong> 7 - 14 business days (FREE on orders over $50 USDT).</li>
            <li><strong>International Priority (DHL / FedEx):</strong> 4 - 7 business days ($14.99 USDT).</li>
            <li><strong>Processing & Procurement Time:</strong> 24 - 48 hours for factory pickup and bench testing.</li>
          </ul>
        </div>
      ),
    },
    faq: {
      title: "Frequently Asked Questions & USDT Guide",
      subtitle: "Learn more about paying with cryptocurrency and order delivery.",
      body: (
        <div className="space-y-6 text-sm text-slate-700">
          <div>
            <h4 className="font-bold text-slate-900 mb-1">How do I pay with USDT?</h4>
            <p className="text-xs text-slate-600">
              During checkout, select Binance Pay. A unique QR code and merchant trade reference are generated. Open your Binance mobile app, scan the QR code, and confirm. Your order status updates to &lsquo;Paid&rsquo; within 3 seconds.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">What if my product arrives defective?</h4>
            <p className="text-xs text-slate-600">
              We offer a 30-day factory replacement guarantee. Simply submit a return ticket with photos or video proof from your account portal, and we will issue a full USDT refund or ship a replacement.
            </p>
          </div>
        </div>
      ),
    },
  };

  const current = contentMap[slug] || contentMap.about;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <Breadcrumbs items={[{ label: current.title }]} />

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
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
