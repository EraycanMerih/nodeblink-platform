import { NextResponse } from "next/server";
import { z } from "zod";
import { CreatorAuthError, requireCreatorByWallet } from "@/lib/creator-auth";
import { prisma } from "@/lib/db";

function normalizeOptionalString(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function validateHttpUrl(value: string | null | undefined, label: string) {
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new Error(`${label} must be a valid http(s) URL`);
  }
}

function validatePublicUrl(value: string | null | undefined, label: string) {
  if (!value) return;
  if (value.startsWith("/")) return;
  validateHttpUrl(value, label);
}

const patchSchema = z.object({
  walletAddress: z.string().min(32),
  displayName: z.string().min(2).max(64).optional(),
  bio: z.string().max(280).optional().nullable(),
  websiteUrl: z.string().max(2048).optional().nullable(),
  avatarUrl: z.string().max(2048).optional().nullable(),
  coverUrl: z.string().max(2048).optional().nullable(),
  discordWebhookUrl: z.string().max(2048).optional().nullable(),
  accessWebhookUrl: z.string().max(2048).optional().nullable(),
});

export async function PATCH(request: Request) {
  try {
    const body = patchSchema.parse(await request.json());
    const { profile } = await requireCreatorByWallet(body.walletAddress);

    const websiteUrl = normalizeOptionalString(body.websiteUrl);
    const avatarUrl = normalizeOptionalString(body.avatarUrl);
    const coverUrl = normalizeOptionalString(body.coverUrl);
    const discordWebhookUrl = normalizeOptionalString(body.discordWebhookUrl);
    const accessWebhookUrl = normalizeOptionalString(body.accessWebhookUrl);

    validatePublicUrl(websiteUrl ?? undefined, "websiteUrl");
    validatePublicUrl(avatarUrl ?? undefined, "avatarUrl");
    validatePublicUrl(coverUrl ?? undefined, "coverUrl");
    validateHttpUrl(discordWebhookUrl ?? undefined, "discordWebhookUrl");
    validateHttpUrl(accessWebhookUrl ?? undefined, "accessWebhookUrl");

    const updated = await prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        bio: body.bio,
        websiteUrl,
        avatarUrl,
        coverUrl,
        discordWebhookUrl,
        accessWebhookUrl,
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
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
