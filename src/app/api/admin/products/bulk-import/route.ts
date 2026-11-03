import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

interface RawProductInput {
  name: string;
  price: number | string;
  mrp?: number | string;
  description?: string;
  shortDescription?: string;
  category?: string;
  brand?: string;
  images?: string[] | string;
  stock?: number | string;
  sku?: string;
  size?: string;
  isBestSeller?: boolean;
  isTrending?: boolean;
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    const body = await req.json();
    const { items, defaultCategoryId, defaultBrandId } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No products provided for import." },
        { status: 400 }
      );
    }

    // Preload brands and categories to map names or fallback
    const allCategories = await prisma.category.findMany();
    const allBrands = await prisma.brand.findMany();

    const categoryMap = new Map(
      allCategories.map((c) => [c.name.toLowerCase().trim(), c.id])
    );
    const brandMap = new Map(
      allBrands.map((b) => [b.name.toLowerCase().trim(), b.id])
    );

    const fallbackCatId = defaultCategoryId || allCategories[0]?.id || null;
    const fallbackBrandId = defaultBrandId || allBrands[0]?.id || null;

    const importedProducts = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item: RawProductInput = items[i];

      const cleanName = (item.name || "").trim();
      if (!cleanName) {
        errors.push({ index: i, error: "Missing product name" });
        continue;
      }

      const numPrice = typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
      let numMrp = typeof item.mrp === "number" ? item.mrp : parseFloat(String(item.mrp || "").replace(/[^0-9.]/g, "")) || 0;

      if (numMrp <= 0 || numMrp < numPrice) {
        // default MRP to ~15% higher if missing
        numMrp = Math.round(numPrice * 1.15) || numPrice;
      }

      // Format Images
      let imageList: string[] = [];
      if (Array.isArray(item.images)) {
        imageList = item.images.filter((img) => typeof img === "string" && img.trim().length > 0);
      } else if (typeof item.images === "string" && item.images.trim()) {
        imageList = item.images.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (imageList.length === 0) {
        imageList = [
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        ];
      }

      // Generate Unique Slug
      let baseSlug = cleanName
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .slice(0, 50);
      if (!baseSlug) baseSlug = "product";
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.product.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}-${counter++}`;
      }

      // Match or Create Category
      let matchedCategoryId = fallbackCatId;
      if (item.category && item.category.trim()) {
        const catKey = item.category.toLowerCase().trim();
        if (categoryMap.has(catKey)) {
          matchedCategoryId = categoryMap.get(catKey)!;
        } else {
          try {
            const catSlug = catKey.replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
            const newCat = await prisma.category.create({
              data: {
                name: item.category.trim(),
                slug: `${catSlug}-${Date.now().toString().slice(-4)}`,
                description: `${item.category.trim()} collection`,
              },
            });
            categoryMap.set(catKey, newCat.id);
            matchedCategoryId = newCat.id;
          } catch {
            matchedCategoryId = fallbackCatId;
          }
        }
      }

      // Match or Create Brand
      let matchedBrandId = fallbackBrandId;
      if (item.brand && item.brand.trim()) {
        const brandKey = item.brand.toLowerCase().trim();
        if (brandMap.has(brandKey)) {
          matchedBrandId = brandMap.get(brandKey)!;
        } else {
          try {
            const bSlug = brandKey.replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
            const newBrand = await prisma.brand.create({
              data: {
                name: item.brand.trim(),
                slug: `${bSlug}-${Date.now().toString().slice(-4)}`,
                origin: "Seoul, South Korea",
              },
            });
            brandMap.set(brandKey, newBrand.id);
            matchedBrandId = newBrand.id;
          } catch {
            matchedBrandId = fallbackBrandId;
          }
        }
      }

      const desc = item.description?.trim() || `${cleanName} - authentic formulation with premium ingredients.`;
      const shortDesc = item.shortDescription?.trim() || (desc.length > 120 ? desc.slice(0, 117) + "..." : desc);
      const stockQty = typeof item.stock === "number" ? item.stock : parseInt(String(item.stock || "30")) || 30;
      const skuCode = item.sku?.trim() || `BLU-${cleanName.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "WA"}-${Math.floor(1000 + Math.random() * 9000)}`;

      try {
        const newProduct = await prisma.product.create({
          data: {
            name: cleanName,
            slug,
            brandId: matchedBrandId,
            categoryId: matchedCategoryId,
            subcategory: "Imported Catalog",
            price: numPrice,
            mrp: numMrp,
            shortDescription: shortDesc,
            description: desc,
            images: JSON.stringify(imageList),
            skinType: JSON.stringify(["All Skin Types"]),
            concerns: JSON.stringify(["Hydration", "Skin Radiance"]),
            keyIngredients: JSON.stringify([{ name: "Korean Botanical Extract", benefit: "Calming hydration" }]),
            fullIngredients: "Purified Water, Glycerin, Active Plant Extracts.",
            howToUse: "Apply an appropriate amount and massage gently until absorbed.",
            status: "ACTIVE",
            inStock: true,
            isBestSeller: Boolean(item.isBestSeller),
            isTrending: Boolean(item.isTrending),
            isNewArrival: true,
            variants: {
              create: {
                sku: skuCode,
                size: item.size?.trim() || "Standard",
                price: numPrice,
                mrp: numMrp,
                inventory: {
                  create: {
                    quantityOnHand: stockQty,
                    reservedQuantity: 0,
                    lowStockThreshold: 5,
                  },
                },
              },
            },
          },
          include: {
            brand: true,
            category: true,
            variants: { include: { inventory: true } },
          },
        });

        importedProducts.push(newProduct);
      } catch (err: any) {
        console.error(`Failed to import item "${cleanName}":`, err);
        errors.push({ index: i, name: cleanName, error: err.message });
      }
    }

    // Log audit
    if (importedProducts.length > 0) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user?.id || "admin",
            action: "PRODUCTS_BULK_IMPORT",
            resource: `ImportedCount:${importedProducts.length}`,
            details: `Imported ${importedProducts.length} items from external catalog/CSV. Failed: ${errors.length}`,
          },
        });
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: importedProducts.length,
      failedCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      products: importedProducts,
    });
  } catch (error: any) {
    console.error("Bulk import critical error:", error);
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to process bulk import" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
