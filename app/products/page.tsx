"use client";

import React, { useState } from "react";
import { Package, FolderTree, Sliders, Filter, Download, Plus } from "lucide-react";
import StatCards from "@/components/StatCards";
import ProductsTable from "@/components/ProductsTable";
import CategoriesView from "@/components/CategoriesView";
import VariationsView from "@/components/VariationsView";

export default function ProductsPage() {
  const [activeMainTab, setActiveMainTab] = useState<"products" | "categories" | "variations">("products");

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 sm:py-7 space-y-6">
      
      {/* Top Segmented Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-3 gap-4 flex-wrap">
        <div className="inline-flex items-center p-1 bg-gray-100/80 rounded-[8px] border border-gray-200/60">
          <button
            onClick={() => setActiveMainTab("products")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
              activeMainTab === "products"
                ? "bg-white text-[#6320EE] shadow-2xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <Package className={`w-3.5 h-3.5 ${activeMainTab === "products" ? "text-[#6320EE]" : "text-gray-400"}`} />
            <span>Products</span>
          </button>

          <button
            onClick={() => setActiveMainTab("categories")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
              activeMainTab === "categories"
                ? "bg-white text-[#6320EE] shadow-2xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <FolderTree className={`w-3.5 h-3.5 ${activeMainTab === "categories" ? "text-[#6320EE]" : "text-gray-400"}`} />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveMainTab("variations")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
              activeMainTab === "variations"
                ? "bg-white text-[#6320EE] shadow-2xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <Sliders className={`w-3.5 h-3.5 ${activeMainTab === "variations" ? "text-[#6320EE]" : "text-gray-400"}`} />
            <span>Variations</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-400 font-normal">
          {activeMainTab === "products" && "Viewing All Products & Stock"}
          {activeMainTab === "categories" && "Viewing Classification Categories"}
          {activeMainTab === "variations" && "Viewing Configured Product Options"}
        </div>
      </div>

      {/* Tab 1: Products */}
      {activeMainTab === "products" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-medium text-gray-900 tracking-tight">Products</h1>
              <p className="text-xs text-gray-400 mt-0.5 font-normal">
                Manage all your products and inventory
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
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
                className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50/70 rounded-[8px] text-xs font-medium text-gray-700 shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>Export</span>
              </button>

              <button
                onClick={() => {
                  // Trigger add modal inside ProductsTable
                  const addTrigger = document.querySelector("#add-product-table-trigger") as HTMLButtonElement;
                  if (addTrigger) {
                    addTrigger.click();
                  }
                }}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <StatCards
            totalProducts={2350}
            lowStock={120}
            outOfStock={18}
            totalValue="25,68,450.00"
          />

          {/* Main Products Table */}
          <ProductsTable />
        </div>
      )}

      {/* Tab 2: Categories */}
      {activeMainTab === "categories" && (
        <div className="animate-in fade-in duration-150">
          <CategoriesView />
        </div>
      )}

      {/* Tab 3: Variations */}
      {activeMainTab === "variations" && (
        <div className="animate-in fade-in duration-150">
          <VariationsView />
        </div>
      )}

    </div>
  );
}
