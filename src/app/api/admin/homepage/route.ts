import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseHomepageConfig, DEFAULT_HOMEPAGE_CONFIG, HomepageConfig } from "@/lib/homepage";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/homepage
 * Retrieve the current homepage configuration from database.
 */
export async function GET() {
  try {
    await requireAdmin();

    const record = await prisma.storeSettings.findUnique({
      where: { key: "homepage_config" },
    });

    const config = parseHomepageConfig(record?.value);
    return NextResponse.json(config);
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to fetch homepage settings" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

/**
 * POST /api/admin/homepage
 * Update the homepage banner, copy, hero card, and pillars.
 */
export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid configuration payload" }, { status: 400 });
    }

    // Merge with defaults to ensure complete structure
    const validatedConfig: HomepageConfig = {
      hero: {
        badge: String(body.hero?.badge || DEFAULT_HOMEPAGE_CONFIG.hero.badge).trim(),
        titlePrefix: String(body.hero?.titlePrefix || DEFAULT_HOMEPAGE_CONFIG.hero.titlePrefix).trim(),
        titleHighlight: String(body.hero?.titleHighlight || DEFAULT_HOMEPAGE_CONFIG.hero.titleHighlight).trim(),
        titleSuffix: String(body.hero?.titleSuffix || DEFAULT_HOMEPAGE_CONFIG.hero.titleSuffix).trim(),
        description: String(body.hero?.description || DEFAULT_HOMEPAGE_CONFIG.hero.description).trim(),
        primaryCtaText: String(body.hero?.primaryCtaText || DEFAULT_HOMEPAGE_CONFIG.hero.primaryCtaText).trim(),
        primaryCtaLink: String(body.hero?.primaryCtaLink || DEFAULT_HOMEPAGE_CONFIG.hero.primaryCtaLink).trim(),
        secondaryCtaText: String(body.hero?.secondaryCtaText || DEFAULT_HOMEPAGE_CONFIG.hero.secondaryCtaText).trim(),
        secondaryCtaLink: String(body.hero?.secondaryCtaLink || DEFAULT_HOMEPAGE_CONFIG.hero.secondaryCtaLink).trim(),
        stat1Value: String(body.hero?.stat1Value || DEFAULT_HOMEPAGE_CONFIG.hero.stat1Value).trim(),
        stat1Label: String(body.hero?.stat1Label || DEFAULT_HOMEPAGE_CONFIG.hero.stat1Label).trim(),
        stat2Value: String(body.hero?.stat2Value || DEFAULT_HOMEPAGE_CONFIG.hero.stat2Value).trim(),
        stat2Label: String(body.hero?.stat2Label || DEFAULT_HOMEPAGE_CONFIG.hero.stat2Label).trim(),
        stat3Value: String(body.hero?.stat3Value || DEFAULT_HOMEPAGE_CONFIG.hero.stat3Value).trim(),
        stat3Label: String(body.hero?.stat3Label || DEFAULT_HOMEPAGE_CONFIG.hero.stat3Label).trim(),
      },
      heroCard: {
        imageUrl: String(body.heroCard?.imageUrl || DEFAULT_HOMEPAGE_CONFIG.heroCard.imageUrl).trim(),
        badgeText: String(body.heroCard?.badgeText || DEFAULT_HOMEPAGE_CONFIG.heroCard.badgeText).trim(),
        tag: String(body.heroCard?.tag || DEFAULT_HOMEPAGE_CONFIG.heroCard.tag).trim(),
        title: String(body.heroCard?.title || DEFAULT_HOMEPAGE_CONFIG.heroCard.title).trim(),
        subtitle: String(body.heroCard?.subtitle || DEFAULT_HOMEPAGE_CONFIG.heroCard.subtitle).trim(),
        ctaText: String(body.heroCard?.ctaText || DEFAULT_HOMEPAGE_CONFIG.heroCard.ctaText).trim(),
        ctaLink: String(body.heroCard?.ctaLink || DEFAULT_HOMEPAGE_CONFIG.heroCard.ctaLink).trim(),
      },
      pillars: Array.isArray(body.pillars) && body.pillars.length === 4
        ? body.pillars.map((p: any, idx: number) => ({
            title: String(p.title || DEFAULT_HOMEPAGE_CONFIG.pillars[idx].title).trim(),
            desc: String(p.desc || DEFAULT_HOMEPAGE_CONFIG.pillars[idx].desc).trim(),
          }))
        : DEFAULT_HOMEPAGE_CONFIG.pillars,
    };

    const jsonString = JSON.stringify(validatedConfig);

    await prisma.storeSettings.upsert({
      where: { key: "homepage_config" },
      update: { value: jsonString },
      create: { key: "homepage_config", value: jsonString },
    });

    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "UPDATE_HOMEPAGE_CONFIG",
          resource: "Homepage",
          details: `Updated homepage banner and content by ${user.name || user.email}`,
        },
      });
    } catch {
      // Optional audit log
    }

    return NextResponse.json({
      success: true,
      message: "Homepage customized successfully!",
      config: validatedConfig,
    });
  } catch (error: any) {
    const isAuthErr = error.message?.includes("Unauthorized");
    return NextResponse.json(
      { error: error.message || "Failed to update homepage settings" },
      { status: isAuthErr ? 401 : 500 }
    );
  }
}

