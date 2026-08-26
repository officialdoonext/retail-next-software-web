"use client";

import React, { useState, useMemo } from "react";
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
  Filter,
  Download,
  Search,
  X,
  Check
} from "lucide-react";
import { Product, INITIAL_PRODUCTS } from "./ProductData";

interface ProductsTableProps {
  onAddProductClick?: () => void;
}

export default function ProductsTable({ onAddProductClick }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Product>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal States
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    sku: `PRD-00${products.length + 1}`,
    category: "Sweets",
    brand: "",
    unit: "Kg",
    sellingPrice: 0,
    costPrice: 0,
    stock: 0,
    status: "Active",
    addedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    image: "📦",
    imageBg: "bg-purple-100 text-purple-800"
  });

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (activeTab === "active" && item.status !== "Active") return false;
      if (activeTab === "inactive" && item.status !== "Out of Stock" && item.status !== "Inactive") return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q)
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

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts(products.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
    setEditingProduct(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Product = {
      id: String(Date.now()),
      name: newProduct.name || "New Product",
      sku: newProduct.sku || `PRD-00${products.length + 1}`,
      category: newProduct.category || "Grocery",
      brand: newProduct.brand || "General",
      unit: newProduct.unit || "Piece",
      sellingPrice: Number(newProduct.sellingPrice) || 0,
      costPrice: Number(newProduct.costPrice) || 0,
      stock: Number(newProduct.stock) || 0,
      status: Number(newProduct.stock) > 0 ? "Active" : "Out of Stock",
      addedOn: newProduct.addedOn || "26 May 2025",
      image: newProduct.image || "📦",
      imageBg: "bg-purple-100 text-purple-800"
    };

    setProducts([created, ...products]);
    setIsAddModalOpen(false);
    setNewProduct({
      name: "",
      sku: `PRD-00${products.length + 2}`,
      category: "Sweets",
      brand: "",
      unit: "Kg",
      sellingPrice: 0,
      costPrice: 0,
      stock: 0,
      status: "Active",
      addedOn: "26 May 2025",
      image: "📦",
      imageBg: "bg-purple-100 text-purple-800"
    });
  };

  const renderProductIcon = (item: Product) => {
    switch (item.name) {
      case "Milk Cake":
        return (
          <div className="w-8 h-8 rounded-[8px] bg-amber-900/10 border border-amber-900/20 flex items-center justify-center text-base shadow-2xs">
            🍰
          </div>
        );
      case "Gulab Jamun":
        return (
          <div className="w-8 h-8 rounded-[8px] bg-orange-950/10 border border-orange-950/20 flex items-center justify-center text-base shadow-2xs">
            🧆
          </div>
        );
      case "Rasgulla":
        return (
          <div className="w-8 h-8 rounded-[8px] bg-sky-100/50 border border-sky-200/60 flex items-center justify-center text-base shadow-2xs">
            ⚪
          </div>
        );
      case "Mysore Pak":
        return (
          <div className="w-8 h-8 rounded-[8px] bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-base shadow-2xs">
            🧇
          </div>
        );
      case "Badam Halwa":
        return (
          <div className="w-8 h-8 rounded-[8px] bg-amber-600/15 border border-amber-600/30 flex items-center justify-center text-base shadow-2xs">
            🍮
          </div>
        );
      case "Samosa":
        return (
          <div className="w-8 h-8 rounded-[8px] bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-base shadow-2xs">
            🥟
          </div>
        );
      case "Coca Cola 500ml":
        return (
          <div className="w-8 h-8 rounded-[8px] bg-red-600/15 border border-red-600/30 flex items-center justify-center text-base shadow-2xs">
            🥤
          </div>
        );
      case "Bisleri Water 1L":
        return (
          <div className="w-8 h-8 rounded-[8px] bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-base shadow-2xs">
            💧
          </div>
        );
      case "Aashirvaad Atta 1kg":
        return (
          <div className="w-8 h-8 rounded-[8px] bg-orange-600/15 border border-orange-600/30 flex items-center justify-center text-base shadow-2xs">
            🌾
          </div>
        );
      case "Sugar 1kg":
        return (
          <div className="w-8 h-8 rounded-[8px] bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-base shadow-2xs">
            🧂
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-[8px] bg-purple-50 border border-purple-200 flex items-center justify-center text-sm font-medium text-purple-700 shadow-2xs">
            {item.image || "📦"}
          </div>
        );
    }
  };

  return (
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
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2.5 h-7.5 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE] w-32 sm:w-40 text-gray-700 placeholder-gray-400 font-normal"
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
            Showing 1 to {filteredProducts.length} of 2,350 products
          </span>

          {/* Page size dropdown */}
          <div className="relative inline-block">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-200 rounded-[8px] h-7.5 pl-2.5 pr-6 text-xs font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:border-[#6320EE] cursor-pointer shadow-2xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
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
            {viewMode === "table" ? (
              <LayoutGrid className="w-3.5 h-3.5" />
            ) : (
              <List className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Add Product inline button with trigger ID */}
          <button
            id="add-product-table-trigger"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-7.5 px-2.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Product</span>
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

                <th
                  onClick={() => handleSort("name")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium"
                >
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("sku")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium"
                >
                  <div className="flex items-center gap-1">
                    <span>SKU</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("category")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("brand")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium"
                >
                  <div className="flex items-center gap-1">
                    <span>Brand</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("unit")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium"
                >
                  <div className="flex items-center gap-1">
                    <span>Unit</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("sellingPrice")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 text-right font-medium"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("costPrice")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 text-right font-medium"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost Price</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("stock")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 text-right font-medium"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Stock</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("status")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 text-center font-medium"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("addedOn")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium"
                >
                  <div className="flex items-center gap-1">
                    <span>Added On</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th className="py-2.5 px-3.5 text-center font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredProducts.map((item) => {
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
                        <span className="font-medium text-gray-900 hover:text-[#6320EE] cursor-pointer text-xs">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-2.5 px-2.5 font-normal text-gray-500 text-xs">
                      {item.sku}
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
                      ₹ {item.sellingPrice.toFixed(2)}
                    </td>

                    {/* Cost Price */}
                    <td className="py-2.5 px-2.5 font-normal text-gray-600 text-right text-xs">
                      ₹ {item.costPrice.toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="py-2.5 px-2.5 font-medium text-right text-xs">
                      <span className={isOutOfStock ? "text-rose-500" : "text-emerald-600"}>
                        {item.stock.toFixed(2)}
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
                      {item.addedOn}
                    </td>

                    {/* Compact Shopify Action Buttons */}
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
          {filteredProducts.map((item) => {
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
                      <span className="text-gray-400">Brand:</span>
                      <span className="font-medium text-gray-800">{item.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Selling Price:</span>
                      <span className="font-medium text-gray-900">₹ {item.sellingPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stock:</span>
                      <span className={`font-medium ${isOutOfStock ? "text-rose-500" : "text-emerald-600"}`}>
                        {item.stock.toFixed(2)} {item.unit}
                      </span>
                    </div>
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

      {/* Compact Pagination Footer matching Shopify Admin style */}
      <div className="p-3 sm:p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs text-gray-500 font-normal">
          Showing 1 to {filteredProducts.length} of 2,350 products
        </span>

        <div className="flex items-center gap-1 self-center sm:self-auto select-none">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronsLeft className="w-3 h-3" />
          </button>

          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>

          <button
            onClick={() => setCurrentPage(1)}
            className={`w-7 h-7 rounded-[8px] text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 1
                ? "bg-[#6320EE] text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            1
          </button>

          <button
            onClick={() => setCurrentPage(2)}
            className={`w-7 h-7 rounded-[8px] text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 2
                ? "bg-[#6320EE] text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            2
          </button>

          <button
            onClick={() => setCurrentPage(3)}
            className={`w-7 h-7 rounded-[8px] text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 3
                ? "bg-[#6320EE] text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            3
          </button>

          <button
            onClick={() => setCurrentPage(4)}
            className={`w-7 h-7 rounded-[8px] text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 4
                ? "bg-[#6320EE] text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            4
          </button>

          <button
            onClick={() => setCurrentPage(5)}
            className={`w-7 h-7 rounded-[8px] text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 5
                ? "bg-[#6320EE] text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            5
          </button>

          <span className="px-0.5 text-xs text-gray-400 font-medium">...</span>

          <button
            onClick={() => setCurrentPage(235)}
            className={`min-w-[28px] h-7 px-1.5 rounded-[8px] text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 235
                ? "bg-[#6320EE] text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            235
          </button>

          <button
            onClick={() => setCurrentPage(Math.min(235, currentPage + 1))}
            disabled={currentPage === 235}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setCurrentPage(235)}
            disabled={currentPage === 235}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronsRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                {renderProductIcon(viewingProduct)}
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{viewingProduct.name}</h3>
                  <span className="text-[11px] text-gray-400">{viewingProduct.sku}</span>
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
                <span className="font-medium text-gray-900 text-xs">₹ {viewingProduct.sellingPrice.toFixed(2)}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-[8px]">
                <span className="text-gray-400 block mb-0.5 text-[11px]">Cost Price</span>
                <span className="font-medium text-gray-900 text-xs">₹ {viewingProduct.costPrice.toFixed(2)}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-[8px]">
                <span className="text-gray-400 block mb-0.5 text-[11px]">Stock Level</span>
                <span className={`font-medium text-xs ${viewingProduct.stock > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {viewingProduct.stock.toFixed(2)} {viewingProduct.unit}
                </span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-[8px]">
                <span className="text-gray-400 block mb-0.5 text-[11px]">Status</span>
                <span className={`font-medium text-xs ${viewingProduct.status === "Active" ? "text-emerald-600" : "text-rose-500"}`}>
                  {viewingProduct.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setViewingProduct(null)}
                className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-[8px] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
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
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Category</label>
                <input
                  type="text"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Brand</label>
                <input
                  type="text"
                  value={editingProduct.brand}
                  onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
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
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Cost Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.costPrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Stock</label>
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

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Unit</label>
                <input
                  type="text"
                  value={editingProduct.unit}
                  onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
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

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProduct}
            className="bg-white rounded-[8px] max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Add New Product</h3>
                <p className="text-[11px] text-gray-400">Fill in the product and inventory details</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3.5 text-xs font-normal">
              <div className="col-span-2">
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kaju Katli"
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
                  <option value="Sweets">Sweets</option>
                  <option value="Cakes & Bakery">Cakes & Bakery</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Grocery">Grocery</option>
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
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Selling Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newProduct.sellingPrice || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
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
                  value={newProduct.costPrice || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Initial Stock *</label>
                <input
                  type="number"
                  step="1"
                  placeholder="0"
                  value={newProduct.stock || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: parseFloat(e.target.value) || 0 })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Unit *</label>
                <select
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                >
                  <option value="Kg">Kg</option>
                  <option value="Piece">Piece</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Packet">Packet</option>
                  <option value="Box">Box</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2.5 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[8px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8 px-3.5 bg-[#6320EE] hover:bg-[#5219cd] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
