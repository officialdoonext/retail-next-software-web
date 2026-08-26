"use client";

import React from "react";
import { Boxes, AlertCircle } from "lucide-react";

interface StatCardsProps {
  totalProducts?: number;
  lowStock?: number;
  outOfStock?: number;
  totalValue?: string;
}

export default function StatCards({
  totalProducts = 2350,
  lowStock = 120,
  outOfStock = 18,
  totalValue = "25,68,450.00",
}: StatCardsProps) {
  const stats = [
    {
      title: "Total Products",
      value: totalProducts.toLocaleString("en-IN"),
      subtext: "All Products",
      iconBg: "bg-emerald-50 text-emerald-500",
      icon: (
        <div className="w-12 h-12 rounded-[8px] bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
      ),
    },
    {
      title: "Low Stock",
      value: lowStock.toLocaleString("en-IN"),
      subtext: "Products",
      iconBg: "bg-blue-50 text-blue-500",
      icon: (
        <div className="w-12 h-12 rounded-[8px] bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
          <Boxes className="w-6 h-6" />
        </div>
      ),
    },
    {
      title: "Out of Stock",
      value: outOfStock.toLocaleString("en-IN"),
      subtext: "Products",
      iconBg: "bg-amber-50 text-amber-500",
      icon: (
        <div className="w-12 h-12 rounded-[8px] bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
      ),
    },
    {
      title: "Total Value",
      value: `₹ ${totalValue}`,
      subtext: "Stock Value",
      iconBg: "bg-purple-50 text-purple-600",
      icon: (
        <div className="w-12 h-12 rounded-[8px] bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
          <div className="relative flex items-center justify-center">
            <span className="text-xl font-medium">₹</span>
            <svg className="absolute -inset-1.5 w-8 h-8 opacity-40 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-[8px] p-5 border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:shadow-md hover:border-gray-200 transition-all duration-200"
        >
          {stat.icon}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500">{stat.title}</span>
            <span className="text-2xl font-medium text-gray-900 tracking-tight mt-0.5">{stat.value}</span>
            <span className="text-xs text-gray-400 mt-0.5">{stat.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
