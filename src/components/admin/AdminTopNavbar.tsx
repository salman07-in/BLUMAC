"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ExternalLink,
  LogOut,
  Bell,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";

interface AdminTopNavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
  pendingOrdersCount?: number;
  lowStockCount?: number;
}

export function AdminTopNavbar({
  user,
  pendingOrdersCount = 0,
  lowStockCount = 0,
}: AdminTopNavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-blumac-beige px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Left: Security Status & Live Store */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-blumac-navy hidden sm:inline">
            Control Center Active
          </span>
          <span className="text-[10px] text-blumac-slate hidden md:inline">
            • 256-Bit SSL Secured
          </span>
        </div>

        <div className="h-4 w-px bg-blumac-beige hidden sm:block" />

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs text-blumac-copper hover:text-blumac-copperLight font-semibold transition-colors"
        >
          <span>View Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Right: Operational Tickers & Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Alerts Pills */}
        <div className="hidden lg:flex items-center gap-2">
          {pendingOrdersCount > 0 && (
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold hover:bg-amber-100 transition-colors"
            >
              <Bell className="w-3 h-3 text-amber-600" />
              <span>{pendingOrdersCount} Pending Orders</span>
            </Link>
          )}

          {lowStockCount > 0 && (
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-[11px] font-bold hover:bg-red-100 transition-colors"
            >
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>{lowStockCount} Low Stock SKUs</span>
            </Link>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-2 border-l border-blumac-beige">
          <div className="w-8 h-8 rounded-full bg-blumac-navy text-blumac-copperLight flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-blumac-navy leading-none">
              {user?.name || "BLUMAC Head Admin"}
            </p>
            <p className="text-[10px] text-blumac-slate font-medium mt-0.5">
              {user?.role === "ADMIN" ? "Super Administrator" : "Operations Staff"}
            </p>
          </div>
        </div>

        {/* Secure Sign Out Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-all shadow-subtle disabled:opacity-50"
          title="Sign out of Admin Console"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </span>
        </button>
      </div>
    </header>
  );
}
