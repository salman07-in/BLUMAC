import React from "react";
import { prisma } from "@/lib/db";
import { OrdersTableClient } from "@/components/admin/OrdersTableClient";
import { ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Order Management | BLUMAC Admin",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true, shipments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
          <ShoppingBag className="w-4 h-4" />
          <span>Fulfillment Operations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
          Orders & Shipment Tracking
        </h1>
        <p className="text-xs text-blumac-slate mt-0.5">
          Process customer orders, update delivery statuses, and assign courier AWB tracking.
        </p>
      </div>

      <OrdersTableClient initialOrders={orders} />
    </div>
  );
}
