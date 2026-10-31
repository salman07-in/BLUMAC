import React from "react";
import { prisma } from "@/lib/db";
import { CouponsManagerClient } from "@/components/admin/CouponsManagerClient";
import { Tag } from "lucide-react";

export const metadata = {
  title: "Coupon Engine Management | BLUMAC Admin",
};

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
          <Tag className="w-4 h-4" />
          <span>Marketing & Promotions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
          Coupon Engine & Discounts
        </h1>
        <p className="text-xs text-blumac-slate mt-0.5">
          Configure percentage discounts, minimum order value thresholds, BOGO offers, and redemption limits.
        </p>
      </div>

      <CouponsManagerClient initialCoupons={coupons} />
    </div>
  );
}
