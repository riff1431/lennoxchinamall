"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Video,
  Eye,
  Lock,
  Save,
  Sparkles,
  Zap,
  TrendingUp,
  ExternalLink,
  Plus,
  Trash2,
  DollarSign,
  Globe,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Sliders,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { Product, Category, Brand, Variant, ProductStatus } from "@/types/database";
import { MOCK_CATEGORIES, MOCK_BRANDS } from "@/lib/mockData";
import {
  AdminInput,
  AdminSelect,
  AdminCategorySelect,
  AdminBrandSelect,
  AdminUploader,
  AdminTextarea,
  AdminFormSection,
} from "@/components/admin/forms";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatCurrency, slugify, cn } from "@/utils/helpers";
import { createProduct, updateProduct } from "@/app/actions/admin-products";

interface ProductEditorProps {
  mode: "create" | "edit";
  initialProduct?: Product | null;
  categories?: Category[];
  brands?: Brand[];
}

export function ProductEditor({
  mode,
  initialProduct,
  categories = MOCK_CATEGORIES,
  brands = MOCK_BRANDS,
}: ProductEditorProps) {
  const router = useRouter();
  const toast = useAdminToast();
  const storeCategories = useCategoryStore((state) => state.categories);
  const activeCategories = useMemo(() => {
    return storeCategories && storeCategories.length > 0 ? storeCategories : categories;
  }, [storeCategories, categories]);

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "media" | "inventory" | "seo">("general");

  // General Details State
  const [title, setTitle] = useState(initialProduct?.title || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [sku, setSku] = useState(initialProduct?.sku || `LCM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || activeCategories[0]?.id || "");
  const [brandId, setBrandId] = useState(initialProduct?.brand_id || brands[0]?.id || "");
  const [shortDescription, setShortDescription] = useState(initialProduct?.short_description || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || "published");

  // Flags
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProduct?.is_featured || false);
  const [isFlashDeal, setIsFlashDeal] = useState<boolean>(initialProduct?.is_flash_deal || false);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(initialProduct?.is_best_seller || false);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(initialProduct?.is_new_arrival ?? true);

  // Pricing & Sourcing Secrets
  const [basePrice, setBasePrice] = useState<number>(initialProduct?.base_price ?? 99.0);
  const [compareAtPrice, setCompareAtPrice] = useState<number>(initialProduct?.compare_at_price ?? 179.0);
  const [cost, setCost] = useState<number>(initialProduct?.cost ?? 52.0); // Secret Factory Cost
  const [supplierCode, setSupplierCode] = useState(initialProduct?.supplier_code || `SUP-SZ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [purchaseUrl, setPurchaseUrl] = useState("https://1688.com");
  const [shippingOrigin, setShippingOrigin] = useState(initialProduct?.shipping_origin || "Shenzhen, Guangdong, China");
  const [weight, setWeight] = useState<number>(initialProduct?.weight ?? 0.85);

  // Media & Video Showcases
  const [images, setImages] = useState<string[]>(
    initialProduct?.media && initialProduct.media.length > 0
      ? initialProduct.media.map((m) => m.url)
      : [
          "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80",
        ]
  );

  const [video1Title, setVideo1Title] = useState(
    initialProduct?.videos?.[0]?.title || "Slot 1: Factory QC & Teardown Demo"
  );
  const [video1Url, setVideo1Url] = useState(
    initialProduct?.videos?.[0]?.url || "https://www.youtube.com/embed/dQw4w9WgXcQ"
  );

  const [video2Title, setVideo2Title] = useState(
    initialProduct?.videos?.[1]?.title || "Slot 2: Live Flight & Hands-on Performance"
  );
  const [video2Url, setVideo2Url] = useState(
    initialProduct?.videos?.[1]?.url || "https://www.youtube.com/embed/dQw4w9WgXcQ"
  );

  // Inventory & Variants
  const [stock, setStock] = useState<number>(initialProduct?.variants?.[0]?.stock ?? 45);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [variantsList, setVariantsList] = useState<Array<{ id: string; title: string; sku: string; price: number; stock: number }>>([
    { id: "v-1", title: "Standard Package (1 Battery)", sku: `${sku}-STD`, price: basePrice, stock: stock },
    { id: "v-2", title: "Fly More Combo (3 Batteries + Bag)", sku: `${sku}-COMBO`, price: basePrice + 49, stock: 20 },
  ]);

  // SEO & Discovery
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seo_description || "");
  const [tags, setTags] = useState<string>(initialProduct?.tags?.join(", ") || "4K Drone, FPV, GPS, Brushless Motor");

  // Title change auto-slug generator
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (mode === "create" || !slug) {
      setSlug(slugify(newTitle));
    }
  };

  const handleGenerateSku = () => {
    const generated = `LCM-${Math.floor(10000 + Math.random() * 90000)}`;
    setSku(generated);
    toast.info(`Generated new SKU: ${generated}`);
  };

  // Profit Margins Real-Time Calculations
  const unitProfit = Math.max(0, basePrice - cost);
  const profitMarginPercent = basePrice > 0 ? Math.round(((basePrice - cost) / basePrice) * 100) : 0;
  const markupMultiplier = cost > 0 ? (basePrice / cost).toFixed(2) : "0";

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning("Please enter a product title.");
      setActiveTab("general");
      return;
    }

    if (basePrice <= 0) {
      toast.warning("Please enter a valid retail price.");
      setActiveTab("pricing");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("slug", slug.trim() || slugify(title));
      formData.set("sku", sku.trim());
      formData.set("category_id", categoryId);
      formData.set("brand_id", brandId);
      formData.set("short_description", shortDescription.trim());
      formData.set("description", description.trim());
      formData.set("base_price", String(basePrice));
      formData.set("compare_at_price", String(compareAtPrice));
      formData.set("cost", String(cost));
      formData.set("supplier_code", supplierCode.trim());
      formData.set("shipping_origin", shippingOrigin.trim());
      formData.set("weight", String(weight));
      formData.set("stock", String(stock));
      formData.set("status", status);
      formData.set("is_featured", String(isFeatured));
      formData.set("is_flash_deal", String(isFlashDeal));
      formData.set("is_best_seller", String(isBestSeller));
      formData.set("is_new_arrival", String(isNewArrival));
      formData.set("seo_title", seoTitle.trim());
      formData.set("seo_description", seoDescription.trim());
      formData.set("tags", tags);

      // Videos
      formData.set("video1_url", video1Url);
      formData.set("video1_title", video1Title);
      formData.set("video2_url", video2Url);
      formData.set("video2_title", video2Title);

      // Images
      images.forEach((img) => formData.append("images", img));

      if (mode === "edit" && initialProduct?.id) {
        const res = await updateProduct(initialProduct.id, formData);
        if (res.success) {
          toast.success(res.message || `Updated "${title}" successfully!`);
          router.push("/admin/products");
        } else {
          toast.error(res.message || "Failed to update product.");
        }
      } else {
        const res = await createProduct(formData);
        if (res.success) {
          toast.success(res.message || `Created "${title}" successfully!`);
          router.push("/admin/products");
        } else {
          toast.error(res.message || "Failed to create product.");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentCategory = useMemo(() => {
    return activeCategories.find((c) => c.id === categoryId);
  }, [activeCategories, categoryId]);

  const currentCategoryName = currentCategory?.name || "General Department";

  const currentBrand = useMemo(() => {
    return brands.find((b) => b.id === brandId);
  }, [brands, brandId]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[1600px] mx-auto pb-16 font-montserrat">
      {/* ── 1. Top Action Navigation Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Catalogue</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2F65F6] border border-blue-200 dark:border-blue-900/40">
              {mode === "create" ? "NEW PRODUCT" : `SKU: ${sku}`}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading truncate">
            {mode === "create" ? "Add New Product Listing" : `Edit: ${title || "Product Listing"}`}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {mode === "edit" && slug && (
            <a
              href={`/products/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Live Storefront</span>
            </a>
          )}

          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FF1028] hover:bg-[#E00B20] text-white transition-all cursor-pointer shadow-md shadow-red-500/20 font-heading uppercase flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{mode === "create" ? "Publish Product" : "Save Changes"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 2. Responsive 2-Column Grid Workspace (8 cols form / 4 cols inspector) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Workspace (Left 8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Form Tabs Navigation */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "general", label: "General & Specs", icon: Package },
                { id: "pricing", label: "Pricing & Sourcing Margins", icon: DollarSign },
                { id: "media", label: "Gallery & Dual Videos", icon: Video },
                { id: "inventory", label: "Inventory & Variants", icon: Layers },
                { id: "seo", label: "SEO & Discovery", icon: Globe },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-[#00143D] text-white shadow-xs font-heading"
                      : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#FF1028]" : "text-slate-400")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── TAB 1: General & Specs ── */}
          {activeTab === "general" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <AdminFormSection title="Product Identity & Categorization">
                <AdminInput
                  label="Product Title"
                  required
                  placeholder="e.g. Eachine EX5 4K GPS FPV RC Drone with Dual 5G WiFi..."
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  helperText="Clear, keyword-rich title for storefront display and search indexing."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <AdminInput
                      label="Custom SKU"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="LCM-8890"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="absolute right-2 top-8 text-[11px] text-[#2F65F6] hover:underline font-bold font-mono cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>

                  <div>
                    <AdminInput
                      label="Storefront URL Slug"
                      placeholder="auto-generated-from-title"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      helperText={slug ? `Live URL: lennoxchinamall.com/products/${slug}` : "Slug generated automatically"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminCategorySelect
                    label="Department Category"
                    required
                    value={categoryId}
                    onChange={(val) => setCategoryId(val)}
                    categories={activeCategories}
                  />

                  <AdminBrandSelect
                    label="Brand / Manufacturer"
                    value={brandId}
                    onChange={(val) => setBrandId(val)}
                    brands={brands}
                  />
                </div>
              </AdminFormSection>

              <AdminFormSection title="Descriptions & Technical Overview">
                <AdminInput
                  label="Short Card Summary"
                  placeholder="One punchy sentence highlighted on catalog preview cards..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />

                <AdminTextarea
                  label="Full Technical Description & Box Contents"
                  rows={5}
                  placeholder="Detailed specifications, package contents (e.g. drone, remote, 2 batteries, spare props), flight duration, and factory certifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </AdminFormSection>

              <AdminFormSection title="Promotional Merchandising Badges">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between cursor-pointer hover:border-slate-300">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Featured on Homepage Hero
                    </span>
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2F65F6] focus:ring-[#2F65F6] cursor-pointer"
                    />
                  </label>

                  <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between cursor-pointer hover:border-slate-300">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#FF1028]" />
                      Flash Deal Spotlight
                    </span>
                    <input
                      type="checkbox"
                      checked={isFlashDeal}
                      onChange={(e) => setIsFlashDeal(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF1028] focus:ring-[#FF1028] cursor-pointer"
                    />
                  </label>

                  <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between cursor-pointer hover:border-slate-300">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Best Seller Ribbon
                    </span>
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between cursor-pointer hover:border-slate-300">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      New Arrival Tag
                    </span>
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                </div>
              </AdminFormSection>
            </div>
          )}

          {/* ── TAB 2: Pricing & Sourcing Margins ── */}
          {activeTab === "pricing" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Dynamic Margin Calculator Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#00143D] to-[#0A2563] text-white shadow-lg space-y-3 border border-blue-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200 font-mono flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Live Profit & Sourcing Margin Engine
                  </span>
                  <span
                    className={cn(
                      "text-xs font-black px-2.5 py-0.5 rounded-full font-mono",
                      profitMarginPercent >= 40
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    )}
                  >
                    +{profitMarginPercent}% Net Margin
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <span className="text-[10px] text-blue-300 block font-semibold">Net Profit / Unit</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      +${unitProfit.toFixed(2)} USDT
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-300 block font-semibold">Markup Ratio</span>
                    <span className="text-xl font-black text-white font-mono">{markupMultiplier}x</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-300 block font-semibold">Factory Sourcing Cost</span>
                    <span className="text-xl font-black text-amber-300 font-mono">${cost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <AdminFormSection title="Storefront Pricing (USDT & MSRP)">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AdminInput
                    label="Retail Price (USDT)"
                    required
                    type="number"
                    step="0.01"
                    min={0.01}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    helperText="Customer checkout price."
                  />

                  <AdminInput
                    label="Compare-At / MSRP ($)"
                    type="number"
                    step="0.01"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(Number(e.target.value))}
                    helperText="Strike-through price to show discount percentage."
                  />

                  <AdminInput
                    label="Secret Factory Cost ($)"
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    helperText="1688 wholesale acquisition price (hidden from customers)."
                  />
                </div>
              </AdminFormSection>

              <AdminFormSection
                title="Protected China Factory Sourcing Secrets"
                icon={Lock}
                description="Encrypted supplier identifiers and direct 1688 procurement links are strictly restricted to admin eyes."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminInput
                    label="Supplier Identification Code"
                    required
                    value={supplierCode}
                    onChange={(e) => setSupplierCode(e.target.value)}
                    placeholder="SUP-SZ-9012"
                  />

                  <AdminInput
                    label="Shipping Origin Hub"
                    value={shippingOrigin}
                    onChange={(e) => setShippingOrigin(e.target.value)}
                    placeholder="Shenzhen, Guangdong, China"
                  />

                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <AdminInput
                          label="Direct Factory Acquisition Link (1688 / Taobao / Factory)"
                          type="url"
                          value={purchaseUrl}
                          onChange={(e) => setPurchaseUrl(e.target.value)}
                          placeholder="https://detail.1688.com/offer/..."
                        />
                      </div>
                      {purchaseUrl && (
                        <a
                          href={purchaseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-6 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors text-xs font-bold flex items-center gap-1 shrink-0"
                          title="Test Supplier Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                          <span>Open</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <AdminInput
                    label="Parcel Weight (KG)"
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    helperText="Used for calculated Air Cargo express rates."
                  />
                </div>
              </AdminFormSection>
            </div>
          )}

          {/* ── TAB 3: Media & Dual Videos ── */}
          {activeTab === "media" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <AdminFormSection title="Product Image Gallery (Multi-Asset)">
                <AdminUploader
                  label="Upload / Paste Product Images"
                  values={images}
                  onChange={setImages}
                  maxFiles={8}
                  helperText="Primary image will be used as the product cover on catalog grid and search."
                />
              </AdminFormSection>

              <AdminFormSection
                title="Dedicated Dual-Video Showcases (Signature Feature)"
                icon={Video}
                description="Lennox ChinaMall features two dedicated video slots directly on the storefront detail page to maximize buyer trust and conversion."
              >
                <div className="space-y-4">
                  {/* Slot 1 Video */}
                  <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-heading flex items-center gap-1.5">
                        <Video className="w-4 h-4" />
                        Slot 1: Quality Inspection / Factory QC Teardown
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Embed / MP4</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AdminInput
                        label="Video Title"
                        value={video1Title}
                        onChange={(e) => setVideo1Title(e.target.value)}
                        placeholder="e.g. Factory QC Inspection & Teardown"
                      />
                      <AdminInput
                        label="Embed / YouTube / MP4 URL"
                        value={video1Url}
                        onChange={(e) => setVideo1Url(e.target.value)}
                        placeholder="https://www.youtube.com/embed/..."
                      />
                    </div>

                    {/* Live Video Preview Frame */}
                    {video1Url && (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/10 border border-slate-200 dark:border-slate-800">
                        <iframe
                          src={video1Url}
                          title="Slot 1 Video Preview"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>

                  {/* Slot 2 Video */}
                  <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2F65F6] font-heading flex items-center gap-1.5">
                        <Video className="w-4 h-4" />
                        Slot 2: Live Flight / Hands-on Performance Demo
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Embed / MP4</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AdminInput
                        label="Video Title"
                        value={video2Title}
                        onChange={(e) => setVideo2Title(e.target.value)}
                        placeholder="e.g. 4K Live Flight & Wind Resistance Demo"
                      />
                      <AdminInput
                        label="Embed / YouTube / MP4 URL"
                        value={video2Url}
                        onChange={(e) => setVideo2Url(e.target.value)}
                        placeholder="https://www.youtube.com/embed/..."
                      />
                    </div>

                    {/* Live Video Preview Frame */}
                    {video2Url && (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/10 border border-slate-200 dark:border-slate-800">
                        <iframe
                          src={video2Url}
                          title="Slot 2 Video Preview"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                </div>
              </AdminFormSection>
            </div>
          )}

          {/* ── TAB 4: Inventory & Variants ── */}
          {activeTab === "inventory" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <AdminFormSection title="Inventory Control & Stock Limits">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminInput
                    label="Available Warehouse Stock (Units)"
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                  />

                  <AdminInput
                    label="Low Stock Warning Threshold"
                    type="number"
                    min={1}
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    helperText="Sends operational alert when stock dips below this limit."
                  />
                </div>
              </AdminFormSection>

              <AdminFormSection
                title="Product Packages & Variants"
                description="Define bundle options, colors, or accessory editions."
              >
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                          <th className="py-2.5 px-3">Variant Name</th>
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3">Price ($)</th>
                          <th className="py-2.5 px-3">Stock</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {variantsList.map((v, idx) => (
                          <tr key={v.id}>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={v.title}
                                onChange={(e) => {
                                  const updated = [...variantsList];
                                  updated[idx].title = e.target.value;
                                  setVariantsList(updated);
                                }}
                                className="bg-transparent font-bold text-slate-900 dark:text-white border-b border-dashed border-slate-300 dark:border-slate-700 outline-none w-full"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                              {v.sku}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                              ${v.price.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 font-mono">{v.stock} units</td>
                            <td className="py-2.5 px-3 text-right">
                              {variantsList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setVariantsList(variantsList.filter((item) => item.id !== v.id))}
                                  className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setVariantsList([
                        ...variantsList,
                        {
                          id: `v-${Date.now()}`,
                          title: `Edition ${variantsList.length + 1}`,
                          sku: `${sku}-OPT${variantsList.length + 1}`,
                          price: basePrice,
                          stock: 25,
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F65F6] hover:underline pt-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Package Variant</span>
                  </button>
                </div>
              </AdminFormSection>
            </div>
          )}

          {/* ── TAB 5: SEO & Discovery ── */}
          {activeTab === "seo" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <AdminFormSection title="Search Engine Optimization (Google SERP)">
                <AdminInput
                  label="SEO Meta Title"
                  placeholder={title ? `${title} | Lennox ChinaMall Direct` : "Buy Direct from Factory | Lennox ChinaMall"}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />

                <AdminTextarea
                  label="SEO Meta Description"
                  rows={3}
                  placeholder="Order direct from verified China factory suppliers with air cargo logistics and USDT settlement..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />

                {/* Google SERP Snippet Preview */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-2">
                    Search Engine Result Preview
                  </span>
                  <div className="text-[11px] text-[#202124] dark:text-slate-400 truncate">
                    https://lennoxchinamall.com/products/{slug || "product-slug"}
                  </div>
                  <h4 className="text-sm font-bold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer">
                    {seoTitle || title || "Product Title - Lennox ChinaMall"}
                  </h4>
                  <p className="text-xs text-[#4d5156] dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {seoDescription ||
                      shortDescription ||
                      "Buy direct with guaranteed factory quality inspection, live demo showcases, and USDT payment support."}
                  </p>
                </div>
              </AdminFormSection>

              <AdminFormSection title="Search Keywords & Tags">
                <AdminInput
                  label="Search Tags (Comma-separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="4K Drone, FPV Quadcopter, Brushless, 5G WiFi"
                  helperText="These keywords improve in-site search matching and department filter accuracy."
                />

                {/* Tags preview chips */}
                {tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}
              </AdminFormSection>
            </div>
          )}
        </div>

        {/* ── Side Inspector Column (Right 4 Cols) ── */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-16">
          {/* 1. Status & Visibility Controller Card */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold font-heading text-slate-900 dark:text-white uppercase tracking-wider">
                Storefront Status
              </span>
              <span
                className={cn(
                  "text-[10px] font-black uppercase px-2 py-0.5 rounded-full font-mono",
                  status === "published"
                    ? "bg-[#DCFCE7] text-[#16A34A]"
                    : status === "draft"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {status}
              </span>
            </div>

            <div className="space-y-2">
              <AdminSelect
                label="Listing Lifecycle State"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { value: "published", label: "🟢 Published (Visible to Shoppers)" },
                  { value: "draft", label: "🟡 Draft (Hidden from Public)" },
                  { value: "archived", label: "⚪ Archived (Discontinued)" },
                ]}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs font-heading uppercase flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Product...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{mode === "create" ? "Publish Product" : "Save Changes"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Real-Time Storefront Card Live Preview */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold font-heading text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#2F65F6]" />
                Storefront Live Preview
              </span>
              <span className="text-[9px] font-mono text-slate-400">Card Reflection</span>
            </div>

            {/* Actual Card Render */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm space-y-2.5 p-3">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={
                    images[0] ||
                    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"
                  }
                  alt={title || "Preview"}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Overlays */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {isFlashDeal && (
                    <span className="bg-[#FF1028] text-white text-[9px] font-black font-mono px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <Zap className="w-2.5 h-2.5" /> FLASH DEAL
                    </span>
                  )}
                  {isFeatured && (
                    <span className="bg-amber-500 text-white text-[9px] font-black font-mono px-2 py-0.5 rounded-md shadow-xs">
                      FEATURED
                    </span>
                  )}
                </div>

                {(video1Url || video2Url) && (
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Video className="w-2.5 h-2.5 text-[#2F65F6]" />
                    <span>2 Demo Videos</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 px-1">
                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-semibold uppercase">
                  <span className="truncate">{currentCategoryName}</span>
                  {currentBrand && (
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                      {currentBrand.logo_url && (
                        <span className="w-2.5 h-2.5 relative inline-block shrink-0">
                          <Image
                            src={currentBrand.logo_url}
                            alt={currentBrand.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </span>
                      )}
                      <span className="truncate max-w-[90px]">{currentBrand.name}</span>
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 font-heading">
                  {title || "Your Product Listing Title"}
                </h4>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    {formatCurrency(basePrice)}
                  </span>
                  {compareAtPrice > basePrice && (
                    <span className="font-mono text-[11px] text-slate-400 line-through">
                      ${compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sourcing Secret Card */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold font-heading">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Sourcing Safeguard</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Secret cost (${cost.toFixed(2)}) and supplier codes ({supplierCode}) are strictly omitted from public GraphQL &amp; REST APIs.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
