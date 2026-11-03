import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateMarketingSuite } from "@/lib/ai/provider";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    const {
      productName,
      brand,
      category,
      productType,
      size,
      activeIngredients,
      visibleBenefits,
      usageInstructions,
      targetSkinType,
      price,
      mrp,
      templateType,
      // Backward compatibility fields
      keyIngredient,
      skinBenefit,
    } = body;

    const resolvedIngredients = Array.isArray(activeIngredients)
      ? activeIngredients
      : keyIngredient
      ? [keyIngredient]
      : [];

    const resolvedBenefits = Array.isArray(visibleBenefits)
      ? visibleBenefits
      : skinBenefit
      ? [skinBenefit]
      : [];

    const result = await generateMarketingSuite({
      productName: productName || "Korean Skincare Product",
      brand: brand || "BLUMAC Selected",
      category: category || "Skincare",
      productType: productType || "Facial Care",
      size: size || "Standard Size",
      activeIngredients: resolvedIngredients,
      visibleBenefits: resolvedBenefits,
      usageInstructions: Array.isArray(usageInstructions) ? usageInstructions : [],
      targetSkinType: Array.isArray(targetSkinType) ? targetSkinType : [],
      price: parseFloat(price) || 1199,
      mrp: parseFloat(mrp) || 1499,
    });

    // Save job and draft copy asset into database
    let jobId: string | null = null;
    try {
      const job = await prisma.aIJob.create({
        data: {
          type: "MARKETING_SUITE_GENERATION",
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
      jobId = job.id;
    } catch (dbErr) {
      console.warn("AIJob DB logging failed (continuing response):", dbErr);
    }

    return NextResponse.json({
      success: true,
      jobId,
      copy: result.copy,
      isMock: result.isMock,
      costEstimate: result.costEstimate,
    });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "AI Studio generation failed" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
