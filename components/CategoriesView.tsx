"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Download,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  FolderTree,
  Check,
  Package,
  Layers,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Category, INITIAL_CATEGORIES } from "./CategoryData";

export default function CategoriesView() {
  const { apiFetch, activeBusiness } = useAuth();
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Category>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number>(45);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // New Category State
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    code: "",
    parentCategory: "General",
    description: "",
    status: "Active",
    icon: "📁"
  });

  const loadCategories = async () => {
    if (!activeBusiness) return;
    setIsLoading(true);
    try {
      const res = await apiFetch("/categories");
      if (res.data && res.data.length > 0) {
        setCategories(res.data);
      }
    } catch (err) {
      console.warn("Using local categories fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [activeBusiness]);

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (activeTab === "active" && cat.status !== "Active") return false;
        if (activeTab === "inactive" && cat.status !== "Inactive") return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            cat.name.toLowerCase().includes(q) ||
            cat.code.toLowerCase().includes(q) ||
            (cat.slug && cat.slug.toLowerCase().includes(q)) ||
            cat.parentCategory.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
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
  }, [categories, activeTab, searchQuery, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, pageSize]);

  const handleSort = (field: keyof Category) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCategories.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await apiFetch(`/categories/${id}`, { method: "DELETE" });
      } catch {}
      setCategories(categories.filter((c) => c.id !== id));
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setCategories(categories.map((c) => (c.id === editingCategory.id ? editingCategory : c)));
    setEditingCategory(null);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify(newCategory)
      });
      if (res.data) {
        setCategories([res.data, ...categories]);
      }
    } catch {
      const created: Category = {
        id: `cat-${Date.now()}`,
        name: newCategory.name || "New Category",
        code: newCategory.code || `CAT-00${categories.length + 1}`,
        slug: (newCategory.name || "new-category").toLowerCase().replace(/\s+/g, "-"),
        parentCategory: newCategory.parentCategory || "General",
        description: newCategory.description || "Category description",
        status: (newCategory.status as "Active" | "Inactive") || "Active",
        icon: newCategory.icon || "📁",
        productCount: 0,
        createdOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      };
      setCategories([created, ...categories]);
    } finally {
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setNewCategory({
        name: "",
        code: "",
        parentCategory: "General",
        description: "",
        status: "Active",
        icon: "📁"
      });
    }
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Category Name,Code,Slug,Parent Category,Products Count,Status,Created On"]
        .concat(
          filteredCategories.map(
            (c) =>
              `"${c.name}","${c.code}","${c.slug || ''}","${c.parentCategory}",${c.productCount || 0},"${c.status}","${c.createdOn}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `categories_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalProductsCount = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Category Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-medium text-gray-900 tracking-tight">Categories</h2>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            Organize and classify your inventory catalog into structured categories
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50/70 rounded-[8px] text-xs font-medium text-gray-700 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[8px] p-4.5 border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE] shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400">Total Categories</span>
            <div className="text-xl font-medium text-gray-900 mt-0.5">{categories.length}</div>
            <span className="text-[10px] text-gray-400">All catalog groups</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-4.5 border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[8px] bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400">Active Categories</span>
            <div className="text-xl font-medium text-gray-900 mt-0.5">
              {categories.filter((c) => c.status === "Active").length}
            </div>
            <span className="text-[10px] text-gray-400">Currently visible</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-4.5 border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[8px] bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400">Linked Products</span>
            <div className="text-xl font-medium text-gray-900 mt-0.5">{totalProductsCount.toLocaleString("en-IN")}</div>
            <span className="text-[10px] text-gray-400">Classified items</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-4.5 border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[8px] bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400">Active Outlet</span>
            <div className="text-sm font-medium text-gray-900 mt-1 truncate max-w-[140px]">
              {activeBusiness?.name || "Main Store"}
            </div>
            <span className="text-[10px] text-gray-400">Current workspace</span>
          </div>
        </div>
      </div>

      {/* Main Categories Table */}
      <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Top Filter Tabs & Search */}
        <div className="p-3.5 sm:p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-5 border-b md:border-b-0 border-gray-100 pb-1.5 md:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-1 text-xs font-medium transition-all relative cursor-pointer ${
                activeTab === "all" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              All Categories
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
              Active Categories
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
              Inactive Categories
              {activeTab === "inactive" && (
                <span className="absolute -bottom-1.5 md:-bottom-4 left-0 right-0 h-0.5 bg-[#6320EE] rounded-[8px]" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-2.5 h-7.5 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE] w-36 sm:w-44 text-gray-700 placeholder-gray-400 font-normal"
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
              Showing {filteredCategories.length} categories
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#FAFAFC] text-[11px] font-medium text-gray-600 uppercase tracking-wider select-none">
                <th className="py-2.5 px-3.5 w-9 text-center font-medium">
                  <input
                    type="checkbox"
                    checked={
                      filteredCategories.length > 0 &&
                      selectedIds.length === filteredCategories.length
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
                    <span>Category Name</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("code")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium"
                >
                  <div className="flex items-center gap-1">
                    <span>Code</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("parentCategory")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium"
                >
                  <div className="flex items-center gap-1">
                    <span>Parent Group</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th className="py-2.5 px-2.5 font-medium">Description</th>

                <th
                  onClick={() => handleSort("productCount")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 text-right font-medium"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Linked Items</span>
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
                  onClick={() => handleSort("createdOn")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium"
                >
                  <div className="flex items-center gap-1">
                    <span>Created On</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th className="py-2.5 px-3.5 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#6320EE] animate-spin mx-auto mb-2" />
                    <span className="text-xs font-medium text-gray-600 block">Loading categories...</span>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No categories found. Click "+ Add Category" to create one.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-gray-50/70 ${
                        isSelected ? "bg-purple-50/40" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-3.5 h-3.5 rounded-[4px] border-gray-300 text-[#6320EE] focus:ring-[#6320EE] cursor-pointer"
                        />
                      </td>

                      {/* Category Name */}
                      <td className="py-2.5 px-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-[6px] bg-purple-50 text-[#6320EE] flex items-center justify-center text-xs font-bold shrink-0">
                            {item.icon || "📁"}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 text-xs block hover:text-[#6320EE] cursor-pointer">
                              {item.name}
                            </span>
                            {item.slug && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                /{item.slug}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Code */}
                      <td className="py-2.5 px-2.5 font-mono text-gray-500 font-normal text-xs">
                        {item.code}
                      </td>

                      {/* Parent Category */}
                      <td className="py-2.5 px-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-medium bg-gray-100 text-gray-700">
                          <FolderTree className="w-2.5 h-2.5 text-gray-500" />
                          <span>{item.parentCategory}</span>
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-2.5 px-2.5 text-gray-500 font-normal text-xs max-w-[200px] truncate">
                        {item.description || "-"}
                      </td>

                      {/* Linked Items Count */}
                      <td className="py-2.5 px-2.5 text-right font-medium text-gray-900 text-xs">
                        {item.productCount}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-medium ${
                            item.status === "Active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Created On */}
                      <td className="py-2.5 px-2.5 text-gray-500 whitespace-nowrap font-normal text-xs">
                        {item.createdOn || "26 May 2025"}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingCategory(item)}
                            className="w-7 h-7 flex items-center justify-center rounded-[8px] text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCategory(item)}
                            className="w-7 h-7 flex items-center justify-center rounded-[8px] text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(item.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-[8px] text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-gray-500 font-normal">
            Showing {filteredCategories.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredCategories.length)} of {filteredCategories.length} categories (Page {currentPage} of {totalPages})
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
      </div>

      {/* View Category Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-base">
                  {viewingCategory.icon || "📁"}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{viewingCategory.name}</h3>
                  <span className="text-[11px] text-gray-400">{viewingCategory.code}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingCategory(null)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-3.5 text-xs font-normal">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2.5 rounded-[8px]">
                  <span className="text-gray-400 block mb-0.5 text-[11px]">Parent Group</span>
                  <span className="font-medium text-gray-900 text-xs">{viewingCategory.parentCategory || "General"}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-[8px]">
                  <span className="text-gray-400 block mb-0.5 text-[11px]">Linked Products</span>
                  <span className="font-medium text-emerald-600 text-xs">{viewingCategory.productCount || 0} items</span>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-[8px]">
                <span className="text-gray-400 block mb-0.5 text-[11px]">Description</span>
                <p className="text-gray-700 text-xs leading-relaxed">{viewingCategory.description || "No description provided."}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setViewingCategory(null)}
                className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-[8px] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCategory}
            className="bg-white rounded-[8px] max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Add New Category</h3>
                <p className="text-[11px] text-gray-400">Save category to active outlet</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-3.5 text-xs font-normal">
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dry Fruits & Nuts"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Category Code</label>
                  <input
                    type="text"
                    placeholder="CAT-009"
                    value={newCategory.code}
                    onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Icon Emoji</label>
                  <input
                    type="text"
                    placeholder="🥜"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Parent Group</label>
                  <input
                    type="text"
                    placeholder="Gourmet"
                    value={newCategory.parentCategory}
                    onChange={(e) => setNewCategory({ ...newCategory, parentCategory: e.target.value })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Status</label>
                  <select
                    value={newCategory.status}
                    onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value as "Active" | "Inactive" })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of this category..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                />
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
                disabled={isSubmitting}
                className="h-8 px-3.5 bg-[#6320EE] hover:bg-[#5219cd] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
