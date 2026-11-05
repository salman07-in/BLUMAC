import test from "node:test";
import assert from "node:assert/strict";

// 1. Settings Map & Gateways Resolver Logic
function resolvePaymentGateways(settingsMap = {}) {
  const isRazorpayEnabled = settingsMap.enable_razorpay !== "false";
  const isCodEnabled = settingsMap.enable_cod !== "false";

  let defaultMethod = "RAZORPAY";
  if (!isRazorpayEnabled && isCodEnabled) {
    defaultMethod = "COD";
  } else if (isRazorpayEnabled && !isCodEnabled) {
    defaultMethod = "RAZORPAY";
  }

  const isCheckoutOpen = isRazorpayEnabled || isCodEnabled;

  return {
    isRazorpayEnabled,
    isCodEnabled,
    defaultMethod,
    isCheckoutOpen,
  };
}

// 2. Server-side Checkout Payment Method Guard
function validateCheckoutPaymentMethod({ paymentMethod, settingsMap = {} }) {
  const { isRazorpayEnabled, isCodEnabled, isCheckoutOpen } = resolvePaymentGateways(settingsMap);

  if (!isCheckoutOpen) {
    return {
      allowed: false,
      error: "Checkout is temporarily paused by store administration. Please contact customer support.",
    };
  }

  if (paymentMethod === "COD" && !isCodEnabled) {
    return {
      allowed: false,
      error: "Cash on Delivery (COD) is temporarily disabled by store administration. Please select Online Payment.",
    };
  }

  if (paymentMethod === "RAZORPAY" && !isRazorpayEnabled) {
    return {
      allowed: false,
      error: "Online Payment (Razorpay) is temporarily disabled by store administration. Please select Cash on Delivery.",
    };
  }

  return { allowed: true };
}

// TEST SUITES

test("Payment Gateways - 1. Default Both Enabled", () => {
  const gateways = resolvePaymentGateways({});
  assert.equal(gateways.isRazorpayEnabled, true);
  assert.equal(gateways.isCodEnabled, true);
  assert.equal(gateways.defaultMethod, "RAZORPAY");
  assert.equal(gateways.isCheckoutOpen, true);
});

test("Payment Gateways - 2. Disable COD (Turn Off COD)", () => {
  const settings = { enable_cod: "false", enable_razorpay: "true" };
  const gateways = resolvePaymentGateways(settings);
  assert.equal(gateways.isCodEnabled, false);
  assert.equal(gateways.isRazorpayEnabled, true);
  assert.equal(gateways.defaultMethod, "RAZORPAY");

  // Attempt to checkout with COD
  const codAttempt = validateCheckoutPaymentMethod({ paymentMethod: "COD", settingsMap: settings });
  assert.equal(codAttempt.allowed, false);
  assert.ok(codAttempt.error.includes("COD"));

  // Checkout with Razorpay should succeed
  const razorpayAttempt = validateCheckoutPaymentMethod({ paymentMethod: "RAZORPAY", settingsMap: settings });
  assert.equal(razorpayAttempt.allowed, true);
});

test("Payment Gateways - 3. Disable Razorpay (Turn Off Razorpay)", () => {
  const settings = { enable_cod: "true", enable_razorpay: "false" };
  const gateways = resolvePaymentGateways(settings);
  assert.equal(gateways.isCodEnabled, true);
  assert.equal(gateways.isRazorpayEnabled, false);
  assert.equal(gateways.defaultMethod, "COD", "Auto-fallback to COD when Razorpay is disabled");

  // Attempt to checkout with Razorpay
  const razorpayAttempt = validateCheckoutPaymentMethod({ paymentMethod: "RAZORPAY", settingsMap: settings });
  assert.equal(razorpayAttempt.allowed, false);
  assert.ok(razorpayAttempt.error.includes("Razorpay"));

  // Checkout with COD should succeed
  const codAttempt = validateCheckoutPaymentMethod({ paymentMethod: "COD", settingsMap: settings });
  assert.equal(codAttempt.allowed, true);
});

test("Payment Gateways - 4. Disable Both Gateways (Emergency Store Pause)", () => {
  const settings = { enable_cod: "false", enable_razorpay: "false" };
  const gateways = resolvePaymentGateways(settings);
  assert.equal(gateways.isCodEnabled, false);
  assert.equal(gateways.isRazorpayEnabled, false);
  assert.equal(gateways.isCheckoutOpen, false);

  const attempt = validateCheckoutPaymentMethod({ paymentMethod: "COD", settingsMap: settings });
  assert.equal(attempt.allowed, false);
  assert.ok(attempt.error.includes("temporarily paused"));
});
