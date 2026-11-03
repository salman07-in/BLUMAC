import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { jobId, assetType, templateName, url, approved } = body;

    let targetJobId = jobId;

    // If no jobId provided, create a container AIJob
    if (!targetJobId) {
      const newJob = await prisma.aIJob.create({
        data: {
          type: "CREATIVE_ASSET_SAVE",
          status: "COMPLETED",
          inputData: JSON.stringify({ templateName, assetType }),
          outputData: JSON.stringify({ savedAt: new Date().toISOString() }),
        },
      });
      targetJobId = newJob.id;
    }

    const asset = await prisma.aIAsset.create({
      data: {
        jobId: targetJobId,
        assetType: assetType || "IMAGE",
        templateName: templateName || "Branded Creative",
        url: url ? url.substring(0, 500) : null,
        approved: Boolean(approved),
      },
    });

    return NextResponse.json({
      success: true,
      assetId: asset.id,
      jobId: targetJobId,
    });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to save AI asset" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

