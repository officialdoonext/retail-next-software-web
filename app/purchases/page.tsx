"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  Receipt,
  Store,
  Printer,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Trash2,
  Package,
  Layers,
  CheckSquare,
  Square,
  Clock,
  ArrowRight,
  Maximize2,
  Minimize2,
  FileText
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePrinter } from "@/context/PrinterContext";
import * as XLSX from "xlsx";

export interface PurchaseOrderItem {
  productId: string;
  variationId?: string;
  name: string;
  variationName?: string;
  unit: string;
  costPrice: number;
  quantity: number;
  total: number;
  received?: boolean;
  receivedQty?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  vendorCity: string;
  vendorAddress: string;
  vendorGstin?: string;
  orderDate: string;
  referenceNo?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  status: "Pending" | "Partially Received" | "Received";
  receivedDate?: string;
  notes?: string;
  createdAt: string;
}

export default function PurchasesPage() {
  const { apiFetch, activeBusiness } = useAuth();
  const { printCustomReceipt } = usePrinter();

  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(45);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fullscreen Add PO Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingPO, setIsSubmittingPO] = useState(false);

  // PO Form State
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNo, setReferenceNo] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([]);
  const [poInitialStatus, setPoInitialStatus] = useState<"Pending" | "Received">("Pending");

  // Selected item row input in modal
  const [selectedProdId, setSelectedProdId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemCost, setItemCost] = useState<number>(0);
  const [itemUnit, setItemUnit] = useState<string>("Kg");

  // View PO Modal State
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

  // "Update Received" Checklist Modal State
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [receivedChecklist, setReceivedChecklist] = useState<{ [index: number]: { checked: boolean; qty: number } }>({});
  const [isUpdatingReceived, setIsUpdatingReceived] = useState(false);

  // Toast
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [poRes, vendRes, prodRes] = await Promise.allSettled([
        apiFetch("/purchases"),
        apiFetch("/vendors"),
        apiFetch("/products")
      ]);

      if (vendRes.status === "fulfilled" && vendRes.value.data) {
        setVendors(vendRes.value.data);
      }
      if (prodRes.status === "fulfilled" && prodRes.value.data) {
        setProducts(prodRes.value.data);
      }

      if (poRes.status === "fulfilled" && poRes.value.data && poRes.value.data.length > 0) {
        setPurchases(poRes.value.data);
      } else {
        // Sample fallback POs
        const samplePOs: PurchaseOrder[] = [
          {
            id: "po_101",
            poNumber: "PO-2026-0089",
            vendorId: "vend_1",
            vendorName: "Shree Ganesh Agro Supplies",
            vendorPhone: "9848012345",
            vendorCity: "Nellore",
            vendorAddress: "APMC Market Yard, Podalakur Road",
            orderDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
            referenceNo: "INV-AGRO-7721",
            items: [
              {
                productId: "prod_1",
                name: "Superior Basmati Rice 5kg",
                unit: "Kg",
                costPrice: 85,
                quantity: 40,
                total: 3400,
                received: true,
                receivedQty: 40
              },
              {
                productId: "prod_2",
                name: "Toor Dal Desi Premium",
                unit: "Kg",
                costPrice: 120,
                quantity: 50,
                total: 6000,
                received: true,
                receivedQty: 50
              }
            ],
            subtotal: 9400,
            tax: 0,
            grandTotal: 9400,
            status: "Received",
            receivedDate: new Date(Date.now() - 1 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
          },
          {
            id: "po_102",
            poNumber: "PO-2026-0090",
            vendorId: "vend_2",
            vendorName: "Amul & Mother Dairy Distributors",
            vendorPhone: "9440198765",
            vendorCity: "Vijayawada",
            vendorAddress: "Auto Nagar Industrial Area",
            orderDate: new Date().toISOString().slice(0, 10),
            referenceNo: "DC-AMUL-9901",
            items: [
              {
                productId: "prod_3",
                name: "Pasteurised Table Butter Salted 500g",
                unit: "Packet",
                costPrice: 240,
                quantity: 30,
                total: 7200,
                received: false,
                receivedQty: 0
              },
              {
                productId: "prod_4",
                name: "Fresh Malai Paneer 200g",
                unit: "Packet",
                costPrice: 80,
                quantity: 45,
                total: 3600,
                received: false,
                receivedQty: 0
              }
            ],
            subtotal: 10800,
            tax: 0,
            grandTotal: 10800,
            status: "Pending",
            createdAt: new Date().toISOString()
          }
        ];
        setPurchases(samplePOs);
      }
    } catch (err) {
      console.warn("Using sample PO data fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeBusiness]);

  // When selected product changes in modal, auto-fill unit and cost
  useEffect(() => {
    if (!selectedProdId) {
      setItemCost(0);
      setItemUnit("Kg");
      setSelectedVariantId("");
      return;
    }
    const prod = products.find((p) => p.id === selectedProdId);
    if (prod) {
      setItemUnit(prod.unit || "Kg");
      setItemCost(Number(prod.costPrice) || 0);
      if (prod.hasVariations && prod.variations && prod.variations.length > 0) {
        setSelectedVariantId(prod.variations[0].id);
        setItemCost(Number(prod.variations[0].costPrice) || Number(prod.costPrice) || 0);
      } else {
        setSelectedVariantId("");
      }
    }
  }, [selectedProdId, products]);

  // When variant changes, update cost
  const handleVariantChange = (vId: string) => {
    setSelectedVariantId(vId);
    const prod = products.find((p) => p.id === selectedProdId);
    if (prod && prod.variations) {
      const v = prod.variations.find((x: any) => x.id === vId);
      if (v) {
        setItemCost(Number(v.costPrice) || Number(prod.costPrice) || 0);
      }
    }
  };

  // Add Item to Current PO
  const handleAddItemToPO = () => {
    if (!selectedProdId) return;
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    let variantName = "";
    if (selectedVariantId && prod.variations) {
      const v = prod.variations.find((x: any) => x.id === selectedVariantId);
      if (v) variantName = `${v.name || 'Option'}: ${v.optionValue || ''}`;
    }

    const newItem: PurchaseOrderItem = {
      productId: prod.id,
      variationId: selectedVariantId || undefined,
      name: prod.name,
      variationName: variantName || undefined,
      unit: itemUnit || prod.unit || "Kg",
      costPrice: Number(itemCost) || 0,
      quantity: Number(itemQty) || 1,
      total: (Number(itemCost) || 0) * (Number(itemQty) || 1),
      received: false,
      receivedQty: 0
    };

    setPoItems([...poItems, newItem]);
    setSelectedProdId("");
    setSelectedVariantId("");
    setItemQty(10);
    setItemCost(0);
  };

  const handleRemovePOItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  // Calculate PO Totals
  const poSubtotal = useMemo(() => {
    return poItems.reduce((sum, it) => sum + (it.total || 0), 0);
  }, [poItems]);

  const poGrandTotal = poSubtotal;

  // Submit New Purchase Order
  const handleCreatePurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) {
      alert("Please select a vendor supplier.");
      return;
    }
    if (poItems.length === 0) {
      alert("Please add at least one product item to the purchase order.");
      return;
    }

    const vendor = vendors.find((v) => v.id === selectedVendorId);
    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: selectedVendorId,
      vendorName: vendor ? vendor.name : "Supplier",
      vendorPhone: vendor ? vendor.phone : "",
      vendorCity: vendor ? vendor.city : "",
      vendorAddress: vendor ? vendor.address : "",
      vendorGstin: vendor?.gstin,
      orderDate: poDate,
      referenceNo: referenceNo.trim() || undefined,
      items: poItems.map((it) => ({
        ...it,
        received: poInitialStatus === "Received",
        receivedQty: poInitialStatus === "Received" ? it.quantity : 0
      })),
      subtotal: poSubtotal,
      tax: 0,
      grandTotal: poGrandTotal,
      status: poInitialStatus,
      receivedDate: poInitialStatus === "Received" ? new Date().toISOString() : undefined,
      notes: poNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    setIsSubmittingPO(true);
    try {
      try {
        await apiFetch("/purchases", {
          method: "POST",
          body: JSON.stringify(newPO)
        });
      } catch {}

      // If initial status was "Received", immediately update product stock in database!
      if (poInitialStatus === "Received") {
        for (const it of newPO.items) {
          try {
            await apiFetch(`/products/${it.productId}/stock`, {
              method: "POST",
              body: JSON.stringify({
                quantity: it.quantity,
                variationId: it.variationId,
                action: "add",
                reason: `PO Order ${newPO.poNumber}`
              })
            });
          } catch {}
        }
      }

      setPurchases([newPO, ...purchases]);
      setIsAddModalOpen(false);
      setSuccessMsg(`Purchase Order ${newPO.poNumber} created successfully!`);
      setTimeout(() => setSuccessMsg(null), 3500);

      // Reset form
      setSelectedVendorId("");
      setReferenceNo("");
      setPoNotes("");
      setPoItems([]);
      setPoInitialStatus("Pending");
    } catch (err: any) {
      alert("Failed to save Purchase Order: " + err.message);
    } finally {
      setIsSubmittingPO(false);
    }
  };

  // Open "Update Received" Checklist Modal
  const handleOpenReceivedModal = (po: PurchaseOrder) => {
    setReceivingPO(po);
    const initialChecklist: { [index: number]: { checked: boolean; qty: number } } = {};
    po.items.forEach((item, idx) => {
      initialChecklist[idx] = {
        checked: true, // all checked by default
        qty: item.quantity
      };
    });
    setReceivedChecklist(initialChecklist);
  };

  // Confirm "Update Received" & Auto-Add Stock to Products
  const handleConfirmReceived = async () => {
    if (!receivingPO) return;
    setIsUpdatingReceived(true);

    try {
      const updatedItems = receivingPO.items.map((it, idx) => {
        const itemState = receivedChecklist[idx] || { checked: true, qty: it.quantity };
        const isRec = itemState.checked;
        const recQty = isRec ? (Number(itemState.qty) || it.quantity) : 0;
        return {
          ...it,
          received: isRec,
          receivedQty: recQty
        };
      });

      const allReceived = updatedItems.every((it) => it.received && it.receivedQty === it.quantity);
      const noneReceived = updatedItems.every((it) => !it.received || it.receivedQty === 0);
      const newStatus: "Pending" | "Partially Received" | "Received" = allReceived
        ? "Received"
        : noneReceived
        ? "Pending"
        : "Partially Received";

      // 1. Update Stock in database for all newly received items
      for (const it of updatedItems) {
        if (it.received && it.receivedQty && it.receivedQty > 0) {
          try {
            await apiFetch(`/products/${it.productId}/stock`, {
              method: "POST",
              body: JSON.stringify({
                quantity: it.receivedQty,
                variationId: it.variationId,
                action: "add",
                reason: `PO Received ${receivingPO.poNumber}`
              })
            });
          } catch (e) {
            console.warn("Stock sync error:", e);
          }
        }
      }

      // 2. Save Updated PO
      const updatedPO: PurchaseOrder = {
        ...receivingPO,
        items: updatedItems,
        status: newStatus,
        receivedDate: newStatus === "Received" ? new Date().toISOString() : receivingPO.receivedDate
      };

      try {
        await apiFetch(`/purchases/${receivingPO.id}`, {
          method: "PUT",
          body: JSON.stringify(updatedPO)
        });
      } catch {}

      setPurchases(purchases.map((p) => (p.id === receivingPO.id ? updatedPO : p)));
      setReceivingPO(null);
      setSuccessMsg(`Stock updated! Received items from ${receivingPO.poNumber} added to inventory.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert("Failed to update received items: " + err.message);
    } finally {
      setIsUpdatingReceived(false);
    }
  };

  // Print PO Voucher Slip
  const handlePrintPO = (po: PurchaseOrder) => {
    printCustomReceipt({
      storeName: activeBusiness?.name || "Retail Store",
      storeAddress: activeBusiness?.address || activeBusiness?.city || "India",
      storePhone: activeBusiness?.ownerName || "",
      invoiceNo: po.poNumber,
      date: new Date(po.orderDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      customer: {
        name: `SUPPLIER: ${po.vendorName}`,
        phone: po.vendorPhone,
        city: po.vendorCity
      },
      items: po.items.map((it) => ({
        name: `${it.name}${it.variationName ? ` (${it.variationName})` : ''}`,
        qty: it.quantity,
        price: it.costPrice,
        total: it.total
      })),
      subtotal: po.subtotal,
      discount: 0,
      tax: po.tax,
      grandTotal: po.grandTotal,
      paidAmount: po.grandTotal,
      changeAmount: 0,
      paymentMode: "PURCHASE ORDER",
      footerMessage: "PURCHASE ORDER VOUCHER - OFFICIAL PROCUREMENT"
    });
  };

  // Filtered & Paginated POs
  const filteredPOs = useMemo(() => {
    return purchases.filter((po) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        po.poNumber.toLowerCase().includes(q) ||
        po.vendorName.toLowerCase().includes(q) ||
        po.vendorPhone.includes(q) ||
        (po.referenceNo && po.referenceNo.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && po.status === "Pending") ||
        (statusFilter === "received" && po.status === "Received") ||
        (statusFilter === "partial" && po.status === "Partially Received");

      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPOs.length / pageSize));
  const paginatedPOs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPOs.slice(start, start + pageSize);
  }, [filteredPOs, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  const handleExportExcel = () => {
    if (purchases.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(
      purchases.map((p) => ({
        "PO Number": p.poNumber,
        "Vendor Name": p.vendorName,
        "Vendor Mobile": p.vendorPhone,
        "Order Date": p.orderDate,
        "Reference No": p.referenceNo || "N/A",
        "Total Items": p.items.length,
        "Grand Total (₹)": p.grandTotal,
        "Status": p.status,
        "Received Date": p.receivedDate ? new Date(p.receivedDate).toLocaleDateString("en-IN") : "N/A"
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Orders");
    XLSX.writeFile(wb, `Purchases_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // KPI Calculations
  const totalOrdersCount = purchases.length;
  const pendingCount = purchases.filter((p) => p.status === "Pending").length;
  const receivedCount = purchases.filter((p) => p.status === "Received").length;
  const totalPurchaseValue = purchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);

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
            <ShoppingBag className="w-5 h-5 text-[#6320EE]" />
            <span>Purchase Orders & Procurement</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            Create vendor purchase orders, receive supplier stock, and track procurement costs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="h-8.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[8px] text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => {
              setPoItems([]);
              setSelectedVendorId(vendors[0]?.id || "");
              setReferenceNo("");
              setPoNotes("");
              setPoDate(new Date().toISOString().slice(0, 10));
              setPoInitialStatus("Pending");
              setIsAddModalOpen(true);
            }}
            className="h-8.5 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Purchase</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Purchase Orders</span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">{totalOrdersCount} POs</h3>
            <span className="text-[10px] text-gray-400 font-normal">Lifetime procurement</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-purple-50 text-[#6320EE] flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Pending Orders</span>
            <h3 className="text-base font-bold text-amber-600 mt-0.5">{pendingCount} Pending</h3>
            <span className="text-[10px] text-gray-400 font-normal">Awaiting delivery</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Received & Fulfilled</span>
            <h3 className="text-base font-bold text-emerald-600 mt-0.5">{receivedCount} Received</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Stock added to inventory</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Procurement Cost</span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">₹ {totalPurchaseValue.toLocaleString("en-IN")}</h3>
            <span className="text-[10px] text-gray-400 font-normal">Across all suppliers</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-2xs overflow-hidden">
        
        {/* Search & Status Tabs */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PO number, supplier name, phone, invoice ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8.5 pr-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-[8px] border border-gray-200/60">
            {[
              { id: "all", label: "All Orders" },
              { id: "pending", label: "Pending" },
              { id: "received", label: "Received" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white text-[#6320EE] shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Purchases Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3.5 text-center w-12">#</th>
                <th className="py-2.5 px-3">PO Number</th>
                <th className="py-2.5 px-3">Supplier / Vendor</th>
                <th className="py-2.5 px-3">Order Date</th>
                <th className="py-2.5 px-3 text-center">Items Qty</th>
                <th className="py-2.5 px-3 text-right">Grand Total</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-36">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#6320EE] animate-spin mx-auto mb-2" />
                    <span className="text-xs font-medium text-gray-600 block">Loading purchase orders...</span>
                  </td>
                </tr>
              ) : filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <p className="font-medium text-gray-800 text-xs">No purchase orders found</p>
                      <p className="text-[11px] text-gray-400">
                        Click &apos;Add Purchase&apos; above to create and track your supplier procurement orders.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPOs.map((po, idx) => {
                  const totalUnits = po.items.reduce((sum, it) => sum + (it.quantity || 0), 0);

                  return (
                    <tr key={po.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2.5 px-3.5 text-center text-gray-400 font-medium">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      {/* PO Number */}
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-gray-900 font-mono block">{po.poNumber}</span>
                        {po.referenceNo && (
                          <span className="text-[10px] text-gray-400 font-mono">Ref: {po.referenceNo}</span>
                        )}
                      </td>

                      {/* Vendor */}
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-gray-900 block">{po.vendorName}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                          <Phone className="w-2.5 h-2.5" /> +91 {po.vendorPhone}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-600">
                        {new Date(po.orderDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>

                      {/* Items */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-medium text-gray-900">{po.items.length} items</span>
                        <span className="text-[10px] text-gray-400 block">({totalUnits} units)</span>
                      </td>

                      {/* Total */}
                      <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                        ₹ {Number(po.grandTotal || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            po.status === "Received"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : po.status === "Partially Received"
                              ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                              : "bg-amber-50 text-amber-700 border border-amber-200/60"
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Received Button */}
                          {po.status !== "Received" ? (
                            <button
                              onClick={() => handleOpenReceivedModal(po)}
                              className="h-7 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-[6px] text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                              title="Mark Items Received & Add Stock"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Received</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenReceivedModal(po)}
                              className="h-7 px-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-[6px] text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                              title="View Received Checklist"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Received</span>
                            </button>
                          )}

                          {/* View PO */}
                          <button
                            onClick={() => setViewingPO(po)}
                            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-500 hover:text-[#6320EE] hover:bg-purple-50 cursor-pointer"
                            title="View Purchase Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Print PO */}
                          <button
                            onClick={() => handlePrintPO(po)}
                            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-500 hover:text-[#6320EE] hover:bg-purple-50 cursor-pointer"
                            title="Print PO Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
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
            Showing {filteredPOs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPOs.length)} of {filteredPOs.length} purchase orders (Page {currentPage} of {totalPages})
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

      {/* FULLSCREEN ADD PURCHASE ORDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in zoom-in duration-150">
          
          {/* Top Bar */}
          <div className="h-14 px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">New Purchase Order (Procurement)</h2>
                <p className="text-[11px] text-gray-400">Add products from your supplier and manage inventory procurement</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8.5 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[8px] cursor-pointer"
              >
                Cancel / Close
              </button>
              <button
                type="button"
                onClick={handleCreatePurchaseOrder}
                disabled={isSubmittingPO || poItems.length === 0}
                className="h-8.5 px-5 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPO ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save Purchase Order</span>
              </button>
            </div>
          </div>

          {/* Modal Body: Two-Column Form */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FD]">
            <div className="max-w-[1400px] mx-auto space-y-5">
              
              {/* Order Metadata Row */}
              <div className="bg-white p-4 rounded-[8px] border border-gray-200/70 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                
                {/* 1. Vendor Picker */}
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Select Vendor / Supplier *</label>
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white font-medium text-gray-900"
                    required
                  >
                    <option value="">-- Choose Supplier --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. PO Date */}
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Order Date *</label>
                  <input
                    type="date"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white font-medium text-gray-900"
                    required
                  />
                </div>

                {/* 3. Reference Invoice / DC Number */}
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Vendor Invoice / DC Number</label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. INV-99824"
                    className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white font-mono"
                  />
                </div>

                {/* 4. Initial Status */}
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Order Receiving Status</label>
                  <select
                    value={poInitialStatus}
                    onChange={(e) => setPoInitialStatus(e.target.value as "Pending" | "Received")}
                    className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white font-medium text-gray-900"
                  >
                    <option value="Pending">Pending (Items will arrive later)</option>
                    <option value="Received">Received Immediately (Auto-adds stock now)</option>
                  </select>
                </div>
              </div>

              {/* Item Selector & Add Form */}
              <div className="bg-white p-4 rounded-[8px] border border-gray-200/70 shadow-2xs space-y-3">
                <h3 className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#6320EE]" />
                  <span>Select Products to Add to Purchase Order</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end text-xs">
                  {/* Select Product */}
                  <div className="md:col-span-4">
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">Product *</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => setSelectedProdId(e.target.value)}
                      className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white"
                    >
                      <option value="">-- Choose Product from Catalog --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category}) - In Stock: {p.stock} {p.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Variation Selector if enabled */}
                  <div className="md:col-span-2">
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">Variation / Size</label>
                    <select
                      value={selectedVariantId}
                      onChange={(e) => handleVariantChange(e.target.value)}
                      disabled={!selectedProdId || !products.find((p) => p.id === selectedProdId)?.hasVariations}
                      className="w-full h-8.5 px-2 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      {selectedProdId &&
                      products.find((p) => p.id === selectedProdId)?.hasVariations &&
                      products.find((p) => p.id === selectedProdId)?.variations ? (
                        products
                          .find((p) => p.id === selectedProdId)
                          ?.variations.map((v: any) => (
                            <option key={v.id} value={v.id}>
                              {v.optionValue || v.name}
                            </option>
                          ))
                      ) : (
                        <option value="">Standard Base</option>
                      )}
                    </select>
                  </div>

                  {/* Unit */}
                  <div className="md:col-span-2">
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">Unit</label>
                    <input
                      type="text"
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      placeholder="e.g. Kg / Packet"
                      className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white"
                    />
                  </div>

                  {/* Unit Cost Price */}
                  <div className="md:col-span-2">
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">Cost Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemCost || ""}
                      onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-1">
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">Qty *</label>
                    <input
                      type="number"
                      step="1"
                      value={itemQty || ""}
                      onChange={(e) => setItemQty(parseInt(e.target.value, 10) || 1)}
                      placeholder="10"
                      className="w-full h-8.5 px-2 text-center border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white"
                    />
                  </div>

                  {/* Add Button */}
                  <div className="md:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddItemToPO}
                      disabled={!selectedProdId}
                      className="w-full h-8.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[6px] text-xs font-medium flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Added Items Table */}
              <div className="bg-white rounded-[8px] border border-gray-200/70 shadow-2xs overflow-hidden">
                <div className="p-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-xs">
                    Order Line Items ({poItems.length} items added)
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    Subtotal: ₹ {poSubtotal.toLocaleString("en-IN")}.00
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-10">#</th>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Variation / Option</th>
                        <th className="py-2.5 px-3 text-center">Unit</th>
                        <th className="py-2.5 px-3 text-right">Unit Cost Price</th>
                        <th className="py-2.5 px-3 text-center">Order Qty</th>
                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                        <th className="py-2.5 px-3 text-center w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {poItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-gray-400">
                            No products added to this purchase order yet. Select a product above and click &apos;Add&apos;.
                          </td>
                        </tr>
                      ) : (
                        poItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-2.5 px-3 text-center text-gray-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-medium text-gray-900">{item.name}</td>
                            <td className="py-2.5 px-3 text-gray-600">{item.variationName || "—"}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-gray-500">{item.unit}</td>
                            <td className="py-2.5 px-3 text-right font-medium">₹ {item.costPrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-[#6320EE]">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                              ₹ {item.total.toLocaleString("en-IN")}.00
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePOItem(idx)}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-rose-600 rounded cursor-pointer mx-auto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* "UPDATE RECEIVED" CHECKLIST MODAL WITH STOCK SYNC */}
      {receivingPO && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-xl w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Receive Goods & Update Inventory Stock
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">PO: {receivingPO.poNumber} • {receivingPO.vendorName}</span>
                </div>
              </div>
              <button
                onClick={() => setReceivingPO(null)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Check all items received in this shipment. Uncheck any items that were missing or damaged. 
              Clicking <strong>Update Received</strong> will automatically increment each item&apos;s stock in the live catalog.
            </p>

            {/* Checklist Table */}
            <div className="border border-gray-200 rounded-[8px] overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">Status</th>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3 text-center">Unit</th>
                    <th className="py-2 px-3 text-center">Ordered</th>
                    <th className="py-2 px-3 text-center w-24">Received Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {receivingPO.items.map((item, idx) => {
                    const isChecked = receivedChecklist[idx]?.checked ?? true;
                    const recQty = receivedChecklist[idx]?.qty ?? item.quantity;

                    return (
                      <tr key={idx} className={isChecked ? "bg-emerald-50/30" : "bg-gray-50/50 opacity-60"}>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              setReceivedChecklist({
                                ...receivedChecklist,
                                [idx]: {
                                  checked: e.target.checked,
                                  qty: e.target.checked ? item.quantity : 0
                                }
                              });
                            }}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          <span>{item.name}</span>
                          {item.variationName && (
                            <span className="text-[10px] text-gray-500 block">{item.variationName}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-gray-500 font-mono">{item.unit}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-700">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={item.quantity}
                            value={recQty}
                            disabled={!isChecked}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setReceivedChecklist({
                                ...receivedChecklist,
                                [idx]: {
                                  checked: isChecked,
                                  qty: val
                                }
                              });
                            }}
                            className="w-16 h-7 px-1.5 text-center border border-gray-300 rounded font-bold text-emerald-700 focus:outline-none focus:border-emerald-600 bg-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                Stock will update immediately across catalog & POS
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReceivingPO(null)}
                  className="h-8 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[6px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReceived}
                  disabled={isUpdatingReceived}
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-[6px] shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingReceived ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Update Received & Add Stock</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW PO MODAL */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Purchase Order: {viewingPO.poNumber}</h3>
                <span className="text-[11px] text-gray-400">Order Date: {viewingPO.orderDate}</span>
              </div>
              <button
                onClick={() => setViewingPO(null)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vendor & Status Header */}
            <div className="p-3 bg-gray-50 rounded-[8px] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Supplier:</span>
                <span className="font-semibold text-gray-900">{viewingPO.vendorName}</span>
                <span className="text-gray-500 block text-[11px]">{viewingPO.vendorCity} • +91 {viewingPO.vendorPhone}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[10px]">Status:</span>
                <span className="font-bold text-emerald-600 text-xs">{viewingPO.status}</span>
                <span className="text-gray-900 block font-bold text-sm mt-1">₹ {viewingPO.grandTotal.toLocaleString("en-IN")}.00</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-gray-200 rounded-[8px] overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-center">Unit</th>
                    <th className="py-2 px-3 text-right">Cost</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {viewingPO.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-medium">
                        {it.name} {it.variationName ? `(${it.variationName})` : ''}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-gray-500">{it.unit}</td>
                      <td className="py-2 px-3 text-right">₹ {it.costPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center font-bold">{it.quantity}</td>
                      <td className="py-2 px-3 text-right font-medium">₹ {it.total.toLocaleString("en-IN")}.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  handlePrintPO(viewingPO);
                  setViewingPO(null);
                }}
                className="h-8 px-3 bg-purple-50 hover:bg-purple-100 text-[#6320EE] text-xs font-medium rounded-[6px] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PO Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingPO(null)}
                className="h-8 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[6px] cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
