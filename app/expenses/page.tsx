"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Search,
  Plus,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
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
  Filter,
  FileSpreadsheet,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  Receipt,
  Layers
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";

export interface ExpenseRecord {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  paymentMode: string;
  notes?: string;
  createdAt: string;
}

const EXPENSE_CATEGORIES = [
  "General",
  "Capital Investment",
  "Shop Rent & Lease",
  "Electricity & Utilities",
  "Salaries & Wages",
  "Equipment & Machinery",
  "Marketing & Advertising",
  "Repairs & Maintenance",
  "Transportation & Logistics",
  "Office Supplies & Petty Cash",
  "Taxes & Licenses",
  "Other"
];

const PAYMENT_MODES = [
  "Cash",
  "UPI / Online (GPay / PhonePe)",
  "Bank Transfer (NEFT / RTGS)",
  "Credit / Debit Card",
  "Cheque"
];

// Helper to get today's date in YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ExpensesPage() {
  const { apiFetch, activeBusiness } = useAuth();

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "month" | "last30">("all");
  const [pageSize, setPageSize] = useState<number>(45);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: getTodayDateString(), // by default select today's date
    category: "General",
    paymentMode: "Cash",
    notes: ""
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Expenses
  const fetchExpenses = async () => {
    if (!activeBusiness) return;
    setIsLoading(true);
    try {
      const res = await apiFetch("/expenses");
      if (res && res.data) {
        setExpenses(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.warn("Failed to load live expenses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [activeBusiness]);

  // Open modal for new entry
  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      name: "",
      amount: "",
      date: getTodayDateString(), // default select today's date
      category: "General",
      paymentMode: "Cash",
      notes: ""
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (item: ExpenseRecord) => {
    setEditingExpense(item);
    setFormData({
      name: item.name,
      amount: String(item.amount),
      date: item.date || getTodayDateString(),
      category: item.category || "General",
      paymentMode: item.paymentMode || "Cash",
      notes: item.notes || ""
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save / Submit Expense
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amountNum = parseFloat(formData.amount);
    if (!formData.name.trim()) {
      setFormError("Please enter the expense or investment name.");
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError("Please enter a valid expense amount greater than 0.");
      return;
    }
    if (!formData.date) {
      setFormError("Please select a valid date.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExpense) {
        // Update existing expense
        const res = await apiFetch(`/expenses/${editingExpense.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: formData.name.trim(),
            amount: amountNum,
            date: formData.date,
            category: formData.category,
            paymentMode: formData.paymentMode,
            notes: formData.notes.trim()
          })
        });

        const updated = res?.data || {
          ...editingExpense,
          name: formData.name.trim(),
          amount: amountNum,
          date: formData.date,
          category: formData.category,
          paymentMode: formData.paymentMode,
          notes: formData.notes.trim()
        };

        setExpenses(expenses.map((e) => (e.id === editingExpense.id ? updated : e)));
        setSuccessMsg(`Expense "${formData.name}" updated successfully!`);
      } else {
        // Create new expense
        const res = await apiFetch("/expenses", {
          method: "POST",
          body: JSON.stringify({
            name: formData.name.trim(),
            amount: amountNum,
            date: formData.date,
            category: formData.category,
            paymentMode: formData.paymentMode,
            notes: formData.notes.trim()
          })
        });

        if (res && res.data) {
          setExpenses([res.data, ...expenses]);
        } else {
          fetchExpenses();
        }

        setSuccessMsg(`New expense "${formData.name}" (₹${amountNum.toLocaleString("en-IN")}) added successfully!`);
      }

      setIsModalOpen(false);
      setEditingExpense(null);
      setFormData({
        name: "",
        amount: "",
        date: getTodayDateString(),
        category: "General",
        paymentMode: "Cash",
        notes: ""
      });
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setFormError(err.message || "Failed to save expense details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete expense "${name}"?`)) {
      try {
        await apiFetch(`/expenses/${id}`, { method: "DELETE" });
      } catch (e) {
        console.warn("Delete API error:", e);
      }
      setExpenses(expenses.filter((e) => e.id !== id));
      setSuccessMsg(`Expense "${name}" removed successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Filtered & Paginated
  const filteredExpenses = useMemo(() => {
    const todayStr = getTodayDateString();
    const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM

    return expenses.filter((item) => {
      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      // Time Filter
      if (timeFilter === "today") {
        if (item.date !== todayStr) return false;
      } else if (timeFilter === "month") {
        if (!item.date || !item.date.startsWith(currentYearMonth)) return false;
      } else if (timeFilter === "last30") {
        const itemDate = new Date(item.date).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 86400000;
        if (isNaN(itemDate) || itemDate < thirtyDaysAgo) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.paymentMode.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          item.date.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [expenses, categoryFilter, timeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, timeFilter, pageSize]);

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredExpenses.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(
      filteredExpenses.map((e, idx) => ({
        "#": idx + 1,
        "Expense / Investment Name": e.name,
        "Category": e.category,
        "Date": e.date,
        "Amount (₹)": e.amount,
        "Payment Mode": e.paymentMode,
        "Notes / Remarks": e.notes || "",
        "Recorded On": e.createdAt ? new Date(e.createdAt).toLocaleString() : ""
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses_Investments");
    XLSX.writeFile(wb, `Expenses_Investments_${getTodayDateString()}.xlsx`);
  };

  // KPIs
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const todayAmount = useMemo(() => {
    const todayStr = getTodayDateString();
    return expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const monthAmount = useMemo(() => {
    const currentYearMonth = getTodayDateString().substring(0, 7);
    return expenses
      .filter((e) => e.date && e.date.startsWith(currentYearMonth))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const highestExpense = useMemo(() => {
    if (expenses.length === 0) return 0;
    return Math.max(...expenses.map((e) => Number(e.amount) || 0));
  }, [expenses]);

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
            <PiggyBank className="w-5.5 h-5.5 text-[#6320EE]" />
            <span>Investments & Expenses</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            Track business capital investments, store operational expenses, petty cash, and bills
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
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total Recorded Outflow</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">₹ {totalAmount.toLocaleString("en-IN")}</h3>
            <span className="text-[10px] text-gray-400 font-normal">{expenses.length} total entries</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-purple-50 text-[#6320EE] flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">This Month&apos;s Expenses</span>
            <h3 className="text-lg font-bold text-indigo-600 mt-1">₹ {monthAmount.toLocaleString("en-IN")}</h3>
            <span className="text-[10px] text-indigo-600 font-medium">Current billing cycle</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Today&apos;s Expenses</span>
            <h3 className="text-lg font-bold text-amber-600 mt-1">₹ {todayAmount.toLocaleString("en-IN")}</h3>
            <span className="text-[10px] text-amber-600 font-medium">Daily petty cash & bills</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Largest Single Investment</span>
            <h3 className="text-lg font-bold text-emerald-600 mt-1">₹ {highestExpense.toLocaleString("en-IN")}</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Peak transaction</span>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
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
              placeholder="Search by expense name, category, payment mode, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8.5 pr-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 px-2 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
            >
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Time Filter Pills */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-[8px] border border-gray-200/60 text-xs">
              {[
                { id: "all", label: "All Time" },
                { id: "today", label: "Today" },
                { id: "month", label: "This Month" },
                { id: "last30", label: "Last 30 Days" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                    timeFilter === tab.id
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

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3.5 text-center w-12">#</th>
                <th className="py-2.5 px-3">Expense / Investment Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3">Payment Mode</th>
                <th className="py-2.5 px-3">Notes / Remarks</th>
                <th className="py-2.5 px-3.5 text-center w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#6320EE] animate-spin mx-auto mb-2" />
                    <span className="text-xs font-medium text-gray-600 block">Loading expenses & investments...</span>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                        <PiggyBank className="w-5 h-5" />
                      </div>
                      <p className="font-medium text-gray-800 text-xs">No expenses found</p>
                      <p className="text-[11px] text-gray-400">
                        Click &apos;Add Expense&apos; to record store expenses, capital investments, or bill payments.
                      </p>
                      <button
                        onClick={handleOpenAddModal}
                        className="mt-2 h-7.5 px-3 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[6px] text-xs font-medium cursor-pointer"
                      >
                        + Add Expense
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3.5 text-center text-gray-400 font-medium">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[6px] bg-purple-50 flex items-center justify-center text-[#6320EE] font-bold text-xs shrink-0">
                          ₹
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{item.name}</span>
                          <span className="text-[10px] text-gray-400">ID: {item.id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                        {item.category || "General"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-gray-600 font-medium">
                      {item.date ? new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-gray-900 text-xs">
                        ₹ {Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3 px-3 text-gray-600">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">
                        {item.paymentMode || "Cash"}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-3 text-gray-500 max-w-[200px] truncate" title={item.notes || ""}>
                      {item.notes || <span className="text-gray-300 italic">None</span>}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1 text-gray-400 hover:text-[#6320EE] hover:bg-purple-50 rounded transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(item.id, item.name)}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Expense"
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
        {filteredExpenses.length > 0 && (
          <div className="p-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs text-gray-500">
            <div>
              Showing <span className="font-medium text-gray-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium text-gray-800">
                {Math.min(currentPage * pageSize, filteredExpenses.length)}
              </span>{" "}
              of <span className="font-medium text-gray-800">{filteredExpenses.length}</span> expenses
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

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-[10px] w-full max-w-lg shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {editingExpense ? "Edit Expense / Investment" : "Add New Expense / Investment"}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Record expenditure, capital investments, and utility costs
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

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveExpense} className="p-4.5 space-y-3.5">
              
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-[6px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Expense / Investment Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shop Rent, Electricity Bill, Packaging Bags, Salary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-8.5 px-3 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                />
              </div>

              {/* 2. Amount & Date (2 Column) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full h-8.5 pl-7 pr-3 text-xs font-semibold text-gray-900 rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expense Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full h-8.5 px-3 text-xs text-gray-800 rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Defaults to today</span>
                </div>
              </div>

              {/* 3. Category & Payment Mode (2 Column) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-8.5 px-2 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full h-8.5 px-2 text-xs rounded-[8px] border border-gray-200 bg-white focus:outline-none focus:border-[#6320EE]"
                  >
                    {PAYMENT_MODES.map((pm) => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Notes / Description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes / Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional remarks, invoice reference, or payment details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-[8px] border border-gray-200 focus:outline-none focus:border-[#6320EE]"
                />
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
                    <span>{editingExpense ? "Update Expense" : "Save Expense"}</span>
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
