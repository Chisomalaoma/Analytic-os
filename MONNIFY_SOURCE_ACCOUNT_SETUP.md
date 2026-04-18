# Monnify Source Account Setup Required

## Issue
The withdrawal is failing because `MONNIFY_SOURCE_ACCOUNT` environment variable is missing.

## What is MONNIFY_SOURCE_ACCOUNT?
This is **YOUR Monnify wallet account number** that will be used as the source for disbursements (withdrawals). When users withdraw money, it comes from this account.

## How to Get Your Monnify Source Account Number

### Option 1: From Monnify Dashboard
1. Log in to your Monnify dashboard: https://app.monnify.com
2. Go to **Wallet** or **Account** section
3. Look for your **Wallet Account Number** or **Disbursement Account Number**
4. Copy this 10-digit account number

### Option 2: Contact Monnify Support
If you can't find it in the dashboard:
1. Email: support@monnify.com
2. Ask for your "Disbursement Source Account Number" or "Wallet Account Number"
3. They will provide it to you

### Option 3: Check Monnify Documentation
- Your account number should be in your Monnify onboarding documents
- Look for "Wallet Account" or "Disbursement Account"

## How to Add It

### 1. Local Environment
Add to your `.env` file:
```
MONNIFY_SOURCE_ACCOUNT=1234567890
```
(Replace with your actual Monnify wallet account number)

### 2. Vercel Environment Variables
1. Go to https://vercel.com/xt-es-limited/analytic-os/settings/environment-variables
2. Add:
   - **Key:** `MONNIFY_SOURCE_ACCOUNT`
   - **Value:** Your Monnify wallet account number (10 digits)
   - **Environment:** Production, Preview, Development
3. Save and redeploy

## Important Notes

- This is **NOT** the same as user wallet account numbers
- This is **YOUR business Monnify wallet** that holds funds
- All withdrawals will deduct from this account
- Make sure this account has sufficient balance for withdrawals
- This is different from `MONNIFY_CONTRACT_CODE`

## Current Status
- ✅ Monnify API credentials configured
- ✅ SafeHaven code removed
- ❌ Source account number missing (causing withdrawal errors)

## Alternative (If You Don't Have It Yet)
If you're still setting up Monnify and don't have a wallet account yet:
1. Contact Monnify to complete your business account setup
2. Request a disbursement/wallet account
3. They will provide you with the account number
4. Then add it to your environment variables
