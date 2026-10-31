"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  Eye,
  Printer,
  FileText,
  MessageCircle,
  X,
  Truck,
  CheckCircle2,
  Copy,
  Clock,
  ShieldCheck,
  Package,
} from "lucide-react";

interface OrdersTableClientProps {
  initialOrders: any[];
}

export function OrdersTableClient({ initialOrders }: OrdersTableClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<any | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [copiedAWB, setCopiedAWB] = useState(false);

  const counts = {
    ALL: orders.length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    PROCESSING: orders.filter((o) => o.status === "PROCESSING").length,
    SHIPPED: orders.filter((o) => o.status === "SHIPPED").length,
    DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchEmail = o.customerEmail?.toLowerCase().includes(q);
      const matchPhone = o.customerPhone?.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {
      // ignore
    }
  };

  const sendWhatsAppUpdate = (order: any) => {
    const rawPhone = (order.customerPhone || "").replace(/\D/g, "");
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const msg = encodeURIComponent(
      `✨ Annyeonghaseyo ${order.customerName}! 🌸\n\nYour BLUMAC Korean Skincare Order #${order.orderNumber} is now: *${order.status}*.\n\nTotal: ₹${order.grandTotal.toLocaleString("en-IN")}\nCarrier: BlueDart Express Air\nAWB Tracking: BLU-${order.orderNumber.slice(-8)}\n\nTrack your order anytime at: https://blumac.in/account/orders\n\nThank you for choosing 100% Authentic Korean Beauty with BLUMAC!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Status Badges Tabs */}
      <div className="flex flex-wrap gap-2 pb-1 border-b border-blumac-beige">
        {(
          [
            { id: "ALL", label: "All Orders", count: counts.ALL },
            { id: "CONFIRMED", label: "Confirmed", count: counts.CONFIRMED },
            { id: "PROCESSING", label: "Processing", count: counts.PROCESSING },
            { id: "SHIPPED", label: "In Transit / Shipped", count: counts.SHIPPED },
            { id: "DELIVERED", label: "Delivered", count: counts.DELIVERED },
            { id: "CANCELLED", label: "Cancelled", count: counts.CANCELLED },
          ] as const
        ).map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-blumac-navy text-white shadow-sm"
                  : "bg-white text-blumac-slate hover:bg-blumac-ivory border border-blumac-beige"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? "bg-blumac-copper text-white"
                    : "bg-blumac-ivory text-blumac-navy"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-blumac-beige shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Order #, Customer, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg py-2 pl-9 pr-4 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
          />
          <Search className="w-4 h-4 text-blumac-slate absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 text-xs text-blumac-slate">
          <span>Showing <strong className="text-blumac-navy">{filtered.length}</strong> of {orders.length} orders</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B182D] text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">Order # & Date</th>
                <th className="py-3.5 px-4 font-bold">Customer & Delivery Destination</th>
                <th className="py-3.5 px-4 font-bold">Items Count</th>
                <th className="py-3.5 px-4 font-bold">Total Amount</th>
                <th className="py-3.5 px-4 font-bold">Payment</th>
                <th className="py-3.5 px-4 font-bold">Fulfillment Status</th>
                <th className="py-3.5 px-4 font-bold text-right">E-Commerce Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blumac-beige">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-blumac-slate">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const addr = JSON.parse(order.shippingAddress || "{}");
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-blumac-ivory/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-blumac-navy hover:text-blumac-copper block"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-[10px] text-blumac-slate mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-blumac-navy">
                          {order.customerName}
                        </p>
                        <p className="text-[11px] text-blumac-slate">
                          {addr.city || "Delhi"}, {addr.state || "Delhi"} •{" "}
                          <span className="font-mono font-bold text-blumac-navy">
                            PIN {addr.pinCode || "110001"}
                          </span>
                        </p>
                        {order.customerPhone && (
                          <p className="text-[10px] text-blumac-slate font-mono">
                            📞 {order.customerPhone}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-blumac-navy">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blumac-ivory font-semibold text-blumac-navy">
                          <Package className="w-3 h-3 text-blumac-copper" />
                          {order.items?.length || 1} units
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-blumac-navy text-sm block">
                          {formatCurrency(order.grandTotal)}
                        </span>
                        <span className="text-[10px] text-blumac-slate">
                          GST 18% incl.
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider block w-fit ${
                            order.paymentMethod === "COD"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                          }`}
                        >
                          {order.paymentMethod}
                        </span>
                        <span className="text-[10px] text-blumac-slate font-semibold block mt-0.5">
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border cursor-pointer ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : order.status === "SHIPPED"
                              ? "bg-sky-50 text-sky-800 border-sky-300"
                              : order.status === "CANCELLED"
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Customer Alert */}
                          <button
                            title="Send WhatsApp Order Update"
                            onClick={() => sendWhatsAppUpdate(order)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Print 4x6 Shipping Label */}
                          <button
                            title="Thermal Shipping Label (4x6 BlueDart)"
                            onClick={() => setSelectedLabelOrder(order)}
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Print GST Tax Invoice */}
                          <button
                            title="GST Tax Invoice (PDF/Print)"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* View Order Detail */}
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy rounded-lg font-bold text-[11px] border border-blumac-beige transition-colors"
                          >
                            <Eye className="w-3 h-3 text-blumac-copper" />
                            <span>Details</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Thermal Shipping Label (4x6 Logistics Standard) */}
      {selectedLabelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blumac-beige space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-blumac-beige">
              <div>
                <h3 className="font-bold font-serif text-blumac-navy text-sm">
                  4×6 Thermal Air Waybill (AWB)
                </h3>
                <p className="text-[11px] text-blumac-slate">
                  BlueDart Express Air Priority
                </p>
              </div>
              <button
                onClick={() => setSelectedLabelOrder(null)}
                className="p-1 rounded-full hover:bg-blumac-ivory"
              >
                <X className="w-4 h-4 text-blumac-slate" />
              </button>
            </div>

            {/* Thermal Label Content */}
            <div
              id="thermal-label"
              className="border-2 border-black p-4 font-mono text-[11px] space-y-3 bg-white text-black"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-black pb-2">
                <div>
                  <h4 className="font-extrabold text-sm uppercase">BLUMAC KOREAN STORE</h4>
                  <p className="text-[9px]">100% Authentic Korean Beauty Store</p>
                  <p className="text-[9px]">BLUMAC STORE, Bahadurganj Rd, near Banvari lal jewellers, Sadar Bazar, Shahjahanpur, UP 242001</p>
                  <p className="text-[9px] font-bold">Helpline: +91 6306955690 / 9519506235 / 9559579883</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-black text-white font-extrabold text-[10px]">
                    AIR EXP
                  </span>
                  <p className="text-[9px] mt-1 font-bold">ROUTE: DEL-NORTH-A1</p>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center py-2 bg-gray-50 border border-dashed border-black">
                <div className="inline-block tracking-widest font-extrabold text-lg">
                  ||||| | |||| |||| ||| ||||| ||| ||||
                </div>
                <p className="font-bold text-[11px] mt-1">
                  AWB: BLU-{selectedLabelOrder.orderNumber.slice(-8)}
                </p>
              </div>

              {/* Destination */}
              <div className="border border-black p-2 bg-gray-50">
                <p className="font-extrabold text-[10px] text-gray-500 uppercase">
                  DELIVERY DESTINATION:
                </p>
                <p className="font-bold text-xs">{selectedLabelOrder.customerName}</p>
                {(() => {
                  const addr = JSON.parse(selectedLabelOrder.shippingAddress || "{}");
                  return (
                    <div className="text-[10px] mt-1 leading-tight">
                      <p>{addr.addressLine1}</p>
                      {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                      <p className="font-bold">
                        {addr.city}, {addr.state} - PIN: {addr.pinCode}
                      </p>
                      <p className="mt-1 font-bold">📞 {selectedLabelOrder.customerPhone || "N/A"}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Payment & Value */}
              <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-b border-black py-2">
                <div>
                  <span className="font-bold text-gray-600">PAYMENT TYPE:</span>
                  <p className="font-extrabold text-xs">
                    {selectedLabelOrder.paymentMethod === "COD"
                      ? "CASH ON DELIVERY (COD)"
                      : "PREPAID (ONLINE)"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-600">COLLECT AMOUNT:</span>
                  <p className="font-extrabold text-xs">
                    {selectedLabelOrder.paymentMethod === "COD"
                      ? formatCurrency(selectedLabelOrder.grandTotal)
                      : "₹0.00 (PAID)"}
                  </p>
                </div>
              </div>

              {/* Items summary */}
              <div className="text-[9px] text-gray-600">
                <p>
                  <strong>Contents:</strong> Authentic Korean Skincare Products (Fragile Glass/Toner)
                </p>
                <p>
                  <strong>Total Units:</strong> {selectedLabelOrder.items?.length || 1} | Weight: 0.45 KG
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Thermal Label (4×6)</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `BLU-${selectedLabelOrder.orderNumber.slice(-8)}`
                  );
                  setCopiedAWB(true);
                  setTimeout(() => setCopiedAWB(false), 2000);
                }}
                className="px-3 py-2 border border-blumac-beige rounded-lg text-xs font-bold text-blumac-navy hover:bg-blumac-ivory flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedAWB ? "Copied!" : "Copy AWB"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GST Tax Invoice */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-blumac-beige space-y-5 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-blumac-beige">
              <div>
                <h3 className="font-bold font-serif text-blumac-navy text-base">
                  Tax Invoice / Bill of Supply
                </h3>
                <p className="text-xs text-blumac-slate">
                  Invoice #{selectedInvoiceOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="p-1 rounded-full hover:bg-blumac-ivory"
              >
                <X className="w-4 h-4 text-blumac-slate" />
              </button>
            </div>

            {/* Invoice Body */}
            <div className="space-y-4 text-xs border border-blumac-beige p-5 rounded-xl bg-white text-blumac-navy">
              {/* Header with BLUMAC details */}
              <div className="flex justify-between items-start border-b border-blumac-beige pb-4">
                <div>
                  <h4 className="font-serif font-black text-base text-blumac-navy">
                    BLUMAC KOREAN STORE PRIVATE LIMITED
                  </h4>
                  <p className="text-[11px] text-blumac-slate mt-0.5">
                    GSTIN: <strong>09AAACB2109P1Z8</strong> | PAN: AAACB2109P
                  </p>
                  <p className="text-[11px] text-blumac-slate">
                    BLUMAC STORE, Bahadurganj Rd, near Banvari lal jewellers, Sadar Bazar, Shahjahanpur, Uttar Pradesh 242001
                  </p>
                  <p className="text-[11px] text-blumac-slate">
                    Helplines: +91 6306955690, +91 9519506235, +91 9559579883 | Email: care@blumac.in
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-blumac-ivory border border-blumac-beige font-mono font-bold text-blumac-copper rounded text-xs block">
                    ORIGINAL FOR RECIPIENT
                  </span>
                  <p className="text-[11px] text-blumac-slate mt-1">
                    Date: {formatDate(selectedInvoiceOrder.createdAt)}
                  </p>
                </div>
              </div>

              {/* Billed to */}
              <div className="grid grid-cols-2 gap-4 border-b border-blumac-beige pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-blumac-slate">Billed To (Customer):</p>
                  <p className="font-bold text-sm text-blumac-navy">{selectedInvoiceOrder.customerName}</p>
                  <p className="text-[11px] text-blumac-slate">📞 {selectedInvoiceOrder.customerPhone || "N/A"}</p>
                  <p className="text-[11px] text-blumac-slate">✉️ {selectedInvoiceOrder.customerEmail || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-blumac-slate">Shipping Address:</p>
                  {(() => {
                    const addr = JSON.parse(selectedInvoiceOrder.shippingAddress || "{}");
                    return (
                      <p className="text-[11px] text-blumac-slate">
                        {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                    );
                  })()}
                  <p className="text-[11px] text-blumac-slate mt-1">
                    Place of Supply: State Code (07)
                  </p>
                </div>
              </div>

              {/* Line items */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-blumac-beige text-[10px] uppercase text-blumac-slate font-bold">
                    <th className="py-2">Item Description</th>
                    <th className="py-2">HSN Code</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Taxable Value</th>
                    <th className="py-2 text-right">GST (18%)</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blumac-beige">
                  {(selectedInvoiceOrder.items || [
                    {
                      id: "item-1",
                      productName: "COSRX Advanced Snail 96 Mucin Power Essence 100ml",
                      quantity: 1,
                      price: selectedInvoiceOrder.grandTotal,
                    },
                  ]).map((item: any, idx: number) => {
                    const total = item.price * (item.quantity || 1);
                    const taxable = Math.round((total / 1.18) * 100) / 100;
                    const gst = Math.round((total - taxable) * 100) / 100;
                    return (
                      <tr key={idx} className="py-2">
                        <td className="py-2 font-medium">{item.productName}</td>
                        <td className="py-2 text-blumac-slate font-mono">33049900</td>
                        <td className="py-2 text-center">{item.quantity || 1}</td>
                        <td className="py-2 text-right font-mono">₹{taxable.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono">₹{gst.toFixed(2)}</td>
                        <td className="py-2 text-right font-bold font-mono">₹{total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="pt-3 border-t border-blumac-beige flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-blumac-slate">
                    <span>Taxable Value:</span>
                    <span className="font-mono">
                      ₹{((selectedInvoiceOrder.grandTotal / 1.18)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-blumac-slate">
                    <span>CGST (9%):</span>
                    <span className="font-mono">
                      ₹{(((selectedInvoiceOrder.grandTotal * 0.18) / 1.18) / 2).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-blumac-slate">
                    <span>SGST (9%):</span>
                    <span className="font-mono">
                      ₹{(((selectedInvoiceOrder.grandTotal * 0.18) / 1.18) / 2).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-blumac-navy pt-2 border-t border-blumac-beige">
                    <span>Grand Total:</span>
                    <span className="font-mono text-blumac-copper">
                      {formatCurrency(selectedInvoiceOrder.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer signature */}
              <div className="pt-4 border-t border-dashed border-blumac-beige flex justify-between items-end text-[10px] text-blumac-slate">
                <div>
                  <p>Certified 100% Genuine Direct Import from Seoul, South Korea</p>
                  <p>Computer generated tax invoice. No signature required under Rule 46 of CGST Rules.</p>
                </div>
                <div className="text-right">
                  <p className="font-serif font-bold text-blumac-navy">For BLUMAC KOREAN STORE PVT LTD</p>
                  <div className="h-8 flex items-center justify-end font-serif italic text-blumac-copper">
                    Authorised Signatory
                  </div>
                </div>
              </div>
            </div>

            {/* Print action */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="px-4 py-2 border border-blumac-beige rounded-lg text-xs font-bold text-blumac-slate"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print GST Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
