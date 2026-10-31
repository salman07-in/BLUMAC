import React, { Suspense } from "react";
import { ShopClient } from "@/components/storefront/ShopClient";
import { getStoreProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop All Korean Skincare | BLUMAC Korean Store",
  description:
    "Explore 100% authentic Korean skincare, cleansers, toners, serums, moisturizers, and sunscreens imported directly from Seoul, South Korea.",
};

export default async function ShopPage() {
  const products = await getStoreProducts();

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-4 border-blumac-copper border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-blumac-slate uppercase tracking-wider">
            Loading Korean Skincare Catalog...
          </p>
        </div>
      }
    >
      <ShopClient initialProducts={products} />
    </Suspense>
  );
}
