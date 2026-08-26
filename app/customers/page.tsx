"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Mail,
  Receipt,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  ShoppingBag,
  TrendingUp,
  X,
  Store,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  city?: string;
  email?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
}

export default function CustomersPage() {
  const { apiFetch, activeBusiness } = useAuth();

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [pageSize, setPageSize] = useState<number>(45);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Add / Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    city: "",
    email: ""
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch live customers from Firebase Firestore
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/customers");
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.warn("Customers fetch notice:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [apiFetch, activeBusiness]);

  // Cities List for Filter
  const uniqueCities = Array.from(
    new Set(customers.map((c) => c.city?.trim()).filter(Boolean))
  );

  // Filtered List
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q));

    const matchesCity =
      selectedCity === "all" || (c.city && c.city.toLowerCase() === selectedCity.toLowerCase());

    return matchesSearch && matchesCity;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, pageSize]);

  // KPI Calculations
  const totalCustomers = customers.length;
  const totalCities = uniqueCities.length;
  const repeatCustomers = customers.filter((c) => (c.totalOrders || 0) > 1).length;

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPhone = customerForm.phone.replace(/\D/g, "").slice(-10);
    if (!customerForm.name.trim() || cleanPhone.length !== 10) {
      setFormError("Please enter a valid customer name and 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        // Update Customer
        const res = await apiFetch(`/customers/${editingCustomer.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: customerForm.name.trim(),
            phone: cleanPhone,
            city: customerForm.city.trim(),
            email: customerForm.email.trim()
          })
        });

        if (res.success) {
          setSuccessMsg("Customer details updated successfully!");
          setIsAddModalOpen(false);
          setEditingCustomer(null);
          fetchCustomers();
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      } else {
        // Create Customer
        const res = await apiFetch("/customers", {
          method: "POST",
          body: JSON.stringify({
            name: customerForm.name.trim(),
            phone: cleanPhone,
            city: customerForm.city.trim(),
            email: customerForm.email.trim()
          })
        });

        if (res.success) {
          setSuccessMsg("Customer added and saved in Firebase Firestore!");
          setIsAddModalOpen(false);
          setCustomerForm({ name: "", phone: "", city: "", email: "" });
          fetchCustomers();
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to save customer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (customer: CustomerRecord) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      city: customer.city || "",
      email: customer.email || ""
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleExportExcel = () => {
    if (filteredCustomers.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(
      filteredCustomers.map((c) => ({
        "Customer Name": c.name,
        "Mobile Number": `+91 ${c.phone}`,
        "City": c.city || "",
        "Email": c.email || "",
        "Total Orders": c.totalOrders || 0,
        "Total Spent (₹)": c.totalSpent || 0,
        "Created Date": new Date(c.createdAt).toLocaleDateString("en-IN")
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers Directory");
    XLSX.writeFile(wb, "customers_directory.xlsx");
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 sm:py-7 space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-gray-900 tracking-tight">Customer Directory</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            Manage your customer database, contact details, city records, and purchase history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={filteredCustomers.length === 0}
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => {
              setEditingCustomer(null);
              setCustomerForm({ name: "", phone: "", city: "", email: "" });
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Registered Customers</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{totalCustomers}</h3>
            <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Stored in Firestore</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-purple-50 text-[#6320EE] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Cities */}
        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Cities & Locations</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{totalCities}</h3>
            <span className="text-[10px] text-gray-400 font-normal mt-0.5 block">Customer Distribution</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* Repeat Customers */}
        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Repeat Buyers</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{repeatCustomers}</h3>
            <span className="text-[10px] text-purple-600 font-normal mt-0.5 block">Loyal Customer Base</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-2xs overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, mobile, city..."
              className="pl-8 pr-3 h-8 text-xs border border-gray-200 rounded-[8px] focus:outline-none focus:border-[#6320EE] w-full text-gray-800"
            />
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-8 px-2.5 bg-white border border-gray-200 rounded-[8px] text-xs font-medium text-gray-700 cursor-pointer focus:outline-none focus:border-[#6320EE]"
            >
              <option value="all">All Cities</option>
              {uniqueCities.map((city, idx) => (
                <option key={idx} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3.5 text-center w-12">#</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Mobile Number</th>
                <th className="py-2.5 px-3">City / Town</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3 text-center">Orders</th>
                <th className="py-2.5 px-3 text-right">Total Spent</th>
                <th className="py-2.5 px-3 text-center w-20">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 text-[#6320EE] animate-spin mx-auto mb-2" />
                    <span>Loading customers directory...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="font-medium text-gray-800 text-xs">No customers found</p>
                      <p className="text-[11px] text-gray-400">
                        Click &apos;Add Customer&apos; above or assign customers during billing.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust, idx) => (
                  <tr key={cust.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3.5 text-center text-gray-400 font-medium">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-50 text-[#6320EE] font-medium flex items-center justify-center text-xs shrink-0">
                          {cust.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{cust.name}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-2.5 px-3 font-mono text-gray-600">
                      +91 {cust.phone}
                    </td>

                    {/* City */}
                    <td className="py-2.5 px-3">
                      {cust.city ? (
                        <span className="inline-flex items-center gap-1 text-gray-700">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{cust.city}</span>
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="py-2.5 px-3 text-gray-500">
                      {cust.email || <span className="text-gray-300">—</span>}
                    </td>

                    {/* Orders */}
                    <td className="py-2.5 px-3 text-center font-medium text-gray-700">
                      {cust.totalOrders || 0}
                    </td>

                    {/* Total Spent */}
                    <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                      ₹ {Number(cust.totalSpent || 0).toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleOpenEdit(cust)}
                        className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#6320EE] hover:bg-purple-50 cursor-pointer mx-auto"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-gray-500 font-normal">
            Showing {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} customers (Page {currentPage} of {totalPages})
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

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6320EE]" />
                <h3 className="font-medium text-gray-900 text-sm">
                  {editingCustomer ? "Edit Customer Details" : "Add New Customer"}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="py-4 space-y-3.5 text-xs">
              
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-[6px] text-rose-600 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Customer Full Name *</label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-8.5 px-3 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Mobile Number (10 Digits) *</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="9876543210"
                    className="w-full h-8.5 pl-11 pr-3 border border-gray-200 rounded-[6px] text-xs font-mono focus:outline-none focus:border-[#6320EE]"
                    required
                  />
                </div>
              </div>

              {/* City / Location */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">City / Location *</label>
                <input
                  type="text"
                  value={customerForm.city}
                  onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                  placeholder="e.g. Nellore / Hyderabad"
                  className="w-full h-8.5 px-3 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Email Address (Optional)</label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full h-8.5 px-3 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[6px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-8 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[6px] shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{editingCustomer ? "Save Changes" : "Save Customer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
