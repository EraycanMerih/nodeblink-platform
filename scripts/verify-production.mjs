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

const publicBase = process.env.PUBLIC_BASE_URL?.trim() ?? "";
if (publicBase.includes("`") || publicBase.includes('"') || publicBase.includes("'")) {
  console.error("INVALID PUBLIC_BASE_URL (contains quotes/backticks)");
  failed++;
}
if (publicBase && !publicBase.startsWith("https://")) {
  console.error("INVALID PUBLIC_BASE_URL (must start with https://)");
  failed++;
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

const port = process.env.NODEBLINK_PORT || process.env.PORT || "3001";
const base = `http://127.0.0.1:${port}`;

async function checkJson(path, label) {
  try {
    const res = await fetch(`${base}${path}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error(`FAIL ${label} (HTTP ${res.status})`);
      failed++;
      return;
    }
    await res.json();
    console.log(`OK ${label}`);
  } catch {
    console.error(`FAIL ${label} (unreachable)`);
    failed++;
  }
}

await checkJson("/api/health", "health endpoint");
await checkJson("/actions.json", "actions.json");

process.exit(failed ? 1 : 0);
