import {
  AssetCurrency,
  PrismaClient,
  ProductArchetype,
  ProductStatus,
} from "@prisma/client";

const prisma = new PrismaClient();
const LAMPORTS = 1_000_000_000;

function sol(n: number) {
  return BigInt(Math.round(n * LAMPORTS));
}

function solNum(n: number) {
  return Number(sol(n));
}

async function main() {
  await prisma.user.deleteMany({ where: { username: "demo" } });

  const wallet =
    process.env.DEFAULT_CREATOR_WALLET ||
    "11111111111111111111111111111111";
  const treasury = process.env.TREASURY_WALLET;
  if (!treasury) {
    throw new Error("Set TREASURY_WALLET in the environment before seeding.");
  }

  const user = await prisma.user.upsert({
    where: { username: "demo" },
    update: { walletAddress: wallet },
    create: {
      username: "demo",
      walletAddress: wallet,
      email: "demo@nodeblink.com",
      creatorProfile: {
        create: {
          username: "demo",
          displayName: "NodeBlink Studio",
          bio: "Enterprise-grade creator checkout with native Solana Actions, mobile deep links, and instant fulfillment.",
          avatarUrl: "/action-icon.svg",
          coverUrl: "/assets/blink-preview.svg",
          publicKey: wallet,
          treasuryWallet: treasury,
          platformFeeBps: 200,
          websiteUrl: "https://nodeblink.dev",
          digitalAssets: {
            create: [
              {
                archetype: ProductArchetype.TIP,
                status: ProductStatus.ACTIVE,
                sortOrder: 0,
                title: "Tip the creator",
                description: "Send SOL with an optional message of support.",
                currency: AssetCurrency.SOL,
                priceMinorUnits: sol(0.1),
                buttonLabel: "Send tip",
                variants: [
                  { id: "tip-0-1", label: "Tip 0.1 SOL", amountMinorUnits: solNum(0.1) },
                  { id: "tip-0-5", label: "Tip 0.5 SOL", amountMinorUnits: solNum(0.5) },
                  {
                    id: "tip-custom",
                    label: "Custom tip",
                    parameters: [
                      { name: "amount", label: "Amount (SOL)", type: "number", required: true },
                      { name: "message", label: "Message", type: "textarea" },
                    ],
                  },
                ],
              },
              {
                archetype: ProductArchetype.UNLOCK_DOCUMENT,
                status: ProductStatus.ACTIVE,
                sortOrder: 1,
                title: "Creator playbook PDF",
                description: "Unlock the full playbook after payment. Keys are released on-chain confirmation.",
                currency: AssetCurrency.SOL,
                priceMinorUnits: sol(0.25),
                buttonLabel: "Unlock PDF",
                storageUrl: "/uploads/demo-playbook.pdf",
                variants: [
                  {
                    id: "unlock-now",
                    label: "Unlock PDF for 0.25 SOL",
                    amountMinorUnits: solNum(0.25),
                  },
                ],
              },
              {
                archetype: ProductArchetype.MINT_NFT,
                status: ProductStatus.ACTIVE,
                sortOrder: 2,
                title: "Creator Pass NFT",
                description: "Mint a limited creator pass collectible after checkout confirms.",
                currency: AssetCurrency.SOL,
                priceMinorUnits: sol(0.1),
                mintName: "NodeBlink Creator Pass",
                symbol: "NBLK",
                maxSupply: 5000,
                buttonLabel: "Mint pass",
                metadataUrl: "https://nodeblink.com/metadata/demo-pass.json",
                variants: [
                  { id: "mint-1", label: "Mint 1 pass", amountMinorUnits: solNum(0.1) },
                  { id: "mint-3", label: "Mint 3 passes", amountMinorUnits: solNum(0.3) },
                ],
              },
              {
                archetype: ProductArchetype.ACCESS_PASS,
                status: ProductStatus.ACTIVE,
                sortOrder: 3,
                title: "Community access",
                description: "Monthly or lifetime community access with Discord provisioning.",
                currency: AssetCurrency.SOL,
                priceMinorUnits: sol(0.25),
                accessTerm: "monthly",
                buttonLabel: "Get access",
                variants: [
                  { id: "monthly", label: "Monthly pass", amountMinorUnits: solNum(0.25) },
                  { id: "lifetime", label: "Lifetime pass", amountMinorUnits: solNum(1.5) },
                ],
              },
            ],
          },
        },
      },
    },
    include: { creatorProfile: true },
  });

  console.log(`Seeded @${user.username} with full product catalog.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
