import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CreatorAuthError, requireCreatorByWallet } from "@/lib/creator-auth";
import { prisma } from "@/lib/db";

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      walletAddress?: string;
      filename?: string;
      base64Data?: string;
    };

    const walletAddress = body.walletAddress?.trim() ?? "";
    const filename = body.filename?.trim() ?? "";
    const base64Data = body.base64Data?.trim() ?? "";

    if (!walletAddress || !filename || !base64Data) {
      return NextResponse.json(
        { error: "walletAddress, filename, and base64Data are required" },
        { status: 400 },
      );
    }

    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: "Avatar image must be png, jpg, or webp." },
        { status: 400 },
      );
    }

    const { profile } = await requireCreatorByWallet(walletAddress);

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 4 MB" }, { status: 400 });
    }

    const uploadsDir = path.resolve(process.cwd(), "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const storageUrl = `/uploads/${safeName}`;

    await prisma.creatorProfile.update({
      where: { id: profile.id },
      data: { avatarUrl: storageUrl },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, url: storageUrl });
  } catch (error) {
    if (error instanceof CreatorAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

