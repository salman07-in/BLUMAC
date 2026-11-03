import React, { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { mapDbProduct } from "@/lib/catalog";
import { Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}" | BLUMAC Korean Store` : "Search | BLUMAC Korean Store",
    description: `Search results for ${q} – authentic Korean skincare from BLUMAC.`,
  };
}

async function SearchResults({ query }: { query: string }) {
  if (!query || query.length < 2) {
    return (
      <div className="text-center py-16">
        <Search className="w-12 h-12 text-blumac-beige mx-auto mb-4" />
        <p className="text-blumac-slate text-sm">Type at least 2 characters to search...</p>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: query } },
        { shortDescription: { contains: query } },
        { brand: { name: { contains: query } } },
        { category: { name: { contains: query } } },
      ],
    },
    include: {
      brand: true,
      category: true,
      variants: { include: { inventory: true }, take: 1 },
    },
    orderBy: [{ isBestSeller: "desc" }, { rating: "desc" }],
  });

  const mapped = products.map(mapDbProduct);

  return (
    <>
      <p className="text-xs text-blumac-slate mb-6">
        Showing <strong className="text-blumac-navy">{mapped.length}</strong> results for{" "}
        <strong className="text-blumac-copper">&ldquo;{query}&rdquo;</strong>
      </p>
      {mapped.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-blumac-beige text-center space-y-4">
          <Search className="w-10 h-10 text-blumac-copper/50 mx-auto" />
          <h2 className="text-lg font-bold text-blumac-navy font-serif">No results found</h2>
          <p className="text-xs text-blumac-slate max-w-xs mx-auto">
            We couldn&apos;t find any products matching &ldquo;{query}&rdquo;. Try a different search term or browse our catalog.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {mapped.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blumac-copper mb-2">
          <Search className="w-4 h-4" />
          <span>Search Results</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
          {q ? `Results for "${q}"` : "Search Korean Skincare"}
        </h1>
      </div>

      {/* Popular Searches if no query */}
      {!q && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-blumac-slate uppercase tracking-wider">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {["COSRX", "Snail Mucin", "Sunscreen", "ANUA", "Vitamin C", "Toner", "Beauty of Joseon"].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-4 py-2 bg-white border border-blumac-beige rounded-full text-xs font-semibold text-blumac-navy hover:border-blumac-copper hover:text-blumac-copper transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blumac-copper border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <SearchResults query={q} />
      </Suspense>
    </div>
  );
}
