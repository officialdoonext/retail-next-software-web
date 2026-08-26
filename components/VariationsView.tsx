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
  Sliders,
  Check,
  Package,
  Layers,
  Tag,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Variation, INITIAL_VARIATIONS } from "./VariationData";

export default function VariationsView() {
  const { apiFetch, activeBusiness } = useAuth();
  const [variations, setVariations] = useState<Variation[]>(INITIAL_VARIATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Variation>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [viewingVariation, setViewingVariation] = useState<Variation | null>(null);
  const [editingVariation, setEditingVariation] = useState<Variation | null>(null);

  // New Variation Form State
  const [newVariation, setNewVariation] = useState<{
    name: string;
    code: string;
    type: string;
    optionsText: string;
    categoriesText: string;
    description: string;
    status: 'Active' | 'Inactive';
  }>({
    name: "",
    code: "",
    type: "Weight",
    optionsText: "Small, Medium, Large",
    categoriesText: "Sweets, Cakes & Bakery",
    description: "",
    status: "Active"
  });

  const loadVariations = async () => {
    if (!activeBusiness) return;
    setIsLoading(true);
    try {
      const res = await apiFetch("/variations");
      if (res.data && res.data.length > 0) {
        setVariations(res.data);
      }
    } catch (err) {
      console.warn("Using local variations fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVariations();
  }, [activeBusiness]);

  const filteredVariations = useMemo(() => {
    return variations
      .filter((v) => {
        if (activeTab === "active" && v.status !== "Active") return false;
        if (activeTab === "inactive" && v.status !== "Inactive") return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            v.name.toLowerCase().includes(q) ||
            v.code.toLowerCase().includes(q) ||
            v.type.toLowerCase().includes(q) ||
            (v.options && v.options.some((opt) => opt.toLowerCase().includes(q)))
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
  }, [variations, activeTab, searchQuery, sortField, sortOrder]);

  const handleSort = (field: keyof Variation) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredVariations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVariations.map((v) => v.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteVariation = async (id: string) => {
    if (confirm("Are you sure you want to delete this variation?")) {
      try {
        await apiFetch(`/variations/${id}`, { method: "DELETE" });
      } catch {}
      setVariations(variations.filter((v) => v.id !== id));
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariation) return;
    setVariations(variations.map((v) => (v.id === editingVariation.id ? editingVariation : v)));
    setEditingVariation(null);
  };

  const handleCreateVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariation.name) return;

    const parsedOptions = newVariation.optionsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedCategories = newVariation.categoriesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await apiFetch("/variations", {
        method: "POST",
        body: JSON.stringify({
          ...newVariation,
          options: parsedOptions,
          applicableCategories: parsedCategories
        })
      });
      if (res.data) {
        setVariations([res.data, ...variations]);
      }
    } catch {
      const created: Variation = {
        id: `var-${Date.now()}`,
        name: newVariation.name || "New Variation",
        code: newVariation.code || `VAR-0${variations.length + 1}`,
        type: newVariation.type || "Custom",
        options: parsedOptions.length > 0 ? parsedOptions : ["Standard"],
        applicableCategories: parsedCategories.length > 0 ? parsedCategories : ["All Categories"],
        productCount: 0,
        status: newVariation.status,
        createdOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        description: newVariation.description || ""
      };
      setVariations([created, ...variations]);
    }

    setIsAddModalOpen(false);
    setNewVariation({
      name: "",
      code: "",
      type: "Weight",
      optionsText: "Small, Medium, Large",
      categoriesText: "Sweets, Cakes & Bakery",
      description: "",
      status: "Active"
    });
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Variation Name,Code,Type,Options,Linked Products,Status,Created On"]
        .concat(
          filteredVariations.map(
            (v) =>
              `"${v.name}","${v.code}","${v.type}","${(v.options || []).join(" | ")}",${v.productCount || 0},"${v.status}","${v.createdOn}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `variations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalAttributeCount = variations.reduce((sum, v) => sum + (v.options ? v.options.length : 0), 0);

  return (
    <div className="space-y-5">
      {/* Variations Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-medium text-gray-900 tracking-tight">Product Variations</h2>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            Configure product options such as weights, volumes, packaging, and custom attributes
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
            <span>Add Variation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Variations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[8px] p-4.5 border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE] shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400">Variation Types</span>
            <div className="text-xl font-medium text-gray-900 mt-0.5">{variations.length}</div>
            <span className="text-[10px] text-gray-400">Master attributes</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-4.5 border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[8px] bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400">Total Values</span>
            <div className="text-xl font-medium text-gray-900 mt-0.5">{totalAttributeCount}</div>
            <span className="text-[10px] text-gray-400">Configured options</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-4.5 border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[8px] bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400">Active Outlet</span>
            <div className="text-sm font-medium text-gray-900 mt-1 truncate max-w-[140px]">
              {activeBusiness?.name || "Main Store"}
            </div>
            <span className="text-[10px] text-gray-400">Current workspace</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-4.5 border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[8px] bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400">Most Used</span>
            <div className="text-sm font-medium text-gray-900 mt-1 truncate max-w-[140px]">
              Weight / Mass
            </div>
            <span className="text-[10px] text-gray-400">Metric variants</span>
          </div>
        </div>
      </div>

      {/* Main Variations Table */}
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
              All Variations
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
              Active Variations
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
              Inactive Variations
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
                placeholder="Search variation..."
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
              Showing {filteredVariations.length} variations
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
                      filteredVariations.length > 0 &&
                      selectedIds.length === filteredVariations.length
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
                    <span>Variation Name</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("code")}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-gray-900 font-medium"
                >
                  <div className="flex items-center gap-1">
                    <span>Code / Type</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>

                <th className="py-2.5 px-2.5 font-medium min-w-[220px]">Configured Values</th>

                <th className="py-2.5 px-2.5 font-medium">Applicable Groups</th>

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
              {filteredVariations.map((item) => {
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

                    {/* Name */}
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE] text-xs font-medium shadow-2xs">
                          <Sliders className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 hover:text-[#6320EE] cursor-pointer text-xs block">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-gray-400">{item.description || item.type}</span>
                        </div>
                      </div>
                    </td>

                    {/* Code & Type */}
                    <td className="py-2.5 px-2.5 text-xs text-gray-500 font-normal">
                      <span className="font-medium text-gray-700">{item.code}</span>
                      <span className="block text-[10px] text-gray-400">{item.type}</span>
                    </td>

                    {/* Options Badges */}
                    <td className="py-2.5 px-2.5">
                      <div className="flex flex-wrap gap-1">
                        {(item.options || []).map((opt, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-[8px] bg-purple-50/80 text-[#6320EE] border border-purple-100 text-[11px] font-medium"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Applicable Categories */}
                    <td className="py-2.5 px-2.5 text-xs text-gray-600 font-normal">
                      <span className="text-[11px] text-gray-500 line-clamp-1 max-w-[160px]">
                        {(item.applicableCategories || []).join(", ") || "All Categories"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2.5 text-center">
                      {item.status === "Active" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[8px] text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[8px] text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Created On */}
                    <td className="py-2.5 px-2.5 text-gray-500 whitespace-nowrap font-normal text-xs">
                      {item.createdOn || "26 May 2025"}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingVariation(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-[8px] text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingVariation(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-[8px] text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                          title="Edit Variation"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVariation(item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-[8px] text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Variation"
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
      </div>

      {/* View Variation Modal */}
      {viewingVariation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{viewingVariation.name}</h3>
                  <span className="text-[11px] text-gray-400">{viewingVariation.code}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingVariation(null)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-3.5 text-xs font-normal">
              <div>
                <span className="text-gray-400 block mb-1 text-[11px]">Configured Values ({(viewingVariation.options || []).length})</span>
                <div className="flex flex-wrap gap-1.5 bg-gray-50 p-2.5 rounded-[8px] border border-gray-100">
                  {(viewingVariation.options || []).map((opt, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white text-[#6320EE] border border-purple-100 rounded-[8px] font-medium text-xs shadow-2xs">
                      {opt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2.5 rounded-[8px]">
                  <span className="text-gray-400 block mb-0.5 text-[11px]">Attribute Type</span>
                  <span className="font-medium text-gray-900 text-xs">{viewingVariation.type}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-[8px]">
                  <span className="text-gray-400 block mb-0.5 text-[11px]">Status</span>
                  <span className="font-medium text-emerald-600 text-xs">{viewingVariation.status}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-[8px]">
                <span className="text-gray-400 block mb-0.5 text-[11px]">Applicable Categories</span>
                <p className="text-gray-700 text-xs">{(viewingVariation.applicableCategories || []).join(", ") || "All"}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setViewingVariation(null)}
                className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-[8px] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Variation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateVariation}
            className="bg-white rounded-[8px] max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Add New Variation</h3>
                <p className="text-[11px] text-gray-400">Save variation to active outlet</p>
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
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Variation Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Size / Pack Type"
                  value={newVariation.name}
                  onChange={(e) => setNewVariation({ ...newVariation, name: e.target.value })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Code</label>
                  <input
                    type="text"
                    placeholder="VAR-SZ"
                    value={newVariation.code}
                    onChange={(e) => setNewVariation({ ...newVariation, code: e.target.value })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Type</label>
                  <select
                    value={newVariation.type}
                    onChange={(e) => setNewVariation({ ...newVariation, type: e.target.value })}
                    className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  >
                    <option value="Weight">Weight</option>
                    <option value="Volume">Volume</option>
                    <option value="Pack Size">Pack Size</option>
                    <option value="Flavor">Flavor</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">
                  Options / Values (comma separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 250g, 500g, 1kg, 2kg"
                  value={newVariation.optionsText}
                  onChange={(e) => setNewVariation({ ...newVariation, optionsText: e.target.value })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">
                  Applicable Categories (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sweets, Cakes & Bakery"
                  value={newVariation.categoriesText}
                  onChange={(e) => setNewVariation({ ...newVariation, categoriesText: e.target.value })}
                  className="w-full h-8 px-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description..."
                  value={newVariation.description}
                  onChange={(e) => setNewVariation({ ...newVariation, description: e.target.value })}
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
                className="h-8 px-3.5 bg-[#6320EE] hover:bg-[#5219cd] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Variation</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
