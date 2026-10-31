"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlumacLogo } from "@/components/common/BlumacLogo";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user.role === "ADMIN" || data.user.role === "STAFF") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
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
            Welcome Back
          </h1>
          <p className="text-xs text-blumac-slate">
            Log in to manage orders, addresses, and loyalty rewards
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
              Email Address
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-blumac-navy">
                Password
              </label>
              <span className="text-[11px] text-blumac-copper hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg py-2.5 pl-10 pr-4 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
              <Lock className="w-4 h-4 text-blumac-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-blumac-beige text-center space-y-3">
          <p className="text-xs text-blumac-slate">
            Don't have an account yet?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-blumac-copper hover:underline"
            >
              Register here
            </Link>
          </p>

          <div className="p-3 bg-blumac-ivory rounded-lg border border-blumac-beige text-[11px] text-blumac-slate text-left">
            <p className="font-semibold text-blumac-navy mb-1">Demo Admin Login:</p>
            <p>Email: <code className="text-blumac-navy font-bold">admin@blumac.in</code></p>
            <p>Password: <code className="text-blumac-navy font-bold">BlumacAdmin@2026</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
