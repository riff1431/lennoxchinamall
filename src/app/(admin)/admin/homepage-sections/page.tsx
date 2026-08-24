"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  CheckCircle2,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Clock,
  RefreshCw,
  PlusCircle,
  LayoutGrid,
  Zap,
} from "lucide-react";
import { HomepageSection, SectionType, SectionLayout, SectionStatus, DeviceVisibility, HeroSlide } from "@/types/homepage";
import {
  getAdminHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  reorderHomepageSections,
  toggleSectionStatus,
} from "@/app/actions/admin-homepage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formType, setFormType] = useState<SectionType>("hero_banner");
  const [formLayout, setFormLayout] = useState<SectionLayout>("carousel");
  const [formStatus, setFormStatus] = useState<SectionStatus>("published");
  const [formVisibility, setFormVisibility] = useState<DeviceVisibility>("all");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  // Slide Builder Form State (for Hero Banner)
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewSection, setPreviewSection] = useState<HomepageSection | null>(null);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<HomepageSection | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadSections = useCallback(async () => {
    const res = await getAdminHomepageSections();
    if (res.success && res.sections) {
      setSections(res.sections.sort((a, b) => a.position - b.position));
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getAdminHomepageSections().then((res) => {
      if (!ignore && res.success && res.sections) {
        setSections(res.sections.sort((a, b) => a.position - b.position));
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  // Reordering Logic
  const handleMovePosition = async (id: string, direction: "up" | "down") => {
    const currentIndex = sections.findIndex((s) => s.id === id);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sections.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const updated = [...sections];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setSections(updated);
    const reorderedIds = updated.map((s) => s.id);
    const res = await reorderHomepageSections(reorderedIds);
    if (res.success) {
      showToast(`Moved "${movedItem.name}" to position #${targetIndex + 1}`);
      loadSections();
    }
  };

  // Toggle Active
  const handleToggleActive = async (id: string) => {
    const sec = sections.find((s) => s.id === id);
    if (!sec) return;
    const nextState = !sec.is_active;

    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: nextState } : s))
    );

    const res = await toggleSectionStatus(id, nextState);
    if (res.success) {
      showToast(res.message || `Section updated!`);
      loadSections();
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingSectionId(null);
    setFormName("");
    setFormSubtitle("");
    setFormType("hero_banner");
    setFormLayout("carousel");
    setFormStatus("published");
    setFormVisibility("all");
    setFormStartDate("");
    setFormEndDate("");
    setSlides([
      {
        id: "slide-1",
        badge: "DIRECT SHENZHEN FACTORY LAUNCH",
        title: "4K Laser Gimbal Aerial Drones",
        subtitle: "Triple GPS auto-return, 5km transmission range & brushless motors.",
        price: 189.0,
        original_price: 349.0,
        tag: "-46% OFF",
        desktop_image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1200&auto=format&fit=crop&q=80",
        mobile_image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80",
        link: "/products/eachine-ex5-4k-gps-fpv-drone",
        hub: "Shenzhen Drone Hub",
      },
    ]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (sec: HomepageSection) => {
    setEditingSectionId(sec.id);
    setFormName(sec.name);
    setFormSubtitle(sec.subtitle || "");
    setFormType(sec.type);
    setFormLayout(sec.layout);
    setFormStatus(sec.status);
    setFormVisibility(sec.visibility);
    setFormStartDate(sec.start_date ? sec.start_date.slice(0, 16) : "");
    setFormEndDate(sec.end_date ? sec.end_date.slice(0, 16) : "");
    setSlides(sec.config?.slides || []);
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);

    const payload: Partial<HomepageSection> = {
      name: formName.trim(),
      subtitle: formSubtitle.trim() || null,
      type: formType,
      layout: formLayout,
      status: formStatus,
      visibility: formVisibility,
      start_date: formStartDate ? new Date(formStartDate).toISOString() : null,
      end_date: formEndDate ? new Date(formEndDate).toISOString() : null,
      config: {
        slides: formType === "hero_banner" ? slides : undefined,
        deal_ends_at: formType === "flash_deals" ? futureDate.toISOString() : undefined,
      },
    };

    if (editingSectionId) {
      const res = await updateHomepageSection(editingSectionId, payload);
      if (res.success) {
        showToast(res.message || "Section updated!");
        setIsModalOpen(false);
        loadSections();
      }
    } else {
      const res = await createHomepageSection(payload);
      if (res.success) {
        showToast(res.message || "New homepage section published!");
        setIsModalOpen(false);
        loadSections();
      }
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (sectionToDelete) {
      const res = await deleteHomepageSection(sectionToDelete.id);
      if (res.success) {
        showToast(res.message || "Section removed.");
        loadSections();
      }
      setDeleteConfirmOpen(false);
      setSectionToDelete(null);
    }
  };

  // Slide builder helpers
  const handleAddSlide = () => {
    setSlides([
      ...slides,
      {
        id: `slide-${slides.length + 1}`,
        badge: "FACTORY SOURCING LAUNCH",
        title: "New Hardware Drop",
        subtitle: "Sourced directly with zero middleman markups in USDT.",
        price: 99.0,
        original_price: 179.0,
        tag: "-45% OFF",
        desktop_image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&auto=format&fit=crop&q=80",
        mobile_image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
        link: "/products",
        hub: "Shenzhen Hub",
      },
    ]);
  };

  const handleUpdateSlide = (index: number, field: keyof HeroSlide, val: string | number | undefined) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  // Open Preview Modal
  const handleOpenPreview = (sec: HomepageSection) => {
    setPreviewSection(sec);
    setPreviewViewport("desktop");
    setIsPreviewOpen(true);
  };

  // Stats calculation
  const heroSectionsCount = sections.filter((s) => s.type === "hero_banner").length;
  const activeLiveCount = sections.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Header Bar ── */}
      <AdminPageHeader
        title="Homepage &amp; Layout Studio"
        subtitle="Create, reorder, schedule, and preview dynamic storefront sections, responsive hero banners, and flash deals."
        badge={{ text: "STOREFRONT CMS", variant: "blue" }}
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Homepage Studio" }]}
        actions={[
          {
            label: "Refresh Layout",
            onClick: loadSections,
            icon: RefreshCw,
            variant: "secondary",
          },
          {
            label: "Add Homepage Section",
            onClick: handleOpenCreateModal,
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in border border-emerald-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm ml-3 cursor-pointer">×</button>
        </div>
      )}

      {/* ── 2. KPI Metrics Bar (NETIC Pastel Stat Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sections Flow */}
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Active Visual Flow
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {sections.length} Sections
            </span>
            <span className="text-[11px] font-bold text-[#2F65F6] block mt-0.5">
              Rendered top-to-bottom
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <LayoutGrid className="w-5 h-5" />
          </div>
        </div>

        {/* Live Published */}
        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Live Published
            </span>
            <span className="text-xl font-black text-[#16A34A] dark:text-emerald-400 font-mono mt-0.5 block">
              {activeLiveCount} Live
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Instant storefront sync
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Responsive Screens */}
        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Device Support
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              100% Adaptive
            </span>
            <span className="text-[11px] font-bold text-amber-600 block mt-0.5">
              Mobile, Tablet &amp; Desktop
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Monitor className="w-5 h-5" />
          </div>
        </div>

        {/* Hero Drop Carousels */}
        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Hero Carousels
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {heroSectionsCount} Active
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              High-converting hero drops
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Sections Overview Cards & Reordering Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Active Storefront Visual Flow ({sections.length} Sections)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The storefront renders these sections from top to bottom in the exact order shown below.
            </p>
          </div>

          <span className="text-xs text-[#16A34A] dark:text-emerald-400 font-bold font-mono bg-[#F0FDF4] dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-[#BBF7D0] dark:border-emerald-900/40 w-fit">
            ✓ Live Auto-Sync Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold text-center w-16">Seq #</th>
                <th className="py-3 px-4 font-bold">Section Details</th>
                <th className="py-3 px-4 font-bold">Type &amp; Layout</th>
                <th className="py-3 px-4 font-bold">Device Visibility</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-center">Move Order</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {sections.map((sec, idx) => (
                <tr key={sec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Sequence Position */}
                  <td className="py-4 px-4 text-center">
                    <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 font-mono font-bold text-[#2F65F6] inline-flex items-center justify-center">
                      {sec.position}
                    </span>
                  </td>

                  {/* Section Details */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">
                        {sec.name}
                      </span>
                      {sec.subtitle && (
                        <span className="text-[11px] text-slate-400 block line-clamp-1">
                          {sec.subtitle}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Type & Layout */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-[#EEF4FF] dark:bg-blue-950/60 text-[#2F65F6] border border-blue-200 dark:border-blue-900/40 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">
                        {sec.type.replace(/_/g, " ")}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-mono">
                        {sec.layout}
                      </span>
                    </div>
                  </td>

                  {/* Device Visibility */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      {sec.visibility === "mobile_only" ? (
                        <>
                          <Smartphone className="w-3.5 h-3.5 text-purple-500" />
                          <span>Mobile Only</span>
                        </>
                      ) : sec.visibility === "desktop_only" ? (
                        <>
                          <Monitor className="w-3.5 h-3.5 text-[#2F65F6]" />
                          <span>Desktop Only</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>All Screens</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Active Toggle & Status */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleActive(sec.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer border ${
                        sec.is_active
                          ? "bg-[#F0FDF4] dark:bg-emerald-950/60 text-[#16A34A] border-[#BBF7D0] dark:border-emerald-900/40 hover:bg-emerald-100"
                          : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-200 dark:border-rose-900/40 hover:bg-rose-100"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sec.is_active ? "bg-[#16A34A]" : "bg-rose-600"}`} />
                      <span>{sec.is_active ? "Live" : "Disabled"}</span>
                    </button>
                  </td>

                  {/* Move Up/Down Sequence Controls */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleMovePosition(sec.id, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMovePosition(sec.id, "down")}
                        disabled={idx === sections.length - 1}
                        title="Move Down"
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenPreview(sec)}
                        title="Preview on Devices"
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[#2F65F6] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(sec)}
                        title="Edit Section Config"
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSectionToDelete(sec);
                          setDeleteConfirmOpen(true);
                        }}
                        title="Delete Section"
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Visual Section Edit/Create Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSectionId ? "Edit Homepage Section" : "Publish New Homepage Section"}
        size="lg"
      >
        <form onSubmit={handleSaveForm} className="space-y-5 text-xs text-slate-800 dark:text-slate-200 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Section Header Name *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Direct Shenzhen Factory Launch"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Subtitle / Tagline</label>
              <input
                type="text"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                placeholder="e.g. Sourced directly with zero middleman markups"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2F65F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Section Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as SectionType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="hero_banner">Hero Banner Carousel</option>
                <option value="flash_deals">Flash Sourcing Deals</option>
                <option value="category_grid">Category Showcase</option>
                <option value="featured_products">Featured Hardware Grid</option>
                <option value="trust_badges">Trust &amp; Escrow Badges</option>
                <option value="promo_blocks">Promotional Banner Strip</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Layout Format</label>
              <select
                value={formLayout}
                onChange={(e) => setFormLayout(e.target.value as SectionLayout)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="carousel">Interactive Carousel</option>
                <option value="grid">Responsive Grid</option>
                <option value="banner_strip">Full-Width Banner Strip</option>
                <option value="cards">Feature Cards</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Device Visibility</label>
              <select
                value={formVisibility}
                onChange={(e) => setFormVisibility(e.target.value as DeviceVisibility)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:border-[#2F65F6] cursor-pointer"
              >
                <option value="all">All Screens &amp; Devices</option>
                <option value="desktop_only">Desktop Only</option>
                <option value="mobile_only">Mobile Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Schedule (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-[#2F65F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>End Schedule (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-[#2F65F6]"
              />
            </div>
          </div>

          {/* ── Slide Builder for Hero Banner ── */}
          {formType === "hero_banner" && (
            <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Responsive Hero Carousel Slides ({slides.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Add Slide</span>
                </button>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {slides.map((slide, sIdx) => (
                  <div
                    key={slide.id || sIdx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                        Slide #{sIdx + 1}
                      </span>
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlide(sIdx)}
                          className="text-rose-600 hover:text-rose-700 font-bold text-xs cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Badge Text</label>
                        <input
                          type="text"
                          value={slide.badge}
                          onChange={(e) => handleUpdateSlide(sIdx, "badge", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Product Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleUpdateSlide(sIdx, "title", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Desktop Image (1200px)</label>
                        <input
                          type="url"
                          value={slide.desktop_image}
                          onChange={(e) => handleUpdateSlide(sIdx, "desktop_image", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-[11px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Mobile Image (600px)</label>
                        <input
                          type="url"
                          value={slide.mobile_image || ""}
                          onChange={(e) => handleUpdateSlide(sIdx, "mobile_image", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Price (USDT)</label>
                        <input
                          type="number"
                          value={slide.price}
                          onChange={(e) => handleUpdateSlide(sIdx, "price", Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Compare Price</label>
                        <input
                          type="number"
                          value={slide.original_price}
                          onChange={(e) => handleUpdateSlide(sIdx, "original_price", Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">CTA Link</label>
                        <input
                          type="text"
                          value={slide.link}
                          onChange={(e) => handleUpdateSlide(sIdx, "link", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2F65F6] hover:bg-[#2563EB] text-white font-bold text-xs shadow-blue-500/25 shadow-xs transition-colors cursor-pointer"
            >
              Save Section Configuration
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Interactive Multi-Device Preview Modal ── */}
      {isPreviewOpen && previewSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-5xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#2F65F6]" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Device Viewport Preview: {previewSection.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Test responsive aspect ratios and typography before publishing live.
                  </span>
                </div>
              </div>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setPreviewViewport("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    previewViewport === "desktop" ? "bg-[#2F65F6] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewViewport("tablet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    previewViewport === "tablet" ? "bg-[#2F65F6] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  onClick={() => setPreviewViewport("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    previewViewport === "mobile" ? "bg-[#2F65F6] text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl flex justify-center items-start">
              <div
                className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-300 p-4 shadow-sm ${
                  previewViewport === "desktop"
                    ? "w-full max-w-4xl"
                    : previewViewport === "tablet"
                    ? "w-[768px]"
                    : "w-[375px] border-4 border-slate-300 dark:border-slate-700 rounded-3xl"
                }`}
              >
                {/* Simulated Section Content */}
                {previewSection.type === "hero_banner" && previewSection.config?.slides?.[0] && (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 p-6 space-y-3 min-h-[260px] flex flex-col justify-end">
                    <Image
                      src={
                        previewViewport === "mobile" && previewSection.config.slides[0].mobile_image
                          ? previewSection.config.slides[0].mobile_image
                          : previewSection.config.slides[0].desktop_image
                      }
                      alt="Hero Preview"
                      fill
                      className="object-cover opacity-40"
                    />
                    <div className="relative z-10 space-y-2">
                      <span className="bg-[#2F65F6] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {previewSection.config.slides[0].badge}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {previewSection.config.slides[0].title}
                      </h2>
                      <p className="text-xs text-slate-300 line-clamp-2 font-normal">
                        {previewSection.config.slides[0].subtitle}
                      </p>
                      <div className="flex items-center gap-3 pt-2">
                        <span className="text-lg font-bold text-[#16A34A] font-mono">
                          ${previewSection.config.slides[0].price} USDT
                        </span>
                        <span className="bg-white text-slate-950 px-3 py-1 rounded-lg text-xs font-bold">
                          Sourcing Portal →
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {previewSection.type !== "hero_banner" && (
                  <div className="p-8 text-center space-y-3">
                    <span className="bg-blue-50 dark:bg-blue-950/60 text-[#2F65F6] text-xs font-mono px-3 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-900/40">
                      {previewSection.type} ({previewSection.layout})
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{previewSection.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{previewSection.subtitle}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Confirm Delete Modal ── */}
      {deleteConfirmOpen && sectionToDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Homepage Section?"
          description={`Are you sure you want to remove "${sectionToDelete.name}"? It will immediately stop rendering on the storefront.`}
          confirmLabel="Delete Section"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
}
