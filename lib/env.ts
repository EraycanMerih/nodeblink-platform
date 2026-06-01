export const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  "https://nodeblink.dev";

export const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL ||
  "https://solana-mainnet.g.alchemy.com/v2/demo";

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
