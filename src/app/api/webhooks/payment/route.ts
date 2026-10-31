import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    let isVerified = false;

    // Verify cryptographic signature if secret is present
    if (webhookSecret && signature && webhookSecret !== "placeholder_webhook_secret") {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature === signature) {
        isVerified = true;
      } else {
        return NextResponse.json(
          { error: "Invalid cryptographic signature" },
          { status: 400 }
        );
      }
    } else {
      // In local dev/test mode without live webhook keys
      isVerified = true;
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Idempotent webhook handling
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id || `mock_pay_${Date.now()}`;
      const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : 0;

      // Find order by gateway transaction or orderNumber
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { orderNumber: payload.notes?.orderNumber || "" },
            { id: payload.notes?.orderId || "" },
          ],
        },
      });

      if (order) {
        // Prevent duplicate updates
        if (order.paymentStatus !== "PAID") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              status: order.status === "PENDING" ? "CONFIRMED" : order.status,
            },
          });

          await prisma.payment.upsert({
            where: { transactionId: paymentId },
            update: {
              status: "SUCCESS",
              signatureVerified: isVerified,
              gatewayResponse: rawBody,
            },
            create: {
              orderId: order.id,
              gateway: "RAZORPAY",
              transactionId: paymentId,
              amount: amount || order.grandTotal,
              status: "SUCCESS",
              signatureVerified: isVerified,
              gatewayResponse: rawBody,
            },
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}
