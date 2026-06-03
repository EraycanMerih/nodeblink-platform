
import { createPostResponse, type ActionGetResponse, type ActionPostRequest, type ActionPostResponse, type ActionError, type CompletedAction, createActionHeaders } from "@solana/actions";
import {
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";
import { Keypair, sendAndConfirmTransaction } from '@solana/web3.js'
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { Buffer } from "node:buffer";
import { ProductArchetype, ProductStatus } from "@prisma/client";
import { prisma } from "./db";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const DEFAULT_ACTION_ICON = "/action-icon.svg";

function resolveActionIcon(profile: CreatorProfileView, origin: string) {
  const raw = profile.avatarUrl || DEFAULT_ACTION_ICON;
  if (raw.toLowerCase().includes("coresg-normal.trae.ai/api/ide/v1/text_to_image")) {
    return new URL(`/creator/${profile.username}/action-icon?v=2`, origin).toString();
  }
  if (raw.toLowerCase().endsWith(".svg")) {
    return new URL(`/creator/${profile.username}/action-icon?v=2`, origin).toString();
  }
  return new URL(raw, origin).toString();
}
const MIN_PLATFORM_FEE_BPS = 150;
const MAX_PLATFORM_FEE_BPS = 250;
const DEFAULT_USDC_MINT = process.env.NODEBLINK_USDC_MINT ?? process.env.USDC_MINT ?? "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const DEFAULT_USDC_DECIMALS = Number(process.env.USDC_DECIMALS ?? 6);

export type CreatorCurrency = "SOL" | "USDC";
export type CreatorArchetype = "tip" | "unlock_document" | "mint_nft" | "access_pass";

type ActionField = {
  name: string;
  label: string;
  type?: "text" | "email" | "url" | "number" | "date" | "datetime-local" | "checkbox" | "radio" | "textarea" | "select";
  required?: boolean;
  pattern?: string;
  patternDescription?: string;
  min?: string | number;
  max?: string | number;
  options?: Array<{ label: string; value: string; selected?: boolean }>;
};

export interface CreatorActionVariant {
  id: string;
  label: string;
  amountMinorUnits?: number;
  parameters?: ActionField[];
}

export interface CreatorActionProduct {
  id: string;
  archetype: CreatorArchetype;
  title: string;
  description: string;
  currency: CreatorCurrency;
  priceMinorUnits: number;
  active: boolean;
  buttonLabel?: string;
  mintName?: string;
  symbol?: string;
  maxSupply?: number | null;
  accessTerm?: string | null;
  deliveryUrl?: string | null;
  webhookUrl?: string | null;
  variants: CreatorActionVariant[];
}

export interface CreatorProfileView {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  publicKey: string;
  treasuryWallet: string;
  platformFeeBps: number;
  websiteUrl: string;
  discordWebhookUrl: string;
  accessWebhookUrl: string;
  products: CreatorActionProduct[];
}

export interface CreatorActionSelection {
  product: CreatorActionProduct;
  variant: CreatorActionVariant;
  amountMinorUnits: number;
  message?: string;
  quantity?: number;
  term?: string;
}

const fallbackTreasuryWallet = process.env.NODEBLINK_TREASURY_WALLET ?? process.env.TREASURY_WALLET ?? "11111111111111111111111111111111";
const fallbackCreatorWallet = process.env.NODEBLINK_CREATOR_WALLET ?? process.env.DEFAULT_CREATOR_WALLET ?? fallbackTreasuryWallet;

function safePublicKeyString(value: string | undefined | null, fallback: string) {
  try {
    return new PublicKey(String(value ?? fallback)).toBase58();
  } catch {
    return fallback;
  }
}

export function createActionHeadersWithDefaults() {
  return createActionHeaders();
}

function clampFeeBps(value: number) {
  const normalized = Number.isFinite(value) ? Math.round(value) : 200;
  return Math.min(MAX_PLATFORM_FEE_BPS, Math.max(MIN_PLATFORM_FEE_BPS, normalized));
}

function toLamports(sol: number) {
  return Math.max(1, Math.round(sol * LAMPORTS_PER_SOL));
}

function formatMinorUnits(amountMinorUnits: number, currency: CreatorCurrency) {
  if (currency === "SOL") {
    return `${(amountMinorUnits / LAMPORTS_PER_SOL).toFixed(amountMinorUnits % LAMPORTS_PER_SOL === 0 ? 0 : 2)} SOL`;
  }
  return `${(amountMinorUnits / 1_000_000).toFixed(amountMinorUnits % 1_000_000 === 0 ? 0 : 2)} USDC`;
}

function parseMinorUnits(value: string, currency: CreatorCurrency) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Invalid amount provided");
  }
  return currency === "SOL" ? toLamports(parsed) : Math.round(parsed * 1_000_000);
}

function actionUrl(origin: string, username: string, productId: string, variantId: string, query: Record<string, string | number | undefined> = {}) {
  const url = new URL(`/api/v1/actions/creator/${username}`, origin);
  url.searchParams.set("productId", productId);
  url.searchParams.set("variant", variantId);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.pathname + url.search;
}

function buildVariants(product: CreatorActionProduct, username: string, origin: string) {
  const baseLabel = product.buttonLabel ?? product.title;

  return product.variants.map((variant) => ({
    type: "transaction" as const,
    label: variant.label,
    href: actionUrl(origin, username, product.id, variant.id, variant.amountMinorUnits ? { amount: variant.amountMinorUnits } : {}),
    parameters: variant.parameters as any,
  })) as any;
}

function fallbackProducts(): CreatorActionProduct[] {
  return [
    {
      id: "tip-the-creator",
      archetype: "tip",
      title: "Tip the creator",
      description: "Send a direct tip with an optional message.",
      currency: "SOL",
      priceMinorUnits: toLamports(0.1),
      active: true,
      buttonLabel: "Tip now",
      variants: [
        { id: "tip-0-1", label: "Tip 0.1 SOL", amountMinorUnits: toLamports(0.1), parameters: [{ name: "message", label: "Leave a note", type: "textarea" }] },
        { id: "tip-0-5", label: "Tip 0.5 SOL", amountMinorUnits: toLamports(0.5), parameters: [{ name: "message", label: "Leave a note", type: "textarea" }] },
        {
          id: "tip-custom",
          label: "Custom tip",
          parameters: [
            { name: "amount", label: "Tip amount (SOL)", type: "number", required: true, min: 0.01, patternDescription: "Enter a SOL amount greater than 0" },
            { name: "message", label: "Message", type: "textarea" },
          ],
        },
      ],
    },
    {
      id: "unlock-document",
      archetype: "unlock_document",
      title: "Unlock gated document",
      description: "Buy a file unlock and receive a secure download link after confirmation.",
      currency: "SOL",
      priceMinorUnits: toLamports(0.5),
      active: true,
      buttonLabel: "Unlock PDF",
      variants: [
        {
          id: "unlock-now",
          label: "Unlock PDF for 0.5 SOL",
          amountMinorUnits: toLamports(0.5),
          parameters: [{ name: "email", label: "Email for receipt", type: "email" }],
        },
      ],
    },
    {
      id: "mint-collectible",
      archetype: "mint_nft",
      title: "Mint creator collectible",
      description: "Mint a collectible that is delivered after payment confirmation.",
      currency: "SOL",
      priceMinorUnits: toLamports(0.1),
      active: true,
      buttonLabel: "Mint NFT",
      mintName: "NodeBlink Creator Edition",
      symbol: "NBLK",
      maxSupply: 5000,
      variants: [
        { id: "mint-1", label: "Mint 1 NFT", amountMinorUnits: toLamports(0.1), parameters: [{ name: "quantity", label: "Quantity", type: "number", required: true, min: 1, max: 5 }] },
        { id: "mint-3", label: "Mint 3 NFTs", amountMinorUnits: toLamports(0.3), parameters: [{ name: "quantity", label: "Quantity", type: "number", required: true, min: 1, max: 5 }] },
      ],
    },
    {
      id: "access-pass",
      archetype: "access_pass",
      title: "Community access pass",
      description: "Buy monthly or lifetime access and unlock the creator community.",
      currency: "SOL",
      priceMinorUnits: toLamports(0.25),
      active: true,
      buttonLabel: "Get access",
      accessTerm: "monthly",
      variants: [
        { id: "monthly", label: "Monthly Pass", amountMinorUnits: toLamports(0.25), parameters: [{ name: "discordHandle", label: "Discord handle", type: "text" }] },
        { id: "lifetime", label: "Lifetime Pass", amountMinorUnits: toLamports(1.5), parameters: [{ name: "discordHandle", label: "Discord handle", type: "text" }] },
      ],
    },
  ];
}

function fallbackCreator(username: string): CreatorProfileView {
  return {
    username,
    displayName: username.replace(/[-_]/g, " ") || "NodeBlink Creator",
    bio: "Sell digital products, collectibles, tips, and access passes through Solana Actions.",
    avatarUrl: "/action-icon.svg",
    coverUrl: "",
    publicKey: fallbackCreatorWallet,
    treasuryWallet: fallbackTreasuryWallet,
    platformFeeBps: 200,
    websiteUrl: "",
    discordWebhookUrl: "",
    accessWebhookUrl: "",
    products: fallbackProducts(),
  };
}

const ARCHETYPE_MAP: Record<ProductArchetype, CreatorArchetype> = {
  TIP: "tip",
  UNLOCK_DOCUMENT: "unlock_document",
  MINT_NFT: "mint_nft",
  ACCESS_PASS: "access_pass",
};

function normalizeProduct(product: {
  id: string;
  status: ProductStatus;
  archetype: ProductArchetype;
  title: string;
  description: string | null;
  currency: string;
  priceMinorUnits: bigint;
  buttonLabel: string | null;
  mintName: string | null;
  symbol: string | null;
  maxSupply: number | null;
  accessTerm: string | null;
  deliveryUrl: string | null;
  webhookUrl: string | null;
  variants: unknown;
}): CreatorActionProduct | null {
  if (product.status !== ProductStatus.ACTIVE) {
    return null;
  }

  const priceMinorUnits = Number(product.priceMinorUnits);
  const parsedVariants = Array.isArray(product.variants)
    ? (product.variants as CreatorActionVariant[])
    : [];

  return {
    id: product.id,
    archetype: ARCHETYPE_MAP[product.archetype],
    title: product.title,
    description: product.description ?? "",
    currency: product.currency === "USDC" ? "USDC" : "SOL",
    priceMinorUnits,
    active: true,
    buttonLabel: product.buttonLabel ?? undefined,
    mintName: product.mintName ?? undefined,
    symbol: product.symbol ?? undefined,
    maxSupply: product.maxSupply ?? undefined,
    accessTerm: product.accessTerm ?? undefined,
    deliveryUrl: product.deliveryUrl ?? undefined,
    webhookUrl: product.webhookUrl ?? undefined,
    variants: parsedVariants.length
      ? parsedVariants.map((variant) => ({
          id: String(variant.id),
          label: String(variant.label ?? "Open action"),
          amountMinorUnits:
            variant.amountMinorUnits === undefined
              ? undefined
              : Number(variant.amountMinorUnits),
          parameters: variant.parameters,
        }))
      : [
          {
            id: "default",
            label: product.buttonLabel ?? product.title,
            amountMinorUnits: priceMinorUnits,
          },
        ],
  };
}

async function fetchCreatorFromDatabase(username: string) {
  try {
    const record = await prisma.creatorProfile.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        digitalAssets: {
          where: { status: ProductStatus.ACTIVE },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!record) {
      return null;
    }

    const products = record.digitalAssets
      .map((asset) => normalizeProduct(asset))
      .filter(
        (asset): asset is CreatorActionProduct => asset !== null,
      );

    return {
      username: record.username,
      displayName: record.displayName,
      bio: record.bio ?? "",
      avatarUrl: record.avatarUrl ?? DEFAULT_ACTION_ICON,
      coverUrl: record.coverUrl ?? "",
      publicKey: record.publicKey,
      treasuryWallet: record.treasuryWallet ?? fallbackTreasuryWallet,
      platformFeeBps: clampFeeBps(record.platformFeeBps),
      websiteUrl: record.websiteUrl ?? "",
      discordWebhookUrl: record.discordWebhookUrl ?? "",
      accessWebhookUrl: record.accessWebhookUrl ?? "",
      products: products.length > 0 ? products : fallbackProducts(),
    } satisfies CreatorProfileView;
  } catch (err) {
    console.warn(
      "Prisma unavailable, using fallback creator profile:",
      String(err),
    );
    return null;
  }
}

export async function getCreatorProfile(username: string): Promise<CreatorProfileView> {
  const databaseRecord = await fetchCreatorFromDatabase(username);
  return databaseRecord ?? fallbackCreator(username);
}

export function buildActionMetadata(profile: CreatorProfileView, origin: string): ActionGetResponse {
  const actions = profile.products.flatMap((product) => buildVariants(product, profile.username, origin)) as any;

  return {
    type: "action",
    title: `${profile.displayName} on NodeBlink`,
    icon: resolveActionIcon(profile, origin),
    description: profile.bio || `Monetize ${profile.displayName} with tips, unlocks, mints, and access passes.`,
    label: "Open creator checkout",
    links: { actions },
  };
}

export function resolveCreatorSelection(profile: CreatorProfileView, requestUrl: URL, body: Partial<ActionPostRequest> & Record<string, unknown>) {
  const data = ((body as { data?: Record<string, unknown> }).data ?? (body as { params?: Record<string, unknown> }).params ?? {}) as Record<string, unknown>;
  const productId = String(data.productId ?? requestUrl.searchParams.get("productId") ?? requestUrl.searchParams.get("asset") ?? profile.products[0]?.id ?? "");
  const variantId = String(data.variant ?? requestUrl.searchParams.get("variant") ?? "default");

  const product = profile.products.find((entry) => entry.id === productId) ?? profile.products[0];
  if (!product) {
    throw new Error("No active creator products are available.");
  }

  const variant = product.variants.find((entry) => entry.id === variantId) ?? product.variants[0];
  if (!variant) {
    throw new Error("No valid action variant could be selected.");
  }

  let amountMinorUnits = variant.amountMinorUnits ?? product.priceMinorUnits;
  const rawAmount = String(data.amount ?? requestUrl.searchParams.get("amount") ?? "").trim();

  if (product.archetype === "tip" && rawAmount) {
    amountMinorUnits = parseMinorUnits(rawAmount, product.currency);
  }

  if (product.archetype === "mint_nft") {
    const quantity = Number(data.quantity ?? requestUrl.searchParams.get("quantity") ?? 1);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }
    amountMinorUnits = Math.max(1, amountMinorUnits * Math.min(Math.round(quantity), 10));
  }

  const message = String(data.message ?? requestUrl.searchParams.get("message") ?? "").trim() || undefined;
  const term = String(data.term ?? requestUrl.searchParams.get("term") ?? "").trim() || undefined;
  const quantity = Number(data.quantity ?? requestUrl.searchParams.get("quantity") ?? 1);

  return {
    product,
    variant,
    amountMinorUnits,
    message,
    quantity: Number.isFinite(quantity) ? quantity : undefined,
    term,
  } satisfies CreatorActionSelection;
}

export function buildActionError(message: string, status = 400): Response {
  const payload: ActionError = { message };
  return Response.json(payload, { status, headers: createActionHeaders() });
}

async function suggestPriorityMicroLamports(connection: Connection) {
  try {
    const fees = await connection.getRecentPrioritizationFees();
    const values = fees.map((entry) => Number(entry.prioritizationFee)).filter((value) => Number.isFinite(value) && value > 0).sort((left, right) => left - right);
    const median = values[Math.floor(values.length / 2)] ?? 1000;
    return Math.max(1000, Math.min(50_000, Math.round(median * 1.25)));
  } catch {
    return 1500;
  }
}

function memoInstruction(profile: CreatorProfileView, selection: CreatorActionSelection, buyerWallet: PublicKey) {
  const memo = JSON.stringify({
    creator: profile.username,
    productId: selection.product.id,
    variantId: selection.variant.id,
    archetype: selection.product.archetype,
    buyer: buyerWallet.toBase58(),
    amountMinorUnits: selection.amountMinorUnits,
    term: selection.term,
    quantity: selection.quantity,
  });

  return new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(memo, "utf8"),
  });
}

async function buildSolPaymentInstructions(profile: CreatorProfileView, buyerWallet: PublicKey, selection: CreatorActionSelection) {
  const creatorWallet = new PublicKey(safePublicKeyString(profile.publicKey, fallbackCreatorWallet));
  const treasuryWallet = new PublicKey(safePublicKeyString(profile.treasuryWallet, fallbackTreasuryWallet));
  const platformFeeBps = clampFeeBps(profile.platformFeeBps);
  const platformFeeMinorUnits = Math.max(1, Math.round((selection.amountMinorUnits * platformFeeBps) / 10_000));
  const creatorPayoutMinorUnits = Math.max(0, selection.amountMinorUnits - platformFeeMinorUnits);

  return {
    platformFeeMinorUnits,
    creatorPayoutMinorUnits,
    instructions: [
      ...(creatorPayoutMinorUnits > 0
        ? [SystemProgram.transfer({ fromPubkey: buyerWallet, toPubkey: creatorWallet, lamports: creatorPayoutMinorUnits })]
        : []),
      SystemProgram.transfer({ fromPubkey: buyerWallet, toPubkey: treasuryWallet, lamports: platformFeeMinorUnits }),
    ],
  };
}

async function buildUsdcPaymentInstructions(connection: Connection, profile: CreatorProfileView, buyerWallet: PublicKey, selection: CreatorActionSelection) {
  const mint = new PublicKey(DEFAULT_USDC_MINT);
  const creatorWallet = new PublicKey(safePublicKeyString(profile.publicKey, fallbackCreatorWallet));
  const treasuryWallet = new PublicKey(safePublicKeyString(profile.treasuryWallet, fallbackTreasuryWallet));
  const platformFeeBps = clampFeeBps(profile.platformFeeBps);
  const platformFeeMinorUnits = Math.max(1, Math.round((selection.amountMinorUnits * platformFeeBps) / 10_000));
  const creatorPayoutMinorUnits = Math.max(0, selection.amountMinorUnits - platformFeeMinorUnits);
  const buyerAta = await getAssociatedTokenAddress(mint, buyerWallet);
  const creatorAta = await getAssociatedTokenAddress(mint, creatorWallet);
  const treasuryAta = await getAssociatedTokenAddress(mint, treasuryWallet);
  const instructions = [] as TransactionInstruction[];

  const [buyerInfo, creatorInfo, treasuryInfo] = await Promise.all([
    connection.getAccountInfo(buyerAta),
    connection.getAccountInfo(creatorAta),
    connection.getAccountInfo(treasuryAta),
  ]);

  if (!buyerInfo) {
    throw new Error("Your wallet needs an active USDC token account to complete this purchase.");
  }
  if (!creatorInfo) {
    instructions.push(createAssociatedTokenAccountInstruction(buyerWallet, creatorAta, creatorWallet, mint));
  }
  if (!treasuryInfo) {
    instructions.push(createAssociatedTokenAccountInstruction(buyerWallet, treasuryAta, treasuryWallet, mint));
  }

  if (creatorPayoutMinorUnits > 0) {
    instructions.push(createTransferCheckedInstruction(buyerAta, mint, creatorAta, buyerWallet, creatorPayoutMinorUnits, DEFAULT_USDC_DECIMALS));
  }
  instructions.push(createTransferCheckedInstruction(buyerAta, mint, treasuryAta, buyerWallet, platformFeeMinorUnits, DEFAULT_USDC_DECIMALS));

  return {
    platformFeeMinorUnits,
    creatorPayoutMinorUnits,
    instructions,
  };
}

export async function buildActionPostResponse(profile: CreatorProfileView, selection: CreatorActionSelection, buyerWallet: PublicKey, requestUrl: URL) {
  const rpcUrl = process.env.SOLANA_RPC_URL ?? process.env.NODEBLINK_SOLANA_RPC_URL ?? clusterApiUrl("mainnet-beta");
  const connection = new Connection(rpcUrl, "confirmed");
  const latestBlockhash = await connection.getLatestBlockhash();
  const priorityMicroLamports = await suggestPriorityMicroLamports(connection);
  const transaction = new Transaction({
    feePayer: buyerWallet,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });

  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityMicroLamports }),
  );

  let platformFeeMinorUnits = 0;
  let creatorPayoutMinorUnits = selection.amountMinorUnits;

  if (selection.product.currency === "USDC") {
    const payment = await buildUsdcPaymentInstructions(connection, profile, buyerWallet, selection);
    platformFeeMinorUnits = payment.platformFeeMinorUnits;
    creatorPayoutMinorUnits = payment.creatorPayoutMinorUnits;
    transaction.add(...payment.instructions);
  } else {
    const payment = await buildSolPaymentInstructions(profile, buyerWallet, selection);
    platformFeeMinorUnits = payment.platformFeeMinorUnits;
    creatorPayoutMinorUnits = payment.creatorPayoutMinorUnits;
    transaction.add(...payment.instructions);
  }

  transaction.add(memoInstruction(profile, selection, buyerWallet));

  const message =
    selection.product.archetype === "tip"
      ? `Tip ${profile.displayName}`
      : selection.product.archetype === "unlock_document"
        ? `Unlock ${selection.product.title}`
        : selection.product.archetype === "mint_nft"
          ? `Mint ${selection.product.title}`
          : `Buy ${selection.product.title}`;

  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      type: "transaction",
      transaction,
      message,
    },
  });

  const completed: CompletedAction = {
    type: "completed",
    title: `${profile.displayName} purchase complete`,
    icon: resolveActionIcon(profile, requestUrl.origin),
    label: "Complete",
    description: `${message}. Transaction confirmed or ready for wallet signing.`,
  };

  return {
    ...payload,
    links: {
      next: {
        type: "inline" as const,
        action: completed,
      },
    },
  } as ActionPostResponse & {
    links: {
      next: {
        type: "inline";
        action: CompletedAction;
      };
    };
  };
}

export function formatAmount(product: CreatorActionProduct, amountMinorUnits: number) {
  return formatMinorUnits(amountMinorUnits, product.currency);
}

export function getDefaultTreasuryWallet() {
  return fallbackTreasuryWallet;
}

export function getDefaultCreatorWallet() {
  return fallbackCreatorWallet;
}

export async function mintNftAsset(assetId: string, buyerPubkey: PublicKey) {
  const rpcUrl = process.env.SOLANA_RPC_URL ?? clusterApiUrl('mainnet-beta')
  const connection = new Connection(rpcUrl, 'confirmed')

  const asset = await prisma.digitalAsset.findUnique({
    where: { id: assetId },
    include: { creatorProfile: true },
  });
  if (!asset) throw new Error("Asset not found");
  const creator = asset.creatorProfile;
  if (!creator) throw new Error("Creator not found for asset");

  const mintSigner = process.env.NODEBLINK_MINT_KEYPAIR || process.env.MINT_SIGNER_KEYPAIR
  if (!mintSigner) throw new Error('MINT_SIGNER_KEYPAIR not configured')

  let payer: Keypair
  try {
    const arr = JSON.parse(mintSigner)
    if (Array.isArray(arr)) {
      payer = Keypair.fromSecretKey(Uint8Array.from(arr))
    } else {
      // try base64
      payer = Keypair.fromSecretKey(Buffer.from(mintSigner, 'base64'))
    }
  } catch (e) {
    try {
      payer = Keypair.fromSecretKey(Buffer.from(mintSigner, 'base64'))
    } catch (e2) {
      throw new Error('Failed to parse MINT_SIGNER_KEYPAIR')
    }
  }

  // create mint (decimals 0 for NFT)
  const decimals = 0
  const mint = await createMint(connection, payer, payer.publicKey, null, decimals)

  // create or get ATA for buyer
  const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, buyerPubkey)

  // mint 1
  await mintTo(connection, payer, mint, ata.address, payer, 1)

  // update DB record with mint info
  await prisma.digitalAsset.update({
    where: { id: assetId },
    data: { currentSupply: asset.currentSupply + 1 },
  });

  return { mint: mint.toBase58(), ata: ata.address.toBase58() }
}
