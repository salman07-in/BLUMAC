import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

// MIME Type resolver
const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

// Safe path sanitizer
function sanitizeSegments(segments) {
  return segments
    .map((seg) => path.basename(seg).replace(/[^a-zA-Z0-9._-]/g, ""))
    .filter((seg) => seg && seg !== "." && seg !== "..");
}

// Product images extractor logic from ProductsManagerClient
function getProductImageList(p) {
  if (!p) return ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"];
  try {
    if (Array.isArray(p.images) && p.images.length > 0) {
      return p.images.filter((url) => typeof url === "string" && url.trim().length > 0);
    }
    const parsed = JSON.parse(p.images || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      const cleaned = parsed.filter((url) => typeof url === "string" && url.trim().length > 0);
      if (cleaned.length > 0) return cleaned;
    }
  } catch {
    if (typeof p.images === "string" && p.images.trim()) {
      const trimmed = p.images.trim();
      if (trimmed.startsWith("http") || trimmed.startsWith("/")) {
        return [trimmed];
      }
    }
  }
  return [
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
  ];
}

test("Uploads Serving - 1. MIME Type Mapping for Skincare Media", () => {
  assert.equal(MIME_TYPES[".jpg"], "image/jpeg");
  assert.equal(MIME_TYPES[".jpeg"], "image/jpeg");
  assert.equal(MIME_TYPES[".png"], "image/png");
  assert.equal(MIME_TYPES[".webp"], "image/webp");
  assert.equal(MIME_TYPES[".avif"], "image/avif");
});

test("Uploads Serving - 2. Directory Traversal Attack Sanitization", () => {
  const malicious = ["..", "etc", "passwd"];
  const sanitized = sanitizeSegments(malicious);
  assert.equal(sanitized.includes(".."), false);
  assert.equal(sanitized.join("/").includes(".."), false);

  const complexAttack = ["..\\..\\secret.png", "../uploads/hero.jpg"];
  const sanitizedComplex = sanitizeSegments(complexAttack);
  assert.equal(sanitizedComplex[0], "secret.png");
  assert.equal(sanitizedComplex[1], "hero.jpg");
  assert.equal(sanitizedComplex.join("/").includes(".."), false);
});

test("Uploads Serving - 3. Local /uploads URL Parsing and Preservation", () => {
  const localUploadProduct = {
    name: "Skit Goat Milk Serum",
    images: '["/uploads/17412345678-skit-goat-milk.jpg"]',
  };
  const list = getProductImageList(localUploadProduct);
  assert.equal(list.length, 1);
  assert.equal(list[0], "/uploads/17412345678-skit-goat-milk.jpg");

  // Single string format
  const singleStringProduct = {
    name: "Skit Goat Milk Serum",
    images: "/uploads/17412345678-skit-goat-milk.jpg",
  };
  const singleList = getProductImageList(singleStringProduct);
  assert.equal(singleList[0], "/uploads/17412345678-skit-goat-milk.jpg");

  // Remote Web URL
  const remoteProduct = {
    name: "Beauty of Joseon Sunscreen",
    images: '["https://example.com/boj-sun.jpg"]',
  };
  assert.equal(getProductImageList(remoteProduct)[0], "https://example.com/boj-sun.jpg");
});
