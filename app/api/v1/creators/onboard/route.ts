import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { PublicKey } from "@solana/web3.js";
import { verifySession } from "@/lib/auth";

const bodySchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_-]+$/i, "Username must be alphanumeric"),
  displayName: z.string().min(2).max(64),
  bio: z.string().max(280).optional(),
  walletAddress: z.string().min(32),
  legalAccepted: z.boolean().refine((val) => val === true, "You must accept the terms of service."),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);
    const walletAddress = body.walletAddress;

    const isEVM = /^0x[a-fA-F0-9]{40}$/.test(walletAddress);
    if (!isEVM) {
      try {
        new PublicKey(walletAddress);
      } catch {
        return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
      }
    }

    const username = body.username.toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { walletAddress }],
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
        walletAddress,
        legalAcceptedAt: body.legalAccepted ? new Date() : null,
        creatorProfile: {
          create: {
            username,
            displayName: body.displayName,
            bio: body.bio,
            publicKey: walletAddress,
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
