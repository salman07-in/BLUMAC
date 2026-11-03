import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/products";
import { getStoreProductsByCategory } from "@/lib/catalog";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found | BLUMAC Korean Store" };

  return {
    title: `${category.name} - Korean Skincare | BLUMAC Store India`,
    description: category.description,
  };
}


export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const products = await getStoreProductsByCategory(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-blumac-slate mb-6">
        <Link href="/" className="hover:text-blumac-navy">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-blumac-navy">
          Categories
        </Link>
        <span>/</span>
        <span className="font-semibold text-blumac-navy">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-blumac-beige shadow-subtle mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
            Korean Skincare Collection
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-blumac-navy">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-blumac-slate leading-relaxed">
            {category.description}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-blumac-navy bg-blumac-ivory px-4 py-2.5 rounded-full border border-blumac-beige">
          <span>{products.length} Curated Essentials</span>
        </div>
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-blumac-beige">
          <p className="text-sm text-blumac-slate">
            New Korean shipments for this category are arriving shortly!
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block px-6 py-2 bg-blumac-navy text-white text-xs font-bold rounded-full"
          >
            Explore Other Categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
