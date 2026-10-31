import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
