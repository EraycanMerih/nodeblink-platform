const REQUIRED_PRODUCTION = [
  "DATABASE_URL",
  "SOLANA_RPC_URL",
  "TREASURY_WALLET",
  "PUBLIC_BASE_URL",
] as const;

const RECOMMENDED_PRODUCTION = [
  "DIRECT_URL",
  "NODEBLINK_ENC_KEY",
  "DOWNLOAD_SECRET",
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
    console.error(
      `Missing required production environment variables: ${missing.join(", ")}`,
    );
  }

  if (weak.length) {
    console.error(
      `Production environment variables look like placeholders: ${weak.join(", ")}`,
    );
  }

  const missingRecommended = RECOMMENDED_PRODUCTION.filter(
    (key) => !process.env[key]?.trim(),
  );
  if (missingRecommended.length) {
    console.warn(
      `Missing recommended production env variables: ${missingRecommended.join(", ")}`,
    );
  }

  if (!process.env.DATABASE_URL?.includes("pooler.supabase.com")) {
    console.warn(
      "DATABASE_URL should use the Supabase Session pooler on DigitalOcean (IPv4).",
    );
  }
}
