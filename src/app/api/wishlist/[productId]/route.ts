import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteProps { params: Promise<{ productId: string }>; }

// POST: Add to wishlist
export async function POST(_req: Request, { params }: RouteProps) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Login required to save wishlist" }, { status: 401 });
    const { productId } = await params;
    await prisma.wishlist.upsert({
      where: { userId_productId: { userId: session.id, productId } },
      create: { userId: session.id, productId },
      update: {},
    });
    return NextResponse.json({ success: true, action: "added" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove from wishlist
export async function DELETE(_req: Request, { params }: RouteProps) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const { productId } = await params;
    await prisma.wishlist.deleteMany({
      where: { userId: session.id, productId },
    });
    return NextResponse.json({ success: true, action: "removed" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
