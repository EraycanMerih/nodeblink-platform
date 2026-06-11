import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ProductArchetype, ProductStatus } from "@prisma/client";
import { encryptBase64 } from "@/lib/crypto";
import { CreatorAuthError, requireCreatorForUsername } from "@/lib/creator-auth";
import {
  buildDefaultVariants,
  defaultButtonLabel,
  formatSolFromLamports,
  solToLamports,
} from "@/lib/product-builder";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { creatorUsername, filename, base64Data, title, priceValue, currency, walletAddress } =
      body as {
        creatorUsername?: string;
        filename?: string;
        base64Data?: string;
        title?: string;
        priceValue?: number;
        currency?: string;
        walletAddress?: string;
      };

    if (!creatorUsername || !filename || !base64Data || !walletAddress) {
      return NextResponse.json(
        { error: "creatorUsername, filename, base64Data, and walletAddress are required" },
        { status: 400 },
      );
    }

    const creator = await requireCreatorForUsername(creatorUsername, walletAddress);

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 25 MB" }, { status: 400 });
    }

    const uploadsDir = path.resolve(process.cwd(), "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const assetKey = crypto.randomBytes(32).toString("base64");
    const encryptedKey = encryptBase64(assetKey);
    const isFiat = currency === "USD";
    const minorUnits = isFiat ? Math.round((Number(priceValue) || 1.00) * 100) : solToLamports(Number(priceValue) || 0.25);
    const productTitle = title?.trim() || filename.replace(/\.[^.]+$/, "");
    const displayLabel = isFiat ? `$${(Number(priceValue) || 1.00).toFixed(2)}` : formatSolFromLamports(minorUnits.toString());

    const maxSort = await prisma.digitalAsset.aggregate({
      where: { creatorProfileId: creator.id },
      _max: { sortOrder: true },
    });

    const record = await prisma.digitalAsset.create({
      data: {
        creatorProfileId: creator.id,
        archetype: ProductArchetype.UNLOCK_DOCUMENT,
        status: ProductStatus.ACTIVE,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        title: productTitle,
        description: "Secure download delivered after payment confirmation.",
        currency: currency === "USD" ? "USD" : "SOL",
        priceMinorUnits: minorUnits,
        storageUrl: `/uploads/${safeName}`,
        encryptedKey,
        buttonLabel: defaultButtonLabel(ProductArchetype.UNLOCK_DOCUMENT, displayLabel),
        variants: buildDefaultVariants(
          ProductArchetype.UNLOCK_DOCUMENT,
          productTitle,
          BigInt(minorUnits),
        ),
      },
    });

    return NextResponse.json(
      { status: "ok", id: record.id, url: record.storageUrl },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof CreatorAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
