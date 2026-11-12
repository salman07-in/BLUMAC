export interface HomepageConfig {
  hero: {
    badge: string;
    titlePrefix: string;
    titleHighlight: string;
    titleSuffix: string;
    description: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
  };
  heroCard: {
    imageUrl: string;
    badgeText: string;
    tag: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
  pillars: Array<{
    title: string;
    desc: string;
  }>;
}

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
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

export function parseHomepageConfig(rawJson: string | null | undefined): HomepageConfig {
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
