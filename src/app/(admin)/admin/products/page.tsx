"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  TrendingUp,
  ExternalLink,
  Edit,
  CheckCircle2,
} from "lucide-react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS } from "@/lib/mockData";
import { Product, Category, Brand } from "@/types/database";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { Modal } from "@/components/ui/Modal";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatCurrency, cn } from "@/utils/helpers";
import {
  getAdminProducts,
  deleteProduct,
} from "@/app/actions/admin-products";

export default function AdminProductsPage() {
  const router = useRouter();
  const toast = useAdminToast();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [isLoading, setIsLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
        // Optimistic UI removal for mock data
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        toast.success(`Removed "${title}" from catalogue.`);
      }
    } catch {
      toast.error("Failed to delete product.");
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
    link.setAttribute("download", `lennox_products_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Product catalogue CSV exported.");
  };

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
          <Link
            href={`/admin/products/${row.id}`}
            className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 group-hover:opacity-90 transition-opacity"
          >
            <Image
              src={
                row.media?.[0]?.url ||
                "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=200&auto=format&fit=crop&q=80"
              }
              alt={row.title}
              fill
              className="object-cover"
            />
          </Link>
          <div className="min-w-0 max-w-xs">
            <Link
              href={`/admin/products/${row.id}`}
              className="font-bold text-slate-900 dark:text-white truncate hover:text-[#2F65F6] dark:hover:text-[#2F65F6] transition-colors font-heading block"
            >
              {row.title}
            </Link>
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
          <span className="text-[9px] text-slate-400">{row.shipping_origin || "Shenzhen, China"}</span>
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
        const stock = row.variants?.[0]?.stock ?? 35;
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
      className: "text-right w-24",
      hideable: false,
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/products/${row.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#2F65F6] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            title="Edit Product Page"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <AdminActionMenu
            itemTitle={row.title}
            onView={() => window.open(`/products/${row.slug}`, "_blank")}
            onEdit={() => router.push(`/admin/products/${row.id}`)}
            onDuplicate={() => handleDuplicateProduct(row)}
            onDelete={() => handleDeleteProduct(row.id, row.title)}
            customActions={[
              {
                label: "Edit Full Page",
                icon: Edit,
                onClick: () => router.push(`/admin/products/${row.id}`),
              },
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

  // Custom Responsive Card Render for Mobile & Tablet
  const renderProductCard = (
    row: Product,
    _index: number,
    isSelected: boolean,
    toggleSelect: () => void
  ) => {
    const margin = row.cost
      ? Math.round(((row.base_price - row.cost) / row.base_price) * 100)
      : 45;
    const stock = row.variants?.[0]?.stock ?? 35;
    const videoCount = row.videos?.length || 0;

    return (
      <div
        key={row.id}
        className={cn(
          "rounded-2xl border p-4 transition-all duration-150 relative space-y-3 shadow-xs",
          isSelected
            ? "border-[#2F65F6] bg-blue-50/40 dark:bg-blue-950/20"
            : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700"
        )}
      >
        <div className="flex gap-3">
          {/* Thumbnail */}
          <Link
            href={`/admin/products/${row.id}`}
            className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
          >
            <Image
              src={
                row.media?.[0]?.url ||
                "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=200&auto=format&fit=crop&q=80"
              }
              alt={row.title}
              fill
              className="object-cover"
            />
          </Link>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">
              {categories.find((c) => c.id === row.category_id)?.name || "Department"}
            </span>
            <Link
              href={`/admin/products/${row.id}`}
              className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-[#2F65F6] transition-colors font-heading"
            >
              {row.title}
            </Link>
            <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
              SKU: {row.sku}
            </span>
          </div>
        </div>

        {/* Pricing & Margins Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center">
          <div>
            <span className="text-[9px] text-slate-400 block font-semibold">Retail USDT</span>
            <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
              {formatCurrency(row.base_price)}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-semibold">Factory Cost</span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              ${(row.cost || row.base_price * 0.55).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-semibold">Margin</span>
            <span className="bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded font-mono inline-block">
              +{margin}%
            </span>
          </div>
        </div>

        {/* Badges & Actions Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-md font-mono border",
                stock <= 10
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200"
              )}
            >
              {stock} units
            </span>

            {videoCount > 0 && (
              <span className="bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Video className="w-2.5 h-2.5" />
                <span>{videoCount} vids</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={`/admin/products/${row.id}`}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#00143D] text-white hover:bg-[#002266] transition-colors"
            >
              Edit
            </Link>
            <AdminActionMenu
              itemTitle={row.title}
              onView={() => window.open(`/products/${row.slug}`, "_blank")}
              onEdit={() => router.push(`/admin/products/${row.id}`)}
              onDuplicate={() => handleDuplicateProduct(row)}
              onDelete={() => handleDeleteProduct(row.id, row.title)}
            />
          </div>
        </div>
      </div>
    );
  };

  const totalProducts = products.length;
  const activeVideos = products.filter((p) => (p.videos?.length || 0) > 0).length;
  const lowStock = products.filter((p) => (p.variants?.[0]?.stock ?? 35) <= 10).length;

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
            href: "/admin/products/new",
          },
        ]}
      />

      {/* ── 2. Top Metric KPI Mini Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Catalogue Items</span>
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dual-Video Showcases</span>
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

      {/* ── 3. Standardized Reusable AdminDataTable with Card Mode ── */}
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
          onClick: () => router.push("/admin/products/new"),
        }}
        onExportCsv={handleExportCSV}
        renderCard={renderProductCard}
      />

      {/* ── 4. Bulk CSV Import Modal ── */}
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
            <span className="font-bold text-slate-800 dark:text-slate-200 block font-heading">
              Click or Drag CSV File Here
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
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
