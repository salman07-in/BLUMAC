import test from "node:test";
import assert from "node:assert/strict";

const DEFAULT_HOMEPAGE_CONFIG = {
  hero: {
    badge: "Direct from Seoul, South Korea • 100% Genuine",
    titlePrefix: "The Pinnacle of",
    titleHighlight: "Korean Skincare",
    titleSuffix: "in India",
    description:
      "Curated cult-favorite formulations scientifically proven to repair your skin barrier, calm inflammation, and unlock the coveted Korean glass skin luminosity.",
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
    imageUrl:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80",
    badgeText: "Verified Batch Codes",
    tag: "Cult Favorite",
    title: "Beauty of Joseon Relief Sun",
    subtitle: "Rice + Probiotics SPF50+ PA++++",
    ctaText: "View",
    ctaLink: "/product/beauty-of-joseon-relief-sun-rice-probiotics-spf50",
  },
  pillars: [
    {
      title: "100% Genuine Imports",
      desc: "Direct from Seoul with Indian customs compliance.",
    },
    {
      title: "Pan-India Delivery",
      desc: "Free shipping on orders above ₹999 across all PIN codes.",
    },
    {
      title: "Easy Return Policy",
      desc: "Hassle-free replacements for damaged or incorrect items.",
    },
    {
      title: "Curated for India",
      desc: "Specially selected for Indian humidity and skin concerns.",
    },
  ],
};

function parseHomepageConfig(rawJson) {
  if (!rawJson) return DEFAULT_HOMEPAGE_CONFIG;
  try {
    const parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
    return {
      hero: {
        ...DEFAULT_HOMEPAGE_CONFIG.hero,
        ...(parsed.hero || {}),
      },
      heroCard: {
        ...DEFAULT_HOMEPAGE_CONFIG.heroCard,
        ...(parsed.heroCard || {}),
      },
      pillars:
        Array.isArray(parsed.pillars) && parsed.pillars.length === 4
          ? parsed.pillars
          : DEFAULT_HOMEPAGE_CONFIG.pillars,
    };
  } catch {
    return DEFAULT_HOMEPAGE_CONFIG;
  }
}

function sanitizeHomepagePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid configuration payload");
  }

  return {
    hero: {
      badge: String(body.hero?.badge || DEFAULT_HOMEPAGE_CONFIG.hero.badge).trim(),
      titlePrefix: String(body.hero?.titlePrefix || DEFAULT_HOMEPAGE_CONFIG.hero.titlePrefix).trim(),
      titleHighlight: String(body.hero?.titleHighlight || DEFAULT_HOMEPAGE_CONFIG.hero.titleHighlight).trim(),
      titleSuffix: String(body.hero?.titleSuffix || DEFAULT_HOMEPAGE_CONFIG.hero.titleSuffix).trim(),
      description: String(body.hero?.description || DEFAULT_HOMEPAGE_CONFIG.hero.description).trim(),
      primaryCtaText: String(body.hero?.primaryCtaText || DEFAULT_HOMEPAGE_CONFIG.hero.primaryCtaText).trim(),
      primaryCtaLink: String(body.hero?.primaryCtaLink || DEFAULT_HOMEPAGE_CONFIG.hero.primaryCtaLink).trim(),
      secondaryCtaText: String(body.hero?.secondaryCtaText || DEFAULT_HOMEPAGE_CONFIG.hero.secondaryCtaText).trim(),
      secondaryCtaLink: String(body.hero?.secondaryCtaLink || DEFAULT_HOMEPAGE_CONFIG.hero.secondaryCtaLink).trim(),
      stat1Value: String(body.hero?.stat1Value || DEFAULT_HOMEPAGE_CONFIG.hero.stat1Value).trim(),
      stat1Label: String(body.hero?.stat1Label || DEFAULT_HOMEPAGE_CONFIG.hero.stat1Label).trim(),
      stat2Value: String(body.hero?.stat2Value || DEFAULT_HOMEPAGE_CONFIG.hero.stat2Value).trim(),
      stat2Label: String(body.hero?.stat2Label || DEFAULT_HOMEPAGE_CONFIG.hero.stat2Label).trim(),
      stat3Value: String(body.hero?.stat3Value || DEFAULT_HOMEPAGE_CONFIG.hero.stat3Value).trim(),
      stat3Label: String(body.hero?.stat3Label || DEFAULT_HOMEPAGE_CONFIG.hero.stat3Label).trim(),
    },
    heroCard: {
      imageUrl: String(body.heroCard?.imageUrl || DEFAULT_HOMEPAGE_CONFIG.heroCard.imageUrl).trim(),
      badgeText: String(body.heroCard?.badgeText || DEFAULT_HOMEPAGE_CONFIG.heroCard.badgeText).trim(),
      tag: String(body.heroCard?.tag || DEFAULT_HOMEPAGE_CONFIG.heroCard.tag).trim(),
      title: String(body.heroCard?.title || DEFAULT_HOMEPAGE_CONFIG.heroCard.title).trim(),
      subtitle: String(body.heroCard?.subtitle || DEFAULT_HOMEPAGE_CONFIG.heroCard.subtitle).trim(),
      ctaText: String(body.heroCard?.ctaText || DEFAULT_HOMEPAGE_CONFIG.heroCard.ctaText).trim(),
      ctaLink: String(body.heroCard?.ctaLink || DEFAULT_HOMEPAGE_CONFIG.heroCard.ctaLink).trim(),
    },
    pillars:
      Array.isArray(body.pillars) && body.pillars.length === 4
        ? body.pillars.map((p, idx) => ({
            title: String(p?.title || DEFAULT_HOMEPAGE_CONFIG.pillars[idx].title).trim(),
            desc: String(p?.desc || DEFAULT_HOMEPAGE_CONFIG.pillars[idx].desc).trim(),
          }))
        : DEFAULT_HOMEPAGE_CONFIG.pillars,
  };
}

// TESTS
test("Homepage Customizer - 1. Default fallback on null / undefined / empty string", () => {
  assert.deepEqual(parseHomepageConfig(null), DEFAULT_HOMEPAGE_CONFIG);
  assert.deepEqual(parseHomepageConfig(undefined), DEFAULT_HOMEPAGE_CONFIG);
  assert.deepEqual(parseHomepageConfig(""), DEFAULT_HOMEPAGE_CONFIG);
});

test("Homepage Customizer - 2. Error recovery on corrupted JSON string", () => {
  const corrupted = '{"hero": { "titlePrefix": "Broken JSON...';
  const parsed = parseHomepageConfig(corrupted);
  assert.deepEqual(parsed, DEFAULT_HOMEPAGE_CONFIG);
});

test("Homepage Customizer - 3. Partial Hero overrides preserve unedited defaults", () => {
  const custom = {
    hero: {
      titleHighlight: "Luxury K-Beauty",
      primaryCtaText: "Explore Now",
    },
  };
  const parsed = parseHomepageConfig(JSON.stringify(custom));
  assert.equal(parsed.hero.titleHighlight, "Luxury K-Beauty");
  assert.equal(parsed.hero.primaryCtaText, "Explore Now");
  // Default fields must remain intact
  assert.equal(parsed.hero.badge, DEFAULT_HOMEPAGE_CONFIG.hero.badge);
  assert.equal(parsed.hero.stat1Value, DEFAULT_HOMEPAGE_CONFIG.hero.stat1Value);
  assert.equal(parsed.heroCard.title, DEFAULT_HOMEPAGE_CONFIG.heroCard.title);
  assert.equal(parsed.pillars.length, 4);
});

test("Homepage Customizer - 4. Hero Card photo & link customization", () => {
  const custom = {
    heroCard: {
      imageUrl: "/uploads/products/skit-goat-milk-hero.png",
      badgeText: "100% Authentic",
      tag: "Best Seller",
      title: "Skit Goat Milk Serum",
      subtitle: "Hydrating & Barrier Restoring Serum",
      ctaText: "Buy Now",
      ctaLink: "/product/skit-goat-milk-serum",
    },
  };
  const sanitized = sanitizeHomepagePayload(custom);
  assert.equal(sanitized.heroCard.imageUrl, "/uploads/products/skit-goat-milk-hero.png");
  assert.equal(sanitized.heroCard.title, "Skit Goat Milk Serum");
  assert.equal(sanitized.heroCard.ctaLink, "/product/skit-goat-milk-serum");
});

test("Homepage Customizer - 5. Pillars customization with 4 elements", () => {
  const customPillars = [
    { title: "Same Day Dispatch", desc: "Ships within 24 hours from Mumbai hub." },
    { title: "Direct Import", desc: "Imported from South Korea verified distributors." },
    { title: "COD Available", desc: "Pay with cash at your doorstep." },
    { title: "Dermatologist Tested", desc: "Clean formulations approved for sensitive skin." },
  ];
  const sanitized = sanitizeHomepagePayload({ pillars: customPillars });
  assert.equal(sanitized.pillars.length, 4);
  assert.equal(sanitized.pillars[0].title, "Same Day Dispatch");
  assert.equal(sanitized.pillars[3].title, "Dermatologist Tested");
});

test("Homepage Customizer - 6. Invalid pillars length falls back to defaults safely", () => {
  const invalidPillars = [
    { title: "Only 1 pillar", desc: "Missing the other 3" },
  ];
  const sanitized = sanitizeHomepagePayload({ pillars: invalidPillars });
  assert.deepEqual(sanitized.pillars, DEFAULT_HOMEPAGE_CONFIG.pillars);
});
