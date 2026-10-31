"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X, Cookie, ArrowRight } from "lucide-react";

export function DataPrivacyConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consentGiven = localStorage.getItem("blumac_dpdp_consent_given");
      if (!consentGiven) {
        // Show after a brief delay so page loads smoothly
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may fail in restricted/private modes
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("blumac_dpdp_consent_given", "true");
      localStorage.setItem("blumac_dpdp_consent_timestamp", new Date().toISOString());
    } catch {
      // ignore storage write errors
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!mounted || !isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Data Privacy and Cookie Consent"
      className="fixed bottom-3 sm:bottom-5 inset-x-3 sm:inset-x-6 z-50 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-blumac-navy/95 backdrop-blur-md text-white rounded-2xl p-4 sm:p-5 border border-blumac-copper/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blumac-copper/20 border border-blumac-copper/40 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-blumac-copper" />
          </div>
          <div className="space-y-1 text-xs text-white/90">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-xs sm:text-sm">
                Data Privacy &amp; Consent Notice
              </span>
              <span className="px-2 py-0.5 bg-blumac-copper/20 text-blumac-copper text-[10px] font-semibold rounded-full border border-blumac-copper/30">
                DPDP Act (India) 2023 Compliant
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-white/75 leading-relaxed">
              BLUMAC respects your privacy. We collect minimal customer information (name, contact number, shipping address) strictly for processing orders, courier delivery across India, and statutory compliance. We never sell your personal data.
            </p>
            <div className="flex items-center gap-3 pt-0.5 text-[11px]">
              <Link
                href="/policies/privacy"
                className="text-blumac-copper hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Read Privacy Policy</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <span className="text-white/30">•</span>
              <Link
                href="/policies/terms"
                className="text-white/70 hover:underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full md:w-auto px-5 py-2.5 bg-blumac-copper hover:bg-blumac-copper/90 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Accept &amp; Continue</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

