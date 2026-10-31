import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌸 Seeding BLUMAC Korean Store database...");

  // 1. Admin & Customer Users
  const passwordHashAdmin = await bcrypt.hash("BlumacAdmin@2026", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@blumac.in" },
    update: {},
    create: {
      email: "admin@blumac.in",
      passwordHash: passwordHashAdmin,
      name: "BLUMAC Head Admin",
      phone: "+91 98765 43210",
      role: "ADMIN",
      isEmailVerified: true,
      profile: {
        create: {
          loyaltyPoints: 1000,
          referralCode: "BLUMACVIP",
        },
      },
    },
  });

  const passwordHashCustomer = await bcrypt.hash("Customer@2026", 10);
  const customer = await prisma.user.upsert({
    where: { email: "priya@example.com" },
    update: {},
    create: {
      email: "priya@example.com",
      passwordHash: passwordHashCustomer,
      name: "Priya Sharma",
      phone: "+91 98123 45678",
      role: "CUSTOMER",
      isEmailVerified: true,
      profile: {
        create: {
          loyaltyPoints: 150,
          referralCode: "PRIYA10",
          skinType: "Dehydrated / Sensitive",
          concerns: "Barrier Repair, Dark Spots",
        },
      },
      addresses: {
        create: {
          fullName: "Priya Sharma",
          phone: "+91 98123 45678",
          street: "402, Lotus Orchid, Indiranagar 100ft Road",
          landmark: "Near BDA Complex",
          city: "Bengaluru",
          state: "Karnataka",
          pinCode: "560038",
          isDefault: true,
        },
      },
    },
  });

  console.log("✅ Seeded Admin & Customer users");

  // 2. Brands
  const brandsData = [
    { name: "COSRX", slug: "cosrx", origin: "Seoul, South Korea", tagline: "Expecting Tomorrow" },
    { name: "Beauty of Joseon", slug: "beauty-of-joseon", origin: "Seoul, South Korea", tagline: "Hanbang Modernized" },
    { name: "Anua", slug: "anua", origin: "Seoul, South Korea", tagline: "Keep Things Simple" },
    { name: "Laneige", slug: "laneige", origin: "Seoul, South Korea", tagline: "Born of Water Science" },
    { name: "Torriden", slug: "torriden", origin: "Seoul, South Korea", tagline: "Your Skin, Our Priority" },
    { name: "Skin1004", slug: "skin1004", origin: "Seoul, South Korea", tagline: "Untouched Nature" },
    { name: "I'm From", slug: "im-from", origin: "Seoul, South Korea", tagline: "Pure Ingredients From Nature" },
  ];

  const brandMap = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandMap[b.name] = brand.id;
  }
  console.log("✅ Seeded Korean Skincare Brands");

  // 3. Categories
  const categoriesData = [
    { name: "Cleansers", slug: "cleansers", description: "Low pH foams and cleansing oils" },
    { name: "Toners & Essences", slug: "toners-essences", description: "Watery hydration & balance" },
    { name: "Serums & Ampoules", slug: "serums-ampoules", description: "High-concentration active treatments" },
    { name: "Moisturizers", slug: "moisturizers", description: "Barrier creams and sleeping masks" },
    { name: "Sunscreens", slug: "sunscreens", description: "Broad-spectrum SPF 50+ PA++++" },
    { name: "Sheet Masks", slug: "sheet-masks", description: "15-minute intensive hydration treatments" },
  ];

  const categoryMap = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoryMap[c.name] = cat.id;
  }
  console.log("✅ Seeded Skincare Categories");

  // 4. Products & Inventory
  const productsToSeed = [
    {
      id: "cosrx-snail-96",
      variantId: "cosrx-snail-100ml",
      slug: "cosrx-advanced-snail-96-mucin-power-essence",
      name: "Advanced Snail 96 Mucin Power Essence",
      brandName: "COSRX",
      categoryName: "Serums & Ampoules",
      subcategory: "Hydrating Essence",
      shortDescription: "Cult-favorite essence formulated with 96.3% Snail Secretion Filtrate for deep hydration.",
      description: "Lightweight yet intensely nourishing, penetrates deep into dermal layers to replenish lost moisture.",
      mrp: 1450,
      price: 1199,
      rating: 4.8,
      reviewCount: 342,
      images: JSON.stringify(["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"]),
      skinType: JSON.stringify(["All Skin Types", "Dry", "Sensitive"]),
      concerns: JSON.stringify(["Dehydration", "Barrier Repair", "Dullness"]),
      keyIngredients: JSON.stringify([{ name: "Snail Mucin 96.3%", benefit: "Restores moisture barrier" }]),
      fullIngredients: "Snail Secretion Filtrate, Betaine, Butylene Glycol, 1,2-Hexanediol, Sodium Polyacrylate, Sodium Hyaluronate.",
      howToUse: "Dispense 2-3 pumps onto palms and gently pat into cleansed skin.",
      cautions: "For external use only. Discontinue if rash occurs.",
      sku: "CX-SNL-100",
      size: "100ml",
      stock: 45,
      isBestSeller: true,
      isTrending: true,
    },
    {
      id: "boj-relief-sun",
      variantId: "boj-sun-50ml",
      slug: "beauty-of-joseon-relief-sun-rice-probiotics-spf50",
      name: "Relief Sun: Rice + Probiotics (SPF50+ PA++++)",
      brandName: "Beauty of Joseon",
      categoryName: "Sunscreens",
      subcategory: "Chemical Sunscreen",
      shortDescription: "Organic chemical sunscreen enriched with 30% Rice Extract with zero white cast.",
      description: "Ultra-gentle daily sunscreen glides effortlessly like a light moisturizing lotion with broad-spectrum SPF 50+.",
      mrp: 1400,
      price: 1149,
      rating: 4.9,
      reviewCount: 489,
      images: JSON.stringify(["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"]),
      skinType: JSON.stringify(["All Skin Types", "Sensitive", "Dry"]),
      concerns: JSON.stringify(["Sun Protection", "Hyperpigmentation"]),
      keyIngredients: JSON.stringify([{ name: "Rice Extract (30%)", benefit: "Brightens and nourishes" }]),
      fullIngredients: "Water, Oryza Sativa (Rice) Extract, Dibutyl Adipate, Niacinamide, Ethylhexyl Triazone.",
      howToUse: "Apply generously across face and neck 15 minutes before sun exposure.",
      cautions: "Reapply every 2-3 hours during prolonged sun exposure.",
      sku: "BOJ-SUN-50",
      size: "50ml",
      stock: 68,
      isBestSeller: true,
      isTrending: true,
    },
    {
      id: "anua-heartleaf-77",
      variantId: "anua-77-250ml",
      slug: "anua-heartleaf-77-soothing-toner",
      name: "Heartleaf 77% Soothing Toner",
      brandName: "Anua",
      categoryName: "Toners & Essences",
      subcategory: "Soothing Toner",
      shortDescription: "Korea's #1 soothing toner containing 77% Houttuynia Cordata to calm redness.",
      description: "Sub-acidic pH 5.5 toner clinically tested to soothe sensitive, irritated, or acne-prone skin.",
      mrp: 1950,
      price: 1599,
      rating: 4.8,
      reviewCount: 275,
      images: JSON.stringify(["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80"]),
      skinType: JSON.stringify(["Acne-prone", "Sensitive", "Oily"]),
      concerns: JSON.stringify(["Redness", "Acne", "Barrier Repair"]),
      keyIngredients: JSON.stringify([{ name: "Houttuynia Cordata (77%)", benefit: "Cools redness & inflammation" }]),
      fullIngredients: "Houttuynia Cordata Extract (77%), Purified Water, 1,2-Hexanediol, Glycerin, Betaine, Panthenol.",
      howToUse: "Apply to hands or cotton pad and gently pat across face after cleansing.",
      cautions: "Avoid contact with eyes.",
      sku: "ANUA-HL-250",
      size: "250ml",
      stock: 32,
      isBestSeller: true,
      isTrending: true,
    },
    {
      id: "laneige-lip-sleeping-mask",
      variantId: "laneige-lip-20g",
      slug: "laneige-lip-sleeping-mask-berry",
      name: "Lip Sleeping Mask (Berry Flavor)",
      brandName: "Laneige",
      categoryName: "Moisturizers",
      subcategory: "Lip Care",
      shortDescription: "Iconic leave-on overnight lip treatment infused with Vitamin C and Berry Fruit Complex.",
      description: "Dissolves dead skin cells and delivers intensive moisture overnight for supple, plump lips.",
      mrp: 1450,
      price: 1199,
      rating: 4.9,
      reviewCount: 610,
      images: JSON.stringify(["https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80"]),
      skinType: JSON.stringify(["All Skin Types"]),
      concerns: JSON.stringify(["Chapped Lips", "Dryness"]),
      keyIngredients: JSON.stringify([{ name: "Berry Fruit Complex", benefit: "Rich in antioxidants" }]),
      fullIngredients: "Diisostearyl Malate, Hydrogenated Polyisobutene, Astrocaryum Murumuru Seed Butter, Hyaluronic Acid.",
      howToUse: "Apply a generous layer onto lips before bedtime.",
      cautions: "Do not ingest.",
      sku: "LAN-LIP-20",
      size: "20g",
      stock: 54,
      isBestSeller: true,
      isTrending: false,
    },
    {
      id: "boj-glow-serum",
      variantId: "boj-glow-30ml",
      slug: "beauty-of-joseon-glow-serum-propolis-niacinamide",
      name: "Glow Serum: Propolis + Niacinamide",
      brandName: "Beauty of Joseon",
      categoryName: "Serums & Ampoules",
      subcategory: "Brightening Serum",
      shortDescription: "Honey-like glow serum enriched with 60% Propolis Extract and 2% Niacinamide to soothe inflammation.",
      description: "Crafted specifically for troubled, enlarged-pore skin, this silky serum imparts Korean glass-skin radiance.",
      mrp: 1450,
      price: 1199,
      rating: 4.7,
      reviewCount: 312,
      images: JSON.stringify(["https://images.unsplash.com/photo-1608248597359-28c049969299?auto=format&fit=crop&w=800&q=80"]),
      skinType: JSON.stringify(["All Skin Types", "Acne-prone", "Combination"]),
      concerns: JSON.stringify(["Enlarged Pores", "Dullness", "Acne Spots"]),
      keyIngredients: JSON.stringify([{ name: "Propolis Extract (60%)", benefit: "Antiseptic and healing" }]),
      fullIngredients: "Propolis Extract, Dipropylene Glycol, Glycerin, Butylene Glycol, Water, Niacinamide.",
      howToUse: "Apply 2-3 drops onto clean skin after toner.",
      cautions: "Patch test prior to use if allergic to bee products.",
      sku: "BOJ-GLW-30",
      size: "30ml",
      stock: 40,
      isBestSeller: true,
      isTrending: false,
    },
    {
      id: "cosrx-good-morning-cleanser",
      variantId: "cosrx-cl-150ml",
      slug: "cosrx-low-ph-good-morning-gel-cleanser",
      name: "Low pH Good Morning Gel Cleanser",
      brandName: "COSRX",
      categoryName: "Cleansers",
      subcategory: "Gel Cleanser",
      shortDescription: "Mild gel cleanser formulated with Tea Tree Oil and natural BHA to gently cleanse without stripping.",
      description: "Formulated at skin natural acidic pH (5.0 - 6.0), whisking away overnight impurities and excess sebum.",
      mrp: 950,
      price: 799,
      rating: 4.7,
      reviewCount: 388,
      images: JSON.stringify(["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"]),
      skinType: JSON.stringify(["All Skin Types", "Sensitive", "Oily"]),
      concerns: JSON.stringify(["Excess Sebum", "Clogged Pores"]),
      keyIngredients: JSON.stringify([{ name: "Tea Tree Leaf Oil", benefit: "Natural antibacterial astringent" }]),
      fullIngredients: "Water, Cocamidopropyl Betaine, Sodium Lauroyl Methyl Isethionate, Polysorbate 20, Tea Tree Leaf Oil.",
      howToUse: "Gently massage a small amount into wet skin in circular motions. Rinse with lukewarm water.",
      cautions: "For external use only. Avoid contact with eyes.",
      sku: "CX-CL-150",
      size: "150ml",
      stock: 52,
      isBestSeller: true,
      isTrending: false,
    },
    {
      id: "torriden-dive-in-serum",
      variantId: "torriden-serum-50ml",
      slug: "torriden-dive-in-low-molecular-hyaluronic-acid-serum",
      name: "DIVE-IN Low Molecular Hyaluronic Acid Serum",
      brandName: "Torriden",
      categoryName: "Serums & Ampoules",
      subcategory: "Hydrating Serum",
      shortDescription: "Award-winning pastel blue serum with 5D Multi-Hyaluronic Acid complex delivering deep cellular quenching.",
      description: "Penetrates every epidermal stratum to immediately relieve tightness and plump skin with zero stickiness.",
      mrp: 1750,
      price: 1399,
      rating: 4.9,
      reviewCount: 220,
      images: JSON.stringify(["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"]),
      skinType: JSON.stringify(["Dehydrated", "All Skin Types", "Sensitive"]),
      concerns: JSON.stringify(["Deep Dehydration", "Dullness", "Tightness"]),
      keyIngredients: JSON.stringify([{ name: "5D Multi-Hyaluronic Acid", benefit: "Multi-depth hydration" }]),
      fullIngredients: "Water, Butylene Glycol, Glycerin, Dipropylene Glycol, 1,2-Hexanediol, Betaine, Malachite Extract.",
      howToUse: "Apply 3-4 drops to face after toner and press gently into skin.",
      cautions: "Store away from direct sunlight.",
      sku: "TR-DV-50",
      size: "50ml",
      stock: 35,
      isBestSeller: false,
      isTrending: true,
    },
    {
      id: "skin1004-centella-ampoule",
      variantId: "skin1004-amp-55ml",
      slug: "skin1004-madagascar-centella-ampoule",
      name: "Madagascar Centella Asiatica 100 Ampoule",
      brandName: "Skin1004",
      categoryName: "Serums & Ampoules",
      subcategory: "Calming Ampoule",
      shortDescription: "Pure single-ingredient ampoule made from 100% untouched Madagascar Centella Asiatica.",
      description: "Deeply soothes compromised barriers, reduces redness, and regulates oil-water balance with glass glow.",
      mrp: 1750,
      price: 1449,
      rating: 4.8,
      reviewCount: 194,
      images: JSON.stringify(["https://images.unsplash.com/photo-1608248597359-28c049969299?auto=format&fit=crop&w=800&q=80"]),
      skinType: JSON.stringify(["Sensitive", "Acne-prone", "All Skin Types"]),
      concerns: JSON.stringify(["Redness", "Barrier Damage", "Acne Scars"]),
      keyIngredients: JSON.stringify([{ name: "100% Centella Asiatica", benefit: "Pure soothing Cica power" }]),
      fullIngredients: "Centella Asiatica Extract (100%).",
      howToUse: "Drop appropriate amount and gently pat to promote absorption.",
      cautions: "Hypoallergenic and EWG green grade.",
      sku: "SK-CA-55",
      size: "55ml",
      stock: 29,
      isBestSeller: false,
      isTrending: true,
    },
    {
      id: "im-from-rice-toner",
      variantId: "imfrom-rice-150ml",
      slug: "im-from-rice-toner",
      name: "Yeoju Rice Milky Toner",
      brandName: "I'm From",
      categoryName: "Toners & Essences",
      subcategory: "Milky Toner",
      shortDescription: "Nourishing milky toner formulated with 77.78% Yeoju Rice Extract to brighten dull complexion.",
      description: "Bi-phase milky toner retexturizes dry, flaky skin and creates an illuminated glass skin finish.",
      mrp: 2150,
      price: 1799,
      rating: 4.9,
      reviewCount: 180,
      images: JSON.stringify(["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80"]),
      skinType: JSON.stringify(["Dry", "Dull", "Normal", "Combination"]),
      concerns: JSON.stringify(["Dullness", "Rough Skin Texture", "Dehydration"]),
      keyIngredients: JSON.stringify([{ name: "Yeoju Rice Extract (77.78%)", benefit: "Boosts luminosity" }]),
      fullIngredients: "Oryza Sativa (Rice) Extract (77.78%), Methylpropanediol, Triethylhexanoin, Niacinamide.",
      howToUse: "Shake well before use to blend two layers. Dispense onto palms and press into skin.",
      cautions: "Shake bottle thoroughly before every application.",
      sku: "IMF-RC-150",
      size: "150ml",
      stock: 22,
      isBestSeller: false,
      isTrending: true,
    },
  ];

  for (const p of productsToSeed) {
    // Delete any old product with same slug or id to ensure clean canonical IDs
    const existing = await prisma.product.findFirst({
      where: { OR: [{ id: p.id }, { slug: p.slug }] },
      include: { variants: true },
    });

    if (existing) {
      await prisma.product.delete({ where: { id: existing.id } });
    }

    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        brandId: brandMap[p.brandName] || null,
        categoryId: categoryMap[p.categoryName] || null,
        subcategory: p.subcategory,
        shortDescription: p.shortDescription,
        description: p.description,
        mrp: p.mrp,
        price: p.price,
        rating: p.rating,
        reviewCount: p.reviewCount,
        images: p.images,
        skinType: p.skinType,
        concerns: p.concerns,
        keyIngredients: p.keyIngredients,
        fullIngredients: p.fullIngredients,
        howToUse: p.howToUse,
        cautions: p.cautions,
        isBestSeller: p.isBestSeller,
        isTrending: p.isTrending,
        status: "ACTIVE",
        inStock: true,
        variants: {
          create: {
            id: p.variantId,
            sku: p.sku,
            size: p.size,
            price: p.price,
            mrp: p.mrp,
            inventory: {
              create: {
                quantityOnHand: p.stock,
                reservedQuantity: 0,
                lowStockThreshold: 5,
              },
            },
          },
        },
      },
    });
  }
  console.log("✅ Seeded Skincare Products, Variants & Inventory");

  // 5. Complete Coupon Engine Rules
  const couponsToSeed = [
    {
      code: "SEOUL10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 0,
      maxDiscountCap: 1000,
      totalUsageLimit: 5000,
      perCustomerLimit: 5,
      isActive: true,
    },
    {
      code: "FIRSTORDER",
      discountType: "FIXED",
      discountValue: 200,
      minOrderValue: 999,
      totalUsageLimit: 10000,
      perCustomerLimit: 1,
      isActive: true,
    },
    {
      code: "KBEAUTY25",
      discountType: "PERCENTAGE",
      discountValue: 25,
      minOrderValue: 1499,
      maxDiscountCap: 500,
      totalUsageLimit: 2000,
      perCustomerLimit: 2,
      isActive: true,
    },
  ];

  for (const c of couponsToSeed) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  console.log("✅ Seeded Coupon Engine Rules");

  // 6. Sample Initial Confirmed Order with Immutable Historic Price Snapshot
  const initialOrder = await prisma.order.upsert({
    where: { orderNumber: "BLU-2026-98102" },
    update: {},
    create: {
      orderNumber: "BLU-2026-98102",
      userId: customer.id,
      customerName: "Priya Sharma",
      customerEmail: "priya@example.com",
      customerPhone: "+91 98123 45678",
      shippingAddress: JSON.stringify({
        fullName: "Priya Sharma",
        phone: "+91 98123 45678",
        street: "402, Lotus Orchid, Indiranagar 100ft Road",
        landmark: "Near BDA Complex",
        city: "Bengaluru",
        state: "Karnataka",
        pinCode: "560038",
      }),
      subtotal: 2348,
      discountTotal: 234,
      shippingFee: 0,
      taxTotal: 322,
      grandTotal: 2114,
      status: "SHIPPED",
      paymentStatus: "PAID",
      paymentMethod: "RAZORPAY",
      couponCode: "SEOUL10",
      trackingNumber: "BD98271892IN",
      courierName: "BlueDart Express Air",
      notes: "Fragile skincare bottles, deliver before 6 PM.",
      items: {
        create: [
          {
            productId: "cosrx-snail-96",
            productName: "Advanced Snail 96 Mucin Power Essence",
            brandName: "COSRX",
            size: "100ml",
            unitPrice: 1199,
            taxAmount: 182,
            quantity: 1,
            subtotal: 1199,
          },
          {
            productId: "boj-relief-sun",
            productName: "Relief Sun: Rice + Probiotics (SPF50+ PA++++)",
            brandName: "Beauty of Joseon",
            size: "50ml",
            unitPrice: 1149,
            taxAmount: 140,
            quantity: 1,
            subtotal: 1149,
          },
        ],
      },
      payments: {
        create: {
          gateway: "RAZORPAY",
          transactionId: "pay_Krn871923BLU",
          amount: 2114,
          status: "SUCCESS",
          signatureVerified: true,
          gatewayResponse: JSON.stringify({ rzp_payment_id: "pay_Krn871923BLU", method: "upi" }),
        },
      },
      shipments: {
        create: {
          courier: "BlueDart Express Air",
          awbNumber: "BD98271892IN",
          trackingUrl: "https://www.bluedart.com/tracking?awb=BD98271892IN",
          status: "IN_TRANSIT",
          dispatchedAt: new Date(),
        },
      },
    },
  });
  console.log("✅ Seeded Sample Confirmed Order & Shipment");

  // 7. Store Settings
  const settings = [
    { key: "store_name", value: "BLUMAC Korean Store" },
    { key: "support_email", value: "care@blumac.in" },
    { key: "support_phone", value: "+91 (080) 4123-5689" },
    { key: "free_shipping_threshold", value: "999" },
    { key: "standard_shipping_charge", value: "99" },
    { key: "gst_rate_percent", value: "18" },
  ];

  for (const s of settings) {
    await prisma.storeSettings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Seeded Store Settings");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
