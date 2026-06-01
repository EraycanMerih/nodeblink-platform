import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { TransactionStatus } from "@prisma/client";
import { ACTIONS_CORS_HEADERS } from "@/lib/actions-constants";
import { decryptBase64 } from "@/lib/crypto";
import { mintNftAsset } from "@/lib/creator-actions";
import { prisma } from "@/lib/db";
import { PUBLIC_BASE_URL } from "@/lib/env";

const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");
const conn = new Connection(RPC_URL, "confirmed");

function corsJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { signature, transactionId, buyer } = body as {
      signature?: string;
      transactionId?: string;
      buyer?: string;
    };

    if (!signature || !transactionId) {
      return corsJson(
        { error: "Missing signature or transactionId" },
        400,
      );
    }

    let tx;
    try {
      tx = await conn.getTransaction(signature, { commitment: "confirmed" });
    } catch (error) {
      const message = String(error);
      if (message.includes("WrongSize") || message.includes("Invalid param")) {
        return corsJson({ error: "Invalid signature format" }, 400);
      }
      throw error;
    }

    if (!tx) {
      return corsJson(
        { status: "retry", error: "Transaction not found on chain yet" },
        202,
      );
    }

    const record = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!record) {
      return corsJson({ error: "Transaction record not found" }, 404);
    }

    if (buyer && record.senderWallet !== buyer) {
      return corsJson({ error: "Buyer mismatch" }, 403);
    }

    if (tx.meta?.err) {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.FAILED, signature },
      });
      return corsJson({ error: "Transaction failed on chain" }, 409);
    }

    if (record.status === TransactionStatus.CONFIRMED) {
      return corsJson({ status: "ok", replay: true });
    }

    if (record.status === TransactionStatus.FAILED) {
      return corsJson({ error: "Transaction already failed" }, 409);
    }

    if (record.signature && record.signature !== signature) {
      return corsJson({ error: "Transaction signature mismatch" }, 409);
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.CONFIRMED,
        signature,
        confirmedAt: new Date(),
      },
    });

    if (record.creatorProfileId) {
      await prisma.creatorProfile.update({
        where: { id: record.creatorProfileId },
        data: {
          totalVolumeProcessed: { increment: record.grossAmount },
          totalTransactions: { increment: 1 },
        },
      });
    }

    const meta = (record.metadata ?? {}) as Record<string, unknown>;
    const archetype = String(meta.archetype ?? "").toLowerCase();

    if (
      (archetype === "unlock_document" || archetype === "pay_to_unlock") &&
      meta.productId
    ) {
      const asset = await prisma.digitalAsset.findUnique({
        where: { id: String(meta.productId) },
      });
      if (!asset?.encryptedKey || !asset.storageUrl) {
        return corsJson({ error: "Asset delivery not configured" }, 500);
      }
      const key = decryptBase64(asset.encryptedKey);
      const downloadUrl = asset.storageUrl.startsWith("http")
        ? asset.storageUrl
        : `${PUBLIC_BASE_URL}${asset.storageUrl}`;
      return corsJson({ status: "ok", downloadUrl, key });
    }

    if (archetype === "mint_nft" && meta.productId) {
      try {
        const buyerPk = new PublicKey(buyer || record.senderWallet);
        const result = await mintNftAsset(String(meta.productId), buyerPk);
        return corsJson({ status: "ok", mint: result.mint, ata: result.ata });
      } catch (error) {
        console.error("Mint failed", error);
        return corsJson({ status: "ok", mintError: String(error) });
      }
    }

    return corsJson({ status: "ok" });
  } catch (err) {
    return corsJson({ error: String(err) }, 500);
  }
}
