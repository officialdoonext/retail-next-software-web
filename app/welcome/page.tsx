"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Store,
  Layers,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Lock,
  Printer,
  ShoppingBag,
  Receipt,
  ScanBarcode,
  Sliders,
  ChevronRight,
  Star,
  Users,
  Smartphone,
  Laptop,
  Check,
  HelpCircle,
  ChevronDown,
  TrendingUp,
  PackageCheck,
  CreditCard,
  Gift,
  Flame,
  Clock,
  Award
} from "lucide-react";

export default function WelcomePage() {
  const [activeIndustry, setActiveIndustry] = useState<"supermarket" | "bakery" | "icecream" | "fmcg">("supermarket");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [billingCycle, setBillingCycle] = useState<"annual" | "six_months">("annual");

  const industries = [
    {
      id: "supermarket",
      title: "Supermarkets & Groceries",
      icon: Store,
      tagline: "High-speed barcode checkout with bulk inventory & weighing scale sync",
      highlights: [
        "1D/2D Barcode scanner integration with 0.1s instant lookup",
        "Multi-unit support (Kg, Grams, Litres, Packets, Boxes, Dozens)",
        "Bulk Excel import for 10,000+ SKUs with automated category mapping",
        "Live stock sync with buffer stock alerts and low-inventory warnings"
      ]
    },
    {
      id: "bakery",
      title: "Sweet Shops & Bakeries",
      icon: Sparkles,
      tagline: "Weight-based pricing, variation matrices, and custom gift box packaging",
      highlights: [
        "Dynamic variation options (250g, 500g, 1kg, 2kg box assortments)",
        "Quick item touchscreen grid for non-barcoded sweets & dry snacks",
        "Fast token generation and dual customer receipt vouchers",
        "Expiry date tracking and physical stock count audit adjustments"
      ]
    },
    {
      id: "icecream",
      title: "Ice Cream & Dessert Parlours",
      icon: Layers,
      tagline: "Flavor matrices, scoop variations, family tubs & quick split billing",
      highlights: [
        "Serving style variations (Single Scoop, Double, Waffle Cone, 1L Tub)",
        "Split payment support (Cash + UPI + Card) with instant change calculator",
        "Instant bill hold & multi-cart drafting during peak weekend rush",
        "Custom toppings and add-on modifiers management"
      ]
    },
    {
      id: "fmcg",
      title: "Wholesale & FMCG Traders",
      icon: ShoppingBag,
      tagline: "Vendor purchase orders, goods receipt checklist, and supplier directories",
      highlights: [
        "Fullscreen Purchase Order (PO) creation with auto PO numbers",
        "Interactive 'Update Received' checklist that auto-adds stock to database",
        "Supplier directory with GSTIN tracking and procurement spend analytics",
        "Thermal PO voucher & 80mm printable purchase invoice receipts"
      ]
    }
  ];

  const faqs = [
    {
      q: "How does the Free Trial work?",
      a: "You can sign up for a Free Trial with instant access to all features including POS billing, inventory management, purchase orders, thermal receipt printing, and bulk catalog imports without needing a credit card."
    },
    {
      q: "How do the 6 Months and 1 Year promotional bonus offers work?",
      a: "When you purchase the 6 Months plan, you automatically receive +1 Month FREE (total 7 months of full access). When you purchase the 1 Year plan, you receive +3 Months FREE (total 15 months of full access) at no additional charge!"
    },
    {
      q: "Does RetailNext support USB and Bluetooth Thermal Printers?",
      a: "Yes! RetailNext natively supports both USB Direct thermal printers (ESC/POS) and wireless Bluetooth thermal receipt printers in standard 58mm (2-inch) and 80mm (3-inch) paper formats. You can also print directly from any browser dialogue."
    },
    {
      q: "How does the Purchase Order & Stock synchronization work?",
      a: "When you create a Purchase Order for a supplier, items are tracked under 'Pending'. Once the shipment arrives, simply click 'Received' to review the interactive checklist. Clicking 'Update Received' automatically updates the purchase order and increments the exact stock of each received item and variation in your live inventory database!"
    },
    {
      q: "Can I manage complex product variations like weights and sizes?",
      a: "Absolutely. RetailNext supports full product variations. For example, a single product like 'Basmati Rice' can have multiple variations (500g, 1kg, 5kg) with individual selling prices, cost prices, barcodes, and live stock tracking."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-gray-800 selection:bg-[#6320EE] selection:text-white flex flex-col justify-between font-sans">
      
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/welcome" className="flex items-center">
            <Image
              src="/logo.png"
              alt="RetailNext Logo"
              width={140}
              height={38}
              priority
              className="h-8.5 w-auto object-contain"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-gray-600">
            <a href="#offers" className="hover:text-[#6320EE] transition-colors">Special Offers</a>
            <a href="#features" className="hover:text-[#6320EE] transition-colors">Features</a>
            <a href="#industries" className="hover:text-[#6320EE] transition-colors">Industries</a>
            <a href="#hardware" className="hover:text-[#6320EE] transition-colors">Hardware & POS</a>
            <a href="#faq" className="hover:text-[#6320EE] transition-colors">FAQ</a>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="h-8.5 px-3.5 flex items-center justify-center text-xs font-medium text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-[8px] transition-all cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="h-8.5 px-4 flex items-center justify-center text-xs font-semibold text-white bg-[#6320EE] hover:bg-[#5218cf] rounded-[8px] shadow-2xs transition-all cursor-pointer"
            >
              Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 text-center">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-purple-50 border border-purple-100 text-[#6320EE] rounded-[8px] text-xs font-medium mb-5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#6320EE]" />
          <span>Next Generation Cloud POS & Retail Inventory ERP</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.18] max-w-3xl mx-auto">
          Scale your retail & sweet shop with <span className="text-[#6320EE]">smart cloud automation</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-4 text-xs sm:text-sm lg:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed font-normal">
          Fast thermal counter billing (58mm/80mm), product variations, multi-unit stock audits, fullscreen supplier purchase orders, and multi-outlet management.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto h-10.5 px-6.5 inline-flex items-center justify-center gap-2 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs sm:text-sm font-semibold rounded-[8px] shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto h-10.5 px-6 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 text-xs sm:text-sm font-medium border border-gray-200 rounded-[8px] shadow-2xs transition-all cursor-pointer"
          >
            <Store className="w-4 h-4 text-[#6320EE]" />
            <span>Login to Business</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Free Trial Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>USB & Bluetooth ESC/POS Support</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Descope OTP Security</span>
          </div>
        </div>

        {/* SPECIAL PROMOTIONAL SUBSCRIPTION BONUS HIGHLIGHT WITH ANIMATIONS */}
        <div className="mt-10 max-w-4xl mx-auto p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-white to-amber-50/70 border-2 border-purple-200/90 rounded-[12px] shadow-sm text-left relative overflow-hidden group/container">
          
          {/* Subtle Background Shimmer Aura */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-amber-300/20 rounded-full blur-2xl pointer-events-none animate-pulse" />

          {/* Header Row with Pulsing Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-purple-100/90 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[6px] bg-gradient-to-tr from-[#6320EE] to-[#8044FF] text-white flex items-center justify-center shadow-xs animate-bounce">
                <Gift className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                <span>Special Limited-Period Subscription Offers</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </span>
            </div>
            
            <div className="inline-flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-100 to-amber-200/80 text-amber-900 border border-amber-300/80 shadow-2xs">
              <Flame className="w-3 h-3 text-amber-600 animate-pulse" />
              <span>BONUS FREE MONTHS UNLOCKED</span>
            </div>
          </div>

          {/* Animated Dual Offer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
            
            {/* 6 Months Offer Card */}
            <Link
              href="/signup"
              className="bg-white p-4 rounded-[8px] border border-purple-200/90 shadow-2xs hover:shadow-md hover:border-[#6320EE] hover:-translate-y-1 transition-all duration-300 flex items-center justify-between gap-3 group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-[8px] bg-gradient-to-tr from-purple-100 to-purple-50 text-[#6320EE] flex items-center justify-center shrink-0 border border-purple-200/80 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xs">
                  <Gift className="w-5 h-5 text-[#6320EE] group-hover:animate-wiggle" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#6320EE] transition-colors">
                      Purchase 6 Months Plan
                    </h4>
                    <span className="text-[10px] bg-purple-100/90 text-[#6320EE] px-2 py-0.2 rounded-full font-extrabold border border-purple-200 animate-pulse">
                      +1 Mo Free
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-normal mt-0.5">
                    Get <strong className="text-[#6320EE] font-bold">1 Month Extra FREE</strong> (Total <strong>7 Months</strong> Access)
                  </p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-purple-50 text-[#6320EE] flex items-center justify-center shrink-0 group-hover:bg-[#6320EE] group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shadow-2xs">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* 1 Year Offer Card (Best Value) */}
            <Link
              href="/signup"
              className="bg-gradient-to-r from-amber-50/40 via-white to-white p-4 rounded-[8px] border-2 border-amber-300 shadow-2xs hover:shadow-md hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between gap-3 group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-[8px] bg-gradient-to-tr from-amber-200 to-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-2xs">
                  <Flame className="w-5 h-5 text-amber-700 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
                      Purchase 1 Year Plan
                    </h4>
                    <span className="text-[10px] bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2 py-0.2 rounded-full font-extrabold shadow-2xs animate-pulse">
                      +3 Mos Free • Best Value
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-normal mt-0.5">
                    Get <strong className="text-amber-800 font-bold">3 Months Extra FREE</strong> (Total <strong>15 Months</strong> Access)
                  </p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shadow-2xs">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

          </div>
        </div>

        {/* SECTION 3: APP LIVE POS SHOWCASE (Clean Light Theme) */}
        <section className="mt-16 text-left">
          <div className="bg-white rounded-[8px] border border-gray-200/80 shadow-sm overflow-hidden">
            
            {/* Titlebar */}
            <div className="bg-gray-50/90 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-gray-700 ml-2">RetailNext Live Counter POS & Inventory System</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Thermal Printer Active (58/80mm)
                </span>
              </div>
            </div>

            {/* Content Layout */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-gray-50/40">
              
              {/* Left Column: Touch Item Grid */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-[8px] border border-gray-200 shadow-2xs">
                  <ScanBarcode className="w-4 h-4 text-[#6320EE]" />
                  <input
                    type="text"
                    readOnly
                    value="8901030892412 • Barcode scanned: Superior Basmati Rice 5kg"
                    className="bg-transparent text-xs text-gray-700 font-mono w-full focus:outline-none cursor-default"
                  />
                  <span className="text-[10px] bg-purple-50 text-[#6320EE] border border-purple-100 px-2 py-0.5 rounded font-mono font-medium">
                    AUTO ADDED
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { name: "Basmati Rice 5kg", cat: "Grocery", price: "₹680", var: "5kg", stock: "45 In Stock" },
                    { name: "Pure Cow Ghee", cat: "Dairy", price: "₹340", var: "500ml", stock: "30 In Stock" },
                    { name: "Dark Chocolate Tub", cat: "Ice Cream", price: "₹270", var: "500ml", stock: "25 In Stock" },
                    { name: "Toor Dal Premium", cat: "Staples", price: "₹180", var: "1kg", stock: "60 In Stock" },
                    { name: "Sunflower Oil", cat: "Cooking Oil", price: "₹160", var: "1Litre", stock: "75 In Stock" },
                    { name: "Alphonso Mango Scoop", cat: "Dessert", price: "₹110", var: "Single", stock: "50 In Stock" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white hover:bg-purple-50/30 border border-gray-200 hover:border-purple-200 rounded-[8px] transition-all shadow-2xs cursor-pointer"
                    >
                      <span className="text-[10px] text-[#6320EE] font-medium">{item.cat}</span>
                      <h4 className="font-semibold text-gray-900 text-xs mt-0.5 truncate">{item.name}</h4>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-emerald-700 font-bold font-mono">{item.price}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{item.var}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Checkout Ticket */}
              <div className="lg:col-span-5 bg-white p-4 rounded-[8px] border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <span className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-[#6320EE]" />
                      <span>Invoice #INV-2026-0042</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-medium">
                      ACTIVE BILL
                    </span>
                  </div>

                  {/* Line items */}
                  <div className="divide-y divide-gray-100 text-xs py-2 space-y-1.5">
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="font-medium text-gray-900 block">Aashirvaad Superior Atta (5kg)</span>
                        <span className="text-[10px] text-gray-400">1 x ₹290.00 • Weight</span>
                      </div>
                      <span className="font-mono text-gray-900 font-semibold">₹290.00</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="font-medium text-gray-900 block">Rich Belgian Dark Chocolate (500ml)</span>
                        <span className="text-[10px] text-gray-400">2 x ₹270.00 • Tub</span>
                      </div>
                      <span className="font-mono text-gray-900 font-semibold">₹540.00</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="font-medium text-gray-900 block">Fortune Sunflower Oil (1 Litre)</span>
                        <span className="text-[10px] text-gray-400">1 x ₹160.00 • Bottle</span>
                      </div>
                      <span className="font-mono text-gray-900 font-semibold">₹160.00</span>
                    </div>
                  </div>
                </div>

                {/* Subtotal & Action */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Subtotal (4 Items):</span>
                    <span className="font-mono text-sm font-bold text-gray-900">₹990.00</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[6px] text-xs font-medium flex items-center justify-center gap-1 cursor-pointer">
                      <Printer className="w-3 h-3 text-gray-500" />
                      <span>Print Draft</span>
                    </button>
                    <button className="h-8 bg-[#6320EE] hover:bg-[#5218cf] text-white rounded-[6px] text-xs font-semibold shadow-2xs flex items-center justify-center gap-1 cursor-pointer">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Settle Bill (₹990)</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: 6 CORE FEATURE PILLARS */}
        <section id="features" className="mt-20 text-left">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6320EE] mb-1 font-mono">Engineered for Retail Excellence</h2>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Complete Store Operations in One Platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Feature 1: POS & Thermal */}
            <div className="bg-white p-5 rounded-[8px] border border-gray-100/90 shadow-2xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-[8px] bg-purple-50 text-[#6320EE] flex items-center justify-center mb-3">
                <Printer className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Thermal & Bluetooth POS</h3>
              <p className="text-xs text-gray-400 font-normal leading-relaxed">
                Direct printing for 58mm and 80mm ESC/POS hardware with custom store branding, tax invoice breakdown, and instant cashier change calculation.
              </p>
            </div>

            {/* Feature 2: Variations & Barcodes */}
            <div className="bg-white p-5 rounded-[8px] border border-gray-100/90 shadow-2xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-[8px] bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <ScanBarcode className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Variations & Auto-Barcodes</h3>
              <p className="text-xs text-gray-400 font-normal leading-relaxed">
                Manage product weights (500g, 1kg, 5kg), volumes (500ml, 1L), and flavors with auto-generated 13-digit EAN barcodes or manual scanner inputs.
              </p>
            </div>

            {/* Feature 3: Smart Inventory */}
            <div className="bg-white p-5 rounded-[8px] border border-gray-100/90 shadow-2xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Sliders className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Live Stock & Count Audits</h3>
              <p className="text-xs text-gray-400 font-normal leading-relaxed">
                Real-time stock decrements upon billing, low-stock threshold alerts, and manual physical audit adjustment logs for waste and returns.
              </p>
            </div>

            {/* Feature 4: Purchases & Goods Receiving */}
            <div className="bg-white p-5 rounded-[8px] border border-gray-100/90 shadow-2xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Purchases & Goods Receiving</h3>
              <p className="text-xs text-gray-400 font-normal leading-relaxed">
                Fullscreen PO creation with supplier delivery tracking. Interactive &quot;Update Received&quot; checklist automatically adds received items to inventory.
              </p>
            </div>

            {/* Feature 5: Vendors Directory */}
            <div className="bg-white p-5 rounded-[8px] border border-gray-100/90 shadow-2xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-[8px] bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <Store className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Vendors & Supplier Directory</h3>
              <p className="text-xs text-gray-400 font-normal leading-relaxed">
                Centralized supplier contact directory with 10-digit mobile numbers, city filtering, GSTIN records, and lifetime procurement spend metrics.
              </p>
            </div>

            {/* Feature 6: Multi-Tenant Security */}
            <div className="bg-white p-5 rounded-[8px] border border-gray-100/90 shadow-2xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-[8px] bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Multi-Outlet Branch Isolation</h3>
              <p className="text-xs text-gray-400 font-normal leading-relaxed">
                Manage multiple retail locations under a single account with isolated databases, cashier permissions, and Descope OTP authentication.
              </p>
            </div>

          </div>
        </section>

        {/* SECTION 5: INDUSTRY TAILORED SOLUTIONS */}
        <section id="industries" className="mt-20 text-left">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6320EE] mb-1 font-mono">Tailored Retail Solutions</h2>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Built for Your Specific Industry Workflow</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {industries.map((ind) => {
              const Icon = ind.icon;
              const isActive = activeIndustry === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => setActiveIndustry(ind.id as any)}
                  className={`h-9 px-3.5 rounded-[8px] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#6320EE] text-white shadow-2xs"
                      : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{ind.title}</span>
                </button>
              );
            })}
          </div>

          {industries.find((i) => i.id === activeIndustry) && (
            <div className="bg-white p-6 rounded-[8px] border border-gray-100/90 shadow-2xs max-w-4xl mx-auto">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {industries.find((i) => i.id === activeIndustry)?.title}
              </h3>
              <p className="text-xs text-[#6320EE] font-medium mb-5">
                {industries.find((i) => i.id === activeIndustry)?.tagline}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {industries
                  .find((i) => i.id === activeIndustry)
                  ?.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-[6px] bg-gray-50 border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700 leading-relaxed font-normal">{highlight}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 6: HARDWARE & PLUG-AND-PLAY COMPATIBILITY */}
        <section id="hardware" className="mt-20 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6320EE] mb-1 font-mono">Zero Driver Hassles</h2>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">Plug & Play Hardware Support</p>
          <p className="text-gray-500 text-xs sm:text-sm max-w-lg mx-auto mb-8 font-normal">
            Works out of the box with standard retail POS hardware without complex local setups.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left">
            <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs">
              <div className="w-8 h-8 rounded-[6px] bg-purple-50 text-[#6320EE] flex items-center justify-center mb-2.5">
                <Printer className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs">Thermal Printers</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">58mm & 80mm ESC/POS</p>
            </div>
            <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs">
              <div className="w-8 h-8 rounded-[6px] bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                <ScanBarcode className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs">Barcode Scanners</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">1D & 2D Handheld USB</p>
            </div>
            <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs">
              <div className="w-8 h-8 rounded-[6px] bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs">Bluetooth Terminals</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Wireless Mobile POS</p>
            </div>
            <div className="bg-white p-4 rounded-[8px] border border-gray-100/90 shadow-2xs">
              <div className="w-8 h-8 rounded-[6px] bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
                <Laptop className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs">Touch & Tablets</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">iPad, Android, Windows</p>
            </div>
          </div>
        </section>

        {/* SECTION 7: FAQ ACCORDION */}
        <section id="faq" className="mt-20 text-left max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6320EE] mb-1 font-mono">Frequently Asked Questions</h2>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Got Questions? We&apos;ve Got Answers.</p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-100/90 rounded-[8px] shadow-2xs overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-900 hover:text-[#6320EE] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180 text-[#6320EE]" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-gray-500 leading-relaxed border-t border-gray-100 font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 8: BOTTOM CTA BANNER */}
        <section className="mt-20">
          <div className="bg-[#6320EE] p-8 sm:p-10 rounded-[8px] text-center text-white shadow-md relative overflow-hidden">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Ready to Upgrade Your Retail Store?
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 max-w-lg mx-auto mb-6 leading-relaxed font-normal">
              Join retail outlets, supermarkets, and sweet shops running with RetailNext.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto h-10 px-7 inline-flex items-center justify-center gap-2 bg-white hover:bg-purple-50 text-[#6320EE] text-xs sm:text-sm font-bold rounded-[6px] shadow-xs transition-all cursor-pointer"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto h-10 px-6 inline-flex items-center justify-center gap-2 bg-purple-700/50 hover:bg-purple-700/70 text-white text-xs sm:text-sm font-medium border border-purple-400/40 rounded-[6px] transition-all cursor-pointer"
              >
                <span>Login to Existing Store</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/doonext-fav.png"
              alt="RetailNext"
              width={18}
              height={18}
              className="w-4.5 h-4.5 object-contain"
            />
            <span className="font-semibold text-gray-900">RetailNext Cloud POS</span>
            <span>• © 2026 All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-gray-500">
            <Link href="/login" className="hover:text-gray-900 transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-gray-900 transition-colors">Free Trial</Link>
            <a href="#offers" className="hover:text-gray-900 transition-colors">Special Offers</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
