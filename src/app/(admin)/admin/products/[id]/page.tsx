import React from "react";
import Link from "next/link";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { getAdminProductById } from "@/app/actions/admin-products";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const { id } = await params;
  const { product, categories, brands, success } = await getAdminProductById(id);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            Product Listing Not Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The requested product with ID &quot;{id}&quot; does not exist or has been deleted from the catalogue.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00143D] hover:bg-[#002266] transition-colors shadow-xs font-heading uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ProductEditor
        mode="edit"
        initialProduct={product}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
