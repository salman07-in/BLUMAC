"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Truck, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders/my-orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/account"
          className="text-xs font-semibold text-blumac-slate hover:text-blumac-navy flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Account</span>
        </Link>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-blumac-navy">
          Order History & Tracking
        </h1>
        <p className="text-xs sm:text-sm text-blumac-slate mt-1">
          Review past skincare orders, download GST invoices, and track live courier shipments.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-blumac-copper border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-blumac-slate">Loading Orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-blumac-beige shadow-subtle space-y-4">
          <div className="w-16 h-16 bg-blumac-ivory rounded-full flex items-center justify-center mx-auto text-blumac-copper">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-blumac-navy font-serif">
            No orders placed yet
          </h2>
          <p className="text-xs text-blumac-slate max-w-sm mx-auto">
            Your completed orders and live courier tracking numbers will appear right here.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-blumac-beige gap-2 text-xs">
                <div>
                  <span className="font-extrabold text-sm text-blumac-navy">
                    Order #{order.orderNumber}
                  </span>
                  <span className="text-blumac-slate ml-3">
                    Placed on {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      order.status === "DELIVERED"
                        ? "bg-green-100 text-green-800"
                        : order.status === "SHIPPED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm font-extrabold text-blumac-navy">
                    {formatCurrency(order.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 text-xs text-blumac-charcoal">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <div>
                      <span className="font-semibold text-blumac-navy">
                        {item.productName}
                      </span>
                      {item.size && (
                        <span className="text-blumac-slate ml-2">({item.size})</span>
                      )}
                      <span className="text-blumac-slate ml-2">x {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-blumac-navy">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Courier Tracking Bar */}
              {order.trackingNumber && (
                <div className="p-3 bg-blumac-ivory rounded-lg border border-blumac-beige flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blumac-copper" />
                    <span>
                      Courier: <strong>{order.courierName || "Express Courier"}</strong> • AWB:{" "}
                      <strong>{order.trackingNumber}</strong>
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      order.courierName + " tracking " + order.trackingNumber
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blumac-copper font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Track Package</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
