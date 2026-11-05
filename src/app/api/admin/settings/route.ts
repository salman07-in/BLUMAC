import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/settings
 * Fetch all store settings as a key-value dictionary.
 */
export async function GET() {
  try {
    await requireAdmin();

    const settingsList = await prisma.storeSettings.findMany();
    const settingsMap: Record<string, string> = {
      enable_razorpay: "true",
      enable_cod: "true",
      store_name: "BLUMAC Korean Store",
      support_email: "care@blumac.in",
      support_phone: "+91 6306955690, +91 9519506235, +91 9559579883",
      store_address:
        "BLUMAC STORE, Bahadurganj Rd, near Banvari lal jewellers, Sadar Bazar, Shahjahanpur, Uttar Pradesh 242001",
      free_shipping_threshold: "999",
      standard_shipping_charge: "99",
      gst_rate_percent: "18",
    };

    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json(settingsMap);
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Update one or more store settings keys in database.
 */
export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updatedKeys: string[] = [];

    // Save each submitted key
    for (const [key, value] of Object.entries(body)) {
      if (typeof key !== "string" || !key.trim()) continue;

      const stringValue = typeof value === "boolean" ? (value ? "true" : "false") : String(value ?? "");

      await prisma.storeSettings.upsert({
        where: { key: key.trim() },
        update: { value: stringValue },
        create: { key: key.trim(), value: stringValue },
      });

      updatedKeys.push(key.trim());
    }

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "UPDATE_STORE_SETTINGS",
          resource: "StoreSettings",
          details: `Updated settings keys: ${updatedKeys.join(", ")}`,
        },
      });
    } catch {
      // Audit log optional if table not ready
    }

    // Return fresh settings
    const freshList = await prisma.storeSettings.findMany();
    const settingsMap: Record<string, string> = {};
    freshList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      message: "Store settings saved successfully.",
      updatedKeys,
      settings: settingsMap,
    });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
