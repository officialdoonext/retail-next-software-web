"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!phone.trim() || phone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setStep("otp");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to API server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otp.trim()) {
      setErrorMsg("Please enter the 6-digit OTP code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      login(data.token, data.user);
      router.push("/onboarding");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP code. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link href="/welcome" className="inline-block">
          <Image
            src="/logo.png"
            alt="RetailNext Logo"
            width={150}
            height={40}
            priority
            className="h-9 w-auto object-contain mx-auto"
          />
        </Link>
        <p className="text-xs text-gray-400 mt-1 font-normal">
          Cloud POS & Multi-Outlet Inventory System
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[8px] border border-gray-100/90 shadow-[0_2px_16px_rgba(0,0,0,0.03)] w-full max-w-md p-6 sm:p-7 animate-in fade-in zoom-in duration-150">
        <div className="mb-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">
            {step === "phone" ? "Sign In to RetailNext" : "Enter Verification Code"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            {step === "phone"
              ? "Enter your registered mobile number to receive an instant OTP"
              : `Enter the 6-digit OTP code sent to +91 ${phone}`}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-100 rounded-[8px] text-xs text-rose-600 font-normal">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Mobile Form */}
        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-1 text-[11px] font-medium">Mobile Number *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-9 pl-11 pr-3 text-xs border border-gray-200 rounded-[8px] focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Get OTP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-gray-600 text-[11px] font-medium">6-Digit OTP Code *</label>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-[11px] text-[#6320EE] hover:underline cursor-pointer"
                >
                  Change Number
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-9 pl-9 pr-3 text-center tracking-widest text-sm font-medium border border-gray-200 rounded-[8px] focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                  autoFocus
                  required
                />
              </div>
            </div>



            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Log In</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          <span>New to RetailNext? </span>
          <Link href="/signup" className="text-[#6320EE] font-medium hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
