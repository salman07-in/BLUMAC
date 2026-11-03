import { prisma } from "@/lib/db";
import { PRODUCTS, Product } from "@/lib/products";

export function mapDbProduct(p: any): Product {
  let images: string[] = [];
  try {
    images = JSON.parse(p.images || "[]");
  } catch {
    images = [
      p.images ||
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    ];
  }
  if (!images.length) {
    images = [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    ];
  }

  let skinType: string[] = ["All Skin Types"];
  try {
    skinType = JSON.parse(p.skinType || "[]");
  } catch {}

  let concerns: string[] = ["Hydration"];
  try {
    concerns = JSON.parse(p.concerns || "[]");
  } catch {}

  let keyIngredients: { name: string; benefit: string }[] = [];
  try {
    keyIngredients = JSON.parse(p.keyIngredients || "[]");
  } catch {}

  const variant = p.variants?.[0];
  const stock = variant?.inventory?.quantityOnHand ?? 25;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand?.name || "K-Beauty",
    category: p.category?.name || "Serums & Ampoules",
    categorySlug: p.category?.slug || "serums-ampoules",
    subcategory: p.subcategory || "Skincare",
    shortDescription: p.shortDescription || p.name,
    description: p.description || p.name,
    mrp: p.mrp,
    price: p.price,
    rating: p.rating || 5.0,
    reviewCount: p.reviewCount || 1,
    images,
    skinType: skinType.length ? skinType : ["All Skin Types"],
    concerns: concerns.length ? concerns : ["Hydration"],
    keyIngredients:
      keyIngredients.length > 0
        ? keyIngredients
        : [
            {
              name: "Korean Botanical Extract",
              benefit: "Calming hydration",
            },
          ],
    fullIngredients:
      p.fullIngredients ||
      "Purified Water, Glycerin, Active Korean Plant Extracts.",
    howToUse:
      p.howToUse || "Apply after cleansing and pat gently onto skin.",
    cautions: p.cautions || "For external use only.",
    variants: [
      {
        id: variant?.id || "var-1",
        sku: variant?.sku || "SKU-STD",
        size: variant?.size || "Standard",
        price: variant?.price || p.price,
        mrp: variant?.mrp || p.mrp,
        stock,
      },
    ],
    isBestSeller: Boolean(p.isBestSeller),
    isNewArrival: Boolean(p.isNewArrival),
    isTrending: Boolean(p.isTrending),
    inStock: p.inStock && stock > 0,
  };
}

export async function getStoreProducts(): Promise<Product[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        brand: true,
        category: true,
        variants: { include: { inventory: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbProducts.length > 0) {
      return dbProducts.map(mapDbProduct);
    }
  } catch (err) {
    console.error("Database product fetch error:", err);
  }
  return PRODUCTS;
}

export async function getStoreBestSellers(): Promise<Product[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "ACTIVE", isBestSeller: true },
      include: {
        brand: true,
        category: true,
        variants: { include: { inventory: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbProducts.length > 0) {
      return dbProducts.map(mapDbProduct);
    }
  } catch (err) {
    console.error("Database best sellers error:", err);
  }
  return PRODUCTS.filter((p) => p.isBestSeller);
}

export async function getStoreTrending(): Promise<Product[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "ACTIVE", isTrending: true },
      include: {
        brand: true,
        category: true,
        variants: { include: { inventory: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbProducts.length > 0) {
      return dbProducts.map(mapDbProduct);
    }
  } catch (err) {
    console.error("Database trending error:", err);
  }
  return PRODUCTS.filter((p) => p.isTrending);
}

export async function getStoreProductBySlug(slug: string): Promise<Product | null> {
  try {
    const dbProduct = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        variants: { include: { inventory: true } },
      },
    });

    if (dbProduct) {
      return mapDbProduct(dbProduct);
    }
  } catch (err) {
    console.error("Database product by slug error:", err);
  }
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export async function getStoreProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (category) {
      const dbProducts = await prisma.product.findMany({
        where: { categoryId: category.id, status: "ACTIVE" },
        include: {
          brand: true,
          category: true,
          variants: { include: { inventory: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbProducts.length > 0) {
        return dbProducts.map(mapDbProduct);
      }
    }
  } catch (err) {
    console.error("Database category products error:", err);
  }
  return PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}
