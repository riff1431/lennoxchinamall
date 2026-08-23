"use client";

import React, { useState } from "react";
import { RotateCcw, Plus, ShieldCheck, CheckCircle2, AlertCircle, Upload, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function ReturnsPage() {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("LCM-20260823-7492");
  const [reason, setReason] = useState("Damaged in transit");
  const [description, setDescription] = useState("");

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimSuccess(true);
    setTimeout(() => {
      setClaimSuccess(false);
      setIsClaimModalOpen(false);
      setDescription("");
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00143D] flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-[#FF1028]" />
            <span>Returns & USDT Refund Claims</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Submit return claims, upload factory defect evidence, and track automatic USDT refund credits.
          </p>
        </div>

        <button
          onClick={() => setIsClaimModalOpen(true)}
          className="bg-[#00143D] hover:bg-[#FF1028] text-white px-4 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>File Return Claim</span>
        </button>
      </div>

      {/* Guarantee Notice */}
      <div className="p-5 bg-red-50/50 rounded-2xl border border-red-200 text-xs text-red-950 space-y-1.5">
        <span className="font-black text-[#FF1028] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> 30-Day Single-Vendor Guarantee & Direct USDT Refund
        </span>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          If your hardware arrives with manufacturing defects or transit damage, submit photos or videos. Our QA team in Shenzhen inspects the claim and releases a direct USDT refund or replacement within 24 hours.
        </p>
      </div>

      {/* Returns List / Status */}
      <div className="text-center py-12 text-xs text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
        <CheckCircle2 className="w-8 h-8 mx-auto text-[#10B981]" />
        <p className="font-bold text-slate-800 text-sm">No active return requests</p>
        <p className="text-[11px] text-slate-500">All your delivered orders are in good standing.</p>
      </div>

      {/* Return Claim Modal */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="File 30-Day Return & USDT Refund Claim"
        size="md"
      >
        <form onSubmit={handleSubmitClaim} className="p-4 sm:p-6 space-y-4 font-montserrat text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Order Number *</label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Reason for Return *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:border-[#00143D]"
            >
              <option value="Damaged in transit">Damaged in air cargo transit</option>
              <option value="Factory hardware defect">Factory hardware / electrical defect</option>
              <option value="Missing parts">Missing accessories or parts</option>
              <option value="Wrong item received">Incorrect variant received</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Describe the Issue in Detail *</label>
            <textarea
              rows={4}
              required
              placeholder="Explain the defect or damage observed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 text-center space-y-1 bg-slate-50 cursor-pointer hover:bg-slate-100">
            <Upload className="w-6 h-6 mx-auto text-slate-400" />
            <span className="font-bold text-slate-700 block">Upload Photo / Video Proof</span>
            <span className="text-[10px] text-slate-400 block">JPG, PNG, MP4 up to 50MB</span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl font-black text-xs transition-colors"
            >
              Submit Refund Claim
            </button>
            <button
              type="button"
              onClick={() => setIsClaimModalOpen(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs transition-colors"
            >
              Cancel
            </button>
          </div>

          {claimSuccess && (
            <div className="bg-[#10B981] text-white p-3 rounded-xl text-center font-bold animate-in fade-in">
              ✓ Claim submitted! Our Shenzhen QA inspector will review within 24 hours.
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
