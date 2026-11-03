import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [], total: 0, query: q });
    }

    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: q } },
          { shortDescription: { contains: q } },
          { description: { contains: q } },
          { brand: { name: { contains: q } } },
          { category: { name: { contains: q } } },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        images: true,
        price: true,
        mrp: true,
        rating: true,
        reviewCount: true,
        isBestSeller: true,
        isTrending: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
      take: limit,
      orderBy: [{ isBestSeller: "desc" }, { rating: "desc" }],
    });

    const formatted = products.map((p) => {
      let images: string[] = [];
      try { images = JSON.parse(p.images || "[]"); } catch { images = [p.images || ""]; }
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        image: images[0] || "",
        price: p.price,
        mrp: p.mrp,
        rating: p.rating,
        reviewCount: p.reviewCount,
        brand: p.brand?.name || "",
        category: p.category?.name || "",
        isBestSeller: p.isBestSeller,
        isTrending: p.isTrending,
      };
    });

    return NextResponse.json({ products: formatted, total: formatted.length, query: q });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Search API Error]:", error);
    return NextResponse.json({ products: [], total: 0, query: "", error: message }, { status: 500 });
  }
}
