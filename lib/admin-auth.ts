import { prisma } from "@/lib/db";

export class AdminAuthError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export function readAdminWallets() {
  const raw = process.env.ADMIN_WALLETS ?? "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function requireAdminWallet(walletAddress: string) {
  const wallet = walletAddress.trim();
  if (!wallet) throw new AdminAuthError("wallet query required", 400);

  const admins = readAdminWallets();
  if (admins.length > 0) {
    if (!admins.includes(wallet)) throw new AdminAuthError("Wallet not authorized", 403);
    return wallet;
  }

  const existing = await prisma.adminWallet.findFirst({ select: { walletAddress: true } });
  if (!existing) {
    await prisma.adminWallet.create({
      data: { walletAddress: wallet, role: "OWNER" },
      select: { id: true },
    });
    return wallet;
  }

  const allowed = await prisma.adminWallet.findUnique({
    where: { walletAddress: wallet },
    select: { walletAddress: true },
  });

  if (!allowed) throw new AdminAuthError("Wallet not authorized", 403);
  return wallet;
}
