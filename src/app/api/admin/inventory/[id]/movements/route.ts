import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: {
        variant: { include: { product: true } },
        movements: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!inventory) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      inventory,
      movements: inventory.movements,
    });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to fetch inventory movements" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

