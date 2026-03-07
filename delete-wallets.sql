-- SQL Script to delete all wallets
-- Run this directly in your database (Supabase, Neon, etc.)

-- Step 1: Delete all transactions (foreign key constraint)
DELETE FROM "Transaction";

-- Step 2: Delete all wallets
DELETE FROM "Wallet";

-- Step 3: Clear wallet addresses from users
UPDATE "User" SET "walletAddress" = NULL;

-- Check results
SELECT 'Wallets deleted' as status, COUNT(*) as remaining_wallets FROM "Wallet";
SELECT 'Users updated' as status, COUNT(*) as users_with_null_wallet FROM "User" WHERE "walletAddress" IS NULL;
