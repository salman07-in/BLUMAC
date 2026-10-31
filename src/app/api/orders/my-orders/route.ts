import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ orders: [] });
  }

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ userId: user.id }, { customerEmail: user.email }],
    },
    include: {
      items: true,
      shipments: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
