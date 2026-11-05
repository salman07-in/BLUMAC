"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  CreditCard,
  Truck,
  MessageSquare,
  Check,
  RefreshCw,
  AlertTriangle,
  Lock,
  Power,
  Info,
} from "lucide-react";

interface SettingsManagerClientProps {
  initialSettings: Record<string, string>;
}

export function SettingsManagerClient({ initialSettings }: SettingsManagerClientProps) {
  // Form State
  const [storeName, setStoreName] = useState(initialSettings.store_name || "BLUMAC Korean Store");
  const [storeAddress, setStoreAddress] = useState(
    initialSettings.store_address ||
      "BLUMAC STORE, Bahadurganj Rd, near Banvari lal jewellers, Sadar Bazar, Shahjahanpur, Uttar Pradesh 242001"
  );
  const [supportEmail, setSupportEmail] = useState(initialSettings.support_email || "care@blumac.in");
  const [supportPhone, setSupportPhone] = useState(
    initialSettings.support_phone || "+91 6306955690, +91 9519506235, +91 9559579883"
  );

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    initialSettings.free_shipping_threshold || "999"
  );
  const [standardShippingCharge, setStandardShippingCharge] = useState(
    initialSettings.standard_shipping_charge || "99"
  );
  const [gstRatePercent, setGstRatePercent] = useState(initialSettings.gst_rate_percent || "18");

  // Payment Gateways Toggles
  const [enableRazorpay, setEnableRazorpay] = useState(initialSettings.enable_razorpay !== "false");
  const [enableCod, setEnableCod] = useState(initialSettings.enable_cod !== "false");

  // UI States
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [togglingGateway, setTogglingGateway] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Instant Toggle for Payment Gateways
  const handleToggleGateway = async (gateway: "razorpay" | "cod") => {
    const isRazorpay = gateway === "razorpay";
    const currentVal = isRazorpay ? enableRazorpay : enableCod;
    const nextVal = !currentVal;

    // Check if turning both off
    const otherVal = isRazorpay ? enableCod : enableRazorpay;
    if (!nextVal && !otherVal) {
      const confirmDeactivate = window.confirm(
        "⚠️ Warning: Turning OFF both Razorpay and Cash on Delivery will disable online checkout for all store customers. Are you sure you want to proceed?"
      );
      if (!confirmDeactivate) return;
    }

    setTogglingGateway(gateway);
    // Optimistic UI update
    if (isRazorpay) setEnableRazorpay(nextVal);
    else setEnableCod(nextVal);

    try {
      const key = isRazorpay ? "enable_razorpay" : "enable_cod";
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: nextVal ? "true" : "false" }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          "success",
          `${isRazorpay ? "Razorpay Online Gateway" : "Cash on Delivery (COD)"} has been ${
            nextVal ? "ENABLED (Active)" : "DISABLED (Turned Off)"
          }!`
        );
      } else {
        // Rollback
        if (isRazorpay) setEnableRazorpay(currentVal);
        else setEnableCod(currentVal);
        showToast("error", data.error || "Failed to update payment gateway.");
      }
    } catch {
      // Rollback
      if (isRazorpay) setEnableRazorpay(currentVal);
      else setEnableCod(currentVal);
      showToast("error", "Network error while updating payment gateway.");
    } finally {
      setTogglingGateway(null);
    }
  };

  // Save General & Shipping Settings
  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGeneral(true);

    try {
      const payload = {
        store_name: storeName.trim(),
        store_address: storeAddress.trim(),
        support_email: supportEmail.trim(),
        support_phone: supportPhone.trim(),
        free_shipping_threshold: freeShippingThreshold.trim(),
        standard_shipping_charge: standardShippingCharge.trim(),
        gst_rate_percent: gstRatePercent.trim(),
        enable_razorpay: enableRazorpay ? "true" : "false",
        enable_cod: enableCod ? "true" : "false",
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("success", "All store settings saved successfully to database!");
      } else {
        showToast("error", data.error || "Failed to save settings.");
      }
    } catch {
      showToast("error", "Network error while saving settings.");
    } finally {
      setSavingGeneral(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
            <Settings className="w-4 h-4" />
            <span>Store Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
            Store Settings &amp; Payment Hub
          </h1>
          <p className="text-xs text-blumac-slate mt-0.5">
            Manage payment gateways (COD / Razorpay), pan-India shipping fees, GST taxation, and brand contact info.
          </p>
        </div>

        <button
          onClick={handleSaveAllSettings}
          disabled={savingGeneral}
          className="px-5 py-2.5 bg-blumac-navy hover:bg-blumac-copper text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition shadow-sm disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          {savingGeneral ? (
            <RefreshCw className="w-4 h-4 animate-spin text-blumac-copper" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{savingGeneral ? "Saving Settings..." : "Save All Settings"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PAYMENT GATEWAYS INTEGRATIONS (Interactive Toggles) */}
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4 text-xs md:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-blumac-beige">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blumac-copper" />
              <span>Payment Gateway Integrations (Open / Close Controls)</span>
            </h2>
            <span className="text-[11px] text-blumac-slate flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blumac-copper" />
              Toggle switches update live on storefront immediately
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Razorpay Online */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                enableRazorpay
                  ? "bg-emerald-50/40 border-emerald-200"
                  : "bg-gray-50 border-gray-200 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-blumac-navy text-sm">
                      Razorpay India (UPI / Cards / NetBanking)
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        enableRazorpay
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-gray-200 text-gray-700 border border-gray-300"
                      }`}
                    >
                      {enableRazorpay ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <p className="text-[11px] text-blumac-slate">
                    Accepts Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard, NetBanking.
                  </p>
                  <p className="text-[10px] text-blumac-slate/80 font-mono">
                    Webhook endpoint: /api/webhooks/payment
                  </p>
                </div>

                {/* Switch Button */}
                <button
                  type="button"
                  disabled={togglingGateway === "razorpay"}
                  onClick={() => handleToggleGateway("razorpay")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
                    enableRazorpay
                      ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                  title={enableRazorpay ? "Click to Close / Turn OFF" : "Click to Open / Turn ON"}
                >
                  {togglingGateway === "razorpay" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Power className="w-3.5 h-3.5" />
                  )}
                  <span>{enableRazorpay ? "Turn OFF" : "Turn ON"}</span>
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-blumac-beige/60 flex items-center justify-between text-[11px]">
                <span className="text-blumac-slate">Checkout Availability:</span>
                <span className={`font-semibold ${enableRazorpay ? "text-emerald-700" : "text-gray-500"}`}>
                  {enableRazorpay ? "✓ Open for all customers" : "✕ Blocked at checkout"}
                </span>
              </div>
            </div>

            {/* Cash on Delivery (COD) */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                enableCod
                  ? "bg-emerald-50/40 border-emerald-200"
                  : "bg-gray-50 border-gray-200 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-blumac-navy text-sm">
                      Cash on Delivery (COD)
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        enableCod
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-gray-200 text-gray-700 border border-gray-300"
                      }`}
                    >
                      {enableCod ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                  <p className="text-[11px] text-blumac-slate">
                    Collect cash directly at customer doorstep via BlueDart &amp; Delhivery courier.
                  </p>
                  <p className="text-[10px] text-blumac-slate/80 font-mono">
                    Coverage: 19,000+ PIN codes in India
                  </p>
                </div>

                {/* Switch Button */}
                <button
                  type="button"
                  disabled={togglingGateway === "cod"}
                  onClick={() => handleToggleGateway("cod")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
                    enableCod
                      ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                  title={enableCod ? "Click to Close / Turn OFF" : "Click to Open / Turn ON"}
                >
                  {togglingGateway === "cod" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Power className="w-3.5 h-3.5" />
                  )}
                  <span>{enableCod ? "Turn OFF" : "Turn ON"}</span>
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-blumac-beige/60 flex items-center justify-between text-[11px]">
                <span className="text-blumac-slate">Checkout Availability:</span>
                <span className={`font-semibold ${enableCod ? "text-emerald-700" : "text-gray-500"}`}>
                  {enableCod ? "✓ Open for all customers" : "✕ Blocked at checkout"}
                </span>
              </div>
            </div>
          </div>
        </div>

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
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold focus:ring-1 focus:ring-blumac-copper"
            />
          </div>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">Physical Store &amp; Hub Address</label>
            <textarea
              rows={2}
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy text-xs resize-none focus:ring-1 focus:ring-blumac-copper"
            />
          </div>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">Customer Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold focus:ring-1 focus:ring-blumac-copper"
            />
          </div>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">Support Helplines (India)</label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono text-[11px] focus:ring-1 focus:ring-blumac-copper"
            />
          </div>
        </div>

        {/* Shipping & Tax Rules */}
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2 pb-2 border-b border-blumac-beige">
            <Truck className="w-4 h-4 text-blumac-copper" />
            Shipping &amp; Indian GST Configuration
          </h2>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold focus:ring-1 focus:ring-blumac-copper"
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
              value={standardShippingCharge}
              onChange={(e) => setStandardShippingCharge(e.target.value)}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold focus:ring-1 focus:ring-blumac-copper"
            />
          </div>
          <div>
            <label className="block font-bold text-blumac-navy mb-1">
              Applicable GST Tax Rate (%)
            </label>
            <input
              type="number"
              value={gstRatePercent}
              onChange={(e) => setGstRatePercent(e.target.value)}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold focus:ring-1 focus:ring-blumac-copper"
            />
            <p className="text-[10px] text-blumac-slate mt-0.5">
              18% GST inclusive on skincare cosmetics under Indian HSN 3304.
            </p>
          </div>
        </div>

        {/* Notifications Status */}
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4 text-xs md:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2 pb-2 border-b border-blumac-beige">
            <MessageSquare className="w-4 h-4 text-blumac-copper" />
            Notification Channels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige flex items-center justify-between">
              <div>
                <p className="font-bold text-blumac-navy">Email Notifications (SMTP / Hostinger)</p>
                <p className="text-[10px] text-blumac-slate">Order confirmation &amp; invoice dispatch</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                CONFIGURED
              </span>
            </div>

            <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige flex items-center justify-between">
              <div>
                <p className="font-bold text-blumac-navy">WhatsApp Business Platform</p>
                <p className="text-[10px] text-blumac-slate">Live AWB courier dispatch &amp; delivery alerts</p>
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
