"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  Receipt,
  Usb,
  Bluetooth,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  FileText,
  Percent,
  Sliders,
  DollarSign,
  Scissors,
  Check,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePrinter } from "@/context/PrinterContext";

export default function SettingsPage() {
  const { activeBusiness, apiFetch } = useAuth();
  const {
    isConnected,
    connectionType,
    deviceName,
    config,
    isConnecting,
    errorMessage: printerError,
    connectUsb,
    connectBluetooth,
    disconnectPrinter,
    testPrint,
    updateConfig
  } = usePrinter();

  const [activeTab, setActiveTab] = useState<"profile" | "gst" | "printer">("profile");

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    category: "Retail & Supermarket",
    currency: "INR (₹)"
  });

  // GST Form State
  const [gstForm, setGstForm] = useState({
    isGstEnabled: false,
    gstNumber: "",
    tradeName: "",
    gstRate: 18,
    taxType: "inclusive" as "inclusive" | "exclusive"
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingGst, setIsSavingGst] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [gstSuccessMsg, setGstSuccessMsg] = useState("");
  const [testPrintSuccess, setTestPrintSuccess] = useState(false);
  const [isTestPrinting, setIsTestPrinting] = useState(false);

  // Load active business details
  useEffect(() => {
    if (activeBusiness) {
      setProfileForm({
        name: activeBusiness.name || "",
        city: activeBusiness.city || "",
        address: (activeBusiness as any).address || "",
        phone: (activeBusiness as any).phone || "",
        email: (activeBusiness as any).email || "",
        category: (activeBusiness as any).category || "Retail & Supermarket",
        currency: (activeBusiness as any).currency || "INR (₹)"
      });

      setGstForm({
        isGstEnabled: Boolean((activeBusiness as any).isGstEnabled),
        gstNumber: (activeBusiness as any).gstNumber || "",
        tradeName: (activeBusiness as any).tradeName || (activeBusiness.name || ""),
        gstRate: Number((activeBusiness as any).gstRate) || 18,
        taxType: (activeBusiness as any).taxType || "inclusive"
      });
    }
  }, [activeBusiness]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness?.id) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg("");

    try {
      const res = await apiFetch(`/businesses/${activeBusiness.id}`, {
        method: "PUT",
        body: JSON.stringify(profileForm)
      });

      if (res.success) {
        setProfileSuccessMsg("Business profile updated successfully in Firebase Firestore!");
        // Update local session
        const updatedBiz = { ...activeBusiness, ...profileForm };
        localStorage.setItem("rn_active_business", JSON.stringify(updatedBiz));
        setTimeout(() => setProfileSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      alert("Failed to save profile: " + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveGst = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness?.id) return;

    setIsSavingGst(true);
    setGstSuccessMsg("");

    try {
      const res = await apiFetch(`/businesses/${activeBusiness.id}`, {
        method: "PUT",
        body: JSON.stringify(gstForm)
      });

      if (res.success) {
        setGstSuccessMsg("GST & Taxation settings saved successfully in Firebase Firestore!");
        const updatedBiz = { ...activeBusiness, ...gstForm };
        localStorage.setItem("rn_active_business", JSON.stringify(updatedBiz));
        setTimeout(() => setGstSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      alert("Failed to save GST settings: " + err.message);
    } finally {
      setIsSavingGst(false);
    }
  };

  const handleTestPrint = async () => {
    setIsTestPrinting(true);
    setTestPrintSuccess(false);
    const ok = await testPrint(activeBusiness?.name || "Retail Next Store");
    setIsTestPrinting(false);
    if (ok) {
      setTestPrintSuccess(true);
      setTimeout(() => setTestPrintSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 sm:py-7 space-y-6">
      
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-medium text-gray-900 tracking-tight">Settings & Preferences</h1>
        <p className="text-xs text-gray-400 mt-0.5 font-normal">
          Manage your business profile, GST tax details, and thermal printer setup
        </p>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-3 gap-4 flex-wrap">
        <div className="inline-flex items-center p-1 bg-gray-100/80 rounded-[8px] border border-gray-200/60">
          
          {/* Tab 1: Profile */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-white text-[#6320EE] shadow-2xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${activeTab === "profile" ? "text-[#6320EE]" : "text-gray-400"}`} />
            <span>Business Profile</span>
          </button>

          {/* Tab 2: GST & Tax */}
          <button
            onClick={() => setActiveTab("gst")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
              activeTab === "gst"
                ? "bg-white text-[#6320EE] shadow-2xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <Receipt className={`w-3.5 h-3.5 ${activeTab === "gst" ? "text-[#6320EE]" : "text-gray-400"}`} />
            <span>GST & Taxation</span>
          </button>

          {/* Tab 3: Printer Setup */}
          <button
            onClick={() => setActiveTab("printer")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
              activeTab === "printer"
                ? "bg-white text-[#6320EE] shadow-2xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <Printer className={`w-3.5 h-3.5 ${activeTab === "printer" ? "text-[#6320EE]" : "text-gray-400"}`} />
            <span>Printer Setup</span>
            {isConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        <div className="text-[11px] text-gray-400 font-normal">
          {activeTab === "profile" && "Configuring Core Store Identity"}
          {activeTab === "gst" && "Configuring Invoicing & GST Rates"}
          {activeTab === "printer" && "Configuring WebUSB & Bluetooth Thermal Printing"}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BUSINESS PROFILE */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="max-w-4xl space-y-5 animate-in fade-in duration-150">
          <form onSubmit={handleSaveProfile} className="bg-white rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">General Business Details</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Primary information printed on bills and customer invoices</p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Active Outlet</span>
                </span>
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Business Name */}
              <div className="sm:col-span-2">
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Business / Store Name *</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. HyperMart Supermarket"
                  className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">City / Location *</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  placeholder="e.g. Hyderabad"
                  className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                  required
                />
              </div>

              {/* Business Category */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Business Category / Type</label>
                <select
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                  className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE] bg-white cursor-pointer"
                >
                  <option value="Retail & Supermarket">Retail & Supermarket</option>
                  <option value="Ice Cream & Desserts">Ice Cream & Desserts Parlor</option>
                  <option value="Bakery & Confectionery">Bakery & Confectionery</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                  <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
                  <option value="General Store">General Merchant Store</option>
                </select>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Store Contact Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Store Support Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="e.g. support@hypermart.in"
                  className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                />
              </div>

              {/* Full Address */}
              <div className="sm:col-span-2">
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Store Physical Address</label>
                <textarea
                  rows={2}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Shop No. 12, Main Commercial Street, Hitech City..."
                  className="w-full p-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="h-8 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GST & TAXATION */}
      {/* ========================================================================= */}
      {activeTab === "gst" && (
        <div className="max-w-3xl space-y-5 animate-in fade-in duration-150">
          <form onSubmit={handleSaveGst} className="bg-white rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-medium text-gray-900">Goods and Services Tax (GST) Settings</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Enable compliant GST billing and tax invoice generation</p>
            </div>

            {gstSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gstSuccessMsg}</span>
              </div>
            )}

            {/* Toggle: Enable GST */}
            <div className="p-4 rounded-[8px] border border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-xs text-gray-900">Enable GST Invoicing</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Calculate CGST / SGST / IGST automatically on bills and receipts
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gstForm.isGstEnabled}
                  onChange={(e) => setGstForm({ ...gstForm, isGstEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#6320EE]"></div>
              </label>
            </div>

            {/* GST Details (Shown only if GST is enabled) */}
            {gstForm.isGstEnabled && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  {/* GSTIN */}
                  <div>
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">
                      GSTIN (15-Digit GST Number) *
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstForm.gstNumber}
                      onChange={(e) => setGstForm({ ...gstForm, gstNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. 36ABCDE1234F1Z5"
                      className="w-full h-9 px-3 font-mono uppercase tracking-wider border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                      required={gstForm.isGstEnabled}
                    />
                  </div>

                  {/* Trade / Entity Name */}
                  <div>
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">
                      Registered Trade / Legal Entity Name *
                    </label>
                    <input
                      type="text"
                      value={gstForm.tradeName}
                      onChange={(e) => setGstForm({ ...gstForm, tradeName: e.target.value })}
                      placeholder="e.g. HyperMart Retail Private Limited"
                      className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                      required={gstForm.isGstEnabled}
                    />
                  </div>

                  {/* Default GST Rate */}
                  <div>
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">
                      Default GST Tax Rate (%)
                    </label>
                    <select
                      value={gstForm.gstRate}
                      onChange={(e) => setGstForm({ ...gstForm, gstRate: Number(e.target.value) })}
                      className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE] bg-white cursor-pointer"
                    >
                      <option value={0}>0% (Exempt / Nil Rated)</option>
                      <option value={5}>5% (Essential Food / Staples)</option>
                      <option value={12}>12% (Processed Goods / Dairy)</option>
                      <option value={18}>18% (Standard Retail / FMCG)</option>
                      <option value={28}>28% (Luxury / Aerated Drinks)</option>
                    </select>
                  </div>

                  {/* Pricing Mode */}
                  <div>
                    <label className="block text-gray-600 mb-1 font-medium text-[11px]">
                      Product Price Tax Mode
                    </label>
                    <select
                      value={gstForm.taxType}
                      onChange={(e) => setGstForm({ ...gstForm, taxType: e.target.value as any })}
                      className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE] bg-white cursor-pointer"
                    >
                      <option value="inclusive">Prices are Inclusive of GST (MRP)</option>
                      <option value="exclusive">Prices are Exclusive of GST (+ Tax Added)</option>
                    </select>
                  </div>

                </div>

                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-[8px] text-[11px] text-[#6320EE] flex items-center gap-2">
                  <Percent className="w-3.5 h-3.5 shrink-0" />
                  <span>GSTIN will be automatically rendered on all printed thermal slips and digital invoices.</span>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSavingGst}
                className="h-8 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSavingGst ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save GST Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRINTER SETUP */}
      {/* ========================================================================= */}
      {activeTab === "printer" && (
        <div className="max-w-3xl space-y-5 animate-in fade-in duration-150">
          
          {/* Card 1: Connection Protocols */}
          <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-5">
            <div className="border-b border-gray-100 pb-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Thermal Printer Connection</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Pair receipt printer via WebUSB cable or Web Bluetooth wireless</p>
              </div>

              {isConnected && (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="uppercase">{connectionType} Connected</span>
                </span>
              )}
            </div>

            {/* Active Device Card */}
            {isConnected ? (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[8px] bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{deviceName || "ESC/POS Thermal Printer"}</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Ready for high-speed POS receipt & barcode label printing
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestPrint}
                    disabled={isTestPrinting}
                    className="h-8 px-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium rounded-[8px] shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isTestPrinting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5 text-[#6320EE]" />}
                    <span>Test Print</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => disconnectPrinter()}
                    className="h-8 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-medium rounded-[8px] cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              /* Two Connection Buttons */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Web USB */}
                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => connectUsb()}
                  className="p-4 rounded-[8px] border border-gray-200 hover:border-[#6320EE] hover:bg-purple-50/20 text-left transition-all group cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-[8px] bg-purple-50 group-hover:bg-[#6320EE] text-[#6320EE] group-hover:text-white flex items-center justify-center mb-2.5 transition-colors">
                    <Usb className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-xs">Web USB Connector</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Direct USB cable connection for POS counter desktop printers</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#6320EE] font-medium mt-3">
                    {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Pair USB Device</span>}
                  </span>
                </button>

                {/* 2. Web Bluetooth */}
                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => connectBluetooth()}
                  className="p-4 rounded-[8px] border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 text-left transition-all group cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-[8px] bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center mb-2.5 transition-colors">
                    <Bluetooth className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-xs">Web Bluetooth Connector</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Wireless pairing for mobile hand-held 58mm POS thermal printers</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-3">
                    {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Scan Bluetooth</span>}
                  </span>
                </button>
              </div>
            )}

            {printerError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-[8px] text-xs text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{printerError}</span>
              </div>
            )}

            {testPrintSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Test receipt command sent successfully to {deviceName}!</span>
              </div>
            )}
          </div>

          {/* Card 2: Receipt Printing Preferences */}
          <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-5 text-xs">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-medium text-gray-900">Receipt Format & Printing Rules</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Customise paper dimensions, header messages, and footer notes</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Paper Size */}
              <div>
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">Paper Width / Roll Size</label>
                <select
                  value={config.paperSize}
                  onChange={(e) => updateConfig({ paperSize: e.target.value as any })}
                  className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE] bg-white cursor-pointer"
                >
                  <option value="58mm">58mm (2-Inch Standard Mobile Roll)</option>
                  <option value="80mm">80mm (3-Inch Standard Desktop POS Roll)</option>
                </select>
              </div>

              {/* Auto Cut Paper */}
              <div className="flex items-center justify-between p-2.5 rounded-[8px] border border-gray-100 bg-gray-50/50">
                <div>
                  <h5 className="font-medium text-gray-800 text-[11px]">Auto Cut Paper</h5>
                  <p className="text-[10px] text-gray-400">Trigger cutter command after printing</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoCut}
                  onChange={(e) => updateConfig({ autoCut: e.target.checked })}
                  className="w-4 h-4 rounded-[4px] border-gray-300 text-[#6320EE] focus:ring-[#6320EE] cursor-pointer"
                />
              </div>

              {/* Thank You Message */}
              <div className="sm:col-span-2">
                <label className="block text-gray-600 mb-1 font-medium text-[11px]">
                  Thank You / Receipt Footer Message (Prints on thermal bill)
                </label>
                <textarea
                  rows={2}
                  value={config.thankYouMessage}
                  onChange={(e) => updateConfig({ thankYouMessage: e.target.value })}
                  placeholder="Thank you for shopping with us! Visit again!"
                  className="w-full p-2.5 border border-gray-200 rounded-[8px] text-xs focus:outline-none focus:border-[#6320EE]"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  This custom message will be centered and word-wrapped at the bottom of all customer bills.
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-100 rounded-[8px] text-[11px] text-gray-500 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Receipt layout preferences are automatically saved and applied on all print jobs.</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
