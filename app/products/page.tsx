"use client";

import React, { useState } from "react";
import { Filter, Download, Plus, X } from "lucide-react";
import StatCards from "@/components/StatCards";
import ProductsTable from "@/components/ProductsTable";

export default function ProductsPage() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Page Title & Action Buttons Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-medium text-gray-900 tracking-tight">Products</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 font-normal">
            Manage all your products and inventory
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Filter Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 rounded-[8px] text-xs sm:text-sm font-medium text-gray-700 shadow-xs transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span>Filter</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.setAttribute(
                "href",
                "data:text/csv;charset=utf-8,Product Name,SKU,Category,Brand,Unit,Selling Price,Cost Price,Stock,Status\nMilk Cake,PRD-0001,Cakes & Bakery,Bakers World,Kg,600,420,25,Active\nGulab Jamun,PRD-0002,Sweets,Sweet Delights,Kg,400,280,18,Active\nRasgulla,PRD-0003,Sweets,Sweet Delights,Kg,380,250,0,Out of Stock"
              );
              link.setAttribute("download", "products_export.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 rounded-[8px] text-xs sm:text-sm font-medium text-gray-700 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export</span>
          </button>

          {/* + Add Product Button */}
          <button
            onClick={() => {
              const addBtn = document.querySelector("#add-product-btn-trigger") as HTMLButtonElement;
              if (addBtn) {
                addBtn.click();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Metric / KPI Cards */}
      <StatCards
        totalProducts={2350}
        lowStock={120}
        outOfStock={18}
        totalValue="25,68,450.00"
      />

      {/* Main Products Table */}
      <ProductsTable />

      {/* Quick Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-900 text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#6320EE]" />
                Filter Products
              </h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs font-normal">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Category</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]">
                  <option>All Categories</option>
                  <option>Cakes & Bakery</option>
                  <option>Sweets</option>
                  <option>Snacks</option>
                  <option>Beverages</option>
                  <option>Grocery</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Stock Status</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]">
                  <option>All Statuses</option>
                  <option>Active / In Stock</option>
                  <option>Out of Stock</option>
                  <option>Low Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Price (₹)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  />
                  <input
                    type="number"
                    placeholder="Max Price (₹)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[8px] cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-2 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-sm cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
