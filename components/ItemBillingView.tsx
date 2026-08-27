"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Receipt,
  User,
  CreditCard,
  Banknote,
  QrCode,
  PauseCircle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
  Clock,
  Split,
  Plus,
  MapPin
} from "lucide-react";
import { Product } from "./ProductData";
import { Category } from "./CategoryData";
import { useAuth } from "@/context/AuthContext";
import { usePrinter, maskPhoneNumber } from "@/context/PrinterContext";
import { CartItem, CustomerInfo } from "./BarcodeBillingView";

interface ItemBillingViewProps {
  products: Product[];
  categories: Category[];
  onInvoiceCreated?: () => void;
}

export default function ItemBillingView({ products, categories, onInvoiceCreated }: ItemBillingViewProps) {
  const { apiFetch, activeBusiness } = useAuth();
  const { printCustomReceipt } = usePrinter();

  // Selected Category & Product Search
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(18);

  // Cart & Customer State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "Walk-in Customer",
    phone: "",
    city: "",
    email: "",
    type: "walkin"
  });

  // Customer Modal & Search State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalTab, setCustomerModalTab] = useState<"search" | "add">("search");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    phone: "",
    city: "",
    email: ""
  });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Notes & Discount
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [invoiceNote, setInvoiceNote] = useState<string>("");
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card" | "split">("cash");
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitUpi, setSplitUpi] = useState<number>(0);
  const [splitCard, setSplitCard] = useState<number>(0);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  // Invoices & Drafts
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSubmitting, setIsDraftSubmitting] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<any | null>(null);
  const [recentDrafts, setRecentDrafts] = useState<any[]>([]);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

  // Customer Search debounce
  useEffect(() => {
    if (!customerSearchQuery.trim()) {
      setCustomerSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCustomers(true);
      try {
        const res = await apiFetch(`/customers?search=${encodeURIComponent(customerSearchQuery.trim())}`);
        if (res.success && res.data) {
          setCustomerSearchResults(res.data);
        }
      } catch (err) {
        console.warn("Customer search error:", err);
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [customerSearchQuery, apiFetch]);

  // Filtered Products for the Grid
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === "all" ||
      p.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim();
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (p.barcode && p.barcode.includes(searchQuery.trim()));
    return matchesCat && matchesSearch;
  });

  const visibleProducts = filteredProducts.slice(0, displayCount);

  // Calculations
  const subtotal = cart.reduce((acc, i) => acc + i.qty * i.price, 0);
  const overallDiscount = Number(discountValue) || 0;
  const taxableAmount = Math.max(0, subtotal - overallDiscount);

  const gstRate = (activeBusiness as any)?.isGstEnabled ? Number((activeBusiness as any)?.gstRate || 5) : 5;
  const totalTax = (taxableAmount * gstRate) / 100;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  const rawGrandTotal = taxableAmount + totalTax;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((grandTotal - rawGrandTotal).toFixed(2));
  const changeAmount = Math.max(0, (receivedAmount || grandTotal) - grandTotal);

  useEffect(() => {
    setReceivedAmount(grandTotal);
  }, [grandTotal]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
                total: (item.qty + 1) * item.price
              }
            : item
        );
      } else {
        const price = Number(product.sellingPrice) || 0;
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            sku: product.sku,
            unit: product.unit || "Piece",
            price,
            qty: 1,
            discount: 0,
            total: price,
            image: product.image,
            barcode: product.barcode
          }
        ];
      }
    });
  };

  const updateQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: newQty,
              total: newQty * item.price
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setInvoiceNote("");
    setCustomer({ name: "Walk-in Customer", phone: "", city: "", email: "", type: "walkin" });
    setPaymentMethod("cash");
  };

  const handleSaveAndAssignCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = newCustomerForm.phone.replace(/\D/g, "").slice(-10);
    if (!newCustomerForm.name.trim() || cleanPhone.length !== 10) {
      alert("Please enter a valid customer name and 10-digit mobile number.");
      return;
    }

    setIsSavingCustomer(true);
    try {
      const res = await apiFetch("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: newCustomerForm.name.trim(),
          phone: cleanPhone,
          city: newCustomerForm.city.trim(),
          email: newCustomerForm.email.trim()
        })
      });

      if (res.success && res.data) {
        setCustomer({
          id: res.data.id,
          name: res.data.name,
          phone: res.data.phone,
          city: res.data.city || "",
          email: res.data.email || "",
          type: "regular"
        });
        setIsCustomerModalOpen(false);
        setNewCustomerForm({ name: "", phone: "", city: "", email: "" });
      }
    } catch (err: any) {
      alert("Failed to save customer: " + err.message);
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (cart.length === 0) {
      alert("Please add items to cart before generating invoice.");
      return;
    }

    setIsSubmitting(true);
    try {
      const splitPaymentsData =
        paymentMethod === "split"
          ? { cash: splitCash, upi: splitUpi, card: splitCard }
          : null;

      const payload = {
        customer,
        items: cart,
        subtotal,
        discount: overallDiscount,
        discountType: "flat",
        taxableAmount,
        tax: totalTax,
        cgst,
        sgst,
        roundOff,
        grandTotal,
        paidAmount: Number(receivedAmount) || grandTotal,
        changeAmount,
        paymentMethod,
        splitPayments: splitPaymentsData,
        notes: invoiceNote,
        status: "settled",
        isDraft: false
      };

      const res = await apiFetch("/sales", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setSuccessInvoice(res.data);

        // Thermal Receipt print with customer masked phone & city
        try {
          await printCustomReceipt({
            storeName: activeBusiness?.name || "Super Market",
            storeAddress: (activeBusiness as any)?.address || (activeBusiness as any)?.city || "Nellore",
            storePhone: (activeBusiness as any)?.phone || "",
            gstNumber: (activeBusiness as any)?.gstNumber || "",
            invoiceNo: res.data.invoiceNo,
            date: `${res.data.date} ${res.data.time}`,
            customer: customer.type === "regular" ? {
              name: customer.name,
              phone: customer.phone,
              city: customer.city
            } : undefined,
            items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price, total: i.total })),
            subtotal,
            tax: totalTax,
            discount: overallDiscount,
            grandTotal,
            paymentMode: paymentMethod.toUpperCase(),
            paidAmount: Number(receivedAmount) || grandTotal,
            changeAmount,
            splitDetails: splitPaymentsData || undefined
          });
        } catch {}

        clearCart();
        if (onInvoiceCreated) onInvoiceCreated();
      }
    } catch (err: any) {
      alert("Invoice generation error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHoldInvoice = async () => {
    if (cart.length === 0) return;

    setIsDraftSubmitting(true);
    try {
      const payload = {
        customer,
        items: cart,
        subtotal,
        discount: overallDiscount,
        taxableAmount,
        tax: totalTax,
        cgst,
        sgst,
        roundOff,
        grandTotal,
        paidAmount: 0,
        changeAmount: 0,
        paymentMethod,
        notes: invoiceNote,
        isDraft: true
      };

      const res = await apiFetch("/sales", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (res.success) {
        alert("Invoice put on hold / saved as draft.");
        clearCart();
      }
    } catch (err: any) {
      alert("Hold invoice error: " + err.message);
    } finally {
      setIsDraftSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs">
        <div>
          <h2 className="text-lg font-medium text-gray-900 tracking-tight">New Sale / Billing (Touch POS)</h2>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">Select items and generate invoice for your customer</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHoldInvoice}
            disabled={cart.length === 0 || isDraftSubmitting}
            className="inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-40"
          >
            {isDraftSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6320EE]" />
            ) : (
              <PauseCircle className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span>Hold Invoice</span>
          </button>

          <button
            onClick={() => cart.length > 0 && confirm("Clear current cart?") && clearCart()}
            disabled={cart.length === 0}
            className="inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Clear Cart</span>
          </button>

          <button
            onClick={handleGenerateInvoice}
            disabled={cart.length === 0 || isSubmitting}
            className="inline-flex items-center gap-1.5 h-8.5 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Receipt className="w-3.5 h-3.5" />
            )}
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Column 1: Left Categories & Product Grid (6 Cols) */}
        <div className="xl:col-span-6 bg-white rounded-[8px] border border-gray-100/90 shadow-2xs p-4 flex flex-col md:flex-row gap-3 min-h-[550px]">
          
          {/* Categories Sidebar */}
          <div className="w-full md:w-40 shrink-0 space-y-1 border-b md:border-b-0 md:border-r border-gray-100 pr-0 md:pr-2 pb-2 md:pb-0 overflow-x-auto md:overflow-y-auto max-h-48 md:max-h-[550px]">
            <span className="text-[11px] font-medium text-gray-400 block px-2 mb-1.5 uppercase tracking-wider">
              Categories
            </span>

            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-xs transition-all cursor-pointer font-medium ${
                selectedCategory === "all"
                  ? "bg-purple-50 text-[#6320EE]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              All Items ({products.length})
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-xs transition-all cursor-pointer truncate block ${
                    isSelected
                      ? "bg-purple-50 text-[#6320EE] font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Product Items Grid */}
          <div className="flex-1 space-y-3 flex flex-col justify-between">
            <div>
              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item by name / code..."
                  className="w-full h-8.5 pl-9 pr-3 text-xs border border-gray-200 rounded-[8px] focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                />
              </div>

              {/* Grid Header */}
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-medium text-gray-800">
                  {selectedCategory === "all" ? "All Items" : selectedCategory} ({filteredProducts.length})
                </span>
                <span className="text-[10px] text-gray-400">Click card to add</span>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
                {visibleProducts.length === 0 ? (
                  <div className="col-span-3 py-16 text-center text-gray-400 text-xs">
                    No products found under this category.
                  </div>
                ) : (
                  visibleProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-2.5 rounded-[8px] border border-gray-100/90 hover:border-[#6320EE] hover:bg-purple-50/20 bg-white transition-all cursor-pointer flex flex-col items-center text-center shadow-2xs group select-none"
                    >
                      <div className="w-14 h-14 rounded-[6px] bg-purple-50 border border-gray-100 flex items-center justify-center text-xl mb-1.5 overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                        {product.image && product.image.startsWith("http") ? (
                          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                        ) : (
                          "📦"
                        )}
                      </div>

                      <h4 className="font-medium text-gray-900 text-[11px] line-clamp-1 leading-snug w-full">
                        {product.name}
                      </h4>

                      <span className="font-bold text-emerald-600 text-xs mt-0.5">
                        ₹ {Number(product.sellingPrice).toFixed(2)}
                      </span>

                      <span className="text-[9px] text-gray-400 font-mono mt-0.5">{product.sku}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {filteredProducts.length > displayCount && (
              <button
                type="button"
                onClick={() => setDisplayCount((c) => c + 18)}
                className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-[6px] text-xs font-medium cursor-pointer transition-colors mt-2"
              >
                View More Items ({filteredProducts.length - displayCount} remaining)
              </button>
            )}
          </div>

        </div>

        {/* Column 2: Center Cart Column (3 Cols) */}
        <div className="xl:col-span-3 bg-white rounded-[8px] border border-gray-100/90 shadow-2xs p-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-medium text-xs text-gray-900">Cart ({cart.length} Items)</span>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => confirm("Clear cart?") && clearCart()}
                  className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Cart Table */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 text-xs">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-xs">
                  Cart is empty. Click any product from the catalog on the left to start billing.
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={item.id} className="py-2 flex items-center justify-between gap-1.5 hover:bg-gray-50/50">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-[10px] text-gray-400 font-mono">{idx + 1}.</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate text-[11px]">{item.name}</p>
                        <p className="text-[10px] text-gray-400">₹{Number(item.price).toFixed(2)} / {item.unit}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center border border-gray-200 rounded-[5px] bg-white h-6 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-5 h-full text-gray-500 hover:text-gray-900 flex items-center justify-center font-medium cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-[11px] font-medium text-gray-900">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-5 h-full text-gray-500 hover:text-gray-900 flex items-center justify-center font-medium cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-medium text-gray-900 text-xs text-right w-16 shrink-0">
                      ₹ {Number(item.total).toFixed(2)}
                    </span>

                    <button
                      onClick={() => updateQty(item.id, 0)}
                      className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {isNoteOpen ? (
              <div className="pt-2">
                <textarea
                  rows={2}
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  placeholder="Order note / token number..."
                  className="w-full p-2 text-xs border border-gray-200 rounded-[6px] focus:outline-none focus:border-[#6320EE]"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsNoteOpen(true)}
                className="text-[11px] text-[#6320EE] hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                <FileText className="w-3 h-3" />
                <span>Add Note</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between font-medium text-xs text-gray-900 mt-2">
            <span>Sub Total ({cart.length} Items)</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Column 3: Right Sidebar - Customer & Bill Summary (3 Cols) */}
        <div className="xl:col-span-3 space-y-4">
          
          {/* Customer Card */}
          <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-medium text-xs text-gray-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#6320EE]" />
                <span>Customer</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setCustomerModalTab("search");
                  setIsCustomerModalOpen(true);
                }}
                className="text-[11px] text-[#6320EE] font-medium hover:underline cursor-pointer"
              >
                {customer.type === "regular" ? "Change" : "+ Select Customer"}
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="font-medium text-gray-800">{customer.name}</span>
              </div>
              {customer.type === "regular" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mobile</span>
                    <span className="font-medium font-mono text-gray-700">
                      +91 {maskPhoneNumber(customer.phone)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">City</span>
                    <span className="font-medium text-gray-700">{customer.city || "—"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs space-y-2.5 text-xs">
            <span className="font-medium text-xs text-gray-900 block border-b border-gray-100 pb-2">
              Bill Summary
            </span>

            <div className="space-y-1.5 text-gray-600">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span className="font-medium text-gray-900">₹ {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Discount</span>
                <div className="relative w-20">
                  <input
                    type="number"
                    value={discountValue || ""}
                    placeholder="0.00"
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full h-6 px-1.5 pr-4 text-right text-xs border border-gray-200 rounded focus:outline-none focus:border-[#6320EE]"
                  />
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">₹</span>
                </div>
              </div>

              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>Tax (CGST 2.5%)</span>
                <span>₹ {cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>Tax (SGST 2.5%)</span>
                <span>₹ {sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Round Off</span>
                <span>₹ {roundOff.toFixed(2)}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="font-medium text-gray-900 text-xs">Grand Total</span>
              <span className="font-bold text-[#6320EE] text-base">₹ {grandTotal.toFixed(2)}</span>
            </div>

            {/* Received & Change */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Received</span>
                <div className="relative w-24">
                  <input
                    type="number"
                    value={receivedAmount || ""}
                    onChange={(e) => setReceivedAmount(Number(e.target.value))}
                    className="w-full h-7 px-2 pr-5 text-right text-xs font-medium border border-gray-200 rounded focus:outline-none focus:border-[#6320EE]"
                  />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 font-medium">
                <span className="text-emerald-700">Change</span>
                <span className="text-emerald-600 font-bold text-sm">₹ {changeAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <span className="text-[10px] font-medium text-gray-400 block">Payment Method</span>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-1.5 rounded border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    paymentMethod === "cash" ? "border-[#6320EE] bg-purple-50 text-[#6320EE]" : "border-gray-200"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[9px]">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-1.5 rounded border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    paymentMethod === "upi" ? "border-[#6320EE] bg-purple-50 text-[#6320EE]" : "border-gray-200"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[9px]">UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-1.5 rounded border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    paymentMethod === "card" ? "border-[#6320EE] bg-purple-50 text-[#6320EE]" : "border-gray-200"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[9px]">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("split");
                    setIsSplitModalOpen(true);
                  }}
                  className={`p-1.5 rounded border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    paymentMethod === "split" ? "border-[#6320EE] bg-purple-50 text-[#6320EE]" : "border-gray-200"
                  }`}
                >
                  <Split className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[9px]">Split</span>
                </button>
              </div>
            </div>

            {/* Quick Settle & Print button */}
            <button
              type="button"
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleGenerateInvoice}
              className="w-full h-8.5 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all mt-2"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
              <span>Settle & Print (F8)</span>
            </button>
          </div>

        </div>

      </div>

      {/* Customer Modal with Search + Add Form */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#6320EE]" />
                <h3 className="font-medium text-gray-900 text-sm">Customer Search & Registration</h3>
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-3 border-b border-gray-100 pb-2">
              <button
                type="button"
                onClick={() => setCustomerModalTab("search")}
                className={`px-3 py-1 text-xs font-medium rounded-[6px] cursor-pointer transition-colors ${
                  customerModalTab === "search" ? "bg-purple-50 text-[#6320EE]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Search Customer
              </button>

              <button
                type="button"
                onClick={() => setCustomerModalTab("add")}
                className={`px-3 py-1 text-xs font-medium rounded-[6px] cursor-pointer transition-colors ${
                  customerModalTab === "add" ? "bg-purple-50 text-[#6320EE]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                + Add New Customer
              </button>
            </div>

            {customerModalTab === "search" && (
              <div className="py-3 space-y-3 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    placeholder="Search by customer name, mobile (+91)..."
                    className="w-full h-8.5 pl-9 pr-3 text-xs border border-gray-200 rounded-[6px] focus:outline-none focus:border-[#6320EE]"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-[6px]">
                  {isSearchingCustomers ? (
                    <div className="p-4 text-center text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-[#6320EE]" />
                      <span>Searching directory...</span>
                    </div>
                  ) : customerSearchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      <p>No customer found.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setNewCustomerForm({ ...newCustomerForm, name: customerSearchQuery, phone: "" });
                          setCustomerModalTab("add");
                        }}
                        className="text-[11px] text-[#6320EE] font-medium hover:underline mt-1 cursor-pointer block mx-auto"
                      >
                        + Create customer &quot;{customerSearchQuery || "New"}&quot;
                      </button>
                    </div>
                  ) : (
                    customerSearchResults.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCustomer({
                            id: c.id,
                            name: c.name,
                            phone: c.phone,
                            city: c.city || "",
                            email: c.email || "",
                            type: "regular"
                          });
                          setIsCustomerModalOpen(false);
                        }}
                        className="p-2.5 hover:bg-purple-50/60 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">+91 {c.phone} {c.city ? `• ${c.city}` : ""}</p>
                        </div>
                        <span className="text-[11px] text-[#6320EE] font-medium">Select</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {customerModalTab === "add" && (
              <form onSubmit={handleSaveAndAssignCustomer} className="py-3 space-y-3 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Customer Full Name *</label>
                  <input
                    type="text"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    placeholder="e.g. Priya Reddy"
                    className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Mobile Number (10 Digits) *</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={newCustomerForm.phone}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value.replace(/\D/g, "") })}
                      placeholder="9876543210"
                      className="w-full h-8.5 pl-11 pr-2.5 border border-gray-200 rounded-[6px] text-xs font-mono focus:outline-none focus:border-[#6320EE]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">City / Location *</label>
                  <input
                    type="text"
                    value={newCustomerForm.city}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    placeholder="e.g. Nellore / Hyderabad"
                    className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsCustomerModalOpen(false)}
                    className="h-8 px-3 bg-gray-100 text-gray-700 text-xs font-medium rounded-[6px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCustomer}
                    className="h-8 px-3.5 bg-[#6320EE] text-white text-xs font-medium rounded-[6px] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingCustomer && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Save & Assign</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Split Modal */}
      {isSplitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-sm w-full p-5 shadow-2xl border border-gray-100 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-medium text-gray-900 text-sm">Split Payment</h3>
              <button onClick={() => setIsSplitModalOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between font-medium text-[#6320EE] bg-purple-50 p-2 rounded">
                <span>Grand Total:</span>
                <span>₹ {grandTotal.toFixed(2)}</span>
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Cash (₹)</label>
                <input
                  type="number"
                  value={splitCash || ""}
                  onChange={(e) => setSplitCash(Number(e.target.value))}
                  className="w-full h-8 px-2 border border-gray-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">UPI (₹)</label>
                <input
                  type="number"
                  value={splitUpi || ""}
                  onChange={(e) => setSplitUpi(Number(e.target.value))}
                  className="w-full h-8 px-2 border border-gray-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Card (₹)</label>
                <input
                  type="number"
                  value={splitCard || ""}
                  onChange={(e) => setSplitCard(Number(e.target.value))}
                  className="w-full h-8 px-2 border border-gray-200 rounded text-xs"
                />
              </div>
            </div>
            <button
              onClick={() => setIsSplitModalOpen(false)}
              className="w-full h-8 bg-[#6320EE] text-white text-xs font-medium rounded-[6px] mt-2 cursor-pointer"
            >
              Confirm Split
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-base">Bill Settled & Printed!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Invoice <strong>#{successInvoice.invoiceNo}</strong> for <strong>₹{successInvoice.grandTotal.toFixed(2)}</strong> completed.
              </p>
            </div>
            <button
              onClick={() => setSuccessInvoice(null)}
              className="w-full h-9 bg-[#6320EE] text-white text-xs font-medium rounded-[8px] cursor-pointer"
            >
              Next Customer (F2)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
