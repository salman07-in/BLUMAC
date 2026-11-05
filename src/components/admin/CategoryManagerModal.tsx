"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  FolderPlus,
  X,
  UploadCloud,
  Check,
  AlertTriangle,
  Trash2,
  Edit2,
  RefreshCw,
  Sliders,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive?: boolean;
  createdAt?: string;
  _count?: {
    products: number;
  };
}

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  initialMode?: "create" | "manage";
  onCategoryCreated: (category: CategoryItem) => void;
  onCategoryUpdated: (category: CategoryItem) => void;
  onCategoryDeleted: (categoryId: string, reassignedToId?: string) => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  initialMode = "create",
  onCategoryCreated,
  onCategoryUpdated,
  onCategoryDeleted,
  showToast,
}: CategoryManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"create" | "manage">(initialMode);

  // Form State for Create / Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category Deletion Safety Dialog State
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Search Filter for Manage tab
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setImage("");
    setIsActive(true);
    setFormError("");
  };

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setIsActive(cat.isActive !== false);
    setFormError("");
    setActiveTab("create");
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    setFormError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImage(data.url);
        showToast("success", "Category image uploaded successfully.");
      } else {
        setFormError(data.error || "Failed to upload image.");
        showToast("error", data.error || "Image upload failed.");
      }
    } catch {
      setFormError("Network error while uploading image.");
      showToast("error", "Network error while uploading image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    if (name.trim().length < 2) {
      setFormError("Category name must be at least 2 characters.");
      return;
    }

    // Check duplicate name locally before sending
    const duplicate = categories.find(
      (c) =>
        c.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        c.id !== editingId
    );
    if (duplicate) {
      setFormError(`Category "${name.trim()}" already exists.`);
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const isEdit = Boolean(editingId);
      const url = isEdit
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          image: image.trim() || null,
          isActive,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (isEdit) {
          onCategoryUpdated(data);
          showToast("success", `Category "${data.name}" updated successfully.`);
          setActiveTab("manage");
        } else {
          onCategoryCreated(data);
          showToast("success", `Category "${data.name}" created and selected.`);
          onClose();
        }
        resetForm();
      } else {
        setFormError(data.error || "Failed to save category.");
        showToast("error", data.error || "Failed to save category.");
      }
    } catch {
      setFormError("A network error occurred while saving the category.");
      showToast("error", "Network error while saving category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    try {
      const newStatus = !(cat.isActive !== false);
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        onCategoryUpdated(data);
        showToast(
          "success",
          `Category "${cat.name}" marked as ${newStatus ? "Active" : "Inactive"}.`
        );
      } else {
        showToast("error", data.error || "Failed to update category status.");
      }
    } catch {
      showToast("error", "Network error while updating status.");
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    setDeleteSubmitting(true);
    setDeleteError("");

    try {
      const productCount = deletingCategory._count?.products || 0;
      let url = `/api/admin/categories/${deletingCategory.id}`;
      if (productCount > 0 && reassignTargetId) {
        url += `?reassignToCategoryId=${encodeURIComponent(reassignTargetId)}`;
      }

      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body:
          productCount > 0 && reassignTargetId
            ? JSON.stringify({ reassignToCategoryId: reassignTargetId })
            : undefined,
      });

      const data = await res.json();

      if (res.ok) {
        onCategoryDeleted(deletingCategory.id, reassignTargetId || undefined);
        showToast("success", data.message || "Category deleted successfully.");
        setDeletingCategory(null);
        setReassignTargetId("");
      } else {
        setDeleteError(data.error || "Failed to delete category.");
        showToast("error", data.error || "Failed to delete category.");
      }
    } catch {
      setDeleteError("Network error while deleting category.");
      showToast("error", "Network error while deleting category.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-blumac-beige overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-blumac-beige flex items-center justify-between bg-blumac-ivory/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blumac-navy text-white flex items-center justify-center shadow-sm">
              <FolderPlus className="w-5 h-5 text-blumac-copper" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blumac-navy font-serif">
                {editingId ? "Edit Category" : "Product Category Management"}
              </h2>
              <p className="text-xs text-blumac-slate">
                Create, organize, and manage skincare product categories dynamically.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1.5 rounded-lg text-blumac-slate hover:text-blumac-navy hover:bg-blumac-beige/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-blumac-beige px-5 bg-white text-xs font-bold">
          <button
            onClick={() => {
              if (editingId) resetForm();
              setActiveTab("create");
            }}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "create"
                ? "border-blumac-copper text-blumac-copper"
                : "border-transparent text-blumac-slate hover:text-blumac-navy"
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{editingId ? "Edit Category" : "+ Add New Category"}</span>
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "manage"
                ? "border-blumac-copper text-blumac-copper"
                : "border-transparent text-blumac-slate hover:text-blumac-navy"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage All Categories ({categories.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeTab === "create" ? (
            <form onSubmit={handleSaveCategory} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Category Name */}
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cleansers, Serums & Ampoules, Sunscreens..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormError("");
                  }}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold focus:outline-none focus:ring-1 focus:ring-blumac-copper"
                />
                <p className="text-[11px] text-blumac-slate mt-1">
                  Must be unique. A clean URL slug will be automatically generated.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description of this category for skincare shoppers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:ring-1 focus:ring-blumac-copper"
                />
              </div>

              {/* Category Image */}
              <div>
                <label className="block font-bold text-blumac-navy mb-1">
                  Category Banner / Image URL
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="https://... or upload below"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy focus:outline-none focus:ring-1 focus:ring-blumac-copper"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-blumac-ivory border border-blumac-beige hover:border-blumac-copper text-blumac-navy rounded-lg font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blumac-copper" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5 text-blumac-copper" />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                  </button>
                </div>

                {image && (
                  <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-blumac-beige shadow-sm bg-blumac-ivory group mt-1">
                    <Image
                      src={image}
                      alt="Category preview"
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="112px"
                    />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Active / Inactive Status */}
              <div className="pt-2 border-t border-blumac-beige flex items-center justify-between">
                <div>
                  <span className="font-bold text-blumac-navy block">Category Status</span>
                  <span className="text-[11px] text-blumac-slate">
                    Inactive categories won't be shown to storefront customers.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blumac-copper"></div>
                  <span className="ml-2 font-bold text-blumac-navy">
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-blumac-beige">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab("manage");
                    }}
                    className="px-4 py-2 border border-blumac-beige text-blumac-slate hover:text-blumac-navy rounded-lg font-bold transition"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blumac-navy hover:bg-blumac-copper text-white rounded-lg font-bold flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blumac-copper" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingId ? "Update Category" : "Save & Add Category"}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Manage Categories Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold focus:outline-none focus:ring-1 focus:ring-blumac-copper"
                />
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("create");
                  }}
                  className="shrink-0 px-3 py-2 bg-blumac-copper text-white rounded-lg font-bold hover:bg-blumac-copperLight transition flex items-center gap-1 shadow-sm"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ New Category</span>
                </button>
              </div>

              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-blumac-slate bg-blumac-ivory/50 rounded-xl border border-dashed border-blumac-beige">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-blumac-copper opacity-60" />
                  <p className="font-bold">No categories found</p>
                  <p className="text-[11px] mt-0.5">Try a different search or create a new category.</p>
                </div>
              ) : (
                <div className="divide-y divide-blumac-beige/60 border border-blumac-beige rounded-xl overflow-hidden bg-white">
                  {filteredCategories.map((cat) => {
                    const productCount = cat._count?.products ?? 0;
                    const isCatActive = cat.isActive !== false;

                    return (
                      <div
                        key={cat.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-blumac-ivory/40 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {cat.image ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-blumac-beige shrink-0 bg-blumac-ivory">
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blumac-ivory border border-blumac-beige shrink-0 flex items-center justify-center text-blumac-copper">
                              <Layers className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blumac-navy text-sm truncate">
                                {cat.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                                  isCatActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                }`}
                              >
                                {isCatActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-blumac-slate mt-0.5">
                              <span className="font-mono text-blumac-slate/80">/{cat.slug}</span>
                              <span>•</span>
                              <span className="font-semibold text-blumac-copper">
                                {productCount} {productCount === 1 ? "product" : "products"}
                              </span>
                              {cat.description && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[200px]">
                                    {cat.description}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(cat)}
                            title={isCatActive ? "Deactivate" : "Activate"}
                            className={`px-2 py-1 text-[11px] font-bold rounded border transition ${
                              isCatActive
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {isCatActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            title="Edit Category"
                            className="p-1.5 text-blumac-slate hover:text-blumac-navy hover:bg-blumac-ivory rounded transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError("");
                              setReassignTargetId("");
                              setDeletingCategory(cat);
                            }}
                            title="Delete Category"
                            className="p-1.5 text-blumac-slate hover:text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Safety Deletion / Reassignment Sub-Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blumac-beige animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-blumac-navy font-serif">
                  Delete Category: {deletingCategory.name}
                </h3>
                <p className="text-blumac-slate text-[11px]">
                  Confirm deletion and check associated products
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {deleteError}
              </div>
            )}

            {(deletingCategory._count?.products ?? 0) > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Associated Products Detected</span>
                  </div>
                  <p className="text-[11px]">
                    This category contains{" "}
                    <strong>{deletingCategory._count?.products}</strong> active product(s). To
                    prevent orphaned products, please select a replacement category to safely
                    reassign them:
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-blumac-navy mb-1">
                    Reassign {deletingCategory._count?.products} product(s) to: *
                  </label>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                    className="w-full bg-blumac-ivory border border-blumac-beige rounded-lg px-3 py-2 text-blumac-navy font-semibold cursor-pointer"
                  >
                    <option value="">Select target category...</option>
                    {categories
                      .filter((c) => c.id !== deletingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-blumac-beige">
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingCategory(null);
                      setDeleteError("");
                    }}
                    className="px-4 py-2 border border-blumac-beige text-blumac-slate hover:text-blumac-navy rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!reassignTargetId || deleteSubmitting}
                    onClick={confirmDeleteCategory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 disabled:opacity-40 transition"
                  >
                    {deleteSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>Reassign & Delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-blumac-slate text-xs">
                  This category contains no products. Are you sure you want to permanently delete{" "}
                  <strong>{deletingCategory.name}</strong>?
                </p>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-blumac-beige">
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingCategory(null);
                      setDeleteError("");
                    }}
                    className="px-4 py-2 border border-blumac-beige text-blumac-slate hover:text-blumac-navy rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deleteSubmitting}
                    onClick={confirmDeleteCategory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition"
                  >
                    {deleteSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete Category</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

