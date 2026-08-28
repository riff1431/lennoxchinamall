"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LANGUAGES,
  CURRENCIES,
  ANNOUNCEMENT_CONFIG,
  HEADER_ICONS,
} from "@/components/layout/header/headerConfig";

import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types/database";

interface AnnouncementBarProps {
  user: User | null;
  role: UserRole | null | undefined;
  isAdminRole: (role: UserRole | null | undefined) => boolean;
}

export function AnnouncementBar({
  user,
  role,
  isAdminRole,
}: AnnouncementBarProps) {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setIsLangMenuOpen(false);
      }
      if (
        currencyMenuRef.current &&
        !currencyMenuRef.current.contains(event.target as Node)
      ) {
        setIsCurrencyMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ValueIcon = ANNOUNCEMENT_CONFIG.valueIcon || HEADER_ICONS.airfreight;
  const QcIcon = ANNOUNCEMENT_CONFIG.qcIcon || HEADER_ICONS.qcPass;
  const LangIcon = HEADER_ICONS.language;
  const CurrIcon = HEADER_ICONS.currency;
  const TrackIcon = HEADER_ICONS.trackSourcing;
  const SupportIcon = HEADER_ICONS.supportDesk;
  const ChevronDown = HEADER_ICONS.chevronDown;
  const Check = HEADER_ICONS.check;

  return (
    <div className="bg-[#00143D] text-slate-200 text-xs border-b border-blue-950/60">
      {/* ── Mobile Compact Value Prop Bar ── */}
      <div className="md:hidden flex items-center justify-between px-3 h-7 text-[10px] font-medium tracking-tight overflow-hidden">
        <div className="flex items-center gap-1.5 truncate text-amber-300 font-bold uppercase">
          <ValueIcon className="w-3 h-3 shrink-0" />
          <span className="truncate">{ANNOUNCEMENT_CONFIG.valueProp}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-300">
          <span className="hidden xs:inline">{ANNOUNCEMENT_CONFIG.couponText}:</span>
          <span className="inline xs:hidden">Use:</span>
          <span className="text-white bg-[#FF1028] px-1.5 py-0.5 rounded font-black text-[9px] shadow-[0_0_6px_rgba(255,16,40,0.4)]">
            {ANNOUNCEMENT_CONFIG.couponCode}
          </span>
        </div>
      </div>

      {/* ── Desktop Full Utility & Announcement Bar ── */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 items-center justify-between">
        {/* Left Ticker / Value Prop */}
        <div className="flex items-center gap-4 text-[11px] font-medium tracking-wide">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider">
            <ValueIcon className="w-3.5 h-3.5" />
            {ANNOUNCEMENT_CONFIG.valueProp}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">
            {ANNOUNCEMENT_CONFIG.couponText}{" "}
            <strong className="text-white bg-[#FF1028] px-1.5 py-0.5 rounded font-black animate-pulse shadow-[0_0_8px_rgba(255,16,40,0.5)]">
              {ANNOUNCEMENT_CONFIG.couponCode}
            </strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <QcIcon className="w-3.5 h-3.5" /> {ANNOUNCEMENT_CONFIG.qcText}
          </span>
        </div>

        {/* Right Global Selectors & Links */}
        <div className="flex items-center gap-4 text-[11px]">
          {/* Language Picker Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-white/10"
              aria-label="Select Language"
              aria-haspopup="true"
              aria-expanded={isLangMenuOpen}
            >
              <LangIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold">{selectedLang.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-1.5 w-36 bg-[#00143D] border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs text-white"
                  role="menu"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      role="menuitem"
                      onClick={() => {
                        setSelectedLang(lang);
                        setIsLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-900/60 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{lang.name}</span>
                      {selectedLang.code === lang.code && (
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Currency Picker Dropdown */}
          <div className="relative" ref={currencyMenuRef}>
            <button
              onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-white/10"
              aria-label="Select Currency"
              aria-haspopup="true"
              aria-expanded={isCurrencyMenuOpen}
            >
              <CurrIcon className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-bold">{selectedCurrency.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <AnimatePresence>
              {isCurrencyMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-1.5 w-60 bg-[#00143D] border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs text-white"
                  role="menu"
                >
                  {CURRENCIES.map((cur) => (
                    <button
                      key={cur.code}
                      role="menuitem"
                      onClick={() => {
                        setSelectedCurrency(cur);
                        setIsCurrencyMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-900/60 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold">{cur.code}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {cur.label}
                        </span>
                      </div>
                      {selectedCurrency.code === cur.code && (
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Track Sourcing Order */}
          <Link
            href="/account/orders"
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors py-1 cursor-pointer"
          >
            <TrackIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Track Sourcing</span>
          </Link>

          {/* Customer Support Desk */}
          <Link
            href="/account/support"
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors py-1 cursor-pointer"
          >
            <SupportIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>24/7 Sourcing Desk</span>
          </Link>

          {/* Admin Hub Direct Link if staff */}
          {user && isAdminRole(role) && (
            <Link
              href="/admin/dashboard"
              className="bg-gradient-to-r from-[#FF1028] to-[#E00B20] hover:from-[#E00B20] hover:to-[#CC0A1B] text-white px-2 py-0.5 rounded font-black text-[10px] transition-all duration-200 uppercase tracking-wider cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Admin Hub
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
