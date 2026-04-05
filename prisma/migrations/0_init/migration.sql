-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'INVESTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('pending', 'in_progress', 'verified', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "CreditDebit" AS ENUM ('credit', 'debit');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('alert', 'transaction');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "username" TEXT,
    "userId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "companyName" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "walletAddress" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "bvn" TEXT,
    "nin" TEXT,
    "kycStatus" "KYCStatus" NOT NULL DEFAULT 'pending',
    "kycProvider" TEXT DEFAULT 'smileid',
    "smileJobId" TEXT,
    "idType" TEXT,
    "idNumber" TEXT,
    "kycVerifiedAt" TIMESTAMP(3),
    "addressVerified" BOOLEAN NOT NULL DEFAULT false,
    "livenessCheckPassed" BOOLEAN NOT NULL DEFAULT false,
    "kycRejectionReason" TEXT,
    "kycDocumentUrl" TEXT,
    "kycSelfieUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountRef" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "CreditDebit" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "monnifyRef" TEXT,
    "status" "TxStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenHolding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL DEFAULT 'INV',
    "quantity" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "averagePrice" DECIMAL(10,2) NOT NULL DEFAULT 1500,
    "totalInvested" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "accumulatedYield" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lastYieldUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL DEFAULT 'INV',
    "nairaAmountSpent" INTEGER NOT NULL,
    "tokensReceived" DECIMAL(18,6) NOT NULL,
    "pricePerToken" INTEGER NOT NULL,
    "totalAmountKobo" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "priceChange24h" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "annualYield" DECIMAL(5,2) NOT NULL,
    "industry" TEXT NOT NULL,
    "payoutFrequency" TEXT NOT NULL,
    "investmentType" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "listingDate" TIMESTAMP(3) NOT NULL,
    "closeDate" TIMESTAMP(3),
    "logoUrl" TEXT,
    "minimumInvestment" INTEGER NOT NULL,
    "employeeCount" INTEGER NOT NULL,
    "description" TEXT,
    "contractAddress" TEXT,
    "volume" INTEGER NOT NULL DEFAULT 0,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationPreferences" JSONB NOT NULL DEFAULT '{"email":{"transactions":true,"walletFunding":true,"withdrawals":true,"tokenPurchases":true,"tokenSales":true,"priceAlerts":true,"securityAlerts":true},"webApp":{"transactions":true,"walletFunding":true,"withdrawals":true,"tokenPurchases":true,"tokenSales":true,"priceAlerts":true,"securityAlerts":true}}',
    "currencyPreference" TEXT NOT NULL DEFAULT 'NGN',
    "priceAlertSettings" JSONB NOT NULL DEFAULT '{"enabled":true,"thresholdPercentage":5.0,"watchedTokens":[]}',
    "autoLockEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "thresholdPercentage" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_smileJobId_key" ON "User"("smileJobId");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_userId_idx" ON "User"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_token_idx" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_accountNumber_key" ON "Wallet"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_accountRef_key" ON "Wallet"("accountRef");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Wallet_accountNumber_idx" ON "Wallet"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE INDEX "Transaction_walletId_idx" ON "Transaction"("walletId");

-- CreateIndex
CREATE INDEX "Transaction_reference_idx" ON "Transaction"("reference");

-- CreateIndex
CREATE INDEX "BankAccount_userId_idx" ON "BankAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_userId_accountNumber_key" ON "BankAccount"("userId", "accountNumber");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "RecentSearch_userId_createdAt_idx" ON "RecentSearch"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TokenHolding_userId_idx" ON "TokenHolding"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenHolding_userId_tokenId_key" ON "TokenHolding"("userId", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenPurchase_reference_key" ON "TokenPurchase"("reference");

-- CreateIndex
CREATE INDEX "TokenPurchase_userId_createdAt_idx" ON "TokenPurchase"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Token_tokenId_key" ON "Token"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_symbol_key" ON "Token"("symbol");

-- CreateIndex
CREATE INDEX "Token_symbol_idx" ON "Token"("symbol");

-- CreateIndex
CREATE INDEX "Token_industry_idx" ON "Token"("industry");

-- CreateIndex
CREATE INDEX "Token_isActive_idx" ON "Token"("isActive");

-- CreateIndex
CREATE INDEX "Token_tokenId_idx" ON "Token"("tokenId");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE INDEX "Wishlist_tokenId_idx" ON "Wishlist"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_tokenId_key" ON "Wishlist"("userId", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "PriceAlert_userId_idx" ON "PriceAlert"("userId");

-- CreateIndex
CREATE INDEX "PriceAlert_tokenSymbol_idx" ON "PriceAlert"("tokenSymbol");

-- CreateIndex
CREATE INDEX "PriceAlert_isActive_tokenSymbol_idx" ON "PriceAlert"("isActive", "tokenSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "PriceAlert_userId_tokenSymbol_key" ON "PriceAlert"("userId", "tokenSymbol");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentSearch" ADD CONSTRAINT "RecentSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenHolding" ADD CONSTRAINT "TokenHolding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenPurchase" ADD CONSTRAINT "TokenPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

