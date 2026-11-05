import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

/**
 * GET /uploads/[...path]
 * Dynamically serves files uploaded at runtime from public/uploads or uploads.
 * This guarantees images display in production even after next build.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { path: segments } = await params;

    if (!segments || segments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Sanitize path segments to prevent directory traversal attacks
    const sanitizedSegments = segments
      .map((seg) => path.basename(seg).replace(/[^a-zA-Z0-9._-]/g, ""))
      .filter((seg) => seg && seg !== "." && seg !== "..");

    if (sanitizedSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const relativeSubPath = path.join(...sanitizedSegments);

    // Search candidate directories
    const candidatePaths = [
      path.join(process.cwd(), "public", "uploads", relativeSubPath),
      path.join(process.cwd(), "uploads", relativeSubPath),
    ];

    let resolvedPath: string | null = null;
    for (const cand of candidatePaths) {
      try {
        const fileInfo = await stat(cand);
        if (fileInfo.isFile()) {
          resolvedPath = cand;
          break;
        }
      } catch {
        // Continue searching
      }
    }

    if (!resolvedPath) {
      return new NextResponse("Image Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const fileBuffer = await readFile(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
