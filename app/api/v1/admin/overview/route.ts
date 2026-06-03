import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminWallet, AdminAuthError } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet") ?? "";
    await requireAdminWallet(wallet);

    const [creators, products, txAgg] = await Promise.all([
      prisma.creatorProfile.count(),
      prisma.digitalAsset.count(),
      prisma.transaction.aggregate({
        _count: true,
        _sum: { grossAmount: true },
      }),
    ]);

    return NextResponse.json({
      creators,
      products,
      transactions: txAgg._count,
      volume: Number(txAgg._sum.grossAmount ?? 0),
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Admin backend unavailable" }, { status: 503 });
  }
}
