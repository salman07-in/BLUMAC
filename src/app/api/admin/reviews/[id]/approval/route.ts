import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isApproved } = body;

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update review status" },
      { status: 500 }
    );
  }
}
