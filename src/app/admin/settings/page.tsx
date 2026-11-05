import React from "react";
import { prisma } from "@/lib/db";
import { SettingsManagerClient } from "@/components/admin/SettingsManagerClient";

export const metadata = {
  title: "Store Settings & Integrations | BLUMAC Admin",
};

export default async function AdminSettingsPage() {
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

  return <SettingsManagerClient initialSettings={settingsMap} />;
}
