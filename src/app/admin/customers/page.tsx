import React from "react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Users, Sparkles, MapPin } from "lucide-react";

export const metadata = {
  title: "Customers Directory & Loyalty | BLUMAC Admin",
};

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    include: {
      profile: true,
      orders: { select: { id: true, grandTotal: true } },
      addresses: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
          <Users className="w-4 h-4" />
          <span>Customer Relationship Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
          Customers & Loyalty Ledger
        </h1>
        <p className="text-xs text-blumac-slate mt-0.5">
          Directory of registered Indian skincare shoppers, loyalty points, and referral codes.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-blumac-navy text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Customer Name</th>
                <th className="py-3 px-4 font-bold">Email & Contact</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Loyalty Points</th>
                <th className="py-3 px-4 font-bold">Referral Code</th>
                <th className="py-3 px-4 font-bold">Lifetime Orders</th>
                <th className="py-3 px-4 font-bold text-right">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blumac-beige">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-blumac-ivory/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-blumac-navy">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-blumac-navy">{c.email}</p>
                    <p className="text-[11px] text-blumac-slate">{c.phone || "No phone"}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {c.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-blumac-copper">
                    {c.profile?.loyaltyPoints || 0} Pts
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-blumac-navy">
                    {c.profile?.referralCode || "N/A"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blumac-navy">
                    {c.orders.length} Orders
                  </td>
                  <td className="py-3.5 px-4 text-right text-blumac-slate text-[11px]">
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
