"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Sparkles,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Truck,
  Package,
  Edit3,
  MapPin,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((res) => res.json()),
      fetch("/api/orders/my-orders")
        .then((res) => res.json())
        .catch(() => ({ orders: [] })),
    ])
      .then(([userData, orderData]) => {
        if (!userData.user) {
          router.push("/auth/login");
        } else {
          setUser(userData.user);
          if (orderData?.orders) {
            setOrders(orderData.orders);
          }
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

  const latestOrder = orders.length > 0 ? orders[0] : null;

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
                {user?.role === "ADMIN" ? "Administrator" : "K-Beauty Member"}
              </span>
            </div>
            <p className="text-xs text-blumac-slate mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link
            href="/account/profile"
            className="px-5 py-2.5 bg-blumac-copper hover:bg-blumac-copperLight text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Profile & Addresses</span>
          </Link>

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
            className="px-5 py-2.5 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy text-xs font-bold uppercase tracking-wider rounded-lg border border-blumac-beige transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-blumac-copper" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Loyalty Points */}
        <div className="bg-gradient-to-br from-blumac-navy to-blumac-navyDark text-white p-6 rounded-2xl border border-blumac-copper/40 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-copperLight">
              Loyalty Points
            </span>
            <Sparkles className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-3xl font-extrabold font-serif">50 Pts</p>
          <p className="text-[11px] text-blumac-beige">
            Welcome reward earned. Redeem points on your next authentic Korean skincare order.
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
          <p className="text-3xl font-extrabold font-serif text-blumac-navy">
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </p>
          <Link
            href="/account/orders"
            className="text-[11px] font-semibold text-blumac-copper hover:underline block"
          >
            View Order History &amp; Tracking &rarr;
          </Link>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white p-6 rounded-2xl border border-blumac-beige shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-slate">
              Delivery Addresses
            </span>
            <MapPin className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-3xl font-extrabold font-serif text-blumac-navy">Book</p>
          <Link
            href="/account/profile"
            className="text-[11px] font-semibold text-blumac-copper hover:underline block"
          >
            Manage Saved Addresses &rarr;
          </Link>
        </div>

        {/* Saved Wishlist */}
        <div className="bg-white p-6 rounded-2xl border border-blumac-beige shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-slate">
              Saved Wishlist
            </span>
            <Heart className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-3xl font-extrabold font-serif text-blumac-navy">Favorites</p>
          <Link
            href="/account/wishlist"
            className="text-[11px] font-semibold text-blumac-copper hover:underline block"
          >
            Browse Wishlist &rarr;
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-blumac-beige shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-blumac-beige">
          <div>
            <h2 className="text-lg font-bold font-serif text-blumac-navy">
              Recent Orders &amp; Tracking
            </h2>
            <p className="text-xs text-blumac-slate">
              Real-time courier updates with AWB tracking
            </p>
          </div>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-xs font-bold uppercase tracking-wider text-blumac-copper hover:underline flex items-center gap-1"
            >
              <span>See All Orders</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* If user has real orders, render latest order */}
        {latestOrder ? (
          <div className="p-5 bg-blumac-ivory/50 rounded-xl border border-blumac-beige space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-blumac-navy">
                  Order #{latestOrder.orderNumber}
                </span>
                <span className="text-blumac-slate ml-2">
                  • {latestOrder.items?.length || 1} Item(s)
                </span>
                <span className="text-blumac-slate ml-2 text-[11px]">
                  ({formatDate(latestOrder.createdAt)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 uppercase">
                  <Truck className="w-3 h-3" /> {latestOrder.status}
                </span>
                <span className="text-blumac-navy font-extrabold text-sm">
                  {formatCurrency(latestOrder.grandTotal)}
                </span>
              </div>
            </div>

            <div className="text-xs text-blumac-slate space-y-1">
              {latestOrder.items?.map((it: any, idx: number) => (
                <p key={idx}>• {it.productName || it.name || "Korean Skincare Product"} (Qty: {it.quantity})</p>
              ))}
            </div>

            <div className="pt-3 border-t border-blumac-beige/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <span className="text-blumac-slate">
                Payment: <strong className="text-blumac-navy">{latestOrder.paymentMethod}</strong>
              </span>
              <Link
                href={`/order/confirmation/${latestOrder.orderNumber}`}
                className="text-xs font-bold text-blumac-copper hover:underline flex items-center gap-1"
              >
                <span>View Full Invoice &amp; Tracking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-blumac-ivory/30 rounded-xl border border-dashed border-blumac-beige space-y-3">
            <Package className="w-8 h-8 text-blumac-copper/60 mx-auto" />
            <p className="text-xs font-semibold text-blumac-navy">No orders placed yet</p>
            <p className="text-[11px] text-blumac-slate max-w-sm mx-auto">
              Your recent Korean skincare purchases and live tracking details will appear here once you place an order.
            </p>
            <Link
              href="/shop"
              className="inline-block mt-2 px-6 py-2 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
