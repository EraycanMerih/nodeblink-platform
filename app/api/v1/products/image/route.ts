import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CreatorAuthError } from "@/lib/creator-auth";
import { prisma } from "@/lib/db";

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      filename?: string;
      base64Data?: string;
      productId?: string;
      walletAddress?: string;
    };

    const filename = body.filename?.trim() ?? "";
    const base64Data = body.base64Data?.trim() ?? "";
    const productId = body.productId?.trim() ?? "";

    if (!filename || !base64Data) {
      return NextResponse.json(
        { error: "filename and base64Data are required" },
        { status: 400 },
      );
    }

    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: "Product image must be png, jpg, or webp." },
        { status: 400 },
      );
    }

    if (!body.walletAddress) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
    }

    const uploadsDir = path.resolve(process.cwd(), "uploads/products");
    fs.mkdirSync(uploadsDir, { recursive: true });
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const storageUrl = `/uploads/products/${safeName}`;

    if (productId) {
      await prisma.digitalAsset.update({
        where: { id: productId },
        data: { imageUrl: storageUrl },
        select: { id: true },
      });
    }

    return NextResponse.json({ ok: true, url: storageUrl });
  } catch (error) {
    if (error instanceof CreatorAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
