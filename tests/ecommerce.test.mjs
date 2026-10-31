import test from "node:test";
import assert from "node:assert/strict";

// Helper functions to test
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculateDiscount(mrp, price) {
  if (mrp <= price || mrp <= 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

function calculateShipping(subtotal) {
  return subtotal >= 999 ? 0 : 99;
}

function validateIndianPin(pin) {
  return /^\d{6}$/.test(pin.trim());
}

function calculateCouponDiscount(couponCode, subtotal) {
  const code = couponCode.trim().toUpperCase();
  if (code === "SEOUL10") {
    return Math.round(subtotal * 0.1);
  }
  if (code === "FIRSTORDER") {
    return subtotal >= 999 ? 200 : 0;
  }
  if (code === "KBEAUTY25") {
    return Math.min(500, Math.round(subtotal * 0.25));
  }
  return 0;
}

test("1. Currency Formatting in Indian Rupees", () => {
  const formatted = formatCurrency(1499);
  assert.ok(formatted.includes("1,499"), "Should format with thousand separator");
});

test("2. Retail MRP Discount Percentage", () => {
  // MRP: 1450, Price: 1199 -> (1450-1199)/1450 = 17.3% -> 17%
  const discount = calculateDiscount(1450, 1199);
  assert.equal(discount, 17, "Discount should be 17%");

  const zeroDiscount = calculateDiscount(1000, 1000);
  assert.equal(zeroDiscount, 0, "No discount when MRP equals price");
});

test("3. All-India Free Shipping Rule Threshold", () => {
  assert.equal(calculateShipping(500), 99, "Below 999 should incur flat 99 INR shipping");
  assert.equal(calculateShipping(999), 0, "At 999 shipping is FREE");
  assert.equal(calculateShipping(2400), 0, "Above 999 shipping is FREE");
});

test("4. 6-Digit Indian PIN Code Validation", () => {
  assert.equal(validateIndianPin("560038"), true, "Valid Bangalore PIN");
  assert.equal(validateIndianPin("110001"), true, "Valid Delhi PIN");
  assert.equal(validateIndianPin("400001"), true, "Valid Mumbai PIN");
  assert.equal(validateIndianPin("12345"), false, "5 digits is invalid");
  assert.equal(validateIndianPin("56003A"), false, "Letters are invalid");
  assert.equal(validateIndianPin("5600389"), false, "7 digits is invalid");
});

test("5. Coupon Discount Engine Calculations", () => {
  // SEOUL10: 10% off
  assert.equal(calculateCouponDiscount("SEOUL10", 2000), 200);

  // FIRSTORDER: 200 off if >= 999
  assert.equal(calculateCouponDiscount("FIRSTORDER", 800), 0);
  assert.equal(calculateCouponDiscount("FIRSTORDER", 1200), 200);

  // KBEAUTY25: 25% up to max 500
  assert.equal(calculateCouponDiscount("KBEAUTY25", 1000), 250);
  assert.equal(calculateCouponDiscount("KBEAUTY25", 3000), 500); // capped at 500
});
