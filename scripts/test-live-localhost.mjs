// End-to-end test script for Localhost
const BASE_URL = "http://localhost:3000";

async function runLiveTests() {
  console.log(`🔍 Probing ${BASE_URL}...`);
  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Homepage Response
  await check("Homepage serves HTTP 200 with Brand & Hero", async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const text = await res.text();
    if (!text.includes("Korean Skincare") && !text.includes("BLUMAC")) {
      throw new Error("Homepage content missing brand keywords");
    }
  });

  // 2. Store Settings API
  await check("Store settings API (/api/store/settings) responds 200 with payment toggles", async () => {
    const res = await fetch(`${BASE_URL}/api/store/settings`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (typeof data.enableCod === "undefined") throw new Error("enableCod field missing");
    if (typeof data.enableRazorpay === "undefined") throw new Error("enableRazorpay field missing");
  });

  // 3. Admin Homepage Route Protected (401 without auth)
  await check("Admin Homepage API (/api/admin/homepage) returns 401 without auth", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/homepage`);
    if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
  });

  // 4. Admin Login & Cookie Retrieval
  let authCookie = "";
  await check("Admin Login (/api/admin/auth/login)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@blumac.in",
        password: "BlumacAdmin@2026",
      }),
    });
    if (!res.ok) throw new Error(`Login failed with HTTP ${res.status}`);
    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) throw new Error("set-cookie header missing on login");
    authCookie = setCookie.split(";")[0];
  });

  // 5. Authenticated Admin Homepage GET
  await check("Authenticated Admin can read homepage config (/api/admin/homepage)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/homepage`, {
      headers: { Cookie: authCookie },
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.hero || !data.heroCard || !data.pillars) {
      throw new Error("Invalid homepage config structure");
    }
  });

  // 6. Authenticated Admin Homepage POST (Custom Banner Update)
  await check("Authenticated Admin can update homepage banner & hero card", async () => {
    const updatedPayload = {
      hero: {
        badge: "Special Seoul Import Batch 2026",
        titlePrefix: "Experience Exclusive",
        titleHighlight: "Glass Skin Rituals",
        titleSuffix: "in India",
        description: "Direct authentic shipments tested & verified for Indian climate.",
        primaryCtaText: "Shop New Arrivals",
        primaryCtaLink: "/shop",
        secondaryCtaText: "Trending Now 🔥",
        secondaryCtaLink: "/shop?sort=trending",
        stat1Value: "100%",
        stat1Label: "Seoul Sourced",
        stat2Value: "₹999+",
        stat2Label: "Free Express Shipping",
        stat3Value: "4.9 ★",
        stat3Label: "50k+ Happy Customers",
      },
      heroCard: {
        imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80",
        badgeText: "100% Verified Authentic",
        tag: "Seasonal Favorite",
        title: "Skit Goat Milk Serum",
        subtitle: "Hydrating & Barrier Restoring Serum",
        ctaText: "Explore",
        ctaLink: "/shop",
      },
      pillars: [
        { title: "Genuine Import", desc: "Direct from South Korea." },
        { title: "Pan-India Express", desc: "Fast delivery to 19,000+ PIN codes." },
        { title: "Easy Returns", desc: "Hassle-free replacement policy." },
        { title: "Dermatologist Approved", desc: "Tested for sensitive and Indian skin." },
      ],
    };

    const res = await fetch(`${BASE_URL}/api/admin/homepage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify(updatedPayload),
    });
    if (!res.ok) throw new Error(`Update failed with HTTP ${res.status}`);
  });

  // 7. Verify Storefront Reflects Updates Instantly
  await check("Storefront Homepage reflects updated banner text immediately", async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const text = await res.text();
    if (!text.includes("Glass Skin Rituals")) {
      throw new Error("Updated highlight 'Glass Skin Rituals' not found on storefront");
    }
    if (!text.includes("Special Seoul Import Batch 2026")) {
      throw new Error("Updated badge 'Special Seoul Import Batch 2026' not found on storefront");
    }
  });

  // 8. Restore Default BLUMAC Configuration
  await check("Admin can restore default configuration", async () => {
    const defaultPayload = {
      hero: {
        badge: "Direct from Seoul, South Korea • 100% Genuine",
        titlePrefix: "The Pinnacle of",
        titleHighlight: "Korean Skincare",
        titleSuffix: "in India",
        description: "Curated cult-favorite formulations scientifically proven to repair your skin barrier, calm inflammation, and unlock the coveted Korean glass skin luminosity.",
        primaryCtaText: "Shop Best Sellers",
        primaryCtaLink: "/shop",
        secondaryCtaText: "Trending in Seoul 🔥",
        secondaryCtaLink: "/shop?sort=trending",
        stat1Value: "100%",
        stat1Label: "Authentic Import",
        stat2Value: "₹999+",
        stat2Label: "Free All-India Shipping",
        stat3Value: "4.9 ★",
        stat3Label: "Loved by 30k+ Indian Users",
      },
      heroCard: {
        imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80",
        badgeText: "Verified Batch Codes",
        tag: "Cult Favorite",
        title: "Beauty of Joseon Relief Sun",
        subtitle: "Rice + Probiotics SPF50+ PA++++",
        ctaText: "View",
        ctaLink: "/product/beauty-of-joseon-relief-sun-rice-probiotics-spf50",
      },
      pillars: [
        { title: "100% Genuine Imports", desc: "Direct from Seoul with Indian customs compliance." },
        { title: "Pan-India Delivery", desc: "Free shipping on orders above ₹999 across all PIN codes." },
        { title: "Easy Return Policy", desc: "Hassle-free replacements for damaged or incorrect items." },
        { title: "Curated for India", desc: "Specially selected for Indian humidity and skin concerns." },
      ],
    };

    const res = await fetch(`${BASE_URL}/api/admin/homepage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify(defaultPayload),
    });
    if (!res.ok) throw new Error(`Reset failed with HTTP ${res.status}`);
  });

  // 9. Verify Storefront has Default Restored
  await check("Storefront Homepage has default configuration restored", async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const text = await res.text();
    if (!text.includes("The Pinnacle of") || !text.includes("Korean Skincare")) {
      throw new Error("Default title not found on storefront");
    }
  });

  console.log(`\n🎉 All End-to-End Live Tests Passed: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runLiveTests();
