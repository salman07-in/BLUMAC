import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(coupons);
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupons" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountCap,
      totalUsageLimit,
    } = body;

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue,
        minOrderValue: minOrderValue || 0,
        maxDiscountCap: maxDiscountCap || null,
        totalUsageLimit: totalUsageLimit || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to create coupon" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
