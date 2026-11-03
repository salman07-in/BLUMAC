import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    const body = await req.json();
    const { productIds, action, categoryId } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "productIds array cannot be empty" },
        { status: 400 }
      );
    }

    switch (action) {
      case "ARCHIVE": {
        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: "ARCHIVED", inStock: false },
        });

        try {
          await prisma.auditLog.create({
            data: {
              userId: user?.id || "admin",
              action: "BULK_PRODUCTS_ARCHIVED",
              resource: "Product",
              details: `Archived ${result.count} products (${productIds.join(", ")})`,
            },
          });
        } catch {}

        return NextResponse.json({
          success: true,
          count: result.count,
          message: `Successfully archived ${result.count} product(s).`,
        });
      }

      case "ACTIVATE": {
        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: "ACTIVE", inStock: true },
        });

        try {
          await prisma.auditLog.create({
            data: {
              userId: user?.id || "admin",
              action: "BULK_PRODUCTS_ACTIVATED",
              resource: "Product",
              details: `Activated ${result.count} products (${productIds.join(", ")})`,
            },
          });
        } catch {}

        return NextResponse.json({
          success: true,
          count: result.count,
          message: `Successfully activated ${result.count} product(s).`,
        });
      }

      case "UPDATE_CATEGORY": {
        if (!categoryId) {
          return NextResponse.json(
            { error: "categoryId is required for category update" },
            { status: 400 }
          );
        }

        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId },
        });

        return NextResponse.json({
          success: true,
          count: result.count,
          message: `Updated category for ${result.count} product(s).`,
        });
      }

      case "DELETE": {
        let archivedCount = 0;
        let deletedCount = 0;

        for (const id of productIds) {
          const orderItemsCount = await prisma.orderItem.count({
            where: { productId: id },
          });

          if (orderItemsCount > 0) {
            // Safe archive
            await prisma.product.update({
              where: { id },
              data: { status: "ARCHIVED", inStock: false },
            });
            archivedCount++;
          } else {
            // Permanent delete
            await prisma.$transaction(async (tx) => {
              await tx.wishlist.deleteMany({ where: { productId: id } });
              await tx.review.deleteMany({ where: { productId: id } });
              const variants = await tx.productVariant.findMany({ where: { productId: id } });
              for (const v of variants) {
                const inv = await tx.inventory.findUnique({ where: { variantId: v.id } });
                if (inv) {
                  await tx.inventoryMovement.deleteMany({ where: { inventoryId: inv.id } });
                  await tx.inventory.delete({ where: { id: inv.id } });
                }
              }
              await tx.productVariant.deleteMany({ where: { productId: id } });
              await tx.product.delete({ where: { id } });
            });
            deletedCount++;
          }
        }

        try {
          await prisma.auditLog.create({
            data: {
              userId: user?.id || "admin",
              action: "BULK_PRODUCTS_DELETED",
              resource: "Product",
              details: `Bulk deleted: ${deletedCount} permanently removed, ${archivedCount} archived due to historical orders.`,
            },
          });
        } catch {}

        return NextResponse.json({
          success: true,
          deletedCount,
          archivedCount,
          message: `Processed ${productIds.length} products: ${deletedCount} permanently removed, ${archivedCount} safely archived due to historical order links.`,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Bulk action error:", error);
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to execute bulk action" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
