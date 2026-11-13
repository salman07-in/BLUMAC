import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

/**
 * Checks whether all required Firebase credentials are present in the environment.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_STORAGE_BUCKET
  );
}

/**
 * Formats the private key properly, handling escaped newlines.
 */
function getFormattedPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  // Replace escaped \n characters with real newlines if present
  return key.replace(/\\n/g, "\n");
}

/**
 * Initializes and returns the Firebase Admin app singleton.
 */
export function getFirebaseAdminApp(): App | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  try {
    const privateKey = getFormattedPrivateKey();
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket,
    });
  } catch (err: any) {
    console.warn("⚠️ Firebase Admin initialization failed:", err.message || err);
    return null;
  }
}

/**
 * Returns the Firebase Cloud Storage bucket instance.
 */
export function getFirebaseStorageBucket() {
  const app = getFirebaseAdminApp();
  if (!app) return null;

  try {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    return getStorage(app).bucket(bucketName);
  } catch (err: any) {
    console.warn("⚠️ Failed to access Firebase Storage bucket:", err.message || err);
    return null;
  }
}
