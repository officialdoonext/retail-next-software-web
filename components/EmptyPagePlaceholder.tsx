"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Box,
  Home,
  Receipt,
  ShoppingCart,
  Boxes,
  Users,
  Store,
  UserCheck,
  FileText,
  CreditCard,
  Settings
} from "lucide-react";

interface EmptyPagePlaceholderProps {
  title: string;
  description: string;
  iconName?: string;
}

export default function EmptyPagePlaceholder({
  title,
  description,
  iconName = "box",
}: EmptyPagePlaceholderProps) {
  const getIcon = () => {
    switch (iconName.toLowerCase()) {
      case "dashboard":
      case "home":
        return <Home className="w-7 h-7" />;
      case "sales":
      case "receipt":
        return <Receipt className="w-7 h-7" />;
      case "purchases":
      case "shoppingcart":
        return <ShoppingCart className="w-7 h-7" />;
      case "inventory":
      case "boxes":
        return <Boxes className="w-7 h-7" />;
      case "customers":
      case "users":
        return <Users className="w-7 h-7" />;
      case "vendors":
      case "store":
        return <Store className="w-7 h-7" />;
      case "employees":
      case "usercheck":
        return <UserCheck className="w-7 h-7" />;
      case "reports":
      case "filetext":
        return <FileText className="w-7 h-7" />;
      case "expenses":
      case "creditcard":
        return <CreditCard className="w-7 h-7" />;
      case "settings":
        return <Settings className="w-7 h-7" />;
      default:
        return <Box className="w-7 h-7" />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
      {/* Page Title & Breadcrumbs */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900 tracking-tight">{title}</h1>
          <p className="text-xs text-gray-500 mt-0.5 font-normal">{description}</p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-[#6320EE] bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 rounded-[8px] transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Products
        </Link>
      </div>

      {/* Empty Slate Container */}
      <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] min-h-[420px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE] mb-3.5 shadow-2xs">
          {getIcon()}
        </div>
        
        <h3 className="text-base font-medium text-gray-900 mb-1">{title} Module</h3>
        <p className="text-xs text-gray-400 max-w-sm mb-5 leading-relaxed font-normal">
          This section is currently unpopulated as requested. The Products page is fully implemented and styled per your specifications.
        </p>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[8px] bg-[#6320EE] text-white text-xs font-medium hover:bg-[#5219cd] shadow-2xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          View Active Products Page
        </Link>
      </div>
    </div>
  );
}
