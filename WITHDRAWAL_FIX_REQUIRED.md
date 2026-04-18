# WITHDRAWAL FIX - ACTION REQUIRED

## Current Issue
Withdrawals are failing with error: **"sourceAccountNumber must be 10 digits"**

## Root Cause
The `MONNIFY_SOURCE_ACCOUNT` environment variable is **empty** in your `.env` file.

This is your **Monnify business wallet account number** (10 digits) that Monnify will debit when users withdraw funds.

## What You Need to Do

### Step 1: Get Your Monnify Wallet Account Number
1. Log in to your Monnify dashboard at: https://app.monnify.com
2. Navigate to **Wallet** or **Account Details** section
3. Find your **10-digit account number** (this is your Monnify wallet account)
4. Copy this number

### Step 2: Update Environment Variables

#### Local Environment (.env file)
Add this line to your `.env` file:
```
MONNIFY_SOURCE_ACCOUNT=1234567890
```
Replace `1234567890` with your actual 10-digit Monnify account number.

#### Production Environment (Vercel)
1. Go to: https://vercel.com/xt-es-limited/analytic-os/settings/environment-variables
2. Add new environment variable:
   - **Name**: `MONNIFY_SOURCE_ACCOUNT`
   - **Value**: Your 10-digit Monnify account number
   - **Environment**: Production, Preview, Development (select all)
3. Click **Save**
4. Redeploy your application

### Step 3: Test Withdrawal
After updating the environment variables:
1. Try withdrawing a small amount (e.g., ₦100)
2. The withdrawal should now work successfully

## Technical Details

### What is sourceAccountNumber?
- This is **required by Monnify's disbursement API**
- It's the account number Monnify will debit when processing withdrawals
- Must be exactly 10 digits
- This is different from user wallet account numbers

### Code Location
The sourceAccountNumber is used in:
- `src/lib/monnify-disbursement.ts` (line 95)
- `src/lib/monnify.ts` (MONNIFY_CONFIG)

### Current .env Status
```
MONNIFY_SOURCE_ACCOUNT=    <-- EMPTY (needs to be filled)
```

## Important Notes
1. **SafeHaven code has been completely removed** - only Monnify is used now
2. The withdrawal code is correct - it just needs the source account number
3. Once you add this variable, withdrawals will work immediately
4. Make sure to add it to both local `.env` and Vercel environment variables

## Need Help?
If you can't find your Monnify account number:
1. Contact Monnify support
2. Check your Monnify onboarding email
3. Look in your Monnify dashboard under "Wallet" or "Account Settings"
