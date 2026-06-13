import { NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CreatorAuthError } from "@/lib/creator-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");
    if (!walletAddress) {
      return NextResponse.json({ error: "wallet parameter required" }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { creatorProfile: true },
    });
    
    const profileRecord = user?.creatorProfile;
    const wallet = walletAddress;

    const record = profileRecord ? await prisma.creatorProfile.findUnique({
      where: { id: profileRecord.id },
      include: {
        digitalAssets: {
          where: { status: { not: ProductStatus.ARCHIVED } },
          orderBy: { sortOrder: "asc" },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    }) : null;

    if (!record) {
      return NextResponse.json({
        onboarded: false,
        wallet,
        metrics: { volume: 0, transactions: 0, products: 0 },
        products: [],
        transactions: [],
      });
    }

    const confirmed = record.transactions.filter((t) => t.status === "CONFIRMED");

    return NextResponse.json({
      onboarded: true,
      wallet,
      username: record.username,
      customDomain: record.customDomain,
      displayName: record.displayName,
      bio: record.bio,
      websiteUrl: record.websiteUrl,
      avatarUrl: record.avatarUrl,
      coverUrl: record.coverUrl,
      discordWebhookUrl: record.discordWebhookUrl,
      accessWebhookUrl: record.accessWebhookUrl,
      checkoutUrl: `/pay/${record.username}`,
      actionUrl: `/api/v1/actions/creator/${record.username}`,
      metrics: {
        volume: Number(record.totalVolumeProcessed),
        transactions: record.totalTransactions,
        products: record.digitalAssets.length,
        confirmedSales: confirmed.length,
      },
      products: record.digitalAssets.map((asset) => ({
        ...asset,
        priceMinorUnits: asset.priceMinorUnits.toString(),
      })),
      transactions: record.transactions.map((tx) => ({
        ...tx,
        grossAmount: tx.grossAmount.toString(),
        feeAmount: tx.feeAmount.toString(),
      })),
    });
  } catch (error) {
    console.error("dashboard route failed", error);
    return NextResponse.json(
      { error: "Studio backend unavailable. Check DATABASE_URL and migrations." },
      { status: 503 },
    );
  }
}
