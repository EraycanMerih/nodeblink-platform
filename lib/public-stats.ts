import { ProductStatus, TransactionStatus } from "@prisma/client";
import { getCreatorProfile } from "@/lib/creator-actions";
import {
  CREATOR_SPLIT_PERCENT,
  PLATFORM_FEE_BPS,
  PLATFORM_FEE_PERCENT,
  SOLANA_RPC_URL,
  HAS_MINT_SIGNER,
} from "@/lib/env";
import { prisma } from "@/lib/db";

export type PublicProtocolStats = {
  domain: string;
  actionsJsonUrl: string;
  demoCheckoutUrl: string;
  platformFeeBps: number;
  platformFeePercent: string;
  creatorSharePercent: string;
  feeRangeLabel: string;
  creators: number;
  products: number;
  confirmedPayments: number;
  volumeSol: number;
  network: "Solana mainnet";
  rpcConfigured: boolean;
  mintFulfillmentEnabled: boolean;
  demoProducts: Array<{
    id: string;
    title: string;
    archetype: string;
    priceLabel: string;
  }>;
};

const LAMPORTS = 1_000_000_000;

function formatProductPrice(priceMinorUnits: number, currency: string) {
  if (currency === "USDC") {
    return `${(priceMinorUnits / 1_000_000).toFixed(2)} USDC`;
  }
  const sol = priceMinorUnits / LAMPORTS;
  return `${sol.toFixed(sol < 1 ? 2 : 1)} SOL`;
}

export async function getPublicProtocolStats(origin: string): Promise<PublicProtocolStats> {
  const demoProfile = await getCreatorProfile("demo");

  const demoProducts = demoProfile.products.slice(0, 4).map((product) => ({
    id: product.id,
    title: product.title,
    archetype: product.archetype.replace(/_/g, " "),
    priceLabel: formatProductPrice(
      product.priceMinorUnits,
      product.currency,
    ),
  }));

  let creators = 0;
  let products = 0;
  let confirmedPayments = 0;
  let volumeSol = 0;

  try {
    const [creatorCount, productCount, confirmedCount, volume] =
      await Promise.all([
        prisma.creatorProfile.count(),
        prisma.digitalAsset.count({ where: { status: ProductStatus.ACTIVE } }),
        prisma.transaction.count({
          where: { status: TransactionStatus.CONFIRMED },
        }),
        prisma.creatorProfile.aggregate({
          _sum: { totalVolumeProcessed: true },
        }),
      ]);

    creators = creatorCount;
    products = productCount;
    confirmedPayments = confirmedCount;
    volumeSol = Number(volume._sum.totalVolumeProcessed ?? 0);
  } catch {
    /* Database optional — demo catalog still renders */
  }

  const minFee = 1.5;
  const maxFee = 2.5;
  const currentFee = PLATFORM_FEE_BPS / 100;

  return {
    domain: origin.replace(/^https?:\/\//, ""),
    actionsJsonUrl: `${origin}/actions.json`,
    demoCheckoutUrl: `${origin}/creator/demo`,
    platformFeeBps: PLATFORM_FEE_BPS,
    platformFeePercent: PLATFORM_FEE_PERCENT,
    creatorSharePercent: CREATOR_SPLIT_PERCENT,
    feeRangeLabel: `${minFee}%–${maxFee}%`,
    creators,
    products: products || demoProfile.products.length,
    confirmedPayments,
    volumeSol,
    network: "Solana mainnet",
    rpcConfigured: !SOLANA_RPC_URL.includes("/demo"),
    mintFulfillmentEnabled: HAS_MINT_SIGNER,
    demoProducts,
  };
}
