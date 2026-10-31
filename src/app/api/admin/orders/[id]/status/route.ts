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
    const { status } = body;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update status" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
