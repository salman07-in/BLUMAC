import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(_req: Request) {
  try {
    await requireAdmin();

    const orders = await prisma.order.findMany({
      include: {
        items: true,
        shipments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Shipping Address",
      "Items Count",
      "Subtotal",
      "Discount",
      "Shipping Fee",
      "Tax Total",
      "Grand Total",
      "Order Status",
      "Payment Method",
      "Payment Status",
      "Courier",
      "AWB Number",
    ].join(",");

    const rows = orders.map((o) => {
      let addrStr = "";
      try {
        const a = JSON.parse(o.shippingAddress);
        addrStr = `${a.street || a.addressLine1 || ""}, ${a.city || ""}, ${a.state || ""} ${a.pinCode || ""}`.replace(/"/g, '""');
      } catch {
        addrStr = (o.shippingAddress || "").replace(/"/g, '""');
      }

      const shipment = o.shipments[0];
      const courier = o.courierName || shipment?.courier || "N/A";
      const awb = o.trackingNumber || shipment?.awbNumber || "N/A";

      return [
        `"${o.orderNumber}"`,
        `"${o.createdAt.toISOString().slice(0, 10)}"`,
        `"${(o.customerName || "").replace(/"/g, '""')}"`,
        `"${o.customerEmail || ""}"`,
        `"${o.customerPhone || ""}"`,
        `"${addrStr}"`,
        o.items.length,
        o.subtotal,
        o.discountTotal,
        o.shippingFee,
        o.taxTotal,
        o.grandTotal,
        `"${o.status}"`,
        `"${o.paymentMethod}"`,
        `"${o.paymentStatus}"`,
        `"${courier}"`,
        `"${awb}"`,
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="blumac-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to export orders" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
