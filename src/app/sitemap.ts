import type { MetadataRoute } from "next";
import { PRODUCTS, CATEGORIES } from "@/lib/products";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://blumac.in";
  const now = new Date();

  // Static core routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/policies/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policies/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policies/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policies/shipping`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policies/returns`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policies/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/policies/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Category routes
  for (const cat of CATEGORIES) {
    routes.push({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  // Product routes (DB with static fallback)
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    });

    if (dbProducts.length > 0) {
      for (const p of dbProducts) {
        routes.push({
          url: `${baseUrl}/product/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "daily",
          priority: 0.9,
        });
      }
      return routes;
    }
  } catch {
    // If DB unavailable during static build, fall back gracefully
  }

  // Fallback to static products
  for (const p of PRODUCTS) {
    routes.push({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  return routes;
}

