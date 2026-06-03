import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminWallet, AdminAuthError } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet") ?? "";
    await requireAdminWallet(wallet);

    const items = await prisma.creatorProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        username: true,
        displayName: true,
        publicKey: true,
        platformFeeBps: true,
        featured: true,
        totalVolumeProcessed: true,
        totalTransactions: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      items: items.map((row) => ({
        ...row,
        totalVolumeProcessed: row.totalVolumeProcessed.toString(),
      })),
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Admin backend unavailable" }, { status: 503 });
  }
}

const patchSchema = z.object({
  wallet: z.string().min(32),
  username: z.string().min(1),
  platformFeeBps: z.number().int().min(0).max(10_000).optional(),
  featured: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = patchSchema.parse(await request.json());
    await requireAdminWallet(body.wallet);

    const updated = await prisma.creatorProfile.update({
      where: { username: body.username.toLowerCase() },
      data: {
        platformFeeBps: body.platformFeeBps,
        featured: body.featured,
      },
      select: { id: true, username: true, platformFeeBps: true, featured: true },
    });

    return NextResponse.json({ ok: true, creator: updated });
  } catch (error) {
    if (error instanceof AdminAuthError) {
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
