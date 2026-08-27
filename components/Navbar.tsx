"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Receipt,
  ShoppingCart,
  ShoppingBag,
  Package,
  Store,
  UserCheck,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Printer,
  CheckCircle2,
  X,
  LogOut,
  ChevronDown,
  Usb,
  Bluetooth,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePrinter } from "@/context/PrinterContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Products", href: "/products", icon: Package },
  { name: "Purchases", href: "/purchases", icon: ShoppingBag },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Employees", href: "/employees", icon: UserCheck },
  { name: "Expenses", href: "/expenses", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeBusiness, logout } = useAuth();
  const {
    isConnected,
    connectionType,
    deviceName,
    isConnecting,
    errorMessage,
    connectUsb,
    connectBluetooth,
    disconnectPrinter
  } = usePrinter();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
            <Link href="/products" className="flex items-center shrink-0 select-none group" title="RetailNext">
              <Image
                src="/doonext-fav.png"
                alt="RetailNext Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
                priority
              />
            </Link>

            {/* Active Outlet Pill */}
            {activeBusiness && (
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-purple-50/70 border border-purple-200/80 rounded-[8px] text-[11px] text-gray-700">
                <Store className="w-3.5 h-3.5 text-[#6320EE]" />
                <span className="font-medium truncate max-w-[140px]">{activeBusiness.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
            )}
          </div>

          {/* Navigation Links with Horizontal Scroll Controls */}
          <div className="flex-1 flex items-center justify-center relative min-w-0 mx-2 lg:mx-4">
            <button
              onClick={() => handleScroll("left")}
              className="hidden lg:flex w-6 h-6 items-center justify-center rounded-[8px] bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 shrink-0 shadow-2xs z-10 cursor-pointer mr-1.5"
              aria-label="Scroll navigation left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <nav
              ref={scrollContainerRef}
              className="flex items-center justify-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 max-w-full"
            >
              {NAV_ITEMS.map((item) => {
                const active = isCurrentActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center justify-center px-3 sm:px-3.5 py-1.5 rounded-[8px] transition-all duration-150 shrink-0 select-none min-w-[62px] sm:min-w-[70px] ${
                      active
                        ? "bg-purple-50 text-[#6320EE] border border-purple-200/80 shadow-2xs"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] mb-1 transition-colors ${
                        active ? "text-[#6320EE]" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span className="text-[12px] font-medium leading-tight tracking-tight">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => handleScroll("right")}
              className="hidden lg:flex w-6 h-6 items-center justify-center rounded-[8px] bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 shrink-0 shadow-2xs z-10 cursor-pointer ml-1.5"
              aria-label="Scroll navigation right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Section: Connect Printer + User Profile & Menu */}
          <div className="flex items-center gap-2.5 shrink-0 pl-1 relative">
            
            {/* Connect Printer Button (Icon Only) */}
            <button
              onClick={() => setIsPrinterModalOpen(true)}
              className={`w-8.5 h-8.5 flex items-center justify-center rounded-[8px] border shadow-2xs transition-all cursor-pointer ${
                isConnected
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-white border-purple-200 text-[#6320EE] hover:bg-purple-50/70 hover:border-purple-300"
              }`}
              title={isConnected ? (deviceName || "Printer Online") : "Connect Thermal Printer"}
            >
              {isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Printer className="w-4 h-4 text-[#6320EE]" />
              )}
            </button>

            {/* User Profile Dropdown Button (First Letter Only) */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center justify-center p-0.5 rounded-[8px] hover:ring-2 hover:ring-purple-200 transition-all cursor-pointer"
                title={user?.fullName || "Account Profile"}
              >
                <div className="relative">
                  <div className="w-8.5 h-8.5 rounded-[8px] bg-gradient-to-tr from-purple-500 to-indigo-600 p-[1.5px] shadow-2xs">
                    <div className="w-full h-full rounded-[7px] bg-purple-50 flex items-center justify-center overflow-hidden">
                      <span className="text-xs font-bold text-[#6320EE]">
                        {user?.fullName ? user.fullName.trim().charAt(0).toUpperCase() : "A"}
                      </span>
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-[8px] shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in duration-100 text-xs">
                  <div className="px-3.5 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user?.fullName || "Store Owner"}</p>
                    <p className="text-[11px] text-gray-400">{user?.phone ? `+91 ${user.phone}` : ""}</p>
                  </div>

                  <Link
                    href="/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#6320EE]"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Store Settings & GST</span>
                  </Link>

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

      {/* Connect Printer Modal with WebUSB and Web Bluetooth */}
      {isPrinterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE]">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">Thermal Receipt Printer</h3>
                  <p className="text-[10px] text-gray-400 font-normal">Connect via Web USB or Web Bluetooth</p>
                </div>
              </div>
              <button
                onClick={() => setIsPrinterModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-[8px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs font-normal">
              {/* Connected State */}
              {isConnected ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-[8px] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Connected & Online</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] uppercase font-medium">
                      {connectionType}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-900 space-y-1">
                    <p className="font-medium">{deviceName}</p>
                    <p className="text-emerald-700">Protocol: ESC/POS Thermal Commands</p>
                  </div>
                </div>
              ) : (
                /* Connection Options */
                <div className="space-y-2.5">
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Select a connection protocol to pair your 58mm / 80mm thermal receipt printer:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1: Web USB */}
                    <button
                      type="button"
                      disabled={isConnecting}
                      onClick={async () => {
                        const ok = await connectUsb();
                        if (ok) setIsPrinterModalOpen(false);
                      }}
                      className="p-3 rounded-[8px] border border-gray-200 hover:border-[#6320EE] hover:bg-purple-50/20 text-left transition-all group cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      <div className="w-7 h-7 rounded-[8px] bg-purple-50 group-hover:bg-[#6320EE] text-[#6320EE] group-hover:text-white flex items-center justify-center mb-2 transition-colors">
                        <Usb className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-xs">Web USB</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Plug & Play USB Cable</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#6320EE] font-medium mt-2">
                        {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Pair USB</span>}
                      </span>
                    </button>

                    {/* Option 2: Web Bluetooth */}
                    <button
                      type="button"
                      disabled={isConnecting}
                      onClick={async () => {
                        const ok = await connectBluetooth();
                        if (ok) setIsPrinterModalOpen(false);
                      }}
                      className="p-3 rounded-[8px] border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 text-left transition-all group cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      <div className="w-7 h-7 rounded-[8px] bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center mb-2 transition-colors">
                        <Bluetooth className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-xs">Web Bluetooth</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Wireless Mobile POS</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-medium mt-2">
                        {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Scan Bluetooth</span>}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-[8px] text-[11px] text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsPrinterModalOpen(false)}
                className="h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-[8px] cursor-pointer"
              >
                Close
              </button>
              
              {isConnected && (
                <button
                  onClick={() => disconnectPrinter()}
                  className="h-8 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-medium rounded-[8px] cursor-pointer"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
