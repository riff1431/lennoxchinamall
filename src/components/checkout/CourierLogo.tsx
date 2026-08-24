"use client";

import React, { useState } from "react";
import Image from "next/image";

export type CourierCode =
  | "yunexpress"
  | "sf_express"
  | "sf"
  | "dhl"
  | "yanwen"
  | "4px"
  | "fedex"
  | string;

interface CourierLogoProps {
  courier: CourierCode;
  name?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showNameBelow?: boolean;
}

export function CourierLogo({
  courier,
  name,
  imageUrl,
  size = "md",
  className = "",
  showNameBelow = false,
}: CourierLogoProps) {
  const [imageError, setImageError] = useState(false);
  const normalizedCode = courier.toLowerCase().replace(/[\s_-]+/g, "");

  // Size dimensions
  const sizeMap = {
    sm: { box: "w-8 h-8", text: "text-[10px]" },
    md: { box: "w-12 h-12 sm:w-14 sm:h-14", text: "text-xs" },
    lg: { box: "w-14 h-14 sm:w-16 sm:h-16", text: "text-sm" },
    xl: { box: "w-16 h-16 sm:w-20 sm:h-20", text: "text-base" },
  }[size];

  // If custom valid image is provided and hasn't errored
  if (imageUrl && !imageError) {
    return (
      <div
        className={`relative ${sizeMap.box} rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-1.5 shrink-0 ${className}`}
      >
        <Image
          src={imageUrl}
          alt={name || courier}
          fill
          sizes="80px"
          className="object-contain p-1"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Render stylized, high-fidelity dynamic vector logos
  const renderVectorLogo = () => {
    // 1. YunExpress (云途物流) - Signature Blue & Vibrant Orange Jet Wing
    if (normalizedCode.includes("yun") || normalizedCode === "yunexpress") {
      return (
        <div
          className={`relative ${sizeMap.box} rounded-2xl bg-gradient-to-br from-[#0B63CE] via-[#0284C7] to-[#0369A1] p-1.5 shadow-sm flex flex-col items-center justify-center text-white shrink-0 overflow-hidden ring-1 ring-blue-500/30 transition-transform duration-300 group-hover:scale-105 ${className}`}
          title={name || "YunExpress Air Express"}
        >
          {/* Subtle aerodynamic background vector */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Speed trails */}
            <path
              d="M12 72L42 22C44 19 48 18 52 20L88 38C91 40 92 44 90 47L76 68C74 71 70 72 66 71L18 56"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeOpacity="0.25"
            />
            {/* Orange supersonic accent swoosh */}
            <path
              d="M16 80 C 35 86, 68 82, 88 56"
              stroke="#FF8A00"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Supersonic white aerodynamic aircraft/wing */}
            <path
              d="M24 64 L62 26 C66 22 72 23 74 28 L78 36 C80 40 77 44 72 46 L40 60 L24 64 Z"
              fill="#FFFFFF"
            />
            {/* Orange core dot */}
            <circle cx="58" cy="40" r="5" fill="#FF8A00" />
          </svg>
          <span className="absolute bottom-0.5 text-[8px] sm:text-[9px] font-black tracking-tighter uppercase text-sky-100 font-heading">
            YUN
          </span>
        </div>
      );
    }

    // 2. SF International / SF Express (顺丰速运) - Iconic Red & Dark Slate Aerodynamic Mark
    if (normalizedCode.includes("sf") || normalizedCode === "sfexpress" || normalizedCode === "sfinternational") {
      return (
        <div
          className={`relative ${sizeMap.box} rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#000000] p-1.5 shadow-sm flex flex-col items-center justify-center text-white shrink-0 overflow-hidden ring-1 ring-red-500/30 transition-transform duration-300 group-hover:scale-105 ${className}`}
          title={name || "SF International Priority"}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SF Red Emblem Circle */}
            <circle cx="50" cy="45" r="32" fill="#E11D48" />
            {/* SF Dual Curved Aerodynamic Wings (White) */}
            <path
              d="M32 45 C32 35 40 29 50 29 C56 29 61 32 64 36 L57 40 C55 37 53 35 50 35 C44 35 39 39 39 45 C39 51 44 55 50 55 C53 55 56 53 58 51 L65 56 C61 60 56 62 50 62 C40 62 32 55 32 45 Z"
              fill="#FFFFFF"
            />
            {/* Signature SF Center Speed Dot */}
            <circle cx="50" cy="45" r="4" fill="#E11D48" />
            <circle cx="68" cy="31" r="3.5" fill="#FFFFFF" />
          </svg>
          <span className="absolute bottom-0.5 text-[8px] sm:text-[9px] font-black tracking-tight text-red-300 uppercase font-heading">
            SF EXP
          </span>
        </div>
      );
    }

    // 3. DHL Worldwide Express - Iconic Canary Yellow & Red Speed Lines
    if (normalizedCode.includes("dhl")) {
      return (
        <div
          className={`relative ${sizeMap.box} rounded-2xl bg-gradient-to-br from-[#FFCC00] via-[#FFD200] to-[#E6B800] p-1.5 shadow-sm flex flex-col items-center justify-center text-[#D40511] shrink-0 overflow-hidden ring-1 ring-amber-400/40 transition-transform duration-300 group-hover:scale-105 ${className}`}
          title={name || "DHL Worldwide Express"}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Red Speed/Motion Lines */}
            <line x1="8" y1="26" x2="92" y2="26" stroke="#D40511" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="8" y1="74" x2="92" y2="74" stroke="#D40511" strokeWidth="2.8" strokeLinecap="round" />
            {/* Stylized Italic DHL Text Vector */}
            <g transform="skewX(-14) translate(6, 0)">
              <text
                x="44"
                y="57"
                textAnchor="middle"
                fill="#D40511"
                fontSize="31"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="1"
              >
                DHL
              </text>
            </g>
          </svg>
          <span className="absolute bottom-0.5 text-[7px] font-black tracking-tighter text-[#990008] uppercase font-mono">
            EXPRESS
          </span>
        </div>
      );
    }

    // 4. 4PX Express
    if (normalizedCode.includes("4px")) {
      return (
        <div
          className={`relative ${sizeMap.box} rounded-2xl bg-gradient-to-br from-[#FF6600] to-[#E64A00] p-1.5 shadow-sm flex flex-col items-center justify-center text-white shrink-0 overflow-hidden ring-1 ring-orange-400/30 transition-transform duration-300 group-hover:scale-105 ${className}`}
          title={name || "4PX Express"}
        >
          <span className="font-black text-xs sm:text-sm tracking-tighter italic">4PX</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-orange-100">AIR</span>
        </div>
      );
    }

    // 5. Yanwen
    if (normalizedCode.includes("yanwen")) {
      return (
        <div
          className={`relative ${sizeMap.box} rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] p-1.5 shadow-sm flex flex-col items-center justify-center text-white shrink-0 overflow-hidden ring-1 ring-emerald-400/30 transition-transform duration-300 group-hover:scale-105 ${className}`}
          title={name || "Yanwen Special Line"}
        >
          <span className="font-black text-[11px] sm:text-xs tracking-tighter uppercase font-heading">YANWEN</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-emerald-100">GLOBAL</span>
        </div>
      );
    }

    // 6. FedEx
    if (normalizedCode.includes("fedex")) {
      return (
        <div
          className={`relative ${sizeMap.box} rounded-2xl bg-gradient-to-br from-[#4D148C] to-[#360968] p-1.5 shadow-sm flex items-center justify-center text-white shrink-0 overflow-hidden ring-1 ring-purple-400/30 transition-transform duration-300 group-hover:scale-105 ${className}`}
          title={name || "FedEx Express"}
        >
          <span className="font-black text-xs tracking-tighter">
            <span className="text-white">Fed</span>
            <span className="text-[#FF6600]">Ex</span>
          </span>
        </div>
      );
    }

    // Default Fallback: Clean high-tech logistics badge with dynamic initials
    const initials = (name || courier)
      .split(" ")
      .map((w) => w[0])
      .slice(0, 3)
      .join("")
      .toUpperCase() || "AIR";

    return (
      <div
        className={`relative ${sizeMap.box} rounded-2xl bg-gradient-to-br from-[#00143D] to-[#1E293B] p-1.5 shadow-sm flex flex-col items-center justify-center text-white shrink-0 ring-1 ring-slate-700/50 transition-transform duration-300 group-hover:scale-105 ${className}`}
        title={name || courier}
      >
        <span className="font-black font-mono text-[11px] tracking-wider text-sky-400">
          {initials}
        </span>
        <span className="text-[7px] font-bold uppercase tracking-wider text-slate-300">CARGO</span>
      </div>
    );
  };

  return (
    <div className="inline-flex flex-col items-center shrink-0">
      {renderVectorLogo()}
      {showNameBelow && (
        <span className="text-[10px] font-bold text-slate-700 mt-1 truncate max-w-[80px]">
          {name || courier}
        </span>
      )}
    </div>
  );
}

export default CourierLogo;
