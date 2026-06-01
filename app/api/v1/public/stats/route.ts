import { NextResponse } from "next/server";
import { getPublicProtocolStats } from "@/lib/public-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getPublicProtocolStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
