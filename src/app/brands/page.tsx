import React from "react";
import Link from "next/link";
import { BRANDS } from "@/lib/products";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Featured Korean Skincare Brands | BLUMAC Korean Store",
  description:
    "Explore authentic Korean skincare brands imported directly from Seoul: COSRX, Beauty of Joseon, Anua, Laneige, Torriden, and Skin1004.",
};

export default function BrandsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          Direct Seoul Partnerships
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-blumac-navy">
          Curated Korean Brands
        </h1>
        <p className="text-xs sm:text-sm text-blumac-slate leading-relaxed">
          We partner directly with leading Korean beauty laboratories and authorized distributors to guarantee absolute authenticity and freshest manufacturing batches for our Indian customers.
        </p>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BRANDS.map((brand) => (
          <div
            key={brand.slug}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-blumac-beige shadow-subtle flex flex-col justify-between hover:shadow-card hover:border-blumac-copper transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blumac-copper">
                  {brand.origin}
                </span>
                <span className="px-2.5 py-1 bg-blumac-ivory text-blumac-navy border border-blumac-beige text-[11px] font-semibold rounded-full">
                  {brand.productCount} Products
                </span>
              </div>

              <h2 className="text-2xl font-extrabold font-serif text-blumac-navy">
                {brand.name}
              </h2>
              <p className="text-xs font-semibold text-blumac-copper mt-1 italic">
                "{brand.tagline}"
              </p>

              <p className="text-xs text-blumac-slate mt-3 leading-relaxed">
                {brand.description}
              </p>
            </div>

            <div className="pt-6 border-t border-blumac-beige/60 mt-6 flex items-center justify-between">
              <span className="text-[11px] text-blumac-slate flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blumac-copper" />
                Verified Batch Codes
              </span>
              <Link
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="text-xs font-bold uppercase tracking-wider text-blumac-navy hover:text-blumac-copper flex items-center gap-1"
              >
                <span>Shop Brand</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
