"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/storefront/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blumac-beige">
        <div>
          <Link
            href="/account"
            className="text-xs font-semibold text-blumac-slate hover:text-blumac-navy flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Account</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-blumac-navy flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <span>My Skincare Wishlist ({wishlistedProducts.length})</span>
          </h1>
        </div>

        <Link
          href="/shop"
          className="text-xs font-bold uppercase tracking-wider text-blumac-copper hover:underline"
        >
          Explore More Products →
        </Link>
      </div>

      {/* Wishlist Items */}
      {wishlistedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-blumac-beige shadow-subtle space-y-4">
          <div className="w-16 h-16 bg-blumac-ivory rounded-full flex items-center justify-center mx-auto text-blumac-copper">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-blumac-navy font-serif">
            Your wishlist is empty
          </h2>
          <p className="text-xs text-blumac-slate max-w-sm mx-auto">
            Click the heart icon on any Korean skincare product to save your holy grail items for later.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-sm"
          >
            Browse Best Sellers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
