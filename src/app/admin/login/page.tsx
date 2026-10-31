"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BlumacLogo } from "@/components/common/BlumacLogo";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Administrative authentication failed.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B182D] text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full py-2">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <BlumacLogo variant="image" height={44} light={true} />
        </Link>
        <Link
          href="/"
          className="text-xs text-blumac-beige hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>Return to Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="bg-[#142B50]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blumac-copper/20 border border-blumac-copper/30 text-blumac-copperLight text-[11px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Restricted Access Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight">
              Executive Console
            </h1>
            <p className="text-xs text-blumac-beige/80">
              BLUMAC Korean Store • E-Commerce Administration & Operations
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
              <span>Clearance verified. Launching Executive Console...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-blumac-beige mb-1.5">
                Admin Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@blumac.in"
                  className="w-full bg-[#0B182D]/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blumac-copper focus:bg-[#0B182D] transition-colors"
                />
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-blumac-beige mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0B182D]/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blumac-copper focus:bg-[#0B182D] transition-colors"
                />
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-3 bg-blumac-copper hover:bg-blumac-copperLight text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : success ? (
                <span>Access Granted</span>
              ) : (
                <>
                  <span>Authenticate & Launch Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-6xl mx-auto w-full text-center py-4 text-xs text-white/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-blumac-copper" />
          <span>256-Bit SSL Encrypted Admin Gateway</span>
        </div>
        <p>© 2026 BLUMAC Korean Store. All administrative activities are monitored & audited.</p>
      </div>
    </div>
  );
}
