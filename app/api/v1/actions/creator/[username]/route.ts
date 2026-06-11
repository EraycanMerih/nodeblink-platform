import type { ActionPostRequest } from "@solana/actions";
import { PublicKey } from "@solana/web3.js";
import { AssetCurrency } from "@prisma/client";
import {
  buildActionError,
  buildActionMetadata,
  buildActionPostResponse,
  getCreatorProfile,
  resolveCreatorSelection,
} from "@/lib/creator-actions";
import { emptyOptionsResponse, jsonWithActionsCors } from "@/lib/cors";
import { prisma } from "@/lib/db";
import { getRequestOriginFromRequest } from "@/lib/request-origin";
import {
  createPendingTransaction,
  minorUnitsToDecimal,
} from "@/lib/transactions";

type RouteContext = { params: Promise<{ username: string }> };

export async function OPTIONS() {
  return emptyOptionsResponse();
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { username } = await context.params;
  const origin = getRequestOriginFromRequest(request);
  const profile = await getCreatorProfile(username);
  const requestUrl = new URL(request.url);
  const productId = requestUrl.searchParams.get("productId") ?? undefined;
  const payload = buildActionMetadata(profile, origin, { productId });
  return jsonWithActionsCors(payload);
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { username } = await context.params;

  let body: ActionPostRequest & Record<string, unknown>;
  try {
    body = (await request.json()) as ActionPostRequest & Record<string, unknown>;
  } catch {
    return buildActionError("Invalid JSON body.", 400);
  }

  const account = body.account;
  if (!account) {
    return buildActionError("Buyer account is required.", 400);
  }

  let buyer: PublicKey;
  try {
    buyer = new PublicKey(account);
  } catch {
    return buildActionError("Invalid buyer wallet.", 400);
  }

  const profile = await getCreatorProfile(username);
  const requestUrl = new URL(request.url);

  try {
    const selection = resolveCreatorSelection(profile, requestUrl, body);
    const response = await buildActionPostResponse(
      profile,
      selection,
      buyer,
      requestUrl,
    );

    const creatorRecord = await prisma.creatorProfile.findUnique({
      where: { username: profile.username.toLowerCase() },
      select: { id: true },
    });

    let transactionId: string | undefined;

    if (creatorRecord) {
      const currency =
        selection.product.currency === "USDC"
          ? AssetCurrency.USDC
          : AssetCurrency.SOL;
      const gross = minorUnitsToDecimal(selection.amountMinorUnits, currency);
      const feeMinor = Math.max(
        1,
        Math.round((selection.amountMinorUnits * profile.platformFeeBps) / 10_000),
      );
      const fee = minorUnitsToDecimal(feeMinor, currency);

      const pending = await createPendingTransaction({
        creatorProfileId: creatorRecord.id,
        productId: selection.product.id,
        senderWallet: buyer.toBase58(),
        recipientWallet: profile.publicKey,
        grossAmountSol: gross,
        feeAmountSol: fee,
        currency,
        metadata: {
          archetype: selection.product.archetype,
          productId: selection.product.id,
          variantId: selection.variant.id,
          message: selection.message,
          quantity: selection.quantity,
          term: selection.term,
        },
      });
      transactionId = pending.id;
    }

    return jsonWithActionsCors({ ...response, transactionId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to build transaction.";
    return buildActionError(message, 400);
  }
}
