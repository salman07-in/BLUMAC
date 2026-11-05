import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/store/settings
 * Public endpoint for storefront/checkout to read live payment gateway toggles & shipping rules.
 */
export async function GET() {
  try {
    const settingsList = await prisma.storeSettings.findMany({
      where: {
        key: {
          in: [
            "enable_razorpay",
            "enable_cod",
            "free_shipping_threshold",
            "standard_shipping_charge",
            "gst_rate_percent",
            "store_name",
            "support_phone",
            "support_email",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const enableRazorpay = settingsMap.enable_razorpay !== "false";
    const enableCod = settingsMap.enable_cod !== "false";
    const freeShippingThreshold = parseFloat(settingsMap.free_shipping_threshold || "999") || 999;
    const standardShippingCharge = parseFloat(settingsMap.standard_shipping_charge || "99") || 99;
    const gstRatePercent = parseFloat(settingsMap.gst_rate_percent || "18") || 18;

    return NextResponse.json(
      {
        enableRazorpay,
        enableCod,
        freeShippingThreshold,
        standardShippingCharge,
        gstRatePercent,
        storeName: settingsMap.store_name || "BLUMAC Korean Store",
        supportPhone: settingsMap.support_phone || "+91 6306955690",
        supportEmail: settingsMap.support_email || "care@blumac.in",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to read public store settings:", error);
    // Safe fallbacks
    return NextResponse.json(
      {
        enableRazorpay: true,
        enableCod: true,
        freeShippingThreshold: 999,
        standardShippingCharge: 99,
        gstRatePercent: 18,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
