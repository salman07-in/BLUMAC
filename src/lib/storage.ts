import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { getFirebaseStorageBucket, isFirebaseConfigured } from "./firebase-admin";

export interface UploadResult {
  url: string;
  storageProvider: "firebase" | "local";
  fileName: string;
  size: number;
}

/**
 * Uploads an image buffer to Firebase Cloud Storage if configured;
 * otherwise safely falls back to local disk storage in `public/uploads/`.
 */
export async function uploadImageBuffer({
  buffer,
  originalName,
  mimeType,
  folder = "products",
}: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
}): Promise<UploadResult> {
  const fileExt = path.extname(originalName).toLowerCase();
  const cleanBase = path
    .basename(originalName, fileExt)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
  const uniqueName = `${Date.now()}-${cleanBase || "upload"}${fileExt}`;

  // 1. Try Firebase Cloud Storage
  if (isFirebaseConfigured()) {
    try {
      const bucket = getFirebaseStorageBucket();
      if (bucket) {
        const remoteFilePath = `${folder}/${uniqueName}`;
        const fileRef = bucket.file(remoteFilePath);

        await fileRef.save(buffer, {
          contentType: mimeType,
          metadata: {
            contentType: mimeType,
            cacheControl: "public, max-age=31536000",
          },
        });

        // Generate the standard Firebase download URL
        const bucketName = bucket.name;
        const encodedPath = encodeURIComponent(remoteFilePath);
        const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

        return {
          url: firebaseUrl,
          storageProvider: "firebase",
          fileName: uniqueName,
          size: buffer.length,
        };
      }
    } catch (fbErr: any) {
      console.warn("⚠️ Firebase Storage upload failed, falling back to local disk:", fbErr.message || fbErr);
    }
  }

  // 2. Fallback to Local Disk Storage
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const rootUploadDir = path.join(process.cwd(), "uploads");
  await mkdir(rootUploadDir, { recursive: true }).catch(() => {});

  const localFilePath = path.join(uploadDir, uniqueName);
  const rootFilePath = path.join(rootUploadDir, uniqueName);

  await writeFile(localFilePath, buffer);
  await writeFile(rootFilePath, buffer).catch(() => {});

  return {
    url: `/uploads/${uniqueName}`,
    storageProvider: "local",
    fileName: uniqueName,
    size: buffer.length,
  };
}
