import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sparkles, Heart, CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About BLUMAC Korean Store | Seoul to India Skincare Story",
  description:
    "Learn about BLUMAC Korean Store: our direct Seoul partnerships, authenticity promise, and mission to deliver authentic Korean skincare across India.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
          Our Heritage & Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-blumac-navy">
          Bringing Seoul's Skincare Excellence to India
        </h1>
        <p className="text-sm text-blumac-slate leading-relaxed">
          BLUMAC was founded with a singular conviction: skincare enthusiasts in India deserve direct, uncompromising access to 100% genuine Korean beauty innovations.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white rounded-2xl p-8 sm:p-12 border border-blumac-beige shadow-card">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-blumac-ivory border border-blumac-beige">
          <Image
            src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
            alt="BLUMAC Korean Skincare Laboratory"
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-blumac-charcoal leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-blumac-navy">
            The Authenticity Crisis We Solved
          </h2>
          <p>
            For years, purchasing cult Korean skincare in India meant navigating unauthorized grey-market importers, questionable batch codes, expired formulas, and exorbitant international shipping rates.
          </p>
          <p>
            BLUMAC established direct supply contracts with certified beauty manufacturers in Seoul, South Korea. Every single bottle, essence, serum, and sunscreen we stock arrives with complete customs clearance, batch-code traceability, and CDSCO regulatory compliance.
          </p>
          <div className="pt-2 flex items-center gap-2 text-blumac-forest font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Guaranteed 100% genuine batch codes on every product</span>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-blumac-beige shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blumac-ivory flex items-center justify-center text-blumac-copper">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-blumac-navy">Authenticity First</h3>
          <p className="text-xs text-blumac-slate leading-relaxed">
            Zero counterfeits, zero dilutions. We never compromise on source verification or ingredient purity.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-blumac-beige shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blumac-ivory flex items-center justify-center text-blumac-copper">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-blumac-navy">Formulated for Results</h3>
          <p className="text-xs text-blumac-slate leading-relaxed">
            We curate gentle yet highly concentrated active ingredients like snail mucin, rice extract, heartleaf, and centella that respect the lipid barrier.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-blumac-beige shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blumac-ivory flex items-center justify-center text-blumac-copper">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-blumac-navy">Climate Adaptive</h3>
          <p className="text-xs text-blumac-slate leading-relaxed">
            Our skincare experts test and select textures that feel breathable and non-sticky across India's varied climates and humidity levels.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blumac-navy text-white rounded-2xl p-8 sm:p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif">
          Ready to Begin Your Korean Skincare Journey?
        </h2>
        <p className="text-xs sm:text-sm text-blumac-beige max-w-lg mx-auto">
          Explore our complete catalog of certified Korean skincare essentials with free delivery across India on orders above ₹999.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blumac-copper hover:bg-blumac-copperLight text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors"
        >
          <span>Explore All Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
