import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID required"),
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(10, "Review must be at least 10 characters").max(2000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = reviewSchema.parse(body);

    // Get current user if logged in (optional – guests can review too)
    const session = await getCurrentUser().catch(() => null);

    // Check if verified purchase (only if logged in)
    let isVerifiedPurchase = false;
    if (session) {
      const orderWithProduct = await prisma.orderItem.findFirst({
        where: {
          productId: data.productId,
          order: { userId: session.id, status: { in: ["DELIVERED", "PROCESSING", "SHIPPED"] } },
        },
      });
      isVerifiedPurchase = !!orderWithProduct;
    }

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: data.productId }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: session?.id ?? null,
        customerName: data.customerName,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        isVerifiedPurchase,
        isApproved: false, // Admin must approve
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review has been submitted and is pending admin approval.",
      review: { id: review.id },
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("[Review Submit Error]:", error);
    return NextResponse.json({ error: "Failed to submit review. Please try again." }, { status: 500 });
  }
}
