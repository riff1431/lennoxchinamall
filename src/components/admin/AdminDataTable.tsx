"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckSquare,
  Square,
  RotateCcw,
  SlidersHorizontal,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/utils/helpers";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  hideable?: boolean;
  defaultHidden?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (selectedRows: T[]) => void;
  variant?: "danger" | "default" | "success";
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
}

export interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFields?: Array<keyof T | string>;
  filters?: FilterOption[];
  bulkActions?: BulkAction<T>[];
  defaultSortKey?: string;
  defaultSortDirection?: "asc" | "desc";
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  onExportCsv?: () => void;
  renderCard?: (row: T, index: number, isSelected: boolean, toggleSelect: () => void) => React.ReactNode;
  defaultViewMode?: "table" | "cards";
}

export function AdminDataTable<T extends object = Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = "Search records...",
  searchFields = [],
  filters = [],
  bulkActions = [],
  defaultSortKey,
  defaultSortDirection = "desc",
  itemsPerPageOptions = [10, 25, 50, 100],
  defaultItemsPerPage = 10,
  isLoading = false,
  isError = false,
  errorMessage = "Failed to load data. Please try again.",
  onRetry,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries matching your current search or filter criteria.",
  emptyAction,
  onExportCsv,
  renderCard,
  defaultViewMode = "table",
}: AdminDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    filters.forEach((f) => {
      initial[f.key] = f.defaultValue || "all";
    });
    return initial;
  });

  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Column Visibility State
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    columns.forEach((col, idx) => {
      if (!col.defaultHidden) {
        initial.add(String(col.accessorKey || col.header || idx));
      }
    });
    return initial;
  });
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // View Mode: Table vs Responsive Cards
  const [viewMode, setViewMode] = useState<"table" | "cards">(defaultViewMode);

  // Bulk action confirmation dialog state
  const [confirmBulkModal, setConfirmBulkModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Click outside listener for column visibility menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setColumnMenuOpen(false);
      }
    };
    if (columnMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [columnMenuOpen]);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const record = item as Record<string, unknown>;
      // 1. Text Search
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matches = searchFields.some((field) => {
          const val = String(record[field as string] ?? "");
          return val.toLowerCase().includes(query);
        });
        if (!matches) return false;
      }

      // 2. Filters
      for (const [key, value] of Object.entries(activeFilters)) {
        if (value && value !== "all") {
          const itemVal = String(record[key] ?? "");
          if (itemVal.toLowerCase() !== value.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, searchFields, activeFilters]);

  // Sort Logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      return sortDirection === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, validCurrentPage, itemsPerPage]);

  // Active visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter((col, idx) => {
      const key = String(col.accessorKey || col.header || idx);
      return visibleColumnKeys.has(key);
    });
  }, [columns, visibleColumnKeys]);

  // Sorting Handler
  const handleSort = (key?: keyof T | string) => {
    if (!key) return;
    const strKey = String(key);
    if (sortKey === strKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(strKey);
      setSortDirection("desc");
    }
  };

  // Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set<string>();
      paginatedData.forEach((item) => allIds.add(keyExtractor(item)));
      setSelectedIds(allIds);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectedRows = useMemo(() => {
    return data.filter((item) => selectedIds.has(keyExtractor(item)));
  }, [data, selectedIds, keyExtractor]);

  const handleBulkActionClick = (action: BulkAction<T>) => {
    if (action.requiresConfirmation) {
      setConfirmBulkModal({
        isOpen: true,
        title: action.confirmTitle || `Confirm ${action.label}`,
        message:
          action.confirmMessage ||
          `Are you sure you want to perform "${action.label}" on ${selectedRows.length} selected items?`,
        onConfirm: () => {
          action.onClick(selectedRows);
          clearSelection();
        },
      });
    } else {
      action.onClick(selectedRows);
      clearSelection();
    }
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== "all") || searchTerm !== "";

  const resetAllFilters = () => {
    setSearchTerm("");
    const initial: Record<string, string> = {};
    filters.forEach((f) => {
      initial[f.key] = f.defaultValue || "all";
    });
    setActiveFilters(initial);
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumnKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="w-full space-y-4 font-montserrat">
      {/* ── Top Bar: Search, Filters, Column Visibility, View Toggle & CSV Export ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg pl-9 pr-8 h-9 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-slate-900 dark:focus:border-white transition-colors font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters, Visibility, View Toggle, and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Dropdowns */}
          {filters.map((filter) => (
            <div key={filter.key} className="relative">
              <select
                value={activeFilters[filter.key] || "all"}
                onChange={(e) => {
                  setActiveFilters((prev) => ({
                    ...prev,
                    [filter.key]: e.target.value,
                  }));
                  setCurrentPage(1);
                }}
                className="bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium rounded-lg px-3 h-9 text-slate-700 dark:text-slate-300 outline-none focus:border-slate-900 dark:focus:border-white transition-colors cursor-pointer appearance-none pr-8"
              >
                <option value="all">All {filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="h-9 px-2.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Column Visibility Menu */}
          <div className="relative" ref={columnMenuRef}>
            <button
              type="button"
              onClick={() => setColumnMenuOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-1.5 px-3 h-9 rounded-lg border text-xs font-medium transition-colors cursor-pointer",
                columnMenuOpen
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                  : "bg-slate-50/50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              title="Customize visible columns"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Columns</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {visibleColumns.length}
              </span>
            </button>

            {columnMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 px-1">
                  Toggle Columns
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {columns.map((col, idx) => {
                    const key = String(col.accessorKey || col.header || idx);
                    const isVisible = visibleColumnKeys.has(key);
                    const isMandatory = col.hideable === false;

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={isMandatory}
                        onClick={() => toggleColumnVisibility(key)}
                        className={cn(
                          "w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors text-left cursor-pointer",
                          isVisible
                            ? "bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                            : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40",
                          isMandatory && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <span className="truncate">{col.header || "Column"}</span>
                        {isVisible ? (
                          <Eye className="w-3.5 h-3.5 text-[#2F65F6] shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 border border-slate-300 dark:border-slate-700 rounded-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* View Mode Toggle (Table vs Mobile Cards) */}
          <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "cards"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CSV Export Button */}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-3 py-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk Actions Bar (Shown when rows selected) ── */}
      {selectedIds.size > 0 && (
        <div className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3 sm:px-4 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-150 border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold font-mono px-2 py-0.5 rounded-md bg-white/10 text-white">
              {selectedIds.size} Selected
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">
              of {sortedData.length} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleBulkActionClick(action)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs",
                    action.variant === "danger"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : action.variant === "success"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{action.label}</span>
                </button>
              );
            })}

            <button
              onClick={clearSelection}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* ── Error State With Retry ── */}
      {isError && !isLoading && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
              Unable to load records
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {errorMessage}
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Load</span>
            </button>
          )}
        </div>
      )}

      {/* ── Main Data View (Responsive Table & Card Layouts) ── */}
      {!isError && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {/* TABLE VIEW */}
          <div
            className={cn(
              "overflow-x-auto w-full max-h-[calc(100vh-280px)]",
              viewMode === "cards" && "hidden"
            )}
          >
            <table className="w-full text-left border-collapse">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono select-none">
                <tr>
                  {bulkActions.length > 0 && (
                    <th className="py-2.5 px-3.5 w-10">
                      <button
                        onClick={handleSelectAll}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer flex items-center"
                        aria-label="Select all rows"
                      >
                        {selectedIds.size === paginatedData.length && paginatedData.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-slate-900 dark:text-white" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                  )}

                  {visibleColumns.map((col, cIdx) => (
                    <th
                      key={cIdx}
                      className={cn(
                        "py-2.5 px-3.5",
                        col.sortable && "cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors",
                        col.className
                      )}
                      onClick={() => col.sortable && handleSort(col.accessorKey)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.sortable && sortKey === col.accessorKey && (
                          sortDirection === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                          )
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  // Loading Skeletons
                  Array.from({ length: itemsPerPage > 10 ? 10 : itemsPerPage }).map((_, rIdx) => (
                    <tr key={rIdx} className="animate-pulse">
                      {bulkActions.length > 0 && (
                        <td className="py-3 px-3.5 w-10">
                          <Skeleton className="w-4 h-4 rounded-md" />
                        </td>
                      )}
                      {visibleColumns.map((_, cIdx) => (
                        <td key={cIdx} className="py-3 px-3.5">
                          <Skeleton className="h-4 w-3/4 rounded-md" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  // Empty State
                  <tr>
                    <td
                      colSpan={visibleColumns.length + (bulkActions.length > 0 ? 1 : 0)}
                      className="py-14 text-center"
                    >
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto shadow-xs">
                          <Search className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-heading">
                            {emptyTitle}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {emptyDescription}
                          </p>
                        </div>
                        {emptyAction && (
                          <button
                            type="button"
                            onClick={emptyAction.onClick}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 transition-colors cursor-pointer shadow-xs"
                          >
                            {emptyAction.label}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Real Table Rows
                  paginatedData.map((row, index) => {
                    const rowId = keyExtractor(row);
                    const isSelected = selectedIds.has(rowId);

                    return (
                      <tr
                        key={rowId}
                        className={cn(
                          "transition-colors duration-150 group",
                          isSelected
                            ? "bg-slate-100/80 dark:bg-slate-800/60"
                            : "hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                        )}
                      >
                        {bulkActions.length > 0 && (
                          <td className="py-3 px-3.5 w-10">
                            <button
                              onClick={() => handleSelectRow(rowId)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer flex items-center"
                              aria-label={`Select row ${index + 1}`}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-slate-900 dark:text-white" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        )}

                        {visibleColumns.map((col, cIdx) => (
                          <td key={cIdx} className={cn("py-3 px-3.5 align-middle", col.className)}>
                            {col.cell
                              ? col.cell(row, index)
                              : String((row as Record<string, unknown>)[col.accessorKey as string] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* CARD VIEW (For Small Screens or User Toggle) */}
          <div
            className={cn(
              "p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
              viewMode === "table" && "hidden"
            )}
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse"
                >
                  <Skeleton className="h-5 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/3 rounded-md" />
                </div>
              ))
            ) : paginatedData.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                  {emptyTitle}
                </h4>
                <p className="text-xs text-slate-500">{emptyDescription}</p>
              </div>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = keyExtractor(row);
                const isSelected = selectedIds.has(rowId);
                const toggleSelect = () => handleSelectRow(rowId);

                if (renderCard) {
                  return (
                    <React.Fragment key={rowId}>
                      {renderCard(row, index, isSelected, toggleSelect)}
                    </React.Fragment>
                  );
                }

                // Default Card Representation
                return (
                  <div
                    key={rowId}
                    className={cn(
                      "p-4.5 rounded-2xl border transition-all space-y-3 relative group shadow-xs",
                      isSelected
                        ? "border-[#2F65F6] bg-blue-50/40 dark:bg-blue-950/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    {bulkActions.length > 0 && (
                      <div className="absolute top-3 right-3">
                        <button
                          type="button"
                          onClick={toggleSelect}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#2F65F6]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      {visibleColumns.map((col, cIdx) => (
                        <div key={cIdx} className="flex items-center justify-between text-xs gap-2">
                          <span className="text-[11px] font-bold uppercase font-mono text-slate-400 shrink-0">
                            {col.header}
                          </span>
                          <div className="text-right truncate">
                            {col.cell
                              ? col.cell(row, index)
                              : String((row as Record<string, unknown>)[col.accessorKey as string] ?? "—")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Table Footer & Pagination ── */}
          {!isLoading && sortedData.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  Showing{" "}
                  <strong className="text-slate-900 dark:text-slate-100 font-mono">
                    {(validCurrentPage - 1) * itemsPerPage + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-slate-900 dark:text-slate-100 font-mono">
                    {Math.min(validCurrentPage * itemsPerPage, sortedData.length)}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-900 dark:text-slate-100 font-mono">
                    {sortedData.length}
                  </strong>{" "}
                  results
                </span>

                <div className="hidden sm:flex items-center gap-1.5 ml-2">
                  <span className="text-[11px]">Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                  >
                    {itemsPerPageOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Page Nav Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    let pageNum = idx + 1;
                    if (totalPages > 5 && validCurrentPage > 3) {
                      pageNum = validCurrentPage - 2 + idx;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                    }

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer",
                          validCurrentPage === pageNum
                            ? "bg-[#00143D] text-white shadow-xs font-mono"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmBulkModal.isOpen}
        onClose={() => setConfirmBulkModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmBulkModal.onConfirm}
        title={confirmBulkModal.title}
        message={confirmBulkModal.message}
        tone="danger"
      />
    </div>
  );
}
