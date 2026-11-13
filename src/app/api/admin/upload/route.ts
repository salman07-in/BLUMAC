import { NextResponse } from "next/server";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { uploadImageBuffer } from "@/lib/storage";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 5MB size limit." },
        { status: 400 }
      );
    }

    const fileExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(fileExt) || !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file format. Only JPEG, PNG, WEBP, AVIF, and GIF images are permitted." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Cloud Storage (with local disk fallback)
    const result = await uploadImageBuffer({
      buffer,
      originalName: file.name,
      mimeType: file.type,
      folder: "products",
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      storageProvider: result.storageProvider,
      fileName: result.fileName,
      size: result.size,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}
