"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  id: string;
  phone: string;
  fullName: string;
  city?: string;
  role?: string;
}

export interface Business {
  id: string;
  name: string;
  city: string;
  address?: string;
  ownerId: string;
  ownerName?: string;
  status: 'active' | 'inactive';
  expiryDate: string | null;
  plan?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeBusiness: Business | null;
  businesses: Business[];
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  selectBusiness: (business: Business) => boolean;
  refreshBusinesses: () => Promise<Business[]>;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load persisted session on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("rn_token");
      const storedUser = localStorage.getItem("rn_user");
      const storedBusiness = localStorage.getItem("rn_active_business");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedBusiness) {
          setActiveBusiness(JSON.parse(storedBusiness));
        }
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("rn_token", newToken);
    localStorage.setItem("rn_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveBusiness(null);
    setBusinesses([]);
    localStorage.removeItem("rn_token");
    localStorage.removeItem("rn_user");
    localStorage.removeItem("rn_active_business");
    router.push("/login");
  };

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (activeBusiness?.id) {
      headers["x-business-id"] = activeBusiness.id;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `API error (${response.status})`);
    }

    return data;
  };

  const refreshBusinesses = async (): Promise<Business[]> => {
    if (!token) return [];
    try {
      const data = await apiFetch("/businesses");
      const list = data.data || [];
      setBusinesses(list);

      // If active business is updated, sync it
      if (activeBusiness) {
        const matched = list.find((b: Business) => b.id === activeBusiness.id);
        if (matched) {
          setActiveBusiness(matched);
          localStorage.setItem("rn_active_business", JSON.stringify(matched));
        }
      }
      return list;
    } catch (err) {
      console.error("Error fetching businesses:", err);
      return [];
    }
  };

  const selectBusiness = (business: Business): boolean => {
    const isExpired = !business.expiryDate || new Date(business.expiryDate) <= new Date();
    const isActive = business.status === "active" && !isExpired;

    if (!isActive) {
      return false;
    }

    setActiveBusiness(business);
    localStorage.setItem("rn_active_business", JSON.stringify(business));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeBusiness,
        businesses,
        isLoading,
        login,
        logout,
        selectBusiness,
        refreshBusinesses,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
