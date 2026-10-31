import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        variants: { include: { inventory: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      name,
      slug,
      brandId,
      categoryId,
      subcategory,
      price,
      mrp,
      sku,
      stock,
      images,
      shortDescription,
      description,
      isBestSeller = false,
      isTrending = false,
      isNewArrival = true,
      skinType = ["All Skin Types"],
      concerns = ["Hydration"],
      keyIngredients = [{ name: "Korean Botanical Extract", benefit: "Calming hydration" }],
      fullIngredients = "Purified Water, Glycerin, Active Korean Plant Extracts.",
      howToUse = "Dispense an appropriate amount and gently pat onto face until absorbed.",
    } = body;

    if (!name || !price || !mrp) {
      return NextResponse.json(
        { error: "Name, selling price, and MRP are required." },
        { status: 400 }
      );
    }

    // Auto-generate clean slug if not given
    const finalSlug = (
      slug ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
    ) + (body.slugSuffix ? `-${Date.now().toString().slice(-4)}` : "");

    // Process images
    const imageList = Array.isArray(images) && images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        ];

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        brandId: brandId || null,
        categoryId: categoryId || null,
        subcategory: subcategory || "Skincare",
        price: parseFloat(price.toString()),
        mrp: parseFloat(mrp.toString()),
        shortDescription: shortDescription || `${name} imported directly from Seoul, South Korea.`,
        description: description || `${name} delivers pure Korean glass skin luminosity with premium botanical extracts.`,
        images: JSON.stringify(imageList),
        skinType: JSON.stringify(Array.isArray(skinType) ? skinType : [skinType]),
        concerns: JSON.stringify(Array.isArray(concerns) ? concerns : [concerns]),
        keyIngredients: JSON.stringify(keyIngredients),
        fullIngredients,
        howToUse,
        status: "ACTIVE",
        inStock: true,
        isBestSeller: Boolean(isBestSeller),
        isTrending: Boolean(isTrending),
        isNewArrival: Boolean(isNewArrival),
        variants: {
          create: {
            sku: sku || `BLU-${name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            size: body.size || "Standard",
            price: parseFloat(price.toString()),
            mrp: parseFloat(mrp.toString()),
            inventory: {
              create: {
                quantityOnHand: parseInt(stock?.toString() || "30"),
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

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user?.id || "admin",
          action: "PRODUCT_CREATED",
          resource: `Product:${product.id}`,
          details: `Created SKU ${product.variants[0]?.sku} (${product.name}) - BestSeller: ${isBestSeller}, Trending: ${isTrending}`,
        },
      });
    } catch {
      // ignore audit log failure
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
