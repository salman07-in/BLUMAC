import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency, safeJsonParse } from "@/lib/utils";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Package,
} from "lucide-react";
import { InvoicePrintButton } from "@/components/checkout/InvoicePrintButton";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      shipments: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddr = safeJsonParse<Record<string, any>>(order.shippingAddress, {});

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-blumac-slate hover:text-blumac-navy flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders Queue</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold font-serif text-blumac-navy">
              Order #{order.orderNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.status === "DELIVERED"
                  ? "bg-green-100 text-green-800"
                  : order.status === "SHIPPED"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <InvoicePrintButton />
      </div>

      {/* Grid: Customer & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blumac-copper" />
            Customer & Delivery Address
          </h2>
          <div className="text-xs text-blumac-charcoal space-y-1">
            <p className="font-bold text-blumac-navy">{order.customerName}</p>
            <p>{shippingAddr.street}</p>
            {shippingAddr.landmark && <p>Landmark: {shippingAddr.landmark}</p>}
            <p>
              {shippingAddr.city}, {shippingAddr.state} - <strong>{shippingAddr.pinCode}</strong>
            </p>
            <div className="pt-2 border-t border-blumac-beige/60 space-y-0.5 text-blumac-slate">
              <p>Phone: <strong className="text-blumac-navy">{order.customerPhone}</strong></p>
              <p>Email: <strong className="text-blumac-navy">{order.customerEmail}</strong></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
            <Truck className="w-4 h-4 text-blumac-copper" />
            Courier & Fulfillment
          </h2>
          <div className="text-xs text-blumac-charcoal space-y-2">
            <div className="flex justify-between">
              <span className="text-blumac-slate">Assigned Courier:</span>
              <span className="font-bold text-blumac-navy">
                {order.courierName || "BlueDart Express Air"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blumac-slate">AWB Airway Bill:</span>
              <span className="font-mono font-bold text-blumac-copper">
                {order.trackingNumber || "Pending Generation"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blumac-slate">Payment Mode:</span>
              <span className="font-bold text-blumac-navy">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blumac-slate">Payment Status:</span>
              <span className="font-bold text-green-700">{order.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Order Breakdown */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-blumac-beige shadow-card space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2 pb-3 border-b border-blumac-beige">
          <Package className="w-4 h-4 text-blumac-copper" />
          Fulfillment Manifest & Packing Slip
        </h2>

        <div className="divide-y divide-blumac-beige/60">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-blumac-navy">{item.productName}</h4>
                <p className="text-[11px] text-blumac-slate">
                  {item.size ? `Size: ${item.size} • ` : ""}Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <span className="font-extrabold text-blumac-navy">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-blumac-beige space-y-2 text-xs text-blumac-charcoal">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-green-700 font-semibold">
              <span>Discount ({order.couponCode})</span>
              <span>-{formatCurrency(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>All-India Shipping</span>
            <span>{order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-blumac-navy pt-2 border-t border-blumac-beige">
            <span>Final Total</span>
            <span className="text-blumac-copper">{formatCurrency(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
