"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Lock,
  ExternalLink,
  ShieldCheck,
  Building,
  Phone,
  Clock,
  Search,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Modal } from "@/components/ui/Modal";
import { Supplier, SourcingPurchase } from "@/types/database";
import { getSuppliers, createSupplier } from "@/app/actions/admin-suppliers";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [, setSourcingPurchases] = useState<SourcingPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState("SUP-SZ-8021");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [platform, setPlatform] = useState("1688 / Factory Direct");
  const [sourceUrl, setSourceUrl] = useState("https://1688.com");
  const [region, setRegion] = useState("Shenzhen, Guangdong");
  const [leadTime, setLeadTime] = useState(2);
  const [notes, setNotes] = useState("");

  const loadData = () => {
    setIsLoading(true);
    getSuppliers()
      .then((res) => {
        if (res.success) {
          setSuppliers(res.suppliers);
          setSourcingPurchases(res.sourcingPurchases);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    getSuppliers().then((res) => {
      if (!isMounted) return;
      if (res.success) {
        setSuppliers(res.suppliers);
        setSourcingPurchases(res.sourcingPurchases);
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Top Header Bar ── */}
      <AdminPageHeader
        title="Private Factory Supplier Directory"
        subtitle="Confidential repository linking secret product codes to authenticated Chinese factories across Shenzhen, Ningbo &amp; Guangzhou."
        badge={{ text: "Private Sourcing Protection Active", variant: "blue" }}
        breadcrumbs={[
          { label: "Sourcing", href: "/admin/sourcing" },
          { label: "Supplier Directory" },
        ]}
        actions={[
          {
            label: "Register Factory Partner",
            icon: Plus,
            variant: "primary",
            onClick: () => {
              setCode(`SUP-SZ-${Math.floor(1000 + Math.random() * 9000)}`);
              setName("");
              setContact("");
              setNotes("");
              setIsModalOpen(true);
            },
          },
        ]}
      />

      {/* Toast */}
      {toastMsg && (
        <div className="bg-[#DCFCE7] dark:bg-emerald-950 border border-[#BBF7D0] dark:border-emerald-800 text-[#16A34A] dark:text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm cursor-pointer">×</button>
        </div>
      )}

      {/* ── 2. Confidentiality Alert Banner ── */}
      <div className="p-4 rounded-2xl bg-[#FFF8EE] dark:bg-amber-950/30 border border-[#FED7AA]/60 dark:border-amber-900/30 flex items-start gap-3 shadow-xs">
        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-amber-900 dark:text-amber-200">
          <span className="font-bold block">
            Strict Confidentiality: Sourcing Links &amp; Wholesale Factory Names are Internal Only
          </span>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
            Supplier URLs, Chinese business contacts, and acquisition pricing are stripped from all public API endpoints and database views.
          </p>
        </div>
      </div>

      {/* ── 3. Top 3 KPI Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Verified Factory Partners
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {suppliers.length} Factories
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Shenzhen, Ningbo, Dongguan</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Sourcing Reliability
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              99.4%
            </span>
            <span className="text-[11px] text-[#16A34A] block mt-0.5">Direct China QC inspection passed</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Avg. Factory Lead Time
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              2.4 Days
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">To Shenzhen Sort Hub</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 4. Search & Filter Bar ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, secret code, or industrial city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2F65F6] transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#2F65F6]" : ""}`} />
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
            {filteredSuppliers.length} Verified Partners
          </span>
        </div>
      </div>

      {/* ── 5. Suppliers Directory Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-xs relative"
          >
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="bg-[#FFF8EE] dark:bg-amber-950/60 border border-[#FED7AA]/60 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full inline-block">
                  {supplier.code}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {supplier.name}
                </h3>
              </div>
              <span className="bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-[#BBF7D0]/60">
                {supplier.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{supplier.region || "Guangdong, China"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{supplier.contact || "Direct Shenzhen Desk"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Avg. Factory Lead Time: {supplier.lead_time_days || 3} days</span>
              </div>
            </div>

            {supplier.reliability_notes && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">QC &amp; Audit Notes:</span>
                <p>{supplier.reliability_notes}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                Platform: {supplier.platform || "1688"}
              </span>
              {supplier.source_url && (
                <a
                  href={supplier.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2F65F6] hover:text-[#2563EB] flex items-center gap-1 font-bold transition-colors text-[11px]"
                >
                  <span>1688 Lot Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── 6. Register Supplier Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Private Factory Supplier"
        size="lg"
      >
        <form onSubmit={handleAddSupplier} className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Secret Sourcing Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Industrial City / Hub *</label>
              <input
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Shenzhen, Ningbo, Dongguan..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Factory Entity Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shenzhen SkyRover Drone Precision Tech Co."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Lead Platform</label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="1688 / Taobao / Factory PO"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Lead Time (Days)</label>
              <input
                type="number"
                min={1}
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Chinese Factory Contact</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Manager name, WeChat ID, phone number"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Direct Sourcing / PO URL</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://detail.1688.com/offer/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Factory Reliability &amp; QC Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Quality grade, defect rate (< 0.2%), packaging standard..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] transition-colors cursor-pointer shadow-blue-500/25 shadow-xs"
            >
              Save Factory to Directory
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
