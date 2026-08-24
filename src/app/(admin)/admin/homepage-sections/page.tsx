"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  Eye,
  Video,
  Grid,
  CreditCard,
  Flame,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  PlusCircle,
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
  const [isLoading, setIsLoading] = useState(true);
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

  const loadSections = async () => {
    setIsLoading(true);
    const res = await getAdminHomepageSections();
    if (res.success && res.sections) {
      setSections(res.sections.sort((a, b) => a.position - b.position));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSections();
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
        deal_ends_at: formType === "flash_deals" ? new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() : undefined,
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
        id: `slide-${Date.now()}`,
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

  const handleUpdateSlide = (index: number, field: keyof HeroSlide, val: any) => {
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 font-sans text-slate-100">
      {/* ── 1. Header Bar ── */}
      <AdminPageHeader
        title="Homepage & Layout Management Studio"
        subtitle="Create, reorder, schedule, and preview dynamic storefront sections, responsive hero banners, and flash deals."
        badge={{ text: "STOREFRONT CMS", variant: "red" }}
        breadcrumbs={[{ label: "Homepage Studio" }]}
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
        <div className="bg-[#10B981] text-slate-950 px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. Sections Overview Cards & Reordering Table ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-black text-white font-heading">
              Active Storefront Visual Flow ({sections.length} Sections)
            </h2>
            <p className="text-xs text-slate-400">
              The storefront renders these sections from top to bottom in the exact order shown below.
            </p>
          </div>

          <span className="text-xs text-[#10B981] font-bold font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ✓ Live Auto-Sync Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sections.map((sec, idx) => (
                <tr key={sec.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Sequence Position */}
                  <td className="py-4 px-4 text-center">
                    <span className="w-7 h-7 rounded-xl bg-slate-950 border border-slate-800 font-mono font-black text-[#FF1028] inline-flex items-center justify-center">
                      {sec.position}
                    </span>
                  </td>

                  {/* Section Details */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white text-sm block font-heading">
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
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        {sec.type.replace(/_/g, " ")}
                      </span>
                      <span className="bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">
                        {sec.layout}
                      </span>
                    </div>
                  </td>

                  {/* Device Visibility */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 font-semibold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {sec.visibility === "mobile_only" ? (
                        <>
                          <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                          <span>Mobile Only</span>
                        </>
                      ) : sec.visibility === "desktop_only" ? (
                        <>
                          <Monitor className="w-3.5 h-3.5 text-blue-400" />
                          <span>Desktop Only</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                          <span>All Screens</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Active Toggle & Status */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleActive(sec.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-colors cursor-pointer border ${
                        sec.is_active
                          ? "bg-emerald-500/10 text-[#10B981] border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sec.is_active ? "bg-[#10B981]" : "bg-red-400"}`} />
                      <span>{sec.is_active ? "Live" : "Disabled"}</span>
                    </button>
                  </td>

                  {/* Move Up/Down Sequence Controls */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => handleMovePosition(sec.id, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMovePosition(sec.id, "down")}
                        disabled={idx === sections.length - 1}
                        title="Move Down"
                        className="p-1 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(sec)}
                        title="Edit Section Config"
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSectionToDelete(sec);
                          setDeleteConfirmOpen(true);
                        }}
                        title="Delete Section"
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-red-400 border border-slate-800 transition-colors cursor-pointer"
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

      {/* ── 3. Visual Section Edit/Create Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSectionId ? "Edit Homepage Section" : "Publish New Homepage Section"}
        size="lg"
      >
        <form onSubmit={handleSaveForm} className="space-y-6 text-xs font-sans text-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Section Header Name *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Direct Shenzhen Factory Launch"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#FF1028]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Subtitle / Tagline</label>
              <input
                type="text"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                placeholder="e.g. Sourced directly with zero middleman markups"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#FF1028]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Section Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as SectionType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              >
                <option value="hero_banner">Hero Banner Carousel</option>
                <option value="flash_deals">Flash Sourcing Deals</option>
                <option value="category_grid">Category Showcase</option>
                <option value="featured_products">Featured Hardware Grid</option>
                <option value="trust_badges">Trust &amp; Escrow Badges</option>
                <option value="promo_blocks">Promotional Banner Strip</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Layout Format</label>
              <select
                value={formLayout}
                onChange={(e) => setFormLayout(e.target.value as SectionLayout)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              >
                <option value="carousel">Interactive Carousel</option>
                <option value="grid">Responsive Grid</option>
                <option value="banner_strip">Full-Width Banner Strip</option>
                <option value="cards">Feature Cards</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Device Visibility</label>
              <select
                value={formVisibility}
                onChange={(e) => setFormVisibility(e.target.value as DeviceVisibility)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              >
                <option value="all">All Screens &amp; Devices</option>
                <option value="desktop_only">Desktop Only</option>
                <option value="mobile_only">Mobile Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Schedule (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>End Schedule (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>

          {/* ── Slide Builder for Hero Banner ── */}
          {formType === "hero_banner" && (
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-black text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Responsive Hero Carousel Slides ({slides.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Add Slide</span>
                </button>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {slides.map((slide, sIdx) => (
                  <div
                    key={slide.id || sIdx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 font-mono text-[11px]">
                        Slide #{sIdx + 1}
                      </span>
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlide(sIdx)}
                          className="text-red-400 hover:text-red-300 font-bold text-xs"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Badge Text</label>
                        <input
                          type="text"
                          value={slide.badge}
                          onChange={(e) => handleUpdateSlide(sIdx, "badge", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Product Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleUpdateSlide(sIdx, "title", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Desktop Image (1200px)</label>
                        <input
                          type="url"
                          value={slide.desktop_image}
                          onChange={(e) => handleUpdateSlide(sIdx, "desktop_image", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-[11px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Mobile Image (600px)</label>
                        <input
                          type="url"
                          value={slide.mobile_image || ""}
                          onChange={(e) => handleUpdateSlide(sIdx, "mobile_image", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Price (USDT)</label>
                        <input
                          type="number"
                          value={slide.price}
                          onChange={(e) => handleUpdateSlide(sIdx, "price", Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">Compare Price</label>
                        <input
                          type="number"
                          value={slide.original_price}
                          onChange={(e) => handleUpdateSlide(sIdx, "original_price", Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400">CTA Link</label>
                        <input
                          type="text"
                          value={slide.link}
                          onChange={(e) => handleUpdateSlide(sIdx, "link", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-black font-heading text-xs shadow-md cursor-pointer"
            >
              Save Section Configuration
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 4. Interactive Multi-Device Preview Modal ── */}
      {isPreviewOpen && previewSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-5xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-heading font-black text-white text-base">
                    Device Viewport Preview: {previewSection.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Test responsive aspect ratios and typography before publishing live.
                  </span>
                </div>
              </div>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPreviewViewport("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    previewViewport === "desktop" ? "bg-[#FF1028] text-white font-heading font-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop (1280px)</span>
                </button>
                <button
                  onClick={() => setPreviewViewport("tablet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    previewViewport === "tablet" ? "bg-[#FF1028] text-white font-heading font-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet (768px)</span>
                </button>
                <button
                  onClick={() => setPreviewViewport("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    previewViewport === "mobile" ? "bg-[#FF1028] text-white font-heading font-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile Phone (375px)</span>
                </button>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 rounded-2xl flex justify-center items-start">
              <div
                className={`bg-slate-900 border border-slate-800 rounded-2xl transition-all duration-300 p-4 ${
                  previewViewport === "desktop"
                    ? "w-full max-w-4xl"
                    : previewViewport === "tablet"
                    ? "w-[768px]"
                    : "w-[375px] border-4 border-slate-700 rounded-3xl"
                }`}
              >
                {/* Simulated Section Content */}
                {previewSection.type === "hero_banner" && previewSection.config?.slides?.[0] && (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 p-6 space-y-3 min-h-[260px] flex flex-col justify-end">
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
                      <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        {previewSection.config.slides[0].badge}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                        {previewSection.config.slides[0].title}
                      </h2>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {previewSection.config.slides[0].subtitle}
                      </p>
                      <div className="flex items-center gap-3 pt-2">
                        <span className="text-lg font-black text-[#10B981] font-mono">
                          ${previewSection.config.slides[0].price} USDT
                        </span>
                        <span className="bg-white text-slate-950 px-3 py-1 rounded-lg text-xs font-black">
                          Sourcing Portal →
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {previewSection.type !== "hero_banner" && (
                  <div className="p-8 text-center space-y-3">
                    <span className="bg-slate-800 text-slate-300 text-xs font-mono px-3 py-1 rounded-full uppercase">
                      {previewSection.type} ({previewSection.layout})
                    </span>
                    <h3 className="text-lg font-bold text-white">{previewSection.name}</h3>
                    <p className="text-xs text-slate-400">{previewSection.subtitle}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Confirm Delete Modal ── */}
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
