import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET /api/admin/categories
 * Returns list of all categories with product counts.
 */
export async function GET() {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Create a new product category.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    const { name, description, image, isActive = true } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Category name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check duplicate name (case-insensitive)
    const existing = await prisma.category.findFirst({
      where: {
        name: {
          equals: trimmedName,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Category with name "${trimmedName}" already exists.` },
        { status: 409 }
      );
    }

    // Generate unique slug
    let baseSlug = generateSlug(trimmedName);
    if (!baseSlug) {
      baseSlug = `cat-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newCategory = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        description: typeof description === "string" ? description.trim() : null,
        image: typeof image === "string" && image.trim() ? image.trim() : null,
        isActive: Boolean(isActive),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
