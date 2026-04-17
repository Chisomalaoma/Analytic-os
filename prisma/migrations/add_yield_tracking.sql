-- Add yield tracking fields to TokenHolding
ALTER TABLE "TokenHolding" 
ADD COLUMN IF NOT EXISTS "lockedYield" DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "maturityDate" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "lastYieldAccrual" TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS "monthlyYieldAmount" DECIMAL(18,2) DEFAULT 0;

-- Add comment
COMMENT ON COLUMN "TokenHolding"."lockedYield" IS 'Accumulated yield that is locked until maturity';
COMMENT ON COLUMN "TokenHolding"."maturityDate" IS 'Date when yield becomes withdrawable';
COMMENT ON COLUMN "TokenHolding"."monthlyYieldAmount" IS 'Fixed monthly yield amount in Naira';
