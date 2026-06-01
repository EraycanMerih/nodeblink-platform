import { NextResponse } from "next/server";
import { z } from "zod";
import { ProductStatus } from "@prisma/client";
import { CreatorAuthError, requireCreatorByWallet } from "@/lib/creator-auth";
import {
  buildDefaultVariants,
  defaultButtonLabel,
  formatSolFromLamports,
  solToLamports,
} from "@/lib/product-builder";
import { prisma } from "@/lib/db";

const patchSchema = z.object({
  walletAddress: z.string().min(32),
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  priceSol: z.number().positive().max(1000).optional(),
  buttonLabel: z.string().max(80).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = patchSchema.parse(await request.json());
    const { profile } = await requireCreatorByWallet(body.walletAddress);

    const existing = await prisma.digitalAsset.findFirst({
      where: { id, creatorProfileId: profile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const lamports =
      body.priceSol !== undefined
        ? solToLamports(body.priceSol)
        : existing.priceMinorUnits;
    const title = body.title ?? existing.title;
    const solLabel = formatSolFromLamports(lamports);

    const record = await prisma.digitalAsset.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        priceMinorUnits: body.priceSol !== undefined ? lamports : undefined,
        buttonLabel:
          body.buttonLabel ??
          (body.priceSol !== undefined
            ? defaultButtonLabel(existing.archetype, solLabel)
            : undefined),
        variants:
          body.priceSol !== undefined || body.title
            ? buildDefaultVariants(existing.archetype, title, lamports)
            : undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      product: { ...record, priceMinorUnits: record.priceMinorUnits.toString() },
    });
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

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet")?.trim();

    if (!wallet) {
      return NextResponse.json({ error: "wallet query required" }, { status: 400 });
    }

    const { profile } = await requireCreatorByWallet(wallet);

    const existing = await prisma.digitalAsset.findFirst({
      where: { id, creatorProfileId: profile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.digitalAsset.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CreatorAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
