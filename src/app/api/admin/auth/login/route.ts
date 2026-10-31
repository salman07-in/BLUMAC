import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

const adminLoginSchema = z.object({
  email: z.string().email("Valid admin email required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = adminLoginSchema.parse(body);

    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Access Denied: Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // Role verification: MUST be ADMIN or STAFF
    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      // Log unauthorized attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT",
          resource: "AdminPortal",
          details: `Non-admin user (${user.email}) attempted admin portal login.`,
        },
      });

      return NextResponse.json(
        { error: "Access Denied: Administrative clearance required." },
        { status: 403 }
      );
    }

    // Verify Password
    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Access Denied: Invalid administrator credentials." },
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

    // Record successful admin audit login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ADMIN_LOGIN_SUCCESS",
        resource: "AdminPortal",
        details: `Administrator ${user.email} authenticated to Executive Control Center.`,
      },
    });

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Admin authentication service error." },
      { status: 500 }
    );
  }
}
