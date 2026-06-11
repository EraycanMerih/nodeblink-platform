import { NextResponse } from "next/server";
import { PUBLIC_BASE_URL, SOLANA_RPC_URL } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const checks: Record<string, string> = {
      service: "ok",
      publicBaseUrl: PUBLIC_BASE_URL,
      rpc: SOLANA_RPC_URL.includes("/demo") ? "demo-fallback" : "configured",
    };

    try {
      const { prisma } = await import("@/lib/db");
      await prisma.$queryRaw`SELECT 1`;
      checks.database = "ok";
    } catch (error) {
      checks.database = `error: ${error instanceof Error ? error.message : "unknown"}`;
    }

    const healthy = checks.database === "ok";
    return NextResponse.json(
      {
        status: healthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        checks,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "unknown",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  }
}
