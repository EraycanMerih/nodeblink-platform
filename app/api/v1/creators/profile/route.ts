import { NextResponse } from "next/server";
import { z } from "zod";
import { CreatorAuthError, requireCreatorByWallet } from "@/lib/creator-auth";
import { prisma } from "@/lib/db";

const patchSchema = z.object({
  walletAddress: z.string().min(32),
  displayName: z.string().min(2).max(64).optional(),
  bio: z.string().max(280).optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = patchSchema.parse(await request.json());
    const { profile } = await requireCreatorByWallet(body.walletAddress);

    const updated = await prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        displayName: body.displayName,
        bio: body.bio,
      },
    });

    return NextResponse.json({ ok: true, profile: updated });
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
