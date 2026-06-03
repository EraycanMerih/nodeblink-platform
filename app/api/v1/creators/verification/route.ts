import { NextResponse } from "next/server";
import { z } from "zod";
import { CreatorAuthError, requireCreatorByWallet } from "@/lib/creator-auth";
import { prisma } from "@/lib/db";

function validateHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new Error("proofUrl must be a valid http(s) URL");
  }
}

const querySchema = z.object({
  wallet: z.string().min(32),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({ wallet: searchParams.get("wallet") ?? "" });
    const { profile } = await requireCreatorByWallet(query.wallet);

    const items = await prisma.creatorVerificationRequest.findMany({
      where: { creatorProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        platform: true,
        handle: true,
        followerCount: true,
        proofType: true,
        proofUrl: true,
        code: true,
        requestedFeeBps: true,
        status: true,
        adminNotes: true,
        decidedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof CreatorAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

const createSchema = z.object({
  walletAddress: z.string().min(32),
  platform: z.string().min(2).max(32),
  handle: z.string().min(2).max(128),
  followerCount: z.number().int().min(0).max(2_000_000_000).optional(),
  proofType: z.enum(["tweet", "bio"]),
  proofUrl: z.string().min(8).max(2048),
  code: z.string().min(6).max(64),
});

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());
    const { profile } = await requireCreatorByWallet(body.walletAddress);

    validateHttpUrl(body.proofUrl);

    const existing = await prisma.creatorVerificationRequest.findFirst({
      where: { creatorProfileId: profile.id, status: "PENDING" },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending verification request." },
        { status: 409 },
      );
    }

    const created = await prisma.creatorVerificationRequest.create({
      data: {
        creatorProfileId: profile.id,
        platform: body.platform.trim(),
        handle: body.handle.trim(),
        followerCount: body.followerCount,
        proofType: body.proofType,
        proofUrl: body.proofUrl.trim(),
        code: body.code.trim(),
        requestedFeeBps: 150,
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, request: created }, { status: 201 });
  } catch (error) {
    if (error instanceof CreatorAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
