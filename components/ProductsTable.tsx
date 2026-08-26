"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  Plus,
  Search,
  X,
  Check,
  Upload,
  Barcode,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Product, INITIAL_PRODUCTS } from "./ProductData";
import { Category } from "./CategoryData";
import StatCards from "./StatCards";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Package } from "lucide-react";
import { Variation } from "./VariationData";

interface ProductVariantItem {
  id: string;
  name: string;
  optionValue: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  bufferStock: number;
  barcode: string;
  status: string;
}

export default function ProductsTable({ onOpenBulkUpload }: { onOpenBulkUpload?: () => void }) {
  const { apiFetch, activeBusiness } = useAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableVariations, setAvailableVariations] = useState<Variation[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Product>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number>(45);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Modal States
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Image Upload State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate unique 13-digit numeric barcode (EAN-13 style standard starting with 890)
  const generateNumericBarcode = () => {
    const prefix = "890";
    let body = "";
    for (let i = 0; i < 9; i++) {
      body += Math.floor(Math.random() * 10);
    }
    const digits = prefix + body;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const val = parseInt(digits[i], 10);
      sum += i % 2 === 0 ? val : val * 3;
    }
    const checksum = (10 - (sum % 10)) % 10;
    return `${digits}${checksum}`;
  };

  // Add Product Form State
  const [newProduct, setNewProduct] = useState<{
    name: string;
    sku: string;
    category: string;
    brand: string;
    unit: string;
    sellingPrice: number | string;
    costPrice: number | string;
    stock: number | string;
    bufferStock: number | string;
    status: "Active" | "Out of Stock" | "Inactive";
    barcode: string;
    hasVariations: boolean;
    selectedVariationType: string;
    variations: ProductVariantItem[];
  }>({
    name: "",
    sku: "",
    category: "Cakes & Bakery",
    brand: "Sweet Delights",
    unit: "Kg",
    sellingPrice: "",
    costPrice: "",
    stock: "",
    bufferStock: 5,
    status: "Active",
    barcode: generateNumericBarcode(),
    hasVariations: false,
    selectedVariationType: "Weight",
    variations: []
  });

  // Load live products, categories, and variations
  const loadData = async () => {
    if (!activeBusiness) return;
    setIsLoading(true);
    try {
      const [prodRes, catRes, varRes] = await Promise.allSettled([
        apiFetch("/products"),
        apiFetch("/categories"),
        apiFetch("/variations")
      ]);

      if (prodRes.status === "fulfilled" && prodRes.value.data && prodRes.value.data.length > 0) {
        setProducts(prodRes.value.data);
      }
      if (catRes.status === "fulfilled" && catRes.value.data) {
        setCategories(catRes.value.data);
      }
      if (varRes.status === "fulfilled" && varRes.value.data) {
        setAvailableVariations(varRes.value.data);
      }
    } catch (err) {
      console.warn("Using local fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeBusiness]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Add variation row to product form
  const handleAddVariationRow = (optValue: string = "") => {
    const newVariant: ProductVariantItem = {
      id: `var_opt_${Date.now()}_${newProduct.variations.length}`,
      name: newProduct.selectedVariationType,
      optionValue: optValue || `Option ${newProduct.variations.length + 1}`,
      sellingPrice: Number(newProduct.sellingPrice) || 0,
      costPrice: Number(newProduct.costPrice) || 0,
      stock: 10,
      bufferStock: 5,
      barcode: generateNumericBarcode(),
      status: "Active"
    };
    setNewProduct({
      ...newProduct,
      variations: [...newProduct.variations, newVariant]
    });
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (activeTab === "active" && item.status !== "Active") return false;
      if (activeTab === "inactive" && item.status !== "Out of Stock" && item.status !== "Inactive") return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        
  const totalProductsCount = products.length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.bufferStock || 5)).length;
  const outOfStockCount = products.filter(p => p.stock <= 0 || p.status === 'Out of Stock').length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.stock * p.sellingPrice), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          (item.barcode && item.barcode.includes(q))
        );
      }
      return true;
    }).sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [products, activeTab, categoryFilter, searchQuery, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, categoryFilter, pageSize]);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await apiFetch(`/products/${id}`, { method: "DELETE" });
      } catch {}
      setProducts(products.filter((p) => p.id !== id));
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await apiFetch(`/products/${editingProduct.id}`, {
        method: "PUT",
        body: JSON.stringify(editingProduct)
      });
    } catch {}
    setProducts(products.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
    setEditingProduct(null);
  };

  
  const handleExportCSV = () => {
    if (products.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(products.map(p => ({
      "Product Name": p.name,
      "SKU": p.sku,
      "Barcode": p.barcode || "",
      "Category": p.category,
      "Brand": p.brand,
      "Unit": p.unit,
      "Selling Price": p.sellingPrice,
      "Cost Price": p.costPrice,
      "Stock": p.stock,
      "Buffer Stock": p.bufferStock || 5,
      "Status": p.status,
      "Added On": p.addedOn
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Live Products");
    XLSX.writeFile(wb, "products_catalog.xlsx");
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    setIsUploading(true);
    let finalImageUrl = "";

    // 1. Upload to ImageKit if an image was picked
    if (imageBase64) {
      try {
        const uploadRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1") + "/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: imageBase64,
            fileName: newProduct.name.toLowerCase().replace(/\s+/g, "-")
          })
        });
        const uploadData = await uploadRes.json();
        if (uploadData.data?.url) {
          finalImageUrl = uploadData.data.url;
        }
      } catch (err) {
        console.warn("ImageKit upload error:", err);
      }
    }

    const payload = {
      name: newProduct.name,
      sku: newProduct.sku || `PRD-00${products.length + 1}`,
      category: newProduct.category,
      brand: newProduct.brand,
      unit: newProduct.unit,
      sellingPrice: Number(newProduct.sellingPrice) || 0,
      costPrice: Number(newProduct.costPrice) || 0,
      stock: newProduct.hasVariations && newProduct.variations.length > 0
        ? newProduct.variations.reduce((sum, v) => sum + v.stock, 0)
        : Number(newProduct.stock) || 0,
      bufferStock: Number(newProduct.bufferStock) || 5,
      status: newProduct.status,
      image: finalImageUrl || imagePreview || "📦",
      barcode: newProduct.barcode || generateNumericBarcode(),
      hasVariations: newProduct.hasVariations,
      variations: newProduct.variations
    };

    try {
      const res = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.data) {
        setProducts([res.data, ...products]);
      }
    } catch {
      const fallback: Product = {
        id: String(Date.now()),
        name: payload.name,
        sku: payload.sku,
        category: payload.category,
        brand: payload.brand,
        unit: payload.unit,
        sellingPrice: payload.sellingPrice,
        costPrice: payload.costPrice,
        stock: payload.stock,
        status: payload.stock > 0 ? "Active" : "Out of Stock",
        addedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        image: payload.image,
        barcode: payload.barcode
      };
      setProducts([fallback, ...products]);
    } finally {
      setIsUploading(false);
      setIsAddModalOpen(false);
      setImagePreview(null);
      setImageBase64(null);
      setNewProduct({
        name: "",
        sku: "",
        category: "Cakes & Bakery",
        brand: "Sweet Delights",
        unit: "Kg",
        sellingPrice: "",
        costPrice: "",
        stock: "",
        bufferStock: 5,
        status: "Active",
        barcode: generateNumericBarcode(),
        hasVariations: false,
        selectedVariationType: "Weight",
        variations: []
      });
    }
  };

  const renderProductIcon = (item: Product) => {
    if (item.image && (item.image.startsWith("http") || item.image.startsWith("data:image"))) {
      return (
        <div className="w-8 h-8 rounded-[8px] overflow-hidden border border-gray-200 shrink-0 bg-white flex items-center justify-center">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-[8px] bg-purple-50 border border-purple-100 flex items-center justify-center text-sm shadow-2xs shrink-0">
        {item.image || "📦"}
      </div>
    );
  };

  const totalProductsCount = products.length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.bufferStock || 5)).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0 || p.status === "Out of Stock").length;
  const totalInventoryValue = products
    .reduce((acc, p) => acc + p.stock * p.sellingPrice, 0)
    .toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-5">
      <button id="export-products-trigger" onClick={handleExportCSV} className="hidden" />
      <StatCards
        totalProducts={totalProductsCount}
        lowStock={lowStockCount}
        outOfStock={outOfStockCount}
        totalValue={totalInventoryValue}
      />
    <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Top Filter Tabs & Controls Header */}
      <div className="p-3.5 sm:p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Tabs */}
        <div className="flex items-center gap-5 border-b md:border-b-0 border-gray-100 pb-1.5 md:pb-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-1 text-xs font-medium transition-all relative cursor-pointer ${
              activeTab === "all" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            All Products
            {activeTab === "all" && (
              <span className="absolute -bottom-1.5 md:-bottom-4 left-0 right-0 h-0.5 bg-[#6320EE] rounded-[8px]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`pb-1 text-xs font-medium transition-all relative cursor-pointer ${
              activeTab === "active" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Active Products
            {activeTab === "active" && (
              <span className="absolute -bottom-1.5 md:-bottom-4 left-0 right-0 h-0.5 bg-[#6320EE] rounded-[8px]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("inactive")}
            className={`pb-1 text-xs font-medium transition-all relative cursor-pointer ${
              activeTab === "inactive" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Inactive Products
            {activeTab === "inactive" && (
              <span className="absolute -bottom-1.5 md:-bottom-4 left-0 right-0 h-0.5 bg-[#6320EE] rounded-[8px]" />
            )}
          </button>
        </div>

        {/* Right Info & Controls */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 self-end md:self-auto">
          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product / barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2.5 h-7.5 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE] w-36 sm:w-48 text-gray-700 placeholder-gray-400 font-normal"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-[8px]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="text-[11px] text-gray-500 font-normal">
            Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} products
          </span>

          {/* Page size dropdown */}
          <div className="relative inline-block">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-200 rounded-[8px] h-7.5 pl-2.5 pr-6 text-xs font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:border-[#6320EE] cursor-pointer shadow-2xs"
            >
              <option value={45}>45 per page</option>
              <option value={90}>90 per page</option>
              <option value={150}>150 per page</option>
              <option value={filteredProducts.length || 1000}>All items</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
              ▾
            </span>
          </div>

          {/* View switcher */}
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 shadow-2xs transition-colors cursor-pointer"
            title="Toggle View"
          >
            {viewMode === "table" ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
          </button>

          {/* Add Product inline button with trigger ID */}
          <button
            id="add-product-table-trigger"
            onClick={() => {
              setNewProduct((prev) => ({
                ...prev,
                barcode: generateNumericBarcode()
              }));
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 h-7.5 px-2.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Main Table View */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#FAFAFC] text-[11px] font-medium text-gray-600 uppercase tracking-wider select-none">
                <th className="py-2.5 px-3.5 w-9 text-center font-medium">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedIds.length === filteredProducts.length
                    }
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded-[4px] border-gray-300 text-[#6320EE] focus:ring-[#6320EE] cursor-pointer"
                  />
                </th>

                <th onClick={() => handleSort("name")} className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th onClick={() => handleSort("sku")} className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium">
                  <div className="flex items-center gap-1">
                    <span>SKU / Barcode</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th onClick={() => handleSort("category")} className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th onClick={() => handleSort("brand")} className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Brand</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th onClick={() => handleSort("unit")} className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Unit</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th onClick={() => handleSort("sellingPrice")} className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 text-right font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th onClick={() => handleSort("costPrice")} className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 text-right font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost Price</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th onClick={() => handleSort("stock")} className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 text-right font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <span>Stock</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th onClick={() => handleSort("status")} className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 text-center font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th onClick={() => handleSort("addedOn")} className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Added On</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th className="py-2.5 px-3.5 text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">No products found</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Add your first product manually or bulk import from Excel.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onOpenBulkUpload && onOpenBulkUpload()}
                          className="h-8 px-3 bg-white border border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-[#6320EE] text-xs font-medium rounded-[8px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Bulk Upload</span>
                        </button>
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="h-8 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Product</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {paginatedProducts.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isOutOfStock = item.stock <= 0 || item.status === "Out of Stock";

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-gray-50/70 ${
                      isSelected ? "bg-purple-50/40" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-3.5 h-3.5 rounded-[4px] border-gray-300 text-[#6320EE] focus:ring-[#6320EE] cursor-pointer"
                      />
                    </td>

                    {/* Product Name & Thumbnail */}
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-2">
                        {renderProductIcon(item)}
                        <div>
                          <span className="font-medium text-gray-900 hover:text-[#6320EE] cursor-pointer text-xs block">
                            {item.name}
                          </span>
                          {item.hasVariations && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#6320EE] bg-purple-50 px-1.5 py-0.2 rounded-[4px]">
                              <Layers className="w-2.5 h-2.5" />
                              <span>{item.variations?.length || 0} Variants</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU & Barcode */}
                    <td className="py-2.5 px-2.5 font-normal text-gray-500 text-xs">
                      <span className="font-medium text-gray-700">{item.sku}</span>
                      {item.barcode && (
                        <span className="block text-[10px] text-gray-400 font-mono">
                          {item.barcode}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-2.5 text-gray-600 font-normal text-xs">
                      {item.category}
                    </td>

                    {/* Brand */}
                    <td className="py-2.5 px-2.5 text-gray-600 font-normal text-xs">
                      {item.brand}
                    </td>

                    {/* Unit */}
                    <td className="py-2.5 px-2.5 text-gray-600 font-normal text-xs">
                      {item.unit}
                    </td>

                    {/* Selling Price */}
                    <td className="py-2.5 px-2.5 font-medium text-gray-900 text-right text-xs">
                      ₹ {Number(item.sellingPrice).toFixed(2)}
                    </td>

                    {/* Cost Price */}
                    <td className="py-2.5 px-2.5 font-normal text-gray-600 text-right text-xs">
                      ₹ {Number(item.costPrice).toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="py-2.5 px-2.5 font-medium text-right text-xs">
                      <span className={isOutOfStock ? "text-rose-500" : "text-emerald-600"}>
                        {Number(item.stock).toFixed(2)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2.5 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[8px] text-[10px] font-medium bg-rose-50 text-rose-500 border border-rose-100">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[8px] text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Added On */}
                    <td className="py-2.5 px-2.5 text-gray-500 whitespace-nowrap font-normal text-xs">
                      {item.addedOn || "26 May 2025"}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingProduct(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-[8px] text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingProduct(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-[8px] text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-[8px] text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Mode */
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {paginatedProducts.map((item) => {
            const isOutOfStock = item.stock <= 0 || item.status === "Out of Stock";
            return (
              <div
                key={item.id}
                className="border border-gray-100 rounded-[8px] p-3.5 hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      {renderProductIcon(item)}
                      <div>
                        <h4 className="font-medium text-gray-900 text-xs leading-snug">{item.name}</h4>
                        <span className="text-[10px] text-gray-400">{item.sku}</span>
                      </div>
                    </div>
                    {isOutOfStock ? (
                      <span className="px-1.5 py-0.5 rounded-[8px] text-[10px] font-medium bg-rose-50 text-rose-500">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-[8px] text-[10px] font-medium bg-emerald-50 text-emerald-600">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 mt-2.5 pt-2.5 border-t border-gray-100 font-normal">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="font-medium text-gray-800">{item.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Selling Price:</span>
                      <span className="font-medium text-gray-900">₹ {Number(item.sellingPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stock:</span>
                      <span className={`font-medium ${isOutOfStock ? "text-rose-500" : "text-emerald-600"}`}>
                        {Number(item.stock).toFixed(2)} {item.unit}
                      </span>
                    </div>
                    {item.barcode && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Barcode:</span>
                        <span className="font-mono text-[11px] text-gray-600">{item.barcode}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 mt-3 pt-2.5 border-t border-gray-100">
                  <button
                    onClick={() => setViewingProduct(item)}
                    className="w-7 h-7 flex items-center justify-center rounded-[8px] text-purple-600 hover:bg-purple-50 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingProduct(item)}
                    className="w-7 h-7 flex items-center justify-center rounded-[8px] text-sky-600 hover:bg-sky-50 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-[8px] text-rose-500 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs text-gray-500 font-normal">
          Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} products (Page {currentPage} of {totalPages})
        </span>

        <div className="flex items-center gap-1 self-center sm:self-auto select-none">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Previous Page"
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
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                {renderProductIcon(viewingProduct)}
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{viewingProduct.name}</h3>
                  <span className="text-[11px] text-gray-400 font-mono">{viewingProduct.sku}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3.5 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-[8px]">
                <span className="text-gray-400 block mb-0.5 text-[11px]">Category</span>
                <span className="font-medium text-gray-900 text-xs">{viewingProduct.category}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-[8px]">
                <span className="text-gray-400 block mb-0.5 text-[11px]">Brand</span>
                <span className="font-medium text-gray-900 text-xs">{viewingProduct.brand}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-[8px]">
                <span className="text-gray-400 block mb-0.5 text-[11px]">Selling Price</span>
                <span className="font-medium text-gray-900 text-xs">₹ {Number(viewingProduct.sellingPrice).toFixed(2)}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-[8px]">
                <span className="text-gray-400 block mb-0.5 text-[11px]">Stock</span>
                <span className={`font-medium text-xs ${viewingProduct.stock > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {Number(viewingProduct.stock).toFixed(2)} {viewingProduct.unit}
                </span>
              </div>

              {viewingProduct.barcode && (
                <div className="col-span-2 bg-purple-50/50 p-2.5 rounded-[8px] border border-purple-100 flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Unique Barcode (EAN-13)</span>
                    <span className="font-mono text-xs font-medium text-[#6320EE]">{viewingProduct.barcode}</span>
                  </div>
                  <Barcode className="w-6 h-6 text-[#6320EE]" />
                </div>
              )}

              {/* Variations details if present */}
              {viewingProduct.variations && viewingProduct.variations.length > 0 && (
                <div className="col-span-2 mt-2">
                  <span className="text-[11px] font-medium text-gray-700 block mb-2">Configured Variants</span>
                  <div className="space-y-1.5">
                    {viewingProduct.variations.map((v: ProductVariantItem, i: number) => (
                      <div key={i} className="p-2 bg-gray-50 rounded-[8px] text-[11px] flex justify-between items-center border border-gray-100">
                        <div>
                          <span className="font-medium text-gray-900">{v.optionValue}</span>
                          <span className="block text-[10px] text-gray-400 font-mono">Barcode: {v.barcode}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-gray-900">₹ {v.sellingPrice}</span>
                          <span className="block text-[10px] text-emerald-600">{v.stock} in stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setViewingProduct(null)}
                className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-[8px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal with Image Upload, Variations & Auto Barcodes */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProduct}
            className="bg-white rounded-[8px] max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900 text-base">Add New Product</h3>
                <p className="text-[11px] text-gray-400 font-normal">
                  Upload image, configure variants, pricing, and unique barcodes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs font-normal">
              {/* 1. Image Picker */}
              <div>
                <label className="block text-gray-600 mb-1.5 font-medium text-[11px]">
                  Product Image (Auto uploads to ImageKit)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-[8px] border-2 border-dashed border-purple-200 hover:border-[#6320EE] bg-purple-50/40 flex flex-col items-center justify-center text-gray-400 hover:text-[#6320EE] cursor-pointer transition-all shrink-0 overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-medium">Choose</span>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    <p className="font-medium text-gray-800">
                      {imagePreview ? "Image Selected" : "Click box to select product photo"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Supports JPG, PNG, WEBP. Uploaded automatically to ImageKit CDN on save.
                    </p>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageBase64(null);
                        }}
                        className="text-[11px] text-rose-500 hover:underline mt-1 cursor-pointer block"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Basic Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Kaju Katli Special"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Sweets">Sweets</option>
                        <option value="Cakes & Bakery">Cakes & Bakery</option>
                        <option value="Snacks & Savories">Snacks & Savories</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Grocery & Staples">Grocery & Staples</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Brand *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sweet Delights"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Base Unit</label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Gram">Gram</option>
                    <option value="Piece">Piece</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Packet">Packet</option>
                    <option value="Box">Box</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Status</label>
                  <select
                    value={newProduct.status}
                    onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as any })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* 3. Barcode Generation Section */}
              <div className="bg-gray-50 p-3 rounded-[8px] border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-gray-700 text-[11px] font-medium flex items-center gap-1.5">
                    <Barcode className="w-3.5 h-3.5 text-[#6320EE]" />
                    <span>Product Barcode (EAN-13 Numeric Unique)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewProduct({ ...newProduct, barcode: generateNumericBarcode() })}
                    className="text-[10px] text-[#6320EE] hover:underline cursor-pointer"
                  >
                    Regenerate Code
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter manual 3rd party barcode or use auto-generated"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="w-full h-8 px-2.5 font-mono text-xs border border-gray-200 rounded-[8px] focus:outline-none focus:border-[#6320EE] bg-white"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Leave as auto-generated numeric barcode, or type existing 3rd-party product barcode manually.
                </p>
              </div>

              {/* 4. Variations Toggle Section */}
              <div className="border border-purple-100 rounded-[8px] p-3 bg-purple-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#6320EE]" />
                    <div>
                      <span className="font-medium text-gray-900 text-xs block">Product Variations</span>
                      <span className="text-[10px] text-gray-400">Enable for multiple sizes, weights, or flavors</span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={newProduct.hasVariations}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setNewProduct({
                        ...newProduct,
                        hasVariations: enabled,
                        variations: enabled && newProduct.variations.length === 0
                          ? [
                              {
                                id: `var_1`,
                                name: "Weight",
                                optionValue: "500g",
                                sellingPrice: Number(newProduct.sellingPrice) || 0,
                                costPrice: Number(newProduct.costPrice) || 0,
                                stock: 15,
                                bufferStock: 5,
                                barcode: generateNumericBarcode(),
                                status: "Active"
                              },
                              {
                                id: `var_2`,
                                name: "Weight",
                                optionValue: "1kg",
                                sellingPrice: Number(newProduct.sellingPrice) * 2 || 0,
                                costPrice: Number(newProduct.costPrice) * 2 || 0,
                                stock: 20,
                                bufferStock: 5,
                                barcode: generateNumericBarcode(),
                                status: "Active"
                              }
                            ]
                          : newProduct.variations
                      });
                    }}
                    className="w-4 h-4 rounded-[4px] border-gray-300 text-[#6320EE] focus:ring-[#6320EE] cursor-pointer"
                  />
                </div>

                {/* If Variations enabled */}
                {newProduct.hasVariations && (
                  <div className="space-y-3 pt-2 border-t border-purple-100">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[11px] text-gray-600 font-medium">Attribute:</span>
                        <select
                          value={newProduct.selectedVariationType}
                          onChange={(e) => setNewProduct({ ...newProduct, selectedVariationType: e.target.value })}
                          className="h-7.5 px-2 text-xs border border-gray-200 rounded-[8px] bg-white focus:outline-none focus:border-[#6320EE]"
                        >
                          {availableVariations.length > 0 ? (
                            availableVariations.map((v) => (
                              <option key={v.id} value={v.name}>
                                {v.name}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Weight">Weight / Mass</option>
                              <option value="Volume">Liquid Volume</option>
                              <option value="Pack Size">Pack Size</option>
                              <option value="Flavor">Flavor & Variant</option>
                            </>
                          )}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddVariationRow()}
                        className="h-7.5 px-2.5 rounded-[8px] text-[11px] font-medium bg-purple-100 text-[#6320EE] hover:bg-purple-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    {/* Variant items table */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {newProduct.variations.map((v, idx) => (
                        <div
                          key={v.id}
                          className="p-2.5 bg-white rounded-[8px] border border-purple-100 grid grid-cols-12 gap-2 items-center text-xs shadow-2xs"
                        >
                          <div className="col-span-3">
                            <input
                              type="text"
                              placeholder="e.g. 500g"
                              value={v.optionValue}
                              onChange={(e) => {
                                const copy = [...newProduct.variations];
                                copy[idx].optionValue = e.target.value;
                                setNewProduct({ ...newProduct, variations: copy });
                              }}
                              className="w-full h-7 px-2 border border-gray-200 rounded-[6px] text-xs focus:outline-none"
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="Sell ₹"
                              value={v.sellingPrice || ""}
                              onChange={(e) => {
                                const copy = [...newProduct.variations];
                                copy[idx].sellingPrice = parseFloat(e.target.value) || 0;
                                setNewProduct({ ...newProduct, variations: copy });
                              }}
                              className="w-full h-7 px-2 border border-gray-200 rounded-[6px] text-xs focus:outline-none"
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="Stock"
                              value={v.stock || ""}
                              onChange={(e) => {
                                const copy = [...newProduct.variations];
                                copy[idx].stock = parseFloat(e.target.value) || 0;
                                setNewProduct({ ...newProduct, variations: copy });
                              }}
                              className="w-full h-7 px-2 border border-gray-200 rounded-[6px] text-xs focus:outline-none"
                              required
                            />
                          </div>

                          <div className="col-span-4">
                            <input
                              type="text"
                              placeholder="Barcode (Auto)"
                              value={v.barcode}
                              onChange={(e) => {
                                const copy = [...newProduct.variations];
                                copy[idx].barcode = e.target.value;
                                setNewProduct({ ...newProduct, variations: copy });
                              }}
                              className="w-full h-7 px-2 font-mono text-[10px] border border-gray-200 rounded-[6px] focus:outline-none"
                              required
                            />
                          </div>

                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setNewProduct({
                                  ...newProduct,
                                  variations: newProduct.variations.filter((_, i) => i !== idx)
                                });
                              }}
                              className="text-gray-400 hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Non-variant Pricing & Stock (if variations disabled) */}
              {!newProduct.hasVariations && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">Selling Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProduct.sellingPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                      className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">Cost Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProduct.costPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                      className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">Initial Stock Level *</label>
                    <input
                      type="number"
                      step="1"
                      placeholder="0"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">Buffer / Low Stock Threshold</label>
                    <input
                      type="number"
                      step="1"
                      placeholder="5"
                      value={newProduct.bufferStock}
                      onChange={(e) => setNewProduct({ ...newProduct, bufferStock: e.target.value })}
                      className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[8px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="h-8 px-3.5 bg-[#6320EE] hover:bg-[#5219cd] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Product</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-[8px] max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-900 text-sm">Edit Product Details</h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3.5 text-xs font-normal">
              <div className="col-span-2">
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Selling Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.sellingPrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Stock Level</label>
                <input
                  type="number"
                  step="1"
                  value={editingProduct.stock}
                  onChange={(e) => {
                    const st = parseFloat(e.target.value) || 0;
                    setEditingProduct({
                      ...editingProduct,
                      stock: st,
                      status: st > 0 ? "Active" : "Out of Stock"
                    });
                  }}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2.5 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[8px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8 px-3.5 bg-[#6320EE] hover:bg-[#5219cd] text-white text-xs font-medium rounded-[8px] shadow-2xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>
  );
}
