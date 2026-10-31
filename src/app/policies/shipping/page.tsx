import React from "react";
import Link from "next/link";
import { Truck, Clock, ShieldCheck, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | BLUMAC Korean Store",
  description:
    "All-India shipping policy for BLUMAC Korean Store: delivery timelines, tracking, courier partners, and free shipping thresholds across Indian PIN codes.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
          All-India Logistics
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-blumac-navy">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-blumac-slate">
          Last updated: October 2026 • Effective across all 28 Indian States & 8 Union Territories
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-blumac-beige shadow-subtle flex items-start gap-3">
          <Truck className="w-5 h-5 text-blumac-copper shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blumac-navy uppercase">Free Shipping</h4>
            <p className="text-[11px] text-blumac-slate mt-0.5">On all orders above ₹999 anywhere in India.</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blumac-beige shadow-subtle flex items-start gap-3">
          <Clock className="w-5 h-5 text-blumac-copper shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blumac-navy uppercase">24-Hour Dispatch</h4>
            <p className="text-[11px] text-blumac-slate mt-0.5">Orders confirmed before 2 PM IST ship the same day.</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blumac-beige shadow-subtle flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blumac-copper shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blumac-navy uppercase">Live Tracking</h4>
            <p className="text-[11px] text-blumac-slate mt-0.5">Instant tracking link sent via WhatsApp & Email.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-blumac-beige shadow-card space-y-6 text-xs sm:text-sm text-blumac-charcoal leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">1. Delivery Timelines by Zone</h2>
          <p>
            We partner with India's premier air express couriers (BlueDart, Delhivery, Bluedart Apex, DTDC) to ensure rapid, climate-controlled transport of your skincare formulas:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-blumac-slate">
            <li><strong>Metro Cities (Tier 1):</strong> Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad — <strong>2 to 3 Business Days</strong>.</li>
            <li><strong>Tier 2 Cities & State Capitals:</strong> Jaipur, Lucknow, Chandigarh, Kochi, Indore, Bhopal, Surat, Patna, Bhubaneswar — <strong>3 to 4 Business Days</strong>.</li>
            <li><strong>Rest of India & Remote PIN Codes:</strong> North-Eastern states, Jammu & Kashmir, Island territories — <strong>4 to 7 Business Days</strong>.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">2. Shipping Charges</h2>
          <p>
            • Orders valued at <strong>₹999 or more</strong> qualify for <strong>FREE EXPRESS DELIVERY</strong>.<br />
            • Orders below ₹999 incur a nominal flat shipping fee of <strong>₹99</strong> across all Indian PIN codes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">3. Cash on Delivery (COD)</h2>
          <p>
            Cash on Delivery is available across 19,000+ serviceable PIN codes in India for orders up to ₹5,000. For COD orders, please ensure the recipient is available at the provided delivery address with the exact cash amount.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">4. Order Tracking</h2>
          <p>
            Once your package is handed over to our courier partner, you will receive an automated dispatch notification with your AWB tracking number via Email and WhatsApp. You can also track your shipment status anytime directly from your <Link href="/account/orders" className="text-blumac-copper font-semibold underline">Order History</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
