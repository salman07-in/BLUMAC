"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BlumacLogo } from "@/components/common/BlumacLogo";
import {
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  CheckCircle,
} from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-blumac-navyDark text-blumac-ivory pt-16 pb-12 border-t-2 border-blumac-copper/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-blumac-navy">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blumac-navy rounded-lg border border-blumac-copper/30 shrink-0">
              <ShieldCheck className="w-6 h-6 text-blumac-copper" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wide uppercase text-white">
                100% Authentic Korean Imports
              </h4>
              <p className="text-xs text-blumac-beige mt-1 leading-relaxed">
                Directly sourced from authorized Seoul distributors with verified batch codes and Indian CDSCO compliance.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-blumac-navy rounded-lg border border-blumac-copper/30 shrink-0">
              <Truck className="w-6 h-6 text-blumac-copper" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wide uppercase text-white">
                All-India Express Delivery
              </h4>
              <p className="text-xs text-blumac-beige mt-1 leading-relaxed">
                Fast shipping across all 28 states & 8 UTs. Free delivery on orders above ₹999 with real-time tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-blumac-navy rounded-lg border border-blumac-copper/30 shrink-0">
              <Sparkles className="w-6 h-6 text-blumac-copper" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wide uppercase text-white">
                Expert K-Beauty Guidance
              </h4>
              <p className="text-xs text-blumac-beige mt-1 leading-relaxed">
                Curated regimens for Indian skin types, climate, and common concerns like hyperpigmentation and barrier repair.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-block">
              <BlumacLogo variant="image" width={160} height={60} light={true} />
            </div>
            <p className="text-xs text-blumac-beige leading-relaxed max-w-sm mt-3">
              BLUMAC Korean Store is India's premier destination for authentic Korean skincare and cosmetics. Delivering the pinnacle of Seoul beauty innovation directly to your doorstep with guaranteed authenticity.
            </p>
            <div className="pt-2 space-y-2 text-xs text-blumac-beige">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blumac-copper shrink-0 mt-0.5" />
                <span>
                  BLUMAC STORE, Bahadurganj Rd, near Banvari lal jewellers, Sadar Bazar, Shahjahanpur, Uttar Pradesh 242001
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blumac-copper shrink-0" />
                <a href="mailto:care@blumac.in" className="hover:text-white transition-colors">
                  care@blumac.in
                </a>
              </p>
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-blumac-copper shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-white/90 font-semibold">
                    Customer Care & WhatsApp Orders:
                  </p>
                  <p className="space-x-2 text-[11px] mt-0.5 font-mono">
                    <a href="tel:6306955690" className="hover:text-blumac-copper transition-colors">+91 6306955690</a>
                    <span>•</span>
                    <a href="tel:9519506235" className="hover:text-blumac-copper transition-colors">+91 9519506235</a>
                    <span>•</span>
                    <a href="tel:9559579883" className="hover:text-blumac-copper transition-colors">+91 9559579883</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Categories
            </h5>
            <ul className="space-y-2.5 text-xs text-blumac-beige">
              <li>
                <Link href="/category/cleansers" className="hover:text-blumac-copper transition-colors">
                  Cleansing Oils & Foams
                </Link>
              </li>
              <li>
                <Link href="/category/toners-essences" className="hover:text-blumac-copper transition-colors">
                  Toners & Essences
                </Link>
              </li>
              <li>
                <Link href="/category/serums-ampoules" className="hover:text-blumac-copper transition-colors">
                  Serums & Ampoules
                </Link>
              </li>
              <li>
                <Link href="/category/moisturizers" className="hover:text-blumac-copper transition-colors">
                  Moisturizers & Creams
                </Link>
              </li>
              <li>
                <Link href="/category/sunscreens" className="hover:text-blumac-copper transition-colors">
                  Korean Sunscreens SPF50+
                </Link>
              </li>
              <li>
                <Link href="/category/sheet-masks" className="hover:text-blumac-copper transition-colors">
                  Sheet Masks & Patches
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Brands */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Featured Brands
            </h5>
            <ul className="space-y-2.5 text-xs text-blumac-beige">
              <li>
                <Link href="/shop?brand=COSRX" className="hover:text-blumac-copper transition-colors">
                  COSRX
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=Beauty+of+Joseon" className="hover:text-blumac-copper transition-colors">
                  Beauty of Joseon
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=Anua" className="hover:text-blumac-copper transition-colors">
                  Anua
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=Laneige" className="hover:text-blumac-copper transition-colors">
                  Laneige
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=Dear%2C+Klairs" className="hover:text-blumac-copper transition-colors">
                  Dear, Klairs
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=Torriden" className="hover:text-blumac-copper transition-colors">
                  Torriden Dive-In
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Customer Policies
            </h5>
            <ul className="space-y-2.5 text-xs text-blumac-beige">
              <li>
                <Link href="/policies/about" className="hover:text-blumac-copper transition-colors">
                  About BLUMAC
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-blumac-copper transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-blumac-copper transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-blumac-copper transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-blumac-copper transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/faq" className="hover:text-blumac-copper transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link href="/policies/contact" className="hover:text-blumac-copper transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-blumac-navy pt-8 pb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-bold tracking-wider uppercase text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-blumac-copper" />
              Join the BLUMAC Beauty Club
            </h4>
            <p className="text-xs text-blumac-beige">
              Get 10% off your first order, skincare advice, and early access to fresh Korean shipments.
            </p>
          </div>

          <div className="w-full md:w-auto min-w-[320px]">
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-blumac-copper font-medium bg-blumac-navy px-4 py-2.5 rounded-full border border-blumac-copper/40">
                <CheckCircle className="w-4 h-4" />
                <span>Thank you! Welcome to the BLUMAC family. Check your inbox!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-blumac-navy border border-blumac-copper/40 rounded-full py-2.5 pl-4 pr-12 text-xs text-white placeholder-blumac-slate focus:outline-none focus:border-blumac-copper"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-blumac-copper hover:bg-blumac-copperLight text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar & Payment Icons */}
        <div className="border-t border-blumac-navy/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blumac-slate">
          <p>© {new Date().getFullYear()} BLUMAC Korean Store. All rights reserved. Registered under Indian Commerce & GST regulations.</p>
          
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-blumac-beige">Accepted Payments:</span>
            <span className="px-2 py-0.5 bg-blumac-navy text-blumac-ivory rounded text-[10px] font-semibold border border-blumac-navyLight">UPI (GPay / PhonePe / Paytm)</span>
            <span className="px-2 py-0.5 bg-blumac-navy text-blumac-ivory rounded text-[10px] font-semibold border border-blumac-navyLight">RuPay / Visa / MC</span>
            <span className="px-2 py-0.5 bg-blumac-navy text-blumac-ivory rounded text-[10px] font-semibold border border-blumac-navyLight">NetBanking</span>
            <span className="px-2 py-0.5 bg-blumac-navy text-blumac-ivory rounded text-[10px] font-semibold border border-blumac-navyLight">COD Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
