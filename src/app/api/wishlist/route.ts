import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET: Fetch user's wishlist product IDs
export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ wishlist: [] });

    const items = await prisma.wishlist.findMany({
      where: { userId: session.id },
      select: { productId: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ wishlist: items.map((i) => i.productId) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ wishlist: [], error: message }, { status: 500 });
  }
}
