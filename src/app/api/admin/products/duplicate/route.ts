import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const source = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: { include: { inventory: true } },
      },
    });

    if (!source) {
      return NextResponse.json({ error: "Source product not found" }, { status: 404 });
    }

    const timestampSuffix = Date.now().toString().slice(-4);
    const newName = `${source.name} (Copy)`;
    const newSlug = `${source.slug}-copy-${timestampSuffix}`;
    const primaryVariant = source.variants[0];
    const sourceSku = primaryVariant?.sku || "PRD";
    const newSku = `BLU-${sourceSku.replace(/^BLU-/, "").slice(0, 8)}-CPY${timestampSuffix}`;

    const duplicatedProduct = await prisma.product.create({
      data: {
        name: newName,
        slug: newSlug,
        brandId: source.brandId,
        categoryId: source.categoryId,
        subcategory: source.subcategory,
        shortDescription: source.shortDescription,
        description: source.description,
        price: source.price,
        mrp: source.mrp,
        rating: 5.0,
        reviewCount: 0,
        images: source.images,
        skinType: source.skinType,
        concerns: source.concerns,
        keyIngredients: source.keyIngredients,
        fullIngredients: source.fullIngredients,
        howToUse: source.howToUse,
        cautions: source.cautions,
        status: "DRAFT", // Start as draft so admin can edit before publishing
        isBestSeller: false,
        isTrending: false,
        isNewArrival: true,
        inStock: true,
        variants: {
          create: {
            sku: newSku,
            size: primaryVariant?.size || "Standard",
            price: primaryVariant?.price || source.price,
            mrp: primaryVariant?.mrp || source.mrp,
            inventory: {
              create: {
                quantityOnHand: primaryVariant?.inventory?.quantityOnHand ?? 20,
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

    try {
      await prisma.auditLog.create({
        data: {
          userId: user?.id || "admin",
          action: "PRODUCT_DUPLICATED",
          resource: `Product:${duplicatedProduct.id}`,
          details: `Duplicated "${source.name}" into "${newName}" with SKU ${newSku}.`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      product: duplicatedProduct,
      message: `Product duplicated successfully as draft: "${newName}"`,
    });
  } catch (error: any) {
    console.error("Duplicate product error:", error);
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to duplicate product" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

