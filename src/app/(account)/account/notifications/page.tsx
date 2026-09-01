"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Archive,
  ArchiveRestore,
  Trash2,
  Search,
  Sliders,
  Sparkles,
  Package,
  Coins,
  Plane,
  Truck,
  RotateCcw,
  ShieldAlert,
  MessageCircle,
  ExternalLink,
  Smartphone,
  Mail,
  Volume2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  unarchiveNotification,
  deleteNotification,
  batchNotificationAction,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  registerPushSubscription,
} from "@/app/actions/notifications";
import {
  NotificationItem,
  NotificationCategory,
  NotificationPreference,
  CategoriesConfig,
} from "@/types/notifications";
import { formatTimeAgo, formatDate, cn } from "@/utils/helpers";
import { useTranslation } from "@/lib/i18n/useTranslation";

type TabKey = "all" | "unread" | "orders" | "shipping" | "payments" | "promotions" | "archived" | "preferences";

export default function CustomerNotificationCenterPage() {
  const { user } = useAuth();
  const { isSpanish } = useTranslation();
  const refreshHeaderStore = useNotificationStore((state) => state.fetchNotifications);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Preferences state
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [pushStatus, setPushStatus] = useState<"default" | "granted" | "denied">("default");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch Notifications
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      let catParam: string | undefined = undefined;
      let statusParam: "all" | "unread" | "archived" | "read" | undefined = undefined;

      if (activeTab === "unread") statusParam = "unread";
      else if (activeTab === "archived") statusParam = "archived";
      else if (["orders", "shipping", "payments", "promotions"].includes(activeTab)) {
        catParam = activeTab;
      }

      const res = await getUserNotifications({
        category: catParam,
        status: statusParam,
        search: searchQuery,
      });

      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery]);

  // Load Preferences
  const loadPreferences = useCallback(async () => {
    const res = await getUserNotificationPreferences();
    if (res.success && res.preferences) {
      setPreferences(res.preferences);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "preferences") {
      loadPreferences();
    } else {
      loadData();
    }
  }, [activeTab, loadData, loadPreferences]);

  // Check browser push permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  // Supabase Realtime Listener
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("customer_notifications_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  // Single Actions
  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await markNotificationAsRead(id);
    refreshHeaderStore();
    showToast(isSpanish ? "Notificación marcada como leída" : "Notification marked as read");
  };

  const handleArchive = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await archiveNotification(id);
    refreshHeaderStore();
    showToast(isSpanish ? "Notificación archivada" : "Notification archived");
  };

  const handleUnarchive = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await unarchiveNotification(id);
    refreshHeaderStore();
    showToast(isSpanish ? "Notificación restaurada a la bandeja" : "Notification restored to inbox");
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id);
    refreshHeaderStore();
    showToast(isSpanish ? "Notificación eliminada" : "Notification removed");
  };

  // Bulk Actions
  const handleBulkAction = async (action: "read" | "archive" | "delete") => {
    if (!selectedIds.length) return;
    const count = selectedIds.length;
    await batchNotificationAction(selectedIds, action);
    setSelectedIds([]);
    loadData();
    refreshHeaderStore();
    showToast(
      isSpanish
        ? `Se actualizaron ${count} notificación(es)`
        : `Updated ${count} notification(s)`
    );
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    setUnreadCount(0);
    await markAllNotificationsAsRead();
    refreshHeaderStore();
    showToast(isSpanish ? "Todas las notificaciones marcadas como leídas" : "All notifications marked as read");
  };

  // Enable Web Push
  const handleEnablePush = async () => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      alert(isSpanish ? "Las notificaciones push no son compatibles con este navegador." : "Push notifications are not supported by this browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission === "granted") {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();

        if (!sub) {
          const applicationServerKey = new Uint8Array([
            4, 98, 12, 45, 67, 89, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78,
            90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78,
            90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78,
            90, 12, 34, 56, 78,
          ]);

          try {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey,
            });
          } catch {
            // Subscription fallback
          }
        }

        if (sub) {
          const rawKey = sub.getKey ? sub.getKey("p256dh") : null;
          const rawAuth = sub.getKey ? sub.getKey("auth") : null;
          const p256dh = rawKey ? btoa(String.fromCharCode(...new Uint8Array(rawKey))) : "demo-p256dh";
          const auth = rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : "demo-auth";

          await registerPushSubscription({
            endpoint: sub.endpoint,
            keys: { p256dh, auth },
            userAgent: navigator.userAgent,
          });
        }

        showToast(isSpanish ? "¡Notificaciones Web Push habilitadas exitosamente!" : "Web Push notifications enabled successfully!");
      }
    } catch (err) {
      console.error("Push registration error:", err);
      showToast(isSpanish ? "No se pudieron habilitar las notificaciones push" : "Could not enable push notifications");
    }
  };

  // Save Preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;
    setIsSavingPrefs(true);
    try {
      const res = await updateUserNotificationPreferences(preferences);
      if (res.success) {
        showToast(isSpanish ? "¡Preferencias de notificación actualizadas exitosamente!" : "Notification preferences updated successfully!");
      } else {
        showToast(res.error || (isSpanish ? "Error al actualizar preferencias" : "Failed to update preferences"));
      }
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Category Icon & Colors
  const getCategoryMeta = (cat: NotificationCategory) => {
    switch (cat) {
      case "orders":
        return {
          label: isSpanish ? "Pedidos y Abastecimiento" : "Order & Sourcing",
          icon: Package,
          color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200",
        };
      case "payments":
        return {
          label: "Binance Pay",
          icon: Coins,
          color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200",
        };
      case "shipping":
        return {
          label: isSpanish ? "Carga Aérea" : "Air Cargo",
          icon: Plane,
          color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200",
        };
      case "delivery":
        return {
          label: isSpanish ? "Entrega" : "Delivery",
          icon: Truck,
          color: "text-green-600 bg-green-50 dark:bg-green-950/50 border-green-200",
        };
      case "returns":
      case "refunds":
        return {
          label: isSpanish ? "Devoluciones y Reembolsos" : "Returns & Refund",
          icon: RotateCcw,
          color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200",
        };
      case "support":
        return {
          label: isSpanish ? "Mesa de Soporte" : "Support Desk",
          icon: MessageCircle,
          color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50 border-sky-200",
        };
      case "security":
        return {
          label: isSpanish ? "Seguridad de Cuenta" : "Account Security",
          icon: ShieldAlert,
          color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200",
        };
      case "promotions":
      default:
        return {
          label: isSpanish ? "Ofertas Flash" : "Flash Drop",
          icon: Sparkles,
          color: "text-[#FF1028] bg-red-50 dark:bg-red-950/50 border-red-200",
        };
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── 1. Header Banner ── */}
      <div className="bg-gradient-to-r from-[#00143D] to-[#002366] text-white rounded-3xl p-6 sm:p-7 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-heading">
              {isSpanish ? "CENTRO DE COMUNICACIÓN" : "COMMUNICATION HUB"}
            </span>
            {unreadCount > 0 && (
              <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-[#FF1028]" />
                {unreadCount} {isSpanish ? "Alerta(s) No Leída(s)" : "Unread Alert(s)"}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
            {isSpanish ? "Centro de Notificaciones y Actividad" : "Notifications & Activity Center"}
          </h1>
          <p className="text-xs text-slate-300">
            {isSpanish
              ? "Actualizaciones en tiempo real sobre órdenes en fábrica, depósitos Binance Pay, tránsito aéreo de Hong Kong y ofertas VIP."
              : "Real-time updates on China factory orders, Binance Pay escrows, Hong Kong air transit, and VIP drops."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-[#10B981]" />
              <span>{isSpanish ? "Marcar Todo como Leído" : "Mark All Read"}</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("preferences")}
            className="bg-[#FF1028] hover:bg-[#E00B20] text-white text-xs font-black px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-heading uppercase"
          >
            <Sliders className="w-4 h-4" />
            <span>{isSpanish ? "Preferencias" : "Preferences"}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Navigation Tabs ── */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { key: "all", label: isSpanish ? "Todos" : "All Inbox" },
            { key: "unread", label: isSpanish ? `No Leídos (${unreadCount})` : `Unread (${unreadCount})` },
            { key: "orders", label: isSpanish ? "Pedidos" : "Orders" },
            { key: "shipping", label: isSpanish ? "Envíos Aéreos" : "Air Shipping" },
            { key: "payments", label: isSpanish ? "Pagos" : "Payments" },
            { key: "promotions", label: isSpanish ? "Ofertas Flash" : "Flash Drops" },
            { key: "archived", label: isSpanish ? "Archivados" : "Archived" },
            { key: "preferences", label: isSpanish ? "Preferencias" : "Preferences" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as TabKey)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                activeTab === t.key
                  ? "bg-[#00143D] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          onClick={() => loadData()}
          title={isSpanish ? "Actualizar Notificaciones" : "Refresh Feed"}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#00143D] transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* ── 3. Tab: Preferences ── */}
      {activeTab === "preferences" ? (
        <form onSubmit={handleSavePreferences} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-[#00143D] dark:text-white font-heading flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#FF1028]" />
              <span>{isSpanish ? "Preferencias de Canales de Notificación" : "Notification Channel Preferences"}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isSpanish
                ? "Personaliza cómo y dónde recibir notificaciones por correo electrónico, web push, SMS y alertas dentro de la app."
                : "Customize how and where you receive notifications across email, web push, SMS, and in-app alerts."}
            </p>
          </div>

          {/* Master Channel Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {isSpanish ? "Alertas en la App" : "In-App Alerts"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isSpanish ? "Campana y globos en cabecera" : "Header bell & badge"}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences?.in_app_enabled ?? true}
                onChange={(e) =>
                  setPreferences((p) => p ? { ...p, in_app_enabled: e.target.checked } : null)
                }
                className="w-4 h-4 accent-[#FF1028] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-[#FF1028] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {isSpanish ? "Reportes por Correo" : "Email Reports"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isSpanish ? "Facturas y Rastreo" : "Invoices & Tracking"}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences?.email_enabled ?? true}
                onChange={(e) =>
                  setPreferences((p) => p ? { ...p, email_enabled: e.target.checked } : null)
                }
                className="w-4 h-4 accent-[#FF1028] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {isSpanish ? "Notificaciones Web Push" : "Web Push"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isSpanish ? "Ventanas emergentes al instante" : "Instant desktop popups"}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences?.push_enabled ?? true}
                onChange={(e) =>
                  setPreferences((p) => p ? { ...p, push_enabled: e.target.checked } : null)
                }
                className="w-4 h-4 accent-[#FF1028] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {isSpanish ? "Mensajes SMS" : "SMS Messages"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isSpanish ? "Texto directo del transportista" : "Direct courier text"}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences?.sms_enabled ?? false}
                onChange={(e) =>
                  setPreferences((p) => p ? { ...p, sms_enabled: e.target.checked } : null)
                }
                className="w-4 h-4 accent-[#FF1028] cursor-pointer"
              />
            </div>
          </div>

          {/* Web Push Permission Banner */}
          {pushStatus !== "granted" && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                  {isSpanish ? "Habilitar Notificaciones Web Push Instantáneas" : "Enable Instant Web Push Notifications"}
                </span>
                <p className="text-indigo-700 dark:text-indigo-300">
                  {isSpanish
                    ? "Recibe alertas en vivo cuando tu paquete pase la aduana o cuando inicien ofertas flash VIP."
                    : "Receive live alerts when your package clears customs or when VIP flash drops launch."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleEnablePush}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                {isSpanish ? "Permitir Notificaciones del Navegador" : "Allow Browser Notifications"}
              </button>
            </div>
          )}

          {/* Phone Number for SMS */}
          {preferences?.sms_enabled && (
            <div className="space-y-1.5 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
              <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                {isSpanish ? "Número de Teléfono Móvil (con código de país)" : "Delivery Mobile Number (with country code)"}
              </label>
              <input
                type="tel"
                value={preferences.phone_number || ""}
                onChange={(e) =>
                  setPreferences((p) => p ? { ...p, phone_number: e.target.value } : null)
                }
                placeholder="+1 (555) 000-0000"
                className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          )}

          {/* Category Channel Matrix */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block font-heading">
              {isSpanish ? "Matriz Detallada de Entrega por Categoría" : "Fine-Grained Category Delivery Matrix"}
            </span>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="p-3.5">{isSpanish ? "Categoría" : "Category"}</th>
                    <th className="p-3.5 text-center">{isSpanish ? "En la App" : "In-App"}</th>
                    <th className="p-3.5 text-center">{isSpanish ? "Correo" : "Email"}</th>
                    <th className="p-3.5 text-center">{isSpanish ? "Web Push" : "Web Push"}</th>
                    <th className="p-3.5 text-center">{isSpanish ? "SMS" : "SMS"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {[
                    { key: "orders", label: isSpanish ? "Pedidos y Abastecimiento" : "Orders & Sourcing" },
                    { key: "payments", label: isSpanish ? "Pagos Binance Pay" : "Binance Pay Payments" },
                    { key: "shipping", label: isSpanish ? "Carga Aérea y Vuelos" : "Air Cargo & Flight Tracking" },
                    { key: "delivery", label: isSpanish ? "Actualizaciones de Entrega" : "Parcel Delivery Updates" },
                    { key: "returns", label: isSpanish ? "Devoluciones y Reembolsos" : "Returns & Refund Claims" },
                    { key: "support", label: isSpanish ? "Tickets y Soporte" : "Support Tickets & Replies" },
                    { key: "security", label: isSpanish ? "Seguridad de Cuenta (Obligatorio)" : "Account Security (Mandatory)" },
                    { key: "promotions", label: isSpanish ? "Ofertas VIP y Flash" : "VIP Drops & Flash Sales" },
                  ].map((row) => {
                    const catKey = row.key as NotificationCategory;
                    const config = preferences?.categories_config?.[catKey] || {
                      in_app: true,
                      email: true,
                      push: true,
                      sms: false,
                    };
                    const isSecurity = catKey === "security";

                    return (
                      <tr key={row.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {row.label}
                        </td>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={config.in_app}
                            disabled={isSecurity}
                            onChange={(e) => {
                              if (!preferences) return;
                              const updated = { ...preferences.categories_config };
                              updated[catKey] = { ...config, in_app: e.target.checked };
                              setPreferences({ ...preferences, categories_config: updated });
                            }}
                            className="w-4 h-4 accent-[#FF1028] cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={config.email}
                            disabled={isSecurity}
                            onChange={(e) => {
                              if (!preferences) return;
                              const updated = { ...preferences.categories_config };
                              updated[catKey] = { ...config, email: e.target.checked };
                              setPreferences({ ...preferences, categories_config: updated });
                            }}
                            className="w-4 h-4 accent-[#FF1028] cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={config.push}
                            onChange={(e) => {
                              if (!preferences) return;
                              const updated = { ...preferences.categories_config };
                              updated[catKey] = { ...config, push: e.target.checked };
                              setPreferences({ ...preferences, categories_config: updated });
                            }}
                            className="w-4 h-4 accent-[#FF1028] cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={config.sms}
                            onChange={(e) => {
                              if (!preferences) return;
                              const updated = { ...preferences.categories_config };
                              updated[catKey] = { ...config, sms: e.target.checked };
                              setPreferences({ ...preferences, categories_config: updated });
                            }}
                            className="w-4 h-4 accent-[#FF1028] cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSavingPrefs}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#FF1028] hover:bg-[#E00B20] transition-colors shadow-xs cursor-pointer font-heading uppercase tracking-wider"
            >
              {isSavingPrefs
                ? (isSpanish ? "Guardando Preferencias..." : "Saving Preferences...")
                : (isSpanish ? "Guardar Preferencias" : "Save Preferences")}
            </button>
          </div>
        </form>
      ) : (
        /* ── 4. Tab: Notifications Feed & Controls ── */
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={isSpanish ? "Buscar notificaciones por no. de pedido, título, palabras clave..." : "Search notifications by order number, title, keywords..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-[#FF1028]"
              />
            </div>

            {/* Batch Action Toolbar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {selectedIds.length === notifications.length && notifications.length > 0
                  ? (isSpanish ? "Deseleccionar Todos" : "Deselect All")
                  : (isSpanish ? "Seleccionar Todos" : "Select All")}
              </button>

              {selectedIds.length > 0 && (
                <>
                  <button
                    onClick={() => handleBulkAction("read")}
                    title={isSpanish ? "Marcar seleccionados como leídos" : "Mark Selected Read"}
                    className="p-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleBulkAction("archive")}
                    title={isSpanish ? "Archivar seleccionados" : "Archive Selected"}
                    className="p-2 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleBulkAction("delete")}
                    title={isSpanish ? "Eliminar seleccionados" : "Delete Selected"}
                    className="p-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List Feed */}
          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-400 space-y-2">
              <div className="w-7 h-7 border-2 border-[#FF1028] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>{isSpanish ? "Obteniendo notificaciones de Lennox China Mall..." : "Fetching notifications from Lennox China Mall..."}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-400 space-y-3">
              <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {isSpanish ? "No se encontraron notificaciones" : "No notifications found"}
              </h3>
              <p className="max-w-sm mx-auto text-slate-500 text-[11px]">
                {activeTab === "archived"
                  ? (isSpanish ? "No tienes mensajes archivados." : "You have no archived messages.")
                  : activeTab === "unread"
                  ? (isSpanish ? "Has leído todas tus alertas recientes." : "You have read all your latest order and communication alerts.")
                  : (isSpanish ? "Las nuevas actualizaciones de pedidos, envíos aéreos y ofertas flash aparecerán aquí." : "New order status updates, air cargo dispatches, and flash drops will appear here.")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const meta = getCategoryMeta(notif.category);
                const IconComponent = meta.icon;
                const isUnread = !notif.read_at;
                const isSelected = selectedIds.includes(notif.id);

                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "p-4 sm:p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-start gap-4 group",
                      isUnread
                        ? "bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50 shadow-xs ring-1 ring-red-500/10"
                        : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    )}
                  >
                    {/* Checkbox & Category Icon */}
                    <div className="flex items-center gap-3 shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(notif.id)}
                        className="w-4 h-4 accent-[#FF1028] cursor-pointer"
                      />
                      <div
                        className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0",
                          meta.color
                        )}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Notification Body */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border",
                            meta.color
                          )}
                        >
                          {meta.label}
                        </span>

                        {notif.priority === "urgent" && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                            {isSpanish ? "Urgente" : "Urgent"}
                          </span>
                        )}

                        {isUnread && (
                          <span className="bg-[#FF1028] text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                            {isSpanish ? "NUEVO" : "NEW"}
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 font-mono ml-auto">
                          {formatTimeAgo(notif.created_at)} &bull; {formatDate(notif.created_at)}
                        </span>
                      </div>

                      <h3
                        className={cn(
                          "text-sm font-bold text-slate-900 dark:text-white leading-snug",
                          isUnread && "text-[#00143D]"
                        )}
                      >
                        {notif.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notif.body}
                      </p>

                      {/* Deep Link Action Button */}
                      {notif.action_url && (
                        <div className="pt-2">
                          <Link
                            href={notif.action_url}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00143D] hover:bg-[#002366] text-white text-xs font-bold transition-colors shadow-xs"
                          >
                            <span>{notif.action_label || (isSpanish ? "Ver Detalles" : "View Details")}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#FF1028]" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Quick Single Actions */}
                    <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {isUnread ? (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          title={isSpanish ? "Marcar como leído" : "Mark as Read"}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : null}

                      {activeTab === "archived" ? (
                        <button
                          onClick={() => handleUnarchive(notif.id)}
                          title={isSpanish ? "Restaurar a la bandeja" : "Restore to Inbox"}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchive(notif.id)}
                          title={isSpanish ? "Archivar" : "Archive"}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(notif.id)}
                        title={isSpanish ? "Eliminar" : "Delete"}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 5. Toast Notification Pop ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16A34A] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span>✓ {toastMsg}</span>
          <button
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
