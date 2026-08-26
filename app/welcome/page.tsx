"use client";

import React from "react";
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
  Lock
} from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/welcome" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="RetailNext Logo"
              width={140}
              height={38}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="h-8 px-3.5 flex items-center justify-center text-xs font-medium text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50/70 rounded-[8px] transition-all cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="h-8 px-4 flex items-center justify-center text-xs font-medium text-white bg-[#6320EE] hover:bg-[#5218cf] rounded-[8px] shadow-2xs transition-all cursor-pointer"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 lg:py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100 text-[#6320EE] rounded-[8px] text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next Generation Cloud POS & Inventory Platform</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 tracking-tight leading-tight max-w-3xl mx-auto">
          Scale your retail & sweet shop business with smart automation
        </h1>

        <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed font-normal">
          Manage inventory, product variations, thermal billing, categories, barcodes, and multiple retail outlets with enterprise-grade security.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto h-10 px-6 inline-flex items-center justify-center gap-2 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-sm transition-all cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto h-10 px-6 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium border border-gray-200/90 rounded-[8px] shadow-2xs transition-all cursor-pointer"
          >
            <span>Login to Existing Business</span>
          </Link>
        </div>

        {/* Key Feature Badges */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left max-w-4xl mx-auto">
          <div className="bg-white p-5 rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="w-9 h-9 rounded-[8px] bg-purple-50 flex items-center justify-center text-[#6320EE] mb-3">
              <Store className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-medium text-gray-900 text-sm mb-1">Multi-Business Onboarding</h3>
            <p className="text-xs text-gray-400 font-normal leading-relaxed">
              Create and manage multiple branches with isolated inventory, billing, and active subscription guards.
            </p>
          </div>

          <div className="bg-white p-5 rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="w-9 h-9 rounded-[8px] bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-medium text-gray-900 text-sm mb-1">Variations & Auto Barcodes</h3>
            <p className="text-xs text-gray-400 font-normal leading-relaxed">
              Assign weights, pack sizes, and custom flavors with unique 13-digit EAN barcodes and ImageKit CDN.
            </p>
          </div>

          <div className="bg-white p-5 rounded-[8px] border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="w-9 h-9 rounded-[8px] bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-medium text-gray-900 text-sm mb-1">Strict Multi-Tenant Security</h3>
            <p className="text-xs text-gray-400 font-normal leading-relaxed">
              AES-256 encrypted authentication, Descope OTP login, and tenant guard blocking expired outlets.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-100 py-5 text-center text-xs text-gray-400">
        <p>© 2026 RetailNext Software Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
