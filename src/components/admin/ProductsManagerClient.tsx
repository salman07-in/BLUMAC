"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  Plus,
  Search,
  Download,
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  RefreshCw,
  Star,
  Flame,
  ExternalLink,
  Layers,
} from "lucide-react";
import { ProductBulkImportModal } from "./ProductBulkImportModal";

interface ProductsManagerClientProps {
  initialProducts: any[];
  brands: any[];
  categories: any[];
}

export function ProductsManagerClient({
  initialProducts,
  brands,
  categories,
}: ProductsManagerClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "BEST_SELLER" | "TRENDING" | "LOW_STOCK">("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [adjustingSku, setAdjustingSku] = useState<string | null>(null);

  // Success summary modal
  const [newlyCreatedProduct, setNewlyCreatedProduct] = useState<any | null>(null);

  // Short & Simplified Product Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [size, setSize] = useState("100ml");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("30");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live calculations
  const numPrice = parseFloat(price) || 0;
  const numMrp = parseFloat(mrp) || 0;
  const discountPercent =
    numMrp > numPrice && numMrp > 0
      ? Math.round(((numMrp - numPrice) / numMrp) * 100)
      : 0;

  // Stock count
  const lowStockCount = products.filter((p) => {
    const qty = p.variants?.[0]?.inventory?.quantityOnHand ?? 25;
    return qty <= 10;
  }).length;

  // Filtered Products
  const filtered = products.filter((p) => {
    const qty = p.variants?.[0]?.inventory?.quantityOnHand ?? 25;
    if (filterMode === "LOW_STOCK" && qty > 10) return false;
    if (filterMode === "BEST_SELLER" && !p.isBestSeller) return false;
    if (filterMode === "TRENDING" && !p.isTrending) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand?.name?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q) ||
      (p.variants?.[0]?.sku && p.variants[0].sku.toLowerCase().includes(q))
    );
  });

  // Handle Image File Upload (Computer / Drag & Drop)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMsg("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setImages((prev) => [...prev, data.url]);
        } else {
          setErrorMsg(data.error || "Failed to upload image");
        }
      }
    } catch {
      setErrorMsg("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add Image via URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle Badge from Table (BestSeller / Trending)
  const handleToggleBadge = async (productId: string, field: "isBestSeller" | "isTrending") => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newValue = !product[field];
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, [field]: newValue } : p))
    );

    try {
      await fetch(`/api/admin/products/${productId}/toggle-badge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value: newValue }),
      });
    } catch {
      // rollback on error
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, [field]: !newValue } : p))
      );
    }
  };

  // Quick Inline Stock Adjust
  const handleAdjustStock = async (skuCode: string, delta: number) => {
    setAdjustingSku(skuCode);
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: skuCode,
          quantityDelta: delta,
          reason: delta > 0 ? "ADMIN_QUICK_RESTOCK" : "ADMIN_MANUAL_DEDUCTION",
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => {
            const v = p.variants?.[0];
            if (v && v.sku === skuCode) {
              const currentQty = v.inventory?.quantityOnHand ?? 25;
              const newQty = Math.max(0, currentQty + delta);
              return {
                ...p,
                variants: [
                  {
                    ...v,
                    inventory: {
                      ...(v.inventory || {}),
                      quantityOnHand: newQty,
                    },
                  },
                  ...(p.variants?.slice(1) || []),
                ],
              };
            }
            return p;
          })
        );
      }
    } catch {
      // ignore
    } finally {
      setAdjustingSku(null);
    }
  };

  // Submit Short & Easy Product Form
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter product name.");
      return;
    }
    if (!price || !mrp) {
      setErrorMsg("Please enter both Selling Price and MRP.");
      return;
    }

    setSubmitting(true);

    try {
      const autoSku = `BLU-${name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "PRD"}-${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categoryId,
          size: size.trim() || "Standard",
          price: parseFloat(price),
          mrp: parseFloat(mrp),
          sku: autoSku,
          stock: parseInt(stock) || 30,
          images: images.length > 0 ? images : undefined,
          isBestSeller,
          isTrending,
          isNewArrival: true,
          shortDescription: description.trim() || `${name.trim()} - 100% authentic Korean skincare.`,
          description: description.trim() || `${name.trim()} delivers deep hydration, nourishment, and glass skin radiance.`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.product) {
        setProducts([data.product, ...products]);
        setIsAddModalOpen(false);
        setNewlyCreatedProduct(data.product);

        // Reset form
        setName("");
        setPrice("");
        setMrp("");
        setSize("100ml");
        setStock("30");
        setDescription("");
        setImages([]);
        setIsBestSeller(false);
        setIsTrending(false);
      } else {
        setErrorMsg(data.error || "Failed to create product");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong creating product");
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = "Name,Brand,Category,Price,MRP,Stock,BestSeller,Trending,Status\n";
    const rows = products
      .map(
        (p) =>
          `"${p.name}","${p.brand?.name || ""}","${p.category?.name || ""}",${
            p.price
          },${p.mrp},${p.variants?.[0]?.inventory?.quantityOnHand ?? 25},${
            p.isBestSeller ? "YES" : "NO"
          },${p.isTrending ? "YES" : "NO"},"${p.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blumac-catalog-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Navigation Filters */}
      <div className="bg-white p-4 rounded-xl border border-blumac-beige shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by title, brand, SKU code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg py-2 pl-9 pr-4 text-xs text-blumac-navy focus:outline-none focus:border-blumac-copper"
            />
            <Search className="w-4 h-4 text-blumac-slate absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterMode === "ALL"
                  ? "bg-blumac-navy text-white shadow-sm"
                  : "bg-blumac-ivory text-blumac-slate hover:bg-blumac-beige"
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilterMode("BEST_SELLER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                filterMode === "BEST_SELLER"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Best Sellers ({products.filter((p) => p.isBestSeller).length})</span>
            </button>
            <button
              onClick={() => setFilterMode("TRENDING")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                filterMode === "TRENDING"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
              }`}
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>Trending in Seoul ({products.filter((p) => p.isTrending).length})</span>
            </button>
            <button
              onClick={() => setFilterMode("LOW_STOCK")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterMode === "LOW_STOCK"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-blumac-ivory text-blumac-slate hover:bg-blumac-beige"
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
            <span>Import WhatsApp / CSV</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blumac-copper" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products & Inventory Table */}
      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B182D] text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">Product & SKU</th>
                <th className="py-3.5 px-4 font-bold">Category & Size</th>
                <th className="py-3.5 px-4 font-bold">Homepage Badges</th>
                <th className="py-3.5 px-4 font-bold">Pricing & Discount</th>
                <th className="py-3.5 px-4 font-bold">Stock Units</th>
                <th className="py-3.5 px-4 font-bold">Quick Restock</th>
                <th className="py-3.5 px-4 font-bold text-right">Storefront PDP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blumac-beige">
              {filtered.map((product) => {
                let imgList: string[] = [];
                try {
                  imgList = JSON.parse(product.images || "[]");
                } catch {
                  imgList = [product.images];
                }
                const firstImg =
                  imgList[0] ||
                  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80";
                const variant = product.variants?.[0];
                const stockQty = variant?.inventory?.quantityOnHand ?? 25;
                const skuCode = variant?.sku || "SKU-N/A";
                const discount = Math.max(
                  0,
                  Math.round(((product.mrp - product.price) / product.mrp) * 100)
                );

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-blumac-ivory/40 transition-colors"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-blumac-ivory rounded-lg overflow-hidden shrink-0 border border-blumac-beige">
                        <Image
                          src={firstImg}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-blumac-navy truncate">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-blumac-slate font-mono mt-0.5">
                          SKU: <span className="font-bold text-blumac-navy">{skuCode}</span>
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-blumac-copper uppercase text-[11px] block">
                        {product.category?.name || "Skincare"}
                      </span>
                      <span className="text-blumac-slate text-[11px]">
                        Size: {product.variants?.[0]?.size || "100ml"}
                      </span>
                    </td>

                    {/* Homepage Badges & Quick Toggles */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Best Seller Toggle */}
                        <button
                          onClick={() => handleToggleBadge(product.id, "isBestSeller")}
                          title={
                            product.isBestSeller
                              ? "Click to remove from Homepage Best Sellers"
                              : "Click to feature in Homepage Best Sellers"
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                            product.isBestSeller
                              ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
                              : "bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <Star className={`w-3 h-3 ${product.isBestSeller ? "fill-amber-500 text-amber-600" : ""}`} />
                          <span>Best Seller</span>
                        </button>

                        {/* Trending Toggle */}
                        <button
                          onClick={() => handleToggleBadge(product.id, "isTrending")}
                          title={
                            product.isTrending
                              ? "Click to remove from Homepage Trending"
                              : "Click to feature in Homepage Trending"
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                            product.isTrending
                              ? "bg-rose-100 text-rose-900 border border-rose-300 shadow-xs"
                              : "bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <Flame className={`w-3 h-3 ${product.isTrending ? "fill-rose-500 text-rose-600" : ""}`} />
                          <span>Trending</span>
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-extrabold text-blumac-navy text-sm block">
                        {formatCurrency(product.price)}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                        <span className="text-blumac-slate line-through">
                          {formatCurrency(product.mrp)}
                        </span>
                        {discount > 0 && (
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-bold rounded">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                            stockQty <= 10
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {stockQty} units
                        </span>
                      </div>
                      <span className="text-[10px] text-blumac-slate block mt-0.5">
                        {stockQty <= 10 ? "⚠️ Critical low" : "✓ In stock"}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          title="Deduct 1 unit"
                          disabled={adjustingSku === skuCode || stockQty <= 0}
                          onClick={() => handleAdjustStock(skuCode, -1)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold text-xs disabled:opacity-40 transition-colors"
                        >
                          -1
                        </button>
                        <button
                          title="Quick restock 5 units"
                          disabled={adjustingSku === skuCode}
                          onClick={() => handleAdjustStock(skuCode, 5)}
                          className="px-2.5 py-1 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded font-bold text-xs disabled:opacity-40 transition-colors"
                        >
                          +5
                        </button>
                        <button
                          title="Bulk restock 20 units"
                          disabled={adjustingSku === skuCode}
                          onClick={() => handleAdjustStock(skuCode, 20)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-bold text-xs disabled:opacity-40 transition-colors"
                        >
                          +20
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-blumac-copper hover:text-blumac-navy font-bold text-[11px] underline"
                      >
                        <span>Preview</span>
                        <span>↗</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ⚡ SHORT, SIMPLE & SMOOTH PRODUCT ADD MODAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-blumac-beige max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-blumac-beige shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blumac-navy text-blumac-copperLight rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-serif text-blumac-navy">
                    Add New Product
                  </h2>
                  <p className="text-[11px] text-blumac-slate">
                    Simple & quick: Name, Size, Category, Price & Photo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-blumac-ivory text-blumac-slate hover:text-blumac-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Single Short Form */}
            <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto py-3 space-y-4 text-xs">
              {/* 1. Product Name */}
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Snail Mucin 96 Essence"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold focus:outline-none focus:border-blumac-copper"
                />
              </div>

              {/* 2. Category & Size (Side by Side) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Size / Volume *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100ml / 50g"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                  />
                </div>
              </div>

              {/* 3. Pricing & Stock (3 Columns) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1199"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1450"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="30"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                  />
                </div>
              </div>

              {/* Discount Indicator if MRP > Price */}
              {discountPercent > 0 && (
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-bold flex items-center justify-between">
                  <span>Customer Discount:</span>
                  <span>{discountPercent}% OFF</span>
                </div>
              )}

              {/* 4. Product Photo Upload / URL */}
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Product Photo (Upload or Paste Link)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3 py-2 bg-blumac-ivory hover:bg-blumac-beige border border-blumac-beige rounded-lg font-bold text-blumac-navy flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <UploadCloud className="w-4 h-4 text-blumac-copper" />
                    <span>{uploadingImage ? "Uploading..." : "Upload from PC"}</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <input
                    type="url"
                    placeholder="Or paste image link..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-1.5 text-blumac-navy text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-blumac-navy text-white rounded-lg font-bold text-xs shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {/* Uploaded Preview */}
                {images.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-14 h-14 rounded-lg overflow-hidden border border-blumac-beige shrink-0 group"
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Product Description */}
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short details about the product and skincare benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg p-2.5 text-blumac-navy text-xs"
                />
              </div>

              {/* 6. Quick Homepage Badges (2 Simple Toggles) */}
              <div className="p-3 bg-blumac-ivory border border-blumac-beige rounded-xl flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                  <span className="font-bold text-blumac-navy text-[11px] flex items-center gap-1">
                    👑 Add to Best Sellers
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                  />
                  <span className="font-bold text-blumac-navy text-[11px] flex items-center gap-1">
                    🔥 Add to Trending
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 border-t border-blumac-beige flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-blumac-beige rounded-lg font-bold text-blumac-slate hover:bg-blumac-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Publish Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🎉 POST-CREATION SUCCESS CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {newlyCreatedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-blumac-beige text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold font-serif text-blumac-navy">
                Product Published!
              </h3>
              <p className="text-xs text-blumac-slate">
                <strong>{newlyCreatedProduct.name}</strong> is now live on the store.
              </p>
            </div>

            {/* Placement Breakdown */}
            <div className="p-3 bg-blumac-ivory border border-blumac-beige rounded-xl space-y-2 text-xs text-left">
              <p className="font-bold text-blumac-navy text-[10px] uppercase tracking-wider">
                Live Storefront Placements:
              </p>
              {newlyCreatedProduct.isBestSeller && (
                <div className="flex items-center gap-1.5 text-amber-900 text-[11px]">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600 shrink-0" />
                  <span>Homepage <strong>Best Sellers</strong> section</span>
                </div>
              )}
              {newlyCreatedProduct.isTrending && (
                <div className="flex items-center gap-1.5 text-rose-900 text-[11px]">
                  <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-600 shrink-0" />
                  <span>Homepage <strong>Trending in Seoul</strong> section</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-blumac-navy text-[11px]">
                <Layers className="w-3.5 h-3.5 text-blumac-copper shrink-0" />
                <span>
                  Category: <strong>{newlyCreatedProduct.category?.name || "Category Page"}</strong>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Link
                href={`/product/${newlyCreatedProduct.slug}`}
                target="_blank"
                className="flex-1 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
              >
                <span>View on Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setNewlyCreatedProduct(null)}
                className="px-4 py-2 border border-blumac-beige rounded-lg text-xs font-bold text-blumac-slate hover:bg-blumac-ivory"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🚀 WHATSAPP & BULK CSV PRODUCT IMPORT MODAL */}
      {/* ========================================================= */}
      <ProductBulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        categories={categories}
        brands={brands}
        onImportSuccess={(newProducts) => {
          setProducts((prev) => [...newProducts, ...prev]);
        }}
      />
    </div>
  );
}
