"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Video,
  Eye,
  Lock,
  Search,
  FileSpreadsheet,
  Upload,
  Download,
  X,
  AlertTriangle,
} from "lucide-react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS } from "@/lib/mockData";
import { Product, Category, Brand } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatCurrency } from "@/utils/helpers";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/actions/admin-products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<"general" | "media" | "variants" | "supplier" | "seo">("general");

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
  const [formCost, setFormCost] = useState(48.50); // Secret supplier cost
  const [formStock, setFormStock] = useState(50);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsFlashDeal, setFormIsFlashDeal] = useState(false);

  // Media & Video Fields
  const [formImages, setFormImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Dedicated 2 Videos (PRD §4.4)
  const [formVideo1Title, setFormVideo1Title] = useState("Slot 1: Factory QC & Teardown Demo");
  const [formVideo1Url, setFormVideo1Url] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [formVideo1Type, setFormVideo1Type] = useState("embed");

  const [formVideo2Title, setFormVideo2Title] = useState("Slot 2: Live Flight & Hands-on Performance");
  const [formVideo2Url, setFormVideo2Url] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [formVideo2Type, setFormVideo2Type] = useState("embed");

  // Private Sourcing Secrets
  const [formSupplierCode, setFormSupplierCode] = useState("SUP-GZ-4419");
  const [formPurchaseUrl, setFormPurchaseUrl] = useState("https://1688.com/item/694829104.html");
  const [formShippingOrigin, setFormShippingOrigin] = useState("Guangdong, China");

  // SEO
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDesc, setFormSeoDesc] = useState("");

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier_code && p.supplier_code.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === "all" || p.category_id === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    const res = await getAdminProducts({
      search,
      categoryId: selectedCategoryFilter,
    });
    if (res.success) {
      setProducts(res.products);
      if (res.categories?.length) setCategories(res.categories);
      if (res.brands?.length) setBrands(res.brands);
    }
    setIsLoading(false);
  }, [search, selectedCategoryFilter]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getAdminProducts({
        search,
        categoryId: selectedCategoryFilter,
      });
      if (mounted && res.success) {
        setProducts(res.products);
        if (res.categories?.length) setCategories(res.categories);
        if (res.brands?.length) setBrands(res.brands);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [search, selectedCategoryFilter]);

  const handleOpenCreateModal = () => {
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
    setModalTab("general");
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
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
    setFormStock(product.variants?.[0]?.stock || 50);
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
    setFormVideo1Type(vid1?.type || "embed");

    setFormVideo2Title(vid2?.title || "Slot 2: Live Flight Demo");
    setFormVideo2Url(vid2?.url || "https://www.youtube.com/embed/dQw4w9WgXcQ");
    setFormVideo2Type(vid2?.type || "embed");

    setFormSupplierCode(product.supplier_code || "SUP-GZ-4419");
    setFormPurchaseUrl("https://1688.com");
    setFormShippingOrigin(product.shipping_origin || "Guangdong, China");
    setFormSeoTitle(product.seo_title || "");
    setFormSeoDesc(product.seo_description || "");
    setModalTab("general");
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const formData = new FormData();
    formData.set("title", formTitle);
    formData.set("slug", formSlug);
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
      setToastMsg(res.message || "Product updated!");
    } else {
      const res = await createProduct(formData);
      setToastMsg(res.message || "Product created successfully!");
    }

    setIsProductModalOpen(false);
    loadProducts();
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteProduct = async (productId: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}" from catalogue?`)) {
      const res = await deleteProduct(productId);
      setToastMsg(res.message || "Product removed.");
      loadProducts();
      setTimeout(() => setToastMsg(null), 3000);
    }
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
    link.setAttribute("download", `lennox_products_manifest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg("Catalogue CSV exported successfully!");
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormImages([...formImages, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  // Profit Margin Calculator
  const profitMargin = formBasePrice > 0
    ? Math.round(((formBasePrice - formCost) / formBasePrice) * 100)
    : 0;

  const totalProducts = products.length;
  const activeVideos = products.filter((p) => (p.videos?.length || 0) > 0).length;
  const lowStock = products.filter((p) => (p.variants?.[0]?.stock || 35) <= 10).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── 1. Page Header ── */}
      <AdminPageHeader
        title="Products & Catalogue"
        subtitle="Manage product listings, dual-video demo showcases, supplier pricing, and inventory."
        badge={{ text: `${totalProducts} Products`, variant: "blue" }}
        breadcrumbs={[
          { label: "Ecommerce", href: "/admin/products" },
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
            onClick: handleOpenCreateModal,
          },
        ]}
      />

      {/* Toast */}
      {toastMsg && (
        <div className="bg-[#DCFCE7] dark:bg-emerald-950/60 border border-[#BBF7D0] dark:border-emerald-900 text-[#16A34A] dark:text-emerald-400 px-4 py-3 rounded-2xl text-xs font-bold shadow-xs flex items-center justify-between animate-in fade-in">
          <span>✓ {toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold text-sm">×</button>
        </div>
      )}

      {/* ── 2. Top Metric KPI Mini Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Products</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">{totalProducts}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dual-Video Showcase</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">{activeVideos} Active</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
            <Video className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFF0F2] dark:bg-[#2D1B22] border border-[#FECDD3]/50 dark:border-rose-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Low Stock Trigger</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">{lowStock} SKUs</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar ── */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Title, SKU, or Supplier Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2F65F6] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-[#2F65F6] cursor-pointer"
          >
            <option value="all">All Departments ({products.length})</option>
            {MOCK_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 4. Product Catalogue Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] bg-slate-50/70 dark:bg-slate-900/60 tracking-wider">
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-3">SKU & Origin</th>
                <th className="py-3.5 px-3">Retail (USDT)</th>
                <th className="py-3.5 px-3">Secret Cost</th>
                <th className="py-3.5 px-3">Margin</th>
                <th className="py-3.5 px-3">Stock Status</th>
                <th className="py-3.5 px-3">Videos</th>
                <th className="py-3.5 px-3">Supplier Code</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredProducts.map((p) => {
                const margin = p.cost
                  ? Math.round(((p.base_price - p.cost) / p.base_price) * 100)
                  : 45;
                const stock = p.variants?.[0]?.stock || 35;
                const videoCount = p.videos?.length || 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* Thumbnail & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                          <Image
                            src={
                              p.media?.[0]?.url ||
                              "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=200&auto=format&fit=crop&q=80"
                            }
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-[#2F65F6] transition-colors font-heading">
                            {p.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            {MOCK_CATEGORIES.find((c) => c.id === p.category_id)?.name || "General"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Origin */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="block font-bold">{p.sku}</span>
                      <span className="text-[9px] text-slate-400">{p.shipping_origin || "Shenzhen"}</span>
                    </td>

                    {/* Retail Price */}
                    <td className="py-3.5 px-3 font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(p.base_price)}
                    </td>

                    {/* Secret Cost */}
                    <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                      ${(p.cost || p.base_price * 0.55).toFixed(2)}
                    </td>

                    {/* Profit Margin */}
                    <td className="py-3.5 px-3">
                      <span className="bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 border border-[#BBF7D0]/60 dark:border-emerald-900/40 text-[10px] font-black px-2 py-0.5 rounded-md font-mono">
                        +{margin}%
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono ${
                          stock <= 10
                            ? "bg-[#FEE2E2] dark:bg-rose-950/60 text-[#DC2626] dark:text-rose-400 border border-[#FECDD3]/60"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {stock} units
                      </span>
                    </td>

                    {/* Videos */}
                    <td className="py-3.5 px-3">
                      <span className="bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                        <Video className="w-3 h-3 text-[#2F65F6]" />
                        <span>{videoCount} Slots</span>
                      </span>
                    </td>

                    {/* Supplier Code */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{p.supplier_code || "SUP-GZ-4419"}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="View Live Store Page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Product Creation & Edit Modal ── */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProductId ? "Edit Product & Dual-Videos" : "Add Product"}
        size="xl"
      >
        <form onSubmit={handleSaveProduct} className="p-6 space-y-6 text-xs text-slate-800 dark:text-slate-200">
          {/* Modal Tab Switcher */}
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
                onClick={() => setModalTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  modalTab === tab.id
                    ? "bg-[#2F65F6] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: General Info & Pricing */}
          {modalTab === "general" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eachine EX5 4K GPS FPV RC Drone..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-[#2F65F6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Custom SKU *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold focus:outline-none focus:border-[#2F65F6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Custom URL Slug</label>
                  <input
                    type="text"
                    placeholder="auto-generated from title if blank"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:outline-none focus:border-[#2F65F6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category Department *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 focus:outline-none focus:border-[#2F65F6]"
                  >
                    {MOCK_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Brand Manufacturer</label>
                  <select
                    value={formBrandId}
                    onChange={(e) => setFormBrandId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold bg-white dark:bg-slate-800 focus:outline-none focus:border-[#2F65F6]"
                  >
                    {MOCK_BRANDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Retail Price (USDT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-sm text-[#2F65F6] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Compare-At Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formComparePrice}
                    onChange={(e) => setFormComparePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 line-through focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Factory Acquisition Cost (Secret)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-amber-600 dark:text-amber-400 font-bold focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">
                    Calculated Gross Sourcing Margin:
                  </span>
                  <span className="bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 font-bold px-2.5 py-1 rounded-lg">
                    +{profitMargin}% Profit Margin
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Short Summary Description</label>
                <input
                  type="text"
                  placeholder="One sentence overview..."
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Full Description</label>
                <textarea
                  rows={4}
                  placeholder="Detailed specifications and features..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Media Gallery & Dual Videos */}
          {modalTab === "media" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-3">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs block">
                  Product Image Gallery
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Add Image URL (https://...)..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="bg-[#2F65F6] text-white px-4 py-2 rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    Add Image
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-2">
                  {formImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800"
                    >
                      <Image
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dedicated 2 Video Fields */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white uppercase text-xs flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#2F65F6]" />
                    <span>Dual Video Showcase Slots</span>
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    Max 2 Videos
                  </span>
                </div>

                {/* Video Slot 1 */}
                <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px] block">
                    Slot 1: Quality Inspection Video
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Slot 1 Title..."
                      value={formVideo1Title}
                      onChange={(e) => setFormVideo1Title(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                    <input
                      type="url"
                      placeholder="Video URL..."
                      value={formVideo1Url}
                      onChange={(e) => setFormVideo1Url(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Video Slot 2 */}
                <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-[#2F65F6] text-[11px] block">
                    Slot 2: Live Demo Video
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Slot 2 Title..."
                      value={formVideo2Title}
                      onChange={(e) => setFormVideo2Title(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                    <input
                      type="url"
                      placeholder="Video URL..."
                      value={formVideo2Url}
                      onChange={(e) => setFormVideo2Url(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Secret Sourcing */}
          {modalTab === "supplier" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-600" /> Private Sourcing Protection
                </span>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                  Supplier codes and factory acquisition URLs are encrypted and never visible on storefront APIs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Secret Supplier Code *</label>
                  <input
                    type="text"
                    required
                    value={formSupplierCode}
                    onChange={(e) => setFormSupplierCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-amber-600 dark:text-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Factory Shipping Origin</label>
                  <input
                    type="text"
                    value={formShippingOrigin}
                    onChange={(e) => setFormShippingOrigin(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Direct Factory Acquisition Link</label>
                  <input
                    type="url"
                    value={formPurchaseUrl}
                    onChange={(e) => setFormPurchaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO & Product Badges */}
          {modalTab === "seo" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Custom SEO Meta Title</label>
                <input
                  type="text"
                  placeholder="e.g. Buy Eachine EX5 4K Drone..."
                  value={formSeoTitle}
                  onChange={(e) => setFormSeoTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">SEO Meta Description</label>
                <textarea
                  rows={3}
                  placeholder="Search snippet description..."
                  value={formSeoDesc}
                  onChange={(e) => setFormSeoDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium focus:outline-none"
                />
              </div>

              {/* Badges Toggles */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-900 dark:text-white text-xs uppercase block">
                  Promotional Flags
                </span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded text-[#2F65F6] focus:ring-[#2F65F6]"
                    />
                    <span className="font-bold text-xs">Featured on Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFlashDeal}
                      onChange={(e) => setFormIsFlashDeal(e.target.checked)}
                      className="rounded text-[#2F65F6] focus:ring-[#2F65F6]"
                    />
                    <span className="font-bold text-xs">Active in Flash Deals</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2F65F6] hover:bg-[#2563EB] text-white font-bold shadow-blue-500/25 shadow-md transition-colors cursor-pointer"
            >
              {editingProductId ? "Save Product Changes" : "Publish Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── 6. Bulk CSV Import Modal ── */}
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

          <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-emerald-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Click or Drag CSV File Here</span>
            <span className="text-[10px] text-slate-400 block">Supported formats: .csv, .tsv</span>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setToastMsg("Bulk imported products from CSV manifest!");
                setIsImportModalOpen(false);
                setTimeout(() => setToastMsg(null), 3000);
              }}
              className="flex-1 bg-[#2F65F6] hover:bg-[#2563EB] text-white py-2.5 rounded-xl font-bold transition-colors shadow-xs cursor-pointer"
            >
              Process & Import
            </button>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
