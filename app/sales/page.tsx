"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  ChevronDown,
  ArrowUpDown,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Loader2,
  TrendingUp,
  ShoppingBag,
  Store,
  X,
  Sparkles,
  Split,
  Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePrinter, maskPhoneNumber } from "@/context/PrinterContext";
import * as XLSX from "xlsx";

interface SaleRecord {
  id: string;
  invoiceNo: string;
  customer?: { name: string; phone?: string; email?: string; city?: string; type?: string };
  items: Array<{ id: string; name: string; qty: number; price: number; total: number; unit?: string }>;
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: "cash" | "upi" | "card" | "split";
  splitPayments?: { cash?: number; upi?: number; card?: number };
  status: string;
  date: string;
  time: string;
  createdAt: string;
  notes?: string;
}

export default function SalesPage() {
  const { apiFetch, activeBusiness } = useAuth();
  const { printCustomReceipt } = usePrinter();

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "week" | "month" | "all">("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [viewingSale, setViewingSale] = useState<SaleRecord | null>(null);

  // Fetch live sales from Firebase Firestore
  useEffect(() => {
    let isMounted = true;

    const fetchSales = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch("/sales");
        if (isMounted && res.success && res.data) {
          setSales(res.data);
        }
      } catch (err) {
        console.warn("Sales fetch note:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSales();

    return () => {
      isMounted = false;
    };
  }, [apiFetch, activeBusiness]);

  // Date filtering logic
  const now = new Date();
  const todayStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const filteredSales = sales.filter((sale) => {
    let matchesDate = true;
    const saleDate = new Date(sale.createdAt || now);

    if (dateFilter === "today") {
      matchesDate = sale.date === todayStr || saleDate.toDateString() === now.toDateString();
    } else if (dateFilter === "yesterday") {
      matchesDate = sale.date === yesterdayStr || saleDate.toDateString() === yesterday.toDateString();
    } else if (dateFilter === "week") {
      matchesDate = saleDate >= sevenDaysAgo;
    } else if (dateFilter === "month") {
      matchesDate = saleDate >= thirtyDaysAgo;
    }

    const matchesPayment =
      paymentFilter === "all" || sale.paymentMethod.toLowerCase() === paymentFilter.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      sale.invoiceNo.toLowerCase().includes(q) ||
      (sale.customer?.name && sale.customer.name.toLowerCase().includes(q)) ||
      (sale.customer?.phone && sale.customer.phone.includes(q)) ||
      (sale.customer?.city && sale.customer.city.toLowerCase().includes(q));

    return matchesDate && matchesPayment && matchesSearch;
  });

  // KPI Calculations
  const totalRevenue = filteredSales.reduce((acc, s) => acc + (Number(s.grandTotal) || 0), 0);
  const totalInvoices = filteredSales.length;
  const avgBill = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
  const totalItemsSold = filteredSales.reduce((acc, s) => acc + (Number(s.itemCount) || 1), 0);

  const handlePrintReceipt = async (sale: SaleRecord) => {
    await printCustomReceipt({
      storeName: activeBusiness?.name || "Super Market",
      storeAddress: (activeBusiness as any)?.address || (activeBusiness as any)?.city || "Nellore",
      storePhone: (activeBusiness as any)?.phone || "",
      gstNumber: (activeBusiness as any)?.gstNumber || "",
      invoiceNo: sale.invoiceNo,
      date: `${sale.date} ${sale.time}`,
      customer: sale.customer && sale.customer.name && sale.customer.name !== "Walk-in Customer" ? {
        name: sale.customer.name,
        phone: sale.customer.phone,
        city: sale.customer.city
      } : undefined,
      items: sale.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, total: i.total })),
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      grandTotal: sale.grandTotal,
      paymentMode: sale.paymentMethod.toUpperCase(),
      paidAmount: sale.paidAmount,
      changeAmount: sale.changeAmount,
      splitDetails: sale.splitPayments || undefined
    });
  };

  const handleExportExcel = () => {
    if (filteredSales.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(
      filteredSales.map((s) => ({
        "Invoice No": s.invoiceNo,
        "Date": s.date,
        "Time": s.time,
        "Customer Name": s.customer?.name || "Walk-in",
        "Customer Mobile": s.customer?.phone ? `+91 ${s.customer.phone}` : "",
        "Customer City": s.customer?.city || "",
        "Items Count": s.itemCount,
        "Subtotal (₹)": s.subtotal,
        "Discount (₹)": s.discount,
        "GST Tax (₹)": s.tax,
        "Grand Total (₹)": s.grandTotal,
        "Payment Method": s.paymentMethod.toUpperCase(),
        "Split Breakdown": s.splitPayments
          ? `Cash: ₹${s.splitPayments.cash || 0} | UPI: ₹${s.splitPayments.upi || 0} | Card: ₹${s.splitPayments.card || 0}`
          : "",
        "Status": s.status.toUpperCase()
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Invoices");
    XLSX.writeFile(wb, `sales_report_${dateFilter}.xlsx`);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 sm:py-7 space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-gray-900 tracking-tight">Sales & Invoices</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            Date-wise records of all settled customer bills and payment breakdowns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={filteredSales.length === 0}
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Excel</span>
          </button>

          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sale (POS)</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Revenue</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">₹ {totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">{totalInvoices} Settled Bills</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-purple-50 text-[#6320EE] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Invoices Generated</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{totalInvoices}</h3>
            <span className="text-[10px] text-gray-400 font-normal mt-0.5 block">Filtered Period</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Average Bill Value</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">₹ {avgBill.toFixed(2)}</h3>
            <span className="text-[10px] text-gray-400 font-normal mt-0.5 block">Per Transaction</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Items Sold</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{totalItemsSold}</h3>
            <span className="text-[10px] text-gray-400 font-normal mt-0.5 block">Across all orders</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Date Filter Tabs & Table Card */}
      <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-2xs overflow-hidden">
        
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left Date Switcher Tabs */}
          <div className="inline-flex items-center p-1 bg-gray-100/80 rounded-[8px] border border-gray-200/60 flex-wrap">
            <button
              onClick={() => setDateFilter("today")}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                dateFilter === "today" ? "bg-white text-[#6320EE] shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter("yesterday")}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                dateFilter === "yesterday" ? "bg-white text-[#6320EE] shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setDateFilter("week")}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                dateFilter === "week" ? "bg-white text-[#6320EE] shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateFilter("month")}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                dateFilter === "month" ? "bg-white text-[#6320EE] shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateFilter("all")}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                dateFilter === "all" ? "bg-white text-[#6320EE] shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Invoices
            </button>
          </div>

          {/* Search & Payment Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bill no, customer, city..."
                className="pl-8 pr-3 h-8 text-xs border border-gray-200 rounded-[8px] focus:outline-none focus:border-[#6320EE] w-48 text-gray-800"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-8 px-2.5 bg-white border border-gray-200 rounded-[8px] text-xs font-medium text-gray-700 cursor-pointer focus:outline-none focus:border-[#6320EE]"
            >
              <option value="all">All Payment Modes</option>
              <option value="cash">Cash Only</option>
              <option value="upi">UPI / QR Only</option>
              <option value="card">Card Only</option>
              <option value="split">Split Payments</option>
            </select>
          </div>

        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3.5 text-center w-12">#</th>
                <th className="py-2.5 px-3">Invoice No</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Customer Details</th>
                <th className="py-2.5 px-3 text-center">Items</th>
                <th className="py-2.5 px-3 min-w-[150px]">Payment Method</th>
                <th className="py-2.5 px-3 text-right">Tax (GST)</th>
                <th className="py-2.5 px-3 text-right">Grand Total</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-20">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 text-[#6320EE] animate-spin mx-auto mb-2" />
                    <span>Loading sales records...</span>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <p className="font-medium text-gray-800 text-xs">No sales bills found for this period</p>
                      <p className="text-[11px] text-gray-400">
                        Generate and settle a customer invoice on the Billing page to see it here.
                      </p>
                      <Link
                        href="/billing"
                        className="h-8 px-3.5 bg-[#6320EE] text-white text-xs font-medium rounded-[8px] inline-flex items-center gap-1.5 mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Go to Billing</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale, idx) => (
                  <tr key={sale.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3.5 text-center text-gray-400 font-medium">{idx + 1}</td>
                    
                    {/* Invoice No */}
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-gray-900 font-mono">{sale.invoiceNo}</span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-2.5 px-3 text-gray-500">
                      <div>
                        <span className="font-medium text-gray-700 block">{sale.date}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{sale.time}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-2.5 px-3">
                      <div>
                        <span className="font-medium text-gray-900 block">{sale.customer?.name || "Walk-in Customer"}</span>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          {sale.customer?.phone && <span>+91 {maskPhoneNumber(sale.customer.phone)}</span>}
                          {sale.customer?.city && <span>• {sale.customer.city}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Items Count */}
                    <td className="py-2.5 px-3 text-center font-medium text-gray-700">
                      {sale.itemCount}
                    </td>

                    {/* Payment Mode with Split Breakdown */}
                    <td className="py-2.5 px-3">
                      {sale.paymentMethod === "cash" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-[6px] text-[10px] font-medium">
                          <Banknote className="w-3 h-3 text-emerald-600" />
                          <span>Cash (₹{Number(sale.grandTotal).toFixed(0)})</span>
                        </span>
                      )}

                      {sale.paymentMethod === "upi" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-[6px] text-[10px] font-medium">
                          <QrCode className="w-3 h-3 text-amber-600" />
                          <span>UPI (₹{Number(sale.grandTotal).toFixed(0)})</span>
                        </span>
                      )}

                      {sale.paymentMethod === "card" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-[6px] text-[10px] font-medium">
                          <CreditCard className="w-3 h-3 text-blue-600" />
                          <span>Card (₹{Number(sale.grandTotal).toFixed(0)})</span>
                        </span>
                      )}

                      {sale.paymentMethod === "split" && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-[#6320EE] border border-purple-200 rounded-[6px] text-[10px] font-medium">
                            <Split className="w-3 h-3 text-[#6320EE]" />
                            <span>Split Payment</span>
                          </span>

                          {sale.splitPayments && (
                            <div className="text-[10px] text-gray-600 font-mono space-y-0.5 bg-gray-50 p-1.5 rounded-[4px] border border-gray-100">
                              {sale.splitPayments.cash ? (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Cash:</span>
                                  <span className="font-medium text-gray-800">₹{Number(sale.splitPayments.cash).toFixed(2)}</span>
                                </div>
                              ) : null}
                              {sale.splitPayments.upi ? (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">UPI:</span>
                                  <span className="font-medium text-gray-800">₹{Number(sale.splitPayments.upi).toFixed(2)}</span>
                                </div>
                              ) : null}
                              {sale.splitPayments.card ? (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Card:</span>
                                  <span className="font-medium text-gray-800">₹{Number(sale.splitPayments.card).toFixed(2)}</span>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Tax */}
                    <td className="py-2.5 px-3 text-right text-gray-500">
                      ₹ {Number(sale.tax || 0).toFixed(2)}
                    </td>

                    {/* Grand Total */}
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                      ₹ {Number(sale.grandTotal).toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Settled
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingSale(sale)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-purple-600 hover:bg-purple-50 cursor-pointer"
                          title="View Bill Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(sale)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                          title="Reprint Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* View Bill Receipt Modal */}
      {viewingSale && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#6320EE]" />
                <h3 className="font-medium text-gray-900 text-sm">Invoice #{viewingSale.invoiceNo}</h3>
              </div>
              <button
                onClick={() => setViewingSale(null)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-3 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Date: {viewingSale.date} {viewingSale.time}</span>
                <span className="font-medium text-emerald-700 uppercase">{viewingSale.paymentMethod}</span>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-[8px] text-gray-700 space-y-1">
                <p className="font-medium">{viewingSale.customer?.name || "Walk-in Customer"}</p>
                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                  {viewingSale.customer?.phone && <span>+91 {maskPhoneNumber(viewingSale.customer.phone)}</span>}
                  {viewingSale.customer?.city && <span>• {viewingSale.customer.city}</span>}
                </div>
              </div>

              {/* Items List */}
              <div className="border border-gray-100 rounded-[8px] divide-y divide-gray-100">
                <div className="bg-gray-50/80 p-2 font-medium text-gray-500 flex justify-between text-[11px]">
                  <span>Item</span>
                  <span>Qty × Price</span>
                  <span>Total</span>
                </div>
                {viewingSale.items.map((item, idx) => (
                  <div key={idx} className="p-2 flex justify-between items-center text-[11px]">
                    <span className="font-medium text-gray-900 truncate max-w-[150px]">{item.name}</span>
                    <span className="text-gray-500">{item.qty} × ₹{item.price}</span>
                    <span className="font-medium text-gray-900">₹{item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Payment Details with Split Breakdown */}
              {viewingSale.paymentMethod === "split" && viewingSale.splitPayments && (
                <div className="p-2.5 bg-purple-50/70 border border-purple-100 rounded-[6px] space-y-1.5">
                  <span className="font-medium text-[#6320EE] text-[11px] block">
                    Split Payment Method Breakdown:
                  </span>
                  <div className="space-y-1 text-gray-700 font-mono text-[11px]">
                    {viewingSale.splitPayments.cash ? (
                      <div className="flex justify-between">
                        <span>• Cash:</span>
                        <strong className="text-gray-900">₹ {Number(viewingSale.splitPayments.cash).toFixed(2)}</strong>
                      </div>
                    ) : null}
                    {viewingSale.splitPayments.upi ? (
                      <div className="flex justify-between">
                        <span>• UPI / QR:</span>
                        <strong className="text-gray-900">₹ {Number(viewingSale.splitPayments.upi).toFixed(2)}</strong>
                      </div>
                    ) : null}
                    {viewingSale.splitPayments.card ? (
                      <div className="flex justify-between">
                        <span>• Card / POS:</span>
                        <strong className="text-gray-900">₹ {Number(viewingSale.splitPayments.card).toFixed(2)}</strong>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="space-y-1 text-gray-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹ {viewingSale.subtotal.toFixed(2)}</span>
                </div>
                {viewingSale.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>- ₹ {viewingSale.discount.toFixed(2)}</span>
                  </div>
                )}
                {viewingSale.tax > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>GST Tax:</span>
                    <span>₹ {viewingSale.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-sm pt-1 border-t border-gray-100">
                  <span>Grand Total:</span>
                  <span className="text-[#6320EE]">₹ {viewingSale.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewingSale(null)}
                className="h-8 px-3 bg-gray-100 text-gray-700 text-xs font-medium rounded-[6px]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handlePrintReceipt(viewingSale)}
                className="h-8 px-3.5 bg-[#6320EE] text-white text-xs font-medium rounded-[6px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Reprint Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
