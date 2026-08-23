"use client";

import React, { useState, use, useMemo } from "react";
import Link from "next/link";
import {
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Sparkles,
  Grid3X3,
  List,
  X,
  Star,
  Zap,
  ShieldCheck,
  Truck,
  Video,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_BRANDS } from "@/lib/mockData";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatCurrency } from "@/utils/helpers";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const ITEMS_PER_PAGE = 8;

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const isFlashDealsPage = slug === "flash-deals";
  const isNewArrivalsPage = slug === "new-arrivals";
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);

  // Filter States
  const [sortBy, setSortBy] = useState("relevance");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [flashDealsOnly, setFlashDealsOnly] = useState(isFlashDealsPage);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [hasVideoOnly, setHasVideoOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination on filter change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setCurrentPage(1);
  };

  const toggleBrand = (brandId: string) => {
    handleFilterChange(() => {
      setSelectedBrands((prev) =>
        prev.includes(brandId)
          ? prev.filter((id) => id !== brandId)
          : [...prev, brandId]
      );
    });
  };

  const clearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(500);
    setInStockOnly(false);
    setFlashDealsOnly(isFlashDealsPage);
    setFreeShippingOnly(false);
    setHasVideoOnly(false);
    setSelectedBrands([]);
    setMinRating(0);
    setSortBy("relevance");
    setCurrentPage(1);
  };

  // ── Compute Filtered Products ──
  const filteredProducts = useMemo(() => {
    let result = MOCK_PRODUCTS;

    // Category context
    if (isFlashDealsPage) {
      result = result.filter((p) => p.is_flash_deal);
    } else if (isNewArrivalsPage) {
      result = result.filter((p) => p.is_new_arrival);
    } else if (category) {
      result = result.filter((p) => p.category_id === category.id);
    }

    // Price bounds
    result = result.filter(
      (p) => p.base_price >= minPrice && p.base_price <= maxPrice
    );

    // Brands
    if (selectedBrands.length > 0) {
      result = result.filter(
        (p) => p.brand_id && selectedBrands.includes(p.brand_id)
      );
    }

    // Ratings
    if (minRating > 0) {
      result = result.filter((p) => p.avg_rating >= minRating);
    }

    // Perks & Status
    if (flashDealsOnly && !isFlashDealsPage) {
      result = result.filter((p) => p.is_flash_deal);
    }
    if (hasVideoOnly) {
      result = result.filter((p) => p.videos && p.videos.length > 0);
    }
    if (freeShippingOnly) {
      result = result.filter((p) => p.base_price >= 50);
    }

    // Sorting
    if (sortBy === "price_asc") {
      result = [...result].sort((a, b) => a.base_price - b.base_price);
    } else if (sortBy === "price_desc") {
      result = [...result].sort((a, b) => b.base_price - a.base_price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.avg_rating - a.avg_rating);
    } else if (sortBy === "sold") {
      result = [...result].sort((a, b) => b.sold_count - a.sold_count);
    } else if (sortBy === "newest") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return result;
  }, [
    category,
    isFlashDealsPage,
    isNewArrivalsPage,
    minPrice,
    maxPrice,
    selectedBrands,
    minRating,
    flashDealsOnly,
    hasVideoOnly,
    freeShippingOnly,
    sortBy,
  ]);

  // Active filter count
  const activeFiltersCount =
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0) +
    selectedBrands.length +
    (minRating > 0 ? 1 : 0) +
    (flashDealsOnly && !isFlashDealsPage ? 1 : 0) +
    (hasVideoOnly ? 1 : 0) +
    (freeShippingOnly ? 1 : 0);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const pageTitle = isFlashDealsPage
    ? "Flash Deals & Limited Sourcing Drops"
    : isNewArrivalsPage
    ? "New Arrivals — Fresh From China Factories"
    : category?.name || "Hardware Catalogue";

  const pageSubtitle = isFlashDealsPage
    ? "Time-limited factory drops with maximum discounts. Binance Pay USDT settlement."
    : isNewArrivalsPage
    ? "Newly inspected products with direct factory warranties."
    : category?.description ||
      "Direct-to-consumer wholesale sourcing from Shenzhen and Ningbo industrial hubs.";

  // Filter sidebar JSX reusable for desktop & mobile
  const FilterControls = () => (
    <div className="space-y-6 text-xs font-montserrat">
      {/* Price Range */}
      <div className="space-y-3 pb-4 border-b border-slate-200">
        <label className="text-xs font-black text-[#00143D] uppercase tracking-wider block">
          Price Range (USDT)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={maxPrice}
            value={minPrice}
            onChange={(e) =>
              handleFilterChange(() => setMinPrice(Number(e.target.value) || 0))
            }
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#00143D]"
            placeholder="Min $"
          />
          <span className="text-slate-400 font-bold">-</span>
          <input
            type="number"
            min={minPrice}
            max={1000}
            value={maxPrice}
            onChange={(e) =>
              handleFilterChange(() => setMaxPrice(Number(e.target.value) || 500))
            }
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#00143D]"
            placeholder="Max $"
          />
        </div>

        {/* Quick Price Preset Pills */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {[
            { label: "< $50", min: 0, max: 50 },
            { label: "$50 - $150", min: 50, max: 150 },
            { label: "$150 - $300", min: 150, max: 300 },
            { label: "> $300", min: 300, max: 1000 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                handleFilterChange(() => {
                  setMinPrice(preset.min);
                  setMaxPrice(preset.max);
                })
              }
              className={`py-1 px-2 rounded-md text-[10px] font-bold border transition-colors ${
                minPrice === preset.min && maxPrice === preset.max
                  ? "bg-[#00143D] text-white border-[#00143D]"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filters */}
      <div className="space-y-3 pb-4 border-b border-slate-200">
        <label className="text-xs font-black text-[#00143D] uppercase tracking-wider block">
          Featured Brands
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {MOCK_BRANDS.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center justify-between text-xs text-slate-700 hover:text-[#FF1028] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => toggleBrand(brand.id)}
                  className="rounded text-[#FF1028] focus:ring-[#FF1028] cursor-pointer"
                />
                <span className="font-semibold">{brand.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                {brand.product_count || 12}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Customer Rating Filter */}
      <div className="space-y-3 pb-4 border-b border-slate-200">
        <label className="text-xs font-black text-[#00143D] uppercase tracking-wider block">
          Customer Rating
        </label>
        <div className="space-y-1.5">
          {[
            { label: "4.5★ & above", rating: 4.5 },
            { label: "4.0★ & above", rating: 4.0 },
            { label: "3.5★ & above", rating: 3.5 },
          ].map((r) => (
            <button
              key={r.rating}
              type="button"
              onClick={() =>
                handleFilterChange(() =>
                  setMinRating(minRating === r.rating ? 0 : r.rating)
                )
              }
              className={`w-full flex items-center justify-between p-2 rounded-xl border transition-colors ${
                minRating === r.rating
                  ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{r.label}</span>
              </span>
              {minRating === r.rating && (
                <Check className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Availability & Direct Features */}
      <div className="space-y-3 pb-4 border-b border-slate-200">
        <label className="text-xs font-black text-[#00143D] uppercase tracking-wider block">
          Perks & Features
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={freeShippingOnly}
              onChange={(e) =>
                handleFilterChange(() => setFreeShippingOnly(e.target.checked))
              }
              className="rounded text-[#FF1028] focus:ring-[#FF1028] cursor-pointer"
            />
            <span className="font-semibold flex items-center gap-1">
              <Truck className="w-3 h-3 text-blue-600" /> Free Air Shipping ($50+)
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hasVideoOnly}
              onChange={(e) =>
                handleFilterChange(() => setHasVideoOnly(e.target.checked))
              }
              className="rounded text-[#FF1028] focus:ring-[#FF1028] cursor-pointer"
            />
            <span className="font-semibold flex items-center gap-1">
              <Video className="w-3 h-3 text-[#FF1028]" /> Demo Video Available
            </span>
          </label>

          {!isFlashDealsPage && (
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={flashDealsOnly}
                onChange={(e) =>
                  handleFilterChange(() => setFlashDealsOnly(e.target.checked))
                }
                className="rounded text-[#FF1028] focus:ring-[#FF1028] cursor-pointer"
              />
              <span className="font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-[#FF1028] text-[#FF1028]" /> Flash Deals Only
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* ── 1. Breadcrumbs ── */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Departments", href: "/categories" },
          { label: pageTitle, href: "#" },
        ]}
      />

      {/* ── 2. Category Header Banner ── */}
      <div className="bg-gradient-to-r from-[#00143D] to-[#002366] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-[#FF1028] font-black bg-white/10 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Direct Factory Department
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{pageTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {pageSubtitle}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl shrink-0 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-[#10B981] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Factory Gate Tested</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <Truck className="w-4 h-4 text-blue-400" />
            <span>7-12 Days Global Air Cargo</span>
          </div>
        </div>
      </div>

      {/* ── 3. Main Filter & Products Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filter (3 Cols) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <h3 className="text-sm font-black text-[#00143D] uppercase flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#FF1028]" />
              <span>Filter Catalogue</span>
            </h3>
            {activeFiltersCount > 0 && (
              <span className="bg-[#FF1028] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <FilterControls />
        </aside>

        {/* Product Grid & Controls (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Sorting & View Switcher Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 flex flex-wrap items-center justify-between gap-3">
            {/* Left: Mobile Filter Toggle + Results Count */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden bg-[#00143D] hover:bg-[#FF1028] text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
              </button>

              <span className="text-xs text-slate-600 font-bold">
                Showing <strong className="text-[#00143D]">{filteredProducts.length}</strong> items
              </span>
            </div>

            {/* Right: Sort Dropdown & Grid/List Switch */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="relevance">Best Match / Featured</option>
                  <option value="sold">Most Sold / Popular</option>
                  <option value="rating">Highest Customer Rating</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Releases</option>
                </select>
              </div>

              {/* Grid / List view toggle */}
              <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-[#00143D] shadow-xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-[#00143D] shadow-xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Tags Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="font-black text-slate-500 text-[11px] uppercase">Active:</span>

              {minPrice > 0 && (
                <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
                  Min: ${minPrice}
                  <button onClick={() => setMinPrice(0)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {maxPrice < 500 && (
                <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
                  Max: ${maxPrice}
                  <button onClick={() => setMaxPrice(500)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedBrands.map((brandId) => {
                const brand = MOCK_BRANDS.find((b) => b.id === brandId);
                return (
                  <span
                    key={brandId}
                    className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold"
                  >
                    {brand?.name}
                    <button onClick={() => toggleBrand(brandId)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
                  {minRating}★+
                  <button onClick={() => setMinRating(0)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-[#FF1028] hover:underline font-black ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid or Empty State */}
          {paginatedProducts.length > 0 ? (
            <div
              className={`grid gap-4 sm:gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-[#00143D]">
                No items match your filter criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range or clearing selected brand filters to see more factory products.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="bg-[#00143D] text-white px-5 py-2.5 rounded-xl text-xs font-black"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* ── 4. SEO-Friendly Pagination Controls ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-bold">
                Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
                <strong className="text-slate-900">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#00143D] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Responsive Mobile Filter Drawer ── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="relative w-80 max-w-full bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-5 z-10 font-montserrat">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="text-sm font-black text-[#00143D] uppercase flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF1028]" />
                  <span>Filter Catalogue</span>
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterControls />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-[#FF1028] hover:bg-[#E00B20] text-white py-3 rounded-xl text-xs font-black transition-colors"
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
