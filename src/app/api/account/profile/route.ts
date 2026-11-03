import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number").optional().nullable(),
});

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const data = updateSchema.parse(body);
    const user = await prisma.user.update({
      where: { id: session.id },
      data: { ...(data.name && { name: data.name }), phone: data.phone ?? undefined },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Validation error" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
