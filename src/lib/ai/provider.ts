/**
 * AI Product Studio Provider Abstraction
 * Supports Google Gemini API when GEMINI_API_KEY is configured,
 * and falls back to deterministic K-Beauty copywriting generation in development mode.
 */

export interface GeneratedCopy {
  title: string;
  shortDescription: string;
  fullDescription: string;
  seoTitle: string;
  seoDescription: string;
  imageAltText: string;
  tags: string[];
  captions: {
    english: string;
    hindi: string;
    hinglish: string;
  };
}

export async function generateProductCopy(params: {
  productName: string;
  brand: string;
  keyIngredient: string;
  skinBenefit: string;
  price: number;
}): Promise<{ copy: GeneratedCopy; isMock: boolean; costEstimate: number }> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If real Gemini key is configured (and not placeholder)
  if (apiKey && apiKey !== "placeholder_gemini_api_key") {
    try {
      const prompt = `You are a luxury Korean skincare copywriter and SEO specialist for BLUMAC Korean Store in India.
Generate product marketing copy for:
Brand: ${params.brand}
Product: ${params.productName}
Key Ingredient: ${params.keyIngredient}
Target Benefit: ${params.skinBenefit}
Selling Price: ₹${params.price}

Return ONLY valid JSON matching this schema:
{
  "title": "refined editorial product title",
  "shortDescription": "2-sentence punchy hook",
  "fullDescription": "comprehensive skincare description detailing ingredients and texture without false medical claims",
  "seoTitle": "under 60 char title with keywords",
  "seoDescription": "under 155 char meta description",
  "imageAltText": "descriptive accessible alt text",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "captions": {
    "english": "engaging Instagram caption with emojis and hashtags",
    "hindi": "natural Hindi marketing caption in Devanagari script",
    "hinglish": "modern urban Hinglish caption popular in Delhi/Mumbai/Bengaluru"
  }
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return { copy: parsed, isMock: false, costEstimate: 0.0015 };
        }
      }
    } catch {
      // Fall through to deterministic template engine
    }
  }

  // Clearly Labelled Development Mode (Template-Based Studio Engine)
  const templateCopy: GeneratedCopy = {
    title: `${params.brand} ${params.productName} with ${params.keyIngredient}`,
    shortDescription: `Experience authentic Korean radiance with ${params.productName}, powered by ${params.keyIngredient} to ${params.skinBenefit.toLowerCase()}.`,
    fullDescription: `Crafted in Seoul and dermatologically formulated for resilient glass skin, this cult favorite from ${params.brand} combines pure ${params.keyIngredient} with calming botanical extracts. Designed to penetrate deeply without pore-clogging stickiness, it restores your skin barrier, balances hydration levels, and imparts an unmistakable dewy glow under Indian weather conditions. 100% genuine import with verified batch codes.`,
    seoTitle: `${params.productName} by ${params.brand} | Buy Online India | BLUMAC`,
    seoDescription: `Shop authentic ${params.productName} (${params.brand}) at BLUMAC Korean Store. Features ${params.keyIngredient} for ${params.skinBenefit.toLowerCase()}. Free delivery in India above ₹999.`,
    imageAltText: `${params.brand} ${params.productName} authentic Korean skincare bottle on clean white background`,
    tags: [
      params.brand.toLowerCase(),
      "korean skincare",
      params.keyIngredient.toLowerCase(),
      "glass skin",
      "authentic k-beauty india",
    ],
    captions: {
      english: `✨ The secret to true Korean Glass Skin has arrived in India! The ${params.productName} by ${params.brand} is infused with ${params.keyIngredient} to ${params.skinBenefit.toLowerCase()}. 🇰🇷 Direct from Seoul to your vanity.\n\n🛍️ Shop now at blumac.in with Code: SEOUL10 for 10% OFF!\n\n#KBeautyIndia #KoreanSkincare #${params.brand.replace(/\s+/g, "")} #GlassSkinRoutine #BLUMAC`,
      hindi: `✨ कोरियाई स्किनकेयर का असली जादू अब भारत में! पेश है ${params.brand} का ${params.productName}, जिसमें है असली ${params.keyIngredient} जो आपकी त्वचा को देगा बेदाग चमक। 🌸\n\nसियोल से सीधे आपके दरवाजे तक 100% असली उत्पाद। कूपन कोड SEOUL10 के साथ पाएँ 10% की विशेष छूट।`,
      hinglish: `Glow up your skincare routine with ${params.brand}'s viral ${params.productName}! Packed with ${params.keyIngredient} jo aapki skin ko dega deep hydration aur natural glass glow. 🤍\n\nNo customs hassle, 100% genuine Seoul import. Order on blumac.in today! ✨`,
    },
  };

  return { copy: templateCopy, isMock: true, costEstimate: 0.0 };
}
