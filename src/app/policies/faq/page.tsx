"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Are all products sold on BLUMAC 100% authentic Korean imports?",
      a: "Yes, absolutely. We source exclusively from certified Korean manufacturers and authorized Korean beauty exporters in Seoul. Every single product has legitimate batch codes and complies with Indian CDSCO cosmetics import standards.",
    },
    {
      q: "How fast is delivery to my city in India?",
      a: "Metro cities (Delhi NCR, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad) receive delivery within 2 to 3 business days. Other cities and regions receive delivery within 3 to 5 business days via premium air express couriers.",
    },
    {
      q: "Is there a delivery fee?",
      a: "All orders above ₹999 qualify for FREE express shipping across India. Orders under ₹999 incur a flat fee of ₹99.",
    },
    {
      q: "Is Cash on Delivery (COD) available?",
      a: "Yes, COD is available across more than 19,000 PIN codes in India for orders up to ₹5,000.",
    },
    {
      q: "How do I choose the right Korean skincare routine for Indian weather?",
      a: "For hot and humid Indian summers, we recommend lightweight gel cleansers, watery toners like Heartleaf or Centella, non-sticky essences like Snail Mucin, and lightweight chemical sunscreens like Beauty of Joseon Relief Sun that leave zero greasy cast. In dry winters, layer with ceramide creams and nourishing sleeping masks.",
    },
    {
      q: "How do I apply a coupon code?",
      a: "You can enter your coupon code (e.g. SEOUL10 or FIRSTORDER) in the shopping bag drawer or during step 2 of checkout. The discount will instantly reflect on your order summary before payment.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          Got Questions?
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-blumac-navy">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-blumac-slate">
          Everything you need to know about ordering authentic Korean skincare at BLUMAC.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card divide-y divide-blumac-beige overflow-hidden">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-blumac-navy hover:bg-blumac-ivory/50 transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-blumac-copper transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-blumac-slate leading-relaxed">
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Support CTA */}
      <div className="bg-blumac-ivory rounded-2xl p-6 sm:p-8 border border-blumac-beige text-center space-y-3">
        <h3 className="text-base font-bold text-blumac-navy">Still need personalized skincare advice?</h3>
        <p className="text-xs text-blumac-slate max-w-md mx-auto">
          Our skincare experts are happy to help you curate the perfect Korean routine for your specific skin type and goals.
        </p>
        <Link
          href="/policies/contact"
          className="inline-block px-6 py-2.5 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors"
        >
          Contact Skincare Support
        </Link>
      </div>
    </div>
  );
}
