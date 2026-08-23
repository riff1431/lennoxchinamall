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
  const defaultTarget = React.useMemo(() => {
    return new Date(Date.now() + 14 * 3600 * 1000).toISOString();
  }, []);

  const finalTarget = targetDate || defaultTarget;
  const [timeLeft, setTimeLeft] = useState(timeRemaining(finalTarget));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(timeRemaining(finalTarget));
    }, 1000);
    return () => clearInterval(timer);
  }, [finalTarget]);

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
