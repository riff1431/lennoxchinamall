"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Package,
  Coins,
  Plane,
  Truck,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Sliders,
  Volume2,
  VolumeX,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/app/actions/notifications";
import { NotificationItem, NotificationCategory } from "@/types/notifications";
import { formatTimeAgo, cn } from "@/utils/helpers";

interface NotificationBellProps {
  variant?: "storefront" | "admin";
  className?: string;
}

export function NotificationBell({ variant = "storefront", className }: NotificationBellProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Play audio chime for new live notification
  const playChime = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  }, [soundEnabled]);

  // Load notifications from server
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getUserNotifications({ limit: 8 });
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, user?.id]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          // If message is for this user or broadcast
          if (!newNotif.user_id || !user || newNotif.user_id === user.id) {
            setNotifications((prev) => [newNotif, ...prev.slice(0, 7)]);
            setUnreadCount((c) => c + 1);
            playChime();
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
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          if (updated.read_at) {
            setUnreadCount((c) => Math.max(0, c - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, playChime]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
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

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    setUnreadCount(0);
    await markAllNotificationsAsRead();
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read_at) {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.action_url) {
      router.push(notif.action_url);
    } else {
      router.push(variant === "admin" ? "/admin/notifications" : "/account/notifications");
    }
  };

  // Category Icon & Color Mapping
  const getCategoryMeta = (category: NotificationCategory) => {
    switch (category) {
      case "orders":
        return { icon: Package, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200" };
      case "payments":
        return { icon: Coins, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200" };
      case "shipping":
        return { icon: Plane, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200" };
      case "delivery":
        return { icon: Truck, color: "text-green-600 bg-green-50 dark:bg-green-950/50 border-green-200" };
      case "returns":
      case "refunds":
        return { icon: RotateCcw, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200" };
      case "support":
        return { icon: MessageCircle, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50 border-sky-200" };
      case "security":
        return { icon: ShieldAlert, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200" };
      case "promotions":
      default:
        return { icon: Sparkles, color: "text-[#FF1028] bg-red-50 dark:bg-red-950/50 border-red-200" };
    }
  };

  return (
    <div className={cn("relative", className)} ref={popoverRef}>
      {/* ── Notification Bell Trigger Button (Premium Glass Pill) ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer group shadow-2xs hover:shadow-sm",
          variant === "admin"
            ? "bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#2F65F6] hover:border-blue-300"
            : "bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-red-300 text-slate-700 hover:text-[#FF1028]"
        )}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell className={cn("w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:scale-110", unreadCount > 0 ? "text-slate-800 group-hover:text-[#FF1028]" : "text-slate-600")} />

        {/* Live Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#FF1028] text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border-2 border-white shadow-xs animate-in zoom-in-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Notification Preview Popover ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 font-sans">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#00143D] dark:text-white uppercase tracking-wider font-heading">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-[#FF1028] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                title={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-bold text-[#2F65F6] hover:underline flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>
          </div>

          {/* List Feed */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-[#FF1028] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Syncing live alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="font-bold text-slate-600 dark:text-slate-300">All caught up!</p>
                <p className="text-[11px]">No unread updates on your orders or sourcing.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const meta = getCategoryMeta(notif.category);
                const IconComponent = meta.icon;
                const isUnread = !notif.read_at;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "p-3.5 transition-colors cursor-pointer flex items-start gap-3 text-left group",
                      isUnread
                        ? "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    )}
                  >
                    {/* Category Icon Badge */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                        meta.color
                      )}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "text-xs font-bold truncate block",
                            isUnread ? "text-[#00143D] dark:text-white" : "text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {notif.title}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#FF1028] shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {notif.body}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatTimeAgo(notif.created_at)}
                        </span>
                        {notif.action_label && (
                          <span className="text-[10px] font-bold text-[#FF1028] group-hover:underline flex items-center gap-0.5">
                            <span>{notif.action_label}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All Link */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <Link
              href={variant === "admin" ? "/admin/notifications" : "/account/notifications/preferences"}
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] font-bold flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Preferences</span>
            </Link>

            <Link
              href={variant === "admin" ? "/admin/notifications" : "/account/notifications"}
              onClick={() => setIsOpen(false)}
              className="font-black text-[#FF1028] hover:underline flex items-center gap-1 text-[11px] font-heading uppercase tracking-wider"
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
