# Vercel Environment Variables Setup

## Problem
Withdrawal is failing with "Unauthorized request" because Monnify API credentials are not configured in Vercel.

## Solution
Add the following environment variables to your Vercel project:

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/xt-es-limited/analytic-os/settings/environment-variables
2. Or navigate to: Project Settings → Environment Variables

### Step 2: Add These Variables

**Required for Monnify (Payments & Withdrawals):**
```
MONNIFY_API_KEY=MK_PROD_701JWAST66
MONNIFY_SECRET_KEY=7E5W5LYEQ1PA9BE45CHCX0664GWCPCDP
MONNIFY_CONTRACT_CODE=226967557679
MONNIFY_BASE_URL=https://api.monnify.com
MONNIFY_SOURCE_ACCOUNT=8065933976
PAYMENT_PROVIDER=monnify
```

**Required for Email (Forgot Password, OTP):**
```
RESEND_API_KEY=re_YdXeeiLs_3Xeba2n37yNAUToL9ra3EHCW
```

**Required for KYC:**
```
SMILEID_PARTNER_ID=8465
SMILEID_API_KEY=ff0b9f6a-e814-4b2c-9bc2-af093b5fd268
SMILEID_CALLBACK_URL=https://xtes.app/api/webhooks/smileid
SMILEID_SANDBOX=false
```

**Database (should already be set):**
```
DATABASE_URL=postgresql://neondb_owner:npg_a4rtAsu5HoLn@ep-wild-union-anwlhi10-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Step 3: Environment Selection
For each variable, select:
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 4: Redeploy
After adding all variables:
1. Go to Deployments tab
2. Click on the latest deployment
3. Click "Redeploy" button
4. Or wait for automatic deployment from next push

## Why This Happened
- Local `.env` file has the credentials
- Vercel deployments don't have access to your local `.env` file
- Each environment variable must be manually added to Vercel

## Verification
After redeployment, test:
1. ✅ Wallet funding (Monnify account creation)
2. ✅ Withdrawals (Monnify disbursement)
3. ✅ Forgot password (Resend email)
4. ✅ KYC verification (SmileID)

## Quick Access Link
https://vercel.com/xt-es-limited/analytic-os/settings/environment-variables
