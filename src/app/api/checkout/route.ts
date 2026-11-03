import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PRODUCTS } from "@/lib/products";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().min(10, "Valid 10-digit mobile number required"),
  shippingAddress: z.object({
    street: z.string().min(5, "Street address required"),
    landmark: z.string().optional(),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State required"),
    pinCode: z.string().regex(/^\d{6}$/, "Must be a valid 6-digit Indian PIN code"),
  }),
  items: z.array(
    z.object({
      id: z.string(),
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Cart cannot be empty"),
  paymentMethod: z.enum(["COD", "RAZORPAY", "CASHFREE", "MOCK"]),
  couponCode: z.string().optional().nullable(),
  notes: z.string().optional(),
  dataConsent: z.boolean().optional(),
  whatsappConsent: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = checkoutSchema.parse(body);

    const user = await getCurrentUser();

    // 1. Fetch products from database to ensure SERVER-SIDE PRICE VALIDATION
    // Never trust client-submitted prices!
    const candidateKeys = Array.from(
      new Set(
        data.items
          .flatMap((i) => [i.productId, i.id, i.variantId])
          .filter(Boolean) as string[]
      )
    );

    const dbProducts = await prisma.product.findMany({
      where: {
        OR: [
          { id: { in: candidateKeys } },
          { slug: { in: candidateKeys } },
          {
            variants: {
              some: {
                OR: [
                  { id: { in: candidateKeys } },
                  { sku: { in: candidateKeys } },
                ],
              },
            },
          },
        ],
      },
      include: { variants: true },
    });

    // Calculate subtotal strictly from verified records
    let calculatedSubtotal = 0;
    const validatedOrderItems: any[] = [];

    for (const item of data.items) {
      // Find matching DB product first
      let dbProduct: any = dbProducts.find(
        (p) =>
          p.id === item.productId ||
          p.id === item.id ||
          p.slug === item.productId ||
          p.slug === item.id ||
          p.variants.some(
            (v) =>
              v.id === item.variantId ||
              v.id === item.id ||
              v.sku === item.variantId ||
              v.sku === item.id
          )
      );

      // Check PRODUCTS catalog fallback
      const catalogProduct = PRODUCTS.find(
        (cp) =>
          cp.id === item.productId ||
          cp.id === item.id ||
          cp.slug === item.productId ||
          cp.slug === item.id ||
          cp.variants.some(
            (v) =>
              v.id === item.variantId ||
              v.id === item.id ||
              v.sku === item.variantId ||
              v.sku === item.id
          )
      );

      if (!dbProduct && !catalogProduct) {
        return NextResponse.json(
          { error: `Product not found: ${item.id || item.productId}` },
          { status: 400 }
        );
      }

      // If found in catalog but not in DB results, ensure record in DB
      if (!dbProduct && catalogProduct) {
        dbProduct = await prisma.product.findFirst({
          where: {
            OR: [
              { id: catalogProduct.id },
              { slug: catalogProduct.slug },
            ],
          },
          include: { variants: true },
        });

        if (!dbProduct) {
          try {
            const brand = await prisma.brand.findFirst({
              where: { name: catalogProduct.brand },
            });
            const category = await prisma.category.findFirst({
              where: { slug: catalogProduct.categorySlug },
            });

            dbProduct = await prisma.product.create({
              data: {
                id: catalogProduct.id,
                slug: catalogProduct.slug,
                name: catalogProduct.name,
                brandId: brand?.id || null,
                categoryId: category?.id || null,
                subcategory: catalogProduct.subcategory,
                shortDescription: catalogProduct.shortDescription,
                description: catalogProduct.description,
                price: catalogProduct.price,
                mrp: catalogProduct.mrp,
                rating: catalogProduct.rating,
                reviewCount: catalogProduct.reviewCount,
                images: JSON.stringify(catalogProduct.images),
                skinType: JSON.stringify(catalogProduct.skinType),
                concerns: JSON.stringify(catalogProduct.concerns),
                keyIngredients: JSON.stringify(catalogProduct.keyIngredients),
                fullIngredients: catalogProduct.fullIngredients,
                howToUse: catalogProduct.howToUse,
                cautions: catalogProduct.cautions,
                isBestSeller: !!catalogProduct.isBestSeller,
                isTrending: !!catalogProduct.isTrending,
                status: "ACTIVE",
                inStock: true,
                variants: {
                  create: catalogProduct.variants.map((v) => ({
                    id: v.id,
                    sku: v.sku,
                    size: v.size,
                    price: v.price,
                    mrp: v.mrp,
                    inventory: {
                      create: {
                        quantityOnHand: v.stock || 50,
                        reservedQuantity: 0,
                        lowStockThreshold: 5,
                      },
                    },
                  })),
                },
              },
              include: { variants: true },
            });
          } catch (createErr) {
            console.warn("Could not auto-create dbProduct, using catalog fallback:", createErr);
          }
        }
      }

      // Determine variant & verified price
      let unitPrice = dbProduct ? dbProduct.price : catalogProduct!.price;
      let size = "Standard";
      let variantId = item.variantId || null;

      const allVariants = dbProduct?.variants || (catalogProduct ? catalogProduct.variants : []);
      const matchedVariant =
        allVariants.find(
          (v: any) =>
            v.id === item.variantId ||
            v.id === item.id ||
            v.sku === item.variantId ||
            v.sku === item.id
        ) || allVariants[0];

      if (matchedVariant) {
        unitPrice = matchedVariant.price;
        size = matchedVariant.size;
        variantId = matchedVariant.id;
      }

      const itemTotal = unitPrice * item.quantity;
      const taxShare = Math.round(itemTotal * (18 / 118)); // 18% inclusive GST

      calculatedSubtotal += itemTotal;

      validatedOrderItems.push({
        productId: dbProduct ? dbProduct.id : (catalogProduct?.id || item.productId),
        variantId,
        productName: dbProduct ? dbProduct.name : catalogProduct!.name,
        brandName: (dbProduct ? dbProduct.subcategory : catalogProduct?.subcategory) || "BLUMAC",
        size,
        unitPrice,
        taxAmount: taxShare,
        quantity: item.quantity,
        subtotal: itemTotal,
      });
    }

    // 2. Coupon Engine Validation & Recalculation
    let discountTotal = 0;
    let validCouponId: string | null = null;

    if (data.couponCode) {
      const code = data.couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const validDates =
          coupon.startDate <= now && (!coupon.endDate || coupon.endDate >= now);

        if (validDates && calculatedSubtotal >= coupon.minOrderValue) {
          validCouponId = coupon.id;

          if (coupon.discountType === "PERCENTAGE") {
            const rawDiscount = (calculatedSubtotal * coupon.discountValue) / 100;
            discountTotal = coupon.maxDiscountCap
              ? Math.min(rawDiscount, coupon.maxDiscountCap)
              : rawDiscount;
          } else if (coupon.discountType === "FIXED") {
            discountTotal = coupon.discountValue;
          } else if (coupon.discountType === "FREE_SHIPPING") {
            discountTotal = 99;
          }
        }
      }
    }

    discountTotal = Math.round(discountTotal);

    // 3. Shipping Charge Calculation (Free for ₹999+)
    const shippingFee = calculatedSubtotal >= 999 ? 0 : 99;

    // 4. Final Grand Total Recalculation
    const grandTotal = Math.max(0, calculatedSubtotal - discountTotal + shippingFee);
    const taxTotal = Math.round(calculatedSubtotal * (18 / 118));

    // 5. Generate Unique Order Number
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `BLU-${new Date().getFullYear()}-${randomSuffix}`;

    // 6. Database Transaction: Create Order, OrderItems, Redemptions & Inventory Updates
    const order = await prisma.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id || null,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          shippingAddress: JSON.stringify(data.shippingAddress),
          subtotal: calculatedSubtotal,
          discountTotal,
          shippingFee,
          taxTotal,
          grandTotal,
          status: "CONFIRMED",
          paymentStatus:
            data.paymentMethod === "COD"
              ? "PENDING"
              : data.paymentMethod === "MOCK"
              ? "PAID"
              : "PENDING",
          paymentMethod: data.paymentMethod,
          couponCode: data.couponCode || null,
          notes: data.notes || null,
          items: {
            create: validatedOrderItems,
          },
          payments: {
            create: {
              gateway: data.paymentMethod,
              transactionId: `txn_${orderNumber}_${Date.now()}`,
              amount: grandTotal,
              status:
                data.paymentMethod === "COD"
                  ? "PENDING"
                  : data.paymentMethod === "MOCK"
                  ? "SUCCESS"
                  : "PENDING",
              signatureVerified: data.paymentMethod === "MOCK",
            },
          },
          shipments: {
            create: {
              courier: "BlueDart Express Air",
              awbNumber: `BLU${Date.now().toString().slice(-9)}IN`,
              status: "MANIFESTED",
            },
          },
        },
        include: {
          items: true,
        },
      });

      // Record coupon redemption if coupon was applied
      if (validCouponId) {
        await tx.couponRedemption.create({
          data: {
            couponId: validCouponId,
            orderId: newOrder.id,
            userId: user?.id || null,
            discountAmount: discountTotal,
          },
        });
        await tx.coupon.update({
          where: { id: validCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    // 7. Optional Razorpay Online Gateway Order Generation
    let razorpayOrderId = null;
    const rzpKeyId = process.env.RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

    if (
      data.paymentMethod === "RAZORPAY" &&
      rzpKeyId &&
      rzpSecret &&
      rzpKeyId !== "rzp_test_placeholder_key"
    ) {
      try {
        const auth = Buffer.from(`${rzpKeyId}:${rzpSecret}`).toString("base64");
        const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: Math.round(order.grandTotal * 100), // in paise
            currency: "INR",
            receipt: order.orderNumber,
            notes: {
              orderNumber: order.orderNumber,
              customerName: data.customerName,
              customerEmail: data.customerEmail,
            },
          }),
        });

        if (rzpRes.ok) {
          const rzpData = await rzpRes.json();
          razorpayOrderId = rzpData.id;
        } else {
          console.warn("Razorpay order creation response not OK:", await rzpRes.text());
        }
      } catch (rzpErr) {
        console.error("Razorpay order call error:", rzpErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      grandTotal: order.grandTotal,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      razorpayOrderId,
      razorpayKeyId: rzpKeyId && rzpKeyId !== "rzp_test_placeholder_key" ? rzpKeyId : null,
    });
  } catch (error: any) {
    console.error("Checkout submission error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to place order. Please review your cart and try again." },
      { status: 500 }
    );
  }
}
