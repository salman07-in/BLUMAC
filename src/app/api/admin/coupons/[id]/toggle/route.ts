import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to update coupon status" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
