"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { PRODUCTS, CATEGORIES, BRANDS, type Product } from "@/lib/products";
import { ProductCard } from "@/components/storefront/ProductCard";

interface ShopClientProps {
  initialProducts?: Product[];
}

export function ShopClient({ initialProducts }: ShopClientProps) {
  const allProducts = initialProducts && initialProducts.length > 0 ? initialProducts : PRODUCTS;
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialBrand = searchParams.get("brand") || "";
  const initialSort = searchParams.get("sort") || "featured";
  const initialFilter = searchParams.get("filter") || "";

  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSkinType, setSelectedSkinType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const skinTypes = [
    "All Skin Types",
    "Sensitive",
    "Acne-prone",
    "Dry",
    "Oily",
    "Combination",
  ];

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Search term
      if (initialSearch) {
        const query = initialSearch.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchBrand = product.brand.toLowerCase().includes(query);
        const matchCategory = product.category.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        if (!matchName && !matchBrand && !matchCategory && !matchDesc) return false;
      }

      // Special presets (e.g. bestsellers)
      if (initialFilter === "bestsellers" && !product.isBestSeller) {
        return false;
      }

      // Brand filter
      if (selectedBrand && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // Category filter
      if (
        selectedCategory &&
        product.categorySlug.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Skin type filter
      if (
        selectedSkinType &&
        !product.skinType.some((st) => st.toLowerCase() === selectedSkinType.toLowerCase())
      ) {
        return false;
      }

      // Price filter
      if (priceRange === "under-1000" && product.price >= 1000) return false;
      if (priceRange === "1000-1500" && (product.price < 1000 || product.price > 1500))
        return false;
      if (priceRange === "above-1500" && product.price <= 1500) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "trending") return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
      return 0; // default featured
    });
  }, [
    initialSearch,
    initialFilter,
    selectedBrand,
    selectedCategory,
    selectedSkinType,
    priceRange,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedBrand ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (selectedSkinType ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedBrand("");
    setSelectedCategory("");
    setSelectedSkinType("");
    setPriceRange("all");
    setSortBy("featured");
    router.push("/shop");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-blumac-slate mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="font-semibold text-blumac-navy">Shop Skincare</span>
          {initialSearch && (
            <>
              <span>/</span>
              <span className="text-blumac-copper">Results for "{initialSearch}"</span>
            </>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-blumac-navy">
              {initialSearch
                ? `Search: "${initialSearch}"`
                : selectedCategory
                ? CATEGORIES.find((c) => c.slug === selectedCategory)?.name || "Catalog"
                : "All Korean Skincare"}
            </h1>
            <p className="text-xs sm:text-sm text-blumac-slate mt-1">
              Showing {filteredProducts.length} authentic Korean skincare essentials
            </p>
          </div>

          {/* Controls: Sort and Mobile Filter Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-blumac-beige rounded-lg text-xs font-semibold text-blumac-navy shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-blumac-copper" />
              <span>Filters ({activeFiltersCount})</span>
            </button>

            <div className="flex items-center gap-2 bg-white border border-blumac-beige rounded-lg px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-blumac-slate" />
              <label htmlFor="sortSelect" className="font-medium text-blumac-slate">Sort By:</label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-blumac-navy focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Curations</option>
                <option value="trending">Trending in Korea</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pills */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-blumac-beige/60">
            <span className="text-xs font-semibold text-blumac-slate">Active filters:</span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blumac-navy text-white text-xs rounded-full"
              >
                <span>Category: {selectedCategory}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedBrand && (
              <button
                onClick={() => setSelectedBrand("")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blumac-copper text-white text-xs rounded-full"
              >
                <span>Brand: {selectedBrand}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedSkinType && (
              <button
                onClick={() => setSelectedSkinType("")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blumac-ivory text-blumac-navy border border-blumac-beige text-xs rounded-full"
              >
                <span>Skin: {selectedSkinType}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {priceRange !== "all" && (
              <button
                onClick={() => setPriceRange("all")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blumac-ivory text-blumac-navy border border-blumac-beige text-xs rounded-full"
              >
                <span>Price: {priceRange}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={resetAllFilters}
              className="text-xs font-bold text-red-600 hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6 bg-white p-6 rounded-xl border border-blumac-beige shadow-subtle h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-blumac-beige">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
              <Filter className="w-4 h-4 text-blumac-copper" />
              Filter By
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-blumac-copper hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blumac-slate mb-3">
              Category
            </h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left py-1 px-2 rounded-md transition-colors ${
                  selectedCategory === ""
                    ? "bg-blumac-navy text-white font-bold"
                    : "text-blumac-charcoal hover:bg-blumac-ivory"
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === c.slug ? "" : c.slug)
                  }
                  className={`w-full text-left py-1 px-2 rounded-md flex items-center justify-between transition-colors ${
                    selectedCategory === c.slug
                      ? "bg-blumac-navy text-white font-bold"
                      : "text-blumac-charcoal hover:bg-blumac-ivory"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-70">({c.productCount})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="pt-4 border-t border-blumac-beige/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blumac-slate mb-3">
              Brand
            </h4>
            <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
              {BRANDS.map((b) => (
                <button
                  key={b.slug}
                  onClick={() =>
                    setSelectedBrand(selectedBrand === b.name ? "" : b.name)
                  }
                  className={`w-full text-left py-1 px-2 rounded-md flex items-center justify-between transition-colors ${
                    selectedBrand.toLowerCase() === b.name.toLowerCase()
                      ? "bg-blumac-copper text-white font-bold"
                      : "text-blumac-charcoal hover:bg-blumac-ivory"
                  }`}
                >
                  <span>{b.name}</span>
                  <span className="text-[10px] opacity-70">({b.productCount})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Skin Type */}
          <div className="pt-4 border-t border-blumac-beige/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blumac-slate mb-3">
              Skin Type
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {skinTypes.map((st) => (
                <button
                  key={st}
                  onClick={() =>
                    setSelectedSkinType(selectedSkinType === st ? "" : st)
                  }
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    selectedSkinType === st
                      ? "bg-blumac-navy text-white border-blumac-navy font-semibold"
                      : "bg-blumac-ivory text-blumac-charcoal border-blumac-beige hover:border-blumac-copper"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-blumac-beige/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blumac-slate mb-3">
              Price Range
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { label: "All Prices", value: "all" },
                { label: "Under ₹1,000", value: "under-1000" },
                { label: "₹1,000 - ₹1,500", value: "1000-1500" },
                { label: "Above ₹1,500", value: "above-1500" },
              ].map((p) => (
                <label
                  key={p.value}
                  className="flex items-center gap-2 cursor-pointer text-blumac-charcoal"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    value={p.value}
                    checked={priceRange === p.value}
                    onChange={() => setPriceRange(p.value)}
                    className="accent-blumac-copper"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-blumac-beige p-12 text-center shadow-subtle">
              <div className="w-16 h-16 bg-blumac-ivory rounded-full flex items-center justify-center mx-auto mb-4 text-blumac-copper">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-blumac-navy">
                No matching Korean skincare products
              </h3>
              <p className="text-xs text-blumac-slate mt-1 max-w-sm mx-auto">
                We couldn't find any products matching your specific filters. Try resetting the filters or searching for terms like "snail", "rice", or "sunscreen".
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-6 px-6 py-2.5 bg-blumac-navy hover:bg-blumac-copper text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            onClick={() => setFilterDrawerOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-blumac-beige">
              <h3 className="text-sm font-bold uppercase text-blumac-navy">
                Filters
              </h3>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1 text-blumac-slate"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div>
              <h4 className="text-xs font-bold uppercase text-blumac-slate mb-2">Category</h4>
              <div className="space-y-1 text-xs">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === c.slug ? "" : c.slug);
                      setFilterDrawerOpen(false);
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded ${
                      selectedCategory === c.slug
                        ? "bg-blumac-navy text-white font-bold"
                        : "text-blumac-charcoal"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-blumac-beige flex gap-3">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-2 text-xs font-bold border border-blumac-beige rounded-lg"
              >
                Reset
              </button>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 py-2 text-xs font-bold bg-blumac-navy text-white rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
