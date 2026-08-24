"use client";

import React, { useState } from "react";
import {
  Menu as MenuIcon,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Link as LinkIcon,
  Layers,
  Compass,
  Smartphone,
  Layout,
} from "lucide-react";
import { MOCK_MENUS, AdminMenu } from "@/lib/mockData";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge, BadgeTone } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/utils/helpers";

interface MenuItemForm {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<AdminMenu[]>(MOCK_MENUS);
  const [expandedMenuIds, setExpandedMenuIds] = useState<Set<string>>(
    () => new Set(MOCK_MENUS.map((m) => m.id))
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState<
    "header_nav" | "footer_links" | "mobile_bottom" | "mega_menu"
  >("header_nav");
  const [formItems, setFormItems] = useState<MenuItemForm[]>([]);

  // Quick inline add item state
  const [quickItemMenuId, setQuickItemMenuId] = useState<string | null>(null);
  const [quickLabel, setQuickLabel] = useState("");
  const [quickHref, setQuickHref] = useState("");
  const [quickIsExternal, setQuickIsExternal] = useState(false);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<AdminMenu | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Toggle Card Expansion
  const toggleExpand = (id: string) => {
    setExpandedMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Open Create Menu Modal
  const handleOpenCreate = () => {
    setEditingMenuId(null);
    setFormName("");
    setFormLocation("header_nav");
    setFormItems([
      { id: `mi-${Date.now()}-1`, label: "Categories", href: "/categories" },
      { id: `mi-${Date.now()}-2`, label: "Flash Sourcing Deals", href: "/categories/rc-drones-toys" },
    ]);
    setIsModalOpen(true);
  };

  // Open Edit Menu Modal
  const handleOpenEdit = (menu: AdminMenu) => {
    setEditingMenuId(menu.id);
    setFormName(menu.name);
    setFormLocation(menu.location);
    setFormItems(
      menu.items.map((item) => ({
        id: item.id || `mi-${Math.random()}`,
        label: item.label,
        href: item.href,
        isExternal: item.isExternal || false,
      }))
    );
    setIsModalOpen(true);
  };

  // Form: Add item row
  const handleAddFormItem = () => {
    setFormItems([
      ...formItems,
      {
        id: `mi-${Date.now()}`,
        label: "",
        href: "/",
        isExternal: false,
      },
    ]);
  };

  // Form: Remove item row
  const handleRemoveFormItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  // Form: Move item up/down
  const handleMoveFormItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === formItems.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...formItems];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFormItems(updated);
  };

  // Save Modal
  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const filteredItems = formItems.filter(
      (item) => item.label.trim() !== "" && item.href.trim() !== ""
    );

    if (editingMenuId) {
      setMenus((prev) =>
        prev.map((m) =>
          m.id === editingMenuId
            ? {
                ...m,
                name: formName.trim(),
                location: formLocation,
                itemsCount: filteredItems.length,
                updatedAt: new Date().toISOString(),
                items: filteredItems,
              }
            : m
        )
      );
      showToast(`Menu "${formName}" updated with ${filteredItems.length} links!`);
    } else {
      const newMenu: AdminMenu = {
        id: `mnu-${Date.now()}`,
        name: formName.trim(),
        location: formLocation,
        itemsCount: filteredItems.length,
        updatedAt: new Date().toISOString(),
        items: filteredItems,
      };
      setMenus([...menus, newMenu]);
      setExpandedMenuIds((prev) => new Set([...prev, newMenu.id]));
      showToast(`New menu "${formName}" created!`);
    }

    setIsModalOpen(false);
  };

  // Quick inline add item
  const handleQuickAddItem = (menuId: string) => {
    if (!quickLabel.trim() || !quickHref.trim()) return;

    const newItem = {
      id: `mi-${Date.now()}`,
      label: quickLabel.trim(),
      href: quickHref.trim(),
      isExternal: quickIsExternal,
    };

    setMenus((prev) =>
      prev.map((m) =>
        m.id === menuId
          ? {
              ...m,
              itemsCount: m.items.length + 1,
              updatedAt: new Date().toISOString(),
              items: [...m.items, newItem],
            }
          : m
      )
    );

    showToast(`Added "${quickLabel}" to menu!`);
    setQuickLabel("");
    setQuickHref("");
    setQuickIsExternal(false);
    setQuickItemMenuId(null);
  };

  // Inline delete item from card
  const handleDeleteCardItem = (menuId: string, itemId: string, itemLabel: string) => {
    setMenus((prev) =>
      prev.map((m) => {
        if (m.id === menuId) {
          const updatedItems = m.items.filter((i) => i.id !== itemId);
          return {
            ...m,
            itemsCount: updatedItems.length,
            updatedAt: new Date().toISOString(),
            items: updatedItems,
          };
        }
        return m;
      })
    );
    showToast(`Removed link "${itemLabel}".`);
  };

  // Inline reorder item inside card
  const handleMoveCardItem = (
    menuId: string,
    index: number,
    direction: "up" | "down"
  ) => {
    setMenus((prev) =>
      prev.map((m) => {
        if (m.id === menuId) {
          if (direction === "up" && index === 0) return m;
          if (direction === "down" && index === m.items.length - 1) return m;

          const targetIndex = direction === "up" ? index - 1 : index + 1;
          const updated = [...m.items];
          const [moved] = updated.splice(index, 1);
          updated.splice(targetIndex, 0, moved);

          return {
            ...m,
            updatedAt: new Date().toISOString(),
            items: updated,
          };
        }
        return m;
      })
    );
  };

  // Confirm Delete Menu
  const handleConfirmDelete = () => {
    if (!menuToDelete) return;
    setMenus((prev) => prev.filter((m) => m.id !== menuToDelete.id));
    showToast(`Menu "${menuToDelete.name}" deleted.`);
    setMenuToDelete(null);
  };

  // Helper for location badge
  const getLocationInfo = (location: AdminMenu["location"]) => {
    switch (location) {
      case "header_nav":
        return { label: "Header Main Nav", tone: "blue" as BadgeTone, icon: Compass };
      case "footer_links":
        return { label: "Footer Links", tone: "purple" as BadgeTone, icon: Layout };
      case "mobile_bottom":
        return { label: "Mobile Bottom Bar", tone: "emerald" as BadgeTone, icon: Smartphone };
      case "mega_menu":
        return { label: "Mega Menu Dropdown", tone: "amber" as BadgeTone, icon: Layers };
      default:
        return { label: location, tone: "slate" as BadgeTone, icon: MenuIcon };
    }
  };

  // Top metric stats
  const totalItemsCount = menus.reduce((acc, m) => acc + (m.items?.length || 0), 0);
  const headerMenusCount = menus.filter((m) => m.location === "header_nav").length;
  const footerMenusCount = menus.filter((m) => m.location === "footer_links").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Storefront Navigation Menus"
        subtitle="Organize header navigation bars, mega menu dropdowns, mobile bottom tab bars, and footer links."
        badge={{ text: "STOREFRONT", variant: "blue" }}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Navigation Menus" },
        ]}
        actions={[
          {
            label: "Create Menu",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreate,
          },
        ]}
      />

      {/* ── 2. Top Summary KPI Cards (Pastels) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Menus */}
        <div className="p-4.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Menus
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {menus.length} Trees
            </span>
            <span className="text-[11px] font-bold text-[#2F65F6] block mt-0.5">
              Navigation trees defined
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <MenuIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Total Active Links */}
        <div className="p-4.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Active Links
            </span>
            <span className="text-xl font-black text-[#16A34A] dark:text-emerald-400 font-mono mt-0.5 block">
              {totalItemsCount} Links
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Live navigation destinations
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <LinkIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Header Locations */}
        <div className="p-4.5 rounded-2xl bg-[#FFF8EE] dark:bg-[#2B2216] border border-[#FED7AA]/50 dark:border-amber-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Header Menus
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {headerMenusCount} Active
            </span>
            <span className="text-[11px] font-bold text-amber-600 block mt-0.5">
              Top bar &amp; dropdowns
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        {/* Footer Locations */}
        <div className="p-4.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#2B171B] border border-[#FFE4E8]/50 dark:border-rose-900/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Footer Menus
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {footerMenusCount} Active
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Corporate &amp; policy links
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-xs">
            <Layout className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Menus Expandable Cards List ── */}
      <div className="space-y-4">
        {menus.map((menu) => {
          const isExpanded = expandedMenuIds.has(menu.id);
          const locationInfo = getLocationInfo(menu.location);
          const LocationIcon = locationInfo.icon;

          return (
            <div
              key={menu.id}
              className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs"
            >
              {/* Card Header Bar */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827]">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center text-[#2F65F6] shrink-0">
                    <LocationIcon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {menu.name}
                      </h3>
                      <StatusBadge
                        status={locationInfo.label}
                        tone={locationInfo.tone}
                        size="sm"
                        dot={false}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>
                        <strong className="text-slate-700 dark:text-slate-200 font-mono font-bold">
                          {menu.items?.length || 0}
                        </strong>{" "}
                        links
                      </span>
                      <span>•</span>
                      <span>
                        Updated on{" "}
                        <strong className="text-slate-600 dark:text-slate-300">
                          {formatDate(menu.updatedAt)}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickItemMenuId(
                        quickItemMenuId === menu.id ? null : menu.id
                      );
                      if (!isExpanded) toggleExpand(menu.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#2F65F6]" />
                    <span>Add Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(menu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#2F65F6]" />
                    <span>Edit Menu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuToDelete(menu);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Menu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleExpand(menu.id)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    title={isExpanded ? "Collapse Links" : "Expand Links"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Card Content: Menu Items List */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-5 space-y-4">
                  {/* Inline Quick Add Item Row */}
                  {quickItemMenuId === menu.id && (
                    <div className="p-4 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-900/60 rounded-2xl space-y-3 shadow-xs animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-[#2F65F6]" />
                          Add Link to &ldquo;{menu.name}&rdquo;
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuickItemMenuId(null)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="Link Label (e.g. Flash Deals)"
                            value={quickLabel}
                            onChange={(e) => setQuickLabel(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#2F65F6]"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            placeholder="Href URL (e.g. /categories/drones)"
                            value={quickHref}
                            onChange={(e) => setQuickHref(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl px-3 py-2 outline-none focus:border-[#2F65F6]"
                          />
                        </div>
                        <div className="sm:col-span-3 flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={quickIsExternal}
                              onChange={(e) => setQuickIsExternal(e.target.checked)}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-[#2F65F6] focus:ring-0"
                            />
                            <span>External</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleQuickAddItem(menu.id)}
                            className="flex-1 bg-[#2F65F6] hover:bg-[#2563EB] text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            Save Link
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  {menu.items && menu.items.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60">
                      {menu.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-[#2F65F6] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                                <span>{item.label}</span>
                                {item.isExternal && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-[#2F65F6] font-mono bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/40">
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    External
                                  </span>
                                )}
                              </div>
                              <div className="font-mono text-[11px] text-[#2F65F6] truncate">
                                {item.href}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {/* Reorder Up/Down */}
                            <button
                              type="button"
                              onClick={() => handleMoveCardItem(menu.id, idx, "up")}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleMoveCardItem(menu.id, idx, "down")
                              }
                              disabled={idx === menu.items.length - 1}
                              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            {/* Delete Link Item */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteCardItem(menu.id, item.id, item.label)
                              }
                              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                      No links added to this menu yet. Click &ldquo;Add Link&rdquo; to start.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 4. Create / Edit Full Menu Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMenuId ? "Edit Navigation Menu" : "Create Navigation Menu"}
        size="xl"
      >
        <form onSubmit={handleSaveMenu} className="space-y-5 pt-1 text-slate-900 dark:text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Menu Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Main Header Navigation"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Display Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={formLocation}
                onChange={(e) =>
                  setFormLocation(
                    e.target.value as
                      | "header_nav"
                      | "footer_links"
                      | "mobile_bottom"
                      | "mega_menu"
                  )
                }
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2F65F6] transition-colors cursor-pointer"
              >
                <option value="header_nav">Header Navigation Bar</option>
                <option value="footer_links">Footer Corporate Links</option>
                <option value="mobile_bottom">Mobile Bottom Tab Bar</option>
                <option value="mega_menu">Mega Menu Dropdown Rail</option>
              </select>
            </div>
          </div>

          {/* Dynamic Links Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#2F65F6]" />
                <span>Menu Link Items ({formItems.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddFormItem}
                className="flex items-center gap-1 text-[11px] font-bold text-[#2F65F6] hover:text-[#2563EB] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {formItems.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl"
                >
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveFormItem(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveFormItem(index, "down")}
                      disabled={index === formItems.length - 1}
                      className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Label (e.g. Flash Deals)"
                      value={item.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormItems((prev) =>
                          prev.map((it, i) => (i === index ? { ...it, label: val } : it))
                        );
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#2F65F6]"
                    />
                    <input
                      type="text"
                      placeholder="Href (e.g. /categories/drones)"
                      value={item.href}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormItems((prev) =>
                          prev.map((it, i) => (i === index ? { ...it, href: val } : it))
                        );
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs rounded-xl px-3 py-2 outline-none focus:border-[#2F65F6]"
                    />
                  </div>

                  <label className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isExternal || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormItems((prev) =>
                          prev.map((it, i) =>
                            i === index ? { ...it, isExternal: checked } : it
                          )
                        );
                      }}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#2F65F6]"
                    />
                    <span>External</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveFormItem(index)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2F65F6] hover:bg-[#2563EB] shadow-blue-500/25 shadow-xs transition-colors cursor-pointer"
            >
              {editingMenuId ? "Save Changes" : "Create Menu"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Navigation Menu"
        description={`Are you sure you want to delete "${menuToDelete?.name}"? All navigation links inside this menu will be permanently removed.`}
        confirmLabel="Delete Menu"
        variant="danger"
      />

      {/* ── 6. Toast Notification ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-500">
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
