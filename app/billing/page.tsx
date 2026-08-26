"use client";

import React, { useState, useEffect } from "react";
import { Barcode, LayoutGrid, Receipt, Loader2, Store } from "lucide-react";
import BarcodeBillingView from "@/components/BarcodeBillingView";
import ItemBillingView from "@/components/ItemBillingView";
import { Product } from "@/components/ProductData";
import { Category } from "@/components/CategoryData";
import { useAuth } from "@/context/AuthContext";

export default function BillingPage() {
  const { apiFetch, activeBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState<"barcode" | "item">("barcode");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch live products and categories from Firebase Firestore
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          apiFetch("/products"),
          apiFetch("/categories")
        ]);

        if (isMounted) {
          if (prodRes.success && prodRes.data) {
            setProducts(prodRes.data);
          }
          if (catRes.success && catRes.data) {
            setCategories(catRes.data);
          }
        }
      } catch (err) {
        console.warn("Billing data fetch note:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [apiFetch, activeBusiness, refreshKey]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 space-y-4">
      
      {/* Top Segmented Tab Switcher */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5 gap-4 flex-wrap">
        <div className="inline-flex items-center p-1 bg-gray-100/80 rounded-[8px] border border-gray-200/60">
          
          {/* Tab 1: Barcode Billing */}
          <button
            type="button"
            onClick={() => setActiveTab("barcode")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
              activeTab === "barcode"
                ? "bg-white text-[#6320EE] shadow-2xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <Barcode className={`w-3.5 h-3.5 ${activeTab === "barcode" ? "text-[#6320EE]" : "text-gray-400"}`} />
            <span>Barcode Billing</span>
          </button>

          {/* Tab 2: Item Billing */}
          <button
            type="button"
            onClick={() => setActiveTab("item")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
              activeTab === "item"
                ? "bg-white text-[#6320EE] shadow-2xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <LayoutGrid className={`w-3.5 h-3.5 ${activeTab === "item" ? "text-[#6320EE]" : "text-gray-400"}`} />
            <span>Item Billing (Touch POS)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeBusiness && (
            <div className="text-[11px] text-gray-500 font-normal flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-[6px] border border-gray-200/80">
              <Store className="w-3 h-3 text-[#6320EE]" />
              <span className="font-medium text-gray-800">{activeBusiness.name}</span>
              <span className="text-gray-400">• {products.length} Items loaded</span>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-[8px] border border-gray-100">
          <Loader2 className="w-6 h-6 text-[#6320EE] animate-spin" />
          <p className="text-xs text-gray-400 font-medium">Loading store billing terminal & live inventory...</p>
        </div>
      ) : (
        <>
          {activeTab === "barcode" && (
            <BarcodeBillingView
              products={products}
              onInvoiceCreated={() => setRefreshKey((k) => k + 1)}
            />
          )}

          {activeTab === "item" && (
            <ItemBillingView
              products={products}
              categories={categories}
              onInvoiceCreated={() => setRefreshKey((k) => k + 1)}
            />
          )}
        </>
      )}

    </div>
  );
}
