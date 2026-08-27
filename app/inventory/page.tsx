"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Plus,
  Minus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingDown,
  ShoppingBag,
  Store,
  FileSpreadsheet
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";

export interface FlatStockItem {
  id: string; // unique row id
  productId: string;
  variationId?: string;
  name: string;
  variationName?: string;
  category: string;
  brand: string;
  sku: string;
  barcode: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  bufferStock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  image?: string;
}

export default function InventoryPage() {
  const { apiFetch, activeBusiness } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockHealthFilter, setStockHealthFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [pageSize, setPageSize] = useState<number>(45);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Manual Adjustment Modal State
  const [adjustingItem, setAdjustingItem] = useState<FlatStockItem | null>(null);
  const [adjustType, setAdjustType] = useState<"add" | "reduce" | "set">("add");
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>("Manual Stock Audit");
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Toast
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Products & Variations
  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        apiFetch("/products"),
        apiFetch("/categories")
      ]);

      if (prodRes.status === "fulfilled" && prodRes.value.data && prodRes.value.data.length > 0) {
        setProducts(prodRes.value.data);
      }
      if (catRes.status === "fulfilled" && catRes.value.data) {
        setCategories(catRes.value.data);
      }
    } catch (err) {
      console.warn("Failed to load live inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [activeBusiness]);

  // Flatten products catalog to include both standalones and individual variation rows
  const stockItems: FlatStockItem[] = useMemo(() => {
    const flat: FlatStockItem[] = [];

    products.forEach((p) => {
      if (p.hasVariations && p.variations && Array.isArray(p.variations) && p.variations.length > 0) {
        p.variations.forEach((v: any, vIdx: number) => {
          const vStock = Number(v.stock) || 0;
          const vBuffer = Number(v.bufferStock) || Number(p.bufferStock) || 5;
          let health: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
          if (vStock <= 0) health = "Out of Stock";
          else if (vStock <= vBuffer) health = "Low Stock";

          flat.push({
            id: `${p.id}_var_${v.id || vIdx}`,
            productId: p.id,
            variationId: v.id,
            name: p.name,
            variationName: v.optionValue || v.name || `Option ${vIdx + 1}`,
            category: p.category || "General",
            brand: p.brand || "",
            sku: v.sku || `${p.sku || 'SKU'}-${vIdx + 1}`,
            barcode: v.barcode || p.barcode || "",
            unit: p.unit || "Kg",
            costPrice: Number(v.costPrice) || Number(p.costPrice) || 0,
            sellingPrice: Number(v.sellingPrice) || Number(p.sellingPrice) || 0,
            stock: vStock,
            bufferStock: vBuffer,
            status: health,
            image: p.image
          });
        });
      } else {
        const pStock = Number(p.stock) || 0;
        const pBuffer = Number(p.bufferStock) || 5;
        let health: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
        if (pStock <= 0) health = "Out of Stock";
        else if (pStock <= pBuffer) health = "Low Stock";

        flat.push({
          id: p.id,
          productId: p.id,
          name: p.name,
          category: p.category || "General",
          brand: p.brand || "",
          sku: p.sku || "",
          barcode: p.barcode || "",
          unit: p.unit || "Kg",
          costPrice: Number(p.costPrice) || 0,
          sellingPrice: Number(p.sellingPrice) || 0,
          stock: pStock,
          bufferStock: pBuffer,
          status: health,
          image: p.image
        });
      }
    });

    return flat;
  }, [products]);

  // Filtered & Paginated Stock Items
  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

      if (stockHealthFilter === "in_stock" && item.status !== "In Stock") return false;
      if (stockHealthFilter === "low_stock" && item.status !== "Low Stock") return false;
      if (stockHealthFilter === "out_of_stock" && item.status !== "Out of Stock") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          item.name.toLowerCase().includes(q) ||
          (item.variationName && item.variationName.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.barcode.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [stockItems, categoryFilter, stockHealthFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStock.length / pageSize));
  const paginatedStock = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStock.slice(start, start + pageSize);
  }, [filteredStock, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockHealthFilter, pageSize]);

  // Handle Manual Stock Adjustment
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    setIsAdjusting(true);
    let finalNewStock = adjustingItem.stock;
    if (adjustType === "add") {
      finalNewStock = adjustingItem.stock + Math.max(1, adjustAmount);
    } else if (adjustType === "reduce") {
      finalNewStock = Math.max(0, adjustingItem.stock - Math.max(1, adjustAmount));
    } else if (adjustType === "set") {
      finalNewStock = Math.max(0, adjustAmount);
    }

    try {
      // 1. Update stock in database
      await apiFetch(`/products/${adjustingItem.productId}/stock`, {
        method: "PUT",
        body: JSON.stringify({
          stock: finalNewStock,
          variationId: adjustingItem.variationId,
          reason: adjustReason,
          action: adjustType
        })
      });

      // 2. Update local state
      setProducts(
        products.map((p) => {
          if (p.id === adjustingItem.productId) {
            if (adjustingItem.variationId && p.variations) {
              const updatedVars = p.variations.map((v: any) =>
                v.id === adjustingItem.variationId
                  ? { ...v, stock: finalNewStock, status: finalNewStock > 0 ? "Active" : "Out of Stock" }
                  : v
              );
              return { ...p, variations: updatedVars };
            } else {
              return {
                ...p,
                stock: finalNewStock,
                status: finalNewStock > 0 ? "Active" : "Out of Stock"
              };
            }
          }
          return p;
        })
      );

      setSuccessMsg(`Stock updated for ${adjustingItem.name}: Now ${finalNewStock} ${adjustingItem.unit}`);
      setAdjustingItem(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert("Failed to update stock: " + err.message);
    } finally {
      setIsAdjusting(false);
    }
  };

  // Quick Inline Adjust (+1 or -1)
  const handleQuickDelta = async (item: FlatStockItem, delta: number) => {
    const nextStock = Math.max(0, item.stock + delta);
    try {
      await apiFetch(`/products/${item.productId}/stock`, {
        method: "PUT",
        body: JSON.stringify({
          stock: nextStock,
          variationId: item.variationId,
          action: delta > 0 ? "add" : "reduce",
          reason: "Quick POS Count Adjustment"
        })
      });

      setProducts(
        products.map((p) => {
          if (p.id === item.productId) {
            if (item.variationId && p.variations) {
              const updatedVars = p.variations.map((v: any) =>
                v.id === item.variationId ? { ...v, stock: nextStock } : v
              );
              return { ...p, variations: updatedVars };
            } else {
              return { ...p, stock: nextStock };
            }
          }
          return p;
        })
      );
    } catch {}
  };

  const handleExportExcel = () => {
    if (stockItems.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(
      stockItems.map((s) => ({
        "Product Name": s.name,
        "Variation / Option": s.variationName || "Base",
        "Category": s.category,
        "SKU": s.sku,
        "Barcode": s.barcode,
        "Unit": s.unit,
        "Cost Price (₹)": s.costPrice,
        "Selling Price (₹)": s.sellingPrice,
        "Current Stock": s.stock,
        "Buffer Stock": s.bufferStock,
        "Stock Health": s.status,
        "Stock Valuation (₹)": s.stock * s.costPrice
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Stock");
    XLSX.writeFile(wb, `Stock_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // KPIs
  const totalSKUs = stockItems.length;
  const inStockCount = stockItems.filter((s) => s.status === "In Stock").length;
  const lowStockCount = stockItems.filter((s) => s.status === "Low Stock").length;
  const outOfStockCount = stockItems.filter((s) => s.status === "Out of Stock").length;
  const totalStockValuation = stockItems.reduce((sum, s) => sum + s.stock * s.costPrice, 0);

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4 animate-in fade-in duration-150">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[8px] text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs">
        <div>
          <h1 className="text-lg font-medium text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-[#6320EE]" />
            <span>Stock & Inventory Management</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            Track real-time stock levels, item variations, manual count audits, and procurement sync
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadInventory}
            className="h-8.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[8px] text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Refresh Stock Counts"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="h-8.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[8px] text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Stock</span>
          </button>

          <Link
            href="/purchases"
            className="h-8.5 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Procure / Add Purchase</span>
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Items & Variants</span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">{totalSKUs} SKUs</h3>
            <span className="text-[10px] text-gray-400 font-normal">Catalog coverage</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-purple-50 text-[#6320EE] flex items-center justify-center">
            <Layers className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Healthy In-Stock</span>
            <h3 className="text-base font-bold text-emerald-600 mt-0.5">{inStockCount} Items</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Ready for billing</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Low Stock Alert</span>
            <h3 className="text-base font-bold text-amber-600 mt-0.5">{lowStockCount} Items</h3>
            <span className="text-[10px] text-amber-600 font-medium">Below buffer threshold</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Out of Stock</span>
            <h3 className="text-base font-bold text-rose-600 mt-0.5">{outOfStockCount} Items</h3>
            <span className="text-[10px] text-rose-600 font-medium">Restock immediately</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Stock Valuation</span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">₹ {totalStockValuation.toLocaleString("en-IN")}</h3>
            <span className="text-[10px] text-gray-400 font-normal">At Cost Value</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-2xs overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product, variation, barcode, SKU, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8.5 pr-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 px-2 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Stock Health Tabs */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-[8px] border border-gray-200/60 text-xs">
              {[
                { id: "all", label: "All Stock" },
                { id: "in_stock", label: "In Stock" },
                { id: "low_stock", label: "Low Stock" },
                { id: "out_of_stock", label: "Out of Stock" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStockHealthFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                    stockHealthFilter === tab.id
                      ? "bg-white text-[#6320EE] shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3.5 text-center w-12">#</th>
                <th className="py-2.5 px-3">Product Name & Variant</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">SKU / Barcode</th>
                <th className="py-2.5 px-3 text-center">Unit</th>
                <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                <th className="py-2.5 px-3 text-right">Sell (₹)</th>
                <th className="py-2.5 px-3 text-center min-w-[130px]">Live Stock Level</th>
                <th className="py-2.5 px-3 text-center">Health Status</th>
                <th className="py-2.5 px-3 text-center w-28">Quick Adjust</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#6320EE] animate-spin mx-auto mb-2" />
                    <span className="text-xs font-medium text-gray-600 block">Loading inventory catalog...</span>
                  </td>
                </tr>
              ) : filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                        <Package className="w-5 h-5" />
                      </div>
                      <p className="font-medium text-gray-800 text-xs">No stock items match filter</p>
                      <p className="text-[11px] text-gray-400">
                        Add products in the Products tab or receive a purchase shipment.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStock.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3.5 text-center text-gray-400 font-medium">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* Product Name */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[6px] bg-purple-50 flex items-center justify-center text-xs shrink-0 font-bold text-[#6320EE]">
                          {item.image && item.image.startsWith("http") ? (
                            <img src={item.image} className="w-full h-full object-cover rounded-[6px]" />
                          ) : (
                            item.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{item.name}</span>
                          {item.variationName && (
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-medium inline-block">
                              {item.variationName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3">
                      <span className="text-gray-700">{item.category}</span>
                    </td>

                    {/* SKU & Barcode */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                      <div>{item.sku || "—"}</div>
                      {item.barcode && <div className="text-[10px] text-gray-400">{item.barcode}</div>}
                    </td>

                    {/* Unit */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-mono text-[11px] font-medium">
                        {item.unit}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="py-2.5 px-3 text-right font-medium text-gray-600">
                      ₹ {item.costPrice.toFixed(2)}
                    </td>

                    {/* Sell */}
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                      ₹ {item.sellingPrice.toFixed(2)}
                    </td>

                    {/* Stock Level with Delta controls */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleQuickDelta(item, -1)}
                          disabled={item.stock <= 0}
                          className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-30 cursor-pointer"
                          title="Reduce 1"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>

                        <span
                          className={`font-bold font-mono text-sm px-2 ${
                            item.stock <= 0
                              ? "text-rose-600"
                              : item.stock <= item.bufferStock
                              ? "text-amber-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {item.stock}
                        </span>

                        <button
                          onClick={() => handleQuickDelta(item, 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-purple-50 hover:bg-purple-100 text-[#6320EE] cursor-pointer"
                          title="Add 1"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </td>

                    {/* Health Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          item.status === "In Stock"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : item.status === "Low Stock"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-rose-50 text-rose-700 border border-rose-200/60"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Quick Adjust Button */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          setAdjustingItem(item);
                          setAdjustType("add");
                          setAdjustAmount(10);
                          setAdjustReason("Manual Stock Audit");
                        }}
                        className="h-7 px-2.5 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-[#6320EE] text-[11px] font-medium rounded-[6px] shadow-2xs flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-gray-500 font-normal">
            Showing {filteredStock.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredStock.length)} of {filteredStock.length} items (Page {currentPage} of {totalPages})
          </span>

          <div className="flex items-center gap-1 self-center sm:self-auto select-none">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Dynamic Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((page, idx, arr) => {
                const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-1 text-gray-400 text-xs">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-[8px] text-xs font-medium flex items-center justify-center cursor-pointer transition-colors ${
                        currentPage === page
                          ? "bg-[#6320EE] text-white shadow-2xs"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* MANUAL STOCK ADJUSTMENT MODAL */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#6320EE]" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Adjust Stock Count</h3>
                  <span className="text-[11px] text-gray-400 font-medium block">
                    {adjustingItem.name} {adjustingItem.variationName ? `(${adjustingItem.variationName})` : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Stock Banner */}
            <div className="p-3 bg-gray-50 rounded-[8px] flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Current In-Stock:</span>
              <span className="font-bold text-base text-gray-900 font-mono">
                {adjustingItem.stock} {adjustingItem.unit}
              </span>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3.5 text-xs">
              {/* Adjustment Mode Selector */}
              <div>
                <label className="block text-gray-600 mb-1.5 font-medium text-[11px]">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdjustType("add")}
                    className={`py-1.5 rounded-[6px] border text-xs font-medium cursor-pointer transition-colors ${
                      adjustType === "add"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    + Add Stock
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType("reduce")}
                    className={`py-1.5 rounded-[6px] border text-xs font-medium cursor-pointer transition-colors ${
                      adjustType === "reduce"
                        ? "bg-rose-50 border-rose-300 text-rose-800"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    - Reduce Stock
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType("set")}
                    className={`py-1.5 rounded-[6px] border text-xs font-medium cursor-pointer transition-colors ${
                      adjustType === "set"
                        ? "bg-purple-50 border-purple-300 text-[#6320EE]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Set Exact
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">
                  {adjustType === "add" ? "Quantity to Add" : adjustType === "reduce" ? "Quantity to Deduct" : "Exact Physical Count"} ({adjustingItem.unit}) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={adjustAmount || ""}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className="w-full h-8.5 px-3 border border-gray-200 rounded-[6px] text-xs font-mono font-bold focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Reason / Audit Note</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white text-gray-800"
                >
                  <option value="Manual Stock Audit">Manual Physical Stock Audit</option>
                  <option value="Received Supplier Intake">Received Supplier Intake</option>
                  <option value="Damaged / Broken Product Write-off">Damaged / Broken Product Write-off</option>
                  <option value="Customer Return">Customer Return to Shelf</option>
                  <option value="Expired Stock Removal">Expired Stock Removal</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="h-8 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[6px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="h-8 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[6px] shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAdjusting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Stock Count</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
