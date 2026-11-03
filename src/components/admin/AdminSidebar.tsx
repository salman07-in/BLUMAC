"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BlumacLogo } from "@/components/common/BlumacLogo";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Warehouse,
  Users,
  Sparkles,
  Settings,
  Star,
  BarChart3,
  Shield,
  ShieldCheck,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navGroups = [
    {
      label: "Core Operations",
      items: [
        { name: "Executive Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Order Management", href: "/admin/orders", icon: ShoppingBag },
        { name: "Product Catalog", href: "/admin/products", icon: Package },
        { name: "Inventory & Stock", href: "/admin/inventory", icon: Warehouse },
      ],
    },
    {
      label: "Growth & Marketing",
      items: [
        { name: "Coupons & Offers", href: "/admin/coupons", icon: Tag },
        {
          name: "AI Product Studio",
          href: "/admin/ai-studio",
          icon: Sparkles,
          highlight: true,
        },
        { name: "Reviews Moderation", href: "/admin/reviews", icon: Star },
        { name: "Sales Analytics", href: "/admin/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Security & Management",
      items: [
        { name: "Customer CRM", href: "/admin/customers", icon: Users },
        { name: "Security & Audit Logs", href: "/admin/security", icon: Shield },
        { name: "Store Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-blumac-navyDark text-white shrink-0 border-r border-blumac-navy flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-blumac-navy/80 bg-blumac-navyDark">
          <Link href="/" className="block">
            <BlumacLogo variant="image" width={140} height={48} light={true} />
          </Link>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] uppercase font-bold tracking-widest text-blumac-copper">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Control Center</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      item.highlight && !isActive
                        ? "bg-blumac-copper/20 text-blumac-copperLight border border-blumac-copper/30 font-bold"
                        : isActive
                        ? "bg-blumac-copper text-white shadow-md font-bold"
                        : "text-blumac-beige/80 hover:bg-blumac-navy hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Security Badge */}
      <div className="p-4 m-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-1 text-[11px] text-white/60">
        <div className="flex items-center justify-center gap-1.5 text-blumac-copperLight font-bold">
          <Shield className="w-3.5 h-3.5" />
          <span>BLUMAC Enterprise v2.4</span>
        </div>
        <p className="text-[10px] text-white/40">Secure Pan-India Skincare Fulfillment</p>
      </div>
    </aside>
  );
}
