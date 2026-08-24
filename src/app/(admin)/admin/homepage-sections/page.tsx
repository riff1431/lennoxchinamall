"use client";

import React, { useState } from "react";
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
  Code,
  CheckCircle2,
  Eye,
  Video,
  Grid,
  CreditCard,
  Maximize2,
  Flame,
} from "lucide-react";
import {
  MOCK_HOMEPAGE_SECTIONS,
  AdminHomepageSection,
} from "@/lib/mockData";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminDataTable,
  Column,
  FilterOption,
  BulkAction,
} from "@/components/admin/AdminDataTable";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<AdminHomepageSection[]>(
    MOCK_HOMEPAGE_SECTIONS.sort((a, b) => a.position - b.position)
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formType, setFormType] = useState("hero_banner");
  const [formLayout, setFormLayout] = useState<
    "carousel" | "grid" | "banner_strip" | "dual_video"
  >("carousel");
  const [formItemCount, setFormItemCount] = useState(3);
  const [formPosition, setFormPosition] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formConfigJson, setFormConfigJson] = useState("{}");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<AdminHomepageSection | null>(
    null
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Reordering Logic
  const handleMovePosition = (id: string, direction: "up" | "down") => {
    const currentIndex = sections.findIndex((s) => s.id === id);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sections.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const updated = [...sections];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    // Reassign position numbers
    const reordered = updated.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));

    setSections(reordered);
    showToast(`Reordered "${movedItem.name}" to position #${targetIndex + 1}`);
  };

  // Toggle Active
  const handleToggleActive = (id: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === id) {
          const nextState = !sec.isActive;
          showToast(
            `Section "${sec.name}" is now ${nextState ? "Active" : "Inactive"}`
          );
          return { ...sec, isActive: nextState };
        }
        return sec;
      })
    );
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingSectionId(null);
    setFormName("");
    setFormSubtitle("");
    setFormType("hero_banner");
    setFormLayout("carousel");
    setFormItemCount(4);
    setFormPosition(sections.length + 1);
    setFormIsActive(true);
    setFormConfigJson(
      JSON.stringify(
        { autoplay: true, intervalSeconds: 5, transition: "fade" },
        null,
        2
      )
    );
    setJsonError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (sec: AdminHomepageSection) => {
    setEditingSectionId(sec.id);
    setFormName(sec.name);
    setFormSubtitle(sec.subtitle);
    setFormType(sec.type);
    setFormLayout(sec.layout);
    setFormItemCount(sec.itemCount);
    setFormPosition(sec.position);
    setFormIsActive(sec.isActive);
    try {
      const parsed = JSON.parse(sec.configJson || "{}");
      setFormConfigJson(JSON.stringify(parsed, null, 2));
    } catch {
      setFormConfigJson(sec.configJson || "{}");
    }
    setJsonError(null);
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON
    try {
      JSON.parse(formConfigJson);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON format");
      return;
    }

    if (!formName.trim()) return;

    if (editingSectionId) {
      setSections((prev) =>
        prev
          .map((sec) =>
            sec.id === editingSectionId
              ? {
                  ...sec,
                  name: formName.trim(),
                  subtitle: formSubtitle.trim(),
                  type: formType,
                  layout: formLayout,
                  itemCount: Number(formItemCount) || 1,
                  position: Number(formPosition) || sec.position,
                  isActive: formIsActive,
                  configJson: formConfigJson.trim(),
                }
              : sec
          )
          .sort((a, b) => a.position - b.position)
      );
      showToast(`Homepage section "${formName}" updated successfully!`);
    } else {
      const newSection: AdminHomepageSection = {
        id: `sec-${Date.now()}`,
        name: formName.trim(),
        subtitle: formSubtitle.trim(),
        type: formType,
        layout: formLayout,
        itemCount: Number(formItemCount) || 1,
        position: Number(formPosition) || sections.length + 1,
        isActive: formIsActive,
        configJson: formConfigJson.trim(),
      };
      setSections((prev) =>
        [...prev, newSection].sort((a, b) => a.position - b.position)
      );
      showToast(`New section "${formName}" added to Homepage!`);
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!sectionToDelete) return;
    setSections((prev) =>
      prev
        .filter((s) => s.id !== sectionToDelete.id)
        .map((s, idx) => ({ ...s, position: idx + 1 }))
    );
    showToast(`Section "${sectionToDelete.name}" removed.`);
    setSectionToDelete(null);
  };

  // Format JSON helper
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(formConfigJson);
      setFormConfigJson(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax");
    }
  };

  // Bulk Actions
  const bulkActions: BulkAction<AdminHomepageSection>[] = [
    {
      label: "Activate Selected",
      variant: "success",
      icon: CheckCircle2,
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setSections((prev) =>
          prev.map((s) => (ids.has(s.id) ? { ...s, isActive: true } : s))
        );
        showToast(`Activated ${selected.length} homepage sections.`);
      },
    },
    {
      label: "Deactivate Selected",
      variant: "default",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setSections((prev) =>
          prev.map((s) => (ids.has(s.id) ? { ...s, isActive: false } : s))
        );
        showToast(`Deactivated ${selected.length} homepage sections.`);
      },
    },
    {
      label: "Delete Selected",
      variant: "danger",
      icon: Trash2,
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setSections((prev) =>
          prev
            .filter((s) => !ids.has(s.id))
            .map((s, idx) => ({ ...s, position: idx + 1 }))
        );
        showToast(`Removed ${selected.length} homepage sections.`);
      },
    },
  ];

  // Filters
  const filters: FilterOption[] = [
    {
      key: "layout",
      label: "Layout",
      options: [
        { value: "carousel", label: "Carousel" },
        { value: "grid", label: "Grid" },
        { value: "banner_strip", label: "Banner Strip" },
        { value: "dual_video", label: "Dual Video" },
      ],
    },
    {
      key: "isActive",
      label: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  // Columns definition
  const columns: Column<AdminHomepageSection>[] = [
    {
      header: "Position",
      accessorKey: "position",
      sortable: true,
      className: "w-28",
      cell: (row, index) => (
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 font-mono font-black text-slate-200 text-xs flex items-center justify-center">
            #{row.position}
          </span>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => handleMovePosition(row.id, "up")}
              disabled={index === 0}
              title="Move Up"
              className="p-1 rounded bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleMovePosition(row.id, "down")}
              disabled={index === sections.length - 1}
              title="Move Down"
              className="p-1 rounded bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
    {
      header: "Section Type",
      accessorKey: "type",
      sortable: true,
      cell: (row) => {
        const typeToneMap: Record<string, { label: string; tone: BadgeTone }> = {
          hero_banner: { label: "Hero Banner", tone: "blue" },
          category_strip: { label: "Category Strip", tone: "purple" },
          flash_deals: { label: "Flash Deals", tone: "red" },
          dual_video_spotlight: { label: "Dual Video QC", tone: "emerald" },
          trust_strip: { label: "Trust Strip", tone: "amber" },
          custom_banner: { label: "Custom Banner", tone: "cyan" },
        };
        const mapped = typeToneMap[row.type] || {
          label: row.type.replace(/_/g, " "),
          tone: "slate",
        };
        return (
          <StatusBadge status={mapped.label} tone={mapped.tone} size="sm" />
        );
      },
    },
    {
      header: "Name & Subtitle",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="space-y-1 max-w-sm">
          <div className="font-bold text-white text-xs leading-snug">
            {row.name}
          </div>
          <div className="text-[11px] text-slate-400 truncate leading-relaxed">
            {row.subtitle}
          </div>
        </div>
      ),
    },
    {
      header: "Layout",
      accessorKey: "layout",
      sortable: true,
      cell: (row) => {
        const layoutConfig: Record<
          string,
          { label: string; tone: BadgeTone; icon: any }
        > = {
          carousel: { label: "Carousel", tone: "blue", icon: Layers },
          grid: { label: "Grid 4-Col", tone: "purple", icon: Grid },
          banner_strip: { label: "Banner Strip", tone: "amber", icon: CreditCard },
          dual_video: { label: "Dual Video Player", tone: "emerald", icon: Video },
        };
        const cfg = layoutConfig[row.layout] || {
          label: row.layout,
          tone: "slate",
          icon: LayoutGrid,
        };
        const Icon = cfg.icon;
        return (
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <StatusBadge status={cfg.label} tone={cfg.tone} size="sm" dot={false} />
          </div>
        );
      },
    },
    {
      header: "Items Count",
      accessorKey: "itemCount",
      sortable: true,
      className: "text-center",
      cell: (row) => (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-mono font-bold text-xs">
          {row.itemCount} items
        </span>
      ),
    },
    {
      header: "Active",
      accessorKey: "isActive",
      className: "text-center",
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleToggleActive(row.id)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            row.isActive ? "bg-emerald-500" : "bg-slate-800"
          }`}
          aria-label={`Toggle status for ${row.name}`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              row.isActive ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Edit Section"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSectionToDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Active metrics
  const activeCount = sections.filter((s) => s.isActive).length;
  const carouselCount = sections.filter((s) => s.layout === "carousel").length;
  const videoSpotlightCount = sections.filter((s) => s.layout === "dual_video").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Homepage Layout Builder"
        subtitle="Manage dynamic storefront sections, promotional rails, dual-video embeds, and carousel order."
        badge={{ text: "STOREFRONT", variant: "red" }}
        breadcrumbs={[
          { label: "Storefront" },
          { label: "Homepage Sections", href: "/admin/homepage-sections" },
        ]}
        actions={[
          {
            label: "Add Section",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreate,
          },
        ]}
      />

      {/* ── 2. Top Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Total Sections
            </span>
            <LayoutGrid className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {sections.length}
          </div>
          <p className="text-[11px] text-slate-400">Configured in layout queue</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Live on Storefront
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-heading">
            {activeCount}
          </div>
          <p className="text-[11px] text-slate-400">Active and visible to buyers</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Hero Carousels
            </span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {carouselCount}
          </div>
          <p className="text-[11px] text-slate-400">Animated banner sliders</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Dual-Video QC
            </span>
            <Video className="w-4 h-4 text-[#FF1028]" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {videoSpotlightCount}
          </div>
          <p className="text-[11px] text-slate-400">PRD §4.4 live teardown player</p>
        </div>
      </div>

      {/* ── 3. Data Table ── */}
      <AdminDataTable<AdminHomepageSection>
        data={sections}
        columns={columns}
        keyExtractor={(sec) => sec.id}
        searchPlaceholder="Search sections by name, type, layout..."
        searchFields={["name", "subtitle", "type", "layout"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="position"
        defaultSortDirection="asc"
        emptyTitle="No homepage sections found"
        emptyDescription="Get started by creating your first storefront promotional section."
        emptyAction={{
          label: "Create Section",
          onClick: handleOpenCreate,
        }}
      />

      {/* ── 4. Create / Edit CRUD Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSectionId ? "Edit Homepage Section" : "Add Homepage Section"}
        size="xl"
        className="!bg-slate-900 !border-slate-800 text-slate-100 [&>div:first-child]:!bg-slate-900/90 [&>div:first-child]:!border-slate-800 [&>div:first-child_div]:!text-white [&>div:first-child_button]:!text-slate-400 hover:[&>div:first-child_button]:!text-white hover:[&>div:first-child_button]:!bg-slate-800"
      >
        <form onSubmit={handleSaveSection} className="space-y-5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Section Name <span className="text-[#FF1028]">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Shenzhen 4K Drones Spotlight"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Section Type <span className="text-[#FF1028]">*</span>
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors cursor-pointer"
              >
                <option value="hero_banner">Hero Banner (Full Width)</option>
                <option value="category_strip">Category Strip (6 Rails)</option>
                <option value="flash_deals">Flash Deals & Live Timer</option>
                <option value="dual_video_spotlight">
                  Dual-Video QC & Teardown
                </option>
                <option value="trust_strip">Trust & Binance Pay Strip</option>
                <option value="custom_banner">Custom Promo Banner</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Subtitle / Caption
            </label>
            <input
              type="text"
              value={formSubtitle}
              onChange={(e) => setFormSubtitle(e.target.value)}
              placeholder="e.g. Verified factory-direct QC inspection and USDT escrow checkout"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Layout Mode
              </label>
              <select
                value={formLayout}
                onChange={(e) =>
                  setFormLayout(
                    e.target.value as "carousel" | "grid" | "banner_strip" | "dual_video"
                  )
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors cursor-pointer"
              >
                <option value="carousel">Carousel (Slider)</option>
                <option value="grid">Grid (Columns)</option>
                <option value="banner_strip">Banner Strip</option>
                <option value="dual_video">Dual Video Player</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Max Display Items
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={formItemCount}
                onChange={(e) => setFormItemCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Queue Position
              </label>
              <input
                type="number"
                min={1}
                value={formPosition}
                onChange={(e) => setFormPosition(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
            <div>
              <div className="text-xs font-bold text-white">Active on Storefront</div>
              <div className="text-[11px] text-slate-400">
                Immediately display this section to visitors on the homepage
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormIsActive(!formIsActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formIsActive ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  formIsActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Config JSON Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-blue-400" />
                <span>JSON Parameters & Config</span>
              </label>
              <button
                type="button"
                onClick={handleFormatJson}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
              >
                Format JSON
              </button>
            </div>
            <textarea
              rows={4}
              value={formConfigJson}
              onChange={(e) => {
                setFormConfigJson(e.target.value);
                setJsonError(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] rounded-xl p-3 outline-none focus:border-[#FF1028] transition-colors leading-relaxed"
            />
            {jsonError && (
              <div className="text-[11px] text-red-400 font-semibold">
                ⚠ {jsonError}
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors cursor-pointer shadow-sm shadow-red-950"
            >
              {editingSectionId ? "Save Changes" : "Create Section"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Homepage Section"
        description={`Are you sure you want to delete "${sectionToDelete?.name}"? This section will be permanently removed from the storefront.`}
        confirmLabel="Delete Section"
        variant="danger"
      />

      {/* ── 6. Toast Notification ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span>✓ {toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
