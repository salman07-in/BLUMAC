import React from "react";
import { prisma } from "@/lib/db";
import { ProductsManagerClient } from "@/components/admin/ProductsManagerClient";
import { Package } from "lucide-react";

export const metadata = {
  title: "Product Catalog Management | BLUMAC Admin",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      variants: {
        include: { inventory: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-1">
          <Package className="w-4 h-4" />
          <span>Catalog Inventory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
          Korean Skincare Catalog
        </h1>
        <p className="text-xs text-blumac-slate mt-0.5">
          Manage product prices, formulations, variants, inventory stock, and publish status.
        </p>
      </div>

      <ProductsManagerClient
        initialProducts={products}
        brands={brands}
        categories={categories}
      />
    </div>
  );
}
