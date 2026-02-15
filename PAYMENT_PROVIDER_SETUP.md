# Payment Provider Setup Guide

## Overview
Your app now supports both **Monnify** and **SafeHaven MFB** as payment providers. You can switch between them using an environment variable.

## Quick Start

### 1. Choose Your Payment Provider

Add this to your Vercel environment variables:

```env
PAYMENT_PROVIDER=safehaven
```

Options:
- `monnify` - Use Monnify (default if not set)
- `safehaven` - Use SafeHaven MFB

### 2. Add Provider Credentials

#### For SafeHaven:
```env
SAFEHAVEN_CLIENT_ID=your_client_id
SAFEHAVEN_CLIENT_SECRET=your_client_secret
SAFEHAVEN_ACCOUNT_ID=your_main_account_id
SAFEHAVEN_BASE_URL=https://api.safehavenmfb.com
SAFEHAVEN_WEBHOOK_SECRET=your_webhook_secret
```

#### For Monnify (keep existing):
```env
MONNIFY_API_KEY=MK_PROD_XXXXXXXXXX
MONNIFY_SECRET_KEY=XXXXXXXXXXXXXXXX
MONNIFY_CONTRACT_CODE=XXXXXXXXXXXX
MONNIFY_BASE_URL=https://api.monnify.com
MONNIFY_SOURCE_ACCOUNT=XXXXXXXXXX
```

### 3. Configure Webhook URL

#### SafeHaven Webhook:
- URL: `https://yourdomain.com/api/webhooks/safehaven`
- Events: Account Credited, Transfer Successful, Transfer Failed

#### Monnify Webhook (existing):
- URL: `https://yourdomain.com/api/webhooks/monnify`
- Events: Successful Transaction, Successful Disbursement, Failed Disbursement

## How It Works

### Automatic Provider Selection

The system automatically uses the correct provider based on `PAYMENT_PROVIDER` env variable:

```typescript
// In your code, it automatically switches:
const account = await createVirtualAccount({...}) 
// ✅ Uses SafeHaven if PAYMENT_PROVIDER=safehaven
// ✅ Uses Monnify if PAYMENT_PROVIDER=monnify
```

### Supported Operations

All operations work with both providers:

1. **Create Virtual Account** - Creates sub-account (SafeHaven) or reserved account (Monnify)
2. **Receive Payments** - Webhooks handle deposits automatically
3. **Verify Bank Account** - Name enquiry before withdrawal
4. **Withdraw Funds** - Transfer (SafeHaven) or disbursement (Monnify)
5. **Transaction History** - Fetch past transactions

## Testing

### Test with SafeHaven Sandbox

1. Set environment:
```env
PAYMENT_PROVIDER=safehaven
SAFEHAVEN_BASE_URL=https://api.sandbox.safehavenmfb.com
```

2. Create test account at: https://online.sandbox.safehavenmfb.com

3. Test flows:
   - Create user → Virtual account created
   - Fund wallet → Webhook receives credit
   - Withdraw → Transfer initiated

### Test with Monnify

Keep your existing Monnify setup for comparison.

## Migration Strategy

### Option 1: Instant Switch (Recommended for New Apps)
```env
PAYMENT_PROVIDER=safehaven
```
All new operations use SafeHaven immediately.

### Option 2: Gradual Migration
1. Keep `PAYMENT_PROVIDER=monnify` for existing users
2. Create new test users with SafeHaven
3. Monitor for 1 week
4. Switch to `PAYMENT_PROVIDER=safehaven`

### Option 3: Parallel Running
- Keep both providers configured
- Use feature flags to test SafeHaven with specific users
- Gradually migrate all users

## Vercel Deployment

### Add Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add these variables:

```
PAYMENT_PROVIDER = safehaven
SAFEHAVEN_CLIENT_ID = [your_value]
SAFEHAVEN_CLIENT_SECRET = [your_value]
SAFEHAVEN_ACCOUNT_ID = [your_value]
SAFEHAVEN_BASE_URL = https://api.safehavenmfb.com
SAFEHAVEN_WEBHOOK_SECRET = [your_value]
```

5. Select: ✅ Production ✅ Preview ✅ Development
6. Click "Save"
7. Redeploy your app

### Verify Deployment

After deployment, check logs:
```
[PAYMENT-PROVIDER] Using safehaven to create account
[WALLET-SERVICE] Using payment provider: safehaven
[WITHDRAWAL] Using payment provider: safehaven
```

## Code Changes Summary

### New Files Created:
1. `src/lib/safehaven.ts` - SafeHaven API integration
2. `src/lib/payment-provider.ts` - Unified provider interface
3. `src/app/api/webhooks/safehaven/route.ts` - SafeHaven webhook handler

### Updated Files:
1. `src/lib/wallet-service.ts` - Uses payment provider
2. `src/app/api/wallet/withdraw/route.ts` - Uses payment provider
3. `src/app/api/bank-accounts/verify/route.ts` - Uses payment provider

### No Breaking Changes:
- Existing Monnify integration still works
- Database schema unchanged
- API endpoints unchanged
- Frontend code unchanged

## Troubleshooting

### Issue: "SafeHaven authentication failed"
**Solution:** Check your CLIENT_ID and CLIENT_SECRET in Vercel

### Issue: "Wallet creation failed"
**Solution:** Verify SAFEHAVEN_ACCOUNT_ID is your main account

### Issue: "Webhook not receiving events"
**Solution:** 
1. Check webhook URL in SafeHaven dashboard
2. Verify SAFEHAVEN_WEBHOOK_SECRET matches
3. Test webhook: `curl https://yourdomain.com/api/webhooks/safehaven`

### Issue: "Transfer failed"
**Solution:** Ensure source account (wallet.accountNumber) has sufficient balance

## Monitoring

### Check Provider in Use:
Look for these logs in Vercel:
```
[PAYMENT-PROVIDER] Using safehaven to create account
[PAYMENT-PROVIDER] Using safehaven to get balance
[PAYMENT-PROVIDER] Using safehaven to initiate withdrawal
```

### Webhook Health:
- SafeHaven: `GET https://yourdomain.com/api/webhooks/safehaven`
- Monnify: `GET https://yourdomain.com/api/webhooks/monnify`

Both should return: `{ status: 'ok', message: '...' }`

## Support

### SafeHaven Support:
- Dashboard: https://online.safehavenmfb.com
- API Docs: https://safehavenmfb.readme.io
- Contact: Through dashboard support

### Monnify Support:
- Dashboard: https://app.monnify.com
- API Docs: https://docs.monnify.com

## Next Steps

1. ✅ Get SafeHaven credentials from dashboard
2. ✅ Add environment variables to Vercel
3. ✅ Configure webhook URL in SafeHaven
4. ✅ Test in sandbox environment
5. ✅ Deploy to production
6. ✅ Monitor logs for 24-48 hours
7. ✅ Gradually migrate users (optional)

---

**Ready to switch?** Just set `PAYMENT_PROVIDER=safehaven` in Vercel and redeploy! 🚀
