"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Clock,
  Coins,
  Package,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/utils/helpers";

interface ReturnClaim {
  id: string;
  claimNumber: string;
  orderNumber: string;
  itemTitle: string;
  amount: number;
  reason: string;
  status: "submitted" | "inspecting" | "approved" | "refunded";
  createdAt: string;
}

export default function ReturnsPage() {
  const [claims, setClaims] = useState<ReturnClaim[]>([
    {
      id: "ret-1",
      claimNumber: "RET-20260822-9901",
      orderNumber: "LCM-20260822-77BC",
      itemTitle: "Creality K1 Max High-Speed 3D Printer (Nozzle defect)",
      amount: 349.0,
      reason: "Factory defect on direct-drive extruder nozzle",
      status: "approved",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("LCM-20260823-88AF");
  const [itemTitle, setItemTitle] = useState("Eachine EX5 4K GPS FPV Drone");
  const [refundAmount, setRefundAmount] = useState(189.0);
  const [reason, setReason] = useState("Transit damage / broken propeller");
  const [description, setDescription] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newClaim: ReturnClaim = {
      id: `ret-${Date.now()}`,
      claimNumber: `RET-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber: orderNumber.trim(),
      itemTitle: itemTitle.trim(),
      amount: refundAmount,
      reason: reason,
      status: "submitted",
      createdAt: new Date().toISOString(),
    };

    setClaims([newClaim, ...claims]);
    setIsClaimModalOpen(false);
    setDescription("");
    setToastMsg(`Return Claim #${newClaim.claimNumber} registered for QA inspection!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const getStatusBadge = (status: ReturnClaim["status"]) => {
    switch (status) {
      case "submitted":
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 font-heading">
            <Clock className="w-3 h-3 text-amber-600" /> Sourcing QA Review
          </span>
        );
      case "inspecting":
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 font-heading">
            <Clock className="w-3 h-3 text-blue-600" /> Under Inspection
          </span>
        );
      case "approved":
        return (
          <span className="bg-emerald-100 text-[#10B981] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 font-heading">
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Approved for USDT Refund
          </span>
        );
      case "refunded":
        return (
          <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 font-heading">
            <Coins className="w-3 h-3 text-[#10B981]" /> USDT Settled
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D] flex items-center gap-2 font-heading">
            <RotateCcw className="w-6 h-6 text-[#FF1028]" />
            <span>Returns & USDT Refund Claims</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Submit return claims, upload factory defect evidence, and track direct Binance Pay USDT refund credits.
          </p>
        </div>

        <button
          onClick={() => setIsClaimModalOpen(true)}
          className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2.5 rounded-xl text-xs font-black font-heading transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>File Return Claim</span>
        </button>
      </div>

      {toastMsg && (
        <div className="bg-[#10B981] text-slate-950 px-4 py-3 rounded-2xl text-xs font-black shadow-md flex items-center justify-between animate-in fade-in">
          <span>✓ {toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* Guarantee Notice */}
      <div className="p-5 bg-red-50/60 rounded-2xl border border-red-200 text-xs text-red-950 space-y-1.5">
        <span className="font-black text-[#FF1028] flex items-center gap-1.5 font-heading">
          <ShieldCheck className="w-4 h-4" /> 30-Day Single-Vendor Guarantee & Direct USDT Refund
        </span>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          If your hardware arrives with manufacturing defects or transit damage, submit photos or videos. Our QA team in Shenzhen inspects the claim and releases a direct USDT refund or replacement within 24 hours.
        </p>
      </div>

      {/* Active Claims List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-black text-slate-900 uppercase tracking-wider">
            Your Sourcing Claim Records ({claims.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Auto-synced with Binance Escrow</span>
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 mx-auto text-[#10B981]" />
            <p className="font-bold text-slate-800 text-sm font-heading">No active return requests</p>
            <p className="text-[11px] text-slate-500">All your delivered orders are in good standing.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold text-slate-500 block">
                      Claim #{claim.claimNumber} • Order #{claim.orderNumber}
                    </span>
                    <h4 className="font-heading text-sm font-black text-slate-900">
                      {claim.itemTitle}
                    </h4>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-200/80">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 text-[11px]">Claim Reason:</span>
                    <span className="font-semibold text-slate-800 block">{claim.reason}</span>
                  </div>

                  <div className="space-y-0.5 text-right">
                    <span className="text-slate-500 text-[11px]">USDT Refund Credit:</span>
                    <span className="font-black text-[#FF1028] text-sm price-tag block">
                      {formatCurrency(claim.amount)} USDT
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Filed on {formatDate(claim.createdAt)}</span>
                  <Link
                    href="/account/support"
                    className="text-[#00143D] hover:text-[#FF1028] font-bold flex items-center gap-1"
                  >
                    <span>Contact Assigned Sourcing Officer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Claim Modal */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="Submit 30-Day Return & Warranty Claim"
        size="md"
      >
        <form onSubmit={handleSubmitClaim} className="p-4 sm:p-6 space-y-4 text-xs font-sans text-slate-800">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Order Number *</label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Hardware Item *</label>
            <input
              type="text"
              required
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Return Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
            >
              <option value="Damaged in transit">Damaged in transit / broken casing</option>
              <option value="Factory defect">Factory defect / won't power on</option>
              <option value="Incorrect variant">Incorrect variant received</option>
              <option value="Missing accessory">Missing hardware accessory / cables</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Explain the Defect (QA Team Review) *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe the issue with photos/videos so our Shenzhen QA team can inspect and approve the claim..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-1 cursor-pointer hover:border-slate-400">
            <Upload className="w-6 h-6 mx-auto text-slate-400" />
            <span className="font-bold text-slate-700 block">Attach Defect Evidence (Photos / MP4)</span>
            <span className="text-[10px] text-slate-500">Max 100MB direct upload</span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl font-black font-heading transition-colors shadow-md"
            >
              Submit Return Claim
            </button>
            <button
              type="button"
              onClick={() => setIsClaimModalOpen(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold font-heading"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
