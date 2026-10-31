import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, MapPin, Clock, Award, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy & DPDP Statutory Compliance | BLUMAC Korean Store",
  description:
    "Official Privacy Policy for BLUMAC Korean Store India: DPDP Act 2023 compliance, customer data rights, encryption standards, and Grievance Officer details.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
            Data Governance &amp; Statutory Compliance
          </span>
          <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-200">
            DPDP Act 2023 Compliant
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-blumac-navy">
          Privacy Policy &amp; Data Protection
        </h1>
        <p className="text-xs text-blumac-slate">
          Last updated: October 2026 • Compliant with Indian Digital Personal Data Protection (DPDP) Act, 2023 &amp; Information Technology Act, 2000
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-blumac-beige shadow-card space-y-8 text-xs sm:text-sm text-blumac-charcoal leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blumac-copper" />
            1. Statutory Framework &amp; Lawful Purpose
          </h2>
          <p>
            BLUMAC Korean Store (&ldquo;BLUMAC&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates an authentic Korean skincare e-commerce platform across India. In accordance with Section 4 and Section 6 of the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, we collect and process personal data exclusively with your affirmative consent for specified, lawful business purposes.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-blumac-navy flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blumac-copper" />
            2. Personal Information We Collect
          </h2>
          <p>
            When you purchase from BLUMAC, register for an account, or contact support, we collect strictly necessary details to fulfill your order and verify authenticity:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-blumac-slate">
            <li>
              <strong>Customer Identifiers:</strong> Full Name, Email Address, and Contact Mobile Number (utilized for order confirmation, OTP validation, and courier SMS/WhatsApp delivery status).
            </li>
            <li>
              <strong>Logistics Coordinates:</strong> Physical Shipping and Billing Address including building, street, city, state, and 6-digit Indian Postal Identification Number (PIN code).
            </li>
            <li>
              <strong>Transaction Identifiers:</strong> Merchant order numbers, Razorpay payment reference IDs, and payment status. <em>We never store raw credit/debit card numbers, CVVs, netbanking passwords, or UPI PINs on our servers.</em>
            </li>
            <li>
              <strong>Order Records:</strong> Items purchased, invoice copies, and optional customer product reviews.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy flex items-center gap-2">
            <Award className="w-4 h-4 text-blumac-copper" />
            3. How We Process &amp; Share Your Data
          </h2>
          <p>
            Your personal data is handled under strict confidentiality protocols. Data sharing is strictly restricted to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-blumac-slate">
            <li>
              <strong>Verified Indian Courier Partners:</strong> Handing over shipping address and mobile contact to logistics carriers (BlueDart Express Air, Delhivery Direct, India Post) solely for safe package delivery.
            </li>
            <li>
              <strong>PCI-DSS Compliant Payment Gateways:</strong> Secure API handshakes with RBI-licensed payment aggregators (Razorpay, Cashfree) using 256-bit TLS encryption.
            </li>
            <li>
              <strong>Statutory Compliance:</strong> Invoicing and e-way bill verification under Indian Goods and Services Tax (GST) laws.
            </li>
          </ul>
          <p className="font-semibold text-blumac-navy pt-1">
            BLUMAC maintains a strict zero-tolerance policy against selling, renting, or trading customer personal data to third-party telemarketers or external advertising networks.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy flex items-center gap-2">
            <Lock className="w-4 h-4 text-blumac-copper" />
            4. Security Standards &amp; Data Encryption
          </h2>
          <p>
            We implement comprehensive technical and organizational security controls in compliance with Rule 8 of the SPDI Rules:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige space-y-1">
              <span className="font-bold text-blumac-navy text-xs">256-Bit TLS Encryption</span>
              <p className="text-[11px] text-blumac-slate">
                All data transmitted between your browser and our servers is encrypted in transit using industry-standard SSL certificates.
              </p>
            </div>
            <div className="p-3 bg-blumac-ivory rounded-xl border border-blumac-beige space-y-1">
              <span className="font-bold text-blumac-navy text-xs">Access-Controlled Database</span>
              <p className="text-[11px] text-blumac-slate">
                Customer records are protected with hashed credentials, session rotation, and isolated administrative permissions.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-blumac-navy">
            5. Your Rights as a Data Principal (DPDP Act, 2023)
          </h2>
          <p>
            Under Section 11, 12, and 13 of India&apos;s DPDP Act, you have explicit rights regarding your digital personal information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-blumac-slate">
            <li>
              <strong>Right to Access:</strong> Request a summary of the personal information stored in your account and order history.
            </li>
            <li>
              <strong>Right to Correction &amp; Completion:</strong> Update incomplete, inaccurate, or outdated delivery addresses and contact information.
            </li>
            <li>
              <strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of your customer profile and account data, subject to mandatory statutory tax retention requirements.
            </li>
            <li>
              <strong>Right to Grievance Redressal:</strong> Direct access to our designated Grievance Officer for rapid resolution of any privacy concerns.
            </li>
          </ul>
        </section>

        {/* Section 6: Grievance Officer - Mandatory under Indian Law */}
        <section className="space-y-3 pt-4 border-t border-blumac-beige">
          <div className="bg-blumac-navy text-white rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blumac-copper" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Grievance Redressal Officer (Indian Statutory Notice)
              </h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              In accordance with the Information Technology Act, 2000, the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Consumer Protection (E-Commerce) Rules, 2020, the details of the designated Grievance Officer for BLUMAC are provided below:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-white/90">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-blumac-copper tracking-wider">
                  Officer Designation
                </span>
                <p className="font-semibold">Nodal Grievance &amp; Data Protection Officer</p>
                <p className="text-white/70 text-[11px]">BLUMAC Korean Store Operations India</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-blumac-copper tracking-wider">
                  Electronic Communication
                </span>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blumac-copper" />
                  <a href="mailto:grievance@blumac.in" className="underline hover:text-blumac-copper">
                    grievance@blumac.in
                  </a>
                </p>
                <p className="flex items-center gap-1.5 text-white/70 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-blumac-copper" />
                  <a href="mailto:privacy@blumac.in" className="underline hover:text-blumac-copper">
                    privacy@blumac.in
                  </a>
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2 pt-1 border-t border-white/10">
                <span className="text-[10px] uppercase font-bold text-blumac-copper tracking-wider">
                  Office Postal Address
                </span>
                <p className="flex items-start gap-1.5 text-[11px] text-white/80">
                  <MapPin className="w-3.5 h-3.5 text-blumac-copper shrink-0 mt-0.5" />
                  <span>BLUMAC Korean Skincare, Shahjahanpur / Bangalore, Karnataka &amp; Uttar Pradesh, India - PIN: 242001 / 560001</span>
                </p>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-white/70 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blumac-copper" />
              <span>
                <strong>Statutory Timelines:</strong> Grievance acknowledgement within 48 hours; resolution completed within 30 days of ticket receipt.
              </span>
            </div>
          </div>
        </section>

        {/* Back Link */}
        <div className="pt-4 flex items-center justify-between border-t border-blumac-beige text-xs">
          <Link href="/policies/terms" className="text-blumac-navy font-semibold hover:text-blumac-copper underline">
            &larr; View Terms of Service
          </Link>
          <Link href="/policies/contact" className="text-blumac-copper font-semibold hover:underline">
            Contact Support &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
