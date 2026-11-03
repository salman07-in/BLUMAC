import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCurrency, safeJsonParse } from "@/lib/utils";
import {
  CheckCircle2,
  Truck,
  MapPin,
  ArrowRight,
  Package,
} from "lucide-react";
import { InvoicePrintButton } from "@/components/checkout/InvoicePrintButton";
import { BlumacLogo } from "@/components/common/BlumacLogo";

interface ConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Top Banner Celebration */}
      <div className="bg-white rounded-2xl p-8 sm:p-12 border border-blumac-beige shadow-card text-center space-y-4">
        <BlumacLogo variant="image" height={54} className="mx-auto" />
        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
          Order Successfully Placed
        </span>

        <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-blumac-navy">
          Thank You, {order.customerName.split(" ")[0]}!
        </h1>

        <p className="text-xs sm:text-sm text-blumac-slate max-w-md mx-auto leading-relaxed">
          We have received your Korean skincare order. A confirmation has been sent to{" "}
          <strong className="text-blumac-navy">{order.customerEmail}</strong>.
        </p>

        <div className="inline-flex items-center gap-2 bg-blumac-ivory border border-blumac-beige px-4 py-2 rounded-xl text-xs font-bold text-blumac-navy">
          <span>Order Reference:</span>
          <span className="font-mono text-blumac-copper">{order.orderNumber}</span>
        </div>
      </div>

      {/* Shipment & Delivery Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blumac-copper" />
            Shipping Destination
          </h2>
          <div className="text-xs text-blumac-charcoal space-y-1">
            <p className="font-bold text-blumac-navy">{order.customerName}</p>
            <p>{shippingAddr.street}</p>
            {shippingAddr.landmark && <p>Landmark: {shippingAddr.landmark}</p>}
            <p>
              {shippingAddr.city}, {shippingAddr.state} - <strong>{shippingAddr.pinCode}</strong>
            </p>
            <p className="text-blumac-slate pt-1">Mobile: {order.customerPhone}</p>
          </div>
        </div>

        {/* Courier & Payment Status */}
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
            <Truck className="w-4 h-4 text-blumac-copper" />
            Fulfillment & Payment
          </h2>
          <div className="text-xs text-blumac-charcoal space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-blumac-slate">Payment Mode:</span>
              <span className="font-bold text-blumac-navy">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod === "RAZORPAY"
                  ? "Razorpay Online (UPI/Cards)"
                  : "Verified Test Payment"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blumac-slate">Payment Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  order.paymentStatus === "PAID"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blumac-slate">Estimated Dispatch:</span>
              <span className="font-semibold text-blumac-navy">Within 24 Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Order Breakdown */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-blumac-beige shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-blumac-beige">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
            <Package className="w-4 h-4 text-blumac-copper" />
            Itemized Order Details
          </h2>
          <InvoicePrintButton />
        </div>

        <div className="divide-y divide-blumac-beige/60">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-blumac-navy">{item.productName}</h4>
                <p className="text-[11px] text-blumac-slate">
                  {item.size ? `Size: ${item.size} • ` : ""}Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <span className="font-bold text-blumac-navy">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Totals */}
        <div className="pt-4 border-t border-blumac-beige space-y-2 text-xs text-blumac-charcoal">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-green-700 font-semibold">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-{formatCurrency(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>All-India Shipping</span>
            <span>
              {order.shippingFee === 0 ? (
                <strong className="text-blumac-forest">FREE</strong>
              ) : (
                formatCurrency(order.shippingFee)
              )}
            </span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-blumac-navy pt-2 border-t border-blumac-beige">
            <span>Final Paid Total</span>
            <span className="text-blumac-copper">{formatCurrency(order.grandTotal)}</span>
          </div>
          <p className="text-[10px] text-blumac-slate text-right">
            Includes GST 18% (₹{order.taxTotal})
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Link
          href="/account/orders"
          className="w-full sm:w-auto px-6 py-3 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded-full text-xs font-bold uppercase tracking-wider text-center transition-colors"
        >
          View in Order History
        </Link>
        <Link
          href="/shop"
          className="w-full sm:w-auto px-8 py-3 bg-blumac-navy hover:bg-blumac-copper text-white rounded-full text-xs font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
