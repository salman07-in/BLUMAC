"use client";

import React from "react";
import { Printer } from "lucide-react";

export function InvoicePrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded-lg text-xs font-semibold transition-colors"
      aria-label="Print GST Invoice"
    >
      <Printer className="w-3.5 h-3.5 text-blumac-copper" />
      <span>Print GST Invoice</span>
    </button>
  );
}
