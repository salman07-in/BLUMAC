import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "ADMIN_LOGOUT",
          resource: "AdminPortal",
          details: `Administrator ${user.email} signed out from control center.`,
        },
      });
    }

    await clearSessionCookie();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
