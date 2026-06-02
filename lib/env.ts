function sanitizeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let out = value.trim();
  out = out.replace(/^`(.+)`$/, "$1");
  out = out.replace(/^"(.+)"$/, "$1");
  out = out.replace(/^'(.+)'$/, "$1");
  out = out.replace(/\/$/, "");
  return out.trim();
}

export const PUBLIC_BASE_URL =
  sanitizeUrl(process.env.PUBLIC_BASE_URL) ||
  sanitizeUrl(process.env.NEXT_PUBLIC_BASE_URL) ||
  "https://nodeblink.dev";

export const SOLANA_RPC_URL =
  sanitizeUrl(process.env.SOLANA_RPC_URL) ||
  sanitizeUrl(process.env.NEXT_PUBLIC_SOLANA_RPC_URL) ||
  "https://api.mainnet-beta.solana.com";

/** RPC endpoint exposed to client wallet components */
export const CLIENT_RPC_URL =
  sanitizeUrl(process.env.NEXT_PUBLIC_SOLANA_RPC_URL) ||
  sanitizeUrl(process.env.SOLANA_RPC_URL) ||
  "https://api.mainnet-beta.solana.com";

export const MARKETING_SITE_URL =
  sanitizeUrl(process.env.NEXT_PUBLIC_MARKETING_URL) ||
  "https://nodeblink.dev";

export const TREASURY_WALLET =
  process.env.TREASURY_WALLET || "11111111111111111111111111111111";

/** Platform fee: 2.0% (200 basis points) — configurable 1.5–2.5% */
export const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS || 200);

export const CREATOR_SPLIT_BPS = 10_000 - PLATFORM_FEE_BPS;

export const CREATOR_SPLIT_PERCENT = (CREATOR_SPLIT_BPS / 100).toFixed(1);

export const PLATFORM_FEE_PERCENT = (PLATFORM_FEE_BPS / 100).toFixed(1);

export const HAS_MINT_SIGNER = Boolean(
  process.env.MINT_SIGNER_KEYPAIR || process.env.NODEBLINK_MINT_KEYPAIR,
);
