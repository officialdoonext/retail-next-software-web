"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

// Routes that do not require any authentication
const PUBLIC_ROUTES = ["/welcome", "/login", "/signup"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, token, activeBusiness, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isOnboardingRoute = pathname === "/onboarding";

  useEffect(() => {
    if (isLoading) return;

    // Case 1: User is NOT logged in
    if (!token || !user) {
      if (!isPublicRoute) {
        // Immediately redirect unauthenticated user to /welcome
        router.replace("/welcome");
      }
      return;
    }

    // Case 2: User IS logged in, but tries to visit public auth pages (/login, /signup, /welcome)
    if (isPublicRoute) {
      if (activeBusiness && activeBusiness.status === "active") {
        router.replace("/products");
      } else {
        router.replace("/onboarding");
      }
      return;
    }

    // Case 3: User IS logged in, but tries to access software routes without an active, unexpired business
    if (!isOnboardingRoute) {
      if (!activeBusiness) {
        // No business selected yet -> go to onboarding
        router.replace("/onboarding");
        return;
      }

      const isExpired = !activeBusiness.expiryDate || new Date(activeBusiness.expiryDate) <= new Date();
      const isActive = activeBusiness.status === "active" && !isExpired;

      if (!isActive) {
        // Business is inactive or expired -> block access and redirect to onboarding
        router.replace("/onboarding");
      }
    }
  }, [user, token, activeBusiness, isLoading, pathname, isPublicRoute, isOnboardingRoute, router]);

  // While checking authentication state, show clean loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6320EE] animate-spin" />
        <span className="text-xs text-gray-400 mt-2 font-normal">Authenticating session...</span>
      </div>
    );
  }

  // If user is not logged in and not on a public route, do NOT render the software content
  if (!token && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6320EE] animate-spin" />
        <span className="text-xs text-gray-400 mt-2 font-normal">Redirecting to login...</span>
      </div>
    );
  }

  // If user is logged in, but not on onboarding, and does not have an active valid business, block software rendering
  if (token && !isPublicRoute && !isOnboardingRoute) {
    const isExpired = !activeBusiness?.expiryDate || new Date(activeBusiness.expiryDate) <= new Date();
    const isActive = activeBusiness?.status === "active" && !isExpired;

    if (!isActive) {
      return (
        <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-[8px] bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-medium text-gray-900 mb-1">Access Restricted</h2>
          <p className="text-xs text-gray-500 max-w-sm mb-4 font-normal">
            You need an active, unexpired business subscription to access the POS software.
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="h-8 px-4 bg-[#6320EE] hover:bg-[#5218cf] text-white text-xs font-medium rounded-[8px] cursor-pointer"
          >
            Go to Onboarding
          </button>
        </div>
      );
    }
  }

  return <>{children}</>;
}
