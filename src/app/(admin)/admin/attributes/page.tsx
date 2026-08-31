"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Palette,
  MousePointerClick,
  ListFilter,
  CircleDot,
  Boxes,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Eye,
  SlidersHorizontal,
  PlusCircle,
  X,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Info,
  CheckCircle2,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SlideOver } from "@/components/admin/SlideOver";
import { Modal } from "@/components/ui/Modal";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatDate, slugify } from "@/utils/helpers";
import {
  useAttributeStore,
  ExtendedAttributeGroup,
} from "@/store/useAttributeStore";

const COLOR_NAME_MAP: Record<string, string> = {
  "#000000": "Jet Black",
  "#FFFFFF": "Pure White",
  "#2F65F6": "ChinaMall Blue",
  "#FF1028": "Crimson Red",
  "#10B981": "Emerald Green",
  "#F59E0B": "Amber Gold",
  "#8B5CF6": "Purple Violet",
  "#EC4899": "Hot Pink",
  "#64748B": "Slate Gray",
  "#1E293B": "Midnight Dark",
  "#F97316": "Cyberpunk Orange",
  "#FF5722": "Neon Orange",
  "#06B6D4": "Cyan Teal",
  "#84CC16": "Lime Green",
  "#D97706": "Bronze Gold",
  "#9333EA": "Deep Purple",
  "#94A3B8": "Titanium Silver",
  "#4D5D3B": "Military Olive",
  "#E0F2FE": "Ice Blue",
  "#FEF3C7": "Warm Amber",
};

export function getColorNameFromHex(hex: string): string {
  const upper = hex.toUpperCase();
  if (COLOR_NAME_MAP[upper]) return COLOR_NAME_MAP[upper];
  return upper;
}

const POPULAR_COLOR_PRESETS = [
  { label: "Jet Black", color: "#000000" },
  { label: "Pure White", color: "#FFFFFF" },
  { label: "ChinaMall Blue", color: "#2F65F6" },
  { label: "Crimson Red", color: "#FF1028" },
  { label: "Emerald Green", color: "#10B981" },
  { label: "Amber Gold", color: "#F59E0B" },
  { label: "Purple Violet", color: "#8B5CF6" },
  { label: "Cyberpunk Orange", color: "#FF5722" },
  { label: "Titanium Silver", color: "#94A3B8" },
  { label: "Midnight Dark", color: "#1E293B" },
];

export default function AdminAttributesPage() {
  const toast = useAdminToast();
  const {
    attributes,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    duplicateAttribute,
    addValueToAttribute,
    removeValueFromAttribute,
    reorderValues,
    resetToDefaults,
  } = useAttributeStore();

  // SlideOver state for create/edit
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ExtendedAttributeGroup | null>(null);

  // Quick values manager modal
  const [quickValuesAttr, setQuickValuesAttr] = useState<ExtendedAttributeGroup | null>(null);
  const [quickNewValue, setQuickNewValue] = useState("");
  const [quickNewColor, setQuickNewColor] = useState("#3B82F6");

  // Confirm delete dialog
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

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State for Drawer
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [isCodeLocked, setIsCodeLocked] = useState(true);
  const [formType, setFormType] = useState<"button" | "select" | "color" | "radio">("button");
  const [formDescription, setFormDescription] = useState("");
  const [formRequired, setFormRequired] = useState(false);
  const [formProductCount, setFormProductCount] = useState(0);

  // Option Values in builder: array of { label: string, color: string }
  const [optionItems, setOptionItems] = useState<Array<{ label: string; color: string }>>([]);
  const [newOptionInput, setNewOptionInput] = useState("");
  const [newOptionColor, setNewOptionColor] = useState("#2F65F6");
  const [batchInputText, setBatchInputText] = useState("");
  const [showBatchAdd, setShowBatchAdd] = useState(false);

  // Live preview interactive state
  const [previewSelectedValue, setPreviewSelectedValue] = useState<string>("");

  const copyToClipboard = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.info("Copied to clipboard", `System code "${code}" copied.`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectFormType = (type: "button" | "select" | "color" | "radio") => {
    setFormType(type);
    if (type === "color") {
      const hasGenericOptions =
        optionItems.length === 0 ||
        optionItems.every((item) => item.label.startsWith("Option "));
      if (hasGenericOptions) {
        const defaultColors = [
          { label: "Stealth Matte Black", color: "#18181B" },
          { label: "ChinaMall Blue", color: "#2F65F6" },
          { label: "Cyberpunk Orange", color: "#FF5722" },
        ];
        setOptionItems(defaultColors);
        setPreviewSelectedValue("Stealth Matte Black");
      }
    }
  };

  const handleAddPresetColor = (preset: { label: string; color: string }) => {
    let finalLabel = preset.label;
    let counter = 2;
    while (
      optionItems.some(
        (item) => item.label.toLowerCase() === finalLabel.toLowerCase()
      )
    ) {
      finalLabel = `${preset.label} (${counter})`;
      counter++;
    }
    const updated = [...optionItems, { label: finalLabel, color: preset.color }];
    setOptionItems(updated);
    setPreviewSelectedValue(finalLabel);
    toast.success("Color Added", `Added "${finalLabel}" swatch.`);
  };

  const handleOpenCreate = () => {
    setEditingAttribute(null);
    setFormName("");
    setFormCode("");
    setIsCodeLocked(true);
    setFormType("button");
    setFormDescription("");
    setFormRequired(false);
    setFormProductCount(0);
    setOptionItems([
      { label: "Option 1", color: "#2F65F6" },
      { label: "Option 2", color: "#10B981" },
    ]);
    setNewOptionInput("");
    setNewOptionColor("#2F65F6");
    setBatchInputText("");
    setShowBatchAdd(false);
    setPreviewSelectedValue("Option 1");
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (attr: ExtendedAttributeGroup) => {
    setEditingAttribute(attr);
    setFormName(attr.name);
    setFormCode(attr.code);
    setIsCodeLocked(true);
    setFormType(attr.type);
    setFormDescription(attr.description || "");
    setFormRequired(attr.isRequired ?? false);
    setFormProductCount(attr.productCount || 0);

    const items = attr.values.map((val) => ({
      label: val,
      color: attr.colorMap?.[val] || (attr.type === "color" ? "#2F65F6" : "#64748B"),
    }));
    setOptionItems(items);
    setNewOptionInput("");
    setNewOptionColor("#2F65F6");
    setBatchInputText("");
    setShowBatchAdd(false);
    setPreviewSelectedValue(attr.values[0] || "");
    setIsSlideOverOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingAttribute && isCodeLocked) {
      setFormCode(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "_")
      );
    }
  };

  const handleAddOptionItem = () => {
    let trimmed = newOptionInput.trim();
    if (!trimmed) {
      trimmed =
        formType === "color"
          ? getColorNameFromHex(newOptionColor)
          : `Option ${optionItems.length + 1}`;
    }

    // If duplicate label exists, append a counter suffix
    let finalLabel = trimmed;
    let counter = 2;
    while (
      optionItems.some(
        (item) => item.label.toLowerCase() === finalLabel.toLowerCase()
      )
    ) {
      finalLabel = `${trimmed} (${counter})`;
      counter++;
    }

    const updated = [...optionItems, { label: finalLabel, color: newOptionColor }];
    setOptionItems(updated);
    setNewOptionInput("");
    if (!previewSelectedValue) setPreviewSelectedValue(finalLabel);
    toast.success("Option Added", `Added "${finalLabel}"`);
  };

  const handleRemoveOptionItem = (index: number) => {
    const updated = optionItems.filter((_, i) => i !== index);
    setOptionItems(updated);
    if (previewSelectedValue === optionItems[index]?.label) {
      setPreviewSelectedValue(updated[0]?.label || "");
    }
  };

  const handleMoveOptionItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === optionItems.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const newItems = [...optionItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setOptionItems(newItems);
  };

  const handleBatchAddValues = () => {
    const parts = batchInputText
      .split(/[\n,]/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    const existingLabels = new Set(optionItems.map((i) => i.label.toLowerCase()));
    const newAdditions: Array<{ label: string; color: string }> = [];

    parts.forEach((part) => {
      if (!existingLabels.has(part.toLowerCase())) {
        existingLabels.add(part.toLowerCase());
        newAdditions.push({ label: part, color: "#2F65F6" });
      }
    });

    if (newAdditions.length > 0) {
      setOptionItems([...optionItems, ...newAdditions]);
      toast.success("Options added", `Added ${newAdditions.length} new option values.`);
    }
    setBatchInputText("");
    setShowBatchAdd(false);
  };

  const handleSaveAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      toast.warning("Validation Error", "Attribute label and system code are required.");
      return;
    }

    if (optionItems.length === 0) {
      toast.warning("Options Required", "Please configure at least one option value.");
      return;
    }

    const valuesArray = optionItems.map((i) => i.label.trim());
    const colorMap: Record<string, string> = {};
    if (formType === "color") {
      optionItems.forEach((i) => {
        colorMap[i.label.trim()] = i.color;
      });
    }

    if (editingAttribute) {
      updateAttribute(editingAttribute.id, {
        name: formName.trim(),
        code: formCode.trim().toLowerCase(),
        type: formType,
        values: valuesArray,
        colorMap: formType === "color" ? colorMap : undefined,
        description: formDescription.trim() || undefined,
        isRequired: formRequired,
        productCount: Number(formProductCount) || 0,
      });
      toast.success("Attribute Updated", `Group "${formName}" updated successfully.`);
    } else {
      const newAttr: ExtendedAttributeGroup = {
        id: `attr-${Date.now()}`,
        name: formName.trim(),
        code: formCode.trim().toLowerCase(),
        type: formType,
        values: valuesArray,
        colorMap: formType === "color" ? colorMap : undefined,
        description: formDescription.trim() || undefined,
        isRequired: formRequired,
        productCount: Number(formProductCount) || 0,
        created_at: new Date().toISOString(),
      };
      addAttribute(newAttr);
      toast.success("Attribute Created", `Group "${formName}" created successfully.`);
    }

    setIsSlideOverOpen(false);
  };

  const handleDeleteAttribute = (attr: ExtendedAttributeGroup) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Attribute "${attr.name}"?`,
      description: `Deleting this attribute will remove variant configuration links across ${attr.productCount} products. This action cannot be undone.`,
      onConfirm: () => {
        deleteAttribute(attr.id);
        toast.success("Attribute Deleted", `Attribute group "${attr.name}" removed.`);
      },
    });
  };

  const handleDuplicate = (attr: ExtendedAttributeGroup) => {
    const dup = duplicateAttribute(attr.id);
    if (dup) {
      toast.success("Attribute Duplicated", `Cloned as "${dup.name}".`);
    }
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Name", "Code", "Type", "Values", "ProductCount", "Created"];
    const rows = attributes.map((a) => [
      a.id,
      `"${a.name.replace(/"/g, '""')}"`,
      a.code,
      a.type,
      `"${a.values.join(", ").replace(/"/g, '""')}"`,
      a.productCount,
      a.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lennox_attributes_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported", "Attribute catalogue downloaded successfully.");
  };

  // Type badge helper
  const renderTypeBadge = (type: ExtendedAttributeGroup["type"]) => {
    switch (type) {
      case "color":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60 font-mono shadow-2xs">
            <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Color Swatch
          </span>
        );
      case "button":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60 font-mono shadow-2xs">
            <MousePointerClick className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Button Pill
          </span>
        );
      case "select":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60 font-mono shadow-2xs">
            <ListFilter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Dropdown Select
          </span>
        );
      case "radio":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 font-mono shadow-2xs">
            <CircleDot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Radio Option
          </span>
        );
      default:
        return (
          <span className="text-xs font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
            {type}
          </span>
        );
    }
  };

  // Table Columns
  const columns: Column<ExtendedAttributeGroup>[] = [
    {
      header: "Attribute Name",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div
          className="flex items-center gap-3.5 group cursor-pointer"
          onClick={() => handleOpenEdit(row)}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 shadow-2xs group-hover:scale-105 group-hover:border-blue-300 dark:group-hover:border-blue-500 transition-all">
            {row.type === "color" ? (
              <Palette className="w-5 h-5" />
            ) : row.type === "radio" ? (
              <CircleDot className="w-5 h-5" />
            ) : row.type === "select" ? (
              <ListFilter className="w-5 h-5" />
            ) : (
              <Layers className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
              <span>{row.name}</span>
              {row.isRequired && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50">
                  Required
                </span>
              )}
            </div>
            {row.description ? (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                {row.description}
              </p>
            ) : (
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Code: <span className="text-slate-600 dark:text-slate-300 font-semibold">{row.code}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "System Code",
      accessorKey: "code",
      sortable: true,
      cell: (row) => (
        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs font-semibold group/code">
          <span>{row.code}</span>
          <button
            type="button"
            onClick={(e) => copyToClipboard(row.code, e)}
            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0.5"
            title="Copy system code"
          >
            {copiedCode === row.code ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
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
        <div className="flex flex-wrap items-center gap-1.5 max-w-md">
          {row.values.slice(0, 3).map((val, idx) => {
            const hexColor = row.colorMap?.[val];
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg shadow-2xs"
              >
                {row.type === "color" && hexColor && (
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                    style={{ backgroundColor: hexColor }}
                  />
                )}
                <span>{val}</span>
              </span>
            );
          })}
          {row.values.length > 3 && (
            <button
              type="button"
              onClick={() => setQuickValuesAttr(row)}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              title="Click to view all option values"
            >
              +{row.values.length - 3} more
            </button>
          )}
        </div>
      ),
    },
    {
      header: "Products",
      accessorKey: "productCount",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50 inline-flex items-center gap-1.5 shadow-2xs">
          <Boxes className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {row.productCount || 0} Products
        </span>
      ),
    },
    {
      header: "Created",
      accessorKey: "created_at",
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            title="Edit Attribute"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setQuickValuesAttr(row)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Manage Option Values"
          >
            <PlusCircle className="w-3.5 h-3.5" />
          </button>
          <AdminActionMenu
            itemTitle={row.name}
            onEdit={() => handleOpenEdit(row)}
            onDuplicate={() => handleDuplicate(row)}
            onDelete={() => handleDeleteAttribute(row)}
            size="sm"
          />
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
  const bulkActions: BulkAction<ExtendedAttributeGroup>[] = [
    {
      label: "Delete Selected",
      variant: "danger",
      icon: Trash2,
      onClick: (selectedRows) => {
        setConfirmDialog({
          isOpen: true,
          title: `Delete ${selectedRows.length} Attribute Groups?`,
          description: `This will remove the selected attribute groups and all associated variant options from the catalogue.`,
          onConfirm: () => {
            selectedRows.forEach((r) => deleteAttribute(r.id));
            toast.success("Bulk Delete Complete", `Removed ${selectedRows.length} attributes.`);
          },
        });
      },
    },
  ];

  // Totals & KPI Metrics
  const totalGroups = attributes.length;
  const totalOptions = attributes.reduce((sum, a) => sum + a.values.length, 0);
  const totalAssignedProducts = attributes.reduce((sum, a) => sum + a.productCount, 0);
  const totalColorSwatches = attributes
    .filter((a) => a.type === "color")
    .reduce((sum, a) => sum + a.values.length, 0);

  // Render Grid Card for viewMode = "cards"
  const renderAttributeCard = (
    row: ExtendedAttributeGroup,
    _index: number,
    isSelected: boolean,
    toggleSelect: () => void
  ) => {
    return (
      <div
        className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
          isSelected
            ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
        }`}
      >
        {/* Card Header */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={toggleSelect}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                {row.type === "color" ? (
                  <Palette className="w-5 h-5" />
                ) : row.type === "radio" ? (
                  <CircleDot className="w-5 h-5" />
                ) : row.type === "select" ? (
                  <ListFilter className="w-5 h-5" />
                ) : (
                  <Layers className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4
                  onClick={() => handleOpenEdit(row)}
                  className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
                >
                  {row.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                  <span>{row.code}</span>
                  <button
                    type="button"
                    onClick={(e) => copyToClipboard(row.code, e)}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Copy code"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            {renderTypeBadge(row.type)}
          </div>

          {row.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
              {row.description}
            </p>
          )}

          {/* Configured Values preview */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Configured Values ({row.values.length})</span>
              <button
                type="button"
                onClick={() => setQuickValuesAttr(row)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                + Add / Manage
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {row.values.map((val, idx) => {
                const hexColor = row.colorMap?.[val];
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md"
                  >
                    {row.type === "color" && hexColor && (
                      <span
                        className="w-2 h-2 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: hexColor }}
                      />
                    )}
                    <span>{val}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
            <Boxes className="w-3.5 h-3.5" />
            {row.productCount || 0} Products
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenEdit(row)}
              className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Edit
            </button>
            <AdminActionMenu
              itemTitle={row.name}
              onEdit={() => handleOpenEdit(row)}
              onDuplicate={() => handleDuplicate(row)}
              onDelete={() => handleDeleteAttribute(row)}
              size="sm"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 font-sans">
      {/* 1. Header */}
      <AdminPageHeader
        title="Attributes & Variants"
        subtitle="Manage configurable product attributes, option values, color swatches, and variant selectors."
        badge={{ text: `${totalGroups} Groups`, variant: "blue" }}
        breadcrumbs={[
          { label: "Catalogue", href: "/admin/products" },
          { label: "Attributes & Variants" },
        ]}
        actions={[
          {
            label: "Export CSV",
            icon: Download,
            variant: "secondary",
            onClick: handleExportCsv,
          },
          {
            label: "Add Attribute",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreate,
          },
        ]}
      />

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-blue-50/60 dark:bg-[#172033] border border-blue-200/60 dark:border-blue-900/30 flex items-center justify-between shadow-xs transition-all hover:shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Attribute Groups
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {totalGroups}
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              Global variant schemas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-emerald-50/60 dark:bg-[#162720] border border-emerald-200/60 dark:border-emerald-900/30 flex items-center justify-between shadow-xs transition-all hover:shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total Option Values
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {totalOptions}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Selectable options
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-purple-50/60 dark:bg-[#251B33] border border-purple-200/60 dark:border-purple-900/30 flex items-center justify-between shadow-xs transition-all hover:shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Color Swatches
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {totalColorSwatches}
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
              Hex swatch previews
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Palette className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-amber-50/60 dark:bg-[#2A2117] border border-amber-200/60 dark:border-amber-900/30 flex items-center justify-between shadow-xs transition-all hover:shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Products Configured
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {totalAssignedProducts}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              SKUs linked to variants
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Boxes className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Main Data Table / Card Grid */}
      <AdminDataTable
        data={attributes}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search attributes by name, system code, or option value..."
        searchFields={["name", "code", "values"]}
        filters={filters}
        bulkActions={bulkActions}
        defaultSortKey="name"
        defaultSortDirection="asc"
        onExportCsv={handleExportCsv}
        renderCard={renderAttributeCard}
        defaultViewMode="table"
        emptyTitle="No attributes found"
        emptyDescription="Create attributes such as Battery Pack, Color, Plug Type, or Case to power product variants across the hardware catalog."
        emptyAction={{
          label: "Add Attribute",
          onClick: handleOpenCreate,
        }}
      />

      {/* 4. Interactive SlideOver: Complete Attribute & Options Builder */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span>
              {editingAttribute ? `Edit Attribute: ${editingAttribute.name}` : "Create New Attribute"}
            </span>
          </div>
        }
        description="Configure how this attribute appears on product pages, its system code, and all selectable option values."
        size="xl"
      >
        <form onSubmit={handleSaveAttribute} className="space-y-6 pb-6 text-slate-800 dark:text-slate-200">
          {/* Section 1: Basic Information */}
          <div className="space-y-4 p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                Basic Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Attribute Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Battery Configuration"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    System Code <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCodeLocked(!isCodeLocked)}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    {isCodeLocked ? "Unlock Code" : "Lock Code"}
                  </button>
                </div>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(slugify(e.target.value).replace(/-/g, "_"))}
                  disabled={isCodeLocked && Boolean(editingAttribute)}
                  placeholder="e.g. battery_config"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono focus:border-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Description / Shopper Help Text
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="e.g. Select the battery capacity based on your expected flight runtime."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formRequired}
                  onChange={(e) => setFormRequired(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Required selection before adding product to cart
                </span>
              </label>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Assigned Products:</span>
                <input
                  type="number"
                  min="0"
                  value={formProductCount}
                  onChange={(e) => setFormProductCount(Number(e.target.value))}
                  className="w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-2 py-1 outline-none font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Display Control Type */}
          <div className="space-y-3.5 p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Storefront Input Control
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button Pill Option */}
              <div
                onClick={() => handleSelectFormType("button")}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  formType === "button"
                    ? "bg-blue-50/80 border-blue-500 dark:bg-blue-950/40 dark:border-blue-600 shadow-xs"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <MousePointerClick className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Button Pill</span>
                    {formType === "button" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Clickable option pills. Best for size, pack, or model selectors.
                  </p>
                </div>
              </div>

              {/* Color Swatch Option */}
              <div
                onClick={() => handleSelectFormType("color")}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  formType === "color"
                    ? "bg-purple-50/80 border-purple-500 dark:bg-purple-950/40 dark:border-purple-600 shadow-xs"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Color Swatch</span>
                    {formType === "color" && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Visual colored circles with custom hex color codes.
                  </p>
                </div>
              </div>

              {/* Dropdown Select Option */}
              <div
                onClick={() => handleSelectFormType("select")}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  formType === "select"
                    ? "bg-amber-50/80 border-amber-500 dark:bg-amber-950/40 dark:border-amber-600 shadow-xs"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ListFilter className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Dropdown Select</span>
                    {formType === "select" && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Traditional dropdown menu. Great for long lists (10+ values).
                  </p>
                </div>
              </div>

              {/* Radio Option */}
              <div
                onClick={() => handleSelectFormType("radio")}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  formType === "radio"
                    ? "bg-emerald-50/80 border-emerald-500 dark:bg-emerald-950/40 dark:border-emerald-600 shadow-xs"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CircleDot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Radio Option</span>
                    {formType === "radio" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Detailed radio options with border cards and descriptions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Interactive Option Values Manager */}
          <div className="space-y-4 p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                Configured Option Values ({optionItems.length})
              </span>
              <button
                type="button"
                onClick={() => setShowBatchAdd(!showBatchAdd)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showBatchAdd ? "Close Batch Mode" : "+ Batch / Bulk Paste"}
              </button>
            </div>

            {/* Batch mode area */}
            {showBatchAdd && (
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Paste comma or newline separated option values:
                </label>
                <textarea
                  rows={3}
                  value={batchInputText}
                  onChange={(e) => setBatchInputText(e.target.value)}
                  placeholder="e.g. 5000K Neutral White, 6500K Cool White, 3000K Warm Amber"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-2.5 outline-none focus:border-blue-600"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBatchAdd(false)}
                    className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBatchAddValues}
                    className="px-3.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
                  >
                    Parse & Add
                  </button>
                </div>
              </div>
            )}

            {/* Quick Add Single Item Row */}
            <div className="flex items-center gap-2">
              {formType === "color" && (
                <div className="relative flex items-center shrink-0">
                  <input
                    type="color"
                    value={newOptionColor}
                    onChange={(e) => {
                      const col = e.target.value;
                      setNewOptionColor(col);
                      if (!newOptionInput.trim()) {
                        setNewOptionInput(getColorNameFromHex(col));
                      }
                    }}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                    title="Select hex color"
                  />
                </div>
              )}
              <input
                type="text"
                value={newOptionInput}
                onChange={(e) => setNewOptionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddOptionItem();
                  }
                }}
                placeholder={
                  formType === "color"
                    ? "e.g. Cyberpunk Orange"
                    : "e.g. 4 Batteries + Quad Hub"
                }
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 transition-all"
              />
              <button
                type="button"
                onClick={handleAddOptionItem}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Value
              </button>
            </div>

            {/* Quick Swatches Bar for Color Mode */}
            {formType === "color" && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Quick Colors:
                </span>
                {POPULAR_COLOR_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleAddPresetColor(p)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:shadow-2xs transition-all cursor-pointer"
                    title={`Click to add ${p.label}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Option Items List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {optionItems.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No option values added yet. Type an option above and click Add Value.
                </div>
              ) : (
                optionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-slate-400 w-5 text-center">
                        {idx + 1}
                      </span>
                      {formType === "color" && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={item.color}
                            onChange={(e) => {
                              const newCol = e.target.value;
                              setOptionItems((prev) =>
                                prev.map((opt, i) =>
                                  i === idx ? { ...opt, color: newCol } : opt
                                )
                              );
                            }}
                            className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer p-0"
                            title="Edit color swatch"
                          />
                          <span className="font-mono text-[10px] text-slate-400">
                            {item.color}
                          </span>
                        </div>
                      )}
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const newLabel = e.target.value;
                          setOptionItems((prev) =>
                            prev.map((opt, i) =>
                              i === idx ? { ...opt, label: newLabel } : opt
                            )
                          );
                        }}
                        className="flex-1 bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none border-b border-transparent focus:border-blue-500 py-0.5"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveOptionItem(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOptionItem(idx, "down")}
                        disabled={idx === optionItems.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveOptionItem(idx)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-1"
                        title="Remove Option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Live Storefront Product Page Preview */}
          <div className="p-4.5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Live Storefront Customer Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Interactive</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  {formName || "Attribute Name"}:
                </span>
                <span className="text-xs text-blue-400 font-semibold">
                  {previewSelectedValue || (optionItems[0]?.label ?? "None")}
                </span>
              </div>

              {/* Preview Control based on selected type */}
              {formType === "button" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {optionItems.map((item, idx) => {
                    const isSelected = previewSelectedValue === item.label;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewSelectedValue(item.label)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {formType === "color" && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {optionItems.map((item, idx) => {
                    const isSelected = previewSelectedValue === item.label;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewSelectedValue(item.label)}
                        className={`group relative flex items-center justify-center rounded-full transition-all ${
                          isSelected
                            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 scale-110"
                            : "opacity-80 hover:opacity-100"
                        }`}
                        title={item.label}
                      >
                        <span
                          className="w-7 h-7 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: item.color }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {formType === "select" && (
                <select
                  value={previewSelectedValue}
                  onChange={(e) => setPreviewSelectedValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  {optionItems.map((item, idx) => (
                    <option key={idx} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
              )}

              {formType === "radio" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {optionItems.map((item, idx) => {
                    const isSelected = previewSelectedValue === item.label;
                    return (
                      <div
                        key={idx}
                        onClick={() => setPreviewSelectedValue(item.label)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-950/60 border-blue-500 text-white shadow-xs"
                            : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <span className="text-xs font-semibold">{item.label}</span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-blue-400 bg-blue-500"
                              : "border-slate-500"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingAttribute ? "Update Attribute" : "Save & Create Attribute"}
            </button>
          </div>
        </form>
      </SlideOver>

      {/* 5. Quick Manage Values Modal */}
      {quickValuesAttr && (
        <Modal
          isOpen={Boolean(quickValuesAttr)}
          onClose={() => setQuickValuesAttr(null)}
          title={`Manage Options: ${quickValuesAttr.name}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 pt-1 text-slate-800 dark:text-slate-200">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quickly add or remove option values for{" "}
              <strong className="text-slate-800 dark:text-white font-mono">{quickValuesAttr.code}</strong>.
            </p>

            {/* Quick Add Row */}
            <div className="flex items-center gap-2">
              {quickValuesAttr.type === "color" && (
                <input
                  type="color"
                  value={quickNewColor}
                  onChange={(e) => {
                    const col = e.target.value;
                    setQuickNewColor(col);
                    if (!quickNewValue.trim()) {
                      setQuickNewValue(getColorNameFromHex(col));
                    }
                  }}
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800 shrink-0"
                />
              )}
              <input
                type="text"
                value={quickNewValue}
                onChange={(e) => setQuickNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    let val = quickNewValue.trim();
                    if (!val) {
                      val =
                        quickValuesAttr.type === "color"
                          ? getColorNameFromHex(quickNewColor)
                          : `Option ${quickValuesAttr.values.length + 1}`;
                    }
                    addValueToAttribute(
                      quickValuesAttr.id,
                      val,
                      quickValuesAttr.type === "color" ? quickNewColor : undefined
                    );
                    setQuickNewValue("");
                    toast.success("Option Added", `Added "${val}"`);
                    setQuickValuesAttr((prev) =>
                      prev
                        ? {
                            ...prev,
                            values: prev.values.includes(val)
                              ? prev.values
                              : [...prev.values, val],
                            colorMap: {
                              ...(prev.colorMap || {}),
                              ...(quickValuesAttr.type === "color"
                                ? { [val]: quickNewColor }
                                : {}),
                            },
                          }
                        : null
                    );
                  }
                }}
                placeholder="Type new option name & press Enter..."
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2 outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => {
                  let val = quickNewValue.trim();
                  if (!val) {
                    val =
                      quickValuesAttr.type === "color"
                        ? getColorNameFromHex(quickNewColor)
                        : `Option ${quickValuesAttr.values.length + 1}`;
                  }
                  addValueToAttribute(
                    quickValuesAttr.id,
                    val,
                    quickValuesAttr.type === "color" ? quickNewColor : undefined
                  );
                  setQuickNewValue("");
                  toast.success("Option Added", `Added "${val}"`);
                  setQuickValuesAttr((prev) =>
                    prev
                      ? {
                          ...prev,
                          values: prev.values.includes(val)
                            ? prev.values
                            : [...prev.values, val],
                          colorMap: {
                            ...(prev.colorMap || {}),
                            ...(quickValuesAttr.type === "color"
                              ? { [val]: quickNewColor }
                              : {}),
                          },
                        }
                      : null
                  );
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
              >
                Add
              </button>
            </div>

            {/* Values badges list */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 max-h-56 overflow-y-auto">
              {quickValuesAttr.values.map((val, idx) => {
                const hex = quickValuesAttr.colorMap?.[val];
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-xl shadow-2xs"
                  >
                    {quickValuesAttr.type === "color" && hex && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                    )}
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => {
                        removeValueFromAttribute(quickValuesAttr.id, val);
                        setQuickValuesAttr((prev) =>
                          prev
                            ? {
                                ...prev,
                                values: prev.values.filter((v) => v !== val),
                              }
                            : null
                        );
                        toast.info("Option Removed", `Removed "${val}"`);
                      }}
                      className="text-slate-400 hover:text-red-500 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setQuickValuesAttr(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel="Delete Attribute"
        variant="danger"
      />
    </div>
  );
}
