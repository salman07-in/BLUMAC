import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "blumac-korean-store-default-jwt-secret-key-32chars";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "blumac_session";

const HOMEPAGE_MARKDOWN = `# BLUMAC Korean Store | Premium Korean Skincare in India

> 100% Authentic Korean Skincare imported directly from Seoul, South Korea.
> Fast All-India delivery via BlueDart Express Air. Free shipping on orders above ₹999.

## Bestselling Skincare Products & Live Prices (INR)

| Product | Brand | Size | Price | MRP | Discount | URL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Advanced Snail 96 Mucin Power Essence | COSRX | 100ml | ₹1,199 | ₹1,450 | 17% OFF | https://blumac.in/product/cosrx-advanced-snail-96-mucin-power-essence |
| Relief Sun: Rice + Probiotics SPF50+ | Beauty of Joseon | 50ml | ₹1,250 | ₹1,550 | 19% OFF | https://blumac.in/product/beauty-of-joseon-relief-sun-rice-probiotics-spf50 |
| Heartleaf 77% Soothing Toner | Anua | 250ml | ₹1,650 | ₹1,950 | 15% OFF | https://blumac.in/product/anua-heartleaf-77-soothing-toner |
| Lip Sleeping Mask Berry | Laneige | 20g | ₹550 | ₹600 | 8% OFF | https://blumac.in/product/laneige-lip-sleeping-mask-berry |
| Low pH Good Morning Gel Cleanser | COSRX | 150ml | ₹850 | ₹950 | 11% OFF | https://blumac.in/product/cosrx-low-ph-good-morning-gel-cleanser |
| Dive-In Hyaluronic Acid Serum | Torriden | 50ml | ₹1,599 | ₹1,850 | 14% OFF | https://blumac.in/product/torriden-dive-in-low-molecular-hyaluronic-acid-serum |
| Madagascar Centella Ampoule | SKIN1004 | 100ml | ₹1,499 | ₹1,750 | 14% OFF | https://blumac.in/product/skin1004-madagascar-centella-ampoule |

## Core Skincare Categories
- Cleansers: https://blumac.in/category/cleansers
- Toners & Essences: https://blumac.in/category/toners-essences
- Serums & Ampoules: https://blumac.in/category/serums-ampoules
- Moisturizers: https://blumac.in/category/moisturizers
- Sunscreens: https://blumac.in/category/sunscreens

## Agent & Developer Resources
- Full Catalog: https://blumac.in/shop
- Search API: https://blumac.in/api/search?q={query}
- MCP Server Card: https://blumac.in/.well-known/mcp/server-card.json
- LLMs Guide: https://blumac.in/llms.txt
- Robots Policy: https://blumac.in/robots.txt
- Content-Signal: search=yes, ai-train=no
`;

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Goal 12: Serves Markdown when an agent asks for Accept: text/markdown
  const acceptHeader = req.headers.get("accept") || "";
  const isMarkdownRequested =
    acceptHeader.includes("text/markdown") ||
    acceptHeader.includes("text/x-markdown") ||
    searchParams.get("format") === "markdown";

  if (pathname === "/" && isMarkdownRequested) {
    return new NextResponse(HOMEPAGE_MARKDOWN, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Signal": "search=yes, ai-train=no",
        "Vary": "Accept",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=1800",
      },
    });
  }

  // Protect /admin UI and /api/admin API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-admin-path", pathname);

    // Allow public access to login and auth endpoints
    if (
      pathname === "/admin/login" ||
      pathname === "/api/admin/auth/login" ||
      pathname === "/api/admin/auth/logout"
    ) {
      const res = NextResponse.next({
        request: { headers: requestHeaders },
      });
      res.headers.set("Content-Signal", "search=yes, ai-train=no");
      return res;
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized: Admin privileges required." },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = (payload as any).role;

      if (role !== "ADMIN" && role !== "STAFF") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Forbidden: Administrative access required." },
            { status: 403 }
          );
        }
        const loginUrl = new URL("/admin/login", req.url);
        loginUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(loginUrl);
      }

      // Valid admin session, proceed
      const res = NextResponse.next({
        request: { headers: requestHeaders },
      });
      res.headers.set("Content-Signal", "search=yes, ai-train=no");
      return res;
    } catch {
      // Invalid/expired token
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized: Session expired or invalid." },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const res = NextResponse.next();
  // Goal 2: Content Signals declared on all responses
  res.headers.set("Content-Signal", "search=yes, ai-train=no");
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
