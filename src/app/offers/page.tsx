"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Tag, Check, Copy, ArrowRight, ShieldCheck } from "lucide-react";

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const coupons = [
    {
      code: "SEOUL10",
      discount: "10% OFF",
      title: "Storewide Launch Offer",
      desc: "Enjoy an instant 10% discount on every item in your cart. No brand exclusions.",
      minOrder: "₹0",
      validity: "Valid for all customers",
      badge: "Most Popular",
    },
    {
      code: "FIRSTORDER",
      discount: "₹200 FLAT OFF",
      title: "New Customer Welcome Gift",
      desc: "Receive ₹200 off your first Korean skincare haul when your bag value exceeds ₹999.",
      minOrder: "₹999",
      validity: "First-time buyers only",
      badge: "Welcome Deal",
    },
    {
      code: "KBEAUTY25",
      discount: "25% OFF",
      title: "Korean Beauty Enthusiast",
      desc: "Get 25% off up to a maximum discount of ₹500 on all serums, essences, and toners.",
      minOrder: "₹1,499",
      validity: "Limited time promotion",
      badge: "Special Saver",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Exclusive Discounts & Deals
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-blumac-navy">
          Active Coupons & Offers
        </h1>
        <p className="text-xs sm:text-sm text-blumac-slate leading-relaxed">
          Copy your desired coupon code and paste it in your shopping bag or during checkout for instant savings.
        </p>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {coupons.map((c) => (
          <div
            key={c.code}
            className="bg-white rounded-2xl p-6 border-2 border-dashed border-blumac-beige shadow-subtle flex flex-col justify-between hover:border-blumac-copper transition-all relative overflow-hidden"
          >
            {c.badge && (
              <span className="absolute top-4 right-4 bg-blumac-navy text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {c.badge}
              </span>
            )}

            <div>
              <div className="flex items-center gap-2 text-blumac-copper mb-2">
                <Tag className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Coupon Code</span>
              </div>

              <div className="text-2xl font-extrabold text-blumac-navy font-serif">
                {c.discount}
              </div>
              <h3 className="text-sm font-bold text-blumac-navy mt-1">{c.title}</h3>
              <p className="text-xs text-blumac-slate mt-2 leading-relaxed">{c.desc}</p>

              <div className="mt-4 pt-4 border-t border-blumac-beige/60 space-y-1 text-[11px] text-blumac-slate">
                <p>• Minimum Order Value: <strong className="text-blumac-navy">{c.minOrder}</strong></p>
                <p>• {c.validity}</p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-blumac-beige/60 flex items-center justify-between gap-3">
              <span className="font-mono text-sm font-bold text-blumac-navy bg-blumac-ivory px-3 py-1.5 rounded-lg border border-blumac-beige">
                {c.code}
              </span>
              <button
                onClick={() => copyCoupon(c.code)}
                className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  copiedCode === c.code
                    ? "bg-green-600 text-white"
                    : "bg-blumac-navy hover:bg-blumac-copper text-white"
                }`}
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Free Shipping & Perks Card */}
      <div className="bg-blumac-navyDark text-white rounded-2xl p-8 sm:p-10 border border-blumac-copper/30 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-blumac-copperLight">
            <ShieldCheck className="w-3.5 h-3.5 text-blumac-copper" />
            <span>Automatic Delivery Perk</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
            Free Express All-India Shipping
          </h2>
          <p className="text-xs sm:text-sm text-blumac-beige leading-relaxed">
            No coupon needed! When your shopping bag totals ₹999 or more, express courier delivery across all 28 Indian states is automatically free.
          </p>
        </div>

        <Link
          href="/shop"
          className="px-8 py-3.5 bg-blumac-copper hover:bg-blumac-copperLight text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full flex items-center gap-2 transition-all shadow-lg shrink-0"
        >
          <span>Shop Skincare Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
