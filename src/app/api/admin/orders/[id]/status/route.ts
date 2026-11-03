import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

interface RouteProps {
  params: Promise<{ id: string }>;
}

const ALLOWED_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
];

export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const {
      status,
      courierName,
      trackingNumber,
      trackingUrl,
      cancellationReason,
      restockItems = true,
      refundAmount,
    } = body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid order status. Allowed: ${ALLOWED_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        shipments: true,
        payments: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Status transition validation
    if (existingOrder.status === "DELIVERED" && status === "PENDING") {
      return NextResponse.json(
        { error: "Delivered orders cannot be moved back to Pending." },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const orderUpdateData: any = { status };

      // Courier and tracking updates
      if (courierName) orderUpdateData.courierName = courierName;
      if (trackingNumber) orderUpdateData.trackingNumber = trackingNumber;

      // Handle delivery & payment settlement for COD
      if (status === "DELIVERED") {
        if (existingOrder.paymentMethod === "COD") {
          orderUpdateData.paymentStatus = "PAID";
        }
      }

      // Handle Cancellation & Restocking
      if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
        orderUpdateData.notes = cancellationReason
          ? `Cancelled: ${cancellationReason}`
          : existingOrder.notes;

        if (restockItems) {
          for (const item of existingOrder.items) {
            if (item.variantId) {
              const inv = await tx.inventory.findUnique({
                where: { variantId: item.variantId },
              });
              if (inv) {
                await tx.inventory.update({
                  where: { id: inv.id },
                  data: {
                    quantityOnHand: inv.quantityOnHand + item.quantity,
                  },
                });

                await tx.inventoryMovement.create({
                  data: {
                    inventoryId: inv.id,
                    type: "RETURN",
                    quantity: item.quantity,
                    reason: `ORDER_CANCELLED_${existingOrder.orderNumber}`,
                  },
                });
              }
            }
          }
        }
      }

      // Handle Refund
      if (status === "REFUNDED") {
        orderUpdateData.paymentStatus = "REFUNDED";
        // Create payment refund record if not already recorded
        const refundAmt = refundAmount || existingOrder.grandTotal;
        await tx.payment.create({
          data: {
            orderId: id,
            gateway: existingOrder.paymentMethod,
            transactionId: `REF-${existingOrder.orderNumber}-${Date.now().toString().slice(-4)}`,
            amount: refundAmt,
            status: "REFUNDED",
            signatureVerified: true,
            gatewayResponse: JSON.stringify({
              refundedAt: new Date().toISOString(),
              reason: cancellationReason || "Admin processed refund",
            }),
          },
        });
      }

      // Update Order
      const ord = await tx.order.update({
        where: { id },
        data: orderUpdateData,
        include: {
          items: true,
          shipments: true,
          payments: true,
        },
      });

      // Handle Shipment record on SHIPPED
      if (status === "SHIPPED") {
        const awb = trackingNumber || `BLU-${ord.orderNumber.slice(-8)}`;
        const courier = courierName || "BlueDart Express";
        const url = trackingUrl || `https://www.bluedart.com/tracking?awb=${awb}`;

        const existingShipment = await tx.shipment.findFirst({
          where: { orderId: id },
        });

        if (existingShipment) {
          await tx.shipment.update({
            where: { id: existingShipment.id },
            data: {
              status: "SHIPPED",
              awbNumber: awb,
              courier,
              trackingUrl: url,
              dispatchedAt: new Date(),
            },
          });
        } else {
          await tx.shipment.create({
            data: {
              orderId: id,
              status: "SHIPPED",
              awbNumber: awb,
              courier,
              trackingUrl: url,
              dispatchedAt: new Date(),
            },
          });
        }
      } else if (status === "DELIVERED") {
        const existingShipment = await tx.shipment.findFirst({
          where: { orderId: id },
        });
        if (existingShipment) {
          await tx.shipment.update({
            where: { id: existingShipment.id },
            data: {
              status: "DELIVERED",
              deliveredAt: new Date(),
            },
          });
        }
      }

      // Record customer notification event log
      await tx.notificationLog.create({
        data: {
          orderId: id,
          channel: "WHATSAPP",
          event: `ORDER_${status}`,
          recipient: existingOrder.customerPhone,
          status: "SENT",
          providerResponse: JSON.stringify({
            status,
            customerName: existingOrder.customerName,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      return ord;
    });

    try {
      await prisma.auditLog.create({
        data: {
          userId: user?.id || "admin",
          action: "ORDER_STATUS_UPDATED",
          resource: `Order:${id}`,
          details: `Order #${existingOrder.orderNumber} status changed from ${existingOrder.status} to ${status}. Courier: ${courierName || "N/A"}.`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order #${existingOrder.orderNumber} updated to ${status}.`,
    });
  } catch (error: any) {
    console.error("Order status update error:", error);
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
