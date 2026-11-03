import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile"),
  street: z.string().min(5),
  landmark: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pinCode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit PIN code"),
  isDefault: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const addresses = await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ addresses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const data = addressSchema.parse(body);
    // If setting as default, unset others first
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: session.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({ data: { ...data, userId: session.id } });
    return NextResponse.json({ success: true, address }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
