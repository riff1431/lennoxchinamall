"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  LayoutGrid,
  Video,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Plus,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Star,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  HeroLennoxConfig,
  HeroDealOfTheDay,
  HeroMiddleBanner,
  HeroFourDealItem,
  HeroVideoReelItem,
  DEFAULT_HERO_LENNOX_CONFIG,
} from "@/types/homepage";
import {
  getAdminHeroSectionConfig,
  updateAdminHeroSectionConfig,
  resetAdminHeroSectionConfig,
} from "@/app/actions/admin-hero-section";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type ActiveTab = "deal_of_the_day" | "middle_banner" | "four_deals" | "video_reels";

export default function AdminHeroSectionPage() {
  const [config, setConfig] = useState<HeroLennoxConfig>(DEFAULT_HERO_LENNOX_CONFIG);
  const [activeTab, setActiveTab] = useState<ActiveTab>("deal_of_the_day");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    getAdminHeroSectionConfig().then((res) => {
      if (!ignore && res.success && res.config) {
        setConfig(res.config);
      }
      setLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateAdminHeroSectionConfig(config);
      if (res.success) {
        showToast("success", "Hero Section configuration saved & published to storefront!");
      } else {
        showToast("error", res.error || "Failed to save hero section.");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all 3-Column Hero Section content to factory defaults?")) return;
    setSaving(true);
    try {
      const res = await resetAdminHeroSectionConfig();
      if (res.success) {
        setConfig(DEFAULT_HERO_LENNOX_CONFIG);
        showToast("success", "Hero Section reset to factory defaults.");
      }
    } catch (err: any) {
      showToast("error", "Failed to reset.");
    } finally {
      setSaving(false);
    }
  };

  // ── Helper Handlers ──
  const updateDeal = (fields: Partial<HeroDealOfTheDay>) => {
    setConfig((prev) => ({
      ...prev,
      deal_of_the_day: {
        ...(prev.deal_of_the_day || DEFAULT_HERO_LENNOX_CONFIG.deal_of_the_day!),
        ...fields,
      },
    }));
  };

  const updateBanner = (fields: Partial<HeroMiddleBanner>) => {
    setConfig((prev) => ({
      ...prev,
      middle_banner: {
        ...(prev.middle_banner || DEFAULT_HERO_LENNOX_CONFIG.middle_banner!),
        ...fields,
      },
    }));
  };

  const updateFourDeal = (index: number, fields: Partial<HeroFourDealItem>) => {
    setConfig((prev) => {
      const list = [...(prev.four_deals || DEFAULT_HERO_LENNOX_CONFIG.four_deals || [])];
      list[index] = { ...list[index], ...fields };
      return { ...prev, four_deals: list };
    });
  };

  const updateVideoReel = (index: number, fields: Partial<HeroVideoReelItem>) => {
    setConfig((prev) => {
      const list = [...(prev.video_reels || DEFAULT_HERO_LENNOX_CONFIG.video_reels || [])];
      list[index] = { ...list[index], ...fields };
      return { ...prev, video_reels: list };
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-[#FF1028] border-t-transparent rounded-full animate-spin" />
          <span>Loading Hero Section Configuration...</span>
        </div>
      </div>
    );
  }

  const deal = config.deal_of_the_day || DEFAULT_HERO_LENNOX_CONFIG.deal_of_the_day!;
  const banner = config.middle_banner || DEFAULT_HERO_LENNOX_CONFIG.middle_banner!;
  const fourDeals = config.four_deals || DEFAULT_HERO_LENNOX_CONFIG.four_deals || [];
  const videoReels = config.video_reels || DEFAULT_HERO_LENNOX_CONFIG.video_reels || [];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-bold text-white animate-in slide-in-from-bottom-3 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header with Actions */}
      <AdminPageHeader
        title="3-Column Hero Section Control"
        subtitle="Manage live products, middle promotional banner, 4 quick factory drops, and live video reels"
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>View Live Store</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#FF1028] hover:bg-red-700 text-white text-xs font-black transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save & Publish Changes"}</span>
          </button>
        </div>
      </AdminPageHeader>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("deal_of_the_day")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            activeTab === "deal_of_the_day"
              ? "bg-white text-[#00143D] shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-[#00143D] hover:bg-white/50"
          }`}
        >
          <Flame className="w-4 h-4 text-[#FF1028]" />
          <span>Column 1: Deal of the Day</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("middle_banner")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            activeTab === "middle_banner"
              ? "bg-white text-[#00143D] shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-[#00143D] hover:bg-white/50"
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Column 2: Middle Hero Banner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("four_deals")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            activeTab === "four_deals"
              ? "bg-white text-[#00143D] shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-[#00143D] hover:bg-white/50"
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-emerald-600" />
          <span>Column 2: 4 Quick Deals Grid</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("video_reels")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            activeTab === "video_reels"
              ? "bg-white text-[#00143D] shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-[#00143D] hover:bg-white/50"
          }`}
        >
          <Video className="w-4 h-4 text-amber-500" />
          <span>Column 3: 2 Live Video Reels</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB 1: DEAL OF THE DAY (LEFT COLUMN)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "deal_of_the_day" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Editor Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#00143D] font-heading flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF1028]" />
                <span>Deal of the Day Featured Product</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls the left countdown card on the homepage
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Product Title (English)</label>
                <input
                  type="text"
                  value={deal.title}
                  onChange={(e) => updateDeal({ title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="e.g. Acoustic Audio by Goldwood 120W"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Product Title (Spanish)</label>
                <input
                  type="text"
                  value={deal.title_es || ""}
                  onChange={(e) => updateDeal({ title_es: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="e.g. Acoustic Audio de Goldwood 120W"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Deal Price (USDT $)</label>
                <input
                  type="number"
                  step="0.01"
                  value={deal.price}
                  onChange={(e) => updateDeal({ price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Original / Compare Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={deal.compare_price}
                  onChange={(e) => updateDeal({ compare_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Discount Badge Text</label>
                <input
                  type="text"
                  value={deal.discount_badge}
                  onChange={(e) => updateDeal({ discount_badge: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="e.g. -45% OFF"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Product Slug / Target Link</label>
                <input
                  type="text"
                  value={deal.slug}
                  onChange={(e) => updateDeal({ slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="e.g. blitzwolf-bw-wa3-pro-120w-bluetooth-speaker"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Product Image URL</label>
                <input
                  type="url"
                  value={deal.image}
                  onChange={(e) => updateDeal({ image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#00143D]"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Stock Units Left</label>
                <input
                  type="number"
                  value={deal.units_left}
                  onChange={(e) => updateDeal({ units_left: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Claimed Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={deal.claimed_percent}
                  onChange={(e) => updateDeal({ claimed_percent: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">CTA Button Text (English)</label>
                <input
                  type="text"
                  value={deal.button_text || "GRAB THIS DEAL →"}
                  onChange={(e) => updateDeal({ button_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">CTA Button Text (Spanish)</label>
                <input
                  type="text"
                  value={deal.button_text_es || "APROVECHAR OFERTA →"}
                  onChange={(e) => updateDeal({ button_text_es: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#00143D]"
                />
              </div>
            </div>
          </div>

          {/* Real-Time Live Preview */}
          <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
                Storefront Live Preview
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Column 1
              </span>
            </div>

            <div className="bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200 p-4 text-slate-900 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF1028]" />
                  <span className="font-black text-xs text-[#00143D] uppercase tracking-wider font-heading">
                    DEAL OF THE DAY
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#FF1028] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                  07:59:53
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="relative w-36 h-36 mx-auto rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-2">
                  <span className="absolute top-1.5 left-1.5 z-10 bg-[#FF1028] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-xs">
                    {deal.discount_badge}
                  </span>
                  {deal.image ? (
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                    <span className="text-slate-400 font-mono text-[9px] ml-1">
                      ({deal.rating} • {deal.reviews_count}+ Sold)
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{deal.title}</h4>

                  <div className="flex items-baseline justify-center gap-1.5 font-mono">
                    <span className="text-base font-black text-[#00143D]">
                      ${deal.price?.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">USDT</span>
                    {deal.compare_price > 0 && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ${deal.compare_price?.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-[#FF1028] font-bold">Only {deal.units_left} Units Left</span>
                      <span className="text-slate-400">{deal.claimed_percent}% Claimed</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF1028] to-amber-500 rounded-full"
                        style={{ width: `${deal.claimed_percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2 rounded-lg bg-[#00143D] text-white text-xs font-black tracking-wider uppercase shadow-xs"
                >
                  {deal.button_text || "GRAB THIS DEAL →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 2: MIDDLE HERO BANNER (CENTER COLUMN TOP)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "middle_banner" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#00143D] font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Middle Promotional Hero Banner</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls the large showcase banner in the center column
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Primary Badge (English)</label>
                <input
                  type="text"
                  value={banner.badge}
                  onChange={(e) => updateBanner({ badge: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="e.g. DIRECT CHINA FACTORY"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Primary Badge (Spanish)</label>
                <input
                  type="text"
                  value={banner.badge_es || ""}
                  onChange={(e) => updateBanner({ badge_es: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="e.g. FÁBRICA DIRECTA CHINA"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Sub-Badge Tag (English)</label>
                <input
                  type="text"
                  value={banner.badge_sub || ""}
                  onChange={(e) => updateBanner({ badge_sub: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="e.g. 0% Middleman"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Sub-Badge Tag (Spanish)</label>
                <input
                  type="text"
                  value={banner.badge_sub_es || ""}
                  onChange={(e) => updateBanner({ badge_sub_es: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="e.g. 0% Intermediarios"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Banner Headline (English)</label>
                <input
                  type="text"
                  value={banner.title}
                  onChange={(e) => updateBanner({ title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="e.g. Direct Factory Gate Hardware & Electronics"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Banner Headline (Spanish)</label>
                <input
                  type="text"
                  value={banner.title_es || ""}
                  onChange={(e) => updateBanner({ title_es: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="e.g. Fábrica Directa en Hardware y Electrónica"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Banner Image URL (1200px+ Wide)</label>
                <input
                  type="url"
                  value={banner.image}
                  onChange={(e) => updateBanner({ image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#00143D]"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Button Label (English)</label>
                <input
                  type="text"
                  value={banner.button_text}
                  onChange={(e) => updateBanner({ button_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Button Label (Spanish)</label>
                <input
                  type="text"
                  value={banner.button_text_es || ""}
                  onChange={(e) => updateBanner({ button_text_es: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#00143D]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Destination Link</label>
                <input
                  type="text"
                  value={banner.link}
                  onChange={(e) => updateBanner({ link: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#00143D]"
                  placeholder="/categories/consumer-electronics"
                />
              </div>
            </div>
          </div>

          {/* Banner Live Preview */}
          <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
                Storefront Live Preview
              </span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                Column 2 (Top)
              </span>
            </div>

            <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md flex items-end p-4">
              {banner.image ? (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover opacity-85"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="relative z-10 w-full flex items-end justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-[#FF1028] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                      {banner.badge}
                    </span>
                    {banner.badge_sub && (
                      <span className="bg-white/20 text-amber-300 text-[8px] font-mono font-bold px-2 py-0.5 rounded-md">
                        {banner.badge_sub}
                      </span>
                    )}
                  </div>
                  <h4 className="text-white text-xs sm:text-sm font-black font-heading line-clamp-2">
                    {banner.title}
                  </h4>
                </div>

                <span className="shrink-0 inline-flex items-center gap-1 bg-white text-[#00143D] text-[10px] font-black px-2.5 py-1.5 rounded-md">
                  <span>{banner.button_text}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 3: 4 QUICK DEALS GRID (CENTER COLUMN BOTTOM)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "four_deals" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-6">
              <h3 className="text-base font-black text-[#00143D] font-heading flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-emerald-600" />
                <span>4 Quick Factory Drops Grid</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls the 4 deal cards underneath the middle promotional banner
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {fourDeals.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <span className="text-[11px] font-black text-slate-700 uppercase font-mono">
                        Card #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                        {item.discountBadge || "-$10.00"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Title (EN)</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateFourDeal(idx, { title: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00143D]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Title (ES)</label>
                      <input
                        type="text"
                        value={item.titleEs || ""}
                        onChange={(e) => updateFourDeal(idx, { titleEs: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00143D]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateFourDeal(idx, { price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:outline-none focus:border-[#00143D]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Compare ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.comparePrice || 0}
                          onChange={(e) => updateFourDeal(idx, { comparePrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-[#00143D]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Discount Badge</label>
                      <input
                        type="text"
                        value={item.discountBadge || ""}
                        onChange={(e) => updateFourDeal(idx, { discountBadge: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00143D]"
                        placeholder="-$10.00"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Image URL</label>
                      <input
                        type="url"
                        value={item.image}
                        onChange={(e) => updateFourDeal(idx, { image: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-[#00143D]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Product Slug</label>
                      <input
                        type="text"
                        value={item.slug}
                        onChange={(e) => updateFourDeal(idx, { slug: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00143D]"
                      />
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="relative w-full h-24 rounded-lg bg-white border border-slate-200 overflow-hidden mt-2 flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 4: LIVE VIDEO REELS (RIGHT COLUMN)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "video_reels" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-6">
              <h3 className="text-base font-black text-[#00143D] font-heading flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-500" />
                <span>2 Live Sourcing Video Reels</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls the 2 vertical factory inspection & export video cards on the right column
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {videoReels.map((reel, idx) => (
                <div
                  key={reel.id || idx}
                  className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-black text-slate-800 uppercase font-mono">
                      Reel #{idx + 1}: {idx === 0 ? "Top Video Card" : "Bottom Video Card"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 text-[10px] font-bold font-mono">
                      {reel.tag}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Reel Title (English)</label>
                      <input
                        type="text"
                        value={reel.title}
                        onChange={(e) => updateVideoReel(idx, { title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00143D]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Reel Title (Spanish)</label>
                      <input
                        type="text"
                        value={reel.title_es || ""}
                        onChange={(e) => updateVideoReel(idx, { title_es: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00143D]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">QC Status Tag</label>
                      <input
                        type="text"
                        value={reel.tag}
                        onChange={(e) => updateVideoReel(idx, { tag: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold focus:outline-none focus:border-[#00143D]"
                        placeholder="e.g. LIVE QC or QC PASSED"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Supplier Hub</label>
                      <input
                        type="text"
                        value={reel.hub || ""}
                        onChange={(e) => updateVideoReel(idx, { hub: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00143D]"
                        placeholder="e.g. Guangzhou Canton Hub"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Video URL (MP4 / MOV / Stream)</label>
                      <input
                        type="text"
                        value={reel.video_url}
                        onChange={(e) => updateVideoReel(idx, { video_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-[#00143D]"
                        placeholder="/videos/hero/hero_ad_1.mov"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Poster / Thumbnail Image URL</label>
                      <input
                        type="text"
                        value={reel.poster}
                        onChange={(e) => updateVideoReel(idx, { poster: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:border-[#00143D]"
                        placeholder="/videos/hero/hero_ad_1_thumb.jpg"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Product Target Link (for Video Modal)</label>
                      <input
                        type="text"
                        value={reel.product_link || ""}
                        onChange={(e) => updateVideoReel(idx, { product_link: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#00143D]"
                        placeholder="/products/eachine-ex5-4k-gps-fpv-drone"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
