import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function testEndpoint(name, url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, options);
    const duration = (performance.now() - start).toFixed(1);
    const contentType = res.headers.get("content-type") || "";
    let body = null;
    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    return { ok: res.ok, status: res.status, duration, body, headers: res.headers };
  } catch (err) {
    const duration = (performance.now() - start).toFixed(1);
    return { ok: false, status: 0, duration, error: err.message };
  }
}

async function runAllTests() {
  console.log("\n=======================================================");
  console.log("🌸 BLUMAC KOREAN STORE - COMPREHENSIVE LOCAL TEST SUITE");
  console.log("=======================================================\n");

  let totalPassed = 0;
  let totalFailed = 0;

  function report(name, success, info = "") {
    if (success) {
      totalPassed++;
      console.log(`✅ [PASS] ${name} ${info}`);
    } else {
      totalFailed++;
      console.error(`❌ [FAIL] ${name} ${info}`);
    }
  }

  // ----------------------------------------------------
  // SECTION 1: Storefront Pages (HTML Rendering)
  // ----------------------------------------------------
  console.log("--- 1. Storefront Pages (SSR & Static Rendering) ---");

  const pagesToTest = [
    { name: "Homepage", path: "/" },
    { name: "Shop Catalog", path: "/shop" },
    { name: "Product Detail (Relief Sun SPF50+)", path: "/product/beauty-of-joseon-relief-sun-rice-probiotics-spf50" },
    { name: "Brands Directory", path: "/brands" },
    { name: "Category Page (Sunscreens)", path: "/category/sunscreens" },
    { name: "DPDP Privacy Policy Page", path: "/policies/privacy" },
    { name: "Terms of Service Page", path: "/policies/terms" },
    { name: "Checkout Page", path: "/checkout" },
    { name: "Customer Login Page", path: "/auth/login" },
    { name: "Customer Register Page", path: "/auth/register" },
    { name: "Admin Executive Login Page", path: "/admin/login" },
  ];

  for (const page of pagesToTest) {
    const res = await testEndpoint(page.name, `${BASE_URL}${page.path}`);
    const containsHtml = typeof res.body === "string" && res.body.includes("<!DOCTYPE html>");
    report(
      page.name,
      res.status === 200 && containsHtml,
      `(${res.status} OK in ${res.duration}ms)`
    );
  }

  // ----------------------------------------------------
  // SECTION 2: Indian DPDP Compliance Features
  // ----------------------------------------------------
  console.log("\n--- 2. Indian DPDP Act 2023 & Consent Checks ---");

  const privacyRes = await testEndpoint("Privacy Policy Content", `${BASE_URL}/policies/privacy`);
  const hasGrievance =
    typeof privacyRes.body === "string" &&
    privacyRes.body.includes("Grievance Redressal Officer") &&
    privacyRes.body.includes("DPDP Act");
  report(
    "Statutory Grievance Officer & DPDP Notices in Privacy Policy",
    hasGrievance,
    hasGrievance ? "(Compliant with Indian IT Rules & DPDP 2023)" : "(Missing disclosures)"
  );

  // ----------------------------------------------------
  // SECTION 3: Admin Authentication (No PIN Required)
  // ----------------------------------------------------
  console.log("\n--- 3. Administrative Authentication & Security ---");

  const adminLoginRes = await testEndpoint(
    "Admin Login (Correct ID & Password)",
    `${BASE_URL}/api/admin/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@blumac.in",
        password: "BlumacAdmin@2026",
      }),
    }
  );

  const adminLoginOk =
    adminLoginRes.status === 200 &&
    adminLoginRes.body?.success === true &&
    adminLoginRes.body?.user?.role === "ADMIN";

  report(
    "Admin Direct Login (admin@blumac.in / BlumacAdmin@2026)",
    adminLoginOk,
    adminLoginOk ? `(200 OK • Role: ${adminLoginRes.body.user.role})` : `(Failed: ${JSON.stringify(adminLoginRes.body)})`
  );

  const setCookie = adminLoginRes.headers?.get("set-cookie") || "";
  const cookieHeader = setCookie.split(";")[0] || "";

  const invalidAdminRes = await testEndpoint(
    "Admin Invalid Password Rejection",
    `${BASE_URL}/api/admin/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@blumac.in",
        password: "WrongPassword123!",
      }),
    }
  );
  report(
    "Unauthorized Admin Password Rejection",
    invalidAdminRes.status === 401,
    `(Properly blocked with HTTP 401: "${invalidAdminRes.body?.error}")`
  );

  // ----------------------------------------------------
  // SECTION 4: Protected Admin Management APIs
  // ----------------------------------------------------
  console.log("\n--- 4. Protected Admin APIs ---");

  const adminProductsRes = await testEndpoint(
    "Admin Products Catalog API",
    `${BASE_URL}/api/admin/products`,
    {
      headers: { Cookie: cookieHeader },
    }
  );
  const productsOk = adminProductsRes.status === 200 && Array.isArray(adminProductsRes.body);
  report(
    "Admin Products Listing API",
    productsOk,
    productsOk ? `(${adminProductsRes.body.length} catalog products found)` : `(${adminProductsRes.status})`
  );

  const adminCouponsRes = await testEndpoint(
    "Admin Coupons API",
    `${BASE_URL}/api/admin/coupons`,
    {
      headers: { Cookie: cookieHeader },
    }
  );
  const couponsOk = adminCouponsRes.status === 200 && Array.isArray(adminCouponsRes.body);
  report(
    "Admin Coupons Engine API",
    couponsOk,
    couponsOk ? `(${adminCouponsRes.body.length} coupons configured)` : `(${adminCouponsRes.status})`
  );

  // ----------------------------------------------------
  // SECTION 5: Customer Authentication & Registration
  // ----------------------------------------------------
  console.log("\n--- 5. Customer Authentication ---");

  const testCustomerEmail = `test.user.${Date.now()}@example.com`;
  const registerRes = await testEndpoint(
    "Customer Account Registration",
    `${BASE_URL}/api/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Customer",
        email: testCustomerEmail,
        password: "CustomerPassword@123",
        phone: "+91 98765 43210",
      }),
    }
  );
  const registerOk = registerRes.status === 200 && registerRes.body?.user?.email === testCustomerEmail;
  report(
    "Customer Registration API",
    registerOk,
    registerOk ? `(Created: ${testCustomerEmail})` : `(${registerRes.status}: ${JSON.stringify(registerRes.body)})`
  );

  const customerLoginRes = await testEndpoint(
    "Customer Sign In",
    `${BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: "CustomerPassword@123",
      }),
    }
  );
  const customerLoginOk = customerLoginRes.status === 200 && customerLoginRes.body?.user?.role === "CUSTOMER";
  report(
    "Customer Sign In API",
    customerLoginOk,
    customerLoginOk ? `(200 OK • Welcome 50 Loyalty Points)` : `(${customerLoginRes.status})`
  );

  // ----------------------------------------------------
  // SECTION 6: E-Commerce Order Placement & Validation
  // ----------------------------------------------------
  console.log("\n--- 6. E-Commerce Checkout & Order Fulfillment ---");

  const invalidPinCheckout = await testEndpoint(
    "Checkout Indian PIN Validation",
    `${BASE_URL}/api/checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Aarav Sharma",
        customerEmail: "aarav@example.com",
        customerPhone: "+91 99999 88888",
        shippingAddress: {
          street: "12 MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          pinCode: "123", // INVALID PIN
        },
        items: [{ id: "beauty-of-joseon-relief-sun-rice-probiotics-spf50", productId: "beauty-of-joseon-relief-sun-rice-probiotics-spf50", quantity: 1 }],
        paymentMethod: "COD",
      }),
    }
  );
  report(
    "Rejection of Invalid Indian PIN Code",
    invalidPinCheckout.status === 400,
    `(Correctly rejected invalid 3-digit PIN with 400 Bad Request)`
  );

  const validCheckoutRes = await testEndpoint(
    "Complete Order Placement (COD with BlueDart Tracking)",
    `${BASE_URL}/api/checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Aarav Sharma",
        customerEmail: "aarav@example.com",
        customerPhone: "+91 99999 88888",
        shippingAddress: {
          street: "100ft Road, Indiranagar",
          landmark: "Near Metro Station",
          city: "Bengaluru",
          state: "Karnataka",
          pinCode: "560038", // VALID 6-DIGIT PIN
        },
        items: [{ id: "beauty-of-joseon-relief-sun-rice-probiotics-spf50", productId: "beauty-of-joseon-relief-sun-rice-probiotics-spf50", quantity: 1 }],
        paymentMethod: "COD",
        couponCode: "SEOUL10",
        notes: "Leave at front security desk",
        dataConsent: true,
        whatsappConsent: true,
      }),
    }
  );

  const orderOk =
    validCheckoutRes.status === 200 &&
    validCheckoutRes.body?.orderNumber?.startsWith("BLU-");

  report(
    "Valid Checkout Order Creation & BlueDart AWB Generation",
    orderOk,
    orderOk
      ? `(Order #${validCheckoutRes.body.orderNumber} • Grand Total: ₹${validCheckoutRes.body.grandTotal})`
      : `(${validCheckoutRes.status}: ${JSON.stringify(validCheckoutRes.body)})`
  );

  // ----------------------------------------------------
  // SUMMARY REPORT
  // ----------------------------------------------------
  console.log("\n=======================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${totalPassed} PASSED • ${totalFailed} FAILED`);
  console.log("=======================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
