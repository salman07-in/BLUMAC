import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(coupons);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
    return NextResponse.json(
      { error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}
