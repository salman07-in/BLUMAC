import test from "node:test";
import assert from "node:assert/strict";

// 1. Slug generator helper function
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 2. Category Name & Input Validation
function validateCategoryInput({ name, description, image, isActive = true }) {
  const errors = [];
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Category name must be at least 2 characters long.");
  }
  if (name && name.trim().length > 60) {
    errors.push("Category name cannot exceed 60 characters.");
  }
  if (image && typeof image === "string" && !image.startsWith("http://") && !image.startsWith("https://") && !image.startsWith("/uploads/")) {
    errors.push("Invalid image URL format.");
  }
  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      name: name.trim(),
      slug: generateSlug(name),
      description: description?.trim() || null,
      image: image?.trim() || null,
      isActive: Boolean(isActive),
    } : null,
  };
}

// 3. Duplicate Name Guard (Case-insensitive)
function checkDuplicateCategory(categories, newName, excludeId = null) {
  const clean = newName.trim().toLowerCase();
  return categories.some(
    (c) => c.name.trim().toLowerCase() === clean && (!excludeId || c.id !== excludeId)
  );
}

// 4. Safe Deletion & Reassignment Guard
function evaluateCategoryDeletion({ category, productCount, reassignTargetId, availableCategories }) {
  if (productCount > 0) {
    if (!reassignTargetId) {
      return {
        canDelete: false,
        error: `Cannot delete "${category.name}". It is currently assigned to ${productCount} product(s). Please reassign products to another category first.`,
        requiresReassignment: true,
      };
    }
    if (reassignTargetId === category.id) {
      return {
        canDelete: false,
        error: "Cannot reassign products to the category being deleted.",
      };
    }
    const targetExists = availableCategories.some((c) => c.id === reassignTargetId);
    if (!targetExists) {
      return {
        canDelete: false,
        error: "Target category for product reassignment does not exist.",
      };
    }
    return {
      canDelete: true,
      action: "REASSIGN_AND_DELETE",
      reassignedCount: productCount,
      reassignTargetId,
    };
  }

  return {
    canDelete: true,
    action: "DIRECT_DELETE",
    reassignedCount: 0,
  };
}

// TEST SUITES

test("Category Management - 1. Slug Generator", () => {
  assert.equal(generateSlug("Cleansers & Toners"), "cleansers-toners");
  assert.equal(generateSlug("Serums / Ampoules!"), "serums-ampoules");
  assert.equal(generateSlug("   Sunscreens & SPF 50+  "), "sunscreens-spf-50");
  assert.equal(generateSlug("Sheet Masks"), "sheet-masks");
});

test("Category Management - 2. Input Validation", () => {
  const valid = validateCategoryInput({
    name: "Sun Care",
    description: "K-Beauty mineral and chemical sunscreens",
    image: "https://blumac.in/images/suncare.jpg",
    isActive: true,
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.data.name, "Sun Care");
  assert.equal(valid.data.slug, "sun-care");
  assert.equal(valid.data.isActive, true);

  const emptyName = validateCategoryInput({ name: "   " });
  assert.equal(emptyName.isValid, false);
  assert.ok(emptyName.errors[0].includes("at least 2 characters"));

  const singleChar = validateCategoryInput({ name: "A" });
  assert.equal(singleChar.isValid, false);

  const invalidImg = validateCategoryInput({ name: "Moisturizers", image: "ftp://bad-link" });
  assert.equal(invalidImg.isValid, false);
  assert.ok(invalidImg.errors[0].includes("Invalid image URL"));
});

test("Category Management - 3. Duplicate Detection (Case-insensitive)", () => {
  const existing = [
    { id: "cat-1", name: "Cleansers" },
    { id: "cat-2", name: "Serums & Ampoules" },
    { id: "cat-3", name: "Sunscreen" },
  ];

  assert.equal(checkDuplicateCategory(existing, "cleansers"), true, "Lowercase match");
  assert.equal(checkDuplicateCategory(existing, "CLEANSERS"), true, "Uppercase match");
  assert.equal(checkDuplicateCategory(existing, "  Cleansers  "), true, "Whitespace match");
  assert.equal(checkDuplicateCategory(existing, "Eye Creams"), false, "New distinct category");

  // Editing existing category should allow keeping its own name
  assert.equal(checkDuplicateCategory(existing, "Cleansers", "cat-1"), false, "Self-exclusion during edit");
  assert.equal(checkDuplicateCategory(existing, "Sunscreen", "cat-1"), true, "Collision with another category during edit");
});

test("Category Management - 4. Safe Deletion & Reassignment Guard", () => {
  const available = [
    { id: "cat-1", name: "Cleansers" },
    { id: "cat-2", name: "General Skincare" },
  ];

  // Attempting to delete category with products and no reassignment target
  const blocked = evaluateCategoryDeletion({
    category: available[0],
    productCount: 14,
    reassignTargetId: null,
    availableCategories: available,
  });
  assert.equal(blocked.canDelete, false);
  assert.equal(blocked.requiresReassignment, true);
  assert.ok(blocked.error.includes("currently assigned to 14 product(s)"));

  // Attempting to reassign to self
  const selfReassign = evaluateCategoryDeletion({
    category: available[0],
    productCount: 14,
    reassignTargetId: "cat-1",
    availableCategories: available,
  });
  assert.equal(selfReassign.canDelete, false);
  assert.ok(selfReassign.error.includes("Cannot reassign products to the category being deleted"));

  // Valid reassignment and deletion
  const validReassign = evaluateCategoryDeletion({
    category: available[0],
    productCount: 14,
    reassignTargetId: "cat-2",
    availableCategories: available,
  });
  assert.equal(validReassign.canDelete, true);
  assert.equal(validReassign.action, "REASSIGN_AND_DELETE");
  assert.equal(validReassign.reassignedCount, 14);

  // Direct deletion for empty category
  const emptyCategory = evaluateCategoryDeletion({
    category: { id: "cat-3", name: "New Empty Cat" },
    productCount: 0,
    reassignTargetId: null,
    availableCategories: available,
  });
  assert.equal(emptyCategory.canDelete, true);
  assert.equal(emptyCategory.action, "DIRECT_DELETE");
});

test("Category Management - 5. State Synchronization Without Page Refresh", () => {
  let categories = [
    { id: "cat-1", name: "Cleansers", isActive: true },
    { id: "cat-2", name: "Moisturizers", isActive: true },
  ];
  let selectedCategoryId = "cat-1";

  // Simulate "+ Add Category" creation
  const newCat = {
    id: "cat-3",
    name: "Ampoules & Serums",
    slug: "ampoules-serums",
    isActive: true,
  };

  // State update callback
  categories = [...categories, newCat].sort((a, b) => a.name.localeCompare(b.name));
  selectedCategoryId = newCat.id;

  assert.equal(categories.length, 3);
  assert.equal(selectedCategoryId, "cat-3", "Newly created category immediately auto-selected");
  assert.equal(categories[0].name, "Ampoules & Serums", "Sorted alphabetically in dropdown");
});

