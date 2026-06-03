import { NextRequest, NextResponse } from "next/server";

const MOBILE_UA =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

const CRAWLER_UA =
  /bot|crawl|spider|preview|Discordbot|Twitterbot|Slackbot|TelegramBot|facebookexternalhit|WhatsApp|LinkedInBot|redditbot/i;

function getPublicOrigin(request: NextRequest): string {
  const origin = request.nextUrl.origin;
  const configured = process.env.PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (origin.includes("localhost") && configured && !configured.includes("localhost")) {
    return configured;
  }
  return origin;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/creator\/([^/]+)\/?$/);
  if (!match) {
    return response;
  }

  const username = decodeURIComponent(match[1]);
  const origin = getPublicOrigin(request);
  const userAgent = request.headers.get("user-agent") ?? "";

  if (request.method !== "GET") {
    return response;
  }

  if (CRAWLER_UA.test(userAgent)) {
    return response;
  }

  if (!MOBILE_UA.test(userAgent)) {
    return response;
  }

  if (request.nextUrl.searchParams.get("desktop") === "1") {
    return response;
  }

  const actionUrl = `${origin}/api/v1/actions/creator/${encodeURIComponent(username)}`;
  const deepLink = `solana-action:${actionUrl}`;
  const phantomBrowse = `phantom://browse/${origin.replace(/^https?:\/\//, "")}/creator/${encodeURIComponent(username)}`;

  const target =
    request.nextUrl.searchParams.get("wallet") === "phantom"
      ? phantomBrowse
      : deepLink;

  return NextResponse.redirect(target, { status: 302 });
}

export const config = {
  matcher: ["/creator/:path*"],
};
