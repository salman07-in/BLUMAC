import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let targetInventoryId = body.inventoryId;
    const delta = body.quantityDelta ?? body.changeQuantity ?? 0;
    const reason = body.reason || "MANUAL_ADJUSTMENT";

    if (!targetInventoryId && body.sku) {
      const variant = await prisma.productVariant.findUnique({
        where: { sku: body.sku },
        include: { inventory: true },
      });
      targetInventoryId = variant?.inventory?.id;
    }

    if (!targetInventoryId) {
      return NextResponse.json(
        { error: "inventoryId or valid sku required" },
        { status: 400 }
      );
    }

    const inventory = await prisma.$transaction(async (tx) => {
      const current = await tx.inventory.findUnique({
        where: { id: targetInventoryId },
      });

      if (!current) throw new Error("Inventory record not found");

      const newQty = Math.max(0, current.quantityOnHand + delta);

      // Record movement audit
      await tx.inventoryMovement.create({
        data: {
          inventoryId: targetInventoryId,
          type: delta >= 0 ? "RESTOCK" : "ADJUSTMENT",
          quantity: delta,
          reason,
        },
      });

      return await tx.inventory.update({
        where: { id: targetInventoryId },
        data: { quantityOnHand: newQty },
        include: {
          variant: { include: { product: true } },
          movements: true,
        },
      });
    });

    return NextResponse.json({ success: true, inventory });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to adjust inventory" },
      { status: 500 }
    );
  }
}
