import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "blumac-korean-store-default-jwt-secret-key-32chars";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "blumac_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only intercept /admin routes
  if (pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-admin-path", pathname);

    // Allow access to the login portal itself
    if (pathname === "/admin/login") {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = (payload as any).role;

      if (role !== "ADMIN" && role !== "STAFF") {
        const loginUrl = new URL("/admin/login", req.url);
        loginUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(loginUrl);
      }

      // Valid admin session, proceed
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch {
      // Invalid/expired token
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
