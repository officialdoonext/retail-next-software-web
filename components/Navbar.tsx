"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Receipt,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Store,
  UserCheck,
  FileText,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Printer,
  CheckCircle2,
  X,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Sales", href: "/sales", icon: Receipt },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Products", href: "/products", icon: Package },
  { name: "Inventory", href: "/inventory", icon: Boxes },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Employees", href: "/employees", icon: UserCheck },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Expenses", href: "/expenses", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeBusiness, logout } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Hide Navbar on Welcome, Auth and Onboarding pages
  const isAuthPage =
    pathname === "/welcome" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/onboarding";

  if (isAuthPage) {
    return null;
  }

  const isCurrentActive = (href: string) => {
    if (href === "/products" && (pathname === "/" || pathname === "/products")) {
      return true;
    }
    return pathname === href;
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Active Outlet Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/products" className="flex items-center shrink-0 select-none group">
              <Image
                src="/logo.png"
                alt="RetailNext Logo"
                width={140}
                height={38}
                priority
                className="h-8.5 w-auto object-contain"
              />
            </Link>

            {activeBusiness && (
              <Link
                href="/onboarding"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-[#6320EE] text-[11px] font-medium transition-colors shadow-2xs cursor-pointer"
                title="Switch Business / Outlet"
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[150px]">{activeBusiness.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </Link>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 flex-1 max-w-4xl justify-center overflow-hidden px-2">
            <button
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              className="hidden sm:flex w-7.5 h-7.5 items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1.5"
            >
              {NAV_ITEMS.map((item) => {
                const active = isCurrentActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex flex-col items-center justify-center px-3 py-1.5 rounded-[8px] text-[12.5px] font-medium transition-all group shrink-0 ${
                      active
                        ? "text-[#6320EE]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mb-1 transition-transform group-hover:scale-110 ${
                        active ? "text-[#6320EE]" : "text-gray-500 group-hover:text-gray-800"
                      }`}
                    />
                    <span className="whitespace-nowrap">{item.name}</span>
                    {active && (
                      <span className="absolute -bottom-2 left-1.5 right-1.5 h-0.5 bg-[#6320EE] rounded-[8px]" />
                    )}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              className="hidden sm:flex w-7.5 h-7.5 items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Section: Connect Printer + User Profile & Menu */}
          <div className="flex items-center gap-3.5 shrink-0 pl-1 relative">
            
            {/* Connect Printer Button */}
            <button
              onClick={() => setIsPrinterModalOpen(true)}
              className={`hidden sm:inline-flex items-center gap-1.5 h-8.5 px-3 rounded-[8px] text-xs font-medium border shadow-2xs transition-all cursor-pointer ${
                isPrinterConnected
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-white border-purple-200 text-[#6320EE] hover:bg-purple-50/70 hover:border-purple-300"
              }`}
            >
              {isPrinterConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Printer Online</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5 text-[#6320EE]" />
                  <span>Connect Printer</span>
                </>
              )}
            </button>

            {/* User Profile Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-[8px] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-[8px] bg-gradient-to-tr from-purple-500 to-indigo-600 p-[1.5px] shadow-2xs">
                    <div className="w-full h-full rounded-[8px] bg-amber-100 flex items-center justify-center overflow-hidden">
                      <span className="text-xs font-medium text-indigo-700">
                        {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "AU"}
                      </span>
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-[8px]"></span>
                </div>

                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-medium text-gray-900 leading-tight">
                    {user?.fullName || "Admin User"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {activeBusiness?.name || "Administrator"}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-[8px] shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in duration-100 text-xs">
                  <div className="px-3.5 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.fullName || "Store Owner"}</p>
                    <p className="text-[11px] text-gray-400">{user?.phone ? `+91 ${user.phone}` : ""}</p>
                  </div>

                  <Link
                    href="/onboarding"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#6320EE]"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Switch Outlet / Business</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 cursor-pointer text-left border-t border-gray-100 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Connect Printer Modal */}
      {isPrinterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">Thermal & Receipt Printer</h3>
              </div>
              <button
                onClick={() => setIsPrinterModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs font-normal">
              <p className="text-gray-500 leading-relaxed">
                Connect your POS thermal printer via USB, Bluetooth, or Network for automatic invoice & receipt printing.
              </p>

              <div className="bg-gray-50 rounded-[8px] p-3 space-y-2 border border-gray-100">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Status:</span>
                  <span className={`font-medium ${isPrinterConnected ? "text-emerald-600" : "text-amber-600"}`}>
                    {isPrinterConnected ? "Online (EPSON TM-T82)" : "Not Connected"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>Port / Protocol:</span>
                  <span className="text-gray-500">USB / ESC-POS</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setIsPrinterModalOpen(false)}
                className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[8px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsPrinterConnected(!isPrinterConnected);
                  setIsPrinterModalOpen(false);
                }}
                className="h-8 px-3.5 bg-[#6320EE] hover:bg-[#5219cd] text-white text-xs font-medium rounded-[8px] shadow-2xs cursor-pointer"
              >
                {isPrinterConnected ? "Disconnect" : "Connect Device"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
