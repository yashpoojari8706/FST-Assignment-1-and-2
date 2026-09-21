import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Define protected route prefixes requiring active authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/api/transactions",
  "/api/audit-logs",
  "/api/tenants",
];

// Publicly accessible prefixes
const PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/webhooks",
  "/login",
  "/unauthorized",
  "/_next",
  "/favicon.ico",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip early auth checks for public routes
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || pathname === "/") {
    return NextResponse.next();
  }

  // Check if current route requires authentication
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    // Early session cookie presence validation
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      // API requests receive clean 401 Unauthorized JSON
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHENTICATED",
              message: "Authentication is required to access this endpoint.",
            },
          },
          { status: 401 }
        );
      }

      // Web navigation redirected to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Config for matching all relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
