import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ProductArchetype, ProductStatus } from "@prisma/client";
import { encryptBase64 } from "@/lib/crypto";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { creatorUsername, filename, base64Data, title, priceSol } = body as {
      creatorUsername?: string;
      filename?: string;
      base64Data?: string;
      title?: string;
      priceSol?: number;
    };

    if (!creatorUsername || !filename || !base64Data) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { username: creatorUsername.toLowerCase() },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const buffer = Buffer.from(base64Data, "base64");
    const uploadsDir = path.resolve(process.cwd(), "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const assetKey = crypto.randomBytes(32).toString("base64");
    const encryptedKey = encryptBase64(assetKey);
    const lamports = Math.round((Number(priceSol) || 0.25) * 1_000_000_000);

    const record = await prisma.digitalAsset.create({
      data: {
        creatorProfileId: creator.id,
        archetype: ProductArchetype.UNLOCK_DOCUMENT,
        status: ProductStatus.ACTIVE,
        title: title ?? filename,
        description: "Secure download delivered after payment confirmation.",
        currency: "SOL",
        priceMinorUnits: BigInt(lamports),
        storageUrl: `/uploads/${safeName}`,
        encryptedKey,
        buttonLabel: `Unlock for ${(lamports / 1_000_000_000).toFixed(2)} SOL`,
        variants: [
          {
            id: "unlock-now",
            label: `Unlock ${title ?? filename}`,
            amountMinorUnits: lamports,
          },
        ],
      },
    });

    return NextResponse.json(
      { status: "ok", id: record.id, url: record.storageUrl },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
