"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { DataPrivacyConsentBanner } from "@/components/common/DataPrivacyConsentBanner";

interface StoreFrontShellProps {
  children: React.ReactNode;
}

export function StoreFrontShell({ children }: StoreFrontShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // On ALL admin routes (/admin, /admin/orders, /admin/products, /admin/login, etc.),
  // isolate completely: DO NOT show customer store AnnouncementBar, Header (products/categories/cart), or Footer!
  if (isAdminRoute) {
    return <div className="min-h-screen w-full flex flex-col">{children}</div>;
  }

  // Customer Storefront: Full e-commerce customer layout
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <DataPrivacyConsentBanner />
    </>
  );
}
