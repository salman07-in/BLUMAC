import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | BLUMAC Korean Store",
  description:
    "Terms and Conditions governing the use of the BLUMAC Korean Store online e-commerce platform and purchase of skincare products in India.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
          Legal Agreement
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-blumac-navy">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs text-blumac-slate">
          Last updated: October 2026 • Governing Law: Jurisdiction of Shahjahanpur, Uttar Pradesh, India
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-blumac-beige shadow-card space-y-6 text-xs sm:text-sm text-blumac-charcoal leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">1. Acceptance of Terms</h2>
          <p>
            By accessing or purchasing from BLUMAC Korean Store ("www.blumac.in"), you acknowledge and agree to be bound by these terms, our shipping policy, and refund rules.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">2. Product Authenticity & Ingredients</h2>
          <p>
            All cosmetic and skincare products offered are 100% authentic imports sourced from authorized manufacturers in South Korea. Descriptions, active ingredient lists (INCI), and usage suggestions are provided for informational and cosmetic purposes only and are not intended to diagnose, treat, or prevent any medical condition.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">3. Pricing & Promotions</h2>
          <p>
            All prices are stated in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST). BLUMAC reserves the right to correct typographical pricing errors before shipment confirmation. Promotional discount coupons (such as SEOUL10 and FIRSTORDER) are subject to specific eligibility thresholds and cannot be stacked unless explicitly stated.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">4. Governing Jurisdiction</h2>
          <p>
            Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Shahjahanpur, Uttar Pradesh, India.
          </p>
        </section>
      </div>
    </div>
  );
}
