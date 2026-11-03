"use client";

import React, { useState, useRef, useMemo } from "react";
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
  Edit,
  Copy,
  Archive,
  RotateCcw,
  MoreVertical,
  Eye,
  Sliders,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
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
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<
    "ALL" | "ACTIVE" | "ARCHIVED" | "BEST_SELLER" | "TRENDING" | "LOW_STOCK"
  >("ALL");
  const [sortBy, setSortBy] = useState<
    "NEWEST" | "NAME_ASC" | "PRICE_ASC" | "PRICE_DESC" | "STOCK_ASC"
  >("NEWEST");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<string>("");
  const [bulkActionLoading, setBulkActionLoading] = useState<boolean>(false);

  // Modals & Action States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const [newlyCreatedProduct, setNewlyCreatedProduct] = useState<any | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Edit Product Tabs
  const [editTab, setEditTab] = useState<
    "general" | "pricing" | "images" | "formulation" | "variants" | "seo"
  >("general");

  // Add Product Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [brandId, setBrandId] = useState(brands[0]?.id || "");
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
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastNotification({ type, message });
    setTimeout(() => setToastNotification(null), 5000);
  };

  // Helper for parsing image array safely
  const getProductImageList = (p: any): string[] => {
    try {
      const parsed = JSON.parse(p.images || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      if (typeof p.images === "string" && p.images.startsWith("http")) {
        return [p.images];
      }
    }
    return [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    ];
  };

  // Counts
  const counts = useMemo(() => {
    return {
      ALL: products.length,
      ACTIVE: products.filter((p) => p.status === "ACTIVE").length,
      ARCHIVED: products.filter((p) => p.status === "ARCHIVED").length,
      BEST_SELLER: products.filter((p) => p.isBestSeller && p.status === "ACTIVE").length,
      TRENDING: products.filter((p) => p.isTrending && p.status === "ACTIVE").length,
      LOW_STOCK: products.filter((p) => {
        const qty = p.variants?.[0]?.inventory?.quantityOnHand ?? 25;
        return qty <= 10 && p.status === "ACTIVE";
      }).length,
    };
  }, [products]);

  // Filtered & Sorted Products
  const processedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const qty = p.variants?.[0]?.inventory?.quantityOnHand ?? 25;
      if (filterMode === "ACTIVE" && p.status !== "ACTIVE") return false;
      if (filterMode === "ARCHIVED" && p.status !== "ARCHIVED") return false;
      if (filterMode === "LOW_STOCK" && (qty > 10 || p.status !== "ACTIVE")) return false;
      if (filterMode === "BEST_SELLER" && (!p.isBestSeller || p.status !== "ACTIVE")) return false;
      if (filterMode === "TRENDING" && (!p.isTrending || p.status !== "ACTIVE")) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand?.name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        (p.variants?.[0]?.sku && p.variants[0].sku.toLowerCase().includes(q))
      );
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "NAME_ASC":
          return a.name.localeCompare(b.name);
        case "PRICE_ASC":
          return a.price - b.price;
        case "PRICE_DESC":
          return b.price - a.price;
        case "STOCK_ASC": {
          const qtyA = a.variants?.[0]?.inventory?.quantityOnHand ?? 0;
          const qtyB = b.variants?.[0]?.inventory?.quantityOnHand ?? 0;
          return qtyA - qtyB;
        }
        case "NEWEST":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [products, search, filterMode, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(processedProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedProducts.slice(start, start + pageSize);
  }, [processedProducts, currentPage, pageSize]);

  // Checkbox Selection
  const allCurrentSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedIds.includes(p.id));

  const toggleSelectAllCurrent = () => {
    if (allCurrentSelected) {
      const currentIds = paginatedProducts.map((p) => p.id);
      setSelectedIds(selectedIds.filter((id) => !currentIds.includes(id)));
    } else {
      const newIds = Array.from(
        new Set([...selectedIds, ...paginatedProducts.map((p) => p.id)])
      );
      setSelectedIds(newIds);
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- ACTIONS ---

  // 1. Toggle Archive / Restore
  const handleToggleArchive = async (product: any) => {
    const newStatus = product.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
    const actionLabel = newStatus === "ACTIVE" ? "Restored" : "Archived";

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
        );
        showToast("success", `Product "${product.name}" has been ${actionLabel.toLowerCase()}.`);
      } else {
        const err = await res.json();
        showToast("error", err.error || "Action failed");
      }
    } catch {
      showToast("error", "Network error updating status");
    } finally {
      setActiveMenuId(null);
    }
  };

  // 2. Duplicate Product
  const handleDuplicateProduct = async (productId: string) => {
    try {
      const res = await fetch("/api/admin/products/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (res.ok && data.product) {
        setProducts((prev) => [data.product, ...prev]);
        showToast("success", data.message || "Product duplicated successfully!");
        // Open edit modal directly for the duplicated product
        openEditModal(data.product);
      } else {
        showToast("error", data.error || "Failed to duplicate product");
      }
    } catch {
      showToast("error", "Error duplicating product");
    } finally {
      setActiveMenuId(null);
    }
  };

  // 3. Delete Product (Safe Delete with Historical Orders Check)
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    const target = deletingProduct;

    try {
      const res = await fetch(`/api/admin/products/${target.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        if (data.archivedInstead) {
          // Associated with orders -> Soft archived
          setProducts((prev) =>
            prev.map((p) =>
              p.id === target.id ? { ...p, status: "ARCHIVED", inStock: false } : p
            )
          );
          showToast("info", data.message);
        } else {
          // Permanently deleted
          setProducts((prev) => prev.filter((p) => p.id !== target.id));
          showToast("success", data.message);
        }
      } else {
        showToast("error", data.error || "Failed to delete product");
      }
    } catch {
      showToast("error", "Error deleting product");
    } finally {
      setDeletingProduct(null);
    }
  };

  // 4. Bulk Actions
  const handleBulkAction = async (action: "ARCHIVE" | "ACTIVATE" | "DELETE" | "UPDATE_CATEGORY") => {
    if (selectedIds.length === 0) return;
    if (action === "DELETE") {
      if (
        !confirm(
          `Are you sure you want to delete ${selectedIds.length} selected products? Products with historical customer orders will be safely archived to protect order records.`
        )
      ) {
        return;
      }
    }

    setBulkActionLoading(true);

    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: selectedIds,
          action,
          categoryId: action === "UPDATE_CATEGORY" ? bulkCategoryTarget : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("success", data.message);

        // Update local state accordingly
        if (action === "ARCHIVE") {
          setProducts((prev) =>
            prev.map((p) =>
              selectedIds.includes(p.id) ? { ...p, status: "ARCHIVED", inStock: false } : p
            )
          );
        } else if (action === "ACTIVATE") {
          setProducts((prev) =>
            prev.map((p) =>
              selectedIds.includes(p.id) ? { ...p, status: "ACTIVE", inStock: true } : p
            )
          );
        } else if (action === "DELETE") {
          // Refresh listing from server
          const refreshRes = await fetch("/api/admin/products");
          if (refreshRes.ok) {
            const refreshed = await refreshRes.json();
            setProducts(refreshed);
          }
        } else if (action === "UPDATE_CATEGORY") {
          const catObj = categories.find((c) => c.id === bulkCategoryTarget);
          setProducts((prev) =>
            prev.map((p) =>
              selectedIds.includes(p.id)
                ? { ...p, categoryId: bulkCategoryTarget, category: catObj || p.category }
                : p
            )
          );
        }

        setSelectedIds([]);
      } else {
        showToast("error", data.error || "Bulk action failed");
      }
    } catch {
      showToast("error", "Error processing bulk action");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // 5. Open Edit Modal & Prep State
  const openEditModal = (product: any) => {
    const rawImages = getProductImageList(product);
    let skinTypeArr: string[] = [];
    try {
      skinTypeArr = JSON.parse(product.skinType || "[]");
    } catch {
      skinTypeArr = ["All Skin Types"];
    }

    let concernsArr: string[] = [];
    try {
      concernsArr = JSON.parse(product.concerns || "[]");
    } catch {
      concernsArr = ["Hydration"];
    }

    let keyIngArr: any[] = [];
    try {
      keyIngArr = JSON.parse(product.keyIngredients || "[]");
    } catch {
      keyIngArr = [];
    }

    setEditingProduct({
      ...product,
      imagesList: rawImages,
      skinTypeArr,
      concernsArr,
      keyIngArr,
      stockValue: product.variants?.[0]?.inventory?.quantityOnHand ?? 25,
      skuValue: product.variants?.[0]?.sku || "",
      sizeValue: product.variants?.[0]?.size || "100ml",
    });
    setEditTab("general");
    setActiveMenuId(null);
  };

  // 6. Save Edited Product
  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          slug: editingProduct.slug,
          brandId: editingProduct.brandId,
          categoryId: editingProduct.categoryId,
          subcategory: editingProduct.subcategory,
          price: parseFloat(editingProduct.price),
          mrp: parseFloat(editingProduct.mrp),
          size: editingProduct.sizeValue,
          sku: editingProduct.skuValue,
          stock: parseInt(editingProduct.stockValue),
          shortDescription: editingProduct.shortDescription,
          description: editingProduct.description,
          images: editingProduct.imagesList,
          skinType: editingProduct.skinTypeArr,
          concerns: editingProduct.concernsArr,
          keyIngredients: editingProduct.keyIngArr,
          fullIngredients: editingProduct.fullIngredients,
          howToUse: editingProduct.howToUse,
          cautions: editingProduct.cautions,
          status: editingProduct.status,
          isBestSeller: editingProduct.isBestSeller,
          isTrending: editingProduct.isTrending,
          isNewArrival: editingProduct.isNewArrival,
          inStock: editingProduct.inStock,
        }),
      });

      const data = await res.json();
      if (res.ok && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === data.product.id ? data.product : p))
        );
        showToast("success", `Product "${data.product.name}" updated successfully!`);
        setEditingProduct(null);
      } else {
        showToast("error", data.error || "Failed to update product");
      }
    } catch {
      showToast("error", "Error saving product edits");
    }
  };

  // 7. Image Upload for Edit Modal
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

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
          setEditingProduct((prev: any) => ({
            ...prev,
            imagesList: [...prev.imagesList, data.url],
          }));
        }
      }
    } catch {
      showToast("error", "Failed to upload image");
    } finally {
      if (editFileInputRef.current) editFileInputRef.current.value = "";
    }
  };

  // Add Image via URL (Edit Modal)
  const [editImageUrlInput, setEditImageUrlInput] = useState("");
  const handleAddEditImageUrl = () => {
    if (!editImageUrlInput.trim() || !editingProduct) return;
    setEditingProduct((prev: any) => ({
      ...prev,
      imagesList: [...prev.imagesList, editImageUrlInput.trim()],
    }));
    setEditImageUrlInput("");
  };

  // Set Main Image
  const handleSetMainImage = (index: number) => {
    if (!editingProduct) return;
    const current = [...editingProduct.imagesList];
    const [selected] = current.splice(index, 1);
    current.unshift(selected);
    setEditingProduct({ ...editingProduct, imagesList: current });
  };

  // Remove Image from Edit
  const handleRemoveEditImage = (index: number) => {
    if (!editingProduct) return;
    const current = editingProduct.imagesList.filter((_: any, i: number) => i !== index);
    setEditingProduct({ ...editingProduct, imagesList: current });
  };

  // Handle Create New Product (Add Modal)
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
          brandId: brandId || undefined,
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

        // Reset
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

  // Export Selected / All CSV
  const exportCSV = (selectedOnly = false) => {
    const listToExport =
      selectedOnly && selectedIds.length > 0
        ? products.filter((p) => selectedIds.includes(p.id))
        : processedProducts;

    const headers = "Name,Brand,Category,SKU,Price,MRP,Stock,Status,BestSeller,Trending\n";
    const rows = listToExport
      .map(
        (p) =>
          `"${(p.name || "").replace(/"/g, '""')}","${(p.brand?.name || "").replace(/"/g, '""')}","${(p.category?.name || "").replace(/"/g, '""')}","${p.variants?.[0]?.sku || ""}",${p.price},${p.mrp},${p.variants?.[0]?.inventory?.quantityOnHand ?? 25},"${p.status}","${p.isBestSeller ? "YES" : "NO"}","${p.isTrending ? "YES" : "NO"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blumac-products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {toastNotification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between shadow-md transition-all text-xs font-semibold ${
            toastNotification.type === "success"
              ? "bg-green-50 border-green-200 text-green-900"
              : toastNotification.type === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastNotification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{toastNotification.message}</span>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="p-1 hover:bg-black/5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Filter Tabs (Status Badges) */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-blumac-beige text-xs font-bold">
        {[
          { id: "ALL", label: "All Catalog", count: counts.ALL },
          { id: "ACTIVE", label: "Active Live", count: counts.ACTIVE },
          { id: "ARCHIVED", label: "Archived", count: counts.ARCHIVED },
          { id: "BEST_SELLER", label: "Best Sellers", count: counts.BEST_SELLER },
          { id: "TRENDING", label: "Trending in Seoul", count: counts.TRENDING },
          { id: "LOW_STOCK", label: "Low Stock Alert", count: counts.LOW_STOCK },
        ].map((tab) => {
          const isActive = filterMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setFilterMode(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-blumac-navy text-white shadow-sm"
                  : "bg-white text-blumac-slate hover:bg-blumac-ivory border border-blumac-beige"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? "bg-blumac-copper text-white"
                    : "bg-blumac-ivory text-blumac-navy"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search, Sort, Page Size, and Top Buttons */}
      <div className="bg-white p-4 rounded-xl border border-blumac-beige shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search product, brand, SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg py-2 pl-9 pr-4 text-blumac-navy focus:outline-none focus:border-blumac-copper"
            />
            <Search className="w-4 h-4 text-blumac-slate absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-blumac-slate">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-blumac-ivory border border-blumac-beige rounded-lg py-1.5 px-2.5 text-blumac-navy font-semibold cursor-pointer"
            >
              <option value="NEWEST">Newest Added</option>
              <option value="NAME_ASC">Name (A → Z)</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="STOCK_ASC">Stock: Low to High</option>
            </select>
          </div>

          {/* Page Size */}
          <div className="flex items-center gap-1.5 text-blumac-slate">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-blumac-ivory border border-blumac-beige rounded-lg py-1.5 px-2 text-blumac-navy font-semibold cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={() => exportCSV(false)}
            className="px-3 py-2 bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blumac-copper" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Floating / Sticky Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-blumac-navy text-white p-3 rounded-xl shadow-lg border border-blumac-copper flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blumac-copper animate-pulse" />
            <span className="font-bold">
              {selectedIds.length} product(s) selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Category Change */}
            <div className="flex items-center gap-1">
              <select
                value={bulkCategoryTarget}
                onChange={(e) => setBulkCategoryTarget(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-xs"
              >
                <option value="" className="text-black">Change Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="text-black">
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                disabled={!bulkCategoryTarget || bulkActionLoading}
                onClick={() => handleBulkAction("UPDATE_CATEGORY")}
                className="px-2.5 py-1 bg-blumac-copper text-white rounded font-bold hover:bg-blumac-copperLight disabled:opacity-40"
              >
                Apply
              </button>
            </div>

            {/* Bulk Archive */}
            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction("ARCHIVE")}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded font-bold transition-colors flex items-center gap-1"
            >
              <Archive className="w-3 h-3" />
              <span>Archive</span>
            </button>

            {/* Bulk Activate */}
            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction("ACTIVATE")}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded font-bold transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Activate</span>
            </button>

            {/* Export Selected to CSV */}
            <button
              onClick={() => exportCSV(true)}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded font-bold transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Export Selected</span>
            </button>

            {/* Bulk Delete */}
            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction("DELETE")}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 rounded font-bold transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-white/70 hover:text-white underline ml-1"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Products Table */}
      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B182D] text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={toggleSelectAllCurrent}
                    className="w-3.5 h-3.5 rounded text-blumac-copper cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 font-bold">Product & SKU</th>
                <th className="py-3.5 px-3 font-bold">Category & Brand</th>
                <th className="py-3.5 px-3 font-bold">Status</th>
                <th className="py-3.5 px-3 font-bold">Pricing & Margin</th>
                <th className="py-3.5 px-3 font-bold">Stock</th>
                <th className="py-3.5 px-3 font-bold">Badges</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions Menu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blumac-beige">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-blumac-slate">
                    <Package className="w-8 h-8 text-blumac-copper/40 mx-auto mb-2" />
                    <p className="font-semibold">No products found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const imgList = getProductImageList(product);
                  const firstImg = imgList[0];
                  const variant = product.variants?.[0];
                  const stockQty = variant?.inventory?.quantityOnHand ?? 25;
                  const skuCode = variant?.sku || "SKU-N/A";
                  const discount = Math.max(
                    0,
                    Math.round(((product.mrp - product.price) / product.mrp) * 100)
                  );
                  const isSelected = selectedIds.includes(product.id);
                  const isArchived = product.status === "ARCHIVED";

                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-blumac-copper/5"
                          : isArchived
                          ? "bg-gray-50/70 text-gray-500 opacity-80"
                          : "hover:bg-blumac-ivory/40"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(product.id)}
                          className="w-3.5 h-3.5 rounded text-blumac-copper cursor-pointer"
                        />
                      </td>

                      {/* Product Thumbnail & SKU */}
                      <td className="py-3 px-3 flex items-center gap-3">
                        <div className="relative w-11 h-11 bg-blumac-ivory rounded-lg overflow-hidden shrink-0 border border-blumac-beige">
                          <Image
                            src={firstImg}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                          <p className="font-bold text-blumac-navy truncate" title={product.name}>
                            {product.name}
                          </p>
                          <p className="text-[10px] text-blumac-slate font-mono mt-0.5">
                            SKU: <span className="font-bold text-blumac-navy">{skuCode}</span>
                          </p>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-blumac-copper uppercase text-[10px] block">
                          {product.category?.name || "Skincare"}
                        </span>
                        <span className="text-blumac-navy font-semibold text-[11px]">
                          {product.brand?.name || "K-Beauty"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        {isArchived ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700">
                            Archived
                          </span>
                        ) : product.status === "DRAFT" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Draft
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-blumac-navy text-sm block">
                          {formatCurrency(product.price)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className="text-blumac-slate line-through">
                            {formatCurrency(product.mrp)}
                          </span>
                          {discount > 0 && (
                            <span className="text-emerald-700 font-bold">
                              ({discount}% OFF)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Units */}
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            stockQty <= 0
                              ? "bg-red-100 text-red-800"
                              : stockQty <= 10
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {stockQty} units
                        </span>
                        <span className="text-[10px] text-blumac-slate block mt-0.5">
                          {stockQty <= 0
                            ? "Out of stock"
                            : stockQty <= 10
                            ? "Low stock alert"
                            : "Available"}
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {product.isBestSeller && (
                            <span className="p-1 rounded bg-amber-100 text-amber-800 text-[10px]" title="Best Seller">
                              👑
                            </span>
                          )}
                          {product.isTrending && (
                            <span className="p-1 rounded bg-rose-100 text-rose-800 text-[10px]" title="Trending in Seoul">
                              🔥
                            </span>
                          )}
                        </div>
                      </td>

                      {/* E-Commerce Actions Menu */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* 1. View / Preview */}
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            title="Preview on Storefront"
                            className="p-1.5 rounded-lg bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-blumac-copper" />
                          </Link>

                          {/* 2. Edit */}
                          <button
                            title="Edit Full Product"
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-lg bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-blumac-navy" />
                          </button>

                          {/* 3. Duplicate */}
                          <button
                            title="Duplicate Product"
                            onClick={() => handleDuplicateProduct(product.id)}
                            className="p-1.5 rounded-lg bg-blumac-ivory hover:bg-blumac-beige text-blumac-navy border border-blumac-beige transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-blumac-slate" />
                          </button>

                          {/* 4. Archive / Restore */}
                          <button
                            title={isArchived ? "Restore to Active Catalog" : "Archive Product"}
                            onClick={() => handleToggleArchive(product)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isArchived
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-blumac-ivory hover:bg-blumac-beige text-blumac-slate border-blumac-beige"
                            }`}
                          >
                            {isArchived ? (
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* 5. Delete (Safe Dialog) */}
                          <button
                            title="Delete Product"
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-3.5 bg-blumac-ivory/50 border-t border-blumac-beige flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-blumac-slate">
            Showing <strong className="text-blumac-navy">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-blumac-navy">
              {Math.min(currentPage * pageSize, processedProducts.length)}
            </strong>{" "}
            of <strong className="text-blumac-navy">{processedProducts.length}</strong> products
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-blumac-beige rounded-lg bg-white text-blumac-navy hover:bg-blumac-beige disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-blumac-navy bg-white border border-blumac-beige rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-blumac-beige rounded-lg bg-white text-blumac-navy hover:bg-blumac-beige disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ⚠️ DELETE CONFIRMATION DIALOG (WITH ORDER SAFETY CHECK) */}
      {/* ========================================================= */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-blumac-beige text-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-700 rounded-xl shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-blumac-navy">
                  Confirm Product Deletion
                </h3>
                <p className="text-[11px] text-blumac-slate">
                  Safety verification check against historical customer records
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
              <p className="font-bold text-red-950 text-sm">
                {deletingProduct.name}
              </p>
              <p className="font-mono text-[11px] text-red-800">
                SKU: {deletingProduct.variants?.[0]?.sku || "N/A"}
              </p>
              <p className="text-red-700 text-[11px] leading-relaxed pt-1 border-t border-red-200">
                ⚠️ <strong>Order Integrity Guarantee:</strong> If this product is associated with any previous orders, it will be <strong>safely archived</strong> instead of permanently destroyed, ensuring order invoices and customer purchase records remain 100% intact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-blumac-beige">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 border border-blumac-beige rounded-lg font-bold text-blumac-slate hover:bg-blumac-ivory"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Delete / Safe Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ✏️ COMPREHENSIVE EDIT PRODUCT MODAL (TABBED) */}
      {/* ========================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-blumac-beige max-h-[92vh] flex flex-col text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-blumac-beige shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blumac-navy text-blumac-copperLight rounded-lg">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-serif text-blumac-navy">
                    Edit Product: {editingProduct.name}
                  </h2>
                  <p className="text-[11px] text-blumac-slate font-mono">
                    SKU: {editingProduct.skuValue} • ID: {editingProduct.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full hover:bg-blumac-ivory text-blumac-slate"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Tabs Navigation */}
            <div className="flex border-b border-blumac-beige text-xs pt-2 overflow-x-auto shrink-0">
              {[
                { id: "general", label: "General & Category" },
                { id: "pricing", label: "Price & Inventory" },
                { id: "images", label: "Images Gallery" },
                { id: "formulation", label: "Ingredients & Routine" },
                { id: "variants", label: "Product Variants" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEditTab(t.id as any)}
                  className={`py-2 px-3.5 font-bold border-b-2 transition-colors whitespace-nowrap ${
                    editTab === t.id
                      ? "border-blumac-copper text-blumac-navy"
                      : "border-transparent text-blumac-slate hover:text-blumac-navy"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Contents Form */}
            <form onSubmit={handleSaveEditedProduct} className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Tab 1: General Details */}
              {editTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-blumac-navy mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-blumac-navy mb-1">
                        Category *
                      </label>
                      <select
                        value={editingProduct.categoryId || ""}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, categoryId: e.target.value })
                        }
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
                        Brand
                      </label>
                      <select
                        value={editingProduct.brandId || ""}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, brandId: e.target.value })
                        }
                        className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold cursor-pointer"
                      >
                        <option value="">No Brand Selected</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-blumac-navy mb-1">
                        Catalog Status
                      </label>
                      <select
                        value={editingProduct.status}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, status: e.target.value })
                        }
                        className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold cursor-pointer"
                      >
                        <option value="ACTIVE">ACTIVE (Visible in Store)</option>
                        <option value="ARCHIVED">ARCHIVED (Hidden from Catalog)</option>
                        <option value="DRAFT">DRAFT (Unpublished)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-blumac-navy mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={editingProduct.slug}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, slug: e.target.value })
                        }
                        className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Homepage Badges */}
                  <div className="p-3 bg-blumac-ivory border border-blumac-beige rounded-xl flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isBestSeller}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            isBestSeller: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <span className="font-bold text-blumac-navy text-[11px]">
                        👑 Best Seller Badge
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isTrending}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            isTrending: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span className="font-bold text-blumac-navy text-[11px]">
                        🔥 Trending in Seoul Badge
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.inStock}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            inStock: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="font-bold text-blumac-navy text-[11px]">
                        ✓ In Stock Flag
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-blumac-navy mb-1">
                      Short Tagline Hook
                    </label>
                    <input
                      type="text"
                      value={editingProduct.shortDescription || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          shortDescription: e.target.value,
                        })
                      }
                      className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg p-2 text-blumac-navy"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-blumac-navy mb-1">
                      Full Editorial Description
                    </label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg p-2.5 text-blumac-navy"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Pricing & Inventory */}
              {editTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-blumac-navy mb-1">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, price: e.target.value })
                        }
                        className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-blumac-navy mb-1">
                        MRP (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={editingProduct.mrp}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, mrp: e.target.value })
                        }
                        className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-blumac-navy mb-1">
                        SKU Code
                      </label>
                      <input
                        type="text"
                        value={editingProduct.skuValue}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, skuValue: e.target.value })
                        }
                        className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-blumac-navy mb-1">
                        Default Size / Volume
                      </label>
                      <input
                        type="text"
                        value={editingProduct.sizeValue}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, sizeValue: e.target.value })
                        }
                        className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-blumac-navy mb-1">
                        Physical Stock Units
                      </label>
                      <input
                        type="number"
                        value={editingProduct.stockValue}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, stockValue: e.target.value })
                        }
                        className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Images Gallery */}
              {editTab === "images" && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-blumac-navy mb-1.5">
                      Upload or Add Product Photo Link
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="px-3 py-2 bg-blumac-ivory hover:bg-blumac-beige border border-blumac-beige rounded-lg font-bold text-blumac-navy flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        <UploadCloud className="w-4 h-4 text-blumac-copper" />
                        <span>Upload File</span>
                      </button>

                      <input
                        type="file"
                        ref={editFileInputRef}
                        onChange={handleEditImageUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      <input
                        type="url"
                        placeholder="Paste image web URL..."
                        value={editImageUrlInput}
                        onChange={(e) => setEditImageUrlInput(e.target.value)}
                        className="flex-1 bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-1.5 text-xs text-blumac-navy"
                      />
                      <button
                        type="button"
                        onClick={handleAddEditImageUrl}
                        className="px-3 py-1.5 bg-blumac-navy text-white rounded-lg font-bold text-xs shrink-0"
                      >
                        + Add URL
                      </button>
                    </div>
                  </div>

                  {/* Image Grid with Hero star and Delete */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {editingProduct.imagesList.map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-xl overflow-hidden border p-1 group bg-white shadow-xs ${
                          idx === 0 ? "border-blumac-copper ring-2 ring-blumac-copper" : "border-blumac-beige"
                        }`}
                      >
                        <Image src={img} alt="" fill className="object-contain p-1" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blumac-copper text-white text-[9px] font-bold rounded">
                            Main Hero
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(idx)}
                              title="Set as Main Hero Image"
                              className="p-1 bg-white text-blumac-navy rounded hover:bg-blumac-copper hover:text-white"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveEditImage(idx)}
                            title="Remove Photo"
                            className="p-1 bg-white text-red-600 rounded hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Formulation & Routine */}
              {editTab === "formulation" && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-blumac-navy mb-1">
                      Full Ingredients List (INCI)
                    </label>
                    <textarea
                      rows={3}
                      value={editingProduct.fullIngredients || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          fullIngredients: e.target.value,
                        })
                      }
                      className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg p-2.5 text-blumac-navy"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-blumac-navy mb-1">
                      How to Use (Korean Routine Step)
                    </label>
                    <textarea
                      rows={2}
                      value={editingProduct.howToUse || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          howToUse: e.target.value,
                        })
                      }
                      className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg p-2 text-blumac-navy"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-blumac-navy mb-1">
                      Cautions & Storage Instructions
                    </label>
                    <input
                      type="text"
                      value={editingProduct.cautions || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          cautions: e.target.value,
                        })
                      }
                      className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy"
                    />
                  </div>
                </div>
              )}

              {/* Tab 5: Product Variants */}
              {editTab === "variants" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blumac-ivory border border-blumac-beige rounded-xl space-y-2">
                    <p className="font-bold text-blumac-navy">Product SKU & Variants Table</p>
                    <p className="text-[11px] text-blumac-slate">
                      Each variant has its own isolated warehouse inventory and pricing.
                    </p>
                  </div>

                  <div className="border border-blumac-beige rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-blumac-navy text-white text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5">SKU</th>
                          <th className="p-2.5">Size</th>
                          <th className="p-2.5">Price</th>
                          <th className="p-2.5">MRP</th>
                          <th className="p-2.5">Inventory</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blumac-beige">
                        {editingProduct.variants?.map((v: any, i: number) => (
                          <tr key={v.id || i}>
                            <td className="p-2.5 font-mono font-bold text-blumac-navy">{v.sku}</td>
                            <td className="p-2.5">{v.size}</td>
                            <td className="p-2.5 font-bold">{formatCurrency(v.price)}</td>
                            <td className="p-2.5 line-through text-blumac-slate">{formatCurrency(v.mrp)}</td>
                            <td className="p-2.5 font-mono">{v.inventory?.quantityOnHand ?? 25} units</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-blumac-beige flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-blumac-beige rounded-lg font-bold text-blumac-slate hover:bg-blumac-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Product Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ⚡ ADD PRODUCT MODAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-blumac-beige max-h-[92vh] flex flex-col">
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
                    Create new skincare product in active catalog
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-blumac-ivory text-blumac-slate"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto py-3 space-y-4 text-xs">
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
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold"
                />
              </div>

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
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-bold"
                  />
                </div>
              </div>

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
                    <span>Upload</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      setUploadingImage(true);
                      try {
                        const file = files[0];
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await fetch("/api/admin/upload", {
                          method: "POST",
                          body: formData,
                        });
                        const data = await res.json();
                        if (res.ok && data.url) {
                          setImages((prev) => [...prev, data.url]);
                        }
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />

                  <input
                    type="url"
                    placeholder="Or paste image web link..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-1.5 text-blumac-navy text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!imageUrlInput.trim()) return;
                      setImages((prev) => [...prev, imageUrlInput.trim()]);
                      setImageUrlInput("");
                    }}
                    className="px-3 py-1.5 bg-blumac-navy text-white rounded-lg font-bold text-xs shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-12 h-12 rounded-lg overflow-hidden border border-blumac-beige shrink-0 group"
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short details about the product and skincare benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg p-2.5 text-blumac-navy"
                />
              </div>

              <div className="p-3 bg-blumac-ivory border border-blumac-beige rounded-xl flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-bold text-blumac-navy text-[11px]">
                    👑 Best Seller Badge
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="font-bold text-blumac-navy text-[11px]">
                    🔥 Trending in Seoul Badge
                  </span>
                </label>
              </div>

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

      {/* Bulk CSV Import Modal */}
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
