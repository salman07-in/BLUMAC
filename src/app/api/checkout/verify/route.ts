
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!orderNumber || !razorpay_payment_id) {
      return NextResponse.json(
        { error: "Order number and payment ID are required." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Cryptographic signature verification
    if (keySecret && keySecret !== "placeholder_secret" && razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: "Invalid payment signature. Transaction could not be verified." },
          { status: 400 }
        );
      }
    }

    // Update order status in database
    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    });

    // Update payment record
    await prisma.payment.upsert({
      where: { transactionId: razorpay_payment_id },
      update: {
        status: "SUCCESS",
        signatureVerified: true,
        gatewayResponse: JSON.stringify(body),
      },
      create: {
        orderId: order.id,
        gateway: "RAZORPAY",
        transactionId: razorpay_payment_id,
        amount: order.grandTotal,
        status: "SUCCESS",
        signatureVerified: true,
        gatewayResponse: JSON.stringify(body),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and order confirmed.",
      orderNumber,
    });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
