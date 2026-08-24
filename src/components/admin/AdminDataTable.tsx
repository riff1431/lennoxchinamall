"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Trash2,
  CheckSquare,
  Square,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/utils/helpers";
import { Skeleton } from "@/components/ui/Skeleton";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
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
}

export interface AdminDataTableProps<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  onExportCsv?: () => void;
}

export function AdminDataTable<T extends Record<string, any>>({
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
  emptyTitle = "No records found",
  emptyDescription = "There are no entries matching your current search or filter criteria.",
  emptyAction,
  onExportCsv,
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

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Text Search
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matches = searchFields.some((field) => {
          const val = String((item as any)[field] ?? "");
          return val.toLowerCase().includes(query);
        });
        if (!matches) return false;
      }

      // 2. Filters
      for (const [key, value] of Object.entries(activeFilters)) {
        if (value && value !== "all") {
          const itemVal = String((item as any)[key] ?? "");
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
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];

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
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key?: string) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const handleSelectAllOnPage = () => {
    const newSet = new Set(selectedIds);
    const allPageIds = paginatedData.map(keyExtractor);
    const allSelected = allPageIds.every((id) => newSet.has(id));

    if (allSelected) {
      allPageIds.forEach((id) => newSet.delete(id));
    } else {
      allPageIds.forEach((id) => newSet.add(id));
    }
    setSelectedIds(newSet);
  };

  const handleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectedRows = useMemo(() => {
    return data.filter((item) => selectedIds.has(keyExtractor(item)));
  }, [data, selectedIds, keyExtractor]);

  const handleResetFilters = () => {
    setSearchTerm("");
    const initial: Record<string, string> = {};
    filters.forEach((f) => {
      initial[f.key] = "all";
    });
    setActiveFilters(initial);
    setCurrentPage(1);
  };

  const isFiltered =
    searchTerm !== "" ||
    Object.values(activeFilters).some((val) => val !== "all" && val !== "");

  return (
    <div className="space-y-4">
      {/* ── Toolbar: Search, Filters & Quick Actions ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-[#2F65F6] transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          {filters.map((flt) => (
            <div key={flt.key} className="relative min-w-[140px]">
              <select
                value={activeFilters[flt.key] || "all"}
                onChange={(e) => {
                  setActiveFilters((prev) => ({ ...prev, [flt.key]: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 pr-7 outline-none focus:border-[#2F65F6] transition-colors cursor-pointer"
              >
                <option value="all">{flt.label}: All</option>
                {flt.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Export & Utility Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk Actions Floating Bar ── */}
      {selectedIds.size > 0 && bulkActions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-blue-500/30 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-blue-500/5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <span className="bg-[#2F65F6] text-white px-2 py-0.5 rounded-md text-[11px] font-mono">
              {selectedIds.size}
            </span>
            <span>records selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {bulkActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => {
                    action.onClick(selectedRows);
                    setSelectedIds(new Set());
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                    action.variant === "danger"
                      ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30"
                      : action.variant === "success"
                      ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{action.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Main Data Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider select-none">
                {/* Bulk Select All Checkbox */}
                {bulkActions.length > 0 && (
                  <th className="py-3.5 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAllOnPage}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      {paginatedData.length > 0 &&
                      paginatedData.every((item) => selectedIds.has(keyExtractor(item))) ? (
                        <CheckSquare className="w-4 h-4 text-[#2F65F6]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}

                {columns.map((col, idx) => {
                  const isCurrentSort = sortKey === col.accessorKey;
                  return (
                    <th
                      key={idx}
                      className={cn(
                        "py-3.5 px-4 font-bold",
                        col.sortable && "cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors",
                        col.className
                      )}
                      onClick={() => col.sortable && handleSort(col.accessorKey as string)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-slate-400">
                            {isCurrentSort ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#2F65F6]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#2F65F6]" />
                              )
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {bulkActions.length > 0 && (
                      <td className="py-4 px-4 text-center">
                        <Skeleton className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 inline-block" />
                      </td>
                    )}
                    {columns.map((_, colIdx) => (
                      <td key={colIdx} className="py-4 px-4">
                        <Skeleton className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0)}
                    className="py-16 text-center"
                  >
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <SlidersHorizontal className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{emptyTitle}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {emptyDescription}
                      </p>
                      {emptyAction && (
                        <button
                          onClick={emptyAction.onClick}
                          className="mt-2 bg-[#2F65F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          {emptyAction.label}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => {
                  const rowId = keyExtractor(row);
                  const isSelected = selectedIds.has(rowId);

                  return (
                    <tr
                      key={rowId}
                      className={cn(
                        "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors",
                        isSelected && "bg-blue-50/40 dark:bg-blue-950/20"
                      )}
                    >
                      {bulkActions.length > 0 && (
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectRow(rowId)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#2F65F6]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}

                      {columns.map((col, cIdx) => (
                        <td key={cIdx} className={cn("py-3.5 px-4", col.className)}>
                          {col.cell
                            ? col.cell(row, index)
                            : String((row as any)[col.accessorKey as string] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer & Pagination ── */}
        {!isLoading && sortedData.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, sortedData.length)}</strong> of{" "}
                <strong className="text-slate-900 dark:text-white">{sortedData.length}</strong> results
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 outline-none text-xs"
                >
                  {itemsPerPageOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-slate-800 dark:text-slate-200">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
