import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const addressSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  street: z.string().min(5).optional(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pinCode: z.string().regex(/^\d{6}$/).optional(),
  isDefault: z.boolean().optional(),
});

interface RouteProps { params: Promise<{ id: string }>; }

export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await prisma.address.findFirst({ where: { id, userId: session.id } });
    if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });
    const body = await req.json();
    const data = addressSchema.parse(body);
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: session.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({ where: { id }, data });
    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteProps) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const existing = await prisma.address.findFirst({ where: { id, userId: session.id } });
    if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });
    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
