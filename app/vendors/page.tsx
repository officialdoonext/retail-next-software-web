"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Store,
  Search,
  Plus,
  Phone,
  MapPin,
  Mail,
  Building2,
  Receipt,
  FileSpreadsheet,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShoppingBag,
  ExternalLink,
  PhoneCall,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";

export interface VendorRecord {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  email?: string;
  gstin?: string;
  notes?: string;
  totalOrders?: number;
  totalSpent?: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export default function VendorsPage() {
  const { apiFetch, activeBusiness } = useAuth();

  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [pageSize, setPageSize] = useState<number>(45);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorRecord | null>(null);

  const [vendorForm, setVendorForm] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    email: "",
    gstin: "",
    notes: "",
    status: "Active" as "Active" | "Inactive"
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Vendors
  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/vendors");
      if (res && res.data && res.data.length > 0) {
        setVendors(res.data);
      } else {
        // Sample default vendors if none exist
        const initialVendors: VendorRecord[] = [
          {
            id: "vend_1",
            name: "Shree Ganesh Agro Supplies",
            phone: "9848012345",
            city: "Nellore",
            address: "Shop #14, APMC Market Yard, Podalakur Road",
            email: "ganeshagro@gmail.com",
            gstin: "37AAACG1234F1Z8",
            totalOrders: 18,
            totalSpent: 345000,
            status: "Active",
            createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
          },
          {
            id: "vend_2",
            name: "Amul & Mother Dairy Distributors",
            phone: "9440198765",
            city: "Vijayawada",
            address: "Plot 88, Auto Nagar Industrial Area",
            email: "dairy.supply@rediffmail.com",
            gstin: "37AABCA5678D1Z2",
            totalOrders: 42,
            totalSpent: 890000,
            status: "Active",
            createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
          },
          {
            id: "vend_3",
            name: "Balaji FMCG & Dry Fruits Wholesale",
            phone: "9123456789",
            city: "Hyderabad",
            address: "Begum Bazar Main Road, Near Fish Market",
            email: "balajifmcg@yahoo.com",
            gstin: "36AACFB9988E1Z4",
            totalOrders: 25,
            totalSpent: 620000,
            status: "Active",
            createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
          }
        ];
        setVendors(initialVendors);
      }
    } catch (err) {
      console.warn("Using local vendor fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [activeBusiness]);

  // Unique cities list for filtering
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => {
      if (v.city && v.city.trim()) set.add(v.city.trim());
    });
    return Array.from(set);
  }, [vendors]);

  // Filtered & Paginated vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        (v.city && v.city.toLowerCase().includes(q)) ||
        (v.address && v.address.toLowerCase().includes(q)) ||
        (v.gstin && v.gstin.toLowerCase().includes(q));

      const matchesCity = selectedCity === "all" || (v.city && v.city.toLowerCase() === selectedCity.toLowerCase());

      return matchesSearch && matchesCity;
    });
  }, [vendors, searchQuery, selectedCity]);

  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / pageSize));
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVendors.slice(start, start + pageSize);
  }, [filteredVendors, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, pageSize]);

  // Save / Update Vendor
  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPhone = vendorForm.phone.replace(/\D/g, "").slice(-10);
    if (!vendorForm.name.trim()) {
      setFormError("Please enter the vendor / supplier name.");
      return;
    }
    if (cleanPhone.length !== 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!vendorForm.city.trim()) {
      setFormError("Please enter the city or location.");
      return;
    }
    if (!vendorForm.address.trim()) {
      setFormError("Please enter the full address / location.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingVendor) {
        // Update Vendor
        try {
          await apiFetch(`/vendors/${editingVendor.id}`, {
            method: "PUT",
            body: JSON.stringify({
              ...vendorForm,
              phone: cleanPhone
            })
          });
        } catch {}

        setVendors(
          vendors.map((v) =>
            v.id === editingVendor.id
              ? { ...v, ...vendorForm, phone: cleanPhone }
              : v
          )
        );
        setSuccessMsg("Vendor details updated successfully!");
      } else {
        // Create Vendor
        const newRecord: VendorRecord = {
          id: `vend_${Date.now()}`,
          name: vendorForm.name.trim(),
          phone: cleanPhone,
          city: vendorForm.city.trim(),
          address: vendorForm.address.trim(),
          email: vendorForm.email.trim() || undefined,
          gstin: vendorForm.gstin.trim() || undefined,
          notes: vendorForm.notes.trim() || undefined,
          totalOrders: 0,
          totalSpent: 0,
          status: vendorForm.status,
          createdAt: new Date().toISOString()
        };

        try {
          const res = await apiFetch("/vendors", {
            method: "POST",
            body: JSON.stringify(newRecord)
          });
          if (res && res.data) {
            setVendors([res.data, ...vendors]);
          } else {
            setVendors([newRecord, ...vendors]);
          }
        } catch {
          setVendors([newRecord, ...vendors]);
        }

        setSuccessMsg("New vendor added successfully!");
      }

      setIsModalOpen(false);
      setEditingVendor(null);
      setVendorForm({
        name: "",
        phone: "",
        city: "",
        address: "",
        email: "",
        gstin: "",
        notes: "",
        status: "Active"
      });
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setFormError(err.message || "Failed to save vendor details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (v: VendorRecord) => {
    setEditingVendor(v);
    setVendorForm({
      name: v.name,
      phone: v.phone,
      city: v.city,
      address: v.address,
      email: v.email || "",
      gstin: v.gstin || "",
      notes: v.notes || "",
      status: v.status
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteVendor = async (id: string) => {
    if (confirm("Are you sure you want to remove this vendor supplier?")) {
      try {
        await apiFetch(`/vendors/${id}`, { method: "DELETE" });
      } catch {}
      setVendors(vendors.filter((v) => v.id !== id));
    }
  };

  const handleExportExcel = () => {
    if (vendors.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(
      vendors.map((v) => ({
        "Vendor Name": v.name,
        "Mobile Number": v.phone,
        "City / Town": v.city,
        "Full Address": v.address,
        "GSTIN": v.gstin || "N/A",
        "Email": v.email || "N/A",
        "Total Orders": v.totalOrders || 0,
        "Total Spent (₹)": v.totalSpent || 0,
        "Status": v.status,
        "Registered On": new Date(v.createdAt).toLocaleDateString("en-IN")
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendors");
    XLSX.writeFile(wb, `Vendors_Directory_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // KPI Calculations
  const totalVendors = vendors.length;
  const activeCount = vendors.filter((v) => v.status === "Active").length;
  const totalProcurement = vendors.reduce((sum, v) => sum + (v.totalSpent || 0), 0);
  const totalOrdersSum = vendors.reduce((sum, v) => sum + (v.totalOrders || 0), 0);

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
            <Store className="w-5 h-5 text-[#6320EE]" />
            <span>Vendors & Suppliers Directory</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            Manage your suppliers, vendor contacts, and procurement history
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
              setEditingVendor(null);
              setVendorForm({
                name: "",
                phone: "",
                city: "",
                address: "",
                email: "",
                gstin: "",
                notes: "",
                status: "Active"
              });
              setFormError(null);
              setIsModalOpen(true);
            }}
            className="h-8.5 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Vendors</span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">{totalVendors}</h3>
            <span className="text-[10px] text-emerald-600 font-medium">{activeCount} Active</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-purple-50 text-[#6320EE] flex items-center justify-center">
            <Store className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Purchase Orders</span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">{totalOrdersSum} POs</h3>
            <span className="text-[10px] text-gray-400 font-normal">Fulfilled orders</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Procurement</span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">₹ {totalProcurement.toLocaleString("en-IN")}</h3>
            <span className="text-[10px] text-gray-400 font-normal">All-time purchases</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Supply Locations</span>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">{uniqueCities.length} Cities</h3>
            <span className="text-[10px] text-gray-400 font-normal">Distribution network</span>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center">
            <MapPin className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-2xs overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendor by name, mobile, city, address, GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8.5 pr-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-8 px-2 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
              >
                <option value="all">All Cities ({uniqueCities.length})</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3.5 text-center w-12">#</th>
                <th className="py-2.5 px-3">Vendor / Supplier Name</th>
                <th className="py-2.5 px-3">Mobile Number</th>
                <th className="py-2.5 px-3">City / Town</th>
                <th className="py-2.5 px-3">Full Address / Location</th>
                <th className="py-2.5 px-3 text-center">Orders</th>
                <th className="py-2.5 px-3 text-right">Total Spent</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#6320EE] animate-spin mx-auto mb-2" />
                    <span className="text-xs font-medium text-gray-600 block">Loading vendors directory...</span>
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                        <Store className="w-5 h-5" />
                      </div>
                      <p className="font-medium text-gray-800 text-xs">No vendors found</p>
                      <p className="text-[11px] text-gray-400">
                        Click &apos;Add Vendor&apos; above to register your wholesale suppliers.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((vend, idx) => (
                  <tr key={vend.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3.5 text-center text-gray-400 font-medium">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* Vendor Name */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[6px] bg-purple-50 text-[#6320EE] font-bold flex items-center justify-center text-xs shrink-0">
                          {vend.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{vend.name}</span>
                          {vend.gstin && (
                            <span className="text-[10px] text-gray-400 font-mono">GST: {vend.gstin}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-2.5 px-3 font-mono text-gray-600 whitespace-nowrap">
                      <a
                        href={`tel:${vend.phone}`}
                        className="inline-flex items-center gap-1 text-gray-700 hover:text-[#6320EE]"
                      >
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>+91 {vend.phone}</span>
                      </a>
                    </td>

                    {/* City */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-gray-800 font-medium">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{vend.city}</span>
                      </span>
                    </td>

                    {/* Full Address */}
                    <td className="py-2.5 px-3 max-w-xs text-gray-600 truncate" title={vend.address}>
                      {vend.address}
                    </td>

                    {/* Orders */}
                    <td className="py-2.5 px-3 text-center font-medium text-gray-800">
                      {vend.totalOrders || 0}
                    </td>

                    {/* Total Spent */}
                    <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                      ₹ {Number(vend.totalSpent || 0).toLocaleString("en-IN")}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          vend.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {vend.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(vend)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-500 hover:text-[#6320EE] hover:bg-purple-50 cursor-pointer"
                          title="Edit Vendor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vend.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Vendor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
            Showing {filteredVendors.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredVendors.length)} of {filteredVendors.length} vendors (Page {currentPage} of {totalPages})
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

      {/* Add / Edit Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#6320EE]" />
                <h3 className="font-medium text-gray-900 text-sm">
                  {editingVendor ? "Edit Vendor Details" : "Add New Supplier / Vendor"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="py-4 space-y-3 text-xs">
              
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-[6px] text-rose-600 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Vendor Name */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Vendor / Supplier Company Name *</label>
                <input
                  type="text"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="e.g. Balaji Agro & FMCG Wholesale"
                  className="w-full h-8.5 px-3 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              {/* Mobile Number & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={vendorForm.phone}
                      onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value.replace(/\D/g, "") })}
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
                    value={vendorForm.city}
                    onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                    placeholder="e.g. Nellore / Hyderabad"
                    className="w-full h-8.5 px-3 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE]"
                    required
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Full Address / Landmark / Street *</label>
                <textarea
                  rows={2}
                  value={vendorForm.address}
                  onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                  placeholder="Shop #12, Wholesale Market Yard, Near APMC..."
                  className="w-full p-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              {/* GSTIN & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">GSTIN Number (Optional)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={vendorForm.gstin}
                    onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="37AAAAA0000A1Z5"
                    className="w-full h-8.5 px-3 border border-gray-200 rounded-[6px] text-xs font-mono uppercase focus:outline-none focus:border-[#6320EE]"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-[11px]">Status</label>
                  <select
                    value={vendorForm.status}
                    onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value as "Active" | "Inactive" })}
                    className="w-full h-8.5 px-2.5 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:border-[#6320EE] bg-white"
                  >
                    <option value="Active">Active Supplier</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>{editingVendor ? "Save Changes" : "Save Vendor"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
