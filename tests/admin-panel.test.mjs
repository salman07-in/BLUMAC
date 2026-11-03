import test from "node:test";
import assert from "node:assert/strict";

// 1. Order Status Transition State Machine Rules
const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED", "REFUNDED"],
  CANCELLED: ["REFUNDED"],
  RETURNED: ["REFUNDED"],
  REFUNDED: [],
};

function isValidStatusTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

test("Admin Orders - 1. State Machine Status Transitions", () => {
  assert.equal(isValidStatusTransition("PENDING", "CONFIRMED"), true);
  assert.equal(isValidStatusTransition("CONFIRMED", "PROCESSING"), true);
  assert.equal(isValidStatusTransition("PROCESSING", "SHIPPED"), true);
  assert.equal(isValidStatusTransition("SHIPPED", "DELIVERED"), true);
  assert.equal(isValidStatusTransition("PENDING", "CANCELLED"), true);

  // Illegal transitions
  assert.equal(isValidStatusTransition("DELIVERED", "PENDING"), false, "Delivered cannot jump back to Pending");
  assert.equal(isValidStatusTransition("CANCELLED", "SHIPPED"), false, "Cancelled cannot jump to Shipped");
});

// 2. Inventory Calculations & Safety
function calculateAvailableStock(onHand, reserved) {
  return Math.max(0, onHand - reserved);
}

test("Admin Inventory - 2. Available Stock Calculation & Non-Negative Bound", () => {
  assert.equal(calculateAvailableStock(50, 10), 40);
  assert.equal(calculateAvailableStock(5, 5), 0);
  assert.equal(calculateAvailableStock(5, 10), 0, "Stock cannot go below 0");
});

// 3. Product Duplication SKU & Slug Generation
function generateDuplicateSkuAndSlug(sourceName, sourceSku, sourceSlug, timestamp) {
  const cleanSku = sourceSku.replace(/^BLU-/, "").slice(0, 8);
  const newSku = `BLU-${cleanSku}-CPY${timestamp}`;
  const newSlug = `${sourceSlug}-copy-${timestamp}`;
  const newName = `${sourceName} (Copy)`;
  return { newName, newSku, newSlug };
}

test("Admin Products - 3. Duplicate Product SKU & Slug Generator", () => {
  const res = generateDuplicateSkuAndSlug(
    "Relief Sun",
    "BLU-BOJ-RELIEF",
    "beauty-of-joseon-relief-sun",
    "9999"
  );

  assert.equal(res.newName, "Relief Sun (Copy)");
  assert.equal(res.newSku, "BLU-BOJ-RELI-CPY9999");
  assert.equal(res.newSlug, "beauty-of-joseon-relief-sun-copy-9999");
  assert.notEqual(res.newSku, "BLU-BOJ-RELIEF");
});

// 4. Safe Delete Protection for Historical Orders
function determineDeletionAction(orderCount) {
  if (orderCount > 0) {
    return {
      action: "ARCHIVE",
      reason: "Historical order records exist; soft archive applied to protect customer receipts",
    };
  }
  return {
    action: "PERMANENT_DELETE",
    reason: "Zero order references; safe to permanently delete",
  };
}

test("Admin Products - 4. Safe Deletion & Order History Guard", () => {
  const productWithOrders = determineDeletionAction(3);
  assert.equal(productWithOrders.action, "ARCHIVE");
  assert.match(productWithOrders.reason, /Historical order/);

  const productWithoutOrders = determineDeletionAction(0);
  assert.equal(productWithoutOrders.action, "PERMANENT_DELETE");
});
