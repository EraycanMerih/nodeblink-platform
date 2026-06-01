-- CreateEnum
CREATE TYPE "ProductArchetype" AS ENUM ('TIP', 'UNLOCK_DOCUMENT', 'MINT_NFT', 'ACCESS_PASS');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssetCurrency" AS ENUM ('SOL', 'USDC');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "publicKey" TEXT NOT NULL,
    "treasuryWallet" TEXT,
    "platformFeeBps" INTEGER NOT NULL DEFAULT 200,
    "websiteUrl" TEXT,
    "discordWebhookUrl" TEXT,
    "accessWebhookUrl" TEXT,
    "totalVolumeProcessed" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalAsset" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "archetype" "ProductArchetype" NOT NULL DEFAULT 'TIP',
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "currency" "AssetCurrency" NOT NULL DEFAULT 'SOL',
    "priceMinorUnits" BIGINT NOT NULL,
    "buttonLabel" TEXT,
    "mintName" TEXT,
    "symbol" TEXT,
    "maxSupply" INTEGER,
    "currentSupply" INTEGER NOT NULL DEFAULT 0,
    "accessTerm" TEXT,
    "storageUrl" TEXT,
    "encryptedKey" TEXT,
    "metadataUrl" TEXT,
    "deliveryUrl" TEXT,
    "webhookUrl" TEXT,
    "variants" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "signature" TEXT,
    "creatorProfileId" TEXT,
    "productId" TEXT,
    "senderWallet" TEXT NOT NULL,
    "recipientWallet" TEXT NOT NULL,
    "grossAmount" DECIMAL(65,30) NOT NULL,
    "feeAmount" DECIMAL(65,30) NOT NULL,
    "currency" "AssetCurrency" NOT NULL DEFAULT 'SOL',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_username_key" ON "CreatorProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_signature_key" ON "Transaction"("signature");

-- AddForeignKey
ALTER TABLE "CreatorProfile" ADD CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalAsset" ADD CONSTRAINT "DigitalAsset_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

