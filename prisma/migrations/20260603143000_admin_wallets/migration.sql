-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'ADMIN');

-- CreateTable
CREATE TABLE "AdminWallet" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminWallet_walletAddress_key" ON "AdminWallet"("walletAddress");

-- AddPrimaryKey
ALTER TABLE "AdminWallet" ADD CONSTRAINT "AdminWallet_pkey" PRIMARY KEY ("id");
