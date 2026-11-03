import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    await setSessionCookie(sessionUser);

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Login failed. Please check your credentials." },
      { status: 500 }
    );
  }
}
