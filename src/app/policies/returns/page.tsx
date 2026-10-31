import React from "react";
import Link from "next/link";
import { RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Refund Policy | BLUMAC Korean Store",
  description:
    "Learn about returns, replacements, and refund policies for authentic Korean skincare products at BLUMAC Korean Store.",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
          Customer Protection
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-blumac-navy">
          Return, Replacement & Refund Policy
        </h1>
        <p className="text-xs text-blumac-slate">
          Last updated: October 2026 • BLUMAC Korean Store India
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-blumac-beige shadow-card space-y-6 text-xs sm:text-sm text-blumac-charcoal leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">1. Skincare Hygiene & Return Eligibility</h2>
          <p>
            Due to strict health and cosmetic hygiene standards under Indian CDSCO regulations, skincare and cosmetic products that have been unsealed, opened, or used cannot be returned for change of mind.
          </p>
          <p>
            However, we provide <strong>100% Free Replacements or Full Refunds</strong> under the following conditions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-blumac-slate">
            <li>Item arrived physically damaged or leaking in transit.</li>
            <li>Incorrect product or variant received compared to your confirmed order.</li>
            <li>Product with broken seal upon initial unboxing.</li>
            <li>Defective pump, dropper, or dispenser packaging.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">2. How to Report an Issue (Within 48 Hours)</h2>
          <p>
            Please report any damage or incorrect shipment within <strong>48 hours of delivery</strong>:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-blumac-slate">
            <li>Take clear photographs of the outer package, shipping label, and the affected item.</li>
            <li>Email our support team at <strong className="text-blumac-navy">care@blumac.in</strong> or initiate a request from your <Link href="/account/orders" className="text-blumac-copper underline">Order History</Link>.</li>
            <li>Our support team will verify the claim and dispatch a brand-new replacement within 24 hours at no extra cost.</li>
          </ol>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">3. Refund Processing Timeline</h2>
          <p>
            Once an eligible refund is approved:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-blumac-slate">
            <li><strong>Prepaid Orders (UPI / Cards / NetBanking):</strong> Refund is credited directly to the original payment source within <strong>3 to 5 business days</strong>.</li>
            <li><strong>Cash on Delivery (COD) Orders:</strong> Refund is issued via instant UPI transfer or NEFT bank transfer upon receiving your account details.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
