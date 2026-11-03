import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scanProductPackaging } from "@/lib/ai/provider";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Image data (base64 string) is required for product scanning." },
        { status: 400 }
      );
    }

    // Call Gemini 1.5 Flash Vision packaging scanner
    const result = await scanProductPackaging(imageBase64, mimeType || "image/jpeg");

    // Save job into AIJob database table for auditing & persistence
    let jobId: string | null = null;
    try {
      const job = await prisma.aIJob.create({
        data: {
          type: "PRODUCT_VISION_SCAN",
          status: result.scan.is_unclear ? "REJECTED" : "COMPLETED",
          inputData: JSON.stringify({
            mimeType: mimeType || "image/jpeg",
            imageSizeChars: imageBase64.length,
            scannedAt: new Date().toISOString(),
          }),
          outputData: JSON.stringify(result.scan),
          costEstimate: result.costEstimate,
        },
      });
      jobId = job.id;
    } catch (dbErr) {
      console.warn("AIJob DB logging failed (continuing scan response):", dbErr);
    }

    return NextResponse.json({
      success: true,
      jobId,
      scan: result.scan,
      isMock: result.isMock,
      costEstimate: result.costEstimate,
    });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Product packaging scan failed" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
