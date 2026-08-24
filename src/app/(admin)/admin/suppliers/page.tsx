"use client";

import React, { useState, useEffect } from "react";
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
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Supplier, SourcingPurchase } from "@/types/database";
import { getSuppliers, createSupplier, createSourcingPurchase } from "@/app/actions/admin-suppliers";
import { formatDate, formatCurrency } from "@/utils/helpers";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sourcingPurchases, setSourcingPurchases] = useState<SourcingPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const loadData = async () => {
    setIsLoading(true);
    const res = await getSuppliers();
    if (res.success) {
      setSuppliers(res.suppliers);
      setSourcingPurchases(res.sourcingPurchases);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      (s.region && s.region.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formData = new FormData();
    formData.set("code", code);
    formData.set("name", name);
    formData.set("contact", contact);
    formData.set("platform", platform);
    formData.set("source_url", sourceUrl);
    formData.set("region", region);
    formData.set("lead_time_days", String(leadTime));
    formData.set("reliability_notes", notes);
    formData.set("status", "active");

    const res = await createSupplier(formData);
    if (res.success) {
      setToastMsg(res.message || "Supplier registered!");
      setIsModalOpen(false);
      loadData();
    } else {
      setToastMsg(res.error || "Failed to register supplier");
    }
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── 1. Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-heading">
              LENNOX SOURCING DIRECTORY
            </span>
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private Sourcing Protection Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 font-heading">
            <Truck className="w-7 h-7 text-[#FF1028]" />
            <span>Private Factory Supplier Directory</span>
          </h1>
          <p className="text-xs text-slate-400">
            Confidential repository linking secret product codes to authenticated Chinese factories across Shenzhen, Ningbo &amp; Guangzhou.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              setCode(`SUP-SZ-${Math.floor(1000 + Math.random() * 9000)}`);
              setName("");
              setContact("");
              setNotes("");
              setIsModalOpen(true);
            }}
            className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2 rounded-xl text-xs font-black font-heading transition-colors flex items-center gap-1.5 shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register Factory Partner</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="bg-[#10B981] text-slate-950 px-4 py-3 rounded-xl text-xs font-black flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. Confidentiality Alert Banner ── */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-amber-200">
          <span className="font-bold block font-heading">
            Strict Confidentiality: Sourcing Links &amp; Wholesale Factory Names are Internal Only
          </span>
          <p className="text-[11px] text-amber-300/80 leading-relaxed">
            Supplier URLs, Chinese business contacts, and acquisition pricing are stripped from all public API endpoints and database views.
          </p>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar ── */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, secret code, or industrial city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF1028]"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono font-bold">
          {filteredSuppliers.length} Verified Factory Partners
        </span>
      </div>

      {/* ── 4. Suppliers Directory Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-xs relative"
          >
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <span className="bg-slate-950 border border-slate-800 text-amber-400 font-mono text-[11px] font-bold px-2 py-0.5 rounded inline-block">
                  {supplier.code}
                </span>
                <h3 className="font-heading font-black text-white text-base">
                  {supplier.name}
                </h3>
              </div>
              <span className="bg-emerald-500/10 text-[#10B981] text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/20">
                {supplier.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-slate-400">
                <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{supplier.region || "Guangdong, China"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{supplier.contact || "Direct Shenzhen Desk"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Avg. Factory Lead Time: {supplier.lead_time_days || 3} days</span>
              </div>
            </div>

            {supplier.reliability_notes && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300 block mb-0.5">QC &amp; Audit Notes:</span>
                <p>{supplier.reliability_notes}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
              <span className="text-[10px] text-slate-500 font-mono">
                Platform: {supplier.platform || "1688"}
              </span>
              {supplier.source_url && (
                <a
                  href={supplier.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#FF1028] hover:text-white flex items-center gap-1 font-bold transition-colors font-heading text-[11px]"
                >
                  <span>1688 Lot Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── 5. Register Supplier Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#FF1028]" />
                <h3 className="font-heading font-black text-white text-base">
                  Register Private Factory Supplier
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Secret Sourcing Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-[#FF1028]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Industrial City / Hub *</label>
                  <input
                    type="text"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Shenzhen, Ningbo, Dongguan..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#FF1028]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Factory Entity Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shenzhen SkyRover Drone Precision Tech Co."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#FF1028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Lead Platform</label>
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="1688 / Taobao / Factory PO"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#FF1028]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Lead Time (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={leadTime}
                    onChange={(e) => setLeadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#FF1028]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Chinese Factory Contact</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Manager name, WeChat ID, phone number"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#FF1028]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Direct Sourcing / PO URL</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://detail.1688.com/offer/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#FF1028]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Factory Reliability &amp; QC Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Quality grade, defect rate (< 0.2%), packaging standard..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#FF1028]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-2.5 rounded-xl font-black font-heading text-xs transition-colors cursor-pointer shadow-md"
                >
                  Save Factory to Confidential Directory
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
