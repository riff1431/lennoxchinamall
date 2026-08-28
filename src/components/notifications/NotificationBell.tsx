"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Check,
  Package,
  Coins,
  Plane,
  Truck,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  MessageCircle,
  ChevronRight,
  Sliders,
  Volume2,
  VolumeX,
  Trash2,
  Filter,
  Inbox,
  Clock,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNotificationStore } from "@/store/useNotificationStore";
import { NotificationItem, NotificationCategory } from "@/types/notifications";
import { formatTimeAgo, cn } from "@/utils/helpers";
import { useMounted } from "@/hooks/useMounted";

interface NotificationBellProps {
  variant?: "storefront" | "admin";
  className?: string;
}

export function NotificationBell({
  variant = "storefront",
  className,
}: NotificationBellProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isMounted = useMounted();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    filter,
    soundEnabled,
    isRinging,
    setFilter,
    setSoundEnabled,
    fetchNotifications,
    addNotification,
    updateNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotificationStore();

  // Initial fetch on mount & when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, user?.id]);

  // Realtime Supabase Subscription
  useEffect(() => {
    const supabase = createClient();
    const channelName = `notif_bell_${user?.id || "guest"}_${Math.random().toString(36).substring(2, 7)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          // Filter if targeted to user or broadcast
          if (!newNotif.user_id || !user || newNotif.user_id === user.id) {
            addNotification(newNotif);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const updated = payload.new as NotificationItem;
          updateNotification(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addNotification, updateNotification]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Category Icon & Color Mapping
  const getCategoryMeta = (category: NotificationCategory) => {
    switch (category) {
      case "orders":
        return {
          icon: Package,
          label: "Order",
          color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200",
        };
      case "payments":
        return {
          icon: Coins,
          label: "Payment",
          color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200",
        };
      case "shipping":
        return {
          icon: Plane,
          label: "Shipping",
          color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200",
        };
      case "delivery":
        return {
          icon: Truck,
          label: "Delivery",
          color: "text-green-600 bg-green-50 dark:bg-green-950/50 border-green-200",
        };
      case "returns":
      case "refunds":
        return {
          icon: RotateCcw,
          label: "Refund",
          color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200",
        };
      case "support":
        return {
          icon: MessageCircle,
          label: "Support",
          color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50 border-sky-200",
        };
      case "security":
        return {
          icon: ShieldAlert,
          label: "Security",
          color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200",
        };
      case "promotions":
      default:
        return {
          icon: Sparkles,
          label: "Promotion",
          color: "text-[#FF1028] bg-red-50 dark:bg-red-950/50 border-red-200",
        };
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read_at) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.action_url) {
      router.push(notif.action_url);
    } else {
      router.push(
        variant === "admin"
          ? "/admin/notifications"
          : "/account/notifications"
      );
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (n.archived_at || n.is_deleted) return false;
    if (filter === "unread") return !n.read_at;
    return true;
  });

  const hasHighPriority = notifications.some(
    (n) => !n.read_at && (n.priority === "high" || n.priority === "urgent")
  );

  return (
    <div className={cn("relative", className)} ref={popoverRef}>
      {/* ── Notification Bell Trigger Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer group shadow-2xs hover:shadow-sm",
          variant === "admin"
            ? "bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#2F65F6] hover:border-blue-300"
            : "bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-red-400 hover:shadow-[0_0_16px_rgba(255,16,40,0.15)] text-slate-700 hover:text-[#FF1028]",
          isOpen && "ring-2 ring-[#FF1028]/20 border-[#FF1028]/60 bg-white"
        )}
        aria-label={`Notifications ${isMounted ? `(${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell
          className={cn(
            "w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:scale-110",
            isRinging && "animate-bounce text-[#FF1028]",
            unreadCount > 0
              ? "text-slate-800 group-hover:text-[#FF1028]"
              : "text-slate-600"
          )}
        />

        {/* Live Unread Badge */}
        {isMounted && unreadCount > 0 && (
          <span
            suppressHydrationWarning
            className={cn(
              "absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#FF1028] text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border-2 border-white shadow-xs animate-in zoom-in-50",
              hasHighPriority && "animate-pulse"
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Notification Popover ── */}
      {isOpen && (
        <div
          className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-14 sm:top-full mt-2 max-w-[390px] sm:w-[390px] mx-auto sm:mx-0 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 font-sans"
          role="dialog"
          aria-label="Notification Center Dropdown"
        >
          {/* Popover Header */}
          <div className="p-3.5 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#00143D] dark:text-white uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#FF1028]" />
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="bg-[#FF1028] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={
                    soundEnabled
                      ? "Mute notification sounds"
                      : "Unmute notification sounds"
                  }
                  aria-label={
                    soundEnabled
                      ? "Mute notification sounds"
                      : "Unmute notification sounds"
                  }
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* Mark All Read */}
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-[#2F65F6] hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills (All / Unread) */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  filter === "all"
                    ? "bg-[#00143D] text-white shadow-2xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700"
                )}
              >
                All ({notifications.filter((n) => !n.archived_at).length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                  filter === "unread"
                    ? "bg-[#FF1028] text-white shadow-2xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700"
                )}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span
                    className={cn(
                      "px-1 py-0.2 rounded-full text-[9px] font-black",
                      filter === "unread"
                        ? "bg-white/20 text-white"
                        : "bg-red-100 text-[#FF1028]"
                    )}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Popover List Feed */}
          <div className="max-h-[360px] sm:max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2.5">
                <div className="w-6 h-6 border-2 border-[#FF1028] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-medium">Syncing live alerts...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {filter === "unread"
                    ? "No unread alerts"
                    : "All caught up!"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto">
                  {filter === "unread"
                    ? "You have reviewed all current notifications."
                    : "No new activity on your orders or sourcing updates."}
                </p>
                {filter === "unread" && (
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="mt-2 text-xs font-bold text-[#2F65F6] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>View all notifications</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const meta = getCategoryMeta(notif.category);
                const IconComponent = meta.icon;
                const isUnread = !notif.read_at;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "p-3.5 transition-colors cursor-pointer flex items-start gap-3 text-left group relative",
                      isUnread
                        ? "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    )}
                  >
                    {/* Category Icon Badge */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5",
                        meta.color
                      )}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={cn(
                              "text-xs font-bold truncate block",
                              isUnread
                                ? "text-[#00143D] dark:text-white"
                                : "text-slate-700 dark:text-slate-300"
                            )}
                          >
                            {notif.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#FF1028]" />
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {notif.body}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTimeAgo(notif.created_at)}
                          </span>
                          {(notif.priority === "high" ||
                            notif.priority === "urgent") && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-red-100 text-[#FF1028] rounded">
                              {notif.priority}
                            </span>
                          )}
                        </div>

                        {/* Inline Actions (Read & Dismiss) */}
                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.id);
                              }}
                              className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 transition-colors"
                              title="Mark as read"
                              aria-label="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notif.id);
                            }}
                            className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Dismiss notification"
                            aria-label="Dismiss notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {notif.action_label && (
                        <div className="pt-0.5">
                          <span className="text-[10px] font-bold text-[#FF1028] group-hover:underline inline-flex items-center gap-0.5">
                            <span>{notif.action_label}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-2.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <Link
              href={
                variant === "admin"
                  ? "/admin/notifications"
                  : "/account/notifications/preferences"
              }
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>Preferences</span>
            </Link>

            <Link
              href={
                variant === "admin"
                  ? "/admin/notifications"
                  : "/account/notifications"
              }
              onClick={() => setIsOpen(false)}
              className="font-black text-[#FF1028] hover:underline flex items-center gap-1 text-[11px] font-heading uppercase tracking-wider cursor-pointer"
            >
              <span>Notification Center</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
