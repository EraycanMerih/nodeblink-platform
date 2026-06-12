import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Check for custom domains
  // Ignore localhost and nodeblink.dev
  const isCustomDomain = 
    !host.includes("localhost") && 
    !host.includes("127.0.0.1") && 
    !host.endsWith("nodeblink.dev") &&
    !host.endsWith("nodeblink.vercel.app");

  let response: NextResponse;

  if (isCustomDomain && !pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    const url = request.nextUrl.clone();
    url.pathname = `/domain/${host}${pathname}`;
    response = NextResponse.rewrite(url);
  } else {
    response = NextResponse.next();
  }

  if (pathname.startsWith("/embed/")) {
    // Allow framing from Twitter/X for Player Cards
    response.headers.set(
      "Content-Security-Policy",
      "frame-ancestors https://twitter.com https://x.com https://*.twitter.com https://*.x.com"
    );
  } else {
    response.headers.set("X-Frame-Options", "DENY");
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
