import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminWallet, AdminAuthError } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet") ?? "";
    requireAdminWallet(wallet);

    const items = await prisma.creatorProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        username: true,
        displayName: true,
        publicKey: true,
        totalVolumeProcessed: true,
        totalTransactions: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      items: items.map((row) => ({
        ...row,
        totalVolumeProcessed: row.totalVolumeProcessed.toString(),
      })),
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Admin backend unavailable" }, { status: 503 });
  }
}

