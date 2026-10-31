"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  Truck,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Sparkles,
  ChevronDown,
  Check,
  CheckCircle2,
  MapPin,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Product, PRODUCTS } from "@/lib/products";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/storefront/ProductCard";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Accordion tabs state
  const [openTab, setOpenTab] = useState<string>("description");

  // Indian PIN code delivery checker state
  const [pinCode, setPinCode] = useState("");
  const [pinStatus, setPinStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
    estimate?: string;
  } | null>(null);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const discount = calculateDiscount(product.mrp, product.price);
  const inWish = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(
      {
        id: selectedVariant?.id || product.id,
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        brand: product.brand,
        price: selectedVariant?.price || product.price,
        mrp: selectedVariant?.mrp || product.mrp,
        image: product.images[0],
        size: selectedVariant?.size,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(
      {
        id: selectedVariant?.id || product.id,
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        brand: product.brand,
        price: selectedVariant?.price || product.price,
        mrp: selectedVariant?.mrp || product.mrp,
        image: product.images[0],
        size: selectedVariant?.size,
      },
      quantity
    );
    router.push("/checkout");
  };

  const checkPinServiceability = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinCode.trim();
    if (/^\d{6}$/.test(cleanPin)) {
      // Valid Indian 6-digit PIN code
      const isMetro = ["11", "40", "56", "60", "70", "50", "41"].some((prefix) =>
        cleanPin.startsWith(prefix)
      );
      setPinStatus({
        tested: true,
        valid: true,
        message: `Serviceable to PIN ${cleanPin}`,
        estimate: isMetro
          ? "Express Delivery in 2 - 3 business days • COD Available"
          : "Standard Delivery in 3 - 5 business days • COD Available",
      });
    } else {
      setPinStatus({
        tested: true,
        valid: false,
        message: "Please enter a valid 6-digit Indian PIN code.",
      });
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setReviewSubmitted(true);
    setReviewComment("");
    setReviewName("");
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-blumac-slate mb-8 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-blumac-navy">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-blumac-navy">
          Skincare
        </Link>
        <span>/</span>
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-blumac-navy"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="font-semibold text-blumac-navy truncate">
          {product.name}
        </span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Primary View */}
          <div className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden border border-blumac-beige shadow-card">
            <Image
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            {/* Authenticity Badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-blumac-beige">
              <ShieldCheck className="w-3.5 h-3.5 text-blumac-copper" />
              <span className="text-[10px] font-bold text-blumac-navy uppercase tracking-wider">
                100% Genuine Import
              </span>
            </div>
            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
                inWish
                  ? "bg-red-50 text-red-600"
                  : "bg-white/90 text-blumac-slate hover:text-red-500"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-4 h-4 ${inWish ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? "border-blumac-copper shadow-sm scale-105"
                      : "border-blumac-beige opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href={`/shop?brand=${encodeURIComponent(product.brand)}`}
                className="text-xs font-bold uppercase tracking-widest text-blumac-copper hover:underline"
              >
                {product.brand}
              </Link>
              <span className="text-blumac-beige">•</span>
              <span className="text-xs text-blumac-slate font-medium">
                SKU: {selectedVariant?.sku || "BLU-SKN-01"}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold font-serif text-blumac-navy mt-1.5 leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-amber-400"
                        : "text-blumac-beige"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-blumac-navy ml-1.5">
                  {product.rating} / 5.0
                </span>
              </div>
              <span className="text-xs text-blumac-slate">
                ({product.reviewCount} Verified Indian Reviews)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-white rounded-xl border border-blumac-beige shadow-subtle space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-blumac-navy">
                {formatCurrency(selectedVariant?.price || product.price)}
              </span>
              {(selectedVariant?.mrp || product.mrp) >
                (selectedVariant?.price || product.price) && (
                <span className="text-sm sm:text-base text-blumac-slate line-through">
                  {formatCurrency(selectedVariant?.mrp || product.mrp)}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-blumac-copper text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>
            <p className="text-[11px] text-blumac-slate">
              Inclusive of all taxes (GST 18%). Free Delivery on orders over ₹999.
            </p>
          </div>

          {/* Skin Type & Concerns Badges */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blumac-slate block">
              Ideal Skin Types & Target Concerns:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.skinType.map((st) => (
                <span
                  key={st}
                  className="px-2.5 py-1 bg-blumac-ivory border border-blumac-beige rounded-full text-[11px] font-semibold text-blumac-navy"
                >
                  {st}
                </span>
              ))}
              {product.concerns.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 bg-blumac-copper/10 border border-blumac-copper/30 rounded-full text-[11px] font-semibold text-blumac-copper"
                >
                  ✨ {c}
                </span>
              ))}
            </div>
          </div>

          {/* Size / Variant Picker */}
          {product.variants.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blumac-navy block">
                Select Size: <strong className="text-blumac-copper">{selectedVariant?.size}</strong>
              </span>
              <div className="flex gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                      selectedVariant?.id === v.id
                        ? "bg-blumac-navy text-white border-blumac-navy shadow-sm"
                        : "bg-white text-blumac-charcoal border-blumac-beige hover:border-blumac-copper"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Primary CTAs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-blumac-beige rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 text-blumac-navy hover:bg-blumac-ivory transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-2 text-xs font-bold text-blumac-navy min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2.5 text-blumac-navy hover:bg-blumac-ivory transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`flex-1 py-3.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-blumac-navy hover:bg-blumac-navyLight text-white"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-blumac-copperLight" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 bg-blumac-copper hover:bg-blumac-copperLight text-white rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shadow-md text-center"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Indian PIN Code Delivery Checker */}
          <div className="p-4 bg-white rounded-xl border border-blumac-beige shadow-subtle space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blumac-navy">
              <MapPin className="w-4 h-4 text-blumac-copper" />
              <span>Check Delivery in India</span>
            </div>
            <form onSubmit={checkPinServiceability} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit PIN code (e.g. 560001)"
                value={pinCode}
                maxLength={6}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                className="flex-1 bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold rounded-lg transition-colors"
              >
                Check
              </button>
            </form>
            {pinStatus && (
              <div
                className={`text-xs p-2 rounded-lg ${
                  pinStatus.valid
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <p className="font-semibold">{pinStatus.message}</p>
                {pinStatus.estimate && (
                  <p className="text-[11px] mt-0.5">{pinStatus.estimate}</p>
                )}
              </div>
            )}
            <div className="flex items-center gap-4 text-[11px] text-blumac-slate pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blumac-copper" /> Dispatches within 24 Hours
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-blumac-copper" /> Express Air Courier
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-blumac-copper" /> Easy Replacements
              </span>
            </div>
          </div>

          {/* Skincare Accordion Tabs */}
          <div className="border border-blumac-beige rounded-xl overflow-hidden bg-white divide-y divide-blumac-beige/60">
            {/* Description */}
            <div>
              <button
                onClick={() =>
                  setOpenTab(openTab === "description" ? "" : "description")
                }
                className="w-full p-4 text-left flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blumac-navy hover:bg-blumac-ivory/50"
              >
                <span>Product Overview</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openTab === "description" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openTab === "description" && (
                <div className="p-4 pt-0 text-xs text-blumac-charcoal leading-relaxed space-y-3">
                  <p>{product.description}</p>
                  <p className="font-semibold text-blumac-navy">
                    Category: {product.category} ({product.subcategory})
                  </p>
                </div>
              )}
            </div>

            {/* Key Ingredients */}
            <div>
              <button
                onClick={() =>
                  setOpenTab(openTab === "key-ingredients" ? "" : "key-ingredients")
                }
                className="w-full p-4 text-left flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blumac-navy hover:bg-blumac-ivory/50"
              >
                <span>Key Ingredients & Benefits</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openTab === "key-ingredients" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openTab === "key-ingredients" && (
                <div className="p-4 pt-0 space-y-2 text-xs">
                  {product.keyIngredients.map((ing, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-blumac-ivory rounded-lg border border-blumac-beige"
                    >
                      <strong className="text-blumac-copper block font-semibold">
                        {ing.name}
                      </strong>
                      <span className="text-blumac-charcoal text-[11px] mt-0.5 block">
                        {ing.benefit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Full INCI Ingredients */}
            <div>
              <button
                onClick={() =>
                  setOpenTab(openTab === "inci" ? "" : "inci")
                }
                className="w-full p-4 text-left flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blumac-navy hover:bg-blumac-ivory/50"
              >
                <span>Full Ingredients (INCI List)</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openTab === "inci" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openTab === "inci" && (
                <div className="p-4 pt-0 text-xs text-blumac-slate leading-relaxed font-mono text-[11px]">
                  <p>{product.fullIngredients}</p>
                </div>
              )}
            </div>

            {/* How to Use & Caution */}
            <div>
              <button
                onClick={() => setOpenTab(openTab === "usage" ? "" : "usage")}
                className="w-full p-4 text-left flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blumac-navy hover:bg-blumac-ivory/50"
              >
                <span>How to Use & Precautions</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openTab === "usage" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openTab === "usage" && (
                <div className="p-4 pt-0 space-y-3 text-xs text-blumac-charcoal leading-relaxed">
                  <div>
                    <h5 className="font-bold text-blumac-navy mb-1">Recommended Application:</h5>
                    <p>{product.howToUse}</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                    <strong>Patch Test Advice: </strong>
                    {product.cautions}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Form Section */}
      <section className="mt-16 pt-12 border-t border-blumac-beige">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
              Community Feedback
            </span>
            <h2 className="text-2xl font-extrabold font-serif text-blumac-navy">
              Customer Reviews ({product.reviewCount})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-blumac-navy">
              {product.rating}
            </span>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs text-blumac-slate">out of 5 stars</span>
          </div>
        </div>

        {/* Write a review box */}
        <div className="bg-white rounded-xl p-6 border border-blumac-beige shadow-subtle mb-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blumac-navy mb-3">
            Leave a Verified Customer Review
          </h3>
          {reviewSubmitted ? (
            <div className="p-4 bg-green-50 text-green-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>
                Thank you! Your review has been submitted for moderation and will appear shortly.
              </span>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-blumac-slate">Your Rating:</span>
                <div className="flex gap-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-blumac-beige"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Your Name (e.g. Priya K.)"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
                <input
                  type="text"
                  placeholder="Your City (e.g. Mumbai, Bengaluru)"
                  className="bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
                />
              </div>

              <textarea
                required
                rows={3}
                placeholder="Share your experience: How did it perform in your skincare routine? What did it do for your skin texture or barrier?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg p-3 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
              />

              <button
                type="submit"
                className="px-6 py-2.5 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-blumac-beige">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper block mb-1">
              Complete Your K-Beauty Regimen
            </span>
            <h2 className="text-2xl font-extrabold font-serif text-blumac-navy">
              Related Skincare Essentials
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
