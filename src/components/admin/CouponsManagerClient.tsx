"use client";

import React, { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Tag, Plus, Check, X, Percent, Gift } from "lucide-react";

interface CouponsManagerClientProps {
  initialCoupons: any[];
}

export function CouponsManagerClient({
  initialCoupons,
}: CouponsManagerClientProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [maxDiscountCap, setMaxDiscountCap] = useState("");
  const [totalUsageLimit, setTotalUsageLimit] = useState("1000");
  const [loading, setLoading] = useState(false);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderValue: parseFloat(minOrderValue) || 0,
          maxDiscountCap: maxDiscountCap ? parseFloat(maxDiscountCap) : null,
          totalUsageLimit: parseInt(totalUsageLimit) || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.coupon) {
        setCoupons([data.coupon, ...coupons]);
        setIsModalOpen(false);
        setCode("");
        setDiscountValue("");
        setMinOrderValue("0");
        setMaxDiscountCap("");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const toggleCouponStatus = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-blumac-navy text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Coupon Code</th>
                <th className="py-3 px-4 font-bold">Discount Rule</th>
                <th className="py-3 px-4 font-bold">Min. Order Value</th>
                <th className="py-3 px-4 font-bold">Max Cap</th>
                <th className="py-3 px-4 font-bold">Redemptions</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blumac-beige">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-blumac-ivory/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-blumac-navy">
                    {coupon.code}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-blumac-copper">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}% OFF`
                        : coupon.discountType === "FREE_SHIPPING"
                        ? "FREE SHIPPING"
                        : `₹${coupon.discountValue} FLAT OFF`}
                    </span>
                    <span className="text-[10px] text-blumac-slate block">
                      Type: {coupon.discountType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-blumac-navy">
                    {coupon.minOrderValue > 0
                      ? formatCurrency(coupon.minOrderValue)
                      : "No Minimum"}
                  </td>

                  <td className="py-3.5 px-4 text-blumac-slate">
                    {coupon.maxDiscountCap
                      ? formatCurrency(coupon.maxDiscountCap)
                      : "Uncapped"}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-blumac-navy">
                    {coupon.usedCount} / {coupon.totalUsageLimit || "∞"}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        coupon.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {coupon.isActive ? "ACTIVE" : "PAUSED"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() =>
                        toggleCouponStatus(coupon.id, coupon.isActive)
                      }
                      className="text-xs font-bold text-blumac-copper hover:underline"
                    >
                      {coupon.isActive ? "Pause" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-blumac-beige">
            <h3 className="text-base font-bold text-blumac-navy font-serif">
              Create Promotional Coupon
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Coupon Code (e.g. SEOUL15) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="KOREA20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy cursor-pointer"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="10"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Min. Order Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="999"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Max Cap (₹, for % discounts)
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={maxDiscountCap}
                    onChange={(e) => setMaxDiscountCap(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Total Redemption Limit
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  value={totalUsageLimit}
                  onChange={(e) => setTotalUsageLimit(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                />
              </div>

              <div className="pt-3 border-t border-blumac-beige flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-blumac-beige rounded-lg font-bold text-blumac-slate"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg font-bold uppercase tracking-wider"
                >
                  {loading ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
