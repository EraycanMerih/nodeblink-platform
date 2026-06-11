import {
  AssetCurrency,
  Prisma,
  TransactionStatus,
} from "@prisma/client";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { prisma } from "@/lib/db";

export type TransactionMetadata = {
  archetype?: string;
  productId?: string;
  variantId?: string;
  message?: string;
  quantity?: number;
  term?: string;
  email?: string;
};

export async function createPendingTransaction(input: {
  creatorProfileId: string;
  productId: string;
  senderWallet: string;
  recipientWallet: string;
  grossAmountSol: number;
  feeAmountSol: number;
  currency?: AssetCurrency;
  metadata?: TransactionMetadata;
}) {
  return prisma.transaction.create({
    data: {
      creatorProfileId: input.creatorProfileId,
      productId: input.productId,
      senderWallet: input.senderWallet,
      recipientWallet: input.recipientWallet,
      grossAmount: input.grossAmountSol,
      feeAmount: input.feeAmountSol,
      currency: input.currency ?? AssetCurrency.SOL,
      status: TransactionStatus.PENDING,
      metadata: input.metadata as Prisma.InputJsonValue,
    },
  });
}

export function minorUnitsToSol(minorUnits: number): number {
  return minorUnits / LAMPORTS_PER_SOL;
}

export function minorUnitsToDecimal(minorUnits: number, currency: AssetCurrency): number {
  if (currency === AssetCurrency.USDC) {
    return minorUnits / 1_000_000;
  }
  return minorUnitsToSol(minorUnits);
}
