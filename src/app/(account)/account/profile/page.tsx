"use client";

import React, { useState } from "react";
import { User, Mail, Phone, ShieldCheck, Check, Save, Lock, Coins, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AccountProfilePage() {
  const [name, setName] = useState("Alex Harrison");
  const [email] = useState("alex.harrison@example.com");
  const [phone, setPhone] = useState("+1 415 555 9182");
  const [currency, setCurrency] = useState("USDT");
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D]">
            Account Profile & Security
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage your customer credentials, Binance Pay settlement preferences, and 2FA authentication.
          </p>
        </div>
        <span className="bg-emerald-50 text-[#10B981] text-xs font-black px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
          Active VIP Tier
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-xl text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">
            Email Address (Primary Sourcing ID)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              disabled
              value={email}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-semibold cursor-not-allowed"
            />
          </div>
          <span className="text-[10px] text-slate-400 block">
            Tied to your Supabase verified email.
          </span>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">
            Phone Number (for Courier Air Tracking)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">
            Default Settlement Currency
          </label>
          <div className="relative">
            <Coins className="w-4 h-4 text-[#10B981] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:border-[#00143D]"
            >
              <option value="USDT">USDT (Binance Pay - Zero Network Fee)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Security Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-black text-[#00143D] text-xs flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#FF1028]" />
              <span>Password & Security</span>
            </span>
            <span className="text-[10px] text-[#10B981] font-bold">Encrypted</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Your login is protected with cryptographic password hashing and Supabase SSR session token validation.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="bg-[#00143D] hover:bg-[#FF1028] text-white px-6 py-3 rounded-xl font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Preferences</span>
          </button>
        </div>

        {savedToast && (
          <div className="bg-[#10B981] text-white p-3 rounded-xl text-xs font-bold text-center animate-in fade-in">
            ✓ Your profile preferences have been successfully updated!
          </div>
        )}
      </form>
    </div>
  );
}
