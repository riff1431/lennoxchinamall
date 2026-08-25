"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Zap, ShieldCheck, Plane, Coins, Sparkles, CheckCircle2 } from "lucide-react";

export function SitePreloader() {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  const statusMessages = [
    { text: "Connecting to Shenzhen & Ningbo Direct Hubs...", icon: Zap },
    { text: "Verifying 100% Pre-Departure Dual-Video QC Benchmarks...", icon: ShieldCheck },
    { text: "Initializing Binance Pay 0% Escrow Gateway...", icon: Coins },
    { text: "Syncing 5–8 Days Air Cargo Global Routes...", icon: Plane },
    { text: "Factory Direct Sourcing Engine Ready!", icon: CheckCircle2 },
  ];

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Check if user already loaded in this session to make repeat transitions silky
    const hasLoaded = sessionStorage.getItem("lennox_preloaded");
    const intervalTime = hasLoaded ? 18 : 35; // Fast on repeat, cinematic on fresh visit

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 12) + 6;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const step = Math.min(
      Math.floor((progress / 100) * statusMessages.length),
      statusMessages.length - 1
    );
    setStatusIndex(step);

    if (progress >= 100) {
      sessionStorage.setItem("lennox_preloaded", "true");
      const timeout = setTimeout(() => {
        setIsDone(true);
        setTimeout(() => setShouldRender(false), 700); // Remove from DOM after transition
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [progress, statusMessages.length]);

  if (!shouldRender) return null;

  const CurrentIcon = statusMessages[statusIndex]?.icon || Sparkles;

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#000B24] text-white transition-all duration-700 ease-out select-none ${
        isDone
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
      aria-hidden={isDone}
    >
      {/* Ambient background glow & radial grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,16,40,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,35,102,0.35),transparent_60%)] pointer-events-none" />

      {/* Center Preloader Brand Capsule */}
      <div className="relative z-10 flex flex-col items-center max-w-[320px] sm:max-w-sm w-full px-4 sm:px-6 space-y-5 sm:space-y-7 text-center">
        {/* Animated Brand Logo with Radar Ring */}
        <div className="relative flex items-center justify-center">
          {/* Pulsating outer sonar ring */}
          <div className="absolute w-22 h-22 sm:w-28 sm:h-28 rounded-full border border-[#FF1028]/30 animate-ping opacity-35" />
          <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-blue-500/20 animate-pulse" />

          {/* Logo container */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white p-2 shadow-2xl flex items-center justify-center border-2 border-white/20 transform hover:scale-105 transition-transform">
            <Image
              src="/logo-lennoxchinamall.jpeg"
              alt="Lennox China Mall"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
        </div>

        {/* Brand Title & Tagline */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-heading font-black text-lg sm:text-2xl tracking-wider">
            <span className="text-white">CHINA</span>
            <span className="text-[#FF1028]">MALL</span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-400">
            DIRECT CHINA SOURCING • WHOLESALE
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#002366] via-[#FF1028] to-[#10B981] transition-all duration-150 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 px-0.5">
            <span className="flex items-center gap-1.5 text-slate-300 min-w-0">
              <CurrentIcon className="w-3.5 h-3.5 text-[#FF1028] animate-bounce shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-[220px]">
                {statusMessages[statusIndex]?.text}
              </span>
            </span>
            <span className="font-bold text-white tabular-nums ml-2">{progress}%</span>
          </div>
        </div>

        {/* Factory Trust Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 text-[9px] sm:text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            <Zap className="w-3 h-3 text-amber-400" /> Shenzhen Hub
          </span>
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Dual QC Lab
          </span>
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            <Coins className="w-3 h-3 text-blue-400" /> Binance USDT
          </span>
        </div>
      </div>
    </div>
  );
}
