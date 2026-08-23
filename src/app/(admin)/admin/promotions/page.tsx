"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  Zap,
  Sparkles,
  Percent,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Copy,
  Layers,
  Flame,
  TrendingUp,
  Image as ImageIcon,
  ExternalLink,
  Calendar,
  AlertCircle,
  Eye,
  Sliders,
  DollarSign,
  Gift,
} from "lucide-react";
import {
  MOCK_COUPONS,
  MOCK_BANNERS,
  MOCK_PRODUCTS,
  PromotionCoupon,
  PromotionCampaign,
} from "@/lib/mockData";
import { Product } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { FlashDealCountdown } from "@/components/common/FlashDealCountdown";

export default function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState<"coupons" | "flash" | "banners" | "curated">("coupons");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Coupons State
  const [coupons, setCoupons] = useState<PromotionCoupon[]>(MOCK_COUPONS);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percentage" | "fixed_amount" | "free_shipping">("percentage");
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinSpend, setCouponMinSpend] = useState(50);
  const [couponMaxUses, setCouponMaxUses] = useState(500);
  const [couponDesc, setCouponDesc] = useState("");
  const [couponDays, setCouponDays] = useState(30);

  // Banners State
  const [banners, setBanners] = useState<PromotionCampaign[]>(MOCK_BANNERS);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerBadge, setBannerBadge] = useState("SPECIAL DROP");
  const [bannerCtaText, setBannerCtaText] = useState("Shop with USDT");
  const [bannerCtaLink, setBannerCtaLink] = useState("/categories/consumer-electronics");
  const [bannerDiscountBadge, setBannerDiscountBadge] = useState("-35% OFF");
  const [bannerBgGradient, setBannerBgGradient] = useState("from-[#00143D] via-blue-900 to-[#00143D]");
  const [bannerImageUrl, setBannerImageUrl] = useState("https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80");

  // Flash Deals State
  const [flashProducts, setFlashProducts] = useState<Product[]>(
    MOCK_PRODUCTS.filter((p) => p.is_flash_deal)
  );
  const [allProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedFlashProdId, setSelectedFlashProdId] = useState(MOCK_PRODUCTS[0]?.id || "");
  const [isAddFlashModalOpen, setIsAddFlashModalOpen] = useState(false);

  // ─── Coupon Handlers ───
  const handleOpenCreateCoupon = () => {
    setEditingCouponId(null);
    setCouponCode(`DEAL${Math.floor(10 + Math.random() * 90)}`);
    setCouponType("percentage");
    setCouponValue(15);
    setCouponMinSpend(60);
    setCouponMaxUses(500);
    setCouponDesc("Special seasonal promotion on factory-direct items");
    setCouponDays(30);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c: PromotionCoupon) => {
    setEditingCouponId(c.id);
    setCouponCode(c.code);
    setCouponType(c.discountType);
    setCouponValue(c.value);
    setCouponMinSpend(c.minSpend);
    setCouponMaxUses(c.maxUses);
    setCouponDesc(c.description);
    setCouponDays(30);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (editingCouponId) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCouponId
            ? {
                ...c,
                code: couponCode.toUpperCase().trim(),
                discountType: couponType,
                value: couponValue,
                minSpend: couponMinSpend,
                maxUses: couponMaxUses,
                description: couponDesc,
              }
            : c
        )
      );
      setToastMsg(`Coupon "${couponCode.toUpperCase()}" updated successfully!`);
    } else {
      const newCoupon: PromotionCoupon = {
        id: `coup-${Date.now()}`,
        code: couponCode.toUpperCase().trim(),
        discountType: couponType,
        value: couponValue,
        minSpend: couponMinSpend,
        maxUses: couponMaxUses,
        usageCount: 0,
        description: couponDesc,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * couponDays).toISOString(),
        isActive: true,
      };
      setCoupons([newCoupon, ...coupons]);
      setToastMsg(`New coupon "${couponCode.toUpperCase()}" published!`);
    }

    setIsCouponModalOpen(false);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDeleteCoupon = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setToastMsg(`Coupon "${code}" removed.`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  // ─── Banner Handlers ───
  const handleOpenCreateBanner = () => {
    setEditingBannerId(null);
    setBannerTitle("Mega Factory Tech Expo — Shenzhen Sourcing Hub");
    setBannerSubtitle("Over 500+ direct factory electronics with verified QC inspection & instant USDT checkout");
    setBannerBadge("EXCLUSIVE DROP");
    setBannerCtaText("Explore Factory Hub");
    setBannerCtaLink("/categories/consumer-electronics");
    setBannerDiscountBadge("-45% OFF");
    setBannerBgGradient("from-[#00143D] via-blue-900 to-[#00143D]");
    setBannerImageUrl("https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80");
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) return;

    if (editingBannerId) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBannerId
            ? {
                ...b,
                title: bannerTitle,
                subtitle: bannerSubtitle,
                badge: bannerBadge,
                ctaText: bannerCtaText,
                ctaLink: bannerCtaLink,
                discountBadge: bannerDiscountBadge,
                bgGradient: bannerBgGradient,
                imageUrl: bannerImageUrl,
              }
            : b
        )
      );
      setToastMsg("Homepage Hero Banner updated!");
    } else {
      const newBanner: PromotionCampaign = {
        id: `camp-${Date.now()}`,
        title: bannerTitle,
        subtitle: bannerSubtitle,
        badge: bannerBadge,
        ctaText: bannerCtaText,
        ctaLink: bannerCtaLink,
        discountBadge: bannerDiscountBadge,
        bgGradient: bannerBgGradient,
        imageUrl: bannerImageUrl,
        is_active: true,
        position: banners.length + 1,
        ends_at: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
      };
      setBanners([...banners, newBanner]);
      setToastMsg("New Homepage Hero Campaign published!");
    }

    setIsBannerModalOpen(false);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ─── Flash Deals Handlers ───
  const handleAddFlashProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = allProducts.find((p) => p.id === selectedFlashProdId);
    if (!prod) return;

    const updatedProd: Product = {
      ...prod,
      is_flash_deal: true,
      flash_deal_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    };

    setFlashProducts([updatedProd, ...flashProducts.filter((p) => p.id !== prod.id)]);
    setIsAddFlashModalOpen(false);
    setToastMsg(`"${prod.title}" added to Flash Deals Zone!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRemoveFlashProduct = (productId: string, title: string) => {
    setFlashProducts((prev) => prev.filter((p) => p.id !== productId));
    setToastMsg(`"${title}" removed from Flash Deals.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ── 1. Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              LENNOX MARKETING OS
            </span>
            <span className="text-xs text-[#10B981] font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Promotions & Campaigns Engine Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Tag className="w-7 h-7 text-[#FF1028]" />
            <span>Promotions, Coupons & Flash Drops</span>
          </h1>
          <p className="text-xs text-slate-400">
            Control customer vouchers, scheduled flash drops, countdown timers, homepage hero slides, and curated product collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "coupons" && (
            <button
              onClick={handleOpenCreateCoupon}
              className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Voucher</span>
            </button>
          )}

          {activeTab === "banners" && (
            <button
              onClick={handleOpenCreateBanner}
              className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Hero Banner</span>
            </button>
          )}

          {activeTab === "flash" && (
            <button
              onClick={() => setIsAddFlashModalOpen(true)}
              className="bg-[#FF1028] hover:bg-[#E00B20] text-white px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Flash Product</span>
            </button>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="bg-[#10B981] text-slate-950 px-4 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>✓ {toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. KPI Metrics Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Coupons</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {coupons.filter((c) => c.isActive).length} Vouchers
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            {coupons.reduce((sum, c) => sum + c.usageCount, 0)} total redemptions
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Flash Drops Active</span>
            <div className="w-8 h-8 rounded-xl bg-[#FF1028]/20 text-[#FF1028] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {flashProducts.length} Hardware Drops
          </div>
          <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>24-Hour Rolling Timers</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Hero Banners</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {banners.filter((b) => b.is_active).length} Live Slides
          </div>
          <div className="text-[11px] text-[#10B981] font-bold">
            Frontpage Carousel Ready
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">USDT Discount Volume</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#10B981] flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 price-tag">
            $14,290.00
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Incentivized Sales Growth
          </div>
        </div>
      </div>

      {/* ── 3. Tab Navigation Bar ── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar text-xs">
        {[
          { id: "coupons", label: "Coupons & Vouchers", icon: Gift },
          { id: "flash", label: "Flash Deals & Timers", icon: Flame },
          { id: "banners", label: "Hero Banners & Campaigns", icon: ImageIcon },
          { id: "curated", label: "Curated Homepage Collections", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#00143D] text-white border border-blue-800 shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Icon className="w-4 h-4 text-[#FF1028]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 4. TAB 1: Coupons & Vouchers Manager ── */}
      {activeTab === "coupons" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((c) => {
              const usagePercent = Math.round((c.usageCount / c.maxUses) * 100);

              return (
                <div
                  key={c.id}
                  className={`p-6 rounded-3xl border transition-all space-y-4 relative ${
                    c.isActive
                      ? "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
                      : "bg-slate-950/60 border-slate-900 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-lg text-white bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-[#FF1028]" />
                          <span>{c.code}</span>
                        </span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase ${
                            c.discountType === "percentage"
                              ? "bg-blue-950 text-blue-300 border border-blue-800"
                              : c.discountType === "free_shipping"
                              ? "bg-purple-950 text-purple-300 border border-purple-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {c.discountType === "percentage"
                            ? `${c.value}% OFF`
                            : c.discountType === "free_shipping"
                            ? "FREE AIR CARGO"
                            : `$${c.value} USDT OFF`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium pt-1">
                        {c.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCoupon(c)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                        title="Edit Coupon"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quota Progress */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Redemption Quota:</span>
                      <strong className="text-white">
                        {c.usageCount} / {c.maxUses} used ({usagePercent}%)
                      </strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-[#FF1028] transition-all"
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Conditions & Active Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <div>
                      <span>Min Spend: <strong>${c.minSpend} USDT</strong></span>
                    </div>

                    <button
                      onClick={() => handleToggleCoupon(c.id)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase transition-colors cursor-pointer ${
                        c.isActive
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {c.isActive ? "● Active in Checkout" : "Paused"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5. TAB 2: Flash Deals & Scheduled Drops ── */}
      {activeTab === "flash" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#FF1028]" />
                  <span>Active Frontpage Flash Deals Drops</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Products displayed on homepage Flash Deals zone with live 24-hour countdown clock.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">Current Flash Timer:</span>
                <FlashDealCountdown targetDate={new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString()} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 relative group hover:border-[#FF1028]/50 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                      <Image
                        src={
                          p.media?.[0]?.url ||
                          "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=300&auto=format&fit=crop&q=80"
                        }
                        alt={p.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {p.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-emerald-400 price-tag">
                          {formatCurrency(p.base_price)}
                        </span>
                        {p.compare_at_price && (
                          <span className="text-xs text-slate-500 line-through">
                            ${p.compare_at_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="bg-[#FF1028] text-white text-[9px] font-black px-1.5 py-0.5 rounded mt-1 inline-block">
                        -46% FLASH DROP
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs pt-1 border-t border-slate-900">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Claimed:</span>
                      <span className="font-bold text-amber-400">78% claimed</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full bg-amber-500 w-[78%]" />
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFlashProduct(p.id, p.title)}
                    className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-300 font-bold text-xs transition-colors"
                  >
                    Remove from Flash Deals
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. TAB 3: Homepage Banners & Hero Campaigns ── */}
      {activeTab === "banners" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-6">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-white font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-black text-white text-sm">
                      Hero Slide Campaign #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black px-2 py-0.5 rounded">
                      Live on Storefront
                    </span>
                    <button
                      onClick={() => {
                        setEditingBannerId(b.id);
                        setBannerTitle(b.title);
                        setBannerSubtitle(b.subtitle);
                        setBannerBadge(b.badge);
                        setBannerCtaText(b.ctaText);
                        setBannerCtaLink(b.ctaLink);
                        setBannerDiscountBadge(b.discountBadge);
                        setBannerBgGradient(b.bgGradient);
                        setBannerImageUrl(b.imageUrl);
                        setIsBannerModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Banner Live Preview Simulation */}
                <div className={`rounded-2xl p-6 bg-gradient-to-r ${b.bgGradient} border border-white/10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6`}>
                  <div className="space-y-2 max-w-xl z-10">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#FF1028] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        {b.badge}
                      </span>
                      <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                        {b.discountBadge}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black">{b.title}</h3>
                    <p className="text-xs text-slate-200">{b.subtitle}</p>
                    <div className="pt-2">
                      <span className="inline-block bg-[#FF1028] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg">
                        {b.ctaText} →
                      </span>
                    </div>
                  </div>

                  <div className="relative w-48 h-36 rounded-xl overflow-hidden bg-slate-900 border border-white/20 shrink-0">
                    <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 7. TAB 4: Curated Homepage Collections ── */}
      {activeTab === "curated" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Curated Homepage Section Toggles</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-black text-white text-xs block">
                  🌟 Featured Sourcing Products
                </span>
                <p className="text-xs text-slate-400">
                  Products handpicked by Lennox procurement engineers with highest supplier reliability scores.
                </p>
                <span className="text-[11px] text-[#10B981] font-bold block">
                  {allProducts.filter((p) => p.is_featured).length} Products Active
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-black text-white text-xs block">
                  🔥 Best Sellers Hub
                </span>
                <p className="text-xs text-slate-400">
                  Ranked automatically by verified sales volume and buyer five-star reviews.
                </p>
                <span className="text-[11px] text-[#10B981] font-bold block">
                  4 Top Performing SKUs
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-black text-white text-xs block">
                  ⚡ New Factory Arrivals
                </span>
                <p className="text-xs text-slate-400">
                  Freshly imported hardware catalogued from Shenzhen & Ningbo production lines.
                </p>
                <span className="text-[11px] text-[#10B981] font-bold block">
                  {allProducts.filter((p) => p.is_new_arrival).length} Items Listed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. Create / Edit Coupon Modal ── */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title={editingCouponId ? "Edit Promotion Coupon" : "Create New Promotion Coupon"}
        size="md"
      >
        <form onSubmit={handleSaveCoupon} className="p-6 space-y-4 font-montserrat text-xs text-slate-800">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Coupon Promo Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. SUMMER15, USDT10, AIRFREE"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-black text-sm uppercase focus:outline-none focus:border-[#00143D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Discount Type *</label>
              <select
                value={couponType}
                onChange={(e) => setCouponType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none"
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="fixed_amount">Fixed Amount ($ USDT)</option>
                <option value="free_shipping">Free Air Shipping</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Discount Value *</label>
              <input
                type="number"
                required
                value={couponValue}
                onChange={(e) => setCouponValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-black text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Minimum Order Spend ($)</label>
              <input
                type="number"
                value={couponMinSpend}
                onChange={(e) => setCouponMinSpend(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Max Redemption Limit</label>
              <input
                type="number"
                value={couponMaxUses}
                onChange={(e) => setCouponMaxUses(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Description for Checkout Banner</label>
            <input
              type="text"
              required
              placeholder="e.g. 10% off on all RC drones and smart electronics"
              value={couponDesc}
              onChange={(e) => setCouponDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl font-black transition-colors"
            >
              {editingCouponId ? "Save Changes" : "Publish Voucher"}
            </button>
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(false)}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 9. Add Flash Product Modal ── */}
      <Modal
        isOpen={isAddFlashModalOpen}
        onClose={() => setIsAddFlashModalOpen(false)}
        title="Add Product to Flash Deals Zone"
        size="md"
      >
        <form onSubmit={handleAddFlashProduct} className="p-6 space-y-4 font-montserrat text-xs text-slate-800">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Select Sourced Product</label>
            <select
              value={selectedFlashProdId}
              onChange={(e) => setSelectedFlashProdId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:outline-none"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {formatCurrency(p.base_price)}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1">
            <span className="font-black flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FF1028]" /> 24-Hour Deal Zone
            </span>
            <p className="text-[11px] text-slate-600">
              Product will receive a high-visibility placement on the homepage Flash Deals carousel with a live countdown clock.
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl font-black transition-colors"
            >
              Add to Flash Deals
            </button>
            <button
              type="button"
              onClick={() => setIsAddFlashModalOpen(false)}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 10. Create / Edit Banner Modal ── */}
      <Modal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        title={editingBannerId ? "Edit Hero Campaign Banner" : "New Hero Campaign Banner"}
        size="lg"
      >
        <form onSubmit={handleSaveBanner} className="p-6 space-y-4 font-montserrat text-xs text-slate-800">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Campaign Headline *</label>
            <input
              type="text"
              required
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Subtitle / Offer Description</label>
            <input
              type="text"
              value={bannerSubtitle}
              onChange={(e) => setBannerSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Badge Label</label>
              <input
                type="text"
                value={bannerBadge}
                onChange={(e) => setBannerBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Discount Pill Tag</label>
              <input
                type="text"
                value={bannerDiscountBadge}
                onChange={(e) => setBannerDiscountBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">CTA Button Text</label>
              <input
                type="text"
                value={bannerCtaText}
                onChange={(e) => setBannerCtaText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">CTA Destination Link</label>
              <input
                type="text"
                value={bannerCtaLink}
                onChange={(e) => setBannerCtaLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Hero Image URL</label>
            <input
              type="url"
              value={bannerImageUrl}
              onChange={(e) => setBannerImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl font-black transition-colors"
            >
              {editingBannerId ? "Save Hero Slide" : "Publish Slide"}
            </button>
            <button
              type="button"
              onClick={() => setIsBannerModalOpen(false)}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
