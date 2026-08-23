"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Plus,
  Lock,
  ExternalLink,
  ShieldCheck,
  Building,
  Phone,
  Clock,
  Search,
  Check,
} from "lucide-react";
import { MOCK_SUPPLIERS } from "@/lib/mockData";
import { Modal } from "@/components/ui/Modal";
import { Supplier } from "@/types/database";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState(`SUP-SZ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [platform, setPlatform] = useState("1688 / Factory Direct");
  const [sourceUrl, setSourceUrl] = useState("https://1688.com");
  const [region, setRegion] = useState("Shenzhen, Guangdong");
  const [leadTime, setLeadTime] = useState(2);
  const [notes, setNotes] = useState("");

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      (s.region && s.region.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      code: code.trim(),
      name: name.trim(),
      contact: contact.trim(),
      platform: platform.trim(),
      source_url: sourceUrl.trim(),
      region: region.trim(),
      lead_time_days: leadTime,
      reliability_notes: notes.trim() || "Grade A manufacturer.",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSuppliers([newSup, ...suppliers]);
    setIsModalOpen(false);
    setToastMsg(`Supplier ${code} (${name}) registered!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-montserrat">
      {/* ── 1. Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              LENNOX SOURCING DIRECTORY
            </span>
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private Sourcing Protection (PRD §6.3)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Truck className="w-7 h-7 text-[#FF1028]" />
            <span>Private Factory Supplier Directory</span>
          </h1>
          <p className="text-xs text-slate-400">
            Confidential repository linking secret product codes to authenticated Chinese factories across Shenzhen, Ningbo & Guangzhou.
          </p>
        </div>

        <button
          onClick={() => {
            setCode(`SUP-SZ-${Math.floor(1000 + Math.random() * 9000)}`);
            setName("");
            setContact("");
            setNotes("");
            setIsModalOpen(true);
          }}
          className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Factory Supplier</span>
        </button>
      </div>

      {toastMsg && (
        <div className="bg-[#10B981] text-slate-950 px-4 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center justify-between animate-in fade-in">
          <span>✓ {toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. Search Filter Bar ── */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Secret Code, Factory Name, or Region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
          />
        </div>

        <span className="text-xs text-slate-400 font-bold hidden sm:inline">
          {filteredSuppliers.length} Verified Chinese Factories
        </span>
      </div>

      {/* ── 3. Responsive Supplier Card Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs inline-flex items-center gap-1.5 shadow-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{sup.code}</span>
                </span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Verified Grade A
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-black text-white leading-snug group-hover:text-[#FF1028] transition-colors">
                {sup.name}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{sup.region}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{sup.contact}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Lead Time: {sup.lead_time_days} days to Shenzhen Hub</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                {sup.reliability_notes}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-semibold">{sup.platform}</span>
              <a
                href={sup.source_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#00143D] hover:bg-[#FF1028] text-white px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1"
              >
                <span>Direct B2B Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. Add Supplier Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Verified China Factory Supplier"
        size="md"
      >
        <form onSubmit={handleAddSupplier} className="p-6 space-y-4 font-montserrat text-xs text-slate-800">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Internal Sourcing Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-amber-700 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Lead Time (Days)</label>
              <input
                type="number"
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Factory Corporate Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Shenzhen Creality 3D Technology Co., Ltd."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Manufacturing Region / Province</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Supplier Contact / WeChat / WhatsApp</label>
            <input
              type="text"
              placeholder="e.g. Ms. Wang (WeChat: sz_drone_hub)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Direct 1688 / Taobao / B2B Link</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">QA Notes & Reliability Record</label>
            <textarea
              rows={3}
              placeholder="Factory certification, QC failure rate, packaging specs..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl font-black transition-colors"
            >
              Save Factory Supplier
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
