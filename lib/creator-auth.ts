import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export class CreatorAuthError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export async function requireCreatorByWallet(walletAddress: string) {
  const wallet = walletAddress.trim();
  if (!wallet) {
    throw new CreatorAuthError("walletAddress required", 400);
  }

  const user = await prisma.user.findFirst({
    where: { walletAddress: wallet },
    include: { creatorProfile: true },
  });

  if (!user?.creatorProfile) {
    throw new CreatorAuthError("Creator profile not found", 404);
  }

  return { user, profile: user.creatorProfile };
}

export async function requireAuthenticatedCreator() {
  const session = await verifySession();
  if (!session) {
    throw new CreatorAuthError("Unauthorized", 401);
  }

  const user = await prisma.user.findFirst({
    where: { walletAddress: session.walletAddress },
    include: { creatorProfile: true },
  });

  if (!user?.creatorProfile) {
    throw new CreatorAuthError("Creator profile not found", 404);
  }

  return { user, profile: user.creatorProfile, session };
}

export async function requireCreatorForUsername(
  username: string,
  walletAddress: string,
) {
  const profile = await prisma.creatorProfile.findUnique({
    where: { username: username.toLowerCase() },
    include: { user: true },
  });

  if (!profile) {
    throw new CreatorAuthError("Creator not found", 404);
  }

  if (profile.user.walletAddress !== walletAddress.trim()) {
    throw new CreatorAuthError("Wallet does not own this creator profile", 403);
  }

  return profile;
}
