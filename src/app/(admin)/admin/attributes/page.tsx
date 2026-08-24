"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
  Palette,
  MousePointerClick,
  ListFilter,
  CircleDot,
  Boxes,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/utils/helpers";
import { MOCK_ATTRIBUTES, AttributeGroup } from "@/lib/mockData";

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<AttributeGroup[]>(MOCK_ATTRIBUTES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<AttributeGroup | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Form State
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState<"select" | "color" | "button" | "radio">("button");
  const [formValuesText, setFormValuesText] = useState("");
  const [formProductCount, setFormProductCount] = useState(0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingAttribute(null);
    setFormName("");
    setFormCode("");
    setFormType("button");
    setFormValuesText("");
    setFormProductCount(0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (attr: AttributeGroup) => {
    setEditingAttribute(attr);
    setFormName(attr.name);
    setFormCode(attr.code);
    setFormType(attr.type);
    setFormValuesText(attr.values.join(", "));
    setFormProductCount(attr.productCount || 0);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingAttribute) {
      setFormCode(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "_")
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      showToast("Attribute name and code are required.");
      return;
    }

    const valuesArray = formValuesText
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (valuesArray.length === 0) {
      showToast("Please provide at least one variant option value.");
      return;
    }

    if (editingAttribute) {
      setAttributes((prev) =>
        prev.map((attr) =>
          attr.id === editingAttribute.id
            ? {
                ...attr,
                name: formName.trim(),
                code: formCode.trim().toLowerCase(),
                type: formType,
                values: valuesArray,
                productCount: Number(formProductCount) || 0,
              }
            : attr
        )
      );
      showToast(`Attribute group "${formName}" updated successfully.`);
    } else {
      const newAttr: AttributeGroup = {
        id: `attr-${Date.now()}`,
        name: formName.trim(),
        code: formCode.trim().toLowerCase(),
        type: formType,
        values: valuesArray,
        productCount: Number(formProductCount) || 0,
        created_at: new Date().toISOString(),
      };
      setAttributes((prev) => [newAttr, ...prev]);
      showToast(`Attribute group "${formName}" created successfully.`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteAttribute = (attr: AttributeGroup) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Attribute "${attr.name}"?`,
      description: `Deleting this attribute will remove variant configuration links across ${attr.productCount} products.`,
      onConfirm: () => {
        setAttributes((prev) => prev.filter((a) => a.id !== attr.id));
        showToast(`Attribute "${attr.name}" deleted.`);
      },
    });
  };

  // Type badge helper
  const renderTypeBadge = (type: AttributeGroup["type"]) => {
    switch (type) {
      case "color":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/80 font-mono">
            <Palette className="w-3 h-3 text-purple-400" />
            Color Swatch
          </span>
        );
      case "button":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-300 border border-blue-800/80 font-mono">
            <MousePointerClick className="w-3 h-3 text-blue-400" />
            Button Pill
          </span>
        );
      case "select":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/80 font-mono">
            <ListFilter className="w-3 h-3 text-amber-400" />
            Dropdown Select
          </span>
        );
      case "radio":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 font-mono">
            <CircleDot className="w-3 h-3 text-emerald-400" />
            Radio Option
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
            {type}
          </span>
        );
    }
  };

  // Table Columns
  const columns: Column<AttributeGroup>[] = [
    {
      header: "Attribute Name",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-red-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-xs hover:text-red-400 transition-colors">
              {row.name}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Code: <span className="text-slate-300 font-semibold">{row.code}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "System Code",
      accessorKey: "code",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-slate-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          {row.code}
        </span>
      ),
    },
    {
      header: "Input Display Type",
      accessorKey: "type",
      sortable: true,
      cell: (row) => renderTypeBadge(row.type),
    },
    {
      header: "Configured Values",
      accessorKey: "values",
      cell: (row) => (
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {row.values.slice(0, 3).map((val, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium text-slate-300 bg-slate-850 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md"
            >
              {val}
            </span>
          ))}
          {row.values.length > 3 && (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded-md">
              +{row.values.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Products",
      accessorKey: "productCount",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
          {row.productCount || 0} Products
        </span>
      ),
    },
    {
      header: "Created",
      accessorKey: "created_at",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Edit Attribute"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteAttribute(row)}
            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-800/50 transition-colors"
            title="Delete Attribute"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Filters
  const filters: FilterOption[] = [
    {
      key: "type",
      label: "Control Type",
      options: [
        { value: "all", label: "All Control Types" },
        { value: "button", label: "Button Pill" },
        { value: "select", label: "Dropdown Select" },
        { value: "color", label: "Color Swatch" },
        { value: "radio", label: "Radio Option" },
      ],
    },
  ];

  // Bulk Actions
  const bulkActions: BulkAction<AttributeGroup>[] = [
    {
      label: "Delete Selected",
      variant: "danger",
      icon: Trash2,
      onClick: (selectedRows) => {
        setConfirmDialog({
          isOpen: true,
          title: `Delete ${selectedRows.length} Attributes?`,
          description: `This will remove the selected attribute groups and their variant selections.`,
          onConfirm: () => {
            const ids = new Set(selectedRows.map((r) => r.id));
            setAttributes((prev) => prev.filter((a) => !ids.has(a.id)));
            showToast(`Deleted ${selectedRows.length} attributes.`);
          },
        });
      },
    },
  ];

  const totalGroups = attributes.length;
  const totalOptions = attributes.reduce((sum, a) => sum + a.values.length, 0);
  const totalAssignedProducts = attributes.reduce((sum, a) => sum + a.productCount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header */}
      <AdminPageHeader
        title="Attributes & Variants"
        subtitle="Manage configurable product attributes, option values, color swatches, and multi-selection selectors."
        badge={{ text: "SKU CONFIG", variant: "blue" }}
        breadcrumbs={[
          { label: "Catalogue", href: "/admin/products" },
          { label: "Attributes & Variants" },
        ]}
        actions={[
          {
            label: "Add Attribute",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreateModal,
          },
        ]}
      />

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Attribute Groups
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {totalGroups}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Option Values
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {totalOptions}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Products Configured
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
              {totalAssignedProducts}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <AdminDataTable
        data={attributes}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search attributes by name or system code..."
        searchFields={["name", "code"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="name"
        defaultSortDirection="asc"
        emptyTitle="No attributes found"
        emptyDescription="Create attributes such as Battery Pack, Color, Plug Type to power product variants."
        emptyAction={{
          label: "Add Attribute",
          onClick: handleOpenCreateModal,
        }}
      />

      {/* 4. CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAttribute ? `Edit Attribute: ${editingAttribute.name}` : "Create Attribute Group"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Row 1: Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Attribute Label <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Battery Configuration"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Attribute Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. battery_config"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#FF1028] transition-colors"
                required
              />
            </div>
          </div>

          {/* Row 2: Type Dropdown & Product Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Storefront Input Control
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors"
              >
                <option value="button">Button Pill (Recommended for options)</option>
                <option value="select">Dropdown Select (Long lists)</option>
                <option value="color">Color Swatch (Visual hex / tints)</option>
                <option value="radio">Radio Option Group</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Assigned Product Count
              </label>
              <input
                type="number"
                min="0"
                value={formProductCount}
                onChange={(e) => setFormProductCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-[#FF1028] transition-colors"
              />
            </div>
          </div>

          {/* Option Values Comma-separated */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 block">
                Option Values <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] text-slate-500">Comma-separated</span>
            </div>
            <textarea
              rows={3}
              value={formValuesText}
              onChange={(e) => setFormValuesText(e.target.value)}
              placeholder="e.g. 1 Battery (30min), 2 Batteries (60min), 3 Batteries (90min)"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#FF1028] transition-colors resize-none"
              required
            />
          </div>

          {/* Live Preview of Values */}
          {formValuesText.trim() && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Parsed Options Preview
              </span>
              <div className="flex flex-wrap gap-2">
                {formValuesText
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean)
                  .map((val, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-900 text-white border border-slate-700"
                    >
                      {val}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Submit Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors shadow-lg shadow-red-950/50"
            >
              {editingAttribute ? "Update Attribute" : "Create Attribute"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel="Delete Attribute"
        variant="danger"
      />

      {/* 6. Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-emerald-400/40">
          <span>✓ {toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="font-bold text-sm hover:opacity-70 ml-2"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
