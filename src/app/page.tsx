import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
  Droplets,
  Sun,
  Flame,
} from "lucide-react";
import { CATEGORIES, BRANDS } from "@/lib/products";
import { getStoreBestSellers, getStoreTrending } from "@/lib/catalog";
import { ProductCard } from "@/components/storefront/ProductCard";
import { BlumacLogo } from "@/components/common/BlumacLogo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const bestSellers = (await getStoreBestSellers()).slice(0, 4);
  const trendingProducts = (await getStoreTrending()).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-blumac-navyDark via-blumac-navy to-blumac-navyDark text-white pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative glow circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blumac-copper/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blumac-navyLight/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-blumac-copper/40 text-blumac-copperLight text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blumac-copper" />
              <span>Direct from Seoul, South Korea • 100% Genuine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif leading-tight text-white">
              The Pinnacle of <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blumac-ivory via-blumac-copperLight to-blumac-copper">
                Korean Skincare
              </span>{" "}
              in India
            </h1>

            <p className="text-sm sm:text-base text-blumac-beige max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Curated cult-favorite formulations scientifically proven to repair your skin barrier, calm inflammation, and unlock the coveted Korean glass skin luminosity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-3.5 bg-blumac-copper hover:bg-blumac-copperLight text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-copper/30 group"
              >
                <span>Shop Best Sellers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/shop?sort=trending"
                className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full backdrop-blur-md border border-white/20 transition-all flex items-center justify-center"
              >
                Trending in Seoul 🔥
              </Link>
            </div>

            {/* Micro Trust Points */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 text-center lg:text-left">
              <div>
                <p className="text-lg sm:text-2xl font-bold font-serif text-white">100%</p>
                <p className="text-[11px] text-blumac-beige">Authentic Import</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold font-serif text-white">₹999+</p>
                <p className="text-[11px] text-blumac-beige">Free All-India Shipping</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold font-serif text-white">4.9 ★</p>
                <p className="text-[11px] text-blumac-beige">Loved by 30k+ Indian Users</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-blumac-navy">
              <Image
                src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80"
                alt="BLUMAC Korean Skincare Editorial"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blumac-navyDark via-transparent to-transparent opacity-80" />

              {/* Floating verified badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-4 h-4 text-blumac-copper" />
                <span className="text-[11px] font-bold text-blumac-navy uppercase tracking-wider">
                  Verified Batch Codes
                </span>
              </div>

              {/* Hero bottom card highlight */}
              <div className="absolute bottom-6 inset-x-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-blumac-beige flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blumac-copper tracking-wider block">
                    Cult Favorite
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-blumac-navy">
                    Beauty of Joseon Relief Sun
                  </h4>
                  <p className="text-[11px] text-blumac-slate">
                    Rice + Probiotics SPF50+ PA++++
                  </p>
                </div>
                <Link
                  href="/product/beauty-of-joseon-relief-sun-rice-probiotics-spf50"
                  className="px-3.5 py-2 bg-blumac-navy text-white text-xs font-bold rounded-lg hover:bg-blumac-copper transition-colors shrink-0"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PILLARS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-card border border-blumac-beige p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blumac-ivory flex items-center justify-center shrink-0 border border-blumac-beige">
              <ShieldCheck className="w-6 h-6 text-blumac-copper" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blumac-navy">
                100% Genuine Imports
              </h4>
              <p className="text-[11px] text-blumac-slate mt-0.5">
                Direct from Seoul with Indian customs compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blumac-ivory flex items-center justify-center shrink-0 border border-blumac-beige">
              <Truck className="w-6 h-6 text-blumac-copper" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blumac-navy">
                Pan-India Delivery
              </h4>
              <p className="text-[11px] text-blumac-slate mt-0.5">
                Free shipping on orders above ₹999 across all PIN codes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blumac-ivory flex items-center justify-center shrink-0 border border-blumac-beige">
              <RotateCcw className="w-6 h-6 text-blumac-copper" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blumac-navy">
                Easy Return Policy
              </h4>
              <p className="text-[11px] text-blumac-slate mt-0.5">
                Hassle-free replacements for damaged or incorrect items.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blumac-ivory flex items-center justify-center shrink-0 border border-blumac-beige">
              <Sparkles className="w-6 h-6 text-blumac-copper" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blumac-navy">
                Curated for India
              </h4>
              <p className="text-[11px] text-blumac-slate mt-0.5">
                Specially selected for Indian humidity and skin concerns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper block mb-1">
              Curated Regimens
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
              Shop by Skincare Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-blumac-navy hover:text-blumac-copper flex items-center gap-1 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative bg-white rounded-xl overflow-hidden border border-blumac-beige p-3 text-center flex flex-col items-center shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 bg-blumac-ivory border-2 border-blumac-beige group-hover:border-blumac-copper transition-colors">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-blumac-navy group-hover:text-blumac-copper transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-blumac-slate mt-0.5">
                {cat.productCount}+ Products
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BEST SELLERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper block mb-1">
              Most Loved In India
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
              Cult Korean Skincare Best Sellers
            </h2>
          </div>
          <Link
            href="/shop?filter=bestsellers"
            className="text-xs font-bold uppercase tracking-wider text-blumac-navy hover:text-blumac-copper flex items-center gap-1 transition-colors"
          >
            <span>See All Best Sellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. THE KOREAN GLASS SKIN ROUTINE */}
      <section className="bg-blumac-navyDark text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-copperLight">
              The 4-Step Regimen
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-white">
              Unlock Korean Glass Skin
            </h2>
            <p className="text-xs sm:text-sm text-blumac-beige leading-relaxed">
              Glass skin is about building maximum hydration, strengthening your lipid barrier, and shielding against UV damage. Follow the proven routine:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm space-y-3 relative">
              <span className="text-2xl font-extrabold font-serif text-blumac-copper">
                01
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blumac-copper" />
                Double Cleanse
              </h3>
              <p className="text-xs text-blumac-beige leading-relaxed">
                Start with a gentle low pH cleanser to wash away sunscreen and pollutants without stripping your natural acid mantle.
              </p>
              <Link
                href="/category/cleansers"
                className="text-xs font-semibold text-blumac-copperLight hover:underline inline-flex items-center gap-1 pt-2"
              >
                <span>Shop Cleansers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm space-y-3 relative">
              <span className="text-2xl font-extrabold font-serif text-blumac-copper">
                02
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blumac-copper" />
                Balance & Prep
              </h3>
              <p className="text-xs text-blumac-beige leading-relaxed">
                Layer a soothing toner or milky rice essence to hydrate dermal layers and prepare your skin to absorb concentrated nutrients.
              </p>
              <Link
                href="/category/toners-essences"
                className="text-xs font-semibold text-blumac-copperLight hover:underline inline-flex items-center gap-1 pt-2"
              >
                <span>Shop Toners</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm space-y-3 relative">
              <span className="text-2xl font-extrabold font-serif text-blumac-copper">
                03
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-blumac-copper" />
                Target & Repair
              </h3>
              <p className="text-xs text-blumac-beige leading-relaxed">
                Apply high-potency Snail Mucin, Niacinamide, or 5D Hyaluronic Acid to fade blemishes and seal deep moisture.
              </p>
              <Link
                href="/category/serums-ampoules"
                className="text-xs font-semibold text-blumac-copperLight hover:underline inline-flex items-center gap-1 pt-2"
              >
                <span>Shop Serums</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm space-y-3 relative">
              <span className="text-2xl font-extrabold font-serif text-blumac-copper">
                04
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-blumac-copper" />
                Shield & Glow
              </h3>
              <p className="text-xs text-blumac-beige leading-relaxed">
                Never skip SPF50+ PA++++. Korean sunscreens hydrate like a light lotion with zero white cast under the Indian sun.
              </p>
              <Link
                href="/category/sunscreens"
                className="text-xs font-semibold text-blumac-copperLight hover:underline inline-flex items-center gap-1 pt-2"
              >
                <span>Shop Sunscreens</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED KOREAN BRANDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
            Direct Partnerships
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
            Authorized Korean Brands
          </h2>
          <p className="text-xs text-blumac-slate">
            Imported straight from South Korea with genuine batch verification.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/shop?brand=${encodeURIComponent(brand.name)}`}
              className="group p-5 bg-white rounded-xl border border-blumac-beige text-center flex flex-col items-center justify-center shadow-subtle hover:shadow-card hover:border-blumac-copper transition-all"
            >
              <h3 className="text-base font-extrabold text-blumac-navy font-serif group-hover:text-blumac-copper transition-colors">
                {brand.name}
              </h3>
              <p className="text-[10px] uppercase font-bold text-blumac-copper mt-1">
                {brand.origin}
              </p>
              <span className="text-[11px] text-blumac-slate mt-2 line-clamp-1 italic">
                "{brand.tagline}"
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper block mb-1">
              Fresh Restocks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
              Trending Right Now in Korea
            </h2>
          </div>
          <Link
            href="/shop?sort=trending"
            className="text-xs font-bold uppercase tracking-wider text-blumac-navy hover:text-blumac-copper flex items-center gap-1 transition-colors"
          >
            <span>Explore All Trending</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. PROMOTIONAL OFFER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blumac-navy via-blumac-navyLight to-blumac-navyDark rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden shadow-card border border-blumac-copper/30">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-blumac-copper text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Limited Launch Deal
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold font-serif text-white">
              Get 10% Off Your First Order <br />
              With Coupon Code: <span className="text-blumac-copperLight">SEOUL10</span>
            </h3>
            <p className="text-xs sm:text-sm text-blumac-beige leading-relaxed">
              Experience the genuine difference of freshly formulated, authentic Korean skincare delivered straight to your door across India with zero customs hassle.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/shop"
                className="px-6 py-3 bg-blumac-copper hover:bg-blumac-copperLight text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-md"
              >
                Claim 10% Discount
              </Link>
              <span className="text-xs text-blumac-beige">
                *Applicable on all brands with orders above ₹999
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. REAL CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blumac-copper">
            Customer Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
            Loved Across India
          </h2>
          <p className="text-xs text-blumac-slate">
            Real experiences from skincare enthusiasts in Mumbai, Delhi, Bangalore and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-blumac-beige shadow-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-blumac-charcoal leading-relaxed italic">
                "Finding authentic COSRX Snail Mucin in Mumbai with guaranteed batch codes used to be so stressful. BLUMAC delivered in 3 days in pristine packaging! My dehydrated skin has never felt softer."
              </p>
            </div>
            <div className="pt-4 border-t border-blumac-beige/60 mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blumac-navy">Pooja Sharma</p>
                <p className="text-[10px] text-blumac-slate">Mumbai, Maharashtra</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blumac-forest">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Buyer
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-blumac-beige shadow-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-blumac-charcoal leading-relaxed italic">
                "The Beauty of Joseon Relief Sun is truly a holy grail. Zero white cast under harsh Delhi sun and feels like a light moisturizer. Free shipping above ₹999 makes it the best deal online."
              </p>
            </div>
            <div className="pt-4 border-t border-blumac-beige/60 mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blumac-navy">Aarav Mehta</p>
                <p className="text-[10px] text-blumac-slate">New Delhi</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blumac-forest">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Buyer
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-blumac-beige shadow-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-blumac-charcoal leading-relaxed italic">
                "Anua Heartleaf 77 Toner calms my active redness in Bangalore's changing weather like magic. Coupon SEOUL10 worked seamlessly during checkout. BLUMAC is now my go-to store!"
              </p>
            </div>
            <div className="pt-4 border-t border-blumac-beige/60 mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blumac-navy">Sneha Nair</p>
                <p className="text-[10px] text-blumac-slate">Bengaluru, Karnataka</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blumac-forest">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Buyer
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
