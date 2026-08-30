"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Film,
  Play,
  Check,
  Search,
  FolderOpen,
  Scale,
  Plane,
  Truck,
  ShieldCheck,
  Box,
  Ruler,
  Calculator,
  AlertTriangle,
  Info,
  BatteryCharging,
  Tag,
  HelpCircle,
} from "lucide-react";
import { Product, Category, Brand, Variant, ProductStatus } from "@/types/database";
import { MOCK_CATEGORIES, MOCK_BRANDS } from "@/lib/mockData";
import { Modal } from "@/components/ui/Modal";
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
import { useProductStore } from "@/store/useProductStore";
import { useMediaStore } from "@/store/useMediaStore";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatCurrency, slugify, cn } from "@/utils/helpers";
import { createProduct, updateProduct } from "@/app/actions/admin-products";

interface ProductEditorProps {
  mode: "create" | "edit";
  initialProduct?: Product | null;
  categories?: Category[];
  brands?: Brand[];
}

const PARCEL_PRESETS = [
  {
    id: "flyer",
    label: "Small Flyer / Envelope",
    icon: "✉️",
    l: 22,
    w: 15,
    h: 3,
    gw: 0.25,
    nw: 0.18,
    pkg: "bubble_mailer",
    cargo: "general",
    desc: "22×15×3 cm • 0.25 kg",
  },
  {
    id: "tech_box",
    label: "Standard Tech Box",
    icon: "📦",
    l: 30,
    w: 20,
    h: 12,
    gw: 0.85,
    nw: 0.65,
    pkg: "retail_box",
    cargo: "lithium_built_in",
    desc: "30×20×12 cm • 0.85 kg",
  },
  {
    id: "drone_combo",
    label: "Drone Combo Kit",
    icon: "🚁",
    l: 36,
    w: 26,
    h: 14,
    gw: 1.45,
    nw: 1.10,
    pkg: "corrugated_box",
    cargo: "lithium_built_in",
    desc: "36×26×14 cm • 1.45 kg",
  },
  {
    id: "carton",
    label: "Medium Carton",
    icon: "📦",
    l: 45,
    w: 32,
    h: 22,
    gw: 2.80,
    nw: 2.30,
    pkg: "corrugated_box",
    cargo: "general",
    desc: "45×32×22 cm • 2.80 kg",
  },
  {
    id: "heavy_crate",
    label: "Large Heavy Cargo",
    icon: "🛫",
    l: 58,
    w: 42,
    h: 35,
    gw: 6.50,
    nw: 5.80,
    pkg: "wooden_crate",
    cargo: "general",
    desc: "58×42×35 cm • 6.50 kg",
  },
];

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
  const [purchaseUrl, setPurchaseUrl] = useState(initialProduct?.purchase_url || "https://1688.com");
  const [shippingOrigin, setShippingOrigin] = useState(initialProduct?.shipping_origin || "Shenzhen, Guangdong, China");
  
  // Physical Parcel Dimensions & Weights
  const initialDims = (initialProduct?.dimensions && typeof initialProduct.dimensions === "object" ? initialProduct.dimensions : null) as any;
  const [length, setLength] = useState<number>(initialDims?.length ?? 30);
  const [width, setWidth] = useState<number>(initialDims?.width ?? 20);
  const [height, setHeight] = useState<number>(initialDims?.height ?? 12);
  const [dimensionUnit, setDimensionUnit] = useState<"cm" | "inch">(initialDims?.unit === "inch" ? "inch" : "cm");
  const [weight, setWeight] = useState<number>(initialProduct?.weight ?? 0.85); // Gross shipping weight (KG)
  const [netWeight, setNetWeight] = useState<number>(initialProduct?.net_weight ?? 0.65); // Net product weight (KG)

  // Cargo, Packaging & Customs Compliance
  const [cargoType, setCargoType] = useState<string>(initialProduct?.cargo_type || "lithium_built_in");
  const [packageType, setPackageType] = useState<string>(initialProduct?.package_type || "corrugated_box");
  const [hsCode, setHsCode] = useState<string>(initialProduct?.hs_code || "8517.62.00");
  const [customsDeclaredValue, setCustomsDeclaredValue] = useState<number>(
    initialProduct?.customs_declared_value ?? (initialProduct?.base_price ? Math.round(initialProduct.base_price * 0.35) : 25.0)
  );
  const [customsDeclarationName, setCustomsDeclarationName] = useState<string>(
    initialProduct?.customs_declaration_name || "Electronic Device Accessory / 消费电子配件"
  );
  const [leadTime, setLeadTime] = useState<string>(initialProduct?.lead_time || "Same Day Dispatch (24h)");
  const [domesticShippingCost, setDomesticShippingCost] = useState<number>(initialProduct?.domestic_shipping_cost ?? 1.50);
  const [supplierContact, setSupplierContact] = useState<string>(initialProduct?.supplier_contact || "");
  const [moq, setMoq] = useState<number>(initialProduct?.moq ?? 1);

  // Dynamic Logistics Computations
  const cbm = useMemo(() => {
    if (length <= 0 || width <= 0 || height <= 0) return 0;
    if (dimensionUnit === "inch") {
      return Number(((length * width * height * 16.387) / 1000000).toFixed(4));
    }
    return Number(((length * width * height) / 1000000).toFixed(4));
  }, [length, width, height, dimensionUnit]);

  const volumetricWeight = useMemo(() => {
    if (length <= 0 || width <= 0 || height <= 0) return 0;
    const lCm = dimensionUnit === "inch" ? length * 2.54 : length;
    const wCm = dimensionUnit === "inch" ? width * 2.54 : width;
    const hCm = dimensionUnit === "inch" ? height * 2.54 : height;
    return Number(((lCm * wCm * hCm) / 5000).toFixed(2));
  }, [length, width, height, dimensionUnit]);

  const chargeableWeight = useMemo(() => {
    return Number(Math.max(weight || 0, volumetricWeight || 0).toFixed(2));
  }, [weight, volumetricWeight]);

  const isVolumetricChargeApplied = volumetricWeight > (weight || 0);

  const estimatedAirCargoCost = useMemo(() => {
    if (chargeableWeight <= 0) return 0;
    const dgFee = cargoType !== "general" ? 2.50 : 0;
    return Number((4.99 + chargeableWeight * 6.50 + dgFee).toFixed(2));
  }, [chargeableWeight, cargoType]);

  const estimatedSeaCargoCost = useMemo(() => {
    if (cbm <= 0 && (weight || 0) <= 0) return 0;
    const rt = Math.max(cbm, (weight || 0) / 1000, 0.05);
    return Number((Math.max(15.0, 12.0 + rt * 45.0)).toFixed(2));
  }, [cbm, weight]);

  const handleApplyPreset = (preset: (typeof PARCEL_PRESETS)[0]) => {
    setLength(preset.l);
    setWidth(preset.w);
    setHeight(preset.h);
    setDimensionUnit("cm");
    setWeight(preset.gw);
    setNetWeight(preset.nw);
    setPackageType(preset.pkg);
    setCargoType(preset.cargo);
    toast.info(`Applied preset "${preset.label}" (${preset.desc})`);
  };

  // Media & Video Showcases
  const [images, setImages] = useState<string[]>(
    initialProduct?.media && initialProduct.media.length > 0
      ? initialProduct.media.map((m) => m.url)
      : [
          "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80",
        ]
  );

  const mediaAssets = useMediaStore((state) => state.media);
  const availableVideoAssets = useMemo(() => {
    return mediaAssets.filter(
      (m) =>
        m.type === "video" ||
        m.category === "dual-video" ||
        /\.(mp4|webm|mov|avi|mkv|m4v)(\?.*)?$/i.test(m.url) ||
        m.url.includes("/storage/hero-ad/")
    );
  }, [mediaAssets]);

  const defaultQcVideo1 = availableVideoAssets[0] || {
    name: "2026-04-30-69f39980682e5",
    url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov",
  };
  const defaultQcVideo2 = availableVideoAssets[1] || {
    name: "2026-04-30-69f399744ce0c",
    url: "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov",
  };

  const [video1Title, setVideo1Title] = useState(
    initialProduct?.videos?.[0]?.title || `Slot 1: Quality Inspection / Factory QC Teardown (${defaultQcVideo1.name.replace(/\.[^/.]+$/, "")})`
  );
  const [video1Url, setVideo1Url] = useState(
    initialProduct?.videos?.[0]?.url || defaultQcVideo1.url
  );

  const [video2Title, setVideo2Title] = useState(
    initialProduct?.videos?.[1]?.title || `Slot 2: Live Flight / Hands-on Performance Demo (${defaultQcVideo2.name.replace(/\.[^/.]+$/, "")})`
  );
  const [video2Url, setVideo2Url] = useState(
    initialProduct?.videos?.[1]?.url || defaultQcVideo2.url
  );

  // Dynamically update default videos in create mode if media store updates
  useEffect(() => {
    if (mode === "create" && (!initialProduct?.videos || initialProduct.videos.length === 0)) {
      if (availableVideoAssets[0] && (!video1Url || video1Url.includes("dQw4w9WgXcQ"))) {
        setVideo1Url(availableVideoAssets[0].url);
        setVideo1Title(`Slot 1: Factory QC Teardown (${availableVideoAssets[0].name.replace(/\.[^/.]+$/, "")})`);
      }
      if (availableVideoAssets[1] && (!video2Url || video2Url.includes("dQw4w9WgXcQ"))) {
        setVideo2Url(availableVideoAssets[1].url);
        setVideo2Title(`Slot 2: Live Flight Demo (${availableVideoAssets[1].name.replace(/\.[^/.]+$/, "")})`);
      }
    }
  }, [mode, initialProduct, availableVideoAssets, video1Url, video2Url]);

  // Video Picker from Media Asset Library
  const [videoPickerSlot, setVideoPickerSlot] = useState<1 | 2 | null>(null);
  const [videoPickerSearch, setVideoPickerSearch] = useState("");

  const filteredVideoAssets = useMemo(() => {
    if (!videoPickerSearch.trim()) return availableVideoAssets;
    const query = videoPickerSearch.toLowerCase();
    return availableVideoAssets.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.format.toLowerCase().includes(query) ||
        m.url.toLowerCase().includes(query)
    );
  }, [availableVideoAssets, videoPickerSearch]);

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
      formData.set("stock", String(stock));
      formData.set("status", status);
      formData.set("is_featured", String(isFeatured));
      formData.set("is_flash_deal", String(isFlashDeal));
      formData.set("is_best_seller", String(isBestSeller));
      formData.set("is_new_arrival", String(isNewArrival));
      formData.set("seo_title", seoTitle.trim());
      formData.set("seo_description", seoDescription.trim());
      formData.set("tags", tags);

      // Sizing, Weight & Logistics
      formData.set("length", String(length));
      formData.set("width", String(width));
      formData.set("height", String(height));
      formData.set("dimension_unit", dimensionUnit);
      formData.set("weight", String(weight));
      formData.set("net_weight", String(netWeight));
      formData.set("volumetric_weight", String(volumetricWeight));
      formData.set("cbm", String(cbm));
      formData.set("cargo_type", cargoType);
      formData.set("package_type", packageType);
      formData.set("hs_code", hsCode.trim());
      formData.set("customs_declared_value", String(customsDeclaredValue));
      formData.set("customs_declaration_name", customsDeclarationName.trim());
      formData.set("lead_time", leadTime);
      formData.set("domestic_shipping_cost", String(domesticShippingCost));
      formData.set("supplier_contact", supplierContact.trim());
      formData.set("moq", String(moq));
      formData.set("purchase_url", purchaseUrl.trim());

      // Videos
      formData.set("video1_url", video1Url);
      formData.set("video1_title", video1Title);
      formData.set("video2_url", video2Url);
      formData.set("video2_title", video2Title);

      // Images
      images.forEach((img) => formData.append("images", img));

      const dimensionsObj = {
        length,
        width,
        height,
        unit: dimensionUnit,
        volumetric_weight: volumetricWeight,
        cbm,
      };

      if (mode === "edit" && initialProduct?.id) {
        const res = await updateProduct(initialProduct.id, formData);
        if (res.success) {
          useProductStore.getState().updateProduct(initialProduct.id, {
            title: title.trim(),
            slug: slug.trim() || slugify(title),
            sku: sku.trim(),
            category_id: categoryId,
            brand_id: brandId,
            short_description: shortDescription.trim(),
            description: description.trim(),
            base_price: basePrice,
            compare_at_price: compareAtPrice,
            cost,
            supplier_code: supplierCode.trim(),
            shipping_origin: shippingOrigin.trim(),
            weight,
            net_weight: netWeight,
            dimensions: dimensionsObj,
            hs_code: hsCode.trim(),
            cargo_type: cargoType,
            package_type: packageType,
            customs_declared_value: customsDeclaredValue,
            customs_declaration_name: customsDeclarationName.trim(),
            lead_time: leadTime,
            domestic_shipping_cost: domesticShippingCost,
            supplier_contact: supplierContact.trim(),
            moq,
            purchase_url: purchaseUrl.trim(),
            status,
            is_featured: isFeatured,
            is_flash_deal: isFlashDeal,
            is_best_seller: isBestSeller,
            is_new_arrival: isNewArrival,
            seo_title: seoTitle.trim(),
            seo_description: seoDescription.trim(),
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            media: images.map((url, i) => ({
              id: `m-${Date.now()}-${i}`,
              product_id: initialProduct.id,
              url,
              alt: title,
              type: "image" as const,
              position: i + 1,
              created_at: new Date().toISOString(),
            })),
            videos: [
              {
                id: `v-${Date.now()}-1`,
                product_id: initialProduct.id,
                url: video1Url || "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov",
                title: video1Title || "Slot 1: Hardware Teardown QC",
                type: video1Url.includes("youtube") || video1Url.includes("vimeo") || video1Url.includes("/embed/") ? ("embed" as const) : ("uploaded" as const),
                position: 1,
                created_at: new Date().toISOString(),
              },
              {
                id: `v-${Date.now()}-2`,
                product_id: initialProduct.id,
                url: video2Url || "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov",
                title: video2Title || "Slot 2: Live Flight Demo",
                type: video2Url.includes("youtube") || video2Url.includes("vimeo") || video2Url.includes("/embed/") ? ("embed" as const) : ("uploaded" as const),
                position: 2,
                created_at: new Date().toISOString(),
              },
            ],
          });
          toast.success(res.message || `Updated "${title}" successfully!`);
          router.push("/admin/products");
        } else {
          toast.error(res.message || "Failed to update product.");
        }
      } else {
        const res = await createProduct(formData);
        if (res.success) {
          if (res.product) {
            useProductStore.getState().addProduct(res.product);
          } else {
            const newProdObj: Product = {
              id: res.productId || `prod-${Date.now()}`,
              title: title.trim(),
              slug: slug.trim() || slugify(title),
              sku: sku.trim(),
              category_id: categoryId,
              brand_id: brandId,
              short_description: shortDescription.trim(),
              description: description.trim(),
              base_price: basePrice,
              compare_at_price: compareAtPrice,
              cost,
              supplier_code: supplierCode.trim(),
              shipping_origin: shippingOrigin.trim(),
              weight,
              net_weight: netWeight,
              dimensions: dimensionsObj,
              hs_code: hsCode.trim(),
              cargo_type: cargoType,
              package_type: packageType,
              customs_declared_value: customsDeclaredValue,
              customs_declaration_name: customsDeclarationName.trim(),
              lead_time: leadTime,
              domestic_shipping_cost: domesticShippingCost,
              supplier_contact: supplierContact.trim(),
              moq,
              purchase_url: purchaseUrl.trim(),
              status,
              is_featured: isFeatured,
              is_flash_deal: isFlashDeal,
              is_best_seller: isBestSeller,
              is_new_arrival: isNewArrival,
              flash_deal_ends_at: null,
              seo_title: seoTitle.trim(),
              seo_description: seoDescription.trim(),
              avg_rating: 5.0,
              review_count: 0,
              sold_count: 0,
              tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              media: (images.length > 0 ? images : ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"]).map((url, i) => ({
                id: `m-${Date.now()}-${i}`,
                product_id: res.productId || `prod-${Date.now()}`,
                url,
                alt: title,
                type: "image" as const,
                position: i + 1,
                created_at: new Date().toISOString(),
              })),
              videos: [
                {
                  id: `v-${Date.now()}-1`,
                  product_id: res.productId || `prod-${Date.now()}`,
                  url: video1Url || "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov",
                  title: video1Title || "Slot 1: Hardware Teardown QC",
                  type: video1Url.includes("youtube") || video1Url.includes("vimeo") || video1Url.includes("/embed/") ? ("embed" as const) : ("uploaded" as const),
                  position: 1,
                  created_at: new Date().toISOString(),
                },
                {
                  id: `v-${Date.now()}-2`,
                  product_id: res.productId || `prod-${Date.now()}`,
                  url: video2Url || "https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov",
                  title: video2Title || "Slot 2: Live Flight Demo",
                  type: video2Url.includes("youtube") || video2Url.includes("vimeo") || video2Url.includes("/embed/") ? ("embed" as const) : ("uploaded" as const),
                  position: 2,
                  created_at: new Date().toISOString(),
                },
              ],
              variants: [
                {
                  id: `v-${Date.now()}`,
                  product_id: res.productId || `prod-${Date.now()}`,
                  sku: `${sku}-STD`,
                  title: "Standard Edition",
                  price: basePrice,
                  compare_at_price: compareAtPrice,
                  cost,
                  stock: stock,
                  low_stock_threshold: 10,
                  weight: weight || 0.5,
                  attributes: {},
                  image_url: images[0] || null,
                  supplier_code: supplierCode,
                  is_active: true,
                  position: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            };
            useProductStore.getState().addProduct(newProdObj);
          }
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
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain py-1">
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
                    "px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0",
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

              {/* Protected China Factory Sourcing Secrets */}
              <AdminFormSection
                title="Protected China Factory Sourcing & Supplier Secrets"
                icon={Lock}
                description="Encrypted supplier identifiers, direct 1688 wholesale links, and private negotiation records restricted to admin eyes."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminInput
                    label="Supplier Identification Code"
                    required
                    value={supplierCode}
                    onChange={(e) => setSupplierCode(e.target.value)}
                    placeholder="SUP-SZ-9012"
                    helperText="Internal code mapped to Chinese factory / vendor."
                  />

                  <AdminInput
                    label="Shipping Origin Hub"
                    value={shippingOrigin}
                    onChange={(e) => setShippingOrigin(e.target.value)}
                    placeholder="Shenzhen, Guangdong, China"
                    helperText="Primary dispatch airport / consolidation warehouse."
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
                          helperText="Direct procurement URL for purchasing team restock."
                        />
                      </div>
                      {purchaseUrl && (
                        <a
                          href={purchaseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-6 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                          title="Test Supplier Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                          <span>Open Link</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <AdminInput
                    label="Supplier Contact / WeChat / WangWang ID"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    placeholder="WeChat: factory_sz_888 / WangWang: szdrone_oem"
                    helperText="Private factory rep contact details for bulk inquiries."
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <AdminInput
                      label="Factory MOQ (Units)"
                      type="number"
                      min={1}
                      value={moq}
                      onChange={(e) => setMoq(Math.max(1, Number(e.target.value)))}
                      helperText="Minimum order quantity."
                    />

                    <AdminInput
                      label="China Domestic Courier (¥ / $)"
                      type="number"
                      step="0.1"
                      min={0}
                      value={domesticShippingCost}
                      onChange={(e) => setDomesticShippingCost(Number(e.target.value))}
                      helperText="Inland fee to Shenzhen Hub."
                    />
                  </div>
                </div>
              </AdminFormSection>

              {/* China Sourcing Logistics & Parcel Dimensions Engine */}
              <AdminFormSection
                title="China Sourcing Logistics & Parcel Dimensions Engine"
                icon={Box}
                description="Live volumetric & air cargo calculators, physical package dimensions, hazardous cargo certification, and customs declarations."
                badge={
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                    AIR CARGO READY
                  </span>
                }
              >
                {/* 1. Quick-Fill Parcel Presets */}
                <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-heading">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      1-Click Package Dimension Presets
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Quick auto-fill</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {PARCEL_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#2F65F6] hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer group"
                      >
                        <span>{preset.icon}</span>
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-[#2F65F6]">
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({preset.desc})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Interactive Real-Time Logistics Telemetry Bar */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-sm border border-slate-800 font-mono">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-blue-400" />
                      Live Air Cargo Freight &amp; Sizing Engine
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                        isVolumetricChargeApplied
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      )}
                    >
                      <Scale className="w-3 h-3" />
                      {isVolumetricChargeApplied
                        ? "Charged by Volumetric Weight (Size Heavy)"
                        : "Charged by Gross Weight (Actual Weight)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">CBM Volume</span>
                      <span className="text-base sm:text-lg font-black text-blue-400">
                        {cbm.toFixed(4)} <span className="text-xs text-slate-500">m³</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Volumetric Wt</span>
                      <span className="text-base sm:text-lg font-black text-amber-300">
                        {volumetricWeight.toFixed(2)} <span className="text-xs text-slate-500">KG</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Billable Wt</span>
                      <span className="text-base sm:text-lg font-black text-emerald-400">
                        {chargeableWeight.toFixed(2)} <span className="text-xs text-slate-500">KG</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Est. Airfreight ⚡</span>
                      <span className="text-base sm:text-lg font-black text-white">
                        ${estimatedAirCargoCost.toFixed(2)}{" "}
                        <span className="text-xs text-slate-500 font-sans">USDT</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Est. Sea Cargo 🚢</span>
                      <span className="text-base sm:text-lg font-black text-cyan-300">
                        ${estimatedSeaCargoCost.toFixed(2)}{" "}
                        <span className="text-xs text-slate-500 font-sans">USDT</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Physical Dimensions (L, W, H) & Unit Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-heading flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-blue-500" />
                      Parcel Physical Dimensions (L × W × H)
                    </label>

                    {/* Unit Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setDimensionUnit("cm")}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer",
                          dimensionUnit === "cm"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        Centimeters (cm)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDimensionUnit("inch")}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer",
                          dimensionUnit === "inch"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        Inches (in)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <AdminInput
                      label={`Length (${dimensionUnit})`}
                      type="number"
                      step="0.1"
                      min={0.1}
                      value={length}
                      onChange={(e) => setLength(Math.max(0, Number(e.target.value)))}
                      placeholder="30"
                      helperText="Longest side of shipping carton."
                    />

                    <AdminInput
                      label={`Width (${dimensionUnit})`}
                      type="number"
                      step="0.1"
                      min={0.1}
                      value={width}
                      onChange={(e) => setWidth(Math.max(0, Number(e.target.value)))}
                      placeholder="20"
                      helperText="Median side of carton."
                    />

                    <AdminInput
                      label={`Height (${dimensionUnit})`}
                      type="number"
                      step="0.1"
                      min={0.1}
                      value={height}
                      onChange={(e) => setHeight(Math.max(0, Number(e.target.value)))}
                      placeholder="12"
                      helperText="Vertical height of carton."
                    />
                  </div>
                </div>

                {/* 4. Dual Weight Breakdown (Gross vs. Net) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminInput
                    label="Gross Shipping Weight (KG)"
                    required
                    type="number"
                    step="0.01"
                    min={0.01}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    helperText="Total boxed weight including bubble wrap and outer carton."
                  />

                  <AdminInput
                    label="Net Product Weight (KG)"
                    type="number"
                    step="0.01"
                    min={0.01}
                    value={netWeight}
                    onChange={(e) => setNetWeight(Number(e.target.value))}
                    helperText="Bare product weight (used in customer specs table)."
                  />
                </div>

                {/* 5. Dangerous Goods / Battery & Packaging Classification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminSelect
                    label="Cargo & Battery Classification (Airfreight DG Class)"
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    options={[
                      { value: "general", label: "📦 General Cargo (普货 - Standard Non-Battery)" },
                      { value: "lithium_built_in", label: "🔋 Built-in Lithium Battery (PI967 - Drone / Phone)" },
                      { value: "lithium_pure", label: "⚡ Pure Lithium Battery / Power Bank (PI965)" },
                      { value: "liquid_cream", label: "🧴 Liquid / Cream / Cosmetics (化妆品/液体)" },
                      { value: "magnetic", label: "🧲 Magnetized Goods / Speaker (带磁货物)" },
                      { value: "powder", label: "🧪 Powder / Chemical (粉末敏感品)" },
                    ]}
                    helperText="Mandatory for China Customs export screening and airline manifest."
                  />

                  <AdminSelect
                    label="Packaging Material & Outer Container"
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    options={[
                      { value: "corrugated_box", label: "📦 Double-Wall Corrugated Air-Cargo Box" },
                      { value: "bubble_mailer", label: "✉️ Shockproof Waterproof Bubble Mailer" },
                      { value: "retail_box", label: "🎁 Original Factory Color Gift Box" },
                      { value: "wooden_crate", label: "🪵 Reinforced Wooden Pallet / Export Crate" },
                      { value: "anti_static", label: "🛡️ Anti-Static Shielding Bag" },
                    ]}
                    helperText="Protection class provided for international airfreight transit."
                  />
                </div>

                {/* 6. Customs Tariffs & Cross-Border Export Compliance */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-heading block">
                    Cross-Border Customs &amp; Tariff Compliance
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AdminInput
                      label="HS Customs Tariff Code"
                      value={hsCode}
                      onChange={(e) => setHsCode(e.target.value)}
                      placeholder="8517.62.00 / 8806.22.00"
                      helperText="Harmonized System code for automated customs duty clearance."
                    />

                    <AdminInput
                      label="Declared Customs Value ($ USDT)"
                      type="number"
                      step="0.5"
                      min={0}
                      value={customsDeclaredValue}
                      onChange={(e) => setCustomsDeclaredValue(Number(e.target.value))}
                      helperText="Declared commodity value on air waybill (AWB) invoice."
                    />

                    <AdminInput
                      label="Customs Declaration Commodity Name"
                      value={customsDeclarationName}
                      onChange={(e) => setCustomsDeclarationName(e.target.value)}
                      placeholder="RC Quadcopter Toy / 遥控无人机玩具"
                      helperText="English & Chinese product title on export shipping manifest."
                    />

                    <AdminSelect
                      label="Sourcing & Dispatch SLA / Lead Time"
                      value={leadTime}
                      onChange={(e) => setLeadTime(e.target.value)}
                      options={[
                        { value: "Same Day Dispatch (24h)", label: "⚡ Same Day Dispatch (Within 24h)" },
                        { value: "1–2 Business Days", label: "📦 1–2 Business Days (Shenzhen SZX Hub)" },
                        { value: "3–5 Days Factory Direct", label: "🏭 3–5 Days Factory Sourcing & QC" },
                        { value: "7–10 Days Pre-Order", label: "🛠️ 7–10 Days Custom OEM Manufacturing" },
                      ]}
                      helperText="Expected time from order placement to international carrier handoff."
                    />
                  </div>
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
                <div className="space-y-5">
                  {/* Slot 1 Video */}
                  <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-heading flex items-center gap-1.5">
                        <Video className="w-4 h-4" />
                        Slot 1: Quality Inspection / Factory QC Teardown
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVideoPickerSlot(1);
                            setVideoPickerSearch("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Choose from Media Library</span>
                        </button>
                        <span className="text-[10px] font-mono text-slate-400">Embed / MP4 / MOV</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AdminInput
                        label="Video Title"
                        value={video1Title}
                        onChange={(e) => setVideo1Title(e.target.value)}
                        placeholder="e.g. Slot 1: Factory QC & Teardown Demo"
                      />
                      <AdminInput
                        label="Embed / Direct Video URL"
                        value={video1Url}
                        onChange={(e) => setVideo1Url(e.target.value)}
                        placeholder="https://... (.mp4 / .mov / YouTube)"
                      />
                    </div>

                    {/* Quick Suggestions Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                        Quick Media Library Presets:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVideo1Title("Slot 1: Hardware Teardown QC");
                          setVideo1Url("https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov");
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer flex items-center gap-1",
                          video1Url.includes("69f39980682e5")
                            ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                        )}
                      >
                        <Film className="w-3 h-3 text-amber-500" />
                        <span>2026-04-30-69f39980682e5 (51.4 MB QC Teardown)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVideo1Title("Slot 1: Flight Stability & QC Test");
                          setVideo1Url("https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov");
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer flex items-center gap-1",
                          video1Url.includes("69f399744ce0c")
                            ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                        )}
                      >
                        <Film className="w-3 h-3 text-blue-500" />
                        <span>2026-04-30-69f399744ce0c (11.5 MB QC Demo)</span>
                      </button>
                    </div>

                    {/* Live Video Preview Frame */}
                    {video1Url && (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/10 border border-slate-200 dark:border-slate-800">
                        {video1Url.includes("youtube") || video1Url.includes("vimeo") || video1Url.includes("/embed/") ? (
                          <iframe
                            src={video1Url}
                            title="Slot 1 Video Preview"
                            className="w-full h-full"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={video1Url}
                            controls
                            playsInline
                            className="w-full h-full object-contain bg-black"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Slot 2 Video */}
                  <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#2F65F6] font-heading flex items-center gap-1.5">
                        <Video className="w-4 h-4" />
                        Slot 2: Live Flight / Hands-on Performance Demo
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVideoPickerSlot(2);
                            setVideoPickerSearch("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Choose from Media Library</span>
                        </button>
                        <span className="text-[10px] font-mono text-slate-400">Embed / MP4 / MOV</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AdminInput
                        label="Video Title"
                        value={video2Title}
                        onChange={(e) => setVideo2Title(e.target.value)}
                        placeholder="e.g. Slot 2: Live Flight & Hands-on Performance"
                      />
                      <AdminInput
                        label="Embed / Direct Video URL"
                        value={video2Url}
                        onChange={(e) => setVideo2Url(e.target.value)}
                        placeholder="https://... (.mp4 / .mov / YouTube)"
                      />
                    </div>

                    {/* Quick Suggestions Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                        Quick Media Library Presets:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVideo2Title("Slot 2: Live Performance & Stress Test");
                          setVideo2Url("https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f399744ce0c.mov");
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer flex items-center gap-1",
                          video2Url.includes("69f399744ce0c")
                            ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                        )}
                      >
                        <Film className="w-3 h-3 text-blue-500" />
                        <span>2026-04-30-69f399744ce0c (11.5 MB Live Flight Demo)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVideo2Title("Slot 2: Factory Teardown Inspection");
                          setVideo2Url("https://lennoxonemall.com/storage/hero-ad/2026-04-30-69f39980682e5.mov");
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer flex items-center gap-1",
                          video2Url.includes("69f39980682e5")
                            ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                        )}
                      >
                        <Film className="w-3 h-3 text-amber-500" />
                        <span>2026-04-30-69f39980682e5 (51.4 MB QC Teardown)</span>
                      </button>
                    </div>

                    {/* Live Video Preview Frame */}
                    {video2Url && (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/10 border border-slate-200 dark:border-slate-800">
                        {video2Url.includes("youtube") || video2Url.includes("vimeo") || video2Url.includes("/embed/") ? (
                          <iframe
                            src={video2Url}
                            title="Slot 2 Video Preview"
                            className="w-full h-full"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={video2Url}
                            controls
                            playsInline
                            className="w-full h-full object-contain bg-black"
                          />
                        )}
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
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:overscroll-contain pr-0.5 no-scrollbar sm:[scrollbar-width:thin]">
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

      {/* ── Media Asset Video Picker Modal ── */}
      <Modal
        isOpen={videoPickerSlot !== null}
        onClose={() => setVideoPickerSlot(null)}
        title={`Select Video for Slot ${videoPickerSlot}`}
        size="2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={videoPickerSearch}
                onChange={(e) => setVideoPickerSearch(e.target.value)}
                placeholder="Search uploaded videos by filename or format..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#2F65F6]"
              />
            </div>
            <span className="text-[11px] font-mono text-slate-500 shrink-0">
              {filteredVideoAssets.length} Video{filteredVideoAssets.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {filteredVideoAssets.length === 0 ? (
              <div className="sm:col-span-2 py-10 text-center space-y-2">
                <Video className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No matching video assets found in Media Library.</p>
                <Link
                  href="/admin/media"
                  className="text-xs font-bold text-[#2F65F6] hover:underline"
                  target="_blank"
                >
                  Upload New Video in Media Library &rarr;
                </Link>
              </div>
            ) : (
              filteredVideoAssets.map((asset) => {
                const isCurrentSelected =
                  (videoPickerSlot === 1 && video1Url === asset.url) ||
                  (videoPickerSlot === 2 && video2Url === asset.url);

                return (
                  <div
                    key={asset.id}
                    className={cn(
                      "p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5",
                      isCurrentSelected
                        ? "border-[#2F65F6] bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                    )}
                  >
                    {/* Video Player / Thumbnail */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/40">
                      {asset.url.includes("youtube") || asset.url.includes("vimeo") || asset.url.includes("/embed/") ? (
                        <iframe
                          src={asset.url}
                          title={asset.name}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={asset.url}
                          controls
                          playsInline
                          className="w-full h-full object-contain bg-black"
                        />
                      )}
                      <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none">
                        <span className="bg-black/80 backdrop-blur-xs text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {asset.format}
                        </span>
                        <span className="bg-blue-600/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {asset.size}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate font-mono">
                          {asset.name}
                        </h5>
                        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase shrink-0">
                          {asset.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {asset.dimensions || "1080p Full HD"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (videoPickerSlot === 1) {
                          setVideo1Url(asset.url);
                          if (!video1Title || video1Title.startsWith("Slot 1:")) {
                            setVideo1Title(`Slot 1: ${asset.name.replace(/\.[^/.]+$/, "")} QC`);
                          }
                        } else if (videoPickerSlot === 2) {
                          setVideo2Url(asset.url);
                          if (!video2Title || video2Title.startsWith("Slot 2:")) {
                            setVideo2Title(`Slot 2: ${asset.name.replace(/\.[^/.]+$/, "")} Demo`);
                          }
                        }
                        toast.success(`Attached "${asset.name}" to Slot ${videoPickerSlot}!`);
                        setVideoPickerSlot(null);
                      }}
                      className={cn(
                        "w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                        isCurrentSelected
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-[#00143D] text-white hover:bg-[#002366]"
                      )}
                    >
                      {isCurrentSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Currently Selected</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-3.5 h-3.5 text-amber-400" />
                          <span>Use in Slot {videoPickerSlot}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* ── Mobile & Laptop Quick Sticky Save Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 p-3 sm:px-6 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full shrink-0",
              status === "published"
                ? "bg-[#16A34A] ring-2 ring-emerald-100 dark:ring-emerald-950"
                : status === "draft"
                ? "bg-amber-500 ring-2 ring-amber-100 dark:ring-amber-950"
                : "bg-slate-400"
            )}
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-heading">
              {title || (mode === "create" ? "New Product Listing" : "Edit Product")}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {status.toUpperCase()} • ${basePrice > 0 ? basePrice.toFixed(2) : "0.00"} USDT
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/products"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF1028] hover:bg-[#E00B20] text-white transition-all shadow-md shadow-red-500/20 font-heading uppercase flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{mode === "create" ? "Publish" : "Save"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
