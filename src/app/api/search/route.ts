import { NextResponse } from "next/server";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  if (!q || q.length < 2) {
    return NextResponse.json({
      products: [],
      categories: [],
      suggestions: [],
    });
  }

  // 1. Match products
  const matchedProducts = MOCK_PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  ).slice(0, 6);

  // 2. Match categories
  const matchedCategories = MOCK_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(q)
  ).slice(0, 3);

  // 3. Suggested search terms
  const suggestions = [
    "4K Camera Drone",
    "Creality 3D Printer",
    "120W Bluetooth Speaker",
    "OBD2 Scanner",
    "Tactical Flashlight",
  ].filter((term) => term.toLowerCase().includes(q));

  return NextResponse.json({
    products: matchedProducts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.base_price,
      image: p.media?.[0]?.url,
      sku: p.sku,
    })),
    categories: matchedCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: c.product_count,
    })),
    suggestions,
  });
}
