import React from "react";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { getAdminProducts } from "@/app/actions/admin-products";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const { categories, brands } = await getAdminProducts();

  return (
    <div className="w-full">
      <ProductEditor
        mode="create"
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
