"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { timeRemaining } from "@/utils/helpers";

interface FlashDealCountdownProps {
  targetDate?: string;
  label?: string;
}

export function FlashDealCountdown({
  targetDate,
  label,
}: FlashDealCountdownProps) {
  const [activeTarget, setActiveTarget] = useState<string>(
    targetDate || new Date(Date.now() + 14 * 3600 * 1000).toISOString()
  );

  useEffect(() => {
    if (targetDate) {
      setActiveTarget(targetDate);
      return;
    }

    // Attempt to sync with live active flash deal
    fetch("/api/promotions/automatic")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.flashDeals && data.flashDeals.length > 0) {
          const firstDeal = data.flashDeals[0];
          if (firstDeal.end_time) {
            setActiveTarget(firstDeal.end_time);
          }
        }
      })
      .catch(() => {
        // Fallback to activeTarget default
      });
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(timeRemaining(activeTarget));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(timeRemaining(activeTarget));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTarget]);

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
        <span>Deal has ended</span>
      </div>
    );
  }

  const formatDigit = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-2 text-xs font-bold font-sans">
      {label && (
        <span className="text-white flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          {label}
        </span>
      )}
      <div className="flex items-center gap-1 font-mono text-white tabular-nums">
        <span className="bg-[#000B24] border border-white/20 px-2 py-0.5 rounded-lg text-xs font-bold shadow-xs">
          {formatDigit(timeLeft.hours)}
        </span>
        <span className="text-white font-bold">:</span>
        <span className="bg-[#000B24] border border-white/20 px-2 py-0.5 rounded-lg text-xs font-bold shadow-xs">
          {formatDigit(timeLeft.minutes)}
        </span>
        <span className="text-white font-bold">:</span>
        <span className="bg-white text-[#FF1028] px-2 py-0.5 rounded-lg text-xs font-bold shadow-xs animate-pulse">
          {formatDigit(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
}
