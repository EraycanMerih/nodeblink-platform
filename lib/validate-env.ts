const REQUIRED_PRODUCTION = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SOLANA_RPC_URL",
  "NODEBLINK_ENC_KEY",
  "TREASURY_WALLET",
  "DOWNLOAD_SECRET",
  "ADMIN_SECRET",
  "PUBLIC_BASE_URL",
] as const;

const PLACEHOLDER_PATTERNS = [
  /YOUR_/i,
  /replace-with/i,
  /changeme/i,
  /11111111111111111111111111111111/,
  /demo$/,
  /\/v2\/demo$/,
];

export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing: string[] = [];
  const weak: string[] = [];

  for (const key of REQUIRED_PRODUCTION) {
    const value = process.env[key]?.trim();
    if (!value) {
      missing.push(key);
      continue;
    }
    if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))) {
      weak.push(key);
    }
  }

  if (missing.length) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`,
    );
  }

  if (weak.length) {
    throw new Error(
      `Production environment variables look like placeholders: ${weak.join(", ")}`,
    );
  }

  if (!process.env.DATABASE_URL?.includes("pooler.supabase.com")) {
    console.warn(
      "DATABASE_URL should use the Supabase Session pooler on DigitalOcean (IPv4).",
    );
  }
}
