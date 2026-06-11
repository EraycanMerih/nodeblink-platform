import { NextResponse } from "next/server";
import { getPublicProtocolStats } from "@/lib/public-stats";
import { getRequestOriginFromRequest } from "@/lib/request-origin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = getRequestOriginFromRequest(request);
  const stats = await getPublicProtocolStats(origin);
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
