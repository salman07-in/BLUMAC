import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";

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

    // Ensure uploads directories exist (both public/uploads and root uploads)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const rootUploadDir = path.join(process.cwd(), "uploads");
    await mkdir(rootUploadDir, { recursive: true }).catch(() => {});

    // Generate safe unique filename
    const cleanBase = path
      .basename(file.name, fileExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
    const uniqueName = `${Date.now()}-${cleanBase || "upload"}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueName);
    const rootFilePath = path.join(rootUploadDir, uniqueName);

    await writeFile(filePath, buffer);
    await writeFile(rootFilePath, buffer).catch(() => {});

    const publicUrl = `/uploads/${uniqueName}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      size: file.size,
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
