"use client";

import React from "react";
import {
  Factory,
  Coins,
  Plane,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface AssuranceItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  accent: {
    iconBg: string;
    iconBorder: string;
    iconColor: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
    hoverBorder: string;
    hoverGlow: string;
    cornerGradient: string;
  };
  highlight: string;
}

const ASSURANCE_ITEMS: AssuranceItem[] = [
  {
    id: "factory-cost",
    badge: "EX-FACTORY",
    title: "Real Factory Cost",
    subtitle: "Direct Tier-1 Pricing",
    description:
      "Direct transparent pricing straight from verified China factory floors. Zero broker margins or intermediary markups.",
    icon: Factory,
    accent: {
      iconBg: "bg-red-500/10",
      iconBorder: "border-red-500/20",
      iconColor: "text-[#FF1028]",
      pillBg: "bg-red-50",
      pillText: "text-[#FF1028]",
      pillBorder: "border-red-200/80",
      hoverBorder: "hover:border-[#FF1028]/40",
      hoverGlow: "group-hover:shadow-[0_8px_30px_-8px_rgba(255,16,40,0.18)]",
      cornerGradient: "from-red-500/10 via-transparent to-transparent",
    },
    highlight: "0% Middleman Markups",
  },
  {
    id: "binance-pay",
    badge: "INSTANT ESCROW",
    title: "USDT Binance Pay",
    subtitle: "Crypto Settlement",
    description:
      "Instant cryptographic settlement with zero chargebacks. Protected by multi-chain automated escrow validation.",
    icon: Coins,
    accent: {
      iconBg: "bg-amber-500/10",
      iconBorder: "border-amber-500/20",
      iconColor: "text-amber-500",
      pillBg: "bg-amber-50",
      pillText: "text-amber-700",
      pillBorder: "border-amber-200/80",
      hoverBorder: "hover:border-amber-400/50",
      hoverGlow: "group-hover:shadow-[0_8px_30px_-8px_rgba(245,158,11,0.18)]",
      cornerGradient: "from-amber-500/10 via-transparent to-transparent",
    },
    highlight: "0% Transaction Risk",
  },
  {
    id: "air-cargo",
    badge: "EXPEDITED AIR",
    title: "Door-to-Door Cargo",
    subtitle: "5-8 Days Worldwide",
    description:
      "Direct air transit from Shenzhen and Hong Kong hubs with end-to-end milestone GPS and guaranteed customs clearance.",
    icon: Plane,
    accent: {
      iconBg: "bg-emerald-500/10",
      iconBorder: "border-emerald-500/20",
      iconColor: "text-[#10B981]",
      pillBg: "bg-emerald-50",
      pillText: "text-emerald-700",
      pillBorder: "border-emerald-200/80",
      hoverBorder: "hover:border-emerald-500/40",
      hoverGlow: "group-hover:shadow-[0_8px_30px_-8px_rgba(16,185,129,0.18)]",
      cornerGradient: "from-emerald-500/10 via-transparent to-transparent",
    },
    highlight: "Full Step-by-Step GPS",
  },
  {
    id: "return-protection",
    badge: "BUYER SHIELD",
    title: "30-Day Protection",
    subtitle: "Verified Dispute Desk",
    description:
      "Full factory warranty and direct USDT refund guarantee if received products fail QC specifications or performance tests.",
    icon: ShieldCheck,
    accent: {
      iconBg: "bg-blue-500/10",
      iconBorder: "border-blue-500/20",
      iconColor: "text-blue-600",
      pillBg: "bg-blue-50",
      pillText: "text-blue-700",
      pillBorder: "border-blue-200/80",
      hoverBorder: "hover:border-blue-500/40",
      hoverGlow: "group-hover:shadow-[0_8px_30px_-8px_rgba(37,99,235,0.18)]",
      cornerGradient: "from-blue-500/10 via-transparent to-transparent",
    },
    highlight: "100% USDT Refund Guarantee",
  },
];

export function SourcingAssuranceSection() {
  return (
    <section className="relative overflow-hidden rounded-xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10 transition-all duration-300">
      {/* Subtle Background Accent Lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="relative z-10 text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 border border-red-200/60 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF1028] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF1028]" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-black text-[#FF1028] uppercase tracking-wider font-mono">
            WHY SHOP AT CHINA MALL
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#00143D] tracking-tight font-heading">
          The Single-Vendor Sourcing Guarantee
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Direct manufacturing access from verified China production clusters with institutional-grade crypto payment escrow and guaranteed air delivery.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {ASSURANCE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-lg bg-white border border-slate-200/80 ${item.accent.hoverBorder} ${item.accent.hoverGlow} hover:-translate-y-1.5 transition-all duration-300 shadow-xs hover:shadow-lg`}
            >
              {/* Card Corner Subtle Tint */}
              <div
                className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${item.accent.cornerGradient} rounded-tr-lg pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Top Row: Icon + Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div
                    className={`w-12 h-12 rounded-md ${item.accent.iconBg} border ${item.accent.iconBorder} ${item.accent.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-xs`}
                  >
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <span
                    className={`text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-xs border uppercase font-mono tracking-wider ${item.accent.pillBg} ${item.accent.pillText} ${item.accent.pillBorder}`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-2.5">
                  <h3 className="text-sm sm:text-base font-black text-[#00143D] tracking-tight font-heading group-hover:text-[#FF1028] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400 font-mono mt-0.5">
                    {item.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Assurance Highlight Pill */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 ${item.accent.iconColor} shrink-0`} />
                <span className="text-[11px] font-bold text-slate-700 font-sans truncate">
                  {item.highlight}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
