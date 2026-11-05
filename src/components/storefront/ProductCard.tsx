"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star, Check } from "lucide-react";
import { Product } from "@/lib/products";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = React.useState(false);

  const discount = calculateDiscount(product.mrp, product.price);
  const inWish = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      mrp: product.mrp,
      image: product.images[0],
      size: product.variants[0]?.size,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white border border-blumac-beige rounded-xl overflow-hidden shadow-subtle hover:shadow-float transition-all duration-300 flex flex-col h-full">
      {/* Top Badges & Wishlist */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {product.isBestSeller && (
            <span className="bg-blumac-navy text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-sm pointer-events-auto">
              Best Seller
            </span>
          )}
          {product.isTrending && (
            <span className="bg-blumac-copper text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-sm pointer-events-auto">
              Trending
            </span>
          )}
          {discount > 0 && !product.isBestSeller && !product.isTrending && (
            <span className="bg-blumac-copperDark text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm pointer-events-auto">
              {discount}% OFF
            </span>
          )}
        </div>

        <button
          onClick={handleWishlistToggle}
          className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            inWish
              ? "bg-red-50 text-red-600 scale-110"
              : "bg-white/80 text-blumac-slate hover:text-red-500 hover:bg-white"
          }`}
          aria-label={inWish ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${inWish ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>

      {/* Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block w-full pt-[100%] bg-blumac-ivory/60 overflow-hidden"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          unoptimized={product.images[0]?.startsWith("/uploads/") || product.images[0]?.startsWith("/")}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-blumac-navy/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand & Subcategory */}
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="uppercase font-bold tracking-wider text-blumac-copper">
            {product.brand}
          </span>
          <span className="text-blumac-slate truncate max-w-[120px]">
            {product.subcategory}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/product/${product.slug}`}
          className="text-xs sm:text-sm font-semibold text-blumac-navy hover:text-blumac-copper transition-colors line-clamp-2 min-h-[2.5rem]"
        >
          {product.name}
        </Link>

        {/* Key ingredient highlight tag */}
        {product.keyIngredients[0] && (
          <p className="text-[11px] text-blumac-slate mt-1.5 truncate">
            ✨ {product.keyIngredients[0].name}
          </p>
        )}

        {/* Rating Stars */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold ml-1 text-blumac-navy">
              {product.rating}
            </span>
          </div>
          <span className="text-[11px] text-blumac-slate">
            ({product.reviewCount})
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-[0.5rem]" />

        {/* Pricing and Action */}
        <div className="pt-3 border-t border-blumac-beige/60 flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-blumac-navy">
                {formatCurrency(product.price)}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-blumac-slate line-through">
                  {formatCurrency(product.mrp)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-bold text-green-700 block">
                Save {discount}% ({formatCurrency(product.mrp - product.price)})
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={added}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              added
                ? "bg-green-600 text-white"
                : "bg-blumac-navy hover:bg-blumac-copper text-white"
            }`}
            aria-label="Add to cart"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
