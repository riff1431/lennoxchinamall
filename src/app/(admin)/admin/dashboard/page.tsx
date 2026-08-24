"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  Search,
  ChevronDown,
  ShoppingCart,
  Scan,
  BarChart2,
  PieChart,
  Shirt,
} from "lucide-react";
import { cn } from "@/utils/helpers";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
  amount: number;
  color: string;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    name: "Marco Lightweight Shirt",
    price: 79.59,
    category: "Man Cloths",
    quantity: 84,
    amount: 6518.18,
    color: "bg-[#0F172A] text-white",
  },
  {
    id: "prod-2",
    name: "Half Sleeve Shirt",
    price: 80.59,
    category: "Man Cloths",
    quantity: 84,
    amount: 4318.10,
    color: "bg-[#2563EB] text-white",
  },
  {
    id: "prod-3",
    name: "Lightweight Jacket",
    price: 79.59,
    category: "Man Cloths",
    quantity: 84,
    amount: 5253.14,
    color: "bg-[#1E293B] text-white",
  },
];

// Lifetime sales dataset for 6 months (Jan-Jun) matching reference design proportions
const MONTHLY_DATA = [
  {
    month: "Jan",
    sales: 14000,
    income: 25000,
    user: 12000,
    taxes: 7000,
  },
  {
    month: "Feb",
    sales: 10000,
    income: 16500,
    user: 6000,
    taxes: 3000,
  },
  {
    month: "Mar",
    sales: 15500,
    income: 19000,
    user: 15000,
    taxes: 7000,
  },
  {
    month: "Apr",
    sales: 14000,
    income: 18500,
    user: 11500,
    taxes: 6000,
  },
  {
    month: "May",
    sales: 16000,
    income: 14000,
    user: 17000,
    taxes: 6000,
  },
  {
    month: "Jun",
    sales: 18000,
    income: 24000,
    user: 12000,
    taxes: 15000,
  },
];

const MAX_CHART_VALUE = 25000;

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [timeFilter, setTimeFilter] = useState("Month");
  const [countryFilter, setCountryFilter] = useState("Country");
  const [activeTooltip, setActiveTooltip] = useState<{
    month: string;
    series: string;
    value: number;
    left: number;
    top: number;
  } | null>(null);

  // Filter products by search query
  const filteredProducts = INITIAL_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
      setSelectAll(false);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
      setSelectAll(true);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 font-sans">
      {/* ── 1. Top 4 Metric Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Sales */}
        <div className="bg-[#FFF8EE] dark:bg-[#2A2117] border border-[#FED7AA]/50 dark:border-amber-900/30 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
              <Scan className="w-4 h-4" />
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Total Sales
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                $12,145
              </span>
            </div>

            <span className="bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-md">
              + 20%
            </span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-[#EEF4FF] dark:bg-[#172033] border border-[#BFDBFE]/50 dark:border-blue-900/30 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-full bg-[#2F65F6] text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Total Orders
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                $14,125
              </span>
            </div>

            <span className="bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-md">
              +35%
            </span>
          </div>
        </div>

        {/* Card 3: Total Visition */}
        <div className="bg-[#FFF0F2] dark:bg-[#2D1B22] border border-[#FECDD3]/50 dark:border-rose-900/30 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-xs">
              <BarChart2 className="w-4 h-4" />
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Total Visition
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                $18,126
              </span>
            </div>

            <span className="bg-[#FEE2E2] dark:bg-rose-950/60 text-[#DC2626] dark:text-rose-400 text-[11px] font-bold px-2 py-0.5 rounded-md">
              - 20%
            </span>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-[#F0FDF4] dark:bg-[#162720] border border-[#BBF7D0]/50 dark:border-emerald-900/30 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
              <PieChart className="w-4 h-4" />
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Total Revenue
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                $14,144
              </span>
            </div>

            <span className="bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-md">
              + 20%
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Middle Section: Lifetime Sales & Geography ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lifetime Sales (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Lifetime Sales
            </h2>

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2F65F6]" />
                <span>Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                <span>User</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Taxes</span>
              </div>
            </div>

            {/* Time dropdown */}
            <div>
              <button
                type="button"
                onClick={() => setTimeFilter(timeFilter === "Month" ? "Year" : "Month")}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <span>{timeFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Clustered Bar Chart Canvas */}
          <div className="relative h-60 w-full pt-2">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-6 pb-7">
              {[25, 20, 15, 10, 5, 0].map((val) => (
                <div key={val} className="w-full flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 w-5 text-right">
                    {val === 0 ? "0" : `${val}k`}
                  </span>
                  <div className="flex-1 border-b border-dashed border-slate-200/70 dark:border-slate-800" />
                </div>
              ))}
            </div>

            {/* Bars container */}
            <div className="h-full pl-8 pb-7 flex items-end justify-between relative z-10">
              {MONTHLY_DATA.map((item) => {
                const salesHeight = (item.sales / MAX_CHART_VALUE) * 100;
                const incomeHeight = (item.income / MAX_CHART_VALUE) * 100;
                const userHeight = (item.user / MAX_CHART_VALUE) * 100;
                const taxesHeight = (item.taxes / MAX_CHART_VALUE) * 100;

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center justify-end h-full px-1"
                  >
                    {/* Clustered Bars */}
                    <div className="flex items-end gap-1 sm:gap-1.5 h-full px-1">
                      {/* 1. Sales (Amber) */}
                      <div
                        style={{ height: `${salesHeight}%` }}
                        className="w-1.5 sm:w-2 bg-[#F59E0B] rounded-t-sm transition-all duration-200 hover:brightness-110 cursor-pointer"
                        title={`Sales: $${item.sales.toLocaleString()}`}
                      />

                      {/* 2. Income (Blue) */}
                      <div
                        style={{ height: `${incomeHeight}%` }}
                        className="w-1.5 sm:w-2 bg-[#2F65F6] rounded-t-sm transition-all duration-200 hover:brightness-110 cursor-pointer"
                        title={`Income: $${item.income.toLocaleString()}`}
                      />

                      {/* 3. User (Cyan) */}
                      <div
                        style={{ height: `${userHeight}%` }}
                        className="w-1.5 sm:w-2 bg-[#06B6D4] rounded-t-sm transition-all duration-200 hover:brightness-110 cursor-pointer"
                        title={`User: ${item.user.toLocaleString()}`}
                      />

                      {/* 4. Taxes (Green) */}
                      <div
                        style={{ height: `${taxesHeight}%` }}
                        className="w-1.5 sm:w-2 bg-[#10B981] rounded-t-sm transition-all duration-200 hover:brightness-110 cursor-pointer"
                        title={`Taxes: $${item.taxes.toLocaleString()}`}
                      />
                    </div>

                    {/* Month Label */}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Geography (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between relative">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Geography
            </h2>

            <button
              type="button"
              onClick={() => setCountryFilter(countryFilter === "Country" ? "Global" : "Country")}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span>{countryFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Dot Matrix World Map with USA Pin */}
          <div className="relative my-3 flex items-center justify-center min-h-[160px]">
            {/* SVG Dot Matrix Map */}
            <svg
              className="w-full h-36 opacity-75 dark:opacity-30 text-slate-300 dark:text-slate-600"
              viewBox="0 0 400 200"
              fill="currentColor"
            >
              {/* North America dots */}
              <circle cx="65" cy="45" r="3" />
              <circle cx="80" cy="42" r="3" />
              <circle cx="95" cy="45" r="3" />
              <circle cx="70" cy="58" r="3" />
              <circle cx="85" cy="58" r="3" />
              <circle cx="100" cy="58" r="3" />
              <circle cx="115" cy="55" r="3" />
              <circle cx="75" cy="72" r="3" />
              <circle cx="90" cy="72" r="3" />
              <circle cx="105" cy="72" r="3" />
              <circle cx="95" cy="85" r="3" />

              {/* South America dots */}
              <circle cx="120" cy="110" r="3" />
              <circle cx="130" cy="125" r="3" />
              <circle cx="135" cy="140" r="3" />
              <circle cx="130" cy="155" r="3" />

              {/* Europe dots */}
              <circle cx="185" cy="42" r="3" />
              <circle cx="200" cy="42" r="3" />
              <circle cx="215" cy="45" r="3" />
              <circle cx="190" cy="55" r="3" />
              <circle cx="205" cy="55" r="3" />

              {/* Africa dots */}
              <circle cx="195" cy="85" r="3" />
              <circle cx="210" cy="90" r="3" />
              <circle cx="200" cy="105" r="3" />
              <circle cx="215" cy="110" r="3" />
              <circle cx="210" cy="130" r="3" />

              {/* Asia & Australia dots */}
              <circle cx="250" cy="50" r="3" />
              <circle cx="265" cy="45" r="3" />
              <circle cx="280" cy="50" r="3" />
              <circle cx="295" cy="60" r="3" />
              <circle cx="260" cy="65" r="3" />
              <circle cx="275" cy="70" r="3" />
              <circle cx="290" cy="80" r="3" />
              <circle cx="305" cy="90" r="3" />
              <circle cx="310" cy="135" r="3" />
              <circle cx="325" cy="140" r="3" />
            </svg>

            {/* USA Highlight Tooltip */}
            <div className="absolute top-2 left-1/4 -translate-x-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2">
              <span className="text-xs">🇺🇸</span>
              <div className="leading-tight">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                  USA
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  6.235b
                </span>
              </div>
            </div>

            {/* Map Zoom Controls */}
            <div className="absolute left-0 bottom-1 flex flex-col gap-1">
              <button
                type="button"
                className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold shadow-xs"
              >
                +
              </button>
              <button
                type="button"
                className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold shadow-xs"
              >
                -
              </button>
            </div>
          </div>

          {/* Bottom Progress Bars: Customer (68%) & Conversion (40%) */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Customer 68% */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Customer</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">68%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#2F65F6] rounded-full" style={{ width: "68%" }} />
              </div>
            </div>

            {/* Conversion 40% */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Conversion</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">40%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#F97316] rounded-full" style={{ width: "40%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Bottom Section: Top Selling Products Table ── */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        {/* Table Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            Top Selling Products
          </h2>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-48 sm:w-56 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-8 pr-3 py-1.5 text-slate-800 dark:text-slate-200 outline-none focus:border-[#2F65F6] transition-colors"
              />
            </div>

            {/* View All Button */}
            <Link
              href="/admin/products"
              className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Interactive Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead className="text-slate-400 dark:text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#2F65F6] focus:ring-0 cursor-pointer"
                  />
                </th>

                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                    <span>Product Name</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                    <span>Price</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                    <span>Categories</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                    <span>Quantity</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                    <span>Amount</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3 px-4 text-right">
                  <span>Action</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredProducts.map((product) => {
                const isChecked = selectedProducts.includes(product.id);

                return (
                  <tr
                    key={product.id}
                    className={cn(
                      "hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors",
                      isChecked && "bg-blue-50/40 dark:bg-blue-950/20"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="rounded border-slate-300 text-[#2F65F6] focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Product Name & Icon */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* Dark/Colored Shirt Thumbnail Box */}
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs",
                            product.color
                          )}
                        >
                          <Shirt className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white font-heading">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">
                      {product.category}
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {product.quantity}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ${product.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Action Menu */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 transition-colors"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4 ml-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

