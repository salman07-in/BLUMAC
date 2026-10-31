"use client";

import React, { useState } from "react";
import { Star, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ReviewsModerationClientProps {
  initialReviews: any[];
}

export function ReviewsModerationClient({
  initialReviews,
}: ReviewsModerationClientProps) {
  const [reviews, setReviews] = useState(initialReviews);

  const handleToggleApproval = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !current }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !current } : r))
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-blumac-navy text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Product</th>
                <th className="py-3 px-4 font-bold">Reviewer</th>
                <th className="py-3 px-4 font-bold">Rating</th>
                <th className="py-3 px-4 font-bold">Customer Feedback</th>
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blumac-beige">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-blumac-slate">
                    No customer reviews in moderation queue.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-blumac-ivory/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-blumac-navy max-w-xs truncate">
                      {r.product?.name || "Skincare Product"}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-blumac-navy">{r.customerName}</p>
                      {r.isVerifiedPurchase && (
                        <span className="text-[10px] text-blumac-forest font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold ml-1 text-blumac-navy">{r.rating}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-md">
                      <p className="text-xs text-blumac-charcoal leading-relaxed line-clamp-2">
                        "{r.comment}"
                      </p>
                    </td>

                    <td className="py-3 px-4 text-blumac-slate text-[11px]">
                      {formatDate(r.createdAt)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.isApproved ? "PUBLISHED" : "PENDING REVIEW"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleApproval(r.id, r.isApproved)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          r.isApproved
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-blumac-navy text-white hover:bg-blumac-copper"
                        }`}
                      >
                        {r.isApproved ? "Unpublish" : "Approve & Publish"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
