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

export function requireAdminWallet(walletAddress: string) {
  const wallet = walletAddress.trim();
  if (!wallet) throw new AdminAuthError("wallet query required", 400);
  const admins = readAdminWallets();
  if (admins.length === 0) throw new AdminAuthError("Admin wallets not configured", 503);
  if (!admins.includes(wallet)) throw new AdminAuthError("Wallet not authorized", 403);
  return wallet;
}

