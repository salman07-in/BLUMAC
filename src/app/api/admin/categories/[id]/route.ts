import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET /api/admin/categories/[id]
 * Fetch single category with product count.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to fetch category" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/categories/[id]
 * Update category details (name, description, image, isActive).
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const { name, description, image, isActive } = body;
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Category name must be at least 2 characters long." },
          { status: 400 }
        );
      }
      const trimmedName = name.trim();

      // Check if name is taken by another category
      const duplicate = await prisma.category.findFirst({
        where: {
          name: { equals: trimmedName },
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `Another category named "${trimmedName}" already exists.` },
          { status: 409 }
        );
      }

      updateData.name = trimmedName;

      // Update slug if name changed
      if (trimmedName.toLowerCase() !== existing.name.toLowerCase()) {
        let baseSlug = generateSlug(trimmedName);
        if (!baseSlug) baseSlug = `cat-${Date.now()}`;
        let slug = baseSlug;
        let counter = 1;
        while (
          await prisma.category.findFirst({
            where: { slug, NOT: { id } },
          })
        ) {
          slug = `${baseSlug}-${counter++}`;
        }
        updateData.slug = slug;
      }
    }

    if (description !== undefined) {
      updateData.description =
        typeof description === "string" && description.trim() ? description.trim() : null;
    }

    if (image !== undefined) {
      updateData.image =
        typeof image === "string" && image.trim() ? image.trim() : null;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete category with safety checks for products.
 * If products exist:
 *  - If reassignToCategoryId is supplied, products are reassigned and category is deleted.
 *  - Otherwise, deletion is blocked with a 400 error.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const productCount = existing._count.products;

    // Parse optional reassignment
    let reassignToCategoryId: string | null = null;
    try {
      const url = new URL(req.url);
      reassignToCategoryId = url.searchParams.get("reassignToCategoryId");
      if (!reassignToCategoryId) {
        const body = await req.json().catch(() => null);
        if (body && body.reassignToCategoryId) {
          reassignToCategoryId = body.reassignToCategoryId;
        }
      }
    } catch {
      // Body empty / no JSON
    }

    if (productCount > 0) {
      if (!reassignToCategoryId) {
        return NextResponse.json(
          {
            error: `Cannot delete "${existing.name}". It is currently assigned to ${productCount} product(s). Please reassign products to another category first.`,
            productCount,
            requiresReassignment: true,
          },
          { status: 400 }
        );
      }

      if (reassignToCategoryId === id) {
        return NextResponse.json(
          { error: "Cannot reassign products to the category being deleted." },
          { status: 400 }
        );
      }

      const targetCategory = await prisma.category.findUnique({
        where: { id: reassignToCategoryId },
      });

      if (!targetCategory) {
        return NextResponse.json(
          { error: "Target category for product reassignment does not exist." },
          { status: 404 }
        );
      }

      // Reassign products to the target category
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: reassignToCategoryId },
      });
    }

    // Now safe to delete
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Category "${existing.name}" successfully deleted.`,
      reassignedCount: productCount > 0 ? productCount : 0,
    });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

