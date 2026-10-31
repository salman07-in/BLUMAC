import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateProductCopy } from "@/lib/ai/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productName,
      brand,
      keyIngredient,
      skinBenefit,
      price,
      templateType,
    } = body;

    const result = await generateProductCopy({
      productName: productName || "Korean Hydrating Essence",
      brand: brand || "COSRX",
      keyIngredient: keyIngredient || "Snail Mucin",
      skinBenefit: skinBenefit || "Deep barrier hydration & glass glow",
      price: price || 1199,
    });

    // Save job into database
    const job = await prisma.aIJob.create({
      data: {
        type: "PRODUCT_STUDIO_GENERATION",
        status: "COMPLETED",
        inputData: JSON.stringify(body),
        outputData: JSON.stringify(result.copy),
        costEstimate: result.costEstimate,
        assets: {
          create: [
            {
              assetType: "COPY_DRAFT",
              templateName: templateType || "Product Spotlight",
              approved: false,
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      copy: result.copy,
      isMock: result.isMock,
      costEstimate: result.costEstimate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "AI Studio generation failed" },
      { status: 500 }
    );
  }
}
