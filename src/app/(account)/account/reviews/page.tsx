"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShieldCheck, MessageSquare, Plus, Check } from "lucide-react";
import { Rating } from "@/components/ui/Rating";
import { MOCK_PRODUCTS } from "@/lib/mockData";

export default function AccountReviewsPage() {
  const [reviews, setReviews] = useState([
    {
      id: "rev-1",
      product: MOCK_PRODUCTS[0],
      rating: 5,
      title: "Best 4K GPS Drone on the market for this price point!",
      body: "Received the Eachine EX5 within 8 business days in San Francisco. Camera stability is superb, battery lasted a genuine 28 minutes, and GPS return is spot-on.",
      date: "August 18, 2026",
      isVerified: true,
    },
    {
      id: "rev-2",
      product: MOCK_PRODUCTS[1],
      rating: 5,
      title: "Extremely fast CoreXY printing out of the box",
      body: "High-speed 600mm/s test prints completed with zero layer shifting. Quality checked and packed with heavy air-column bags.",
      date: "August 12, 2026",
      isVerified: true,
    },
  ]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D] flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>My Verified Hardware Reviews</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Share feedback on your factory purchases and earn Lennox Sourcing Reward Points.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                  <Image
                    src={
                      rev.product?.media?.[0]?.url ||
                      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80"
                    }
                    alt={rev.product?.title || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <Link
                    href={`/products/${rev.product?.slug}`}
                    className="text-xs font-bold text-slate-900 hover:text-[#FF1028] transition-colors line-clamp-1"
                  >
                    {rev.product?.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Rating rating={rev.rating} size="sm" />
                    {rev.isVerified && (
                      <span className="bg-emerald-50 text-[#10B981] text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold shrink-0">
                {rev.date}
              </span>
            </div>

            <div className="space-y-1 text-xs pt-1">
              <h4 className="font-bold text-slate-900">{rev.title}</h4>
              <p className="text-slate-600 leading-relaxed">{rev.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
