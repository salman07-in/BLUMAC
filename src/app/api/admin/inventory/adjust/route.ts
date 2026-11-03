import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    const body = await req.json();

    let targetInventoryId = body.inventoryId;
    const {
      sku,
      quantityDelta,
      exactQuantity,
      lowStockThreshold,
      reason = "MANUAL_ADJUSTMENT",
      notes,
    } = body;

    // Resolve inventory ID by SKU if not provided directly
    if (!targetInventoryId && sku) {
      const variant = await prisma.productVariant.findUnique({
        where: { sku },
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

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.inventory.findUnique({
        where: { id: targetInventoryId },
        include: { variant: { include: { product: true } } },
      });

      if (!current) throw new Error("Inventory record not found");

      let newQty = current.quantityOnHand;
      let delta = 0;

      if (exactQuantity !== undefined && exactQuantity !== null) {
        newQty = Math.max(0, parseInt(exactQuantity.toString()));
        delta = newQty - current.quantityOnHand;
      } else if (quantityDelta !== undefined && quantityDelta !== null) {
        delta = parseInt(quantityDelta.toString());
        newQty = Math.max(0, current.quantityOnHand + delta);
      }

      // Determine movement type
      let movementType = "ADJUSTMENT";
      if (reason.includes("RESTOCK") || reason.includes("PURCHASE")) {
        movementType = "RESTOCK";
      } else if (reason.includes("RETURN")) {
        movementType = "RETURN";
      } else if (reason.includes("DAMAGED") || reason.includes("EXPIRED")) {
        movementType = "DAMAGE";
      }

      // Record movement audit if quantity changed
      if (delta !== 0) {
        await tx.inventoryMovement.create({
          data: {
            inventoryId: targetInventoryId,
            type: movementType,
            quantity: delta,
            reason: `${reason}${notes ? ` - ${notes}` : ""}`,
          },
        });
      }

      // Update inventory record
      const updateData: any = { quantityOnHand: newQty };
      if (lowStockThreshold !== undefined) {
        updateData.lowStockThreshold = Math.max(1, parseInt(lowStockThreshold.toString()));
      }

      const inv = await tx.inventory.update({
        where: { id: targetInventoryId },
        data: updateData,
        include: {
          variant: { include: { product: true } },
          movements: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      // Update inStock boolean on parent product
      if (current.variant?.productId) {
        await tx.product.update({
          where: { id: current.variant.productId },
          data: { inStock: newQty > 0 },
        });
      }

      return inv;
    });

    try {
      await prisma.auditLog.create({
        data: {
          userId: user?.id || "admin",
          action: "INVENTORY_ADJUSTED",
          resource: `Inventory:${targetInventoryId}`,
          details: `SKU ${updated.variant?.sku}: adjusted by ${quantityDelta ?? (exactQuantity ? "exact" : 0)} units. New balance: ${updated.quantityOnHand}. Reason: ${reason}`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      inventory: updated,
      message: `Inventory updated successfully. Current balance: ${updated.quantityOnHand} units.`,
    });
  } catch (error: any) {
    console.error("Inventory adjust error:", error);
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to adjust inventory" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
