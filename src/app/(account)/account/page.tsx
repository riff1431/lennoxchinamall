"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Truck,
  Heart,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Coins,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  Bell,
  Star,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";
import { MOCK_ORDERS, MOCK_PRODUCTS } from "@/lib/mockData";
import { formatCurrency, formatTimeAgo } from "@/utils/helpers";
import { ProductCard } from "@/components/product/ProductCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { getUserNotifications } from "@/app/actions/notifications";
import { NotificationItem } from "@/types/notifications";
import { createClient } from "@/lib/supabase/client";

export default function AccountDashboardPage() {
  const { user, displayName } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getUserNotifications({ limit: 4 })
      .then((res) => {
        if (isMounted && res.success && res.notifications) {
          setNotifications(res.notifications);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingNotifs(false);
      });

    const supabase = createClient();
    const channel = supabase
      .channel("account_feed_notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          getUserNotifications({ limit: 4 }).then((res) => {
            if (isMounted && res.success && res.notifications) {
              setNotifications(res.notifications);
            }
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const recentOrders = MOCK_ORDERS.slice(0, 2);
  const recentlyViewed = MOCK_PRODUCTS.slice(0, 4);

  const greetingName = displayName || user?.email?.split("@")[0] || "Valued Buyer";

  return (
    <div className="space-y-8">
      {/* ── 1. Top Welcome & VIP Buyer Hero ── */}
      <div className="bg-gradient-to-r from-[#00143D] to-[#002366] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider font-heading">
              VIP BUYER TIER
            </span>
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> USDT Verified Account
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Welcome back, {greetingName}
          </h1>
          <p className="text-xs text-slate-300">
            Manage your China factory purchase orders, live air freight tracking, and saved delivery addresses.
          </p>
        </div>

        {/* USDT Escrow & Sourcing Status Pill */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shrink-0 space-y-1 text-xs">
          <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider block">
            Binance Pay Settlement Status
          </span>
          <span className="text-base font-black text-[#10B981] flex items-center gap-1.5 price-tag">
            <Coins className="w-4 h-4" /> Zero-Fee Active Escrow
          </span>
          <span className="text-[10px] text-slate-300 block">
            Direct refund protection enabled
          </span>
        </div>
      </div>

      {/* ── 2. Quick Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/account/orders"
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#00143D] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-[#00143D]">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl font-black text-[#00143D]">{MOCK_ORDERS.length} Orders</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">1 currently in air transit</span>
        </Link>

        <Link
          href="/account/orders"
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#FF1028] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-[#FF1028]">
              Air Shipments
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#FF1028] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl font-black text-[#FF1028]">1 Active</span>
          <span className="text-[10px] text-[#10B981] font-bold block mt-0.5">Est. Arrival: 4 Days</span>
        </Link>

        <Link
          href="/account/wishlist"
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#FF1028] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-[#FF1028]">
              Wishlist Items
            </span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl font-black text-slate-900">4 Saved</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">2 currently on flash drop</span>
        </Link>

        <Link
          href="/account/support"
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#00143D] hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-[#00143D]">
              Support Desk
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl font-black text-slate-900">0 Open</span>
          <span className="text-[10px] text-[#10B981] font-bold block mt-0.5">24/7 Agent Available</span>
        </Link>
      </div>

      {/* ── 3. Live Shipment Tracker & Recent Orders ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-[#00143D] flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Live Air Freight Shipment Tracker</span>
            </h2>
            <span className="text-xs text-slate-500">
              Tracking Number: <strong>YUN-982741920-US</strong> (YunExpress International Air Express)
            </span>
          </div>

          <Link
            href="/account/orders"
            className="text-xs font-black text-[#FF1028] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5-Step Visual Shipment Timeline */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center mx-auto text-xs font-black shadow-xs">
                ✓
              </div>
              <span className="text-[11px] font-bold text-slate-800 block">USDT Paid</span>
              <span className="text-[9px] text-slate-400">Aug 22, 10:14</span>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center mx-auto text-xs font-black shadow-xs">
                ✓
              </div>
              <span className="text-[11px] font-bold text-slate-800 block">QC Checked</span>
              <span className="text-[9px] text-slate-400">Aug 22, 16:30</span>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#FF1028] text-white flex items-center justify-center mx-auto text-xs font-black shadow-xs animate-pulse">
                ✈️
              </div>
              <span className="text-[11px] font-black text-[#FF1028] block">Air Flight</span>
              <span className="text-[9px] text-red-500 font-bold">In Transit</span>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto text-xs font-black">
                4
              </div>
              <span className="text-[11px] font-bold text-slate-400 block">Customs Clearance</span>
              <span className="text-[9px] text-slate-400">DDP Handled</span>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto text-xs font-black">
                5
              </div>
              <span className="text-[11px] font-bold text-slate-400 block">Delivered</span>
              <span className="text-[9px] text-slate-400">San Francisco, CA</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Latest Dispatch Scan: <strong>Departed Hong Kong International Air Hub (Flight CX872)</strong></span>
            </span>
            <span className="text-[#10B981] font-bold">On Schedule</span>
          </div>
        </div>
      </div>

      {/* ── 4. Notifications & Order Activity Feed ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-[#00143D] flex items-center gap-2 font-heading">
            <Bell className="w-5 h-5 text-[#FF1028]" />
            <span>Sourcing Notifications & Order Updates</span>
          </h2>
          <Link
            href="/account/notifications"
            className="text-xs font-black text-[#FF1028] hover:underline flex items-center gap-1 font-heading uppercase"
          >
            <span>View All Inbox ({notifications.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {loadingNotifs ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No active notifications.</div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.read_at;
              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-colors flex items-start justify-between gap-4 ${
                    isUnread
                      ? "bg-red-50/30 border-red-200"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      {isUnread && (
                        <span className="bg-[#FF1028] text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.body}</p>
                    {notif.action_url && (
                      <Link
                        href={notif.action_url}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF1028] hover:underline pt-0.5"
                      >
                        <span>{notif.action_label || "View Details"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0 font-mono">
                    {formatTimeAgo(notif.created_at)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── 5. Recently Viewed Hardware Products ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-[#00143D]">
            Recently Viewed Factory Products
          </h2>
          <Link
            href="/categories"
            className="text-xs font-black text-[#FF1028] hover:underline"
          >
            Explore Catalogue →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {recentlyViewed.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
