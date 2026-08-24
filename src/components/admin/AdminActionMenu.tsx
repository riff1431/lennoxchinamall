"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Copy,
  Archive,
  Trash2,
} from "lucide-react";
import { cn } from "@/utils/helpers";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export interface ActionMenuItem {
  key?: string;
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: "default" | "danger" | "warning";
  disabled?: boolean;
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  divider?: boolean;
}

export interface AdminActionMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  customActions?: ActionMenuItem[];
  align?: "left" | "right";
  size?: "sm" | "md";
  className?: string;
  itemTitle?: string;
}

export function AdminActionMenu({
  onView,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  customActions = [],
  align = "right",
  size = "md",
  className,
  itemTitle = "this item",
}: AdminActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    tone?: "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Build standard actions list
  const actions: ActionMenuItem[] = [];

  if (onView) {
    actions.push({
      label: "View Details",
      icon: Eye,
      onClick: onView,
    });
  }

  if (onEdit) {
    actions.push({
      label: "Edit",
      icon: Edit2,
      onClick: onEdit,
    });
  }

  if (onDuplicate) {
    actions.push({
      label: "Duplicate",
      icon: Copy,
      onClick: onDuplicate,
    });
  }

  // Insert custom actions
  if (customActions.length > 0) {
    actions.push(...customActions);
  }

  if (onArchive) {
    actions.push({
      label: "Archive",
      icon: Archive,
      variant: "warning",
      requiresConfirmation: true,
      confirmTitle: "Archive Item",
      confirmMessage: `Are you sure you want to archive ${itemTitle}? It will be hidden from live displays.`,
      onClick: onArchive,
      divider: true,
    });
  }

  if (onDelete) {
    actions.push({
      label: "Delete",
      icon: Trash2,
      variant: "danger",
      requiresConfirmation: true,
      confirmTitle: "Delete Item",
      confirmMessage: `Are you sure you want to permanently delete ${itemTitle}? This action cannot be undone.`,
      onClick: onDelete,
      divider: !onArchive,
    });
  }

  if (actions.length === 0) return null;

  const handleActionClick = (action: ActionMenuItem) => {
    setIsOpen(false);
    if (action.requiresConfirmation) {
      setConfirmModal({
        isOpen: true,
        title: action.confirmTitle || "Confirm Action",
        message: action.confirmMessage || "Are you sure you want to proceed?",
        onConfirm: action.onClick,
        tone: action.variant === "danger" ? "danger" : "warning",
      });
    } else {
      action.onClick();
    }
  };

  return (
    <>
      <div className={cn("relative inline-block text-left", className)} ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "rounded-xl border border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center",
            size === "sm" ? "w-7 h-7" : "w-8 h-8",
            isOpen && "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white border-slate-200 dark:border-slate-700"
          )}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="Actions menu"
        >
          <MoreHorizontal className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
        </button>

        {isOpen && (
          <div
            className={cn(
              "absolute z-30 mt-1.5 w-44 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150 font-montserrat",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <React.Fragment key={idx}>
                  {action.divider && (
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  )}
                  <button
                    type="button"
                    disabled={action.disabled}
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      "w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                      action.variant === "danger"
                        ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        : action.variant === "warning"
                        ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                    )}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                    <span className="truncate">{action.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        tone={confirmModal.tone}
      />
    </>
  );
}
