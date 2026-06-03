import { NextResponse } from "next/server";
import { TransactionStatus } from "@prisma/client";
import { requireCreatorByWallet, CreatorAuthError } from "@/lib/creator-auth";
import { prisma } from "@/lib/db";

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet")?.trim() ?? "";
    const productId = searchParams.get("productId")?.trim() || null;

    const windowDays = 30;
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - (windowDays - 1));

    const { profile } = await requireCreatorByWallet(wallet);

    if (productId) {
      const owned = await prisma.digitalAsset.findFirst({
        where: { id: productId, creatorProfileId: profile.id },
        select: { id: true },
      });
      if (!owned) {
        return NextResponse.json({ error: "Unknown product" }, { status: 404 });
      }
    }

    const txs = await prisma.transaction.findMany({
      where: {
        creatorProfileId: profile.id,
        status: TransactionStatus.CONFIRMED,
        createdAt: { gte: start },
        ...(productId ? { productId } : {}),
      },
      select: {
        createdAt: true,
        grossAmount: true,
        status: true,
        productId: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const statusBreakdown = txs.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.status] = (acc[tx.status] ?? 0) + 1;
      return acc;
    }, {});

    const byDate = new Map<string, { volume: number; count: number }>();
    let totalVolume = 0;
    for (const tx of txs) {
      const key = isoDate(tx.createdAt);
      const entry = byDate.get(key) ?? { volume: 0, count: 0 };
      const amount = Number(tx.grossAmount);
      entry.volume += amount;
      entry.count += 1;
      byDate.set(key, entry);
      totalVolume += amount;
    }

    const series: Array<{ date: string; volume: number; count: number }> = [];
    for (let i = 0; i < windowDays; i += 1) {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + i);
      const key = isoDate(day);
      const entry = byDate.get(key) ?? { volume: 0, count: 0 };
      series.push({ date: key, volume: entry.volume, count: entry.count });
    }

    const byProduct = new Map<string, { volume: number; count: number }>();
    for (const tx of txs) {
      const productId = tx.productId ?? "unknown";
      const entry = byProduct.get(productId) ?? { volume: 0, count: 0 };
      entry.volume += Number(tx.grossAmount);
      entry.count += 1;
      byProduct.set(productId, entry);
    }

    const topProducts = Array.from(byProduct.entries())
      .map(([productId, stats]) => ({
        productId: productId === "unknown" ? null : productId,
        volume: stats.volume,
        count: stats.count,
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8);

    return NextResponse.json({
      windowDays,
      totals: { volume: totalVolume, count: txs.length },
      series,
      statusBreakdown,
      topProducts,
    });
  } catch (error) {
    if (error instanceof CreatorAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Analytics backend unavailable" }, { status: 503 });
  }
}
