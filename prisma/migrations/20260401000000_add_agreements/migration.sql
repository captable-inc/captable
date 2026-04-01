-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('CONTRACTOR', 'INVESTOR');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('PENDING_REVIEW', 'REVIEWED', 'COMMITTED', 'FLAGGED', 'REJECTED');

-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "type" "AgreementType" NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "partyName" TEXT,
    "partyEmail" TEXT,
    "role" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "quantity" INTEGER,
    "unitsPerPeriod" INTEGER,
    "vestingPeriods" INTEGER,
    "shareClassName" TEXT,
    "pricePerShare" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION,
    "vestingCliffDays" INTEGER DEFAULT 90,
    "vestingPeriodMonths" INTEGER DEFAULT 24,
    "rawText" TEXT,
    "aiResponse" TEXT,
    "matchConfidence" DOUBLE PRECISION,
    "discrepancies" TEXT,
    "stakeholderId" TEXT,
    "bucketId" TEXT NOT NULL,
    "shareId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agreement_bucketId_key" ON "Agreement"("bucketId");

-- CreateIndex
CREATE INDEX "Agreement_companyId_idx" ON "Agreement"("companyId");

-- CreateIndex
CREATE INDEX "Agreement_stakeholderId_idx" ON "Agreement"("stakeholderId");

-- CreateIndex
CREATE INDEX "Agreement_status_idx" ON "Agreement"("status");
