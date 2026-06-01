#!/usr/bin/env node
/**
 * Pre-flight check before launch. Does not print secret values.
 */
import fs from "fs";

const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SOLANA_RPC_URL",
  "NODEBLINK_ENC_KEY",
  "TREASURY_WALLET",
  "PUBLIC_BASE_URL",
  "NEXT_PUBLIC_BASE_URL",
];

const placeholders = [/YOUR_/i, /replace-with/i, /changeme/i];

let failed = 0;

for (const key of required) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.error(`MISSING ${key}`);
    failed++;
    continue;
  }
  if (placeholders.some((p) => p.test(value))) {
    console.error(`PLACEHOLDER ${key}`);
    failed++;
    continue;
  }
  console.log(`OK ${key}`);
}

if (!process.env.DATABASE_URL?.includes("aws-1-ap-northeast-2.pooler.supabase.com")) {
  console.warn(
    "WARN DATABASE_URL should use aws-1-ap-northeast-2.pooler.supabase.com for DigitalOcean",
  );
}

if (!fs.existsSync("prisma/migrations")) {
  console.error("MISSING prisma/migrations — run prisma migrate deploy");
  failed++;
} else {
  console.log("OK prisma/migrations");
}

process.exit(failed ? 1 : 0);
