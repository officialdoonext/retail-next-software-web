"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Barcode,
  Search,
  Plus,
  Trash2,
  Receipt,
  User,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  X,
  Sparkles,
  PauseCircle,
  Split,
  MapPin,
  Phone,
  UserPlus
} from "lucide-react";
import { Product } from "./ProductData";
import { useAuth } from "@/context/AuthContext";
import { usePrinter, maskPhoneNumber } from "@/context/PrinterContext";

export interface CartItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  price: number;
  qty: number;
  discount: number;
  total: number;
  image?: string;
  barcode?: string;
}

export interface CustomerInfo {
  id?: string;
  name: string;
  phone: string;
  city?: string;
  email?: string;
  type: "walkin" | "regular";
}

interface BarcodeBillingViewProps {
  products: Product[];
  onInvoiceCreated?: () => void;
}

export default function BarcodeBillingView({ products, onInvoiceCreated }: BarcodeBillingViewProps) {
  const { apiFetch, activeBusiness } = useAuth();
  const { isConnected, printCustomReceipt } = usePrinter();

  // Cart & Search State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Customer State
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "Walk-in Customer",
    phone: "",
    city: "",
    email: "",
    type: "walkin"
  });
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
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
  const [customerModalTab, setCustomerModalTab] = useState<"search" | "add">("search");

  // Discount & Notes
  const [discountType, setDiscountType] = useState<"flat" | "percentage">("flat");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [invoiceNote, setInvoiceNote] = useState<string>("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card" | "split">("cash");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitUpi, setSplitUpi] = useState<number>(0);
  const [splitCard, setSplitCard] = useState<number>(0);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  // Invoices & Loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSubmitting, setIsDraftSubmitting] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<any | null>(null);
  const [recentDrafts, setRecentDrafts] = useState<any[]>([]);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

  // Barcode / Search auto-filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResultsDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const matches = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.includes(query))
    );

    const exactBarcodeMatch = products.find((p) => p.barcode && p.barcode.trim() === query);
    if (exactBarcodeMatch) {
      addToCart(exactBarcodeMatch);
      setSearchQuery("");
      setSearchResults([]);
      setShowResultsDropdown(false);
      return;
    }

    setSearchResults(matches.slice(0, 8));
    setShowResultsDropdown(matches.length > 0);
  }, [searchQuery, products]);

  // Customer search API trigger
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

  // Calculations
  const subtotal = cart.reduce((acc, i) => acc + i.qty * i.price - i.discount, 0);
  
  let overallDiscount = 0;
  if (discountType === "flat") {
    overallDiscount = Number(discountValue) || 0;
  } else {
    overallDiscount = (subtotal * (Number(discountValue) || 0)) / 100;
  }

  const taxableAmount = Math.max(0, subtotal - overallDiscount);
  
  const gstRate = (activeBusiness as any)?.isGstEnabled ? Number((activeBusiness as any)?.gstRate || 5) : 5;
  const totalTax = (taxableAmount * gstRate) / 100;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  const rawGrandTotal = taxableAmount + totalTax;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((grandTotal - rawGrandTotal).toFixed(2));
  const balanceChange = Math.max(0, (paidAmount || grandTotal) - grandTotal);

  useEffect(() => {
    setPaidAmount(grandTotal);
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
                total: (item.qty + 1) * item.price - item.discount
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
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: newQty,
              total: newQty * item.price - item.discount
            }
          : item
      )
    );
  };

  const updateItemDiscount = (id: string, disc: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              discount: Math.max(0, disc),
              total: Math.max(0, item.qty * item.price - disc)
            }
          : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setInvoiceNote("");
    setCustomer({ name: "Walk-in Customer", phone: "", city: "", email: "", type: "walkin" });
    setPaymentMethod("cash");
  };

  // Save new customer in Firestore and assign to active bill
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
      alert("Please add at least one product to the cart.");
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
        discountType,
        taxableAmount,
        tax: totalTax,
        cgst,
        sgst,
        roundOff,
        grandTotal,
        paidAmount: Number(paidAmount) || grandTotal,
        changeAmount: balanceChange,
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
        
        // Auto Print thermal receipt with customer masked mobile & city
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
            paidAmount: Number(paidAmount) || grandTotal,
            changeAmount: balanceChange,
            splitDetails: splitPaymentsData || undefined
          });
        } catch (printErr) {
          console.warn("Print execution note:", printErr);
        }

        clearCart();
        if (onInvoiceCreated) onInvoiceCreated();
      } else {
        throw new Error(res.message || "Failed to generate invoice");
      }
    } catch (err: any) {
      alert("Invoice settlement error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (cart.length === 0) return;

    setIsDraftSubmitting(true);
    try {
      const payload = {
        customer,
        items: cart,
        subtotal,
        discount: overallDiscount,
        discountType,
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
        alert("Invoice successfully saved as Hold / Draft (F10 to view).");
        clearCart();
      }
    } catch (err: any) {
      alert("Draft save error: " + err.message);
    } finally {
      setIsDraftSubmitting(false);
    }
  };

  const fetchDrafts = async () => {
    try {
      const res = await apiFetch("/sales/drafts");
      if (res.success) {
        setRecentDrafts(res.data || []);
        setIsDraftsModalOpen(true);
      }
    } catch {}
  };

  const resumeDraft = async (draft: any) => {
    setCart(draft.items || []);
    setCustomer(draft.customer || { name: "Walk-in Customer", phone: "", city: "", email: "", type: "walkin" });
    setInvoiceNote(draft.notes || "");
    if (draft.discount) {
      setDiscountValue(draft.discount);
      setDiscountType(draft.discountType || "flat");
    }
    setIsDraftsModalOpen(false);

    try {
      await apiFetch(`/sales/drafts/${draft.id}`, { method: "DELETE" });
    } catch {}
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Bar: Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs">
        <div>
          <h2 className="text-lg font-medium text-gray-900 tracking-tight">New Sale / Billing (Barcode POS)</h2>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">Create a new invoice for your customer</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Hold Invoice */}
          <button
            onClick={handleSaveDraft}
            disabled={cart.length === 0 || isDraftSubmitting}
            className="inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-40"
          >
            <PauseCircle className="w-3.5 h-3.5 text-gray-500" />
            <span>Hold Invoice</span>
          </button>

          {/* Clear Cart */}
          <button
            onClick={() => cart.length > 0 && confirm("Clear current cart?") && clearCart()}
            disabled={cart.length === 0}
            className="inline-flex items-center gap-1.5 h-8.5 px-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Clear Cart</span>
          </button>

          {/* Generate Invoice */}
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

      {/* Main Grid: Left Cart (65%) | Right Checkout Sidebar (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search / Barcode Input Bar */}
          <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center gap-2.5 relative">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan barcode or search product by name, SKU..."
                className="w-full h-9 pl-9 pr-8 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE] text-gray-800 placeholder-gray-400"
              />
              <Barcode className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />

              {/* Search Dropdown Results */}
              {showResultsDropdown && (
                <div className="absolute left-0 right-0 top-11 bg-white rounded-[8px] shadow-xl border border-gray-100 py-1.5 z-40 max-h-60 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        addToCart(product);
                        setSearchQuery("");
                        setShowResultsDropdown(false);
                      }}
                      className="px-3 py-2 hover:bg-purple-50/60 cursor-pointer flex items-center justify-between text-xs border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[6px] bg-purple-50 flex items-center justify-center text-xs shrink-0">
                          {product.image && product.image.startsWith("http") ? (
                            <img src={product.image} className="w-full h-full object-cover rounded-[6px]" />
                          ) : (
                            "📦"
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{product.sku} {product.barcode ? `• ${product.barcode}` : ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-emerald-600">₹ {Number(product.sellingPrice).toFixed(2)}</span>
                        <span className="text-[10px] text-gray-400 block">Stock: {product.stock} {product.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="h-9 px-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-[8px] text-xs font-medium flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">
                {customer.type === "regular" ? customer.name : "Select Customer"}
              </span>
            </button>
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-2">SKU</th>
                    <th className="py-2.5 px-2">Unit</th>
                    <th className="py-2.5 px-2 text-right">Price (₹)</th>
                    <th className="py-2.5 px-3 text-center w-28">Qty</th>
                    <th className="py-2.5 px-2 text-right w-24">Discount</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                    <th className="py-2.5 px-2 text-center w-12">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-2">
                          <div className="w-10 h-10 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                            <Barcode className="w-5 h-5" />
                          </div>
                          <p className="font-medium text-gray-800 text-xs">Cart is currently empty</p>
                          <p className="text-[11px] text-gray-400">
                            Scan a product barcode or use search above (Press F2) to add items.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50/60">
                        <td className="py-2.5 px-3 text-center text-gray-400 font-medium">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-[6px] bg-purple-50 flex items-center justify-center text-xs shrink-0 overflow-hidden border border-gray-100">
                              {item.image && item.image.startsWith("http") ? (
                                <img src={item.image} className="w-full h-full object-cover" />
                              ) : (
                                "📦"
                              )}
                            </div>
                            <span className="font-medium text-gray-900 truncate max-w-[160px]">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-gray-500 font-mono text-[11px]">{item.sku}</td>
                        <td className="py-2.5 px-2 text-gray-500">{item.unit}</td>
                        <td className="py-2.5 px-2 text-right font-medium text-gray-900">{Number(item.price).toFixed(2)}</td>

                        {/* Qty Stepper */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex items-center border border-gray-200 rounded-[6px] bg-white h-7">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              className="w-6 h-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center font-medium cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-medium text-gray-900">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="w-6 h-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center font-medium cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Item Discount */}
                        <td className="py-2.5 px-2 text-right">
                          <div className="relative inline-block w-20">
                            <input
                              type="number"
                              step="0.5"
                              value={item.discount || ""}
                              placeholder="0.00"
                              onChange={(e) => updateItemDiscount(item.id, Number(e.target.value))}
                              className="w-full h-7 px-2 pr-5 text-right text-xs border border-gray-200 rounded-[6px] focus:outline-none focus:border-[#6320EE]"
                            />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">₹</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                          {Number(item.total).toFixed(2)}
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 rounded-[6px] text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer mx-auto"
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

          {/* Bottom Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-3">
              {/* Discount Box */}
              <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#6320EE]" />
                    <span>Apply Discount</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-[6px] p-0.5 bg-gray-100 text-[11px] font-medium border border-gray-200/60">
                    <button
                      type="button"
                      onClick={() => setDiscountType("flat")}
                      className={`px-2.5 py-1 rounded-[5px] transition-all cursor-pointer ${
                        discountType === "flat" ? "bg-white text-[#6320EE] shadow-2xs" : "text-gray-600"
                      }`}
                    >
                      Flat Discount
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("percentage")}
                      className={`px-2.5 py-1 rounded-[5px] transition-all cursor-pointer ${
                        discountType === "percentage" ? "bg-white text-[#6320EE] shadow-2xs" : "text-gray-600"
                      }`}
                    >
                      Discount (%)
                    </button>
                  </div>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={discountValue || ""}
                      placeholder="0.00"
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full h-8 px-2.5 pr-6 text-right text-xs border border-gray-200 rounded-[6px] focus:outline-none focus:border-[#6320EE]"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {discountType === "flat" ? "₹" : "%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Note Box */}
              <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs space-y-1.5">
                <span className="text-xs font-medium text-gray-800">Add Order Note</span>
                <textarea
                  rows={2}
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  placeholder="Order note / token number..."
                  className="w-full p-2 text-xs border border-gray-200 rounded-[6px] focus:outline-none focus:border-[#6320EE]"
                />
              </div>
            </div>

            {/* Middle Breakdown Summary */}
            <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs space-y-2 text-xs text-gray-600 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Items Total ({cart.length})</span>
                  <span className="font-medium text-gray-900">₹ {subtotal.toFixed(2)}</span>
                </div>
                {overallDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>- ₹ {overallDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxable Amount</span>
                  <span className="font-medium text-gray-900">₹ {taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>CGST (2.5%)</span>
                  <span>₹ {cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>SGST (2.5%)</span>
                  <span>₹ {sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-100 font-medium text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-[#6320EE]">₹ {rawGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payable Amount Block */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-[8px] flex items-center justify-between">
                <span className="font-medium text-emerald-900 text-xs">Payable Amount</span>
                <span className="font-bold text-emerald-700 text-base">₹ {grandTotal.toLocaleString("en-IN")}.00</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4 cols) - Customer & Payment Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Customer Card with Masked Mobile and City */}
          <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#6320EE]" />
                <span className="font-medium text-xs text-gray-900">Customer Details</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCustomerModalTab("search");
                  setIsCustomerModalOpen(true);
                }}
                className="h-6 px-2 bg-purple-50 hover:bg-purple-100 text-[#6320EE] rounded-[6px] text-[11px] font-medium border border-purple-200 cursor-pointer"
              >
                {customer.type === "regular" ? "Change Customer" : "+ Add Customer"}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-900">{customer.name}</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-medium">
                {customer.type === "walkin" ? "Walk-in" : "Registered"}
              </span>
            </div>

            {customer.type === "regular" && (
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1 border-t border-gray-50">
                <div>
                  <span className="text-gray-400 block text-[10px]">Mobile (Masked)</span>
                  <span className="font-medium font-mono text-gray-800">
                    +91 {maskPhoneNumber(customer.phone)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">City / Location</span>
                  <span className="font-medium text-gray-800">{customer.city || "—"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs space-y-3">
            <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
              <span className="font-medium text-xs text-gray-900 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#6320EE]" />
                <span>Payment Summary</span>
              </span>
              <span className="font-bold text-gray-900 text-sm">₹ {grandTotal.toLocaleString("en-IN")}.00</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Paid Amount</span>
              <div className="relative w-32">
                <input
                  type="number"
                  value={paidAmount || ""}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full h-8 px-2.5 pr-6 text-right text-xs font-medium border border-gray-200 rounded-[6px] focus:outline-none focus:border-[#6320EE]"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
              <span className="text-gray-600 font-medium">Balance Change</span>
              <span className="font-bold text-emerald-600 text-sm">₹ {balanceChange.toFixed(2)}</span>
            </div>

            {/* Payment Methods */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <span className="text-[11px] font-medium text-gray-600 block">Payment Method</span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-2 rounded-[8px] border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === "cash"
                      ? "border-[#6320EE] bg-purple-50 text-[#6320EE] font-medium"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px]">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-2 rounded-[8px] border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === "upi"
                      ? "border-[#6320EE] bg-purple-50 text-[#6320EE] font-medium"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px]">UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2 rounded-[8px] border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === "card"
                      ? "border-[#6320EE] bg-purple-50 text-[#6320EE] font-medium"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px]">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("split");
                    setIsSplitModalOpen(true);
                  }}
                  className={`p-2 rounded-[8px] border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === "split"
                      ? "border-[#6320EE] bg-purple-50 text-[#6320EE] font-medium"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Split className="w-4 h-4 text-purple-600" />
                  <span className="text-[10px]">Split</span>
                </button>
              </div>
            </div>

            {/* Quick Cash Buttons */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[grandTotal, 500, 1000, 2000, 5000].map((val, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPaidAmount(val)}
                    className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-medium cursor-pointer"
                  >
                    ₹ {val.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Customer Modal with Search + Add Form Tabs */}
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

            {/* Tab Switcher: Search Existing vs Add New */}
            <div className="flex items-center gap-2 pt-3 border-b border-gray-100 pb-2">
              <button
                type="button"
                onClick={() => setCustomerModalTab("search")}
                className={`px-3 py-1 text-xs font-medium rounded-[6px] cursor-pointer transition-colors ${
                  customerModalTab === "search"
                    ? "bg-purple-50 text-[#6320EE]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Search Customer
              </button>

              <button
                type="button"
                onClick={() => setCustomerModalTab("add")}
                className={`px-3 py-1 text-xs font-medium rounded-[6px] cursor-pointer transition-colors ${
                  customerModalTab === "add"
                    ? "bg-purple-50 text-[#6320EE]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                + Add New Customer
              </button>
            </div>

            {/* Tab 1: Search Customer */}
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
                      <span>Searching customer directory...</span>
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

            {/* Tab 2: Add New Customer */}
            {customerModalTab === "add" && (
              <form onSubmit={handleSaveAndAssignCustomer} className="py-3 space-y-3 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Customer Full Name *</label>
                  <input
                    type="text"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
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
                    <span>Save & Assign to Bill</span>
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
          <div className="bg-white rounded-[8px] max-w-sm w-full p-5 shadow-2xl border border-gray-100 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-medium text-gray-900 text-sm">Split Payment</h3>
              <button onClick={() => setIsSplitModalOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-2.5">
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
              <h3 className="font-medium text-gray-900 text-base">Invoice Settled & Printed!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Bill <strong>#{successInvoice.invoiceNo}</strong> for <strong>₹{successInvoice.grandTotal.toFixed(2)}</strong> completed.
              </p>
            </div>
            <button
              onClick={() => setSuccessInvoice(null)}
              className="w-full h-9 bg-[#6320EE] text-white text-xs font-medium rounded-[8px] cursor-pointer"
            >
              Start Next Sale (F2)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
