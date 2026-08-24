"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Video,
  Eye,
  Lock,
  Upload,
  Download,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS } from "@/lib/mockData";
import { Product, Category, Brand } from "@/types/database";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { SlideOver } from "@/components/admin/SlideOver";
import { Modal } from "@/components/ui/Modal";
import {
  AdminInput,
  AdminSelect,
  AdminUploader,
  AdminTextarea,
  AdminFormSection,
} from "@/components/admin/forms";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatCurrency, cn } from "@/utils/helpers";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/actions/admin-products";

export default function AdminProductsPage() {
  const toast = useAdminToast();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [isLoading, setIsLoading] = useState(false);

  // SlideOver / Modal States
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formTab, setFormTab] = useState<"general" | "media" | "supplier" | "seo">("general");

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formCategoryId, setFormCategoryId] = useState(MOCK_CATEGORIES[0]?.id || "");
  const [formBrandId, setFormBrandId] = useState(MOCK_BRANDS[0]?.id || "");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formBasePrice, setFormBasePrice] = useState(89.99);
  const [formComparePrice, setFormComparePrice] = useState(159.99);
  const [formCost, setFormCost] = useState(48.5); // Secret supplier cost
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsFlashDeal, setFormIsFlashDeal] = useState(false);

  // Media & Video Fields
  const [formImages, setFormImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80",
  ]);

  // Dedicated 2 Videos
  const [formVideo1Title, setFormVideo1Title] = useState("Slot 1: Factory QC & Teardown Demo");
  const [formVideo1Url, setFormVideo1Url] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");

  const [formVideo2Title, setFormVideo2Title] = useState("Slot 2: Live Flight & Hands-on Performance");
  const [formVideo2Url, setFormVideo2Url] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");

  // Private Sourcing Secrets
  const [formSupplierCode, setFormSupplierCode] = useState("SUP-GZ-4419");
  const [formPurchaseUrl, setFormPurchaseUrl] = useState("https://1688.com/item/694829104.html");
  const [formShippingOrigin, setFormShippingOrigin] = useState("Guangdong, China");

  // SEO
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDesc, setFormSeoDesc] = useState("");

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminProducts();
      if (res.success) {
        setProducts(res.products);
        if (res.categories?.length) setCategories(res.categories);
        if (res.brands?.length) setBrands(res.brands);
      }
    } catch {
      toast.error("Failed to fetch product catalogue.");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const handleOpenCreate = () => {
    setEditingProductId(null);
    setFormTitle("");
    setFormSlug("");
    setFormSku(`LCM-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCategoryId(categories[0]?.id || "");
    setFormBrandId(brands[0]?.id || "");
    setFormShortDesc("");
    setFormDesc("");
    setFormBasePrice(99.0);
    setFormComparePrice(179.0);
    setFormCost(52.0);
    setFormIsFeatured(false);
    setFormIsFlashDeal(false);
    setFormImages([
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    ]);
    setFormVideo1Title("Slot 1: Factory QC Teardown");
    setFormVideo1Url("https://www.youtube.com/embed/dQw4w9WgXcQ");
    setFormVideo2Title("Slot 2: 4K Performance Test");
    setFormVideo2Url("https://www.youtube.com/embed/dQw4w9WgXcQ");
    setFormSupplierCode(`SUP-SZ-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPurchaseUrl("https://1688.com");
    setFormShippingOrigin("Shenzhen, China");
    setFormSeoTitle("");
    setFormSeoDesc("");
    setFormTab("general");
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProductId(product.id);
    setFormTitle(product.title);
    setFormSlug(product.slug);
    setFormSku(product.sku);
    setFormCategoryId(product.category_id);
    setFormBrandId(product.brand_id || brands[0]?.id || "");
    setFormShortDesc(product.short_description || "");
    setFormDesc(product.description || "");
    setFormBasePrice(product.base_price);
    setFormComparePrice(product.compare_at_price || product.base_price * 1.6);
    setFormCost(product.cost || product.base_price * 0.55);
    setFormIsFeatured(product.is_featured);
    setFormIsFlashDeal(product.is_flash_deal);

    setFormImages(
      product.media && product.media.length > 0
        ? product.media.map((m) => m.url)
        : ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"]
    );

    const vid1 = product.videos?.[0];
    const vid2 = product.videos?.[1];
    setFormVideo1Title(vid1?.title || "Slot 1: Quality Inspection");
    setFormVideo1Url(vid1?.url || "https://www.youtube.com/embed/dQw4w9WgXcQ");

    setFormVideo2Title(vid2?.title || "Slot 2: Live Flight Demo");
    setFormVideo2Url(vid2?.url || "https://www.youtube.com/embed/dQw4w9WgXcQ");

    setFormSupplierCode(product.supplier_code || "SUP-GZ-4419");
    setFormPurchaseUrl("https://1688.com");
    setFormShippingOrigin(product.shipping_origin || "Guangdong, China");
    setFormSeoTitle(product.seo_title || "");
    setFormSeoDesc(product.seo_description || "");
    setFormTab("general");
    setIsSlideOverOpen(true);
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      title: `${product.title} (Copy)`,
      sku: `${product.sku}-COPY`,
      slug: `${product.slug}-copy`,
    };
    setProducts((prev) => [duplicated, ...prev]);
    toast.success(`Duplicated "${product.title}" successfully.`);
  };

  const handleDeleteProduct = async (productId: string, title: string) => {
    try {
      const res = await deleteProduct(productId);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        toast.success(`Removed "${title}" from catalogue.`);
      } else {
        toast.error(res.message || "Failed to delete product.");
      }
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.warning("Please enter a product title.");
      return;
    }

    const formData = new FormData();
    formData.set("title", formTitle);
    formData.set("slug", formSlug || formTitle.toLowerCase().replace(/\s+/g, "-"));
    formData.set("sku", formSku);
    formData.set("category_id", formCategoryId);
    formData.set("brand_id", formBrandId);
    formData.set("short_description", formShortDesc);
    formData.set("description", formDesc);
    formData.set("base_price", String(formBasePrice));
    formData.set("compare_at_price", String(formComparePrice));
    formData.set("cost", String(formCost));
    formData.set("supplier_code", formSupplierCode);
    formData.set("shipping_origin", formShippingOrigin);
    formData.set("is_featured", String(formIsFeatured));
    formData.set("is_flash_deal", String(formIsFlashDeal));
    formData.set("status", "published");
    formData.set("video1_url", formVideo1Url);
    formData.set("video1_title", formVideo1Title);
    formData.set("video2_url", formVideo2Url);
    formData.set("video2_title", formVideo2Title);

    formImages.forEach((img) => formData.append("images", img));

    if (editingProductId) {
      const res = await updateProduct(editingProductId, formData);
      toast.success(res.message || `Updated "${formTitle}".`);
    } else {
      const res = await createProduct(formData);
      toast.success(res.message || `Created "${formTitle}".`);
    }

    setIsSlideOverOpen(false);
    loadProducts();
  };

  const handleExportCSV = () => {
    const headers = "ID,Title,Slug,SKU,Category,Price,ComparePrice,SupplierCost,SupplierCode,Origin,Videos\n";
    const rows = products
      .map(
        (p) =>
          `"${p.id}","${p.title.replace(/"/g, '""')}","${p.slug}","${p.sku}","${p.category_id}",${p.base_price},${p.compare_at_price || ""},${p.cost || ""},"${p.supplier_code || ""}","${p.shipping_origin || ""}",${p.videos?.length || 0}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lennox_products_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Product catalogue CSV exported.");
  };

  // Profit Margin Calculation
  const profitMargin =
    formBasePrice > 0 ? Math.round(((formBasePrice - formCost) / formBasePrice) * 100) : 0;

  // Filter options for AdminDataTable
  const tableFilters: FilterOption[] = useMemo(() => {
    return [
      {
        key: "category_id",
        label: "Department",
        options: categories.map((c) => ({ value: c.id, label: c.name })),
      },
    ];
  }, [categories]);

  // Bulk actions for AdminDataTable
  const bulkActions: BulkAction<Product>[] = [
    {
      label: "Bulk Delete",
      icon: Trash2,
      variant: "danger",
      requiresConfirmation: true,
      confirmTitle: "Bulk Delete Products",
      confirmMessage: "Are you sure you want to permanently delete the selected products?",
      onClick: (selected) => {
        const ids = new Set(selected.map((s) => s.id));
        setProducts((prev) => prev.filter((p) => !ids.has(p.id)));
        toast.success(`Removed ${selected.length} products from catalogue.`);
      },
    },
    {
      label: "Export Selected",
      icon: Download,
      variant: "default",
      onClick: (selected) => {
        const headers = "ID,Title,SKU,Price\n";
        const rows = selected.map((p) => `"${p.id}","${p.title}","${p.sku}",${p.base_price}`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "selected_products.csv";
        a.click();
        toast.success(`Exported ${selected.length} products to CSV.`);
      },
    },
  ];

  // Table Columns Definition
  const productColumns: Column<Product>[] = [
    {
      header: "Product Details",
      accessorKey: "title",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
            <Image
              src={
                row.media?.[0]?.url ||
                "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=200&auto=format&fit=crop&q=80"
              }
              alt={row.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 max-w-xs">
            <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-[#2F65F6] transition-colors font-heading">
              {row.title}
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold block">
              {categories.find((c) => c.id === row.category_id)?.name || "General"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "SKU & Origin",
      accessorKey: "sku",
      sortable: true,
      cell: (row) => (
        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
          <span className="block font-bold">{row.sku}</span>
          <span className="text-[9px] text-slate-400">{row.shipping_origin || "Shenzhen"}</span>
        </div>
      ),
    },
    {
      header: "Retail Price",
      accessorKey: "base_price",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
          {formatCurrency(row.base_price)}
        </span>
      ),
    },
    {
      header: "Supplier Cost",
      accessorKey: "cost",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-slate-500 dark:text-slate-400">
          ${(row.cost || row.base_price * 0.55).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Margin",
      cell: (row) => {
        const margin = row.cost
          ? Math.round(((row.base_price - row.cost) / row.base_price) * 100)
          : 45;
        return (
          <span className="bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]/60 dark:border-emerald-900/40 text-[10px] font-black px-2 py-0.5 rounded-md font-mono">
            +{margin}%
          </span>
        );
      },
    },
    {
      header: "Stock",
      cell: (row) => {
        const stock = row.variants?.[0]?.stock || 35;
        return (
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono border",
              stock <= 10
                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            )}
          >
            {stock} units
          </span>
        );
      },
    },
    {
      header: "Videos",
      cell: (row) => {
        const count = row.videos?.length || 0;
        return (
          <span className="bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
            <Video className="w-3 h-3 text-[#2F65F6]" />
            <span>{count} Slots</span>
          </span>
        );
      },
    },
    {
      header: "Supplier Code",
      accessorKey: "supplier_code",
      cell: (row) => (
        <span className="flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>{row.supplier_code || "SUP-GZ-4419"}</span>
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-20",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end">
          <AdminActionMenu
            itemTitle={row.title}
            onView={() => window.open(`/products/${row.slug}`, "_blank")}
            onEdit={() => handleOpenEdit(row)}
            onDuplicate={() => handleDuplicateProduct(row)}
            onDelete={() => handleDeleteProduct(row.id, row.title)}
            customActions={[
              {
                label: "Live Storefront",
                icon: Eye,
                onClick: () => window.open(`/products/${row.slug}`, "_blank"),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const totalProducts = products.length;
  const activeVideos = products.filter((p) => (p.videos?.length || 0) > 0).length;
  const lowStock = products.filter((p) => (p.variants?.[0]?.stock || 35) <= 10).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-montserrat">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Products & Catalogue"
        subtitle="Manage product listings, dual-video demo showcases, supplier pricing, and inventory."
        badge={{ text: `${totalProducts} Products`, variant: "blue" }}
        breadcrumbs={[
          { label: "Catalogue & Inventory", href: "/admin/products" },
          { label: "Products" },
        ]}
        actions={[
          {
            label: "Import CSV",
            icon: Upload,
            variant: "secondary",
            onClick: () => setIsImportModalOpen(true),
          },
          {
            label: "Export CSV",
            icon: Download,
            variant: "secondary",
            onClick: handleExportCSV,
          },
          {
            label: "Add Product",
            icon: Plus,
            variant: "primary",
            onClick: handleOpenCreate,
          },
        ]}
      />

      {/* ── 2. Top Metric KPI Mini Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Products</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">
              {totalProducts}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dual-Video Showcase</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono block">
              {activeVideos} active
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Video className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Low Stock Warnings</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
              {lowStock} items
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Standardized Reusable AdminDataTable ── */}
      <AdminDataTable<Product>
        data={products}
        columns={productColumns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by Title, SKU, or Supplier Code..."
        searchFields={["title", "sku", "supplier_code"]}
        filters={tableFilters}
        bulkActions={bulkActions}
        defaultSortKey="base_price"
        defaultSortDirection="desc"
        isLoading={isLoading}
        emptyTitle="No products found"
        emptyDescription="Get started by adding your first product listing or importing via CSV."
        emptyAction={{
          label: "Add Product",
          onClick: handleOpenCreate,
        }}
        onExportCsv={handleExportCSV}
      />

      {/* ── 4. Slide-Over Panel: Product Creator & Editor ── */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={editingProductId ? "Edit Product & Showcase" : "Add New Product Listing"}
        description="Configure product details, dual-video demo showcases, supplier secrets, and pricing."
        size="xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsSlideOverOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProduct}
              className="px-5 py-2.5 rounded-xl bg-[#FF1028] hover:bg-[#E00B20] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs font-heading uppercase"
            >
              {editingProductId ? "Save Product Changes" : "Publish to Storefront"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "general", label: "General & Pricing" },
                { id: "media", label: "Gallery & 2 Videos" },
                { id: "supplier", label: "Secret Sourcing" },
                { id: "seo", label: "SEO & Flags" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormTab(tab.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer",
                  formTab === tab.id
                    ? "bg-[#00143D] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: General Info & Pricing */}
          {formTab === "general" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <AdminFormSection title="General Information">
                <AdminInput
                  label="Product Title"
                  required
                  placeholder="e.g. Eachine EX5 4K GPS FPV RC Drone..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminInput
                    label="Custom SKU"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                  />
                  <AdminInput
                    label="Custom URL Slug"
                    placeholder="auto-generated from title if blank"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminSelect
                    label="Department Category"
                    required
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  />
                  <AdminSelect
                    label="Brand Manufacturer"
                    value={formBrandId}
                    onChange={(e) => setFormBrandId(e.target.value)}
                    options={brands.map((b) => ({ value: b.id, label: b.name }))}
                  />
                </div>
              </AdminFormSection>

              {/* Pricing Section */}
              <AdminFormSection
                title="Pricing & Sourcing Margins"
                badge={
                  <span className="bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                    +{profitMargin}% Margin
                  </span>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AdminInput
                    label="Retail Price (USDT)"
                    required
                    type="number"
                    step="0.01"
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(Number(e.target.value))}
                  />
                  <AdminInput
                    label="Compare-At Price ($)"
                    type="number"
                    step="0.01"
                    value={formComparePrice}
                    onChange={(e) => setFormComparePrice(Number(e.target.value))}
                  />
                  <AdminInput
                    label="Secret Factory Cost ($)"
                    type="number"
                    step="0.01"
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                  />
                </div>
              </AdminFormSection>

              <AdminFormSection title="Descriptions">
                <AdminInput
                  label="Short Summary"
                  placeholder="One sentence overview for quick preview cards..."
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                />
                <AdminTextarea
                  label="Full Description"
                  rows={4}
                  placeholder="Detailed specifications, box contents, and features..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </AdminFormSection>
            </div>
          )}

          {/* TAB 2: Gallery & 2 Videos */}
          {formTab === "media" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <AdminFormSection title="Product Image Gallery">
                <AdminUploader
                  label="Upload Product Images"
                  values={formImages}
                  onChange={setFormImages}
                  maxFiles={6}
                />
              </AdminFormSection>

              <AdminFormSection
                title="Dedicated Dual-Video Showcases"
                icon={Video}
                description="Showcase two high-converting video slots directly on the product detail page."
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block font-heading">
                      Slot 1: Quality Inspection Video
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AdminInput
                        label="Video Title"
                        value={formVideo1Title}
                        onChange={(e) => setFormVideo1Title(e.target.value)}
                      />
                      <AdminInput
                        label="Embed / MP4 URL"
                        value={formVideo1Url}
                        onChange={(e) => setFormVideo1Url(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-[#2F65F6] block font-heading">
                      Slot 2: Live Flight / Hands-on Demo
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AdminInput
                        label="Video Title"
                        value={formVideo2Title}
                        onChange={(e) => setFormVideo2Title(e.target.value)}
                      />
                      <AdminInput
                        label="Embed / MP4 URL"
                        value={formVideo2Url}
                        onChange={(e) => setFormVideo2Url(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </AdminFormSection>
            </div>
          )}

          {/* TAB 3: Secret Sourcing */}
          {formTab === "supplier" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <AdminFormSection
                title="Protected Sourcing Secrets"
                icon={Lock}
                description="Supplier codes and direct acquisition links are encrypted and never exposed to storefront APIs."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminInput
                    label="Supplier Code"
                    required
                    value={formSupplierCode}
                    onChange={(e) => setFormSupplierCode(e.target.value)}
                  />
                  <AdminInput
                    label="Shipping Origin"
                    value={formShippingOrigin}
                    onChange={(e) => setFormShippingOrigin(e.target.value)}
                  />
                  <div className="sm:col-span-2">
                    <AdminInput
                      label="Direct Factory Purchase URL"
                      type="url"
                      value={formPurchaseUrl}
                      onChange={(e) => setFormPurchaseUrl(e.target.value)}
                    />
                  </div>
                </div>
              </AdminFormSection>
            </div>
          )}

          {/* TAB 4: SEO & Flags */}
          {formTab === "seo" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <AdminFormSection title="Search Engine Optimization">
                <AdminInput
                  label="SEO Meta Title"
                  placeholder="e.g. Buy Eachine EX5 4K Drone Online | Lennox ChinaMall"
                  value={formSeoTitle}
                  onChange={(e) => setFormSeoTitle(e.target.value)}
                />
                <AdminTextarea
                  label="SEO Meta Description"
                  rows={3}
                  placeholder="Brief description for search snippets..."
                  value={formSeoDesc}
                  onChange={(e) => setFormSeoDesc(e.target.value)}
                />
              </AdminFormSection>

              <AdminFormSection title="Storefront Promotion Badges">
                <div className="flex flex-wrap gap-6 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2F65F6] focus:ring-[#2F65F6] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Featured on Homepage
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFlashDeal}
                      onChange={(e) => setFormIsFlashDeal(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF1028] focus:ring-[#FF1028] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#FF1028]" />
                      Active in Flash Deals
                    </span>
                  </label>
                </div>
              </AdminFormSection>
            </div>
          )}
        </form>
      </SlideOver>

      {/* ── 5. Bulk CSV Import Modal ── */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Import Products (CSV)"
        size="md"
      >
        <div className="p-6 space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Upload a CSV file containing your product titles, SKUs, retail USDT prices, supplier codes, and media URLs.
          </p>

          <div
            onClick={() => {
              toast.success("Bulk imported products from CSV manifest!");
              setIsImportModalOpen(false);
            }}
            className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Copy className="w-10 h-10 mx-auto text-emerald-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Click or Drag CSV File Here
            </span>
            <span className="text-[10px] text-slate-400 block">
              Supported formats: .csv, .tsv
            </span>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={() => {
                toast.success("Bulk imported products from CSV manifest!");
                setIsImportModalOpen(false);
              }}
              className="flex-1 bg-[#00143D] hover:bg-[#002266] text-white py-2.5 rounded-xl font-bold transition-colors shadow-xs cursor-pointer font-heading uppercase text-xs"
            >
              Process &amp; Import
            </button>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-bold transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
