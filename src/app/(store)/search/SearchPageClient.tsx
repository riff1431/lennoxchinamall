"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
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
  RotateCcw,
  Package,
  Layers,
  Flame,
  Award,
  Sparkles,
} from "lucide-react";
import { Product } from "@/types/database";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatCurrency } from "@/utils/helpers";
import { getFilteredProducts, FilteredProductsResult } from "@/app/actions/store-products";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SearchPageClientProps {
  initialQuery?: string;
  initialCategory?: string;
}

export function SearchPageClient({
  initialQuery = "",
  initialCategory = "all",
}: SearchPageClientProps) {
  const { isSpanish } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get("q") || initialQuery;
  const categoryParam = searchParams.get("category") || initialCategory;

  // Filter States
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance");
  const [minPrice, setMinPrice] = useState<number>(Number(searchParams.get("min_price")) || 0);
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get("max_price")) || 500);
  const [flashDealsOnly, setFlashDealsOnly] = useState(searchParams.get("flash") === "true");
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
      const qStr = current.toString();
      router.replace(`${pathname}${qStr ? `?${qStr}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Fetch filtered products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const res = await getFilteredProducts({
      q: query,
      categorySlug: categoryParam !== "all" ? categoryParam : undefined,
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
  }, [query, categoryParam, selectedBrands, minPrice, maxPrice, minRating, inStockOnly, flashDealsOnly, hasVideoOnly, sortBy, currentPage]);

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
    setFlashDealsOnly(false);
    setInStockOnly(false);
    setHasVideoOnly(false);
    setSelectedBrands([]);
    setMinRating(0);
    setSortBy("relevance");
    setCurrentPage(1);
    updateUrlParams({
      min_price: null,
      max_price: null,
      flash: null,
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      {/* ── 1. Page Header ── */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: isSpanish ? "Buscar" : "Search", href: "/search" },
              { label: query ? `"${query}"` : (isSpanish ? "Todos los Productos" : "All Products") },
            ]}
          />

          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {resultData.totalCount} {isSpanish ? "Coincidencias de Fábrica Encontradas" : "Sourcing Matches Found"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#00143D] tracking-tight mt-1">
                {query ? (
                  <>
                    {isSpanish ? "Resultados de Búsqueda para " : "Search Results for "}
                    <span className="text-[#FF1028]">&quot;{query}&quot;</span>
                  </>
                ) : (
                  isSpanish ? "Explorar Catálogo de Fábrica" : "Explore Factory Catalogue"
                )}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Active Filter Chips & Sorting Control Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Active Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-[#00143D] text-white rounded-xl text-xs font-bold font-heading uppercase tracking-wider cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{isSpanish ? `Filtros ${resultData.appliedFiltersCount > 0 ? `(${resultData.appliedFiltersCount})` : ""}` : `Filters ${resultData.appliedFiltersCount > 0 ? `(${resultData.appliedFiltersCount})` : ""}`}</span>
            </button>

            {/* Price Chip */}
            {(minPrice > 0 || maxPrice < 500) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                <span>{isSpanish ? `Precio: $${minPrice} – $${maxPrice}` : `Price: $${minPrice} – $${maxPrice}`}</span>
                <button onClick={() => handlePriceChange(0, 500)} className="p-0.5 hover:text-[#FF1028]">
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
                <span>{isSpanish ? `${minRating}★ o Más` : `${minRating}★ & Above`}</span>
                <button onClick={() => handleRatingChange(0)} className="p-0.5 hover:text-[#FF1028]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* In Stock */}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                <span>{isSpanish ? "Solo en Stock" : "In Stock Only"}</span>
                <button onClick={handleInStockToggle} className="p-0.5 hover:text-emerald-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Clear All */}
            {resultData.appliedFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#FF1028] hover:underline flex items-center gap-1 ml-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isSpanish ? `Limpiar Todo (${resultData.appliedFiltersCount})` : `Clear All (${resultData.appliedFiltersCount})`}</span>
              </button>
            )}
          </div>

          {/* Sorting & Grid/List View Toggles */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold hidden sm:inline">{isSpanish ? "Ordenar:" : "Sort:"}</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-[#FF1028]"
              >
                <option value="relevance">{isSpanish ? "Relevancia y Coincidencia" : "Relevance & Match"}</option>
                <option value="popularity">{isSpanish ? "Más Populares / Vendidos" : "Most Popular / Sold"}</option>
                <option value="newest">{isSpanish ? "Lote Más Reciente" : "Newest Factory Batch"}</option>
                <option value="rating">{isSpanish ? "Mejor Valorados" : "Customer Rating"}</option>
                <option value="price_asc">{isSpanish ? "Precio: Menor a Mayor" : "Price: Low to High"}</option>
                <option value="price_desc">{isSpanish ? "Precio: Mayor a Menor" : "Price: High to Low"}</option>
                <option value="discount_desc">{isSpanish ? "Mayor Descuento (%)" : "Biggest Discount (%)"}</option>
              </select>
            </div>

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
                  <span>{isSpanish ? "Refinar Resultados" : "Refine Results"}</span>
                </span>
                {resultData.appliedFiltersCount > 0 && (
                  <button onClick={clearAllFilters} className="text-xs font-bold text-[#FF1028] hover:underline">
                    {isSpanish ? "Restablecer" : "Reset"}
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-mono">
                  {isSpanish ? "Rango de Precio (USDT)" : "Price Range (USDT)"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isSpanish ? "Mín" : "Min"}</span>
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
                    <span className="text-[10px] text-slate-400 block">{isSpanish ? "Máx" : "Max"}</span>
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

              {/* Brands */}
              {resultData.facets.brands.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-mono">
                    {isSpanish ? "Fabricantes Verificados" : "Verified Manufacturers"}
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

              {/* Minimum Rating */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-mono">
                  {isSpanish ? "Calificación Mínima" : "Minimum Rating"}
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
                        <span className="text-xs text-slate-700 font-semibold ml-1">{isSpanish ? "o Más" : "& Up"}</span>
                      </div>
                      {minRating === stars && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span className="font-semibold">{isSpanish ? "Solo en Stock" : "In Stock Only"}</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={handleInStockToggle}
                    className="rounded border-slate-300 text-[#10B981] focus:ring-[#10B981]"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span className="font-semibold text-amber-600 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {isSpanish ? "Solo Ofertas Flash" : "Flash Deals Only"}
                  </span>
                  <input
                    type="checkbox"
                    checked={flashDealsOnly}
                    onChange={handleFlashToggle}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
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
                  {isSpanish ? `No se encontraron productos de fábrica para "${query}"` : `No Factory Products Found for "${query}"`}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {isSpanish ? (
                    <>Intenta buscar términos populares como <strong className="text-[#FF1028]">Drones 4K</strong>, <strong className="text-[#FF1028]">Impresoras 3D</strong>, <strong className="text-[#FF1028]">OBD2</strong> o restablece tus filtros.</>
                  ) : (
                    <>Try searching for popular terms like <strong className="text-[#FF1028]">4K Drone</strong>, <strong className="text-[#FF1028]">3D Printer</strong>, <strong className="text-[#FF1028]">OBD2</strong>, or reset your filters.</>
                  )}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#00143D] hover:bg-[#FF1028] text-white px-6 py-2.5 rounded-xl text-xs font-black font-heading transition-colors cursor-pointer"
                >
                  {isSpanish ? "Restablecer Todos los Filtros" : "Reset All Filters"}
                </button>
              </div>
            ) : (
              /* Results Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {resultData.products.map((p, idx) => (
                  <ProductCard key={p.id} product={p} priority={idx < 4} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {resultData.totalPages > 1 && (
              <div className="pt-8 flex items-center justify-between border-t border-slate-200">
                <span className="text-xs text-slate-500 font-mono">
                  {isSpanish
                    ? `Mostrando Página ${resultData.currentPage} de ${resultData.totalPages} (${resultData.totalCount} Productos)`
                    : `Showing Page ${resultData.currentPage} of ${resultData.totalPages} (${resultData.totalCount} Products)`}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(resultData.currentPage - 1)}
                    disabled={resultData.currentPage <= 1}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    aria-label={isSpanish ? "Página Anterior" : "Previous Page"}
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
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    aria-label={isSpanish ? "Página Siguiente" : "Next Page"}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── 4. Mobile Slide-Out Filter Drawer ── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div onClick={() => setIsMobileFilterOpen(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-heading font-black text-sm text-[#00143D] uppercase">
                  {isSpanish ? "Filtros y Ajustes" : "Filters & Refinements"}
                </span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-500" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase block font-mono">
                  {isSpanish ? "Precio (USDT)" : "Price (USDT)"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => handlePriceChange(Number(e.target.value), maxPrice)}
                    className="p-2 rounded-lg bg-slate-50 border text-xs"
                    placeholder={isSpanish ? "Mín" : "Min"}
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
                    className="p-2 rounded-lg bg-slate-50 border text-xs"
                    placeholder={isSpanish ? "Máx" : "Max"}
                  />
                </div>
              </div>

              {/* Brands */}
              {resultData.facets.brands.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase block font-mono">
                    {isSpanish ? "Marcas" : "Brands"}
                  </span>
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
              <button onClick={clearAllFilters} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs">
                {isSpanish ? "Restablecer" : "Reset"}
              </button>
              <button onClick={() => setIsMobileFilterOpen(false)} className="flex-1 py-2.5 rounded-xl bg-[#00143D] text-white font-black text-xs font-heading">
                {isSpanish ? `Aplicar (${resultData.totalCount})` : `Apply (${resultData.totalCount})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
