import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/products/[id]
 * Fetch single product details with variants, inventory, and order reference check.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        variants: {
          include: {
            inventory: {
              include: {
                movements: {
                  take: 10,
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is associated with historical orders
    const historicalOrderCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    return NextResponse.json({
      product,
      hasHistoricalOrders: historicalOrderCount > 0,
      historicalOrderCount,
    });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Update product details, formulation, SEO, images, variants, and homepage badges.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: { include: { inventory: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const {
      name,
      slug,
      brandId,
      categoryId,
      subcategory,
      price,
      mrp,
      shortDescription,
      description,
      images,
      skinType,
      concerns,
      keyIngredients,
      fullIngredients,
      howToUse,
      cautions,
      status,
      isBestSeller,
      isTrending,
      isNewArrival,
      inStock,
      stock,
      size,
      sku,
      variants, // optional array of custom variants
    } = body;

    // Format fields safely
    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) {
      const cleanSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
      updateData.slug = cleanSlug;
    }
    if (brandId !== undefined) updateData.brandId = brandId || null;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (price !== undefined) updateData.price = parseFloat(price.toString());
    if (mrp !== undefined) updateData.mrp = parseFloat(mrp.toString());
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (description !== undefined) updateData.description = description;

    if (images !== undefined) {
      const imgList = Array.isArray(images)
        ? images
        : typeof images === "string"
        ? [images]
        : [];
      updateData.images = JSON.stringify(imgList);
    }

    if (skinType !== undefined) {
      updateData.skinType = JSON.stringify(
        Array.isArray(skinType) ? skinType : [skinType]
      );
    }
    if (concerns !== undefined) {
      updateData.concerns = JSON.stringify(
        Array.isArray(concerns) ? concerns : [concerns]
      );
    }
    if (keyIngredients !== undefined) {
      updateData.keyIngredients = JSON.stringify(
        Array.isArray(keyIngredients) ? keyIngredients : []
      );
    }
    if (fullIngredients !== undefined) updateData.fullIngredients = fullIngredients;
    if (howToUse !== undefined) updateData.howToUse = howToUse;
    if (cautions !== undefined) updateData.cautions = cautions;
    if (status !== undefined) updateData.status = status; // ACTIVE, ARCHIVED, DRAFT
    if (isBestSeller !== undefined) updateData.isBestSeller = Boolean(isBestSeller);
    if (isTrending !== undefined) updateData.isTrending = Boolean(isTrending);
    if (isNewArrival !== undefined) updateData.isNewArrival = Boolean(isNewArrival);
    if (inStock !== undefined) updateData.inStock = Boolean(inStock);

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Update product main record
      const prod = await tx.product.update({
        where: { id },
        data: updateData,
        include: {
          brand: true,
          category: true,
          variants: { include: { inventory: true } },
        },
      });

      // 2. Update default or first variant & inventory stock if provided
      const primaryVariant = prod.variants[0];
      if (primaryVariant) {
        const variantUpdate: any = {};
        if (size !== undefined) variantUpdate.size = size;
        if (sku !== undefined && sku.trim() !== "") variantUpdate.sku = sku.trim();
        if (price !== undefined) variantUpdate.price = parseFloat(price.toString());
        if (mrp !== undefined) variantUpdate.mrp = parseFloat(mrp.toString());

        if (Object.keys(variantUpdate).length > 0) {
          await tx.productVariant.update({
            where: { id: primaryVariant.id },
            data: variantUpdate,
          });
        }

        // If stock was updated directly
        if (stock !== undefined) {
          const newQty = Math.max(0, parseInt(stock.toString()));
          if (primaryVariant.inventory) {
            const currentQty = primaryVariant.inventory.quantityOnHand;
            const diff = newQty - currentQty;
            if (diff !== 0) {
              await tx.inventory.update({
                where: { id: primaryVariant.inventory.id },
                data: { quantityOnHand: newQty },
              });

              await tx.inventoryMovement.create({
                data: {
                  inventoryId: primaryVariant.inventory.id,
                  type: diff > 0 ? "RESTOCK" : "ADJUSTMENT",
                  quantity: diff,
                  reason: "ADMIN_PRODUCT_EDIT",
                },
              });
            }
          } else {
            await tx.inventory.create({
              data: {
                variantId: primaryVariant.id,
                quantityOnHand: newQty,
                reservedQuantity: 0,
                lowStockThreshold: 5,
              },
            });
          }
        }
      }

      // 3. Handle multiple variants if array passed
      if (Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          if (v.id) {
            // Update existing variant
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                sku: v.sku,
                size: v.size || "Standard",
                price: parseFloat(v.price?.toString() || prod.price.toString()),
                mrp: parseFloat(v.mrp?.toString() || prod.mrp.toString()),
              },
            });
            if (v.stock !== undefined && v.inventoryId) {
              await tx.inventory.update({
                where: { id: v.inventoryId },
                data: { quantityOnHand: Math.max(0, parseInt(v.stock.toString())) },
              });
            }
          } else if (v.sku) {
            // Create new variant
            await tx.productVariant.create({
              data: {
                productId: id,
                sku: v.sku,
                size: v.size || "Standard",
                price: parseFloat(v.price?.toString() || prod.price.toString()),
                mrp: parseFloat(v.mrp?.toString() || prod.mrp.toString()),
                inventory: {
                  create: {
                    quantityOnHand: Math.max(0, parseInt(v.stock?.toString() || "20")),
                    reservedQuantity: 0,
                    lowStockThreshold: 5,
                  },
                },
              },
            });
          }
        }
      }

      return await tx.product.findUnique({
        where: { id },
        include: {
          brand: true,
          category: true,
          variants: { include: { inventory: true } },
        },
      });
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user?.id || "admin",
          action: "PRODUCT_UPDATED",
          resource: `Product:${id}`,
          details: `Updated ${updatedProduct?.name} - Status: ${updatedProduct?.status}, Price: ₹${updatedProduct?.price}`,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("Update product error:", error);
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Safely delete a product.
 * If product is referenced in historical orders, archives it to protect order integrity.
 * If safe (no orders), permanently removes it.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await requireAdmin();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Safety Check: Historical Orders Protection
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      // Product has historical customer orders. Do NOT destroy order financial history!
      // Perform soft deletion / archival.
      const archived = await prisma.product.update({
        where: { id },
        data: {
          status: "ARCHIVED",
          inStock: false,
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
            action: "PRODUCT_ARCHIVED_SAFE_DELETE",
            resource: `Product:${id}`,
            details: `Product "${product.name}" is associated with ${orderItemsCount} historical order(s). Safely archived instead of destroying historical records.`,
          },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        archivedInstead: true,
        orderCount: orderItemsCount,
        message: `Product "${product.name}" is referenced in ${orderItemsCount} historical customer order(s). To protect historical sales data, it has been safely archived instead of permanently deleted.`,
        product: archived,
      });
    }

    // If NO historical orders exist, permanently remove cleanly
    await prisma.$transaction(async (tx) => {
      // 1. Remove wishlist entries
      await tx.wishlist.deleteMany({ where: { productId: id } });

      // 2. Remove product reviews
      await tx.review.deleteMany({ where: { productId: id } });

      // 3. For each variant, remove inventory movements and inventory
      for (const variant of product.variants) {
        const inv = await tx.inventory.findUnique({ where: { variantId: variant.id } });
        if (inv) {
          await tx.inventoryMovement.deleteMany({ where: { inventoryId: inv.id } });
          await tx.inventory.delete({ where: { id: inv.id } });
        }
      }

      // 4. Remove variants
      await tx.productVariant.deleteMany({ where: { productId: id } });

      // 5. Remove product
      await tx.product.delete({ where: { id } });
    });

    try {
      await prisma.auditLog.create({
        data: {
          userId: user?.id || "admin",
          action: "PRODUCT_PERMANENTLY_DELETED",
          resource: `Product:${id}`,
          details: `Permanently deleted product "${product.name}" (SKU: ${product.variants[0]?.sku || "N/A"}).`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      archivedInstead: false,
      message: `Product "${product.name}" has been permanently removed from the catalog.`,
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
