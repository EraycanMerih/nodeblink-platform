import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminWallet, AdminAuthError } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet") ?? "";
    requireAdminWallet(wallet);

    const items = await prisma.creatorVerificationRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
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
        creatorProfile: {
          select: {
            id: true,
            username: true,
            displayName: true,
            publicKey: true,
            platformFeeBps: true,
            featured: true,
          },
        },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Admin backend unavailable" }, { status: 503 });
  }
}

const patchSchema = z.object({
  wallet: z.string().min(32),
  requestId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().max(2000).optional(),
  featured: z.boolean().optional(),
  platformFeeBps: z.number().int().min(0).max(10_000).optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = patchSchema.parse(await request.json());
    requireAdminWallet(body.wallet);

    const req = await prisma.creatorVerificationRequest.findUnique({
      where: { id: body.requestId },
      select: { id: true, creatorProfileId: true, status: true },
    });

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (req.status !== "PENDING") {
      return NextResponse.json({ error: "Request already processed" }, { status: 409 });
    }

    const decidedAt = new Date();

    const updated = await prisma.creatorVerificationRequest.update({
      where: { id: req.id },
      data: {
        status: body.status,
        adminNotes: body.adminNotes,
        decidedAt,
      },
      select: { id: true, status: true },
    });

    if (body.status === "APPROVED") {
      await prisma.creatorProfile.update({
        where: { id: req.creatorProfileId },
        data: {
          featured: body.featured ?? true,
          platformFeeBps: body.platformFeeBps ?? 150,
        },
        select: { id: true },
      });
    }

    return NextResponse.json({ ok: true, request: updated });
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
