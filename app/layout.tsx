import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RetailNext - Products & Inventory Management",
  description: "Manage all your products, inventory, sales and purchases with RetailNext.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F9FD] text-[#1E293B] antialiased">
        <Navbar />
        <main className="flex-1 pb-12">{children}</main>
      </body>
    </html>
  );
}
