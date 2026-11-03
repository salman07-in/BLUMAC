import test from "node:test";
import assert from "node:assert/strict";

// Dynamic import of compiled/built or source module
import {
  scanProductPackaging,
  generateMarketingSuite,
  generateProductCopy,
} from "../src/lib/ai/provider.ts";

test("AI Product Studio - 1. Vision Packaging Scan Structured Output", async () => {
  // Test with dummy base64 string
  const dummyBase64 = "data:image/jpeg;base64,dGVzdA==";
  const result = await scanProductPackaging(dummyBase64, "image/jpeg");

  assert.ok(result.scan, "Scan result must exist");
  assert.ok(result.scan.product_name, "Product name must be detected or populated");
  assert.ok(result.scan.brand, "Brand must be detected");
  assert.ok(Array.isArray(result.scan.active_ingredients), "Active ingredients must be an array");
  assert.ok(Array.isArray(result.scan.visible_benefits), "Visible benefits must be an array");
  assert.ok(Array.isArray(result.scan.detected_text), "Detected text must be an array");
  assert.ok(typeof result.scan.confidence_score === "number", "Confidence score must be numeric");
  assert.ok(result.scan.confidence_score >= 0 && result.scan.confidence_score <= 1, "Confidence score 0..1");
});

test("AI Product Studio - 2. Marketing Suite Content Generation (English & Multilingual)", async () => {
  const result = await generateMarketingSuite({
    productName: "Advanced Snail 96 Mucin Power Essence",
    brand: "COSRX",
    category: "Essence",
    productType: "Hydrating Facial Essence",
    size: "100ml",
    activeIngredients: ["Snail Secretion Filtrate 96.3%", "Sodium Hyaluronate"],
    visibleBenefits: ["Deep barrier repair", "Glass skin hydration"],
    targetSkinType: ["All skin types", "Dehydrated skin"],
    price: 1199,
    mrp: 1450,
  });

  assert.ok(result.copy, "Copy suite must exist");
  assert.ok(result.copy.title.includes("COSRX"), "Title should include brand");
  assert.ok(result.copy.shortDescription.length > 20, "Short description should be present");
  assert.ok(result.copy.detailedDescription.length > 50, "Detailed description should be present");
  assert.ok(Array.isArray(result.copy.keyFeatures) && result.copy.keyFeatures.length > 0, "Key features array");
  assert.ok(result.copy.instagramCaption.includes("#"), "Instagram caption should include hashtags");
  assert.ok(result.copy.seoTitle.length > 0, "SEO title should be present");
  assert.ok(result.copy.translations?.hindi?.instagramCaption, "Hindi caption must be present");
  assert.ok(result.copy.translations?.hinglish?.instagramCaption, "Hinglish caption must be present");
});

test("AI Product Studio - 3. Backward Compatible generateProductCopy wrapper", async () => {
  const result = await generateProductCopy({
    productName: "Relief Sun",
    brand: "Beauty of Joseon",
    keyIngredient: "Rice Extract 30%",
    skinBenefit: "Zero white cast UV shield",
    price: 1149,
  });

  assert.ok(result.copy.title, "Title must be present");
  assert.ok(result.copy.shortDescription, "Short description must be present");
  assert.ok(result.copy.captions.english, "English caption must be present");
  assert.ok(result.copy.captions.hindi, "Hindi caption must be present");
  assert.ok(result.copy.captions.hinglish, "Hinglish caption must be present");
});
