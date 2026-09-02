"use client";

import { create } from "zustand";
import { NotificationItem } from "@/types/notifications";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/app/actions/notifications";

const READ_IDS_KEY = "lennox_notifications_read_ids";
const DISMISSED_IDS_KEY = "lennox_notifications_dismissed_ids";
const SOUND_KEY = "lennox_notif_sound";

function getStoredIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredIds(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  filter: "all" | "unread";
  soundEnabled: boolean;
  isRinging: boolean;
  hasLoaded: boolean;
  readIds: string[];
  dismissedIds: string[];

  setFilter: (filter: "all" | "unread") => void;
  setSoundEnabled: (enabled: boolean) => void;
  playChime: () => void;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: NotificationItem) => void;
  updateNotification: (notification: NotificationItem) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  filter: "all",
  soundEnabled: true,
  isRinging: false,
  hasLoaded: false,
  readIds: [],
  dismissedIds: [],

  setFilter: (filter) => set({ filter }),

  setSoundEnabled: (enabled) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SOUND_KEY, String(enabled));
    }
    set({ soundEnabled: enabled });
  },

  playChime: () => {
    if (!get().soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);

      // Trigger bell ring animation
      set({ isRinging: true });
      setTimeout(() => set({ isRinging: false }), 1000);
    } catch {
      // AudioContext unavailable or blocked by browser autoplay policy
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true });

    // Load persisted local read and dismissed IDs & sound setting
    const storedReadIds = getStoredIds(READ_IDS_KEY);
    const storedDismissedIds = getStoredIds(DISMISSED_IDS_KEY);
    let soundSetting = true;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(SOUND_KEY);
        if (raw !== null) soundSetting = raw !== "false";
      } catch {}
    }
    set({ readIds: storedReadIds, dismissedIds: storedDismissedIds, soundEnabled: soundSetting });

    try {
      const res = await getUserNotifications({ limit: 15 });
      if (res.success && res.notifications) {
        const now = new Date().toISOString();

        // 1. Filter out dismissed notifications
        const activeNotifs = res.notifications
          .filter((n) => !storedDismissedIds.includes(n.id) && !n.is_deleted)
          .map((n) => {
            // 2. If marked read locally or in DB, persist read_at
            if (storedReadIds.includes(n.id)) {
              return { ...n, read_at: n.read_at || now };
            }
            return n;
          });

        const unread = activeNotifs.filter((n) => !n.read_at && !n.archived_at).length;

        set({
          notifications: activeNotifs,
          unreadCount: unread,
          hasLoaded: true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch notifications in store:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  addNotification: (notification) => {
    const { dismissedIds, readIds, soundEnabled, notifications, unreadCount } = get();

    // Ignore if dismissed
    if (dismissedIds.includes(notification.id) || notification.is_deleted) return;

    // Check duplicate
    if (notifications.some((n) => n.id === notification.id)) return;

    const isRead = !!notification.read_at || readIds.includes(notification.id);
    const finalNotif: NotificationItem = {
      ...notification,
      read_at: isRead ? notification.read_at || new Date().toISOString() : null,
    };

    const updated = [finalNotif, ...notifications];
    const isUnread = !finalNotif.read_at && !finalNotif.archived_at;

    set({
      notifications: updated,
      unreadCount: isUnread ? unreadCount + 1 : unreadCount,
    });

    if (soundEnabled && isUnread) {
      get().playChime();
    }
  },

  updateNotification: (notification) => {
    const { dismissedIds, readIds, notifications } = get();
    if (dismissedIds.includes(notification.id) || notification.is_deleted) {
      set({
        notifications: notifications.filter((n) => n.id !== notification.id),
      });
      return;
    }

    const isRead = !!notification.read_at || readIds.includes(notification.id);
    const finalNotif: NotificationItem = {
      ...notification,
      read_at: isRead ? notification.read_at || new Date().toISOString() : null,
    };

    const updated = notifications.map((n) =>
      n.id === notification.id ? finalNotif : n
    );
    const unread = updated.filter((n) => !n.read_at && !n.archived_at).length;

    set({
      notifications: updated,
      unreadCount: unread,
    });
  },

  markAsRead: async (id) => {
    const { readIds, notifications, unreadCount } = get();
    const newReadIds = Array.from(new Set([...readIds, id]));
    saveStoredIds(READ_IDS_KEY, newReadIds);

    const now = new Date().toISOString();
    let countDelta = 0;
    const updated = notifications.map((n) => {
      if (n.id === id) {
        if (!n.read_at) countDelta = 1;
        return { ...n, read_at: n.read_at || now };
      }
      return n;
    });

    set({
      readIds: newReadIds,
      notifications: updated,
      unreadCount: Math.max(0, unreadCount - countDelta),
    });

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  },

  markAllAsRead: async () => {
    const { notifications, readIds } = get();
    const now = new Date().toISOString();
    const allIds = notifications.map((n) => n.id);
    const newReadIds = Array.from(new Set([...readIds, ...allIds]));
    saveStoredIds(READ_IDS_KEY, newReadIds);

    set({
      readIds: newReadIds,
      notifications: notifications.map((n) => ({
        ...n,
        read_at: n.read_at || now,
      })),
      unreadCount: 0,
    });

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  },

  dismissNotification: async (id) => {
    const { dismissedIds, notifications, unreadCount } = get();
    const newDismissedIds = Array.from(new Set([...dismissedIds, id]));
    saveStoredIds(DISMISSED_IDS_KEY, newDismissedIds);

    const target = notifications.find((n) => n.id === id);
    const wasUnread = target && !target.read_at && !target.archived_at;

    set({
      dismissedIds: newDismissedIds,
      notifications: notifications.filter((n) => n.id !== id),
      unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount,
    });

    try {
      await deleteNotification(id);
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  },
}));
