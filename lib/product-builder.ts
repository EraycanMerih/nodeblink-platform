import { ProductArchetype } from "@prisma/client";

const LAMPORTS = 1_000_000_000;

export function solToLamports(priceSol: number): bigint {
  const safe = Number.isFinite(priceSol) && priceSol > 0 ? priceSol : 0.1;
  return BigInt(Math.round(safe * LAMPORTS));
}

export function lamportsToSolNum(lamports: bigint): number {
  return Number(lamports);
}

export function formatSolFromLamports(lamports: bigint | string): string {
  const n = typeof lamports === "string" ? BigInt(lamports) : lamports;
  const sol = Number(n) / LAMPORTS;
  return `${sol.toFixed(sol < 1 ? 2 : 2)} SOL`;
}

export function buildDefaultVariants(
  archetype: ProductArchetype,
  title: string,
  lamports: bigint,
) {
  const amount = lamportsToSolNum(lamports);
  const solLabel = formatSolFromLamports(lamports);

  switch (archetype) {
    case ProductArchetype.TIP:
      return [
        {
          id: "tip-default",
          label: `Tip ${solLabel}`,
          amountMinorUnits: amount,
        },
      ];
    case ProductArchetype.UNLOCK_DOCUMENT:
      return [
        {
          id: "unlock-now",
          label: `Unlock ${title}`,
          amountMinorUnits: amount,
        },
      ];
    case ProductArchetype.ACCESS_PASS:
      return [
        {
          id: "access-default",
          label: `Get access · ${solLabel}`,
          amountMinorUnits: amount,
        },
      ];
    case ProductArchetype.MINT_NFT:
      return [
        {
          id: "mint-1",
          label: `Mint · ${solLabel}`,
          amountMinorUnits: amount,
        },
      ];
    default:
      return [
        {
          id: "default",
          label: title,
          amountMinorUnits: amount,
        },
      ];
  }
}

export function defaultButtonLabel(
  archetype: ProductArchetype,
  solLabel: string,
): string {
  switch (archetype) {
    case ProductArchetype.TIP:
      return "Send tip";
    case ProductArchetype.UNLOCK_DOCUMENT:
      return `Unlock for ${solLabel}`;
    case ProductArchetype.ACCESS_PASS:
      return "Get access";
    case ProductArchetype.MINT_NFT:
      return "Mint collectible";
    default:
      return "Pay now";
  }
}

export function defaultDescription(archetype: ProductArchetype): string {
  switch (archetype) {
    case ProductArchetype.TIP:
      return "Send SOL to support this creator.";
    case ProductArchetype.UNLOCK_DOCUMENT:
      return "Secure download delivered automatically after payment confirms.";
    case ProductArchetype.ACCESS_PASS:
      return "Access is provisioned after your payment is confirmed on-chain.";
    case ProductArchetype.MINT_NFT:
      return "Collect a limited digital pass after checkout confirms.";
    default:
      return "";
  }
}
