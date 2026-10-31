"use client";

import React, { useState } from "react";
import { Sparkles, Truck, ShieldCheck, X } from "lucide-react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-blumac-navyDark text-blumac-ivory border-b border-blumac-navy text-xs tracking-wide py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="hidden md:flex items-center gap-2 text-blumac-beige text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-blumac-copper" />
          <span>100% Genuine Imported Skincare • Direct from Seoul, South Korea</span>
        </div>

        <div className="flex-1 text-center flex items-center justify-center gap-2 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blumac-copper animate-pulse" />
          <span>
            Special Launch Offer: Use Code <strong className="text-blumac-copperLight font-bold">SEOUL10</strong> for 10% OFF | Free Express Delivery across India above ₹999
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-blumac-beige text-[11px]">
            <Truck className="w-3.5 h-3.5 text-blumac-copper" />
            <span>All-India Delivery: 2-5 Days</span>
          </div>
          <button
            onClick={() => setVisible(false)}
            aria-label="Close notification"
            className="text-blumac-beige hover:text-white transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
