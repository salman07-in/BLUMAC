import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Package,
  Tag,
  Truck,
} from "lucide-react";

export const metadata = {
  title: "Admin Executive Dashboard | BLUMAC Korean Store",
};

export default async function AdminDashboardPage() {
  // Aggregate real orders and metrics from database
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({
    where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } },
  });

  const allOrders = await prisma.order.findMany({
    select: { grandTotal: true },
  });
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const lowStockCount = await prisma.inventory.count({
    where: { quantityOnHand: { lte: 10 } },
  });

  const coupons = await prisma.coupon.findMany({
    take: 4,
    orderBy: { usedCount: "desc" },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs text-blumac-slate mt-1">
            Real-time sales, order fulfillment, and inventory analytics for BLUMAC Korean Store
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/ai-studio"
            className="px-4 py-2.5 bg-blumac-copper hover:bg-blumac-copperLight text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Product Studio</span>
          </Link>

          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-blumac-navy hover:bg-blumac-navyLight text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-blumac-beige shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-slate">
              Total Revenue
            </span>
            <div className="p-2 bg-green-50 text-green-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[11px] text-green-700 font-semibold mt-1">
              Active Pan-India Gross
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-blumac-beige shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-slate">
              Total Orders
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
              {totalOrders}
            </p>
            <p className="text-[11px] text-blumac-slate mt-1">
              {pendingOrders} awaiting shipment
            </p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-6 rounded-2xl border border-blumac-beige shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-slate">
              Avg. Order Value
            </span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
              {formatCurrency(aov)}
            </p>
            <p className="text-[11px] text-blumac-slate mt-1">
              Per fulfilled customer haul
            </p>
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-white p-6 rounded-2xl border border-blumac-beige shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-slate">
              Stock Alerts
            </span>
            <div className="p-2 bg-red-50 text-red-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
              {lowStockCount} SKUs
            </p>
            <p className="text-[11px] text-red-600 font-semibold mt-1">
              At or below low threshold
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders Table & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-blumac-beige shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-blumac-beige">
            <div>
              <h2 className="text-base font-bold font-serif text-blumac-navy">
                Recent Orders Fulfillment
              </h2>
              <p className="text-xs text-blumac-slate">
                Orders placed across Indian states requiring dispatch
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold uppercase text-blumac-copper hover:underline"
            >
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-blumac-ivory text-blumac-navy uppercase text-[10px] tracking-wider border-b border-blumac-beige">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Order #</th>
                  <th className="py-2.5 px-3 font-bold">Customer</th>
                  <th className="py-2.5 px-3 font-bold">Amount</th>
                  <th className="py-2.5 px-3 font-bold">Payment</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blumac-beige/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-blumac-ivory/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blumac-navy">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-blumac-navy">{o.customerName}</p>
                      <p className="text-[11px] text-blumac-slate">{o.customerPhone}</p>
                    </td>
                    <td className="py-3 px-3 font-bold text-blumac-navy">
                      {formatCurrency(o.grandTotal)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800">
                        {o.paymentMethod} • {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : o.status === "SHIPPED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-blumac-copper hover:underline font-bold text-[11px]"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel: Coupons & Quick Status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Performance */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-blumac-beige">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blumac-copper" />
                Active Coupons
              </h3>
              <Link
                href="/admin/coupons"
                className="text-[11px] font-bold text-blumac-copper hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-blumac-navy">
                      {c.code}
                    </span>
                    <p className="text-[10px] text-blumac-slate">
                      {c.discountType === "PERCENTAGE"
                        ? `${c.discountValue}% OFF`
                        : `₹${c.discountValue} FLAT OFF`}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-blumac-copper">
                    {c.usedCount} Uses
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics & Shipping Hub Status */}
          <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-card space-y-3 text-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blumac-copper" />
              Logistics Dispatch Hub
            </h3>
            <p className="text-blumac-slate leading-relaxed">
              Bengaluru Main Fulfillment Hub operational. Daily courier pickup window: <strong>3:00 PM - 5:30 PM IST</strong>.
            </p>
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-[11px] font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>BlueDart & Delhivery API services operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
