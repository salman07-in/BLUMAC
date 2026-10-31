"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Sparkles,
  LogOut,
  Clock,
  ShieldCheck,
  ChevronRight,
  Truck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/auth/login");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-blumac-copper border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-blumac-slate uppercase tracking-wider font-semibold">
          Loading Customer Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-blumac-beige shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blumac-navy rounded-full flex items-center justify-center text-white text-2xl font-bold font-serif shrink-0 border-2 border-blumac-copper">
            {user?.name?.[0]?.toUpperCase() || "B"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-blumac-navy">
                {user?.name}
              </h1>
              <span className="bg-blumac-copper/10 text-blumac-copper text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-blumac-copper/30">
                {user?.role === "ADMIN" ? "Administrator" : "K-Beauty VIP"}
              </span>
            </div>
            <p className="text-xs text-blumac-slate mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-5 py-2.5 bg-blumac-navy hover:bg-blumac-navyLight text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-blumac-copper" />
              <span>Admin Panel</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy text-xs font-bold uppercase tracking-wider rounded-lg border border-blumac-beige transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5 text-blumac-copper" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Loyalty Points */}
        <div className="bg-gradient-to-br from-blumac-navy to-blumac-navyDark text-white p-6 rounded-2xl border border-blumac-copper/40 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-copperLight">
              Loyalty Points
            </span>
            <Sparkles className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-3xl font-extrabold font-serif">150 Pts</p>
          <p className="text-[11px] text-blumac-beige">
            Worth ₹150 discount on your next authentic Korean skincare order.
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-blumac-beige shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-slate">
              Lifetime Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-3xl font-extrabold font-serif text-blumac-navy">1 Order</p>
          <Link
            href="/account/orders"
            className="text-[11px] font-semibold text-blumac-copper hover:underline block"
          >
            View Order History & Tracking →
          </Link>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white p-6 rounded-2xl border border-blumac-beige shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-slate">
              Primary Address
            </span>
            <MapPin className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-xs font-semibold text-blumac-navy">
            Bengaluru 560038
          </p>
          <p className="text-[11px] text-blumac-slate line-clamp-1">
            Indiranagar 100ft Road, Bengaluru, Karnataka
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-blumac-beige shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-blumac-beige">
          <div>
            <h2 className="text-lg font-bold font-serif text-blumac-navy">
              Recent Orders & Tracking
            </h2>
            <p className="text-xs text-blumac-slate">
              Real-time courier updates with AWB tracking
            </p>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-bold uppercase tracking-wider text-blumac-copper hover:underline flex items-center gap-1"
          >
            <span>See All Orders</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Sample Seeded Order Card */}
        <div className="p-5 bg-blumac-ivory/50 rounded-xl border border-blumac-beige space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-blumac-navy">Order #BLU-2026-98102</span>
              <span className="text-blumac-slate ml-2">• 2 Items</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                <Truck className="w-3 h-3" /> In Transit (BlueDart)
              </span>
              <span className="text-blumac-navy font-extrabold text-sm">
                {formatCurrency(2114)}
              </span>
            </div>
          </div>

          <div className="text-xs text-blumac-slate space-y-1">
            <p>• COSRX Advanced Snail 96 Mucin Power Essence (100ml)</p>
            <p>• Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+ (50ml)</p>
          </div>

          <div className="pt-3 border-t border-blumac-beige/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <span className="text-blumac-slate">
              AWB: <strong className="text-blumac-navy">BD98271892IN</strong> • Dispatched from Shahjahanpur Central Hub
            </span>
            <a
              href="https://www.bluedart.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blumac-copper hover:underline flex items-center gap-1"
            >
              <span>Track Courier</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
