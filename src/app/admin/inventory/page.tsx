import React from "react";
import { prisma } from "@/lib/db";
import { InventoryManagerClient } from "@/components/admin/InventoryManagerClient";
import { Warehouse } from "lucide-react";

export const metadata = {
  title: "Inventory & Stock Audit | BLUMAC Admin",
};

export default async function AdminInventoryPage() {
  const inventories = await prisma.inventory.findMany({
    include: {
      variant: {
        include: { product: true },
      },
      movements: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
          <Warehouse className="w-4 h-4" />
          <span>Warehouse Operations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
          Inventory Control & Stock Audit
        </h1>
        <p className="text-xs text-blumac-slate mt-0.5">
          Real-time physical stock levels, reservation buffer locks, and automated low-threshold warnings.
        </p>
      </div>

      <InventoryManagerClient initialInventories={inventories} />
    </div>
  );
}
