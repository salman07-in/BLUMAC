import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { field, value } = await req.json();

    if (field !== "isBestSeller" && field !== "isTrending" && field !== "isNewArrival") {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        [field]: Boolean(value),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to update badge" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
