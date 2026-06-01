import { NextResponse } from "next/server";
import { z } from "zod";
import { ProductArchetype, ProductStatus } from "@prisma/client";
import { CreatorAuthError, requireCreatorByWallet } from "@/lib/creator-auth";
import {
  buildDefaultVariants,
  defaultButtonLabel,
  defaultDescription,
  formatSolFromLamports,
  solToLamports,
} from "@/lib/product-builder";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  walletAddress: z.string().min(32),
  archetype: z.nativeEnum(ProductArchetype),
  title: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  priceSol: z.number().positive().max(1000),
  accessTerm: z.string().max(32).optional(),
  mintName: z.string().max(64).optional(),
  symbol: z.string().max(12).optional(),
});

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());
    const { profile } = await requireCreatorByWallet(body.walletAddress);

    const lamports = solToLamports(body.priceSol);
    const solLabel = formatSolFromLamports(lamports);
    const variants = buildDefaultVariants(body.archetype, body.title, lamports);

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
        currency: "SOL",
        priceMinorUnits: lamports,
        buttonLabel: defaultButtonLabel(body.archetype, solLabel),
        accessTerm: body.accessTerm,
        mintName: body.mintName,
        symbol: body.symbol,
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
