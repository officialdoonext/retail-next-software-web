"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProductsPage from "./products/page";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, token, activeBusiness, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push("/welcome");
      } else if (!activeBusiness) {
        router.push("/onboarding");
      }
    }
  }, [token, activeBusiness, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#6320EE] animate-spin" />
      </div>
    );
  }

  if (!token || !activeBusiness) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#6320EE] animate-spin" />
      </div>
    );
  }

  return <ProductsPage />;
}
