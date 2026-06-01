import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet")?.trim();

  if (!wallet) {
    return NextResponse.json({ error: "wallet query required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { walletAddress: wallet },
    include: {
      creatorProfile: {
        include: {
          digitalAssets: { orderBy: { sortOrder: "asc" } },
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      },
    },
  });

  if (!user?.creatorProfile) {
    return NextResponse.json({
      onboarded: false,
      wallet,
      metrics: { volume: 0, transactions: 0, products: 0 },
      products: [],
      transactions: [],
    });
  }

  const profile = user.creatorProfile;
  const confirmed = profile.transactions.filter((t) => t.status === "CONFIRMED");

  return NextResponse.json({
    onboarded: true,
    wallet,
    username: profile.username,
    displayName: profile.displayName,
    checkoutUrl: `/creator/${profile.username}`,
    actionUrl: `/api/v1/actions/creator/${profile.username}`,
    metrics: {
      volume: Number(profile.totalVolumeProcessed),
      transactions: profile.totalTransactions,
      products: profile.digitalAssets.length,
      confirmedSales: confirmed.length,
    },
    products: profile.digitalAssets.map((asset) => ({
      ...asset,
      priceMinorUnits: asset.priceMinorUnits.toString(),
    })),
    transactions: profile.transactions.map((tx) => ({
      ...tx,
      grossAmount: tx.grossAmount.toString(),
      feeAmount: tx.feeAmount.toString(),
    })),
  });
}
