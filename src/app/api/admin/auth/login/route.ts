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

    let user = await prisma.user.findUnique({
      where: { email },
    });

    const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@blumac.in").toLowerCase().trim();
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "BlumacAdmin@2026";

    // Auto-provision initial administrator if database is clean and matching credentials are supplied
    if (!user && email === defaultAdminEmail && data.password === defaultAdminPassword) {
      try {
        const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);
        user = await prisma.user.create({
          data: {
            email: defaultAdminEmail,
            name: "BLUMAC Head Admin",
            passwordHash,
            role: "ADMIN",
            isEmailVerified: true,
          },
        });
      } catch (autoSeedErr) {
        console.warn("Could not auto-provision initial admin:", autoSeedErr);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Access Denied: Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // Role verification: MUST be ADMIN or STAFF
    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      // Log unauthorized attempt
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT",
            resource: "AdminPortal",
            details: `Non-admin user (${user.email}) attempted admin portal login.`,
          },
        });
      } catch {}

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
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "ADMIN_LOGIN_SUCCESS",
          resource: "AdminPortal",
          details: `Administrator ${user.email} authenticated to Executive Control Center.`,
        },
      });
    } catch (auditErr) {
      console.warn("Could not write audit log:", auditErr);
    }

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });
  } catch (error: any) {
    console.error("[Admin Login Error]:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const msg = error?.message || "";
    const code = error?.code || "";

    if (
      msg.includes("You must provide a nonempty URL") ||
      msg.includes("must start with the protocol") ||
      msg.includes("Validation Error Count") ||
      !process.env.DATABASE_URL
    ) {
      return NextResponse.json(
        {
          error:
            "DATABASE_URL is missing or invalid on Hostinger. Please add DATABASE_URL in Hostinger Environment Variables: mysql://username:password@localhost:3306/database_name",
        },
        { status: 500 }
      );
    }

    if (msg.includes("does not exist") || msg.includes("Table") || code === "P2021") {
      return NextResponse.json(
        {
          error:
            "Database tables not found on server. Please run 'npx prisma db push' in Hostinger SSH/Console.",
        },
        { status: 500 }
      );
    }

    if (code === "P1001" || msg.includes("Can't reach database server")) {
      return NextResponse.json(
        {
          error:
            "Cannot connect to MySQL database at localhost:3306. Please check your DB credentials in Hostinger.",
        },
        { status: 500 }
      );
    }

    if (code === "P1000" || msg.includes("Authentication failed")) {
      return NextResponse.json(
        {
          error:
            "Database authentication failed. Please check the DB username & password in DATABASE_URL.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: `Database service error: ${msg.split("\n").filter(Boolean).slice(-1)[0] || "Server error"}`,
      },
      { status: 500 }
    );
  }
}
