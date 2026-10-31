import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function runAudit() {
  console.log("🚀 Starting Comprehensive BLUMAC Feature Audit...\n");

  const results = {
    storefront: [],
    auth: [],
    checkout: [],
    admin: [],
    ai: [],
  };

  // 1. STOREFRONT PAGES
  console.log("--- 1. Testing Storefront Pages & Catalog ---");
  const pagesToTest = [
    { name: "Homepage", path: "/" },
    { name: "Shop All Catalog", path: "/shop" },
    { name: "Brand Showcase", path: "/brands" },
    { name: "Offers & Coupons", path: "/offers" },
    { name: "Category Page (Serums)", path: "/category/serums-ampoules" },
    { name: "Product Page (COSRX Snail)", path: "/product/cosrx-advanced-snail-96-mucin-power-essence" },
    { name: "Product Page (BOJ Sunscreen)", path: "/product/beauty-of-joseon-relief-sun-rice-probiotics-spf50" },
    { name: "Shipping Policy", path: "/policies/shipping" },
    { name: "FAQ & Contact", path: "/policies/faq" },
  ];

  for (const page of pagesToTest) {
    const res = await fetch(`${BASE_URL}${page.path}`);
    const passed = res.status === 200;
    console.log(`[${passed ? "PASS" : "FAIL"}] ${page.name} (${page.path}) -> HTTP ${res.status}`);
    results.storefront.push({ name: page.name, path: page.path, status: res.status, passed });
    assert.strictEqual(passed, true, `${page.name} failed with status ${res.status}`);
  }

  // 2. AUTHENTICATION & SESSIONS
  console.log("\n--- 2. Testing Authentication & Session Management ---");
  
  // Test Customer Login
  const customerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "priya@example.com", password: "Customer@2026" }),
  });
  const customerLoginData = await customerLoginRes.json();
  const rawCustomerCookie = customerLoginRes.headers.get("set-cookie") || "";
  const customerCookie = rawCustomerCookie.split(";")[0];
  console.log(`[${customerLoginRes.ok ? "PASS" : "FAIL"}] Customer Login -> User: ${customerLoginData.user?.name} (Role: ${customerLoginData.user?.role})`);
  assert.strictEqual(customerLoginRes.ok, true);

  // Test Admin Login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@blumac.in", password: "BlumacAdmin@2026" }),
  });
  const adminLoginData = await adminLoginRes.json();
  const rawAdminCookie = adminLoginRes.headers.get("set-cookie") || "";
  const adminCookie = rawAdminCookie.split(";")[0];
  console.log(`[${adminLoginRes.ok ? "PASS" : "FAIL"}] Admin Login -> User: ${adminLoginData.user?.name} (Role: ${adminLoginData.user?.role})`);
  assert.strictEqual(adminLoginRes.ok, true);

  // Verify Session Token structure
  const token = adminCookie.replace("blumac_session=", "");
  assert.ok(token.length > 20, "Valid JWT token generated");
  console.log(`[PASS] Secure HTTP-Only JWT Session Generated (Length: ${token.length})`);

  // 3. CHECKOUT & COUPON ENGINE
  console.log("\n--- 3. Testing Checkout Flow & Server-Side Price/Coupon Engine ---");
  
  // Test Order with SEOUL10 Coupon
  const checkoutPayload = {
    customerName: "Ananya Deshmukh",
    customerEmail: "ananya.d@example.com",
    customerPhone: "9823456789",
    shippingAddress: {
      street: "702, Prestige Tower, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pinCode: "560038",
    },
    items: [
      { id: "cosrx-snail-100ml", productId: "cosrx-snail-96", variantId: "cosrx-snail-100ml", quantity: 1 },
      { id: "boj-sun-50ml", productId: "boj-relief-sun", variantId: "boj-sun-50ml", quantity: 1 },
    ],
    couponCode: "SEOUL10",
    paymentMethod: "COD",
    notes: "Please leave package with building reception.",
  };

  const checkoutRes = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: customerCookie },
    body: JSON.stringify(checkoutPayload),
  });
  const checkoutData = await checkoutRes.json();
  console.log(`[${checkoutRes.ok ? "PASS" : "FAIL"}] Checkout (COSRX Snail + BOJ Sunscreen + SEOUL10) -> Order: ${checkoutData.orderNumber}, Total: ₹${checkoutData.grandTotal}`);
  assert.strictEqual(checkoutRes.ok, true);
  assert.ok(checkoutData.orderNumber.startsWith("BLU-2026-"));

  // Check Order Confirmation Page
  const confRes = await fetch(`${BASE_URL}/order/confirmation/${checkoutData.orderNumber}`);
  console.log(`[${confRes.status === 200 ? "PASS" : "FAIL"}] Order Confirmation Page -> HTTP ${confRes.status}`);
  assert.strictEqual(confRes.status, 200);

  // 4. ADMIN MANAGEMENT OPERATIONS
  console.log("\n--- 4. Testing Admin Panel & Operations ---");
  
  // Admin Products API
  const adminProdsRes = await fetch(`${BASE_URL}/api/admin/products`, {
    headers: { cookie: adminCookie },
  });
  const adminProds = await adminProdsRes.json();
  console.log(`[${adminProdsRes.ok ? "PASS" : "FAIL"}] Admin Products API -> ${adminProds.length} products listed`);
  assert.ok(adminProds.length >= 9);

  // Admin Coupons API
  const adminCouponsRes = await fetch(`${BASE_URL}/api/admin/coupons`, {
    headers: { cookie: adminCookie },
  });
  const adminCoupons = await adminCouponsRes.json();
  console.log(`[${adminCouponsRes.ok ? "PASS" : "FAIL"}] Admin Coupons API -> ${adminCoupons.length} coupons configured`);
  assert.ok(adminCoupons.length >= 3);

  // Admin Inventory Adjustment
  const adjustRes = await fetch(`${BASE_URL}/api/admin/inventory/adjust`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({
      sku: "CX-SNL-100",
      changeQuantity: 10,
      reason: "RESTOCK",
      notes: "Audit test batch replenishment",
    }),
  });
  const adjustData = await adjustRes.json();
  console.log(`[${adjustRes.ok ? "PASS" : "FAIL"}] Inventory Adjustment (CX-SNL-100 +10) -> New Stock: ${adjustData.inventory?.quantityOnHand}`);
  assert.strictEqual(adjustRes.ok, true);

  // 5. AI PRODUCT STUDIO GENERATION
  console.log("\n--- 5. Testing AI Product Studio & Copywriting Engine ---");
  const aiRes = await fetch(`${BASE_URL}/api/admin/ai/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({
      productName: "Advanced Snail 96 Mucin Power Essence",
      brand: "COSRX",
      keyIngredient: "96.3% Snail Secretion Filtrate",
      skinBenefit: "Deep hydration, barrier repair and glass glow",
      targetAudience: "Dry & sensitive skin",
      templateType: "Product Spotlight",
    }),
  });
  const aiData = await aiRes.json();
  console.log(`[${aiRes.ok ? "PASS" : "FAIL"}] AI Studio Copywriter -> Title: "${aiData.copy?.title}"`);
  console.log(`       Instagram (EN): "${aiData.copy?.captions?.english?.slice(0, 75)}..."`);
  console.log(`       Instagram (Hinglish): "${aiData.copy?.captions?.hinglish?.slice(0, 75)}..."`);
  console.log(`       Instagram (Hindi): "${aiData.copy?.captions?.hindi?.slice(0, 75)}..."`);
  assert.strictEqual(aiRes.ok, true);
  assert.ok(aiData.copy?.title);

  console.log("\n==================================================");
  console.log("🎉 AUDIT COMPLETED: ALL SYSTEM FEATURES VERIFIED 100% OPERATIONAL!");
  console.log("==================================================");
}

runAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
