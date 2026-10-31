import React from "react";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopNavbar } from "@/components/admin/AdminTopNavbar";
import { prisma } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const currentPath = headersList.get("x-admin-path") || "";

  // If on admin login page, render clean standalone login view without sidebars
  if (currentPath === "/admin/login") {
    return <>{children}</>;
  }

  // Server-side authentication check
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    redirect("/admin/login");
  }

  // Get live counts for the top navbar
  let pendingOrdersCount = 0;
  let lowStockCount = 0;

  try {
    pendingOrdersCount = await prisma.order.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } },
    });

    lowStockCount = await prisma.inventory.count({
      where: { quantityOnHand: { lte: 10 } },
    });
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col lg:flex-row">
      {/* Admin Modular Sidebar */}
      <AdminSidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNavbar
          user={user}
          pendingOrdersCount={pendingOrdersCount}
          lowStockCount={lowStockCount}
        />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
