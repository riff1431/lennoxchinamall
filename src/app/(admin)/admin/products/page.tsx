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
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { Product, Category, Brand } from "@/types/database";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, Column, FilterOption, BulkAction } from "@/components/admin/AdminDataTable";
import { AdminActionMenu } from "@/components/admin/AdminActionMenu";
import { Modal } from "@/components/ui/Modal";
import { useAdminToast } from "@/hooks/useAdminToast";
import { formatCurrency, cn, slugify } from "@/utils/helpers";
import {
  getAdminProducts,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
} from "@/app/actions/admin-products";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";

export default function AdminProductsPage() {
  const router = useRouter();
  const toast = useAdminToast();
  const storeProducts = useProductStore((state) => state.products);
  const storeCategories = useCategoryStore((state) => state.categories);
  const addProductToStore = useProductStore((state) => state.addProduct);
  const deleteProductFromStore = useProductStore((state) => state.deleteProduct);
  const deleteProductsFromStore = useProductStore((state) => state.deleteProducts);
  const bulkUpdateStatusInStore = useProductStore((state) => state.bulkUpdateStatus);
  const duplicateProductInStore = useProductStore((state) => state.duplicateProduct);
  const resetToDefaults = useProductStore((state) => state.resetToDefaults);

  const [products, setProducts] = useState<Product[]>(storeProducts.length > 0 ? storeProducts : MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(storeCategories.length > 0 ? storeCategories : []);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Keep state in sync with store
  useEffect(() => {
    if (storeProducts) {
      setProducts(storeProducts);
    }
  }, [storeProducts]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminProducts();
      if (res.success && res.products) {
        // Merge with locally created products in store
        const currentStore = useProductStore.getState().products;
        const merged = [...currentStore];
        res.products.forEach((p) => {
          if (!merged.some((m) => m.id === p.id)) {
            merged.push(p);
          }
        });
        setProducts(merged);
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
    const duplicated = duplicateProductInStore(product.id);
    if (duplicated) {
      toast.success(`Duplicated "${product.title}" successfully.`);
    } else {
      const newCopy: Product = {
        ...product,
        id: `prod-${Date.now()}`,
        title: `${product.title} (Copy)`,
        sku: `${product.sku}-COPY`,
        slug: `${product.slug}-copy`,
      };
      addProductToStore(newCopy);
      toast.success(`Duplicated "${product.title}" successfully.`);
    }
  };

  const handleDeleteProduct = async (productId: string, title: string) => {
    // Optimistic removal
    const previousProducts = products;
    deleteProductFromStore(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    toast.success(`Removed "${title}" from catalogue.`);
    try {
      const result = await deleteProduct(productId);
      if (!result.success) {
        // Rollback on failure
        setProducts(previousProducts);
        toast.error(result.error || `Failed to delete "${title}". Change reverted.`);
      }
    } catch (err) {
      // Rollback on failure
      setProducts(previousProducts);
      toast.error(`Failed to delete "${title}". Change reverted.`);
    }
  };

  const handleBulkDelete = async (selected: Product[]) => {
    const ids = selected.map((s) => s.id);
    const idSet = new Set(ids);
    const previousProducts = products;
    deleteProductsFromStore(ids);
    setProducts((prev) => prev.filter((p) => !idSet.has(p.id)));
    toast.success(`Removed ${selected.length} product${selected.length > 1 ? "s" : ""} from catalogue.`);
    try {
      const result = await bulkDeleteProducts(ids);
      if (!result.success) {
        setProducts(previousProducts);
        toast.error(result.error || "Failed to delete products. Changes reverted.");
      }
    } catch (err) {
      setProducts(previousProducts);
      toast.error("Failed to delete products. Changes reverted.");
    }
  };

  const handleBulkPublish = async (selected: Product[]) => {
    const ids = selected.map((s) => s.id);
    bulkUpdateStatusInStore(ids, "published");
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status: "published" } : p))
    );
    toast.success(`Published ${selected.length} product${selected.length > 1 ? "s" : ""} to storefront.`);
    try {
      await bulkUpdateProductStatus(ids, "published");
    } catch (err) {
      console.error("Bulk publish error:", err);
    }
  };

  const handleBulkDraft = async (selected: Product[]) => {
    const ids = selected.map((s) => s.id);
    bulkUpdateStatusInStore(ids, "draft");
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status: "draft" } : p))
    );
    toast.success(`Set ${selected.length} product${selected.length > 1 ? "s" : ""} to Draft.`);
    try {
      await bulkUpdateProductStatus(ids, "draft");
    } catch (err) {
      console.error("Bulk draft error:", err);
    }
  };

  const handleExportCSV = (selectedItems?: Product[]) => {
    const itemsToExport = selectedItems || products;
    const headers = "ID,Title,Slug,SKU,Category,Price,ComparePrice,SupplierCost,SupplierCode,Origin,Stock,Status,Videos\n";
    const rows = itemsToExport
      .map(
        (p) =>
          `"${p.id}","${p.title.replace(/"/g, '""')}","${p.slug}","${p.sku}","${
            categories.find((c) => c.id === p.category_id)?.name || p.category_id || ""
          }",${p.base_price},${p.compare_at_price || ""},${p.cost || ""},"${p.supplier_code || ""}","${
            p.shipping_origin || ""
          }",${p.variants?.[0]?.stock ?? 35},"${p.status || "published"}",${p.videos?.length || 0}`
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
    toast.success(
      selectedItems
        ? `Exported ${selectedItems.length} selected products.`
        : "Product catalogue CSV exported."
    );
  };

  const handleDownloadSampleCSV = () => {
    const sampleHeaders = "Title,SKU,Price,ComparePrice,Cost,Category,Origin,SupplierCode,Stock,MediaURL\n";
    const sampleRows = [
      `"DJI Air 3 Fly More Combo","DJI-AIR-3",1349.00,1549.00,890.00,"RC Drones & Toys","Shenzhen, China","SUP-SZ-DJI01",25,"https://images.unsplash.com/photo-1527977966376-1c8408f9f108"`,
      `"Creality K1 Max High-Speed 3D Printer","CRE-K1-MAX",899.00,999.00,580.00,"Tools & DIY Hardware","Shenzhen, China","SUP-SZ-CRE02",15,"https://images.unsplash.com/photo-1581092160607-ee22621dd758"`,
    ].join("\n");

    const blob = new Blob([sampleHeaders + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_product_import.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessImportCSV = () => {
    if (!importFile) {
      toast.error("Please choose a CSV file to import.");
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          toast.error("CSV file contains no data rows.");
          setIsImporting(false);
          return;
        }

        // Header line parse
        const headerCols = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim().toLowerCase());
        const newProducts: Product[] = [];

        for (let i = 1; i < lines.length; i++) {
          // Simple regex-based CSV line parser handling quoted commas
          const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
          const values = matches.map((m) => m.replace(/^"|"$/g, "").trim());

          const rowData: Record<string, string> = {};
          headerCols.forEach((col, idx) => {
            rowData[col] = values[idx] || "";
          });

          const title = rowData["title"] || rowData["name"] || `Imported Item ${i}`;
          const sku = rowData["sku"] || `IMP-${Date.now().toString().slice(-4)}-${i}`;
          const basePrice = parseFloat(rowData["price"] || rowData["retail price"] || "99.00") || 99;
          const cost = parseFloat(rowData["cost"] || rowData["supplier cost"] || "") || Math.round(basePrice * 0.55);
          const compareAtPrice = parseFloat(rowData["compareprice"] || rowData["compare at price"] || "") || null;
          const origin = rowData["origin"] || rowData["shipping origin"] || "Shenzhen, China";
          const supplierCode = rowData["suppliercode"] || rowData["supplier code"] || `SUP-IMP-${i}`;
          const stock = parseInt(rowData["stock"] || rowData["quantity"] || "40", 10) || 40;
          const mediaUrl = rowData["mediaurl"] || rowData["image"] || "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=200&auto=format&fit=crop&q=80";

          // Match category if present
          const matchedCategory = categories.find(
            (c) =>
              c.name.toLowerCase() === (rowData["category"] || "").toLowerCase() ||
              c.id === rowData["category_id"]
          );

          const newProd: Product = {
            id: `prod-${Date.now()}-${i}`,
            title,
            slug: slugify(title) + `-${Date.now().toString().slice(-4)}`,
            sku,
            category_id: matchedCategory ? matchedCategory.id : (categories[0]?.id || "cat-1"),
            brand_id: brands[0]?.id || null,
            short_description: `High quality ${title} sourced directly from verified manufacturer.`,
            description: `<p>Factory direct ${title}. Verified quality inspection, guaranteed delivery, export-grade packaging.</p>`,
            base_price: basePrice,
            compare_at_price: compareAtPrice,
            cost,
            supplier_code: supplierCode,
            shipping_origin: origin,
            status: "published",
            is_featured: false,
            is_best_seller: false,
            is_new_arrival: true,
            is_flash_deal: false,
            flash_deal_ends_at: null,
            tags: ["Imported", "Catalogue"],
            weight: 1.2,
            net_weight: 1.0,
            dimensions: { length: 20, width: 15, height: 10, unit: "cm" },
            hs_code: "8543.70.9960",
            cargo_type: "general",
            package_type: "corrugated_box",
            seo_title: `${title} | Lennox ChinaMall`,
            seo_description: `Order factory-direct ${title} with secure USDT escrow and air cargo shipping.`,
            avg_rating: 4.8,
            review_count: 12,
            sold_count: 45,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            variants: [
              {
                id: `var-${Date.now()}-${i}`,
                product_id: `prod-${Date.now()}-${i}`,
                sku: `${sku}-STD`,
                title: "Standard",
                price: basePrice,
                compare_at_price: compareAtPrice,
                cost,
                stock,
                low_stock_threshold: 5,
                weight: null,
                attributes: {},
                image_url: mediaUrl,
                supplier_code: supplierCode,
                is_active: true,
                position: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
            media: [
              {
                id: `med-${Date.now()}-${i}`,
                product_id: `prod-${Date.now()}-${i}`,
                url: mediaUrl,
                alt: title,
                type: "image",
                position: 0,
                created_at: new Date().toISOString(),
              },
            ],
            videos: [],
          };

          newProducts.push(newProd);
          addProductToStore(newProd);
        }

        setProducts((prev) => [...newProducts, ...prev]);
        toast.success(`Successfully imported ${newProducts.length} products!`);
        setIsImportModalOpen(false);
        setImportFile(null);
      } catch (err) {
        console.error("CSV import error:", err);
        toast.error("Failed to parse CSV file. Please check format.");
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(importFile);
  };

  const handleRestoreDefaults = () => {
    resetToDefaults();
    setProducts(MOCK_PRODUCTS);
    toast.success("Restored 13 default catalogue products.");
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
      onClick: handleBulkDelete,
    },
    {
      label: "Set to Published",
      icon: CheckCircle2,
      variant: "success",
      requiresConfirmation: true,
      confirmTitle: "Publish Selected Products",
      confirmMessage: "Make all selected products active and visible on the storefront?",
      onClick: handleBulkPublish,
    },
    {
      label: "Set to Draft",
      icon: Eye,
      variant: "default",
      requiresConfirmation: true,
      confirmTitle: "Set Selected Products to Draft",
      confirmMessage: "Hide selected products from the public storefront?",
      onClick: handleBulkDraft,
    },
    {
      label: "Export Selected",
      icon: Download,
      variant: "default",
      onClick: (selected) => handleExportCSV(selected),
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
          ...(totalProducts < MOCK_PRODUCTS.length
            ? [
                {
                  label: "Restore Demo",
                  icon: Sparkles,
                  variant: "secondary" as const,
                  onClick: handleRestoreDefaults,
                },
              ]
            : []),
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
            onClick: () => handleExportCSV(),
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
        emptyTitle="No products in catalogue"
        emptyDescription="Get started by adding a new product listing, importing from CSV, or restoring default sample items."
        emptyAction={{
          label: totalProducts === 0 ? "Restore Sample Catalogue" : "Add Product",
          onClick: () => {
            if (totalProducts === 0) {
              handleRestoreDefaults();
            } else {
              router.push("/admin/products/new");
            }
          },
        }}
        onExportCsv={() => handleExportCSV()}
        renderCard={renderProductCard}
      />

      {/* ── 4. Bulk CSV Import Modal ── */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportFile(null);
        }}
        title="Bulk Import Products (CSV)"
        size="md"
      >
        <div className="p-6 space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Upload a CSV file containing your product titles, SKUs, retail USDT prices, supplier codes, and media URLs to instantly populate your catalogue.
          </p>

          <label
            htmlFor="product-csv-file-input"
            className={cn(
              "p-7 rounded-2xl border-2 border-dashed text-center space-y-2 cursor-pointer transition-all block",
              importFile
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <input
              id="product-csv-file-input"
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImportFile(e.target.files[0]);
                }
              }}
            />
            {importFile ? (
              <>
                <CheckCircle2 className="w-9 h-9 mx-auto text-emerald-500 animate-in zoom-in-50 duration-150" />
                <span className="font-bold text-slate-900 dark:text-white block font-heading text-sm">
                  {importFile.name}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-mono">
                  {(importFile.size / 1024).toFixed(1)} KB — Ready to parse &amp; import
                </span>
              </>
            ) : (
              <>
                <Upload className="w-9 h-9 mx-auto text-[#2F65F6]" />
                <span className="font-bold text-slate-800 dark:text-slate-200 block font-heading text-sm">
                  Click to Browse or Drag CSV File
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Supported formats: .csv (UTF-8)
                </span>
              </>
            )}
          </label>

          <div className="flex items-center justify-between py-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Need a template to get started?</span>
            <button
              type="button"
              onClick={handleDownloadSampleCSV}
              className="font-bold text-[#2F65F6] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Download Sample CSV</span>
            </button>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              disabled={!importFile || isImporting}
              onClick={handleProcessImportCSV}
              className="flex-1 bg-[#00143D] hover:bg-[#002266] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-bold transition-colors shadow-xs cursor-pointer font-heading uppercase text-xs flex items-center justify-center gap-2"
            >
              {isImporting ? "Processing..." : "Process & Import"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportFile(null);
              }}
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
