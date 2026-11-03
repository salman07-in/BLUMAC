"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Eye,
  Printer,
  FileText,
  MessageCircle,
  X,
  Truck,
  Copy,
  Clock,
  Package,
  Download,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Ban,
} from "lucide-react";

interface OrdersTableClientProps {
  initialOrders: any[];
}

const COURIER_PARTNERS = [
  { name: "BlueDart Express Air", defaultPrefix: "BLU" },
  { name: "Delhivery Express", defaultPrefix: "DEL" },
  { name: "DTDC Priority", defaultPrefix: "DTDC" },
  { name: "Xpressbees", defaultPrefix: "XPR" },
  { name: "India Post Speed Post", defaultPrefix: "EM" },
  { name: "Blumac Express Direct", defaultPrefix: "BLM" },
];

export function OrdersTableClient({ initialOrders }: OrdersTableClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<any | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [previewOrder, setPreviewOrder] = useState<any | null>(null);
  const [shippingOrder, setShippingOrder] = useState<any | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [refundingOrder, setRefundingOrder] = useState<any | null>(null);

  // Ship Modal State
  const [assignedCourier, setAssignedCourier] = useState(COURIER_PARTNERS[0].name);
  const [awbInput, setAwbInput] = useState("");
  const [trackingUrlInput, setTrackingUrlInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedAWB, setCopiedAWB] = useState(false);

  // Cancel Modal State
  const [cancelReason, setCancelReason] = useState("CUSTOMER_REQUEST");
  const [cancelRestock, setCancelRestock] = useState(true);

  // Refund Modal State
  const [refundAmount, setRefundAmount] = useState("");

  const counts = useMemo(() => {
    return {
      ALL: orders.length,
      CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
      PROCESSING: orders.filter((o) => o.status === "PROCESSING").length,
      SHIPPED: orders.filter((o) => o.status === "SHIPPED").length,
      DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
      CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
      REFUNDED: orders.filter((o) => o.status === "REFUNDED").length,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (paymentFilter !== "ALL" && o.paymentMethod !== paymentFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNum = o.orderNumber.toLowerCase().includes(q);
        const matchName = o.customerName.toLowerCase().includes(q);
        const matchEmail = o.customerEmail?.toLowerCase().includes(q);
        const matchPhone = o.customerPhone?.toLowerCase().includes(q);
        const matchAwb = o.trackingNumber?.toLowerCase().includes(q);
        return matchNum || matchName || matchEmail || matchPhone || matchAwb;
      }
      return true;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // --- ACTIONS ---

  // 1. Update Status with Backend Validation
  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    extraPayload: Record<string, any> = {}
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extraPayload }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
        return true;
      } else {
        alert(data.error || "Failed to update order status");
        return false;
      }
    } catch {
      alert("Network error updating order status");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Open Ship Order Modal
  const openShipModal = (order: any) => {
    setShippingOrder(order);
    const courier = order.courierName || COURIER_PARTNERS[0].name;
    const awb = order.trackingNumber || `BLU-${order.orderNumber.slice(-8)}`;
    setAssignedCourier(courier);
    setAwbInput(awb);
    setTrackingUrlInput(
      order.shipments?.[0]?.trackingUrl || `https://www.bluedart.com/tracking?awb=${awb}`
    );
  };

  // Submit Shipment
  const handleConfirmShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrder) return;

    const ok = await updateOrderStatus(shippingOrder.id, "SHIPPED", {
      courierName: assignedCourier,
      trackingNumber: awbInput.trim(),
      trackingUrl: trackingUrlInput.trim(),
    });

    if (ok) setShippingOrder(null);
  };

  // 3. Open Cancel Order Modal
  const openCancelModal = (order: any) => {
    setCancellingOrder(order);
    setCancelReason("CUSTOMER_REQUEST");
    setCancelRestock(true);
  };

  // Submit Cancellation
  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    const ok = await updateOrderStatus(cancellingOrder.id, "CANCELLED", {
      cancellationReason: cancelReason,
      restockItems: cancelRestock,
    });

    if (ok) setCancellingOrder(null);
  };

  // 4. Open Refund Modal
  const openRefundModal = (order: any) => {
    setRefundingOrder(order);
    setRefundAmount(order.grandTotal.toString());
  };

  // Submit Refund
  const handleConfirmRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingOrder) return;

    const ok = await updateOrderStatus(refundingOrder.id, "REFUNDED", {
      refundAmount: parseFloat(refundAmount) || refundingOrder.grandTotal,
      cancellationReason: "Admin processed refund to customer",
    });

    if (ok) setRefundingOrder(null);
  };

  // 5. Send WhatsApp Update (Status Specific)
  const sendWhatsAppUpdate = (order: any) => {
    const rawPhone = (order.customerPhone || "").replace(/\D/g, "");
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const awb = order.trackingNumber || `BLU-${order.orderNumber.slice(-8)}`;
    const courier = order.courierName || "BlueDart Express Air";

    let statusMsg = "";
    if (order.status === "SHIPPED") {
      statusMsg = `🚚 *Great News! Your Order Has Shipped!*\n\nCourier: ${courier}\nTracking AWB: ${awb}\nTrack Package: https://blumac.in/account/orders`;
    } else if (order.status === "DELIVERED") {
      statusMsg = `🌸 *Your BLUMAC Package Has Been Delivered!*\n\nWe hope you love your authentic Korean glass skin routine! If you have any questions, our Seoul-trained beauty advisors are here to help.`;
    } else if (order.status === "CANCELLED") {
      statusMsg = `Your Order #${order.orderNumber} has been cancelled. Any pre-paid payments will be refunded to your original payment source within 3-5 business days.`;
    } else {
      statusMsg = `Your order status is currently: *${order.status}*. We are preparing your fresh Seoul batch with certified temperature control.`;
    }

    const msg = encodeURIComponent(
      `✨ Annyeonghaseyo ${order.customerName}! 🌸\n\nUpdate on your BLUMAC Korean Store Order *#${order.orderNumber}*:\n\n${statusMsg}\n\nTotal: ₹${order.grandTotal.toLocaleString(
        "en-IN"
      )}\nPayment: ${order.paymentMethod} (${order.paymentStatus})\n\nNeed assistance? Reply directly to this WhatsApp number.\n\nblumac.in • 100% Genuine Seoul Imports`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const exportOrdersCSV = () => {
    const headers =
      "Order Number,Date,Customer Name,Phone,Email,Status,Payment Method,Payment Status,Items,Total,Courier,AWB\n";
    const rows = filtered
      .map((o) => {
        return `"${o.orderNumber}","${new Date(o.createdAt).toISOString().slice(0, 10)}","${(
          o.customerName || ""
        ).replace(/"/g, '""')}","${o.customerPhone || ""}","${o.customerEmail || ""}","${
          o.status
        }","${o.paymentMethod}","${o.paymentStatus}",${o.items?.length || 1},${o.grandTotal},"${
          o.courierName || ""
        }","${o.trackingNumber || ""}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blumac-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Status Badges Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-blumac-beige font-bold">
        {[
          { id: "ALL", label: "All Orders", count: counts.ALL },
          { id: "CONFIRMED", label: "Confirmed", count: counts.CONFIRMED },
          { id: "PROCESSING", label: "Processing", count: counts.PROCESSING },
          { id: "SHIPPED", label: "In Transit / Shipped", count: counts.SHIPPED },
          { id: "DELIVERED", label: "Delivered", count: counts.DELIVERED },
          { id: "CANCELLED", label: "Cancelled", count: counts.CANCELLED },
          { id: "REFUNDED", label: "Refunded", count: counts.REFUNDED },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-blumac-navy text-white shadow-sm"
                  : "bg-white text-blumac-slate hover:bg-blumac-ivory border border-blumac-beige"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
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

      {/* Search, Payment Filter & Export Bar */}
      <div className="bg-white p-4 rounded-xl border border-blumac-beige shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search Order #, Customer, Phone, AWB..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg py-2 pl-9 pr-4 text-blumac-navy focus:outline-none focus:border-blumac-copper"
            />
            <Search className="w-4 h-4 text-blumac-slate absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1.5 text-blumac-slate">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-blumac-ivory border border-blumac-beige rounded-lg py-1.5 px-2 text-blumac-navy font-semibold cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1.5 text-blumac-slate">
            <span>Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-blumac-ivory border border-blumac-beige rounded-lg py-1.5 px-2.5 text-blumac-navy font-semibold cursor-pointer"
            >
              <option value="ALL">All Methods</option>
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="RAZORPAY">Prepaid (Razorpay)</option>
              <option value="CASHFREE">Prepaid (Cashfree)</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={exportOrdersCSV}
            className="px-3.5 py-2 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blumac-copper" />
            <span>Export Orders CSV</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0B182D] text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">Order # & Date</th>
                <th className="py-3.5 px-4 font-bold">Customer & Shipping City</th>
                <th className="py-3.5 px-4 font-bold">Items</th>
                <th className="py-3.5 px-4 font-bold">Grand Total</th>
                <th className="py-3.5 px-4 font-bold">Payment</th>
                <th className="py-3.5 px-4 font-bold">Fulfillment Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blumac-beige">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-blumac-slate">
                    <Package className="w-8 h-8 text-blumac-copper/40 mx-auto mb-2" />
                    <p className="font-semibold">No orders match filter criteria.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((order) => {
                  let addr: any = {};
                  try {
                    addr = JSON.parse(order.shippingAddress || "{}");
                  } catch {
                    addr = {};
                  }

                  const isPaid = order.paymentStatus === "PAID";

                  return (
                    <tr key={order.id} className="hover:bg-blumac-ivory/40 transition-colors">
                      {/* Order Number & Date */}
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

                      {/* Customer & City */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-blumac-navy">{order.customerName}</p>
                        <p className="text-[11px] text-blumac-slate">
                          {addr.city || "Delhi"}, {addr.state || "Delhi"} • PIN {addr.pinCode || "110001"}
                        </p>
                        {order.customerPhone && (
                          <p className="text-[10px] text-blumac-slate font-mono">
                            📞 {order.customerPhone}
                          </p>
                        )}
                      </td>

                      {/* Items Count */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blumac-ivory font-semibold text-blumac-navy">
                          <Package className="w-3 h-3 text-blumac-copper" />
                          {order.items?.length || 1} item(s)
                        </span>
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-blumac-navy text-sm block">
                          {formatCurrency(order.grandTotal)}
                        </span>
                        <span className="text-[10px] text-blumac-slate">GST 18% incl.</span>
                      </td>

                      {/* Payment */}
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
                        <span
                          className={`text-[10px] font-bold block mt-0.5 ${
                            isPaid ? "text-green-700" : "text-amber-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          disabled={actionLoading}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (newStatus === "SHIPPED") {
                              openShipModal(order);
                            } else if (newStatus === "CANCELLED") {
                              openCancelModal(order);
                            } else if (newStatus === "REFUNDED") {
                              openRefundModal(order);
                            } else {
                              updateOrderStatus(order.id, newStatus);
                            }
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border cursor-pointer ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : order.status === "SHIPPED"
                              ? "bg-sky-50 text-sky-800 border-sky-300"
                              : order.status === "CANCELLED"
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : order.status === "REFUNDED"
                              ? "bg-purple-50 text-purple-800 border-purple-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="REFUNDED">REFUNDED</option>
                        </select>
                        {order.trackingNumber && (
                          <span className="font-mono text-[9px] text-blumac-slate block mt-0.5 truncate max-w-[120px]">
                            AWB: {order.trackingNumber}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
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

                          {/* Print 4x6 Thermal Label */}
                          <button
                            title="Print Thermal Shipping Label (4x6)"
                            onClick={() => setSelectedLabelOrder(order)}
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Print GST Invoice */}
                          <button
                            title="Print GST Tax Invoice"
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

        {/* Pagination */}
        <div className="p-3.5 bg-blumac-ivory/50 border-t border-blumac-beige flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-blumac-slate">
            Showing <strong className="text-blumac-navy">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-blumac-navy">
              {Math.min(currentPage * pageSize, filtered.length)}
            </strong>{" "}
            of <strong className="text-blumac-navy">{filtered.length}</strong> orders
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-blumac-beige rounded-lg bg-white text-blumac-navy hover:bg-blumac-beige disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-blumac-navy bg-white border border-blumac-beige rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-blumac-beige rounded-lg bg-white text-blumac-navy hover:bg-blumac-beige disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🚚 MODAL: SHIP ORDER & ASSIGN COURIER AWB */}
      {/* ========================================================= */}
      {shippingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-blumac-beige">
            <div className="flex items-center justify-between pb-2 border-b border-blumac-beige">
              <div>
                <h3 className="font-bold font-serif text-blumac-navy text-base">
                  Fulfill & Dispatch Shipment
                </h3>
                <p className="text-[11px] text-blumac-slate">
                  Order #{shippingOrder.orderNumber} • {shippingOrder.customerName}
                </p>
              </div>
              <button onClick={() => setShippingOrder(null)} className="p-1 text-blumac-slate">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmShipment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Assigned Courier Partner *
                </label>
                <select
                  value={assignedCourier}
                  onChange={(e) => {
                    const c = e.target.value;
                    setAssignedCourier(c);
                    const partner = COURIER_PARTNERS.find((p) => p.name === c);
                    const pfx = partner?.defaultPrefix || "BLU";
                    setAwbInput(`${pfx}-${shippingOrder.orderNumber.slice(-8)}`);
                  }}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold cursor-pointer"
                >
                  {COURIER_PARTNERS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Air Waybill (AWB) Tracking Number *
                </label>
                <input
                  type="text"
                  required
                  value={awbInput}
                  onChange={(e) => setAwbInput(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Tracking Web URL
                </label>
                <input
                  type="url"
                  value={trackingUrlInput}
                  onChange={(e) => setTrackingUrlInput(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 border-t border-blumac-beige flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShippingOrder(null)}
                  className="px-4 py-2 border border-blumac-beige rounded-lg font-bold text-blumac-slate"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Dispatch & Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🛑 MODAL: CANCEL ORDER & RESTOCK */}
      {/* ========================================================= */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-blumac-beige">
            <div className="flex items-center justify-between pb-2 border-b border-blumac-beige">
              <div>
                <h3 className="font-bold font-serif text-blumac-navy text-base">
                  Cancel Order #{cancellingOrder.orderNumber}
                </h3>
                <p className="text-[11px] text-blumac-slate">
                  Customer: {cancellingOrder.customerName}
                </p>
              </div>
              <button onClick={() => setCancellingOrder(null)} className="p-1 text-blumac-slate">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Cancellation Reason *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold cursor-pointer"
                >
                  <option value="CUSTOMER_REQUEST">Customer requested cancellation</option>
                  <option value="OUT_OF_STOCK">Inventory unavailable</option>
                  <option value="INCORRECT_ADDRESS">Undeliverable / invalid address</option>
                  <option value="SUSPECTED_FRAUD">Suspicious / fraud check failed</option>
                  <option value="DUPLICATE_ORDER">Duplicate order</option>
                </select>
              </div>

              <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cancelRestock}
                    onChange={(e) => setCancelRestock(e.target.checked)}
                    className="w-4 h-4 text-blumac-copper rounded"
                  />
                  <span className="font-bold text-blumac-navy text-[11px]">
                    Restock items back into warehouse inventory ({cancellingOrder.items?.length || 1} items)
                  </span>
                </label>
              </div>

              <div className="pt-2 border-t border-blumac-beige flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-4 py-2 border border-blumac-beige rounded-lg font-bold text-blumac-slate"
                >
                  Keep Order Active
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 💰 MODAL: PROCESS REFUND */}
      {/* ========================================================= */}
      {refundingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-blumac-beige">
            <div className="flex items-center justify-between pb-2 border-b border-blumac-beige">
              <div>
                <h3 className="font-bold font-serif text-blumac-navy text-base">
                  Process Order Refund
                </h3>
                <p className="text-[11px] text-blumac-slate">
                  Order #{refundingOrder.orderNumber} • Total Paid: {formatCurrency(refundingOrder.grandTotal)}
                </p>
              </div>
              <button onClick={() => setRefundingOrder(null)} className="p-1 text-blumac-slate">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRefund} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Refund Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold font-mono text-sm"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px]">
                <p className="font-bold">Refund Ledger Commitment:</p>
                <p>
                  A verified refund transaction record will be created under Payment records and customer will be notified via WhatsApp.
                </p>
              </div>

              <div className="pt-2 border-t border-blumac-beige flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRefundingOrder(null)}
                  className="px-4 py-2 border border-blumac-beige rounded-lg font-bold text-blumac-slate"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Execute Refund</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🖨️ MODAL: THERMAL SHIPPING LABEL (4x6) */}
      {/* ========================================================= */}
      {selectedLabelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blumac-beige space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-blumac-beige">
              <div>
                <h3 className="font-bold font-serif text-blumac-navy text-sm">
                  4×6 Thermal Air Waybill (AWB)
                </h3>
                <p className="text-[11px] text-blumac-slate">
                  {selectedLabelOrder.courierName || "BlueDart Express Air Priority"}
                </p>
              </div>
              <button
                onClick={() => setSelectedLabelOrder(null)}
                className="p-1 rounded-full hover:bg-blumac-ivory"
              >
                <X className="w-4 h-4 text-blumac-slate" />
              </button>
            </div>

            {/* Thermal Label Body */}
            <div
              id="thermal-label"
              className="border-2 border-black p-4 font-mono text-[11px] space-y-3 bg-white text-black"
            >
              <div className="flex justify-between items-start border-b border-black pb-2">
                <div>
                  <h4 className="font-extrabold text-sm uppercase">BLUMAC KOREAN STORE</h4>
                  <p className="text-[9px]">100% Authentic Korean Beauty Store</p>
                  <p className="text-[9px]">Bahadurganj Rd, Sadar Bazar, Shahjahanpur, UP 242001</p>
                  <p className="text-[9px] font-bold">Helpline: +91 6306955690 / 9519506235</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-black text-white font-extrabold text-[10px]">
                    AIR PRIORITY
                  </span>
                  <p className="text-[9px] mt-1 font-bold">CARRIER: {selectedLabelOrder.courierName || "BLUEDART"}</p>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center py-2 bg-gray-50 border border-dashed border-black">
                <div className="inline-block tracking-widest font-extrabold text-lg">
                  ||||| | |||| |||| ||| ||||| ||| ||||
                </div>
                <p className="font-bold text-[11px] mt-1">
                  AWB: {selectedLabelOrder.trackingNumber || `BLU-${selectedLabelOrder.orderNumber.slice(-8)}`}
                </p>
              </div>

              {/* Destination */}
              <div className="border border-black p-2 bg-gray-50">
                <p className="font-extrabold text-[10px] text-gray-500 uppercase">
                  DELIVERY DESTINATION:
                </p>
                <p className="font-bold text-xs">{selectedLabelOrder.customerName}</p>
                {(() => {
                  let addr: any = {};
                  try {
                    addr = JSON.parse(selectedLabelOrder.shippingAddress || "{}");
                  } catch {
                    addr = {};
                  }
                  return (
                    <div className="text-[10px] mt-1 leading-tight">
                      <p>{addr.street || addr.addressLine1}</p>
                      {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                      <p className="font-bold">
                        {addr.city}, {addr.state} - PIN: {addr.pinCode}
                      </p>
                      <p className="mt-1 font-bold">📞 {selectedLabelOrder.customerPhone || "N/A"}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Payment Type */}
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

              <div className="text-[9px] text-gray-600">
                <p>
                  <strong>Contents:</strong> Authentic Korean Skincare Products (Fragile Glass/Toner)
                </p>
                <p>
                  <strong>Total Units:</strong> {selectedLabelOrder.items?.length || 1} | Weight: 0.45 KG
                </p>
              </div>
            </div>

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
                  const awb =
                    selectedLabelOrder.trackingNumber ||
                    `BLU-${selectedLabelOrder.orderNumber.slice(-8)}`;
                  navigator.clipboard.writeText(awb);
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

      {/* ========================================================= */}
      {/* 📄 MODAL: GST TAX INVOICE */}
      {/* ========================================================= */}
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
              <div className="flex justify-between items-start border-b border-blumac-beige pb-4">
                <div>
                  <h4 className="font-serif font-black text-base text-blumac-navy">
                    BLUMAC KOREAN STORE PRIVATE LIMITED
                  </h4>
                  <p className="text-[11px] text-blumac-slate mt-0.5">
                    GSTIN: <strong>09AAACB2109P1Z8</strong> | PAN: AAACB2109P
                  </p>
                  <p className="text-[11px] text-blumac-slate">
                    Bahadurganj Rd, near Banvari lal jewellers, Sadar Bazar, Shahjahanpur, UP 242001
                  </p>
                  <p className="text-[11px] text-blumac-slate">
                    Helplines: +91 6306955690, +91 9519506235 | Email: care@blumac.in
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

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 border-b border-blumac-beige pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-blumac-slate">Billed To (Customer):</p>
                  <p className="font-bold text-sm text-blumac-navy">{selectedInvoiceOrder.customerName}</p>
                  <p className="text-[11px] text-blumac-slate">📞 {selectedInvoiceOrder.customerPhone || "N/A"}</p>
                  <p className="text-[11px] text-blumac-slate">✉️ {selectedInvoiceOrder.customerEmail || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-blumac-slate">Shipping Destination:</p>
                  {(() => {
                    let addr: any = {};
                    try {
                      addr = JSON.parse(selectedInvoiceOrder.shippingAddress || "{}");
                    } catch {
                      addr = {};
                    }
                    return (
                      <p className="text-[11px] text-blumac-slate">
                        {addr.street || addr.addressLine1}, {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                    );
                  })()}
                  <p className="text-[11px] text-blumac-slate mt-1">Place of Supply: State Code (09)</p>
                </div>
              </div>

              {/* Items Table */}
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
                  {(selectedInvoiceOrder.items || []).map((item: any, idx: number) => {
                    const total = item.unitPrice * (item.quantity || 1);
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

              {/* Totals */}
              <div className="pt-3 border-t border-blumac-beige flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-blumac-slate">
                    <span>Taxable Value:</span>
                    <span className="font-mono">
                      ₹{(selectedInvoiceOrder.grandTotal / 1.18).toFixed(2)}
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
            </div>

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
