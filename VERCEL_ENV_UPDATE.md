# Vercel Environment Variable Update Required

## Action Needed
Add the following environment variable to your Vercel project:

**Variable Name:** `PAYMENT_PROVIDER`  
**Value:** `monnify`

## How to Add:
1. Go to https://vercel.com/xt-es-limited/analytic-os/settings/environment-variables
2. Click "Add New"
3. Enter:
   - Key: `PAYMENT_PROVIDER`
   - Value: `monnify`
   - Environment: Production, Preview, Development (select all)
4. Click "Save"
5. Redeploy the application

## Why This is Needed:
The system was defaulting to SafeHaven payment provider, which requires a `sourceAccountNumber` parameter. By explicitly setting `PAYMENT_PROVIDER=monnify`, the system will use Monnify for withdrawals, which doesn't require this parameter.

## Current Status:
- ✅ Added to local `.env` file
- ⏳ Needs to be added to Vercel environment variables
