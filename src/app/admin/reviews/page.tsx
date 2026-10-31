import React from "react";
import { prisma } from "@/lib/db";
import { ReviewsModerationClient } from "@/components/admin/ReviewsModerationClient";
import { Star } from "lucide-react";

export const metadata = {
  title: "Reviews & Ratings Moderation | BLUMAC Admin",
};

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
          <Star className="w-4 h-4" />
          <span>Customer Advocacy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
          Review Moderation & Ratings
        </h1>
        <p className="text-xs text-blumac-slate mt-0.5">
          Approve verified purchase reviews before public display on storefront product pages.
        </p>
      </div>

      <ReviewsModerationClient initialReviews={reviews} />
    </div>
  );
}
