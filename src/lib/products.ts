export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  price: number;
  mrp: number;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  subcategory: string;
  shortDescription: string;
  description: string;
  mrp: number;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  skinType: string[]; // e.g. ["All Skin Types", "Sensitive", "Dry", "Acne-prone"]
  concerns: string[]; // e.g. ["Dehydration", "Acne", "Barrier Repair", "Dullness"]
  keyIngredients: { name: string; benefit: string }[];
  fullIngredients: string;
  howToUse: string;
  cautions: string;
  variants: ProductVariant[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  inStock: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "cosrx-snail-96",
    slug: "cosrx-advanced-snail-96-mucin-power-essence",
    name: "Advanced Snail 96 Mucin Power Essence",
    brand: "COSRX",
    category: "Serums & Ampoules",
    categorySlug: "serums-ampoules",
    subcategory: "Hydrating Essence",
    shortDescription:
      "Cult-favorite essence formulated with 96.3% Snail Secretion Filtrate for deep hydration and barrier repair.",
    description:
      "Lightweight yet intensely nourishing, the COSRX Advanced Snail 96 Mucin Power Essence penetrates deep into the dermal layers to replenish lost moisture, soothe sensitized skin, and improve elasticity without clogging pores. Free of parabens, sulfates, and artificial fragrances.",
    mrp: 1450,
    price: 1199,
    rating: 4.8,
    reviewCount: 342,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ],
    skinType: ["All Skin Types", "Dry", "Sensitive", "Acne-prone"],
    concerns: ["Dehydration", "Barrier Repair", "Dullness", "Fine Lines"],
    keyIngredients: [
      { name: "Snail Secretion Filtrate (96.3%)", benefit: "Restores moisture barrier and boosts elasticity" },
      { name: "Sodium Hyaluronate", benefit: "Draws atmospheric moisture into dermal layers" },
      { name: "Panthenol (Pro-Vitamin B5)", benefit: "Calms inflammation and accelerates recovery" },
      { name: "Allantoin", benefit: "Smoothes texture and shields against irritants" },
    ],
    fullIngredients:
      "Snail Secretion Filtrate, Betaine, Butylene Glycol, 1,2-Hexanediol, Sodium Polyacrylate, Phenoxyethanol, Sodium Hyaluronate, Allantoin, Ethyl Hexanediol, Carbomer, Panthenol, Arginine.",
    howToUse:
      "After cleansing and toning, dispense 2-3 pumps onto the palm of your hand and gently pat across the face and neck until fully absorbed. Follow with your favorite moisturizer.",
    cautions:
      "For external use only. Discontinue use immediately if irritation occurs. Do not use on broken or inflamed skin.",
    variants: [
      { id: "cosrx-snail-100ml", sku: "CX-SNL-100", size: "100ml", price: 1199, mrp: 1450, stock: 45 },
    ],
    isBestSeller: true,
    isTrending: true,
    inStock: true,
  },
  {
    id: "boj-relief-sun",
    slug: "beauty-of-joseon-relief-sun-rice-probiotics-spf50",
    name: "Relief Sun: Rice + Probiotics (SPF50+ PA++++)",
    brand: "Beauty of Joseon",
    category: "Sunscreens",
    categorySlug: "sunscreens",
    subcategory: "Chemical Sunscreen",
    shortDescription:
      "Organic chemical sunscreen enriched with 30% Rice Extract and Grain Probiotics for a lightweight, dewy finish with zero white cast.",
    description:
      "Formulated with traditional Korean Hanbang herbal wisdom, this ultra-gentle daily sunscreen glides effortlessly onto the skin like a light moisturizing lotion. Provides broad-spectrum SPF 50+ PA++++ protection without greasiness or eye stinging.",
    mrp: 1400,
    price: 1149,
    rating: 4.9,
    reviewCount: 489,
    images: [
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ],
    skinType: ["All Skin Types", "Sensitive", "Dry", "Combination"],
    concerns: ["Sun Protection", "Hyperpigmentation", "Dryness"],
    keyIngredients: [
      { name: "Rice Extract (30%)", benefit: "Rich in amino acids, vitamins B, C, and E to brighten skin" },
      { name: "Grain Ferment Complex", benefit: "Strengthens skin microbiome and resilience" },
      { name: "Niacinamide (2%)", benefit: "Evens out skin tone and regulates excess sebum" },
    ],
    fullIngredients:
      "Water, Oryza Sativa (Rice) Extract (30%), Dibutyl Adipate, Propanediol, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Polymethylsilsesquioxane, Ethylhexyl Triazone, Niacinamide, Methylene Bis-benzotriazolyl Tetramethylbutylphenol, Coco-caprylate/Caprate, Caprylyl Methicone, Diethylhexyl Butamido Triazone, Glycerin, Butylene Glycol, Oryza Sativa (Rice) Germ Extract, Camellia Sinensis Leaf Extract, Lactobacillus/Rice Ferment, Aspergillus Ferment, Saccharomyces/Rice Ferment Filtrate, Saccharum Officinarum (Sugarcane) Extract, Tocopherol, Adenosine.",
    howToUse:
      "As the final step of your morning skincare routine, apply an adequate amount evenly over face, neck, and any sun-exposed areas 15 minutes before sun exposure.",
    cautions:
      "Reapply every 2 to 3 hours during extended outdoor exposure. Keep out of reach of children.",
    variants: [
      { id: "boj-sun-50ml", sku: "BOJ-SUN-50", size: "50ml", price: 1149, mrp: 1400, stock: 68 },
    ],
    isBestSeller: true,
    isTrending: true,
    inStock: true,
  },
  {
    id: "anua-heartleaf-77",
    slug: "anua-heartleaf-77-soothing-toner",
    name: "Heartleaf 77% Soothing Toner",
    brand: "Anua",
    category: "Toners & Essences",
    categorySlug: "toners-essences",
    subcategory: "Soothing Toner",
    shortDescription:
      "Korea's #1 soothing toner containing 77% Houttuynia Cordata Extract to calm redness and rebalance skin pH.",
    description:
      "Anua's viral toner is clinically tested non-comedogenic and sub-acidic (pH 5.5-6.0) to maintain ideal skin equilibrium. Effectively purifies without stripping, helping relieve active breakouts, acne redness, and barrier irritation.",
    mrp: 1950,
    price: 1599,
    rating: 4.8,
    reviewCount: 275,
    images: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ],
    skinType: ["Acne-prone", "Sensitive", "Oily", "Combination"],
    concerns: ["Redness", "Acne & Blemishes", "Irritated Barrier", "Excess Oil"],
    keyIngredients: [
      { name: "Houttuynia Cordata Extract (77%)", benefit: "Potent anti-inflammatory herbal remedy from Korea" },
      { name: "Centella Asiatica", benefit: "Speeds up healing of active redness and blemishes" },
      { name: "Panthenol", benefit: "Reinforces skin barrier against environmental stressors" },
    ],
    fullIngredients:
      "Houttuynia Cordata Extract (77%), Purified Water, 1,2-Hexanediol, Glycerin, Betaine, Panthenol, Saccharum Officinarum (Sugarcane) Extract, Portulaca Oleracea Extract, Butylene Glycol, Vitex Agnus-Castus Extract, Chamomilla Recutita (Matricaria) Flower Extract, Arctium Lappa Root Extract, Phellinus Linteus Extract, Vitis Vinifera (Grape) Fruit Extract, Apple Fruit Extract, Centella Asiatica Extract, Isopentyldiol, Methylpropanediol, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Tromethamine, Disodium EDTA.",
    howToUse:
      "After cleansing, soak a cotton pad or dispense directly onto hands and gently swipe/pat across the face. Can also be layered using the 7-skin method or used as a quick 5-minute toner mask with cotton pads.",
    cautions: "Avoid contact with direct eyes. Store in a cool, dry place away from sunlight.",
    variants: [
      { id: "anua-77-250ml", sku: "ANUA-HL-250", size: "250ml", price: 1599, mrp: 1950, stock: 32 },
    ],
    isBestSeller: true,
    isTrending: true,
    inStock: true,
  },
  {
    id: "laneige-lip-sleeping-mask",
    slug: "laneige-lip-sleeping-mask-berry",
    name: "Lip Sleeping Mask (Berry Flavor)",
    brand: "Laneige",
    category: "Moisturizers",
    categorySlug: "moisturizers",
    subcategory: "Lip Care",
    shortDescription:
      "Iconic leave-on overnight lip treatment infused with Vitamin C and Berry Fruit Complex for supple, plump lips.",
    description:
      "Melt away stubborn dead skin cells and infuse deep moisture into dry, flaky lips overnight. Laneige's proprietary Moisture Wrap technology utilizes hyaluronic acid and minerals to form a protective film locking in active ingredients.",
    mrp: 1450,
    price: 1199,
    rating: 4.9,
    reviewCount: 610,
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
    ],
    skinType: ["All Skin Types"],
    concerns: ["Chapped Lips", "Dryness", "Rough Texture"],
    keyIngredients: [
      { name: "Berry Fruit Complex", benefit: "Rich in antioxidants and Vitamin C to revitalize dry lips" },
      { name: "Murumuru Seed Butter", benefit: "Locks in deep hydration for soft, plump lips" },
      { name: "Hyaluronic Acid", benefit: "Long-lasting moisture retention overnight" },
    ],
    fullIngredients:
      "Diisostearyl Malate, Hydrogenated Polyisobutene, Phytosteryl/Isostearyl/Cetyl/Stearyl/Behenyl Dimer Dilinoleate, Hydrogenated Poly(C6-14 Olefin), Polybutene, Microcrystalline Wax, Butyrospermum Parkii (Shea) Butter, Synthetic Wax, Euphorbia Cerifera (Candelilla) Wax, Sucrose Tetrastearate Triacetate, Butylene/Ethylene/Styrene Copolymer, Ethylene/Propylene/Styrene Copolymer, Mica, Astrocaryum Murumuru Seed Butter, Titanium Dioxide, Dimethicone, Fragrance, Polyglyceryl-2 Diisostearate, Dehydroacetic Acid, Methicone, Carnauba Wax, Polyglyceryl-2 Triisostearate, CI 15985, CI 15850, Polyhydroxystearic Acid, Water, Potassium Alginate, Propanediol, Glycerin, Alcohol, Lycium Chinense Fruit Extract, Vaccinium Macrocarpon (Cranberry) Fruit Extract, Fragaria Chiloensis (Strawberry) Fruit Extract, Rubus Idaeus (Raspberry) Fruit Extract, Sapindus Mukorossi Fruit Extract, Vaccinium Angustifolium (Blueberry) Fruit Extract, Rubus Chamaemorus Seed Extract, Coffea Arabica (Coffee) Seed Extract, Chenopodium Quinoa Seed Extract, Magnesium Sulfate, Calcium Chloride, Sodium Hyaluronate, Beta-Glucan, Manganese Sulfate, Ethylhexylglycerin, Zinc Sulfate, Disodium EDTA, Ascorbyl Glucoside.",
    howToUse:
      "Before going to bed, apply a generous amount onto lips using the included spatula or clean fingertip. Wipe off gently with tissue next morning if desired.",
    cautions: "Do not swallow. Keep cap tightly closed after use.",
    variants: [
      { id: "laneige-lip-20g", sku: "LAN-LIP-20", size: "20g", price: 1199, mrp: 1450, stock: 54 },
    ],
    isBestSeller: true,
    isTrending: false,
    inStock: true,
  },
  {
    id: "boj-glow-serum",
    slug: "beauty-of-joseon-glow-serum-propolis-niacinamide",
    name: "Glow Serum: Propolis + Niacinamide",
    brand: "Beauty of Joseon",
    category: "Serums & Ampoules",
    categorySlug: "serums-ampoules",
    subcategory: "Brightening Serum",
    shortDescription:
      "Honey-like glow serum enriched with 60% Propolis Extract and 2% Niacinamide to soothe inflammation and shrink pores.",
    description:
      "Crafted specifically for troubled, enlarged-pore skin, this silky serum imparts an enviable Korean glass-skin radiance. Propolis naturally fights bacteria and calms redness, while Niacinamide refines skin tone and regulates oil production.",
    mrp: 1450,
    price: 1199,
    rating: 4.7,
    reviewCount: 312,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ],
    skinType: ["All Skin Types", "Acne-prone", "Combination", "Dull"],
    concerns: ["Enlarged Pores", "Dullness", "Acne Spots", "Uneven Tone"],
    keyIngredients: [
      { name: "Propolis Extract (60%)", benefit: "Antiseptic and healing properties for dewy radiance" },
      { name: "Niacinamide (2%)", benefit: "Reduces pore visibility and brightens post-acne marks" },
      { name: "Tamanu Oil (0.5%)", benefit: "Rich in calophyllic acid to accelerate cellular regeneration" },
    ],
    fullIngredients:
      "Propolis Extract, Dipropylene Glycol, Glycerin, Butylene Glycol, Water, Niacinamide, 1,2-Hexanediol, Melia Azadirachta Flower Extract, Melia Azadirachta Leaf Extract, Sodium Hyaluronate, Curcuma Longa (Turmeric) Root Extract, Ocimum Sanctum Leaf Extract, Theobroma Cacao (Cocoa) Seed Extract, Melaleuca Alternifolia (Tea Tree) Extract, Centella Asiatica Extract, Corallina Officinalis Extract, Lotus Corniculatus Seed Extract, Calophyllum Inophyllum Seed Oil, Betaine Salicylate, Sodium Polyacryloyldimethyl Taurate, Tromethamine, Polyglyceryl-10 Laurate, Caprylyl Glycol, Ethylhexylglycerin, Dextrin, Pentylene Glycol, Octanediol, Tocopherol, Xanthan Gum, Carbomer.",
    howToUse: "Apply 2-3 drops onto clean skin after toner. Gently pat across the face until absorbed.",
    cautions: "Patch test prior to use if allergic to bee pollen or bee-derived products.",
    variants: [
      { id: "boj-glow-30ml", sku: "BOJ-GLW-30", size: "30ml", price: 1199, mrp: 1450, stock: 40 },
    ],
    isBestSeller: true,
    isNewArrival: false,
    inStock: true,
  },
  {
    id: "cosrx-good-morning-cleanser",
    slug: "cosrx-low-ph-good-morning-gel-cleanser",
    name: "Low pH Good Morning Gel Cleanser",
    brand: "COSRX",
    category: "Cleansers",
    categorySlug: "cleansers",
    subcategory: "Gel Cleanser",
    shortDescription:
      "Mild gel cleanser formulated with Tea Tree Oil and natural BHA to gently cleanse without stripping natural oils.",
    description:
      "Formulated at skin's natural acidic pH (5.0 - 6.0), this refreshing daily cleanser whisks away overnight impurities, dead cells, and excess sebum while preserving the delicate moisture barrier.",
    mrp: 950,
    price: 799,
    rating: 4.7,
    reviewCount: 388,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ],
    skinType: ["All Skin Types", "Sensitive", "Oily", "Acne-prone"],
    concerns: ["Excess Sebum", "Clogged Pores", "Morning Refreshment"],
    keyIngredients: [
      { name: "Tea Tree Leaf Oil", benefit: "Natural antibacterial astringent that controls sebum" },
      { name: "Betaine Salicylate (Natural BHA)", benefit: "Dissolves cellular debris inside pores gently" },
    ],
    fullIngredients:
      "Water, Cocamidopropyl Betaine, Sodium Lauroyl Methyl Isethionate, Polysorbate 20, Styrax Japonica Branch/Fruit/Leaf Extract, Butylene Glycol, Saccharomyces Ferment, Cryptomeria Japonica Leaf Extract, Nelumbo Nucifera Leaf Extract, Pinus Palustris Leaf Extract, Ulmus Davidiana Root Extract, Oenothera Biennis (Evening Primrose) Flower Extract, Pueraria Lobata Root Extract, Melaleuca Alternifolia (Tea Tree) Leaf Oil, Allantoin, Caprylyl Glycol, Ethylhexylglycerin, Betaine Salicylate, Citric Acid, Ethyl Hexanediol, 1,2-Hexanediol, Trisodium Ethylenediamine Disuccinate, Sodium Benzoate, Disodium EDTA.",
    howToUse:
      "Gently massage a small amount into wet skin in circular motions. Rinse thoroughly with lukewarm water.",
    cautions: "For external use only. Avoid contact with eyes.",
    variants: [
      { id: "cosrx-cl-150ml", sku: "CX-CL-150", size: "150ml", price: 799, mrp: 950, stock: 52 },
    ],
    isBestSeller: true,
    isTrending: false,
    inStock: true,
  },
  {
    id: "torriden-dive-in-serum",
    slug: "torriden-dive-in-low-molecular-hyaluronic-acid-serum",
    name: "DIVE-IN Low Molecular Hyaluronic Acid Serum",
    brand: "Torriden",
    category: "Serums & Ampoules",
    categorySlug: "serums-ampoules",
    subcategory: "Hydrating Serum",
    shortDescription:
      "Award-winning pastel blue serum with 5D Multi-Hyaluronic Acid complex that delivers instant deep cellular quenching.",
    description:
      "Torriden's DIVE-IN serum features five molecular weights of hyaluronic acid to penetrate every epidermal stratum. Formulated with soothing D-Panthenol, Allantoin, and Madecassoside, it immediately relieves tightness and plumps skin with zero stickiness.",
    mrp: 1750,
    price: 1399,
    rating: 4.9,
    reviewCount: 220,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    ],
    skinType: ["Dehydrated", "All Skin Types", "Sensitive", "Oily"],
    concerns: ["Deep Dehydration", "Dullness", "Tightness"],
    keyIngredients: [
      { name: "5D Complex Hyaluronic Acid", benefit: "Multi-depth penetration for ultimate internal hydration" },
      { name: "D-Panthenol", benefit: "Calms irritated barrier and locks in moisture" },
      { name: "Malachite Extract", benefit: "Natural antioxidant providing the signature pastel blue hue" },
    ],
    fullIngredients:
      "Water, Butylene Glycol, Glycerin, Dipropylene Glycol, 1,2-Hexanediol, Betaine, Hydroxyethylcellulose, Panthenol, Carbomer, Tromethamine, Allantoin, Malachite Extract, Disodium EDTA, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Hyaluronic Acid, Sodium Hyaluronate Crosspolymer, Hydrolyzed Sodium Hyaluronate, Madecassoside, Portulaca Oleracea Extract, Beta-Glucan.",
    howToUse:
      "Apply 3-4 drops to the face after toner and press gently into the skin. Can be layered twice for extra hydration.",
    cautions: "Store at room temperature away from direct sunlight.",
    variants: [
      { id: "torriden-serum-50ml", sku: "TR-DV-50", size: "50ml", price: 1399, mrp: 1750, stock: 35 },
    ],
    isNewArrival: true,
    isTrending: true,
    inStock: true,
  },
  {
    id: "skin1004-centella-ampoule",
    slug: "skin1004-madagascar-centella-ampoule",
    name: "Madagascar Centella Asiatica 100 Ampoule",
    brand: "Skin1004",
    category: "Serums & Ampoules",
    categorySlug: "serums-ampoules",
    subcategory: "Calming Ampoule",
    shortDescription:
      "Pure, single-ingredient ampoule made from 100% untouched Madagascar Centella Asiatica to restore stressed skin barriers.",
    description:
      "Skin1004's hero ampoule contains nothing but high-purity Centella Asiatica extracted from Madagascar's pristine biodiversity. It deeply soothes compromised barriers, reduces redness, regulates oil-water balance, and imparts a healthy glass glow.",
    mrp: 1750,
    price: 1449,
    rating: 4.8,
    reviewCount: 194,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ],
    skinType: ["Sensitive", "Acne-prone", "All Skin Types"],
    concerns: ["Redness", "Barrier Damage", "Acne Scars"],
    keyIngredients: [
      { name: "100% Centella Asiatica Extract", benefit: "Legendary Cica soothing power from Madagascar" },
    ],
    fullIngredients: "Centella Asiatica Extract (100%).",
    howToUse: "Drop an appropriate amount and evenly apply to the skin. Pat gently to promote absorption.",
    cautions: "Hypoallergenic and EWG green grade. Safe for daily morning and night use.",
    variants: [
      { id: "skin1004-amp-55ml", sku: "SK-CA-55", size: "55ml", price: 1449, mrp: 1750, stock: 29 },
    ],
    isNewArrival: true,
    isTrending: true,
    inStock: true,
  },
  {
    id: "im-from-rice-toner",
    slug: "im-from-rice-toner",
    name: "Yeoju Rice Milky Toner",
    brand: "I'm From",
    category: "Toners & Essences",
    categorySlug: "toners-essences",
    subcategory: "Milky Toner",
    shortDescription:
      "Nourishing milky toner formulated with 77.78% Yeoju Rice Extract to brighten dull complexion and impart deep glow.",
    description:
      "Formulated with rare organically grown rice harvested from Yeoju, South Korea. This bi-phase milky toner retexturizes dry, flaky skin, gently dissolves dead surface keratin, and creates an illuminated glass skin finish.",
    mrp: 2150,
    price: 1799,
    rating: 4.9,
    reviewCount: 180,
    images: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    ],
    skinType: ["Dry", "Dull", "Normal", "Combination"],
    concerns: ["Dullness", "Rough Skin Texture", "Dehydration"],
    keyIngredients: [
      { name: "Yeoju Rice Extract (77.78%)", benefit: "Rich in gamma-oryzanol to boost skin luminosity" },
      { name: "Niacinamide", benefit: "Fades dark spots and balances tone" },
    ],
    fullIngredients:
      "Oryza Sativa (Rice) Extract (77.78%), Methylpropanediol, Triethylhexanoin, Hydrogenated Poly(C6-14 Olefin), Niacinamide, Pentylene Glycol, Portulaca Oleracea Extract, Oryza Sativa (Rice) Bran Extract, Ulmus Davidiana Root Extract, Amaranthus Caudatus Seed Extract, Hydrogenated Lecithin, Water, Polyglyceryl-10 Myristate, Butylene Glycol, Adenosine, Cellulose Gum, Ethylhexylglycerin, 1,2-Hexanediol.",
    howToUse:
      "Shake well before use to blend the two layers. Dispense onto palms and press into skin until fully absorbed.",
    cautions: "Shake bottle thoroughly before every application.",
    variants: [
      { id: "imfrom-rice-150ml", sku: "IMF-RC-150", size: "150ml", price: 1799, mrp: 2150, stock: 22 },
    ],
    isNewArrival: false,
    isTrending: true,
    inStock: true,
  },
];

export const CATEGORIES = [
  {
    name: "Cleansers",
    slug: "cleansers",
    description: "Gentle low pH gel, foam, and cleansing oils that remove makeup and SPF without stripping.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    productCount: 12,
  },
  {
    name: "Toners & Essences",
    slug: "toners-essences",
    description: "Hydrating, soothing, and barrier-repairing watery formulas packed with heartleaf, rice, and cica.",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
    productCount: 18,
  },
  {
    name: "Serums & Ampoules",
    slug: "serums-ampoules",
    description: "Concentrated active treatments targeting acne, hyperpigmentation, hydration, and glow.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
    productCount: 24,
  },
  {
    name: "Moisturizers",
    slug: "moisturizers",
    description: "From lightweight oil-free water gels to barrier-locking ceramide creams for all climates.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80",
    productCount: 15,
  },
  {
    name: "Sunscreens",
    slug: "sunscreens",
    description: "World-renowned Korean chemical and mineral SPFs with broad-spectrum SPF 50+ PA++++.",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80",
    productCount: 14,
  },
  {
    name: "Sheet Masks",
    slug: "sheet-masks",
    description: "Instant 15-minute intensive hydration sheets soaked in fermented essences and soothing botanicals.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    productCount: 20,
  },
];

export const BRANDS = [
  {
    name: "COSRX",
    slug: "cosrx",
    origin: "Seoul, South Korea",
    tagline: "Expecting Tomorrow",
    description: "Dermatologist-formulated minimal ingredient skincare targeting active skin concerns.",
    logo: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80",
    productCount: 14,
  },
  {
    name: "Beauty of Joseon",
    slug: "beauty-of-joseon",
    origin: "Seoul, South Korea",
    tagline: "Hanbang Modernized",
    description: "Traditional Korean herbal medicine modernized for glowing, resilient, glass skin.",
    logo: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=300&q=80",
    productCount: 11,
  },
  {
    name: "Anua",
    slug: "anua",
    origin: "Seoul, South Korea",
    tagline: "Keep Things Simple",
    description: "Clean beauty prioritizing natural soothing extracts like Heartleaf and Birch.",
    logo: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=300&q=80",
    productCount: 8,
  },
  {
    name: "Laneige",
    slug: "laneige",
    origin: "Seoul, South Korea",
    tagline: "Born of Water Science",
    description: "Pioneering cellular moisture science for ultra-hydrated, dewy glass skin and lips.",
    logo: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=300&q=80",
    productCount: 9,
  },
  {
    name: "Torriden",
    slug: "torriden",
    origin: "Seoul, South Korea",
    tagline: "Your Skin, Our Priority",
    description: "Multi-depth hydration utilizing 5D molecular hyaluronic acid complexes.",
    logo: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80",
    productCount: 7,
  },
  {
    name: "Skin1004",
    slug: "skin1004",
    origin: "Seoul, South Korea",
    tagline: "Untouched Nature",
    description: "Pure Madagascar Centella Asiatica for sensitive, redness-prone skin barrier recovery.",
    logo: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80",
    productCount: 6,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}

export function getProductsByBrand(brand: string): Product[] {
  return PRODUCTS.filter(
    (p) => p.brand.toLowerCase() === brand.toLowerCase().trim()
  );
}
