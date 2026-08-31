"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  UserCheck,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building2,
  DollarSign,
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
  Briefcase,
  Calendar,
  Eye,
  Users,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";

export interface EmployeeRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  wageType: "Monthly" | "Daily";
  salary: number;
  role: string;
  status: "Active" | "Inactive";
  joiningDate?: string;
  createdAt: string;
}

const COMMON_ROLES = [
  "Billing Cashier",
  "Sales Staff",
  "Store Manager",
  "Inventory Clerk",
  "Store Helper",
  "Accountant",
  "Delivery Executive",
  "Supervisor",
  "Other"
];

// Helper to get today's date in YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function EmployeesPage() {
  const { apiFetch, activeBusiness } = useAuth();

  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [wageTypeFilter, setWageTypeFilter] = useState<"all" | "Monthly" | "Daily">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Inactive">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(45);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    wageType: "Monthly" as "Monthly" | "Daily",
    salary: "",
    role: "",
    status: "Active" as "Active" | "Inactive",
    joiningDate: getTodayDateString()
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Employees from Backend / Firestore
  const fetchEmployees = async () => {
    if (!activeBusiness) return;
    setIsLoading(true);
    try {
      const res = await apiFetch("/employees");
      if (res && res.data) {
        setEmployees(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.warn("Failed to fetch live employees:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [activeBusiness]);

  // Open modal for new employee
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      city: "",
      address: "",
      wageType: "Monthly",
      salary: "",
      role: "",
      status: "Active",
      joiningDate: getTodayDateString()
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing employee
  const handleOpenEditModal = (emp: EmployeeRecord) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      phone: emp.phone,
      email: emp.email || "",
      city: emp.city,
      address: emp.address,
      wageType: emp.wageType || "Monthly",
      salary: String(emp.salary),
      role: emp.role || "Staff",
      status: emp.status || "Active",
      joiningDate: emp.joiningDate || getTodayDateString()
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save / Update Employee
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPhone = formData.phone.replace(/\D/g, "").slice(-10);
    const salaryNum = parseFloat(formData.salary);

    if (!formData.name.trim()) {
      setFormError("Please enter the employee's full name.");
      return;
    }
    if (cleanPhone.length !== 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!formData.city.trim()) {
      setFormError("Please enter the city.");
      return;
    }
    if (!formData.address.trim()) {
      setFormError("Please enter the full address.");
      return;
    }
    if (isNaN(salaryNum) || salaryNum < 0) {
      setFormError("Please enter a valid salary amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        // Update employee
        const res = await apiFetch(`/employees/${editingEmployee.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: cleanPhone,
            email: formData.email.trim() || undefined,
            city: formData.city.trim(),
            address: formData.address.trim(),
            wageType: formData.wageType,
            salary: salaryNum,
            role: formData.role.trim(),
            status: formData.status,
            joiningDate: formData.joiningDate
          })
        });

        const updated = res?.data || {
          ...editingEmployee,
          name: formData.name.trim(),
          phone: cleanPhone,
          email: formData.email.trim() || undefined,
          city: formData.city.trim(),
          address: formData.address.trim(),
          wageType: formData.wageType,
          salary: salaryNum,
          role: formData.role.trim(),
          status: formData.status,
          joiningDate: formData.joiningDate
        };

        setEmployees(employees.map((emp) => (emp.id === editingEmployee.id ? updated : emp)));
        setSuccessMsg(`Employee details for "${formData.name}" updated successfully!`);
      } else {
        // Create employee
        const res = await apiFetch("/employees", {
          method: "POST",
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: cleanPhone,
            email: formData.email.trim() || undefined,
            city: formData.city.trim(),
            address: formData.address.trim(),
            wageType: formData.wageType,
            salary: salaryNum,
            role: formData.role.trim(),
            status: formData.status,
            joiningDate: formData.joiningDate
          })
        });

        if (res && res.data) {
          setEmployees([res.data, ...employees]);
        } else {
          fetchEmployees();
        }

        setSuccessMsg(`Employee "${formData.name}" added successfully to Firebase!`);
      }

      setIsModalOpen(false);
      setEditingEmployee(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setFormError(err.message || "Failed to save employee details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove employee "${name}"?`)) {
      try {
        await apiFetch(`/employees/${id}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Delete employee error:", err);
      }
      setEmployees(employees.filter((emp) => emp.id !== id));
      setSuccessMsg(`Employee "${name}" deleted.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Unique cities list for filtering
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((emp) => {
      if (emp.city && emp.city.trim()) set.add(emp.city.trim());
    });
    return Array.from(set);
  }, [employees]);

  // Filtered & Paginated Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Wage Type Filter
      if (wageTypeFilter !== "all" && emp.wageType !== wageTypeFilter) return false;

      // Status Filter
      if (statusFilter !== "all" && emp.status !== statusFilter) return false;

      // City Filter
      if (cityFilter !== "all" && emp.city.toLowerCase() !== cityFilter.toLowerCase()) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          emp.name.toLowerCase().includes(q) ||
          emp.phone.includes(q) ||
          emp.city.toLowerCase().includes(q) ||
          emp.address.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q) ||
          (emp.email && emp.email.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [employees, wageTypeFilter, statusFilter, cityFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, wageTypeFilter, statusFilter, cityFilter, pageSize]);

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredEmployees.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(
      filteredEmployees.map((emp, idx) => ({
        "#": idx + 1,
        "Employee Name": emp.name,
        "Role / Designation": emp.role,
        "Mobile Number": emp.phone,
        "Email": emp.email || "N/A",
        "City": emp.city,
        "Full Address": emp.address,
        "Wage Type": emp.wageType,
        "Salary (₹)": emp.salary,
        "Status": emp.status,
        "Joining Date": emp.joiningDate || "N/A",
        "Created At": emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : ""
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees_Staff");
    XLSX.writeFile(wb, `Staff_Employees_${getTodayDateString()}.xlsx`);
  };

  // KPIs
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === "Active").length;
  const monthlyPayroll = employees
    .filter((e) => e.status === "Active" && e.wageType === "Monthly")
    .reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
  const dailyPayroll = employees
    .filter((e) => e.status === "Active" && e.wageType === "Daily")
    .reduce((sum, e) => sum + (Number(e.salary) || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 space-y-5 animate-in fade-in duration-150">
      
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
          <h1 className="text-xl font-medium text-gray-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5.5 h-5.5 text-[#6320EE]" />
            <span>Employees & Staff Management</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            Manage staff profiles, monthly & daily wage payroll, contact addresses, and roles
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="h-8.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[8px] text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="h-8.5 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Staff Members</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{totalEmployees} Employees</h3>
            <span className="text-[10px] text-gray-400 font-normal">{activeCount} Currently Active</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-purple-50 text-[#6320EE] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Active Staff Members</span>
            <h3 className="text-lg font-bold text-emerald-600 mt-1">{activeCount} On Duty</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Eligible for payroll</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Monthly Payroll Est.</span>
            <h3 className="text-lg font-bold text-indigo-600 mt-1">₹ {monthlyPayroll.toLocaleString("en-IN")}</h3>
            <span className="text-[10px] text-indigo-600 font-medium">Fixed monthly wages</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Daily Wage Outflow</span>
            <h3 className="text-lg font-bold text-amber-600 mt-1">₹ {dailyPayroll.toLocaleString("en-IN")} / day</h3>
            <span className="text-[10px] text-amber-600 font-medium">Per day staff basis</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-2xs overflow-hidden">
        
        {/* Search & Filters */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, mobile, city, address, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8.5 pr-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* City Filter */}
            {uniqueCities.length > 0 && (
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="h-8 px-2 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
              >
                <option value="all">All Cities ({uniqueCities.length})</option>
                {uniqueCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {/* Wage Type Filter */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-[8px] border border-gray-200/60 text-xs">
              {[
                { id: "all", label: "All Wages" },
                { id: "Monthly", label: "Monthly" },
                { id: "Daily", label: "Daily" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setWageTypeFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                    wageTypeFilter === tab.id
                      ? "bg-white text-[#6320EE] shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-[8px] border border-gray-200/60 text-xs">
              {[
                { id: "all", label: "All Status" },
                { id: "Active", label: "Active" },
                { id: "Inactive", label: "Inactive" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
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
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3.5 text-center w-12">#</th>
                <th className="py-2.5 px-3">Employee Name & Role</th>
                <th className="py-2.5 px-3">Contact (Phone & Email)</th>
                <th className="py-2.5 px-3">City & Full Address</th>
                <th className="py-2.5 px-3 text-center">Wage Basis</th>
                <th className="py-2.5 px-3 text-right">Salary (₹)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-center w-28">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#6320EE] animate-spin mx-auto mb-2" />
                    <span className="text-xs font-medium text-gray-600 block">Loading employees catalog...</span>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="font-medium text-gray-800 text-xs">No employees found</p>
                      <p className="text-[11px] text-gray-400">
                        Click &apos;Add Employee&apos; to register your store staff, cashiers, helpers, and managers.
                      </p>
                      <button
                        onClick={handleOpenAddModal}
                        className="mt-2 h-7.5 px-3 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[6px] text-xs font-medium cursor-pointer"
                      >
                        + Add Employee
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3.5 text-center text-gray-400 font-medium">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* Name & Role */}
                    <td className="py-3 px-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE] font-bold text-xs shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{emp.name}</span>
                          <span className="inline-block text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-medium mt-0.5">
                            {emp.role || "Staff"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>+91 {emp.phone}</span>
                        </div>
                        {emp.email ? (
                          <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{emp.email}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 italic">No email</span>
                        )}
                      </div>
                    </td>

                    {/* City & Address */}
                    <td className="py-3 px-3 max-w-[220px]">
                      <div>
                        <span className="font-medium text-gray-900 block">{emp.city}</span>
                        <span className="text-[11px] text-gray-500 line-clamp-1" title={emp.address}>
                          {emp.address}
                        </span>
                      </div>
                    </td>

                    {/* Wage Type */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                          emp.wageType === "Daily"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-blue-50 text-blue-700 border border-blue-200/60"
                        }`}
                      >
                        {emp.wageType}
                      </span>
                    </td>

                    {/* Salary */}
                    <td className="py-3 px-3 text-right font-medium">
                      <div>
                        <span className="font-bold text-gray-900 text-xs">
                          ₹ {Number(emp.salary).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-normal">
                          {emp.wageType === "Daily" ? "/ day" : "/ month"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium ${
                          emp.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>

                    {/* Actions: View, Edit, Delete */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="p-1.5 text-gray-500 hover:text-[#6320EE] hover:bg-purple-50 rounded-[6px] transition-colors"
                          title="View Employee Profile & Records"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 text-gray-500 hover:text-[#6320EE] hover:bg-purple-50 rounded-[6px] transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-[6px] transition-colors"
                          title="Delete Employee"
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
        {filteredEmployees.length > 0 && (
          <div className="p-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs text-gray-500">
            <div>
              Showing <span className="font-medium text-gray-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium text-gray-800">
                {Math.min(currentPage * pageSize, filteredEmployees.length)}
              </span>{" "}
              of <span className="font-medium text-gray-800">{filteredEmployees.length}</span> staff
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-[10px] w-full max-w-lg shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {editingEmployee ? "Edit Employee Details" : "Add New Employee"}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Staff profile, wage payroll basis, contact, and address
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEmployee} className="p-4.5 space-y-3.5">
              
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-[6px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Full Name & Role (2 Column) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Employee Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-8.5 px-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role / Designation <span className="text-gray-400 text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cashier, Sales Manager, Helper"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-8.5 px-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                  />
                </div>
              </div>

              {/* 2. Mobile & Email (2 Column) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-xs">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-8.5 pl-10 pr-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address <span className="text-gray-400 text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="ramesh@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-8.5 px-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                  />
                </div>
              </div>

              {/* 3. City & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nellore"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-8.5 px-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Door No, Street Name, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full h-8.5 px-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                  />
                </div>
              </div>

              {/* 4. Wage Type (Monthly / Daily) & Salary */}
              <div className="p-3 bg-purple-50/50 rounded-[8px] border border-purple-100/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-800">Wage Type & Salary</label>
                  <span className="text-[10px] text-purple-700 font-medium">Select frequency</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  
                  {/* Wage Type Toggle */}
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1 font-medium">Payment Basis</label>
                    <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-[6px] border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, wageType: "Monthly" })}
                        className={`py-1.5 rounded-[4px] text-xs font-medium transition-all cursor-pointer ${
                          formData.wageType === "Monthly"
                            ? "bg-[#6320EE] text-white shadow-2xs"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Monthly
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, wageType: "Daily" })}
                        className={`py-1.5 rounded-[4px] text-xs font-medium transition-all cursor-pointer ${
                          formData.wageType === "Daily"
                            ? "bg-[#6320EE] text-white shadow-2xs"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Daily
                      </button>
                    </div>
                  </div>

                  {/* Salary Input */}
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1 font-medium">
                      {formData.wageType === "Monthly" ? "Monthly Salary (₹)" : "Daily Wage Rate (₹)"} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder={formData.wageType === "Monthly" ? "18000" : "600"}
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="w-full h-8.5 pl-7 pr-3 text-xs font-bold text-gray-900 bg-white rounded-[6px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* 5. Status & Joining Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full h-8.5 px-2 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full h-8.5 px-3 text-xs text-gray-800 rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8.5 px-4 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-[8px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-8.5 px-5 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[8px] text-xs font-medium shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingEmployee ? "Update Employee" : "Save Employee"}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
