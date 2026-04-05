-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('pending', 'in_progress', 'verified', 'rejected', 'expired');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "kycStatus" "KYCStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "kycProvider" TEXT DEFAULT 'smileid',
ADD COLUMN "smileJobId" TEXT,
ADD COLUMN "idType" TEXT,
ADD COLUMN "idNumber" TEXT,
ADD COLUMN "kycVerifiedAt" TIMESTAMP(3),
ADD COLUMN "addressVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "livenessCheckPassed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "kycRejectionReason" TEXT,
ADD COLUMN "kycDocumentUrl" TEXT,
ADD COLUMN "kycSelfieUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_smileJobId_key" ON "User"("smileJobId");
