import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { PublicKey } from "@solana/web3.js";

const bodySchema = z.object({
  walletAddress: z.string().min(32),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_-]+$/i, "Username must be alphanumeric"),
  displayName: z.string().min(2).max(64),
  bio: z.string().max(280).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);

    try {
      new PublicKey(body.walletAddress);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    const username = body.username.toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { walletAddress: body.walletAddress }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username or wallet already registered" },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        username,
        walletAddress: body.walletAddress,
        creatorProfile: {
          create: {
            username,
            displayName: body.displayName,
            bio: body.bio,
            publicKey: body.walletAddress,
            treasuryWallet: process.env.TREASURY_WALLET,
            avatarUrl: "/action-icon.svg",
          },
        },
      },
      include: { creatorProfile: true },
    });

    return NextResponse.json(
      {
        ok: true,
        username: user.username,
        checkoutUrl: `/creator/${user.username}`,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
