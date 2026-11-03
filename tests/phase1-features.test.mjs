import test from "node:test";
import assert from "node:assert/strict";

// 1. Search Query Match Logic
function matchesSearchQuery(product, query) {
  if (!query || query.trim().length < 2) return false;
  const q = query.trim().toLowerCase();
  const nameMatch = product.name?.toLowerCase().includes(q) || false;
  const brandMatch = product.brand?.toLowerCase().includes(q) || false;
  const categoryMatch = product.category?.toLowerCase().includes(q) || false;
  const descMatch = product.description?.toLowerCase().includes(q) || false;
  return nameMatch || brandMatch || categoryMatch || descMatch;
}

test("Phase 1 - 1. Search Query Matching Engine", () => {
  const sampleProduct = {
    name: "Advanced Snail 96 Mucin Power Essence",
    brand: "COSRX",
    category: "Serums & Ampoules",
    description: "Lightweight hydrating snail mucin essence for barrier repair.",
  };

  assert.equal(matchesSearchQuery(sampleProduct, "cosrx"), true, "Should match brand");
  assert.equal(matchesSearchQuery(sampleProduct, "snail"), true, "Should match name");
  assert.equal(matchesSearchQuery(sampleProduct, "barrier"), true, "Should match description");
  assert.equal(matchesSearchQuery(sampleProduct, "serum"), true, "Should match category");
  assert.equal(matchesSearchQuery(sampleProduct, "a"), false, "Single character search should be ignored");
  assert.equal(matchesSearchQuery(sampleProduct, "lipstick"), false, "Unrelated term should not match");
});

// 2. Customer Profile Validation
function validateProfile(name, phone) {
  const errors = [];
  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }
  if (phone) {
    const cleanPhone = phone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.push("Enter a valid 10-digit Indian mobile number");
    }
  }
  return { valid: errors.length === 0, errors };
}

test("Phase 1 - 2. Customer Profile Input Validation", () => {
  assert.equal(validateProfile("Priya Sharma", "9876543210").valid, true);
  assert.equal(validateProfile("R", "9876543210").valid, false, "Name too short");
  assert.equal(validateProfile("Amit Kumar", "1234567890").valid, false, "Invalid starting digit for India");
  assert.equal(validateProfile("Amit Kumar", "98765").valid, false, "Incomplete phone number");
  assert.equal(validateProfile("Amit Kumar", null).valid, true, "Phone is optional");
});

// 3. Customer Delivery Address Validation
function validateAddress(addr) {
  const errors = [];
  if (!addr.fullName || addr.fullName.trim().length < 2) errors.push("Full name required");
  if (!addr.phone || !/^[6-9]\d{9}$/.test(addr.phone.trim())) errors.push("Valid 10-digit phone required");
  if (!addr.street || addr.street.trim().length < 5) errors.push("Street address too short");
  if (!addr.city || addr.city.trim().length < 2) errors.push("City required");
  if (!addr.state || addr.state.trim().length < 2) errors.push("State required");
  if (!addr.pinCode || !/^\d{6}$/.test(addr.pinCode.trim())) errors.push("Valid 6-digit PIN code required");
  return { valid: errors.length === 0, errors };
}

test("Phase 1 - 3. Delivery Address Validation (Pan-India)", () => {
  const validAddr = {
    fullName: "Ananya Iyer",
    phone: "9820098200",
    street: "Flat 402, Lotus Heights, Powai",
    city: "Mumbai",
    state: "Maharashtra",
    pinCode: "400076",
  };
  assert.equal(validateAddress(validAddr).valid, true);

  const invalidPin = { ...validAddr, pinCode: "4000" };
  assert.equal(validateAddress(invalidPin).valid, false, "Invalid PIN length");

  const invalidPhone = { ...validAddr, phone: "0000000000" };
  assert.equal(validateAddress(invalidPhone).valid, false, "Invalid phone start");
});

// 4. Product Review Submission Validation
function validateReview(rating, comment, customerName) {
  const errors = [];
  if (!customerName || customerName.trim().length < 2) errors.push("Name required");
  if (typeof rating !== "number" || rating < 1 || rating > 5) errors.push("Rating must be between 1 and 5");
  if (!comment || comment.trim().length < 10) errors.push("Review must be at least 10 characters");
  return { valid: errors.length === 0, errors };
}

test("Phase 1 - 4. Customer Review Submission Validation", () => {
  assert.equal(validateReview(5, "Absolutely loved this snail mucin! Hydrated my skin barrier perfectly.", "Kavita R.").valid, true);
  assert.equal(validateReview(6, "Great product!", "Kavita R.").valid, false, "Rating > 5 should fail");
  assert.equal(validateReview(0, "Great product!", "Kavita R.").valid, false, "Rating < 1 should fail");
  assert.equal(validateReview(5, "Good", "Kavita R.").valid, false, "Review under 10 chars should fail");
});

// 5. Wishlist Toggle State Management
function toggleWishlistState(currentList, productId) {
  if (currentList.includes(productId)) {
    return currentList.filter((id) => id !== productId);
  }
  return [...currentList, productId];
}

test("Phase 1 - 5. Wishlist Toggle & Persistence Logic", () => {
  let list = ["cosrx-snail-96"];
  list = toggleWishlistState(list, "boj-relief-sun");
  assert.deepEqual(list, ["cosrx-snail-96", "boj-relief-sun"]);

  list = toggleWishlistState(list, "cosrx-snail-96");
  assert.deepEqual(list, ["boj-relief-sun"], "Toggling existing item should remove it");
});
