"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  RotateCcw,
  Plane,
  Coins,
  Package,
  Layers,
  Flame,
  Award,
  AlertCircle,
} from "lucide-react";
import { Product, Category } from "@/types/database";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatCurrency } from "@/utils/helpers";
import { getFilteredProducts, FilteredProductsResult } from "@/app/actions/store-products";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface CategoryPageClientProps {
  slug: string;
  category?: Category | null;
}

export function CategoryPageClient({ slug, category }: CategoryPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isFlashDealsPage = slug === "flash-deals";
  const isNewArrivalsPage = slug === "new-arrivals";

  // URL Query Sync States
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance");
  const [minPrice, setMinPrice] = useState<number>(Number(searchParams.get("min_price")) || 0);
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get("max_price")) || 500);
  const [flashDealsOnly, setFlashDealsOnly] = useState(
    isFlashDealsPage || searchParams.get("flash") === "true"
  );
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("in_stock") === "true");
  const [hasVideoOnly, setHasVideoOnly] = useState(searchParams.get("has_video") === "true");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brands") ? searchParams.get("brands")!.split(",") : []
  );
  const [minRating, setMinRating] = useState<number>(Number(searchParams.get("rating")) || 0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  // Result state
  const [resultData, setResultData] = useState<FilteredProductsResult>({
    success: true,
    products: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    appliedFiltersCount: 0,
    facets: {
      brands: [],
      categories: [],
      priceRange: { min: 0, max: 500 },
      totalInStock: 0,
      totalFlashDeals: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with URL params
  const updateUrlParams = useCallback(
    (params: Record<string, string | number | boolean | null>) => {
      const current = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, val]) => {
        if (val === null || val === "" || val === false || val === 0 || (key === "sort" && val === "relevance")) {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });
      const query = current.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Fetch filtered products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const res = await getFilteredProducts({
      categorySlug: slug,
      brandIds: selectedBrands,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      flashDealsOnly,
      hasVideoOnly,
      sortBy: sortBy as any,
      page: currentPage,
      pageSize: 12,
    });
    if (res.success) {
      setResultData(res);
    }
    setIsLoading(false);
  }, [slug, selectedBrands, minPrice, maxPrice, minRating, inStockOnly, flashDealsOnly, hasVideoOnly, sortBy, currentPage]);

  useEffect(() => {
    startTransition(() => {
      fetchProducts();
    });
  }, [fetchProducts]);

  // Handlers
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
    updateUrlParams({ sort: newSort, page: 1 });
  };

  const toggleBrand = (brandId: string) => {
    const updated = selectedBrands.includes(brandId)
      ? selectedBrands.filter((b) => b !== brandId)
      : [...selectedBrands, brandId];
    setSelectedBrands(updated);
    setCurrentPage(1);
    updateUrlParams({ brands: updated.length ? updated.join(",") : null, page: 1 });
  };

  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    setCurrentPage(1);
    updateUrlParams({ min_price: min || null, max_price: max < 500 ? max : null, page: 1 });
  };

  const handleRatingChange = (rating: number) => {
    const newRating = minRating === rating ? 0 : rating;
    setMinRating(newRating);
    setCurrentPage(1);
    updateUrlParams({ rating: newRating || null, page: 1 });
  };

  const handleInStockToggle = () => {
    const newVal = !inStockOnly;
    setInStockOnly(newVal);
    setCurrentPage(1);
    updateUrlParams({ in_stock: newVal || null, page: 1 });
  };

  const handleFlashToggle = () => {
    const newVal = !flashDealsOnly;
    setFlashDealsOnly(newVal);
    setCurrentPage(1);
    updateUrlParams({ flash: newVal || null, page: 1 });
  };

  const handleVideoToggle = () => {
    const newVal = !hasVideoOnly;
    setHasVideoOnly(newVal);
    setCurrentPage(1);
    updateUrlParams({ has_video: newVal || null, page: 1 });
  };

  const clearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(500);
    setFlashDealsOnly(isFlashDealsPage);
    setInStockOnly(false);
    setHasVideoOnly(false);
    setSelectedBrands([]);
    setMinRating(0);
    setSortBy("relevance");
    setCurrentPage(1);
    updateUrlParams({
      min_price: null,
      max_price: null,
      flash: isFlashDealsPage ? true : null,
      in_stock: null,
      has_video: null,
      brands: null,
      rating: null,
      sort: null,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Title derivation
  const pageTitle = isFlashDealsPage
    ? "Flash Deals & Limited Drops"
    : isNewArrivalsPage
    ? "New Factory Arrivals"
    : category?.name || "Direct Factory Sourcing";

  const pageSubtitle = isFlashDealsPage
    ? "Daily limited-quantity price drops with direct Binance USDT settlement."
    : isNewArrivalsPage
    ? "Fresh hardware launches and newly verified manufacturing batches."
    : category?.description || "Browse high-precision direct factory goods with verified dual-video QC testing.";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      {/* ── 1. Page Header & Breadcrumbs ── */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Departments", href: "/categories" },
              { label: pageTitle },
            ]}
          />

          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#00143D] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Direct Factory Gate
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {resultData.totalCount} Products Found
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                {(category?.icon || category?.iconName) && (
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#FF1028] flex items-center justify-center p-1.5 border border-red-100 shrink-0 shadow-2xs overflow-hidden">
                    <CategoryIcon
                      icon={category.icon || category.iconName}
                      name={category.name}
                      className="w-5 h-5 text-[#FF1028]"
                    />
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#00143D] tracking-tight">
                  {pageTitle}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1.5 leading-relaxed">
                {pageSubtitle}
              </p>
            </div>

            {/* Quick Sourcing Hub Tag */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#00143D] text-white flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Direct Airfreight</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 100% Quality Checked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Active Filter Chips & Sorting Control Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Active Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Mobile Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-[#00143D] text-white rounded-xl text-xs font-bold font-heading uppercase tracking-wider cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters {resultData.appliedFiltersCount > 0 ? `(${resultData.appliedFiltersCount})` : ""}</span>
            </button>

            {/* Price Chip */}
            {(minPrice > 0 || maxPrice < 500) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                <span>Price: ${minPrice} – ${maxPrice}</span>
                <button
                  onClick={() => handlePriceChange(0, 500)}
                  className="p-0.5 hover:text-[#FF1028]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Brand Chips */}
            {selectedBrands.map((bId) => {
              const bName = resultData.facets.brands.find((b) => b.id === bId)?.name || bId;
              return (
                <span
                  key={bId}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  <span>{bName}</span>
                  <button onClick={() => toggleBrand(bId)} className="p-0.5 hover:text-[#FF1028]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {/* Rating Chip */}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                <span>{minRating}★ &amp; Above</span>
                <button onClick={() => handleRatingChange(0)} className="p-0.5 hover:text-[#FF1028]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Stock Chip */}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                <span>In Stock Only</span>
                <button onClick={handleInStockToggle} className="p-0.5 hover:text-emerald-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Video Chip */}
            {hasVideoOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                <span>QC Video Demo</span>
                <button onClick={handleVideoToggle} className="p-0.5 hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Clear All Button */}
            {resultData.appliedFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#FF1028] hover:underline flex items-center gap-1 ml-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear All ({resultData.appliedFiltersCount})</span>
              </button>
            )}
          </div>

          {/* Sorting & Grid/List View Toggles */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-[#FF1028]"
              >
                <option value="relevance">Relevance &amp; Match</option>
                <option value="popularity">Most Popular / Sold</option>
                <option value="newest">Newest Factory Batch</option>
                <option value="rating">Customer Rating</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount_desc">Biggest Discount (%)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-white shadow-xs text-[#00143D]" : "text-slate-500 hover:text-slate-800"
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list" ? "bg-white shadow-xs text-[#00143D]" : "text-slate-500 hover:text-slate-800"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. Main Grid Layout (Sidebar + Results) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Desktop Sidebar Filter (3 Cols) ── */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-heading font-black text-sm text-[#00143D] uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#FF1028]" />
                  <span>Filter Catalogue</span>
                </span>
                {resultData.appliedFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-[#FF1028] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-mono">
                  Price Range (USDT)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Min</span>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={minPrice}
                      onChange={(e) => handlePriceChange(Number(e.target.value), maxPrice)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Max</span>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={maxPrice}
                      onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              {resultData.facets.brands.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-mono">
                    Verified Manufacturers
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {resultData.facets.brands.map((b) => (
                      <label
                        key={b.id}
                        className="flex items-center justify-between text-xs text-slate-700 hover:text-[#00143D] cursor-pointer py-1"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(b.id)}
                            onChange={() => toggleBrand(b.id)}
                            className="rounded border-slate-300 text-[#FF1028] focus:ring-[#FF1028]"
                          />
                          <span className="font-medium">{b.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">({b.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Star Rating Filter */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-mono">
                  Minimum Rating
                </span>
                <div className="space-y-1">
                  {[4, 3, 2].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => handleRatingChange(stars)}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors ${
                        minRating === stars ? "bg-amber-50 text-amber-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < stars ? "fill-amber-400 text-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-slate-700 font-semibold ml-1">&amp; Up</span>
                      </div>
                      {minRating === stars && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles (In Stock, Flash Deals, Has Video) */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span className="font-semibold">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={handleInStockToggle}
                    className="rounded border-slate-300 text-[#10B981] focus:ring-[#10B981]"
                  />
                </label>

                {!isFlashDealsPage && (
                  <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                    <span className="font-semibold text-amber-600 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Flash Deals Only
                    </span>
                    <input
                      type="checkbox"
                      checked={flashDealsOnly}
                      onChange={handleFlashToggle}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                  </label>
                )}

                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span className="font-semibold text-blue-600 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> Dual-Video Demo
                  </span>
                  <input
                    type="checkbox"
                    checked={hasVideoOnly}
                    onChange={handleVideoToggle}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* ── Product Listing Results Grid / List (9 Cols) ── */}
          <main className="lg:col-span-9 space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : resultData.products.length === 0 ? (
              /* No Results State */
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black font-heading text-[#00143D]">
                  No Factory Products Matched Your Filters
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try expanding your price range, clearing brand selections, or searching for broader terms like &quot;drone&quot;, &quot;printer&quot;, or &quot;scanner&quot;.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#00143D] hover:bg-[#FF1028] text-white px-6 py-2.5 rounded-xl text-xs font-black font-heading transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid Mode */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {resultData.products.map((p, idx) => (
                  <ProductCard key={p.id} product={p} priority={idx < 4} />
                ))}
              </div>
            ) : (
              /* List Mode */
              <div className="space-y-4">
                {resultData.products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#00143D] transition-all flex flex-col sm:flex-row items-center gap-6"
                  >
                    <div className="w-32 h-32 relative rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <ProductCard product={p} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── 4. Pagination Controls ── */}
            {resultData.totalPages > 1 && (
              <div className="pt-8 flex items-center justify-between border-t border-slate-200">
                <span className="text-xs text-slate-500 font-mono">
                  Showing Page {resultData.currentPage} of {resultData.totalPages} ({resultData.totalCount} Products)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(resultData.currentPage - 1)}
                    disabled={resultData.currentPage <= 1}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: resultData.totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        resultData.currentPage === i + 1
                          ? "bg-[#00143D] text-white shadow-md font-black"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(resultData.currentPage + 1)}
                    disabled={resultData.currentPage >= resultData.totalPages}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── 5. Mobile Slide-Out Filter Drawer ── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-heading font-black text-sm text-[#00143D] uppercase">
                  Filters &amp; Refinements
                </span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase block font-mono">Price (USDT)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => handlePriceChange(Number(e.target.value), maxPrice)}
                    className="p-2 rounded-lg bg-slate-50 border text-xs"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
                    className="p-2 rounded-lg bg-slate-50 border text-xs"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Brands */}
              {resultData.facets.brands.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase block font-mono">Brands</span>
                  <div className="space-y-1">
                    {resultData.facets.brands.map((b) => (
                      <label key={b.id} className="flex items-center justify-between text-xs text-slate-700 py-1">
                        <span>{b.name}</span>
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b.id)}
                          onChange={() => toggleBrand(b.id)}
                          className="rounded text-[#FF1028]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#00143D] text-white font-black text-xs font-heading"
              >
                Apply ({resultData.totalCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
