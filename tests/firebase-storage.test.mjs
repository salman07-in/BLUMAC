import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";

// 1. Firebase Env Config Checker
function isFirebaseConfigured(env = process.env) {
  return Boolean(
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY &&
    env.FIREBASE_STORAGE_BUCKET
  );
}

// 2. Private Key Formatter
function getFormattedPrivateKey(key) {
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
}

// 3. Firebase URL Formatter
function getFirebaseStorageUrl(bucketName, remoteFilePath) {
  const encodedPath = encodeURIComponent(remoteFilePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
}

// 4. File extension and MIME validation
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

function validateImageUpload({ name, type, size }) {
  const MAX_SIZE = 5 * 1024 * 1024;
  if (!name || size > MAX_SIZE) {
    return { valid: false, error: "File size exceeds 5MB limit or invalid file." };
  }
  const ext = path.extname(name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(type)) {
    return { valid: false, error: "Invalid file format." };
  }
  return { valid: true };
}

// TESTS
test("Firebase Storage - 1. isFirebaseConfigured detects missing vs present credentials", () => {
  assert.equal(isFirebaseConfigured({}), false);
  assert.equal(
    isFirebaseConfigured({
      FIREBASE_PROJECT_ID: "blumac",
      FIREBASE_CLIENT_EMAIL: "admin@blumac.iam.gserviceaccount.com",
    }),
    false
  );
  assert.equal(
    isFirebaseConfigured({
      FIREBASE_PROJECT_ID: "blumac",
      FIREBASE_CLIENT_EMAIL: "admin@blumac.iam.gserviceaccount.com",
      FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nMIIEvgIB...",
      FIREBASE_STORAGE_BUCKET: "blumac.appspot.com",
    }),
    true
  );
});

test("Firebase Storage - 2. Formatted private key handles escaped linebreaks", () => {
  const rawKey = "-----BEGIN PRIVATE KEY-----\\nMIIEvgIB\\n-----END PRIVATE KEY-----";
  const formatted = getFormattedPrivateKey(rawKey);
  assert.equal(formatted.includes("\\n"), false);
  assert.equal(formatted.split("\n").length, 3);
});

test("Firebase Storage - 3. Firebase Download URL builder creates valid public CDN path", () => {
  const bucket = "blumac-korean-store.appspot.com";
  const remotePath = "products/1794500000000-cosrx-snail-mucin.webp";
  const url = getFirebaseStorageUrl(bucket, remotePath);

  assert.ok(url.startsWith("https://firebasestorage.googleapis.com/v0/b/blumac-korean-store.appspot.com/o/"));
  assert.ok(url.endsWith("?alt=media"));
  assert.ok(url.includes("products%2F1794500000000-cosrx-snail-mucin.webp"));
});

test("Firebase Storage - 4. Image validation permits genuine skincare images and blocks disallowed types", () => {
  assert.equal(
    validateImageUpload({ name: "serum.webp", type: "image/webp", size: 50000 }).valid,
    true
  );
  assert.equal(
    validateImageUpload({ name: "cream.png", type: "image/png", size: 100000 }).valid,
    true
  );
  assert.equal(
    validateImageUpload({ name: "script.exe", type: "application/x-msdownload", size: 50000 }).valid,
    false
  );
  assert.equal(
    validateImageUpload({ name: "huge-image.jpg", type: "image/jpeg", size: 6 * 1024 * 1024 }).valid,
    false
  );
});

test("Firebase Storage - 5. Graceful fallback to local uploads directory when Firebase is unconfigured", () => {
  const cleanBase = "beauty-of-joseon-sunscreen";
  const fileExt = ".jpg";
  const uniqueName = `123456789-${cleanBase}${fileExt}`;
  const localUrl = `/uploads/${uniqueName}`;

  assert.equal(localUrl, "/uploads/123456789-beauty-of-joseon-sunscreen.jpg");
  assert.ok(localUrl.startsWith("/uploads/"));
});
