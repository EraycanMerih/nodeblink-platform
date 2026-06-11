import { NextResponse } from "next/server";
import { z } from "zod";
import { AssetCurrency, ProductArchetype, ProductStatus } from "@prisma/client";
import { CreatorAuthError } from "@/lib/creator-auth";
import {
  buildDefaultVariants,
  defaultButtonLabel,
  defaultDescription,
  formatSolFromLamports,
  solToLamports,
} from "@/lib/product-builder";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  archetype: z.nativeEnum(ProductArchetype),
  title: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  priceValue: z.number().positive().max(1000000),
  currency: z.nativeEnum(AssetCurrency).default("SOL"),
  accessTerm: z.string().max(32).optional(),
  mintName: z.string().max(64).optional(),
  symbol: z.string().max(12).optional(),
  imageUrl: z.string().url().optional(),
  walletAddress: z.string().min(32),
});

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());
    
    const user = await prisma.user.findUnique({
      where: { walletAddress: body.walletAddress },
      include: { creatorProfile: true },
    });
    const profile = user?.creatorProfile;
    if (!profile) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    const isFiat = body.currency === "USD";
    const minorUnits = isFiat ? Math.round(body.priceValue * 100) : solToLamports(body.priceValue);
    const displayLabel = isFiat ? `$${body.priceValue.toFixed(2)}` : formatSolFromLamports(minorUnits.toString());
    const variants = buildDefaultVariants(body.archetype, body.title, BigInt(minorUnits));

    const maxSort = await prisma.digitalAsset.aggregate({
      where: { creatorProfileId: profile.id },
      _max: { sortOrder: true },
    });

    const record = await prisma.digitalAsset.create({
      data: {
        creatorProfileId: profile.id,
        archetype: body.archetype,
        status: ProductStatus.ACTIVE,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        title: body.title,
        description: body.description ?? defaultDescription(body.archetype),
        currency: body.currency,
        priceMinorUnits: minorUnits,
        buttonLabel: defaultButtonLabel(body.archetype, displayLabel),
        accessTerm: body.accessTerm,
        mintName: body.mintName,
        symbol: body.symbol,
        imageUrl: body.imageUrl,
        variants,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        product: {
          ...record,
          priceMinorUnits: record.priceMinorUnits.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CreatorAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
