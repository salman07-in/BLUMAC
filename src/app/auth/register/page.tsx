"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlumacLogo } from "@/components/common/BlumacLogo";
import { Lock, Mail, User, Phone, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consentChecked) {
      setError("Please accept the Terms of Service & Privacy Policy under the DPDP Act 2023 to register.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/account");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 sm:p-10 border border-blumac-beige shadow-card space-y-6">
        <div className="text-center space-y-2">
          <BlumacLogo variant="image" width={160} height={56} className="mx-auto" />
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-blumac-navy pt-2">
            Create an Account
          </h1>
          <p className="text-xs text-blumac-slate">
            Join the BLUMAC Beauty Club & unlock 50 welcome loyalty points
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-blumac-navy mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Ananya Rao"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg py-2.5 pl-10 pr-4 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
              <User className="w-4 h-4 text-blumac-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-blumac-navy mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg py-2.5 pl-10 pr-4 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
              <Mail className="w-4 h-4 text-blumac-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-blumac-navy mb-1">
              Mobile Number (For Courier Updates)
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg py-2.5 pl-10 pr-4 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
              <Phone className="w-4 h-4 text-blumac-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-blumac-navy mb-1">
              Create Password (min. 6 characters) *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg py-2.5 pl-10 pr-4 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
              <Lock className="w-4 h-4 text-blumac-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* DPDP Act 2023 Consent Box */}
          <div className="p-3.5 bg-blumac-ivory rounded-xl border border-blumac-beige space-y-2">
            <div className="flex items-center gap-1.5 text-blumac-copper text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>India DPDP Act (2023) Consent</span>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-blumac-slate leading-snug">
              <input
                type="checkbox"
                required
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blumac-copper accent-blumac-copper focus:ring-blumac-copper cursor-pointer"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/policies/terms"
                  target="_blank"
                  className="text-blumac-navy font-semibold underline hover:text-blumac-copper"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/policies/privacy"
                  target="_blank"
                  className="text-blumac-navy font-semibold underline hover:text-blumac-copper"
                >
                  Privacy Policy
                </Link>
                , and consent to BLUMAC processing my personal details for order delivery and customer loyalty account management under Indian law.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
          >
            <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-blumac-beige text-center">
          <p className="text-xs text-blumac-slate">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-blumac-copper hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
