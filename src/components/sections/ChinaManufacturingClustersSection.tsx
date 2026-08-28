"use client";

import React from "react";
import Link from "next/link";
import {
  Cpu,
  Factory,
  Headphones,
  Car,
  Plane,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  ArrowUpRight,
  Zap,
} from "lucide-react";

interface ClusterItem {
  id: string;
  code: string;
  name: string;
  region: string;
  description: string;
  guarantee: string;
  guaranteeIcon: React.ElementType;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  iconColor: string;
  accentBorder: string;
  accentGlow: string;
  badgeBg: string;
  badgeText: string;
  link: string;
}

const CLUSTERS: ClusterItem[] = [
  {
    id: "shenzhen",
    code: "SZX • 01",
    name: "Shenzhen High-Tech",
    region: "Guangdong Silicon Delta",
    description: "4K Camera Drones, Gimbal Stabilizers, Smart Microelectronics",
    guarantee: "7-10 Days Air Express",
    guaranteeIcon: Plane,
    icon: Cpu,
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    iconBg: "bg-cyan-500/15 border-cyan-400/30 text-cyan-300",
    iconColor: "text-cyan-400",
    accentBorder: "hover:border-cyan-400/50",
    accentGlow: "group-hover:shadow-[0_0_28px_-6px_rgba(6,182,212,0.35)]",
    badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    badgeText: "AIR PRIORITY",
    link: "/categories",
  },
  {
    id: "ningbo",
    code: "NGB • 02",
    name: "Ningbo Machinery",
    region: "Zhejiang Coastal Cluster",
    description: "CoreXY 3D Printers, Laser Engravers, Heavy Power Hardware",
    guarantee: "Inspected at Gate",
    guaranteeIcon: ShieldCheck,
    icon: Factory,
    gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
    iconBg: "bg-amber-500/15 border-amber-400/30 text-amber-300",
    iconColor: "text-amber-400",
    accentBorder: "hover:border-amber-400/50",
    accentGlow: "group-hover:shadow-[0_0_28px_-6px_rgba(245,158,11,0.35)]",
    badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    badgeText: "QC CERTIFIED",
    link: "/categories",
  },
  {
    id: "dongguan",
    code: "DGG • 03",
    name: "Dongguan Audio",
    region: "Pearl River Acoustics Hub",
    description: "120W Bluetooth Boomboxes, TWS Earbuds, Studio Soundcards",
    guarantee: "Factory Batch Verified",
    guaranteeIcon: CheckCircle2,
    icon: Headphones,
    gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    iconBg: "bg-purple-500/15 border-purple-400/30 text-purple-300",
    iconColor: "text-purple-400",
    accentBorder: "hover:border-purple-400/50",
    accentGlow: "group-hover:shadow-[0_0_28px_-6px_rgba(168,85,247,0.35)]",
    badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-300",
    badgeText: "BATCH TESTED",
    link: "/categories",
  },
  {
    id: "guangzhou",
    code: "CAN • 04",
    name: "Guangzhou Automotive",
    region: "Greater Bay Mobility Zone",
    description: "OBD2 Diagnostic Tablets, Jump Starters, Car Electronics",
    guarantee: "Direct Manufacturer PO",
    guaranteeIcon: Boxes,
    icon: Car,
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    iconBg: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
    iconColor: "text-emerald-400",
    accentBorder: "hover:border-emerald-400/50",
    accentGlow: "group-hover:shadow-[0_0_28px_-6px_rgba(16,185,129,0.35)]",
    badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    badgeText: "DIRECT PO",
    link: "/categories",
  },
];

export function ChinaManufacturingClustersSection() {
  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#001033] via-[#001642] to-[#00081C] text-white p-5 sm:p-8 lg:p-10 border border-blue-900/50 shadow-2xl transition-all">
      {/* ── Modern High-Tech SVG Grid Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Subtle Tech Grid Pattern */}
        <svg
          className="absolute inset-0 h-full w-full stroke-white/[0.04] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="china-clusters-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" strokeWidth="1" />
              <circle cx="36" cy="36" r="1" fill="rgba(255,255,255,0.08)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#china-clusters-grid)" />
        </svg>

        {/* Ambient Glowing Lighting Gradients */}
        <div className="absolute -top-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 sm:w-80 h-72 sm:h-80 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

        {/* Diagonal Tech Accent Strip */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/[0.03] to-transparent pointer-events-none" />
      </div>

      {/* ── Header Area ── */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-white/[0.08]">
        <div className="max-w-2xl space-y-2">
          {/* Live Pipeline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[#10B981] text-[10px] font-black uppercase tracking-wider font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>TRANSPARENT SOURCING PIPELINE</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-heading tracking-tight">
            Direct China Manufacturing Clusters
          </h2>

          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xl">
            China Mall bypasses intermediaries. Orders placed with USDT go directly from certified industrial clusters via expedited air cargo.
          </p>
        </div>

        {/* Quick Hub Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-300">
          <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>0 Intermediaries</span>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gate QC Pass</span>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-cyan-400" />
            <span>Air Cargo</span>
          </span>
        </div>
      </div>

      {/* ── 4 Cluster Cards Grid ── */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {CLUSTERS.map((cluster) => {
          const IconComponent = cluster.icon;
          const GuaranteeIcon = cluster.guaranteeIcon;

          return (
            <Link
              key={cluster.id}
              href={cluster.link}
              className={`group relative flex flex-col justify-between rounded-lg bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md border border-white/[0.1] ${cluster.accentBorder} p-4 sm:p-5 transition-all duration-300 hover-lift ${cluster.accentGlow}`}
            >
              {/* Top Accent Gradient Hover Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cluster.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none`}
              />

              {/* Card Header: Icon & Code Tag */}
              <div className="relative z-10 flex items-start justify-between gap-3 mb-3.5">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-md flex items-center justify-center border ${cluster.iconBg} shadow-inner group-hover:scale-105 transition-transform duration-300`}
                >
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${cluster.iconColor}`} />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black font-mono tracking-wider px-2 py-0.5 rounded-xs bg-white/[0.06] border border-white/[0.08] text-slate-400 group-hover:text-slate-200 transition-colors">
                    {cluster.code}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              {/* Card Body: Cluster Title & Specs */}
              <div className="relative z-10 flex-1 mb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-black text-white font-heading group-hover:text-white transition-colors">
                    {cluster.name}
                  </h4>
                </div>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                  {cluster.region}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-300/80 leading-relaxed pt-1.5 line-clamp-2">
                  {cluster.description}
                </p>
              </div>

              {/* Card Footer: Verified Guarantee Pill */}
              <div className="relative z-10 pt-3 border-t border-white/[0.08]">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-amber-300 font-mono">
                  <GuaranteeIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{cluster.guarantee}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
