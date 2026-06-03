-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CreatorVerificationRequest" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "followerCount" INTEGER,
    "proofType" TEXT NOT NULL,
    "proofUrl" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "requestedFeeBps" INTEGER NOT NULL DEFAULT 150,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "CreatorVerificationRequest_creatorProfileId_idx" ON "CreatorVerificationRequest"("creatorProfileId");

-- CreateIndex
CREATE INDEX "CreatorVerificationRequest_status_idx" ON "CreatorVerificationRequest"("status");

-- AddForeignKey
ALTER TABLE "CreatorVerificationRequest" ADD CONSTRAINT "CreatorVerificationRequest_creatorProfileId_fkey"
FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddPrimaryKey
ALTER TABLE "CreatorVerificationRequest" ADD CONSTRAINT "CreatorVerificationRequest_pkey" PRIMARY KEY ("id");
