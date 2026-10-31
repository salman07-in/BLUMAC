"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { BlumacLogo } from "@/components/common/BlumacLogo";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export function Header() {
  const router = useRouter();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navCategories = [
    { name: "Shop All", href: "/shop" },
    { name: "Cleansers", href: "/category/cleansers" },
    { name: "Toners & Essences", href: "/category/toners-essences" },
    { name: "Serums & Ampoules", href: "/category/serums-ampoules" },
    { name: "Moisturizers", href: "/category/moisturizers" },
    { name: "Sunscreens", href: "/category/sunscreens" },
    { name: "Top Brands", href: "/brands" },
    { name: "Offers", href: "/offers", highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blumac-beige shadow-subtle">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-blumac-navy hover:text-blumac-copper transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <BlumacLogo variant="image" width={160} height={50} />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search Korean skincare, snail mucin, sunscreen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-full py-2.5 pl-11 pr-4 text-sm text-blumac-charcoal placeholder-blumac-slate focus:outline-none focus:border-blumac-copper focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-blumac-slate absolute left-4 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* User Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-blumac-navy hover:text-blumac-copper transition-colors"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="relative p-2 text-blumac-navy hover:text-blumac-copper transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blumac-copper text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account / Login */}
            <Link
              href="/account"
              className="flex items-center gap-1.5 p-2 text-blumac-navy hover:text-blumac-copper transition-colors text-xs font-medium"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              <span className="hidden xl:inline">Account</span>
            </Link>



            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-blumac-navy hover:bg-blumac-navyLight text-white px-3.5 py-2 rounded-full transition-all shadow-sm group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-blumac-copperLight group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-wide">Cart</span>
              <span className="bg-blumac-copper text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[20px] text-center">
                {itemCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search Korean skincare..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-blumac-ivory border border-blumac-beige rounded-full py-2 pl-10 pr-4 text-sm text-blumac-charcoal focus:outline-none focus:border-blumac-copper focus:bg-white"
              />
              <Search className="w-4 h-4 text-blumac-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        )}

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center justify-between border-t border-blumac-beige/60 py-2.5">
          <div className="flex items-center space-x-6">
            {navCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`text-xs font-medium tracking-wider uppercase transition-colors py-1 relative ${
                  cat.highlight
                    ? "text-blumac-copper font-bold flex items-center gap-1"
                    : "text-blumac-navy hover:text-blumac-copper"
                }`}
              >
                {cat.highlight && <Sparkles className="w-3 h-3 text-blumac-copper" />}
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-blumac-copper">
            <Link
              href="/shop?sort=trending"
              className="hover:underline flex items-center gap-1 tracking-wider uppercase text-[11px]"
            >
              Trending in Seoul 🔥
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[81px] bg-white z-50 overflow-y-auto border-t border-blumac-beige p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-blumac-beige/60">
            <BlumacLogo variant="image" width={120} height={42} />
            <span className="text-[10px] font-bold tracking-widest text-blumac-copper uppercase bg-blumac-ivory px-2 py-1 rounded">
              Seoul Beauty
            </span>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-blumac-slate">
              Categories
            </p>
            <div className="flex flex-col space-y-2">
              {navCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 border-b border-blumac-ivory flex items-center justify-between ${
                    cat.highlight ? "text-blumac-copper font-bold" : "text-blumac-navy"
                  }`}
                >
                  <span>{cat.name}</span>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-blumac-slate" />
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-blumac-beige space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-blumac-slate">
              Customer Portal
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 bg-blumac-ivory rounded-lg text-xs font-semibold text-blumac-navy"
              >
                <User className="w-4 h-4 text-blumac-copper" />
                My Profile
              </Link>
              <Link
                href="/account/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 bg-blumac-ivory rounded-lg text-xs font-semibold text-blumac-navy"
              >
                <ShoppingBag className="w-4 h-4 text-blumac-copper" />
                Track Orders
              </Link>

              <Link
                href="/policies/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 bg-blumac-ivory rounded-lg text-xs font-semibold text-blumac-navy"
              >
                <Sparkles className="w-4 h-4 text-blumac-copper" />
                Support & FAQs
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
