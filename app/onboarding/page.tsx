"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Store,
  Plus,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Lock,
  LogOut,
  Check,
  X,
  Loader2,
  Clock
} from "lucide-react";
import { useAuth, Business } from "@/context/AuthContext";

export default function OnboardingPage() {
  const { user, token, businesses, refreshBusinesses, selectBusiness, logout, apiFetch } = useAuth();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [securityBlockedBiz, setSecurityBlockedBiz] = useState<Business | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New business form state
  const [newBiz, setNewBiz] = useState({
    name: "",
    city: "",
    address: ""
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    refreshBusinesses();
  }, [token]);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBiz.name.trim() || !newBiz.city.trim()) return;

    setIsCreating(true);
    try {
      await apiFetch("/businesses", {
        method: "POST",
        body: JSON.stringify(newBiz)
      });
      setIsAddModalOpen(false);
      setNewBiz({ name: "", city: "", address: "" });
      await refreshBusinesses();
    } catch (err: any) {
      alert(err.message || "Failed to create business");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenSoftware = (b: Business) => {
    const success = selectBusiness(b);
    if (success) {
      router.push("/products");
    } else {
      // Show strict security block modal
      setSecurityBlockedBiz(b);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/onboarding" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="RetailNext Logo"
              width={140}
              height={38}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-medium text-gray-900 block leading-tight">
                {user?.fullName || "Store Owner"}
              </span>
              <span className="text-[11px] text-gray-400 font-normal">
                +91 {user?.phone}
              </span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
        {/* Title and Add Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Your Businesses & Outlets</h1>
            <p className="text-xs text-gray-500 mt-1 font-normal">
              Select an active business to launch the POS software or add a new branch
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-2xs transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Business</span>
          </button>
        </div>

        {/* Businesses List Grid */}
        {businesses.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-10 text-center max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE] mx-auto mb-4">
              <Store className="w-7 h-7" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No businesses found</h3>
            <p className="text-xs text-gray-400 mb-6 font-normal leading-relaxed">
              You have not added any retail store or outlet yet. Click below to add your first business.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-8 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Business</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {businesses.map((b) => {
              const isExpired = !b.expiryDate || new Date(b.expiryDate) <= new Date();
              const isActive = b.status === "active" && !isExpired;

              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-[8px] border p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all hover:shadow-md ${
                    isActive ? "border-gray-100/90" : "border-amber-200/80 bg-amber-50/10"
                  }`}
                >
                  <div>
                    {/* Header: Store Icon + Status Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-[8px] bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6320EE]">
                        <Store className="w-5 h-5" />
                      </div>

                      {/* Status Badges */}
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] font-medium">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : isExpired && b.expiryDate ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-rose-50 text-rose-600 border border-rose-100 text-[11px] font-medium">
                          <Clock className="w-3 h-3" />
                          <span>Expired</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
                          <Lock className="w-3 h-3" />
                          <span>Inactive (Pending)</span>
                        </span>
                      )}
                    </div>

                    {/* Business Name & City */}
                    <h3 className="font-medium text-gray-900 text-base leading-snug">{b.name}</h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1 font-normal">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{b.city} {b.address ? `• ${b.address}` : ""}</span>
                    </div>

                    {/* Subscription & Expiry info */}
                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-500 font-normal">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Subscription:</span>
                        <span className="font-medium text-gray-800">{b.plan || "Standard"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Expiry Date:</span>
                        <span className={`font-medium ${isActive ? "text-emerald-600" : "text-amber-600"}`}>
                          {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString("en-GB") : "Not Set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end">
                    <button
                      onClick={() => handleOpenSoftware(b)}
                      className={`h-8 px-4 rounded-[8px] text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#6320EE] hover:bg-[#5218cf] text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <span>Open Software</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Business Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBusiness}
            className="bg-white rounded-[8px] max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900 text-base">Add New Business / Outlet</h3>
                <p className="text-[11px] text-gray-400 font-normal">
                  Creates an outlet assigned to your account (Inactive by default)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs font-normal">
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Business / Store Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Sweets & Bakery"
                  value={newBiz.name}
                  onChange={(e) => setNewBiz({ ...newBiz, name: e.target.value })}
                  className="w-full h-8.5 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">City / Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad"
                  value={newBiz.city}
                  onChange={(e) => setNewBiz({ ...newBiz, city: e.target.value })}
                  className="w-full h-8.5 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Store Address (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Shop #12, Jubilee Hills Road No. 36"
                  value={newBiz.address}
                  onChange={(e) => setNewBiz({ ...newBiz, address: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-[8px] text-[11px] text-amber-800 leading-relaxed font-normal">
                <strong>Notice:</strong> Newly created businesses are assigned with <em>Inactive</em> status and null expiry date. Access will remain pending until activated.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[8px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="h-8 px-3.5 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Business</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Strict Security Block Alert Modal */}
      {securityBlockedBiz && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150 border border-rose-100">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-[8px] bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Security Guard: Access Restricted</h3>
                <p className="text-[11px] text-gray-400 font-normal">{securityBlockedBiz.name}</p>
              </div>
            </div>

            <div className="py-4 text-xs font-normal text-gray-600 space-y-2.5">
              <p>
                Access to the POS & Inventory software is blocked for this outlet:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-[11.5px]">
                <li>This business status is currently <strong>Inactive</strong>.</li>
                <li>The subscription expiry date has not been set or has expired.</li>
              </ul>
              <div className="p-2.5 bg-gray-50 rounded-[8px] border border-gray-100 text-[11px] text-gray-500">
                <strong>Current Status:</strong> {securityBlockedBiz.status.toUpperCase()} | <strong>Expiry:</strong> {securityBlockedBiz.expiryDate ? new Date(securityBlockedBiz.expiryDate).toLocaleDateString("en-GB") : "Not Set"}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setSecurityBlockedBiz(null)}
                className="h-8 px-4 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-[8px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        <p>© 2026 RetailNext Software Inc. Strict multi-tenant data partitioning enabled.</p>
      </footer>
    </div>
  );
}
