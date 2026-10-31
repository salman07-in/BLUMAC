import React from "react";
import { prisma } from "@/lib/db";
import { Settings, ShieldCheck, Mail, MessageSquare, CreditCard, Truck } from "lucide-react";

export const metadata = {
  title: "Store Settings & Integrations | BLUMAC Admin",
};

export default async function AdminSettingsPage() {
  const settingsList = await prisma.storeSettings.findMany();
  const settingsMap: Record<string, string> = {};
  settingsList.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
          <Settings className="w-4 h-4" />
          <span>Store Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
          Store Settings & Integration Hub
        </h1>
        <p className="text-xs text-blumac-slate mt-0.5">
          Manage pan-India shipping fees, GST taxation, WhatsApp/Email notification channels, and payment gateway keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Store Identity */}
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2 pb-2 border-b border-blumac-beige">
            <ShieldCheck className="w-4 h-4 text-blumac-copper" />
            General Brand Settings
          </h2>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">Store Name</label>
            <input
              type="text"
              readOnly
              value={settingsMap.store_name || "BLUMAC Korean Store"}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
            />
          </div>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">Physical Store & Hub Address</label>
            <textarea
              readOnly
              rows={2}
              value={settingsMap.store_address || "BLUMAC STORE, Bahadurganj Rd, near Banvari lal jewellers, Sadar Bazar, Shahjahanpur, Uttar Pradesh 242001"}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy text-xs resize-none"
            />
          </div>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">Customer Support Email</label>
            <input
              type="email"
              readOnly
              value={settingsMap.support_email || "care@blumac.in"}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
            />
          </div>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">Support Helplines (India)</label>
            <input
              type="text"
              readOnly
              value={settingsMap.support_phone || "+91 6306955690, +91 9519506235, +91 9559579883"}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono text-[11px]"
            />
          </div>
        </div>

        {/* Shipping & Tax Rules */}
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2 pb-2 border-b border-blumac-beige">
            <Truck className="w-4 h-4 text-blumac-copper" />
            Shipping & Indian GST Configuration
          </h2>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              readOnly
              value={settingsMap.free_shipping_threshold || "999"}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold"
            />
            <p className="text-[10px] text-blumac-slate mt-0.5">
              Orders equal to or above this value receive free courier delivery all over India.
            </p>
          </div>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">
              Standard Shipping Fee (₹)
            </label>
            <input
              type="number"
              readOnly
              value={settingsMap.standard_shipping_charge || "99"}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
            />
          </div>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">
              Applicable GST Tax Rate (%)
            </label>
            <input
              type="number"
              readOnly
              value={settingsMap.gst_rate_percent || "18"}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold"
            />
            <p className="text-[10px] text-blumac-slate mt-0.5">
              18% GST inclusive on skincare cosmetics under Indian HSN 3304.
            </p>
          </div>
        </div>

        {/* Payment Gateways Status */}
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2 pb-2 border-b border-blumac-beige">
            <CreditCard className="w-4 h-4 text-blumac-copper" />
            Payment Gateway Integrations
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige flex items-center justify-between">
              <div>
                <p className="font-bold text-blumac-navy">Razorpay India (UPI / Cards / NetBanking)</p>
                <p className="text-[10px] text-blumac-slate">Webhook verification endpoint: /api/webhooks/payment</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige flex items-center justify-between">
              <div>
                <p className="font-bold text-blumac-navy">Cash on Delivery (COD)</p>
                <p className="text-[10px] text-blumac-slate">19,000+ PIN codes serviceable in India</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">
                ENABLED
              </span>
            </div>
          </div>
        </div>

        {/* Notifications Status */}
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2 pb-2 border-b border-blumac-beige">
            <MessageSquare className="w-4 h-4 text-blumac-copper" />
            Notification Channels
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige flex items-center justify-between">
              <div>
                <p className="font-bold text-blumac-navy">Email Notifications (SMTP / Hostinger)</p>
                <p className="text-[10px] text-blumac-slate">Order confirmation & invoice dispatch</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                CONFIGURED
              </span>
            </div>

            <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige flex items-center justify-between">
              <div>
                <p className="font-bold text-blumac-navy">WhatsApp Business Platform</p>
                <p className="text-[10px] text-blumac-slate">Live AWB courier dispatch & delivery alerts</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                CREDENTIALS PENDING
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
